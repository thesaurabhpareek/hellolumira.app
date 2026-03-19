/**
 * @module JournalEntry
 * @description Renders a single journal entry with the weekly summary content
 *   including headline, patterns, wins, watch items, and Lumira's personal note.
 * @version 1.0.0
 * @since March 2026
 */
import type { JournalEntry } from '@/types/app'

interface Props {
  entry: JournalEntry
}

export default function JournalEntryCard({ entry }: Props) {
  const dateObj = new Date(entry.entry_date + 'T12:00:00')
  const dateLabel = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  // Truncate body for preview if needed
  const isLong = entry.body.length > 300
  const preview = isLong ? entry.body.slice(0, 300) + '...' : entry.body

  return (
    <div
      className="lumira-card"
      style={{ borderLeft: '3px solid var(--color-accent)' }}
    >
      <p
        style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--color-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.4px',
          marginBottom: '10px',
        }}
      >
        {dateLabel}
      </p>
      <p
        style={{
          fontSize: '15px',
          lineHeight: 1.7,
          color: 'var(--color-slate)',
          whiteSpace: 'pre-wrap',
        }}
      >
        {preview}
      </p>
    </div>
  )
}
