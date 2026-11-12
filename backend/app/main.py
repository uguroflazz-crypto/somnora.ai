import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.endpoints import dreams, incubation, narration, symbols
from app.core.errors import AIEngineError, ConfigurationError, DatabaseError
from app.core.security import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("somnora")


def create_app() -> FastAPI:
    """Builds the Somnora FastAPI application with routers and error handlers."""
    application = FastAPI(title=settings.PROJECT_NAME)

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    prefix = settings.API_V1_STR
    application.include_router(dreams.router, prefix=f"{prefix}/dreams", tags=["dreams"])
    application.include_router(incubation.router, prefix=f"{prefix}/incubations", tags=["incubations"])
    application.include_router(symbols.router, prefix=f"{prefix}/symbols", tags=["symbols"])
    application.include_router(narration.router, prefix=f"{prefix}/narration", tags=["narration"])

    @application.get("/health", tags=["meta"])
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    @application.exception_handler(ConfigurationError)
    async def _configuration_error(_: Request, exc: ConfigurationError) -> JSONResponse:
        logger.error("Configuration error: %s", exc)
        return JSONResponse(status_code=503, content={"detail": "Service is not configured."})

    @application.exception_handler(AIEngineError)
    async def _ai_error(_: Request, exc: AIEngineError) -> JSONResponse:
        return JSONResponse(status_code=502, content={"detail": str(exc)})

    @application.exception_handler(DatabaseError)
    async def _database_error(_: Request, exc: DatabaseError) -> JSONResponse:
        return JSONResponse(status_code=502, content={"detail": str(exc)})

    return application


app = create_app()
