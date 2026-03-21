/**
 * @module StoryRepostAPI
 * @description POST /api/stories/[id]/repost — Repost a story
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'
import { isValidUUID, sanitizeString } from '@/lib/validation'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storyId } = await params
    if (!isValidUUID(storyId)) {
      return NextResponse.json({ error: 'Invalid story ID' }, { status: 400, headers: SECURITY_HEADERS })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: SECURITY_HEADERS })
    }

    let body: Record<string, unknown> = {}
    try {
      body = await request.json()
    } catch {
      // Body is optional for reposts (note is optional)
    }

    let note: string | null = null
    if (typeof body.note === 'string') {
      note = sanitizeString(body.note, 280)
    }

    // Fetch original story with author profile
    const { data: original, error: storyErr } = await supabase
      .from('stories')
      .select(`
        *,
        profiles!stories_profile_id_fkey(display_name)
      `)
      .eq('id', storyId)
      .single()

    if (storyErr || !original) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404, headers: SECURITY_HEADERS })
    }

    // Cannot repost own story
    if (original.profile_id === user.id) {
      return NextResponse.json({ error: 'You cannot repost your own story' }, { status: 400, headers: SECURITY_HEADERS })
    }

    // Cannot repost hidden story
    if (original.is_hidden) {
      return NextResponse.json({ error: 'This story is not available for reposting' }, { status: 400, headers: SECURITY_HEADERS })
    }

    // Check if already reposted by this user
    const { data: existingRepost } = await supabase
      .from('stories')
      .select('id')
      .eq('repost_of_id', storyId)
      .eq('profile_id', user.id)
      .maybeSingle()

    if (existingRepost) {
      return NextResponse.json({ error: 'You have already reposted this story' }, { status: 409, headers: SECURITY_HEADERS })
    }

    const now = new Date()
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
    const authorProfile = original.profiles as { display_name: string } | null

    const { data: story, error: insertErr } = await supabase
      .from('stories')
      .insert({
        profile_id: user.id,
        story_type: original.story_type,
        text_content: note || original.text_content,
        bg_color: original.bg_color,
        image_url: original.image_url,
        image_caption: original.image_caption,
        poll_question: original.poll_question,
        poll_option_a: original.poll_option_a,
        poll_option_b: original.poll_option_b,
        question_prompt: original.question_prompt,
        repost_of_id: storyId,
        repost_attribution: authorProfile?.display_name || 'Unknown',
        expires_at: expiresAt,
        published_at: now.toISOString(),
      })
      .select()
      .single()

    if (insertErr) {
      // Handle unique constraint on repost
      if (insertErr.code === '23505') {
        return NextResponse.json({ error: 'You have already reposted this story' }, { status: 409, headers: SECURITY_HEADERS })
      }
      console.error('[POST /api/stories/[id]/repost] Insert error:', insertErr.message)
      return NextResponse.json({ error: 'Failed to repost story' }, { status: 500, headers: SECURITY_HEADERS })
    }

    return NextResponse.json({ story }, { status: 201, headers: SECURITY_HEADERS })
  } catch (err) {
    console.error('[POST /api/stories/[id]/repost] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: SECURITY_HEADERS })
  }
}
