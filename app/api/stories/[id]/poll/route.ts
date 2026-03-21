/**
 * @module StoryPollAPI
 * @description POST /api/stories/[id]/poll — Vote on a poll story
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'
import { isValidUUID, isValidEnum } from '@/lib/validation'

const ALLOWED_OPTIONS = ['A', 'B'] as const

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

    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: SECURITY_HEADERS })
    }

    const option = body.option as string
    if (!isValidEnum(option, ALLOWED_OPTIONS)) {
      return NextResponse.json({ error: 'option must be A or B' }, { status: 400, headers: SECURITY_HEADERS })
    }

    // Verify story exists and is a poll
    const { data: story, error: storyErr } = await supabase
      .from('stories')
      .select('id, story_type')
      .eq('id', storyId)
      .single()

    if (storyErr || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404, headers: SECURITY_HEADERS })
    }

    if (story.story_type !== 'poll') {
      return NextResponse.json({ error: 'This story is not a poll' }, { status: 400, headers: SECURITY_HEADERS })
    }

    // Insert vote — ON CONFLICT DO NOTHING (idempotent)
    await supabase
      .from('story_poll_votes')
      .upsert(
        {
          story_id: storyId,
          voter_id: user.id,
          option,
        },
        { onConflict: 'story_id,voter_id', ignoreDuplicates: true }
      )

    // Get current vote counts
    const [{ count: aCount }, { count: bCount }] = await Promise.all([
      supabase
        .from('story_poll_votes')
        .select('*', { count: 'exact', head: true })
        .eq('story_id', storyId)
        .eq('option', 'A'),
      supabase
        .from('story_poll_votes')
        .select('*', { count: 'exact', head: true })
        .eq('story_id', storyId)
        .eq('option', 'B'),
    ])

    // Get user's current vote
    const { data: userVote } = await supabase
      .from('story_poll_votes')
      .select('option')
      .eq('story_id', storyId)
      .eq('voter_id', user.id)
      .maybeSingle()

    return NextResponse.json({
      poll: {
        a_count: aCount || 0,
        b_count: bCount || 0,
        user_vote: userVote?.option || null,
      },
    }, { headers: SECURITY_HEADERS })
  } catch (err) {
    console.error('[POST /api/stories/[id]/poll] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: SECURITY_HEADERS })
  }
}
