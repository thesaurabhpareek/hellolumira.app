/**
 * POST /api/consent
 * Records onboarding consent via the service-role client.
 *
 * Using the service-role client bypasses RLS, eliminating the session-expiry
 * race condition that occurs when doing client-side consent inserts during the
 * multi-step onboarding flow (the user's JWT may refresh between page load and
 * form submission, causing the RLS check to fail transiently).
 *
 * The user's identity is verified server-side from their cookie-based session
 * before the insert is made.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { recordConsentBatch } from '@/lib/consent'
import type { ConsentType } from '@/lib/consent'

export async function POST(request: NextRequest) {
  try {
    // Verify caller is authenticated using the server client (cookie-based session)
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      consent_types,
      capture_method,
      document_version,
      page_url,
    } = body as {
      consent_types: ConsentType[]
      capture_method?: string
      document_version?: string
      page_url?: string
    }

    if (!Array.isArray(consent_types) || consent_types.length === 0) {
      return NextResponse.json(
        { error: 'consent_types must be a non-empty array' },
        { status: 400 }
      )
    }

    // Use recordConsentBatch which uses the service-role client (bypasses RLS)
    const result = await recordConsentBatch(
      user.id,
      consent_types.map((consentType) => ({
        consentType,
        action: 'granted' as const,
      })),
      {
        capture_method: capture_method ?? 'onboarding_explicit',
        document_version: document_version ?? '2026-03-01',
        page_url: page_url ?? '/onboarding',
        user_agent: request.headers.get('user-agent') ?? undefined,
      }
    )

    if (!result.success) {
      console.error('[api/consent] recordConsentBatch failed:', result.error, {
        userId: user.id,
        consent_types,
      })
      return NextResponse.json(
        { error: result.error ?? 'Failed to record consent' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[api/consent] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
