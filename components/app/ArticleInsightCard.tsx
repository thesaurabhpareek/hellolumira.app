/**
 * @module ArticleInsightCard
 * @description Home feed card that surfaces one article from the content library,
 *   matched to the user's stage and week/month. Server-renderable via props.
 * @version 1.0.0
 * @since March 2026
 */

import Link from 'next/link'
import { BookIcon, SeedIcon, HeartIcon, ShieldIcon, LeafIcon, ClockIcon } from '@/components/icons'

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  nutrition:      { bg: '#FEF9EC', text: '#92400E', border: '#FDE68A' },
  development:    { bg: '#EEF2FF', text: '#3730A3', border: '#C7D2FE' },
  wellness:       { bg: '#F0FDF4', text: '#166534', border: '#BBF7D0' },
  safety:         { bg: '#FFF7ED', text: '#9A3412', border: '#FDBA74' },
  'mental-health':{ bg: '#FDF4FF', text: '#6B21A8', border: '#E9D5FF' },
}

const CATEGORY_LABELS: Record<string, string> = {
  nutrition:      'Nutrition',
  development:    'Development',
  wellness:       'Wellness',
  safety:         'Safety',
  'mental-health':'Mental health',
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
  const colors = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.wellness
  const label = CATEGORY_LABELS[category] ?? category
  const IconComp = CATEGORY_ICON_COMPONENTS[category] ?? BookIcon

  return (
    <div
      style={{
        background: 'var(--color-white)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        marginBottom: '16px',
      }}
    >
      {/* Section label */}
      <p
        style={{
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--color-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          marginBottom: '12px',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><BookIcon size={14} color="var(--color-muted)" /> READ TODAY</span>
      </p>

      {/* Category badge */}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 10px',
          borderRadius: '20px',
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          fontSize: '12px',
          fontWeight: 600,
          color: colors.text,
          marginBottom: '10px',
        }}
      >
        <IconComp size={14} color={colors.text} /> {label}
      </span>

      {/* Title */}
      <p
        style={{
          fontSize: '16px',
          fontWeight: 700,
          color: 'var(--color-slate)',
          lineHeight: 1.4,
          marginBottom: subtitle ? '6px' : '14px',
        }}
      >
        {title}
      </p>

      {/* Subtitle */}
      {subtitle && (
        <p
          style={{
            fontSize: '14px',
            color: 'var(--color-muted)',
            lineHeight: 1.5,
            marginBottom: '14px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {subtitle}
        </p>
      )}

      {/* Footer row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><ClockIcon size={13} color="var(--color-muted)" /> {reading_time_minutes} min read</span>
        </span>
        <Link
          href="/content"
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-primary)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          Read in library →
        </Link>
      </div>
    </div>
  )
}
