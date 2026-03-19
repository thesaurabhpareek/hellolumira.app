/**
 * @module OnboardingWelcomeEmail
 * @description Welcome email sent immediately after signup. Introduces Lumira
 *   and includes a CTA to start the first check-in.
 * @version 1.0.0
 * @since March 2026
 */

import { emailLayout, ctaButton, escapeHtml, SAGE_500 } from './layout'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://hellolumira.app'

type OnboardingWelcomeParams = {
  parent_name: string
  baby_name: string
  unsubscribe_url: string
}

export function onboardingWelcomeEmail(params: OnboardingWelcomeParams): { subject: string; html: string } {
  const name = escapeHtml(params.parent_name)
  const babyName = escapeHtml(params.baby_name)

  const subject = 'Welcome to Lumira'
  const preheader = `Your calm, knowledgeable companion for ${params.baby_name}'s journey.`

  const body = `
    <h2 style="margin:0 0 12px 0;font-size:20px;font-weight:700;color:#1a1a18;line-height:1.3;">Welcome to Lumira, ${name}</h2>
    <p style="margin:0 0 16px 0;font-size:15px;color:#4a4a46;line-height:1.6;">We're so glad you're here. Lumira is your calm, knowledgeable companion for ${babyName}'s journey.</p>
    <div style="margin:16px 0;padding:16px;background-color:${SAGE_500}0D;border-radius:8px;">
      <p style="margin:0 0 8px 0;font-size:14px;font-weight:600;color:#1a1a18;">Here's what to expect:</p>
      <ul style="margin:0;padding-left:20px;font-size:14px;color:#4a4a46;line-height:1.8;">
        <li><strong>Daily check-ins</strong> — a quick 60-second snapshot each morning</li>
        <li><strong>Pattern insights</strong> — we'll spot trends so you don't have to</li>
        <li><strong>Weekly guides</strong> — tailored to ${babyName}'s stage</li>
        <li><strong>Concern support</strong> — structured help when something feels off</li>
      </ul>
    </div>
    ${ctaButton('Start your first check-in \u2192', `${APP_URL}/checkin`)}
    <p style="margin:0;font-size:13px;color:#8a8a86;line-height:1.5;">You've got this. And Lumira's got you.</p>
  `

  return { subject, html: emailLayout(preheader, body, params.unsubscribe_url) }
}
