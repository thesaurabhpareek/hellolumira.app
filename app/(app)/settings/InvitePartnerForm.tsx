// app/(app)/settings/InvitePartnerForm.tsx — Partner invite form with email send
'use client'

import { useState } from 'react'

interface InvitePartnerFormProps {
  babyId: string
}

export default function InvitePartnerForm({ babyId }: InvitePartnerFormProps) {
  const [mode, setMode] = useState<'choice' | 'form' | 'link'>('choice')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{
    type: 'success' | 'error'
    message: string
    inviteUrl?: string
  } | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsSubmitting(true)
    setResult(null)

    try {
      const res = await fetch('/api/invite-partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baby_id: babyId,
          email: email.trim(),
          first_name: firstName.trim() || undefined,
          last_name: lastName.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setResult({
          type: 'success',
          message: `Invite sent to ${email.trim()}! They'll receive an email with a link to join.`,
          inviteUrl: data.invite_url,
        })
        // Award seeds
        fetch('/api/seeds/award', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: 'invite_partner' }),
        }).catch(() => {})
      } else {
        setResult({
          type: 'error',
          message: data.error || 'Hmm, that didn\'t work. Please try again.',
        })
      }
    } catch {
      setResult({
        type: 'error',
        message: 'Looks like you might be offline. Check your connection and try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyInviteUrl = async () => {
    if (result?.inviteUrl) {
      try {
        await navigator.clipboard.writeText(result.inviteUrl)
        showToast('Invite link copied!')
      } catch {
        showToast('Could not copy link')
      }
    }
  }

  // Show choice buttons initially
  if (mode === 'choice') {
    return (
      <div>
        <p style={{ fontSize: '14px', color: 'var(--color-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
          Parenting is better together. Invite your partner so you can both track and share updates.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => setMode('form')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary)',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              minHeight: '48px',
              transition: 'opacity 0.15s ease',
            }}
          >
            Send an email invite
          </button>
          <button
            onClick={() => setMode('link')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-white)',
              color: 'var(--color-slate)',
              fontSize: '14px',
              fontWeight: 600,
              border: '1.5px solid var(--color-border)',
              cursor: 'pointer',
              minHeight: '48px',
              transition: 'opacity 0.15s ease',
            }}
          >
            Or share a link instead
          </button>
        </div>
      </div>
    )
  }

  // Share link mode
  if (mode === 'link') {
    return (
      <div>
        <p style={{ fontSize: '14px', color: 'var(--color-muted)', marginBottom: '12px', lineHeight: 1.5 }}>
          Share this link with your partner so they can join Lumira and connect with your account.
        </p>
        <a
          href="/share"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-primary)',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
            minHeight: '48px',
            marginBottom: '12px',
          }}
        >
          Go to Share page
        </a>
        <button
          onClick={() => setMode('choice')}
          style={{
            display: 'block',
            fontSize: '13px',
            color: 'var(--color-primary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            padding: '8px 0',
          }}
        >
          &larr; Back to options
        </button>
      </div>
    )
  }

  // Email invite form
  return (
    <div>
      <button
        onClick={() => setMode('choice')}
        style={{
          fontSize: '13px',
          color: 'var(--color-primary)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 600,
          padding: '0 0 12px',
        }}
      >
        &larr; Back to options
      </button>

      {result ? (
        <div>
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background:
                result.type === 'success'
                  ? 'var(--color-green-light)'
                  : 'var(--color-red-light)',
              marginBottom: '16px',
            }}
          >
            <p
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color:
                  result.type === 'success'
                    ? 'var(--color-green)'
                    : 'var(--color-red)',
                lineHeight: 1.5,
              }}
            >
              {result.message}
            </p>
          </div>
          {result.inviteUrl && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '6px' }}>
                You can also share this link directly:
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <p
                  style={{
                    flex: 1,
                    fontSize: '13px',
                    color: 'var(--color-slate)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {result.inviteUrl}
                </p>
                <button
                  onClick={copyInviteUrl}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '100px',
                    border: 'none',
                    background: 'var(--color-primary)',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <p style={{ fontSize: '14px', color: 'var(--color-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
            We&apos;ll send them a warm invite email with a link to join.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--color-muted)',
                    marginBottom: '4px',
                  }}
                >
                  First name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Their first name"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--color-border)',
                    background: 'var(--color-white)',
                    fontSize: '14px',
                    color: 'var(--color-slate)',
                    outline: 'none',
                    minHeight: '48px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--color-muted)',
                    marginBottom: '4px',
                  }}
                >
                  Last name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Their last name"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--color-border)',
                    background: 'var(--color-white)',
                    fontSize: '14px',
                    color: 'var(--color-slate)',
                    outline: 'none',
                    minHeight: '48px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--color-muted)',
                  marginBottom: '4px',
                }}
              >
                Email address <span style={{ color: 'var(--color-red)' }}>*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="partner@email.com"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  background: 'var(--color-white)',
                  fontSize: '14px',
                  color: 'var(--color-slate)',
                  outline: 'none',
                  minHeight: '48px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              style={{
                padding: '14px 24px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background:
                  isSubmitting || !email.trim()
                    ? '#E5E7EB'
                    : 'var(--color-primary)',
                color:
                  isSubmitting || !email.trim()
                    ? '#9CA3AF'
                    : '#FFFFFF',
                fontSize: '15px',
                fontWeight: 600,
                cursor:
                  isSubmitting || !email.trim() ? 'default' : 'pointer',
                minHeight: '52px',
                transition: 'all 0.15s ease',
                marginTop: '4px',
              }}
            >
              {isSubmitting ? 'Sending invite...' : 'Send invite'}
            </button>
          </div>
        </form>
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--color-slate)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '100px',
            fontSize: '14px',
            fontWeight: 500,
            zIndex: 100,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}
