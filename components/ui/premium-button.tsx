'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

/* ── Premium Button ──────────────────────────────────────────────
 *  iOS-caliber button with haptic-feel press, loading states,
 *  icon slots, and reduced-motion support.
 * ─────────────────────────────────────────────────────────────── */

const premiumButtonVariants = cva(
  [
    'group/premium-btn relative inline-flex items-center justify-center gap-2',
    'font-semibold whitespace-nowrap select-none',
    'transition-all duration-150 ease-out',
    'outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    '-webkit-tap-highlight-color-transparent touch-manipulation',
    /* haptic-feel press */
    'active:scale-[0.97] active:shadow-sm',
    /* reduced motion */
    'motion-reduce:transition-none motion-reduce:active:scale-100',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: [
          'bg-[var(--color-primary)] text-white',
          'shadow-[0_2px_8px_rgba(61,129,120,0.25)]',
          'hover:shadow-[0_4px_16px_rgba(61,129,120,0.35)]',
          'hover:brightness-105',
          'active:shadow-[0_1px_4px_rgba(61,129,120,0.2)]',
        ].join(' '),
        'primary-gradient': [
          'bg-gradient-to-r from-[#3D8178] to-[#2B9E8F] text-white',
          'shadow-[0_2px_8px_rgba(61,129,120,0.25)]',
          'hover:shadow-[0_4px_16px_rgba(61,129,120,0.35)]',
          'hover:brightness-105',
          'active:shadow-[0_1px_4px_rgba(61,129,120,0.2)]',
        ].join(' '),
        secondary: [
          'bg-[var(--color-primary-light)] text-[var(--color-primary)]',
          'border border-[var(--color-primary-mid)]',
          'hover:bg-[var(--color-primary-mid)]/30',
          'active:bg-[var(--color-primary-mid)]/50',
        ].join(' '),
        tertiary: [
          'bg-[var(--color-surface)] text-[var(--color-slate)]',
          'border border-[var(--color-border)]',
          'hover:bg-[var(--color-primary-light)] hover:border-[var(--color-primary-mid)]',
          'hover:text-[var(--color-primary)]',
        ].join(' '),
        ghost: [
          'bg-transparent text-[var(--color-muted)]',
          'hover:bg-[var(--color-surface)] hover:text-[var(--color-slate)]',
        ].join(' '),
        destructive: [
          'bg-[var(--color-red)] text-white',
          'shadow-[0_2px_8px_rgba(197,48,48,0.25)]',
          'hover:shadow-[0_4px_16px_rgba(197,48,48,0.35)]',
          'hover:brightness-105',
          'active:shadow-[0_1px_4px_rgba(197,48,48,0.2)]',
        ].join(' '),
      },
      size: {
        sm: 'h-8 px-3 text-[13px] rounded-md',
        md: 'h-[44px] px-5 text-[15px] rounded-lg',
        lg: 'h-[52px] px-6 text-[15px] rounded-lg',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
)

export interface PremiumButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof premiumButtonVariants> {
  /** Show a loading spinner and disable interaction */
  loading?: boolean
  /** Icon element to render before children */
  iconLeft?: React.ReactNode
  /** Icon element to render after children */
  iconRight?: React.ReactNode
}

const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading = false,
      iconLeft,
      iconRight,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          premiumButtonVariants({ variant, size, fullWidth }),
          loading && 'pointer-events-none',
          className
        )}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <Loader2
            className="size-[1.1em] animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
        )}

        {/* Icon left */}
        {!loading && iconLeft && (
          <span className="shrink-0 [&>svg]:size-[1.1em]" aria-hidden="true">
            {iconLeft}
          </span>
        )}

        {/* Label */}
        {children && (
          <span className={cn(loading && 'opacity-0 sr-only')}>
            {children}
          </span>
        )}

        {/* Visually hidden loading text for screen readers */}
        {loading && <span className="sr-only">Loading...</span>}

        {/* Icon right */}
        {!loading && iconRight && (
          <span className="shrink-0 [&>svg]:size-[1.1em]" aria-hidden="true">
            {iconRight}
          </span>
        )}
      </button>
    )
  }
)

PremiumButton.displayName = 'PremiumButton'

export { PremiumButton, premiumButtonVariants }
