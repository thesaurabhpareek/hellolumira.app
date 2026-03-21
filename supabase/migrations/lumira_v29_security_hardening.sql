-- =============================================================================
-- Migration: v29 — Security Hardening
-- Date: 2026-03-20
-- Description:
--   1. Tighten partner_invites SELECT policy (was allowing any authenticated
--      user to read all pending invites)
--   2. Remove blocked_words SELECT policy (moderation handled by service role)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. partner_invites: restrict SELECT to inviter OR matching invitee email
-- ---------------------------------------------------------------------------
-- Previously: any authenticated user could read ALL non-accepted invites.
-- Now: only the inviter OR the actual invitee (matched by email) can see rows.

DROP POLICY IF EXISTS "p_invites_select" ON public.partner_invites;

CREATE POLICY "p_invites_select" ON public.partner_invites
  FOR SELECT USING (
    -- The person who sent the invite can always see it
    inviter_profile_id = (SELECT auth.uid())
    OR
    -- The invitee can see their own invite (matched by their auth email)
    (NOT accepted AND invite_email = (SELECT auth.jwt() ->> 'email'))
  );

-- ---------------------------------------------------------------------------
-- 2. blocked_words: remove user-facing SELECT policy
-- ---------------------------------------------------------------------------
-- Previously: any authenticated user could read the entire blocked words list.
-- This exposed the moderation dictionary, allowing evasion.
-- Service role client (used by moderation logic) bypasses RLS automatically.

DROP POLICY IF EXISTS "p_blocked_words_select" ON public.blocked_words;

-- No replacement policy needed — service role bypasses RLS for all operations.
-- If client-side pre-validation is ever needed, use a hash-based approach instead.

-- ---------------------------------------------------------------------------
-- 3. Distributed rate limiting table + RPC
-- ---------------------------------------------------------------------------
-- Replaces in-memory-only rate limiting with a DB-backed approach that works
-- across all Vercel serverless instances.

CREATE TABLE IF NOT EXISTS rate_limit_entries (
  key TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  count INT NOT NULL DEFAULT 1,
  PRIMARY KEY (key, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_window ON rate_limit_entries (window_start);

CREATE OR REPLACE FUNCTION check_rate_limit_distributed(
  p_key TEXT,
  p_limit INT DEFAULT 20,
  p_window_seconds INT DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_count INT;
BEGIN
  v_window_start := date_trunc('second', now()) - (EXTRACT(EPOCH FROM now())::INT % p_window_seconds) * INTERVAL '1 second';

  INSERT INTO rate_limit_entries (key, window_start, count)
  VALUES (p_key, v_window_start, 1)
  ON CONFLICT (key, window_start)
  DO UPDATE SET count = rate_limit_entries.count + 1
  RETURNING count INTO v_count;

  -- Clean up old entries
  DELETE FROM rate_limit_entries
  WHERE window_start < now() - (p_window_seconds * 2) * INTERVAL '1 second';

  RETURN v_count <= p_limit;
END;
$$;
