'use client'
// app/(app)/milestones/page.tsx — Milestone journal: view logged milestones + log new

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getBabyAgeInfo } from '@/lib/baby-age'
import type { BabyProfile } from '@/types/app'

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface Milestone {
  id: string
  milestone_type: string
  milestone_key: string
  title: string
  description: string | null
  celebrated_at: string
  created_at: string
}

/* ── Milestone suggestions ─────────────────────────────────────────────────── */

const INFANT_SUGGESTIONS: Array<{ minWeeks: number; maxWeeks: number; key: string; title: string; emoji: string; description: string }> = [
  { minWeeks: 0, maxWeeks: 6, key: 'first_smile', title: 'First social smile', emoji: '😊', description: 'Around 6 weeks, babies start smiling in response to your face and voice.' },
  { minWeeks: 4, maxWeeks: 12, key: 'tummy_time', title: 'Tummy time milestone', emoji: '💪', description: 'Lifting head during tummy time — key for neck and shoulder strength.' },
  { minWeeks: 8, maxWeeks: 20, key: 'first_laugh', title: 'First laugh', emoji: '😂', description: 'That first giggle — usually around 3-4 months.' },
  { minWeeks: 12, maxWeeks: 24, key: 'rolling', title: 'Rolling over', emoji: '🔄', description: 'Rolling tummy-to-back usually comes first, around 3-4 months.' },
  { minWeeks: 16, maxWeeks: 28, key: 'sitting', title: 'Sitting with support', emoji: '🧸', description: 'With a little help, babies can sit upright around 4-6 months.' },
  { minWeeks: 20, maxWeeks: 32, key: 'first_foods', title: 'First solid foods', emoji: '🥑', description: 'Around 6 months with signs of readiness: head control, interest in food.' },
  { minWeeks: 24, maxWeeks: 40, key: 'crawling', title: 'Crawling', emoji: '🐾', description: 'Classic crawling usually emerges between 6-10 months.' },
  { minWeeks: 32, maxWeeks: 52, key: 'first_word', title: 'First word', emoji: '💬', description: '"Mama" or "dada" — usually by 12 months.' },
  { minWeeks: 36, maxWeeks: 60, key: 'walking', title: 'First steps', emoji: '👣', description: 'Most babies walk between 9-12 months. Every baby is different.' },
  { minWeeks: 44, maxWeeks: 72, key: 'pincer_grip', title: 'Pincer grip', emoji: '✌️', description: 'Picking up small objects with thumb and forefinger — fine motor control.' },
]

const PREGNANCY_SUGGESTIONS: Array<{ minWeek: number; maxWeek: number; key: string; title: string; emoji: string; description: string }> = [
  { minWeek: 8, maxWeek: 14, key: 'first_scan', title: 'First scan', emoji: '🖥️', description: 'Your first glimpse of your baby via ultrasound.' },
  { minWeek: 18, maxWeek: 22, key: 'anatomy_scan', title: 'Anatomy scan', emoji: '🩻', description: 'The detailed mid-pregnancy ultrasound.' },
  { minWeek: 16, maxWeek: 25, key: 'first_kick', title: 'First kick', emoji: '👟', description: 'Feeling those first flutters and kicks.' },
  { minWeek: 27, maxWeek: 40, key: 'third_trimester', title: 'Third trimester begins', emoji: '🌙', description: "The home stretch — you've made it this far!" },
  { minWeek: 34, maxWeek: 40, key: 'birth_plan_done', title: 'Birth plan ready', emoji: '📋', description: 'Knowing your preferences for labour and delivery.' },
]

/* ── Emoji map ─────────────────────────────────────────────────────────────── */

const MILESTONE_EMOJI: Record<string, string> = {
  // Pregnancy
  first_scan: '🖥️',
  anatomy_scan: '🩻',
  first_kick: '👟',
  third_trimester: '🌙',
  birth_plan_done: '📋',
  // Infant
  rolling: '🔄',
  sitting: '🧸',
  crawling: '🐾',
  pulling_to_stand: '🙌',
  first_word: '💬',
  pincer_grip: '✌️',
  walking: '👣',
  // Default
  other: '⭐',
}

function getMilestoneEmoji(key: string): string {
  return MILESTONE_EMOJI[key] ?? '⭐'
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return iso
  }
}

/* ── Component ─────────────────────────────────────────────────────────────── */

