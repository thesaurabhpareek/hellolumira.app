'use client'

import { useState, useEffect } from 'react'

export interface PasskeyFactor {
  id: string
  device_hint: string
  device_type: string
  backed_up: boolean
  created_at: string
  last_used_at: string | null
  status: string
}

interface PasskeyListProps {
  passkeys: PasskeyFactor[]
  onRemove: (id: string) => void
  isRemoving: string | null
}

function formatLastUsed(lastUsedAt: string | null): string {
  if (!lastUsedAt) return 'Never used'
  const lastUsed = new Date(lastUsedAt)
  const now = new Date()
  const msPerDay = 24 * 60 * 60 * 1000
  const diffDays = Math.floor((now.getTime() - lastUsed.getTime()) / msPerDay)
  if (diffDays === 0) return 'Last used today'
  if (diffDays === 1) return 'Last used yesterday'
  return `Last used ${diffDays} days ago`
}

function formatCreatedDate(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function PasskeyList({ passkeys, onRemove, isRemoving }: PasskeyListProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [currentDevicePasskeyId, setCurrentDevicePasskeyId] = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lumira_passkey_id')
      setCurrentDevicePasskeyId(stored)
    } catch {
      // localStorage unavailable
    }
  }, [])

  const confirmPasskey = passkeys.find((p) => p.id === confirmId) ?? null

  const handleRemoveClick = (id: string) => {
    setConfirmId(id)
  }

  const handleConfirm = () => {
    if (confirmId) {
      onRemove(confirmId)
      setConfirmId(null)
    }
  }

  const handleCancel = () => {
    setConfirmId(null)
  }

  if (passkeys.length === 0) {
    return (
      <p
        style={{
          fontSize: '14px',
          color: 'var(--color-muted)',
          padding: '16px 0',
          lineHeight: 1.5,
        }}
      >
        No passkeys set up yet.
      </p>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {passkeys.map((pk) => {
          const isThisDevice = currentDevicePasskeyId === pk.id
          const removing = isRemoving === pk.id

          const deviceName = pk.device_hint || 'Unknown device'

          return (
            <div
              key={pk.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '14px 0',
                borderBottom: '1px solid var(--color-border)',
                gap: '12px',
              }}
            >
              {/* Left: icon + info */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: 0 }}>
                {/* Key icon */}
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'var(--color-primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="8" cy="12" r="4" stroke="var(--color-primary)" strokeWidth="2"/>
                    <path d="M12 12h9M17 10v4" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>

                {/* Text info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Device name + badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: '15px',
                        color: 'var(--color-slate)',
                      }}
                    >
                      {deviceName}
                    </span>

                    {isThisDevice && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '2px 8px',
                          borderRadius: '100px',
                          background: 'var(--color-primary-light)',
                          color: 'var(--color-primary)',
                          fontSize: '11px',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        This device
                      </span>
                    )}

                    {pk.backed_up && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '2px 8px',
                          borderRadius: '100px',
                          background: '#EFF6FF',
                          color: '#2563EB',
                          fontSize: '11px',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        iCloud Keychain
                      </span>
                    )}
                  </div>

                  {/* Last used */}
                  <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '2px' }}>
                    {formatLastUsed(pk.last_used_at)}
                  </p>

                  {/* Created date */}
                  <p style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                    Added {formatCreatedDate(pk.created_at)}
                  </p>
                </div>
              </div>

              {/* Remove button */}
              <button
                onClick={() => handleRemoveClick(pk.id)}
                disabled={removing}
                aria-label={`Remove passkey for ${deviceName}`}
                style={{
                  flexShrink: 0,
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: 'none',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-red, #E53E3E)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: removing ? 'not-allowed' : 'pointer',
                  opacity: removing ? 0.5 : 1,
                  fontFamily: 'inherit',
                  transition: 'opacity 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {removing ? 'Removing…' : 'Remove'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Confirmation modal */}
      {confirmId && confirmPasskey && (
        <>
          {/* Backdrop */}
          <div
            onClick={handleCancel}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 300,
            }}
            aria-hidden="true"
          />

          {/* Modal */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Remove passkey confirmation"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 301,
              background: 'var(--color-card, #fff)',
              borderRadius: '16px',
              padding: '24px',
              width: 'min(340px, calc(100vw - 32px))',
              boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
            }}
          >
            {/* Title */}
            <h2
              style={{
                fontSize: '17px',
                fontWeight: 700,
                color: 'var(--color-slate)',
                marginBottom: '10px',
                lineHeight: 1.3,
              }}
            >
              Remove this passkey?
            </h2>

            {/* Device name */}
            <p
              style={{
                fontSize: '14px',
                color: 'var(--color-muted)',
                marginBottom: '12px',
                lineHeight: 1.5,
              }}
            >
              This will remove <strong style={{ color: 'var(--color-slate)' }}>{confirmPasskey.device_hint || 'Unknown device'}</strong> from your account.
            </p>

            {/* iCloud warning */}
            {confirmPasskey.backed_up && (
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--color-muted)',
                  marginBottom: '12px',
                  lineHeight: 1.5,
                  padding: '10px 12px',
                  background: '#EFF6FF',
                  borderRadius: '8px',
                  border: '1px solid #BFDBFE',
                }}
              >
                This passkey is stored in iCloud Keychain. Removing it here will not delete it from your iCloud account.
              </p>
            )}

            <p
              style={{
                fontSize: '13px',
                color: 'var(--color-muted)',
                marginBottom: '20px',
                lineHeight: 1.5,
              }}
            >
              You can always add a new passkey from this screen.
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleCancel}
                style={{
                  flex: 1,
                  height: '44px',
                  borderRadius: '10px',
                  background: 'var(--color-surface, #F8F8F8)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-slate)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                style={{
                  flex: 1,
                  height: '44px',
                  borderRadius: '10px',
                  background: 'var(--color-red, #E53E3E)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Remove passkey
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
