-- =============================================================================
-- Lumira v46: Seed Diverse AI Stories
-- =============================================================================
-- Inserts 8 diverse "AI parent" story circles into the stories strip.
-- Stories appear from different personas covering a range of parenting topics.
--
-- Strategy:
--   1. Temporarily disable FK replication checks so we can insert profile rows
--      without corresponding auth.users entries (service role migration only).
--   2. Insert minimal profile rows for each AI persona (c0000000-... UUIDs).
--   3. Insert one or more stories per persona.
--   4. Re-enable FK checks.
--
-- Personas and their stories:
--   c0000000-0000-0000-0000-000000000001  Priya M.     (pregnancy, first time mom milestone)
--   c0000000-0000-0000-0000-000000000002  James O.     (infant, dad sleep training)
--   c0000000-0000-0000-0000-000000000003  Carolina V.  (infant, working parent morning)
--   c0000000-0000-0000-0000-000000000004  Amara N.     (infant, funny twin moment)
--   c0000000-0000-0000-0000-000000000005  Fatima A.    (pregnancy, cravings story)
--   c0000000-0000-0000-0000-000000000006  Kenji M.     (toddler, tantrum survival)
--   c0000000-0000-0000-0000-000000000007  Rachel G.    (infant, breastfeeding journey)
--   c0000000-0000-0000-0000-000000000008  Liam P.      (infant, partner support moment)
-- =============================================================================

