// app/api/auth/passkey/register/route.ts
// Verifies a WebAuthn registration response and persists the new passkey.

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { verifyRegistrationResponse, parseDeviceHint, RP_ID } from '@/lib/webauthn'
import type { RegistrationResponseJSON } from '@simplewebauthn/server'
import {
  sendPasskeyEnrolledEmail,
  sendPasskeyNewDeviceAlertEmail,
} from '@/lib/passkey-email'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json()) as { credential?: RegistrationResponseJSON }
    if (!body.credential) {
      return NextResponse.json({ error: 'Missing credential' }, { status: 400 })
    }

    const service = await createServiceClient()

    // Retrieve the most recent unused, unexpired registration challenge for this user
    const { data: challengeRow } = await service
      .from('webauthn_challenges')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'registration')
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!challengeRow) {
      return NextResponse.json(
        { error: 'Registration session expired. Please try again.' },
        { status: 400 },
      )
    }

    const expectedOrigin = process.env.NEXT_PUBLIC_APP_URL ?? `https://${RP_ID}`

    const verification = await verifyRegistrationResponse({
      response: body.credential,
      expectedChallenge: challengeRow.challenge as string,
      expectedOrigin,
      expectedRPID: RP_ID,
      requireUserVerification: true,
    })

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json(
        { error: 'Passkey verification failed. Please try again.' },
        { status: 400 },
      )
    }

    const { registrationInfo } = verification
    const deviceHint = parseDeviceHint(req.headers.get('user-agent') ?? '')

    // Mark challenge consumed
    await service
      .from('webauthn_challenges')
      .update({ used: true })
      .eq('id', challengeRow.id)

    // aaguid is already a UUID string in v13
    const aaguid: string | null = registrationInfo.aaguid || null

    // credential.id is Base64URL string; publicKey is Uint8Array
    const { credential } = registrationInfo

    // Store passkey — public key persisted as base64url string
    const { data: newPasskey, error: insertError } = await service
      .from('passkeys')
      .insert({
        user_id: user.id,
        credential_id: credential.id,
        public_key: Buffer.from(credential.publicKey).toString('base64url'),
        counter: credential.counter,
        aaguid,
        device_type: registrationInfo.credentialDeviceType,
        backed_up: registrationInfo.credentialBackedUp,
        transport: credential.transports ?? null,
        device_hint: deviceHint,
      })
      .select()
      .single()

    if (insertError) {
      console.error('[passkey/register] insert error', insertError)
      return NextResponse.json(
        { error: 'Failed to save passkey. Please try again.' },
        { status: 500 },
      )
    }

    // Fetch profile for email personalisation
    const { data: profile } = await service
      .from('profiles')
      .select('first_name')
      .eq('id', user.id)
      .single()

    const firstName = (profile?.first_name as string | null) ?? 'there'
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const ipSubnet = ip.split('.').slice(0, 3).join('.') + '.0/24'

    // Fire-and-forget emails
    sendPasskeyEnrolledEmail({
      email: user.email!,
      firstName,
      deviceHint,
    }).catch(() => {})

    sendPasskeyNewDeviceAlertEmail({
      email: user.email!,
      firstName,
      deviceHint,
      ipSubnet,
      revokeUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? `https://${RP_ID}`}/settings/security`,
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      passkey: {
        id: newPasskey.id,
        deviceHint: newPasskey.device_hint,
        createdAt: newPasskey.created_at,
        backedUp: newPasskey.backed_up,
      },
    })
  } catch (err) {
    console.error('[passkey/register]', err)
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 },
    )
  }
}
