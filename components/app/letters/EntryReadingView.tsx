/**
 * @module EntryReadingView
 * @description The reading view for a single journal entry (log or letter) —
 *   the artifact itself, not a feed item. Renders the entry body in
 *   reading-view typography, a heading dateline, and (retrievable but not
 *   intrusive) provenance: how the entry was captured, and — for a letter —
 *   what it was composed from.
 *
 *   Presentational only. No fetching, no Supabase calls, no flag checks —
 *   the caller decides whether Letters is enabled and whether this view
 *   should render at all (see `lib/letters/flags.ts`).
 *
 *   Design references: docs/Lumira-Letters-PRD.md §15.3 (the reading view is
 *   the artifact), §18.2 (provenance, the authenticity risk); PRD §14.6 (no
 *   gamification — no streaks, no bounce); docs/Lumira-Design-System-iOS.md
 *   §5.6 (the reading face), §6.2 (no bounce in Letters).
 * @version 1.0.0
 * @since September 2026
 */
'use client'

import { useEffect, useRef, useState } from 'react'
import { MoreHorizontal, Trash2 } from 'lucide-react'
import { EditIcon } from '@/components/icons'
import { cn } from '@/lib/utils'
import type {
  JournalEntryRow,
  CaptureMode,
  ComposeMode,
  LetterSpan,
} from '@/types/letters'

interface Props {
  entry: JournalEntryRow
  onEdit: (entryId: string) => void
  onDelete: (entryId: string) => void
  /** Opens the cited source logs. Omit to hide the affordance entirely
   *  (e.g. the caller has no source-viewing surface yet). */
  onOpenSource?: (sourceEntryIds: string[]) => void
  /**
   * Display-only extras the dateline needs but `JournalEntryRow` does not
   * carry. Both are precomputed by the caller (a hook, per the engineering
   * contract's "no business logic in components" rule) — this component
   * never calculates age itself.
   */
  babyName?: string | null
  /** e.g. "11 months, 2 weeks old". Precomputed for `entry.entry_date`. */
  ageAtEntry?: string | null
}

const CAPTURE_MODE_LABEL: Record<CaptureMode, string> = {
  spoken: 'Spoken',
  typed: 'Typed',
  mixed: 'Spoken and typed',
  not_much: 'A short entry, kept brief',
}

const COMPOSE_MODE_LABEL: Record<ComposeMode, string> = {
  keep_words: 'Kept in your own words',
  shaped: 'Shaped by Lumira from what you said',
  raw: 'Exactly as recorded, unedited',
}

const LETTER_SPAN_LABEL: Record<LetterSpan, string> = {
  single: 'a single entry',
  week: 'the week',
  month: 'the month',
  milestone: 'a milestone',
  custom: 'a chosen range',
}

