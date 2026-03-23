'use client'

// app/(app)/profile/DeleteAccountLink.tsx — GDPR Article 17 account deletion
// Two-step flow: trigger button → confirmation modal → POST /api/account/delete → redirect to /

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteAccountLink() {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function openModal() {
    setError(null)
    setModalOpen(true)
  }

  function closeModal() {
    if (loading) return // prevent dismiss while in-flight
    setModalOpen(false)
    setError(null)
  }

  async function handleConfirm() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError((body as { message?: string }).message || 'Deletion failed. Please try again.')
        setLoading(false)
        return
      }
      // Success — redirect to landing page (session is now invalidated)
      router.push('/')
    } catch {
      setError('Network error. Please check your connection and try again.')
      setLoading(false)
    }
  }

  return (
    <>
      {/* Trigger */}
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <button
          onClick={openModal}
          style={{
            background: 'none',
            border: 'none',
            color: '#E53E3E',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            padding: '12px',
            minHeight: '48px',
            textDecoration: 'underline',
          }}
        >
          Delete my account
        </button>
      </div>

      {/* Confirmation modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: 'rgba(0, 0, 0, 0.55)',
          }}
          onClick={(e) => {
            // Close on backdrop click
            if (e.target === e.currentTarget) closeModal()
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '28px 24px 24px',
              maxWidth: '360px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            }}
          >
            <h2
              id="delete-modal-title"
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#1A202C',
                marginBottom: '12px',
              }}
            >
              Delete your account?
            </h2>

            <p
              style={{
                fontSize: '14px',
                color: '#4A5568',
                lineHeight: 1.6,
                marginBottom: '20px',
              }}
            >
              This will permanently delete your account, all your check-ins, chat history,
              and baby profiles. <strong>This cannot be undone.</strong>
            </p>

            {error && (
              <p
                role="alert"
                style={{
                  fontSize: '13px',
                  color: '#C53030',
                  background: '#FFF5F5',
                  border: '1px solid #FED7D7',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  marginBottom: '16px',
                  lineHeight: 1.5,
                }}
              >
                {error}
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={closeModal}
                disabled={loading}
                style={{
                  flex: 1,
                  height: '48px',
                  borderRadius: '12px',
                  border: '1.5px solid #E2E8F0',
                  background: '#fff',
                  color: '#4A5568',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                  transition: 'opacity 0.15s ease',
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleConfirm}
                disabled={loading}
                style={{
                  flex: 1,
                  height: '48px',
                  borderRadius: '12px',
                  border: 'none',
                  background: loading ? '#FC8181' : '#E53E3E',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255,255,255,0.4)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'spin 0.7s linear infinite',
                      }}
                    />
                    Deleting...
                  </>
                ) : (
                  'Yes, delete my account'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spinner keyframe — injected once into the document head */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
