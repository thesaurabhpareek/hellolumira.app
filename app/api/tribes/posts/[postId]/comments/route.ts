/**
 * @module TribePostCommentsAPI
 * @description POST /api/tribes/posts/[postId]/comments — Add a comment
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'
import { awardSeeds } from '@/lib/seeds'

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
    const { body: commentBody, parent_id } = body

    if (!commentBody || commentBody.trim().length === 0) {
      return NextResponse.json({ error: 'Comment body is required' }, { status: 400, headers: SECURITY_HEADERS })
    }

    const { data: comment, error } = await supabase
      .from('tribe_comments')
      .insert({
        post_id: postId,
        profile_id: user.id,
        body: commentBody.trim(),
        parent_id: parent_id || null,
      })
      .select()
      .single()

    if (error) {
      console.error('[POST /api/tribes/posts/[postId]/comments] Error:', error.message)
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500, headers: SECURITY_HEADERS })
    }

    // Award seeds for commenting in tribe (fire-and-forget)
    void awardSeeds(user.id, 'comment_in_tribe').catch(() => {})

    // Check and award badges (fire-and-forget)
    fetch(new URL('/api/badges/check', request.url).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': request.headers.get('cookie') || '' },
    }).catch(() => {})

    // Increment comment count on the post
    await supabase
      .from('tribe_posts')
      .update({ comment_count: (await supabase.from('tribe_posts').select('comment_count').eq('id', postId).single()).data?.comment_count + 1 || 1 })
      .eq('id', postId)

    return NextResponse.json({ comment }, { status: 201, headers: SECURITY_HEADERS })
  } catch (err) {
    console.error('[POST /api/tribes/posts/[postId]/comments] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: SECURITY_HEADERS })
  }
}
