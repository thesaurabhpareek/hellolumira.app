'use client'
// app/(app)/milestones/page.tsx — Milestone journal: view logged milestones + log new

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  const fetchMilestones = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Not signed in.'); return }

      const { data, error: fetchErr } = await supabase
        .from('baby_milestones')
        .select('*')
        .eq('profile_id', user.id)
        .order('celebrated_at', { ascending: false })

      if (fetchErr) {
        setError("Couldn't load milestones. Please try again.")
      } else {
        setMilestones(data || [])
      }
    } catch {
      setError("Couldn't load milestones. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => { fetchMilestones() }, [fetchMilestones])

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--color-surface)', paddingBottom: '24px' }}>
      <div className="content-width mx-auto px-4 pt-6">

        {/* ── Header ─────────────────────────────────────────────────── */}
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
