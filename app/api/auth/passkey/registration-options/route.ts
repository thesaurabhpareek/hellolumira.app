import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import {
  generateRegistrationOptions,
  MAX_PASSKEYS_PER_USER,
  PASSKEY_REGISTRATION_TIMEOUT,
} from '@/lib/webauthn'
import { checkPasskeyRateLimit } from '@/lib/passkey-rate-limit'

export async function POST(_req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 })

    const service = await createServiceClient()

    // ── Rate limit per user (fails open if DB unavailable) ────────────────────
    const rl = await checkPasskeyRateLimit(service, `passkey_reg:${user.id}`, 10, 60 * 60 * 1000)
    if (!rl.allowed)
      return NextResponse.json(
        { error: 'Too many passkey setup attempts. Please try again in an hour.' },
        { status: 429 }
      )

    // ── Max passkeys per user ─────────────────────────────────────────────────
    const { count } = await service
      .from('passkeys')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'active')

    if ((count ?? 0) >= MAX_PASSKEYS_PER_USER) {
      return NextResponse.json(
        { error: `Maximum of ${MAX_PASSKEYS_PER_USER} passkeys reached. Remove one to add another.` },
        { status: 422 }
      )
    }

    const { data: existing } = await service
      .from('passkeys')
      .select('credential_id, transport')
      .eq('user_id', user.id)

    const { data: profile } = await service
      .from('profiles')
      .select('first_name')
      .eq('id', user.id)
      .single()

    const rpID = new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://hellolumira.app').hostname

    const options = await generateRegistrationOptions({
      rpName: 'Lumira',
      rpID,
      userID: new TextEncoder().encode(user.id),
      userName: user.email!,
      userDisplayName: profile?.first_name ?? user.email!,
      timeout: PASSKEY_REGISTRATION_TIMEOUT,
      attestationType: 'none',
      excludeCredentials: (existing ?? []).map((p) => ({
        id: p.credential_id,
        transports: (p.transport ?? []) as AuthenticatorTransport[],
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'required',
        authenticatorAttachment: 'platform',
      },
      supportedAlgorithmIDs: [-7, -257],
    })

    await service.from('webauthn_challenges').insert({
      user_id: user.id,
      challenge: options.challenge,
      type: 'registration',
    })

    // Async cleanup of expired challenges (non-critical, fire and forget)
    void service.from('webauthn_challenges').delete().lt('expires_at', new Date().toISOString())

    return NextResponse.json(options)
  } catch (err) {
    console.error('[passkey/registration-options]', err)
    return NextResponse.json({ error: 'Unable to start passkey setup. Please try again.' }, { status: 500 })
  }
}
