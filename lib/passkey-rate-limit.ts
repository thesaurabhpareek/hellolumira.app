// lib/passkey-rate-limit.ts
// Rate limiting helper for passkey endpoints.
// Fails open: if the DB is unreachable, the request is allowed through.
// This prevents the rate limiter from becoming a single point of failure.

import type { SupabaseClient } from '@supabase/supabase-js'

interface RateLimitResult {
  allowed: boolean
  /** true if the check was skipped due to a DB error (fail-open) */
  skipped?: boolean
}

export async function checkPasskeyRateLimit(
  service: SupabaseClient,
  key: string,
  maxAttempts: number,
  windowMs: number
): Promise<RateLimitResult> {
  try {
    const windowStart = new Date(Date.now() - windowMs).toISOString()

    const { data: rlRow, error: selectError } = await service
      .from('passkey_rate_limits')
      .select('attempts, window_start')
      .eq('key', key)
      .maybeSingle()

    if (selectError) {
      console.warn('[passkey-rate-limit] select error, failing open:', selectError.message)
      return { allowed: true, skipped: true }
    }

    const withinWindow = rlRow && rlRow.window_start > windowStart

    if (withinWindow && rlRow.attempts >= maxAttempts) {
      return { allowed: false }
    }

    // Increment (or reset if window expired)
    const { error: upsertError } = await service
      .from('passkey_rate_limits')
      .upsert(
        withinWindow
          ? { key, attempts: rlRow.attempts + 1, window_start: rlRow.window_start }
          : { key, attempts: 1, window_start: new Date().toISOString() },
        { onConflict: 'key' }
      )

    if (upsertError) {
      console.warn('[passkey-rate-limit] upsert error, failing open:', upsertError.message)
    }

    return { allowed: true }
  } catch (err) {
    console.warn('[passkey-rate-limit] unexpected error, failing open:', err)
    return { allowed: true, skipped: true }
  }
}
