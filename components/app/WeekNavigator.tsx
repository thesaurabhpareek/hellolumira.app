/**
 * @module WeekNavigator
 * @description Horizontal scrollable week/month journey strip that lets users
 *   browse past, present AND future weekly developmental guides.
 *   Future weeks show a "peek ahead" experience with milestone previews.
 * @version 2.0.0
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

/** Milestone preview data for future weeks — makes looking ahead exciting */
function getFutureMilestoneHint(stage: Stage, week: number, babyName?: string): { emoji: string; hint: string } | null {
  const name = babyName || 'baby'
  if (stage === 'pregnancy') {
    if (week === 12) return { emoji: '🫧', hint: `${name}'s vocal cords are forming` }
    if (week === 16) return { emoji: '💪', hint: `You might feel the first kicks soon` }
    if (week === 20) return { emoji: '📸', hint: `Anatomy scan — you could find out the sex!` }
    if (week === 24) return { emoji: '👂', hint: `${name} can hear your voice now` }
    if (week === 28) return { emoji: '👀', hint: `${name}'s eyes can open and close` }
    if (week === 30) return { emoji: '🧠', hint: `Brain is growing rapidly` }
    if (week === 34) return { emoji: '🫁', hint: `Lungs are maturing fast` }
    if (week === 36) return { emoji: '🎒', hint: `Time to pack the hospital bag!` }
    if (week === 37) return { emoji: '✨', hint: `Full term — ${name} could arrive any day` }
    if (week === 40) return { emoji: '🎉', hint: `Due date — the big moment!` }
  }
  if (stage === 'infant') {
    if (week === 6) return { emoji: '😊', hint: `First social smile coming soon!` }
    if (week === 8) return { emoji: '👀', hint: `${name} will start tracking objects` }
    if (week === 12) return { emoji: '😂', hint: `First laughs are around the corner` }
    if (week === 16) return { emoji: '🙌', hint: `${name} may start reaching for toys` }
    if (week === 20) return { emoji: '🔄', hint: `Rolling over could happen soon!` }
    if (week === 24) return { emoji: '🥄', hint: `Ready to start solid foods` }
    if (week === 28) return { emoji: '🪑', hint: `Sitting up independently` }
    if (week === 32) return { emoji: '👋', hint: `Waving bye-bye!` }
    if (week === 36) return { emoji: '🧸', hint: `Crawling adventures begin` }
    if (week === 40) return { emoji: '🗣️', hint: `First words — "mama" or "dada"?` }
    if (week === 44) return { emoji: '🚶', hint: `Pulling up to stand` }
    if (week === 48) return { emoji: '👣', hint: `First steps might happen!` }
    if (week === 52) return { emoji: '🎂', hint: `Happy first birthday!` }
  }
  if (stage === 'toddler') {
    if (week === 2) return { emoji: '🗣️', hint: `Vocabulary explosion starting` }
    if (week === 4) return { emoji: '🏃', hint: `Running and climbing everything` }
    if (week === 6) return { emoji: '🎨', hint: `Creative play is blossoming` }
    if (week === 8) return { emoji: '🧩', hint: `Problem-solving skills emerging` }
    if (week === 10) return { emoji: '👫', hint: `Parallel play with other kids` }
    if (week === 12) return { emoji: '🎂', hint: `The terrific twos!` }
  }
  return null
}

export default function WeekNavigator({ stage, currentWeekOrMonth, babyName }: Props) {
  const [selectedWeek, setSelectedWeek] = useState(currentWeekOrMonth)
  const scrollRef = useRef<HTMLDivElement>(null)
  const pillRefs = useRef<Map<number, HTMLButtonElement>>(new Map())
  const { min, max, label } = getRange(stage)

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
  const isFutureSelected = selectedWeek > currentWeekOrMonth
  const milestone = isFutureSelected ? getFutureMilestoneHint(stage, selectedWeek, babyName) : null

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
          {isFutureSelected ? '✨ Peek ahead' : 'Your journey'}
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
            Back to now &rarr;
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
          const hasMilestone = isFuture && !!getFutureMilestoneHint(stage, week, babyName)

          return (
            <button
              key={week}
              ref={(el) => {
                if (el) pillRefs.current.set(week, el)
              }}
              onClick={() => handleWeekSelect(week)}
              className="shrink-0 flex flex-col items-center justify-center rounded-xl border transition-all duration-150 relative"
              style={{
                scrollSnapAlign: 'center',
                width: '48px',
                height: '56px',
                cursor: 'pointer',
                background: isSelected
                  ? isFuture
                    ? 'linear-gradient(135deg, #C4844E, #D4956E)'
                    : 'var(--color-primary)'
                  : isCurrent
                  ? 'var(--color-primary-light)'
                  : isFuture
                  ? 'linear-gradient(135deg, #FFF8F0, #FFF3E6)'
                  : 'var(--color-white)',
                borderColor: isSelected
                  ? isFuture ? '#C4844E' : 'var(--color-primary)'
                  : isCurrent
                  ? 'var(--color-primary-mid, var(--color-primary))'
                  : isFuture
                  ? '#E8D5C0'
                  : 'var(--color-border)',
                opacity: isPast ? 0.7 : 1,
              }}
            >
              {/* Milestone dot indicator */}
              {hasMilestone && !isSelected && (
                <span
                  style={{
                    position: 'absolute',
                    top: '3px',
                    right: '3px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#C4844E',
                  }}
                />
              )}
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: isSelected
                    ? '#FFFFFF'
                    : isCurrent
                    ? 'var(--color-primary)'
                    : isFuture
                    ? '#C4844E'
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

      {/* Selected week label + milestone hint */}
      <div className="mt-2 mb-3">
        <p
          className="m-0"
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: isFutureSelected ? '#C4844E' : 'var(--color-slate)',
          }}
        >
          {label} {selectedWeek}
          {selectedWeek === currentWeekOrMonth ? ' (current)' : ''}
          {isFutureSelected ? ` — ${selectedWeek - currentWeekOrMonth} ${label.toLowerCase()}${selectedWeek - currentWeekOrMonth > 1 ? 's' : ''} away` : ''}
        </p>
        {milestone && (
          <p
            className="m-0 mt-1"
            style={{
              fontSize: '14px',
              color: '#9A6B3A',
              lineHeight: 1.5,
            }}
          >
            {milestone.emoji} {milestone.hint}
          </p>
        )}
      </div>

      {/* Milestone preview banner for future weeks */}
      {isFutureSelected && (
        <div
          style={{
            background: 'linear-gradient(135deg, #FFF8F0, #FFF3E6)',
            border: '1px solid #E8D5C0',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 16px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '24px', lineHeight: 1, flexShrink: 0 }}>🔮</span>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#9A6B3A', margin: 0 }}>
              Looking ahead to {label} {selectedWeek}
            </p>
            <p style={{ fontSize: '13px', color: '#B08050', margin: '2px 0 0', lineHeight: 1.5 }}>
              Here&apos;s what you can expect. Read ahead to feel prepared and excited!
            </p>
          </div>
        </div>
      )}

      {/* Guide content for selected week */}
      <WeekGuideCard
        stage={stage}
        week_or_month={selectedWeek}
        babyName={babyName}
      />
    </div>
  )
}
