/**
 * @module WeeklyGuideEmail
 * @description Email template for the weekly developmental guide. Shows the
 *   week number, a personalised opening, and a CTA to read the full guide.
 * @version 1.0.0
 * @since March 2026
 */

import { emailLayout, ctaButton, escapeHtml } from './layout'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://hellolumira.app'

type WeeklyGuideParams = {
  parent_name: string
  baby_name: string
  week_number: number
  guide_opening: string
  unsubscribe_url: string
}

export function weeklyGuideEmail(params: WeeklyGuideParams): { subject: string; html: string } {
  const name = escapeHtml(params.parent_name)
  const babyName = escapeHtml(params.baby_name)
  const opening = escapeHtml(params.guide_opening)

  const subject = `Week ${params.week_number} with ${params.baby_name}`
  const preheader = `Your weekly guide is ready.`

  const body = `
    <h2 style="margin:0 0 12px 0;font-size:20px;font-weight:700;color:#1a1a18;line-height:1.3;">Week ${params.week_number} with ${babyName}</h2>
    <p style="margin:0 0 16px 0;font-size:15px;color:#4a4a46;line-height:1.6;">Hi ${name}, ${opening}</p>
    ${ctaButton('Read your guide \u2192', `${APP_URL}/home`)}
    <p style="margin:0;font-size:13px;color:#8a8a86;line-height:1.5;">Lumira puts together a personalised guide each week based on ${babyName}'s stage and your check-ins.</p>
  `

  return { subject, html: emailLayout(preheader, body, params.unsubscribe_url) }
}
