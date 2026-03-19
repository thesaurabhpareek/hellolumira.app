/**
 * @module Resend
 * @description Email sending via the Resend API. All email helpers now use premium
 *   templates from `lib/email-templates.ts` which include full legal compliance
 *   (CAN-SPAM, GDPR, medical disclaimers), brand styling, and responsive design.
 * @version 2.0.0
 * @since March 2026
 */

import type { Profile, BabyProfile, PatternType } from '@/types/app'
import {
  welcomeDay1Email,
  onboardingDay3Email,
  dailyCheckinEmail,
  patternAlertEmail,
  weeklyGuideEmail,
  concernFollowupEmail,
  reengagementEmail,
  partnerInviteEmail,
  type GuideContent,
} from '@/lib/email-templates'

/**
 * Profile with email attached. The `email` field lives in Supabase Auth
 * (not the profiles table), so callers must resolve it before passing
 * the profile to email helpers.
 */
export type ProfileWithEmail = Profile & { email: string }

// Re-export GuideContent for backward compatibility
export type { GuideContent }

// ---------------------------------------------------------------------------
// Resend client initialisation
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ResendClient: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let resend: any = null

try {
  // Dynamic import so the build doesn't break if `resend` isn't installed yet
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('resend')
  ResendClient = mod.Resend
} catch {
  // resend package not installed — stubs will warn at runtime
}

function getClient() {
  if (resend) return resend
  if (!ResendClient) return null

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[resend] RESEND_API_KEY is not set — emails will not be sent')
    return null
  }

  resend = new ResendClient(apiKey)
  return resend
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FROM_ADDRESS = 'Lumira <hello@hellolumira.app>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://hellolumira.app'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Options for the generic sendEmail function. */
export type SendEmailOptions = {
  /** Reply-to address. */
  replyTo?: string
  /** Custom unsubscribe URL (defaults to the standard app unsubscribe page). */
  unsubscribeUrl?: string
  /** Additional email tags for analytics. */
  tags?: { name: string; value: string }[]
}

/** Result returned by all email-sending functions. */
export type EmailResult = {
  success: boolean
  messageId?: string
  error?: string
}

// ---------------------------------------------------------------------------
// Generic sender
// ---------------------------------------------------------------------------

/**
 * Sends a single email via Resend.
 *
 * When using premium templates (from email-templates.ts), the footer is already
 * included — pass `skipFooter: true` in options to avoid double-appending.
 *
 * This function **never throws**. On failure it returns
 * `{ success: false, error }` and logs the error.
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  options?: SendEmailOptions & { skipFooter?: boolean }
): Promise<EmailResult> {
  try {
    const client = getClient()
    if (!client) {
      console.warn('[resend] Email not sent — Resend client unavailable:', { subject })
      return { success: false, error: 'Resend client is not available. Is the package installed and RESEND_API_KEY set?' }
    }

    const unsubscribeUrl = options?.unsubscribeUrl || `${APP_URL}/settings/notifications`

    // Premium templates already include the full footer — don't double-append
    const finalHtml = options?.skipFooter
      ? html
      : `${html}
      <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;text-align:center;">
        <p>You received this email because you use Lumira.</p>
        <p><a href="${unsubscribeUrl}" style="color:#6b7280;text-decoration:underline;">Unsubscribe or manage preferences</a></p>
      </div>`

    const { data, error } = await client.emails.send({
      from: FROM_ADDRESS,
      to: [to],
      subject,
      html: finalHtml,
      replyTo: options?.replyTo,
      tags: options?.tags,
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    })

    if (error) {
      // P0 fix: never log recipient email (PII) in production
      console.error('[resend] Send failed:', error.message, { subject })
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    // P0 fix: never log recipient email (PII) in production
    console.error('[resend] Unexpected error:', message, { subject })
    return { success: false, error: message }
  }
}

// ---------------------------------------------------------------------------
// Helper: build display name for baby
// ---------------------------------------------------------------------------

function babyDisplayName(baby: BabyProfile): string {
  return baby.name || 'your little one'
}

// ---------------------------------------------------------------------------
// Email helpers — all now use premium templates with full legal compliance
// ---------------------------------------------------------------------------

/**
 * Sends the daily check-in reminder email.
 */
