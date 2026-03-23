/**
 * @module EmailTemplates
 * @description Production-ready email templates for the Lumira lifecycle email system.
 *   All templates use inline CSS for email-client compatibility, include full legal
 *   compliance footers (CAN-SPAM, GDPR, medical disclaimers), and follow the Lumira
 *   brand guidelines (Sage 500 primary, Terra 400 accent, Sand 0 background).
 *
 *   Templates exported:
 *   - emailWrapper()          — wraps any content in the standard Lumira chrome
 *   - welcomeDay1Email()      — Day 1 onboarding welcome
 *   - onboardingDay3Email()   — Day 3 habit formation nudge
 *   - dailyCheckinEmail()     — Daily morning check-in reminder
 *   - patternAlertEmail()     — Pattern/trend detection notification
 *   - weeklyGuideEmail()      — Weekly developmental milestone guide
 *   - concernFollowupEmail()  — Follow-up on a previously logged concern
 *   - reengagementEmail()     — Lapsed user win-back (7+ days inactive)
 *   - partnerInviteEmail()    — Co-parent invitation
 *
 * @version 2.0.0
 * @since March 2026
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { getEmailTimeWord } from './greeting'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://hellolumira.app'

/** Brand colors */
const COLORS = {
  sage500: '#3D8178',
  sage600: '#357069',
  terra400: '#C4844E',
  terra100: '#F5E6D8',
  sand0: '#FAFAF8',
  sand100: '#F5F3EF',
  slate: '#2D3748',
  muted: '#6B7280',
  mutedLight: '#9CA3AF',
  border: '#E8E5E0',
  white: '#FFFFFF',
} as const

/** Standard footer links */
const LINKS = {
  website: 'https://hellolumira.app',
  terms: 'https://hellolumira.app/legal/terms',
  privacy: 'https://hellolumira.app/legal/privacy',
  unsubscribe: 'https://hellolumira.app/settings/notifications',
  checkin: `${APP_URL}/checkin`,
  home: `${APP_URL}/home`,
  concern: `${APP_URL}/concern`,
  settings: `${APP_URL}/settings`,
} as const

/** Medical disclaimer text — required wherever AI-driven guidance is mentioned. */
const MEDICAL_DISCLAIMER =
  'Lumira provides informational support only and is not a substitute for professional medical advice. Always consult your pediatrician or healthcare provider with medical concerns.'

// ---------------------------------------------------------------------------
// Subject line collections (2-3 options each, best option first)
// ---------------------------------------------------------------------------

export const SUBJECT_LINES = {
  welcomeDay1: [
    'Welcome to Lumira, {{firstName}} \u{1F331}',
    'You just made parenting a little easier \u{2728}',
    'Hi {{firstName}} \u{1F44B} \u2014 your parenting companion is ready',
  ],
  onboardingDay3: [
    'Three days in \u2014 you\u2019re building something great \u{1F4AA}',
    'Day 3: Here\u2019s what happens next with Lumira',
    '{{firstName}}, your first insights are almost ready',
  ],
  dailyCheckin: [
    'Good {{timeOfDay}}, {{firstName}} \u{1F319} How did last night go?',
    '\u2615 60 seconds for today\u2019s check-in, {{firstName}}',
    'Quick check-in for {{babyName}} \u2014 takes under a minute',
  ],
  patternAlert: [
    'Lumira spotted a pattern for {{babyName}} \u{1F50D}',
    'New insight: {{patternLabel}} trend detected',
    '{{firstName}}, we noticed something about {{babyName}}',
  ],
  weeklyGuide: [
    '{{guideTitle}}',
    'This week\u2019s guide for {{babyName}} is here \u{1F4D6}',
    '{{firstName}}, here\u2019s what to expect this week',
  ],
  concernFollowup: [
    'How is {{babyName}} doing? \u{1F49A}',
    'Checking in on your concern about {{babyName}}',
    '{{firstName}}, a quick follow-up from Lumira',
  ],
  reengagement: [
    'We\u2019ve missed you, {{firstName}} \u{1F49B}',
    'A lot can change in a week \u2014 let\u2019s catch up',
    '{{babyName}} is growing fast \u2014 let Lumira help you keep track',
  ],
  partnerInvite: [
    '{{inviterName}} invited you to Lumira \u{1F91D}',
    'Join {{inviterName}} on Lumira \u2014 parenting, together',
    'You\u2019ve been invited to care for {{babyName}} on Lumira',
  ],
} as const

