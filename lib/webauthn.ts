// lib/webauthn.ts
// WebAuthn (passkeys) server-side helpers and re-exports for Lumira.
// Uses @simplewebauthn/server v13.

import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server'
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  WebAuthnCredential,
} from '@simplewebauthn/server'

// ---------------------------------------------------------------------------
// RP configuration
// ---------------------------------------------------------------------------

export const RP_ID: string = process.env.NEXT_PUBLIC_APP_URL
  ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
  : 'hellolumira.app'

export const RP_NAME = 'Lumira'

// ---------------------------------------------------------------------------
// Device hint parsing
// ---------------------------------------------------------------------------

/** Returns a human-readable device label from a User-Agent string. */
export function parseDeviceHint(userAgent: string): string {
  if (!userAgent) return 'Unknown device'
  const ua = userAgent.toLowerCase()
  if (ua.includes('iphone')) return 'iPhone'
  if (ua.includes('ipad')) return 'iPad'
  if (ua.includes('mac os x') || ua.includes('macintosh')) return 'Mac'
  if (ua.includes('samsung')) return 'Samsung'
  if (ua.includes('pixel')) return 'Google Pixel'
  if (ua.includes('android')) return 'Android'
  if (ua.includes('windows')) return 'Windows PC'
  return 'Unknown device'
}

/** Returns true when the credential is synced (e.g. iCloud Keychain). */
export function isSyncedPasskey(backedUp: boolean): boolean {
  return backedUp
}

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
}

export type { RegistrationResponseJSON, AuthenticationResponseJSON, WebAuthnCredential }

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const PASSKEY_REGISTRATION_TIMEOUT = 60_000 // 60 s
export const PASSKEY_AUTH_TIMEOUT = 30_000 // 30 s
export const MAX_PASSKEYS_PER_USER = 10
