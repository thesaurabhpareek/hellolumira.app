/**
 * @module ArticleInsightCard
 * @description Home feed card that surfaces one article from the content library,
 *   matched to the user's stage and week/month.
 * @version 1.1.0 — Migrated inline styles → Tailwind classes
 * @since March 2026
 */

import type React from 'react'
import Link from 'next/link'
import { BookIcon, SeedIcon, HeartIcon, ShieldIcon, LeafIcon, ClockIcon } from '@/components/icons'

// Backgrounds and borders use rgba so they remain visible on both light and dark surfaces.
// Text colors are vivid accent tones that read on both --color-white (light) and #1C1A17 (dark).
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  nutrition:       { bg: 'rgba(214,158,46,0.10)',  text: '#B7791F', border: 'rgba(214,158,46,0.30)' },
  development:     { bg: 'rgba(99,102,241,0.10)',  text: '#6366F1', border: 'rgba(99,102,241,0.30)' },
  wellness:        { bg: 'rgba(56,161,105,0.10)',  text: '#38A169', border: 'rgba(56,161,105,0.30)' },
  safety:          { bg: 'rgba(229,62,62,0.10)',   text: '#E53E3E', border: 'rgba(229,62,62,0.30)'  },
  'mental-health': { bg: 'rgba(159,122,234,0.10)', text: '#9F7AEA', border: 'rgba(159,122,234,0.30)' },
}

const CATEGORY_LABELS: Record<string, string> = {
  nutrition:       'Nutrition',
  development:     'Development',
  wellness:        'Wellness',
  safety:          'Safety',
  'mental-health': 'Mental health',
}

const CATEGORY_ICON_COMPONENTS: Record<string, (props: { size?: number; color?: string }) => React.ReactNode> = {
  nutrition:       LeafIcon,
  development:     SeedIcon,
  wellness:        HeartIcon,
  safety:          ShieldIcon,
  'mental-health': HeartIcon,
}

export interface ArticleInsightProps {
  id: string
  title: string
  subtitle: string | null
  category: string
  reading_time_minutes: number
  tags: string[]
}

export default function ArticleInsightCard({
  title,
  subtitle,
  category,
  reading_time_minutes,
}: ArticleInsightProps) {
  const colors   = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.wellness
  const label    = CATEGORY_LABELS[category] ?? category
  const IconComp = CATEGORY_ICON_COMPONENTS[category] ?? BookIcon

  return (
    <div className="bg-[var(--color-white)] border border-border rounded-lg p-5 mb-4">
      {/* Section label */}
      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.8px] mb-3">
        <span className="inline-flex items-center gap-1">
          <BookIcon size={14} color="var(--color-muted)" /> READ TODAY
        </span>
      </p>

      {/* Category badge — uses dynamic data-driven colours; keep inline */}
      <span
        className="inline-flex items-center gap-1 px-2.5 py-[3px] rounded-[20px] text-xs font-semibold mb-2.5"
        style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}
      >
        <IconComp size={14} color={colors.text} /> {label}
      </span>

      {/* Title */}
      <p className={`text-base font-bold text-foreground leading-[1.4] ${subtitle ? 'mb-1.5' : 'mb-3.5'}`}>
        {title}
      </p>

      {/* Subtitle */}
      {subtitle && (
        <p
          className="text-sm text-muted-foreground leading-[1.5] mb-3.5 overflow-hidden"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {subtitle}
        </p>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-[3px]">
            <ClockIcon size={13} color="var(--color-muted)" /> {reading_time_minutes} min read
          </span>
        </span>
        <Link href="/content" className="text-[13px] font-semibold text-primary no-underline flex items-center gap-1">
          Read in library →
        </Link>
      </div>
    </div>
  )
}