// ---------------------------------------------------------------------------
// Returned type for all template functions
// ---------------------------------------------------------------------------

export type EmailTemplate = {
  subject: string
  preheader: string
  html: string
}

// ---------------------------------------------------------------------------
// Utility: escape HTML
// ---------------------------------------------------------------------------

const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

// ---------------------------------------------------------------------------
// CTA button builder
// ---------------------------------------------------------------------------

function ctaButton(label: string, href: string): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:32px auto;">
      <tr>
        <td align="center" style="border-radius:14px;background:${COLORS.sage500};">
          <a href="${href}" target="_blank"
             style="background:${COLORS.sage500};color:${COLORS.white};font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;font-size:16px;font-weight:600;line-height:1.2;text-decoration:none;display:inline-block;padding:16px 32px;border-radius:14px;min-height:48px;box-sizing:border-box;">
            ${label}
          </a>
        </td>
      </tr>
    </table>`
}

// ---------------------------------------------------------------------------
// Secondary tip / muted text block
// ---------------------------------------------------------------------------

function mutedText(text: string): string {
  return `<p style="color:${COLORS.muted};font-size:14px;line-height:1.6;margin:16px 0 0 0;">${text}</p>`
}

function medicalDisclaimer(): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:24px 0 0 0;">
      <tr>
        <td style="padding:12px 16px;background:${COLORS.sand100};border-radius:8px;border-left:3px solid ${COLORS.terra400};">
          <p style="color:${COLORS.muted};font-size:12px;line-height:1.5;margin:0;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;">
            \u26A0\uFE0F ${MEDICAL_DISCLAIMER}
          </p>
        </td>
      </tr>
    </table>`
}

// ---------------------------------------------------------------------------
// Email wrapper — standard header + footer
// ---------------------------------------------------------------------------

/**
 * Wraps email body content in the standard Lumira email chrome: header with
 * logo, content area, and a fully compliant footer with legal links.
 *
 * @param content   - Inner HTML body content (already escaped where needed).
 * @param preheader - Preview text shown in inbox (40-90 chars).
 * @param recipientEmail - The recipient's email address for the footer disclosure.
 */
