/**
 * @module PlatformDetect
 * @description Device and platform detection for adaptive UI — passkey labels,
 *   biometric terminology, and device-specific messaging. Client-side only.
 * @version 1.0.0
 * @since March 2026
 */

export type DevicePlatform = 'iphone' | 'ipad' | 'mac' | 'android' | 'windows' | 'chromebook' | 'linux' | 'unknown'

export type BiometricType = 'face_id' | 'touch_id' | 'fingerprint' | 'windows_hello' | 'screen_lock' | 'passkey'

export interface PlatformInfo {
  /** Detected device platform */
  platform: DevicePlatform
  /** Best biometric label for this device */
  biometric: BiometricType
  /** Short label for buttons: "Face ID", "Fingerprint", "Windows Hello", etc. */
  biometricLabel: string
  /** Passkey sign-in button text: "Sign in with Face ID" */
  signInLabel: string
  /** Passkey setup CTA: "Set up Face ID sign-in" */
  setupLabel: string
  /** Short description of how it works on this device */
  howItWorks: string
  /** "Works on all your [ecosystem] devices" */
  ecosystemNote: string
  /** Browser suggestion if current one doesn't support passkeys */
  browserSuggestion: string
  /** Whether this platform supports platform authenticators natively */
  supportsPlatformAuth: boolean
}

/**
 * Detects the current device platform from the user agent string.
 * Safe to call on server (returns 'unknown') but designed for client use.
 */
export function detectPlatform(ua?: string): DevicePlatform {
  if (typeof window === 'undefined' && !ua) return 'unknown'
  const s = (ua || navigator.userAgent).toLowerCase()

  // Order matters — iPad can report as Mac in some cases
  if (s.includes('iphone')) return 'iphone'
  if (s.includes('ipad') || (s.includes('macintosh') && 'ontouchend' in (typeof document !== 'undefined' ? document : {}))) return 'ipad'
  if (s.includes('macintosh') || s.includes('mac os x')) return 'mac'
  if (s.includes('cros')) return 'chromebook'
  if (s.includes('android')) return 'android'
  if (s.includes('windows')) return 'windows'
  if (s.includes('linux')) return 'linux'
  return 'unknown'
}

/**
 * Returns the appropriate biometric type for the detected platform.
 */
function getBiometricType(platform: DevicePlatform): BiometricType {
  switch (platform) {
    case 'iphone': return 'face_id'     // Face ID (or Touch ID on older models, but Face ID is dominant)
    case 'ipad': return 'face_id'       // Face ID on modern iPads, Touch ID on older
    case 'mac': return 'touch_id'       // Touch ID on MacBook Pro/Air
    case 'android': return 'fingerprint' // Fingerprint or face unlock
    case 'windows': return 'windows_hello'
    case 'chromebook': return 'screen_lock'
    default: return 'passkey'
  }
}

/**
 * Returns full platform info with all device-specific labels and copy.
 * Call this on the client side to get adaptive UI text.
 */
export function getPlatformInfo(ua?: string): PlatformInfo {
  const platform = detectPlatform(ua)
  const biometric = getBiometricType(platform)

  const INFO: Record<DevicePlatform, Omit<PlatformInfo, 'platform' | 'biometric'>> = {
    iphone: {
      biometricLabel: 'Face ID',
      signInLabel: 'Sign in with Face ID',
      setupLabel: 'Set up Face ID sign-in',
      howItWorks: 'Just Face ID — even at 3am. No passwords, no magic links.',
      ecosystemNote: 'Works on all your Apple devices automatically.',
      browserSuggestion: 'Use Safari on your iPhone for the best experience.',
      supportsPlatformAuth: true,
    },
    ipad: {
      biometricLabel: 'Face ID',
      signInLabel: 'Sign in with Face ID',
      setupLabel: 'Set up Face ID sign-in',
      howItWorks: 'Just Face ID — no passwords, no magic links.',
      ecosystemNote: 'Works on all your Apple devices automatically.',
      browserSuggestion: 'Use Safari for the best experience.',
      supportsPlatformAuth: true,
    },
    mac: {
      biometricLabel: 'Touch ID',
      signInLabel: 'Sign in with Touch ID',
      setupLabel: 'Set up Touch ID sign-in',
      howItWorks: 'Just Touch ID — no passwords, no magic links.',
      ecosystemNote: 'Works on all your Apple devices automatically.',
      browserSuggestion: 'Use Safari or Chrome on your Mac.',
      supportsPlatformAuth: true,
    },
    android: {
      biometricLabel: 'Fingerprint',
      signInLabel: 'Sign in with fingerprint',
      setupLabel: 'Set up fingerprint sign-in',
      howItWorks: 'Just your fingerprint — even at 3am. No passwords, no magic links.',
      ecosystemNote: 'Synced via Google Password Manager across your devices.',
      browserSuggestion: 'Use Chrome on your Android device.',
      supportsPlatformAuth: true,
    },
    windows: {
      biometricLabel: 'Windows Hello',
      signInLabel: 'Sign in with Windows Hello',
      setupLabel: 'Set up Windows Hello sign-in',
      howItWorks: 'Use Windows Hello — fingerprint, face, or PIN. No passwords needed.',
      ecosystemNote: 'Works on this Windows device.',
      browserSuggestion: 'Use Chrome or Edge on Windows.',
      supportsPlatformAuth: true,
    },
    chromebook: {
      biometricLabel: 'Screen lock',
      signInLabel: 'Sign in with screen lock',
      setupLabel: 'Set up quick sign-in',
      howItWorks: 'Use your screen lock to sign in — no passwords needed.',
      ecosystemNote: 'Works on your Chromebook.',
      browserSuggestion: 'Use Chrome on your Chromebook.',
      supportsPlatformAuth: true,
    },
    linux: {
      biometricLabel: 'Passkey',
      signInLabel: 'Sign in with passkey',
      setupLabel: 'Set up passkey sign-in',
      howItWorks: 'Use a passkey for passwordless sign-in.',
      ecosystemNote: 'Stored securely on this device.',
      browserSuggestion: 'Use Chrome or Firefox.',
      supportsPlatformAuth: false,
    },
    unknown: {
      biometricLabel: 'Passkey',
      signInLabel: 'Sign in with passkey',
      setupLabel: 'Set up passkey sign-in',
      howItWorks: 'Use a passkey for passwordless sign-in — no passwords needed.',
      ecosystemNote: 'Stored securely on your device.',
      browserSuggestion: 'Use a modern browser like Chrome or Safari.',
      supportsPlatformAuth: false,
    },
  }

  return {
    platform,
    biometric,
    ...INFO[platform],
  }
}

/**
 * Returns a short icon/emoji hint for the biometric type.
 * Useful for buttons and labels.
 */
export function getBiometricIcon(platform: DevicePlatform): string {
  switch (platform) {
    case 'iphone':
    case 'ipad': return '🔐'      // Face ID lock
    case 'mac': return '🔐'        // Touch ID
    case 'android': return '🔐'    // Fingerprint
    case 'windows': return '🔐'    // Windows Hello
    default: return '🔑'           // Generic key
  }
}
