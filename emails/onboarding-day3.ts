/**
 * @module OnboardingDay3Email
 * @description Day 3 onboarding email. Encourages the parent and reminds them
 *   about weekly guides and the chat feature.
 * @version 1.0.0
 * @since March 2026
 */

import { emailLayout, ctaButton, escapeHtml } from './layout'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://hellolumira.app'

type OnboardingDay3Params = {
  parent_name: string
  baby_name: string
  unsubscribe_url: string
}

export function onboardingDay3Email(params: OnboardingDay3Params): { subject: string; html: string } {
  const name = escapeHtml(params.parent_name)
  const babyName = escapeHtml(params.baby_name)

  const subject = `How's it going, ${params.parent_name}?`
  const preheader = `A few days in — here's what's coming next.`

  const body = `
    <h2 style="margin:0 0 12px 0;font-size:20px;font-weight:700;color:#1a1a18;line-height:1.3;">How's it going, ${name}?</h2>
    <p style="margin:0 0 16px 0;font-size:15px;color:#4a4a46;line-height:1.6;">You've been checking in for a few days now — that's wonderful. Consistency is what makes Lumira powerful for ${babyName}.</p>
    <p style="margin:0 0 16px 0;font-size:15px;color:#4a4a46;line-height:1.6;">Did you know? After just one week of check-ins, Lumira can start detecting sleep and feeding patterns. Keep going!</p>
    <div style="margin:16px 0;padding:16px;background-color:#f5f5f2;border-radius:8px;">
      <p style="margin:0 0 8px 0;font-size:14px;font-weight:600;color:#1a1a18;">Coming up:</p>
      <ul style="margin:0;padding-left:20px;font-size:14px;color:#4a4a46;line-height:1.8;">
        <li><strong>Weekly guides</strong> — personalised to ${babyName}'s stage, arriving soon</li>
        <li><strong>Chat with Lumira</strong> — ask anything, any time, during check-ins</li>
      </ul>
    </div>
    ${ctaButton('Continue checking in \u2192', `${APP_URL}/checkin`)}
  `

  return { subject, html: emailLayout(preheader, body, params.unsubscribe_url) }
}
