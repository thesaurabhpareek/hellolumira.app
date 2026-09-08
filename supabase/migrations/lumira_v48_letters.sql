-- lumira_v48_letters.sql
-- Journaling + Letters.
--   'log'    = the nightly journal entry. The HABIT. Low ceremony, always created.
--   'letter' = an ARTIFACT composed from one or more logs. Opt-in, on demand.
--   'ai_summary' = the pre-existing Lumira weekly summary. Untouched.
-- Capture happens once; the output kind is a choice made after.
-- Extends journal_entries rather than superseding it, preserving existing RLS + list UI.
-- entry_kind separates Lumira-writing-about-the-parent from the-parent-writing-to-the-child.

-- ─────────────────────────────────────────────────────────────
-- 1. Extend journal_entries
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.journal_entries
  ADD COLUMN IF NOT EXISTS entry_kind text NOT NULL DEFAULT 'ai_summary',
  ADD COLUMN IF NOT EXISTS baby_id uuid REFERENCES public.baby_profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS raw_transcript text,
  ADD COLUMN IF NOT EXISTS composed_body text,
  ADD COLUMN IF NOT EXISTS edited_body text,
  ADD COLUMN IF NOT EXISTS compose_mode text,
  ADD COLUMN IF NOT EXISTS capture_mode text,
  ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'private',
  ADD COLUMN IF NOT EXISTS child_safe boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS voice_profile_version int,
  ADD COLUMN IF NOT EXISTS slop_audit jsonb,
  ADD COLUMN IF NOT EXISTS followups jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS word_count int,
  ADD COLUMN IF NOT EXISTS duration_seconds int,
  ADD COLUMN IF NOT EXISTS covers_from date,
  ADD COLUMN IF NOT EXISTS covers_to date,
  ADD COLUMN IF NOT EXISTS source_entry_ids uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS letter_span text,
  ADD COLUMN IF NOT EXISTS composed_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$ BEGIN
  ALTER TABLE public.journal_entries ADD CONSTRAINT journal_entries_entry_kind_chk
    CHECK (entry_kind IN ('ai_summary','log','letter'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.journal_entries ADD CONSTRAINT journal_entries_compose_mode_chk
    CHECK (compose_mode IS NULL OR compose_mode IN ('keep_words','shaped','raw'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.journal_entries ADD CONSTRAINT journal_entries_capture_mode_chk
    CHECK (capture_mode IS NULL OR capture_mode IN ('spoken','typed','mixed','not_much'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.journal_entries ADD CONSTRAINT journal_entries_visibility_chk
    CHECK (visibility IN ('private','partner','child_safe'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_journal_entries_kind_date
  ON public.journal_entries (profile_id, entry_kind, entry_date DESC);
DO $$ BEGIN
  ALTER TABLE public.journal_entries ADD CONSTRAINT journal_entries_letter_span_chk
    CHECK (letter_span IS NULL OR letter_span IN ('single','week','month','milestone','custom'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- A letter must cite its sources; a log must not have any.
DO $$ BEGIN
  ALTER TABLE public.journal_entries ADD CONSTRAINT journal_entries_sources_chk
    CHECK (
      (entry_kind = 'letter' AND array_length(source_entry_ids, 1) >= 1)
      OR (entry_kind <> 'letter' AND array_length(source_entry_ids, 1) IS NULL)
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_journal_entries_sources
  ON public.journal_entries USING gin (source_entry_ids);
CREATE INDEX IF NOT EXISTS idx_journal_entries_baby
  ON public.journal_entries (baby_id, entry_date DESC);
-- Full-text search over the reader-facing body (PRD 15.3 / D9 timeline search)
CREATE INDEX IF NOT EXISTS idx_journal_entries_body_fts
  ON public.journal_entries USING gin (to_tsvector('english', coalesce(body,'')));

-- ─────────────────────────────────────────────────────────────
-- 2. voice_profiles — the parent's voice fingerprint
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.voice_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  baby_id uuid REFERENCES public.baby_profiles(id) ON DELETE CASCADE,
  endearments text[] NOT NULL DEFAULT '{}',
  partner_name_for_child text,
  self_name_for_child text,
  mean_sentence_len numeric,
  sentence_len_stdev numeric,
  contraction_rate numeric,
  question_rate numeric,
  formality smallint CHECK (formality BETWEEN 1 AND 5),
  humor_mode text CHECK (humor_mode IN ('dry','absurd','self_deprecating','warm','none')),
  profanity_ceiling smallint NOT NULL DEFAULT 0 CHECK (profanity_ceiling BETWEEN 0 AND 2),
  code_switch_terms jsonb NOT NULL DEFAULT '[]'::jsonb,
  register_notes text,
  banned_words text[] NOT NULL DEFAULT '{}',
  preferred_words text[] NOT NULL DEFAULT '{}',
  onboarding_complete boolean NOT NULL DEFAULT false,
  version int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, baby_id)
);
ALTER TABLE public.voice_profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY voice_profiles_own ON public.voice_profiles
    FOR ALL USING (profile_id = (SELECT auth.uid()))
    WITH CHECK (profile_id = (SELECT auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────────────────────
-- 3. name_corrections — learned STT fixes, applied before Claude sees text
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.name_corrections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  heard text NOT NULL,
  correct text NOT NULL,
  hit_count int NOT NULL DEFAULT 1,
  source text NOT NULL DEFAULT 'learned' CHECK (source IN ('seeded','learned')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, heard)
);
ALTER TABLE public.name_corrections ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY name_corrections_own ON public.name_corrections
    FOR ALL USING (profile_id = (SELECT auth.uid()))
    WITH CHECK (profile_id = (SELECT auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────────────────────
-- 4. safety_flags — tier + category ONLY. Never the triggering text.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.safety_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entry_id uuid REFERENCES public.journal_entries(id) ON DELETE SET NULL,
  tier smallint NOT NULL CHECK (tier BETWEEN 0 AND 2),
  category text NOT NULL,
  surfaced boolean NOT NULL DEFAULT false,
  resource_tapped boolean NOT NULL DEFAULT false,
  model_version text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.safety_flags ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY safety_flags_own ON public.safety_flags
    FOR ALL USING (profile_id = (SELECT auth.uid()))
    WITH CHECK (profile_id = (SELECT auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_safety_flags_tier_created
  ON public.safety_flags (tier, created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- 5. letters_settings — per-parent feature config
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.letters_settings (
  profile_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  nightly_enabled boolean NOT NULL DEFAULT true,
  reminder_anchor text NOT NULL DEFAULT 'bedtime' CHECK (reminder_anchor IN ('bedtime','fixed')),
  reminder_offset_minutes int NOT NULL DEFAULT 25,
  reminder_fixed_local_time time NOT NULL DEFAULT '20:45',
  quiet_after_local_time time NOT NULL DEFAULT '22:30',
  default_compose_mode text NOT NULL DEFAULT 'keep_words'
    CHECK (default_compose_mode IN ('keep_words','shaped')),
  keep_audio_on_device boolean NOT NULL DEFAULT false,  -- PRD 0.3-C, opt-in
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.letters_settings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY letters_settings_own ON public.letters_settings
    FOR ALL USING (profile_id = (SELECT auth.uid()))
    WITH CHECK (profile_id = (SELECT auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────────────────────
-- 6. Backfill: existing rows are Lumira's AI weekly summaries
-- ─────────────────────────────────────────────────────────────
UPDATE public.journal_entries SET entry_kind = 'ai_summary' WHERE entry_kind IS NULL;

-- Race guard for the nightly log: one log per baby per day.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_journal_log_per_day
  ON public.journal_entries (profile_id, baby_id, entry_date)
  WHERE entry_kind = 'log';
