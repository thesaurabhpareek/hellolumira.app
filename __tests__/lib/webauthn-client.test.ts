// @vitest-environment happy-dom
// __tests__/lib/webauthn-client.test.ts
// Unit tests for browser-side WebAuthn client helpers.
// navigator.credentials is not available in jsdom/happy-dom, so we mock it completely.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeArrayBuffer(bytes: number[]): ArrayBuffer {
  const buf = new ArrayBuffer(bytes.length)
  new Uint8Array(buf).set(bytes)
  return buf
}

// A minimal fake PublicKeyCredential for sign-in (get)
function makeFakeAssertionCredential(id = 'cred-id-test') {
  const clientDataJSON = makeArrayBuffer([1, 2, 3])
  const authenticatorData = makeArrayBuffer([4, 5, 6])
  const signature = makeArrayBuffer([7, 8, 9])
  return {
    id,
    rawId: makeArrayBuffer([10, 11, 12]),
    type: 'public-key',
    response: {
      clientDataJSON,
      authenticatorData,
      signature,
      userHandle: null,
    },
    getClientExtensionResults: () => ({}),
  }
}

// A minimal fake PublicKeyCredential for registration (create)
function makeFakeAttestationCredential(id = 'new-cred-id') {
  const clientDataJSON = makeArrayBuffer([1, 2, 3])
  const attestationObject = makeArrayBuffer([4, 5, 6])
  return {
    id,
    rawId: makeArrayBuffer([10, 11, 12]),
    type: 'public-key',
    response: {
      clientDataJSON,
      attestationObject,
      getTransports: () => ['internal'],
    },
    getClientExtensionResults: () => ({}),
  }
}

// Mock fetch globally before importing module under test
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Mock navigator.credentials
const mockCredentialsGet = vi.fn()
const mockCredentialsCreate = vi.fn()
vi.stubGlobal('navigator', {
  credentials: {
    get: mockCredentialsGet,
    create: mockCredentialsCreate,
  },
})

// btoa/atob are available in happy-dom. We still need them:
// (they're globals in happy-dom)

// ─── Import module under test (after mocks are set up) ─────────────────────

import {
  isPasskeySupported,
  isConditionalMediationAvailable,
  signInWithPasskey,
  enrollPasskey,
} from '@/lib/webauthn-client'

// ─── Shared options response fixture ─────────────────────────────────────────

const FAKE_AUTH_OPTIONS = {
  challenge: 'Y2hhbGxlbmdl', // base64url "challenge"
  timeout: 60000,
  rpId: 'hellolumira.app',
  allowCredentials: [],
  userVerification: 'required',
}

const FAKE_REG_OPTIONS = {
  challenge: 'cmVnY2hhbGxlbmdl', // base64url "regchallenge"
  timeout: 60000,
  rp: { id: 'hellolumira.app', name: 'Lumira' },
  user: { id: 'dXNlcmlk', displayName: 'Alice', name: 'alice@example.com' },
  pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
  authenticatorSelection: {
    residentKey: 'preferred',
    userVerification: 'required',
    authenticatorAttachment: 'platform',
  },
  excludeCredentials: [],
}

// ─── isPasskeySupported ───────────────────────────────────────────────────────

describe('isPasskeySupported()', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns true when window.PublicKeyCredential is defined', () => {
    vi.stubGlobal('PublicKeyCredential', class {})
    expect(isPasskeySupported()).toBe(true)
  })

  it('returns false when window.PublicKeyCredential is undefined', () => {
    // @ts-expect-error intentional
    vi.stubGlobal('PublicKeyCredential', undefined)
    expect(isPasskeySupported()).toBe(false)
  })
})

// ─── isConditionalMediationAvailable ─────────────────────────────────────────

describe('isConditionalMediationAvailable()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns true when PublicKeyCredential.isConditionalMediationAvailable() resolves true', async () => {
    vi.stubGlobal('PublicKeyCredential', {
      isConditionalMediationAvailable: vi.fn().mockResolvedValue(true),
    })
    const result = await isConditionalMediationAvailable()
    expect(result).toBe(true)
  })

  it('returns false when PublicKeyCredential.isConditionalMediationAvailable() resolves false', async () => {
    vi.stubGlobal('PublicKeyCredential', {
      isConditionalMediationAvailable: vi.fn().mockResolvedValue(false),
    })
    const result = await isConditionalMediationAvailable()
    expect(result).toBe(false)
  })

  it('returns false when isConditionalMediationAvailable throws an exception', async () => {
    vi.stubGlobal('PublicKeyCredential', {
      isConditionalMediationAvailable: vi.fn().mockRejectedValue(new Error('not supported')),
    })
    const result = await isConditionalMediationAvailable()
    expect(result).toBe(false)
  })

  it('returns false when PublicKeyCredential is not defined (SSR-like)', async () => {
    // @ts-expect-error intentional
    vi.stubGlobal('PublicKeyCredential', undefined)
    const result = await isConditionalMediationAvailable()
    expect(result).toBe(false)
  })
})

// ─── signInWithPasskey ────────────────────────────────────────────────────────

