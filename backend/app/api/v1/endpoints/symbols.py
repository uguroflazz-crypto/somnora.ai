import logging
from datetime import datetime
from typing import Any, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from supabase import AsyncClient, PostgrestAPIError

from app.core.auth import get_current_user_id
from app.core.database import get_supabase
from app.core.errors import DatabaseError

logger = logging.getLogger(__name__)

router = APIRouter()


class SymbolOut(BaseModel):
    id: UUID
    symbol_name: str
    meaning: Optional[str] = None
    occurrence_count: int
    first_seen: datetime
    last_seen: datetime


class SymbolUpdate(BaseModel):
    meaning: str = Field(max_length=2_000)


@router.get("/", response_model=List[SymbolOut])
async def list_personal_symbols(
    user_id: str = Depends(get_current_user_id),
    supabase: AsyncClient = Depends(get_supabase),
) -> List[dict[str, Any]]:
    try:
        res = (
            await supabase.table("personal_symbols")
            .select("*")
            .eq("user_id", user_id)
            .order("occurrence_count", desc=True)
            .execute()
        )
    except PostgrestAPIError as exc:
        logger.exception("Failed to list symbols")
        raise DatabaseError("Failed to list symbols.") from exc
    return res.data or []


@router.patch("/{symbol_id}", response_model=SymbolOut)
async def update_symbol_meaning(
    symbol_id: UUID,
    payload: SymbolUpdate,
    user_id: str = Depends(get_current_user_id),
    supabase: AsyncClient = Depends(get_supabase),
) -> dict[str, Any]:
    try:
        res = (
            await supabase.table("personal_symbols")
            .update({"meaning": payload.meaning})
            .eq("id", str(symbol_id))
            .eq("user_id", user_id)
            .execute()
        )
    except PostgrestAPIError as exc:
        logger.exception("Failed to update symbol %s", symbol_id)
        raise DatabaseError("Failed to update symbol.") from exc
    if not res.data:
        raise HTTPException(status_code=404, detail="Symbol not found")
    return res.data[0]
