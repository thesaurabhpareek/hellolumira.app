-- v35 Performance Indexes
-- Adds composite indexes on hot query paths to reduce sequential scans.
-- All statements use IF NOT EXISTS so this migration is safe to re-run.

-- Chat performance
-- Note: idx_chat_threads_listing exists on (profile_id, is_archived, last_message_at DESC)
-- but lacks baby_id. This composite covers multi-baby household listing queries.
CREATE INDEX IF NOT EXISTS idx_chat_threads_profile_baby
  ON chat_threads(profile_id, baby_id, is_archived, last_message_at DESC);

-- Note: idx_chat_messages_thread exists on (thread_id, created_at ASC).
-- This DESC variant serves reverse-chronological paging queries.
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_date
  ON chat_messages(thread_id, created_at DESC);

-- Check-ins
-- idx_daily_checkins_baby_date already exists with identical definition (v12) —
-- IF NOT EXISTS makes this a safe no-op.
CREATE INDEX IF NOT EXISTS idx_daily_checkins_baby_date
  ON daily_checkins(baby_id, checkin_date DESC);

-- Baby members
-- Single-column indexes on profile_id and baby_id exist (v12) but the composite
-- allows index-only scans on membership checks.
CREATE INDEX IF NOT EXISTS idx_baby_profile_members_profile
  ON baby_profile_members(profile_id, baby_id);

-- Tribe posts
-- idx_tribe_posts_tribe exists on (tribe_id, created_at DESC) (v15).
-- IF NOT EXISTS on the new name means the new index name is created as well,
-- serving queries that reference this name explicitly.
CREATE INDEX IF NOT EXISTS idx_tribe_posts_tribe_date
  ON tribe_posts(tribe_id, created_at DESC);

-- Notifications
-- idx_notifications_listing exists on (profile_id, created_at DESC) (v11) but
-- does not include is_read. This three-column composite enables filtered unread
-- queries to be covered without a heap fetch.
CREATE INDEX IF NOT EXISTS idx_notifications_profile_date
  ON notifications(profile_id, created_at DESC, is_read);

-- Concern sessions
-- idx_concern_sessions_baby_created exists on (baby_id, created_at DESC) (v12).
-- IF NOT EXISTS on this new name is a safe no-op if columns already covered.
CREATE INDEX IF NOT EXISTS idx_concern_sessions_baby_date
  ON concern_sessions(baby_id, created_at DESC);

-- Pattern observations
-- idx_pattern_observations_baby_triggered exists on (baby_id, triggered_at DESC) (v12).
-- IF NOT EXISTS on this new name is a safe no-op if columns already covered.
CREATE INDEX IF NOT EXISTS idx_pattern_observations_baby_date
  ON pattern_observations(baby_id, triggered_at DESC);