export default function MilestonesPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [baby, setBaby] = useState<BabyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  const fetchMilestones = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Not signed in.'); return }

      const [{ data, error: fetchErr }, { data: memberData }] = await Promise.all([
        supabase
          .from('baby_milestones')
          .select('*')
          .eq('profile_id', user.id)
          .order('celebrated_at', { ascending: false }),
        supabase
          .from('baby_profile_members')
          .select('baby_id')
          .eq('profile_id', user.id)
          .limit(1)
          .maybeSingle(),
      ])

      if (fetchErr) {
        setError("Couldn't load milestones. Please try again.")
      } else {
        setMilestones(data || [])
      }

      if (memberData?.baby_id) {
        const { data: babyData } = await supabase
          .from('baby_profiles')
          .select('id, name, due_date, date_of_birth, stage, planning_sub_option, planning_expected_month, pending_proactive_type, pending_proactive_set_at')
          .eq('id', memberData.baby_id)
          .single()
        if (babyData) setBaby(babyData as BabyProfile)
      }
    } catch {
      setError("Couldn't load milestones. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => { fetchMilestones() }, [fetchMilestones])

  // Compute age-matched suggestions
  const suggestions = useMemo(() => {
    if (!baby) return []
    const loggedKeys = new Set(milestones.map(m => m.milestone_key))
    const ageInfo = getBabyAgeInfo(baby)

    if (baby.stage === 'infant' && ageInfo.age_in_weeks !== undefined) {
      const weeks = ageInfo.age_in_weeks
      return INFANT_SUGGESTIONS.filter(s =>
        weeks >= s.minWeeks && weeks <= s.maxWeeks && !loggedKeys.has(s.key)
      )
    }

    if (baby.stage === 'pregnancy' && ageInfo.pregnancy_week !== undefined) {
      const week = ageInfo.pregnancy_week
      return PREGNANCY_SUGGESTIONS.filter(s =>
        week >= s.minWeek && week <= s.maxWeek && !loggedKeys.has(s.key)
      )
    }

    return []
  }, [baby, milestones])

  const babyName = baby?.name || 'your baby'

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--color-surface)', paddingBottom: '24px' }}>
      <div className="content-width mx-auto px-4 pt-6">

        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
          <div>
            <h1 className="text-h1" style={{ color: 'var(--color-slate)', marginBottom: '4px' }}>
              Milestones
            </h1>
            <p className="text-body" style={{ color: 'var(--color-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
              Every little first, forever remembered.
            </p>
          </div>
        </div>

        {/* ── Log new button ─────────────────────────────────────────── */}
        <Link
          href="/milestones/new"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            height: '48px',
            background: 'var(--color-primary)',
            color: '#fff',
            borderRadius: 'var(--radius-lg)',
            fontSize: '15px',
            fontWeight: 600,
            textDecoration: 'none',
            marginBottom: '24px',
            transition: 'background 0.15s ease',
          }}
        >
          <span aria-hidden="true">＋</span> Log a milestone
        </Link>

        {/* ── Age-based suggestions ──────────────────────────────────── */}
        {!loading && suggestions.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <p style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--color-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '12px',
            }}>
              Coming up for {babyName}
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              paddingBottom: '8px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}>
              {suggestions.map(s => (
                <div
                  key={s.key}
                  style={{
                    flexShrink: 0,
                    width: '200px',
                    background: 'var(--color-white)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  }}
                >
                  <span style={{ fontSize: '28px', lineHeight: 1, marginBottom: '2px' }}>{s.emoji}</span>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-slate)', margin: 0, lineHeight: 1.3 }}>
                    {s.title}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--color-muted)', margin: 0, lineHeight: 1.5, flex: 1 }}>
                    {s.description}
                  </p>
                  <Link
                    href={`/milestones/new?type=infant&key=${encodeURIComponent(s.key)}&title=${encodeURIComponent(s.title)}`}
                    style={{
                      display: 'inline-block',
                      marginTop: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--color-primary)',
                      textDecoration: 'none',
                      padding: '6px 12px',
                      border: '1.5px solid var(--color-primary)',
                      borderRadius: '100px',
                      textAlign: 'center',
                    }}
                  >
                    + Log this
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Loading ────────────────────────────────────────────────── */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '14px',
                  padding: '16px',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'center',
                }}
              >
                <div className="lumira-skeleton" style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="lumira-skeleton" style={{ height: '16px', width: '70%', borderRadius: '6px', marginBottom: '8px' }} />
                  <div className="lumira-skeleton" style={{ height: '12px', width: '40%', borderRadius: '6px' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Error ─────────────────────────────────────────────────── */}
        {error && !loading && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-slate)', marginBottom: '8px' }}>
              Hmm, something went wrong
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '16px' }}>{error}</p>
            <button
              onClick={fetchMilestones}
              style={{
                padding: '10px 24px',
                borderRadius: '100px',
                border: 'none',
                background: 'var(--color-primary)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              Try again
            </button>
          </div>
        )}

        {/* ── Empty state ────────────────────────────────────────────── */}
        {!loading && !error && milestones.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <p style={{ fontSize: '40px', marginBottom: '12px' }}>🌱</p>
            <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-slate)', marginBottom: '8px' }}>
              No milestones yet
            </p>
            <p style={{ fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.6, maxWidth: '260px', margin: '0 auto' }}>
              Every first is worth remembering. Log your first milestone — it only takes a moment.
            </p>
          </div>
        )}

        {/* ── Milestone list ─────────────────────────────────────────── */}
        {!loading && !error && milestones.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {milestones.map(m => (
              <div
                key={m.id}
                style={{
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                {/* Emoji badge */}
                <div
                  aria-hidden="true"
                  style={{
                    width: 44,
                    height: 44,
                    minWidth: 44,
                    borderRadius: '50%',
                    background: '#FDF0E6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                  }}
                >
                  {getMilestoneEmoji(m.milestone_key)}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-slate)', margin: '0 0 3px', lineHeight: 1.35 }}>
                    {m.title}
                  </p>
                  {m.description && (
                    <p style={{ fontSize: '13px', color: 'var(--color-muted)', margin: '0 0 5px', lineHeight: 1.5 }}>
                      {m.description}
                    </p>
                  )}
                  <p style={{ fontSize: '11px', color: 'var(--color-muted)', margin: 0, fontWeight: 500 }}>
                    {formatDate(m.celebrated_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
