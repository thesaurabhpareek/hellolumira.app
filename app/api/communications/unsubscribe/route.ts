/**
 * @module UnsubscribeAPI
 * @description POST /api/communications/unsubscribe — One-click email
 *   unsubscribe via JWT-authenticated links. Verifies the HS256 JWT token,
 *   disables the specific email type in communication_preferences, records
 *   a consent withdrawal, and returns an HTML confirmation page.
 * @version 1.0.0
 * @since March 2026
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { recordConsent } from '@/lib/consent'
import { logAudit } from '@/lib/audit'
import { SECURITY_HEADERS } from '@/lib/utils'

/** Maps unsubscribe type to the communication_preferences column to disable. */
const TYPE_TO_COLUMN: Record<string, string> = {
  email_daily_checkin: 'email_daily_checkin',
  email_pattern_alerts: 'email_pattern_alerts',
  email_weekly_guide: 'email_weekly_guide',
  email_concern_followup: 'email_concern_followup',
}

/** Human-readable labels for the unsubscribe confirmation page. */
const TYPE_LABELS: Record<string, string> = {
  email_daily_checkin: 'daily check-in reminders',
  email_pattern_alerts: 'pattern alerts',
  email_weekly_guide: 'weekly guides',
  email_concern_followup: 'concern follow-ups',
}

/** Base64url decode helper. */
function base64UrlDecode(input: string): Uint8Array {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/** Verify an HS256 JWT and return its payload, or null on failure. */
async function verifyJwt(token: string, secret: string): Promise<Record<string, unknown> | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [headerB64, payloadB64, signatureB64] = parts

    // Import the HMAC key
    const keyData = new TextEncoder().encode(secret)
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    // Verify the signature
    const signedInput = new TextEncoder().encode(`${headerB64}.${payloadB64}`)
    const signature = base64UrlDecode(signatureB64)
    const valid = await crypto.subtle.verify('HMAC', cryptoKey, signature.buffer as ArrayBuffer, signedInput)

    if (!valid) return null

    // Decode and parse the payload
    const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadB64))
    const payload = JSON.parse(payloadJson) as Record<string, unknown>

    // Check expiry
    if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

/** Escape HTML special characters to prevent XSS */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function htmlResponse(title: string, body: string, status = 200): NextResponse {
  const safeTitle = escapeHtml(title)
  const safeBody = escapeHtml(body)
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle} - Lumira</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #faf9f7; color: #1a1a1a; }
    .card { max-width: 480px; padding: 2rem; text-align: center; background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { font-size: 1.25rem; margin-bottom: 0.5rem; }
    p { color: #555; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${safeTitle}</h1>
    <p>${safeBody}</p>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    status,
    headers: { ...SECURITY_HEADERS, 'Content-Type': 'text/html; charset=utf-8' },
  })
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const type = searchParams.get('type')

    if (!token || !type) {
      return htmlResponse(
        'Invalid Link',
        'This unsubscribe link is missing required parameters. Please try again from your email.',
        400
      )
    }

    if (!TYPE_TO_COLUMN[type]) {
      return htmlResponse(
        'Invalid Type',
        `Unknown email type: "${type}". Please contact support if this persists.`,
        400
      )
    }

    // Validate JWT token — requires UNSUBSCRIBE_JWT_SECRET to be explicitly set.
    // We intentionally do NOT fall back to SUPABASE_JWT_SECRET because that would
    // allow any valid Supabase auth token to be used as an unsubscribe token.
    const secret = process.env.UNSUBSCRIBE_JWT_SECRET
    if (!secret) {
      console.error('[unsubscribe] UNSUBSCRIBE_JWT_SECRET is not configured')
      return htmlResponse('Error', 'Unable to process your request. Please try again later.', 500)
    }

    const payload = await verifyJwt(token, secret)
    if (!payload) {
      return htmlResponse(
        'Invalid or Expired Link',
        'This unsubscribe link has expired or is invalid. Please use the link from your most recent email, or update your preferences in Settings.',
        400
      )
    }

    const profileId = payload.sub as string | undefined
    if (!profileId) {
      return htmlResponse('Invalid Link', 'This unsubscribe link is malformed.', 400)
    }

    const serviceClient = await createServiceClient()

    // Update communication preferences
    const column = TYPE_TO_COLUMN[type]
    const { error: updateError } = await serviceClient
      .from('communication_preferences')
      .update({ [column]: false, updated_at: new Date().toISOString() })
      .eq('profile_id', profileId)

    if (updateError) {
      console.error('[unsubscribe] Failed to update preferences:', updateError.message)
      return htmlResponse('Error', 'Unable to process your request. Please try again later.', 500)
    }

    // Record consent withdrawal and audit (non-critical — never crash the unsubscribe flow)
    try {
      const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        undefined
      const userAgent = request.headers.get('user-agent') || undefined

      await recordConsent(profileId, 'marketing_email', 'withdrawn', {
        capture_method: 'email_unsubscribe_link',
        ip_address: ip,
        user_agent: userAgent,
      })

      // Log audit event
      await logAudit(
        'unsubscribed_email',
        profileId,
        { type, column },
        request
      )
    } catch (auditErr) {
      console.error('[unsubscribe] Consent/audit error (non-fatal):', auditErr)
    }

    const label = TYPE_LABELS[type] || type
    return htmlResponse(
      'Unsubscribed',
      `You've been unsubscribed from ${label}. You can re-enable this anytime in your Lumira Settings.`
    )
  } catch (err) {
    console.error('[unsubscribe] Error:', err)
    return htmlResponse('Error', 'Something went wrong. Please try again later.', 500)
  }
}
