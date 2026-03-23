import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateAuthenticationOptions, PASSKEY_AUTH_TIMEOUT } from '@/lib/webauthn'

export async function POST(req: NextRequest) {
  try {
    const service = await createServiceClient()
    const body = await req.json().catch(() => ({}))
    const email = typeof body?.email === 'string' ? body.email : undefined

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

    // Clean expired challenges (fire and forget)
    service.from('webauthn_challenges').delete().lt('expires_at', new Date().toISOString())

    return NextResponse.json(options)
  } catch (err) {
    console.error('[passkey/authentication-options]', err)
    return NextResponse.json({ error: 'Failed to generate options' }, { status: 500 })
  }
}
