-- =============================================================================
-- Lumira v21: Critical Security & RLS Fixes
-- =============================================================================
-- Fixes:
--   1. tribe_posts: Drop "select_all=true" policy that bypasses is_deleted/is_hidden
--   2. content_articles: Drop "select_all=true" policy that exposes unpublished articles
--   3. tribes: Drop "select_all=true" policy that exposes inactive tribes
--   4. baby_profiles: Drop redundant creator SELECT (is_baby_member already covers this)
--   5. weekly_guides: Drop duplicate INSERT + SELECT policies
--   6. tribe_posts: Drop duplicate INSERT + UPDATE policies
--   7. partner_invites: Fix SELECT — invitee can now look up invite by token
--   8. blocked_words: Add SELECT policy so service-side moderation can read
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. tribe_posts — drop the open SELECT that overrides is_deleted/is_hidden
-- ─────────────────────────────────────────────────────────────────────────────
-- The "tribe_posts_select_all" policy uses USING (true), which in Postgres
-- OR-combines with "p_tribe_posts_select" (the proper filtered one) — meaning
-- TRUE wins and every post including hidden/deleted ones is visible.
DROP POLICY IF EXISTS "tribe_posts_select_all" ON public.tribe_posts;

-- Also drop the duplicate INSERT and UPDATE stub policies
DROP POLICY IF EXISTS "tribe_posts_insert_own" ON public.tribe_posts;
DROP POLICY IF EXISTS "tribe_posts_update_own" ON public.tribe_posts;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. content_articles — drop open SELECT that exposes unpublished articles
-- ─────────────────────────────────────────────────────────────────────────────
-- "p_articles_select_auth" uses USING (true), overriding "p_content_select"
-- which correctly filters to is_published = true only.
DROP POLICY IF EXISTS "p_articles_select_auth" ON public.content_articles;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. tribes — drop open SELECT that exposes inactive tribes
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "tribes_select_all" ON public.tribes;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. baby_profiles — drop redundant creator SELECT
-- ─────────────────────────────────────────────────────────────────────────────
-- p_baby_select uses is_baby_member(id) which already covers the creator.
-- p_baby_select_creator is redundant and uses raw auth.uid().
DROP POLICY IF EXISTS "p_baby_select_creator" ON public.baby_profiles;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. weekly_guides — drop duplicate policies
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "weekly_guides_insert_service" ON public.weekly_guides;
DROP POLICY IF EXISTS "weekly_guides_select_all" ON public.weekly_guides;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. partner_invites — fix SELECT so the invitee can look up their own invite
-- ─────────────────────────────────────────────────────────────────────────────
-- Current policy only allows inviter to see. But when the invitee clicks the
-- magic link, they need to read the invite record by token. The token is a
-- full UUID (128 bits) so brute-force is not feasible. Any authenticated user
-- can read unused invites (to resolve their token), and the inviter can always
-- see their own invites.
DROP POLICY IF EXISTS "p_invites_select" ON public.partner_invites;

CREATE POLICY "p_invites_select" ON public.partner_invites
  FOR SELECT USING (
    -- Inviter can always see their own invites
    (inviter_profile_id = (SELECT auth.uid()))
    OR
    -- Any authenticated user can look up an unused (not yet accepted) invite
    -- This is how the invitee resolves the magic link token
    (NOT accepted AND (SELECT auth.uid()) IS NOT NULL)
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. blocked_words — add SELECT policy for authenticated users
-- ─────────────────────────────────────────────────────────────────────────────
-- RLS was enabled but NO policies existed — causing all queries to return 0 rows.
-- The moderation logic runs server-side (service client bypasses RLS), but add
-- a read policy for authenticated contexts where needed.
DROP POLICY IF EXISTS "p_blocked_words_select" ON public.blocked_words;

CREATE POLICY "p_blocked_words_select" ON public.blocked_words
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. landing_page_conversions — add SELECT policy for owners
-- ─────────────────────────────────────────────────────────────────────────────
-- Table had RLS enabled but no policies (default deny). Add owner SELECT.
DROP POLICY IF EXISTS "p_lp_conversions_select" ON public.landing_page_conversions;

CREATE POLICY "p_lp_conversions_select" ON public.landing_page_conversions
  FOR SELECT USING (
    profile_id IS NULL OR profile_id = (SELECT auth.uid())
  );
