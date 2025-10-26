-- ==============================================
-- Girl Profiles Pool Migration
-- ==============================================
-- Creates table for storing pre-generated girl profiles
-- Target pool size: 2000 girls
-- ==============================================

-- Create girl_profiles table
CREATE TABLE public.girl_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    
    -- Attributes from generation prompt
    ethnicity TEXT NOT NULL,
    hairstyle TEXT NOT NULL,
    haircolor TEXT NOT NULL,
    eyecolor TEXT NOT NULL,
    bodytype TEXT NOT NULL,
    setting TEXT NOT NULL,
    
    -- Metadata
    source TEXT NOT NULL CHECK (source IN ('imagen', 'placeholder', 'fallback')),
    generation_prompt TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_used_at TIMESTAMPTZ,
    use_count INTEGER DEFAULT 0 NOT NULL,
    
    CONSTRAINT girl_profiles_use_count_positive CHECK (use_count >= 0)
);

-- Indexes for performance
CREATE INDEX idx_girl_profiles_created_at ON public.girl_profiles(created_at DESC);
CREATE INDEX idx_girl_profiles_last_used ON public.girl_profiles(last_used_at NULLS FIRST);
CREATE INDEX idx_girl_profiles_source ON public.girl_profiles(source);

-- Function to get current pool size
CREATE OR REPLACE FUNCTION get_girl_pool_size()
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*)::INTEGER FROM public.girl_profiles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get N random unique girls from pool
CREATE OR REPLACE FUNCTION get_random_girls(count INTEGER DEFAULT 3)
RETURNS SETOF public.girl_profiles AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.girl_profiles
    ORDER BY RANDOM()
    LIMIT count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE public.girl_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow public read access (girls are public content)
CREATE POLICY "Public can view girl profiles"
    ON public.girl_profiles FOR SELECT
    TO public
    USING (true);

-- RLS Policy: Only service role can insert
CREATE POLICY "Service role can insert girl profiles"
    ON public.girl_profiles FOR INSERT
    TO service_role
    WITH CHECK (true);

-- RLS Policy: Only service role can update
CREATE POLICY "Service role can update girl profiles"
    ON public.girl_profiles FOR UPDATE
    TO service_role
    USING (true);

-- Comments for documentation
COMMENT ON TABLE public.girl_profiles IS 'Pre-generated pool of girl profiles (target: 2000)';
COMMENT ON COLUMN public.girl_profiles.source IS 'Origin of image: imagen (AI), placeholder (fallback SVG), or fallback (local file)';
COMMENT ON COLUMN public.girl_profiles.generation_prompt IS 'Full prompt used to generate the image (for imagen source)';
COMMENT ON COLUMN public.girl_profiles.use_count IS 'Number of times this girl has been selected by users';
COMMENT ON COLUMN public.girl_profiles.last_used_at IS 'Timestamp of last time this girl was selected';

-- ==============================================
-- MIGRATION COMPLETE
-- ==============================================
-- Run this migration using Supabase MCP or SQL editor

