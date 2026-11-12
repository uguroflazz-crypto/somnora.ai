# Somnora AI - Production Ready Implementation

Somnora AI is a high-end dream analysis platform utilizing Edgar Cayce's holistic framework (Physical, Mental, Spiritual) combined with cutting-edge LLMs and Vector Databases.

## Architecture Overview
- **Frontend**: React + Vite + Tailwind (Midnight Palette)
- **Backend**: FastAPI + Supabase Service Role + OpenAI GPT-4o
- **Database**: Supabase (PostgreSQL) + pgvector for semantic dream retrieval
- **Localization**: Bilingual (EN/TR) via i18next

## Deployment Guide

### 1. Supabase Setup
- Create a new Supabase project.
- Execute `supabase_schema.sql` in the SQL Editor. It creates the tables, RLS policies, the
  profile-on-signup trigger and the `increment_symbol_count` / `match_dreams` RPCs used by the backend.
  If the tables already exist, run only the part after `-- Indexes`.

### 2. Backend Deployment (Docker: Render / Railway)
- Build from the repo root with the root `Dockerfile` (listens on `$PORT`, default `10000`).
- Health check path: `/health`.
- Environment Variables:
  - `SUPABASE_URL`: Your project URL.
  - `SUPABASE_SERVICE_ROLE_KEY`: Your secret service role key.
  - `OPENAI_API_KEY`: Your OpenAI API Key.
  - `CORS_ORIGINS`: Comma-separated frontend origins, e.g. `https://somnora.vercel.app`.
- All `/api/v1/*` routes require `Authorization: Bearer <supabase access token>`.

### 3. Frontend Deployment (Vercel)
- Deploy the `/frontend` folder (framework preset: Vite).
- Environment Variables:
  - `VITE_SUPABASE_URL`: Same as above.
  - `VITE_SUPABASE_ANON_KEY`: Public anon key.
  - `VITE_API_URL`: Public backend URL, e.g. `https://somnora-api.onrender.com`.

### Local Development
```bash
# backend (from repo root)
py -3.13 -m venv backend/.venv && backend/.venv/Scripts/pip install -r backend/requirements-dev.txt
backend/.venv/Scripts/python -m uvicorn backend.main:app --port 8000 --reload
cd backend && .venv/Scripts/python -m pytest

# frontend
cd frontend && npm install && npm run dev   # proxies /api to localhost:8000
npm test
```

## Technical Highlights
- **Multi-Layer Analysis**: Custom system prompts ensuring clinical precision mixed with mystical empathy.
- **Vector Space Retrieval**: Dreams are embedded using \`text-embedding-3-small\`, allowing users to find conceptually similar dreams across years of journaling.
- **Symbol Graph**: Recurring themes are mapped into a topological representation of the user's psychic landscape.
