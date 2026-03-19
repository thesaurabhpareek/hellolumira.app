-- ============================================================================
-- Migration: v14 — Fix baby_profiles RLS for onboarding INSERT...RETURNING
-- ============================================================================
-- Root cause: The onboarding flow does:
--   .from('baby_profiles').insert(data).select().single()
--
-- PostgREST evaluates BOTH the INSERT policy AND the SELECT policy when
-- .select() is chained after .insert(). The existing SELECT policy uses
-- is_baby_member(id), which checks baby_profile_members. But the member
-- row is inserted AFTER baby_profiles, so is_baby_member() returns false
-- for the newly created row, causing a 403.
--
-- Fix: Add a second PERMISSIVE SELECT policy allowing the creator to read
-- their own baby profiles. PERMISSIVE policies are ORed, so either
-- is_baby_member(id) OR created_by_profile_id = auth.uid() will pass.
-- ============================================================================

CREATE POLICY p_baby_select_creator ON baby_profiles
  FOR SELECT
  USING (created_by_profile_id = auth.uid());
