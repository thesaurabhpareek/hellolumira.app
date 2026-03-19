// app/(app)/history/page.tsx — History
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HistoryCard from '@/components/app/HistoryCard'
import type { DailyCheckin, ConcernSession, BabyProfile } from '@/types/app'

export default async function HistoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  // Fetch baby
  const { data: memberData } = await supabase
    .from('baby_profile_members')
    .select('baby_id')
    .eq('profile_id', user.id)
    .limit(1)
    .maybeSingle()

  if (!memberData?.baby_id) redirect('/onboarding')

  const { data: babyData } = await supabase
    .from('baby_profiles')
    .select('id, name, due_date, date_of_birth, stage, pending_proactive_type, pending_proactive_set_at, created_by_profile_id, created_at')
    .eq('id', memberData.baby_id)
    .single()

  if (!babyData) redirect('/onboarding')

  const baby = babyData as BabyProfile

  // Fetch last 30 checkins and concern sessions in parallel
  const [{ data: checkins }, { data: concerns }] = await Promise.all([
    supabase
      .from('daily_checkins')
      .select('id, baby_id, checkin_date, sleep_quality, feeding, mood, nausea_level, energy_level, emotional_signal')
      .eq('baby_id', baby.id)
      .order('checkin_date', { ascending: false })
      .limit(30),
    supabase
      .from('concern_sessions')
      .select('id, baby_id, profile_id, stage, concern_type, ai_summary, created_at')
      .eq('baby_id', baby.id)
      .order('created_at', { ascending: false })
      .limit(30),
  ])

  // Group by date
  const checkinsByDate: Record<string, DailyCheckin> = {}
  for (const c of (checkins || []) as DailyCheckin[]) {
    checkinsByDate[c.checkin_date] = c
  }

  const concernsByDate: Record<string, ConcernSession[]> = {}
  for (const c of (concerns || []) as ConcernSession[]) {
    const date = c.created_at.split('T')[0]
    if (!concernsByDate[date]) concernsByDate[date] = []
    concernsByDate[date].push(c)
  }

  // Get all unique dates
  const allDates = Array.from(
    new Set([
      ...Object.keys(checkinsByDate),
      ...Object.keys(concernsByDate),
    ])
  ).sort((a, b) => b.localeCompare(a))

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--color-surface)',
        paddingBottom: '32px',
      }}
    >
      <div className="content-width mx-auto px-4 pt-6">
        <h1 className="text-h1 mb-2" style={{ color: 'var(--color-slate)' }}>
          History
        </h1>
        <p className="text-body-muted mb-6">
          Your last 30 days at a glance.
        </p>

        {allDates.length === 0 ? (
          <div className="lumira-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>📋</p>
            <p style={{ color: 'var(--color-muted)', fontSize: '15px' }}>
              No history yet. Start by logging a check-in!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {allDates.map((date) => (
              <HistoryCard
                key={date}
                date={date}
                stage={baby.stage}
                checkin={checkinsByDate[date]}
                concerns={concernsByDate[date]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
