/**
 * @module ContentRefreshAPI
 * @description POST /api/content/refresh — Generates fresh community content
 *   (stories + tribe posts) using Claude AI. Designed to be called by a cron
 *   job or scheduled task to keep the app feeling alive.
 *
 * Protected by CONTENT_REFRESH_SECRET in the Authorization header.
 *
 * Topic rotation:
 *   Monday    = wellness
 *   Tuesday   = milestones
 *   Wednesday = nutrition
 *   Thursday  = relationships
 *   Friday    = fun/light
 *   Sat/Sun   = reflection
 */

export const dynamic = 'force-dynamic'
export const maxDuration = 30

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { callClaudeJSON } from '@/lib/claude'
import { SECURITY_HEADERS } from '@/lib/utils'

// ── Constants ───────────────────────────────────────────────────────────────

const CONTENT_REFRESH_SECRET = process.env.CONTENT_REFRESH_SECRET
const SYSTEM_PROFILE_ID = process.env.LUMIRA_SYSTEM_PROFILE_ID || '00000000-0000-0000-0000-000000000001'
const LUMIRA_COMMUNITY_AI_ID = 'b0000000-0000-0000-0000-00000000ffff'

const DAY_THEMES: Record<number, { name: string; description: string }> = {
  0: { name: 'reflection', description: 'Weekend reflection, gratitude, and looking back on the week' },
  1: { name: 'wellness', description: 'Parent and baby wellness, self-care, mental health, physical recovery' },
  2: { name: 'milestones', description: 'Baby milestones, development, growth celebrations, first moments' },
  3: { name: 'nutrition', description: 'Feeding, meal prep, nutrition for parents and babies, recipes, hydration' },
  4: { name: 'relationships', description: 'Partner communication, family dynamics, friendships, support systems' },
  5: { name: 'fun', description: 'Fun, light-hearted, humor, parenting wins, silly moments, weekend plans' },
  6: { name: 'reflection', description: 'Weekend reflection, gratitude, and looking back on the week' },
}

const STORY_BG_COLORS = [
  'linear-gradient(135deg, #3D8178 0%, #2A5D56 100%)',
  'linear-gradient(135deg, #C4844E 0%, #A06B3E 100%)',
  'linear-gradient(135deg, #2d3561 0%, #1e2245 100%)',
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  'linear-gradient(135deg, #2d5a27 0%, #1a3a16 100%)',
  'linear-gradient(135deg, #e8a87c 0%, #d4845e 100%)',
  'linear-gradient(135deg, #614385 0%, #516395 100%)',
  'linear-gradient(135deg, #C06C84 0%, #6C5B7B 100%)',
]

// ── Tribe Data ──────────────────────────────────────────────────────────────

type TribeInfo = { id: string; slug: string; name: string; category: string }

const TRIBE_POOL: TribeInfo[] = [
  { id: 'a0000000-0000-0000-0000-000000000001', slug: 'first-trimester-warriors', name: 'First Trimester Warriors', category: 'pregnancy' },
  { id: 'a0000000-0000-0000-0000-000000000002', slug: 'second-trimester-glow', name: 'Second Trimester Glow', category: 'pregnancy' },
  { id: 'a0000000-0000-0000-0000-000000000003', slug: 'third-trimester-birth-prep', name: 'Third Trimester & Birth Prep', category: 'pregnancy' },
  { id: 'a0000000-0000-0000-0000-000000000004', slug: 'newborn-life', name: 'Newborn Life', category: 'infant' },
  { id: 'a0000000-0000-0000-0000-000000000005', slug: 'sleep-deprived-club', name: 'Sleep Deprived Club', category: 'infant' },
  { id: 'a0000000-0000-0000-0000-000000000006', slug: 'feeding-journey', name: 'Feeding Journey', category: 'infant' },
  { id: 'a0000000-0000-0000-0000-000000000007', slug: 'toddler-tornado', name: 'Toddler Tornado', category: 'toddler' },
  { id: 'a0000000-0000-0000-0000-000000000008', slug: 'first-time-parents', name: 'First-Time Parents', category: 'general' },
  { id: 'a0000000-0000-0000-0000-000000000009', slug: 'working-parents', name: 'Working Parents', category: 'general' },
  { id: 'a0000000-0000-0000-0000-000000000010', slug: 'partner-support', name: 'Partner Support', category: 'support' },
  { id: 'a0000000-0000-0000-0000-000000000019', slug: 'anxiety-ppd-support', name: 'Anxiety & PPD Support', category: 'support' },
  { id: 'a0000000-0000-0000-0000-000000000020', slug: 'dads-co-parents', name: 'Dads & Co-Parents', category: 'support' },
]

