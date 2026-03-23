'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useToast, ToastContainer } from '@/components/ui/toast'
import PasskeyList, { type PasskeyFactor } from '@/components/app/PasskeyList'

type LoadingState = 'loading' | 'ready' | 'error'

/* ------------------------------------------------------------------ */
/*  WebAuthn helpers                                                   */
/* ------------------------------------------------------------------ */

function bufferToBase64url(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

function credentialToJSON(credential: PublicKeyCredential): Record<string, unknown> {
  const response = credential.response as AuthenticatorAttestationResponse
  return {
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
}

/* ------------------------------------------------------------------ */
/*  Skeleton card                                                      */
/* ------------------------------------------------------------------ */

function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div className="lumira-card mb-6" style={{ borderRadius: '14px' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="shimmer"
          style={{
            height: '20px',
            borderRadius: '6px',
            marginBottom: i < rows - 1 ? '12px' : 0,
            width: i === 0 ? '40%' : '80%',
          }}
        />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Lock icon (large, for empty state)                                 */
/* ------------------------------------------------------------------ */

function LockIllustration() {
  return (
    <svg width={56} height={56} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke="var(--color-primary)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 11V7a5 5 0 0110 0v4" stroke="var(--color-primary)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="16.5" r="1.5" fill="var(--color-primary)" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function SecuritySettingsPage() {
  const router = useRouter()
  const toast = useToast()

  const [state, setState] = useState<LoadingState>('loading')
  const [passkeys, setPasskeys] = useState<PasskeyFactor[]>([])
  const [enrolling, setEnrolling] = useState(false)
  const [passkeySupported, setPasskeySupported] = useState<boolean | null>(null)

  /* ---------------------------------------------------------------- */
  /*  Check WebAuthn support                                           */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPasskeySupported(!!window.PublicKeyCredential)
    }
  }, [])

  /* ---------------------------------------------------------------- */
  /*  Load passkeys                                                    */
  /* ---------------------------------------------------------------- */

  const loadPasskeys = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/passkey/factors')
      if (!res.ok) throw new Error('Failed to load passkeys')
      const data = await res.json()
      setPasskeys(data.factors ?? [])
      setState('ready')
    } catch {
      setState('error')
    }
  }, [])

  useEffect(() => {
    loadPasskeys()
  }, [loadPasskeys])

  /* ---------------------------------------------------------------- */
  /*  Enroll passkey                                                   */
  /* ---------------------------------------------------------------- */

  async function enrollPasskey() {
    setEnrolling(true)
    try {
      // 1. Get registration options from server
      const optRes = await fetch('/api/auth/passkey/registration-options', { method: 'POST' })
      if (!optRes.ok) throw new Error('server')
      const options = await optRes.json()

      // 2. Call WebAuthn API
      let credential: PublicKeyCredential
      try {
        const cred = await navigator.credentials.create(options)
        if (!cred || cred.type !== 'public-key') throw new Error('no-credential')
        credential = cred as PublicKeyCredential
      } catch (webAuthnErr) {
        const err = webAuthnErr as DOMException
        if (err.name === 'InvalidStateError') {
          toast.error('This device already has passkey sign-in set up.')
        } else if (err.name === 'NotAllowedError') {
          // User cancelled — silent
        } else if (err.name === 'NotSupportedError') {
          toast.error('Your browser doesn\'t support passkeys yet. Try Safari on iPhone.')
        } else {
          toast.error('Couldn\'t save your passkey. Check your connection and try again.')
        }
        setEnrolling(false)
        return
      }

      // 3. Register with server
      const regRes = await fetch('/api/auth/passkey/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentialToJSON(credential)),
      })
      if (!regRes.ok) throw new Error('server')

      // 4. Store passkey id in localStorage for "This device" detection
      const regData = await regRes.json()
      if (regData?.id) {
        try {
          localStorage.setItem('localPasskeyId', regData.id)
        } catch {
          // localStorage may not be available
        }
      }

      // 5. Success
      toast.success('Face ID sign-in is on. Next time, just look at your phone.')
      await loadPasskeys()
    } catch {
      toast.error('Couldn\'t save your passkey. Check your connection and try again.')
    } finally {
      setEnrolling(false)
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Remove passkey handler (called from PasskeyList)                */
  /* ---------------------------------------------------------------- */

  async function handleRemove(factorId: string) {
    const res = await fetch(`/api/auth/passkey/${factorId}`, { method: 'DELETE' })
    if (res.status === 429) {
      throw new Error('rate_limit')
    }
    if (!res.ok) {
      throw new Error('server')
    }
    setPasskeys((prev) => prev.filter((p) => p.id !== factorId))
    toast.success('Passkey removed.')
  }

  /* ---------------------------------------------------------------- */
  /*  Loading state                                                    */
  /* ---------------------------------------------------------------- */

  if (state === 'loading') {
    return (
      <div style={{ minHeight: '100%', background: 'var(--color-surface)', paddingBottom: '32px' }}>
        <div className="content-width mx-auto px-4 pt-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div className="shimmer" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
            <div className="shimmer" style={{ width: '200px', height: '28px', borderRadius: '6px' }} />
          </div>
          <SkeletonCard rows={3} />
          <SkeletonCard rows={2} />
        </div>
      </div>
    )
  }

  /* ---------------------------------------------------------------- */
  /*  Error state                                                      */
  /* ---------------------------------------------------------------- */

  if (state === 'error') {
    return (
      <div style={{ minHeight: '100%', background: 'var(--color-surface)', paddingBottom: '32px' }}>
        <div className="content-width mx-auto px-4 pt-6">
          <button
            onClick={() => router.push('/settings')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0,
              marginBottom: '24px',
            }}
          >
            &larr; Settings
          </button>
          <div className="lumira-card" style={{ borderRadius: '14px', textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ color: 'var(--color-slate)', fontWeight: 600, marginBottom: '8px' }}>
              Hmm, that didn&apos;t work
            </p>
            <p style={{ color: 'var(--color-muted)', fontSize: '14px', marginBottom: '16px' }}>
              We couldn&apos;t load your security settings. Let&apos;s try again.
            </p>
            <button className="btn-primary" style={{ maxWidth: '200px', margin: '0 auto' }} onClick={loadPasskeys}>
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const limitReached = passkeys.length >= 10
  const hasPasskeys = passkeys.length > 0

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div style={{ minHeight: '100%', background: 'var(--color-surface)', paddingBottom: '32px' }}>
      <div className="content-width mx-auto px-4 pt-6">
        {/* Header */}
        <button
          onClick={() => router.push('/settings')}
          style={{
            background: 'none',
            border: 'none',
            color: '#3D8178',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          &larr; Settings
        </button>
        <h1 className="text-h1 mb-6" style={{ color: 'var(--color-slate)' }}>
          Sign-in &amp; Security
        </h1>

        {/* ---- Passkeys section ---- */}
        {!hasPasskeys ? (
          /* Empty state */
          <div
            className="lumira-card"
            style={{
              borderRadius: '14px',
              marginBottom: '24px',
              textAlign: 'center',
              padding: '40px 24px',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '80px',
                height: '80px',
                borderRadius: '24px',
                background: 'var(--color-primary-light)',
                marginBottom: '20px',
              }}
            >
              <LockIllustration />
            </div>
            <p
              style={{
                fontWeight: 700,
                fontSize: '18px',
                color: 'var(--color-slate)',
                marginBottom: '8px',
              }}
            >
              No passkeys yet
            </p>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--color-muted)',
                lineHeight: 1.6,
                marginBottom: '24px',
                maxWidth: '280px',
                margin: '0 auto 24px',
              }}
            >
              Add Face ID sign-in so you never have to wait for a login email again.
            </p>

            {passkeySupported === false ? (
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--color-muted)',
                  lineHeight: 1.5,
                  padding: '12px 16px',
                  background: 'var(--color-surface)',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border)',
                }}
              >
                Passkeys require Safari on iPhone 12+ or Chrome 108+ on Android.
              </p>
            ) : (
              <button
                className="btn-primary"
                onClick={enrollPasskey}
                disabled={enrolling}
                style={{ maxWidth: '240px', margin: '0 auto' }}
              >
                {enrolling ? 'Setting up...' : 'Add Face ID sign-in'}
              </button>
            )}
          </div>
        ) : (
          /* Enrolled state */
          <div className="lumira-card" style={{ borderRadius: '14px', marginBottom: '24px' }}>
            <p
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '4px',
              }}
            >
              Passkeys
            </p>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--color-muted)',
                lineHeight: 1.5,
                marginBottom: '20px',
              }}
            >
              Sign in with Face ID instead of waiting for an email.
            </p>

            <PasskeyList passkeys={passkeys} onRemove={handleRemove} />

            {/* Add another / limit reached */}
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
              {passkeySupported === false ? (
                <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.5 }}>
                  Passkeys require Safari on iPhone 12+ or Chrome 108+ on Android.
                </p>
              ) : limitReached ? (
                <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.5 }}>
                  Remove a passkey below to add another. (Maximum 10 passkeys)
                </p>
              ) : (
                <button
                  onClick={enrollPasskey}
                  disabled={enrolling}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: enrolling ? 'wait' : 'pointer',
                    padding: '8px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    minHeight: '44px',
                  }}
                >
                  {enrolling ? 'Setting up...' : '+ Add another passkey'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Info tip */}
        {passkeys.some((p) => p.backed_up) && (
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              background: 'var(--color-primary-light)',
              border: '1px solid var(--color-primary-mid, rgba(61,129,120,0.2))',
              marginBottom: '24px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: '1px' }}>
              <circle cx="12" cy="12" r="10" stroke="var(--color-primary)" strokeWidth={1.75} />
              <path d="M12 16v-4M12 8h.01" stroke="var(--color-primary)" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p style={{ fontSize: '13px', color: 'var(--color-primary)', lineHeight: 1.5, fontWeight: 500 }}>
              This passkey syncs across all your Apple devices automatically via iCloud Keychain.
            </p>
          </div>
        )}
      </div>

      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
    </div>
  )
}
