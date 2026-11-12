import os
import sys

# Lets `uvicorn backend.main:app` resolve the `app` package inside this folder.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app  # noqa: E402

__all__ = ["app"]
