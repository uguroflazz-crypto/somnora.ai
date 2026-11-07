from fastapi import APIRouter, HTTPException
from supabase import create_client, Client
from app.core.security import settings
from typing import List

router = APIRouter()
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

@router.get("/")
async def list_personal_symbols(user_id: str):
    res = supabase.table("personal_symbols").select("*").eq("user_id", user_id).order("occurrence_count", desc=True).execute()
    return res.data

@router.patch("/{symbol_id}")
async def update_symbol_meaning(symbol_id: str, meaning: str, user_id: str):
    res = supabase.table("personal_symbols").update({"meaning": meaning}).eq("id", symbol_id).eq("user_id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Symbol not found")
    return res.data[0]
