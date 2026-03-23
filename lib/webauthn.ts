import {
  generateRegistrationOptions as _generateRegistrationOptions,
  verifyRegistrationResponse as _verifyRegistrationResponse,
  generateAuthenticationOptions as _generateAuthenticationOptions,
  verifyAuthenticationResponse as _verifyAuthenticationResponse,
} from '@simplewebauthn/server'

export {
  _generateRegistrationOptions as generateRegistrationOptions,
  _verifyRegistrationResponse as verifyRegistrationResponse,
  _generateAuthenticationOptions as generateAuthenticationOptions,
  _verifyAuthenticationResponse as verifyAuthenticationResponse,
}

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

export const PASSKEY_REGISTRATION_TIMEOUT = 60000
export const PASSKEY_AUTH_TIMEOUT = 30000
export const MAX_PASSKEYS_PER_USER = 10
