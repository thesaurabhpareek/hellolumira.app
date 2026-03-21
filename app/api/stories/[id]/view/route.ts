/**
 * @module StoryViewAPI
 * @description POST /api/stories/[id]/view — Record a story view
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'
import { isValidUUID } from '@/lib/validation'

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

    // Clamp dwell_ms to 0-60000
    const rawDwell = typeof body.dwell_ms === 'number' ? body.dwell_ms : 0
    const dwellMs = Math.max(0, Math.min(60000, Math.floor(rawDwell)))

    // Fetch the story to check ownership
    const { data: story, error: storyErr } = await supabase
      .from('stories')
      .select('id, profile_id, view_count')
      .eq('id', storyId)
      .single()

    if (storyErr || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404, headers: SECURITY_HEADERS })
    }

    // Don't record self-views
    if (story.profile_id === user.id) {
      return NextResponse.json({ success: true }, { headers: SECURITY_HEADERS })
    }

    // Upsert view: ON CONFLICT update dwell_ms to GREATEST of existing and new
    const { error: upsertErr } = await supabase
      .from('story_views')
      .upsert(
        {
          story_id: storyId,
          viewer_id: user.id,
          dwell_ms: dwellMs,
          viewed_at: new Date().toISOString(),
        },
        { onConflict: 'story_id,viewer_id' }
      )

    if (upsertErr) {
      console.error('[POST /api/stories/[id]/view] Upsert error:', upsertErr.message)
      return NextResponse.json({ error: 'Failed to record view' }, { status: 500, headers: SECURITY_HEADERS })
    }

    // Increment view_count on stories table
    await supabase
      .from('stories')
      .update({ view_count: (story.view_count ?? 0) + 1 })
      .eq('id', storyId)

    return NextResponse.json({ success: true }, { headers: SECURITY_HEADERS })
  } catch (err) {
    console.error('[POST /api/stories/[id]/view] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: SECURITY_HEADERS })
  }
}
