from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import StreamingResponse
from app.core.security import settings
from openai import OpenAI
import io
import pydantic
from typing import Optional

router = APIRouter()
client = OpenAI(api_key=settings.OPENAI_API_KEY)

class NarrationRequest(pydantic.BaseModel):
    text: str
    voice: str = "alloy" # alloy, echo, fable, onyx, nova, shimmer
    speed: float = 1.0

@router.post("/synthesize")
async def synthesize_speech(payload: NarrationRequest, user_id: str):
    \"\"\"
    Converts text to speech using OpenAI TTS.
    Streams the audio bytes directly to the frontend.
    \"\"\"
    try:
        response = client.audio.speech.create(
            model="tts-1",
            voice=payload.voice,
            input=payload.text,
            speed=payload.speed
        )
        
        # Convert generator to byte stream
        audio_data = b"".join(response.iter_bytes())
        return StreamingResponse(io.BytesIO(audio_data), media_type="audio/mpeg")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS Synthesis failed: {str(e)}")
