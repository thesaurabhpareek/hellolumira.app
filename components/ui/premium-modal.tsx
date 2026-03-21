'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

/* ── Premium Modal / Dialog ──────────────────────────────────────
 *  Centered modal with backdrop blur, scale-in animation, iOS
 *  action sheet variant, focus trapping, and escape-to-close.
 * ─────────────────────────────────────────────────────────────── */

export interface PremiumModalProps {
  open: boolean
  onClose: () => void
  /** 'dialog' = centered modal; 'action-sheet' = iOS-style bottom sheet */
  variant?: 'dialog' | 'action-sheet'
  /** Show the X close button. Default: true for dialog, false for action-sheet */
  showClose?: boolean
  /** Additional class for the panel */
  className?: string
  children?: React.ReactNode
}

export function PremiumModal({
  open,
  onClose,
  variant = 'dialog',
  showClose,
  className,
  children,
}: PremiumModalProps) {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = React.useState(false)
  const [isAnimatingIn, setIsAnimatingIn] = React.useState(false)
  const showCloseButton = showClose ?? variant === 'dialog'

  // Lifecycle
  React.useEffect(() => {
    if (open) {
      setIsVisible(true)
      // Force layout before animating in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimatingIn(true)
        })
      })
      document.body.style.overflow = 'hidden'
    } else {
      setIsAnimatingIn(false)
      const timeout = setTimeout(() => setIsVisible(false), 200)
      document.body.style.overflow = ''
      return () => clearTimeout(timeout)
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Focus trap
  React.useEffect(() => {
    if (!open || !panelRef.current) return

    const panel = panelRef.current
    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstEl = focusable[0]
    const lastEl = focusable[focusable.length - 1]

    // Focus the first element
    firstEl?.focus()

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      if (focusable.length === 0) {
        e.preventDefault()
        return
      }
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault()
          lastEl?.focus()
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault()
          firstEl?.focus()
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!isVisible) return null

  const isDialog = variant === 'dialog'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black/30 backdrop-blur-[4px]',
          'transition-opacity duration-200 motion-reduce:transition-none',
          isAnimatingIn ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-10',
          'transition-all duration-200 ease-out motion-reduce:transition-none',
          isDialog && [
            'w-[calc(100%-2rem)] max-w-sm mx-auto',
            'bg-[var(--color-white)] dark:bg-[rgb(var(--card))]',
            'rounded-2xl',
            'shadow-[0_8px_40px_rgba(0,0,0,0.12)]',
            'p-5',
            isAnimatingIn
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 translate-y-2',
          ],
          !isDialog && [
            'fixed inset-x-0 bottom-0',
            'w-full max-w-lg mx-auto',
            'bg-[var(--color-white)] dark:bg-[rgb(var(--card))]',
            'rounded-t-2xl',
            'shadow-[0_-4px_24px_rgba(0,0,0,0.12)]',
            'p-5 pb-[max(20px,env(safe-area-inset-bottom))]',
            isAnimatingIn
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-full',
          ],
          className
        )}
      >
        {/* Close button */}
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'absolute top-3 right-3',
              'p-1.5 rounded-full',
              'text-[var(--color-muted)] hover:text-[var(--color-slate)]',
              'hover:bg-[var(--color-surface)]',
              'transition-colors duration-150',
              'focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]'
            )}
            aria-label="Close dialog"
          >
            <X className="size-5" />
          </button>
        )}

        {children}
      </div>
    </div>
  )
}

/* ── Sub-components for composition ── */

export function PremiumModalTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn('text-[17px] font-semibold text-[var(--color-slate)] mb-1', className)}
      {...props}
    />
  )
}

export function PremiumModalDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-[15px] text-[var(--color-muted)] leading-relaxed mb-4', className)}
      {...props}
    />
  )
}

export function PremiumModalActions({
  className,
  stacked = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { stacked?: boolean }) {
  return (
    <div
      className={cn(
        'flex gap-3',
        stacked ? 'flex-col' : 'flex-row justify-end',
        className
      )}
      {...props}
    />
  )
}
