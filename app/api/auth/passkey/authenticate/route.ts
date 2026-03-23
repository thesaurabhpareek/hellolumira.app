// app/api/auth/passkey/authenticate/route.ts
// Verifies a WebAuthn authentication assertion and issues a session token.

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyAuthenticationResponse, RP_ID } from '@/lib/webauthn'
import type { AuthenticationResponseJSON, WebAuthnCredential } from '@simplewebauthn/server'
import { sendPasskeySuspendedAlertEmail } from '@/lib/passkey-email'

export async function POST(req: NextRequest) {
  try {
    const service = await createServiceClient()
    const body = (await req.json()) as { credential?: AuthenticationResponseJSON }

    if (!body.credential?.id) {
      return NextResponse.json({ error: 'Missing credential' }, { status: 400 })
    }

    // Look up the passkey by credential ID
    const { data: passkey } = await service
      .from('passkeys')
      .select('*')
      .eq('credential_id', body.credential.id)
      .eq('status', 'active')
      .single()

    if (!passkey) {
      return NextResponse.json(
        {
          error:
            'Passkey not found. It may have been removed — try signing in with a magic link.',
        },
        { status: 401 },
      )
    }

    // Retrieve the most recent unused, unexpired authentication challenge
    const { data: challengeRow } = await service
      .from('webauthn_challenges')
      .select('*')
      .eq('type', 'authentication')
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!challengeRow) {
      return NextResponse.json(
        { error: 'Authentication session expired. Please try again.' },
        { status: 400 },
      )
    }

    const expectedOrigin = process.env.NEXT_PUBLIC_APP_URL ?? `https://${RP_ID}`

    // Build the WebAuthnCredential from stored DB values
    const storedCredential: WebAuthnCredential = {
      id: passkey.credential_id as string,
      publicKey: Buffer.from(passkey.public_key as string, 'base64url'),
      counter: passkey.counter as number,
      transports: (passkey.transport ?? undefined) as
        | import('@simplewebauthn/server').AuthenticatorTransportFuture[]
        | undefined,
    }

    const verification = await verifyAuthenticationResponse({
      response: body.credential,
      expectedChallenge: challengeRow.challenge as string,
      expectedOrigin,
      expectedRPID: RP_ID,
      requireUserVerification: true,
      credential: storedCredential,
    })

    if (!verification.verified) {
      return NextResponse.json(
        { error: 'Authentication failed. Please try again.' },
        { status: 401 },
      )
    }

    const { authenticationInfo } = verification

    // Counter validation — iCloud Keychain may return 0 consistently (backedUp = true)
    const storedCounter = passkey.counter as number
    if (storedCounter > 0 && authenticationInfo.newCounter <= storedCounter) {
      console.error('[passkey/authenticate] counter mismatch — possible credential cloning', {
        userId: passkey.user_id,
        credentialId: passkey.credential_id,
        stored: storedCounter,
        received: authenticationInfo.newCounter,
      })

      // Suspend credential immediately
      await service
        .from('passkeys')
        .update({ status: 'suspended' })
        .eq('id', passkey.id)

      // Consume challenge
      await service
        .from('webauthn_challenges')
        .update({ used: true })
        .eq('id', challengeRow.id)

      // Alert the account owner
      const { data: userData } = await service.auth.admin.getUserById(
        passkey.user_id as string,
      )
      if (userData?.user?.email) {
        const { data: profile } = await service
          .from('profiles')
          .select('first_name')
          .eq('id', passkey.user_id)
          .single()

        sendPasskeySuspendedAlertEmail({
          email: userData.user.email,
          firstName: (profile?.first_name as string | null) ?? 'there',
          deviceHint: passkey.device_hint as string,
        }).catch(() => {})
      }

      return NextResponse.json(
        {
          error:
            'Security check failed. Your passkey has been suspended. Please sign in with a magic link and review your security settings.',
        },
        { status: 401 },
      )
    }

    // Commit: mark challenge used and update counter + last_used_at
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

    // Retrieve user email for session creation
    const { data: userData } = await service.auth.admin.getUserById(
      passkey.user_id as string,
    )
    if (!userData?.user?.email) {
      return NextResponse.json({ error: 'Account not found.' }, { status: 401 })
    }

    // Generate a magic-link token to exchange for a session on the client
    const { data: linkData, error: linkError } =
      await service.auth.admin.generateLink({
        type: 'magiclink',
        email: userData.user.email,
      })

    if (linkError || !linkData?.properties?.action_link) {
      console.error('[passkey/authenticate] generateLink error', linkError)
      return NextResponse.json(
        { error: 'Sign-in failed. Please try a magic link.' },
        { status: 500 },
      )
    }

    // Extract token_hash from action_link for client-side verifyOtp call
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
      { status: 500 },
    )
  }
}
