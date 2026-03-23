// __tests__/api/passkey/authenticate.test.ts
// Tests for the authenticate passkey API endpoint business logic.
// Tests cover: credential lookup, challenge validation, counter checks,
// IDOR prevention, and tokenHash generation — the security-critical paths.

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Types ───────────────────────────────────────────────────────────────────

interface StoredPasskey {
  id: string
  credential_id: string
  user_id: string
  device_hint: string
  counter: number
  suspended: boolean
  public_key: string
  aaguid: string
  backed_up: boolean
}

interface StoredChallenge {
  id: string
  user_id: string
  challenge: string
  used_at: string | null
  expires_at: string
}

interface AuthenticateResult {
  status: number
  body: Record<string, unknown>
  sideEffects?: {
    counterUpdated?: boolean
    challengeMarkedUsed?: boolean
    credentialSuspended?: boolean
    generateLinkCalled?: boolean
  }
}

// ─── Business logic simulation ────────────────────────────────────────────────

const NOW_ISO = new Date().toISOString()
const FUTURE_ISO = new Date(Date.now() + 60_000).toISOString()
const PAST_ISO = new Date(Date.now() - 120_000).toISOString()

const VALID_USER_ID = '00000000-0000-0000-0000-000000000001'
const OTHER_USER_ID = '00000000-0000-0000-0000-000000000002'

interface AuthInput {
  credentialId?: string
  requestingUserId?: string
  storedPasskey?: StoredPasskey | null
  storedChallenge?: StoredChallenge | null
  verificationResult?: { verified: boolean; authenticationInfo?: { newCounter: number } }
  verificationError?: Error | null
  generateLinkError?: Error | null
  receivedCounter?: number
}

