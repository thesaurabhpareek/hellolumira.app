/**
 * @module POST /api/analytics
 * @description Fire-and-forget analytics event ingestion endpoint.
 *   Accepts client-side events and writes them to the analytics_events table.
 *   No auth required — client sends events via sendBeacon/fetch.
 *   profile_id is accepted but never echoed back; all failures are silent.
 */

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Enforce max body size to prevent abuse
    const contentLength = parseInt(request.headers.get('content-length') || '0', 10)
    if (contentLength > 10_000) {
      return NextResponse.json({ ok: true }, { status: 200, headers: SECURITY_HEADERS })
    }

    const text = await request.text()
    if (text.length > 10_000) {
      return NextResponse.json({ ok: true }, { status: 200, headers: SECURITY_HEADERS })
    }

    let body: Record<string, unknown>
    try {
      body = JSON.parse(text) as Record<string, unknown>
    } catch {
      return NextResponse.json({ ok: true }, { status: 200, headers: SECURITY_HEADERS })
    }

    // Extract fields — profile_id is optional (anon events allowed)
    const {
      event,
      properties,
      profile_id,
      session_id,
      timestamp,
      url,
    } = body as {
      event?: string
      properties?: Record<string, unknown>
      profile_id?: string
      session_id?: string
      timestamp?: string
      url?: string
    }

    if (!event || typeof event !== 'string' || event.length > 100) {
      return NextResponse.json({ ok: true }, { status: 200, headers: SECURITY_HEADERS })
    }

    // Write to analytics_events table via service client (bypasses RLS)
    // Non-blocking: fire and forget — never let DB errors reach the client
    const supabase = await createServiceClient()
    supabase.from('analytics_events').insert({
      event_name: event,
      event_category: typeof properties?.category === 'string' ? properties.category : null,
      profile_id: typeof profile_id === 'string' && profile_id.length === 36 ? profile_id : null,
      session_id: typeof session_id === 'string' ? session_id.slice(0, 64) : null,
      properties: properties ?? null,
      page_path: typeof url === 'string' ? new URL(url, 'https://hellolumira.app').pathname.slice(0, 255) : null,
      occurred_at: typeof timestamp === 'string' ? timestamp : new Date().toISOString(),
    }).then(({ error }) => {
      if (error) {
        // Log to console for observability but never surface to client
        console.warn('[analytics] DB write failed:', error.message, { event })
      }
    })

    return NextResponse.json({ ok: true }, { status: 200, headers: SECURITY_HEADERS })
  } catch {
    // Malformed payload — still return 200 to avoid client retries
    return NextResponse.json({ ok: true }, { status: 200, headers: SECURITY_HEADERS })
  }
}
