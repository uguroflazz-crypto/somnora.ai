import logging
from typing import Literal

from fastapi import APIRouter, Depends, Response
from openai import OpenAIError
from pydantic import BaseModel, Field

from app.core.auth import get_current_user_id
from app.core.errors import AIEngineError
from app.core.security import settings
from app.services.ai_engine import get_openai_client

logger = logging.getLogger(__name__)

router = APIRouter()

Voice = Literal["alloy", "echo", "fable", "onyx", "nova", "shimmer"]


class NarrationRequest(BaseModel):
    # OpenAI TTS rejects inputs longer than 4096 characters.
    text: str = Field(min_length=1, max_length=4096)
    voice: Voice = "alloy"
    speed: float = Field(default=1.0, ge=0.25, le=4.0)


@router.post("/synthesize")
async def synthesize_speech(
    payload: NarrationRequest,
    user_id: str = Depends(get_current_user_id),
) -> Response:
    """Converts text to speech using OpenAI TTS and returns MP3 bytes.

    Raises:
        AIEngineError: If the TTS provider fails.
    """
    try:
        speech = await get_openai_client().audio.speech.create(
            model=settings.TTS_MODEL,
            voice=payload.voice,
            input=payload.text,
            speed=payload.speed,
        )
    except OpenAIError as exc:
        logger.exception("TTS synthesis failed for user %s", user_id)
        raise AIEngineError("TTS synthesis failed.") from exc

    return Response(content=speech.content, media_type="audio/mpeg")
