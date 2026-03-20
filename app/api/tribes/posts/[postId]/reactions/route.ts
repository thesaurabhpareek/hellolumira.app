/**
 * @module TribePostReactionsAPI
 * @description POST /api/tribes/posts/[postId]/reactions — Toggle a reaction
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'

const VALID_REACTIONS = ['❤️', '👏', '🤗', '😂', '💪', '🙏']

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: SECURITY_HEADERS })
    }

    const body = await request.json()
    const { reaction_type, comment_id } = body

    if (!reaction_type || !VALID_REACTIONS.includes(reaction_type)) {
      return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400, headers: SECURITY_HEADERS })
    }

    // Check for existing reaction
    let query = supabase
      .from('tribe_reactions')
      .select('id')
      .eq('profile_id', user.id)
      .eq('reaction_type', reaction_type)

    if (comment_id) {
      query = query.eq('comment_id', comment_id)
    } else {
      query = query.eq('post_id', postId)
    }

    const { data: existing } = await query.maybeSingle()

    if (existing) {
      // Remove reaction (toggle off)
      await supabase.from('tribe_reactions').delete().eq('id', existing.id)
      return NextResponse.json({ action: 'removed' }, { headers: SECURITY_HEADERS })
    }

    // Add reaction
    const insertData: Record<string, string> = {
      profile_id: user.id,
      reaction_type,
    }
    if (comment_id) {
      insertData.comment_id = comment_id
    } else {
      insertData.post_id = postId
    }

    const { error } = await supabase
      .from('tribe_reactions')
      .insert(insertData)

    if (error) {
      console.error('[POST /api/tribes/posts/[postId]/reactions] Error:', error.message)
      return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500, headers: SECURITY_HEADERS })
    }

    return NextResponse.json({ action: 'added' }, { status: 201, headers: SECURITY_HEADERS })
  } catch (err) {
    console.error('[POST /api/tribes/posts/[postId]/reactions] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: SECURITY_HEADERS })
  }
}
