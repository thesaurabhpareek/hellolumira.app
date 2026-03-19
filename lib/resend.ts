/**
 * @module Resend
 * @description Email sending via the Resend API. Provides a generic sendEmail()
 *   function and purpose-specific helpers for daily check-in reminders, pattern
 *   alerts, weekly guides, concern follow-ups, onboarding sequences, re-engagement,
 *   and partner invites. All emails include an unsubscribe footer and List-Unsubscribe
 *   headers for CAN-SPAM/GDPR compliance.
 * @version 1.0.0
 * @since March 2026
 */

import type { Profile, BabyProfile, PatternType } from '@/types/app'

/**
 * Escapes HTML special characters to prevent injection in email templates.
 * All dynamic user-provided strings must be passed through this before
 * interpolation into HTML.
 */
const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

/**
 * Profile with email attached. The `email` field lives in Supabase Auth
 * (not the profiles table), so callers must resolve it before passing
 * the profile to email helpers.
 */
export type ProfileWithEmail = Profile & { email: string }

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

/** Content structure for the weekly guide email. */
export type GuideContent = {
  title: string
  body: string
  tips: string[]
}

// ---------------------------------------------------------------------------
// Generic sender
// ---------------------------------------------------------------------------

/**
 * Sends a single email via Resend.
 *
 * Every email automatically includes an unsubscribe link in the headers
 * and the HTML body footer.
 *
 * This function **never throws**. On failure it returns
 * `{ success: false, error }` and logs the error.
 *
 * @param to       - Recipient email address.
 * @param subject  - Email subject line.
 * @param html     - HTML body content.
 * @param options  - Optional overrides (replyTo, unsubscribeUrl, tags).
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  options?: SendEmailOptions
): Promise<EmailResult> {
  try {
    const client = getClient()
    if (!client) {
      console.warn('[resend] Email not sent — Resend client unavailable:', { to, subject })
      return { success: false, error: 'Resend client is not available. Is the package installed and RESEND_API_KEY set?' }
    }

    const unsubscribeUrl = options?.unsubscribeUrl || `${APP_URL}/settings/notifications`

    // Append unsubscribe footer to HTML
    const htmlWithFooter = `${html}
      <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;text-align:center;">
        <p>You received this email because you use Lumira.</p>
        <p><a href="${unsubscribeUrl}" style="color:#6b7280;text-decoration:underline;">Unsubscribe or manage preferences</a></p>
      </div>`

    const { data, error } = await client.emails.send({
      from: FROM_ADDRESS,
      to: [to],
      subject,
      html: htmlWithFooter,
      replyTo: options?.replyTo,
      tags: options?.tags,
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    })

    if (error) {
      console.error('[resend] Send failed:', error.message, { to, subject })
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[resend] Unexpected error:', message, { to, subject })
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
// Email helpers
// ---------------------------------------------------------------------------

/**
 * Sends the daily check-in reminder email with a pre-filled link.
 *
 * @param profile     - The parent's profile.
 * @param baby        - The baby profile.
 * @param prefillUrl  - URL to the pre-filled check-in form.
 */
export async function sendDailyCheckinEmail(
  profile: ProfileWithEmail,
  baby: BabyProfile,
  prefillUrl: string
): Promise<EmailResult> {
  const name = escapeHtml(profile.first_name)
  const babyName = escapeHtml(babyDisplayName(baby))

  const html = `
    <h2>Good morning, ${name}!</h2>
    <p>Time for your daily check-in for ${babyName}. It only takes a minute.</p>
    <p style="margin:24px 0;">
      <a href="${prefillUrl}" style="background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
        Start Check-in
      </a>
    </p>
    <p style="color:#6b7280;font-size:14px;">Tracking daily patterns helps Lumira spot trends and give you better guidance.</p>
  `

  return sendEmail(profile.email, `Daily check-in for ${babyName}`, html, {
    tags: [{ name: 'category', value: 'daily_checkin' }],
  })
}

/**
 * Sends a pattern alert email when Lumira detects a notable trend.
 *
 * @param profile  - The parent's profile.
 * @param baby     - The baby profile.
 * @param pattern  - The type of pattern detected.
 */
