// app/api/auth/passkey/registration-options/route.ts
// Generates WebAuthn registration options for the authenticated user.

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import {
  generateRegistrationOptions,
  parseDeviceHint,
  RP_ID,
  RP_NAME,
  PASSKEY_REGISTRATION_TIMEOUT,
  MAX_PASSKEYS_PER_USER,
} from '@/lib/webauthn'
import type { AuthenticatorTransportFuture } from '@simplewebauthn/server'

// parseDeviceHint imported for potential future use; suppress unused warning
void parseDeviceHint

export async function POST(_req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = await createServiceClient()

    // Guard: enforce per-user passkey cap
    const { count } = await service
      .from('passkeys')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'active')

    if ((count ?? 0) >= MAX_PASSKEYS_PER_USER) {
      return NextResponse.json(
        {
          error: `You've reached the maximum of ${MAX_PASSKEYS_PER_USER} passkeys. Remove one before adding another.`,
        },
        { status: 422 },
      )
    }

    // Fetch existing credentials to populate excludeCredentials
    const { data: existingPasskeys } = await service
      .from('passkeys')
      .select('credential_id, transport')
      .eq('user_id', user.id)

    const excludeCredentials: { id: string; transports?: AuthenticatorTransportFuture[] }[] = (
      existingPasskeys ?? []
    ).map((p) => ({
      id: p.credential_id as string,
      transports: (p.transport ?? undefined) as AuthenticatorTransportFuture[] | undefined,
    }))

    // Fetch display name from profile
    const { data: profile } = await service
      .from('profiles')
      .select('first_name')
      .eq('id', user.id)
      .single()

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: new TextEncoder().encode(user.id),
      userName: user.email!,
      userDisplayName: (profile?.first_name as string | null) ?? user.email!,
      timeout: PASSKEY_REGISTRATION_TIMEOUT,
      attestationType: 'none',
      excludeCredentials,
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'required',
        authenticatorAttachment: 'platform',
      },
      supportedAlgorithmIDs: [-7, -257], // ES256, RS256
    })

    // Persist challenge for later verification
    await service.from('webauthn_challenges').insert({
      user_id: user.id,
      challenge: options.challenge,
      type: 'registration',
    })

    // Best-effort cleanup of expired challenges (non-blocking)
    void Promise.resolve(
      service
        .from('webauthn_challenges')
        .delete()
        .lt('expires_at', new Date().toISOString()),
    ).catch(() => {})

    return NextResponse.json(options)
  } catch (err) {
    console.error('[passkey/registration-options]', err)
    return NextResponse.json(
      { error: 'Failed to generate registration options' },
      { status: 500 },
    )
  }
}
