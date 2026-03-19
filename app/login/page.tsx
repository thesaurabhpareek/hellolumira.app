// app/login/page.tsx — Magic link auth
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type AuthState = 'idle' | 'loading' | 'success' | 'error'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<AuthState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setState('loading')
    setErrorMessage('')

    const supabase = createClient()

    const attempt = async (): Promise<boolean> => {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/login/callback`,
        },
      })
      if (error) throw error
      return true
    }

    try {
      await attempt()
      setState('success')
    } catch {
      // Auto-retry once
      try {
        await new Promise((r) => setTimeout(r, 1000))
        await attempt()
        setState('success')
      } catch (err2) {
        setErrorMessage(
          err2 instanceof Error ? err2.message : 'We couldn\u2019t send your sign-in link. Please check your connection and try again.'
        )
        setState('error')
      }
    }
  }

  return (
    <div
      className="flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--color-surface)', minHeight: '100dvh' }}
    >
      <main className="content-width w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <span
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: 'var(--color-primary)',
              letterSpacing: '-0.5px',
            }}
          >
            Lumira
          </span>
        </div>

        {/* Card */}
        <div className="lumira-card">
          <h1
            className="text-h1 mb-2"
            style={{ color: 'var(--color-slate)' }}
          >
            Let&apos;s get you started
          </h1>
          <p className="text-body-muted mb-6">
            Enter your email and we&apos;ll send a magic link — no password needed.
          </p>

          {/* Success state */}
          {state === 'success' && (
            <div
              role="status"
              aria-live="polite"
              className="animate-fade-in"
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
              <span aria-hidden="true" style={{ fontSize: '24px', lineHeight: 1 }}>✓</span>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--color-green)', marginBottom: 4 }}>
                  Check your inbox
                </p>
                <p style={{ color: 'var(--color-slate)', fontSize: '14px' }}>
                  We sent a sign-in link to <strong>{email}</strong> — it expires in 24 hours.
                </p>
              </div>
            </div>
          )}

          {/* Error state */}
          {state === 'error' && (
            <div
              role="alert"
              className="animate-fade-in"
              style={{
                background: 'var(--color-red-light)',
                border: '1px solid #FEB2B2',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <p style={{ color: 'var(--color-red)', fontSize: '14px', marginBottom: 8 }}>
                {errorMessage}
              </p>
              <button
                onClick={() => setState('idle')}
                style={{
                  color: 'var(--color-red)',
                  fontWeight: 600,
                  fontSize: '14px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '12px 0',
                  minHeight: '48px',
                  textDecoration: 'underline',
                  touchAction: 'manipulation',
                }}
              >
                Try again
              </button>
            </div>
          )}

          {/* Form */}
          {state !== 'success' && (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--color-slate)',
                    marginBottom: '8px',
                  }}
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={state === 'loading'}
                  autoComplete="email"
                  enterKeyHint="send"
                  autoFocus
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
                    transition: 'border-color 0.15s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={state === 'loading' || !email.trim()}
                className="btn-primary"
              >
                {state === 'loading' ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      style={{
                        animation: 'spin 0.8s linear infinite',
                      }}
                    >
                      {/* spin keyframe defined in globals.css */}
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send magic link'
                )}
              </button>
            </form>
          )}
        </div>

        <p
          className="text-center mt-6"
          style={{ fontSize: '13px', color: 'var(--color-slate)' }}
        >
          By continuing, you agree to our{' '}
          <a href="/legal/terms" style={{ color: '#2C6058', textDecoration: 'underline' }}>Terms of Service</a>
          {' '}and{' '}
          <a href="/legal/privacy" style={{ color: '#2C6058', textDecoration: 'underline' }}>Privacy Policy</a>.
        </p>
      </main>
    </div>
  )
}
