'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

/* ── Premium Card ────────────────────────────────────────────────
 *  Multi-variant card with hover lift, press feedback, glass
 *  morphism, and image overlay support.
 * ─────────────────────────────────────────────────────────────── */

const premiumCardVariants = cva(
  [
    'group/premium-card relative flex flex-col overflow-hidden',
    'transition-all duration-200 ease-out',
    'motion-reduce:transition-none',
    '-webkit-tap-highlight-color-transparent',
  ].join(' '),
  {
    variants: {
      variant: {
        elevated: [
          'bg-[var(--color-white)] dark:bg-[rgb(var(--card))]',
          'rounded-xl',
          'shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]',
          'hover:shadow-[0_4px_16px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04)]',
          'hover:-translate-y-0.5 motion-reduce:hover:translate-y-0',
          'active:scale-[0.98] motion-reduce:active:scale-100',
        ].join(' '),
        filled: [
          'bg-[var(--color-surface)] dark:bg-[rgb(var(--card))]',
          'rounded-xl',
          'hover:bg-[var(--color-primary-light)]',
          'active:scale-[0.98] motion-reduce:active:scale-100',
        ].join(' '),
        outlined: [
          'bg-[var(--color-white)] dark:bg-[rgb(var(--card))]',
          'rounded-xl',
          'border border-[var(--color-border)]',
          'hover:border-[var(--color-primary-mid)]',
          'hover:-translate-y-0.5 motion-reduce:hover:translate-y-0',
          'active:scale-[0.98] motion-reduce:active:scale-100',
        ].join(' '),
        glass: [
          'bg-white/60 dark:bg-white/10',
          'backdrop-blur-[20px] backdrop-saturate-150',
          'rounded-xl',
          'border border-white/30 dark:border-white/10',
          'shadow-[0_4px_24px_rgba(0,0,0,0.06)]',
          'hover:bg-white/70 dark:hover:bg-white/15',
          'hover:-translate-y-0.5 motion-reduce:hover:translate-y-0',
          'active:scale-[0.98] motion-reduce:active:scale-100',
        ].join(' '),
      },
      padding: {
        compact: 'p-3',
        default: 'p-5',
        spacious: 'p-6',
        none: 'p-0',
      },
      interactive: {
        true: 'cursor-pointer',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'elevated',
      padding: 'default',
      interactive: false,
    },
  }
)

export interface PremiumCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof premiumCardVariants> {}

const PremiumCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ className, variant, padding, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(premiumCardVariants({ variant, padding, interactive }), className)}
      {...props}
    />
  )
)
PremiumCard.displayName = 'PremiumCard'

/* ── Sub-components ── */

const PremiumCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-between gap-3', className)}
    {...props}
  />
))
PremiumCardHeader.displayName = 'PremiumCardHeader'

const PremiumCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex-1', className)}
    {...props}
  />
))
PremiumCardContent.displayName = 'PremiumCardContent'

const PremiumCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center gap-2 pt-3 border-t border-[var(--color-border)]',
      className
    )}
    {...props}
  />
))
PremiumCardFooter.displayName = 'PremiumCardFooter'

/* ── Image Card ── */

export interface PremiumImageCardProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string
  alt: string
  /** Height of the image area */
  imageHeight?: string
  /** Render content overlaid on the image gradient */
  overlay?: React.ReactNode
  variant?: 'elevated' | 'filled' | 'outlined' | 'glass'
}

const PremiumImageCard = React.forwardRef<HTMLDivElement, PremiumImageCardProps>(
  (
    {
      className,
      src,
      alt,
      imageHeight = '200px',
      overlay,
      variant = 'elevated',
      children,
      ...props
    },
    ref
  ) => (
    <PremiumCard
      ref={ref}
      variant={variant}
      padding="none"
      interactive
      className={className}
      {...props}
    >
      {/* Image area */}
      <div className="relative overflow-hidden" style={{ height: imageHeight }}>
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        {/* Overlay content */}
        {overlay && (
          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            {overlay}
          </div>
        )}
      </div>
      {/* Body content */}
      {children && <div className="p-5">{children}</div>}
    </PremiumCard>
  )
)
PremiumImageCard.displayName = 'PremiumImageCard'

export {
  PremiumCard,
  PremiumCardHeader,
  PremiumCardContent,
  PremiumCardFooter,
  PremiumImageCard,
  premiumCardVariants,
}
