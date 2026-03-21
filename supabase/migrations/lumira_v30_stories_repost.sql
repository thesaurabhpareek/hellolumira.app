-- v30: Add repost columns to stories table
ALTER TABLE stories
  ADD COLUMN IF NOT EXISTS repost_of_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS repost_attribution TEXT;
CREATE INDEX IF NOT EXISTS idx_stories_repost_of ON stories(repost_of_id) WHERE repost_of_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_stories_one_repost_per_user ON stories(profile_id, repost_of_id) WHERE repost_of_id IS NOT NULL;