describe('signInWithPasskey()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Restore PublicKeyCredential so isPasskeySupported returns true
    vi.stubGlobal('PublicKeyCredential', class {})
  })

  it('happy path — returns success with tokenHash when credential returned and API succeeds', async () => {
    // First fetch: authentication-options
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => FAKE_AUTH_OPTIONS,
      })
      // Second fetch: authenticate
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          tokenHash: 'abc123hash',
          type: 'magiclink',
          redirectTo: '/home',
        }),
      })

    mockCredentialsGet.mockResolvedValue(makeFakeAssertionCredential())

    const result = await signInWithPasskey('alice@example.com')

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.tokenHash).toBe('abc123hash')
      expect(result.type).toBe('magiclink')
      expect(result.redirectTo).toBe('/home')
    }
  })

  it('user cancels (NotAllowedError) — returns { success: false, cancelled: true }', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => FAKE_AUTH_OPTIONS,
    })

    const err = new Error('User cancelled')
    err.name = 'NotAllowedError'
    mockCredentialsGet.mockRejectedValue(err)

    const result = await signInWithPasskey()
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.cancelled).toBe(true)
    }
  })

  it('AbortError — returns { success: false, cancelled: true }', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => FAKE_AUTH_OPTIONS,
    })

    const err = new Error('Aborted')
    err.name = 'AbortError'
    mockCredentialsGet.mockRejectedValue(err)

    const result = await signInWithPasskey()
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.cancelled).toBe(true)
    }
  })

  it('NotSupportedError — returns { success: false, cancelled: false, error contains "support" }', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => FAKE_AUTH_OPTIONS,
    })

    const err = new Error('Not supported')
    err.name = 'NotSupportedError'
    mockCredentialsGet.mockRejectedValue(err)

    const result = await signInWithPasskey()
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.cancelled).toBe(false)
      expect(result.error.toLowerCase()).toContain('support')
    }
  })

  it('fetch authentication-options fails — returns error with success: false', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal error' }),
    })

    const result = await signInWithPasskey()
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.cancelled).toBe(false)
    }
  })

  it('authenticate API returns 401 — returns error from server', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => FAKE_AUTH_OPTIONS,
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Passkey not recognized' }),
      })

    mockCredentialsGet.mockResolvedValue(makeFakeAssertionCredential())

    const result = await signInWithPasskey()
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('Passkey not recognized')
    }
  })

  it('navigator.credentials.get returns null — returns { success: false, cancelled: true }', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => FAKE_AUTH_OPTIONS,
    })

    mockCredentialsGet.mockResolvedValue(null)

    const result = await signInWithPasskey()
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.cancelled).toBe(true)
    }
  })
})

// ─── enrollPasskey ────────────────────────────────────────────────────────────

describe('enrollPasskey()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('PublicKeyCredential', class {})
    // Reset localStorage
    localStorage.clear()
  })

  it('happy path — returns success with passkeyId and deviceHint, sets localStorage flag', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => FAKE_REG_OPTIONS,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          passkey: {
            id: 'passkey-uuid-001',
            deviceHint: 'iPhone 15',
          },
        }),
      })

    mockCredentialsCreate.mockResolvedValue(makeFakeAttestationCredential())

    const result = await enrollPasskey()

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.passkeyId).toBe('passkey-uuid-001')
      expect(result.deviceHint).toBe('iPhone 15')
    }
    expect(localStorage.getItem('lumira_passkey_enrolled')).toBe('1')
  })

  it('user cancels — returns { success: false, cancelled: true }', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => FAKE_REG_OPTIONS,
    })

    const err = new Error('User cancelled')
    err.name = 'NotAllowedError'
    mockCredentialsCreate.mockRejectedValue(err)

    const result = await enrollPasskey()
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.cancelled).toBe(true)
    }
  })

  it('InvalidStateError — returns error containing "already"', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => FAKE_REG_OPTIONS,
    })

    const err = new Error('Credential already registered')
    err.name = 'InvalidStateError'
    mockCredentialsCreate.mockRejectedValue(err)

    const result = await enrollPasskey()
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.toLowerCase()).toContain('already')
    }
  })

  it('registration-options returns 422 (limit reached) — propagates server error message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({ error: 'You have reached the maximum number of passkeys.' }),
    })

    const result = await enrollPasskey()
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('maximum number of passkeys')
      expect(result.cancelled).toBe(false)
    }
  })

  it('does NOT set localStorage lumira_passkey_enrolled on failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Server error' }),
    })

    await enrollPasskey()
    expect(localStorage.getItem('lumira_passkey_enrolled')).toBeNull()
  })

  it('does NOT set localStorage on user cancel', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => FAKE_REG_OPTIONS,
    })

    const err = new Error('User cancelled')
    err.name = 'AbortError'
    mockCredentialsCreate.mockRejectedValue(err)

    await enrollPasskey()
    expect(localStorage.getItem('lumira_passkey_enrolled')).toBeNull()
  })

  it('register API returns error — does not set localStorage, returns error message', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => FAKE_REG_OPTIONS,
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Registration verification failed' }),
      })

    mockCredentialsCreate.mockResolvedValue(makeFakeAttestationCredential())

    const result = await enrollPasskey()
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('Registration verification failed')
    }
    expect(localStorage.getItem('lumira_passkey_enrolled')).toBeNull()
  })

  it('navigator.credentials.create returns null — returns { success: false, cancelled: true }', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => FAKE_REG_OPTIONS,
    })

    mockCredentialsCreate.mockResolvedValue(null)

    const result = await enrollPasskey()
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.cancelled).toBe(true)
    }
  })
})
