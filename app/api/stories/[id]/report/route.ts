/**
 * @module StoryReportAPI
 * @description POST /api/stories/[id]/report — Report a story
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'
import { isValidUUID, isValidEnum, sanitizeString } from '@/lib/validation'

const ALLOWED_REASONS = ['inappropriate', 'harmful', 'spam', 'other'] as const

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

    const reason = body.reason as string
    if (!isValidEnum(reason, ALLOWED_REASONS)) {
      return NextResponse.json(
        { error: 'reason must be one of: inappropriate, harmful, spam, other' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    let detail: string | null = null
    if (typeof body.detail === 'string') {
      detail = sanitizeString(body.detail, 500)
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

    // Insert report — UNIQUE constraint (story_id, reporter_id) prevents duplicates
    const { error: insertErr } = await supabase
      .from('story_reports')
      .insert({
        story_id: storyId,
        reporter_id: user.id,
        reason,
        detail,
      })

    if (insertErr) {
      // Check for unique constraint violation
      if (insertErr.code === '23505') {
        return NextResponse.json({ error: 'You have already reported this story' }, { status: 409, headers: SECURITY_HEADERS })
      }
      console.error('[POST /api/stories/[id]/report] Insert error:', insertErr.message)
      return NextResponse.json({ error: 'Failed to submit report' }, { status: 500, headers: SECURITY_HEADERS })
    }

    // Check if story should be auto-hidden (>= 5 reports)
    const { count } = await supabase
      .from('story_reports')
      .select('*', { count: 'exact', head: true })
      .eq('story_id', storyId)

    if (count && count >= 5) {
      await supabase
        .from('stories')
        .update({ is_hidden: true })
        .eq('id', storyId)
    }

    return NextResponse.json({ success: true }, { headers: SECURITY_HEADERS })
  } catch (err) {
    console.error('[POST /api/stories/[id]/report] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: SECURITY_HEADERS })
  }
}
