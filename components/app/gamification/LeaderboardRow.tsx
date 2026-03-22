/**
 * @module LeaderboardRow
 * @description Leaderboard row for tribe/community rankings. Shows rank with
 *   medals for top 3, avatar, name, seeds/XP count, trend arrows, and highlight
 *   for the current user. Includes animated rank changes.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useEffect, useState } from 'react'

type Trend = 'up' | 'down' | 'same' | 'new'

export interface LeaderboardEntry {
  id: string
  rank: number
  name: string
  avatarEmoji: string
  seeds: number
  trend: Trend
  /** Positions changed from last period */
  positionsChanged?: number
  /** Whether this is the current user */
  isCurrentUser: boolean
  /** Level for display */
  level?: number
}

interface LeaderboardRowProps {
  entry: LeaderboardEntry
  /** Animate entry on mount (stagger via index) */
  animationDelay?: number
}

const MEDAL_MAP: Record<number, string> = {
  1: '\uD83E\uDD47',
  2: '\uD83E\uDD48',
  3: '\uD83E\uDD49',
}

const TREND_CONFIG: Record<Trend, { icon: string; color: string; label: string }> = {
  up: { icon: '\u2191', color: '#22C55E', label: 'Up' },
  down: { icon: '\u2193', color: '#EF4444', label: 'Down' },
  same: { icon: '\u2022', color: 'var(--color-muted)', label: 'Same' },
  new: { icon: '\u2605', color: '#F59E0B', label: 'New' },
}

export default function LeaderboardRow({
  entry,
  animationDelay = 0,
}: LeaderboardRowProps) {
  const [mounted, setMounted] = useState(false)
  const medal = MEDAL_MAP[entry.rank]
  const trend = TREND_CONFIG[entry.trend]

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), animationDelay)
    return () => clearTimeout(timer)
  }, [animationDelay])

  const bgColor = entry.isCurrentUser
    ? 'var(--color-primary-light)'
    : entry.rank <= 3
      ? 'rgba(245, 158, 11, 0.03)'
      : 'transparent'

  const borderColor = entry.isCurrentUser
    ? 'var(--color-primary-mid)'
    : entry.rank <= 3
      ? 'rgba(245, 158, 11, 0.1)'
      : 'var(--color-border)'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 14px',
        borderRadius: 'var(--radius-md)',
        background: bgColor,
        border: `1px solid ${borderColor}`,
        position: 'relative',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateX(0)' : 'translateX(-10px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        minHeight: '56px',
      }}
    >
      {/* "You" indicator */}
      {entry.isCurrentUser && (
        <div
          style={{
            position: 'absolute',
            top: '-1px',
            right: '12px',
            fontSize: '10px',
            fontWeight: 700,
            color: 'var(--color-primary)',
            background: 'var(--color-white)',
            padding: '1px 8px',
            borderRadius: '0 0 6px 6px',
            border: `1px solid var(--color-primary-mid)`,
            borderTop: 'none',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          You
        </div>
      )}

      {/* Rank */}
      <div
        style={{
          width: '32px',
          textAlign: 'center',
          flexShrink: 0,
        }}
      >
        {medal ? (
          <span style={{ fontSize: '20px', lineHeight: 1 }}>{medal}</span>
        ) : (
          <span
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--color-muted)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {entry.rank}
          </span>
        )}
      </div>

      {/* Avatar */}
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: entry.isCurrentUser ? 'var(--color-primary)' : 'var(--color-surface)',
          border: `2px solid ${entry.rank === 1 ? '#F59E0B' : entry.rank <= 3 ? '#D1D5DB' : 'var(--color-border)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: '18px',
          lineHeight: 1,
        }}
      >
        {entry.avatarEmoji}
      </div>

      {/* Name + level */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: '14px',
            fontWeight: entry.isCurrentUser ? 700 : 600,
            color: 'var(--color-slate)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {entry.name}
        </p>
        {entry.level && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-muted)',
            }}
          >
            Level {entry.level}
          </span>
        )}
      </div>

      {/* Seeds count */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: '12px' }}>{'\uD83C\uDF31'}</span>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--color-accent)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {entry.seeds.toLocaleString()}
        </span>
      </div>

      {/* Trend arrow */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '28px',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: trend.color,
            lineHeight: 1,
          }}
          aria-label={trend.label}
        >
          {trend.icon}
        </span>
        {entry.positionsChanged !== undefined && entry.positionsChanged > 0 && entry.trend !== 'same' && entry.trend !== 'new' && (
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: trend.color,
              lineHeight: 1,
            }}
          >
            {entry.positionsChanged}
          </span>
        )}
      </div>
    </div>
  )
}

/** Wrapper for a full leaderboard list */
export function Leaderboard({
  entries,
  title = 'Leaderboard',
}: {
  entries: LeaderboardEntry[]
  title?: string
}) {
  return (
    <div
      style={{
        background: 'var(--color-white)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span style={{ fontSize: '18px' }}>{'\uD83C\uDFC6'}</span>
        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-slate)' }}>
          {title}
        </span>
      </div>

      {/* Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {entries.map((entry, i) => (
          <LeaderboardRow
            key={entry.id}
            entry={entry}
            animationDelay={i * 60}
          />
        ))}
      </div>
    </div>
  )
}
