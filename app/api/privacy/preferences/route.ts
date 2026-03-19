/**
 * @module PrivacyPreferencesAPI
 * @description PUT /api/privacy/preferences — Updates privacy preferences
 *   (analytics, AI processing, data retention). Records consent changes in
 *   the immutable consent_records table and logs audit events for compliance.
 * @version 1.0.0
 * @since March 2026
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { recordConsent } from '@/lib/consent'
import { logAudit } from '@/lib/audit'
import type { ConsentType as AppConsentType } from '@/lib/consent'

interface PreferencesBody {
  analytics_enabled?: boolean
  product_improvement_enabled?: boolean
  data_retention_months?: 12 | 24 | 36
  ai_processing_enabled?: boolean
}

const VALID_RETENTION_MONTHS = [12, 24, 36]

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401 })
    }

    let body: PreferencesBody
    try {
      body = (await request.json()) as PreferencesBody
    } catch {
      return NextResponse.json(
        { error: true, message: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    // Validate inputs
    if (
      body.data_retention_months !== undefined &&
      !VALID_RETENTION_MONTHS.includes(body.data_retention_months)
    ) {
      return NextResponse.json(
        { error: true, message: 'data_retention_months must be 12, 24, or 36.' },
        { status: 400 }
      )
    }

    if (
      body.analytics_enabled !== undefined &&
      typeof body.analytics_enabled !== 'boolean'
    ) {
      return NextResponse.json(
        { error: true, message: 'analytics_enabled must be a boolean.' },
        { status: 400 }
      )
    }

    if (
      body.ai_processing_enabled !== undefined &&
      typeof body.ai_processing_enabled !== 'boolean'
    ) {
      return NextResponse.json(
        { error: true, message: 'ai_processing_enabled must be a boolean.' },
        { status: 400 }
      )
    }

    if (
      body.product_improvement_enabled !== undefined &&
      typeof body.product_improvement_enabled !== 'boolean'
    ) {
      return NextResponse.json(
        { error: true, message: 'product_improvement_enabled must be a boolean.' },
        { status: 400 }
      )
    }

    // Fetch current preferences with specific columns
    const { data: currentPrefs } = await supabase
      .from('privacy_preferences')
      .select('id, profile_id, analytics_enabled, ai_processing_enabled, data_retention_months')
      .eq('profile_id', user.id)
      .single()

    // Build update payload
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (body.analytics_enabled !== undefined) {
      updatePayload.analytics_enabled = body.analytics_enabled
    }
    if (body.ai_processing_enabled !== undefined) {
      updatePayload.ai_processing_enabled = body.ai_processing_enabled
    }
    if (body.data_retention_months !== undefined) {
      updatePayload.data_retention_months = body.data_retention_months
    }

    // Upsert preferences
    let preferences
    if (currentPrefs) {
      const { data, error } = await supabase
        .from('privacy_preferences')
        .update(updatePayload)
        .eq('profile_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('[privacy/preferences] Failed to update preferences:', error.message)
        return NextResponse.json(
          { error: true, message: 'Failed to update preferences.' },
          { status: 500 }
        )
      }
      preferences = data
    } else {
      const { data, error } = await supabase
        .from('privacy_preferences')
        .insert({ profile_id: user.id, ...updatePayload })
        .select()
        .single()

      if (error) {
        console.error('[privacy/preferences] Failed to create preferences:', error.message)
        return NextResponse.json(
          { error: true, message: 'Failed to create preferences.' },
          { status: 500 }
        )
      }
      preferences = data
    }

    // Extract request context for consent recording
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      undefined
    const userAgent = request.headers.get('user-agent') || undefined

    const consentOptions = {
      capture_method: 'settings_toggle',
      ip_address: ip,
      user_agent: userAgent,
    }

    // Record consent changes and audit events in parallel (non-critical — never crash parent request)
    try {
      const consentPromises: Promise<unknown>[] = []

      if (
        body.ai_processing_enabled !== undefined &&
        currentPrefs?.ai_processing_enabled !== body.ai_processing_enabled
      ) {
        const action = body.ai_processing_enabled ? 'granted' : 'withdrawn'
        consentPromises.push(
          recordConsent(user.id, 'data_processing' as AppConsentType, action, consentOptions),
          logAudit(
            body.ai_processing_enabled ? 'consent_granted' : 'consent_withdrawn',
            user.id,
            { consent_type: 'data_processing', action },
            request
          )
        )
      }

      if (
        body.analytics_enabled !== undefined &&
        currentPrefs?.analytics_enabled !== body.analytics_enabled
      ) {
        const action = body.analytics_enabled ? 'granted' : 'withdrawn'
        consentPromises.push(
          recordConsent(user.id, 'analytics_cookies' as AppConsentType, action, consentOptions),
          logAudit(
            body.analytics_enabled ? 'consent_granted' : 'consent_withdrawn',
            user.id,
            { consent_type: 'analytics', action },
            request
          )
        )
      }

      if (consentPromises.length > 0) {
        await Promise.all(consentPromises)
      }
    } catch (auditErr) {
      console.error('[privacy/preferences] Consent/audit error (non-fatal):', auditErr)
    }

    return NextResponse.json({ success: true, preferences })
  } catch (err) {
    console.error('[privacy/preferences] Error:', err)
    return NextResponse.json(
      { error: true, message: 'Something went wrong. Try again.' },
      { status: 500 }
    )
  }
}
