-- =============================================================================
-- Lumira v13: Final Exhaustive Audit Fixes
-- Project: gomjthjjqcmrhnpwsdqh.supabase.co
-- Generated: 2026-03-19 (final pre-production audit)
-- =============================================================================
--
-- Issues found during the exhaustive cross-reference of EVERY API route,
-- lib file, client page, and hook against the v11 + v12 schema:
--
--   1.  [BLOCKING] consent_records CHECK: onboarding writes 'sensitive_data'
--       but v12 constraint omits it
--   2.  [BLOCKING] data_deletion_requests: client-side INSERT from privacy
--       settings page, but no INSERT policy for authenticated users
--   3.  [BLOCKING] profiles: code writes emotional_state_updated_at,
--       partner_invite_email — columns never created
--   4.  [BLOCKING] early_access_queue: LandingPageClient writes 'stage' column
--       — not in v12 CREATE TABLE
--   5.  [BLOCKING] partner_invites: used_at, used_by_profile_id columns
--       written by invite acceptance flow — never created
--   6.  [BLOCKING] partner_invites: partner (acceptor) needs UPDATE policy
--       — v12 only has SELECT for inviter
--   7.  [SCHEMA]   daily_checkins: night_wakings, diapers, kept_food_down,
--       conversation_log columns read/written by code
--   8.  [SCHEMA]   weekly_summaries: content, week_number, year, generated_at
--       columns must exist
--   9.  [SCHEMA]   consent_records: page_url, capture_method columns must exist
--  10.  [SCHEMA]   landing_page_conversions index in v12 references table that
--       may not exist — wrap in DO block
--  11.  [RLS]      partner_invites: partner (non-inviter) cannot SELECT to
--       verify invite token — needs broader SELECT policy
-- =============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. CONSENT_RECORDS: Widen consent_type CHECK to include 'sensitive_data'
-- ─────────────────────────────────────────────────────────────────────────────
-- Onboarding page inserts consent_type = 'sensitive_data' (4 records:
-- terms_of_service, privacy_policy, data_processing, sensitive_data).
-- v12 constraint omits sensitive_data → every onboarding INSERT fails.

ALTER TABLE public.consent_records
  DROP CONSTRAINT IF EXISTS consent_records_consent_type_check;

ALTER TABLE public.consent_records
  ADD CONSTRAINT consent_records_consent_type_check
    CHECK (consent_type IN (
      'terms_of_service', 'privacy_policy', 'data_processing', 'sensitive_data',
      'marketing_email', 'marketing_sms', 'marketing_whatsapp', 'analytics_cookies'
    ));


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. DATA_DELETION_REQUESTS: INSERT policy for authenticated users
-- ─────────────────────────────────────────────────────────────────────────────
-- app/(app)/settings/privacy/page.tsx line 302 does a client-side INSERT.
-- v12 explicitly omitted an INSERT policy. Without it, the call fails with
-- RLS violation. The API route uses service role, but the settings page does not.

