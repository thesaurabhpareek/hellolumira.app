/**
 * @module TribePostsAPI
 * @description GET /api/tribes/[slug]/posts — Paginated posts for a tribe
 *              POST /api/tribes/[slug]/posts — Create a new post
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'
import { awardSeeds } from '@/lib/seeds'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createClient()

    // SECURITY: Verify authentication before serving tribe content
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: SECURITY_HEADERS })
    }

    // Get tribe by slug
    const { data: tribe } = await supabase
      .from('tribes')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!tribe) {
      return NextResponse.json({ error: 'Tribe not found' }, { status: 404, headers: SECURITY_HEADERS })
    }

    const { searchParams } = new URL(request.url)
    const parsedLimit = parseInt(searchParams.get('limit') || '20', 10)
    const limit = Math.min(Math.max(isNaN(parsedLimit) ? 20 : parsedLimit, 1), 50)
    const before = searchParams.get('before')
    const sort = searchParams.get('sort') || 'latest'

    let query = supabase
      .from('tribe_posts')
      .select(`
        id, tribe_id, title, body, post_type, emoji_tag, is_pinned,
        comment_count, reaction_count, created_at, updated_at,
        ai_parent_profiles!tribe_posts_ai_profile_id_fkey(id, display_name, avatar_emoji, bio, baby_name, baby_age_desc),
        profile_id
      `)
      .eq('tribe_id', tribe.id)
      .order('is_pinned', { ascending: false })

    // Apply sort order
    switch (sort) {
      case 'popular':
        query = query.order('reaction_count', { ascending: false }).order('created_at', { ascending: false })
        break
      case 'discussed':
        query = query.order('comment_count', { ascending: false }).order('created_at', { ascending: false })
        break
      case 'liked':
        query = query.order('reaction_count', { ascending: false })
        break
      case 'latest':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    query = query.limit(limit)

    if (before) {
      query = query.lt('created_at', before)
    }

    const { data: posts, error } = await query

    if (error) {
      console.error('[GET /api/tribes/[slug]/posts] Error:', error.message)
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500, headers: SECURITY_HEADERS })
    }

    const nextCursor = (posts || []).length === limit
      ? posts![posts!.length - 1].created_at
      : null

    return NextResponse.json({
      posts: posts || [],
      next_cursor: nextCursor,
    }, { headers: SECURITY_HEADERS })
  } catch (err) {
    console.error('[GET /api/tribes/[slug]/posts] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: SECURITY_HEADERS })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: SECURITY_HEADERS })
    }

    const { data: tribe } = await supabase
      .from('tribes')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!tribe) {
      return NextResponse.json({ error: 'Tribe not found' }, { status: 404, headers: SECURITY_HEADERS })
    }

    const body = await request.json()
    const { title, body: postBody, post_type = 'discussion' } = body

    if (!postBody || postBody.trim().length === 0) {
      return NextResponse.json({ error: 'Post body is required' }, { status: 400, headers: SECURITY_HEADERS })
    }

    // SECURITY: Enforce max length to prevent DB bloat
    if (postBody.length > 5000) {
      return NextResponse.json({ error: 'Post body too long (max 5000 characters)' }, { status: 400, headers: SECURITY_HEADERS })
    }
    if (title && title.length > 200) {
      return NextResponse.json({ error: 'Title too long (max 200 characters)' }, { status: 400, headers: SECURITY_HEADERS })
    }

    const { data: post, error } = await supabase
      .from('tribe_posts')
      .insert({
        tribe_id: tribe.id,
        profile_id: user.id,
        title: title ? title.slice(0, 200) : null,
        body: postBody.trim().slice(0, 5000),
        post_type,
      })
      .select()
      .single()

    if (error) {
      console.error('[POST /api/tribes/[slug]/posts] Error:', error.message)
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500, headers: SECURITY_HEADERS })
    }

    // Award seeds for posting in tribe (fire-and-forget)
    void awardSeeds(user.id, 'post_in_tribe').catch(() => {})

    // Check and award badges (fire-and-forget)
    fetch(new URL('/api/badges/check', request.url).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': request.headers.get('cookie') || '' },
    }).catch(() => {})

    return NextResponse.json({ post }, { status: 201, headers: SECURITY_HEADERS })
  } catch (err) {
    console.error('[POST /api/tribes/[slug]/posts] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: SECURITY_HEADERS })
  }
}
