-- lumira_v32_planning_stage.sql
-- Adds 'planning' stage support to baby_profiles for users who are
-- trying to conceive, going through IVF, adopting, using surrogacy,
-- or exploring their options.

-- ── 1. Add planning columns to baby_profiles ──────────────────────────────────
ALTER TABLE public.baby_profiles
  ADD COLUMN IF NOT EXISTS planning_sub_option TEXT,
  ADD COLUMN IF NOT EXISTS planning_expected_month TEXT; -- YYYY-MM format

-- ── 2. Add CHECK constraint for planning_sub_option ───────────────────────────
ALTER TABLE public.baby_profiles
  DROP CONSTRAINT IF EXISTS baby_profiles_planning_sub_option_check;
ALTER TABLE public.baby_profiles
  ADD CONSTRAINT baby_profiles_planning_sub_option_check
  CHECK (
    planning_sub_option IS NULL
    OR planning_sub_option IN (
      'trying_naturally',
      'ivf_fertility',
      'adopting',
      'surrogacy',
      'exploring'
    )
  );

-- ── 3. Update stage CHECK constraints on tables that have them ────────────────

-- daily_checkins
ALTER TABLE public.daily_checkins
  DROP CONSTRAINT IF EXISTS daily_checkins_stage_check;
ALTER TABLE public.daily_checkins
  ADD CONSTRAINT daily_checkins_stage_check
  CHECK (stage IN ('planning', 'pregnancy', 'infant', 'toddler', 'postpartum'));

-- content_articles
ALTER TABLE public.content_articles
  DROP CONSTRAINT IF EXISTS content_articles_stage_check;
ALTER TABLE public.content_articles
  ADD CONSTRAINT content_articles_stage_check
  CHECK (stage IN ('planning', 'pregnancy', 'infant', 'toddler', 'postpartum'));

-- weekly_guide_content (if it has a stage check)
DO $$ BEGIN
  ALTER TABLE public.weekly_guide_content
    DROP CONSTRAINT IF EXISTS weekly_guide_content_stage_check;
  ALTER TABLE public.weekly_guide_content
    ADD CONSTRAINT weekly_guide_content_stage_check
    CHECK (stage IN ('planning', 'pregnancy', 'infant', 'toddler', 'postpartum'));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ai_parent_profiles stage includes 'mixed' so add 'planning' there too
ALTER TABLE public.ai_parent_profiles
  DROP CONSTRAINT IF EXISTS ai_parent_profiles_stage_check;
ALTER TABLE public.ai_parent_profiles
  ADD CONSTRAINT ai_parent_profiles_stage_check
  CHECK (stage IN ('planning', 'pregnancy', 'infant', 'toddler', 'mixed'));

-- ── 4. Validate planning_expected_month format ────────────────────────────────
ALTER TABLE public.baby_profiles
  DROP CONSTRAINT IF EXISTS baby_profiles_planning_expected_month_format;
ALTER TABLE public.baby_profiles
  ADD CONSTRAINT baby_profiles_planning_expected_month_format
  CHECK (
    planning_expected_month IS NULL
    OR planning_expected_month ~ '^\d{4}-(0[1-9]|1[0-2])$'
  );
