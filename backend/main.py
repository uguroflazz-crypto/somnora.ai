from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.api.v1.endpoints import dreams, incubation, symbols, narration
from app.core.security import settings
from supabase import create_client, Client

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

async def get_current_user(token: HTTPAuthorizationCredentials = Depends(security)):
    """Validates Supabase JWT and returns user_id."""
    try:
        user = supabase.auth.get_user(token.credentials)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Unauthorized")

# Injecting user_id dependency to all routers manually for simplicity in this prototype
app.include_router(dreams.router, prefix=f"{settings.API_V1_STR}/dreams", tags=["Dreams"])
app.include_router(incubation.router, prefix=f"{settings.API_V1_STR}/incubations", tags=["Incubations"])
app.include_router(symbols.router, prefix=f"{settings.API_V1_STR}/symbols", tags=["Symbols"])
app.include_router(narration.router, prefix=f"{settings.API_V1_STR}/narration", tags=["Narration"])

@app.get("/")
async def root():
    return {"status": "online", "engine": "Cayce-Holistic-v1"}
