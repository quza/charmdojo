-- ==============================================
-- Reward Caching Migration
-- ==============================================
-- Adds reward caching fields to girl_profiles table
-- Links game_rounds to girl_profiles for reward reuse
-- ==============================================

-- Add reward caching fields to girl_profiles table
ALTER TABLE public.girl_profiles
ADD COLUMN reward_text TEXT,
ADD COLUMN reward_voice_url TEXT,
ADD COLUMN reward_image_url TEXT,
ADD COLUMN reward_description TEXT,
ADD COLUMN rewards_generated BOOLEAN DEFAULT FALSE NOT NULL;

-- Add girl_profile_id foreign key to game_rounds table
ALTER TABLE public.game_rounds
ADD COLUMN girl_profile_id UUID REFERENCES public.girl_profiles(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX idx_game_rounds_girl_profile_id ON public.game_rounds(girl_profile_id);

-- Create index for girls with cached rewards
CREATE INDEX idx_girl_profiles_rewards_generated ON public.girl_profiles(rewards_generated) WHERE rewards_generated = true;

-- Comments for documentation
COMMENT ON COLUMN public.girl_profiles.reward_text IS 'Cached reward text that can be reused when this girl is selected again';
COMMENT ON COLUMN public.girl_profiles.reward_voice_url IS 'Cached reward voice URL that can be reused';
COMMENT ON COLUMN public.girl_profiles.reward_image_url IS 'Cached reward image URL that can be reused';
COMMENT ON COLUMN public.girl_profiles.reward_description IS 'Cached detailed description used for reward generation consistency';
COMMENT ON COLUMN public.girl_profiles.rewards_generated IS 'Flag indicating if rewards have been generated and cached for this girl';
COMMENT ON COLUMN public.game_rounds.girl_profile_id IS 'Links round to a girl profile for reward caching and reuse';

-- ==============================================
-- MIGRATION COMPLETE
-- ==============================================
-- This enables reward caching by storing generated rewards
-- on girl profiles for reuse in future rounds

