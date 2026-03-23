import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyAuthenticationResponse } from '@/lib/webauthn'
import { sendPasskeySuspendedAlertEmail } from '@/lib/passkey-email'
import { checkPasskeyRateLimit } from '@/lib/passkey-rate-limit'

export async function POST(req: NextRequest) {
  try {
    const service = await createServiceClient()
    const body = await req.json()
    if (!body.credential?.id)
      return NextResponse.json({ error: 'Sign-in request was incomplete. Please try again.' }, { status: 400 })

    // ── Rate limit by IP (fails open if DB unavailable) ───────────────────────
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      'unknown'
    const rl = await checkPasskeyRateLimit(service, `passkey_auth:${clientIp}`, 10, 5 * 60 * 1000)
    if (!rl.allowed)
      return NextResponse.json(
        { error: 'Too many sign-in attempts. Please wait a few minutes and try again.' },
        { status: 429 }
      )

    // ── Look up credential ────────────────────────────────────────────────────
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

    // ── Atomically claim the challenge (CAS: used=false → used=true) ──────────
    // SELECT to get the challenge string, then UPDATE WHERE used=false.
    // Only one concurrent request can win — the loser gets 0 rows back.
    const { data: pendingChallenges } = await service
      .from('webauthn_challenges')
      .select('*')
      .eq('type', 'authentication')
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)

    const pending = pendingChallenges?.[0]
    if (!pending)
      return NextResponse.json(
        { error: 'Session expired. Please try again.' },
        { status: 400 }
      )

    // Atomic claim — if another request already claimed it, data will be empty
    const { data: claimed } = await service
      .from('webauthn_challenges')
      .update({ used: true })
      .eq('id', pending.id)
      .eq('used', false) // CAS guard: only succeed if still unused
      .select('id')

    if (!claimed?.length)
      return NextResponse.json(
        { error: 'Session expired. Please try again.' },
        { status: 400 }
      )

    // ── Verify assertion ──────────────────────────────────────────────────────
    const rpID = new URL(
      process.env.NEXT_PUBLIC_APP_URL ?? 'https://hellolumira.app'
    ).hostname

    const verification = await verifyAuthenticationResponse({
      response: body.credential,
      expectedChallenge: pending.challenge,
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

    // ── Counter validation (replay / cloning detection) ───────────────────────
    // counter=0 on both sides is valid (iCloud Keychain does not increment counters).
    // Any other case where newCounter ≤ storedCounter signals possible credential cloning.
    if (passkey.counter > 0 && authenticationInfo.newCounter <= passkey.counter) {
      console.error('[passkey/authenticate] counter mismatch — credential cloning suspected', {
        stored: passkey.counter,
        received: authenticationInfo.newCounter,
        credentialId: passkey.credential_id,
        userId: passkey.user_id,
      })
      await service.from('passkeys').update({ status: 'suspended' }).eq('id', passkey.id)

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

    // ── Update counter + last_used_at ─────────────────────────────────────────
    await service
      .from('passkeys')
      .update({
        counter: authenticationInfo.newCounter,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', passkey.id)

    // ── Generate session token ────────────────────────────────────────────────
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
