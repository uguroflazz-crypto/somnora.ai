from typing import Optional

from dotenv import load_dotenv
from pydantic import AliasChoices, BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()


class Settings(BaseSettings):
    """Application settings loaded from environment variables or a `.env` file."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore", populate_by_name=True)

    PROJECT_NAME: str = "Somnora AI"
    API_V1_STR: str = "/api/v1"
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = Field(
        default="",
        validation_alias=AliasChoices("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_KEY"),
    )
    OPENAI_API_KEY: str = ""
    ANALYSIS_MODEL: str = "gpt-4o"
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    TTS_MODEL: str = "tts-1"
    # Comma-separated list of allowed browser origins.
    CORS_ORIGINS: str = "http://localhost:5173"

    # System Prompt for Edgar Cayce Holistic Framework
    CAYCE_SYSTEM_PROMPT: str = (
        "You are the Somnora AI Engine, specializing in the holistic dream analysis framework of Edgar Cayce. "
        "Analyze dreams across three interconnected layers:\n"
        "1. PHYSICAL LAYER: Relate symbols to bodily sensations, health markers, and material reality.\n"
        "2. MENTAL LAYER: Explore psychological archetypes, subconscious stressors, and cognitive patterns.\n"
        "3. SPIRITUAL LAYER: Uncover soul purpose, karmic lessons, and transcendental insights.\n\n"
        "Guidelines:\n"
        "- Maintain a prestige wellness vibe: calm, mysterious, clinically precise, and empathetic.\n"
        "- Provide structured output. If requested in Turkish, translate perfectly while preserving technical precision.\n"
        "- Identify recurring symbols and suggest potential deeper meanings linked to the dreamer's intention."
    )

    @property
    def cors_origin_list(self) -> list[str]:
        """Returns the configured CORS origins as a clean list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()


class TokenData(BaseModel):
    user_id: str
    exp: Optional[int] = None


class UserProfile(BaseModel):
    id: str
    username: Optional[str] = None
    preferred_language: str = "en"
