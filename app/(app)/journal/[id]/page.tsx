// app/(app)/journal/[id]/page.tsx — Journal entry detail (server component)
//
// Flag-gated (docs/LETTERS-ENGINEERING-CONTRACT.md §1): when Letters is
// disabled, this renders EXACTLY what the route rendered before the Letters
// feature existed. Flipping NEXT_PUBLIC_LETTERS_ENABLED off is a complete,
// behaviour-identical rollback.
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isLettersEnabled, type LettersFlagContext } from '@/lib/letters/flags'
import EntryReadingClient from './EntryReadingClient'
import type { JournalEntryRow } from '@/types/letters'
import DeleteEntryButton from './DeleteEntryButton'

interface JournalEntry {
  id: string
  body: string | null
  entry_date: string | null
  created_at: string
  profile_id: string
}

function formatFullDate(dateStr: string | null, createdAt: string): string {
  const raw = dateStr ?? createdAt
  const d = new Date(raw)
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** Full row shape for the new model. Selected explicitly, never `select('*')`. */
const ENTRY_COLUMNS =
  'id, profile_id, baby_id, entry_kind, entry_date, source_entry_ids, letter_span, body, raw_transcript, composed_body, edited_body, compose_mode, capture_mode, visibility, child_safe, voice_profile_version, slop_audit, followups, word_count, duration_seconds, covers_from, covers_to, composed_at, created_at, updated_at'

const MS_PER_DAY = 86_400_000

/**
 * "11 months old" as of the entry's own date, not today — EntryReadingView's
 * contract requires this precomputed (lane FE6: "this component never
 * calculates age itself"). Pure formatting, same spirit as formatFullDate
 * above; not the age-info business logic in lib/baby-age.ts, which answers
 * a different question (age as of today).
 */
function formatAgeAtEntry(dateOfBirth: string | null, entryDate: string): string | null {
  if (!dateOfBirth) return null
  const dob = new Date(dateOfBirth)
  const at = new Date(`${entryDate}T12:00:00`)
  if (Number.isNaN(dob.getTime()) || Number.isNaN(at.getTime())) return null
  const days = Math.floor((at.getTime() - dob.getTime()) / MS_PER_DAY)
  if (days < 0) return null
  const months = Math.floor(days / 30.4375)
  if (months < 1) {
    const weeks = Math.floor(days / 7)
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} old`
  }
  if (months < 24) {
    return `${months} ${months === 1 ? 'month' : 'months'} old`
  }
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  if (remainingMonths === 0) return `${years} ${years === 1 ? 'year' : 'years'} old`
  return `${years} ${years === 1 ? 'year' : 'years'} and ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'} old`
}

export default async function JournalEntryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: settings } = await supabase
    .from('letters_settings')
    .select('nightly_enabled')
    .eq('profile_id', user.id)
    .maybeSingle()

  const flagCtx: LettersFlagContext = {
    profileId: user.id,
    userEnabled: settings ? (settings.nightly_enabled as boolean) : null,
  }

  // ─────────────────────────────────────────────────────────────
  // Flag OFF — unchanged rollback path. Do not touch.
  // ─────────────────────────────────────────────────────────────
  if (!isLettersEnabled(flagCtx)) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('id, body, entry_date, created_at, profile_id')
      .eq('id', id)
      .single()

    if (error || !data) notFound()

    const entry = data as JournalEntry

    // Ownership check (RLS also enforces this, but be explicit)
    if (entry.profile_id !== user.id) notFound()

    return (
      <div
        style={{
          minHeight: '100%',
          background: 'var(--color-surface)',
          paddingBottom: '40px',
        }}
      >
        <div className="content-width mx-auto px-4 pt-6">

          {/* ── Header ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              gap: '12px',
            }}
          >
            <Link
              href="/journal"
              style={{
                color: 'var(--color-primary)',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                minHeight: '44px',
                flexShrink: 0,
              }}
            >
              &larr; Journal
            </Link>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Link
                href={`/journal/${entry.id}/edit`}
                className="btn-ghost"
                style={{ fontSize: '13px', padding: '8px 14px', height: 'auto', minHeight: '40px' }}
              >
                Edit
              </Link>
              <DeleteEntryButton entryId={entry.id} />
            </div>
          </div>

          {/* ── Entry card ── */}
          <div className="lumira-card">
            <p
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
                marginBottom: '16px',
              }}
            >
              {formatFullDate(entry.entry_date, entry.created_at)}
            </p>

            <div
              style={{
                fontSize: '16px',
                lineHeight: 1.75,
                color: 'var(--color-slate)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {entry.body?.trim() || (
                <span style={{ color: 'var(--color-muted)', fontStyle: 'italic' }}>
                  This entry is empty.
                </span>
              )}
            </div>
          </div>

        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────
  // Flag ON — new model: a single log or letter, rendered by
  // EntryReadingView (lane FE6).
  // ─────────────────────────────────────────────────────────────
  const { data: row, error } = await supabase
    .from('journal_entries')
    .select(ENTRY_COLUMNS)
    .eq('id', id)
    .eq('profile_id', user.id) // explicit ownership filter — never rely on RLS alone,
    // and this also means a mismatched id/owner comes back as "no row" rather
    // than a row we then have to reject, so another user's entry never leaks.
    .maybeSingle()

  if (error || !row) notFound()

  const entry = row as unknown as JournalEntryRow

  // The entry's own baby, not "whichever baby the parent has active" —
  // precomputed here because EntryReadingView must not calculate it itself.
  let babyName: string | null = null
  let ageAtEntry: string | null = null
  if (entry.baby_id) {
    const { data: babyRow } = await supabase
      .from('baby_profiles')
      .select('name, date_of_birth')
      .eq('id', entry.baby_id)
      .maybeSingle()
    babyName = babyRow?.name ?? null
    ageAtEntry = babyRow?.date_of_birth
      ? formatAgeAtEntry(babyRow.date_of_birth, entry.entry_date)
      : null
  }

  return (
    <div
      style={{
        minHeight: '100%',
        background: 'var(--color-surface)',
        paddingBottom: '40px',
      }}
    >
      <div className="content-width mx-auto px-4 pt-6">

        {/* ── Header ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            gap: '12px',
          }}
        >
          <Link
            href="/journal"
            style={{
              color: 'var(--color-primary)',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              minHeight: '44px',
              flexShrink: 0,
            }}
          >
            &larr; Journal
          </Link>
        </div>

        <EntryReadingClient entry={entry} babyName={babyName} ageAtEntry={ageAtEntry} />
      </div>
    </div>
  )
}
