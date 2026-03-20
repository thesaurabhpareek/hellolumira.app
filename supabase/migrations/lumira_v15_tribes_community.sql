-- =============================================================================
-- Lumira v15: Tribes Community System
-- =============================================================================
-- Creates:
--   1. tribes table
--   2. tribe_members junction table
--   3. tribe_posts table
--   4. tribe_comments table
--   5. tribe_reactions table
--   6. ai_parent_profiles table (for seeded AI agents)
--   7. Seed data: 10 tribes, 20 AI parents, posts, comments, reactions
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. TRIBES TABLE
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.tribes (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL UNIQUE,
  slug          TEXT        NOT NULL UNIQUE,
  description   TEXT        NOT NULL DEFAULT '',
  emoji         TEXT        NOT NULL DEFAULT '',
  stage_filter  TEXT,       -- e.g. 'pregnancy', 'infant', 'toddler', 'any'
  week_min      INT,
  week_max      INT,
  month_min     INT,
  month_max     INT,
  color         TEXT        NOT NULL DEFAULT '#3D8178',
  member_count  INT         NOT NULL DEFAULT 0,
  post_count    INT         NOT NULL DEFAULT 0,
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. AI PARENT PROFILES (synthetic community members)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.ai_parent_profiles (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name    TEXT        NOT NULL,
  avatar_emoji    TEXT        NOT NULL DEFAULT '👤',
  bio             TEXT        NOT NULL DEFAULT '',
  stage           TEXT        NOT NULL CHECK (stage IN ('pregnancy','infant','toddler','mixed')),
  baby_name       TEXT,
  baby_age_desc   TEXT,
  location        TEXT,
  personality     TEXT        NOT NULL DEFAULT 'friendly',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. TRIBE MEMBERS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.tribe_members (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tribe_id        UUID        NOT NULL REFERENCES public.tribes(id) ON DELETE CASCADE,
  -- One of these will be set
  profile_id      UUID        REFERENCES public.profiles(id) ON DELETE CASCADE,
  ai_profile_id   UUID        REFERENCES public.ai_parent_profiles(id) ON DELETE CASCADE,
  role            TEXT        NOT NULL DEFAULT 'member' CHECK (role IN ('member','moderator','admin')),
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tribe_id, profile_id),
  UNIQUE(tribe_id, ai_profile_id),
  CHECK (
    (profile_id IS NOT NULL AND ai_profile_id IS NULL) OR
    (profile_id IS NULL AND ai_profile_id IS NOT NULL)
  )
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. TRIBE POSTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.tribe_posts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tribe_id        UUID        NOT NULL REFERENCES public.tribes(id) ON DELETE CASCADE,
  profile_id      UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  ai_profile_id   UUID        REFERENCES public.ai_parent_profiles(id) ON DELETE SET NULL,
  title           TEXT,
  body            TEXT        NOT NULL,
  post_type       TEXT        NOT NULL DEFAULT 'discussion' CHECK (post_type IN ('discussion','question','tip','celebration','vent','poll')),
  emoji_tag       TEXT,
  is_pinned       BOOLEAN     NOT NULL DEFAULT false,
  comment_count   INT         NOT NULL DEFAULT 0,
  reaction_count  INT         NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (profile_id IS NOT NULL AND ai_profile_id IS NULL) OR
    (profile_id IS NULL AND ai_profile_id IS NOT NULL)
  )
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. TRIBE COMMENTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.tribe_comments (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id         UUID        NOT NULL REFERENCES public.tribe_posts(id) ON DELETE CASCADE,
  parent_id       UUID        REFERENCES public.tribe_comments(id) ON DELETE CASCADE,
  profile_id      UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  ai_profile_id   UUID        REFERENCES public.ai_parent_profiles(id) ON DELETE SET NULL,
  body            TEXT        NOT NULL,
  reaction_count  INT         NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (profile_id IS NOT NULL AND ai_profile_id IS NULL) OR
    (profile_id IS NULL AND ai_profile_id IS NOT NULL)
  )
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. TRIBE REACTIONS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.tribe_reactions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id         UUID        REFERENCES public.tribe_posts(id) ON DELETE CASCADE,
  comment_id      UUID        REFERENCES public.tribe_comments(id) ON DELETE CASCADE,
  profile_id      UUID        REFERENCES public.profiles(id) ON DELETE CASCADE,
  ai_profile_id   UUID        REFERENCES public.ai_parent_profiles(id) ON DELETE CASCADE,
  reaction_type   TEXT        NOT NULL DEFAULT '❤️' CHECK (reaction_type IN ('❤️','👏','🤗','😂','💪','🙏')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (post_id IS NOT NULL OR comment_id IS NOT NULL)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_tribe_members_tribe ON public.tribe_members(tribe_id);
CREATE INDEX IF NOT EXISTS idx_tribe_members_profile ON public.tribe_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_tribe_posts_tribe ON public.tribe_posts(tribe_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tribe_comments_post ON public.tribe_comments(post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_tribe_reactions_post ON public.tribe_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_tribe_reactions_comment ON public.tribe_reactions(comment_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS POLICIES
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.tribes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_parent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tribe_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tribe_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tribe_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tribe_reactions ENABLE ROW LEVEL SECURITY;

-- Everyone can read tribes, AI profiles, posts, comments, reactions
CREATE POLICY "tribes_select_all" ON public.tribes FOR SELECT USING (true);
CREATE POLICY "ai_profiles_select_all" ON public.ai_parent_profiles FOR SELECT USING (true);
CREATE POLICY "tribe_posts_select_all" ON public.tribe_posts FOR SELECT USING (true);
CREATE POLICY "tribe_comments_select_all" ON public.tribe_comments FOR SELECT USING (true);
CREATE POLICY "tribe_reactions_select_all" ON public.tribe_reactions FOR SELECT USING (true);
CREATE POLICY "tribe_members_select_all" ON public.tribe_members FOR SELECT USING (true);

-- Users can manage their own memberships
CREATE POLICY "tribe_members_insert_own" ON public.tribe_members FOR INSERT
  WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "tribe_members_delete_own" ON public.tribe_members FOR DELETE
  USING (auth.uid() = profile_id);

-- Users can create/edit their own posts
CREATE POLICY "tribe_posts_insert_own" ON public.tribe_posts FOR INSERT
  WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "tribe_posts_update_own" ON public.tribe_posts FOR UPDATE
  USING (auth.uid() = profile_id);

-- Users can create their own comments
CREATE POLICY "tribe_comments_insert_own" ON public.tribe_comments FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- Users can manage their own reactions
CREATE POLICY "tribe_reactions_insert_own" ON public.tribe_reactions FOR INSERT
  WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "tribe_reactions_delete_own" ON public.tribe_reactions FOR DELETE
  USING (auth.uid() = profile_id);
