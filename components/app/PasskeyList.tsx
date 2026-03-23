'use client'

import React, { useState, useEffect } from 'react'
import type { PasskeyFactor } from '@/app/(app)/settings/security/page'

/* ------------------------------------------------------------------ */
/*  Device icon helpers                                                */
/* ------------------------------------------------------------------ */

function iPhoneIcon({ color = 'var(--color-primary)' }: { color?: string }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="2" width="14" height="20" rx="3" stroke={color} strokeWidth={1.75} />
      <path d="M12 18h.01" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </svg>
  )
}

function LaptopIcon({ color = 'var(--color-primary)' }: { color?: string }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="20" height="14" rx="2" stroke={color} strokeWidth={1.75} />
      <path d="M1 22h22" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
    </svg>
  )
}

function AndroidIcon({ color = 'var(--color-primary)' }: { color?: string }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="4" width="14" height="18" rx="3" stroke={color} strokeWidth={1.75} />
      <path d="M9 2l1.5 2M15 2l-1.5 2M12 17.5h.01" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
    </svg>
  )
}

function ShieldDeviceIcon({ color = 'var(--color-primary)' }: { color?: string }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DeviceIcon({ name }: { name: string | null }) {
  const lower = (name ?? '').toLowerCase()
  if (lower.includes('iphone')) return iPhoneIcon({})
  if (lower.includes('mac') || lower.includes('macbook') || lower.includes('laptop') || lower.includes('windows') || lower.includes('chrome')) return LaptopIcon({})
  if (lower.includes('android') || lower.includes('pixel') || lower.includes('samsung') || lower.includes('galaxy')) return AndroidIcon({})
  return ShieldDeviceIcon({})
}

/* ------------------------------------------------------------------ */
/*  Date helpers                                                       */
/* ------------------------------------------------------------------ */

function formatRelativeDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Never used'
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Last used today'
  if (diffDays === 1) return 'Last used yesterday'
  if (diffDays < 7) return `Last used ${diffDays} days ago`
  if (diffDays < 30) return `Last used ${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `Last used ${Math.floor(diffDays / 30)} months ago`
  return `Last used ${Math.floor(diffDays / 365)} years ago`
}

function formatAddedDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getDeviceDisplayName(passkey: PasskeyFactor): string {
  if (passkey.friendly_name && passkey.friendly_name.trim()) {
    return passkey.friendly_name
  }
  return 'Passkey'
}

/* ------------------------------------------------------------------ */
/*  Confirmation modal                                                 */
/* ------------------------------------------------------------------ */

interface RemoveModalProps {
  passkey: PasskeyFactor
  onConfirm: () => Promise<void>
  onCancel: () => void
}

function RemoveModal({ passkey, onConfirm, onCancel }: RemoveModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const displayName = getDeviceDisplayName(passkey)

  async function handleConfirm() {
    setSubmitting(true)
    setErrorMsg(null)
    try {
      await onConfirm()
    } catch (err) {
      const e = err as Error
      if (e.message === 'rate_limit') {
        setErrorMsg('Too many passkeys removed recently. Please wait 24 hours.')
      } else {
        setErrorMsg('Couldn\'t remove passkey. Please try again.')
      }
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
      onClick={() => { if (!submitting) onCancel() }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-white)',
          borderRadius: '16px',
          padding: '28px 24px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--color-slate)',
            marginBottom: '12px',
          }}
        >
          Remove this passkey?
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: passkey.backed_up ? '8px' : '20px' }}>
          You&apos;ll still be able to sign in with your email. You can add a new passkey anytime.
        </p>
        {passkey.backed_up && (
          <p style={{ fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: '20px', fontStyle: 'italic' }}>
            This will remove passkey sign-in from all your Apple devices.
          </p>
        )}
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '20px' }}>
          Removing: <span style={{ color: 'var(--color-slate)' }}>{displayName}</span>
        </p>

        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'var(--color-red-light, #FFF5F5)',
              border: '1px solid var(--color-red, #E53E3E)',
              marginBottom: '16px',
            }}
          >
            <p style={{ fontSize: '13px', color: 'var(--color-red)', fontWeight: 500 }}>{errorMsg}</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn-ghost"
            onClick={onCancel}
            disabled={submitting}
            style={{ flex: 1 }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            style={{
              flex: 1,
              height: '52px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: submitting ? '#E2E8F0' : 'var(--color-red)',
              color: submitting ? 'var(--color-muted)' : 'white',
              fontSize: '15px',
              fontWeight: 600,
              cursor: submitting ? 'wait' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {submitting ? 'Removing...' : 'Remove passkey'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Passkey row                                                        */
/* ------------------------------------------------------------------ */

interface PasskeyFactor {
  id: string
  friendly_name: string | null
  factor_type: string
  status: string
  created_at: string
  updated_at: string
  backed_up?: boolean
  last_used_at?: string | null
}

interface PasskeyRowProps {
  passkey: PasskeyFactor
  isCurrentDevice: boolean
  onRemoveClick: () => void
  removing: boolean
}

function PasskeyRow({ passkey, isCurrentDevice, onRemoveClick, removing }: PasskeyRowProps) {
  const displayName = getDeviceDisplayName(passkey)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '14px 0',
        opacity: removing ? 0 : 1,
        transform: removing ? 'scale(0.97)' : 'scale(1)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        overflow: 'hidden',
        maxHeight: removing ? '0px' : '200px',
      }}
    >
      {/* Device icon */}
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'var(--color-primary-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <DeviceIcon name={passkey.friendly_name} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
          <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-slate)' }}>
            {displayName}
          </p>
          {isCurrentDevice && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '100px',
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                letterSpacing: '0.3px',
              }}
            >
              This device
            </span>
          )}
          {passkey.backed_up && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '100px',
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                letterSpacing: '0.3px',
              }}
            >
              iCloud Keychain
            </span>
          )}
        </div>
        <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '2px' }}>
          {formatRelativeDate(passkey.last_used_at)}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
          Added {formatAddedDate(passkey.created_at)}
        </p>
      </div>

      {/* Remove button */}
      <button
        onClick={onRemoveClick}
        disabled={removing}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(229, 62, 62, 0.8)',
          fontSize: '14px',
          fontWeight: 600,
          cursor: removing ? 'wait' : 'pointer',
          padding: '8px 0 8px 8px',
          flexShrink: 0,
          minHeight: '44px',
          minWidth: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          transition: 'color 0.15s ease',
        }}
        aria-label={`Remove passkey: ${displayName}`}
      >
        Remove
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  PasskeyList                                                        */
/* ------------------------------------------------------------------ */

interface PasskeyListProps {
  passkeys: PasskeyFactor[]
  onRemove: (factorId: string) => Promise<void>
}

export default function PasskeyList({ passkeys, onRemove }: PasskeyListProps) {
  const [localPasskeyId, setLocalPasskeyId] = useState<string | null>(null)
  const [confirmingRemove, setConfirmingRemove] = useState<string | null>(null)
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      setLocalPasskeyId(localStorage.getItem('localPasskeyId'))
    } catch {
      // localStorage unavailable
    }
  }, [])

  async function handleConfirmRemove(factorId: string) {
    setRemovingIds((prev) => new Set(prev).add(factorId))
    setConfirmingRemove(null)
    try {
      await onRemove(factorId)
    } catch (err) {
      // Re-animate back in on error
      setRemovingIds((prev) => {
        const next = new Set(prev)
        next.delete(factorId)
        return next
      })
      throw err
    }
  }

  if (passkeys.length === 0) return null

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {passkeys.map((passkey, idx) => (
          <React.Fragment key={passkey.id}>
            {idx > 0 && (
              <div style={{ height: '1px', background: 'var(--color-border)', margin: '0' }} />
            )}
            <PasskeyRow
              passkey={passkey}
              isCurrentDevice={localPasskeyId === passkey.id}
              onRemoveClick={() => setConfirmingRemove(passkey.id)}
              removing={removingIds.has(passkey.id)}
            />
          </React.Fragment>
        ))}
      </div>

      {confirmingRemove && (
        <RemoveModal
          passkey={passkeys.find((p) => p.id === confirmingRemove)!}
          onConfirm={() => handleConfirmRemove(confirmingRemove)}
          onCancel={() => setConfirmingRemove(null)}
        />
      )}
    </>
  )
}
