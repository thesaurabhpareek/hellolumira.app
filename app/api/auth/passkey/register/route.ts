import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { verifyRegistrationResponse, parseDeviceHint } from '@/lib/webauthn'
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
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    if (!body.credential) return NextResponse.json({ error: 'Missing credential' }, { status: 400 })

    const service = await createServiceClient()

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

    if (!challengeRow)
      return NextResponse.json({ error: 'Session expired. Please try again.' }, { status: 400 })

    const rpID = new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://hellolumira.app').hostname

    const verification = await verifyRegistrationResponse({
      response: body.credential,
      expectedChallenge: challengeRow.challenge,
      expectedOrigin: process.env.NEXT_PUBLIC_APP_URL ?? `https://${rpID}`,
      expectedRPID: rpID,
      requireUserVerification: true,
    })

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json(
        { error: 'Verification failed. Please try again.' },
        { status: 400 }
      )
    }

    const { registrationInfo } = verification
    const deviceHint = parseDeviceHint(req.headers.get('user-agent') ?? '')

    await service
      .from('webauthn_challenges')
      .update({ used: true })
      .eq('id', challengeRow.id)

    const { data: newPasskey, error: insertError } = await service
      .from('passkeys')
      .insert({
        user_id: user.id,
        credential_id: registrationInfo.credential.id,
        public_key: Buffer.from(registrationInfo.credential.publicKey).toString('base64url'),
        counter: registrationInfo.credential.counter,
        aaguid: registrationInfo.aaguid ?? null,
        device_type: registrationInfo.credentialDeviceType,
        backed_up: registrationInfo.credentialBackedUp,
        transport: body.credential.response?.transports ?? null,
        device_hint: deviceHint,
      })
      .select()
      .single()

    if (insertError) {
      console.error('[passkey/register] insert', insertError)
      return NextResponse.json(
        { error: 'Failed to save passkey. Try again.' },
        { status: 500 }
      )
    }

    const { data: profile } = await service
      .from('profiles')
      .select('first_name')
      .eq('id', user.id)
      .single()

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const ipSubnet =
      ip !== 'unknown' ? ip.split('.').slice(0, 3).join('.') + '.0/24' : 'unknown'

    const now = new Date().toISOString()

    sendPasskeyEnrolledEmail({
      email: user.email!,
      firstName: profile?.first_name ?? 'there',
      deviceHint,
    }).catch(() => {})

    sendPasskeyNewDeviceAlertEmail({
      email: user.email!,
      firstName: profile?.first_name ?? 'there',
      deviceHint,
      ipSubnet,
      enrolledAt: now,
      revokeUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://hellolumira.app'}/settings/security`,
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
    return NextResponse.json({ error: 'Registration failed. Try again.' }, { status: 500 })
  }
}
