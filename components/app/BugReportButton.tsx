/**
 * @module BugReportButton
 * @description Floating bug report button + modal. Auto-captures device info,
 *   browser details, console logs, and user context. Submits to /api/bug-report.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'

interface BugReportButtonProps {
  userEmail?: string
  userName?: string
}

interface CapturedLog {
  level: 'log' | 'warn' | 'error'
  message: string
  timestamp: string
}

// Capture recent console logs globally (guard against duplicate monkey-patching from HMR)
const recentLogs: CapturedLog[] = []
const MAX_LOGS = 50

if (typeof window !== 'undefined' && !(window as Record<string, unknown>).__lumira_console_patched) {
  (window as Record<string, unknown>).__lumira_console_patched = true

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
        className="fixed right-4 rounded-full bg-foreground border-none cursor-pointer flex items-center justify-center z-40 transition-[transform,box-shadow] duration-200 ease-in-out"
        style={{
          bottom: 'calc(70px + max(0px, env(safe-area-inset-bottom)))',
          width: '44px',
          height: '44px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
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
          className="fixed inset-0 z-[200] flex items-end justify-center p-4"
          style={{
            background: 'rgba(0,0,0,0.4)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            ref={modalRef}
            className="bg-white w-full overflow-y-auto"
            style={{
              borderRadius: '20px 20px 12px 12px',
              maxWidth: '440px',
              maxHeight: '85vh',
              padding: '24px 20px',
              boxShadow: '0 -4px 30px rgba(0,0,0,0.15)',
              animation: 'slideUp 0.25s ease',
            }}
          >
            {submitted ? (
              <div className="text-center py-8">
                <span className="text-[40px]">🎉</span>
                <p className="font-bold text-[18px] text-foreground mt-3">
                  Thank you!
                </p>
                <p className="text-sm text-muted-foreground mt-[6px]">
                  We have received your report and will look into it.
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-[18px] font-bold text-foreground m-0">
                      Report an Issue
                    </h2>
                    <p className="text-[13px] text-muted-foreground mt-0.5">
                      Help us make Lumira better
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    aria-label="Close"
                    className="bg-background border-none rounded-full w-8 h-8 flex items-center justify-center cursor-pointer text-[18px] text-muted-foreground"
                  >
                    &times;
                  </button>
                </div>

                {/* Auto-captured info pill */}
                <div className="flex flex-wrap gap-[6px] mb-4">
                  {userName && (
                    <span className="text-[11px] bg-background px-[10px] py-[3px] rounded-[100px] text-muted-foreground font-medium">
                      {userName}
                    </span>
                  )}
                  {userEmail && (
                    <span className="text-[11px] bg-background px-[10px] py-[3px] rounded-[100px] text-muted-foreground font-medium">
                      {userEmail}
                    </span>
                  )}
                  <span className="text-[11px] bg-background px-[10px] py-[3px] rounded-[100px] text-muted-foreground font-medium">
                    Auto-capturing device info
                  </span>
                </div>

                {/* Category chips */}
                <div className="flex gap-2 mb-4">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className="px-[14px] rounded-[100px] border-none text-[13px] font-semibold cursor-pointer transition-all duration-150 ease-out min-h-[36px]"
                      style={{
                        padding: '6px 14px',
                        background: category === cat.value ? 'var(--color-primary)' : 'var(--color-surface)',
                        color: category === cat.value ? '#fff' : 'var(--color-muted)',
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
                  className="w-full rounded-md text-[15px] text-foreground bg-white outline-none mb-3 min-h-[48px]"
                  style={{
                    padding: '12px 16px',
                    border: '1.5px solid var(--color-border)',
                    fontFamily: 'inherit',
                  }}
                />

                {/* Description */}
                <textarea
                  placeholder="Tell us more — what were you doing when this happened? What did you expect?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full rounded-md text-[15px] text-foreground bg-white outline-none resize-y leading-[1.5] mb-4"
                  style={{
                    padding: '12px 16px',
                    border: '1.5px solid var(--color-border)',
                    minHeight: '100px',
                    fontFamily: 'inherit',
                  }}
                />

                {/* Error */}
                {error && (
                  <p className="text-[13px] text-destructive mb-3 font-medium">
                    {error}
                  </p>
                )}

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !subject.trim() || !description.trim()}
                  className="btn-primary w-full"
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
