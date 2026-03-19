/**
 * @module POST /api/analytics
 * @description Fire-and-forget analytics event ingestion endpoint.
 *   In v1, events are logged to Vercel function logs for analysis.
 *   No auth required — client sends events via sendBeacon/fetch.
 */

import { NextResponse } from 'next/server'
import { SECURITY_HEADERS } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Enforce max body size to prevent log injection / abuse
    const contentLength = parseInt(request.headers.get('content-length') || '0', 10)
    if (contentLength > 10_000) {
      return NextResponse.json({ ok: true }, { status: 200, headers: SECURITY_HEADERS })
    }

    const text = await request.text()
    if (text.length > 10_000) {
      return NextResponse.json({ ok: true }, { status: 200, headers: SECURITY_HEADERS })
    }

    let body: unknown
    try {
      body = JSON.parse(text)
    } catch {
      return NextResponse.json({ ok: true }, { status: 200, headers: SECURITY_HEADERS })
    }

    // Log a truncated, safe summary to Vercel function logs for v1 observability
    const logStr = JSON.stringify(body).slice(0, 2000)
    console.log('[analytics]', logStr)

    return NextResponse.json({ ok: true }, { status: 200, headers: SECURITY_HEADERS })
  } catch {
    // Malformed payload — still return 200 to avoid client retries
    return NextResponse.json({ ok: true }, { status: 200, headers: SECURITY_HEADERS })
  }
}
