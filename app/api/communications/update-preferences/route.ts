/**
 * @module UpdateCommunicationPreferencesAPI
 * @description POST /api/communications/update-preferences — Updates email,
 *   SMS, and WhatsApp notification preferences. Detects boolean field changes
 *   to record consent grants/withdrawals and logs an audit event with the
 *   changed fields.
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { recordConsent } from '@/lib/consent'
import { logAudit } from '@/lib/audit'
import type { ConsentType as AppConsentType } from '@/lib/consent'

/** Boolean fields on communication_preferences that map to consent records. */
const CONSENT_FIELD_MAP: Record<string, AppConsentType> = {
  email_enabled: 'marketing_email',
  email_daily_checkin: 'marketing_email',
  email_pattern_alerts: 'marketing_email',
  email_weekly_guide: 'marketing_email',
  email_concern_followup: 'marketing_email',
  whatsapp_enabled: 'marketing_whatsapp',
  sms_enabled: 'marketing_sms',
}

const ALLOWED_FIELDS = [
  'email_enabled',
  'email_daily_checkin',
  'email_pattern_alerts',
  'email_weekly_guide',
  'email_concern_followup',
  'whatsapp_enabled',
  'sms_enabled',
  'checkin_hour',
  'timezone',
  'quiet_hours_start',
  'quiet_hours_end',
]

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401 })
    }

    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: true, message: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: true, message: 'Request body must be a JSON object' },
        { status: 400 }
      )
    }

    // Validate: only allow known fields and enforce types
    const BOOLEAN_FIELDS = ['email_enabled', 'email_daily_checkin', 'email_pattern_alerts', 'email_weekly_guide', 'email_concern_followup', 'whatsapp_enabled', 'sms_enabled']
    const NUMBER_FIELDS = ['checkin_hour', 'quiet_hours_start', 'quiet_hours_end']
    const STRING_FIELDS = ['timezone']

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }
    const changedBooleanFields: { field: string; value: boolean }[] = []

    for (const key of Object.keys(body)) {
      if (!ALLOWED_FIELDS.includes(key)) {
        return NextResponse.json(
          { error: true, message: `Unknown field: ${key}` },
          { status: 400 }
        )
      }
      // Type-check boolean fields
      if (BOOLEAN_FIELDS.includes(key) && typeof body[key] !== 'boolean') {
        return NextResponse.json(
          { error: true, message: `${key} must be a boolean` },
          { status: 400 }
        )
      }
      // Type-check and range-check number fields
      if (NUMBER_FIELDS.includes(key)) {
        if (typeof body[key] !== 'number' || !Number.isInteger(body[key])) {
          return NextResponse.json(
            { error: true, message: `${key} must be an integer` },
            { status: 400 }
          )
        }
        const num = body[key] as number
        if (key === 'checkin_hour' && (num < 0 || num > 23)) {
          return NextResponse.json(
            { error: true, message: 'checkin_hour must be between 0 and 23' },
            { status: 400 }
          )
        }
        if ((key === 'quiet_hours_start' || key === 'quiet_hours_end') && (num < 0 || num > 23)) {
          return NextResponse.json(
            { error: true, message: `${key} must be between 0 and 23` },
            { status: 400 }
          )
        }
      }
      // Type-check and sanitize string fields
      if (STRING_FIELDS.includes(key)) {
        if (typeof body[key] !== 'string') {
          return NextResponse.json(
            { error: true, message: `${key} must be a string` },
            { status: 400 }
          )
        }
        const strVal = (body[key] as string).trim().slice(0, 100)
        body[key] = strVal
      }
      updatePayload[key] = body[key]
    }

    if (Object.keys(updatePayload).length <= 1) {
      return NextResponse.json(
        { error: true, message: 'No valid fields provided.' },
        { status: 400 }
      )
    }

    // Fetch current preferences to detect changes - only boolean fields needed for comparison
    const { data: currentPrefs } = await supabase
      .from('communication_preferences')
      .select('email_enabled, email_daily_checkin, email_pattern_alerts, email_weekly_guide, email_concern_followup, whatsapp_enabled, sms_enabled')
      .eq('profile_id', user.id)
      .maybeSingle()

    // Detect boolean field changes for consent recording
    for (const key of Object.keys(body)) {
      if (key in CONSENT_FIELD_MAP && typeof body[key] === 'boolean') {
        const currentValue = currentPrefs ? (currentPrefs as Record<string, unknown>)[key] : undefined
        if (currentValue !== body[key]) {
          changedBooleanFields.push({ field: key, value: body[key] })
        }
      }
    }

    // Upsert communication preferences
    if (currentPrefs) {
      const { error } = await supabase
        .from('communication_preferences')
        .update(updatePayload)
        .eq('profile_id', user.id)

      if (error) {
        console.error('[comms/update-preferences] Failed to update:', error.message)
        return NextResponse.json(
          { error: true, message: 'Failed to update communication preferences.' },
          { status: 500 }
        )
      }
    } else {
      const { error } = await supabase
        .from('communication_preferences')
        .insert({ profile_id: user.id, ...updatePayload })

      if (error) {
        console.error('[comms/update-preferences] Failed to create:', error.message)
        return NextResponse.json(
          { error: true, message: 'Failed to create communication preferences.' },
          { status: 500 }
        )
      }
    }

    // Record consent for each changed boolean field in parallel (non-critical)
    try {
      const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        undefined
      const userAgent = request.headers.get('user-agent') || undefined

      const consentPromises: Promise<unknown>[] = changedBooleanFields
        .filter(({ field }) => CONSENT_FIELD_MAP[field])
        .map(({ field, value }) =>
          recordConsent(user.id, CONSENT_FIELD_MAP[field], value ? 'granted' : 'withdrawn', {
            capture_method: 'settings_toggle',
            ip_address: ip,
            user_agent: userAgent,
          })
        )

      // Include audit log in the same parallel batch
      consentPromises.push(
        logAudit(
          'comms_preference_updated',
          user.id,
          { changed_fields: changedBooleanFields.map((f) => f.field), body },
          request
        )
      )

      await Promise.all(consentPromises)
    } catch (auditErr) {
      console.error('[comms/update-preferences] Consent/audit error (non-fatal):', auditErr)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[comms/update-preferences] Error:', err)
    return NextResponse.json(
      { error: true, message: 'Something went wrong. Try again.' },
      { status: 500 }
    )
  }
}
