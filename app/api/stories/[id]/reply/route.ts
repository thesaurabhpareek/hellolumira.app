/**
 * @module StoryReplyAPI
 * @description POST /api/stories/[id]/reply — Post a reply to a story
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'
import { isValidUUID, sanitizeString } from '@/lib/validation'
import { awardSeeds } from '@/lib/seeds'

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

    if (!body.body || typeof body.body !== 'string') {
      return NextResponse.json({ error: 'body is required' }, { status: 400, headers: SECURITY_HEADERS })
    }

    const replyBody = sanitizeString(body.body as string, 500)
    if (replyBody.length < 1) {
      return NextResponse.json({ error: 'Reply body cannot be empty' }, { status: 400, headers: SECURITY_HEADERS })
    }

    // Verify story exists
    const { data: story, error: storyErr } = await supabase
      .from('stories')
      .select('id')
      .eq('id', storyId)
      .single()

    if (storyErr || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404, headers: SECURITY_HEADERS })
    }

    // Insert reply
    const { data: reply, error: insertErr } = await supabase
      .from('story_replies')
      .insert({
        story_id: storyId,
        replier_id: user.id,
        body: replyBody,
      })
      .select()
      .single()

    if (insertErr) {
      console.error('[POST /api/stories/[id]/reply] Insert error:', insertErr.message)
      return NextResponse.json({ error: 'Failed to post reply' }, { status: 500, headers: SECURITY_HEADERS })
    }

    // Increment reply_count on stories
    const { data: storyData } = await supabase.from('stories').select('reply_count').eq('id', storyId).single()
    await supabase.from('stories').update({ reply_count: (storyData?.reply_count ?? 0) + 1 }).eq('id', storyId)

    // Award seeds for replying to a story (fire-and-forget; deduped daily)
    void awardSeeds(user.id, 'reply_to_story').catch(() => {})

    return NextResponse.json({ reply }, { status: 201, headers: SECURITY_HEADERS })
  } catch (err) {
    console.error('[POST /api/stories/[id]/reply] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: SECURITY_HEADERS })
  }
}
