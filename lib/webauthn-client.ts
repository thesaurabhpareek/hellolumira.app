'use client'

export function isPasskeySupported(): boolean {
  return typeof window !== 'undefined' && !!window.PublicKeyCredential
}

export async function isConditionalMediationAvailable(): Promise<boolean> {
  if (!isPasskeySupported()) return false
  try {
    return await PublicKeyCredential.isConditionalMediationAvailable()
  } catch {
    return false
  }
}

function bufferToBase64url(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...Array.from(new Uint8Array(buffer))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  const binary = atob(padded)
  const buffer = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i)
  return buffer.buffer
}

export type PasskeySignInResult =
  | { success: true; tokenHash: string; type: string; redirectTo: string }
  | { success: false; cancelled: boolean; error: string }

export async function signInWithPasskey(email?: string): Promise<PasskeySignInResult> {
  try {
    // Get authentication options
    const optRes = await fetch('/api/auth/passkey/authentication-options', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (!optRes.ok) throw new Error('Failed to get authentication options')
    const options = await optRes.json()

    // Prepare options — convert challenge and allowCredentials IDs from base64url to ArrayBuffer
    const credentialOptions: CredentialRequestOptions = {
      publicKey: {
        ...options,
        challenge: base64urlToBuffer(options.challenge),
        allowCredentials: (options.allowCredentials ?? []).map((c: { id: string; type: string; transports?: AuthenticatorTransport[] }) => ({
          ...c,
          id: base64urlToBuffer(c.id),
        })),
      },
    }

    const credential = await navigator.credentials.get(credentialOptions) as PublicKeyCredential | null
    if (!credential) {
      return { success: false, cancelled: true, error: 'Cancelled' }
    }

    const response = credential.response as AuthenticatorAssertionResponse
    const credentialJSON = {
      id: credential.id,
      rawId: bufferToBase64url(credential.rawId),
      response: {
        clientDataJSON: bufferToBase64url(response.clientDataJSON),
        authenticatorData: bufferToBase64url(response.authenticatorData),
        signature: bufferToBase64url(response.signature),
        userHandle: response.userHandle ? bufferToBase64url(response.userHandle) : null,
      },
      type: credential.type,
      clientExtensionResults: credential.getClientExtensionResults(),
    }

    const verifyRes = await fetch('/api/auth/passkey/authenticate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: credentialJSON }),
    })

    const data = await verifyRes.json()
    if (!verifyRes.ok) {
      return { success: false, cancelled: false, error: data.error ?? 'Sign-in failed.' }
    }

    return { success: true, tokenHash: data.tokenHash, type: data.type, redirectTo: data.redirectTo }
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
        return { success: false, cancelled: true, error: 'Cancelled' }
      }
      if (err.name === 'NotSupportedError') {
        return { success: false, cancelled: false, error: 'Your browser does not support passkeys.' }
      }
    }
    return { success: false, cancelled: false, error: 'Sign-in failed. Please try a magic link.' }
  }
}

export async function enrollPasskey(): Promise<
  { success: true; passkeyId: string; deviceHint: string } | { success: false; cancelled: boolean; error: string }
> {
  try {
    const optRes = await fetch('/api/auth/passkey/registration-options', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    if (!optRes.ok) {
      const d = await optRes.json()
      return { success: false, cancelled: false, error: d.error ?? 'Failed to start passkey setup.' }
    }
    const options = await optRes.json()

    const credentialOptions: CredentialCreationOptions = {
      publicKey: {
        ...options,
        challenge: base64urlToBuffer(options.challenge),
        user: { ...options.user, id: base64urlToBuffer(options.user.id) },
        excludeCredentials: (options.excludeCredentials ?? []).map((c: { id: string; type: string }) => ({
          ...c,
          id: base64urlToBuffer(c.id),
        })),
      },
    }

    const credential = await navigator.credentials.create(credentialOptions) as PublicKeyCredential | null
    if (!credential) {
      return { success: false, cancelled: true, error: 'Cancelled' }
    }

    const response = credential.response as AuthenticatorAttestationResponse
    const credentialJSON = {
      id: credential.id,
      rawId: bufferToBase64url(credential.rawId),
      response: {
        clientDataJSON: bufferToBase64url(response.clientDataJSON),
        attestationObject: bufferToBase64url(response.attestationObject),
        transports: response.getTransports?.() ?? [],
      },
      type: credential.type,
      clientExtensionResults: credential.getClientExtensionResults(),
    }

    const registerRes = await fetch('/api/auth/passkey/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: credentialJSON }),
    })

    const data = await registerRes.json()
    if (!registerRes.ok) {
      return { success: false, cancelled: false, error: data.error ?? 'Failed to save passkey.' }
    }

    // Store local flag for sign-in page to know passkey is enrolled
    try { localStorage.setItem('lumira_passkey_enrolled', '1') } catch {}

    return { success: true, passkeyId: data.passkey.id, deviceHint: data.passkey.deviceHint }
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
        return { success: false, cancelled: true, error: 'Cancelled' }
      }
      if (err.name === 'InvalidStateError') {
        return { success: false, cancelled: false, error: 'This device already has passkey sign-in set up.' }
      }
      if (err.name === 'NotSupportedError') {
        return { success: false, cancelled: false, error: "Your browser doesn't support passkeys yet. Try Safari on iPhone." }
      }
    }
    return { success: false, cancelled: false, error: "Couldn't save your passkey. Check your connection and try again." }
  }
}
