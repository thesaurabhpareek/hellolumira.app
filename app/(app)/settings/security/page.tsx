'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import PasskeyList, { type PasskeyFactor } from '@/components/app/PasskeyList'
import PasskeyEnrollmentSheet from '@/components/app/PasskeyEnrollmentSheet'
import { ArrowLeftIcon } from '@/components/icons'

export default function SecuritySettingsPage() {
  const [passkeys, setPasskeys] = useState<PasskeyFactor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isRemoving, setIsRemoving] = useState<string | null>(null)
  const [removeError, setRemoveError] = useState('')
  const [showEnrollSheet, setShowEnrollSheet] = useState(false)

  const loadPasskeys = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch('/api/auth/passkey/factors')
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Failed to load passkeys.')
        return
      }
      const data = await res.json()
      setPasskeys(data.passkeys ?? [])
    } catch {
      setError('Failed to load passkeys.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPasskeys()
  }, [loadPasskeys])

  const handleRemove = async (id: string) => {
    setIsRemoving(id)
    setRemoveError('')
    try {
      const res = await fetch(`/api/auth/passkey/${id}`, { method: 'DELETE' })
      if (res.status === 401) {
        setRemoveError('Your session has expired. Please refresh the page and try again.')
        return
      }
      if (res.status === 429) {
        setRemoveError('Too many passkeys removed recently. Wait 24 hours or contact support.')
        return
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setRemoveError(data.error ?? 'Failed to remove passkey.')
        return
      }
      setPasskeys((prev) => prev.filter((p) => p.id !== id))
    } catch {
      setRemoveError('Failed to remove passkey.')
    } finally {
      setIsRemoving(null)
    }
  }

  return (
    <div
      style={{
        minHeight: '100%',
        background: 'var(--color-surface)',
        paddingBottom: '48px',
      }}
    >
      <div className="content-width mx-auto px-4 pt-6">
        {/* Back */}
        <Link
          href="/settings"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: '#3D8178',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
            padding: '16px 0',
          }}
        >
          <ArrowLeftIcon size={16} color="#3D8178" /> Back
        </Link>

        <h1 className="text-h1 mb-2" style={{ color: 'var(--color-slate)' }}>
          Sign-in &amp; Security
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
          Manage your Face ID passkeys and sign-in methods.
        </p>

        {/* Passkeys card */}
        <div className="lumira-card mb-4">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Passkeys (Face ID)
              </p>
            </div>
            <button
              onClick={() => setShowEnrollSheet(true)}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                background: 'var(--color-primary)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}
            >
              Add passkey
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <p style={{ fontSize: '14px', color: 'var(--color-muted)', padding: '8px 0' }}>
              Loading…
            </p>
          )}

          {/* Fetch error */}
          {!loading && error && (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <p style={{ color: 'var(--color-muted)', fontSize: '14px', marginBottom: '16px' }}>
                Couldn&apos;t load your passkeys. Check your connection and try again.
              </p>
              <button
                onClick={loadPasskeys}
                style={{
                  background: 'var(--color-primary)',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Try again
              </button>
            </div>
          )}

          {/* Remove error */}
          {removeError && (
            <div
              role="alert"
              style={{
                background: 'var(--color-red-light)',
                border: '1px solid #FEB2B2',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '12px',
                fontSize: '14px',
                color: 'var(--color-red)',
              }}
            >
              {removeError}
            </div>
          )}

          {/* Passkey list */}
          {!loading && !error && (
            <PasskeyList
              passkeys={passkeys}
              onRemove={handleRemove}
              isRemoving={isRemoving}
            />
          )}
        </div>

        {/* Info blurb */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: '12px',
            background: 'var(--color-primary-light)',
            marginBottom: '24px',
          }}
        >
          <p style={{ fontSize: '13px', color: 'var(--color-primary)', lineHeight: 1.6 }}>
            <strong>What is a passkey?</strong> A passkey lets you sign in with Face ID instead of waiting for a magic link email. Your biometric data never leaves your device.
          </p>
        </div>
      </div>

      {/* Enrollment sheet */}
      <PasskeyEnrollmentSheet
        isOpen={showEnrollSheet}
        onClose={() => setShowEnrollSheet(false)}
        onEnrolled={() => {
          setShowEnrollSheet(false)
          loadPasskeys()
        }}
      />
    </div>
  )
}
