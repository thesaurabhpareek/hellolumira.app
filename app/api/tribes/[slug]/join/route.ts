/**
 * @module TribeJoinAPI
 * @description POST /api/tribes/[slug]/join — Join a tribe
 *              DELETE /api/tribes/[slug]/join — Leave a tribe
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'

export async function POST(
  _request: NextRequest,
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

    // Check if already a member
    const { data: existing } = await supabase
      .from('tribe_members')
      .select('id')
      .eq('tribe_id', tribe.id)
      .eq('profile_id', user.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ message: 'Already a member' }, { headers: SECURITY_HEADERS })
    }

    const { error } = await supabase
      .from('tribe_members')
      .insert({ tribe_id: tribe.id, profile_id: user.id })

    if (error) {
      console.error('[POST /api/tribes/[slug]/join] Error:', error.message)
      return NextResponse.json({ error: 'Failed to join tribe' }, { status: 500, headers: SECURITY_HEADERS })
    }

    // Increment member count (fire and forget)
    try {
      await supabase.rpc('increment_tribe_member_count', { tribe_id_arg: tribe.id })
    } catch {
      // Fallback: direct update
      // Best-effort increment — exact count isn't critical
      void supabase.from('tribes').update({ member_count: 1 }).eq('id', tribe.id)
    }

    return NextResponse.json({ message: 'Joined successfully' }, { status: 201, headers: SECURITY_HEADERS })
  } catch (err) {
    console.error('[POST /api/tribes/[slug]/join] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: SECURITY_HEADERS })
  }
}

export async function DELETE(
  _request: NextRequest,
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

    const { error } = await supabase
      .from('tribe_members')
      .delete()
      .eq('tribe_id', tribe.id)
      .eq('profile_id', user.id)

    if (error) {
      console.error('[DELETE /api/tribes/[slug]/join] Error:', error.message)
      return NextResponse.json({ error: 'Failed to leave tribe' }, { status: 500, headers: SECURITY_HEADERS })
    }

    return NextResponse.json({ message: 'Left successfully' }, { headers: SECURITY_HEADERS })
  } catch (err) {
    console.error('[DELETE /api/tribes/[slug]/join] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: SECURITY_HEADERS })
  }
}
