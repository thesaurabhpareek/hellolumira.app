/**
 * @module SupabaseServer
 * @description Server-side Supabase client factories. Provides two variants:
 *   - `createClient()`: uses the anon key with session cookies (respects RLS).
 *   - `createServiceClient()`: uses the service role key (bypasses RLS) for
 *     system-level operations like audit logging and consent recording.
 * @version 1.0.0
 * @since March 2026
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/** Creates a Supabase client with the anon key (respects RLS via session cookies). */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — cookies set in middleware
          }
        },
      },
    }
  )
}

/** Creates a Supabase client with the service role key (bypasses RLS). */
export async function createServiceClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch { /* ignore */ }
        },
      },
    }
  )
}
