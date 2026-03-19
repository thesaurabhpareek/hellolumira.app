/**
 * @module DailyCheckinEmail
 * @description Email template for the daily check-in reminder. Includes three
 *   quick-tap buttons (Rough / Okay / Good) that link to the check-in page
 *   with a pre-filled sleep_quality value.
 * @version 1.0.0
 * @since March 2026
 */

import { emailLayout, quickTapButtons, escapeHtml, TERRA_400 } from './layout'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://hellolumira.app'

type DailyCheckinParams = {
  parent_name: string
  baby_name: string
  unsubscribe_url: string
}

export function dailyCheckinEmail(params: DailyCheckinParams): { subject: string; html: string } {
  const name = escapeHtml(params.parent_name)
  const babyName = escapeHtml(params.baby_name)

  const subject = `How are you and ${params.baby_name} doing today?`
  const preheader = `Quick check-in — just one tap to get started.`

  const body = `
    <h2 style="margin:0 0 12px 0;font-size:20px;font-weight:700;color:#1a1a18;line-height:1.3;">How are you and ${babyName} doing today?</h2>
    <p style="margin:0 0 8px 0;font-size:15px;color:#4a4a46;line-height:1.6;">Hi ${name}, it only takes a second. How did last night go?</p>
    <p style="margin:0 0 4px 0;font-size:13px;color:#8a8a86;line-height:1.5;">Tap one to get started:</p>
    ${quickTapButtons([
      { label: 'Rough', href: `${APP_URL}/checkin?prefill=sleep_quality:poor`, color: TERRA_400 },
      { label: 'Okay', href: `${APP_URL}/checkin?prefill=sleep_quality:ok` },
      { label: 'Good', href: `${APP_URL}/checkin?prefill=sleep_quality:good` },
    ])}
    <p style="margin:0;font-size:13px;color:#8a8a86;line-height:1.5;">Tracking daily patterns helps Lumira spot trends and give you better guidance.</p>
  `

  return { subject, html: emailLayout(preheader, body, params.unsubscribe_url) }
}