function formatDateLabel(entryDate: string): string {
  const parsed = new Date(`${entryDate}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return entryDate
  return parsed.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Splits stored body text into paragraphs on blank lines, preserving single
 *  line breaks within a paragraph. Falls back to one paragraph if there are
 *  no blank-line breaks. */
function toParagraphs(body: string): string[] {
  const parts = body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  return parts.length > 0 ? parts : [body]
}

export default function EntryReadingView({
  entry,
  onEdit,
  onDelete,
  onOpenSource,
  babyName = null,
  ageAtEntry = null,
}: Props): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showRaw, setShowRaw] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!menuOpen) return
    function handlePointerDown(event: MouseEvent): void {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  const dateLabel = formatDateLabel(entry.entry_date)
  const ageClause = ageAtEntry
    ? ` — ${babyName ?? 'your baby'} was ${ageAtEntry}`
    : ''

  const isLetter = entry.entry_kind === 'letter'
  const sourceCount = entry.source_entry_ids.length
  const hasSources = isLetter && sourceCount > 0

  const isShaped = entry.compose_mode === 'shaped'
  const captureLabel = entry.capture_mode ? CAPTURE_MODE_LABEL[entry.capture_mode] : null
  const composeLabel = entry.compose_mode ? COMPOSE_MODE_LABEL[entry.compose_mode] : null

  const coversRange =
    entry.covers_from && entry.covers_to
      ? `${formatDateLabel(entry.covers_from)} – ${formatDateLabel(entry.covers_to)}`
      : null

  return (
    <article className="relative mx-auto w-full max-w-[560px]">
      {/* Edit / delete — hidden behind a tap-to-reveal ellipsis, never visible by default. */}
      <div ref={menuRef} className="absolute right-0 top-0 z-10">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="Entry options"
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full text-text-tertiary',
            'transition-colors hover:bg-surface-sunken hover:text-text-secondary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400'
          )}
        >
          <MoreHorizontal size={20} aria-hidden="true" />
        </button>

        {menuOpen && (
          <div
            role="menu"
            aria-label="Entry options"
            className="absolute right-0 top-10 w-40 overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface-raised shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false)
                onEdit(entry.id)
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[14px] text-text-primary hover:bg-surface-sunken"
            >
              <EditIcon size={16} />
              Edit
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false)
                onDelete(entry.id)
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[14px] text-error-700 hover:bg-error-bg"
            >
              <Trash2 size={16} aria-hidden="true" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Dateline — a heading, not a UI label. Chrome typeface (sans), Terra accent. */}
      <h1 className="pr-12 text-[15px] font-semibold tracking-[0.2px] text-terra-600 dark:text-terra-400">
        {dateLabel}
        {ageClause}
      </h1>

      {/* Body — the artifact. Serif face, uncapped font scaling (rem units), 90% opacity. */}
      <div
        className="mt-8 text-text-primary opacity-90"
        style={{
          fontFamily:
            'var(--font-literata, Literata, Georgia, Cambria, "Times New Roman", serif)',
          fontSize: '1.125rem', // 18px at default root size — scales with user font settings
          lineHeight: 1.75,
        }}
      >
        {toParagraphs(entry.body).map((paragraph, index) => (
          <p
            key={index}
            className={index > 0 ? 'mt-[1.25em]' : undefined}
            style={{ maxWidth: '66ch' }}
          >
            {paragraph}
          </p>
        ))}
      </div>

      {/* Composed from — letters only. What it was built from, and a way to reach the sources. */}
      {isLetter && (
        <section aria-label="Composed from" className="mt-10 border-t border-border pt-4">
          <h2 className="sr-only">Composed from</h2>
          {hasSources ? (
            <p className="font-sans text-[13px] leading-[1.5] text-text-tertiary">
              Composed from {sourceCount} {sourceCount === 1 ? 'entry' : 'entries'} — {LETTER_SPAN_LABEL[entry.letter_span ?? 'custom']}
              {coversRange ? `, ${coversRange}` : ''}.
              {onOpenSource && (
                <>
                  {' '}
                  <button
                    type="button"
                    onClick={() => onOpenSource(entry.source_entry_ids)}
                    className="font-medium text-text-link underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400"
                  >
                    View source entries
                  </button>
                </>
              )}
            </p>
          ) : (
            <p className="font-sans text-[13px] leading-[1.5] text-text-tertiary">
              This letter doesn’t cite any source entries.
            </p>
          )}
        </section>
      )}

      {/* Provenance — retrievable but not intrusive. The reader years from now
          never consented to AI-composed prose read as their parent's words;
          this is how that is handled honestly (PRD §18.2). */}
      <section
        aria-label="How this entry was written"
        className={cn('mt-6 font-sans text-[13px] leading-[1.5] text-text-tertiary', !isLetter && 'border-t border-border pt-4')}
      >
        <h2 className="sr-only">How this entry was written</h2>
        <p>
          {captureLabel}
          {composeLabel ? ` · ${composeLabel}` : ''}
          {!isLetter && coversRange ? ` · Covers ${coversRange}` : ''}
        </p>

        {isShaped && (
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setShowRaw((v) => !v)}
              aria-expanded={showRaw}
              className="font-medium text-text-link underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400"
            >
              {showRaw ? 'Hide what you actually said' : 'See what you actually said'}
            </button>

            {showRaw && (
              <div className="mt-3 rounded-[var(--radius-md)] bg-surface-sunken p-4">
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.4px] text-text-tertiary">
                  Raw transcript
                </p>
                {entry.raw_transcript ? (
                  <p className="whitespace-pre-wrap text-[14px] leading-[1.6] text-text-secondary">
                    {entry.raw_transcript}
                  </p>
                ) : (
                  <p className="text-[14px] italic leading-[1.6] text-text-tertiary">
                    The original transcript isn’t available for this entry.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </article>
  )
}
