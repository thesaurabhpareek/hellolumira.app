/**
 * @module StoryReactAPI
 * @description POST /api/stories/[id]/react — Toggle reaction on a story
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'
import { isValidUUID } from '@/lib/validation'
import { awardSeeds } from '@/lib/seeds'

const ALLOWED_EMOJIS = ['❤️', '😊', '🙌', '😮', '💙', '🌙'] as const

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

    const emoji = body.emoji as string
    if (!emoji || !ALLOWED_EMOJIS.includes(emoji as typeof ALLOWED_EMOJIS[number])) {
      return NextResponse.json(
        { error: `emoji must be one of: ${ALLOWED_EMOJIS.join(' ')}` },
        { status: 400, headers: SECURITY_HEADERS }
      )
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

    // Check if reaction already exists with same emoji
    const { data: existing } = await supabase
      .from('story_reactions')
      .select('id')
      .eq('story_id', storyId)
      .eq('reactor_id', user.id)
      .eq('emoji', emoji)
      .maybeSingle()

    let action: 'added' | 'removed'

    if (existing) {
      // Remove existing reaction
      const { error: deleteErr } = await supabase
        .from('story_reactions')
        .delete()
        .eq('id', existing.id)

      if (deleteErr) {
        console.error('[POST /api/stories/[id]/react] Delete error:', deleteErr.message)
        return NextResponse.json({ error: 'Failed to remove reaction' }, { status: 500, headers: SECURITY_HEADERS })
      }

      // Decrement reaction_count
      const { data: currentStory } = await supabase.from('stories').select('reaction_count').eq('id', storyId).single()
      if (currentStory && currentStory.reaction_count > 0) {
        await supabase.from('stories').update({ reaction_count: currentStory.reaction_count - 1 }).eq('id', storyId)
      }
      action = 'removed'
    } else {
      // Add new reaction
      const { error: insertErr } = await supabase
        .from('story_reactions')
        .insert({
          story_id: storyId,
          reactor_id: user.id,
          emoji,
        })

      if (insertErr) {
        console.error('[POST /api/stories/[id]/react] Insert error:', insertErr.message)
        return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500, headers: SECURITY_HEADERS })
      }

      // Increment reaction_count
      const { data: storyData } = await supabase.from('stories').select('reaction_count').eq('id', storyId).single()
      await supabase.from('stories').update({ reaction_count: (storyData?.reaction_count ?? 0) + 1 }).eq('id', storyId)
      action = 'added'
    }

    // Award seeds for reacting to a story (only when adding, not removing; deduped daily)
    if (action === 'added') {
      void awardSeeds(user.id, 'react_to_story').catch(() => {})
    }

    return NextResponse.json({ action, emoji }, { headers: SECURITY_HEADERS })
  } catch (err) {
    console.error('[POST /api/stories/[id]/react] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: SECURITY_HEADERS })
  }
}
