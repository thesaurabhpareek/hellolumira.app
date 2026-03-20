// app/login/page.tsx — Magic link auth
'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type AuthState = 'idle' | 'loading' | 'success' | 'error' | 'rate_limited'

const RESEND_COOLDOWN_SECONDS = 60

/** Detect if the Supabase error is a rate-limit error */
function isRateLimitError(msg: string): boolean {
  const lower = msg.toLowerCase()
  return (
    lower.includes('rate') ||
    lower.includes('too many') ||
    lower.includes('limit') ||
    lower.includes('exceeded')
  )
}

/** Parse callback errors from the URL query param */
function callbackErrorMessage(code: string | null): string {
  if (!code) return ''
  if (code === 'callback_failed') return 'Your sign-in link expired or was already used. Enter your email below to get a new one.'
  return 'Something went wrong with your sign-in link. Please request a new one.'
}

function LoginForm() {
  const searchParams = useSearchParams()
  const callbackError = callbackErrorMessage(searchParams.get('error'))

  const [email, setEmail] = useState('')
  const [state, setState] = useState<AuthState>(callbackError ? 'error' : 'idle')
  const [errorMessage, setErrorMessage] = useState(callbackError)
  const [cooldown, setCooldown] = useState(0)
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (cooldown <= 0) {
      if (cooldownRef.current) clearInterval(cooldownRef.current)
      return
    }
    cooldownRef.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current)
    }
  }, [cooldown])

  const startCooldown = () => {
    if (cooldownRef.current) clearInterval(cooldownRef.current)
    setCooldown(RESEND_COOLDOWN_SECONDS)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || cooldown > 0) return

    setState('loading')
    setErrorMessage('')

    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/login/callback`,
        },
      })

      if (error) {
        // Don't retry rate limit errors — it just makes things worse
        if (isRateLimitError(error.message)) {
          setErrorMessage(
            "You've requested several links recently. Please wait a minute before trying again, or check your spam folder \u2014 the link may already be on its way."
          )
          setState('rate_limited')
          startCooldown()
        } else {
          throw error
        }
        return
      }

      setState('success')
      startCooldown()
    } catch (err) {
      // One retry for transient network errors (not rate limits)
      try {
        await new Promise((r) => setTimeout(r, 1200))
        const supabase2 = createClient()
        const { error: err2 } = await supabase2.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: `${window.location.origin}/login/callback`,
          },
        })
        if (err2) throw err2
        setState('success')
        startCooldown()
      } catch {
        const raw = err instanceof Error ? err.message : ''
        if (isRateLimitError(raw)) {
          setErrorMessage(
            "You've requested several links recently. Please wait a minute before trying again, or check your spam folder \u2014 the link may already be on its way."
          )
          setState('rate_limited')
          startCooldown()
        } else {
          setErrorMessage(
            'We couldn\u2019t send your sign-in link. Please check your connection and try again.'
          )
          setState('error')
        }
      }
    }
  }

  const handleTryAgain = () => {
    setErrorMessage('')
    setState('idle')
  }

  const handleResend = () => {
    setCooldown(0)
    setErrorMessage('')
    setState('idle')
  }

  const isSubmitDisabled =
    state === 'loading' ||
    cooldown > 0 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())

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
                marginBottom: '16px',
              }}
            >
              <span aria-hidden="true" style={{ fontSize: '24px', lineHeight: 1 }}>✓</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, color: 'var(--color-green)', marginBottom: 4 }}>
                  Check your inbox
                </p>
                <p style={{ color: 'var(--color-slate)', fontSize: '14px', marginBottom: 12 }}>
                  We sent a sign-in link to <strong>{email}</strong>. It expires in 24 hours — also check your spam folder.
                </p>
                {cooldown > 0 ? (
                  <p style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                    Didn&apos;t get it? You can resend in {cooldown}s.
                  </p>
                ) : (
                  <button
                    onClick={handleResend}
                    style={{
                      fontSize: '13px',
                      color: 'var(--color-primary)',
                      fontWeight: 600,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '8px 0',
                      minHeight: '44px',
                      textDecoration: 'underline',
                    }}
                  >
                    Didn&apos;t get it? Resend link
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Rate limited state */}
          {state === 'rate_limited' && (
            <div
              role="alert"
              className="animate-fade-in"
              style={{
                background: '#FFFBEB',
                border: '1px solid #FCD34D',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <p style={{ fontSize: '14px', color: '#92400E', marginBottom: 8 }}>
                {errorMessage}
              </p>
              {cooldown > 0 && (
                <p style={{ fontSize: '13px', color: '#B45309', fontWeight: 600 }}>
                  Try again in {cooldown}s
                </p>
              )}
              {cooldown === 0 && (
                <button
                  onClick={handleTryAgain}
                  style={{
                    color: '#92400E',
                    fontWeight: 600,
                    fontSize: '14px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px 0',
                    minHeight: '44px',
                    textDecoration: 'underline',
                  }}
                >
                  Try again
                </button>
              )}
            </div>
          )}

          {/* Generic error state */}
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
                onClick={handleTryAgain}
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

          {/* Form — shown in idle/loading/error states (not when rate limited and on cooldown) */}
          {state !== 'success' && !(state === 'rate_limited' && cooldown > 0) && (
            <form id="login-form" onSubmit={handleSubmit}>
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
                disabled={isSubmitDisabled}
                className="btn-primary"
                style={{
                  opacity: isSubmitDisabled ? 0.6 : 1,
                  cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
                }}
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
                      style={{ animation: 'spin 0.8s linear infinite' }}
                    >
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Sending...
                  </span>
                ) : cooldown > 0 ? (
                  `Resend in ${cooldown}s`
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

export default function AuthPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
