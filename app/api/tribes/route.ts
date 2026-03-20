/**
 * @module TribesListAPI
 * @description GET /api/tribes — Lists all tribes with member counts
 *   and latest post preview. Includes user's membership status.
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch all active tribes
    const { data: tribes, error } = await supabase
      .from('tribes')
      .select('*')
      .eq('is_active', true)
      .order('member_count', { ascending: false })

    if (error) {
      console.error('[GET /api/tribes] Error:', error.message)
      return NextResponse.json({ error: 'Failed to fetch tribes' }, { status: 500, headers: SECURITY_HEADERS })
    }

    // Fetch latest post for each tribe
    const tribeIds = (tribes || []).map(t => t.id)

    const { data: latestPosts } = await supabase
      .from('tribe_posts')
      .select(`
        id, tribe_id, title, body, post_type, created_at,
        ai_parent_profiles!tribe_posts_ai_profile_id_fkey(display_name, avatar_emoji)
      `)
      .in('tribe_id', tribeIds)
      .order('created_at', { ascending: false })

    // Get the latest post per tribe
    const latestPostByTribe: Record<string, typeof latestPosts extends (infer T)[] | null ? T : never> = {}
    for (const post of (latestPosts || [])) {
      if (!latestPostByTribe[post.tribe_id]) {
        latestPostByTribe[post.tribe_id] = post
      }
    }

    // Check user memberships if logged in
    let userMemberships: Set<string> = new Set()
    if (user) {
      const { data: memberships } = await supabase
        .from('tribe_members')
        .select('tribe_id')
        .eq('profile_id', user.id)

      userMemberships = new Set((memberships || []).map(m => m.tribe_id))
    }

    const result = (tribes || []).map(tribe => ({
      ...tribe,
      is_member: userMemberships.has(tribe.id),
      latest_post: latestPostByTribe[tribe.id] || null,
    }))

    return NextResponse.json({ tribes: result }, { headers: SECURITY_HEADERS })
  } catch (err) {
    console.error('[GET /api/tribes] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: SECURITY_HEADERS })
  }
}
