import os
import sys

# Lets `uvicorn main:app` from the repo root resolve the backend `app` package.
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend"))

from app.main import app  # noqa: E402

__all__ = ["app"]
