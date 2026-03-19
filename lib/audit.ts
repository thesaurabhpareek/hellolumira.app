/**
 * @module Audit
 * @description Immutable audit logging for security-relevant and GDPR-relevant
 *   actions. Uses the service-role Supabase client to bypass RLS, ensuring
 *   system-level events can always be recorded. Never throws — failures are
 *   logged to console.error to avoid disrupting user-facing flows.
 * @version 1.0.0
 * @since March 2026
 */

import { createServiceClient } from '@/lib/supabase/server'
import { sha256 } from '@/lib/utils'

/**
 * Audit event types covering all security-relevant and GDPR-relevant actions.
 * These map directly to the `event_type` column in the `audit_log` table.
 */
export type AuditEventType =
  | 'account_created'
  | 'account_deleted'
  | 'profile_updated'
  | 'magic_link_sent'
  | 'magic_link_used'
  | 'session_created'
  | 'consent_granted'
  | 'consent_withdrawn'
  | 'data_export_requested'
  | 'data_deletion_requested'
  | 'data_deletion_completed'
  | 'comms_preference_updated'
  | 'unsubscribed_email'
  | 'unsubscribed_sms'
  | 'unsubscribed_whatsapp'
  | 'partner_invite_sent'
  | 'partner_invite_accepted'
  | 'escalation_triggered'
  | 'distressed_signal_detected'

/**
 * Writes an immutable audit log entry to the `audit_log` table.
 *
 * Uses the service-role Supabase client to bypass RLS, ensuring system-level
 * events (e.g. background jobs, webhooks) can always be recorded.
 *
 * This function **never throws**. On failure it logs to `console.error` and
 * returns silently so that audit logging never disrupts user-facing flows.
 *
 * @param eventType  - The type of auditable event (see {@link AuditEventType}).
 * @param profileId  - The profile UUID associated with the event, or `null` for anonymous/system events.
 * @param metadata   - Arbitrary JSON payload with event-specific details.
 * @param request    - Optional incoming `Request` object used to extract IP and User-Agent.
 */
export async function logAudit(
  eventType: AuditEventType,
  profileId: string | null,
  metadata: Record<string, unknown> = {},
  request?: Request
): Promise<void> {
  // Guard: eventType is required
  if (!eventType || typeof eventType !== 'string') {
    console.error('[audit] Missing or invalid eventType')
    return
  }

  // Validate event_type against allowed list
  const VALID_EVENT_TYPES: AuditEventType[] = [
    'account_created', 'account_deleted', 'profile_updated',
    'magic_link_sent', 'magic_link_used', 'session_created',
    'consent_granted', 'consent_withdrawn',
    'data_export_requested', 'data_deletion_requested', 'data_deletion_completed',
    'comms_preference_updated', 'unsubscribed_email', 'unsubscribed_sms', 'unsubscribed_whatsapp',
    'partner_invite_sent', 'partner_invite_accepted',
    'escalation_triggered', 'distressed_signal_detected',
  ]
  if (!VALID_EVENT_TYPES.includes(eventType)) {
    console.error('[audit] Invalid eventType:', eventType)
    return
  }

  // Guard: truncate very large metadata to prevent DB bloat
  let safeMetadata = metadata ?? {}
  try {
    const metadataStr = JSON.stringify(safeMetadata)
    if (metadataStr.length > 10000) {
      safeMetadata = { _truncated: true, _original_size: metadataStr.length }
    }
  } catch {
    safeMetadata = { _error: 'metadata not serializable' }
  }

  try {
    const supabase = await createServiceClient()

    // Extract and hash IP address — never store raw
    let ipHash: string | null = null
    let userAgent: string | null = null

    if (request) {
      const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        null

      if (ip) {
        ipHash = await sha256(ip)
      }

      userAgent = request.headers.get('user-agent') || null
    }

    const { error } = await supabase.from('audit_log').insert({
      event_type: eventType,
      profile_id: profileId,
      event_data: safeMetadata,
      ip_address_hash: ipHash,
      user_agent: userAgent,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error('[audit] Failed to write audit log:', error.message, {
        eventType,
        profileId,
      })
    }
  } catch (err) {
    console.error('[audit] Unexpected error in logAudit:', err, {
      eventType,
      profileId,
    })
  }
}
