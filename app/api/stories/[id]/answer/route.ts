/**
 * @module StoryAnswerAPI
 * @description POST /api/stories/[id]/answer — Submit an answer to a question story
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

    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: SECURITY_HEADERS })
    }

    if (!body.answer_text || typeof body.answer_text !== 'string') {
      return NextResponse.json({ error: 'answer_text is required' }, { status: 400, headers: SECURITY_HEADERS })
    }

    const answerText = sanitizeString(body.answer_text as string, 500)
    if (answerText.length < 1) {
      return NextResponse.json({ error: 'answer_text cannot be empty' }, { status: 400, headers: SECURITY_HEADERS })
    }

    // Verify story exists and is a question type
    const { data: story, error: storyErr } = await supabase
      .from('stories')
      .select('id, story_type')
      .eq('id', storyId)
      .single()

    if (storyErr || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404, headers: SECURITY_HEADERS })
    }

    if (story.story_type !== 'question') {
      return NextResponse.json({ error: 'This story is not a question' }, { status: 400, headers: SECURITY_HEADERS })
    }

    // Insert answer
    const { data: answer, error: insertErr } = await supabase
      .from('story_question_answers')
      .insert({
        story_id: storyId,
        answerer_id: user.id,
        answer_text: answerText,
      })
      .select()
      .single()

    if (insertErr) {
      console.error('[POST /api/stories/[id]/answer] Insert error:', insertErr.message)
      return NextResponse.json({ error: 'Failed to submit answer' }, { status: 500, headers: SECURITY_HEADERS })
    }

    return NextResponse.json({ answer }, { status: 201, headers: SECURITY_HEADERS })
  } catch (err) {
    console.error('[POST /api/stories/[id]/answer] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: SECURITY_HEADERS })
  }
}