export async function sendDailyCheckinEmail(
  profile: ProfileWithEmail,
  baby: BabyProfile,
  prefillUrl: string
): Promise<EmailResult> {
  const template = dailyCheckinEmail(
    profile.first_name,
    babyDisplayName(baby),
    profile.email,
    prefillUrl
  )

  return sendEmail(profile.email, template.subject, template.html, {
    tags: [{ name: 'category', value: 'daily_checkin' }],
    skipFooter: true,
  })
}

/**
 * Sends a pattern alert email when Lumira detects a notable trend.
 */
export async function sendPatternAlertEmail(
  profile: ProfileWithEmail,
  baby: BabyProfile,
  pattern: PatternType
): Promise<EmailResult> {
  const template = patternAlertEmail(
    profile.first_name,
    babyDisplayName(baby),
    profile.email,
    pattern
  )

  return sendEmail(profile.email, template.subject, template.html, {
    tags: [{ name: 'category', value: 'pattern_alert' }],
    skipFooter: true,
  })
}

/**
 * Sends the weekly developmental guide email.
 */
export async function sendWeeklyGuideEmail(
  profile: ProfileWithEmail,
  baby: BabyProfile,
  guideContent: GuideContent
): Promise<EmailResult> {
  const template = weeklyGuideEmail(
    profile.first_name,
    babyDisplayName(baby),
    profile.email,
    guideContent
  )

  return sendEmail(profile.email, template.subject, template.html, {
    tags: [{ name: 'category', value: 'weekly_guide' }],
    skipFooter: true,
  })
}

/**
 * Sends a follow-up email for a previously logged concern.
 */
export async function sendConcernFollowupEmail(
  profile: ProfileWithEmail,
  baby: BabyProfile,
  concern: string
): Promise<EmailResult> {
  const template = concernFollowupEmail(
    profile.first_name,
    babyDisplayName(baby),
    profile.email,
    concern
  )

  return sendEmail(profile.email, template.subject, template.html, {
    tags: [{ name: 'category', value: 'concern_followup' }],
    skipFooter: true,
  })
}

/**
 * Sends the Day 1 onboarding email welcoming the user.
 */
export async function sendOnboardingDay1Email(
  profile: ProfileWithEmail,
  baby: BabyProfile
): Promise<EmailResult> {
  const template = welcomeDay1Email(
    profile.first_name,
    babyDisplayName(baby),
    profile.email
  )

  return sendEmail(profile.email, template.subject, template.html, {
    tags: [{ name: 'category', value: 'onboarding_day1' }],
    skipFooter: true,
  })
}

/**
 * Sends the Day 3 onboarding email encouraging habit formation.
 */
export async function sendOnboardingDay3Email(
  profile: ProfileWithEmail,
  baby: BabyProfile
): Promise<EmailResult> {
  const template = onboardingDay3Email(
    profile.first_name,
    babyDisplayName(baby),
    profile.email
  )

  return sendEmail(profile.email, template.subject, template.html, {
    tags: [{ name: 'category', value: 'onboarding_day3' }],
    skipFooter: true,
  })
}

/**
 * Sends a re-engagement email to a lapsed user.
 */
export async function sendReengagementEmail(
  profile: ProfileWithEmail,
  baby: BabyProfile
): Promise<EmailResult> {
  const template = reengagementEmail(
    profile.first_name,
    babyDisplayName(baby),
    profile.email
  )

  return sendEmail(profile.email, template.subject, template.html, {
    tags: [{ name: 'category', value: 'reengagement' }],
    skipFooter: true,
  })
}

/**
 * Sends a partner invite email with a unique token link.
 */
export async function sendPartnerInviteEmail(
  inviterName: string,
  inviteeEmail: string,
  token: string,
  babyName: string
): Promise<EmailResult> {
  const template = partnerInviteEmail(inviterName, inviteeEmail, token, babyName)

  return sendEmail(inviteeEmail, template.subject, template.html, {
    tags: [{ name: 'category', value: 'partner_invite' }],
    skipFooter: true,
  })
}
