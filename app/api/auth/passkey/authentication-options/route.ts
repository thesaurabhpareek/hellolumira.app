import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateAuthenticationOptions, PASSKEY_AUTH_TIMEOUT } from '@/lib/webauthn'

// Rate limit: max 20 challenge requests per IP per 10 minutes
const OPTIONS_RATE_MAX = 20
const OPTIONS_RATE_WINDOW_MS = 10 * 60 * 1000

export async function POST(req: NextRequest) {
  try {
    const service = await createServiceClient()
    const body = await req.json().catch(() => ({}))
    const email = typeof body?.email === 'string' ? body.email : undefined

    // ── Rate limit by IP ──────────────────────────────────────────────────────
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      'unknown'
    const rateLimitKey = `passkey_auth_options:${clientIp}`
    const windowStart = new Date(Date.now() - OPTIONS_RATE_WINDOW_MS).toISOString()

    const { data: rlRow } = await service
      .from('passkey_rate_limits')
      .select('attempts, window_start')
      .eq('key', rateLimitKey)
      .maybeSingle()

    if (rlRow && rlRow.window_start > windowStart && rlRow.attempts >= OPTIONS_RATE_MAX) {
      return NextResponse.json(
        { error: 'Too many sign-in attempts. Please wait a few minutes and try again.' },
        { status: 429 }
      )
    }

    await service.from('passkey_rate_limits').upsert(
      rlRow && rlRow.window_start > windowStart
        ? { key: rateLimitKey, attempts: rlRow.attempts + 1, window_start: rlRow.window_start }
        : { key: rateLimitKey, attempts: 1, window_start: new Date().toISOString() },
      { onConflict: 'key' }
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
