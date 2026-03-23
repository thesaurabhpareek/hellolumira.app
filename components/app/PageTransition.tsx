/**
 * @module PageTransition
 * @description Smooth page transitions with directional awareness.
 *   Supports forward/back slide, crossfade for tabs, and modal slide-up.
 *   Uses CSS View Transitions API where supported with CSS animation fallback.
 * @version 2.0.0
 * @since March 2026
 */
'use client'

import React, { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

type TransitionMode = 'slide-forward' | 'slide-back' | 'crossfade' | 'modal-up' | 'none'

interface Props {
  children: React.ReactNode
  /** Override default transition detection */
  mode?: TransitionMode
}

/* ── Route hierarchy for determining transition direction ─────────────────── */
const TAB_ROUTES = ['/home', '/chat', '/checkin', '/content', '/profile']

function getTabIndex(path: string): number {
  return TAB_ROUTES.findIndex(r => path === r || path.startsWith(r + '/'))
}

function isModalRoute(path: string): boolean {
  return /\/(concern|settings|share|quiz|onboarding)/.test(path)
}

function getTransitionMode(from: string, to: string): TransitionMode {
  const fromTab = getTabIndex(from)
  const toTab = getTabIndex(to)

  // Tab-to-tab: crossfade
  if (fromTab >= 0 && toTab >= 0 && fromTab !== toTab) {
    return 'crossfade'
  }

  // Modal routes: slide up
  if (isModalRoute(to) && !isModalRoute(from)) {
    return 'modal-up'
  }

  // Deeper navigation: slide forward
  const fromDepth = from.split('/').filter(Boolean).length
  const toDepth = to.split('/').filter(Boolean).length

  if (toDepth > fromDepth) return 'slide-forward'
  if (toDepth < fromDepth) return 'slide-back'

  return 'crossfade'
}

/* ── Animation classes mapped to modes ────────────────────────────────────── */
const ANIMATION_CLASSES: Record<TransitionMode, string> = {
  'slide-forward':  'page-transition--slide-forward',
  'slide-back':     'page-transition--slide-back',
  'crossfade':      'page-transition--crossfade',
  'modal-up':       'page-transition--modal-up',
  'none':           '',
}

export default function PageTransition({ children, mode }: Props) {
  const pathname = usePathname()
  const prevPathRef = useRef(pathname)
  const [transitionClass, setTransitionClass] = useState('page-transition--crossfade')
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prevPath = prevPathRef.current
    if (prevPath === pathname) return

    const resolvedMode = mode || getTransitionMode(prevPath, pathname)
    prevPathRef.current = pathname

    // Try native View Transitions API first
    if (typeof document !== 'undefined' && 'startViewTransition' in document && resolvedMode !== 'none') {
      try {
        (document as unknown as { startViewTransition: (cb: () => void) => void })
          .startViewTransition(() => {
            // The DOM update happens here (React re-render)
          })
        return
      } catch {
        // Fall through to CSS animation
      }
    }

    // CSS animation fallback
    const animClass = ANIMATION_CLASSES[resolvedMode]
    if (animClass && contentRef.current) {
      // Remove then re-add to retrigger animation
      setTransitionClass('')
      requestAnimationFrame(() => {
        setTransitionClass(animClass)
      })

      const timer = setTimeout(() => {
        setTransitionClass('')
      }, 350)
      return () => clearTimeout(timer)
    }
  }, [pathname, mode])

  return (
    <div
      ref={contentRef}
      className={`page-transition flex-1 flex flex-col min-h-0 ${transitionClass}`}
    >
      {children}
    </div>
  )
}
