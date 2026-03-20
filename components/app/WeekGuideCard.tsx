/**
 * @module WeekGuideCard
 * @description Expandable weekly developmental guide card.
 * @version 1.1.0 — Migrated inline styles → Tailwind classes
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
      className="shimmer rounded-[6px] mb-2"
      style={{ width, height: `${height}px` }}
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

  useEffect(() => { fetchGuide() }, [fetchGuide])

  const stageLabel =
    stage === 'pregnancy'  ? `Week ${week_or_month}`  :
    stage === 'infant'     ? `Week ${week_or_month}`  :
    `Month ${week_or_month}`

  if (loading) {
    return (
      <div className="lumira-card">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="shimmer w-20 h-[22px] rounded-full" />
          <div className="shimmer w-[120px] h-4 rounded-[6px]" />
        </div>
        <ShimmerLine width="100%" height={16} />
        <ShimmerLine width="90%"  height={16} />
        <ShimmerLine width="70%"  height={16} />
        <div className="my-4">
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
      <div className="lumira-card text-center">
        <p className="text-muted-foreground mb-4">
          {error || "Your guide isn\u2019t loading right now \u2014 tap to try again"}
        </p>
        <button onClick={fetchGuide} className="btn-primary">Try again</button>
      </div>
    )
  }

  return (
    <div className="lumira-card">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <span className="px-3 py-1 rounded-full bg-primary text-white text-[13px] font-bold">
          {stageLabel}
        </span>
        <span className="text-sm font-semibold text-muted-foreground">
          {stage === 'pregnancy' ? 'Pregnancy guide' : `${babyName || 'Baby'}'s guide`}
        </span>
      </div>

      {/* Opening */}
      <p className="text-[15px] leading-[1.7] text-foreground mb-5">{guide.opening}</p>

      {/* Pregnancy sections */}
      {stage === 'pregnancy' && guide.baby_development && (
        <Section
          icon={<UserIcon size={16} color="var(--color-slate)" />}
          title="Baby development"
          isOpen={openAccordion === 'baby_dev'}
          onToggle={() => setOpenAccordion(openAccordion === 'baby_dev' ? null : 'baby_dev')}
          defaultOpen
        >
          <p className="text-sm leading-[1.7] text-foreground">{guide.baby_development}</p>
        </Section>
      )}

      {stage === 'pregnancy' && guide.body_changes && (
        <Section
          icon={<LeafIcon size={16} color="var(--color-slate)" />}
          title="Body changes"
          isOpen={openAccordion === 'body_changes'}
          onToggle={() => setOpenAccordion(openAccordion === 'body_changes' ? null : 'body_changes')}
        >
          <ul className="m-0 pl-4">
            {guide.body_changes.map((item, i) => (
              <li key={i} className="text-sm leading-[1.7] text-foreground mb-1">{item}</li>
            ))}
          </ul>
        </Section>
      )}

      {/* Infant / toddler sections */}
      {stage !== 'pregnancy' && guide.what_is_happening && (
        <Section
          icon={<BrainIcon size={16} color="var(--color-slate)" />}
          title="What's happening"
          isOpen={openAccordion === 'what_happening'}
          onToggle={() => setOpenAccordion(openAccordion === 'what_happening' ? null : 'what_happening')}
          defaultOpen
        >
          <p className="text-sm leading-[1.7] text-foreground">{guide.what_is_happening}</p>
        </Section>
      )}

      {stage !== 'pregnancy' && guide.what_you_might_notice && (
        <Section
          icon={<EyeIcon size={16} color="var(--color-slate)" />}
          title="What you might notice"
          isOpen={openAccordion === 'notice'}
          onToggle={() => setOpenAccordion(openAccordion === 'notice' ? null : 'notice')}
        >
          <ul className="m-0 pl-4">
            {guide.what_you_might_notice.map((item, i) => (
              <li key={i} className="text-sm leading-[1.7] text-foreground mb-1">{item}</li>
            ))}
          </ul>
        </Section>
      )}

      {/* Usually normal */}
      <Section
        icon={<CheckIcon size={16} color="var(--color-slate)" />}
        title="Usually normal"
        isOpen={openAccordion === 'normal'}
        onToggle={() => setOpenAccordion(openAccordion === 'normal' ? null : 'normal')}
      >
        <ul className="m-0 pl-4">
          {guide.whats_usually_normal.map((item, i) => (
            <li key={i} className="text-sm leading-[1.7] text-foreground mb-1">{item}</li>
          ))}
        </ul>
      </Section>

      {/* Focus this week */}
      {guide.focus_this_week && guide.focus_this_week.length > 0 && (
        <FocusThisWeek items={guide.focus_this_week} stage={stage} weekOrMonth={week_or_month} />
      )}

      {/* Watch outs */}
      {guide.watch_outs && guide.watch_outs.length > 0 && (
        <div className="mt-4 bg-status-amber-light border border-[#F6E05E] rounded-md px-4 py-3.5">
          <p className="text-[13px] font-bold text-status-amber mb-2">
            <span className="inline-flex items-center gap-1">
              <AlertIcon size={14} color="var(--color-amber)" /> Watch out for
            </span>
          </p>
          <ul className="m-0 pl-4">
            {guide.watch_outs.map((item, i) => (
              <li key={i} className="text-[13px] leading-[1.7] text-status-amber-dark mb-1">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Medical disclaimer */}
      <p className="text-[13px] text-muted-foreground mt-4 leading-[1.5]">
        Grounded in AAP, WHO &amp; NICE guidelines · Always check with your care team for personal medical questions
      </p>
    </div>
  )
}

/* ── FocusThisWeek ── */
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
    } catch { return {} }
  })
  const [touchStartX, setTouchStartX] = useState<number | null>(null)

  const toggleCurrent = () => {
    setCompleted((prev) => {
      const next = { ...prev, [currentIndex]: !prev[currentIndex] }
      try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch {}
      return next
    })
  }

  const goTo   = (i: number) => setCurrentIndex(Math.max(0, Math.min(i, items.length - 1)))
  const goNext = () => goTo(currentIndex + 1)
  const goPrev = () => goTo(currentIndex - 1)

  const onTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX)
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchStartX === null) return
    const delta = e.changedTouches[0].clientX - touchStartX
    if (Math.abs(delta) > 48) { if (delta < 0) { goNext() } else { goPrev() } }
    setTouchStartX(null)
  }

  const item     = items[currentIndex]
  const isDone   = !!completed[currentIndex]
  const doneCount = Object.values(completed).filter(Boolean).length

  return (
    <div className="mt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-bold text-muted-foreground uppercase tracking-[0.5px] m-0">
          <span className="inline-flex items-center gap-1">
            <ClipboardIcon size={14} color="var(--color-muted)" /> Focus this week
          </span>
        </p>
        <span className={`text-xs font-semibold ${doneCount === items.length ? 'text-primary' : 'text-muted-foreground'}`}>
          {doneCount}/{items.length} done
        </span>
      </div>

      {/* Flashcard */}
      <div className="relative touch-pan-y">
        <button
          type="button"
          onClick={toggleCurrent}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="w-full px-5 py-6 rounded-2xl flex flex-col items-center gap-3.5 cursor-pointer text-center border-[1.5px] transition-all duration-200 min-h-[120px] justify-center"
          style={{
            background: isDone
              ? 'linear-gradient(135deg, var(--color-primary-light), #e8f5f3)'
              : 'var(--color-surface)',
            borderColor: isDone ? '#3D8178' : 'var(--color-border)',
          }}
        >
          {/* Check ring */}
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-200"
            style={{
              border: isDone ? '2px solid #3D8178' : '2px solid var(--color-border)',
              background: isDone ? '#3D8178' : 'transparent',
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
          <p
            className="text-base font-semibold leading-[1.45] m-0 max-w-[280px]"
            style={{ color: isDone ? '#3D8178' : 'var(--color-slate)' }}
          >
            {item}
          </p>

          <p className="text-xs text-muted-foreground m-0">
            {isDone ? '✓ Tap to undo' : 'Tap to mark done · swipe to browse'}
          </p>
        </button>

        {/* Prev / next arrows */}
        {items.length > 1 && currentIndex > 0 && (
          <button
            onClick={goPrev}
            className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-[30px] h-[30px] rounded-full bg-white border border-border cursor-pointer flex items-center justify-center shadow-[0_1px_6px_rgba(0,0,0,0.08)] text-base text-foreground p-0"
          >‹</button>
        )}
        {items.length > 1 && currentIndex < items.length - 1 && (
          <button
            onClick={goNext}
            className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-[30px] h-[30px] rounded-full bg-white border border-border cursor-pointer flex items-center justify-center shadow-[0_1px_6px_rgba(0,0,0,0.08)] text-base text-foreground p-0"
          >›</button>
        )}
      </div>

      {/* Progress dots */}
      {items.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="h-[7px] rounded-[4px] border-none cursor-pointer p-0 transition-all duration-200"
              style={{
                width: i === currentIndex ? '22px' : '7px',
                background: i === currentIndex
                  ? '#3D8178'
                  : completed[i]
                  ? '#3D817866'
                  : 'var(--color-border)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Section accordion ── */
function Section({
  icon, title, isOpen, onToggle, defaultOpen = false, children,
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
    <div className="border-t border-border pt-3 mt-3">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between bg-transparent border-none cursor-pointer pb-2 min-h-[36px] p-0"
      >
        <span className="font-semibold text-sm text-foreground inline-flex items-center gap-1.5">
          {icon} {title}
        </span>
        <span
          className="text-muted-foreground text-lg transition-transform duration-200"
          style={{ transform: show ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ›
        </span>
      </button>
      {show && (
        <div className="animate-fade-in pb-1">{children}</div>
      )}
    </div>
  )
}
