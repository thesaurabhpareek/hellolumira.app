-- =============================================================================
-- Lumira v47: Seeds Economy v2
-- Adds metadata column, fixes seed amounts documented in docs/SEEDS-PRD.md,
-- and adds missing profile columns used by seeds logic.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Add metadata column to seed_transactions (optional enrichment, nullable)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.seed_transactions
  ADD COLUMN IF NOT EXISTS metadata JSONB;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Add profile_completion_seeds_awarded flag (used by profile update route
--    to track whether the one-time complete_profile bonus has been awarded)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS profile_completion_seeds_awarded BOOLEAN NOT NULL DEFAULT FALSE;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Ensure seeds_balance cannot go negative
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD CONSTRAINT IF NOT EXISTS chk_seeds_balance_non_negative
  CHECK (seeds_balance >= 0);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Index for looking up today's transactions quickly (used by award dedup)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_seed_transactions_today
  ON public.seed_transactions (profile_id, reference_date);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Comment documenting canonical reason values (informational)
-- ─────────────────────────────────────────────────────────────────────────────

COMMENT ON TABLE public.seed_transactions IS
  'Ledger of all seed awards. Unique index on (profile_id, reason, reference_date) '
  'prevents duplicate awards. One-time reasons use reference_date = 2000-01-01. '
  'Canonical reason keys: daily_checkin(5), log_concern(10), read_article(3), '
  'complete_quiz(10), post_in_tribe(10), comment_in_tribe(5), react_to_story(2), '
  'reply_to_story(5), journal_entry(3), streak_7_days(25), streak_30_days(100), '
  'first_checkin(25), complete_profile(50), invite_partner(20), first_share(5), '
  'profile_field_completion(5).';