export async function sendPatternAlertEmail(
  profile: ProfileWithEmail,
  baby: BabyProfile,
  pattern: PatternType
): Promise<EmailResult> {
  const name = escapeHtml(profile.first_name)
  const babyName = escapeHtml(babyDisplayName(baby))

  const html = `
    <h2>Hi ${name}, Lumira noticed something</h2>
    <p>We detected a <strong>${pattern.replace(/_/g, ' ')}</strong> pattern for ${babyName} based on your recent check-ins.</p>
    <p style="margin:24px 0;">
      <a href="${APP_URL}/dashboard" style="background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
        View Details
      </a>
    </p>
    <p style="color:#6b7280;font-size:14px;">Lumira tracks patterns so you can feel confident about what's normal.</p>
  `

  return sendEmail(profile.email, `Pattern detected for ${babyName}`, html, {
    tags: [{ name: 'category', value: 'pattern_alert' }],
  })
}

/**
 * Sends the weekly developmental guide email.
 *
 * @param profile       - The parent's profile.
 * @param baby          - The baby profile.
 * @param guideContent  - Structured guide content (title, body, tips).
 */
export async function sendWeeklyGuideEmail(
  profile: ProfileWithEmail,
  baby: BabyProfile,
  guideContent: GuideContent
): Promise<EmailResult> {
  const name = escapeHtml(profile.first_name)
  const babyName = escapeHtml(babyDisplayName(baby))

  const tipsHtml = guideContent.tips
    .map((tip) => `<li style="margin-bottom:8px;">${escapeHtml(tip)}</li>`)
    .join('')

  const html = `
    <h2>${escapeHtml(guideContent.title)}</h2>
    <p>Hi ${name}, here's this week's guide for ${babyName}.</p>
    <p>${escapeHtml(guideContent.body)}</p>
    ${tipsHtml ? `<h3>Tips for this week</h3><ul>${tipsHtml}</ul>` : ''}
    <p style="margin:24px 0;">
      <a href="${APP_URL}/dashboard" style="background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
        Open Lumira
      </a>
    </p>
  `

  return sendEmail(profile.email, guideContent.title, html, {
    tags: [{ name: 'category', value: 'weekly_guide' }],
  })
}

/**
 * Sends a follow-up email for a previously logged concern.
 *
 * @param profile  - The parent's profile.
 * @param baby     - The baby profile.
 * @param concern  - Description of the concern being followed up on.
 */
export async function sendConcernFollowupEmail(
  profile: ProfileWithEmail,
  baby: BabyProfile,
  concern: string
): Promise<EmailResult> {
  const name = escapeHtml(profile.first_name)
  const babyName = escapeHtml(babyDisplayName(baby))

  const html = `
    <h2>Following up, ${name}</h2>
    <p>A few days ago you mentioned a concern about ${babyName}: <em>"${escapeHtml(concern)}"</em></p>
    <p>How are things going? Tap below to give a quick update so Lumira can continue to help.</p>
    <p style="margin:24px 0;">
      <a href="${APP_URL}/dashboard" style="background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
        Update Lumira
      </a>
    </p>
  `

  return sendEmail(profile.email, `How is ${babyName} doing?`, html, {
    tags: [{ name: 'category', value: 'concern_followup' }],
  })
}

/**
 * Sends the Day 1 onboarding email welcoming the user.
 *
 * @param profile - The parent's profile.
 * @param baby    - The baby profile.
 */
export async function sendOnboardingDay1Email(
  profile: ProfileWithEmail,
  baby: BabyProfile
): Promise<EmailResult> {
  const name = escapeHtml(profile.first_name)
  const babyName = escapeHtml(babyDisplayName(baby))

  const html = `
    <h2>Welcome to Lumira, ${name}!</h2>
    <p>We're so glad you're here. Lumira is your calm, knowledgeable companion for ${babyName}'s journey.</p>
    <h3>Here's what to expect:</h3>
    <ul>
      <li><strong>Daily check-ins</strong> — a quick 60-second snapshot each morning</li>
      <li><strong>Pattern insights</strong> — we'll spot trends so you don't have to</li>
      <li><strong>Weekly guides</strong> — tailored to ${babyName}'s stage</li>
      <li><strong>Concern support</strong> — structured help when something feels off</li>
    </ul>
    <p style="margin:24px 0;">
      <a href="${APP_URL}/dashboard" style="background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
        Start Your First Check-in
      </a>
    </p>
    <p style="color:#6b7280;font-size:14px;">You've got this. And Lumira's got you.</p>
  `

  return sendEmail(profile.email, `Welcome to Lumira, ${name}!`, html, {
    tags: [{ name: 'category', value: 'onboarding_day1' }],
  })
}

