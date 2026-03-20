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
import type React from 'react'
import { UserIcon, LeafIcon, BrainIcon, EyeIcon, CheckIcon, ClipboardIcon, AlertIcon } from '@/components/icons'
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
        `/api/weekly-guide?stage=${stage}&week_or_month=${week_or_month}`,
        { credentials: 'same-origin' }
      )
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`Failed to load guide (${res.status}): ${text.substring(0, 100)}`)
      }
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
          icon={<UserIcon size={16} color="var(--color-slate)" />}
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
          icon={<LeafIcon size={16} color="var(--color-slate)" />}
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
          icon={<BrainIcon size={16} color="var(--color-slate)" />}
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
          icon={<EyeIcon size={16} color="var(--color-slate)" />}
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
        icon={<CheckIcon size={16} color="var(--color-slate)" />}
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

      {/* Focus this week — interactive checklist */}
      {guide.focus_this_week && guide.focus_this_week.length > 0 && (
        <FocusThisWeek items={guide.focus_this_week} stage={stage} weekOrMonth={week_or_month} />
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
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><AlertIcon size={14} color="var(--color-amber)" /> Watch out for</span>
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

function FocusThisWeek({
  items,
  stage,
  weekOrMonth,
}: {
  items: string[]
  stage: Stage
  weekOrMonth: number
}) {
  const storageKey = `lumira_focus_${stage}_${weekOrMonth}`

  const [currentIndex, setCurrentIndex] = useState(0)
  const [completed, setCompleted] = useState<Record<number, boolean>>(() => {
    if (typeof window === 'undefined') return {}
    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })
  const [touchStartX, setTouchStartX] = useState<number | null>(null)

  const toggleCurrent = () => {
    setCompleted((prev) => {
      const next = { ...prev, [currentIndex]: !prev[currentIndex] }
      try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch {}
      return next
    })
  }

  const goTo = (i: number) => setCurrentIndex(Math.max(0, Math.min(i, items.length - 1)))
  const goNext = () => goTo(currentIndex + 1)
  const goPrev = () => goTo(currentIndex - 1)

  const onTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX)
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return
    const delta = e.changedTouches[0].clientX - touchStartX
    if (Math.abs(delta) > 48) {
      if (delta < 0) goNext()
      else goPrev()
    }
    setTouchStartX(null)
  }

  const item = items[currentIndex]
  const isDone = !!completed[currentIndex]
  const doneCount = Object.values(completed).filter(Boolean).length

  return (
    <div style={{ marginTop: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ClipboardIcon size={14} color="var(--color-muted)" /> Focus this week
          </span>
        </p>
        <span style={{ fontSize: '12px', fontWeight: 600, color: doneCount === items.length ? '#3D8178' : 'var(--color-muted)' }}>
          {doneCount}/{items.length} done
        </span>
      </div>

      {/* Flashcard */}
      <div style={{ position: 'relative', touchAction: 'pan-y' }}>
        <button
          type="button"
          onClick={toggleCurrent}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          style={{
            width: '100%',
            padding: '24px 20px',
            background: isDone
              ? 'linear-gradient(135deg, var(--color-primary-light), #e8f5f3)'
              : 'var(--color-surface)',
            borderRadius: '16px',
            border: isDone ? '1.5px solid #3D8178' : '1.5px solid var(--color-border)',
            cursor: 'pointer',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
            transition: 'all 0.2s ease',
            minHeight: '120px',
            justifyContent: 'center',
          }}
        >
          {/* Check ring */}
          <span
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: isDone ? '2px solid #3D8178' : '2px solid var(--color-border)',
              background: isDone ? '#3D8178' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
          >
            {isDone ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3.5 9L7.5 13L14.5 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 4V9M9 12V13" stroke="var(--color-border)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </span>

          {/* Focus text */}
          <p style={{
            fontSize: '16px',
            fontWeight: 600,
            lineHeight: 1.45,
            color: isDone ? '#3D8178' : 'var(--color-slate)',
            margin: 0,
            maxWidth: '280px',
          }}>
            {item}
          </p>

          {/* Hint */}
          <p style={{ fontSize: '12px', color: 'var(--color-muted)', margin: 0 }}>
            {isDone ? '✓ Tap to undo' : 'Tap to mark done · swipe to browse'}
          </p>
        </button>

        {/* Prev arrow */}
        {items.length > 1 && currentIndex > 0 && (
          <button
            onClick={goPrev}
            style={{
              position: 'absolute', left: '-10px', top: '50%',
              transform: 'translateY(-50%)',
              width: '30px', height: '30px', borderRadius: '50%',
              background: 'var(--color-white)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
              fontSize: '16px', color: 'var(--color-slate)',
              padding: 0,
            }}
          >‹</button>
        )}

        {/* Next arrow */}
        {items.length > 1 && currentIndex < items.length - 1 && (
          <button
            onClick={goNext}
            style={{
              position: 'absolute', right: '-10px', top: '50%',
              transform: 'translateY(-50%)',
              width: '30px', height: '30px', borderRadius: '50%',
              background: 'var(--color-white)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
              fontSize: '16px', color: 'var(--color-slate)',
              padding: 0,
            }}
          >›</button>
        )}
      </div>

      {/* Progress dots */}
      {items.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === currentIndex ? '22px' : '7px',
                height: '7px',
                borderRadius: '4px',
                background: i === currentIndex
                  ? '#3D8178'
                  : completed[i]
                  ? '#3D817866'
                  : 'var(--color-border)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.2s ease',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function Section({
  icon,
  title,
  isOpen,
  onToggle,
  defaultOpen = false,
  children,
}: {
  icon: React.ReactNode
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
        <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-slate)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          {icon} {title}
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
