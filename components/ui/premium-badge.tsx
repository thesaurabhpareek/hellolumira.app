'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

/* ── Premium Badge ───────────────────────────────────────────────
 *  Status dots, notification counts, achievement badges with
 *  animated entry, pulse for unread, and tier support.
 * ─────────────────────────────────────────────────────────────── */

/* ── Color map for the badge palette ── */
const BADGE_COLORS = {
  sage:  { bg: 'bg-[#EDF4F2]', text: 'text-[#3D8178]', dot: 'bg-[#3D8178]' },
  terra: { bg: 'bg-[#FDF0E6]', text: 'text-[#C4844E]', dot: 'bg-[#C4844E]' },
  coral: { bg: 'bg-[#FFF0F0]', text: 'text-[#C53030]', dot: 'bg-[#C53030]' },
  amber: { bg: 'bg-[#FFFFF0]', text: 'text-[#D69E2E]', dot: 'bg-[#D69E2E]' },
  rose:  { bg: 'bg-[#FFF5F7]', text: 'text-[#D4607C]', dot: 'bg-[#D4607C]' },
  sky:   { bg: 'bg-[#EFF6FF]', text: 'text-[#1A365D]', dot: 'bg-[#1A365D]' },
} as const

export type BadgeColor = keyof typeof BADGE_COLORS

/* ── Status Badge (dot + text) ── */

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor
  /** Show a pulse animation for "new" or "unread" */
  pulse?: boolean
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, color = 'sage', pulse = false, children, ...props }, ref) => {
    const c = BADGE_COLORS[color]
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full',
          'text-[12px] font-medium leading-tight',
          c.bg,
          c.text,
          'motion-reduce:animate-none',
          className
        )}
        {...props}
      >
        {/* Status dot */}
        <span className="relative flex size-2 shrink-0">
          <span
            className={cn(
              'absolute inset-0 rounded-full',
              c.dot,
              pulse && 'animate-ping opacity-75 motion-reduce:animate-none'
            )}
          />
          <span className={cn('relative size-2 rounded-full', c.dot)} />
        </span>
        {children}
      </span>
    )
  }
)
StatusBadge.displayName = 'StatusBadge'

/* ── Count Badge (notification bubble) ── */

export interface CountBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The count to display. Shows "99+" when > max */
  count: number
  /** Maximum number before showing "{max}+". Default: 99 */
  max?: number
  color?: BadgeColor
  /** Show a pulse animation */
  pulse?: boolean
}

const CountBadge = React.forwardRef<HTMLSpanElement, CountBadgeProps>(
  ({ className, count, max = 99, color = 'coral', pulse = false, ...props }, ref) => {
    if (count <= 0) return null

    const display = count > max ? `${max}+` : String(count)
    const c = BADGE_COLORS[color]

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center',
          'min-w-[20px] h-5 px-1.5 rounded-full',
          'text-[11px] font-bold leading-none text-white tabular-nums',
          c.dot, // Uses the dot color as background for filled bubble
          pulse && 'animate-bounce motion-reduce:animate-none',
          'transition-transform duration-200 motion-reduce:transition-none',
          /* Scale bounce entry */
          'animate-[badge-scale-in_0.3s_cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:animate-none',
          className
        )}
        aria-label={`${count} notification${count !== 1 ? 's' : ''}`}
        {...props}
      >
        {display}
      </span>
    )
  }
)
CountBadge.displayName = 'CountBadge'

/* ── Achievement Badge ── */

const TIER_STYLES = {
  bronze: {
    ring: 'ring-[#CD7F32]/40',
    bg: 'bg-gradient-to-br from-[#CD7F32] to-[#A0522D]',
    shine: 'from-[#CD7F32]/0 via-[#DEB887]/60 to-[#CD7F32]/0',
  },
  silver: {
    ring: 'ring-[#C0C0C0]/40',
    bg: 'bg-gradient-to-br from-[#C0C0C0] to-[#808080]',
    shine: 'from-[#C0C0C0]/0 via-white/60 to-[#C0C0C0]/0',
  },
  gold: {
    ring: 'ring-[#FFD700]/40',
    bg: 'bg-gradient-to-br from-[#FFD700] to-[#DAA520]',
    shine: 'from-[#FFD700]/0 via-white/70 to-[#FFD700]/0',
  },
} as const

export type AchievementTier = keyof typeof TIER_STYLES

export interface AchievementBadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  tier?: AchievementTier
  /** Icon or emoji to display inside */
  icon: React.ReactNode
  /** Size in px. Default: 48 */
  size?: number
  /** Play the shine animation */
  shine?: boolean
}

const AchievementBadge = React.forwardRef<HTMLDivElement, AchievementBadgeProps>(
  (
    { className, tier = 'gold', icon, size = 48, shine = true, ...props },
    ref
  ) => {
    const t = TIER_STYLES[tier]

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center',
          'rounded-full ring-4',
          t.ring,
          t.bg,
          'text-white',
          /* Scale bounce entry */
          'animate-[badge-scale-in_0.4s_cubic-bezier(0.34,1.56,0.64,1)]',
          'motion-reduce:animate-none',
          className
        )}
        style={{ width: size, height: size, fontSize: size * 0.45 }}
        {...props}
      >
        {icon}

        {/* Shine sweep */}
        {shine && (
          <div
            className={cn(
              'absolute inset-0 rounded-full overflow-hidden pointer-events-none',
              'motion-reduce:hidden'
            )}
          >
            <div
              className={cn(
                'absolute inset-0',
                'bg-gradient-to-r',
                t.shine,
                'animate-[badge-shine_2.5s_ease-in-out_infinite]'
              )}
              style={{ transform: 'skewX(-20deg) translateX(-100%)' }}
            />
          </div>
        )}
      </div>
    )
  }
)
AchievementBadge.displayName = 'AchievementBadge'

export { StatusBadge, CountBadge, AchievementBadge, BADGE_COLORS }
