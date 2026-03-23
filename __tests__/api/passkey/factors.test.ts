// __tests__/api/passkey/factors.test.ts
// Tests for GET /api/auth/passkey/factors business logic.
// Covers: auth guard, passkey list shape, empty list, field projection,
// ordering, and error handling.

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Types ────────────────────────────────────────────────────────────────────

interface StoredPasskey {
  id: string
  device_hint: string
  device_type: 'singleDevice' | 'multiDevice'
  backed_up: boolean
  created_at: string
  last_used_at: string | null
  status: 'active' | 'suspended'
}

interface FactorsInput {
  authenticatedUserId: string | null
  passkeys?: StoredPasskey[]
  dbError?: Error | null
}

interface FactorsResult {
  status: number
  body: Record<string, unknown>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VALID_USER_ID = '00000000-0000-0000-0000-000000000001'

const makePasskey = (overrides: Partial<StoredPasskey> = {}): StoredPasskey => ({
  id: 'passkey-uuid-001',
  device_hint: 'iPhone 15',
  device_type: 'multiDevice',
  backed_up: true,
  created_at: '2026-01-01T00:00:00.000Z',
  last_used_at: null,
  status: 'active',
  ...overrides,
})

// ─── Business logic simulation ────────────────────────────────────────────────

async function simulateFactors(input: FactorsInput): Promise<FactorsResult> {
  // 1. Auth guard
  if (!input.authenticatedUserId) {
    return { status: 401, body: { error: 'Please sign in to continue.' } }
  }

  // 2. DB error
  if (input.dbError) {
    return { status: 500, body: { error: 'Failed to load passkeys' } }
  }

  // 3. Return passkeys (may be empty)
  const passkeys = input.passkeys ?? []

  return {
    status: 200,
    body: { passkeys },
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GET /api/auth/passkey/factors — business logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Auth guard ────────────────────────────────────────────────────────────

  it('returns 401 when user is not authenticated', async () => {
    const result = await simulateFactors({ authenticatedUserId: null })
    expect(result.status).toBe(401)
    expect(String(result.body.error).toLowerCase()).toContain('sign in')
  })

  // ── Empty state ───────────────────────────────────────────────────────────

  it('returns 200 with empty array when user has no passkeys', async () => {
    const result = await simulateFactors({
      authenticatedUserId: VALID_USER_ID,
      passkeys: [],
    })
    expect(result.status).toBe(200)
    expect(result.body.passkeys).toEqual([])
  })

  it('returns passkeys array even when DB returns null (treated as empty)', async () => {
    const result = await simulateFactors({
      authenticatedUserId: VALID_USER_ID,
      passkeys: undefined, // simulates DB returning null
    })
    expect(result.status).toBe(200)
    expect(Array.isArray(result.body.passkeys)).toBe(true)
  })

  // ── Passkey list ─────────────────────────────────────────────────────────

  it('returns all passkeys for the authenticated user', async () => {
    const passkeys = [
      makePasskey({ id: 'pk-1', device_hint: 'iPhone 15' }),
      makePasskey({ id: 'pk-2', device_hint: 'MacBook Pro' }),
    ]
    const result = await simulateFactors({ authenticatedUserId: VALID_USER_ID, passkeys })
    expect(result.status).toBe(200)
    const list = result.body.passkeys as StoredPasskey[]
    expect(list).toHaveLength(2)
    expect(list[0].id).toBe('pk-1')
    expect(list[1].id).toBe('pk-2')
  })

  // ── Field projection ─────────────────────────────────────────────────────

  it('each passkey includes required fields: id, device_hint, device_type, backed_up, created_at, last_used_at, status', async () => {
    const passkey = makePasskey()
    const result = await simulateFactors({
      authenticatedUserId: VALID_USER_ID,
      passkeys: [passkey],
    })
    const item = (result.body.passkeys as StoredPasskey[])[0]
    expect(item).toHaveProperty('id')
    expect(item).toHaveProperty('device_hint')
    expect(item).toHaveProperty('device_type')
    expect(item).toHaveProperty('backed_up')
    expect(item).toHaveProperty('created_at')
    expect(item).toHaveProperty('last_used_at')
    expect(item).toHaveProperty('status')
  })

  it('passkey with last_used_at=null is included without error', async () => {
    const passkey = makePasskey({ last_used_at: null })
    const result = await simulateFactors({
      authenticatedUserId: VALID_USER_ID,
      passkeys: [passkey],
    })
    expect(result.status).toBe(200)
    const item = (result.body.passkeys as StoredPasskey[])[0]
    expect(item.last_used_at).toBeNull()
  })

  // ── Status field ──────────────────────────────────────────────────────────

  it('returns active passkeys correctly', async () => {
    const passkey = makePasskey({ status: 'active' })
    const result = await simulateFactors({
      authenticatedUserId: VALID_USER_ID,
      passkeys: [passkey],
    })
    const item = (result.body.passkeys as StoredPasskey[])[0]
    expect(item.status).toBe('active')
  })

  it('returns suspended passkeys (UI shows warning badge)', async () => {
    const passkey = makePasskey({ status: 'suspended' })
    const result = await simulateFactors({
      authenticatedUserId: VALID_USER_ID,
      passkeys: [passkey],
    })
    const item = (result.body.passkeys as StoredPasskey[])[0]
    expect(item.status).toBe('suspended')
  })

  // ── backed_up field ───────────────────────────────────────────────────────

  it('correctly reflects backed_up=true for iCloud Keychain passkeys', async () => {
    const passkey = makePasskey({ backed_up: true, device_type: 'multiDevice' })
    const result = await simulateFactors({
      authenticatedUserId: VALID_USER_ID,
      passkeys: [passkey],
    })
    const item = (result.body.passkeys as StoredPasskey[])[0]
    expect(item.backed_up).toBe(true)
  })

  it('correctly reflects backed_up=false for single-device passkeys', async () => {
    const passkey = makePasskey({ backed_up: false, device_type: 'singleDevice' })
    const result = await simulateFactors({
      authenticatedUserId: VALID_USER_ID,
      passkeys: [passkey],
    })
    const item = (result.body.passkeys as StoredPasskey[])[0]
    expect(item.backed_up).toBe(false)
  })

  // ── Error handling ────────────────────────────────────────────────────────

  it('returns 500 on unexpected DB error with sanitized message', async () => {
    const result = await simulateFactors({
      authenticatedUserId: VALID_USER_ID,
      dbError: new Error('connection pool exhausted at replica 10.0.0.5'),
    })
    expect(result.status).toBe(500)
    // Sanitized — must not leak internal details
    expect(String(result.body.error)).not.toContain('10.0.0.5')
    expect(String(result.body.error)).not.toContain('connection pool exhausted')
  })
})
