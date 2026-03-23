import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyAuthenticationResponse } from '@/lib/webauthn'
import { sendPasskeySuspendedAlertEmail } from '@/lib/passkey-email'

export async function POST(req: NextRequest) {
  try {
    const service = await createServiceClient()
    const body = await req.json()
    if (!body.credential?.id)
      return NextResponse.json({ error: 'Sign-in request was incomplete. Please try again.' }, { status: 400 })

    const { data: passkey } = await service
      .from('passkeys')
      .select('*')
      .eq('credential_id', body.credential.id)
      .eq('status', 'active')
      .single()

    if (!passkey)
      return NextResponse.json(
        { error: 'Passkey not found. Try signing in with a magic link.' },
        { status: 401 }
      )

    const { data: challengeRow } = await service
      .from('webauthn_challenges')
      .select('*')
      .eq('type', 'authentication')
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!challengeRow)
      return NextResponse.json(
        { error: 'Session expired. Please try again.' },
        { status: 400 }
      )

    const rpID = new URL(
      process.env.NEXT_PUBLIC_APP_URL ?? 'https://hellolumira.app'
    ).hostname

    const verification = await verifyAuthenticationResponse({
      response: body.credential,
      expectedChallenge: challengeRow.challenge,
      expectedOrigin: process.env.NEXT_PUBLIC_APP_URL ?? `https://${rpID}`,
      expectedRPID: rpID,
      requireUserVerification: true,
      credential: {
        id: passkey.credential_id,
        publicKey: Buffer.from(passkey.public_key, 'base64url'),
        counter: passkey.counter,
        transports: (passkey.transport ?? []) as AuthenticatorTransport[],
      },
    })

    if (!verification.verified)
      return NextResponse.json(
        { error: 'Authentication failed. Please try again.' },
        { status: 401 }
      )

    const { authenticationInfo } = verification

    // Counter validation — counter=0 on both sides is valid (iCloud Keychain)
    if (passkey.counter > 0 && authenticationInfo.newCounter <= passkey.counter) {
      console.error('[passkey/authenticate] counter mismatch', {
        stored: passkey.counter,
        received: authenticationInfo.newCounter,
      })
      await service.from('passkeys').update({ status: 'suspended' }).eq('id', passkey.id)
      await service
        .from('webauthn_challenges')
        .update({ used: true })
        .eq('id', challengeRow.id)

      const { data: ud } = await service.auth.admin.getUserById(passkey.user_id)
      if (ud?.user?.email) {
        const { data: profile } = await service
          .from('profiles')
          .select('first_name')
          .eq('id', passkey.user_id)
          .single()
        sendPasskeySuspendedAlertEmail({
          email: ud.user.email,
          firstName: profile?.first_name ?? 'there',
          deviceHint: passkey.device_hint,
        }).catch(() => {})
      }

      return NextResponse.json(
        {
          error:
            'Security check failed. Your passkey has been suspended. Please sign in with a magic link.',
        },
        { status: 401 }
      )
    }

    await Promise.all([
      service
        .from('webauthn_challenges')
        .update({ used: true })
        .eq('id', challengeRow.id),
      service
        .from('passkeys')
        .update({
          counter: authenticationInfo.newCounter,
          last_used_at: new Date().toISOString(),
        })
        .eq('id', passkey.id),
    ])

    const { data: ud } = await service.auth.admin.getUserById(passkey.user_id)
    if (!ud?.user?.email)
      return NextResponse.json({ error: "We couldn't find your account. Please try signing in with your email." }, { status: 401 })

    const { data: linkData, error: linkError } = await service.auth.admin.generateLink({
      type: 'magiclink',
      email: ud.user.email,
    })
    if (linkError || !linkData?.properties?.action_link) {
      console.error('[passkey/authenticate] generateLink', linkError)
      return NextResponse.json(
        { error: 'Sign-in failed. Please try a magic link.' },
        { status: 500 }
      )
    }

    const actionUrl = new URL(linkData.properties.action_link)
    const tokenHash = actionUrl.searchParams.get('token_hash') ?? ''

    return NextResponse.json({
      success: true,
      tokenHash,
      type: 'magiclink',
      redirectTo: '/home',
    })
  } catch (err) {
    console.error('[passkey/authenticate]', err)
    return NextResponse.json(
      { error: 'Sign-in failed. Please try a magic link.' },
      { status: 500 }
    )
  }
}
