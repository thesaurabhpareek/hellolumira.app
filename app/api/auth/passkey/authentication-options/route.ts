import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateAuthenticationOptions, PASSKEY_AUTH_TIMEOUT } from '@/lib/webauthn'
import { checkPasskeyRateLimit } from '@/lib/passkey-rate-limit'

export async function POST(req: NextRequest) {
  try {
    const service = await createServiceClient()
    const body = await req.json().catch(() => ({}))
    const email = typeof body?.email === 'string' ? body.email : undefined

    // ── Rate limit by IP (fails open if DB unavailable) ───────────────────────
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      'unknown'
    const rl = await checkPasskeyRateLimit(service, `passkey_auth_options:${clientIp}`, 20, 10 * 60 * 1000)
    if (!rl.allowed)
      return NextResponse.json(
        { error: 'Too many sign-in attempts. Please wait a few minutes and try again.' },
        { status: 429 }
      )

    // ── Populate allowCredentials if email is provided ────────────────────────
    let allowCredentials: { id: string; transports?: AuthenticatorTransport[] }[] = []

    if (email) {
      const {
        data: { users },
      } = await service.auth.admin.listUsers({ perPage: 1000 })
      const match = users?.find((u) => u.email === email)
      if (match) {
        const { data: passkeys } = await service
          .from('passkeys')
          .select('credential_id, transport')
          .eq('user_id', match.id)
          .eq('status', 'active')
        allowCredentials = (passkeys ?? []).map((p) => ({
          id: p.credential_id,
          transports: (p.transport ?? []) as AuthenticatorTransport[],
        }))
      }
    }

    const rpID = new URL(
      process.env.NEXT_PUBLIC_APP_URL ?? 'https://hellolumira.app'
    ).hostname

    const options = await generateAuthenticationOptions({
      rpID,
      timeout: PASSKEY_AUTH_TIMEOUT,
      userVerification: 'required',
      allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
    })

    await service.from('webauthn_challenges').insert({
      user_id: null,
      challenge: options.challenge,
      type: 'authentication',
    })

    // Async cleanup of expired challenges (non-critical, fire and forget)
    void service.from('webauthn_challenges').delete().lt('expires_at', new Date().toISOString())

    return NextResponse.json(options)
  } catch (err) {
    console.error('[passkey/authentication-options]', err)
    return NextResponse.json({ error: 'Unable to start sign-in. Please try again or use a magic link.' }, { status: 500 })
  }
}
