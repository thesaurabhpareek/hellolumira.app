/**
 * @module ConsentHistoryAPI
 * @description GET /api/privacy/consent-history — Returns the authenticated
 *   user's consent record history (last 100 entries, newest first) for
 *   GDPR/CCPA transparency compliance.
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401 })
    }

    const { data: records, error } = await supabase
      .from('consent_records')
      .select('id, profile_id, consent_type, action, capture_method, document_version, page_url, created_at')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('[consent-history] Failed to fetch consent records:', error.message)
      return NextResponse.json(
        { error: true, message: 'Failed to fetch consent history.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ records: records ?? [] })
  } catch (err) {
    console.error('[consent-history] Error:', err)
    return NextResponse.json(
      { error: true, message: 'Something went wrong. Try again.' },
      { status: 500 }
    )
  }
}
