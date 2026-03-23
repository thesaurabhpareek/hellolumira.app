// app/(app)/profile/seeds/page.tsx — Seeds transaction history
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeftIcon } from '@/components/icons'

/** Human-readable labels for each reason key */
const REASON_LABELS: Record<string, string> = {
  daily_checkin: 'Daily check-in',
  log_concern: 'Logged a concern',
  read_article: 'Read an article',
  complete_quiz: 'Completed quiz',
  post_in_tribe: 'Posted in tribe',
  comment_in_tribe: 'Commented in tribe',
  react_to_story: 'Reacted to a story',
  reply_to_story: 'Replied to a story',
  journal_entry: 'Journal entry',
  streak_7_days: '7-day streak milestone',
  streak_30_days: '30-day streak milestone',
  first_checkin: 'First check-in bonus',
  complete_profile: 'Profile completion bonus',
  invite_partner: 'Invited a partner',
  first_share: 'First share',
  profile_field_completion: 'Profile field completed',
  daily_streak_bonus: 'Streak bonus',
}

/** Color for each category */
function reasonColor(reason: string): string {
  if (reason.startsWith('streak')) return '#F59E0B'
  if (reason === 'first_checkin' || reason === 'complete_profile') return '#EC4899'
  if (reason.includes('tribe')) return '#3D8178'
  if (reason.includes('story')) return '#6366F1'
  return '#C4844E'
}

/** Format a reference_date or created_at for display */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

type SeedTx = {
  id: string
  amount: number
  reason: string
  reference_date: string
  created_at: string
}

export default async function SeedsHistoryPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('seeds_balance, first_name')
    .eq('id', user.id)
    .single()

  if (!profileRow) redirect('/onboarding')

  const { data: transactions } = await supabase
    .from('seed_transactions')
    .select('id, amount, reason, reference_date, created_at')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const txList = (transactions ?? []) as SeedTx[]
  const seedsBalance = (profileRow as { seeds_balance?: number }).seeds_balance ?? 0

  return (
    <div
      style={{
        minHeight: '100%',
        background: 'var(--color-surface)',
        paddingBottom: '32px',
      }}
    >
      <div className="content-width mx-auto px-4 pt-6">
        {/* Back button */}
        <Link
          href="/profile"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: '#3D8178',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
            padding: '16px 0',
          }}
        >
          <ArrowLeftIcon size={16} color="#3D8178" /> Back to Profile
        </Link>

        <h1 className="text-h1" style={{ color: 'var(--color-slate)', marginBottom: '4px' }}>
          Seeds History
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-muted)', marginBottom: '24px' }}>
          How you&apos;ve been earning your 🌱 seeds
        </p>

        {/* Balance summary */}
        <div
          className="lumira-card mb-6"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--color-accent-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              flexShrink: 0,
            }}
          >
            🌱
          </div>
          <div>
            <p
              style={{
                fontSize: '28px',
                fontWeight: 800,
                color: 'var(--color-slate)',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {seedsBalance}
            </p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-accent)', marginTop: '2px' }}>
              Total seeds
            </p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
              {txList.length} transaction{txList.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Transaction list */}
        {txList.length === 0 ? (
          <div
            className="lumira-card"
            style={{ textAlign: 'center', padding: '40px 24px' }}
          >
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>🌱</p>
            <p style={{ fontWeight: 600, color: 'var(--color-slate)', marginBottom: '8px' }}>
              No seeds yet
            </p>
            <p style={{ fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.6 }}>
              Complete your daily check-in, post in a tribe, or finish the quiz to start earning.
            </p>
          </div>
        ) : (
          <div className="lumira-card" style={{ padding: 0, overflow: 'hidden' }}>
            {txList.map((tx, i) => (
              <div key={tx.id}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                  }}
                >
                  {/* Color dot */}
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: reasonColor(tx.reason),
                      flexShrink: 0,
                    }}
                  />

                  {/* Label + date */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'var(--color-slate)',
                        marginBottom: '2px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {REASON_LABELS[tx.reason] ?? tx.reason.replace(/_/g, ' ')}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                      {formatDate(tx.created_at)}
                    </p>
                  </div>

                  {/* Amount */}
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#22C55E',
                      flexShrink: 0,
                    }}
                  >
                    +{tx.amount}
                  </span>
                </div>

                {/* Divider */}
                {i < txList.length - 1 && (
                  <div
                    style={{
                      height: '1px',
                      background: 'var(--color-border)',
                      margin: '0 16px',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* How to earn more */}
        <div className="lumira-card mt-4">
          <p
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '12px',
            }}
          >
            How to Earn More
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { emoji: '✅', label: 'Daily check-in', amount: 5, note: 'Every day' },
              { emoji: '📝', label: 'Log a concern', amount: 10, note: 'Once per day' },
              { emoji: '📚', label: 'Read an article', amount: 3, note: 'Once per day' },
              { emoji: '🧠', label: 'Complete the quiz', amount: 10, note: 'Once per day' },
              { emoji: '💬', label: 'Post in a tribe', amount: 10, note: 'Once per day' },
              { emoji: '💭', label: 'Comment in a tribe', amount: 5, note: 'Once per day' },
              { emoji: '❤️', label: 'React to a story', amount: 2, note: 'Once per day' },
              { emoji: '↩️', label: 'Reply to a story', amount: 5, note: 'Once per day' },
              { emoji: '🔥', label: '7-day streak', amount: 25, note: 'One-time bonus' },
              { emoji: '🏆', label: '30-day streak', amount: 100, note: 'One-time bonus' },
              { emoji: '🎉', label: 'First check-in', amount: 25, note: 'One-time bonus' },
              { emoji: '👤', label: 'Complete profile', amount: 50, note: 'One-time bonus' },
            ].map(({ emoji, label, amount, note }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span style={{ fontSize: '16px', flexShrink: 0 }}>{emoji}</span>
                <span style={{ flex: 1, fontSize: '14px', color: 'var(--color-slate)' }}>
                  {label}{' '}
                  <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                    — {note}
                  </span>
                </span>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#22C55E',
                    flexShrink: 0,
                  }}
                >
                  +{amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
