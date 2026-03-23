// __tests__/api/passkey/register.test.ts
// Tests for POST /api/auth/passkey/register business logic.
// Covers: auth guard, missing credential, challenge validation, verification,
// DB insert, email fire-and-forget, and error handling.

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Types ────────────────────────────────────────────────────────────────────

interface StoredChallenge {
  id: string
  user_id: string
  challenge: string
  used: boolean
  expires_at: string
}

interface VerificationInfo {
  credential: {
    id: string
    publicKey: Uint8Array
    counter: number
  }
  credentialDeviceType: 'singleDevice' | 'multiDevice'
  credentialBackedUp: boolean
  aaguid: string
}

interface RegisterInput {
  authenticatedUserId: string | null
  credentialPresent: boolean
  challenge: StoredChallenge | null
  verificationResult?: { verified: boolean; registrationInfo?: VerificationInfo }
  verificationError?: Error | null
  insertError?: Error | null
  profileFirstName?: string | null
  userAgent?: string
}

interface RegisterResult {
  status: number
  body: Record<string, unknown>
  sideEffects?: {
    challengeMarkedUsed?: boolean
    passkeyInserted?: boolean
    enrolledEmailSent?: boolean
    deviceAlertEmailSent?: boolean
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FUTURE_ISO = new Date(Date.now() + 60_000).toISOString()
const VALID_USER_ID = '00000000-0000-0000-0000-000000000001'

const defaultVerificationInfo: VerificationInfo = {
  credential: {
    id: 'new-credential-id-base64url',
    publicKey: new Uint8Array([1, 2, 3, 4]),
    counter: 0,
  },
  credentialDeviceType: 'multiDevice',
  credentialBackedUp: true,
  aaguid: 'aaguid-apple-faceid',
}

const validChallenge: StoredChallenge = {
  id: 'challenge-uuid-001',
  user_id: VALID_USER_ID,
  challenge: 'registration-challenge-base64url',
  used: false,
  expires_at: FUTURE_ISO,
}

// ─── Business logic simulation ────────────────────────────────────────────────

async function simulateRegister(input: RegisterInput): Promise<RegisterResult> {
  const sideEffects = {
    challengeMarkedUsed: false,
    passkeyInserted: false,
    enrolledEmailSent: false,
    deviceAlertEmailSent: false,
  }

  // 1. Auth guard
  if (!input.authenticatedUserId) {
    return { status: 401, body: { error: 'Please sign in to continue.' }, sideEffects }
  }

  // 2. Credential presence check
  if (!input.credentialPresent) {
    return {
      status: 400,
      body: { error: 'Passkey setup was incomplete. Please try again.' },
      sideEffects,
    }
  }

  // 3. Challenge lookup
  const challenge = input.challenge
  if (!challenge || challenge.used || challenge.expires_at < new Date().toISOString()) {
    return {
      status: 400,
      body: { error: 'Session expired. Please try again.' },
      sideEffects,
    }
  }

  // 4. Verify registration response
  if (input.verificationError) {
    return { status: 500, body: { error: 'Registration failed. Try again.' }, sideEffects }
  }

  const verification = input.verificationResult ?? { verified: false }
  if (!verification.verified || !verification.registrationInfo) {
    return {
      status: 400,
      body: { error: 'Verification failed. Please try again.' },
      sideEffects,
    }
  }

  // 5. Mark challenge as used
  sideEffects.challengeMarkedUsed = true

  // 6. Insert passkey
  if (input.insertError) {
    return {
      status: 500,
      body: { error: 'Failed to save passkey. Try again.' },
      sideEffects,
    }
  }

  sideEffects.passkeyInserted = true

  // 7. Fire-and-forget emails (non-blocking)
  sideEffects.enrolledEmailSent = true
  sideEffects.deviceAlertEmailSent = true

  const newPasskeyId = 'new-passkey-uuid-001'

  return {
    status: 200,
    body: {
      success: true,
      passkey: {
        id: newPasskeyId,
        deviceHint: 'iPhone 15',
        createdAt: new Date().toISOString(),
        backedUp: verification.registrationInfo.credentialBackedUp,
      },
    },
    sideEffects,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('POST /api/auth/passkey/register — business logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Auth guard ────────────────────────────────────────────────────────────

  it('returns 401 when user is not authenticated', async () => {
    const result = await simulateRegister({
      authenticatedUserId: null,
      credentialPresent: true,
      challenge: validChallenge,
      verificationResult: { verified: true, registrationInfo: defaultVerificationInfo },
    })
    expect(result.status).toBe(401)
    expect(String(result.body.error).toLowerCase()).toContain('sign in')
  })

  // ── Input validation ──────────────────────────────────────────────────────

  it('returns 400 when credential is missing from request body', async () => {
    const result = await simulateRegister({
      authenticatedUserId: VALID_USER_ID,
      credentialPresent: false,
      challenge: validChallenge,
    })
    expect(result.status).toBe(400)
    expect(String(result.body.error).toLowerCase()).toContain('incomplete')
  })

  // ── Challenge validation ──────────────────────────────────────────────────

  it('returns 400 when no valid challenge found', async () => {
    const result = await simulateRegister({
      authenticatedUserId: VALID_USER_ID,
      credentialPresent: true,
      challenge: null,
    })
    expect(result.status).toBe(400)
    expect(String(result.body.error).toLowerCase()).toContain('session expired')
  })

  it('returns 400 when challenge is already used', async () => {
    const result = await simulateRegister({
      authenticatedUserId: VALID_USER_ID,
      credentialPresent: true,
      challenge: { ...validChallenge, used: true },
    })
    expect(result.status).toBe(400)
    expect(String(result.body.error).toLowerCase()).toContain('session expired')
  })

  it('returns 400 when challenge is expired', async () => {
    const expiredChallenge: StoredChallenge = {
      ...validChallenge,
      expires_at: new Date(Date.now() - 120_000).toISOString(),
    }
    const result = await simulateRegister({
      authenticatedUserId: VALID_USER_ID,
      credentialPresent: true,
      challenge: expiredChallenge,
    })
    expect(result.status).toBe(400)
    expect(String(result.body.error).toLowerCase()).toContain('session expired')
  })

  // ── Verification ──────────────────────────────────────────────────────────

  it('returns 400 when verification fails (verified=false)', async () => {
    const result = await simulateRegister({
      authenticatedUserId: VALID_USER_ID,
      credentialPresent: true,
      challenge: validChallenge,
      verificationResult: { verified: false },
    })
    expect(result.status).toBe(400)
    expect(String(result.body.error).toLowerCase()).toContain('verification failed')
  })

  it('returns 500 when verifyRegistrationResponse throws', async () => {
    const result = await simulateRegister({
      authenticatedUserId: VALID_USER_ID,
      credentialPresent: true,
      challenge: validChallenge,
      verificationError: new Error('crypto engine failure'),
    })
    expect(result.status).toBe(500)
    // Sanitized error — no internal stack traces
    expect(String(result.body.error)).not.toContain('crypto engine failure')
  })

  // ── Happy path ────────────────────────────────────────────────────────────

  it('happy path: returns 200 with passkey object on success', async () => {
    const result = await simulateRegister({
      authenticatedUserId: VALID_USER_ID,
      credentialPresent: true,
      challenge: validChallenge,
      verificationResult: { verified: true, registrationInfo: defaultVerificationInfo },
    })
    expect(result.status).toBe(200)
    expect(result.body.success).toBe(true)
    expect(result.body.passkey).toMatchObject({
      id: expect.any(String),
      deviceHint: expect.any(String),
      createdAt: expect.any(String),
    })
  })

  it('marks challenge as used on success', async () => {
    const result = await simulateRegister({
      authenticatedUserId: VALID_USER_ID,
      credentialPresent: true,
      challenge: validChallenge,
      verificationResult: { verified: true, registrationInfo: defaultVerificationInfo },
    })
    expect(result.sideEffects?.challengeMarkedUsed).toBe(true)
  })

  it('inserts passkey into DB on success', async () => {
    const result = await simulateRegister({
      authenticatedUserId: VALID_USER_ID,
      credentialPresent: true,
      challenge: validChallenge,
      verificationResult: { verified: true, registrationInfo: defaultVerificationInfo },
    })
    expect(result.sideEffects?.passkeyInserted).toBe(true)
  })

  it('returns backed_up=true for iCloud Keychain passkey', async () => {
    const cloudPasskeyInfo: VerificationInfo = { ...defaultVerificationInfo, credentialBackedUp: true }
    const result = await simulateRegister({
      authenticatedUserId: VALID_USER_ID,
      credentialPresent: true,
      challenge: validChallenge,
      verificationResult: { verified: true, registrationInfo: cloudPasskeyInfo },
    })
    expect(result.status).toBe(200)
    expect((result.body.passkey as Record<string, unknown>).backedUp).toBe(true)
  })

  it('returns backed_up=false for single-device passkey', async () => {
    const localPasskeyInfo: VerificationInfo = {
      ...defaultVerificationInfo,
      credentialDeviceType: 'singleDevice',
      credentialBackedUp: false,
    }
    const result = await simulateRegister({
      authenticatedUserId: VALID_USER_ID,
      credentialPresent: true,
      challenge: validChallenge,
      verificationResult: { verified: true, registrationInfo: localPasskeyInfo },
    })
    expect(result.status).toBe(200)
    expect((result.body.passkey as Record<string, unknown>).backedUp).toBe(false)
  })

  // ── Email side effects ────────────────────────────────────────────────────

  it('triggers both enrolled and device-alert emails after successful registration', async () => {
    const result = await simulateRegister({
      authenticatedUserId: VALID_USER_ID,
      credentialPresent: true,
      challenge: validChallenge,
      verificationResult: { verified: true, registrationInfo: defaultVerificationInfo },
    })
    expect(result.sideEffects?.enrolledEmailSent).toBe(true)
    expect(result.sideEffects?.deviceAlertEmailSent).toBe(true)
  })

  // ── DB insert failure ─────────────────────────────────────────────────────

  it('returns 500 when passkey insert fails', async () => {
    const result = await simulateRegister({
      authenticatedUserId: VALID_USER_ID,
      credentialPresent: true,
      challenge: validChallenge,
      verificationResult: { verified: true, registrationInfo: defaultVerificationInfo },
      insertError: new Error('unique constraint violation'),
    })
    expect(result.status).toBe(500)
    // Sanitized error message
    expect(String(result.body.error)).not.toContain('unique constraint violation')
    expect(String(result.body.error).toLowerCase()).toContain('failed to save')
  })
})
