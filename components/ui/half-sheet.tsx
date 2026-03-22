'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

/* ══════════════════════════════════════════════════════════════════════════════
   HalfSheet — Premium iOS-quality bottom sheet with spring physics,
   velocity-based dismiss, snap points, and buttery-smooth drag interaction.
   ══════════════════════════════════════════════════════════════════════════════ */

export interface HalfSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  /** Snap points as viewport-height fractions, e.g. [0.4, 0.7, 0.95] */
  snapPoints?: number[]
  /** Index into snapPoints for the initial position. Default: 0 */
  initialSnap?: number
  title?: string
  subtitle?: string
  /** Show the drag handle pill. Default: true */
  showHandle?: boolean
  /** Allow backdrop tap and swipe dismiss. Default: true */
  dismissible?: boolean
  /** Called when the sheet snaps to a different point */
  onSnapChange?: (snapIndex: number) => void
  className?: string
  /** Scale the parent element down (iOS 16+ style). Default: true */
  scaleParent?: boolean
  /** Ref to the element to scale when sheet opens */
  parentRef?: React.RefObject<HTMLElement | null>
}

/* ── Constants ── */
const APPLE_EASE_IN = 'cubic-bezier(0.32, 0.72, 0, 1)'   // sheet open (decelerate + overshoot)
const APPLE_EASE_OUT = 'cubic-bezier(0.32, 0, 0.67, 0)'   // sheet close (accelerate)
const OPEN_DURATION = 340    // ms
const CLOSE_DURATION = 260   // ms — slightly snappier
const CONTENT_FADE_DELAY = 60 // ms after sheet reaches position
const VELOCITY_DISMISS_THRESHOLD = 0.5 // px/ms
const POSITION_DISMISS_THRESHOLD = 0.4 // fraction of sheet height
const RUBBER_BAND_FACTOR = 0.35
const SNAP_SPRING_DURATION = 300

/* ── Velocity tracker: keeps last N touch samples ── */
interface TouchSample {
  y: number
  t: number
}

function computeVelocity(samples: TouchSample[]): number {
  if (samples.length < 2) return 0
  const last = samples[samples.length - 1]
  const first = samples[0]
  const dt = last.t - first.t
  if (dt === 0) return 0
  return (last.y - first.y) / dt // px/ms, positive = downward
}

