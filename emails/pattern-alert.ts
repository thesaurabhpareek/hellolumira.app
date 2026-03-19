/**
 * @module PatternAlertEmail
 * @description Email template sent when Lumira detects a notable pattern in
 *   the baby's check-in data. Includes a description of the pattern and a
 *   CTA to view details on the home screen.
 * @version 1.0.0
 * @since March 2026
 */

import { emailLayout, ctaButton, escapeHtml } from './layout'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://hellolumira.app'

type PatternAlertParams = {
  parent_name: string
  baby_name: string
  pattern_type: string
  pattern_description: string
  unsubscribe_url: string
}

export function patternAlertEmail(params: PatternAlertParams): { subject: string; html: string } {
  const name = escapeHtml(params.parent_name)
  const babyName = escapeHtml(params.baby_name)
  const patternDesc = escapeHtml(params.pattern_description)

  const subject = `Lumira noticed something about ${params.baby_name}`
  const preheader = `A ${params.pattern_type.replace(/_/g, ' ')} pattern was detected.`

  const body = `
    <h2 style="margin:0 0 12px 0;font-size:20px;font-weight:700;color:#1a1a18;line-height:1.3;">Hi ${name}, Lumira noticed something about ${babyName}</h2>
    <p style="margin:0 0 16px 0;font-size:15px;color:#4a4a46;line-height:1.6;">${patternDesc}</p>
    <p style="margin:0 0 4px 0;font-size:13px;color:#8a8a86;line-height:1.5;">This is based on your recent check-ins. Take a look at the details below.</p>
    ${ctaButton('View details \u2192', `${APP_URL}/home`)}
    <p style="margin:0;font-size:13px;color:#8a8a86;line-height:1.5;">Lumira tracks patterns so you can feel confident about what's normal.</p>
  `

  return { subject, html: emailLayout(preheader, body, params.unsubscribe_url) }
}
