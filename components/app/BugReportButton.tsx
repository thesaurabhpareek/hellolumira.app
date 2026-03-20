/**
 * @module BugReportButton
 * @description Floating bug report button + modal. Auto-captures device info,
 *   browser details, console logs, and user context. Submits to /api/bug-report.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface BugReportButtonProps {
  userEmail?: string
  userName?: string
}

interface CapturedLog {
  level: 'log' | 'warn' | 'error'
  message: string
  timestamp: string
}

// Capture recent console logs globally
const recentLogs: CapturedLog[] = []
const MAX_LOGS = 50

if (typeof window !== 'undefined') {
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
  }

  const captureLog = (level: 'log' | 'warn' | 'error', args: unknown[]) => {
    const message = args
      .map((a) => {
        try {
          return typeof a === 'string' ? a : JSON.stringify(a)
        } catch {
          return String(a)
        }
      })
      .join(' ')
      .slice(0, 500)

    recentLogs.push({ level, message, timestamp: new Date().toISOString() })
    if (recentLogs.length > MAX_LOGS) recentLogs.shift()
  }

  console.log = (...args: unknown[]) => {
    captureLog('log', args)
    originalConsole.log(...args)
  }
  console.warn = (...args: unknown[]) => {
    captureLog('warn', args)
    originalConsole.warn(...args)
  }
  console.error = (...args: unknown[]) => {
    captureLog('error', args)
    originalConsole.error(...args)
  }
}

function getDeviceInfo() {
  const ua = navigator.userAgent
  let deviceType = 'desktop'
  if (/Mobi|Android/i.test(ua)) deviceType = 'mobile'
  else if (/Tablet|iPad/i.test(ua)) deviceType = 'tablet'

  let browser = 'unknown'
  if (ua.includes('Firefox/')) browser = 'Firefox'
  else if (ua.includes('Edg/')) browser = 'Edge'
  else if (ua.includes('Chrome/') && !ua.includes('Edg/')) browser = 'Chrome'
  else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari'
  else if (ua.includes('Opera/') || ua.includes('OPR/')) browser = 'Opera'

  let os = 'unknown'
  if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Mac OS X')) os = 'macOS'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'
  else if (ua.includes('Linux')) os = 'Linux'

  return {
    deviceType,
    browser,
    os,
    userAgent: ua,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    pageUrl: window.location.href,
  }
}

const CATEGORIES = [
  { value: 'bug', label: 'Bug', emoji: '🐛' },
  { value: 'feedback', label: 'Feedback', emoji: '💬' },
  { value: 'feature_request', label: 'Feature', emoji: '✨' },
  { value: 'other', label: 'Other', emoji: '📝' },
]

export default function BugReportButton({ userEmail, userName }: BugReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('bug')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const modalRef = useRef<HTMLDivElement>(null)

  // Close on escape
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  // Close on outside click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setIsOpen(false)
    }
  }, [])

  const handleSubmit = async () => {
    if (!subject.trim() || !description.trim()) {
      setError('Please fill in both subject and description.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const deviceInfo = getDeviceInfo()
      const res = await fetch('/api/bug-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim(),
          description: description.trim(),
          category,
          device_type: deviceInfo.deviceType,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          screen_resolution: deviceInfo.screenResolution,
          user_agent: deviceInfo.userAgent,
          page_url: deviceInfo.pageUrl,
          console_logs: recentLogs.slice(-30),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to submit')
      }

      setSubmitted(true)
      setTimeout(() => {
        setIsOpen(false)
        setSubmitted(false)
        setSubject('')
        setDescription('')
        setCategory('bug')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Report a bug"
        style={{
          position: 'fixed',
          bottom: 'calc(70px + max(0px, env(safe-area-inset-bottom)))',
          right: '16px',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'var(--color-slate)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 40,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)'
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.25)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div
          onClick={handleBackdropClick}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '16px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            ref={modalRef}
            style={{
              background: 'var(--color-white)',
              borderRadius: '20px 20px 12px 12px',
              width: '100%',
              maxWidth: '440px',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '24px 20px',
              boxShadow: '0 -4px 30px rgba(0,0,0,0.15)',
              animation: 'slideUp 0.25s ease',
            }}
          >
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <span style={{ fontSize: '40px' }}>🎉</span>
                <p style={{ fontWeight: 700, fontSize: '18px', color: 'var(--color-slate)', marginTop: '12px' }}>
                  Thank you!
                </p>
                <p style={{ fontSize: '14px', color: 'var(--color-muted)', marginTop: '6px' }}>
                  We have received your report and will look into it.
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-slate)', margin: 0 }}>
                      Report an Issue
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginTop: '2px' }}>
                      Help us make Lumira better
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    aria-label="Close"
                    style={{
                      background: 'var(--color-surface)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '18px',
                      color: 'var(--color-muted)',
                    }}
                  >
                    &times;
                  </button>
                </div>

                {/* Auto-captured info pill */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginBottom: '16px',
                }}>
                  {userName && (
                    <span style={{ fontSize: '11px', background: 'var(--color-surface)', padding: '3px 10px', borderRadius: '100px', color: 'var(--color-muted)', fontWeight: 500 }}>
                      {userName}
                    </span>
                  )}
                  {userEmail && (
                    <span style={{ fontSize: '11px', background: 'var(--color-surface)', padding: '3px 10px', borderRadius: '100px', color: 'var(--color-muted)', fontWeight: 500 }}>
                      {userEmail}
                    </span>
                  )}
                  <span style={{ fontSize: '11px', background: 'var(--color-surface)', padding: '3px 10px', borderRadius: '100px', color: 'var(--color-muted)', fontWeight: 500 }}>
                    Auto-capturing device info
                  </span>
                </div>

                {/* Category chips */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '100px',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: category === cat.value ? 'var(--color-primary)' : 'var(--color-surface)',
                        color: category === cat.value ? '#fff' : 'var(--color-muted)',
                        transition: 'all 0.15s ease',
                        minHeight: '36px',
                      }}
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>

                {/* Subject */}
                <input
                  type="text"
                  placeholder="What went wrong?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--color-border)',
                    fontSize: '15px',
                    color: 'var(--color-slate)',
                    background: 'var(--color-white)',
                    outline: 'none',
                    marginBottom: '12px',
                    minHeight: '48px',
                    fontFamily: 'inherit',
                  }}
                />

                {/* Description */}
                <textarea
                  placeholder="Tell us more — what were you doing when this happened? What did you expect?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--color-border)',
                    fontSize: '15px',
                    color: 'var(--color-slate)',
                    background: 'var(--color-white)',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '100px',
                    lineHeight: 1.5,
                    marginBottom: '16px',
                    fontFamily: 'inherit',
                  }}
                />

                {/* Error */}
                {error && (
                  <p style={{ fontSize: '13px', color: 'var(--color-red)', marginBottom: '12px', fontWeight: 500 }}>
                    {error}
                  </p>
                )}

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !subject.trim() || !description.trim()}
                  className="btn-primary"
                  style={{ width: '100%' }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </>
  )
}
