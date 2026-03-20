/**
 * @module TribeDetailAPI
 * @description GET /api/tribes/[slug] — Single tribe with metadata
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: tribe, error } = await supabase
      .from('tribes')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !tribe) {
      return NextResponse.json({ error: 'Tribe not found' }, { status: 404, headers: SECURITY_HEADERS })
    }

    // Check membership
    let isMember = false
    if (user) {
      const { data: membership } = await supabase
        .from('tribe_members')
        .select('id')
        .eq('tribe_id', tribe.id)
        .eq('profile_id', user.id)
        .maybeSingle()
      isMember = !!membership
    }

    // Get some recent members (AI profiles)
    const { data: members } = await supabase
      .from('tribe_members')
      .select('ai_parent_profiles!tribe_members_ai_profile_id_fkey(id, display_name, avatar_emoji, bio)')
      .eq('tribe_id', tribe.id)
      .not('ai_profile_id', 'is', null)
      .limit(10)

    return NextResponse.json({
      tribe: { ...tribe, is_member: isMember },
      members: (members || []).map(m => m.ai_parent_profiles).filter(Boolean),
    }, { headers: SECURITY_HEADERS })
  } catch (err) {
    console.error('[GET /api/tribes/[slug]] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: SECURITY_HEADERS })
  }
}