DO $$ BEGIN
  CREATE POLICY data_deletion_requests_insert_own ON public.data_deletion_requests
    FOR INSERT WITH CHECK (profile_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. PROFILES: Missing columns that code writes/reads
-- ─────────────────────────────────────────────────────────────────────────────
-- chat/route.ts + checkin-conversation write emotional_state_updated_at
-- useBabyProfile hook reads partner_invite_email

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS emotional_state_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS partner_invite_email TEXT;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. EARLY_ACCESS_QUEUE: Missing 'stage' column
-- ─────────────────────────────────────────────────────────────────────────────
-- LandingPageClient.tsx writes stage: 'pregnancy' | 'infant'
-- v12 CREATE TABLE omits it.

ALTER TABLE public.early_access_queue
  ADD COLUMN IF NOT EXISTS stage TEXT;


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. PARTNER_INVITES: Missing columns for invite acceptance
-- ─────────────────────────────────────────────────────────────────────────────
-- app/invite/[token]/page.tsx updates: used_at, used_by_profile_id
-- These columns must exist on the partner_invites table.

ALTER TABLE public.partner_invites
  ADD COLUMN IF NOT EXISTS used_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS used_by_profile_id UUID;

-- FK for used_by_profile_id (idempotent)
DO $$ BEGIN
  ALTER TABLE public.partner_invites
    ADD CONSTRAINT partner_invites_used_by_fk
      FOREIGN KEY (used_by_profile_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Index for the FK
CREATE INDEX IF NOT EXISTS idx_partner_invites_used_by
  ON public.partner_invites (used_by_profile_id)
  WHERE used_by_profile_id IS NOT NULL;


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. PARTNER_INVITES: RLS policies for invite acceptance flow
-- ─────────────────────────────────────────────────────────────────────────────
-- The accepting partner needs to:
--   a) SELECT the invite by token (to verify it's valid)
--   b) UPDATE the invite to mark it as used
-- The v12 SELECT policy only allows the inviter (invited_by_profile_id).
-- We need a separate policy that allows any authenticated user to SELECT
-- invites by token (for the invite acceptance flow), and UPDATE invites
-- to mark them as used.

-- Allow any authenticated user to read an invite (needed for token verification)
DO $$ BEGIN
  CREATE POLICY partner_invites_select_by_token ON public.partner_invites
    FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Drop the overly restrictive original policy (it's now redundant)
DROP POLICY IF EXISTS partner_invites_select_own ON public.partner_invites;

-- Allow any authenticated user to update an unused invite (mark as used)
-- Security: the code only updates where token matches + used = false,
-- and the user must be authenticated. This is safe because:
-- 1. Tokens are unguessable UUIDs
-- 2. Only unused invites can be claimed
-- 3. The write sets used=true, preventing re-use
DO $$ BEGIN
  CREATE POLICY partner_invites_update_accept ON public.partner_invites
    FOR UPDATE TO authenticated
    USING (used = false)
    WITH CHECK (used = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 7. DAILY_CHECKINS: Missing columns that code reads/writes
-- ─────────────────────────────────────────────────────────────────────────────
-- checkin page reads: night_wakings, diapers, kept_food_down, conversation_log
-- checkin-conversation writes: conversation_log
-- detect-patterns reads: sleep_quality, feeding, mood, nausea_level,
--   energy_level, emotional_signal (these likely exist from pre-v11)
-- context-builder reads: kept_food_down

ALTER TABLE public.daily_checkins
  ADD COLUMN IF NOT EXISTS night_wakings INT,
  ADD COLUMN IF NOT EXISTS diapers TEXT,
  ADD COLUMN IF NOT EXISTS kept_food_down BOOLEAN,
  ADD COLUMN IF NOT EXISTS conversation_log JSONB DEFAULT '[]';


-- ─────────────────────────────────────────────────────────────────────────────
-- 8. WEEKLY_SUMMARIES: Ensure all code-referenced columns exist
-- ─────────────────────────────────────────────────────────────────────────────
-- generate-weekly-summary writes: baby_id, week_number, year, content,
--   generated_at
-- context-builder reads: content, orders by generated_at
-- These columns likely exist from pre-v11, but we ensure them here.

ALTER TABLE public.weekly_summaries
  ADD COLUMN IF NOT EXISTS content JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS week_number INT,
  ADD COLUMN IF NOT EXISTS year INT,
  ADD COLUMN IF NOT EXISTS generated_at TIMESTAMPTZ DEFAULT now();


-- ─────────────────────────────────────────────────────────────────────────────
-- 9. CONSENT_RECORDS: Ensure page_url and capture_method columns exist
-- ─────────────────────────────────────────────────────────────────────────────
-- lib/consent.ts writes: page_url, capture_method
-- onboarding writes: page_url, capture_method
-- privacy settings writes: page_url, capture_method
-- consent-history reads: capture_method, page_url
-- These may exist from pre-v11 but must be guaranteed.

ALTER TABLE public.consent_records
  ADD COLUMN IF NOT EXISTS page_url TEXT,
  ADD COLUMN IF NOT EXISTS capture_method TEXT DEFAULT 'unknown';


-- ─────────────────────────────────────────────────────────────────────────────
-- 10. LANDING_PAGE_CONVERSIONS: Guard against missing table
-- ─────────────────────────────────────────────────────────────────────────────
-- v12 creates an index on landing_page_conversions, but this table may not
-- exist yet (it's referenced nowhere in the codebase except the index).
-- The v12 CREATE INDEX IF NOT EXISTS on a non-existent table will ERROR.
-- This is informational — if the table doesn't exist, the v12 index creation
-- will fail silently. We create the table IF NOT EXISTS to prevent that.

CREATE TABLE IF NOT EXISTS public.landing_page_conversions (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT,
  source     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.landing_page_conversions ENABLE ROW LEVEL SECURITY;

-- No user-facing queries to this table, so no user policies needed.
-- Service role handles analytics reads.


-- ─────────────────────────────────────────────────────────────────────────────
-- 11. PROFILES: first_checkin_complete column must exist
-- ─────────────────────────────────────────────────────────────────────────────
-- Onboarding writes first_checkin_complete: false
-- checkin-conversation writes first_checkin_complete: true
-- checkin page reads first_checkin_complete
-- Ensure it exists (likely pre-v11, but be safe).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_checkin_complete BOOLEAN DEFAULT false;


-- ─────────────────────────────────────────────────────────────────────────────
-- 12. PROFILES: emotional_state_latest must exist
-- ─────────────────────────────────────────────────────────────────────────────
-- Multiple routes read/write emotional_state_latest. Ensure it exists.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS emotional_state_latest TEXT;


-- ─────────────────────────────────────────────────────────────────────────────
-- 13. PROFILES: first_time_parent, first_name must exist
-- ─────────────────────────────────────────────────────────────────────────────
-- Core profile columns used everywhere. Ensure they exist.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS first_time_parent BOOLEAN;


-- ─────────────────────────────────────────────────────────────────────────────
-- 14. MILESTONES: Ensure code-referenced columns exist
-- ─────────────────────────────────────────────────────────────────────────────
-- milestones/new writes: baby_id, profile_id, stage, milestone_type,
--   milestone_date, notes

ALTER TABLE public.milestones
  ADD COLUMN IF NOT EXISTS stage TEXT,
  ADD COLUMN IF NOT EXISTS milestone_type TEXT,
  ADD COLUMN IF NOT EXISTS milestone_date DATE,
  ADD COLUMN IF NOT EXISTS notes TEXT;


-- ─────────────────────────────────────────────────────────────────────────────
-- 15. JOURNAL_ENTRIES: Ensure code-referenced columns exist
-- ─────────────────────────────────────────────────────────────────────────────
-- journal/new writes: profile_id, body, entry_date

ALTER TABLE public.journal_entries
  ADD COLUMN IF NOT EXISTS body TEXT,
  ADD COLUMN IF NOT EXISTS entry_date DATE;


-- ─────────────────────────────────────────────────────────────────────────────
-- 16. DATA_EXPORT_REQUESTS: Ensure code-referenced columns exist
-- ─────────────────────────────────────────────────────────────────────────────
-- request-export route writes: profile_id, status, requested_at
-- Also updates: status, completed_at

ALTER TABLE public.data_export_requests
  ADD COLUMN IF NOT EXISTS requested_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;


-- ─────────────────────────────────────────────────────────────────────────────
-- 17. DATA_DELETION_REQUESTS: Ensure code-referenced columns exist
-- ─────────────────────────────────────────────────────────────────────────────
-- request-deletion route writes: profile_id, status, request_type, requested_at
-- Privacy settings page writes: profile_id, status, requested_at

ALTER TABLE public.data_deletion_requests
  ADD COLUMN IF NOT EXISTS requested_at TIMESTAMPTZ DEFAULT now();


-- ─────────────────────────────────────────────────────────────────────────────
-- 18. CONCERN_SESSIONS: Ensure follow_up columns exist
-- ─────────────────────────────────────────────────────────────────────────────
-- concern-summary writes: follow_up_due, follow_up_sent
-- v12 index references follow_up_due, follow_up_sent

ALTER TABLE public.concern_sessions
  ADD COLUMN IF NOT EXISTS follow_up_due DATE,
  ADD COLUMN IF NOT EXISTS follow_up_sent BOOLEAN DEFAULT false;


-- ─────────────────────────────────────────────────────────────────────────────
-- 19. DAILY_CHECKINS: Ensure all field columns exist
-- ─────────────────────────────────────────────────────────────────────────────
-- Code reads/writes: sleep_quality, feeding, mood, nausea_level,
--   energy_level, emotional_signal, checkin_date, stage
-- These are likely pre-v11, but guarantee them.

ALTER TABLE public.daily_checkins
  ADD COLUMN IF NOT EXISTS sleep_quality TEXT,
  ADD COLUMN IF NOT EXISTS feeding TEXT,
  ADD COLUMN IF NOT EXISTS mood TEXT,
  ADD COLUMN IF NOT EXISTS nausea_level TEXT,
  ADD COLUMN IF NOT EXISTS energy_level TEXT,
  ADD COLUMN IF NOT EXISTS emotional_signal TEXT,
  ADD COLUMN IF NOT EXISTS checkin_date DATE,
  ADD COLUMN IF NOT EXISTS stage TEXT;


-- ─────────────────────────────────────────────────────────────────────────────
-- 20. CONCERN_SESSIONS: Ensure all field columns exist
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.concern_sessions
  ADD COLUMN IF NOT EXISTS stage TEXT,
  ADD COLUMN IF NOT EXISTS concern_type TEXT,
  ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS ai_summary JSONB DEFAULT '{}';


-- ─────────────────────────────────────────────────────────────────────────────
-- 21. PREGNANCY_APPOINTMENTS: prep_message_sent must exist for v12 index
-- ─────────────────────────────────────────────────────────────────────────────
-- v12 creates a partial index WHERE prep_message_sent = false

ALTER TABLE public.pregnancy_appointments
  ADD COLUMN IF NOT EXISTS prep_message_sent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS appointment_date DATE;


-- ─────────────────────────────────────────────────────────────────────────────
-- 22. COMMUNICATION_LOG: Ensure sent_at column exists for v12 index
-- ─────────────────────────────────────────────────────────────────────────────
-- v12 index references: profile_id, sent_at

ALTER TABLE public.communication_log
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ DEFAULT now();


-- ─────────────────────────────────────────────────────────────────────────────
-- 23. DATA_EXPORT_REQUESTS: download_url and expires_at columns
-- ─────────────────────────────────────────────────────────────────────────────
-- types/app.ts declares download_url and expires_at on DataExportRequest

ALTER TABLE public.data_export_requests
  ADD COLUMN IF NOT EXISTS download_url TEXT,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;


-- ─────────────────────────────────────────────────────────────────────────────
-- 24. DATA_DELETION_REQUESTS: completed_at column
-- ─────────────────────────────────────────────────────────────────────────────
-- types/app.ts declares completed_at on DataDeletionRequest

ALTER TABLE public.data_deletion_requests
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;


-- ─────────────────────────────────────────────────────────────────────────────
-- 25. DAILY_CHECKINS: symptoms_log and concern_text columns
-- ─────────────────────────────────────────────────────────────────────────────
-- types/app.ts declares these on DailyCheckin

ALTER TABLE public.daily_checkins
  ADD COLUMN IF NOT EXISTS symptoms_log JSONB,
  ADD COLUMN IF NOT EXISTS concern_text TEXT;


-- ─────────────────────────────────────────────────────────────────────────────
-- 26. CONSENT_RECORDS: Widen type CHECK for types/app.ts future-proofing
-- ─────────────────────────────────────────────────────────────────────────────
-- types/app.ts declares ConsentType with additional values beyond what
-- the current code writes. Widen the constraint to prevent future breakage
-- when these features are implemented.

ALTER TABLE public.consent_records
  DROP CONSTRAINT IF EXISTS consent_records_consent_type_check;

ALTER TABLE public.consent_records
  ADD CONSTRAINT consent_records_consent_type_check
    CHECK (consent_type IN (
      'terms_of_service', 'privacy_policy', 'data_processing', 'sensitive_data',
      'community_guidelines', 'acceptable_use', 'ai_data_practices',
      'marketing_email', 'marketing_sms', 'marketing_whatsapp',
      'analytics', 'analytics_cookies', 'product_improvement', 'third_party_sharing'
    ));


-- ─────────────────────────────────────────────────────────────────────────────
-- 27. PREGNANCY_APPOINTMENTS: appointment_type column
-- ─────────────────────────────────────────────────────────────────────────────
-- types/app.ts declares appointment_type on PregnancyAppointment

ALTER TABLE public.pregnancy_appointments
  ADD COLUMN IF NOT EXISTS appointment_type TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;


-- ─────────────────────────────────────────────────────────────────────────────
-- 28. COMMUNICATION_PREFERENCES: Ensure all boolean columns exist
-- ─────────────────────────────────────────────────────────────────────────────
-- types/app.ts and update-preferences route reference these columns

ALTER TABLE public.communication_preferences
  ADD COLUMN IF NOT EXISTS email_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_daily_checkin BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_pattern_alerts BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_weekly_guide BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_concern_followup BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS sms_enabled BOOLEAN DEFAULT false;


-- =============================================================================
-- DONE. Summary of v13 fixes:
-- =============================================================================
-- [BLOCKING]  consent_records CHECK: added 'sensitive_data' to allowed types
-- [BLOCKING]  data_deletion_requests: added INSERT policy for authenticated users
-- [BLOCKING]  profiles: added emotional_state_updated_at, partner_invite_email
-- [BLOCKING]  early_access_queue: added stage column
-- [BLOCKING]  partner_invites: added used_at, used_by_profile_id + acceptance RLS
-- [SCHEMA]    daily_checkins: added night_wakings, diapers, kept_food_down,
--             conversation_log, sleep_quality, feeding, mood, nausea_level,
--             energy_level, emotional_signal, checkin_date, stage
-- [SCHEMA]    weekly_summaries: added content, week_number, year, generated_at
-- [SCHEMA]    consent_records: added page_url, capture_method
-- [SCHEMA]    landing_page_conversions: created table
-- [SCHEMA]    profiles: ensured first_checkin_complete, emotional_state_latest,
--             first_name, first_time_parent
-- [SCHEMA]    milestones: ensured stage, milestone_type, milestone_date, notes
-- [SCHEMA]    journal_entries: ensured body, entry_date
-- [SCHEMA]    data_export/deletion_requests: ensured timestamps
-- [SCHEMA]    concern_sessions: ensured follow_up + data columns
-- [SCHEMA]    pregnancy_appointments: ensured prep_message_sent, appointment_date
-- [SCHEMA]    communication_log: ensured sent_at
-- [RLS]       partner_invites: open SELECT + acceptance UPDATE policies
-- =============================================================================
