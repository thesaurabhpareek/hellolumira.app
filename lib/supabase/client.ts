/**
 * @module SupabaseClient
 * @description Browser-side Supabase client factory. Creates an SSR-compatible
 *   browser client using environment variables for the Supabase URL and anon key.
 * @version 1.0.0
 * @since March 2026
 */

import { createBrowserClient } from '@supabase/ssr'

/** Creates a Supabase client for browser-side (React component) usage. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
