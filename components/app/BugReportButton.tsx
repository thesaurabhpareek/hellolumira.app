/**
 * @module BugReportButton
 * @description Simple floating feedback button positioned inside AppShell.
 *   Uses position:absolute (not fixed) so it stays within the app container.
 * @version 3.0.0
 */
'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'

interface BugReportButtonProps {
  userEmail?: string
  userName?: string
}

interface CapturedLog {
  level: 'log' | 'warn' | 'error'
  message: string
  timestamp: string
}

const recentLogs: CapturedLog[] = []
const MAX_LOGS = 50

if (typeof window !== 'undefined' && !((window as unknown) as Record<string, unknown>).__lumira_console_patched) {
  ((window as unknown) as Record<string, unknown>).__lumira_console_patched = true
  const orig = { log: console.log, warn: console.warn, error: console.error }
  const capture = (level: 'log' | 'warn' | 'error', args: unknown[]) => {
    const msg = args.map((a) => { try { return typeof a === 'string' ? a : JSON.stringify(a) } catch { return String(a) } }).join(' ').slice(0, 500)
    recentLogs.push({ level, message: msg, timestamp: new Date().toISOString() })
    if (recentLogs.length > MAX_LOGS) recentLogs.shift()
  }
  console.log = (...a: unknown[]) => { capture('log', a); orig.log(...a) }
  console.warn = (...a: unknown[]) => { capture('warn', a); orig.warn(...a) }
  console.error = (...a: unknown[]) => { capture('error', a); orig.error(...a) }
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
  let os = 'unknown'
  if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Mac OS X')) os = 'macOS'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'
  else if (ua.includes('Linux')) os = 'Linux'
  return { deviceType, browser, os, userAgent: ua, screenResolution: `${window.screen.width}x${window.screen.height}`, pageUrl: window.location.href }
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

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) setIsOpen(false)
  }, [])

  const handleSubmit = async () => {
    if (!subject.trim() || !description.trim()) { setError('Please fill in both fields.'); return }
    setIsSubmitting(true); setError('')
    try {
      const info = getDeviceInfo()
      const res = await fetch('/api/bug-report', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject.trim(), description: description.trim(), category, device_type: info.deviceType, browser: info.browser, os: info.os, screen_resolution: info.screenResolution, user_agent: info.userAgent, page_url: info.pageUrl, console_logs: recentLogs.slice(-30) }),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Failed') }
      setSubmitted(true)
      setTimeout(() => { setIsOpen(false); setSubmitted(false); setSubject(''); setDescription(''); setCategory('bug') }, 2000)
    } catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong.') }
    finally { setIsSubmitting(false) }
  }

  return (
    <>
      {/* Simple absolute-positioned button inside AppShell */}
      <button
        aria-label="Send feedback"
        onClick={() => setIsOpen(true)}
        style={{
          position: 'absolute',
          right: '12px',
          bottom: 'calc(70px + max(0px, env(safe-area-inset-bottom)))',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--feedback-btn-bg, rgba(120, 120, 128, 0.22))',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
          opacity: 0.45,
          transition: 'opacity 0.3s ease, transform 0.15s ease',
          WebkitTapHighlightColor: 'transparent',
          pointerEvents: 'auto',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.45' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.65 }}>
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="var(--feedback-icon-color, currentColor)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="var(--feedback-icon-color, currentColor)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Modal — rendered via portal to escape AppShell overflow-hidden */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          onClick={handleBackdropClick}
          className="fixed inset-0 z-[200] flex items-end justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)', animation: 'feedbackFadeIn 0.2s ease' }}
        >
          <div
            ref={modalRef}
            className="bg-[var(--color-card)] w-full overflow-y-auto"
            style={{ borderRadius: '20px 20px 12px 12px', maxWidth: '440px', maxHeight: '85vh', padding: '24px 20px', boxShadow: '0 -4px 30px rgba(0,0,0,0.15)', animation: 'feedbackSlideUp 0.25s ease' }}
          >
            {submitted ? (
              <div className="text-center py-8">
                <span className="text-[40px]">🎉</span>
                <p className="font-bold text-[18px] text-foreground mt-3">Thank you!</p>
                <p className="text-sm text-muted-foreground mt-[6px]">We received your feedback.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-[18px] font-bold text-foreground m-0">Share Feedback</h2>
                    <p className="text-[13px] text-muted-foreground mt-0.5">Help us make Lumira better</p>
                  </div>
                  <button onClick={() => setIsOpen(false)} aria-label="Close" className="bg-[var(--color-surface)] border-none rounded-full w-8 h-8 flex items-center justify-center cursor-pointer text-[18px] text-muted-foreground">&times;</button>
                </div>

                <div className="flex flex-wrap gap-[6px] mb-4">
                  {userName && <span className="text-[11px] bg-[var(--color-surface)] px-[10px] py-[3px] rounded-[100px] text-muted-foreground font-medium">{userName}</span>}
                  {userEmail && <span className="text-[11px] bg-[var(--color-surface)] px-[10px] py-[3px] rounded-[100px] text-muted-foreground font-medium">{userEmail}</span>}
                </div>

                <div className="flex gap-2 mb-4">
                  {CATEGORIES.map((cat) => (
                    <button key={cat.value} onClick={() => setCategory(cat.value)} className="px-[14px] rounded-[100px] border-none text-[13px] font-semibold cursor-pointer transition-all duration-150 min-h-[36px]" style={{ padding: '6px 14px', background: category === cat.value ? 'var(--color-primary)' : 'var(--color-surface)', color: category === cat.value ? '#fff' : 'var(--color-muted)' }}>
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>

                <input type="text" placeholder="What happened?" value={subject} onChange={(e) => setSubject(e.target.value)} autoFocus className="w-full rounded-md text-[15px] text-foreground bg-[var(--color-card)] outline-none mb-3 min-h-[48px]" style={{ padding: '12px 16px', border: '1.5px solid var(--color-border)', fontFamily: 'inherit' }} />

                <textarea placeholder="Tell us more..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-md text-[15px] text-foreground bg-[var(--color-card)] outline-none resize-y leading-[1.5] mb-4" style={{ padding: '12px 16px', border: '1.5px solid var(--color-border)', minHeight: '80px', fontFamily: 'inherit' }} />

                {error && <p className="text-[13px] text-destructive mb-3 font-medium">{error}</p>}

                <button onClick={handleSubmit} disabled={isSubmitting || !subject.trim() || !description.trim()} className="btn-primary w-full">
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </>
            )}
          </div>
        </div>,
        document.body
      )}

      <style>{`
        @keyframes feedbackFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes feedbackSlideUp { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        :root { --feedback-btn-bg: rgba(120, 120, 128, 0.22); --feedback-icon-color: rgba(60, 60, 67, 0.6); }
        .dark, [data-theme="dark"] { --feedback-btn-bg: rgba(180, 180, 190, 0.18); --feedback-icon-color: rgba(235, 235, 245, 0.55); }
      `}</style>
    </>
  )
}