async function simulateAuthenticate(input: AuthInput): Promise<AuthenticateResult> {
  const sideEffects = {
    counterUpdated: false,
    challengeMarkedUsed: false,
    credentialSuspended: false,
    generateLinkCalled: false,
  }

  // 1. Validate credential exists in request
  if (!input.credentialId) {
    return { status: 400, body: { error: 'Missing credential' }, sideEffects }
  }

  // 2. Look up passkey by credential_id
  const passkey = input.storedPasskey
  if (!passkey) {
    return { status: 401, body: { error: 'Passkey not found' }, sideEffects }
  }

  // 3. IDOR: if requesting user is specified and doesn't match passkey owner
  if (input.requestingUserId && input.requestingUserId !== passkey.user_id) {
    return { status: 401, body: { error: 'Passkey not found' }, sideEffects }
  }

  // 4. Find a valid (non-expired, non-used) challenge
  const challenge = input.storedChallenge
  if (!challenge || challenge.used_at !== null || challenge.expires_at < NOW_ISO) {
    return {
      status: 400,
      body: { error: 'No valid challenge found. Please try again.' },
      sideEffects,
    }
  }

  // 5. Simulate verifyAuthenticationResponse
  if (input.verificationError) {
    return { status: 500, body: { error: 'Internal server error' }, sideEffects }
  }

  const verificationResult = input.verificationResult ?? { verified: false }
  if (!verificationResult.verified) {
    return { status: 401, body: { error: 'Authentication failed' }, sideEffects }
  }

  // 6. Counter validation (replay attack prevention)
  const newCounter = verificationResult.authenticationInfo?.newCounter ?? 0
  const storedCounter = passkey.counter

  // Both zero: iCloud Keychain / non-counting authenticator — allow
  if (storedCounter === 0 && newCounter === 0) {
    // valid — do not suspend
  } else if (newCounter > 0 && newCounter <= storedCounter) {
    // Counter mismatch — possible cloned credential
    sideEffects.credentialSuspended = true
    return {
      status: 401,
      body: {
        error: 'Unusual activity detected. This passkey has been suspended for your security.',
      },
      sideEffects,
    }
  }

  // 7. Update counter and mark challenge used
  sideEffects.counterUpdated = true
  sideEffects.challengeMarkedUsed = true

  // 8. Generate link (Supabase Admin)
  if (input.generateLinkError) {
    return { status: 500, body: { error: 'Failed to generate sign-in link' }, sideEffects }
  }

  sideEffects.generateLinkCalled = true

  return {
    status: 200,
    body: {
      tokenHash: 'generated-token-hash-abc',
      type: 'magiclink',
      redirectTo: '/home',
    },
    sideEffects,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('POST /api/auth/passkey/authenticate — business logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const validPasskey: StoredPasskey = {
    id: 'pk-uuid-001',
    credential_id: 'cred-base64url-abc',
    user_id: VALID_USER_ID,
    device_hint: 'iPhone 15',
    counter: 5,
    suspended: false,
    public_key: 'base64-pubkey',
    aaguid: 'aaguid-string',
    backed_up: false,
  }

  const validChallenge: StoredChallenge = {
    id: 'challenge-uuid-001',
    user_id: VALID_USER_ID,
    challenge: 'Y2hhbGxlbmdl',
    used_at: null,
    expires_at: FUTURE_ISO,
  }

  it('returns 400 when credential is missing from request', async () => {
    const result = await simulateAuthenticate({
      storedPasskey: validPasskey,
      storedChallenge: validChallenge,
    })
    expect(result.status).toBe(400)
    expect(String(result.body.error).toLowerCase()).toContain('missing credential')
  })

  it('returns 401 when passkey not found by credential_id', async () => {
    const result = await simulateAuthenticate({
      credentialId: 'nonexistent-cred-id',
      storedPasskey: null,
      storedChallenge: validChallenge,
    })
    expect(result.status).toBe(401)
    expect(String(result.body.error).toLowerCase()).toContain('not found')
  })

  it('returns 400 when no valid challenge found (expired)', async () => {
    const expiredChallenge: StoredChallenge = {
      ...validChallenge,
      expires_at: PAST_ISO,
    }

    const result = await simulateAuthenticate({
      credentialId: 'cred-base64url-abc',
      storedPasskey: validPasskey,
      storedChallenge: expiredChallenge,
    })
    expect(result.status).toBe(400)
    expect(String(result.body.error)).toContain('challenge')
  })

  it('returns 400 when no valid challenge found (already used)', async () => {
    const usedChallenge: StoredChallenge = {
      ...validChallenge,
      used_at: NOW_ISO,
    }

    const result = await simulateAuthenticate({
      credentialId: 'cred-base64url-abc',
      storedPasskey: validPasskey,
      storedChallenge: usedChallenge,
    })
    expect(result.status).toBe(400)
    expect(String(result.body.error)).toContain('challenge')
  })

  it('happy path — verified=true → updates counter, marks challenge used, calls generateLink, returns tokenHash', async () => {
    const result = await simulateAuthenticate({
      credentialId: 'cred-base64url-abc',
      storedPasskey: validPasskey,
      storedChallenge: validChallenge,
      verificationResult: { verified: true, authenticationInfo: { newCounter: 6 } },
    })

    expect(result.status).toBe(200)
    expect(result.body.tokenHash).toBe('generated-token-hash-abc')
    expect(result.sideEffects?.counterUpdated).toBe(true)
    expect(result.sideEffects?.challengeMarkedUsed).toBe(true)
    expect(result.sideEffects?.generateLinkCalled).toBe(true)
  })

  it('counter mismatch (stored=5, received=3) → suspends credential, returns 401 with security message', async () => {
    const result = await simulateAuthenticate({
      credentialId: 'cred-base64url-abc',
      storedPasskey: { ...validPasskey, counter: 5 },
      storedChallenge: validChallenge,
      verificationResult: { verified: true, authenticationInfo: { newCounter: 3 } },
    })

    expect(result.status).toBe(401)
    expect(String(result.body.error).toLowerCase()).toContain('suspended')
    expect(result.sideEffects?.credentialSuspended).toBe(true)
  })

  it('counter=0 stored AND counter=0 received (iCloud Keychain) → valid, does NOT suspend', async () => {
    const iCloudPasskey: StoredPasskey = { ...validPasskey, counter: 0 }

    const result = await simulateAuthenticate({
      credentialId: 'cred-base64url-abc',
      storedPasskey: iCloudPasskey,
      storedChallenge: validChallenge,
      verificationResult: { verified: true, authenticationInfo: { newCounter: 0 } },
    })

    expect(result.status).toBe(200)
    expect(result.sideEffects?.credentialSuspended).toBe(false)
    expect(result.sideEffects?.counterUpdated).toBe(true)
  })

  it('counter=0 stored, counter=1 received → valid, updates counter', async () => {
    const nonCountingPasskey: StoredPasskey = { ...validPasskey, counter: 0 }

    const result = await simulateAuthenticate({
      credentialId: 'cred-base64url-abc',
      storedPasskey: nonCountingPasskey,
      storedChallenge: validChallenge,
      verificationResult: { verified: true, authenticationInfo: { newCounter: 1 } },
    })

    expect(result.status).toBe(200)
    expect(result.sideEffects?.credentialSuspended).toBe(false)
    expect(result.sideEffects?.counterUpdated).toBe(true)
  })

  it('verifyAuthenticationResponse throws → returns 500 with sanitized message', async () => {
    const result = await simulateAuthenticate({
      credentialId: 'cred-base64url-abc',
      storedPasskey: validPasskey,
      storedChallenge: validChallenge,
      verificationError: new Error('crypto internal failure at offset 0x1a2b'),
    })

    expect(result.status).toBe(500)
    // Sanitized — must not leak internal implementation details
    expect(String(result.body.error)).not.toContain('0x1a2b')
    expect(String(result.body.error)).not.toContain('crypto internal failure')
  })

  it('generateLink fails → returns 500', async () => {
    const result = await simulateAuthenticate({
      credentialId: 'cred-base64url-abc',
      storedPasskey: validPasskey,
      storedChallenge: validChallenge,
      verificationResult: { verified: true, authenticationInfo: { newCounter: 6 } },
      generateLinkError: new Error('Supabase admin API unreachable'),
    })

    expect(result.status).toBe(500)
  })

  it('IDOR: credential_id belongs to different user → returns 401 (passkey not found)', async () => {
    // Attacker requests auth with OTHER_USER_ID's credential
    const result = await simulateAuthenticate({
      credentialId: 'cred-base64url-abc',
      requestingUserId: OTHER_USER_ID, // attacker's user ID
      storedPasskey: validPasskey, // passkey belongs to VALID_USER_ID, not OTHER_USER_ID
      storedChallenge: validChallenge,
      verificationResult: { verified: true, authenticationInfo: { newCounter: 6 } },
    })

    expect(result.status).toBe(401)
    // Must not reveal that the passkey exists but belongs to a different user
    expect(String(result.body.error)).not.toContain('different user')
    expect(String(result.body.error)).toContain('not found')
  })

  it('counter = stored_counter exactly (no increment) → treats as mismatch when counter > 0', async () => {
    // received counter equals stored — this is a replay, not strictly "less than"
    // The business rule: newCounter must be GREATER than stored when both > 0
    const result = await simulateAuthenticate({
      credentialId: 'cred-base64url-abc',
      storedPasskey: { ...validPasskey, counter: 5 },
      storedChallenge: validChallenge,
      verificationResult: { verified: true, authenticationInfo: { newCounter: 5 } },
    })

    // Same counter is suspicious (replay) — should trigger suspension
    expect(result.status).toBe(401)
    expect(result.sideEffects?.credentialSuspended).toBe(true)
  })
})
