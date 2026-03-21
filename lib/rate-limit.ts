/**
 * @module RateLimit
 * @description Dual-layer rate limiter: fast in-memory check (per-instance)
 *   backed by Supabase RPC for distributed enforcement across all serverless
 *   instances. Falls back to in-memory only if Supabase call fails.
 * @version 3.0.0
 * @since March 2026
 */

import { createServiceClient } from '@/lib/supabase/server'

// ─── In-memory layer (fast, per-instance) ───────────────────────────────────

interface RateLimitEntry {
  timestamps: number[]
}

const store = new Map<string, RateLimitEntry>()
const CLEANUP_INTERVAL_MS = 60_000
const MAX_STORE_SIZE = 10_000
let lastCleanup = Date.now()

function maybeCleanup(windowMs: number): void {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now

  const cutoff = now - windowMs
  store.forEach((entry, key) => {
    if (entry.timestamps.length === 0 || entry.timestamps[entry.timestamps.length - 1] < cutoff) {
      store.delete(key)
    }
  })

  if (store.size > MAX_STORE_SIZE) {
    const keysToDelete = Array.from(store.keys()).slice(0, Math.floor(MAX_STORE_SIZE / 2))
    keysToDelete.forEach(k => store.delete(k))
  }
}

function checkInMemory(key: string, limit: number, windowMs: number): { allowed: boolean; retryAfter?: number } {
  maybeCleanup(windowMs)
  const now = Date.now()
  const cutoff = now - windowMs
  const storeKey = `rate:${key}`

  let entry = store.get(storeKey)
  if (!entry) {
    entry = { timestamps: [] }
    store.set(storeKey, entry)
  }

  entry.timestamps = entry.timestamps.filter((t) => t > cutoff)

  if (entry.timestamps.length >= limit) {
    const oldestInWindow = entry.timestamps[0]
    const retryAfterMs = oldestInWindow + windowMs - now
    return { allowed: false, retryAfter: Math.max(Math.ceil(retryAfterMs / 1000), 1) }
  }

  entry.timestamps.push(now)
  return { allowed: true }
}

// ─── Distributed layer (Supabase RPC) ───────────────────────────────────────

async function checkDistributed(key: string, limit: number, windowSeconds: number): Promise<boolean | null> {
  try {
    const supabase = await createServiceClient()
    const { data, error } = await supabase.rpc('check_rate_limit_distributed', {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    })
    if (error) {
      console.warn('[rate-limit] Distributed check failed, falling back to in-memory:', error.message)
      return null // Fall back to in-memory
    }
    return data as boolean
  } catch {
    return null // Fall back to in-memory
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Checks whether a request is within rate limits.
 * Uses in-memory check first (fast), then distributed check (accurate).
 * If in-memory says blocked, blocks immediately without hitting DB.
 * If in-memory says allowed, verifies with distributed check.
 */
export async function checkRateLimit(
  key: string,
  limit: number = 20,
  windowMs: number = 60_000
): Promise<{ allowed: boolean; retryAfter?: number }> {
  // Fast path: in-memory check first
  const memResult = checkInMemory(key, limit, windowMs)
  if (!memResult.allowed) {
    return memResult // Blocked by local instance — skip DB call
  }

  // Distributed check for cross-instance accuracy
  const windowSeconds = Math.ceil(windowMs / 1000)
  const distributedAllowed = await checkDistributed(key, limit, windowSeconds)

  if (distributedAllowed === null) {
    return memResult // DB unavailable — trust in-memory
  }

  if (!distributedAllowed) {
    return { allowed: false, retryAfter: windowSeconds }
  }

  return { allowed: true }
}

/**
 * Rate limit by IP address. Extracts IP from headers, hashes for privacy.
 */
export async function checkIpRateLimit(
  request: { headers: { get(name: string): string | null } },
  limit: number = 10,
  windowMs: number = 60_000
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  const ipKey = `ip:${simpleHash(ip)}`
  return checkRateLimit(ipKey, limit, windowMs)
}

/** Fast non-crypto hash for rate limit keys. */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return hash.toString(36)
}
