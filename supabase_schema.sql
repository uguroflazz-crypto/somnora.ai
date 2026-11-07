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