export function emailWrapper(
  content: string,
  preheader: string,
  recipientEmail: string = '{{email}}'
): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>Lumira</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
    table,td{mso-table-lspace:0;mso-table-rspace:0}
    img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none}
    body{margin:0;padding:0;width:100%!important;height:100%!important}
    a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important}
    @media only screen and (max-width:600px){
      .email-container{width:100%!important;max-width:100%!important}
      .fluid{max-width:100%!important;height:auto!important}
      .stack-column{display:block!important;width:100%!important}
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.sand0};font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;color:${COLORS.slate};">

  <!-- Preheader (hidden preview text) -->
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
    ${preheader}${'&zwnj;&nbsp;'.repeat(20)}
  </div>

  <!-- Email wrapper table -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${COLORS.sand0};">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <!-- Container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-container" style="max-width:600px;width:100%;margin:0 auto;">

          <!-- Logo Header -->
          <tr>
            <td style="padding:32px 0 24px 0;text-align:center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td align="center" style="padding-bottom:8px;">
                    <p style="margin:0;font-size:12px;color:${COLORS.terra400};line-height:1;mso-line-height-rule:exactly;">&#9679;</p>
                    <p style="margin:4px 0 0 0;font-size:28px;font-weight:700;color:#1A1A2E;letter-spacing:-0.7px;font-family:Helvetica,Arial,sans-serif;mso-line-height-rule:exactly;line-height:1.2;">
                      Lumira
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body card -->
          <tr>
            <td style="background:${COLORS.white};border-radius:16px;padding:44px 40px;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
              ${content}
            </td>
          </tr>

          <!-- Tagline -->
          <tr>
            <td style="padding:24px 20px 8px 20px;text-align:center;">
              <p style="margin:0;font-size:15px;font-weight:500;color:${COLORS.sage500};font-style:italic;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;">
                You&rsquo;ve got this. And Lumira&rsquo;s got you. \u{1F331}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 20px 16px 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="border-top:1px solid ${COLORS.border};padding-top:20px;">

                    <!-- Brand -->
                    <p style="margin:0 0 8px 0;font-size:14px;font-weight:600;color:${COLORS.sage500};text-align:center;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;">
                      Lumira &mdash; Your parenting companion
                    </p>

                    <!-- Legal links -->
                    <p style="margin:0 0 12px 0;font-size:12px;color:${COLORS.mutedLight};text-align:center;line-height:1.8;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;">
                      <a href="${LINKS.website}" style="color:${COLORS.mutedLight};text-decoration:underline;">Website</a>
                      &nbsp;&middot;&nbsp;
                      <a href="${LINKS.terms}" style="color:${COLORS.mutedLight};text-decoration:underline;">Terms &amp; Conditions</a>
                      &nbsp;&middot;&nbsp;
                      <a href="${LINKS.privacy}" style="color:${COLORS.mutedLight};text-decoration:underline;">Privacy Policy</a>
                      &nbsp;&middot;&nbsp;
                      <a href="${LINKS.unsubscribe}" style="color:${COLORS.mutedLight};text-decoration:underline;">Unsubscribe</a>
                    </p>

                    <!-- Medical disclaimer -->
                    <p style="margin:0 0 12px 0;font-size:11px;color:#B0B0AC;text-align:center;line-height:1.5;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;">
                      Lumira provides informational support only and is not a substitute for professional medical advice.
                    </p>

                    <!-- Sent-to disclosure -->
                    <!-- NOTE: The Supabase auth magic link email template also needs this updated
                         in the Supabase dashboard > Authentication > Email Templates > Magic Link -->
                    <p style="margin:0 0 8px 0;font-size:11px;color:#B0B0AC;text-align:center;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;">
                      This email was sent to ${recipientEmail}. Received this by mistake? Simply ignore it &mdash; your account is safe.
                    </p>

                    <!-- Copyright -->
                    <p style="margin:0;font-size:11px;color:#B0B0AC;text-align:center;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;">
                      &copy; 2026 Lumira Inc. All rights reserved.
                    </p>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- /Container -->

      </td>
    </tr>
  </table>
  <!-- /Email wrapper -->

