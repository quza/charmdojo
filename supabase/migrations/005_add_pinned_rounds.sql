-- ==============================================
-- Pinned Rounds Table
-- ==============================================
-- Tracks which game rounds users have pinned to appear at top of history
-- Created: October 28, 2025
-- ==============================================

-- Create pinned_rounds table
CREATE TABLE public.pinned_rounds (
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    round_id UUID NOT NULL REFERENCES public.game_rounds(id) ON DELETE CASCADE,
    pinned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (user_id, round_id)
);

-- Add indexes for performance
CREATE INDEX idx_pinned_rounds_user_id ON public.pinned_rounds(user_id);
CREATE INDEX idx_pinned_rounds_round_id ON public.pinned_rounds(round_id);
CREATE INDEX idx_pinned_rounds_user_pinned ON public.pinned_rounds(user_id, pinned_at DESC);

-- Enable RLS
ALTER TABLE public.pinned_rounds ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own pinned rounds"
    ON public.pinned_rounds FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pinned rounds"
    ON public.pinned_rounds FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own pinned rounds"
    ON public.pinned_rounds FOR DELETE
    USING (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE public.pinned_rounds IS 'Tracks which game rounds users have pinned to appear at top of history';
COMMENT ON COLUMN public.pinned_rounds.pinned_at IS 'Timestamp when the round was pinned';

