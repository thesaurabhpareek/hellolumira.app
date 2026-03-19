/**
 * @module WeekGuideCard
 * @description Expandable weekly developmental guide card. Fetches the
 *   stage-specific guide via useWeeklyGuide hook and renders opening text,
 *   developmental context, observable behaviours, and actionable tips.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Stage, WeeklyGuideContent } from '@/types/app'

interface Props {
  stage: Stage
  week_or_month: number
  babyName?: string
}

function ShimmerLine({ width = '100%', height = 16 }: { width?: string; height?: number }) {
  return (
    <div
      className="shimmer"
      style={{
        width,
        height: `${height}px`,
        borderRadius: '6px',
        marginBottom: '8px',
      }}
    />
  )
}

export default function WeekGuideCard({ stage, week_or_month, babyName }: Props) {
  const [guide, setGuide] = useState<WeeklyGuideContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)

  const fetchGuide = useCallback(async () => {
    setLoading(true)
    setError('')

    const attempt = async () => {
      const res = await fetch(
        `/api/weekly-guide?stage=${stage}&week_or_month=${week_or_month}`
      )
      if (!res.ok) throw new Error('Failed to load guide')
      const data = await res.json()
      if (data.error) throw new Error(data.fallback_message || 'Guide unavailable')
      return data.guide as WeeklyGuideContent
    }

    try {
      try {
        const g = await attempt()
        setGuide(g)
      } catch {
        await new Promise((r) => setTimeout(r, 1000))
        const g = await attempt()
        setGuide(g)
      }
    } catch {
      setError("Couldn't load your guide — tap to retry")
    } finally {
      setLoading(false)
    }
  }, [stage, week_or_month])

  useEffect(() => {
    fetchGuide()
  }, [fetchGuide])

  const stageLabel =
    stage === 'pregnancy'
      ? `Week ${week_or_month}`
      : stage === 'infant'
      ? `Week ${week_or_month}`
      : `Month ${week_or_month}`

  if (loading) {
    return (
      <div className="lumira-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div className="shimmer" style={{ width: '80px', height: '22px', borderRadius: '100px' }} />
          <div className="shimmer" style={{ width: '120px', height: '16px', borderRadius: '6px' }} />
        </div>
        <ShimmerLine width="100%" height={16} />
        <ShimmerLine width="90%" height={16} />
        <ShimmerLine width="70%" height={16} />
        <div style={{ margin: '16px 0 8px' }}>
          <ShimmerLine width="60%" height={14} />
        </div>
        <ShimmerLine width="85%" height={14} />
        <ShimmerLine width="75%" height={14} />
        <ShimmerLine width="65%" height={14} />
      </div>
    )
  }

  if (error || !guide) {
    return (
      <div
        className="lumira-card"
        style={{ textAlign: 'center' }}
      >
        <p style={{ color: 'var(--color-muted)', marginBottom: '16px' }}>
          {error || "Your guide isn\u2019t loading right now \u2014 tap to try again"}
        </p>
        <button onClick={fetchGuide} className="btn-primary">
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="lumira-card">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <span
          style={{
            padding: '4px 12px',
            borderRadius: '100px',
            background: 'var(--color-primary)',
            color: 'white',
            fontSize: '13px',
            fontWeight: 700,
          }}
        >
          {stageLabel}
        </span>
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-muted)' }}>
          {stage === 'pregnancy' ? 'Pregnancy guide' : `${babyName || 'Baby'}'s guide`}
        </span>
      </div>

      {/* Opening */}
      <p
        style={{
          fontSize: '15px',
          lineHeight: 1.7,
          color: 'var(--color-slate)',
          marginBottom: '20px',
        }}
      >
        {guide.opening}
      </p>

      {/* Pregnancy-specific sections */}
      {stage === 'pregnancy' && guide.baby_development && (
        <Section
          emoji="👶"
          title="Baby development"
          isOpen={openAccordion === 'baby_dev'}
          onToggle={() => setOpenAccordion(openAccordion === 'baby_dev' ? null : 'baby_dev')}
          defaultOpen
        >
          <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--color-slate)' }}>
            {guide.baby_development}
          </p>
        </Section>
      )}

      {stage === 'pregnancy' && guide.body_changes && (
        <Section
          emoji="🌿"
          title="Body changes"
          isOpen={openAccordion === 'body_changes'}
          onToggle={() => setOpenAccordion(openAccordion === 'body_changes' ? null : 'body_changes')}
        >
          <ul style={{ margin: 0, paddingLeft: '16px' }}>
            {guide.body_changes.map((item, i) => (
              <li
                key={i}
                style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--color-slate)', marginBottom: '4px' }}
              >
                {item}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Infant-specific sections */}
      {stage !== 'pregnancy' && guide.what_is_happening && (
        <Section
          emoji="🧠"
          title="What's happening"
          isOpen={openAccordion === 'what_happening'}
          onToggle={() => setOpenAccordion(openAccordion === 'what_happening' ? null : 'what_happening')}
          defaultOpen
        >
          <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--color-slate)' }}>
            {guide.what_is_happening}
          </p>
        </Section>
      )}

      {stage !== 'pregnancy' && guide.what_you_might_notice && (
        <Section
          emoji="👀"
          title="What you might notice"
          isOpen={openAccordion === 'notice'}
          onToggle={() => setOpenAccordion(openAccordion === 'notice' ? null : 'notice')}
        >
          <ul style={{ margin: 0, paddingLeft: '16px' }}>
            {guide.what_you_might_notice.map((item, i) => (
              <li
                key={i}
                style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--color-slate)', marginBottom: '4px' }}
              >
                {item}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Usually normal — accordion */}
      <Section
        emoji="✅"
        title="Usually normal"
        isOpen={openAccordion === 'normal'}
        onToggle={() => setOpenAccordion(openAccordion === 'normal' ? null : 'normal')}
      >
        <ul style={{ margin: 0, paddingLeft: '16px' }}>
          {guide.whats_usually_normal.map((item, i) => (
            <li
              key={i}
              style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--color-slate)', marginBottom: '4px' }}
            >
              {item}
            </li>
          ))}
        </ul>
      </Section>

      {/* Focus this week — checklist style */}
      {guide.focus_this_week && guide.focus_this_week.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
            📋 Focus this week
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {guide.focus_this_week.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 12px',
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <span
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: '2px solid var(--color-primary-mid)',
                    flexShrink: 0,
                    marginTop: '1px',
                  }}
                />
                <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-slate)', margin: 0 }}>
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Watch outs — amber card */}
      {guide.watch_outs && guide.watch_outs.length > 0 && (
        <div
          style={{
            marginTop: '16px',
            background: 'var(--color-amber-light)',
            border: '1px solid #F6E05E',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
          }}
        >
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-amber)', marginBottom: '8px' }}>
            ⚠️ Watch out for
          </p>
          <ul style={{ margin: 0, paddingLeft: '16px' }}>
            {guide.watch_outs.map((item, i) => (
              <li
                key={i}
                style={{ fontSize: '13px', lineHeight: 1.7, color: '#744210', marginBottom: '4px' }}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Medical disclaimer */}
      <p
        style={{
          fontSize: '13px',
          color: 'var(--color-muted)',
          marginTop: '16px',
          lineHeight: 1.5,
        }}
      >
        Grounded in AAP, WHO &amp; NICE guidelines · Always check with your care team for personal medical questions
      </p>
    </div>
  )
}

function Section({
  emoji,
  title,
  isOpen,
  onToggle,
  defaultOpen = false,
  children,
}: {
  emoji: string
  title: string
  isOpen: boolean
  onToggle: () => void
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const show = isOpen || defaultOpen

  return (
    <div
      style={{
        borderTop: '1px solid var(--color-border)',
        paddingTop: '12px',
        marginTop: '12px',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0 0 8px',
          minHeight: '36px',
        }}
      >
        <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-slate)' }}>
          {emoji} {title}
        </span>
        <span
          style={{
            color: 'var(--color-muted)',
            fontSize: '18px',
            transition: 'transform 0.2s ease',
            transform: show ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          ›
        </span>
      </button>
      {show && (
        <div className="animate-fade-in" style={{ paddingBottom: '4px' }}>
          {children}
        </div>
      )}
    </div>
  )
}
