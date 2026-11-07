from fastapi import APIRouter, HTTPException
from supabase import create_client, Client
from app.core.security import settings
from pydantic import BaseModel
from typing import Optional

router = APIRouter()
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

class IncubationCreate(BaseModel):
    intention: str
    category: Optional[str] = None

@router.post("/")
async def set_intention(payload: IncubationCreate, user_id: str):
    data = {
        "user_id": user_id,
        "intention": payload.intention,
        "category": payload.category
    }
    res = supabase.table("incubations").insert(data).execute()
    return res.data[0]

@router.get("/active")
async def get_active_intentions(user_id: str):
    res = supabase.table("incubations").select("*").eq("user_id", user_id).eq("status", "active").execute()
    return res.data
