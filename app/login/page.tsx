// app/login/page.tsx — Magic link auth
'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isPasskeySupported, isConditionalMediationAvailable, signInWithPasskey } from '@/lib/webauthn-client'
import { getPlatformInfo } from '@/lib/platform-detect'

type AuthState = 'idle' | 'loading' | 'success' | 'success_existing' | 'error' | 'rate_limited'
type GoogleState = 'idle' | 'loading'

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
  const router = useRouter()
  const callbackError = callbackErrorMessage(searchParams.get('error'))
  const isSignup = searchParams.get('mode') === 'signup'

  const [email, setEmail] = useState('')
  const [state, setState] = useState<AuthState>(callbackError ? 'error' : 'idle')
  const [errorMessage, setErrorMessage] = useState(callbackError)
  const [cooldown, setCooldown] = useState(0)
  const [googleState, setGoogleState] = useState<GoogleState>('idle')
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Passkey state
  const [passkeyEnrolled, setPasskeyEnrolled] = useState(false)
  const [passkeyLoading, setPasskeyLoading] = useState(false)
  const [conditionalMediationReady, setConditionalMediationReady] = useState(false)
  const platformInfo = typeof window !== 'undefined' ? getPlatformInfo() : null

  // On mount: check if passkey is enrolled and if conditional mediation is available
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      setPasskeyEnrolled(
        isPasskeySupported() && localStorage.getItem('lumira_passkey_enrolled') === '1'
      )
    } catch {}

    isConditionalMediationAvailable().then((available) => {
      setConditionalMediationReady(available)
    })
  }, [])

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

  const handlePasskeySignIn = async () => {
    setPasskeyLoading(true)
    setErrorMessage('')

    const result = await signInWithPasskey(email || undefined)
    setPasskeyLoading(false)

    if (!result.success) {
      if (result.cancelled) {
        // User dismissed biometric prompt — do nothing
        return
      }
      setErrorMessage(result.error)
      setState('error')
      return
    }

    // Verify OTP using the token hash returned from the passkey API
    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({
      token_hash: result.tokenHash,
      type: 'magiclink',
    })
    if (error) {
      setErrorMessage('Sign-in failed. Please try a magic link.')
      setState('error')
      return
    }

    router.push('/home')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || cooldown > 0) return

    setState('loading')
    setErrorMessage('')

    const supabase = createClient()

    // Always check if account exists — helps personalize messaging
    let accountExists = false
    try {
      const res = await fetch('/api/auth/check-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (res.ok) {
        const json = await res.json()
        accountExists = json.exists === true
      }
    } catch {
      // Fail open — proceed normally if check fails
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/login/callback`,
          shouldCreateUser: !accountExists, // don't create new account if one exists
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

      setState(accountExists ? 'success_existing' : 'success')
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
            shouldCreateUser: !accountExists,
          },
        })
        if (err2) throw err2
        setState(accountExists ? 'success_existing' : 'success')
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

  const handleGoogleSignIn = async () => {
    setGoogleState('loading')
    setErrorMessage('')
    const supabase = createClient()

    // Use the canonical production URL so Google's consent screen shows
    // "hellolumira.app" instead of the Supabase project URL.
    // In development, fall back to the current origin (localhost).
    const siteOrigin =
      process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL !== 'http://localhost:3000'
        ? process.env.NEXT_PUBLIC_APP_URL
        : window.location.origin

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${siteOrigin}/login/callback`,
        queryParams: {
          // Ensure Google always shows the account picker, preventing silent
          // re-auth through the Supabase intermediary URL.
          prompt: 'select_account',
        },
      },
    })
    if (error) {
      setErrorMessage('Google sign-in is not available right now. Please use the magic link instead.')
      setState('error')
      setGoogleState('idle')
    }
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
            {isSignup ? 'Create your account' : "Let's get you started"}
          </h1>
          <p className="text-body-muted mb-6">
            {isSignup
              ? 'Join Lumira — your AI parenting companion. Free, private, no download needed.'
              : 'Sign in or create an account to get started.'}
          </p>

          {/* Passkey sign-in button — only for enrolled users */}
          {passkeyEnrolled && state !== 'success' && state !== 'success_existing' && (
            <div style={{ marginBottom: '16px' }}>
              <button
                onClick={handlePasskeySignIn}
                disabled={passkeyLoading}
                style={{
                  width: '100%',
                  height: '52px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-primary)',
                  color: '#fff',
                  border: 'none',
                  cursor: passkeyLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  fontSize: '16px',
                  fontWeight: 600,
                  opacity: passkeyLoading ? 0.7 : 1,
                  fontFamily: 'inherit',
                  transition: 'opacity 0.15s ease',
                }}
              >
                {passkeyLoading ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }} aria-hidden="true">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    {/* Fingerprint / Face ID icon */}
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 1C8.5 1 5.5 3.5 5.5 7v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M18.5 8V7c0-3.5-3-6-6.5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M9 11c0-1.66 1.34-3 3-3s3 1.34 3 3v2c0 1.66-1.34 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M12 17v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M6 11c0-3.31 2.69-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
                      <path d="M18 11c0-1.66-.67-3.16-1.76-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
                    </svg>
                    {platformInfo?.signInLabel ?? 'Sign in with passkey'}
                  </>
                )}
              </button>

              {/* Divider between passkey and other options */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
                <span style={{ fontSize: '13px', color: 'var(--color-muted)', fontWeight: 500 }}>or sign in another way</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
              </div>
            </div>
          )}

          {/* Google sign-in button */}
          {state !== 'success' && state !== 'success_existing' && (
            <div style={{ marginBottom: '20px' }}>
              <button
                onClick={handleGoogleSignIn}
                disabled={googleState === 'loading'}
                style={{
                  width: '100%',
                  height: '52px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  background: 'var(--color-white)',
                  cursor: googleState === 'loading' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--color-slate)',
                  transition: 'all 0.15s ease',
                  opacity: googleState === 'loading' ? 0.6 : 1,
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  if (googleState !== 'loading') {
                    const isDark = document.documentElement.classList.contains('dark')
                    e.currentTarget.style.background = isDark ? '#2A2826' : '#F8F8F8'
                    e.currentTarget.style.borderColor = isDark ? '#383532' : '#C0C0C0'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--color-white)'
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                }}
              >
                {googleState === 'loading' ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Connecting...
                  </span>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '20px 0 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
                <span style={{ fontSize: '13px', color: 'var(--color-muted)', fontWeight: 500 }}>or use email</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
              </div>
            </div>
          )}

          {/* Existing account detected during signup */}
          {state === 'success_existing' && (
            <div
              role="status"
              aria-live="polite"
              className="animate-fade-in"
              style={{
                background: 'var(--color-primary-light)',
                border: '1px solid var(--color-primary-mid)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <span aria-hidden="true" style={{ fontSize: '24px', lineHeight: 1 }}>👋</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, color: 'var(--color-primary)', marginBottom: 4 }}>
                  Looks like you already have an account
                </p>
                <p style={{ color: 'var(--color-slate)', fontSize: '14px', marginBottom: 12 }}>
                  We sent a sign-in link to <strong>{email}</strong>. It expires in 10 minutes — check your spam folder if you don&apos;t see it.
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
                  We sent a sign-in link to <strong>{email}</strong>. It expires in 10 minutes — check your spam folder if you don&apos;t see it.
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

          {/* Form — hidden once a link has been sent or rate limited with cooldown */}
          {state !== 'success' && state !== 'success_existing' && !(state === 'rate_limited' && cooldown > 0) && (
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
                  autoComplete={conditionalMediationReady ? 'username webauthn' : 'email'}
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
