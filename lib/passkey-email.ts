/**
 * @module PasskeyEmail
 * @description Email dispatch helpers for all passkey lifecycle events.
 *   Each function builds the appropriate template and sends it via Resend.
 *   Functions never throw — they return EmailResult from sendEmail.
 *
 * @version 1.0.0
 * @since March 2026
 */

import { sendEmail, type EmailResult } from './resend'
import {
  passkeyEnrolledEmail,
  passkeyNewDeviceAlertEmail,
  passkeyRemovedEmail,
  passkeySuspendedEmail,
  passkeyRecoveryNudgeEmail,
  passkeySetupNudgeEmail,
} from './email-templates'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hellolumira.app'
const SUPPORT_URL = `${APP_URL}/support`
const SETTINGS_SECURITY_URL = `${APP_URL}/settings/security`

// ---------------------------------------------------------------------------
// Passkey enrolled — sent when a user successfully registers a passkey
// ---------------------------------------------------------------------------

export async function sendPasskeyEnrolledEmail({
  email,
  firstName,
  deviceHint,
}: {
  email: string
  firstName: string
  deviceHint: string
}): Promise<EmailResult> {
  const template = passkeyEnrolledEmail({
    firstName,
    deviceHint,
    manageUrl: SETTINGS_SECURITY_URL,
  })

  return sendEmail(email, template.subject, template.html, {
    tags: [{ name: 'category', value: 'passkey_enrolled' }],
    skipFooter: true,
  })
}

// ---------------------------------------------------------------------------
// Passkey new-device alert — sent whenever any passkey is added (security alert)
// ---------------------------------------------------------------------------

export async function sendPasskeyNewDeviceAlertEmail({
  email,
  firstName,
  deviceHint,
  ipSubnet,
  enrolledAt,
  revokeUrl,
}: {
  email: string
  firstName: string
  deviceHint: string
  ipSubnet: string
  enrolledAt: string
  revokeUrl: string
}): Promise<EmailResult> {
  const template = passkeyNewDeviceAlertEmail({
    firstName,
    deviceHint,
    ipSubnet,
    enrolledAt,
    revokeUrl,
  })

  return sendEmail(email, template.subject, template.html, {
    tags: [{ name: 'category', value: 'passkey_new_device_alert' }],
    skipFooter: true,
  })
}

// ---------------------------------------------------------------------------
// Passkey removed alert — sent when a passkey is deleted
// ---------------------------------------------------------------------------

export async function sendPasskeyRemovedAlertEmail({
  email,
  firstName,
  deviceHint,
  removedAt,
}: {
  email: string
  firstName: string
  deviceHint: string
  removedAt: string
}): Promise<EmailResult> {
  const template = passkeyRemovedEmail({
    firstName,
    deviceHint,
    removedAt,
    supportUrl: SUPPORT_URL,
  })

  return sendEmail(email, template.subject, template.html, {
    tags: [{ name: 'category', value: 'passkey_removed' }],
    skipFooter: true,
  })
}

// ---------------------------------------------------------------------------
// Passkey suspended alert — sent when unusual activity triggers a suspension
// ---------------------------------------------------------------------------

export async function sendPasskeySuspendedAlertEmail({
  email,
  firstName,
  deviceHint,
}: {
  email: string
  firstName: string
  deviceHint: string
}): Promise<EmailResult> {
  const template = passkeySuspendedEmail({
    firstName,
    deviceHint,
    supportUrl: SUPPORT_URL,
    settingsUrl: SETTINGS_SECURITY_URL,
  })

  return sendEmail(email, template.subject, template.html, {
    tags: [{ name: 'category', value: 'passkey_suspended' }],
    skipFooter: true,
  })
}

// ---------------------------------------------------------------------------
// Passkey recovery nudge — sent when a user signs in via email after losing
// their passkey (e.g., new device), gently prompting them to re-enroll
// ---------------------------------------------------------------------------

export async function sendPasskeyRecoveryNudgeEmail({
  email,
  firstName,
}: {
  email: string
  firstName: string
}): Promise<EmailResult> {
  const template = passkeyRecoveryNudgeEmail({
    firstName,
    enrollUrl: SETTINGS_SECURITY_URL,
  })

  return sendEmail(email, template.subject, template.html, {
    tags: [{ name: 'category', value: 'passkey_recovery_nudge' }],
    skipFooter: true,
  })
}

// ---------------------------------------------------------------------------
// Passkey setup nudge — sent to users who have never set up a passkey,
// encouraging them to enable faster passkey sign-in
// ---------------------------------------------------------------------------

export async function sendPasskeySetupNudgeEmail({
  email,
  firstName,
}: {
  email: string
  firstName: string
}): Promise<EmailResult> {
  const template = passkeySetupNudgeEmail({
    firstName,
    enrollUrl: SETTINGS_SECURITY_URL,
  })

  return sendEmail(email, template.subject, template.html, {
    tags: [{ name: 'category', value: 'passkey_setup_nudge' }],
    skipFooter: true,
  })
}
