'use client'

import * as React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

/* ── Premium Avatar ──────────────────────────────────────────────
 *  Multi-size avatar with image fallback to initials, status
 *  indicator, story ring, group stack, emoji variant, and
 *  press animation.
 * ─────────────────────────────────────────────────────────────── */

const SIZE_MAP = {
  xs: { px: 24, text: 'text-[10px]', ring: 'ring-[1.5px]', dot: 'size-1.5' },
  sm: { px: 32, text: 'text-[12px]', ring: 'ring-2', dot: 'size-2' },
  md: { px: 40, text: 'text-[14px]', ring: 'ring-2', dot: 'size-2.5' },
  lg: { px: 56, text: 'text-[18px]', ring: 'ring-[3px]', dot: 'size-3' },
  xl: { px: 80, text: 'text-[24px]', ring: 'ring-[3px]', dot: 'size-3.5' },
} as const

export type AvatarSize = keyof typeof SIZE_MAP

export interface PremiumAvatarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Image URL */
  src?: string | null
  /** Alt text for the image */
  alt?: string
  /** Fallback initials (e.g. "JS" for John Smith). Auto-derived from alt if not provided. */
  initials?: string
  /** Emoji to show instead of image/initials */
  emoji?: string
  size?: AvatarSize
  /** Show an online status dot */
  online?: boolean
  /** Show a story ring (unviewed = gradient, viewed = muted) */
  storyRing?: 'unviewed' | 'viewed' | false
  /** Press animation for interactive avatars */
  pressable?: boolean
}

function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return (parts[0]?.[0] ?? '?').toUpperCase()
}

const PremiumAvatar = React.forwardRef<HTMLDivElement, PremiumAvatarProps>(
  (
    {
      className,
      src,
      alt = '',
      initials: initialsProp,
      emoji,
      size = 'md',
      online,
      storyRing = false,
      pressable = false,
      ...props
    },
    ref
  ) => {
    const s = SIZE_MAP[size]
    const [imgError, setImgError] = React.useState(false)
    const showImage = src && !imgError && !emoji
    const fallbackInitials = initialsProp || deriveInitials(alt)

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex shrink-0 select-none',
          pressable && [
            'cursor-pointer',
            'transition-transform duration-150 ease-out',
            'active:scale-[0.92]',
            'motion-reduce:transition-none motion-reduce:active:scale-100',
          ],
          className
        )}
        style={{ width: s.px, height: s.px }}
        role={pressable ? 'button' : undefined}
        tabIndex={pressable ? 0 : undefined}
        {...props}
      >
        {/* Story ring wrapper */}
        {storyRing ? (
          <div
            className={cn(
              'absolute -inset-[3px] rounded-full',
              storyRing === 'unviewed'
                ? 'bg-gradient-to-br from-[var(--story-ring-sage)] to-[var(--story-ring-terra)]'
                : 'bg-[var(--story-ring-viewed)]',
              'p-[2px]'
            )}
          >
            <div className="w-full h-full rounded-full bg-[var(--color-white)] dark:bg-[rgb(var(--background))] p-[2px]">
              <AvatarInner
                src={showImage ? src : undefined}
                alt={alt}
                emoji={emoji}
                initials={fallbackInitials}
                size={size}
                onImgError={() => setImgError(true)}
              />
            </div>
          </div>
        ) : (
          <AvatarInner
            src={showImage ? src : undefined}
            alt={alt}
            emoji={emoji}
            initials={fallbackInitials}
            size={size}
            onImgError={() => setImgError(true)}
          />
        )}

        {/* Online status dot */}
        {online !== undefined && (
          <span
            className={cn(
              'absolute bottom-0 right-0 rounded-full',
              'ring-2 ring-[var(--color-white)] dark:ring-[rgb(var(--background))]',
              s.dot,
              online ? 'bg-[#22C55E]' : 'bg-[var(--color-muted)]'
            )}
            aria-label={online ? 'Online' : 'Offline'}
          />
        )}
      </div>
    )
  }
)
PremiumAvatar.displayName = 'PremiumAvatar'

/* ── Inner circle (image / initials / emoji) ── */

function AvatarInner({
  src,
  alt,
  emoji,
  initials,
  size,
  onImgError,
}: {
  src?: string
  alt: string
  emoji?: string
  initials: string
  size: AvatarSize
  onImgError: () => void
}) {
  const s = SIZE_MAP[size]

  if (emoji) {
    return (
      <div
        className={cn(
          'w-full h-full rounded-full flex items-center justify-center',
          'bg-[var(--color-primary-light)]',
          s.text
        )}
        role="img"
        aria-label={alt}
      >
        {emoji}
      </div>
    )
  }

  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={s.px}
        height={s.px}
        unoptimized
        className="w-full h-full rounded-full object-cover"
        onError={onImgError}
        loading="lazy"
      />
    )
  }

  // Initials fallback
  return (
    <div
      className={cn(
        'w-full h-full rounded-full flex items-center justify-center',
        'bg-[var(--color-primary-mid)] text-[var(--color-primary)]',
        'font-semibold',
        s.text
      )}
      role="img"
      aria-label={alt}
    >
      {initials}
    </div>
  )
}

/* ── Avatar Group (overlapping stack) ── */

export interface PremiumAvatarGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Max avatars to show before "+N" overflow */
  max?: number
  size?: AvatarSize
}

const PremiumAvatarGroup = React.forwardRef<
  HTMLDivElement,
  PremiumAvatarGroupProps
>(({ className, max, size = 'sm', children, ...props }, ref) => {
  const childArray = React.Children.toArray(children)
  const visible = max ? childArray.slice(0, max) : childArray
  const overflow = max ? childArray.length - max : 0
  const s = SIZE_MAP[size]

  return (
    <div
      ref={ref}
      className={cn('flex items-center -space-x-2', className)}
      {...props}
    >
      {visible.map((child, i) => (
        <div
          key={i}
          className={cn(
            'relative rounded-full',
            s.ring,
            'ring-[var(--color-white)] dark:ring-[rgb(var(--background))]'
          )}
          style={{ zIndex: visible.length - i }}
        >
          {child}
        </div>
      ))}

      {overflow > 0 && (
        <div
          className={cn(
            'relative rounded-full flex items-center justify-center',
            'bg-[var(--color-surface)] text-[var(--color-muted)]',
            'font-semibold',
            s.ring,
            'ring-[var(--color-white)] dark:ring-[rgb(var(--background))]',
            s.text
          )}
          style={{ width: s.px, height: s.px, zIndex: 0 }}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
})
PremiumAvatarGroup.displayName = 'PremiumAvatarGroup'

export { PremiumAvatar, PremiumAvatarGroup }
