// __tests__/lib/passkey-rate-limit.test.ts
// Unit tests for the passkey rate-limiting helper.
// This is security-critical code — covers: allow/block decisions, window expiry,
// fail-open behavior (DB errors must never block legitimate requests), and upsert logic.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkPasskeyRateLimit } from '@/lib/passkey-rate-limit'
import type { SupabaseClient } from '@supabase/supabase-js'

// ─── Mock factory ─────────────────────────────────────────────────────────────

function makeService({
  selectData = null as { attempts: number; window_start: string } | null,
  selectError = null as { message: string } | null,
  upsertError = null as { message: string } | null,
  selectThrows = false,
  upsertThrows = false,
} = {}): SupabaseClient {
  const upsertFn = vi.fn().mockReturnValue(
    upsertThrows
      ? Promise.reject(new Error('upsert threw'))
      : Promise.resolve({ error: upsertError })
  )

  const selectChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnValue(
      selectThrows
        ? Promise.reject(new Error('select threw'))
        : Promise.resolve({ data: selectData, error: selectError })
    ),
  }

  return {
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'passkey_rate_limits') {
        return {
          ...selectChain,
          upsert: upsertFn,
        }
      }
      return selectChain
    }),
  } as unknown as SupabaseClient
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const KEY = 'passkey_auth:1.2.3.4'
const MAX = 5
const WINDOW_MS = 5 * 60 * 1000 // 5 minutes

function recentWindowStart() {
  // 1 minute ago — well within the window
  return new Date(Date.now() - 60_000).toISOString()
}

function expiredWindowStart() {
  // 10 minutes ago — outside the window
  return new Date(Date.now() - 10 * 60_000).toISOString()
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('checkPasskeyRateLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Happy path ───────────────────────────────────────────────────────────────

  it('allows when no rate limit row exists (first request)', async () => {
    const service = makeService({ selectData: null })
    const result = await checkPasskeyRateLimit(service, KEY, MAX, WINDOW_MS)
    expect(result.allowed).toBe(true)
    expect(result.skipped).toBeUndefined()
  })

  it('allows when attempts are below max within the window', async () => {
    const service = makeService({
      selectData: { attempts: MAX - 1, window_start: recentWindowStart() },
    })
    const result = await checkPasskeyRateLimit(service, KEY, MAX, WINDOW_MS)
    expect(result.allowed).toBe(true)
  })

  it('blocks when attempts equal max within the window', async () => {
    const service = makeService({
      selectData: { attempts: MAX, window_start: recentWindowStart() },
    })
    const result = await checkPasskeyRateLimit(service, KEY, MAX, WINDOW_MS)
    expect(result.allowed).toBe(false)
  })

  it('blocks when attempts exceed max within the window', async () => {
    const service = makeService({
      selectData: { attempts: MAX + 10, window_start: recentWindowStart() },
    })
    const result = await checkPasskeyRateLimit(service, KEY, MAX, WINDOW_MS)
    expect(result.allowed).toBe(false)
  })

  it('allows when window has expired (resets counter)', async () => {
    // Even though attempts was MAX, the window expired → counter resets
    const service = makeService({
      selectData: { attempts: MAX, window_start: expiredWindowStart() },
    })
    const result = await checkPasskeyRateLimit(service, KEY, MAX, WINDOW_MS)
    expect(result.allowed).toBe(true)
  })

  it('allows with attempts=1 in expired window (well under limit, but still resets)', async () => {
    const service = makeService({
      selectData: { attempts: 1, window_start: expiredWindowStart() },
    })
    const result = await checkPasskeyRateLimit(service, KEY, MAX, WINDOW_MS)
    expect(result.allowed).toBe(true)
  })

  // ── Fail-open: DB errors must never block legitimate requests ──────────────

  it('fails open when SELECT returns a DB error (allowed: true, skipped: true)', async () => {
    const service = makeService({ selectError: { message: 'connection refused' } })
    const result = await checkPasskeyRateLimit(service, KEY, MAX, WINDOW_MS)
    expect(result.allowed).toBe(true)
    expect(result.skipped).toBe(true)
  })

  it('fails open when SELECT throws unexpectedly (allowed: true, skipped: true)', async () => {
    const service = makeService({ selectThrows: true })
    const result = await checkPasskeyRateLimit(service, KEY, MAX, WINDOW_MS)
    expect(result.allowed).toBe(true)
    expect(result.skipped).toBe(true)
  })

  it('still allows when UPSERT fails (fail-open — upsert error is non-fatal)', async () => {
    // SELECT succeeds (below limit), UPSERT fails — request should still go through
    const service = makeService({
      selectData: { attempts: 1, window_start: recentWindowStart() },
      upsertError: { message: 'upsert conflict' },
    })
    const result = await checkPasskeyRateLimit(service, KEY, MAX, WINDOW_MS)
    expect(result.allowed).toBe(true)
  })

  it('still allows when UPSERT throws unexpectedly (fail-open)', async () => {
    const service = makeService({
      selectData: null,
      upsertThrows: true,
    })
    const result = await checkPasskeyRateLimit(service, KEY, MAX, WINDOW_MS)
    // The catch block at the top level returns fail-open
    expect(result.allowed).toBe(true)
    expect(result.skipped).toBe(true)
  })

  // ── Window boundary edge cases ────────────────────────────────────────────

  it('maxAttempts=1 blocks on the very first request if row already at 1', async () => {
    const service = makeService({
      selectData: { attempts: 1, window_start: recentWindowStart() },
    })
    const result = await checkPasskeyRateLimit(service, KEY, 1, WINDOW_MS)
    expect(result.allowed).toBe(false)
  })

  it('maxAttempts=10 with attempts=9 → allowed', async () => {
    const service = makeService({
      selectData: { attempts: 9, window_start: recentWindowStart() },
    })
    const result = await checkPasskeyRateLimit(service, KEY, 10, WINDOW_MS)
    expect(result.allowed).toBe(true)
  })

  it('maxAttempts=10 with attempts=10 → blocked', async () => {
    const service = makeService({
      selectData: { attempts: 10, window_start: recentWindowStart() },
    })
    const result = await checkPasskeyRateLimit(service, KEY, 10, WINDOW_MS)
    expect(result.allowed).toBe(false)
  })

  // ── skipped flag only set on DB errors, not on normal allow ──────────────

  it('allowed=true does NOT set skipped when DB is healthy', async () => {
    const service = makeService({
      selectData: { attempts: 1, window_start: recentWindowStart() },
    })
    const result = await checkPasskeyRateLimit(service, KEY, MAX, WINDOW_MS)
    expect(result.allowed).toBe(true)
    expect(result.skipped).toBeUndefined()
  })
})
