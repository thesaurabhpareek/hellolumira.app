/**
 * @module PartnerInviteEmail
 * @description Email template for partner invitations. Explains what Lumira is
 *   and includes an "Accept invite" CTA linking to the unique invite token URL.
 * @version 1.0.0
 * @since March 2026
 */

import { emailLayout, ctaButton, escapeHtml, SAGE_500 } from './layout'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://hellolumira.app'

type PartnerInviteParams = {
  inviter_name: string
  baby_name: string
  invite_token: string
  unsubscribe_url: string
}

export function partnerInviteEmail(params: PartnerInviteParams): { subject: string; html: string } {
  const inviterName = escapeHtml(params.inviter_name)
  const babyName = escapeHtml(params.baby_name)
  const inviteUrl = `${APP_URL}/invite/${encodeURIComponent(params.invite_token)}`

  const subject = `You've been invited to join Lumira`
  const preheader = `${params.inviter_name} wants you to join them on Lumira.`

  const body = `
    <h2 style="margin:0 0 12px 0;font-size:20px;font-weight:700;color:#1a1a18;line-height:1.3;">You've been invited to join Lumira</h2>
    <p style="margin:0 0 16px 0;font-size:15px;color:#4a4a46;line-height:1.6;"><strong>${inviterName}</strong> has invited you to join them on Lumira to help track and care for ${babyName} together.</p>
    <div style="margin:16px 0;padding:16px;background-color:${SAGE_500}0D;border-radius:8px;">
      <p style="margin:0 0 8px 0;font-size:14px;font-weight:600;color:#1a1a18;">What is Lumira?</p>
      <p style="margin:0;font-size:14px;color:#4a4a46;line-height:1.6;">Lumira is a calm, evidence-based companion that helps parents track daily patterns, spot trends, and feel confident about their baby's development.</p>
    </div>
    ${ctaButton('Accept invite \u2192', inviteUrl)}
    <p style="margin:0;font-size:13px;color:#8a8a86;line-height:1.5;">This invitation was sent by ${inviterName} via Lumira. If you weren't expecting this, you can safely ignore it.</p>
  `

  return { subject, html: emailLayout(preheader, body, params.unsubscribe_url) }
}
