-- =============================================================================
-- Lumira v11: Notifications + Chat
-- Project: gomjthjjqcmrhnpwsdqh.supabase.co
-- =============================================================================
-- This migration creates:
--   1. notifications table with RLS
--   2. chat_threads + chat_messages tables with RLS
--   3. Trigger to auto-update chat_threads on new message
--   4. Cleanup function for expired / stale notifications
-- =============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. NOTIFICATIONS TABLE
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.notifications (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  baby_id       UUID        REFERENCES public.baby_profiles(id) ON DELETE SET NULL,

  type          TEXT        NOT NULL CHECK (type IN (
                              'pattern_detected', 'concern_followup', 'escalation_reminder',
                              'milestone_approaching', 'weekly_guide_ready',
                              'tribe_reply', 'tribe_reaction', 'tribe_mention',
                              'partner_joined', 'streak_at_risk', 'badge_earned',
                              'new_article', 'system_message'
                            )),

  title         TEXT        NOT NULL,
  body          TEXT        NOT NULL DEFAULT '',
  emoji         TEXT,
  action_url    TEXT,

  is_read       BOOLEAN     NOT NULL DEFAULT false,
  is_dismissed  BOOLEAN     NOT NULL DEFAULT false,
  read_at       TIMESTAMPTZ,

  -- Polymorphic source reference (e.g. source_type='concern_session', source_id=<uuid>)
  source_type   TEXT,
  source_id     UUID,

  -- 1 = high, 2 = normal, 3 = low
  priority      SMALLINT    NOT NULL DEFAULT 2 CHECK (priority IN (1, 2, 3)),

  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.notifications IS 'In-app notifications for each user';
COMMENT ON COLUMN public.notifications.priority IS '1 = high, 2 = normal, 3 = low';
COMMENT ON COLUMN public.notifications.source_type IS 'Polymorphic source: table name of the originating entity';
COMMENT ON COLUMN public.notifications.source_id IS 'Polymorphic source: row id of the originating entity';


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. NOTIFICATIONS INDEXES
-- ─────────────────────────────────────────────────────────────────────────────

-- Unread count queries: WHERE profile_id = ? AND is_read = false AND is_dismissed = false
CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON public.notifications (profile_id, is_read, is_dismissed)
  WHERE is_read = false AND is_dismissed = false;

-- Paginated listing: ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_notifications_listing
  ON public.notifications (profile_id, created_at DESC);

-- Cleanup cron: WHERE expires_at < NOW()
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at
  ON public.notifications (expires_at)
  WHERE expires_at IS NOT NULL;

-- Batching tribe reactions by source
CREATE INDEX IF NOT EXISTS idx_notifications_source
  ON public.notifications (source_type, source_id)
  WHERE source_type IS NOT NULL;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. NOTIFICATIONS RLS
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can read only their own notifications
CREATE POLICY notifications_select_own ON public.notifications
  FOR SELECT
  USING (auth.uid() = profile_id);

-- Users can update only their own notifications (mark read, dismiss)
CREATE POLICY notifications_update_own ON public.notifications
  FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- Only the service role can insert notifications (system-generated)
-- No explicit INSERT policy for authenticated users means inserts are denied.
-- Service role bypasses RLS, so no policy needed for service inserts.

-- No DELETE policy for users; only service role (which bypasses RLS) can delete.


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. CHAT THREADS TABLE
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.chat_threads (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id            UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  baby_id               UUID        NOT NULL REFERENCES public.baby_profiles(id) ON DELETE CASCADE,
  title                 TEXT,                               -- auto-generated from first message
  last_message_preview  TEXT,
  last_message_at       TIMESTAMPTZ DEFAULT now(),
  message_count         INT         NOT NULL DEFAULT 0,
  is_archived           BOOLEAN     NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.chat_threads IS 'Parent-facing chat threads with Lumira AI';
COMMENT ON COLUMN public.chat_threads.title IS 'Auto-generated from the first message in the thread';


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. CHAT MESSAGES TABLE
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id         UUID        NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  role              TEXT        NOT NULL CHECK (role IN ('parent', 'lumira')),
  content           TEXT        NOT NULL,
  emotional_signal  TEXT        CHECK (emotional_signal IN ('ok', 'tired', 'struggling', 'distressed')),
  red_flag_category TEXT,
  metadata          JSONB       DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.chat_messages IS 'Individual messages within a chat thread';
COMMENT ON COLUMN public.chat_messages.emotional_signal IS 'Detected emotional state of the parent in this message';
COMMENT ON COLUMN public.chat_messages.red_flag_category IS 'If set, indicates a clinical red flag was detected';


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. CHAT INDEXES
-- ─────────────────────────────────────────────────────────────────────────────

-- Thread listing: active threads first, most recent at top
CREATE INDEX IF NOT EXISTS idx_chat_threads_listing
  ON public.chat_threads (profile_id, is_archived, last_message_at DESC);

-- Message listing within a thread, chronological order
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread
  ON public.chat_messages (thread_id, created_at ASC);


-- ─────────────────────────────────────────────────────────────────────────────
-- 7. CHAT RLS
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Threads: users can only see their own
CREATE POLICY chat_threads_select_own ON public.chat_threads
  FOR SELECT
  USING (auth.uid() = profile_id);

-- Threads: users can insert their own
CREATE POLICY chat_threads_insert_own ON public.chat_threads
  FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- Threads: users can update their own (e.g. archive)
CREATE POLICY chat_threads_update_own ON public.chat_threads
  FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- Messages: users can see messages in their own threads
CREATE POLICY chat_messages_select_own ON public.chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_threads
      WHERE chat_threads.id = chat_messages.thread_id
        AND chat_threads.profile_id = auth.uid()
    )
  );

-- Messages: users can insert messages into their own threads
CREATE POLICY chat_messages_insert_own ON public.chat_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_threads
      WHERE chat_threads.id = chat_messages.thread_id
        AND chat_threads.profile_id = auth.uid()
    )
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- 8. TRIGGER: Auto-update chat_threads on new message
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_chat_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.chat_threads
  SET
    last_message_preview = LEFT(NEW.content, 120),
    last_message_at      = NEW.created_at,
    message_count        = message_count + 1,
    updated_at           = now()
  WHERE id = NEW.thread_id;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_chat_message()
  IS 'Updates chat_threads summary fields when a new message is inserted';

-- Drop existing trigger if present (idempotent)
DROP TRIGGER IF EXISTS on_chat_message_insert ON public.chat_messages;

CREATE TRIGGER on_chat_message_insert
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_chat_message();


-- ─────────────────────────────────────────────────────────────────────────────
-- 9. FUNCTION: Notification daily cleanup
-- ─────────────────────────────────────────────────────────────────────────────
-- Call via pg_cron or Supabase cron:
--   SELECT public.cleanup_expired_notifications();
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.cleanup_expired_notifications()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INT;
BEGIN
  WITH deleted AS (
    DELETE FROM public.notifications
    WHERE
      -- Expired notifications
      (expires_at IS NOT NULL AND expires_at < now())
      OR
      -- Read notifications older than 7 days
      (is_read = true AND created_at < now() - INTERVAL '7 days')
    RETURNING id
  )
  SELECT count(*) INTO deleted_count FROM deleted;

  RETURN deleted_count;
END;
$$;

COMMENT ON FUNCTION public.cleanup_expired_notifications()
  IS 'Deletes expired and stale read notifications. Returns the number of rows removed. Call daily via cron.';
