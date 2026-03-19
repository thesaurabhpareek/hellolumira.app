// app/invite/[token]/PartnerInviteClient.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  babyName: string
  token: string
  babyId: string
}

export default function PartnerInviteClient({ babyName, token, babyId }: Props) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // babyId stored for potential future use after auth callback
  void babyId
  void token

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setState('loading')
    const supabase = createClient()

    const attempt = async () => {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/home`,
        },
      })
      if (error) throw error
    }

    try {
      await attempt()
      setState('success')
    } catch {
      try {
        await new Promise((r) => setTimeout(r, 1000))
        await attempt()
        setState('success')
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : 'Something went wrong. Please try again.'
        )
        setState('error')
      }
    }
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--color-surface)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div className="content-width w-full">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: 'var(--color-primary)',
            }}
          >
            Lumira
          </span>
        </div>

        <div className="lumira-card">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '48px' }}>💌</span>
          </div>
          <h1 className="text-h1 text-center mb-2" style={{ color: 'var(--color-slate)' }}>
            Join {babyName}&apos;s journey
          </h1>
          <p className="text-body-muted text-center mb-6">
            You&apos;ve been invited to Lumira. Sign in to get started with check-ins, guides, and more.
          </p>

          {state === 'success' && (
            <div
              style={{
                background: 'var(--color-green-light)',
                border: '1px solid #9AE6B4',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '24px' }}>✓</span>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--color-green)', marginBottom: 4 }}>
                  Check your inbox
                </p>
                <p style={{ fontSize: '14px', color: 'var(--color-slate)' }}>
                  We&apos;ve sent a magic link to <strong>{email}</strong>
                </p>
              </div>
            </div>
          )}

          {state === 'error' && (
            <div
              style={{
                background: 'var(--color-red-light)',
                border: '1px solid #FEB2B2',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <p style={{ color: 'var(--color-red)', fontSize: '14px' }}>
                {errorMessage}
              </p>
            </div>
          )}

          {state !== 'success' && (
            <form onSubmit={handleSignIn}>
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--color-slate)',
                    marginBottom: '8px',
                  }}
                >
                  Your email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={state === 'loading'}
                  autoComplete="email"
                  required
                  style={{
                    width: '100%',
                    height: '52px',
                    padding: '0 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--color-border)',
                    fontSize: '16px',
                    color: 'var(--color-slate)',
                    background: 'var(--color-white)',
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={state === 'loading' || !email.trim()}
                className="btn-primary"
              >
                {state === 'loading' ? 'Sending...' : 'Sign in with magic link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
