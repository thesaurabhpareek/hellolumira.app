// __tests__/api/passkey/registration-options.test.ts
// Tests for the registration-options passkey API endpoint business logic.
// Since the route file does not yet exist, this test suite validates the
// business rules and data transformations that the route must implement.

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_PASSKEYS_PER_USER = 10
const VALID_USER_ID = '00000000-0000-0000-0000-000000000001'

// ─── Business logic helpers (mirror what the route implements) ────────────────

interface ExistingPasskey {
  id: string
  credential_id: string
  user_id: string
  device_hint: string
  created_at: string
  counter: number
  suspended: boolean
}

interface RegistrationOptionsResult {
  status: number
  body: Record<string, unknown>
}

async function buildRegistrationOptions(
  userId: string | null,
  existingPasskeys: ExistingPasskey[],
  dbError: Error | null = null
): Promise<RegistrationOptionsResult> {
  // 1. Auth check
  if (!userId) {
    return { status: 401, body: { error: 'Not authenticated' } }
  }

  // 2. DB error check
  if (dbError) {
    return { status: 500, body: { error: 'Internal server error' } }
  }

  // 3. Limit check
  if (existingPasskeys.length >= MAX_PASSKEYS_PER_USER) {
    return {
      status: 422,
      body: { error: `You have reached the maximum of ${MAX_PASSKEYS_PER_USER} passkeys.` },
    }
  }

  // 4. Build excludeCredentials from existing passkeys
  const excludeCredentials = existingPasskeys.map(pk => ({
    id: pk.credential_id,
    type: 'public-key',
    transports: ['internal'] as AuthenticatorTransport[],
  }))

  // 5. Generate and store challenge
  const challenge = 'mock-challenge-base64url'

  return {
    status: 200,
    body: {
      challenge,
      rp: {
        id: 'hellolumira.app',
        name: 'Lumira',
      },
      user: {
        id: userId,
        name: 'user@example.com',
        displayName: 'Alice',
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 },
      ],
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'required',
        authenticatorAttachment: 'platform',
      },
      excludeCredentials,
      timeout: 60000,
    },
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('POST /api/auth/passkey/registration-options — business logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when no session / user is not authenticated', async () => {
    const result = await buildRegistrationOptions(null, [])
    expect(result.status).toBe(401)
    expect(result.body.error).toContain('authenticated')
  })

  it('returns 200 with correct JSON shape when authenticated', async () => {
    const result = await buildRegistrationOptions(VALID_USER_ID, [])
    expect(result.status).toBe(200)
    expect(result.body).toHaveProperty('challenge')
    expect(result.body).toHaveProperty('rp')
    expect(result.body).toHaveProperty('user')
    expect(result.body).toHaveProperty('authenticatorSelection')
  })

  it('authenticatorSelection includes residentKey: "preferred"', async () => {
    const result = await buildRegistrationOptions(VALID_USER_ID, [])
    const sel = result.body.authenticatorSelection as Record<string, unknown>
    expect(sel.residentKey).toBe('preferred')
  })

  it('authenticatorSelection includes userVerification: "required"', async () => {
    const result = await buildRegistrationOptions(VALID_USER_ID, [])
    const sel = result.body.authenticatorSelection as Record<string, unknown>
    expect(sel.userVerification).toBe('required')
  })

  it('authenticatorSelection includes authenticatorAttachment: "platform"', async () => {
    const result = await buildRegistrationOptions(VALID_USER_ID, [])
    const sel = result.body.authenticatorSelection as Record<string, unknown>
    expect(sel.authenticatorAttachment).toBe('platform')
  })

  it('returns 422 when user has 10 passkeys already (MAX_PASSKEYS_PER_USER)', async () => {
    const existingPasskeys: ExistingPasskey[] = Array.from({ length: 10 }, (_, i) => ({
      id: `passkey-${i}`,
      credential_id: `cred-${i}`,
      user_id: VALID_USER_ID,
      device_hint: `Device ${i}`,
      created_at: new Date().toISOString(),
      counter: 0,
      suspended: false,
    }))

    const result = await buildRegistrationOptions(VALID_USER_ID, existingPasskeys)
    expect(result.status).toBe(422)
    expect(String(result.body.error)).toContain('maximum')
  })

  it('excludeCredentials populated with existing passkeys', async () => {
    const existingPasskeys: ExistingPasskey[] = [
      {
        id: 'pk-1',
        credential_id: 'credential-id-base64url-1',
        user_id: VALID_USER_ID,
        device_hint: 'iPhone 15',
        created_at: new Date().toISOString(),
        counter: 5,
        suspended: false,
      },
      {
        id: 'pk-2',
        credential_id: 'credential-id-base64url-2',
        user_id: VALID_USER_ID,
        device_hint: 'MacBook Pro',
        created_at: new Date().toISOString(),
        counter: 2,
        suspended: false,
      },
    ]

    const result = await buildRegistrationOptions(VALID_USER_ID, existingPasskeys)
    expect(result.status).toBe(200)
    const excluded = result.body.excludeCredentials as Array<{ id: string; type: string }>
    expect(excluded).toHaveLength(2)
    expect(excluded[0].id).toBe('credential-id-base64url-1')
    expect(excluded[1].id).toBe('credential-id-base64url-2')
    expect(excluded[0].type).toBe('public-key')
  })

  it('challenge is included in response body', async () => {
    const result = await buildRegistrationOptions(VALID_USER_ID, [])
    expect(result.status).toBe(200)
    expect(typeof result.body.challenge).toBe('string')
    expect((result.body.challenge as string).length).toBeGreaterThan(0)
  })

  it('rp includes id and name fields', async () => {
    const result = await buildRegistrationOptions(VALID_USER_ID, [])
    const rp = result.body.rp as Record<string, unknown>
    expect(rp).toHaveProperty('id')
    expect(rp).toHaveProperty('name')
  })

  it('user object includes id, name, and displayName', async () => {
    const result = await buildRegistrationOptions(VALID_USER_ID, [])
    const user = result.body.user as Record<string, unknown>
    expect(user).toHaveProperty('id')
    expect(user).toHaveProperty('name')
    expect(user).toHaveProperty('displayName')
  })

  it('returns 500 on unexpected DB error with sanitized message', async () => {
    const dbError = new Error('connection timeout to DB at 10.0.0.5')
    const result = await buildRegistrationOptions(VALID_USER_ID, [], dbError)
    expect(result.status).toBe(500)
    // Sanitized — must NOT leak internal connection details
    expect(String(result.body.error)).not.toContain('10.0.0.5')
    expect(String(result.body.error)).not.toContain('connection timeout')
  })

  it('returns 200 (not 422) when user has exactly MAX_PASSKEYS_PER_USER - 1 passkeys', async () => {
    const existingPasskeys: ExistingPasskey[] = Array.from({ length: 9 }, (_, i) => ({
      id: `passkey-${i}`,
      credential_id: `cred-${i}`,
      user_id: VALID_USER_ID,
      device_hint: `Device ${i}`,
      created_at: new Date().toISOString(),
      counter: 0,
      suspended: false,
    }))

    const result = await buildRegistrationOptions(VALID_USER_ID, existingPasskeys)
    expect(result.status).toBe(200)
  })
})
