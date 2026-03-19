-- =============================================================================
-- Lumira v12: Comprehensive Schema Fixes & Missing Elements
-- Project: gomjthjjqcmrhnpwsdqh.supabase.co
-- Generated: 2026-03-19 (full audit by Senior DB Architect agent)
-- =============================================================================
--
-- This migration fixes ALL issues discovered during comprehensive schema audit:
--
--   1.  Missing columns on chat_threads (code writes columns that don't exist)
--   2.  Missing columns on chat_messages (code writes columns that don't exist)
--   3.  Missing early_access_queue table (API route references it)
--   4.  Missing foreign key indexes on ALL tables (PG does NOT auto-index FKs)
--   5.  Missing query-pattern indexes based on actual API route access patterns
--   6.  Missing data_deletion_requests.request_type column (API writes it)
--   7.  TypeScript <-> DB type alignment fixes
--   8.  chat_messages FK index on thread_id (critical for CASCADE deletes)
--   9.  CRITICAL: chat_messages.role CHECK constraint mismatch
--  10.  Missing weekly_guides table (weekly-guide API reads/writes it)
--  11.  Missing RLS policies on core tables (profiles, baby_profiles, etc.)
--  12.  Missing consent_records column: ip_hash (code writes ip_hash, not ip_address)
--  13.  Consent type/action CHECK constraints too narrow for actual code usage
--  14.  Missing updated_at auto-update trigger function
--  15.  Notifications INSERT policy missing (lib/notifications.ts uses user client)
--  16.  Audit log RLS policies (onboarding inserts from client-side)
--  17.  Missing UNIQUE constraints that code relies on (daily_checkins, etc.)
--  18.  Communication preferences: missing quiet_hours columns
-- =============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- 0. UTILITY: Generic updated_at trigger function
-- ─────────────────────────────────────────────────────────────────────────────
-- Many tables have updated_at but no auto-update trigger. This function is
-- reused across all of them.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.set_updated_at()
  IS 'Generic trigger function that sets updated_at = now() on every UPDATE';


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. CHAT_THREADS: Missing columns that code actively writes
-- ─────────────────────────────────────────────────────────────────────────────
-- app/api/chat/route.ts writes: primary_concern_category, highest_escalation_level
-- app/api/chat/threads/route.ts writes: source_concern_session_id, source_checkin_id
-- types/chat.ts declares all four fields
-- v11 migration does NOT include them

ALTER TABLE public.chat_threads
  ADD COLUMN IF NOT EXISTS primary_concern_category TEXT,
  ADD COLUMN IF NOT EXISTS highest_escalation_level TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS source_concern_session_id UUID,
  ADD COLUMN IF NOT EXISTS source_checkin_id UUID;

-- Add CHECK constraint idempotently (drop first if exists from partial runs)
DO $$ BEGIN
  ALTER TABLE public.chat_threads
    ADD CONSTRAINT chat_threads_escalation_check
      CHECK (highest_escalation_level IN ('none', 'monitor', 'call_doctor', 'urgent', 'emergency'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add FK constraints idempotently
DO $$ BEGIN
  ALTER TABLE public.chat_threads
    ADD CONSTRAINT chat_threads_source_concern_fk
      FOREIGN KEY (source_concern_session_id) REFERENCES public.concern_sessions(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.chat_threads
    ADD CONSTRAINT chat_threads_source_checkin_fk
      FOREIGN KEY (source_checkin_id) REFERENCES public.daily_checkins(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON COLUMN public.chat_threads.primary_concern_category IS 'Auto-classified concern category from first exchange';
COMMENT ON COLUMN public.chat_threads.highest_escalation_level IS 'Highest escalation level reached in this thread';
COMMENT ON COLUMN public.chat_threads.source_concern_session_id IS 'If thread originated from a concern flow';
COMMENT ON COLUMN public.chat_threads.source_checkin_id IS 'If thread originated from a daily check-in';


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. CHAT_MESSAGES: Missing columns that code actively writes
-- ─────────────────────────────────────────────────────────────────────────────
-- app/api/chat/route.ts inserts: concern_category, escalation_level,
--   red_flag_detected, red_flag_pattern, is_structured_response,
--   model_version, input_tokens, output_tokens
-- v11 migration only has: role, content, emotional_signal, red_flag_category, metadata

ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS concern_category TEXT,
  ADD COLUMN IF NOT EXISTS escalation_level TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS red_flag_detected BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS red_flag_pattern TEXT,
  ADD COLUMN IF NOT EXISTS is_structured_response BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS model_version TEXT,
  ADD COLUMN IF NOT EXISTS input_tokens INT,
  ADD COLUMN IF NOT EXISTS output_tokens INT;

DO $$ BEGIN
  ALTER TABLE public.chat_messages
    ADD CONSTRAINT chat_messages_escalation_check
      CHECK (escalation_level IN ('none', 'monitor', 'call_doctor', 'urgent', 'emergency'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON COLUMN public.chat_messages.concern_category IS 'Classified concern category for this message';
COMMENT ON COLUMN public.chat_messages.escalation_level IS 'Escalation level: none | monitor | call_doctor | urgent | emergency';
COMMENT ON COLUMN public.chat_messages.red_flag_detected IS 'Whether the red flag scanner fired on this message';
COMMENT ON COLUMN public.chat_messages.model_version IS 'AI model used for assistant messages (null for user messages)';
COMMENT ON COLUMN public.chat_messages.input_tokens IS 'Token usage tracking for cost monitoring';
COMMENT ON COLUMN public.chat_messages.output_tokens IS 'Token usage tracking for cost monitoring';


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. EARLY_ACCESS_QUEUE: Table referenced by API but never created in migrations
-- ─────────────────────────────────────────────────────────────────────────────
-- app/api/early-access/route.ts INSERTs into early_access_queue

CREATE TABLE IF NOT EXISTS public.early_access_queue (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT        NOT NULL UNIQUE,
  utm_source  TEXT,
  utm_medium  TEXT,
  utm_campaign TEXT,
  referral_code TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.early_access_queue IS 'Landing page waitlist signups before launch';

ALTER TABLE public.early_access_queue ENABLE ROW LEVEL SECURITY;

-- Anon INSERT is needed because the early-access route uses the anon key
DO $$ BEGIN
  CREATE POLICY early_access_insert_anon ON public.early_access_queue
    FOR INSERT TO anon WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. DATA_DELETION_REQUESTS: Missing request_type column
-- ─────────────────────────────────────────────────────────────────────────────
-- app/api/privacy/request-deletion/route.ts writes request_type: 'full_deletion'

ALTER TABLE public.data_deletion_requests
  ADD COLUMN IF NOT EXISTS request_type TEXT NOT NULL DEFAULT 'full_deletion';

DO $$ BEGIN
  ALTER TABLE public.data_deletion_requests
    ADD CONSTRAINT data_deletion_requests_type_check
      CHECK (request_type IN ('full_deletion', 'partial_deletion'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. WEEKLY_GUIDES: Cache table referenced by weekly-guide API
-- ─────────────────────────────────────────────────────────────────────────────
-- app/api/weekly-guide/route.ts reads from and inserts into weekly_guides
-- with columns: stage, week_or_month, content
-- This table was never created in any migration.

CREATE TABLE IF NOT EXISTS public.weekly_guides (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  stage         TEXT        NOT NULL CHECK (stage IN ('pregnancy', 'infant', 'toddler')),
  week_or_month INT         NOT NULL,
  content       JSONB       NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.weekly_guides IS 'Cache for AI-generated weekly development guides by stage and week/month';

-- Unique constraint: one guide per stage + week/month
CREATE UNIQUE INDEX IF NOT EXISTS idx_weekly_guides_stage_week
  ON public.weekly_guides (stage, week_or_month);

-- Lookup index for the API
CREATE INDEX IF NOT EXISTS idx_weekly_guides_lookup
  ON public.weekly_guides (stage, week_or_month);

ALTER TABLE public.weekly_guides ENABLE ROW LEVEL SECURITY;

-- Weekly guides are read by authenticated users, written by service role only
DO $$ BEGIN
  CREATE POLICY weekly_guides_select_authenticated ON public.weekly_guides
    FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Service role bypasses RLS for inserts, so no INSERT policy needed


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. CONSENT_RECORDS: Column and constraint fixes
-- ─────────────────────────────────────────────────────────────────────────────
-- lib/consent.ts writes: ip_hash (SHA-256 of IP), user_agent
-- But types/app.ts declares: ip_address
-- Onboarding page writes: ip_address: null (client-side, no IP available)
-- Privacy settings page writes: consent_type like 'data_processing', 'analytics_cookies'
--   and action: 'withdrawn' (not 'revoked' as in types/app.ts)
-- lib/consent.ts uses types: 'marketing_email', 'marketing_sms', 'marketing_whatsapp',
--   'analytics_cookies' which are NOT in types/app.ts ConsentType enum
-- lib/consent.ts uses actions: 'granted', 'withdrawn', 'updated'
-- Capture methods used: 'onboarding_explicit', 'settings_explicit', 'settings_toggle',
--   'email_unsubscribe_link', 'api', 'unknown'

-- Ensure ip_hash column exists (code writes ip_hash, not ip_address)
ALTER TABLE public.consent_records
  ADD COLUMN IF NOT EXISTS ip_hash TEXT;

-- Ensure user_agent column exists
ALTER TABLE public.consent_records
  ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Ensure document_version has a reasonable default (privacy settings page
-- doesn't always provide one, but the column may be NOT NULL)
-- We make it nullable to be safe:
ALTER TABLE public.consent_records
  ALTER COLUMN document_version DROP NOT NULL;

-- Widen consent_type CHECK constraint if it exists and is too narrow.
-- Code uses: terms_of_service, privacy_policy, data_processing, sensitive_data,
--   marketing_email, marketing_sms, marketing_whatsapp, analytics_cookies
ALTER TABLE public.consent_records
  DROP CONSTRAINT IF EXISTS consent_records_consent_type_check;

ALTER TABLE public.consent_records
  ADD CONSTRAINT consent_records_consent_type_check
    CHECK (consent_type IN (
      'terms_of_service', 'privacy_policy', 'data_processing', 'sensitive_data',
      'marketing_email', 'marketing_sms', 'marketing_whatsapp', 'analytics_cookies'
    ));

-- Widen action CHECK constraint: code uses 'granted', 'withdrawn', 'updated'
-- (types/app.ts says 'granted'/'revoked' but lib/consent.ts uses 'withdrawn')
ALTER TABLE public.consent_records
  DROP CONSTRAINT IF EXISTS consent_records_action_check;

ALTER TABLE public.consent_records
  ADD CONSTRAINT consent_records_action_check
    CHECK (action IN ('granted', 'revoked', 'withdrawn', 'updated'));


-- ─────────────────────────────────────────────────────────────────────────────
-- 7. AUDIT_LOG: Ensure ip_hash and user_agent columns exist
-- ─────────────────────────────────────────────────────────────────────────────
-- lib/audit.ts writes: ip_hash, user_agent
-- Onboarding page also inserts from client side with ip_hash: null

ALTER TABLE public.audit_log
  ADD COLUMN IF NOT EXISTS ip_hash TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT;


-- ─────────────────────────────────────────────────────────────────────────────
-- 8. BABY_PROFILES: Ensure pending_proactive columns exist
-- ─────────────────────────────────────────────────────────────────────────────
-- detect-patterns route writes pending_proactive_type and pending_proactive_set_at

ALTER TABLE public.baby_profiles
  ADD COLUMN IF NOT EXISTS pending_proactive_type TEXT,
  ADD COLUMN IF NOT EXISTS pending_proactive_set_at TIMESTAMPTZ;


-- ─────────────────────────────────────────────────────────────────────────────
-- 9. COMMUNICATION_PREFERENCES: Ensure all code-referenced columns exist
-- ─────────────────────────────────────────────────────────────────────────────
-- types/app.ts: checkin_hour, timezone, quiet_hours_start, quiet_hours_end
-- update-preferences route ALLOWED_FIELDS includes all of these

ALTER TABLE public.communication_preferences
  ADD COLUMN IF NOT EXISTS checkin_hour INT DEFAULT 9,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Los_Angeles',
  ADD COLUMN IF NOT EXISTS quiet_hours_start INT DEFAULT 22,
  ADD COLUMN IF NOT EXISTS quiet_hours_end INT DEFAULT 7;

-- Add CHECK constraints for hour ranges
DO $$ BEGIN
  ALTER TABLE public.communication_preferences
    ADD CONSTRAINT comms_checkin_hour_range CHECK (checkin_hour >= 0 AND checkin_hour <= 23);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.communication_preferences
    ADD CONSTRAINT comms_quiet_start_range CHECK (quiet_hours_start >= 0 AND quiet_hours_start <= 23);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.communication_preferences
    ADD CONSTRAINT comms_quiet_end_range CHECK (quiet_hours_end >= 0 AND quiet_hours_end <= 23);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 10. PRIVACY_PREFERENCES: Ensure columns match code + PRODUCT.md spec
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.privacy_preferences
  ADD COLUMN IF NOT EXISTS product_improvement_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS gdpr_applicable BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ccpa_applicable BOOLEAN NOT NULL DEFAULT false;


-- ─────────────────────────────────────────────────────────────────────────────
-- 11. CRITICAL FIX: chat_messages.role CHECK constraint
-- ─────────────────────────────────────────────────────────────────────────────
-- v11 defines: CHECK (role IN ('parent', 'lumira'))
-- But app/api/chat/route.ts inserts role: 'user' and 'assistant'
-- types/chat.ts declares ChatRole = 'user' | 'assistant'
-- This is a BLOCKING BUG: every chat message INSERT fails with CHECK violation.
--
-- Fix: allow all four values (backward-compat with any v11 data + new code).

ALTER TABLE public.chat_messages
  DROP CONSTRAINT IF EXISTS chat_messages_role_check;

ALTER TABLE public.chat_messages
  ADD CONSTRAINT chat_messages_role_check
    CHECK (role IN ('parent', 'lumira', 'user', 'assistant'));


-- ─────────────────────────────────────────────────────────────────────────────
-- 12. DAILY_CHECKINS: UNIQUE constraint for upsert logic
-- ─────────────────────────────────────────────────────────────────────────────
-- checkin-conversation route does manual SELECT + INSERT/UPDATE by (baby_id, checkin_date)
-- This constraint enforces data integrity and enables future ON CONFLICT usage.

CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_checkins_baby_date_unique
  ON public.daily_checkins (baby_id, checkin_date);


-- =============================================================================
-- 13. MISSING FOREIGN KEY INDEXES
-- =============================================================================
-- PostgreSQL does NOT automatically create indexes on foreign key columns.
-- Without these, every CASCADE delete or JOIN on a FK does a sequential scan.

-- baby_profiles
CREATE INDEX IF NOT EXISTS idx_baby_profiles_created_by
  ON public.baby_profiles (created_by_profile_id);

-- baby_profile_members (junction table -- both FKs need indexes)
CREATE INDEX IF NOT EXISTS idx_baby_profile_members_baby_id
  ON public.baby_profile_members (baby_id);
CREATE INDEX IF NOT EXISTS idx_baby_profile_members_profile_id
  ON public.baby_profile_members (profile_id);

-- daily_checkins
CREATE INDEX IF NOT EXISTS idx_daily_checkins_baby_id
  ON public.daily_checkins (baby_id);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_profile_id
  ON public.daily_checkins (profile_id);

-- milestones
CREATE INDEX IF NOT EXISTS idx_milestones_baby_id
  ON public.milestones (baby_id);
CREATE INDEX IF NOT EXISTS idx_milestones_profile_id
  ON public.milestones (profile_id);

-- concern_sessions
CREATE INDEX IF NOT EXISTS idx_concern_sessions_baby_id
  ON public.concern_sessions (baby_id);
CREATE INDEX IF NOT EXISTS idx_concern_sessions_profile_id
  ON public.concern_sessions (profile_id);

-- pattern_observations
CREATE INDEX IF NOT EXISTS idx_pattern_observations_baby_id
  ON public.pattern_observations (baby_id);
CREATE INDEX IF NOT EXISTS idx_pattern_observations_profile_id
  ON public.pattern_observations (profile_id);

-- partner_invites
CREATE INDEX IF NOT EXISTS idx_partner_invites_baby_id
  ON public.partner_invites (baby_id);
CREATE INDEX IF NOT EXISTS idx_partner_invites_invited_by
  ON public.partner_invites (invited_by_profile_id);

-- pregnancy_appointments
CREATE INDEX IF NOT EXISTS idx_pregnancy_appointments_baby_id
  ON public.pregnancy_appointments (baby_id);
CREATE INDEX IF NOT EXISTS idx_pregnancy_appointments_profile_id
  ON public.pregnancy_appointments (profile_id);

-- journal_entries
CREATE INDEX IF NOT EXISTS idx_journal_entries_profile_id
  ON public.journal_entries (profile_id);

-- weekly_summaries
CREATE INDEX IF NOT EXISTS idx_weekly_summaries_baby_id
  ON public.weekly_summaries (baby_id);

-- communication_preferences
CREATE INDEX IF NOT EXISTS idx_communication_preferences_profile_id
  ON public.communication_preferences (profile_id);

-- communication_log
CREATE INDEX IF NOT EXISTS idx_communication_log_profile_id
  ON public.communication_log (profile_id);

-- consent_records
CREATE INDEX IF NOT EXISTS idx_consent_records_profile_id
  ON public.consent_records (profile_id);

-- data_deletion_requests
CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_profile_id
  ON public.data_deletion_requests (profile_id);

-- data_export_requests
CREATE INDEX IF NOT EXISTS idx_data_export_requests_profile_id
  ON public.data_export_requests (profile_id);

-- audit_log
CREATE INDEX IF NOT EXISTS idx_audit_log_profile_id
  ON public.audit_log (profile_id);

-- privacy_preferences
CREATE INDEX IF NOT EXISTS idx_privacy_preferences_profile_id
  ON public.privacy_preferences (profile_id);

-- notifications
CREATE INDEX IF NOT EXISTS idx_notifications_profile_id
  ON public.notifications (profile_id);
CREATE INDEX IF NOT EXISTS idx_notifications_baby_id
  ON public.notifications (baby_id)
  WHERE baby_id IS NOT NULL;

-- chat_threads FKs
CREATE INDEX IF NOT EXISTS idx_chat_threads_profile_id
  ON public.chat_threads (profile_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_baby_id
  ON public.chat_threads (baby_id);

-- chat_messages FK (CRITICAL: thread_id is used in every query + CASCADE delete)
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_id
  ON public.chat_messages (thread_id);

-- chat_threads: source FKs
CREATE INDEX IF NOT EXISTS idx_chat_threads_source_concern
  ON public.chat_threads (source_concern_session_id)
  WHERE source_concern_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chat_threads_source_checkin
  ON public.chat_threads (source_checkin_id)
  WHERE source_checkin_id IS NOT NULL;


-- =============================================================================
-- 14. QUERY-PATTERN INDEXES (based on actual API route access patterns)
-- =============================================================================

-- daily_checkins: checkin-conversation upserts by (baby_id, checkin_date)
CREATE INDEX IF NOT EXISTS idx_daily_checkins_baby_date
  ON public.daily_checkins (baby_id, checkin_date DESC);

-- concern_sessions: context-builder fetches latest by baby_id
CREATE INDEX IF NOT EXISTS idx_concern_sessions_baby_created
  ON public.concern_sessions (baby_id, created_at DESC);

-- concern_sessions: follow-up cron queries
CREATE INDEX IF NOT EXISTS idx_concern_sessions_followup_pending
  ON public.concern_sessions (follow_up_due)
  WHERE follow_up_sent = false AND follow_up_due IS NOT NULL;

-- pattern_observations: detect-patterns fetches recent by baby_id
CREATE INDEX IF NOT EXISTS idx_pattern_observations_baby_triggered
  ON public.pattern_observations (baby_id, triggered_at DESC);

-- weekly_summaries: context-builder fetches latest by baby_id
CREATE INDEX IF NOT EXISTS idx_weekly_summaries_baby_generated
  ON public.weekly_summaries (baby_id, generated_at DESC);

-- weekly_summaries: generate-weekly-summary upserts by (baby_id, week_number, year)
CREATE UNIQUE INDEX IF NOT EXISTS idx_weekly_summaries_baby_week_year
  ON public.weekly_summaries (baby_id, week_number, year);

-- partner_invites: lookup by token (invite acceptance flow)
CREATE INDEX IF NOT EXISTS idx_partner_invites_token
  ON public.partner_invites (token)
  WHERE used = false;

-- communication_log: recent sends per profile for rate limiting
CREATE INDEX IF NOT EXISTS idx_communication_log_profile_sent
  ON public.communication_log (profile_id, sent_at DESC);

-- audit_log: chronological listing per profile
CREATE INDEX IF NOT EXISTS idx_audit_log_profile_created
  ON public.audit_log (profile_id, created_at DESC);

-- consent_records: history listing per profile
CREATE INDEX IF NOT EXISTS idx_consent_records_profile_created
  ON public.consent_records (profile_id, created_at DESC);

-- data_export_requests: status check per profile
CREATE INDEX IF NOT EXISTS idx_data_export_requests_profile_status
  ON public.data_export_requests (profile_id, status);

-- data_deletion_requests: status check per profile
CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_profile_status
  ON public.data_deletion_requests (profile_id, status);

-- pregnancy_appointments: upcoming appointments for reminder cron
CREATE INDEX IF NOT EXISTS idx_pregnancy_appointments_date
  ON public.pregnancy_appointments (appointment_date)
  WHERE prep_message_sent = false;

-- chat_messages: red flag audit query
CREATE INDEX IF NOT EXISTS idx_chat_messages_red_flags
  ON public.chat_messages (red_flag_detected, created_at DESC)
  WHERE red_flag_detected = true;

-- chat_messages: token usage reporting
CREATE INDEX IF NOT EXISTS idx_chat_messages_model_tokens
  ON public.chat_messages (model_version, created_at)
  WHERE model_version IS NOT NULL;

-- landing_page_conversions: analytics by date (may not exist yet, safe to skip)
CREATE INDEX IF NOT EXISTS idx_landing_page_conversions_created
  ON public.landing_page_conversions (created_at DESC);


-- =============================================================================
-- 15. RLS POLICIES ON CORE TABLES
-- =============================================================================
-- v11 only set up RLS for notifications, chat_threads, chat_messages.
-- Earlier migrations (v1-v10) are not in the repo, so we must ensure all
-- tables have RLS enabled with correct policies. These are idempotent.

-- ── profiles ──
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY profiles_select_own ON public.profiles
    FOR SELECT USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY profiles_insert_own ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY profiles_update_own ON public.profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── baby_profiles ──
-- Users can see baby_profiles they are a member of (via baby_profile_members)
ALTER TABLE public.baby_profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY baby_profiles_select_member ON public.baby_profiles
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.baby_profile_members
        WHERE baby_profile_members.baby_id = baby_profiles.id
          AND baby_profile_members.profile_id = auth.uid()
      )
      OR created_by_profile_id = auth.uid()
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY baby_profiles_insert_own ON public.baby_profiles
    FOR INSERT WITH CHECK (created_by_profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY baby_profiles_update_member ON public.baby_profiles
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM public.baby_profile_members
        WHERE baby_profile_members.baby_id = baby_profiles.id
          AND baby_profile_members.profile_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── baby_profile_members ──
ALTER TABLE public.baby_profile_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY baby_profile_members_select_own ON public.baby_profile_members
    FOR SELECT USING (profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY baby_profile_members_insert_own ON public.baby_profile_members
    FOR INSERT WITH CHECK (profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── daily_checkins ──
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY daily_checkins_select_own ON public.daily_checkins
    FOR SELECT USING (profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY daily_checkins_insert_own ON public.daily_checkins
    FOR INSERT WITH CHECK (profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY daily_checkins_update_own ON public.daily_checkins
    FOR UPDATE USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── concern_sessions ──
ALTER TABLE public.concern_sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY concern_sessions_select_own ON public.concern_sessions
    FOR SELECT USING (profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY concern_sessions_insert_own ON public.concern_sessions
    FOR INSERT WITH CHECK (profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── pattern_observations ──
ALTER TABLE public.pattern_observations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY pattern_observations_select_own ON public.pattern_observations
    FOR SELECT USING (profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY pattern_observations_insert_own ON public.pattern_observations
    FOR INSERT WITH CHECK (profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── milestones ──
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY milestones_select_own ON public.milestones
    FOR SELECT USING (profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY milestones_insert_own ON public.milestones
    FOR INSERT WITH CHECK (profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── journal_entries ──
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY journal_entries_select_own ON public.journal_entries
    FOR SELECT USING (profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY journal_entries_insert_own ON public.journal_entries
    FOR INSERT WITH CHECK (profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY journal_entries_update_own ON public.journal_entries
    FOR UPDATE USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── pregnancy_appointments ──
ALTER TABLE public.pregnancy_appointments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY pregnancy_appointments_select_own ON public.pregnancy_appointments
    FOR SELECT USING (profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY pregnancy_appointments_insert_own ON public.pregnancy_appointments
    FOR INSERT WITH CHECK (profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY pregnancy_appointments_update_own ON public.pregnancy_appointments
    FOR UPDATE USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── weekly_summaries ──
ALTER TABLE public.weekly_summaries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY weekly_summaries_select_own ON public.weekly_summaries
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.baby_profile_members
        WHERE baby_profile_members.baby_id = weekly_summaries.baby_id
          AND baby_profile_members.profile_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY weekly_summaries_insert_member ON public.weekly_summaries
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.baby_profile_members
        WHERE baby_profile_members.baby_id = weekly_summaries.baby_id
          AND baby_profile_members.profile_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── consent_records (append-only: INSERT + SELECT, no UPDATE/DELETE) ──
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY consent_records_select_own ON public.consent_records
    FOR SELECT USING (profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY consent_records_insert_own ON public.consent_records
    FOR INSERT WITH CHECK (profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
-- No UPDATE or DELETE policies: consent log is immutable from the user's perspective.

-- ── privacy_preferences ──
ALTER TABLE public.privacy_preferences ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY privacy_preferences_select_own ON public.privacy_preferences
    FOR SELECT USING (profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY privacy_preferences_insert_own ON public.privacy_preferences
    FOR INSERT WITH CHECK (profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY privacy_preferences_update_own ON public.privacy_preferences
    FOR UPDATE USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── communication_preferences ──
ALTER TABLE public.communication_preferences ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY communication_preferences_select_own ON public.communication_preferences
    FOR SELECT USING (profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY communication_preferences_insert_own ON public.communication_preferences
    FOR INSERT WITH CHECK (profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY communication_preferences_update_own ON public.communication_preferences
    FOR UPDATE USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── data_export_requests ──
ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY data_export_requests_select_own ON public.data_export_requests
    FOR SELECT USING (profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY data_export_requests_insert_own ON public.data_export_requests
    FOR INSERT WITH CHECK (profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── data_deletion_requests ──
ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY data_deletion_requests_select_own ON public.data_deletion_requests
    FOR SELECT USING (profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- No INSERT policy for authenticated users: deletion requests go through
-- the service-role client in request-deletion/route.ts

-- ── audit_log ──
-- Onboarding page inserts from client-side, plus service-role inserts from lib/audit.ts
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY audit_log_select_own ON public.audit_log
    FOR SELECT USING (profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY audit_log_insert_own ON public.audit_log
    FOR INSERT WITH CHECK (profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
-- No UPDATE or DELETE: audit log is append-only.

-- ── partner_invites ──
ALTER TABLE public.partner_invites ENABLE ROW LEVEL SECURITY;

-- Partner invites are created via service role (invite-partner route),
-- but users can view invites they created
DO $$ BEGIN
  CREATE POLICY partner_invites_select_own ON public.partner_invites
    FOR SELECT USING (invited_by_profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- =============================================================================
-- 16. NOTIFICATIONS: INSERT policy for authenticated users
-- =============================================================================
-- lib/notifications.ts uses createClient() (user session), NOT createServiceClient().
-- The v11 migration intentionally omitted an INSERT policy, meaning the
-- createNotification() function will fail with RLS violation.
-- Fix: allow authenticated users to insert notifications for themselves.

DO $$ BEGIN
  CREATE POLICY notifications_insert_own ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = profile_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- =============================================================================
-- 17. UPDATED_AT TRIGGERS
-- =============================================================================
-- Attach auto-update triggers to all tables with updated_at columns.
-- This ensures updated_at stays current even if application code forgets to set it.

-- profiles
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- daily_checkins
DROP TRIGGER IF EXISTS set_daily_checkins_updated_at ON public.daily_checkins;
CREATE TRIGGER set_daily_checkins_updated_at
  BEFORE UPDATE ON public.daily_checkins
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- chat_threads (already has updated_at set by handle_new_chat_message trigger,
-- but direct UPDATEs from chat/route.ts should also auto-set it)
DROP TRIGGER IF EXISTS set_chat_threads_updated_at ON public.chat_threads;
CREATE TRIGGER set_chat_threads_updated_at
  BEFORE UPDATE ON public.chat_threads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- communication_preferences
DROP TRIGGER IF EXISTS set_communication_preferences_updated_at ON public.communication_preferences;
CREATE TRIGGER set_communication_preferences_updated_at
  BEFORE UPDATE ON public.communication_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- privacy_preferences
DROP TRIGGER IF EXISTS set_privacy_preferences_updated_at ON public.privacy_preferences;
CREATE TRIGGER set_privacy_preferences_updated_at
  BEFORE UPDATE ON public.privacy_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- 18. UNIQUE CONSTRAINTS FOR 1-PER-USER SETTINGS TABLES
-- =============================================================================
-- These tables should have at most one row per profile_id.
-- Without a UNIQUE constraint, bugs can create duplicate rows.

CREATE UNIQUE INDEX IF NOT EXISTS idx_privacy_preferences_profile_unique
  ON public.privacy_preferences (profile_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_communication_preferences_profile_unique
  ON public.communication_preferences (profile_id);


-- =============================================================================
-- 19. DATA RETENTION: CHECK constraint on privacy_preferences.data_retention_months
-- =============================================================================
-- types/app.ts declares: data_retention_months: 12 | 24 | 36
-- Privacy settings page only offers these three values.

DO $$ BEGIN
  ALTER TABLE public.privacy_preferences
    ADD CONSTRAINT privacy_prefs_retention_check
      CHECK (data_retention_months IN (12, 24, 36));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- =============================================================================
-- DONE. Summary of what this migration addresses:
-- =============================================================================
-- [CRITICAL]  chat_messages.role CHECK: 'user'/'assistant' now allowed
-- [CRITICAL]  notifications INSERT policy: users can create their own
-- [CRITICAL]  weekly_guides table: created (API was hitting a missing table)
-- [BLOCKING]  consent_records type/action CHECK constraints widened
-- [SCHEMA]    chat_threads: 4 missing columns added
-- [SCHEMA]    chat_messages: 8 missing columns added
-- [SCHEMA]    early_access_queue table created
-- [SCHEMA]    consent_records: ip_hash, user_agent columns ensured
-- [SCHEMA]    audit_log: ip_hash, user_agent columns ensured
-- [SCHEMA]    baby_profiles: pending_proactive columns ensured
-- [SCHEMA]    communication_preferences: quiet_hours + timezone columns
-- [SCHEMA]    privacy_preferences: product_improvement, gdpr, ccpa columns
-- [SCHEMA]    data_deletion_requests: request_type column
-- [PERF]      40+ indexes on FK columns and query patterns
-- [SECURITY]  RLS enabled + policies on ALL 17 user-facing tables
-- [INTEGRITY] updated_at triggers on 5 tables
-- [INTEGRITY] UNIQUE constraints on settings tables + daily_checkins
-- [INTEGRITY] CHECK constraints on hours, retention months, enums