/* ── Component ── */
export function HalfSheet({
  isOpen,
  onClose,
  children,
  snapPoints = [0.5],
  initialSnap = 0,
  title,
  subtitle,
  showHandle = true,
  dismissible = true,
  onSnapChange,
  className,
  scaleParent = true,
  parentRef,
}: HalfSheetProps) {
  // ── Refs ──
  const sheetRef = React.useRef<HTMLDivElement>(null)
  const backdropRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const scrollContentRef = React.useRef<HTMLDivElement>(null)

  // Drag state kept in refs for RAF performance (no re-renders per pixel)
  const dragState = React.useRef({
    active: false,
    startY: 0,
    startTranslateY: 0,
    currentTranslateY: 0,
    samples: [] as TouchSample[],
    rafId: 0,
    sheetHeight: 0,
  })

  // ── State ──
  const [phase, setPhase] = React.useState<'closed' | 'opening' | 'open' | 'closing'>('closed')
  const [currentSnap, setCurrentSnap] = React.useState(initialSnap)
  const [mounted, setMounted] = React.useState(false)

  // Reduced motion preference
  const reducedMotion = React.useRef(false)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
  }, [])

  // Ensure we only portal on client
  React.useEffect(() => setMounted(true), [])

  // ── Snap point helpers ──
  const getSheetHeightForSnap = React.useCallback(
    (snapIndex: number) => {
      const fraction = snapPoints[snapIndex] ?? snapPoints[0]
      return Math.round(window.innerHeight * fraction)
    },
    [snapPoints],
  )

  const findNearestSnap = React.useCallback(
    (currentHeight: number) => {
      const vh = window.innerHeight
      let nearest = 0
      let minDist = Infinity
      for (let i = 0; i < snapPoints.length; i++) {
        const dist = Math.abs(currentHeight - vh * snapPoints[i])
        if (dist < minDist) {
          minDist = dist
          nearest = i
        }
      }
      return nearest
    },
    [snapPoints],
  )

  // ── Parent scaling (iOS 16+) ──
  const applyParentScale = React.useCallback(
    (scale: number, instant = false) => {
      if (!scaleParent || !parentRef?.current) return
      const el = parentRef.current
      const dur = instant || reducedMotion.current ? '0ms' : `${OPEN_DURATION}ms`
      el.style.transition = `transform ${dur} ${APPLE_EASE_IN}, border-radius ${dur} ${APPLE_EASE_IN}`
      el.style.transformOrigin = 'top center'
      el.style.transform = `scale(${scale})`
      el.style.borderRadius = scale < 1 ? '12px' : '0px'
      el.style.overflow = scale < 1 ? 'hidden' : ''
    },
    [scaleParent, parentRef],
  )

  const resetParentScale = React.useCallback(() => {
    if (!parentRef?.current) return
    const el = parentRef.current
    const dur = reducedMotion.current ? '0ms' : `${CLOSE_DURATION}ms`
    el.style.transition = `transform ${dur} ${APPLE_EASE_OUT}, border-radius ${dur} ${APPLE_EASE_OUT}`
    el.style.transform = 'scale(1)'
    el.style.borderRadius = '0px'
    // Clean up after transition
    const cleanup = () => {
      el.style.transition = ''
      el.style.transformOrigin = ''
      el.style.overflow = ''
      el.removeEventListener('transitionend', cleanup)
    }
    el.addEventListener('transitionend', cleanup, { once: true })
  }, [parentRef])

  // ── Body scroll lock ──
  const lockBodyScroll = React.useCallback(() => {
    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'
  }, [])

  const unlockBodyScroll = React.useCallback(() => {
    document.body.style.overflow = ''
    document.body.style.touchAction = ''
  }, [])

  // ── Open / close lifecycle ──
  React.useEffect(() => {
    if (isOpen && phase === 'closed') {
      // Begin opening
      setCurrentSnap(initialSnap)
      setPhase('opening')
      lockBodyScroll()

      // Let the DOM paint at translateY(100%), then animate in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const sheet = sheetRef.current
          const backdrop = backdropRef.current
          const content = contentRef.current
          if (!sheet || !backdrop) return

          const height = getSheetHeightForSnap(initialSnap)
          dragState.current.sheetHeight = height

          if (reducedMotion.current) {
            // Instant — no animation
            sheet.style.transition = 'none'
            sheet.style.transform = 'translateY(0)'
            sheet.style.height = `${height}px`
            backdrop.style.transition = 'none'
            backdrop.style.opacity = '1'
            if (content) {
              content.style.transition = 'none'
              content.style.opacity = '1'
            }
            applyParentScale(0.97, true)
            setPhase('open')
          } else {
            // Animated open
            sheet.style.height = `${height}px`
            sheet.style.transition = `transform ${OPEN_DURATION}ms ${APPLE_EASE_IN}`
            sheet.style.transform = 'translateY(0)'
            backdrop.style.transition = `opacity ${OPEN_DURATION}ms ease-out`
            backdrop.style.opacity = '1'
            applyParentScale(0.97)

            // Content fades in with delay
            if (content) {
              setTimeout(() => {
                if (content) {
                  content.style.transition = `opacity 200ms ease-out`
                  content.style.opacity = '1'
                }
              }, CONTENT_FADE_DELAY)
            }

            // Transition to "open" phase when animation completes
            const onEnd = () => {
              sheet.removeEventListener('transitionend', onEnd)
              setPhase('open')
            }
            sheet.addEventListener('transitionend', onEnd, { once: true })
            // Fallback in case transitionend doesn't fire
            setTimeout(() => setPhase('open'), OPEN_DURATION + 50)
          }
        })
      })
    }

    if (!isOpen && (phase === 'open' || phase === 'opening')) {
      performClose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const performClose = React.useCallback(
    (fromTranslateY?: number) => {
      if (phase === 'closing' || phase === 'closed') return
      setPhase('closing')
      resetParentScale()

      const sheet = sheetRef.current
      const backdrop = backdropRef.current
      const content = contentRef.current
      if (!sheet || !backdrop) return

      if (content) {
        content.style.transition = 'none'
        content.style.opacity = '0'
      }

      if (reducedMotion.current) {
        sheet.style.transition = 'none'
        sheet.style.transform = 'translateY(100%)'
        backdrop.style.transition = 'none'
        backdrop.style.opacity = '0'
        unlockBodyScroll()
        setPhase('closed')
        return
      }

      // Animate from current position or from resting
      const startY = fromTranslateY !== undefined ? fromTranslateY : 0
      sheet.style.transform = `translateY(${startY}px)`

      // Force reflow so the browser registers the starting position
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      sheet.offsetHeight

      sheet.style.transition = `transform ${CLOSE_DURATION}ms ${APPLE_EASE_OUT}`
      sheet.style.transform = 'translateY(100%)'
      backdrop.style.transition = `opacity ${CLOSE_DURATION}ms ease-in`
      backdrop.style.opacity = '0'

      const onEnd = () => {
        sheet.removeEventListener('transitionend', onEnd)
        unlockBodyScroll()
        setPhase('closed')
      }
      sheet.addEventListener('transitionend', onEnd, { once: true })
      setTimeout(() => {
        unlockBodyScroll()
        setPhase('closed')
      }, CLOSE_DURATION + 50)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase, resetParentScale, unlockBodyScroll],
  )

  // ── Snap to a specific point (animated) ──
  const snapTo = React.useCallback(
    (snapIndex: number) => {
      const sheet = sheetRef.current
      if (!sheet) return
      const newHeight = getSheetHeightForSnap(snapIndex)
      const _currentHeight = dragState.current.sheetHeight

      // Compute translateY relative to new height
      sheet.style.height = `${newHeight}px`
      dragState.current.sheetHeight = newHeight
      dragState.current.currentTranslateY = 0

      if (reducedMotion.current) {
        sheet.style.transition = 'none'
        sheet.style.transform = 'translateY(0)'
      } else {
        sheet.style.transition = `transform ${SNAP_SPRING_DURATION}ms ${APPLE_EASE_IN}, height ${SNAP_SPRING_DURATION}ms ${APPLE_EASE_IN}`
        sheet.style.transform = 'translateY(0)'
      }

      if (snapIndex !== currentSnap) {
        setCurrentSnap(snapIndex)
        onSnapChange?.(snapIndex)
      }
    },
    [currentSnap, getSheetHeightForSnap, onSnapChange],
  )

  // ── Drag handling (touch + mouse) ──
  const isScrolledToTop = React.useCallback(() => {
    const el = scrollContentRef.current
    if (!el) return true
    return el.scrollTop <= 0
  }, [])

  const onDragStart = React.useCallback(
    (clientY: number) => {
      if (phase !== 'open') return
      // Only start drag if content is scrolled to top
      if (!isScrolledToTop()) return

      const sheet = sheetRef.current
      if (!sheet) return

      // Remove transitions for direct manipulation
      sheet.style.transition = 'none'
      sheet.style.willChange = 'transform'

      dragState.current.active = true
      dragState.current.startY = clientY
      dragState.current.startTranslateY = dragState.current.currentTranslateY
      dragState.current.samples = [{ y: clientY, t: performance.now() }]
    },
    [phase, isScrolledToTop],
  )

  const onDragMove = React.useCallback(
    (clientY: number) => {
      if (!dragState.current.active) return

      const ds = dragState.current
      const deltaY = clientY - ds.startY
      let newTranslateY = ds.startTranslateY + deltaY

      // Rubber-band when dragging UP past rest position
      if (newTranslateY < 0) {
        newTranslateY = newTranslateY * RUBBER_BAND_FACTOR
      }

      ds.currentTranslateY = newTranslateY

      // Track velocity samples (keep last 5)
      const now = performance.now()
      ds.samples.push({ y: clientY, t: now })
      if (ds.samples.length > 5) ds.samples.shift()

      // Update backdrop opacity based on drag position
      const progress = Math.max(0, Math.min(1, 1 - newTranslateY / ds.sheetHeight))
      const backdrop = backdropRef.current
      if (backdrop) {
        backdrop.style.opacity = String(progress)
      }

      // Apply transform via RAF
      cancelAnimationFrame(ds.rafId)
      ds.rafId = requestAnimationFrame(() => {
        const sheet = sheetRef.current
        if (sheet) {
          sheet.style.transform = `translateY(${newTranslateY}px)`
        }
      })
    },
    [],
  )

  const onDragEnd = React.useCallback(() => {
    if (!dragState.current.active) return
    dragState.current.active = false

    const ds = dragState.current
    const sheet = sheetRef.current
    if (!sheet) return

    sheet.style.willChange = ''

    const velocity = computeVelocity(ds.samples) // px/ms, positive = down
    const translateY = ds.currentTranslateY
    const heightFractionDragged = translateY / ds.sheetHeight

    // Velocity-based dismiss
    if (dismissible && velocity > VELOCITY_DISMISS_THRESHOLD) {
      performClose(translateY)
      onClose()
      return
    }

    // Position-based dismiss
    if (dismissible && heightFractionDragged > POSITION_DISMISS_THRESHOLD) {
      performClose(translateY)
      onClose()
      return
    }

    // Otherwise, find nearest snap and spring to it
    const effectiveHeight = ds.sheetHeight - translateY
    const nearestSnap = findNearestSnap(effectiveHeight)

    // Spring back to snap point
    ds.currentTranslateY = 0
    if (reducedMotion.current) {
      sheet.style.transition = 'none'
    } else {
      sheet.style.transition = `transform ${SNAP_SPRING_DURATION}ms ${APPLE_EASE_IN}`
    }
    sheet.style.transform = 'translateY(0)'

    // Restore backdrop
    const backdrop = backdropRef.current
    if (backdrop) {
      backdrop.style.transition = `opacity ${SNAP_SPRING_DURATION}ms ease-out`
      backdrop.style.opacity = '1'
    }

    if (nearestSnap !== currentSnap) {
      snapTo(nearestSnap)
    }
  }, [dismissible, currentSnap, findNearestSnap, onClose, performClose, snapTo])

  // ── Touch event handlers ──
  const handleTouchStart = React.useCallback(
    (e: React.TouchEvent) => {
      onDragStart(e.touches[0].clientY)
    },
    [onDragStart],
  )

  const handleTouchMove = React.useCallback(
    (e: React.TouchEvent) => {
      if (dragState.current.active) {
        e.preventDefault() // prevent scroll while dragging sheet
      }
      onDragMove(e.touches[0].clientY)
    },
    [onDragMove],
  )

  const handleTouchEnd = React.useCallback(() => onDragEnd(), [onDragEnd])

  // ── Mouse event handlers (desktop testing) ──
  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      onDragStart(e.clientY)
      const onMouseMove = (ev: MouseEvent) => onDragMove(ev.clientY)
      const onMouseUp = () => {
        onDragEnd()
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
      }
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
    },
    [onDragStart, onDragMove, onDragEnd],
  )

  // ── Backdrop click ──
  const handleBackdropClick = React.useCallback(
    (e: React.MouseEvent) => {
      if (!dismissible) return
      if (e.target === e.currentTarget) onClose()
    },
    [dismissible, onClose],
  )

  // ── Keyboard: Escape + focus trap ──
  React.useEffect(() => {
    if (phase === 'closed') return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible) {
        e.preventDefault()
        onClose()
        return
      }

      // Focus trap
      if (e.key === 'Tab' && sheetRef.current) {
        const focusable = sheetRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        if (focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [phase, dismissible, onClose])

  // ── Focus management: focus sheet on open ──
  React.useEffect(() => {
    if (phase === 'open' && sheetRef.current) {
      // Focus the first focusable element, or the sheet itself
      const firstFocusable = sheetRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (firstFocusable) {
        firstFocusable.focus()
      } else {
        sheetRef.current.focus()
      }
    }
  }, [phase])

  // ── Cleanup on unmount ──
  React.useEffect(() => {
    const drag = dragState.current
    return () => {
      unlockBodyScroll()
      cancelAnimationFrame(drag.rafId)
    }
  }, [unlockBodyScroll])

  // ── Don't render if fully closed ──
  if (phase === 'closed' && !isOpen) return null
  if (!mounted) return null

  const sheetHeight = getSheetHeightForSnap(currentSnap)
  const isClosing = phase === 'closing'

  return createPortal(
    <>
      {/* ── Backdrop ── */}
      <div
        ref={backdropRef}
        className="half-sheet-backdrop"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          opacity: 0,
          pointerEvents: isClosing ? 'none' : 'auto',
        }}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* ── Sheet ── */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Bottom sheet'}
        tabIndex={-1}
        className={cn('half-sheet', className)}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          width: '100%',
          maxWidth: 430,
          height: sheetHeight,
          maxHeight: '95dvh',
          marginLeft: 'auto',
          marginRight: 'auto',
          transform: 'translateY(100%)',
          background: '#FFFFFF',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          boxShadow: '0 -4px 32px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          outline: 'none',
          touchAction: 'none',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* ── Drag handle ── */}
        {showHandle && (
          <div
            className="half-sheet__handle-area"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 8,
              paddingBottom: 4,
              cursor: 'grab',
              touchAction: 'none',
              flexShrink: 0,
            }}
            onMouseDown={handleMouseDown}
            role="separator"
            aria-orientation="horizontal"
            aria-label="Drag to resize"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp' && currentSnap < snapPoints.length - 1) {
                snapTo(currentSnap + 1)
              }
              if (e.key === 'ArrowDown') {
                if (currentSnap > 0) {
                  snapTo(currentSnap - 1)
                } else if (dismissible) {
                  onClose()
                }
              }
            }}
          >
            <div
              style={{
                width: 36,
                height: 5,
                borderRadius: 9999,
                backgroundColor: '#D1D5DB',
              }}
            />
          </div>
        )}

        {/* ── Header (title + subtitle) ── */}
        {(title || subtitle) && (
          <div
            style={{
              paddingLeft: 16,
              paddingRight: 16,
              paddingTop: showHandle ? 4 : 16,
              paddingBottom: 8,
              flexShrink: 0,
            }}
          >
            {title && (
              <h2
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  lineHeight: '22px',
                  letterSpacing: -0.085,
                  color: '#2D3748',
                  margin: 0,
                }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                style={{
                  fontSize: 15,
                  lineHeight: '20px',
                  color: '#718096',
                  margin: 0,
                  marginTop: 2,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* ── Content ── */}
        <div
          ref={contentRef}
          style={{ opacity: 0, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
        >
          <div
            ref={scrollContentRef}
            className="half-sheet__content"
            style={{
              flex: 1,
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch',
              paddingLeft: 16,
              paddingRight: 16,
              paddingBottom: 16,
              minHeight: 0,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}
