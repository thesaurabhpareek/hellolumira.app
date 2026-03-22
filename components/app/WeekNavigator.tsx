/**
 * @module WeekNavigator
 * @description Horizontal scrollable week/month strip that lets users browse
 *   weekly developmental guides for any week, not just the current one.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { Stage } from '@/types/app'
import WeekGuideCard from './WeekGuideCard'

interface Props {
  stage: Stage
  currentWeekOrMonth: number
  babyName?: string
}

/**
 * Returns the valid range of weeks/months for a given stage.
 */
function getRange(stage: Stage): { min: number; max: number; label: string } {
  switch (stage) {
    case 'pregnancy':
      return { min: 1, max: 42, label: 'Week' }
    case 'infant':
      return { min: 1, max: 52, label: 'Week' }
    case 'toddler':
      return { min: 1, max: 12, label: 'Month' }
    default:
      return { min: 1, max: 12, label: 'Week' }
  }
}

export default function WeekNavigator({ stage, currentWeekOrMonth, babyName }: Props) {
  const [selectedWeek, setSelectedWeek] = useState(currentWeekOrMonth)
  const scrollRef = useRef<HTMLDivElement>(null)
  const pillRefs = useRef<Map<number, HTMLButtonElement>>(new Map())
  const { min, max, label } = getRange(stage)

  // Scroll the current week pill into view on mount
  const scrollToWeek = useCallback((week: number, behavior: ScrollBehavior = 'smooth') => {
    const pill = pillRefs.current.get(week)
    if (pill && scrollRef.current) {
      const container = scrollRef.current
      const pillLeft = pill.offsetLeft
      const pillWidth = pill.offsetWidth
      const containerWidth = container.offsetWidth
      const scrollTarget = pillLeft - containerWidth / 2 + pillWidth / 2
      container.scrollTo({ left: scrollTarget, behavior })
    }
  }, [])

  useEffect(() => {
    // Use instant scroll on initial mount
    requestAnimationFrame(() => scrollToWeek(currentWeekOrMonth, 'instant'))
  }, [currentWeekOrMonth, scrollToWeek])

  const handleWeekSelect = (week: number) => {
    setSelectedWeek(week)
    scrollToWeek(week)
  }

  const handleSnapToCurrent = () => {
    setSelectedWeek(currentWeekOrMonth)
    scrollToWeek(currentWeekOrMonth)
  }

  const weeks = Array.from({ length: max - min + 1 }, (_, i) => min + i)

  return (
    <div className="mb-4">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <p
          className="m-0"
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--color-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Browse weekly guides
        </p>
        {selectedWeek !== currentWeekOrMonth && (
          <button
            onClick={handleSnapToCurrent}
            className="bg-transparent border-none cursor-pointer p-0"
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-primary)',
            }}
          >
            This {label.toLowerCase()} &rarr;
          </button>
        )}
      </div>

      {/* Scrollable week strip */}
      <div
        ref={scrollRef}
        className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {weeks.map((week) => {
          const isCurrent = week === currentWeekOrMonth
          const isSelected = week === selectedWeek
          const isFuture = week > currentWeekOrMonth
          const isPast = week < currentWeekOrMonth

          return (
            <button
              key={week}
              ref={(el) => {
                if (el) pillRefs.current.set(week, el)
              }}
              onClick={() => !isFuture && handleWeekSelect(week)}
              disabled={isFuture}
              className="shrink-0 flex flex-col items-center justify-center rounded-xl border transition-all duration-150"
              style={{
                scrollSnapAlign: 'center',
                width: '48px',
                height: '56px',
                cursor: isFuture ? 'not-allowed' : 'pointer',
                background: isSelected
                  ? 'var(--color-primary)'
                  : isCurrent
                  ? 'var(--color-primary-light)'
                  : isFuture
                  ? 'var(--color-surface)'
                  : 'var(--color-white)',
                borderColor: isSelected
                  ? 'var(--color-primary)'
                  : isCurrent
                  ? 'var(--color-primary-mid, var(--color-primary))'
                  : 'var(--color-border)',
                opacity: isFuture ? 0.4 : isPast ? 0.75 : 1,
              }}
            >
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: isSelected
                    ? '#FFFFFF'
                    : isCurrent
                    ? 'var(--color-primary)'
                    : 'var(--color-slate)',
                  lineHeight: 1,
                }}
              >
                {week}
              </span>
              {isCurrent && (
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 600,
                    color: isSelected ? 'rgba(255,255,255,0.85)' : 'var(--color-primary)',
                    marginTop: '2px',
                    lineHeight: 1,
                  }}
                >
                  now
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected week label */}
      <p
        className="mt-2 mb-3"
        style={{
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--color-slate)',
        }}
      >
        {label} {selectedWeek}
        {selectedWeek === currentWeekOrMonth ? ' (current)' : ''}
      </p>

      {/* Guide content for selected week */}
      <WeekGuideCard
        stage={stage}
        week_or_month={selectedWeek}
        babyName={babyName}
      />
    </div>
  )
}
