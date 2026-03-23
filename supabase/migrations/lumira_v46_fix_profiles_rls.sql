-- ============================================================
-- Lumira v46: Fix profiles RLS — allow all authenticated users to read profiles
-- Root cause: p_profiles_select restricted to own row only, breaking
-- profile joins in stories strip, tribes, and anywhere cross-user
-- profile data was needed. On a social app display_name/avatar are public.
-- ============================================================

DROP POLICY IF EXISTS p_profiles_select ON profiles;

CREATE POLICY p_profiles_select ON profiles
  FOR SELECT
  USING (auth.uid() IS NOT NULL);
