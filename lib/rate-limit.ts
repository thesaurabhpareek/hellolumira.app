/**
 * @module RateLimit
 * @description In-memory rate limiter using a sliding window approach with
 *   automatic TTL cleanup. Designed for serverless environments where each
 *   instance maintains its own window — sufficient for v1 abuse prevention.
 * @version 1.0.0
 * @since March 2026
 */

interface RateLimitEntry {
  timestamps: number[]
}

const store = new Map<string, RateLimitEntry>()

/** Interval for cleaning up expired entries (every 60 seconds). */
const CLEANUP_INTERVAL_MS = 60_000
let lastCleanup = Date.now()

/**
 * Removes entries whose timestamps have all expired beyond the window.
 * Runs at most once per CLEANUP_INTERVAL_MS to keep overhead minimal.
 */
function maybeCleanup(windowMs: number): void {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now

  const cutoff = now - windowMs
  store.forEach((entry, key) => {
    // Remove entries where all timestamps are older than the window
    if (entry.timestamps.length === 0 || entry.timestamps[entry.timestamps.length - 1] < cutoff) {
      store.delete(key)
    }
  })
}

/**
 * Checks whether a request from the given user is within rate limits.
 *
 * @param userId - Unique identifier for the user (typically auth user ID).
 * @param limit - Maximum number of requests allowed within the window. Defaults to 20.
 * @param windowMs - Time window in milliseconds. Defaults to 60000 (1 minute).
 * @returns An object indicating whether the request is allowed, and if not,
 *   how many seconds until the user can retry.
 */
export async function checkRateLimit(
  userId: string,
  limit: number = 20,
  windowMs: number = 60_000
): Promise<{ allowed: boolean; retryAfter?: number }> {
  maybeCleanup(windowMs)

  const now = Date.now()
  const cutoff = now - windowMs
  const key = `rate:${userId}`

  let entry = store.get(key)
  if (!entry) {
    entry = { timestamps: [] }
    store.set(key, entry)
  }

  // Filter out timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff)

  if (entry.timestamps.length >= limit) {
    // Calculate when the oldest request in the window will expire
    const oldestInWindow = entry.timestamps[0]
    const retryAfterMs = oldestInWindow + windowMs - now
    const retryAfterSeconds = Math.ceil(retryAfterMs / 1000)

    return { allowed: false, retryAfter: Math.max(retryAfterSeconds, 1) }
  }

  // Allow the request and record the timestamp
  entry.timestamps.push(now)
  return { allowed: true }
}
