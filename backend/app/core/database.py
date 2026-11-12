import asyncio
from typing import Optional

from supabase import AsyncClient, acreate_client

from app.core.errors import ConfigurationError
from app.core.security import settings

_client: Optional[AsyncClient] = None
_client_lock = asyncio.Lock()


async def get_supabase() -> AsyncClient:
    """Returns a lazily created, process-wide Supabase service-role client.

    Returns:
        The shared async Supabase client.

    Raises:
        ConfigurationError: If Supabase credentials are not configured.
    """
    global _client
    if _client is None:
        async with _client_lock:
            if _client is None:
                if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
                    raise ConfigurationError(
                        "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set."
                    )
                _client = await acreate_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    return _client
