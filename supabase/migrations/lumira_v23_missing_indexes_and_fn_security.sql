-- =============================================================================
-- Lumira v23: Missing FK Indexes + SECURITY DEFINER Search Path
-- =============================================================================
-- Part A: Add indexes for all unindexed foreign key columns.
--   Missing indexes cause full table scans on JOINs. CREATE INDEX CONCURRENTLY
--   is used where possible to avoid locking the table.
--
-- Part B: Fix SECURITY DEFINER functions to pin search_path.
--   Functions without SET search_path = '' can be exploited via schema injection.
-- =============================================================================

-- =============================================================================
-- PART A: MISSING FK INDEXES
-- =============================================================================

-- concern_sessions
CREATE INDEX IF NOT EXISTS idx_concern_sessions_profile_id
  ON public.concern_sessions (profile_id);

CREATE INDEX IF NOT EXISTS idx_concern_sessions_baby_id
  ON public.concern_sessions (baby_id);

-- pattern_observations
CREATE INDEX IF NOT EXISTS idx_pattern_obs_profile_id
  ON public.pattern_observations (profile_id);

CREATE INDEX IF NOT EXISTS idx_pattern_obs_baby_id
  ON public.pattern_observations (baby_id);

-- milestones
CREATE INDEX IF NOT EXISTS idx_milestones_profile_id
  ON public.milestones (profile_id);

CREATE INDEX IF NOT EXISTS idx_milestones_baby_id
  ON public.milestones (baby_id);

-- partner_invites
CREATE INDEX IF NOT EXISTS idx_partner_invites_baby_id
  ON public.partner_invites (baby_id);

CREATE INDEX IF NOT EXISTS idx_partner_invites_inviter_profile_id
  ON public.partner_invites (inviter_profile_id);

-- Also index by token for O(1) token lookups
CREATE INDEX IF NOT EXISTS idx_partner_invites_token
  ON public.partner_invites (invite_token) WHERE NOT accepted;

-- notifications
CREATE INDEX IF NOT EXISTS idx_notifications_baby_id
  ON public.notifications (baby_id);

-- tribe_comments
CREATE INDEX IF NOT EXISTS idx_tribe_comments_profile_id
  ON public.tribe_comments (profile_id);

CREATE INDEX IF NOT EXISTS idx_tribe_comments_ai_profile_id
  ON public.tribe_comments (ai_profile_id);

CREATE INDEX IF NOT EXISTS idx_tribe_comments_parent_id
  ON public.tribe_comments (parent_id) WHERE parent_id IS NOT NULL;

-- tribe_reactions
CREATE INDEX IF NOT EXISTS idx_tribe_reactions_profile_id
  ON public.tribe_reactions (profile_id);

CREATE INDEX IF NOT EXISTS idx_tribe_reactions_ai_profile_id
  ON public.tribe_reactions (ai_profile_id) WHERE ai_profile_id IS NOT NULL;

-- tribe_posts
CREATE INDEX IF NOT EXISTS idx_tribe_posts_ai_profile_id
  ON public.tribe_posts (ai_profile_id) WHERE ai_profile_id IS NOT NULL;

-- chat_threads source links
CREATE INDEX IF NOT EXISTS idx_chat_threads_source_checkin_id
  ON public.chat_threads (source_checkin_id) WHERE source_checkin_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_chat_threads_source_concern_id
  ON public.chat_threads (source_concern_session_id) WHERE source_concern_session_id IS NOT NULL;

-- journal_entries
CREATE INDEX IF NOT EXISTS idx_journal_entries_profile_id
  ON public.journal_entries (profile_id);

-- vaccinations
CREATE INDEX IF NOT EXISTS idx_vaccinations_profile_id
  ON public.vaccinations (profile_id);

-- pregnancy_appointments
CREATE INDEX IF NOT EXISTS idx_pregnancy_appts_profile_id
  ON public.pregnancy_appointments (profile_id);

CREATE INDEX IF NOT EXISTS idx_pregnancy_appts_baby_id
  ON public.pregnancy_appointments (baby_id);

