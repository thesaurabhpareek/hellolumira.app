// app/(app)/home/page.tsx — Home screen (server component)
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getBabyAgeInfo } from '@/lib/baby-age'
import WeekGuideCard from '@/components/app/WeekGuideCard'
import PatternFlagCard from '@/components/app/PatternFlagCard'
import PregnancyProgressBadge from '@/components/app/PregnancyProgressBadge'
import type { Profile, BabyProfile, DailyCheckin, PatternType } from '@/types/app'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  // Fetch profile and baby membership in parallel
  const [{ data: profileData }, { data: memberData }] = await Promise.all([
    supabase.from('profiles').select('id, first_name, first_time_parent, emotional_state_latest').eq('id', user.id).single(),
    supabase.from('baby_profile_members').select('baby_id').eq('profile_id', user.id).limit(1).maybeSingle(),
  ])

  if (!profileData?.first_name) redirect('/onboarding')
  if (!memberData?.baby_id) redirect('/onboarding')

  const profile = profileData as Profile

  // Fetch baby profile with specific columns
  const { data: babyData } = await supabase
    .from('baby_profiles')
    .select('id, name, due_date, date_of_birth, stage, pending_proactive_type, pending_proactive_set_at')
    .eq('id', memberData.baby_id)
    .single()

  if (!babyData) redirect('/onboarding')

  const baby = babyData as BabyProfile
  const ageInfo = getBabyAgeInfo(baby)

  // Fetch today's checkin with only needed columns
  const today = new Date().toISOString().split('T')[0]
  const { data: checkinData } = await supabase
    .from('daily_checkins')
    .select('id, checkin_date')
    .eq('baby_id', baby.id)
    .eq('checkin_date', today)
    .maybeSingle()

  const todayCheckin = checkinData as DailyCheckin | null

  // Read pending proactive type
  const pendingType = baby.pending_proactive_type as PatternType | null
  let pendingMessage = ''
  if (pendingType) {
    const messageMap: Record<PatternType, string> = {
      sleep: `${baby.name || 'Baby'}'s sleep has been rough for a few days. Want to talk through it?`,
      feeding: `I've noticed some changes in feeding patterns. Let's take a look.`,
      mood: `${baby.name || 'Baby'} has been quite fussy lately. Want to chat about it?`,
      concern_followup: `Following up on a recent concern — how are things going?`,
      milestone_proximity: `There's a developmental milestone coming up. Ready to check in?`,
      parent_gap: `It's been a while since your last check-in. How are you doing?`,
      partner_divergence: `You and your partner seem to be seeing things differently. Let's talk.`,
      nausea_severity: `You've had severe nausea for a few days. Worth a check-in.`,
      prenatal_anxiety: `You've been having a tough time emotionally. I'm here to listen.`,
      appointment_proximity: `You have an appointment coming up. Any questions to prepare?`,
    }
    pendingMessage = messageMap[pendingType] || 'Something caught my attention — want to chat?'
  }

  // Clear pending proactive type (fire and forget)
  if (pendingType) {
    supabase
      .from('baby_profiles')
      .update({ pending_proactive_type: null, pending_proactive_set_at: null })
      .eq('id', baby.id)
      .then(() => {})
  }

  const guideKey = {
    stage: baby.stage,
    week_or_month:
      baby.stage === 'pregnancy'
        ? (ageInfo.pregnancy_week ?? 1)
        : baby.stage === 'infant'
        ? (ageInfo.age_in_weeks ?? 0)
        : (ageInfo.age_in_months ?? 0),
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--color-surface)',
        paddingBottom: '120px',
      }}
    >
      <div className="content-width mx-auto px-4 pt-6">
        {/* Stage badge */}
        {baby.stage === 'pregnancy' && ageInfo.pregnancy_week && (
          <PregnancyProgressBadge
            week={ageInfo.pregnancy_week}
            trimester={ageInfo.trimester ?? 1}
            dueDate={baby.due_date ?? ''}
          />
        )}

        {baby.stage !== 'pregnancy' && (
          <div
            style={{
              background: 'var(--color-primary-light)',
              border: '1px solid var(--color-primary-mid)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 20px',
              marginBottom: '16px',
            }}
          >
            <p
              style={{
                color: 'var(--color-primary)',
                fontWeight: 600,
                fontSize: '15px',
              }}
            >
              {ageInfo.age_display_string}
            </p>
          </div>
        )}

        {/* Greeting */}
        <h1
          className="text-h2 mb-4"
          style={{ color: 'var(--color-slate)' }}
        >
          Good {getTimeGreeting()}, {profile.first_name} 👋
        </h1>

        {/* Pattern flag card */}
        {pendingType && pendingMessage && (
          <div className="mb-4">
            <PatternFlagCard
              type={pendingType}
              message={pendingMessage}
              onDismiss={() => {}}
            />
          </div>
        )}

        {/* Today's check-in status */}
        {todayCheckin && (
          <div
            style={{
              background: 'var(--color-green-light)',
              border: '1px solid #9AE6B4',
              borderRadius: 'var(--radius-lg)',
              padding: '14px 20px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '20px' }}>✓</span>
            <p style={{ color: 'var(--color-green)', fontWeight: 600, fontSize: '15px' }}>
              Check-in logged for today
            </p>
          </div>
        )}

        {/* Weekly guide card */}
        <div className="mb-4">
          <WeekGuideCard
            stage={guideKey.stage}
            week_or_month={guideKey.week_or_month}
            babyName={baby.name ?? undefined}
          />
        </div>
      </div>

      {/* Bottom sticky bar — positioned above AppShell bottom nav */}
      <div
        style={{
          position: 'fixed',
          bottom: 'calc(56px + max(0px, env(safe-area-inset-bottom)))',
          left: 0,
          right: 0,
          background: 'var(--color-white)',
          borderTop: '1px solid var(--color-border)',
          padding: '12px 16px',
          zIndex: 50,
        }}
      >
        <div
          className="content-width mx-auto"
          style={{ display: 'flex', gap: '12px' }}
        >
          <Link
            href="/checkin"
            className="btn-primary"
            style={{ flex: 1, fontSize: '14px' }}
          >
            Log today →
          </Link>
          <Link
            href="/concern"
            style={{
              flex: 1,
              height: '52px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              background: 'var(--color-white)',
              color: 'var(--color-slate)',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Something&apos;s on my mind →
          </Link>
        </div>
      </div>
    </div>
  )
}

function getTimeGreeting(): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'morning'
  if (h >= 12 && h < 17) return 'afternoon'
  if (h >= 17 && h < 21) return 'evening'
  return 'night'
}
