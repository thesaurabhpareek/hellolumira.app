// app/(app)/concern/page.tsx — Concern selector
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Stage, ConcernType } from '@/types/app'
import ConcernSelectorClient from './ConcernSelectorClient'

const PREGNANCY_CONCERNS: { id: ConcernType; label: string; emoji: string }[] = [
  { id: 'morning_sickness', label: 'Morning sickness', emoji: '🤢' },
  { id: 'prenatal_symptoms', label: 'Pregnancy symptoms', emoji: '🩺' },
  { id: 'reduced_fetal_movement', label: 'Reduced fetal movement', emoji: '👋' },
  { id: 'prenatal_anxiety', label: 'Pregnancy anxiety', emoji: '💭' },
  { id: 'birth_preparation', label: 'Birth preparation', emoji: '🏥' },
  { id: 'other', label: 'Something else', emoji: '💬' },
]

const INFANT_CONCERNS: { id: ConcernType; label: string; emoji: string }[] = [
  { id: 'feeding_drop', label: 'Feeding drop', emoji: '🍼' },
  { id: 'crying_increase', label: 'Crying increase', emoji: '😢' },
  { id: 'sleep_regression', label: 'Sleep regression', emoji: '😴' },
  { id: 'constipation', label: 'Constipation', emoji: '🚼' },
  { id: 'fever', label: 'Fever / illness', emoji: '🌡️' },
  { id: 'teething', label: 'Teething', emoji: '🦷' },
  { id: 'other', label: 'Something else', emoji: '💬' },
]

export default async function ConcernPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: memberData } = await supabase
    .from('baby_profile_members')
    .select('baby_id')
    .eq('profile_id', user.id)
    .limit(1)
    .maybeSingle()

  let stage: Stage = 'infant'
  if (memberData?.baby_id) {
    const { data: babyData } = await supabase
      .from('baby_profiles')
      .select('stage')
      .eq('id', memberData.baby_id)
      .single()
    if (babyData) stage = babyData.stage as Stage
  }

  const concerns = stage === 'pregnancy' ? PREGNANCY_CONCERNS : INFANT_CONCERNS

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--color-surface)',
        paddingBottom: '32px',
      }}
    >
      <div className="content-width mx-auto px-4 pt-6">
        <Link
          href="/home"
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
          &larr; Back
        </Link>
        <h1 className="text-h1 mb-2" style={{ color: 'var(--color-slate)' }}>
          What&apos;s on your mind?
        </h1>
        <p className="text-body-muted mb-6">
          Choose a topic and I&apos;ll help you work through it.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          {concerns.filter((c) => c.id !== 'other').map((concern) => (
            <Link
              key={concern.id}
              href={`/concern/${concern.id}`}
              className="concern-card"
            >
              <span style={{ fontSize: '28px' }}>{concern.emoji}</span>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--color-slate)',
                  textAlign: 'center',
                  lineHeight: 1.3,
                }}
              >
                {concern.label}
              </span>
              <span style={{ fontSize: '16px', color: 'var(--color-muted)' }}>›</span>
            </Link>
          ))}
        </div>

        {/* Something else */}
        <ConcernSelectorClient stage={stage} />
      </div>
    </div>
  )
}
