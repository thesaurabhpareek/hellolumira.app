// app/(app)/journal/[id]/page.tsx — Journal entry detail (server component)
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
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
