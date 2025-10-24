-- ==============================================
-- CharmDojo Database Schema - Complete Migration
-- ==============================================
-- Based on: PRD v1.0, Implementation Plan Phase 1
-- Created: October 24, 2025
-- ==============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ======================
-- USERS TABLE
-- ======================
-- Note: Supabase Auth automatically creates auth.users table
-- We create a public.users table for additional profile data

CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    total_rounds INTEGER DEFAULT 0 NOT NULL,
    total_wins INTEGER DEFAULT 0 NOT NULL,
    total_losses INTEGER DEFAULT 0 NOT NULL,
    best_streak INTEGER DEFAULT 0 NOT NULL,
    current_streak INTEGER DEFAULT 0 NOT NULL,
    CONSTRAINT users_total_rounds_positive CHECK (total_rounds >= 0),
    CONSTRAINT users_total_wins_positive CHECK (total_wins >= 0),
    CONSTRAINT users_total_losses_positive CHECK (total_losses >= 0),
    CONSTRAINT users_streaks_positive CHECK (best_streak >= 0 AND current_streak >= 0)
);

-- Indexes for users table
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_created_at ON public.users(created_at DESC);

-- ======================
-- GAME_ROUNDS TABLE
-- ======================
-- Stores information about each game session

CREATE TABLE public.game_rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    girl_name TEXT NOT NULL,
    girl_image_url TEXT NOT NULL,
    girl_description TEXT,
    girl_persona TEXT DEFAULT 'playful',
    initial_meter INTEGER DEFAULT 20 NOT NULL,
    final_meter INTEGER,
    result TEXT CHECK (result IN ('win', 'lose', 'abandoned')),
    message_count INTEGER DEFAULT 0 NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ,
    is_abandoned BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT game_rounds_initial_meter_range CHECK (initial_meter >= 0 AND initial_meter <= 100),
    CONSTRAINT game_rounds_final_meter_range CHECK (final_meter IS NULL OR (final_meter >= 0 AND final_meter <= 100)),
    CONSTRAINT game_rounds_message_count_positive CHECK (message_count >= 0)
);

-- Indexes for game_rounds table
CREATE INDEX idx_game_rounds_user_id ON public.game_rounds(user_id);
CREATE INDEX idx_game_rounds_started_at ON public.game_rounds(started_at DESC);
CREATE INDEX idx_game_rounds_result ON public.game_rounds(result);
CREATE INDEX idx_game_rounds_user_started ON public.game_rounds(user_id, started_at DESC);

-- ======================
-- MESSAGES TABLE
-- ======================
-- Stores all conversation messages and AI analysis

CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    round_id UUID NOT NULL REFERENCES public.game_rounds(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    success_delta INTEGER CHECK (success_delta IS NULL OR (success_delta >= -8 AND success_delta <= 8)),
    meter_after INTEGER CHECK (meter_after IS NULL OR (meter_after >= 0 AND meter_after <= 100)),
    category TEXT CHECK (category IN ('excellent', 'good', 'neutral', 'poor', 'bad')),
    reasoning TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    is_instant_fail BOOLEAN DEFAULT FALSE NOT NULL,
    fail_reason TEXT,
    CONSTRAINT messages_content_not_empty CHECK (LENGTH(TRIM(content)) > 0)
);

-- Indexes for messages table
CREATE INDEX idx_messages_round_id ON public.messages(round_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_messages_role ON public.messages(role);
CREATE INDEX idx_messages_round_created ON public.messages(round_id, created_at);

-- ======================
-- REWARDS TABLE
-- ======================
-- Stores generated reward assets for won games

CREATE TABLE public.rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    round_id UUID UNIQUE NOT NULL REFERENCES public.game_rounds(id) ON DELETE CASCADE,
    reward_text TEXT NOT NULL,
    reward_voice_url TEXT,
    reward_image_url TEXT,
    generation_time FLOAT CHECK (generation_time IS NULL OR generation_time >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT rewards_text_not_empty CHECK (LENGTH(TRIM(reward_text)) > 0)
);

-- Indexes for rewards table
CREATE INDEX idx_rewards_round_id ON public.rewards(round_id);
CREATE INDEX idx_rewards_created_at ON public.rewards(created_at DESC);

-- ======================
-- SUBSCRIPTIONS TABLE
-- ======================
-- Stores Stripe subscription information

CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'incomplete')),
    plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for subscriptions table
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- ======================
-- FUNCTIONS & TRIGGERS
-- ======================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update updated_at for subscriptions table
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function: Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- User already exists, do nothing
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create profile when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ======================
-- ROW LEVEL SECURITY (RLS)
-- ======================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for USERS table
CREATE POLICY "Users can view own data"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- RLS Policies for GAME_ROUNDS table
CREATE POLICY "Users can view own rounds"
    ON public.game_rounds FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rounds"
    ON public.game_rounds FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rounds"
    ON public.game_rounds FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for MESSAGES table
CREATE POLICY "Users can view messages from own rounds"
    ON public.messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.game_rounds
            WHERE game_rounds.id = messages.round_id
            AND game_rounds.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages to own rounds"
    ON public.messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.game_rounds
            WHERE game_rounds.id = messages.round_id
            AND game_rounds.user_id = auth.uid()
        )
    );