// AI profiles that can be attributed as post authors
const AI_AUTHOR_IDS = [
  'b0000000-0000-0000-0000-000000000001', // Priya
  'b0000000-0000-0000-0000-000000000002', // Mei Lin
  'b0000000-0000-0000-0000-000000000004', // Sofia
  'b0000000-0000-0000-0000-000000000006', // James
  'b0000000-0000-0000-0000-000000000008', // Amara
  'b0000000-0000-0000-0000-000000000010', // Deepa
  'b0000000-0000-0000-0000-000000000012', // Rachel
  'b0000000-0000-0000-0000-000000000014', // Kenji
  'b0000000-0000-0000-0000-000000000015', // Zara
  'b0000000-0000-0000-0000-000000000017', // Nneka
  'b0000000-0000-0000-0000-000000000020', // Emma
  'b0000000-0000-0000-0000-000000000025', // Marcus
  LUMIRA_COMMUNITY_AI_ID,
]

// ── Helpers ─────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

function getSeason(): string {
  const month = new Date().getMonth() + 1
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

// ── Claude Prompts ──────────────────────────────────────────────────────────

const STORY_GENERATION_PROMPT = `You generate short-form content for Lumira, a parenting companion app.
You create Stories (like Instagram stories) that appear in a story strip at the top of the app.

VOICE:
- Warm, gentle, knowledgeable, empathetic
- Never preachy, never alarmist
- Inclusive of all family structures
- No medical advice — only gentle suggestions with "you might try" language
- Use emojis naturally but not excessively (1-2 per story)

RULES:
- Text stories: max 120 characters. Short, punchy, relatable.
- Poll stories: question max 80 chars, each option max 40 chars.
- Question stories: prompt max 100 chars. Open-ended, inviting.
- Content must be medically cautious — never diagnose or prescribe.
- Never assume family structure (avoid "your husband/wife" — use "partner" or "your people").

Return ONLY valid JSON, no markdown fences.`

const TRIBE_POST_PROMPT = `You generate discussion posts for Lumira, a parenting community app.
Posts appear in Tribes (topic-based communities) and should feel organic and conversational.

VOICE:
- Sounds like a real parent writing, not a corporation
- Warm, honest, sometimes funny, sometimes vulnerable
- Opens discussion rather than closing it — always ends with a question or invitation
- Inclusive of all parenting approaches (no "breast is best" vs formula debates)
- Never gives medical advice
- Uses casual language, occasional humor, light emoji use

POST FORMAT:
- Title: 5-12 words, conversational, might use a colon or question mark
- Body: 2-4 short paragraphs, 100-300 words total
- post_type: one of "discussion", "question", "tip", "celebration", "vent"
- emoji_tag: single emoji that captures the post mood

Return ONLY valid JSON, no markdown fences.`

// ── Content Generation Types ────────────────────────────────────────────────

type GeneratedStory = {
  story_type: 'text' | 'poll' | 'question'
  text_content?: string
  poll_question?: string
  poll_option_a?: string
  poll_option_b?: string
  question_prompt?: string
}

type GeneratedTribePost = {
  title: string
  body: string
  post_type: 'discussion' | 'question' | 'tip' | 'celebration' | 'vent'
  emoji_tag: string
}

// ── Main Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // ── Auth check ──
    if (!CONTENT_REFRESH_SECRET) {
      console.error('[content/refresh] CONTENT_REFRESH_SECRET not configured')
      return NextResponse.json(
        { error: 'Content refresh not configured' },
        { status: 503, headers: SECURITY_HEADERS }
      )
    }

    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${CONTENT_REFRESH_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: SECURITY_HEADERS }
      )
    }

    const supabase = await createServiceClient()
    const now = new Date()
    const dayOfWeek = now.getDay()
    const theme = DAY_THEMES[dayOfWeek]
    const season = getSeason()

    console.log(`[content/refresh] Running for ${theme.name} (${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek]}), season: ${season}`)

    // ── Check recent content (avoid duplicates) ──
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString()

    const { data: recentStories } = await supabase
      .from('stories')
      .select('text_content, poll_question, question_prompt')
      .eq('profile_id', SYSTEM_PROFILE_ID)
      .gte('published_at', sixHoursAgo)

    const recentStoryTexts = (recentStories || [])
      .map((s) => s.text_content || s.poll_question || s.question_prompt || '')
      .filter(Boolean)

    const { data: recentPosts } = await supabase
      .from('tribe_posts')
      .select('title, body')
      .eq('ai_profile_id', LUMIRA_COMMUNITY_AI_ID)
      .gte('created_at', sixHoursAgo)

    const recentPostTitles = (recentPosts || []).map((p) => p.title || '').filter(Boolean)

    // ── Generate Stories via Claude ──
    const storyTypes = pickN(['text', 'text', 'poll', 'question'] as const, 3)

    const storiesPrompt = `Generate exactly 3 stories for a parenting app. Today's theme: "${theme.name}" — ${theme.description}.
Current season: ${season}.

Story types needed (in order): ${storyTypes.join(', ')}

${recentStoryTexts.length > 0 ? `AVOID duplicating these recent stories:\n${recentStoryTexts.map(t => `- "${t}"`).join('\n')}\n` : ''}

Return a JSON array of 3 objects. Each object must have:
- "story_type": "${storyTypes[0]}" | "${storyTypes[1]}" | "${storyTypes[2]}"

For "text" type:
  - "text_content": string (max 120 chars)

For "poll" type:
  - "poll_question": string (max 80 chars)
  - "poll_option_a": string (max 40 chars)
  - "poll_option_b": string (max 40 chars)

For "question" type:
  - "question_prompt": string (max 100 chars)

Return ONLY the JSON array.`

    let generatedStories: GeneratedStory[] = []
    try {
      generatedStories = await callClaudeJSON<GeneratedStory[]>(
        STORY_GENERATION_PROMPT,
        storiesPrompt,
        800
      )
    } catch (err) {
      console.error('[content/refresh] Failed to generate stories:', err)
    }

    // ── Insert Stories ──
    const storiesCreated: string[] = []
    for (const story of generatedStories) {
      const publishedAt = now.toISOString()
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()

      const row: Record<string, unknown> = {
        profile_id: SYSTEM_PROFILE_ID,
        story_type: story.story_type,
        published_at: publishedAt,
        expires_at: expiresAt,
      }

      switch (story.story_type) {
        case 'text':
          row.text_content = (story.text_content || '').slice(0, 280)
          row.bg_color = pick(STORY_BG_COLORS)
          break
        case 'poll':
          row.poll_question = (story.poll_question || '').slice(0, 200)
          row.poll_option_a = (story.poll_option_a || '').slice(0, 100)
          row.poll_option_b = (story.poll_option_b || '').slice(0, 100)
          break
        case 'question':
          row.question_prompt = (story.question_prompt || '').slice(0, 200)
          break
      }

      const { data, error } = await supabase
        .from('stories')
        .insert(row)
        .select('id')
        .single()

      if (error) {
        console.error('[content/refresh] Story insert error:', error.message)
      } else if (data) {
        storiesCreated.push(data.id)
      }
    }

    // ── Generate Tribe Posts ──
    const targetTribes = pickN(TRIBE_POOL, 2)
    const postsCreated: string[] = []

    for (const tribe of targetTribes) {
      const postPrompt = `Generate 1 discussion post for the "${tribe.name}" tribe (${tribe.category} category) in a parenting app.
Today's theme: "${theme.name}" — ${theme.description}.
Current season: ${season}.

The tribe is about: ${tribe.name}

${recentPostTitles.length > 0 ? `AVOID topics similar to these recent posts:\n${recentPostTitles.map(t => `- "${t}"`).join('\n')}\n` : ''}

Return a JSON object with:
- "title": string (5-12 words)
- "body": string (2-4 paragraphs, 100-300 words, conversational parent voice)
- "post_type": "discussion" | "question" | "tip" | "celebration" | "vent"
- "emoji_tag": string (single emoji)

Return ONLY the JSON object.`

      try {
        const post = await callClaudeJSON<GeneratedTribePost>(
          TRIBE_POST_PROMPT,
          postPrompt,
          600
        )

        const aiProfileId = pick(AI_AUTHOR_IDS)

        const { data, error } = await supabase
          .from('tribe_posts')
          .insert({
            tribe_id: tribe.id,
            ai_profile_id: aiProfileId,
            title: (post.title || '').slice(0, 200),
            body: (post.body || '').slice(0, 5000),
            post_type: post.post_type || 'discussion',
            emoji_tag: post.emoji_tag || null,
          })
          .select('id')
          .single()

        if (error) {
          console.error(`[content/refresh] Post insert error for ${tribe.slug}:`, error.message)
        } else if (data) {
          postsCreated.push(data.id)

          // Update tribe post count
          const { count } = await supabase
            .from('tribe_posts')
            .select('id', { count: 'exact', head: true })
            .eq('tribe_id', tribe.id)

          if (count !== null) {
            await supabase
              .from('tribes')
              .update({ post_count: count })
              .eq('id', tribe.id)
          }
        }
      } catch (err) {
        console.error(`[content/refresh] Failed to generate post for ${tribe.slug}:`, err)
      }
    }

    console.log(`[content/refresh] Created ${storiesCreated.length} stories, ${postsCreated.length} tribe posts`)

    return NextResponse.json({
      success: true,
      theme: theme.name,
      season,
      stories_created: storiesCreated.length,
      posts_created: postsCreated.length,
      story_ids: storiesCreated,
      post_ids: postsCreated,
    }, { headers: SECURITY_HEADERS })

  } catch (err) {
    console.error('[content/refresh] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}
