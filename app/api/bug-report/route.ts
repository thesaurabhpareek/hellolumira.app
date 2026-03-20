/**
 * @module BugReportAPI
 * @description POST /api/bug-report — Submits a bug report with auto-captured
 *   device info and console logs. Requires authentication.
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SECURITY_HEADERS } from '@/lib/utils'

interface BugReportRequest {
  subject: string
  description: string
  category?: string
  device_type?: string
  browser?: string
  os?: string
  screen_resolution?: string
  user_agent?: string
  page_url?: string
  console_logs?: Array<{ level: string; message: string; timestamp: string }>
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: SECURITY_HEADERS }
      )
    }

    let body: BugReportRequest
    try {
      body = (await request.json()) as BugReportRequest
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    if (!body.subject?.trim() || !body.description?.trim()) {
      return NextResponse.json(
        { error: 'Subject and description are required' },
        { status: 400, headers: SECURITY_HEADERS }
      )
    }

    // Get user profile for email and name
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('id', user.id)
      .single()

    const { error: insertError } = await supabase
      .from('bug_reports')
      .insert({
        profile_id: user.id,
        email: user.email || null,
        display_name: profile?.first_name || null,
        subject: body.subject.trim().slice(0, 200),
        description: body.description.trim().slice(0, 5000),
        category: ['bug', 'feedback', 'feature_request', 'other'].includes(body.category || '')
          ? body.category
          : 'bug',
        device_type: body.device_type?.slice(0, 50) || null,
        browser: body.browser?.slice(0, 50) || null,
        os: body.os?.slice(0, 50) || null,
        screen_resolution: body.screen_resolution?.slice(0, 20) || null,
        user_agent: body.user_agent?.slice(0, 500) || null,
        page_url: body.page_url?.slice(0, 500) || null,
        console_logs: (body.console_logs || []).slice(-30),
      })

    if (insertError) {
      console.error('[bug-report] Insert error:', insertError.message)
      return NextResponse.json(
        { error: 'Failed to submit report' },
        { status: 500, headers: SECURITY_HEADERS }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Bug report submitted' },
      { headers: SECURITY_HEADERS }
    )
  } catch (err) {
    console.error('[bug-report] Error:', err)
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500, headers: SECURITY_HEADERS }
    )
  }
}
