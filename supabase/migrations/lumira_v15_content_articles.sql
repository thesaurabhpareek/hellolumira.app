-- =============================================================================
-- Lumira v15: Content Articles
-- =============================================================================
-- This migration creates:
--   1. content_articles table for week-by-week parenting content
--   2. RLS policies for public read access (authenticated users)
--   3. Indexes for efficient filtering by stage, week/month, and category
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. CONTENT_ARTICLES TABLE
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.content_articles (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  stage                  TEXT        NOT NULL CHECK (stage IN ('pregnancy', 'infant', 'toddler')),
  week_or_month          INT         NOT NULL,
  title                  TEXT        NOT NULL,
  subtitle               TEXT,
  body                   TEXT        NOT NULL,
  category               TEXT        NOT NULL CHECK (category IN (
                                       'nutrition', 'development', 'wellness',
                                       'safety', 'mental-health'
                                     )),
  author                 TEXT        NOT NULL DEFAULT 'Lumira Editorial',
  medically_reviewed     BOOLEAN     NOT NULL DEFAULT true,
  culturally_sensitive   BOOLEAN     NOT NULL DEFAULT true,
  reading_time_minutes   INT         NOT NULL DEFAULT 3,
  tags                   TEXT[]      DEFAULT '{}',
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.content_articles IS 'Curated week-by-week parenting articles across pregnancy, infant, and toddler stages';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. INDEXES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_content_articles_stage
  ON public.content_articles (stage);

CREATE INDEX IF NOT EXISTS idx_content_articles_stage_week
  ON public.content_articles (stage, week_or_month);

CREATE INDEX IF NOT EXISTS idx_content_articles_category
  ON public.content_articles (category);

CREATE INDEX IF NOT EXISTS idx_content_articles_stage_category
  ON public.content_articles (stage, category);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. AUTO-UPDATE updated_at TRIGGER
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_content_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_content_articles_updated_at
  BEFORE UPDATE ON public.content_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_content_articles_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.content_articles ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read articles
CREATE POLICY "Authenticated users can read articles"
  ON public.content_articles
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can insert/update/delete (admin operations)
CREATE POLICY "Service role can manage articles"
  ON public.content_articles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
