/**
 * @module Analytics
 * @description Client-side analytics event tracking for Lumira.
 * Events are batched and sent to /api/analytics endpoint.
 * In v1, events are logged to console in development and
 * sent to the analytics API in production.
 */

type EventProperties = Record<string, string | number | boolean | null>

// Core event taxonomy from PRD Section 33
export type AnalyticsEvent =
  // Onboarding
  | 'onboarding_started' | 'onboarding_step_completed' | 'onboarding_completed'
  | 'onboarding_abandoned'
  // Auth
  | 'magic_link_sent' | 'magic_link_used' | 'session_created' | 'session_expired'
  // Check-in
  | 'checkin_started' | 'checkin_message_sent' | 'checkin_chip_selected'
  | 'checkin_completed' | 'checkin_abandoned'
  // Chat
  | 'chat_thread_created' | 'chat_message_sent' | 'chat_escalation_shown'
  | 'chat_emergency_overlay_shown' | 'chat_suggested_prompt_tapped'
  // Concern
  | 'concern_flow_started' | 'concern_question_answered' | 'concern_flow_completed'
  | 'concern_summary_viewed' | 'concern_escalation_shown'
  // Weekly Guide
  | 'weekly_guide_viewed' | 'weekly_guide_section_expanded'
  // Notifications
  | 'notification_bell_opened' | 'notification_tapped' | 'notification_dismissed'
  | 'notifications_marked_all_read'
  // Navigation
  | 'tab_switched' | 'page_viewed'
  // Profile
  | 'profile_viewed' | 'profile_updated' | 'avatar_selected'
  // Settings
  | 'settings_opened' | 'notification_preference_changed' | 'privacy_preference_changed'
  // Privacy
  | 'data_export_requested' | 'data_deletion_requested' | 'consent_granted' | 'consent_withdrawn'
  // Partner
  | 'partner_invite_sent' | 'partner_invite_accepted'
  // Engagement
  | 'app_opened' | 'app_backgrounded' | 'share_tapped'
  // Landing
  | 'landing_page_viewed' | 'landing_cta_tapped' | 'waitlist_submitted'

let sessionId: string | null = null
let identifiedProfileId: string | null = null

function getSessionId(): string {
  if (!sessionId) {
    sessionId = typeof crypto !== 'undefined'
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  }
  return sessionId
}

export function trackEvent(event: AnalyticsEvent, properties?: EventProperties): void {
  const payload = {
    event,
    properties: properties || {},
    profile_id: identifiedProfileId,
    session_id: getSessionId(),
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.pathname : '',
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[analytics]', event, properties || '')
    return
  }

  // Fire-and-forget in production
  try {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics', JSON.stringify(payload))
    } else if (typeof fetch !== 'undefined') {
      fetch('/api/analytics', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {}) // Silent failure
    }
  } catch {
    // Analytics should never break the app
  }
}

export function identifyUser(profileId: string): void {
  identifiedProfileId = profileId
  if (process.env.NODE_ENV === 'development') {
    console.log('[analytics] identify:', profileId)
  }
}
