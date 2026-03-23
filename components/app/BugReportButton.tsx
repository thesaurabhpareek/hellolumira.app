/**
 * @module BugReportButton
 * @description Apple AssistiveTouch-style draggable floating feedback button.
 *   Semi-transparent, snaps to edges, smooth spring physics on drag.
 *   Opens a feedback modal on tap.
 * @version 2.0.0
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

// Capture recent console logs globally
const recentLogs: CapturedLog[] = []
const MAX_LOGS = 50

if (typeof window !== 'undefined' && !((window as unknown) as Record<string, unknown>).__lumira_console_patched) {
  ((window as unknown) as Record<string, unknown>).__lumira_console_patched = true

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

  console.log = (...args: unknown[]) => { captureLog('log', args); originalConsole.log(...args) }
  console.warn = (...args: unknown[]) => { captureLog('warn', args); originalConsole.warn(...args) }
  console.error = (...args: unknown[]) => { captureLog('error', args); originalConsole.error(...args) }
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

  return {
    deviceType, browser, os,
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

const BUTTON_SIZE = 44
const EDGE_MARGIN = 8
const IDLE_OPACITY = 0.45
const ACTIVE_OPACITY = 0.9

export default function BugReportButton({ userEmail, userName }: BugReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('bug')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  // Drag state
  const [mounted, setMounted] = useState(false)
  const [pos, setPos] = useState({ x: -100, y: -100 }) // offscreen until mounted
  const [dragging, setDragging] = useState(false)
  const [opacity, setOpacity] = useState(IDLE_OPACITY)
  const dragRef = useRef({ startX: 0, startY: 0, startPosX: 0, startPosY: 0, moved: false })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Get the app container bounds (respects max-width constraint)
  const getAppBounds = useCallback(() => {
    // Find the AppShell container (h-dvh flex parent)
    const appShell = document.querySelector('.h-dvh')
    if (appShell) {
      const rect = appShell.getBoundingClientRect()
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height }
    }
    // Fallback to viewport
    return { left: 0, right: window.innerWidth, top: 0, bottom: window.innerHeight, width: window.innerWidth, height: window.innerHeight }
  }, [])

  // Initialize position — right edge of app container, 60% down
  useEffect(() => {
    const bounds = getAppBounds()
    setPos({
      x: bounds.right - BUTTON_SIZE - EDGE_MARGIN,
      y: Math.round(bounds.top + bounds.height * 0.6),
    })
    setMounted(true)
  }, [getAppBounds])

  // Fade to idle after 3s of no interaction
  const resetIdleTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current)
    setOpacity(ACTIVE_OPACITY)
    idleTimer.current = setTimeout(() => setOpacity(IDLE_OPACITY), 3000)
  }, [])

  useEffect(() => {
    resetIdleTimer()
    return () => { if (idleTimer.current) clearTimeout(idleTimer.current) }
  }, [resetIdleTimer])

  // Snap to nearest edge within app container
  const snapToEdge = useCallback((x: number, y: number) => {
    const bounds = getAppBounds()
    const centerX = x + BUTTON_SIZE / 2
    const snapX = centerX < (bounds.left + bounds.width / 2)
      ? bounds.left + EDGE_MARGIN
      : bounds.right - BUTTON_SIZE - EDGE_MARGIN
    const snapY = Math.max(bounds.top + EDGE_MARGIN + 60, Math.min(y, bounds.bottom - BUTTON_SIZE - EDGE_MARGIN - 80))
    return { x: snapX, y: snapY }
  }, [getAppBounds])

  // Touch handlers for drag
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    dragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startPosX: pos.x,
      startPosY: pos.y,
      moved: false,
    }
    setDragging(true)
    setOpacity(ACTIVE_OPACITY)
  }, [pos])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging) return
    const touch = e.touches[0]
    const dx = touch.clientX - dragRef.current.startX
    const dy = touch.clientY - dragRef.current.startY

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      dragRef.current.moved = true
    }

    setPos({
      x: dragRef.current.startPosX + dx,
      y: dragRef.current.startPosY + dy,
    })
  }, [dragging])

  const handleTouchEnd = useCallback(() => {
    setDragging(false)
    const snapped = snapToEdge(pos.x, pos.y)
    setPos(snapped)
    resetIdleTimer()

    // If didn't move, treat as tap
    if (!dragRef.current.moved) {
      setIsOpen(true)
    }
  }, [pos, snapToEdge, resetIdleTimer])

  // Mouse handlers for desktop drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: pos.x,
      startPosY: pos.y,
      moved: false,
    }
    setDragging(true)
    setOpacity(ACTIVE_OPACITY)

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - dragRef.current.startX
      const dy = ev.clientY - dragRef.current.startY
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragRef.current.moved = true
      setPos({
        x: dragRef.current.startPosX + dx,
        y: dragRef.current.startPosY + dy,
      })
    }

    const onUp = () => {
      setDragging(false)
      setPos((p) => snapToEdge(p.x, p.y))
      resetIdleTimer()
      if (!dragRef.current.moved) setIsOpen(true)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [pos, snapToEdge, resetIdleTimer])

  // Close on escape
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

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
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Draggable floating button — Apple AssistiveTouch style */}
      {mounted && <button
        ref={buttonRef}
        aria-label="Send feedback"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        style={{
          position: 'fixed',
          left: pos.x,
          top: pos.y,
          width: BUTTON_SIZE,
          height: BUTTON_SIZE,
          borderRadius: '50%',
          border: 'none',
          cursor: dragging ? 'grabbing' : 'grab',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--feedback-btn-bg, rgba(120, 120, 128, 0.28))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: dragging
            ? '0 8px 32px rgba(0,0,0,0.25)'
            : '0 2px 12px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(255,255,255,0.1)',
          opacity,
          transition: dragging
            ? 'box-shadow 0.15s ease'
            : 'left 0.35s cubic-bezier(0.25, 1, 0.5, 1), top 0.35s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.6s ease, box-shadow 0.2s ease, transform 0.15s ease',
          transform: dragging ? 'scale(1.1)' : 'scale(1)',
          touchAction: 'none',
          WebkitTapHighlightColor: 'transparent',
          userSelect: 'none',
        }}
      >
        {/* Pencil-square icon — clearly "write feedback" without looking like chat */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.65 }}>
          <path
            d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
            stroke="var(--feedback-icon-color, currentColor)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
            stroke="var(--feedback-icon-color, currentColor)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>}

      {/* Modal overlay */}
      {isOpen && (
        <div
          onClick={handleBackdropClick}
          className="fixed inset-0 z-[200] flex items-end justify-center p-4"
          style={{
            background: 'rgba(0,0,0,0.4)',
            animation: 'feedbackFadeIn 0.2s ease',
          }}
        >
          <div
            ref={modalRef}
            className="bg-[var(--color-card)] w-full overflow-y-auto"
            style={{
              borderRadius: '20px 20px 12px 12px',
              maxWidth: '440px',
              maxHeight: '85vh',
              padding: '24px 20px',
              boxShadow: '0 -4px 30px rgba(0,0,0,0.15)',
              animation: 'feedbackSlideUp 0.25s ease',
            }}
          >
            {submitted ? (
              <div className="text-center py-8">
                <span className="text-[40px]">🎉</span>
                <p className="font-bold text-[18px] text-foreground mt-3">Thank you!</p>
                <p className="text-sm text-muted-foreground mt-[6px]">
                  We received your feedback and will look into it.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-[18px] font-bold text-foreground m-0">Share Feedback</h2>
                    <p className="text-[13px] text-muted-foreground mt-0.5">Help us make Lumira better</p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    aria-label="Close"
                    className="bg-[var(--color-surface)] border-none rounded-full w-8 h-8 flex items-center justify-center cursor-pointer text-[18px] text-muted-foreground"
                  >
                    &times;
                  </button>
                </div>

                <div className="flex flex-wrap gap-[6px] mb-4">
                  {userName && (
                    <span className="text-[11px] bg-[var(--color-surface)] px-[10px] py-[3px] rounded-[100px] text-muted-foreground font-medium">
                      {userName}
                    </span>
                  )}
                  {userEmail && (
                    <span className="text-[11px] bg-[var(--color-surface)] px-[10px] py-[3px] rounded-[100px] text-muted-foreground font-medium">
                      {userEmail}
                    </span>
                  )}
                  <span className="text-[11px] bg-[var(--color-surface)] px-[10px] py-[3px] rounded-[100px] text-muted-foreground font-medium">
                    Auto-capturing device info
                  </span>
                </div>

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

                <input
                  type="text"
                  placeholder="What went wrong?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  autoFocus
                  className="w-full rounded-md text-[15px] text-foreground bg-[var(--color-card)] outline-none mb-3 min-h-[48px]"
                  style={{ padding: '12px 16px', border: '1.5px solid var(--color-border)', fontFamily: 'inherit' }}
                />

                <textarea
                  placeholder="Tell us more — what were you doing when this happened?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full rounded-md text-[15px] text-foreground bg-[var(--color-card)] outline-none resize-y leading-[1.5] mb-4"
                  style={{ padding: '12px 16px', border: '1.5px solid var(--color-border)', minHeight: '100px', fontFamily: 'inherit' }}
                />

                {error && <p className="text-[13px] text-destructive mb-3 font-medium">{error}</p>}

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !subject.trim() || !description.trim()}
                  className="btn-primary w-full"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes feedbackFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes feedbackSlideUp { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        :root {
          --feedback-btn-bg: rgba(120, 120, 128, 0.22);
          --feedback-icon-color: rgba(60, 60, 67, 0.6);
        }
        .dark, [data-theme="dark"] {
          --feedback-btn-bg: rgba(180, 180, 190, 0.18);
          --feedback-icon-color: rgba(235, 235, 245, 0.55);
        }
      `}</style>
    </>
  )
}
