/**
 * @module StoriesAPI
 * @description GET /api/stories — Story strip data (grouped by author)
 *              POST /api/stories — Create a new story
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { SECURITY_HEADERS } from '@/lib/utils'
import { isValidEnum, sanitizeString } from '@/lib/validation'
import type { Story, StoryStripItem, StoryType } from '@/types/app'

const ALLOWED_STORY_TYPES: readonly StoryType[] = ['text', 'image', 'poll', 'question'] as const

// Supabase storage domain validation
const SUPABASE_STORAGE_PATTERN = /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\//

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: SECURITY_HEADERS })
    }

    // Fetch active stories (not expired, not hidden) + all own stories
    const now = new Date().toISOString()

    // Active stories from others
    const { data: activeStories, error: activeErr } = await supabase
      .from('stories')
      .select(`
        *,
        profiles!stories_profile_id_fkey(display_name, first_name, avatar_emoji)
      `)
      .gt('expires_at', now)
      .eq('is_hidden', false)
      .neq('profile_id', user.id)
      .order('published_at', { ascending: false })

    if (activeErr) {
      console.error('[GET /api/stories] Active stories error:', activeErr.message)
      return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500, headers: SECURITY_HEADERS })
    }

    // Own stories (regardless of expiry/hidden)
    const { data: ownStories, error: ownErr } = await supabase
      .from('stories')
      .select(`
        *,
        profiles!stories_profile_id_fkey(display_name, first_name, avatar_emoji)
      `)
      .eq('profile_id', user.id)
      .order('published_at', { ascending: false })

    if (ownErr) {
      console.error('[GET /api/stories] Own stories error:', ownErr.message)
      return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500, headers: SECURITY_HEADERS })
    }

    const allStories = [...(ownStories || []), ...(activeStories || [])]

    // Fetch views for current user to determine unread status
    const storyIds = allStories.map(s => s.id)
    let viewedStoryIds = new Set<string>()
    if (storyIds.length > 0) {
      const { data: views } = await supabase
        .from('story_views')
        .select('story_id')
        .eq('viewer_id', user.id)
        .in('story_id', storyIds)

      viewedStoryIds = new Set((views || []).map(v => v.story_id))
    }

    // Group by author
    const groupMap = new Map<string, StoryStripItem>()

    for (const story of allStories) {
      const profile = story.profiles as { display_name: string | null; first_name: string | null; avatar_emoji: string | null } | null
      const profileId = story.profile_id as string

      if (!groupMap.has(profileId)) {
        groupMap.set(profileId, {
          profile_id: profileId,
          display_name: profile?.display_name || profile?.first_name || 'Parent',
          avatar_url: profile?.avatar_emoji || null,
          stories: [],
          has_unread: false,
        })
      }

      const { profiles: _profiles, ...storyData } = story
      const group = groupMap.get(profileId)!
      group.stories.push(storyData as Story)

      // Mark group as unread if any story hasn't been viewed
      if (!viewedStoryIds.has(story.id)) {
        group.has_unread = true
      }
    }

    // Sort: own stories first, then by most recent story in group
    const stories = Array.from(groupMap.values()).sort((a, b) => {
      if (a.profile_id === user.id) return -1
      if (b.profile_id === user.id) return 1
      const aLatest = a.stories[0]?.published_at || ''
      const bLatest = b.stories[0]?.published_at || ''
      return bLatest.localeCompare(aLatest)
    })

    return NextResponse.json({ stories }, { headers: SECURITY_HEADERS })
  } catch (err) {
    console.error('[GET /api/stories] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: SECURITY_HEADERS })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: SECURITY_HEADERS })
    }

    // Rate limit: 5 stories per 24 hours
    const rateLimit = await checkRateLimit(`story:${user.id}`, 5, 24 * 60 * 60 * 1000)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'You can only post 5 stories per day. Please wait before posting again.' },
        { status: 429, headers: { ...SECURITY_HEADERS, 'Retry-After': String(rateLimit.retryAfter) } }
      )
    }

    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: SECURITY_HEADERS })
    }

    // Validate story_type
    const storyType = body.story_type as string
    if (!isValidEnum(storyType, ALLOWED_STORY_TYPES)) {
      return NextResponse.json(
        { error: 'story_type must be one of: text, image, poll, question' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    // Type-specific validation
    let textContent: string | null = null
    let bgColor: string | null = null
    let imageUrl: string | null = null
    let imageCaption: string | null = null
    let pollQuestion: string | null = null
    let pollOptionA: string | null = null
    let pollOptionB: string | null = null
    let questionPrompt: string | null = null

    switch (storyType) {
      case 'text': {
        if (!body.text_content || typeof body.text_content !== 'string') {
          return NextResponse.json({ error: 'text_content is required for text stories' }, { status: 400, headers: SECURITY_HEADERS })
        }
        textContent = sanitizeString(body.text_content as string, 280)
        if (textContent.length === 0) {
          return NextResponse.json({ error: 'text_content cannot be empty' }, { status: 400, headers: SECURITY_HEADERS })
        }
        if (typeof body.bg_color === 'string') {
          bgColor = sanitizeString(body.bg_color, 50)
        }
        break
      }
      case 'image': {
        if (body.image_url && typeof body.image_url === 'string') {
          imageUrl = sanitizeString(body.image_url, 2000)
          if (!SUPABASE_STORAGE_PATTERN.test(imageUrl)) {
            return NextResponse.json({ error: 'image_url must be a Supabase storage URL' }, { status: 400, headers: SECURITY_HEADERS })
          }
        }
        if (typeof body.image_caption === 'string') {
          imageCaption = sanitizeString(body.image_caption, 200)
        }
        if (typeof body.text_content === 'string') {
          textContent = sanitizeString(body.text_content, 280)
        }
        break
      }
      case 'poll': {
        if (!body.poll_question || typeof body.poll_question !== 'string') {
          return NextResponse.json({ error: 'poll_question is required for poll stories' }, { status: 400, headers: SECURITY_HEADERS })
        }
        if (!body.poll_option_a || typeof body.poll_option_a !== 'string') {
          return NextResponse.json({ error: 'poll_option_a is required for poll stories' }, { status: 400, headers: SECURITY_HEADERS })
        }
        if (!body.poll_option_b || typeof body.poll_option_b !== 'string') {
          return NextResponse.json({ error: 'poll_option_b is required for poll stories' }, { status: 400, headers: SECURITY_HEADERS })
        }
        pollQuestion = sanitizeString(body.poll_question, 200)
        pollOptionA = sanitizeString(body.poll_option_a, 100)
        pollOptionB = sanitizeString(body.poll_option_b, 100)
        if (!pollQuestion || !pollOptionA || !pollOptionB) {
          return NextResponse.json({ error: 'Poll fields cannot be empty' }, { status: 400, headers: SECURITY_HEADERS })
        }
        break
      }
      case 'question': {
        if (!body.question_prompt || typeof body.question_prompt !== 'string') {
          return NextResponse.json({ error: 'question_prompt is required for question stories' }, { status: 400, headers: SECURITY_HEADERS })
        }
        questionPrompt = sanitizeString(body.question_prompt, 200)
        if (!questionPrompt) {
          return NextResponse.json({ error: 'question_prompt cannot be empty' }, { status: 400, headers: SECURITY_HEADERS })
        }
        break
      }
    }

    const now = new Date()
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()

    const { data: story, error } = await supabase
      .from('stories')
      .insert({
        profile_id: user.id,
        story_type: storyType,
        text_content: textContent,
        text_bg_color: bgColor,
        image_url: imageUrl,
        image_caption: imageCaption,
        poll_question: pollQuestion,
        poll_option_a: pollOptionA,
        poll_option_b: pollOptionB,
        question_text: questionPrompt,
        expires_at: expiresAt,
        published_at: now.toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('[POST /api/stories] Insert error:', error.message)
      return NextResponse.json({ error: 'Failed to create story' }, { status: 500, headers: SECURITY_HEADERS })
    }

    return NextResponse.json({ story }, { status: 201, headers: SECURITY_HEADERS })
  } catch (err) {
    console.error('[POST /api/stories] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: SECURITY_HEADERS })
  }
}
