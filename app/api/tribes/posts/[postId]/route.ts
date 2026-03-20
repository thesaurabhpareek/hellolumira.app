/**
 * @module TribePostDetailAPI
 * @description GET /api/tribes/posts/[postId] — Single post with comments
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const supabase = await createClient()

    const { data: post, error } = await supabase
      .from('tribe_posts')
      .select(`
        id, tribe_id, title, body, post_type, emoji_tag, is_pinned,
        comment_count, reaction_count, created_at, updated_at,
        ai_parent_profiles!tribe_posts_ai_profile_id_fkey(id, display_name, avatar_emoji, bio, baby_name, baby_age_desc, location),
        profile_id
      `)
      .eq('id', postId)
      .single()

    if (error || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404, headers: SECURITY_HEADERS })
    }

    // Fetch comments with author info
    const { data: comments } = await supabase
      .from('tribe_comments')
      .select(`
        id, post_id, parent_id, body, reaction_count, created_at,
        ai_parent_profiles!tribe_comments_ai_profile_id_fkey(id, display_name, avatar_emoji, bio, baby_name, baby_age_desc),
        profile_id
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    // Fetch reactions for this post
    const { data: reactions } = await supabase
      .from('tribe_reactions')
      .select('id, reaction_type, ai_profile_id, profile_id')
      .eq('post_id', postId)

    // Group reactions by type
    const reactionCounts: Record<string, number> = {}
    for (const r of (reactions || [])) {
      reactionCounts[r.reaction_type] = (reactionCounts[r.reaction_type] || 0) + 1
    }

    return NextResponse.json({
      post,
      comments: comments || [],
      reactions: reactionCounts,
    }, { headers: SECURITY_HEADERS })
  } catch (err) {
    console.error('[GET /api/tribes/posts/[postId]] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: SECURITY_HEADERS })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: SECURITY_HEADERS })
    }

    // Verify the post belongs to the current user
    const { data: post } = await supabase
      .from('tribe_posts')
      .select('id, profile_id')
      .eq('id', postId)
      .single()

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404, headers: SECURITY_HEADERS })
    }

    if (post.profile_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: SECURITY_HEADERS })
    }

    // Delete comments and reactions first, then the post
    await supabase.from('tribe_reactions').delete().eq('post_id', postId)
    await supabase.from('tribe_comments').delete().eq('post_id', postId)

    const { error } = await supabase
      .from('tribe_posts')
      .delete()
      .eq('id', postId)
      .eq('profile_id', user.id)

    if (error) {
      console.error('[DELETE /api/tribes/posts/[postId]] Error:', error.message)
      return NextResponse.json({ error: 'Failed to delete post' }, { status: 500, headers: SECURITY_HEADERS })
    }

    return NextResponse.json({ success: true }, { headers: SECURITY_HEADERS })
  } catch (err) {
    console.error('[DELETE /api/tribes/posts/[postId]] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: SECURITY_HEADERS })
  }
}
