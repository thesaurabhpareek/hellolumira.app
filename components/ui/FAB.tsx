/**
 * @module FAB
 * @description Floating Action Button with speed dial expansion.
 *   Contextual, positioned above bottom nav, with animated entry,
 *   hide-on-scroll, ripple effect, and shadow elevation.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface MiniAction {
  label: string
  icon: React.ReactNode
  onClick: () => void
  color?: string
}

interface Props {
  /** Primary action icon */
  icon: React.ReactNode
  /** Primary action label (shown in extended mode) */
  label?: string
  /** Primary action handler (if no speed dial) */
  onClick?: () => void
  /** Speed dial mini-FABs (2-4 items) */
  actions?: MiniAction[]
  /** Extended mode: show icon + label */
  extended?: boolean
  /** Position offset from bottom (above bottom nav) */
  bottomOffset?: number
  /** Hide on scroll down, show on scroll up */
  hideOnScroll?: boolean
  /** Custom color (default: sage-500) */
  color?: string
}

export default function FAB({
  icon,
  label,
  onClick,
  actions,
  extended = false,
  bottomOffset = 80, // Above bottom nav + safe area
  hideOnScroll = true,
  color = '#3D8178',
}: Props) {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(true)
  const [pressed, setPressed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const lastScrollY = useRef(0)

  // Animate entry
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Hide on scroll behavior
  useEffect(() => {
    if (!hideOnScroll) return

    const handleScroll = () => {
      const scrollParent = document.querySelector('main [class*="overflow-y"]') as HTMLElement
      if (!scrollParent) return

      const currentY = scrollParent.scrollTop
      if (currentY > lastScrollY.current + 10) {
        setVisible(false)
        setOpen(false)
      } else if (currentY < lastScrollY.current - 10) {
        setVisible(true)
      }
      lastScrollY.current = currentY
    }

    const scrollParent = document.querySelector('main [class*="overflow-y"]') as HTMLElement
    if (scrollParent) {
      scrollParent.addEventListener('scroll', handleScroll, { passive: true })
      return () => scrollParent.removeEventListener('scroll', handleScroll)
    }
  }, [hideOnScroll])

  const handleMainClick = useCallback(() => {
    if (actions && actions.length > 0) {
      setOpen(prev => !prev)
    } else {
      onClick?.()
    }
  }, [actions, onClick])

  const handleActionClick = useCallback((action: MiniAction) => {
    action.onClick()
    setOpen(false)
  }, [])

  return (
    <>
      {/* Overlay backdrop when speed dial is open */}
      {open && (
        <div
          className="fab__overlay"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <div
        className="fab__container"
        style={{
          bottom: `calc(${bottomOffset}px + max(0px, env(safe-area-inset-bottom)))`,
          transform: mounted
            ? visible
              ? 'translateY(0) scale(1)'
              : 'translateY(80px) scale(0.8)'
            : 'translateY(40px) scale(0)',
          opacity: mounted ? (visible ? 1 : 0) : 0,
        }}
      >
        {/* Speed dial mini-FABs */}
        {actions && open && (
          <div className="fab__speed-dial">
            {actions.map((action, i) => (
              <button
                key={i}
                className="fab__mini press-scale"
                onClick={() => handleActionClick(action)}
                style={{
                  '--fab-mini-delay': `${(actions.length - 1 - i) * 40}ms`,
                  backgroundColor: action.color || '#FFFFFF',
                } as React.CSSProperties}
                aria-label={action.label}
              >
                <span className="fab__mini-icon">{action.icon}</span>
                <span className="fab__mini-label">{action.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Main FAB */}
        <button
          className={`fab__main ${extended ? 'fab__main--extended' : ''} ${open ? 'fab__main--open' : ''}`}
          onClick={handleMainClick}
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => setPressed(false)}
          onPointerLeave={() => setPressed(false)}
          style={{
            backgroundColor: color,
            transform: pressed ? 'scale(0.92)' : open ? 'rotate(45deg)' : 'scale(1)',
            boxShadow: pressed
              ? `0 2px 8px rgba(0,0,0,0.15)`
              : `0 6px 20px rgba(0,0,0,0.15), 0 2px 8px ${color}40`,
          }}
          aria-label={label || 'Action button'}
          aria-expanded={actions ? open : undefined}
        >
          <span className="fab__icon">{icon}</span>
          {extended && label && (
            <span className="fab__label">{label}</span>
          )}
        </button>
      </div>
    </>
  )
}
