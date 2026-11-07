import os
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Somnora AI"
    API_V1_STR: str = "/api/v1"
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
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

settings = Settings()

class TokenData(BaseModel):
    user_id: str
    exp: Optional[int] = None

class UserProfile(BaseModel):
    id: str
    username: Optional[str] = None
    preferred_language: str = "en"
