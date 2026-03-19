/**
 * @module ReengagementEmail
 * @description Re-engagement email sent after 48 hours of inactivity. Gentle
 *   nudge with a CTA to check in.
 * @version 1.0.0
 * @since March 2026
 */

import { emailLayout, ctaButton, escapeHtml } from './layout'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://hellolumira.app'

type ReengagementParams = {
  parent_name: string
  baby_name: string
  unsubscribe_url: string
}

export function reengagementEmail(params: ReengagementParams): { subject: string; html: string } {
  const name = escapeHtml(params.parent_name)
  const babyName = escapeHtml(params.baby_name)

  const subject = `We've missed you, ${params.parent_name}`
  const preheader = `Even a quick check-in helps Lumira help you.`

  const body = `
    <h2 style="margin:0 0 12px 0;font-size:20px;font-weight:700;color:#1a1a18;line-height:1.3;">We've missed you, ${name}</h2>
    <p style="margin:0 0 16px 0;font-size:15px;color:#4a4a46;line-height:1.6;">It's been a little while since your last check-in for ${babyName}. No pressure — parenting is busy! But Lumira works best with regular updates.</p>
    <p style="margin:0 0 16px 0;font-size:15px;color:#4a4a46;line-height:1.6;">Even a quick 30-second check-in helps us keep track of how things are going.</p>
    ${ctaButton('Check in now \u2192', `${APP_URL}/checkin`)}
    <p style="margin:0;font-size:13px;color:#8a8a86;line-height:1.5;">If you'd rather not receive these reminders, you can update your preferences below.</p>
  `

  return { subject, html: emailLayout(preheader, body, params.unsubscribe_url) }
}