/**
 * Sends the Day 3 onboarding email encouraging habit formation.
 *
 * @param profile - The parent's profile.
 * @param baby    - The baby profile.
 */
export async function sendOnboardingDay3Email(
  profile: ProfileWithEmail,
  baby: BabyProfile
): Promise<EmailResult> {
  const name = escapeHtml(profile.first_name)
  const babyName = escapeHtml(babyDisplayName(baby))

  const html = `
    <h2>You're building a great habit, ${name}</h2>
    <p>Three days in! Consistency is what makes Lumira powerful — the more check-ins you do, the better we can spot patterns for ${babyName}.</p>
    <h3>Did you know?</h3>
    <p>After just one week of check-ins, Lumira can start detecting sleep and feeding patterns. Keep going!</p>
    <p style="margin:24px 0;">
      <a href="${APP_URL}/dashboard" style="background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
        Today's Check-in
      </a>
    </p>
  `

  return sendEmail(profile.email, `Day 3 with Lumira — you're doing great!`, html, {
    tags: [{ name: 'category', value: 'onboarding_day3' }],
  })
}

/**
 * Sends a re-engagement email to a lapsed user.
 *
 * @param profile - The parent's profile.
 * @param baby    - The baby profile.
 */
export async function sendReengagementEmail(
  profile: ProfileWithEmail,
  baby: BabyProfile
): Promise<EmailResult> {
  const name = escapeHtml(profile.first_name)
  const babyName = escapeHtml(babyDisplayName(baby))

  const html = `
    <h2>We miss you, ${name}</h2>
    <p>It's been a little while since your last check-in for ${babyName}. No pressure — parenting is busy! But Lumira works best with regular updates.</p>
    <p>Even a quick 30-second check-in helps us keep track of how things are going.</p>
    <p style="margin:24px 0;">
      <a href="${APP_URL}/dashboard" style="background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
        Quick Check-in
      </a>
    </p>
    <p style="color:#6b7280;font-size:14px;">If you'd rather not receive these reminders, you can <a href="${APP_URL}/settings/notifications" style="color:#6b7280;">adjust your preferences</a>.</p>
  `

  return sendEmail(profile.email, `How are you and ${babyName}?`, html, {
    tags: [{ name: 'category', value: 'reengagement' }],
  })
}

/**
 * Sends a partner invite email with a unique token link.
 *
 * @param inviterName   - First name of the inviting parent.
 * @param inviteeEmail  - Email address of the partner being invited.
 * @param token         - Unique invite token for the partner link.
 * @param babyName      - Display name of the baby (or a default).
 */
export async function sendPartnerInviteEmail(
  inviterName: string,
  inviteeEmail: string,
  token: string,
  babyName: string
): Promise<EmailResult> {
  const inviteUrl = `${APP_URL}/invite/${encodeURIComponent(token)}`
  const displayName = escapeHtml(babyName || 'your little one')
  const safeInviterName = escapeHtml(inviterName)

  const html = `
    <h2>You've been invited to Lumira</h2>
    <p><strong>${safeInviterName}</strong> has invited you to join them on Lumira to help track and care for ${displayName} together.</p>
    <h3>What is Lumira?</h3>
    <p>Lumira is a calm, evidence-based companion that helps parents track daily patterns, spot trends, and feel confident about their baby's development.</p>
    <p style="margin:24px 0;">
      <a href="${inviteUrl}" style="background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
        Accept Invitation
      </a>
    </p>
    <p style="color:#6b7280;font-size:14px;">This invitation was sent by ${safeInviterName} via Lumira. If you weren't expecting this, you can safely ignore it.</p>
  `

  return sendEmail(inviteeEmail, `${inviterName} invited you to Lumira`, html, {
    tags: [{ name: 'category', value: 'partner_invite' }],
  })
}
