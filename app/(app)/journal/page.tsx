// app/(app)/journal/page.tsx — Journal list (server component)
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

interface JournalEntry {
  id: string
  body: string | null
  entry_date: string | null
  created_at: string
}

function formatEntryDate(dateStr: string | null, createdAt: string): string {
  const raw = dateStr ?? createdAt
  const d = new Date(raw)
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function excerpt(body: string | null, max = 120): string {
  if (!body) return ''
  const trimmed = body.trim()
  if (trimmed.length <= max) return trimmed
  return trimmed.slice(0, max).trimEnd() + '…'
}

export default async function JournalListPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: entries } = await supabase
    .from('journal_entries')
    .select('id, body, entry_date, created_at')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })

  const list = (entries as JournalEntry[] | null) ?? []

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
            marginBottom: '8px',
          }}
        >
          <h1 className="text-h1" style={{ color: 'var(--color-slate)' }}>
            My journal
          </h1>
          <Link
            href="/journal/new"
            className="btn-primary"
            style={{ fontSize: '14px', padding: '10px 18px', height: 'auto', minHeight: '44px' }}
          >
            + New entry
          </Link>
        </div>

        <p
          style={{
            fontSize: '14px',
            color: 'var(--color-muted)',
            marginBottom: '24px',
            lineHeight: 1.5,
          }}
        >
          Your journal is private — just for you.
        </p>

        {/* ── Empty state ── */}
        {list.length === 0 && (
          <div
            className="lumira-card"
            style={{
              textAlign: 'center',
              padding: '48px 24px',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📓</div>
            <p
              style={{
                fontSize: '17px',
                fontWeight: 700,
                color: 'var(--color-slate)',
                marginBottom: '10px',
              }}
            >
              Your journal is waiting
            </p>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--color-muted)',
                lineHeight: 1.6,
                marginBottom: '24px',
                maxWidth: '280px',
                margin: '0 auto 24px',
              }}
            >
              This space is private — just for you. Write whatever&apos;s on your mind.
            </p>
            <Link href="/journal/new" className="btn-primary" style={{ display: 'inline-flex' }}>
              Start writing
            </Link>
          </div>
        )}

        {/* ── Entry list ── */}
        {list.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {list.map((entry) => (
              <Link
                key={entry.id}
                href={`/journal/${entry.id}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div
                  className="lumira-card"
                  style={{
                    transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
                    cursor: 'pointer',
                  }}
                >
                  <p
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--color-primary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.4px',
                      marginBottom: '8px',
                    }}
                  >
                    {formatEntryDate(entry.entry_date, entry.created_at)}
                  </p>
                  <p
                    style={{
                      fontSize: '15px',
                      color: 'var(--color-slate)',
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {excerpt(entry.body) || (
                      <span style={{ color: 'var(--color-muted)', fontStyle: 'italic' }}>
                        Empty entry
                      </span>
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
