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
- Execute the `supabase_schema.sql` in the SQL Editor.
- To enable thesemantic search functionality, define the following RPC function in the SQL Editor:

\`\`\`sql
CREATE OR REPLACE FUNCTION match_dreams(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_user_id uuid
) RETURNS TABLE (
  id uuid,
  content text,
  similarity float
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    dreams.id,
    dreams.content,
    1 - (dreams.embedding <=> query_embedding) AS similarity
  FROM dreams
  WHERE dreams.user_id = filter_user_id
    AND 1 - (dreams.embedding <=> query_embedding) > match_threshold
  ORDER BY dreams.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
\`\`\`

### 2. Backend Deployment (Railway)
- Deploy the `/backend` folder.
- Environment Variables:
  - \`SUPABASE_URL\`: Your project URL.
  - \`SUPABASE_SERVICE_ROLE_KEY\`: Your secret service role key.
  - \`OPENAI_API_KEY\`: Your OpenAI API Key.

### 3. Frontend Deployment (Vercel)
- Deploy the `/frontend` folder.
- Environment Variables:
  - \`VITE_SUPABASE_URL\`: Same as above.
  - \`VITE_SUPABASE_ANON_KEY\`: Public anon key.

## Technical Highlights
- **Multi-Layer Analysis**: Custom system prompts ensuring clinical precision mixed with mystical empathy.
- **Vector Space Retrieval**: Dreams are embedded using \`text-embedding-3-small\`, allowing users to find conceptually similar dreams across years of journaling.
- **Symbol Graph**: Recurring themes are mapped into a topological representation of the user's psychic landscape.
