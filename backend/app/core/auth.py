import logging
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import AsyncClient, AuthError

from app.core.database import get_supabase

logger = logging.getLogger(__name__)

_bearer_scheme = HTTPBearer(auto_error=False)


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
) -> str:
    """Validates the Supabase access token and returns the authenticated user's id.

    Args:
        credentials: Bearer token taken from the `Authorization` header.

    Returns:
        The authenticated user's UUID as a string.

    Raises:
        HTTPException: 401 if the token is missing, expired or invalid.
    """
    if credentials is None or not credentials.credentials:
        raise _unauthorized("Missing bearer token.")

    supabase: AsyncClient = await get_supabase()
    try:
        response = await supabase.auth.get_user(credentials.credentials)
    except AuthError as exc:
        logger.info("Rejected access token: %s", exc)
        raise _unauthorized("Invalid or expired token.") from exc

    if response is None or response.user is None:
        raise _unauthorized("Invalid or expired token.")
    return str(response.user.id)
