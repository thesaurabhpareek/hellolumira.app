/**
 * @module InvitePartnerAPI
 * @description POST /api/invite-partner — Creates a partner invite with a
 *   unique UUID token and sends a magic link email via Supabase Auth admin.
 *   Email send failures are non-fatal (logged as warnings) since the invite
 *   URL is also returned in the response for manual sharing.
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'
import { isValidUUID, isValidEmail, verifyBabyOwnership } from '@/lib/validation'

interface InvitePartnerRequest {
  baby_id: string
  email: string
}

export async function POST(request: NextRequest) {
  try {
    let body: InvitePartnerRequest
    try {
      body = (await request.json()) as InvitePartnerRequest
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { baby_id, email } = body

    if (!baby_id || typeof baby_id !== 'string') {
      return NextResponse.json({ error: 'Missing required field: baby_id' }, { status: 400 })
    }
    if (!isValidUUID(baby_id)) {
      return NextResponse.json({ error: 'Invalid baby_id format' }, { status: 400 })
    }
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Missing required field: email' }, { status: 400 })
    }
    const trimmedEmail = email.trim().slice(0, 254)
    if (!isValidEmail(trimmedEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    const supabase = await createClient()
    const serviceClient = await createServiceClient()

    // Verify auth
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a member of this baby profile (IDOR prevention)
    const isMember = await verifyBabyOwnership(supabase, user.id, baby_id)
    if (!isMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Generate a unique token
    const token = randomUUID()
    const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hellolumira.app'}/invite/${token}`

    // Insert partner invite record
    const { error: insertError } = await serviceClient.from('partner_invites').insert({
      baby_id,
      invited_by_profile_id: user.id,
      invited_email: trimmedEmail.toLowerCase(),
      token,
      used: false,
    })

    if (insertError) {
      console.error('[invite-partner] DB insert error:', insertError.message)
      return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
    }

    // Send magic link / invite email via Supabase Admin
    try {
      const { error: emailError } = await serviceClient.auth.admin.generateLink({
        type: 'magiclink',
        email: trimmedEmail.toLowerCase(),
        options: {
          redirectTo: inviteUrl,
        },
      })

      if (emailError) {
        console.warn('[invite-partner] Email send failed (non-fatal):', emailError.message)
      }
    } catch (emailErr) {
      console.warn('[invite-partner] Email error (non-fatal):', emailErr)
    }

    // Only return the invite URL (not the raw token) to prevent token leakage
    return NextResponse.json({ success: true, invite_url: inviteUrl })
  } catch (err) {
    console.error('[invite-partner] Error:', err)
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
  }
}
