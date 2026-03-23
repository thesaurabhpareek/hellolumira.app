// app/api/auth/passkey/authentication-options/route.ts
// Generates WebAuthn authentication options.
// Supports both conditional UI (no email) and targeted (email provided) flows.

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateAuthenticationOptions, RP_ID, PASSKEY_AUTH_TIMEOUT } from '@/lib/webauthn'
import type { AuthenticatorTransportFuture } from '@simplewebauthn/server'

export async function POST(req: NextRequest) {
  try {
    const service = await createServiceClient()
    const body = await req.json().catch(() => ({})) as { email?: unknown }
    const email = typeof body?.email === 'string' ? body.email : undefined

    let allowCredentials: { id: string; transports?: AuthenticatorTransportFuture[] }[] = []
    let userId: string | null = null

    // If email provided, pre-populate allowCredentials for non-conditional UI
    if (email) {
      const { data: userData } = await service.auth.admin.listUsers()
      const matchingUser = userData?.users?.find((u) => u.email === email)
      if (matchingUser) {
        userId = matchingUser.id
        const { data: passkeys } = await service
          .from('passkeys')
          .select('credential_id, transport')
          .eq('user_id', matchingUser.id)
          .eq('status', 'active')

        allowCredentials = (passkeys ?? []).map((p) => ({
          id: p.credential_id as string,
          transports: (p.transport ?? undefined) as AuthenticatorTransportFuture[] | undefined,
        }))
      }
    }

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      timeout: PASSKEY_AUTH_TIMEOUT,
      userVerification: 'required',
      allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
    })

    // Persist challenge
    await service.from('webauthn_challenges').insert({
      user_id: userId,
      challenge: options.challenge,
      type: 'authentication',
    })

    // Best-effort cleanup of expired challenges
    void Promise.resolve(
      service
        .from('webauthn_challenges')
        .delete()
        .lt('expires_at', new Date().toISOString()),
    ).catch(() => {})

    return NextResponse.json(options)
  } catch (err) {
    console.error('[passkey/authentication-options]', err)
    return NextResponse.json(
      { error: 'Failed to generate authentication options' },
      { status: 500 },
    )
  }
}
