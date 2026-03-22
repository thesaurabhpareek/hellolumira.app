'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Trophy,
  X,
} from 'lucide-react'

/* ── Toast / Notification System ─────────────────────────────────
 *  Slide-down toasts with auto-dismiss, swipe-to-dismiss, action
 *  buttons, achievement variant, and a queue system.
 * ─────────────────────────────────────────────────────────────── */

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'achievement'

export interface ToastData {
  id: string
  type: ToastType
  title: string
  description?: string
  /** Duration in ms. 0 = persistent. Default: 3000 */
  duration?: number
  /** Optional action button */
  action?: {
    label: string
    onClick: () => void
  }
}

/* ── Toast styling config ── */
const TOAST_CONFIG: Record<
  ToastType,
  { icon: React.ElementType; bg: string; border: string; iconColor: string }
> = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-[var(--color-green-light)]',
    border: 'border-[var(--color-green)]/20',
    iconColor: 'text-[var(--color-green)]',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-[var(--color-red-light)]',
    border: 'border-[var(--color-red)]/20',
    iconColor: 'text-[var(--color-red)]',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-[var(--color-amber-light)]',
    border: 'border-[var(--color-amber)]/20',
    iconColor: 'text-[var(--color-amber)]',
  },
  info: {
    icon: Info,
    bg: 'bg-[var(--color-primary-light)]',
    border: 'border-[var(--color-primary)]/20',
    iconColor: 'text-[var(--color-primary)]',
  },
  achievement: {
    icon: Trophy,
    bg: 'bg-gradient-to-r from-[#FFFFF0] to-[#FDF0E6]',
    border: 'border-[#D69E2E]/30',
    iconColor: 'text-[#D69E2E]',
  },
}

/* ── Individual Toast ── */

interface ToastItemProps {
  toast: ToastData
  onDismiss: (id: string) => void
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const config = TOAST_CONFIG[toast.type]
  const Icon = config.icon
  const [isExiting, setIsExiting] = React.useState(false)
  const [swipeX, setSwipeX] = React.useState(0)
  const startXRef = React.useRef(0)
  const isDragging = React.useRef(false)

  // Auto-dismiss
  React.useEffect(() => {
    const dur = toast.duration ?? 3000
    if (dur === 0) return
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => onDismiss(toast.id), 300)
    }, dur)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onDismiss])

  const dismiss = () => {
    setIsExiting(true)
    setTimeout(() => onDismiss(toast.id), 300)
  }

  // Swipe to dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX
    isDragging.current = true
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return
    const delta = e.touches[0].clientX - startXRef.current
    setSwipeX(delta)
  }
  const handleTouchEnd = () => {
    isDragging.current = false
    if (Math.abs(swipeX) > 100) {
      dismiss()
    } else {
      setSwipeX(0)
    }
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'relative w-full max-w-sm mx-auto',
        'border rounded-xl p-4',
        'shadow-[0_4px_20px_rgba(0,0,0,0.08)]',
        config.bg,
        config.border,
        /* Entry/exit animation */
        'transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
        'motion-reduce:transition-none',
        isExiting
          ? 'opacity-0 -translate-y-3 scale-95'
          : 'opacity-100 translate-y-0 scale-100',
        /* Initial entry */
        'animate-[toast-in_0.35s_cubic-bezier(0.32,0.72,0,1)]',
        'motion-reduce:animate-none'
      )}
      style={{
        transform: swipeX
          ? `translateX(${swipeX}px) rotate(${swipeX * 0.02}deg)`
          : undefined,
        opacity: swipeX ? 1 - Math.abs(swipeX) / 200 : undefined,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <Icon
          className={cn('size-5 shrink-0 mt-0.5', config.iconColor)}
          aria-hidden="true"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-[var(--color-slate)] leading-tight">
            {toast.title}
          </p>
          {toast.description && (
            <p className="mt-0.5 text-[13px] text-[var(--color-muted)] leading-snug">
              {toast.description}
            </p>
          )}
          {toast.action && (
            <button
              type="button"
              onClick={toast.action.onClick}
              className={cn(
                'mt-2 text-[13px] font-semibold',
                'text-[var(--color-primary)] hover:underline',
                'focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded'
              )}
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {/* Dismiss */}
        <button
          type="button"
          onClick={dismiss}
          className={cn(
            'shrink-0 p-1 rounded-full -mt-0.5 -mr-1',
            'text-[var(--color-muted)] hover:text-[var(--color-slate)]',
            'hover:bg-black/5',
            'transition-colors duration-150',
            'focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]'
          )}
          aria-label="Dismiss notification"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Achievement sparkle decoration */}
      {toast.type === 'achievement' && (
        <div
          className="absolute -top-1 -right-1 text-lg motion-reduce:hidden animate-[toast-sparkle_0.6s_ease-out]"
          aria-hidden="true"
        >
          &#10024;
        </div>
      )}
    </div>
  )
}

/* ── Toast Container (renders the queue) ── */

export interface ToastContainerProps {
  toasts: ToastData[]
  onDismiss: (id: string) => void
  /** Position. Default: 'top-center' */
  position?: 'top-center' | 'top-right' | 'bottom-center' | 'bottom-right'
}

export function ToastContainer({
  toasts,
  onDismiss,
  position = 'top-center',
}: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div
      className={cn(
        'fixed z-[100] flex flex-col gap-2 pointer-events-none',
        'px-4 w-full max-w-md',
        position === 'top-center' && 'top-[max(12px,env(safe-area-inset-top))] left-1/2 -translate-x-1/2',
        position === 'top-right' && 'top-[max(12px,env(safe-area-inset-top))] right-4',
        position === 'bottom-center' && 'bottom-[max(12px,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2',
        position === 'bottom-right' && 'bottom-[max(12px,env(safe-area-inset-bottom))] right-4'
      )}
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  )
}

/* ── useToast hook ── */

let toastCounter = 0

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastData[]>([])

  const addToast = React.useCallback(
    (toast: Omit<ToastData, 'id'>) => {
      const id = `toast-${++toastCounter}-${Date.now()}`
      setToasts((prev) => [...prev, { ...toast, id }])
      return id
    },
    []
  )

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const dismissAll = React.useCallback(() => {
    setToasts([])
  }, [])

  return {
    toasts,
    addToast,
    dismissToast,
    dismissAll,
    /** Convenience methods */
    success: (title: string, opts?: Partial<Omit<ToastData, 'id' | 'type' | 'title'>>) =>
      addToast({ type: 'success', title, ...opts }),
    error: (title: string, opts?: Partial<Omit<ToastData, 'id' | 'type' | 'title'>>) =>
      addToast({ type: 'error', title, ...opts }),
    warning: (title: string, opts?: Partial<Omit<ToastData, 'id' | 'type' | 'title'>>) =>
      addToast({ type: 'warning', title, ...opts }),
    info: (title: string, opts?: Partial<Omit<ToastData, 'id' | 'type' | 'title'>>) =>
      addToast({ type: 'info', title, ...opts }),
    achievement: (title: string, opts?: Partial<Omit<ToastData, 'id' | 'type' | 'title'>>) =>
      addToast({ type: 'achievement', title, ...opts }),
  }
}