</body>
</html>`
}

// ---------------------------------------------------------------------------
// 1. Welcome / Day 1 Onboarding
// ---------------------------------------------------------------------------

export function welcomeDay1Email(
  firstName: string,
  babyName: string,
  email: string
): EmailTemplate {
  const safeName = escapeHtml(firstName)
  const safeBaby = escapeHtml(babyName || 'your little one')
  const preheader = `Your calm parenting companion is ready for you`

  const subject = SUBJECT_LINES.welcomeDay1[0].replace('{{firstName}}', firstName)

  const content = `
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:${COLORS.slate};font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;line-height:1.3;">
      Welcome to Lumira, ${safeName}!
    </h1>

    <p style="margin:0 0 20px 0;font-size:16px;line-height:1.6;color:${COLORS.slate};">
      We&rsquo;re so glad you&rsquo;re here. Lumira is your calm, knowledgeable companion for
      ${safeBaby}&rsquo;s journey &mdash; and yours.
    </p>

    <p style="margin:0 0 12px 0;font-size:15px;font-weight:600;color:${COLORS.slate};">
      Here&rsquo;s what you can expect:
    </p>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 8px 0;">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${COLORS.border};">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="width:36px;vertical-align:top;font-size:20px;padding-right:12px;">\u2600\uFE0F</td>
              <td style="font-size:15px;line-height:1.5;color:${COLORS.slate};">
                <strong>Daily check-ins</strong> &mdash; a quick 60-second snapshot each morning
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${COLORS.border};">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="width:36px;vertical-align:top;font-size:20px;padding-right:12px;">\u{1F50D}</td>
              <td style="font-size:15px;line-height:1.5;color:${COLORS.slate};">
                <strong>Pattern insights</strong> &mdash; we&rsquo;ll spot trends so you don&rsquo;t have to
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${COLORS.border};">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="width:36px;vertical-align:top;font-size:20px;padding-right:12px;">\u{1F4D6}</td>
              <td style="font-size:15px;line-height:1.5;color:${COLORS.slate};">
                <strong>Weekly guides</strong> &mdash; tailored to ${safeBaby}&rsquo;s developmental stage
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="width:36px;vertical-align:top;font-size:20px;padding-right:12px;">\u{1F49A}</td>
              <td style="font-size:15px;line-height:1.5;color:${COLORS.slate};">
                <strong>Concern support</strong> &mdash; structured guidance when something feels off
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${ctaButton('Start Your First Check-in', LINKS.checkin)}

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:8px 0 0 0;">
      <tr>
        <td style="padding:16px;background:${COLORS.sand100};border-radius:12px;text-align:center;">
          <p style="margin:0;font-size:15px;color:${COLORS.sage500};font-weight:500;font-style:italic;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;">
            You&rsquo;ve got this. And Lumira&rsquo;s got you. \u{1F331}
          </p>
        </td>
      </tr>
    </table>

    ${medicalDisclaimer()}
  `

  return {
    subject,
    preheader,
    html: emailWrapper(content, preheader, email),
  }
}

// ---------------------------------------------------------------------------
// 2. Day 3 Onboarding
// ---------------------------------------------------------------------------

export function onboardingDay3Email(
  firstName: string,
  babyName: string,
  email: string,
  checkinCount: number = 2
): EmailTemplate {
  const safeName = escapeHtml(firstName)
  const safeBaby = escapeHtml(babyName || 'your little one')
  const preheader = `Your first pattern insights are almost ready`

  const subject = SUBJECT_LINES.onboardingDay3[0]

  const content = `
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:${COLORS.slate};font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;line-height:1.3;">
      You&rsquo;re building something great, ${safeName}
    </h1>

    <p style="margin:0 0 20px 0;font-size:16px;line-height:1.6;color:${COLORS.slate};">
      Three days in! You&rsquo;ve already logged <strong>${checkinCount} check-in${checkinCount !== 1 ? 's' : ''}</strong> for ${safeBaby}.
      Consistency is what makes Lumira truly helpful &mdash; the more you share, the better we can support you.
    </p>

    <!-- Progress visual -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 24px 0;">
      <tr>
        <td style="padding:20px;background:${COLORS.sand100};border-radius:12px;">
          <p style="margin:0 0 8px 0;font-size:13px;font-weight:600;color:${COLORS.muted};text-transform:uppercase;letter-spacing:0.5px;">
            Your progress
          </p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="background:${COLORS.border};border-radius:6px;height:8px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="43%" style="min-width:43%;">
                  <tr>
                    <td style="background:${COLORS.sage500};border-radius:6px;height:8px;">&nbsp;</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <p style="margin:8px 0 0 0;font-size:13px;color:${COLORS.muted};">
            3 of 7 days &mdash; first pattern insights unlock after 7 days of check-ins
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px 0;font-size:15px;font-weight:600;color:${COLORS.slate};">
      \u{1F4A1} Did you know?
    </p>
    <p style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:${COLORS.slate};">
      After just one week of check-ins, Lumira can start detecting sleep, feeding, and mood patterns
      for ${safeBaby}. These insights help you feel more confident about what&rsquo;s normal &mdash; and
      what might need attention.
    </p>

    ${ctaButton('Log Today\u2019s Check-in', LINKS.checkin)}

    ${mutedText('Each check-in takes less than 60 seconds. Even on the busiest days, that\u2019s doable.')}

    ${medicalDisclaimer()}
  `

  return {
    subject,
    preheader,
    html: emailWrapper(content, preheader, email),
  }
}

// ---------------------------------------------------------------------------
// 3. Daily Check-in Reminder
// ---------------------------------------------------------------------------

export function dailyCheckinEmail(
  firstName: string,
  babyName: string,
  email: string,
  prefillUrl?: string,
  /** UTC send hour (0–23). Used to pick a contextual greeting. Defaults to 8 (morning). */
  sendHour: number = 8
): EmailTemplate {
  const safeName = escapeHtml(firstName)
  const safeBaby = escapeHtml(babyName || 'your little one')
  const preheader = `60 seconds to log ${safeBaby}\u2019s day \u2014 you\u2019ve got this`

  const timeOfDay = getEmailTimeWord(sendHour)
  const subject = SUBJECT_LINES.dailyCheckin[0]
    .replace('{{firstName}}', firstName)
    .replace('{{timeOfDay}}', timeOfDay)

  const checkinUrl = prefillUrl || LINKS.checkin

  // Greeting emoji — vary by time of day
  const greetingEmoji = timeOfDay === 'morning' ? '\u{1F31E}' : timeOfDay === 'afternoon' ? '\u2600\uFE0F' : '\u{1F319}'

  const content = `
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:${COLORS.slate};font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;line-height:1.3;">
      Good ${timeOfDay}, ${safeName} ${greetingEmoji}
    </h1>

    <p style="margin:0 0 20px 0;font-size:16px;line-height:1.6;color:${COLORS.slate};">
      Time for your daily check-in for ${safeBaby}. It takes less than a minute and helps
      Lumira track patterns that matter.
    </p>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 8px 0;">
      <tr>
        <td style="padding:16px 20px;background:${COLORS.sand100};border-radius:12px;">
          <p style="margin:0;font-size:14px;color:${COLORS.slate};line-height:1.6;">
            \u{1F4CB} <strong>Today&rsquo;s check-in covers:</strong> Sleep quality, night wakings, feeding, mood, and anything on your mind.
          </p>
        </td>
      </tr>
    </table>

    ${ctaButton('Start Check-in', checkinUrl)}

    ${mutedText('Tracking daily patterns helps Lumira spot trends early and give you more relevant guidance. Every check-in counts.')}

    ${medicalDisclaimer()}
  `

  return {
    subject,
    preheader,
    html: emailWrapper(content, preheader, email),
  }
}

// ---------------------------------------------------------------------------
// 4. Pattern Alert
// ---------------------------------------------------------------------------

export function patternAlertEmail(
  firstName: string,
  babyName: string,
  email: string,
  patternType: string,
  patternSummary?: string
): EmailTemplate {
  const safeName = escapeHtml(firstName)
  const safeBaby = escapeHtml(babyName || 'your little one')
  const patternLabel = patternType.replace(/_/g, ' ')
  const safePatternLabel = escapeHtml(patternLabel)
  const preheader = `A ${safePatternLabel} pattern was detected for ${safeBaby}`

  const subject = SUBJECT_LINES.patternAlert[0]
    .replace('{{babyName}}', babyName || 'your little one')

  const content = `
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:${COLORS.slate};font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;line-height:1.3;">
      Lumira noticed something, ${safeName}
    </h1>

    <p style="margin:0 0 20px 0;font-size:16px;line-height:1.6;color:${COLORS.slate};">
      Based on your recent check-ins, we&rsquo;ve detected a
      <strong style="color:${COLORS.sage500};">${safePatternLabel}</strong>
      pattern for ${safeBaby}.
    </p>

    <!-- Pattern highlight card -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 24px 0;">
      <tr>
        <td style="padding:20px;background:${COLORS.sand100};border-radius:12px;border-left:4px solid ${COLORS.sage500};">
          <p style="margin:0 0 4px 0;font-size:13px;font-weight:600;color:${COLORS.muted};text-transform:uppercase;letter-spacing:0.5px;">
            Pattern Detected
          </p>
          <p style="margin:0;font-size:18px;font-weight:600;color:${COLORS.sage500};">
            ${safePatternLabel.charAt(0).toUpperCase() + safePatternLabel.slice(1)} trend
          </p>
          ${patternSummary ? `<p style="margin:8px 0 0 0;font-size:14px;line-height:1.5;color:${COLORS.slate};">${escapeHtml(patternSummary)}</p>` : ''}
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px 0;font-size:15px;line-height:1.6;color:${COLORS.slate};">
      Open Lumira to see the full details and what this might mean for ${safeBaby}.
    </p>

    ${ctaButton('View Pattern Details', LINKS.home)}

    ${mutedText('Patterns are based on the data you\u2019ve logged and are meant to help you notice trends over time. They are not diagnostic.')}

    ${medicalDisclaimer()}
  `

  return {
    subject,
    preheader,
    html: emailWrapper(content, preheader, email),
  }
}

// ---------------------------------------------------------------------------
// 5. Weekly Guide
// ---------------------------------------------------------------------------

export type GuideContent = {
  title: string
  body: string
  tips: string[]
}

export function weeklyGuideEmail(
  firstName: string,
  babyName: string,
  email: string,
  guide: GuideContent,
  ageDisplay?: string
): EmailTemplate {
  const safeName = escapeHtml(firstName)
  const safeBaby = escapeHtml(babyName || 'your little one')
  const preheader = `This week\u2019s developmental guide for ${safeBaby}`

  const subject = SUBJECT_LINES.weeklyGuide[0].replace('{{guideTitle}}', guide.title)

  const tipsHtml = guide.tips.length
    ? `
      <p style="margin:24px 0 12px 0;font-size:15px;font-weight:600;color:${COLORS.slate};">
        \u{1F4A1} Tips for this week:
      </p>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 8px 0;">
        ${guide.tips
          .map(
            (tip, i) => `
        <tr>
          <td style="padding:10px 0;${i < guide.tips.length - 1 ? `border-bottom:1px solid ${COLORS.border};` : ''}">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="width:28px;vertical-align:top;font-size:14px;font-weight:600;color:${COLORS.sage500};">${i + 1}.</td>
                <td style="font-size:15px;line-height:1.5;color:${COLORS.slate};">${escapeHtml(tip)}</td>
              </tr>
            </table>
          </td>
        </tr>`
          )
          .join('')}
      </table>`
    : ''

  const content = `
    <h1 style="margin:0 0 4px 0;font-size:24px;font-weight:700;color:${COLORS.slate};font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;line-height:1.3;">
      ${escapeHtml(guide.title)}
    </h1>

    ${ageDisplay ? `<p style="margin:0 0 20px 0;font-size:13px;font-weight:600;color:${COLORS.sage500};text-transform:uppercase;letter-spacing:0.5px;">${safeBaby} &middot; ${escapeHtml(ageDisplay)}</p>` : ''}

    <p style="margin:0 0 8px 0;font-size:16px;line-height:1.6;color:${COLORS.slate};">
      Hi ${safeName}, here&rsquo;s this week&rsquo;s guide for ${safeBaby}.
    </p>

    <p style="margin:0 0 20px 0;font-size:15px;line-height:1.7;color:${COLORS.slate};">
      ${escapeHtml(guide.body)}
    </p>

    ${tipsHtml}

    ${ctaButton('Read Full Guide in Lumira', LINKS.home)}

    ${mutedText('Weekly guides are personalized based on ' + safeBaby + '\u2019s age and your check-in data. They are general guidance, not medical advice.')}

    ${medicalDisclaimer()}
  `

  return {
    subject,
    preheader,
    html: emailWrapper(content, preheader, email),
  }
}

// ---------------------------------------------------------------------------
// 6. Concern Follow-up
// ---------------------------------------------------------------------------

export function concernFollowupEmail(
  firstName: string,
  babyName: string,
  email: string,
  concern: string,
  daysSinceConcern: number = 3
): EmailTemplate {
  const safeName = escapeHtml(firstName)
  const safeBaby = escapeHtml(babyName || 'your little one')
  const safeConcern = escapeHtml(concern)
  const preheader = `Following up on your concern about ${safeBaby}`

  const subject = SUBJECT_LINES.concernFollowup[0]
    .replace('{{babyName}}', babyName || 'your little one')

  const timeLabel = daysSinceConcern === 1 ? 'yesterday' : `${daysSinceConcern} days ago`

  const content = `
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:${COLORS.slate};font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;line-height:1.3;">
      Following up, ${safeName}
    </h1>

    <p style="margin:0 0 20px 0;font-size:16px;line-height:1.6;color:${COLORS.slate};">
      ${timeLabel.charAt(0).toUpperCase() + timeLabel.slice(1)}, you logged a concern about ${safeBaby}:
    </p>

    <!-- Concern quote card -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 24px 0;">
      <tr>
        <td style="padding:16px 20px;background:${COLORS.terra100};border-radius:12px;border-left:4px solid ${COLORS.terra400};">
          <p style="margin:0;font-size:15px;line-height:1.5;color:${COLORS.slate};font-style:italic;">
            &ldquo;${safeConcern}&rdquo;
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 20px 0;font-size:16px;line-height:1.6;color:${COLORS.slate};">
      How are things going? A quick update helps Lumira continue to support you with relevant guidance.
    </p>

    ${ctaButton('Give a Quick Update', LINKS.concern)}

    ${mutedText('If this concern has resolved, great! You can dismiss it in the app. If things have gotten worse, please reach out to your pediatrician.')}

    ${medicalDisclaimer()}
  `

  return {
    subject,
    preheader,
    html: emailWrapper(content, preheader, email),
  }
}

// ---------------------------------------------------------------------------
// 7. Re-engagement (7+ days inactive)
// ---------------------------------------------------------------------------

export function reengagementEmail(
  firstName: string,
  babyName: string,
  email: string,
  daysSinceLastCheckin: number = 7
): EmailTemplate {
  const safeName = escapeHtml(firstName)
  const safeBaby = escapeHtml(babyName || 'your little one')
  const preheader = `A quick check-in keeps ${safeBaby}\u2019s insights fresh`

  const subject = SUBJECT_LINES.reengagement[0].replace('{{firstName}}', firstName)

  const content = `
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:${COLORS.slate};font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;line-height:1.3;">
      We&rsquo;ve missed you, ${safeName}
    </h1>

    <p style="margin:0 0 20px 0;font-size:16px;line-height:1.6;color:${COLORS.slate};">
      It&rsquo;s been ${daysSinceLastCheckin} days since your last check-in for ${safeBaby}.
      No pressure &mdash; parenting is busy! But Lumira works best with regular updates.
    </p>

    <!-- Gentle nudge card -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 24px 0;">
      <tr>
        <td style="padding:20px;background:${COLORS.sand100};border-radius:12px;text-align:center;">
          <p style="margin:0 0 4px 0;font-size:32px;">\u{1F331}</p>
          <p style="margin:0 0 8px 0;font-size:15px;font-weight:600;color:${COLORS.slate};">
            A lot can happen in ${daysSinceLastCheckin} days
          </p>
          <p style="margin:0;font-size:14px;color:${COLORS.muted};line-height:1.5;">
            A single check-in gets Lumira back on track. It takes less than 60 seconds.
          </p>
        </td>
      </tr>
    </table>

    ${ctaButton('Quick Check-in', LINKS.checkin)}

    <p style="margin:16px 0 0 0;font-size:13px;color:${COLORS.muted};text-align:center;line-height:1.6;">
      If you&rsquo;d rather not receive these reminders, you can
      <a href="${LINKS.unsubscribe}" style="color:${COLORS.muted};text-decoration:underline;">adjust your preferences</a>.
    </p>

    ${medicalDisclaimer()}
  `

  return {
    subject,
    preheader,
    html: emailWrapper(content, preheader, email),
  }
}

// ---------------------------------------------------------------------------
// 8. Partner Invite
// ---------------------------------------------------------------------------

export function partnerInviteEmail(
  inviterName: string,
  inviteeEmail: string,
  token: string,
  babyName: string
): EmailTemplate {
  const safeInviter = escapeHtml(inviterName)
  const safeBaby = escapeHtml(babyName || 'your little one')
  const inviteUrl = `${APP_URL}/invite/${encodeURIComponent(token)}`
  const preheader = `${safeInviter} wants to care for ${safeBaby} together on Lumira`

  const subject = SUBJECT_LINES.partnerInvite[0].replace('{{inviterName}}', inviterName)

  const content = `
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:${COLORS.slate};font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;line-height:1.3;">
      You&rsquo;ve been invited to Lumira
    </h1>

    <p style="margin:0 0 20px 0;font-size:16px;line-height:1.6;color:${COLORS.slate};">
      <strong>${safeInviter}</strong> has invited you to join them on Lumira to help
      track and care for ${safeBaby} together.
    </p>

    <!-- What is Lumira card -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 24px 0;">
      <tr>
        <td style="padding:20px;background:${COLORS.sand100};border-radius:12px;">
          <p style="margin:0 0 8px 0;font-size:15px;font-weight:600;color:${COLORS.sage500};">
            \u{1F319} What is Lumira?
          </p>
          <p style="margin:0;font-size:14px;line-height:1.6;color:${COLORS.slate};">
            Lumira is a calm, evidence-based companion that helps parents track daily patterns,
            spot trends, and feel confident about their baby&rsquo;s development. When both
            parents are connected, everyone stays on the same page.
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px 0;font-size:15px;font-weight:600;color:${COLORS.slate};">
      As a co-parent on Lumira, you can:
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 8px 0;">
      <tr>
        <td style="padding:6px 0;">
          <span style="color:${COLORS.sage500};font-weight:600;margin-right:8px;">\u2713</span>
          <span style="font-size:15px;color:${COLORS.slate};">Log check-ins and see shared history</span>
        </td>
      </tr>
      <tr>
        <td style="padding:6px 0;">
          <span style="color:${COLORS.sage500};font-weight:600;margin-right:8px;">\u2713</span>
          <span style="font-size:15px;color:${COLORS.slate};">Receive pattern alerts and weekly guides</span>
        </td>
      </tr>
      <tr>
        <td style="padding:6px 0;">
          <span style="color:${COLORS.sage500};font-weight:600;margin-right:8px;">\u2713</span>
          <span style="font-size:15px;color:${COLORS.slate};">Stay aligned on concerns and milestones</span>
        </td>
      </tr>
    </table>

    ${ctaButton('Accept Invitation', inviteUrl)}

    ${mutedText('This invitation was sent by ' + safeInviter + ' via Lumira. Received this by mistake? Simply ignore it \u2014 your account is safe.')}

    ${medicalDisclaimer()}
  `

  return {
    subject,
    preheader,
    html: emailWrapper(content, preheader, inviteeEmail),
  }
}