-- Disable FK constraint enforcement for this migration only
-- (required because these profiles don't exist in auth.users)
SET session_replication_role = 'replica';

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Insert minimal profile rows for AI story personas
-- ─────────────────────────────────────────────────────────────────────────────
-- We only set the columns the stories API joins on:
--   display_name, first_name, avatar_emoji
-- All other columns use their defaults.

INSERT INTO public.profiles (id, first_name, display_name, avatar_emoji, first_checkin_complete, seeds_balance, current_streak)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Priya',    'Priya M.',    '🧕', true, 0, 0),
  ('c0000000-0000-0000-0000-000000000002', 'James',    'James O.',    '👨', true, 0, 0),
  ('c0000000-0000-0000-0000-000000000003', 'Carolina', 'Carolina V.', '👩‍🦱', true, 0, 0),
  ('c0000000-0000-0000-0000-000000000004', 'Amara',    'Amara N.',    '👩‍🦱', true, 0, 0),
  ('c0000000-0000-0000-0000-000000000005', 'Fatima',   'Fatima A.',   '🧕', true, 0, 0),
  ('c0000000-0000-0000-0000-000000000006', 'Kenji',    'Kenji M.',    '👨', true, 0, 0),
  ('c0000000-0000-0000-0000-000000000007', 'Rachel',   'Rachel G.',   '👩‍🦰', true, 0, 0),
  ('c0000000-0000-0000-0000-000000000008', 'Liam',     'Liam P.',     '👨‍🦰', true, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Re-enable normal FK enforcement
-- ─────────────────────────────────────────────────────────────────────────────
SET session_replication_role = 'origin';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Insert seed stories
-- Stories use expires_at = now() + 7 days so they're visible for testing.
-- published_at is staggered so they appear in different recency positions.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.stories (
  profile_id,
  story_type,
  text_content,
  text_bg_color,
  poll_question,
  poll_option_a,
  poll_option_b,
  question_text,
  expires_at,
  published_at,
  is_hidden,
  is_archived
)
VALUES

  -- ── Priya M. — First-time mom milestone (text)
  (
    'c0000000-0000-0000-0000-000000000001',
    'text',
    '22 weeks and just felt baby Arya kick for the first time 🦶✨ I was sitting in a meeting and completely froze. Cried the whole drive home. First-time mom life is WILD.',
    'linear-gradient(135deg, #3D8178 0%, #2A5D56 100%)',
    NULL, NULL, NULL, NULL,
    now() + INTERVAL '7 days',
    now() - INTERVAL '4 hours',
    false, false
  ),

  -- ── James O. — Dad's perspective on sleep training (poll)
  (
    'c0000000-0000-0000-0000-000000000002',
    'poll',
    NULL,
    NULL,
    'Sleep training with a 6-week-old — did you do it?',
    'Yes, started early 😴',
    'No, followed their lead 🤱',
    NULL,
    now() + INTERVAL '7 days',
    now() - INTERVAL '3 hours',
    false, false
  ),

  -- ── Carolina V. — Working parent morning routine (text)
  (
    'c0000000-0000-0000-0000-000000000003',
    'text',
    'Back-to-work morning routine with Lucas (10 months): 5am pump → pack daycare bag → get him dressed while he tries to eat my phone → drop-off tears (mine, not his) → coffee in hand by 8:30. We are DOING it. 💪',
    'linear-gradient(135deg, #C4844E 0%, #A06B3E 100%)',
    NULL, NULL, NULL, NULL,
    now() + INTERVAL '7 days',
    now() - INTERVAL '2 hours 30 minutes',
    false, false
  ),

  -- ── Amara N. — Funny twin baby moment (text)
  (
    'c0000000-0000-0000-0000-000000000004',
    'text',
    'Twin update: Zion reached over and grabbed Zaire''s pacifier right out of his mouth and looked me DEAD in the eyes while doing it 😂 They are 2 months old. Already chaos. I love them so much it hurts.',
    'linear-gradient(135deg, #7B3F9E 0%, #5C2D7A 100%)',
    NULL, NULL, NULL, NULL,
    now() + INTERVAL '7 days',
    now() - INTERVAL '2 hours',
    false, false
  ),

  -- ── Fatima A. — Pregnancy cravings story (text)
  (
    'c0000000-0000-0000-0000-000000000005',
    'text',
    '11 weeks and my cravings make zero sense. Today: mango with tajín, then pickles, then a slice of plain white bread. My husband is scared of me. I am scared of me. Pregnancy is UNHINGED 😭🥭🥒🍞',
    'linear-gradient(135deg, #e8a87c 0%, #d4845e 100%)',
    NULL, NULL, NULL, NULL,
    now() + INTERVAL '7 days',
    now() - INTERVAL '1 hour 30 minutes',
    false, false
  ),

  -- ── Kenji M. — Toddler tantrum survival (question)
  (
    'c0000000-0000-0000-0000-000000000006',
    'question',
    NULL,
    NULL,
    NULL, NULL, NULL,
    'What''s your #1 toddler tantrum survival tip? Sora just discovered the word NO and I need all the help.',
    now() + INTERVAL '7 days',
    now() - INTERVAL '1 hour',
    false, false
  ),

  -- ── Rachel G. — Breastfeeding journey (text)
  (
    'c0000000-0000-0000-0000-000000000007',
    'text',
    'Week 3 with Olive. Breastfeeding is the hardest thing I have ever done. Cracked nipples, cluster feeds every 45 min, sobbing through letdown. BUT she gained 11oz this week and I am choosing to count that as a win 💙 No one prepares you for this part.',
    'linear-gradient(135deg, #2d3561 0%, #1e2245 100%)',
    NULL, NULL, NULL, NULL,
    now() + INTERVAL '7 days',
    now() - INTERVAL '45 minutes',
    false, false
  ),

  -- ── Liam P. — Partner's supportive moment (text)
  (
    'c0000000-0000-0000-0000-000000000008',
    'text',
    'Stay-at-home dad moment: wife landed after 4 days away for work. Rosie (8 months) saw her and absolutely LOST it with happiness. Watching that reunion from the doorway while holding a very fussy baby... yeah. Worth every hard day. 🥹',
    'linear-gradient(135deg, #1a3a2e 0%, #0d2219 100%)',
    NULL, NULL, NULL, NULL,
    now() + INTERVAL '7 days',
    now() - INTERVAL '20 minutes',
    false, false
  );
