class ConfigurationError(RuntimeError):
    """Raised when a required environment variable is missing."""


class AIEngineError(RuntimeError):
    """Raised when an upstream AI provider call fails or returns unusable data."""


class DatabaseError(RuntimeError):
    """Raised when a Supabase/PostgREST call fails."""
