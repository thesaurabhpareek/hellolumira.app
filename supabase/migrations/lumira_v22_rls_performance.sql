-- =============================================================================
-- Lumira v22: RLS Performance — Wrap auth.uid() in (SELECT auth.uid())
-- =============================================================================
-- Postgres re-evaluates auth.uid() for EVERY ROW when used bare in a policy.
-- Wrapping it in (SELECT auth.uid()) makes it evaluate ONCE per query,
-- which is a major performance improvement at scale.
--
-- Pattern: replace USING (col = auth.uid()) with USING (col = (SELECT auth.uid()))
-- Affects 91 policies across all user-facing tables.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_profiles_select" ON public.profiles;
CREATE POLICY "p_profiles_select" ON public.profiles
  FOR SELECT USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "p_profiles_update" ON public.profiles;
CREATE POLICY "p_profiles_update" ON public.profiles
  FOR UPDATE USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "p_profiles_insert" ON public.profiles;
CREATE POLICY "p_profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- baby_profiles
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_baby_insert" ON public.baby_profiles;
CREATE POLICY "p_baby_insert" ON public.baby_profiles
  FOR INSERT WITH CHECK (created_by_profile_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- baby_profile_members
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_bpm_insert" ON public.baby_profile_members;
CREATE POLICY "p_bpm_insert" ON public.baby_profile_members
  FOR INSERT WITH CHECK (profile_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- chat_threads
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_chat_threads_select" ON public.chat_threads;
CREATE POLICY "p_chat_threads_select" ON public.chat_threads
  FOR SELECT USING (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "p_chat_threads_update" ON public.chat_threads;
CREATE POLICY "p_chat_threads_update" ON public.chat_threads
  FOR UPDATE USING (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "p_chat_threads_insert" ON public.chat_threads;
CREATE POLICY "p_chat_threads_insert" ON public.chat_threads
  FOR INSERT WITH CHECK (profile_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- chat_messages
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_chat_messages_select" ON public.chat_messages;
CREATE POLICY "p_chat_messages_select" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_threads
      WHERE chat_threads.id = chat_messages.thread_id
        AND chat_threads.profile_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "p_chat_messages_insert" ON public.chat_messages;
CREATE POLICY "p_chat_messages_insert" ON public.chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_threads
      WHERE chat_threads.id = chat_messages.thread_id
        AND chat_threads.profile_id = (SELECT auth.uid())
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- daily_checkins
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_checkin_insert" ON public.daily_checkins;
CREATE POLICY "p_checkin_insert" ON public.daily_checkins
  FOR INSERT WITH CHECK (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "p_checkin_update" ON public.daily_checkins;
CREATE POLICY "p_checkin_update" ON public.daily_checkins
  FOR UPDATE USING (is_baby_member(baby_id) AND profile_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- concern_sessions
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_concern_insert" ON public.concern_sessions;
CREATE POLICY "p_concern_insert" ON public.concern_sessions
  FOR INSERT WITH CHECK (profile_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- notifications
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_notifications_select" ON public.notifications;
CREATE POLICY "p_notifications_select" ON public.notifications
  FOR SELECT USING (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "p_notifications_update" ON public.notifications;
CREATE POLICY "p_notifications_update" ON public.notifications
  FOR UPDATE USING (profile_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- audit_log
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_audit_select" ON public.audit_log;
CREATE POLICY "p_audit_select" ON public.audit_log
  FOR SELECT USING (profile_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- consent_records
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_consent_select" ON public.consent_records;
CREATE POLICY "p_consent_select" ON public.consent_records
  FOR SELECT USING (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "p_consent_insert" ON public.consent_records;
CREATE POLICY "p_consent_insert" ON public.consent_records
  FOR INSERT WITH CHECK (profile_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- privacy_preferences
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_privacy_select" ON public.privacy_preferences;
CREATE POLICY "p_privacy_select" ON public.privacy_preferences
  FOR SELECT USING (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "p_privacy_update" ON public.privacy_preferences;
CREATE POLICY "p_privacy_update" ON public.privacy_preferences
  FOR UPDATE USING (profile_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- communication_preferences
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_comm_prefs_select" ON public.communication_preferences;
CREATE POLICY "p_comm_prefs_select" ON public.communication_preferences
  FOR SELECT USING (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "p_comm_prefs_update" ON public.communication_preferences;
CREATE POLICY "p_comm_prefs_update" ON public.communication_preferences
  FOR UPDATE USING (profile_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- communication_log
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_comm_log_select" ON public.communication_log;
CREATE POLICY "p_comm_log_select" ON public.communication_log
  FOR SELECT USING (profile_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- data_export_requests
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_export_select" ON public.data_export_requests;
CREATE POLICY "p_export_select" ON public.data_export_requests
  FOR SELECT USING (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "p_export_insert" ON public.data_export_requests;
CREATE POLICY "p_export_insert" ON public.data_export_requests
  FOR INSERT WITH CHECK (profile_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- data_deletion_requests
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_deletion_select" ON public.data_deletion_requests;
CREATE POLICY "p_deletion_select" ON public.data_deletion_requests
  FOR SELECT USING (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "p_deletion_insert" ON public.data_deletion_requests;
CREATE POLICY "p_deletion_insert" ON public.data_deletion_requests
  FOR INSERT WITH CHECK (profile_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- journal_entries
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_journal_select" ON public.journal_entries;
CREATE POLICY "p_journal_select" ON public.journal_entries
  FOR SELECT USING (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "p_journal_insert" ON public.journal_entries;
CREATE POLICY "p_journal_insert" ON public.journal_entries
  FOR INSERT WITH CHECK (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "p_journal_update" ON public.journal_entries;
CREATE POLICY "p_journal_update" ON public.journal_entries
  FOR UPDATE USING (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "p_journal_delete" ON public.journal_entries;
CREATE POLICY "p_journal_delete" ON public.journal_entries
  FOR DELETE USING (profile_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- milestones
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_milestone_insert" ON public.milestones;
CREATE POLICY "p_milestone_insert" ON public.milestones
  FOR INSERT WITH CHECK (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "p_milestone_delete" ON public.milestones;
CREATE POLICY "p_milestone_delete" ON public.milestones
  FOR DELETE USING (is_baby_member(baby_id) AND profile_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- partner_invites
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_invites_insert" ON public.partner_invites;
CREATE POLICY "p_invites_insert" ON public.partner_invites
  FOR INSERT WITH CHECK (inviter_profile_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- parent_profile_extended
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_profile_ext_select" ON public.parent_profile_extended;
CREATE POLICY "p_profile_ext_select" ON public.parent_profile_extended
  FOR SELECT USING (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "p_profile_ext_update" ON public.parent_profile_extended;
CREATE POLICY "p_profile_ext_update" ON public.parent_profile_extended
  FOR UPDATE USING (profile_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- pregnancy_appointments
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_appts_insert" ON public.pregnancy_appointments;
CREATE POLICY "p_appts_insert" ON public.pregnancy_appointments
  FOR INSERT WITH CHECK (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "p_appts_update" ON public.pregnancy_appointments;
CREATE POLICY "p_appts_update" ON public.pregnancy_appointments
  FOR UPDATE USING (is_baby_member(baby_id) AND profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "p_appts_delete" ON public.pregnancy_appointments;
CREATE POLICY "p_appts_delete" ON public.pregnancy_appointments
  FOR DELETE USING (is_baby_member(baby_id) AND profile_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- quick_logs
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_quick_logs_select" ON public.quick_logs;
CREATE POLICY "p_quick_logs_select" ON public.quick_logs
  FOR SELECT USING (
    (profile_id = (SELECT auth.uid()))
    OR EXISTS (
      SELECT 1 FROM public.baby_profile_members
      WHERE baby_profile_members.baby_id = quick_logs.baby_id
        AND baby_profile_members.profile_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "p_quick_logs_insert" ON public.quick_logs;
CREATE POLICY "p_quick_logs_insert" ON public.quick_logs
  FOR INSERT WITH CHECK (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "p_quick_logs_update" ON public.quick_logs;
CREATE POLICY "p_quick_logs_update" ON public.quick_logs
  FOR UPDATE USING (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "p_quick_logs_delete" ON public.quick_logs;
CREATE POLICY "p_quick_logs_delete" ON public.quick_logs
  FOR DELETE USING (profile_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- offline_sync_queue
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_sync_select" ON public.offline_sync_queue;
CREATE POLICY "p_sync_select" ON public.offline_sync_queue
  FOR SELECT USING (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "p_sync_insert" ON public.offline_sync_queue;
CREATE POLICY "p_sync_insert" ON public.offline_sync_queue
  FOR INSERT WITH CHECK (profile_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- feedback
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_feedback_select" ON public.feedback;
CREATE POLICY "p_feedback_select" ON public.feedback
  FOR SELECT USING (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "p_feedback_insert" ON public.feedback;
CREATE POLICY "p_feedback_insert" ON public.feedback
  FOR INSERT WITH CHECK (profile_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- help_questions
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_help_q_select" ON public.help_questions;
CREATE POLICY "p_help_q_select" ON public.help_questions
  FOR SELECT USING (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "p_help_q_insert" ON public.help_questions;
CREATE POLICY "p_help_q_insert" ON public.help_questions
  FOR INSERT WITH CHECK (profile_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- referrals
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_referrals_select" ON public.referrals;
CREATE POLICY "p_referrals_select" ON public.referrals
  FOR SELECT USING (referrer_profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "p_referrals_insert" ON public.referrals;
CREATE POLICY "p_referrals_insert" ON public.referrals
  FOR INSERT WITH CHECK (referrer_profile_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- analytics_events
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_analytics_select" ON public.analytics_events;
CREATE POLICY "p_analytics_select" ON public.analytics_events
  FOR SELECT USING (profile_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- content_articles
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_content_select" ON public.content_articles;
CREATE POLICY "p_content_select" ON public.content_articles
  FOR SELECT USING (is_published = true AND (SELECT auth.uid()) IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- content_article_interactions
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_content_interactions_select" ON public.content_article_interactions;
CREATE POLICY "p_content_interactions_select" ON public.content_article_interactions
  FOR SELECT USING (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "p_content_interactions_insert" ON public.content_article_interactions;
CREATE POLICY "p_content_interactions_insert" ON public.content_article_interactions
  FOR INSERT WITH CHECK (profile_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- content_quizzes
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_content_quizzes_select" ON public.content_quizzes;
CREATE POLICY "p_content_quizzes_select" ON public.content_quizzes
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- app_versions
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_versions_select" ON public.app_versions;
CREATE POLICY "p_versions_select" ON public.app_versions
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- feature_flags
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_flags_select" ON public.feature_flags;
CREATE POLICY "p_flags_select" ON public.feature_flags
  FOR SELECT USING (is_enabled = true AND (SELECT auth.uid()) IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- chat_suggested_prompts
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_chat_prompts_select" ON public.chat_suggested_prompts;
CREATE POLICY "p_chat_prompts_select" ON public.chat_suggested_prompts
  FOR SELECT USING (is_active = true AND (SELECT auth.uid()) IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- earned_badges
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view their own badges" ON public.earned_badges;
CREATE POLICY "Users can view their own badges" ON public.earned_badges
  FOR SELECT USING ((SELECT auth.uid()) = profile_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- seed_transactions
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view their own seed transactions" ON public.seed_transactions;
CREATE POLICY "Users can view their own seed transactions" ON public.seed_transactions
  FOR SELECT USING ((SELECT auth.uid()) = profile_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- share_tracking
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view their own share tracking" ON public.share_tracking;
CREATE POLICY "Users can view their own share tracking" ON public.share_tracking
  FOR SELECT USING ((SELECT auth.uid()) = referrer_profile_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- user_badges
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_user_badges_select" ON public.user_badges;
CREATE POLICY "p_user_badges_select" ON public.user_badges
  FOR SELECT USING (profile_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- tribe_posts
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_tribe_posts_select" ON public.tribe_posts;
CREATE POLICY "p_tribe_posts_select" ON public.tribe_posts
  FOR SELECT USING (
    (SELECT auth.uid()) IS NOT NULL
    AND is_deleted = false
    AND (is_hidden = false OR profile_id = (SELECT auth.uid()))
  );

DROP POLICY IF EXISTS "p_tribe_posts_insert" ON public.tribe_posts;
CREATE POLICY "p_tribe_posts_insert" ON public.tribe_posts
  FOR INSERT WITH CHECK (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "p_tribe_posts_update" ON public.tribe_posts;
CREATE POLICY "p_tribe_posts_update" ON public.tribe_posts
  FOR UPDATE USING (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "p_tribe_posts_delete" ON public.tribe_posts;
CREATE POLICY "p_tribe_posts_delete" ON public.tribe_posts
  FOR DELETE USING (profile_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- tribes
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_tribes_select" ON public.tribes;
CREATE POLICY "p_tribes_select" ON public.tribes
  FOR SELECT USING (is_active = true AND (SELECT auth.uid()) IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- tribe_members
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "tribe_members_insert_own" ON public.tribe_members;
CREATE POLICY "tribe_members_insert_own" ON public.tribe_members
  FOR INSERT WITH CHECK (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "tribe_members_delete_own" ON public.tribe_members;
CREATE POLICY "tribe_members_delete_own" ON public.tribe_members
  FOR DELETE USING ((SELECT auth.uid()) = profile_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- tribe_memberships
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_tribe_mem_select" ON public.tribe_memberships;
CREATE POLICY "p_tribe_mem_select" ON public.tribe_memberships
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "p_tribe_mem_insert" ON public.tribe_memberships;
CREATE POLICY "p_tribe_mem_insert" ON public.tribe_memberships
  FOR INSERT WITH CHECK (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "p_tribe_mem_delete" ON public.tribe_memberships;
CREATE POLICY "p_tribe_mem_delete" ON public.tribe_memberships
  FOR DELETE USING (profile_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- tribe_comments
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "tribe_comments_insert_own" ON public.tribe_comments;
CREATE POLICY "tribe_comments_insert_own" ON public.tribe_comments
  FOR INSERT WITH CHECK (profile_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- tribe_reactions
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "tribe_reactions_insert_own" ON public.tribe_reactions;
CREATE POLICY "tribe_reactions_insert_own" ON public.tribe_reactions
  FOR INSERT WITH CHECK (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "tribe_reactions_delete_own" ON public.tribe_reactions;
CREATE POLICY "tribe_reactions_delete_own" ON public.tribe_reactions
  FOR DELETE USING ((SELECT auth.uid()) = profile_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- tribe_post_reactions
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_reactions_select" ON public.tribe_post_reactions;
CREATE POLICY "p_reactions_select" ON public.tribe_post_reactions
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "p_reactions_insert" ON public.tribe_post_reactions;
CREATE POLICY "p_reactions_insert" ON public.tribe_post_reactions
  FOR INSERT WITH CHECK (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "p_reactions_delete" ON public.tribe_post_reactions;
CREATE POLICY "p_reactions_delete" ON public.tribe_post_reactions
  FOR DELETE USING (profile_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- tribe_post_reports
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_reports_insert" ON public.tribe_post_reports;
CREATE POLICY "p_reports_insert" ON public.tribe_post_reports
  FOR INSERT WITH CHECK (profile_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- vaccinations
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_vaccinations_select" ON public.vaccinations;
CREATE POLICY "p_vaccinations_select" ON public.vaccinations
  FOR SELECT USING (
    (profile_id = (SELECT auth.uid()))
    OR EXISTS (
      SELECT 1 FROM public.baby_profile_members
      WHERE baby_profile_members.baby_id = vaccinations.baby_id
        AND baby_profile_members.profile_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "p_vaccinations_insert" ON public.vaccinations;
CREATE POLICY "p_vaccinations_insert" ON public.vaccinations
  FOR INSERT WITH CHECK (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "p_vaccinations_update" ON public.vaccinations;
CREATE POLICY "p_vaccinations_update" ON public.vaccinations
  FOR UPDATE USING (profile_id = (SELECT auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- appointments
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "p_appointments_select" ON public.appointments;
CREATE POLICY "p_appointments_select" ON public.appointments
  FOR SELECT USING (
    (profile_id = (SELECT auth.uid()))
    OR EXISTS (
      SELECT 1 FROM public.baby_profile_members
      WHERE baby_profile_members.baby_id = appointments.baby_id
        AND baby_profile_members.profile_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "p_appointments_insert" ON public.appointments;
CREATE POLICY "p_appointments_insert" ON public.appointments
  FOR INSERT WITH CHECK (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "p_appointments_update" ON public.appointments;
CREATE POLICY "p_appointments_update" ON public.appointments
  FOR UPDATE USING (profile_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "p_appointments_delete" ON public.appointments;
CREATE POLICY "p_appointments_delete" ON public.appointments
  FOR DELETE USING (profile_id = (SELECT auth.uid()));
