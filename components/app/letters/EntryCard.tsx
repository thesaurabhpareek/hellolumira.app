/**
 * @module EntryCard
 * @description One item in the Journal timeline. Renders both entry kinds —
 *   `log` (the nightly habit) and `letter` (an artifact composed from one or
 *   more logs) — with a deliberately different visual register, per
 *   docs/LETTERS-MODEL-CHANGE.md: a log reads as a quiet entry (sans face,
 *   small-caps date, unceremonious); a letter reads as a page worth opening
 *   (serif hint, warmer treatment, a subtle "built from" indicator).
 *   Presentational only — no fetching, no business logic. Lane FE5.
 * @version 1.0.0
 */
'use client'

import type { JournalEntryRow, LetterSpan } from '@/types/letters'

interface EntryCardProps {
  entry: JournalEntryRow
  onPress: (entry: JournalEntryRow) => void
}

/** Qualifier appended to the source count for spans where it reads naturally.
 *  'single' and 'custom' fall back to the bare "From N entries" form below. */
const SPAN_QUALIFIER: Partial<Record<LetterSpan, string>> = {
  week: 'this week',
  month: 'this month',
  milestone: 'around this milestone',
}

function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function formatLogDateLabel(entryDate: string): string {
  return new Date(`${entryDate}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function formatLetterDateLabel(entryDate: string): string {
  return new Date(`${entryDate}T12:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatFullDateForA11y(entryDate: string): string {
  return new Date(`${entryDate}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/** "From 7 entries this week" — the only visible hint of what a letter was
 *  built from. Reads `source_entry_ids.length` and `letter_span`; never
 *  fabricates a count. Returns null when there is nothing to cite. */
function buildSourceLabel(span: LetterSpan | null, sourceCount: number): string | null {
  if (sourceCount <= 0) return null
  const noun = sourceCount === 1 ? 'entry' : 'entries'
  const qualifier = span ? SPAN_QUALIFIER[span] : undefined
  return qualifier ? `From ${sourceCount} ${noun} ${qualifier}` : `From ${sourceCount} ${noun}`
}

export default function EntryCard({ entry, onPress }: EntryCardProps) {
  const body = collapseWhitespace(entry.body ?? '')

  if (entry.entry_kind === 'letter') {
    const dateLabel = formatLetterDateLabel(entry.entry_date)
    const sourceCount = (entry.source_entry_ids ?? []).length
    const sourceLabel = buildSourceLabel(entry.letter_span, sourceCount)
    const a11yLabel = sourceLabel
      ? `Letter, ${formatFullDateForA11y(entry.entry_date)}, ${sourceLabel.toLowerCase()}`
      : `Letter, ${formatFullDateForA11y(entry.entry_date)}`

    return (
      <button
        type="button"
        onClick={() => onPress(entry)}
        aria-label={a11yLabel}
        className="block min-h-[44px] w-full rounded-[var(--radius-xl)] bg-[var(--color-accent-light)] px-5 py-5 text-left transition-opacity duration-150 active:opacity-85"
      >
        <p className="mb-2 font-serif text-[15px] text-accent/90">{dateLabel}</p>
        <p className="line-clamp-3 font-serif text-[16px] leading-[1.7] text-foreground/90">
          {body}
        </p>
        {sourceLabel && (
          <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.5px] text-muted-foreground">
            {sourceLabel}
          </p>
        )}
      </button>
    )
  }

  // 'log' — and the safe fallback for any other entry_kind (e.g. 'ai_summary'
  // reaching this component unexpectedly): render quiet, not broken.
  const dateLabel = formatLogDateLabel(entry.entry_date)

  return (
    <button
      type="button"
      onClick={() => onPress(entry)}
      aria-label={`Entry, ${formatFullDateForA11y(entry.entry_date)}`}
      className="block min-h-[44px] w-full border-b border-border py-3.5 text-left transition-opacity duration-150 last:border-b-0 active:opacity-85"
    >
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.6px] text-muted-foreground">
        {dateLabel}
      </p>
      <p className="line-clamp-2 text-[14px] leading-[1.6] text-foreground/80">{body}</p>
    </button>
  )
}
