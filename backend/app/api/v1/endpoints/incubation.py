import logging
from datetime import datetime
from typing import Any, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from supabase import AsyncClient, PostgrestAPIError

from app.core.auth import get_current_user_id
from app.core.database import get_supabase
from app.core.errors import DatabaseError

logger = logging.getLogger(__name__)

router = APIRouter()


class IncubationCreate(BaseModel):
    intention: str = Field(min_length=1, max_length=1_000)
    category: Optional[str] = Field(default=None, max_length=100)


class IncubationOut(BaseModel):
    id: UUID
    intention: str
    category: Optional[str] = None
    status: str
    created_at: datetime


@router.post("/", response_model=IncubationOut)
async def set_intention(
    payload: IncubationCreate,
    user_id: str = Depends(get_current_user_id),
    supabase: AsyncClient = Depends(get_supabase),
) -> dict[str, Any]:
    data = {
        "user_id": user_id,
        "intention": payload.intention.strip(),
        "category": payload.category,
    }
    try:
        res = await supabase.table("incubations").insert(data).execute()
    except PostgrestAPIError as exc:
        logger.exception("Failed to store incubation")
        raise DatabaseError("Failed to store intention.") from exc
    return res.data[0]


@router.get("/active", response_model=List[IncubationOut])
async def get_active_intentions(
    user_id: str = Depends(get_current_user_id),
    supabase: AsyncClient = Depends(get_supabase),
) -> List[dict[str, Any]]:
    try:
        res = (
            await supabase.table("incubations")
            .select("*")
            .eq("user_id", user_id)
            .eq("status", "active")
            .order("created_at", desc=True)
            .execute()
        )
    except PostgrestAPIError as exc:
        logger.exception("Failed to fetch incubations")
        raise DatabaseError("Failed to fetch intentions.") from exc
    return res.data or []