-- RLS Policies for REWARDS table
CREATE POLICY "Users can view rewards from own rounds"
    ON public.rewards FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.game_rounds
            WHERE game_rounds.id = rewards.round_id
            AND game_rounds.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert rewards for own rounds"
    ON public.rewards FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.game_rounds
            WHERE game_rounds.id = rewards.round_id
            AND game_rounds.user_id = auth.uid()
        )
    );

-- RLS Policies for SUBSCRIPTIONS table
CREATE POLICY "Users can view own subscription"
    ON public.subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
    ON public.subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow service role to bypass RLS (for backend operations)
-- This is implicit - service_role key bypasses RLS by default

-- ======================
-- HELPER FUNCTIONS
-- ======================

-- Function: Get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE (
    total_rounds BIGINT,
    wins BIGINT,
    losses BIGINT,
    win_rate NUMERIC,
    current_streak INTEGER,
    best_streak INTEGER,
    average_messages_to_win NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_rounds,
        COUNT(*) FILTER (WHERE result = 'win')::BIGINT as wins,
        COUNT(*) FILTER (WHERE result = 'lose')::BIGINT as losses,
        CASE
            WHEN COUNT(*) FILTER (WHERE result IN ('win', 'lose')) > 0 THEN
                ROUND(
                    COUNT(*) FILTER (WHERE result = 'win')::NUMERIC /
                    COUNT(*) FILTER (WHERE result IN ('win', 'lose'))::NUMERIC,
                    2
                )
            ELSE 0
        END as win_rate,
        u.current_streak,
        u.best_streak,
        CASE
            WHEN COUNT(*) FILTER (WHERE result = 'win') > 0 THEN
                ROUND(
                    AVG(message_count) FILTER (WHERE result = 'win'),
                    1
                )
            ELSE 0
        END as average_messages_to_win
    FROM public.game_rounds gr
    CROSS JOIN public.users u
    WHERE gr.user_id = user_uuid
    AND u.id = user_uuid
    GROUP BY u.current_streak, u.best_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ======================
-- COMMENTS (Documentation)
-- ======================

COMMENT ON TABLE public.users IS 'User profiles with aggregate game statistics';
COMMENT ON TABLE public.game_rounds IS 'Individual game sessions with selected AI girls';
COMMENT ON TABLE public.messages IS 'Conversation messages with AI analysis and success deltas';
COMMENT ON TABLE public.rewards IS 'Generated reward assets (text, voice, image) for won games';
COMMENT ON TABLE public.subscriptions IS 'Stripe subscription data for premium users';

COMMENT ON COLUMN public.users.total_rounds IS 'Aggregate count of all rounds played';
COMMENT ON COLUMN public.users.total_wins IS 'Aggregate count of won rounds';
COMMENT ON COLUMN public.users.total_losses IS 'Aggregate count of lost rounds';
COMMENT ON COLUMN public.users.best_streak IS 'Highest consecutive wins achieved';
COMMENT ON COLUMN public.users.current_streak IS 'Current consecutive wins (resets on loss)';

COMMENT ON COLUMN public.game_rounds.girl_description IS 'Detailed physical description from Vision AI';
COMMENT ON COLUMN public.game_rounds.girl_persona IS 'Personality type (playful, confident, etc.)';
COMMENT ON COLUMN public.game_rounds.initial_meter IS 'Starting success meter value (default 20%)';
COMMENT ON COLUMN public.game_rounds.final_meter IS 'Final success meter value at game end';
COMMENT ON COLUMN public.game_rounds.is_abandoned IS 'True if user left before completion';

COMMENT ON COLUMN public.messages.success_delta IS 'Change in success meter (-8 to +8) - only for user messages';
COMMENT ON COLUMN public.messages.meter_after IS 'Success meter value after this message';
COMMENT ON COLUMN public.messages.category IS 'Quality rating (excellent, good, neutral, poor, bad)';
COMMENT ON COLUMN public.messages.reasoning IS 'AI explanation for the success delta';
COMMENT ON COLUMN public.messages.is_instant_fail IS 'True if message triggered instant game over';
COMMENT ON COLUMN public.messages.fail_reason IS 'Reason for instant fail (offensive, nonsense, etc.)';

COMMENT ON COLUMN public.rewards.generation_time IS 'Seconds taken to generate all reward assets';

COMMENT ON COLUMN public.subscriptions.stripe_customer_id IS 'Stripe customer ID';
COMMENT ON COLUMN public.subscriptions.stripe_subscription_id IS 'Stripe subscription ID';
COMMENT ON COLUMN public.subscriptions.status IS 'Subscription status from Stripe webhook';
COMMENT ON COLUMN public.subscriptions.cancel_at_period_end IS 'True if user requested cancellation';

-- ======================
-- VERIFICATION QUERIES
-- ======================
-- Run these to verify successful migration

-- Check all tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check all indexes created
SELECT tablename, indexname FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check RLS policies
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check triggers
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ======================
-- MIGRATION COMPLETE
-- ======================
-- All tables, indexes, RLS policies, triggers, and functions created
-- Save this file as: supabase/migrations/001_initial_schema.sql
