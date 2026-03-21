/**
 * @module ExportDownloadAPI
 * @description GET /api/privacy/export/[token] — Token-based data export download.
 *   Validates a signed token against `data_export_requests`, checks status and
 *   expiry, and returns the assembled export JSON as a downloadable file.
 *   No auth required — access is granted via the cryptographic token.
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SECURITY_HEADERS } from '@/lib/utils'
import { checkIpRateLimit } from '@/lib/rate-limit'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // SECURITY: Rate limit by IP to prevent token brute-force
    const { allowed, retryAfter } = await checkIpRateLimit(_request, 10, 60_000)
    if (!allowed) {
      return NextResponse.json(
        { error: true, message: 'Too many requests. Please try again later.' },
        { status: 429, headers: { ...SECURITY_HEADERS, 'Retry-After': String(retryAfter) } }
      )
    }

    if (!token || typeof token !== 'string' || token.length < 16) {
      return NextResponse.json(
        { error: true, message: 'Invalid or missing token.' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    // Use service role client to bypass RLS (no user session needed)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // SECURITY: Atomically claim the export to prevent TOCTOU race condition.
    // This single UPDATE+SELECT prevents concurrent downloads of the same token.
    const { data: exportRequest, error: claimError } = await supabase
      .from('data_export_requests')
      .update({ status: 'downloaded' })
      .eq('download_token', token)
      .eq('status', 'ready')
      .select('*')
      .single()

    if (claimError || !exportRequest) {
      return NextResponse.json(
        { error: true, message: 'Export not found, already downloaded, or not ready.' },
        { status: 404, headers: SECURITY_HEADERS }
      )
    }

    // Check if the download link has expired (revert status if so)
    if (exportRequest.expires_at && new Date(exportRequest.expires_at) < new Date()) {
      await supabase
        .from('data_export_requests')
        .update({ status: 'expired' })
        .eq('id', exportRequest.id)
      return NextResponse.json(
        { error: true, message: 'This export link has expired. Please request a new export.' },
        { status: 410, headers: SECURITY_HEADERS }
      )
    }

    // Return the export data as a downloadable JSON file
    const exportData = exportRequest.export_data
    if (!exportData) {
      return NextResponse.json(
        { error: true, message: 'Export data is unavailable.' },
        { status: 404, headers: SECURITY_HEADERS }
      )
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        ...SECURITY_HEADERS,
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="lumira-data-export-${exportRequest.id}.json"`,
      },
    })
  } catch (err) {
    console.error('[export/[token]] Error:', err)
    return NextResponse.json(
      { error: true, message: 'Something went wrong. Try again.' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}
