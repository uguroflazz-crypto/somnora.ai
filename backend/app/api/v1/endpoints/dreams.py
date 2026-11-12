import logging
from datetime import datetime
from typing import Any, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from supabase import AsyncClient, PostgrestAPIError

from app.core.auth import get_current_user_id
from app.core.database import get_supabase
from app.core.errors import DatabaseError
from app.services.ai_engine import AIEngine, DreamAnalysis, Language

logger = logging.getLogger(__name__)

router = APIRouter()

# Embeddings are large and internal; never send them to the client.
_DREAM_COLUMNS = "id, user_id, incubation_id, content, emotional_tone, analysis_result, created_at"


class DreamCreate(BaseModel):
    content: str = Field(min_length=1, max_length=10_000)
    incubation_id: Optional[UUID] = None
    language: Language = "en"


class DreamOut(BaseModel):
    id: UUID
    user_id: UUID
    incubation_id: Optional[UUID] = None
    content: str
    emotional_tone: Optional[str] = None
    analysis_result: Optional[DreamAnalysis] = None
    created_at: datetime


class DreamMatch(BaseModel):
    id: UUID
    content: str
    similarity: float


async def _get_intention(supabase: AsyncClient, incubation_id: UUID, user_id: str) -> str:
    res = (
        await supabase.table("incubations")
        .select("intention")
        .eq("id", str(incubation_id))
        .eq("user_id", user_id)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail="Incubation not found")
    return str(res.data[0]["intention"])


async def _record_symbols(
    supabase: AsyncClient, user_id: str, dream_id: str, symbols: List[str]
) -> None:
    """Upserts symbols; failures are logged so the saved dream is still returned."""
    for symbol in symbols:
        try:
            await supabase.rpc(
                "increment_symbol_count",
                {"row_user": user_id, "row_symbol": symbol, "row_dream": dream_id},
            ).execute()
        except PostgrestAPIError:
            logger.exception("Failed to record symbol %r for dream %s", symbol, dream_id)


@router.post("/", response_model=DreamOut)
async def create_dream(
    payload: DreamCreate,
    user_id: str = Depends(get_current_user_id),
    supabase: AsyncClient = Depends(get_supabase),
) -> dict[str, Any]:
    try:
        intention = (
            await _get_intention(supabase, payload.incubation_id, user_id)
            if payload.incubation_id
            else None
        )

        analysis = await AIEngine.analyze_dream(payload.content, payload.language, intention)
        embedding = await AIEngine.get_embedding(payload.content)

        dream_data = {
            "user_id": user_id,
            "content": payload.content,
            "incubation_id": str(payload.incubation_id) if payload.incubation_id else None,
            "analysis_result": analysis.model_dump(),
            "embedding": embedding,
        }
        res = await supabase.table("dreams").insert(dream_data).execute()
    except PostgrestAPIError as exc:
        logger.exception("Failed to store dream")
        raise DatabaseError("Failed to store dream.") from exc

    dream = res.data[0]
    await _record_symbols(supabase, user_id, str(dream["id"]), analysis.symbols)
    dream.pop("embedding", None)
    return dream


@router.get("/search", response_model=List[DreamMatch])
async def search_dreams(
    query: str = Query(min_length=1, max_length=1_000),
    user_id: str = Depends(get_current_user_id),
    supabase: AsyncClient = Depends(get_supabase),
) -> List[dict[str, Any]]:
    query_embedding = await AIEngine.get_embedding(query)
    try:
        res = await supabase.rpc(
            "match_dreams",
            {
                "query_embedding": query_embedding,
                "match_threshold": 0.7,
                "match_count": 5,
                "filter_user_id": user_id,
            },
        ).execute()
    except PostgrestAPIError as exc:
        logger.exception("Semantic search failed")
        raise DatabaseError("Semantic search failed.") from exc
    return res.data or []


@router.get("/{dream_id}", response_model=DreamOut)
async def get_dream(
    dream_id: UUID,
    user_id: str = Depends(get_current_user_id),
    supabase: AsyncClient = Depends(get_supabase),
) -> dict[str, Any]:
    try:
        res = (
            await supabase.table("dreams")
            .select(_DREAM_COLUMNS)
            .eq("id", str(dream_id))
            .eq("user_id", user_id)
            .execute()
        )
    except PostgrestAPIError as exc:
        logger.exception("Failed to fetch dream %s", dream_id)
        raise DatabaseError("Failed to fetch dream.") from exc
    if not res.data:
        raise HTTPException(status_code=404, detail="Dream not found")
    return res.data[0]
