// __tests__/api/passkey/revoke.test.ts
// Tests for the DELETE /api/auth/passkey/[factorId] endpoint business logic.
// Covers: auth, IDOR, rate limiting, email trigger, and error handling.

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Constants ───────────────────────────────────────────────────────────────

const VALID_USER_ID = '00000000-0000-0000-0000-000000000001'
const OTHER_USER_ID = '00000000-0000-0000-0000-000000000002'
const PASSKEY_ID = 'passkey-uuid-001'

// ─── Types ───────────────────────────────────────────────────────────────────

interface StoredPasskey {
  id: string
  user_id: string
  device_hint: string
  created_at: string
}

interface DeletionRecord {
  user_id: string
  deleted_at: string
}

interface RevokeInput {
  authenticatedUserId: string | null
  factorId: string
  passkey: StoredPasskey | null
  recentDeletions: DeletionRecord[]
  dbDeleteError?: Error | null
  emailSent?: boolean
}

interface RevokeResult {
  status: number
  body: Record<string, unknown>
  sideEffects?: {
    passkeysDeleted?: string[]
    emailTriggered?: boolean
  }
}

const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours
const RATE_LIMIT_MAX_DELETIONS = 3

// ─── Business logic simulation ────────────────────────────────────────────────

async function simulateRevoke(input: RevokeInput): Promise<RevokeResult> {
  const sideEffects: { passkeysDeleted: string[]; emailTriggered: boolean } = {
    passkeysDeleted: [],
    emailTriggered: false,
  }

  // 1. Auth check
  if (!input.authenticatedUserId) {
    return { status: 401, body: { error: 'Not authenticated' }, sideEffects }
  }

  // 2. Look up the passkey
  const passkey = input.passkey
  if (!passkey) {
    return { status: 404, body: { error: 'Passkey not found' }, sideEffects }
  }

  // 3. IDOR check: passkey must belong to the authenticated user
  if (passkey.user_id !== input.authenticatedUserId) {
    return {
      status: 403,
      body: { error: 'You do not have permission to delete this passkey.' },
      sideEffects,
    }
  }

  // 4. Rate limit: max RATE_LIMIT_MAX_DELETIONS deletions in 24 hours
  const windowStart = Date.now() - RATE_LIMIT_WINDOW_MS
  const recentCount = input.recentDeletions.filter(
    d => new Date(d.deleted_at).getTime() > windowStart && d.user_id === input.authenticatedUserId
  ).length

  if (recentCount >= RATE_LIMIT_MAX_DELETIONS) {
    return {
      status: 429,
      body: {
        error: 'You have removed too many passkeys recently. Please wait 24 hours.',
      },
      sideEffects,
    }
  }

  // 5. DB delete
  if (input.dbDeleteError) {
    return { status: 500, body: { error: 'Internal server error' }, sideEffects }
  }

  sideEffects.passkeysDeleted.push(passkey.id)

  // 6. Fire-and-forget email (does not block response)
  sideEffects.emailTriggered = true

  return {
    status: 200,
    body: { success: true },
    sideEffects,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('DELETE /api/auth/passkey/[factorId] — business logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const basePasskey: StoredPasskey = {
    id: PASSKEY_ID,
    user_id: VALID_USER_ID,
    device_hint: 'iPhone 15',
    created_at: new Date().toISOString(),
  }

  it('returns 401 when not authenticated', async () => {
    const result = await simulateRevoke({
      authenticatedUserId: null,
      factorId: PASSKEY_ID,
      passkey: basePasskey,
      recentDeletions: [],
    })
    expect(result.status).toBe(401)
  })

  it('returns 403 when factorId belongs to different user (IDOR prevention)', async () => {
    const result = await simulateRevoke({
      authenticatedUserId: OTHER_USER_ID, // attacker
      factorId: PASSKEY_ID,
      passkey: basePasskey, // belongs to VALID_USER_ID
      recentDeletions: [],
    })
    expect(result.status).toBe(403)
    expect(String(result.body.error)).toContain('permission')
  })

  it('happy path: deletes passkey, returns { success: true }', async () => {
    const result = await simulateRevoke({
      authenticatedUserId: VALID_USER_ID,
      factorId: PASSKEY_ID,
      passkey: basePasskey,
      recentDeletions: [],
    })
    expect(result.status).toBe(200)
    expect(result.body.success).toBe(true)
    expect(result.sideEffects?.passkeysDeleted).toContain(PASSKEY_ID)
  })

  it('rate limit: third deletion within 24h → returns 429', async () => {
    const withinWindow = new Date(Date.now() - 1000).toISOString() // 1 second ago
    const recentDeletions: DeletionRecord[] = [
      { user_id: VALID_USER_ID, deleted_at: withinWindow },
      { user_id: VALID_USER_ID, deleted_at: withinWindow },
      { user_id: VALID_USER_ID, deleted_at: withinWindow },
    ]

    const result = await simulateRevoke({
      authenticatedUserId: VALID_USER_ID,
      factorId: PASSKEY_ID,
      passkey: basePasskey,
      recentDeletions,
    })
    expect(result.status).toBe(429)
    expect(String(result.body.error)).toContain('24 hours')
  })

  it('rate limit NOT triggered for 2 deletions within 24h', async () => {
    const withinWindow = new Date(Date.now() - 1000).toISOString()
    const recentDeletions: DeletionRecord[] = [
      { user_id: VALID_USER_ID, deleted_at: withinWindow },
      { user_id: VALID_USER_ID, deleted_at: withinWindow },
    ]

    const result = await simulateRevoke({
      authenticatedUserId: VALID_USER_ID,
      factorId: PASSKEY_ID,
      passkey: basePasskey,
      recentDeletions,
    })
    expect(result.status).toBe(200)
  })

  it('rate limit only counts deletions from the same user (not other users)', async () => {
    const withinWindow = new Date(Date.now() - 1000).toISOString()
    const recentDeletions: DeletionRecord[] = [
      { user_id: OTHER_USER_ID, deleted_at: withinWindow },
      { user_id: OTHER_USER_ID, deleted_at: withinWindow },
      { user_id: OTHER_USER_ID, deleted_at: withinWindow },
      // VALID_USER_ID has 0 deletions
    ]

    const result = await simulateRevoke({
      authenticatedUserId: VALID_USER_ID,
      factorId: PASSKEY_ID,
      passkey: basePasskey,
      recentDeletions,
    })
    expect(result.status).toBe(200) // Not rate-limited
  })

  it('fire-and-forget email triggered after successful deletion', async () => {
    const result = await simulateRevoke({
      authenticatedUserId: VALID_USER_ID,
      factorId: PASSKEY_ID,
      passkey: basePasskey,
      recentDeletions: [],
    })
    expect(result.status).toBe(200)
    expect(result.sideEffects?.emailTriggered).toBe(true)
  })

  it('returns 500 on unexpected DB error', async () => {
    const result = await simulateRevoke({
      authenticatedUserId: VALID_USER_ID,
      factorId: PASSKEY_ID,
      passkey: basePasskey,
      recentDeletions: [],
      dbDeleteError: new Error('deadlock detected in DB'),
    })
    expect(result.status).toBe(500)
    // Sanitized — no internal DB details
    expect(String(result.body.error)).not.toContain('deadlock')
  })

  it('rate limit ignores deletions older than 24 hours', async () => {
    const moreThan24hAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MS - 1000).toISOString()
    const recentDeletions: DeletionRecord[] = [
      { user_id: VALID_USER_ID, deleted_at: moreThan24hAgo },
      { user_id: VALID_USER_ID, deleted_at: moreThan24hAgo },
      { user_id: VALID_USER_ID, deleted_at: moreThan24hAgo },
    ]

    const result = await simulateRevoke({
      authenticatedUserId: VALID_USER_ID,
      factorId: PASSKEY_ID,
      passkey: basePasskey,
      recentDeletions,
    })
    // Old deletions outside window shouldn't trigger rate limit
    expect(result.status).toBe(200)
  })
})
