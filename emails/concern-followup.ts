/**
 * @module ConcernFollowupEmail
 * @description Email template for following up on a previously logged concern.
 *   Asks the parent how things are going and links to the check-in page.
 * @version 1.0.0
 * @since March 2026
 */

import { emailLayout, ctaButton, escapeHtml } from './layout'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://hellolumira.app'

type ConcernFollowupParams = {
  parent_name: string
  baby_name: string
  concern_type: string
  unsubscribe_url: string
}

export function concernFollowupEmail(params: ConcernFollowupParams): { subject: string; html: string } {
  const name = escapeHtml(params.parent_name)
  const babyName = escapeHtml(params.baby_name)
  const concern = escapeHtml(params.concern_type.replace(/_/g, ' '))

  const subject = `Following up on ${params.concern_type.replace(/_/g, ' ')}`
  const preheader = `How is ${params.baby_name} doing since you mentioned ${params.concern_type.replace(/_/g, ' ')}?`

  const body = `
    <h2 style="margin:0 0 12px 0;font-size:20px;font-weight:700;color:#1a1a18;line-height:1.3;">Following up on ${concern}</h2>
    <p style="margin:0 0 16px 0;font-size:15px;color:#4a4a46;line-height:1.6;">Hi ${name}, how is ${babyName} doing since you mentioned ${concern}? Tap below to check in.</p>
    ${ctaButton('Check in \u2192', `${APP_URL}/checkin`)}
    <p style="margin:0;font-size:13px;color:#8a8a86;line-height:1.5;">Keeping Lumira updated helps us give you the most relevant guidance.</p>
  `

  return { subject, html: emailLayout(preheader, body, params.unsubscribe_url) }
}
