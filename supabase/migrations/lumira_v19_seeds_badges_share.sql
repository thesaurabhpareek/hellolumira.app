-- =============================================================================
-- Lumira v19: Seeds (Gamification Coins), Enhanced Badges, Share Tracking
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Seeds (Gamification Currency)
-- ─────────────────────────────────────────────────────────────────────────────

-- Add seeds_balance to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS seeds_balance INTEGER NOT NULL DEFAULT 0;

-- Add share_token to profiles for personalized share links
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS share_token VARCHAR(8) UNIQUE;

-- Seed transactions ledger
CREATE TABLE IF NOT EXISTS public.seed_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for deduplication: one award per reason per day
CREATE UNIQUE INDEX IF NOT EXISTS idx_seed_transactions_dedup
  ON public.seed_transactions (profile_id, reason, reference_date);

-- Index for fetching a user's transaction history
CREATE INDEX IF NOT EXISTS idx_seed_transactions_profile
  ON public.seed_transactions (profile_id, created_at DESC);

-- RLS for seed_transactions
ALTER TABLE public.seed_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own seed transactions"
  ON public.seed_transactions FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Service role can insert seed transactions"
  ON public.seed_transactions FOR INSERT
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Enhanced Badges
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.earned_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Each badge can only be earned once
CREATE UNIQUE INDEX IF NOT EXISTS idx_earned_badges_unique
  ON public.earned_badges (profile_id, badge_id);

-- Index for fetching a user's badges
CREATE INDEX IF NOT EXISTS idx_earned_badges_profile
  ON public.earned_badges (profile_id, awarded_at DESC);

-- RLS for earned_badges
ALTER TABLE public.earned_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own badges"
  ON public.earned_badges FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Service role can insert badges"
  ON public.earned_badges FOR INSERT
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Share / Referral Tracking
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.share_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  share_token VARCHAR(8) NOT NULL,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_hash TEXT,
  user_agent TEXT
);

-- Index for counting shares per user
CREATE INDEX IF NOT EXISTS idx_share_tracking_referrer
  ON public.share_tracking (referrer_profile_id, clicked_at DESC);

-- RLS for share_tracking
ALTER TABLE public.share_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own share tracking"
  ON public.share_tracking FOR SELECT
  USING (auth.uid() = referrer_profile_id);

CREATE POLICY "Anyone can insert share tracking"
  ON public.share_tracking FOR INSERT
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Daily Streak Tracking
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_streak INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS longest_streak INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_checkin_date DATE;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. RPC: Atomically increment seeds balance
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.increment_seeds_balance(
  p_profile_id UUID,
  p_amount INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET seeds_balance = seeds_balance + p_amount
  WHERE id = p_profile_id;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. RPC: Update streak on check-in
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_checkin_streak(
  p_profile_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_last_date DATE;
  v_current_streak INTEGER;
  v_today DATE := CURRENT_DATE;
  v_new_streak INTEGER;
BEGIN
  SELECT last_checkin_date, current_streak
  INTO v_last_date, v_current_streak
  FROM public.profiles
  WHERE id = p_profile_id;

  -- Already checked in today
  IF v_last_date = v_today THEN
    RETURN v_current_streak;
  END IF;

  -- Consecutive day
  IF v_last_date = v_today - INTERVAL '1 day' THEN
    v_new_streak := COALESCE(v_current_streak, 0) + 1;
  ELSE
    v_new_streak := 1;
  END IF;

  UPDATE public.profiles
  SET
    current_streak = v_new_streak,
    longest_streak = GREATEST(COALESCE(longest_streak, 0), v_new_streak),
    last_checkin_date = v_today
  WHERE id = p_profile_id;

  RETURN v_new_streak;
END;
$$;