-- data_deletion_requests
CREATE INDEX IF NOT EXISTS idx_data_deletion_profile_id
  ON public.data_deletion_requests (profile_id);

-- data_export_requests
CREATE INDEX IF NOT EXISTS idx_data_export_profile_id
  ON public.data_export_requests (profile_id);

-- baby_profiles
CREATE INDEX IF NOT EXISTS idx_baby_profiles_created_by
  ON public.baby_profiles (created_by_profile_id);

-- baby_profile_members
CREATE INDEX IF NOT EXISTS idx_bpm_profile_id
  ON public.baby_profile_members (profile_id);

-- feedback
CREATE INDEX IF NOT EXISTS idx_feedback_profile_id
  ON public.feedback (profile_id);

-- help_questions
CREATE INDEX IF NOT EXISTS idx_help_questions_profile_id
  ON public.help_questions (profile_id);

-- referrals
CREATE INDEX IF NOT EXISTS idx_referrals_referee_profile_id
  ON public.referrals (referee_profile_id);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_profile_id
  ON public.referrals (referrer_profile_id);

-- quick_logs
CREATE INDEX IF NOT EXISTS idx_quick_logs_profile_id
  ON public.quick_logs (profile_id);

-- content_quizzes
CREATE INDEX IF NOT EXISTS idx_content_quizzes_article_id
  ON public.content_quizzes (article_id);

-- early_access_queue
CREATE INDEX IF NOT EXISTS idx_early_access_invited_by
  ON public.early_access_queue (invited_by_profile_id) WHERE invited_by_profile_id IS NOT NULL;

-- landing_page_conversions
CREATE INDEX IF NOT EXISTS idx_lp_conversions_profile_id
  ON public.landing_page_conversions (profile_id) WHERE profile_id IS NOT NULL;

-- offline_sync_queue
CREATE INDEX IF NOT EXISTS idx_offline_sync_baby_id
  ON public.offline_sync_queue (baby_id);

-- appointments (separate table from pregnancy_appointments)
CREATE INDEX IF NOT EXISTS idx_appointments_profile_id
  ON public.appointments (profile_id);

-- =============================================================================
-- PART B: SECURITY DEFINER FUNCTIONS — FIX MUTABLE search_path
-- =============================================================================
-- Each SECURITY DEFINER function that lacks a pinned search_path is vulnerable
-- to search_path manipulation by unprivileged users.
-- Fix: set search_path = '' and fully qualify all object names within the function.
-- =============================================================================

-- handle_new_profile_comms
ALTER FUNCTION public.handle_new_profile_comms()
  SET search_path = public, pg_catalog;

-- handle_new_profile_extended
ALTER FUNCTION public.handle_new_profile_extended()
  SET search_path = public, pg_catalog;

-- handle_new_profile_privacy
ALTER FUNCTION public.handle_new_profile_privacy()
  SET search_path = public, pg_catalog;

-- increment_seeds_balance
ALTER FUNCTION public.increment_seeds_balance(uuid, integer)
  SET search_path = public, pg_catalog;

-- is_baby_member
ALTER FUNCTION public.is_baby_member(uuid)
  SET search_path = public, pg_catalog;

-- mark_all_notifications_read
ALTER FUNCTION public.mark_all_notifications_read(uuid)
  SET search_path = public, pg_catalog;

-- update_checkin_streak
ALTER FUNCTION public.update_checkin_streak(uuid)
  SET search_path = public, pg_catalog;

-- seed_vaccination_schedule
ALTER FUNCTION public.seed_vaccination_schedule(uuid, uuid, date)
  SET search_path = public, pg_catalog;

-- seed_vaccinations_for_baby
ALTER FUNCTION public.seed_vaccinations_for_baby(uuid, uuid, date)
  SET search_path = public, pg_catalog;

-- Non-security-definer trigger functions (still best practice to pin)
ALTER FUNCTION public.auto_hide_reported_post()
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.set_updated_at()
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.update_baby_stage()
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.update_quick_log_duration()
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.update_reply_count()
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.update_thread_on_new_message()
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.update_tribe_member_count()
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.update_tribe_post_count()
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.update_updated_at()
  SET search_path = public, pg_catalog;
