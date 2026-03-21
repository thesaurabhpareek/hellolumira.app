/**
 * @module PartnerRemoveAPI
 * @description Removes a connected partner from a baby profile.
 *   Only the baby creator can remove partners.
 * @version 1.0.0
 * @since March 2026
 */
import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { baby_id, partner_profile_id } = body

  if (!baby_id || !partner_profile_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Verify the current user is the baby creator (only creator can remove partners)
  const { data: baby } = await supabase
    .from('baby_profiles')
    .select('id, created_by_profile_id')
    .eq('id', baby_id)
    .single()

  if (!baby || baby.created_by_profile_id !== user.id) {
    return NextResponse.json({ error: 'Only the baby profile creator can remove partners' }, { status: 403 })
  }

  // Cannot remove yourself
  if (partner_profile_id === user.id) {
    return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 })
  }

  // Remove the partner from baby_profile_members
  const serviceClient = await createServiceClient()
  const { error: deleteError } = await serviceClient
    .from('baby_profile_members')
    .delete()
    .eq('baby_id', baby_id)
    .eq('profile_id', partner_profile_id)

  if (deleteError) {
    console.error('[partner/remove] Delete error:', deleteError.message)
    return NextResponse.json({ error: 'Failed to remove partner' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
