-- ============================================================================
-- Lumira v33 — Extended Profile Attributes
-- Adds new optional profile fields for richer parent profiles,
-- community matching, and profile completion gamification.
-- ============================================================================

-- ── Parent Info ─────────────────────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pronouns text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_city text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_month text; -- YYYY-MM format

-- ── Parenting Context ───────────────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS parenting_style text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS feeding_method text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_type text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS number_of_children integer;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS languages_spoken text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS work_status text;

-- ── Interests & Support ─────────────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS looking_for text[] DEFAULT '{}';

-- ── Profile Completion Gamification ─────────────────────────────────────────
-- Tracks which field completions have already been rewarded with seeds.
-- Structure: { "bio": true, "pronouns": true, ... }
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_completion_seeds_awarded jsonb DEFAULT '{}'::jsonb;

-- ── Constraints ─────────────────────────────────────────────────────────────
-- Bio max 280 chars enforced at app level; add a loose DB check as safety net
ALTER TABLE profiles ADD CONSTRAINT profiles_bio_length CHECK (char_length(bio) <= 500);

-- Valid pronouns
ALTER TABLE profiles ADD CONSTRAINT profiles_pronouns_check
  CHECK (pronouns IS NULL OR pronouns IN ('he/him', 'she/her', 'they/them', 'he/they', 'she/they', 'custom'));

-- Valid parenting styles
ALTER TABLE profiles ADD CONSTRAINT profiles_parenting_style_check
  CHECK (parenting_style IS NULL OR parenting_style IN (
    'attachment', 'gentle', 'authoritative', 'permissive', 'helicopter',
    'free-range', 'montessori', 'exploring', 'other'
  ));

-- Valid feeding methods
ALTER TABLE profiles ADD CONSTRAINT profiles_feeding_method_check
  CHECK (feeding_method IS NULL OR feeding_method IN (
    'breastfeeding', 'formula', 'combo', 'solids', 'pumping', 'other'
  ));

-- Valid birth types
ALTER TABLE profiles ADD CONSTRAINT profiles_birth_type_check
  CHECK (birth_type IS NULL OR birth_type IN (
    'vaginal', 'c-section', 'vbac', 'prefer_not_to_say'
  ));

-- Valid work statuses
ALTER TABLE profiles ADD CONSTRAINT profiles_work_status_check
  CHECK (work_status IS NULL OR work_status IN (
    'stay-at-home', 'working-full-time', 'working-part-time',
    'on-leave', 'freelance', 'other'
  ));

-- Number of children sanity check
ALTER TABLE profiles ADD CONSTRAINT profiles_number_of_children_check
  CHECK (number_of_children IS NULL OR (number_of_children >= 0 AND number_of_children <= 20));
