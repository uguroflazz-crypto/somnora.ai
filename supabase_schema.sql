-- Enable pgvector extension for similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- PROFILES: Extends Supabase Auth users
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    preferred_language VARCHAR(2) DEFAULT 'en', -- 'en' or 'tr'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INCUBATIONS: Setting intentions for future dreams
CREATE TABLE incubations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    intention TEXT NOT NULL,
    category TEXT, -- e.g., 'healing', 'spiritual growth', 'problem solving'
    status TEXT DEFAULT 'active', -- 'active', 'fulfilled'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

-- DREAMS: Recording and storing dream journals
CREATE TABLE dreams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    incubation_id UUID REFERENCES incubations(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    raw_recording TEXT,
    emotional_tone TEXT,
    analysis_result JSONB, -- Stores the multi-layer Cayce analysis
    embedding vector(1536), -- Embedding for semantic search (OpenAI text-embedding-3-small)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PERSONAL SYMBOLS: Tracking recurring motifs
CREATE TABLE personal_symbols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    symbol_name TEXT NOT NULL,
    meaning TEXT,
    occurrence_count INTEGER DEFAULT 1,
    first_seen TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, symbol_name)
);

-- DREAM_SYMBOL_MAP: Junction table for symbols appearing in dreams
CREATE TABLE dream_symbol_map (
    dream_id UUID REFERENCES dreams(id) ON DELETE CASCADE NOT NULL,
    symbol_id UUID REFERENCES personal_symbols(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (dream_id, symbol_id)
);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE incubations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_symbols ENABLE ROW LEVEL SECURITY;
ALTER TABLE dream_symbol_map ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Profiles are viewable by everyone, editable by owner" ON profiles 
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Incubations are owned by user" ON incubations 
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Dreams are owned by user" ON dreams 
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Symbols are owned by user" ON personal_symbols 
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Dream maps are owned by user via dreams" ON dream_symbol_map 
    FOR ALL USING (EXISTS (SELECT 1 FROM dreams WHERE dreams.id = dream_symbol_map.dream_id AND dreams.user_id = auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS dreams_user_created_idx ON dreams (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS incubations_user_status_idx ON incubations (user_id, status);
CREATE INDEX IF NOT EXISTS dreams_embedding_idx ON dreams USING hnsw (embedding vector_cosine_ops);

-- Auto-create a profile for every new auth user (dreams/incubations FK to profiles).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    INSERT INTO public.profiles (id) VALUES (NEW.id) ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for users created before the trigger existed.
INSERT INTO public.profiles (id) SELECT id FROM auth.users ON CONFLICT (id) DO NOTHING;

-- Upsert a symbol for a user and link it to a dream (called by the backend).
CREATE OR REPLACE FUNCTION increment_symbol_count(row_user uuid, row_symbol text, row_dream uuid DEFAULT NULL)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
    v_symbol_id uuid;
BEGIN
    INSERT INTO personal_symbols (user_id, symbol_name)
    VALUES (row_user, row_symbol)
    ON CONFLICT (user_id, symbol_name)
    DO UPDATE SET occurrence_count = personal_symbols.occurrence_count + 1, last_seen = NOW()
    RETURNING id INTO v_symbol_id;

    IF row_dream IS NOT NULL THEN
        INSERT INTO dream_symbol_map (dream_id, symbol_id)
        VALUES (row_dream, v_symbol_id)
        ON CONFLICT DO NOTHING;
    END IF;
END;
$$;

-- Semantic search over a user's dreams (cosine similarity via pgvector).
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

-- The backend uses the service role; never expose these RPCs to anon/authenticated clients.
REVOKE EXECUTE ON FUNCTION increment_symbol_count(uuid, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION match_dreams(vector, float, int, uuid) FROM PUBLIC, anon, authenticated;
