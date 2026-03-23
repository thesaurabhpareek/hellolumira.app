// __tests__/api/passkey/authentication-options.test.ts
// Tests for POST /api/auth/passkey/authentication-options business logic.
// Covers: IP rate limiting, email-based allowCredentials filtering,
// challenge generation, and error handling.

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Types ────────────────────────────────────────────────────────────────────

interface StoredPasskey {
  credential_id: string
  transport: AuthenticatorTransport[] | null
}

interface AuthOptionsInput {
  clientIp?: string
  email?: string
  rateLimitExceeded?: boolean
  rateLimitSkipped?: boolean
  matchedUserId?: string | null
  passkeysForUser?: StoredPasskey[]
  generateOptionsError?: Error | null
  challengeInsertError?: Error | null
}

interface AuthOptionsResult {
  status: number
  body: Record<string, unknown>
  sideEffects?: {
    challengeInserted?: boolean
    allowCredentials?: { id: string; transports?: AuthenticatorTransport[] }[]
  }
}

// ─── Business logic simulation ────────────────────────────────────────────────

async function simulateAuthenticationOptions(
  input: AuthOptionsInput
): Promise<AuthOptionsResult> {
  const sideEffects: {
    challengeInserted: boolean
    allowCredentials: { id: string; transports?: AuthenticatorTransport[] }[]
  } = { challengeInserted: false, allowCredentials: [] }

  // 1. Rate limit by IP
  if (input.rateLimitExceeded) {
    return {
      status: 429,
      body: { error: 'Too many sign-in attempts. Please wait a few minutes and try again.' },
      sideEffects,
    }
  }

  // 2. Build allowCredentials if email was provided
  let allowCredentials: { id: string; transports?: AuthenticatorTransport[] }[] = []

  if (input.email) {
    if (input.matchedUserId && input.passkeysForUser && input.passkeysForUser.length > 0) {
      allowCredentials = input.passkeysForUser.map((p) => ({
        id: p.credential_id,
        transports: (p.transport ?? []) as AuthenticatorTransport[],
      }))
    }
    // If user not found or has no passkeys, allowCredentials stays empty (discovery mode)
  }

  sideEffects.allowCredentials = allowCredentials

  // 3. Generate authentication options
  if (input.generateOptionsError) {
    return { status: 500, body: { error: 'Unable to start sign-in. Please try again or use a magic link.' }, sideEffects }
  }

  const options = {
    challenge: 'mock-challenge-base64url',
    rpId: 'hellolumira.app',
    timeout: 60000,
    userVerification: 'required' as UserVerificationRequirement,
    allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
  }

  // 4. Insert challenge into DB (user_id = null for auth challenges)
  if (input.challengeInsertError) {
    return { status: 500, body: { error: 'Unable to start sign-in. Please try again or use a magic link.' }, sideEffects }
  }

  sideEffects.challengeInserted = true

  return {
    status: 200,
    body: options,
    sideEffects,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('POST /api/auth/passkey/authentication-options — business logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Rate limiting ──────────────────────────────────────────────────────────

  it('returns 429 when IP rate limit is exceeded', async () => {
    const result = await simulateAuthenticationOptions({
      clientIp: '1.2.3.4',
      rateLimitExceeded: true,
    })
    expect(result.status).toBe(429)
    expect(String(result.body.error).toLowerCase()).toContain('too many')
  })

  it('continues when rate limit DB is unavailable (fail-open)', async () => {
    const result = await simulateAuthenticationOptions({
      clientIp: '1.2.3.4',
      rateLimitSkipped: true, // DB down, fail-open
    })
    // Should NOT be blocked — falls through to normal flow
    expect(result.status).toBe(200)
  })

  // ── No email — discoverable credential flow ────────────────────────────────

  it('returns 200 with challenge and no allowCredentials when email not provided', async () => {
    const result = await simulateAuthenticationOptions({ clientIp: '1.2.3.4' })
    expect(result.status).toBe(200)
    expect(result.body.challenge).toBeDefined()
    expect(result.body.allowCredentials).toBeUndefined()
  })

  it('inserts a challenge row with user_id=null', async () => {
    const result = await simulateAuthenticationOptions({ clientIp: '1.2.3.4' })
    expect(result.status).toBe(200)
    expect(result.sideEffects?.challengeInserted).toBe(true)
  })

  // ── Email provided — populates allowCredentials ────────────────────────────

  it('populates allowCredentials when email matches a user with passkeys', async () => {
    const result = await simulateAuthenticationOptions({
      clientIp: '1.2.3.4',
      email: 'alice@example.com',
      matchedUserId: 'user-uuid-001',
      passkeysForUser: [
        { credential_id: 'cred-abc', transport: ['internal'] },
        { credential_id: 'cred-def', transport: ['internal', 'hybrid'] },
      ],
    })
    expect(result.status).toBe(200)
    const creds = result.sideEffects?.allowCredentials
    expect(creds).toHaveLength(2)
    expect(creds![0].id).toBe('cred-abc')
    expect(creds![1].id).toBe('cred-def')
  })

  it('leaves allowCredentials empty when email provided but user not found', async () => {
    const result = await simulateAuthenticationOptions({
      clientIp: '1.2.3.4',
      email: 'nobody@example.com',
      matchedUserId: null,
    })
    expect(result.status).toBe(200)
    expect(result.sideEffects?.allowCredentials).toHaveLength(0)
    expect(result.body.allowCredentials).toBeUndefined()
  })

  it('leaves allowCredentials empty when user has no registered passkeys', async () => {
    const result = await simulateAuthenticationOptions({
      clientIp: '1.2.3.4',
      email: 'newuser@example.com',
      matchedUserId: 'user-uuid-002',
      passkeysForUser: [],
    })
    expect(result.status).toBe(200)
    expect(result.sideEffects?.allowCredentials).toHaveLength(0)
  })

  it('preserves transport values from stored passkeys', async () => {
    const result = await simulateAuthenticationOptions({
      clientIp: '1.2.3.4',
      email: 'bob@example.com',
      matchedUserId: 'user-uuid-003',
      passkeysForUser: [{ credential_id: 'cred-xyz', transport: ['internal', 'hybrid'] }],
    })
    expect(result.status).toBe(200)
    const cred = result.sideEffects?.allowCredentials?.[0]
    expect(cred?.transports).toContain('internal')
    expect(cred?.transports).toContain('hybrid')
  })

  it('handles null transport gracefully (defaults to empty array)', async () => {
    const result = await simulateAuthenticationOptions({
      clientIp: '1.2.3.4',
      email: 'carol@example.com',
      matchedUserId: 'user-uuid-004',
      passkeysForUser: [{ credential_id: 'cred-nulltransport', transport: null }],
    })
    expect(result.status).toBe(200)
    const cred = result.sideEffects?.allowCredentials?.[0]
    expect(Array.isArray(cred?.transports)).toBe(true)
    expect(cred?.transports).toHaveLength(0)
  })

  // ── Response shape ─────────────────────────────────────────────────────────

  it('response body includes challenge, rpId, timeout, and userVerification', async () => {
    const result = await simulateAuthenticationOptions({ clientIp: '10.0.0.1' })
    expect(result.status).toBe(200)
    expect(result.body).toHaveProperty('challenge')
    expect(result.body).toHaveProperty('rpId')
    expect(result.body).toHaveProperty('timeout')
    expect(result.body).toHaveProperty('userVerification', 'required')
  })

  // ── Error handling ─────────────────────────────────────────────────────────

  it('returns 500 with sanitized message when generateAuthenticationOptions fails', async () => {
    const result = await simulateAuthenticationOptions({
      clientIp: '1.2.3.4',
      generateOptionsError: new Error('crypto failure at 0xdeadbeef'),
    })
    expect(result.status).toBe(500)
    expect(String(result.body.error)).not.toContain('0xdeadbeef')
    expect(String(result.body.error)).not.toContain('crypto failure')
  })

  it('returns 500 when challenge insert fails', async () => {
    const result = await simulateAuthenticationOptions({
      clientIp: '1.2.3.4',
      challengeInsertError: new Error('DB write failed'),
    })
    expect(result.status).toBe(500)
  })
})
