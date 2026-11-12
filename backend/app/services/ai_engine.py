import json
import logging
from functools import lru_cache
from typing import Any, List, Literal, Optional

from openai import AsyncOpenAI, OpenAIError
from pydantic import BaseModel, Field, ValidationError, field_validator

from app.core.errors import AIEngineError, ConfigurationError
from app.core.security import settings

logger = logging.getLogger(__name__)

Language = Literal["en", "tr"]

_LANGUAGE_NAMES: dict[str, str] = {"en": "English", "tr": "Turkish"}


def _coerce_text(value: Any) -> str:
    """Flattens nested LLM output (dicts/lists) into a readable paragraph."""
    if isinstance(value, str):
        return value
    if isinstance(value, dict):
        return " ".join(_coerce_text(v) for v in value.values())
    if isinstance(value, list):
        return " ".join(_coerce_text(v) for v in value)
    return "" if value is None else str(value)


class DreamAnalysis(BaseModel):
    """Structured output of the Cayce multi-layer analysis."""

    physical: str = ""
    mental: str = ""
    spiritual: str = ""
    synthesis: str = ""
    symbols: List[str] = Field(default_factory=list)

    @field_validator("physical", "mental", "spiritual", "synthesis", mode="before")
    @classmethod
    def _flatten_layers(cls, value: Any) -> str:
        return _coerce_text(value)

    @field_validator("symbols", mode="before")
    @classmethod
    def _normalize_symbols(cls, value: Any) -> List[str]:
        if not isinstance(value, list):
            return []
        names: List[str] = []
        for item in value:
            name = item.get("name") if isinstance(item, dict) else item
            if isinstance(name, str) and name.strip():
                names.append(name.strip().lower())
        # Preserve order while dropping duplicates.
        return list(dict.fromkeys(names))


@lru_cache(maxsize=1)
def get_openai_client() -> AsyncOpenAI:
    """Returns a shared async OpenAI client.

    Raises:
        ConfigurationError: If `OPENAI_API_KEY` is not configured.
    """
    if not settings.OPENAI_API_KEY:
        raise ConfigurationError("OPENAI_API_KEY must be set.")
    return AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


class AIEngine:
    @staticmethod
    async def analyze_dream(
        content: str, lang: Language, intention: Optional[str] = None
    ) -> DreamAnalysis:
        """Implements Edgar Cayce's Multi-Layer Analysis engine.

        Args:
            content: The dream narrative.
            lang: Output language code.
            intention: Optional incubation intention linked to the dream.

        Returns:
            The validated multi-layer analysis.

        Raises:
            AIEngineError: If the provider fails or returns malformed JSON.
        """
        prompt = f"Dream Content: {content}\n"
        if intention:
            prompt += f"Intention for this dream: {intention}\n"
        prompt += (
            f"\nPlease provide a deep holistic analysis in {_LANGUAGE_NAMES[lang]}. "
            "Structure the response strictly as JSON with these keys: "
            "physical, mental, spiritual, synthesis (strings) and symbols (array of short strings)."
        )

        try:
            response = await get_openai_client().chat.completions.create(
                model=settings.ANALYSIS_MODEL,
                messages=[
                    {"role": "system", "content": settings.CAYCE_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
            )
        except OpenAIError as exc:
            logger.exception("Dream analysis request failed")
            raise AIEngineError("Dream analysis provider failed.") from exc

        raw = response.choices[0].message.content or "{}"
        try:
            return DreamAnalysis.model_validate(json.loads(raw))
        except (json.JSONDecodeError, ValidationError) as exc:
            logger.error("Malformed analysis payload: %s", raw[:500])
            raise AIEngineError("Dream analysis returned malformed data.") from exc

    @staticmethod
    async def get_embedding(text: str) -> List[float]:
        """Generates embedding for semantic search using text-embedding-3-small.

        Raises:
            AIEngineError: If the embedding request fails.
        """
        try:
            response = await get_openai_client().embeddings.create(
                input=text,
                model=settings.EMBEDDING_MODEL,
            )
        except OpenAIError as exc:
            logger.exception("Embedding request failed")
            raise AIEngineError("Embedding provider failed.") from exc
        return response.data[0].embedding
