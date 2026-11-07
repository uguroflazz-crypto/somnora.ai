from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from app.core.security import settings
from app.services.ai_engine import AIEngine
from supabase import create_client, Client
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

router = APIRouter()
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

class DreamCreate(BaseModel):
    content: str
    incubation_id: Optional[str] = None
    language: str = "en"

class IncubationCreate(BaseModel):
    intention: str
    category: Optional[str] = None

@router.post("/")
async def create_dream(payload: DreamCreate, user_id: str):
    # 1. Generate AI Analysis
    analysis = await AIEngine.analyze_dream(payload.content, payload.language)
    
    # 2. Generate Embedding for pgvector
    embedding = await AIEngine.get_embedding(payload.content)
    
    # 3. Store Dream
    dream_data = {
        "user_id": user_id,
        "content": payload.content,
        "incubation_id": payload.incubation_id,
        "analysis_result": analysis,
        "embedding": embedding
    }
    
    res = supabase.table("dreams").insert(dream_data).execute()
    
    # 4. Extract Symbols and update personal_symbols table
    symbols = analysis.get("symbols", [])
    if isinstance(symbols, list):
        for sym in symbols:
            sym_name = sym if isinstance(sym, str) else sym.get("name")
            if sym_name:
                # Upsert symbol
                supabase.rpc('increment_symbol_count', {'row_user': user_id, 'row_symbol': sym_name}).execute()
                
    return res.data[0]

@router.get("/{dream_id}")
async def get_dream(dream_id: str, user_id: str):
    res = supabase.table("dreams").select("*").eq("id", dream_id).eq("user_id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Dream not found")
    return res.data[0]

@router.get("/search")
async def search_dreams(query: str, user_id: str):
    # Semantic search using pgvector
    query_embedding = await AIEngine.get_embedding(query)
    
    # We use a RPC call for cosine similarity in Supabase
    res = supabase.rpc("match_dreams", {
        "query_embedding": query_embedding,
        "match_threshold": 0.7,
        "match_count": 5,
        "filter_user_id": user_id
    }).execute()
    
    return res.data
