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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

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

    // Look up the export request by token
    const { data: exportRequest, error: fetchError } = await supabase
      .from('data_export_requests')
      .select('*')
      .eq('download_token', token)
      .single()

    if (fetchError || !exportRequest) {
      return NextResponse.json(
        { error: true, message: 'Export not found.' },
        { status: 404, headers: SECURITY_HEADERS }
      )
    }

    // Check if the export is ready
    if (exportRequest.status !== 'ready') {
      return NextResponse.json(
        { error: true, message: 'Export is not ready for download.' },
        { status: 404, headers: SECURITY_HEADERS }
      )
    }

    // Check if the download link has expired
    if (exportRequest.expires_at && new Date(exportRequest.expires_at) < new Date()) {
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

    // Mark the export as downloaded to prevent token reuse
    await supabase
      .from('data_export_requests')
      .update({ status: 'downloaded' })
      .eq('id', exportRequest.id)

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
