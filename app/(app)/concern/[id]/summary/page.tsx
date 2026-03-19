// app/(app)/concern/[id]/summary/page.tsx — AI Summary
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AISummaryCard from '@/components/app/AISummaryCard'
import type { ConcernSession, BabyProfile } from '@/types/app'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ session?: string }>
}

export default async function ConcernSummaryPage({ params, searchParams }: Props) {
  const { id } = await params
  const { session: sessionId } = await searchParams

  if (!sessionId) redirect(`/concern/${id}`)

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const { data: sessionData, error } = await supabase
    .from('concern_sessions')
    .select('id, baby_id, profile_id, stage, concern_type, ai_summary, follow_up_due, created_at')
    .eq('id', sessionId)
    .eq('profile_id', user.id)
    .single()

  if (error || !sessionData) redirect(`/concern`)

  const session = sessionData as ConcernSession

  // Fetch baby name
  const { data: babyData } = await supabase
    .from('baby_profiles')
    .select('name')
    .eq('id', session.baby_id)
    .single()

  const babyName = (babyData as Partial<BabyProfile>)?.name ?? undefined

  const concernLabels: Record<string, string> = {
    morning_sickness: 'Morning sickness',
    prenatal_symptoms: 'Pregnancy symptoms',
    reduced_fetal_movement: 'Reduced fetal movement',
    prenatal_anxiety: 'Pregnancy anxiety',
    birth_preparation: 'Birth preparation',
    feeding_drop: 'Feeding drop',
    crying_increase: 'Crying increase',
    sleep_regression: 'Sleep regression',
    constipation: 'Constipation',
    fever: 'Fever / illness',
    teething: 'Teething',
    other: 'General concern',
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--color-surface)',
        paddingBottom: '32px',
      }}
    >
      <div className="content-width mx-auto px-4 pt-6">
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
              {concernLabels[session.concern_type] || session.concern_type}
            </span>
          </div>
          <h1 className="text-h1" style={{ color: 'var(--color-slate)' }}>
            Here&apos;s what I&apos;m seeing
          </h1>
          <p className="text-body-muted mt-1">
            Based on what you&apos;ve told me. Always check in with your doctor for medical concerns.
          </p>
        </div>

        <AISummaryCard
          summary={session.ai_summary}
          concernType={session.concern_type}
          babyName={babyName}
        />

        {/* Follow-up note */}
        {session.follow_up_due && (
          <div
            style={{
              background: 'var(--color-primary-light)',
              border: '1px solid var(--color-primary-mid)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              marginTop: '16px',
            }}
          >
            <p style={{ fontSize: '14px', color: 'var(--color-primary)', lineHeight: 1.6 }}>
              💙 I&apos;ll check in with you in a couple of days to see how things are going.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link href="/checkin" className="btn-primary">
            Log today&apos;s check-in →
          </Link>
          <Link
            href="/home"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '52px',
              color: 'var(--color-muted)',
              fontSize: '15px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
