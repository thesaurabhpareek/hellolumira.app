import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkRateLimit } from '@/lib/rate-limit'

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // ── HAPPY PATH ──

  it('allows the first request', async () => {
    const result = await checkRateLimit('user-first-request-test')
    expect(result.allowed).toBe(true)
    expect(result.retryAfter).toBeUndefined()
  })

  it('allows 19 requests (under limit of 20)', async () => {
    const userId = 'user-19-requests-test'
    for (let i = 0; i < 19; i++) {
      const result = await checkRateLimit(userId)
      expect(result.allowed).toBe(true)
    }
  })

  it('allows the 20th request (at limit)', async () => {
    const userId = 'user-20-requests-test'
    for (let i = 0; i < 20; i++) {
      await checkRateLimit(userId)
    }
    // 20th was the last allowed
  })

  // ── UNHAPPY PATH ──

  it('blocks the 21st request with retryAfter', async () => {
    const userId = 'user-21-requests-test'
    for (let i = 0; i < 20; i++) {
      const result = await checkRateLimit(userId)
      expect(result.allowed).toBe(true)
    }
    const blocked = await checkRateLimit(userId)
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfter).toBeDefined()
    expect(blocked.retryAfter).toBeGreaterThanOrEqual(1)
  })

  // ── WINDOW EXPIRY ──

  it('allows requests again after window expires', async () => {
    const userId = 'user-window-expiry-test'
    const now = Date.now()

    // Fill up the rate limit
    vi.spyOn(Date, 'now').mockReturnValue(now)
    for (let i = 0; i < 20; i++) {
      await checkRateLimit(userId, 20, 1000) // 1 second window
    }

    // Should be blocked
    const blocked = await checkRateLimit(userId, 20, 1000)
    expect(blocked.allowed).toBe(false)

    // Advance time past the window
    vi.spyOn(Date, 'now').mockReturnValue(now + 1100)
    const allowed = await checkRateLimit(userId, 20, 1000)
    expect(allowed.allowed).toBe(true)
  })

  // ── EDGE: Different users have independent limits ──

  it('different users have independent limits', async () => {
    const userA = 'user-independent-A'
    const userB = 'user-independent-B'

    // Fill up userA
    for (let i = 0; i < 20; i++) {
      await checkRateLimit(userA)
    }
    const blockedA = await checkRateLimit(userA)
    expect(blockedA.allowed).toBe(false)

    // userB should still be allowed
    const allowedB = await checkRateLimit(userB)
    expect(allowedB.allowed).toBe(true)
  })

  // ── EDGE: Custom limit ──

  it('respects custom limit (5 per window)', async () => {
    const userId = 'user-custom-limit-test'
    for (let i = 0; i < 5; i++) {
      const result = await checkRateLimit(userId, 5, 60_000)
      expect(result.allowed).toBe(true)
    }
    const blocked = await checkRateLimit(userId, 5, 60_000)
    expect(blocked.allowed).toBe(false)
  })

  // ── EDGE: Custom window ──

  it('respects custom window (30 seconds)', async () => {
    const userId = 'user-custom-window-test'
    const now = Date.now()

    vi.spyOn(Date, 'now').mockReturnValue(now)
    for (let i = 0; i < 20; i++) {
      await checkRateLimit(userId, 20, 30_000)
    }

    const blocked = await checkRateLimit(userId, 20, 30_000)
    expect(blocked.allowed).toBe(false)

    // Advance past 30-second window
    vi.spyOn(Date, 'now').mockReturnValue(now + 31_000)
    const allowed = await checkRateLimit(userId, 20, 30_000)
    expect(allowed.allowed).toBe(true)
  })

  // ── EDGE: retryAfter is always >= 1 ──

  it('retryAfter is always >= 1', async () => {
    const userId = 'user-retryafter-min-test'
    for (let i = 0; i < 20; i++) {
      await checkRateLimit(userId)
    }
    const blocked = await checkRateLimit(userId)
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfter).toBeGreaterThanOrEqual(1)
  })

  // ── EDGE: Cleanup runs after interval ──

  it('cleanup runs after interval without errors', async () => {
    const userId = 'user-cleanup-test'
    const now = Date.now()

    vi.spyOn(Date, 'now').mockReturnValue(now)
    await checkRateLimit(userId, 20, 1000)

    // Advance past cleanup interval (60 seconds)
    vi.spyOn(Date, 'now').mockReturnValue(now + 61_000)
    // This should trigger cleanup and not throw
    const result = await checkRateLimit(userId, 20, 1000)
    expect(result.allowed).toBe(true)
  })
})
