'use client'
// app/LandingPageClient.tsx — Lumira coming-soon / waitlist landing page
// v1.3 — Tightened spacing, responsive desktop layout, restored SVG wordmark logo

import { useState, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isValidEmail, sanitizeString } from '@/lib/validation'

// ── Design tokens ──
const SAGE_500 = '#3D8178'
const SAGE_700 = '#1F4F49'
const SAGE_50  = '#EDF4F2'
const SAND_0   = '#FAFAF8'
const SAND_100 = '#E8E6E1'
const SAND_500 = '#706D67'
const SAND_300 = '#B0ADA6'
const SLATE    = '#2D3748'

type Stage = 'pregnancy' | 'infant'

const COPY: Record<Stage, { headline: string; sub: string }> = {
  pregnancy: {
    headline: 'A calm guide beside you, from the moment you find out.',
    sub: 'Week-by-week guidance on your baby\u2019s development and your body\u2019s changes. A companion that checks in, notices what matters, and helps you feel prepared \u2014 not overwhelmed.',
  },
  infant: {
    headline: 'Every phase is easier when someone\u2019s got your back.',
    sub: 'Guides tuned to exactly where your baby is this week. Daily check-ins that spot patterns in sleep, feeding, and growth \u2014 and surface them before they become worries.',
  },
}

const PAIN_POINTS = [
  {
    quote: 'Something feels off and I can\u2019t quite name it.',
    answer: 'Lumira helps you work through it \u2014 clearly and calmly.',
  },
  {
    quote: 'Is this normal for her age?',
    answer: 'Weekly guides built for exactly where your baby is right now.',
  },
  {
    quote: 'I\u2019m exhausted and no one is asking how I\u2019m doing.',
    answer: 'Lumira checks in on you \u2014 not just the baby.',
  },
]

const HOW_IT_WORKS = [
  { num: '1', text: 'Tell Lumira about your pregnancy or your baby. 60 seconds. No forms, no overwhelm.' },
  { num: '2', text: 'Lumira checks in with you each day \u2014 a real conversation, not another thing to log.' },
  { num: '3', text: 'Lumira spots what you might miss: patterns in sleep, feeding, and mood \u2014 before they become worries.' },
]

// ── Logo — crescent moon (top) + amber sun rising from hill ──
function LumiraLogo() {
  return (
    <svg
      viewBox="0 0 240 56"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Lumira"
      style={{ width: 'clamp(140px, 20vw, 200px)', height: 'auto' }}
    >
      <defs>
        {/* Mask: cuts upper-right of moon circle to form a left-facing crescent */}
        <mask id="lp-crescent">
          <rect width="36" height="56" fill="white" />
          <circle cx="19" cy="11" r="7.5" fill="black" />
        </mask>
      </defs>

      {/* Crescent moon — sage green, sits in upper portion */}
      <circle cx="14" cy="14" r="9" fill="#3D8178" mask="url(#lp-crescent)" />

      {/* Amber sun — semicircle rising from the hill crest */}
      <path d="M 9,39 A 7,7 0 0,1 23,39 Z" fill="#C4844E" />

      {/* Hill — smooth arc, crest meets base of sun */}
      <path d="M 1,46 Q 16,33 31,46" fill="none" stroke="#3D8178" strokeWidth="2.2" strokeLinecap="round" />

      {/* Wordmark */}
      <text x="38" y="40" fontFamily="'Plus Jakarta Sans', -apple-system, sans-serif" fontSize="34" fontWeight="700" fill="#1A1A2E" letterSpacing="-0.8">Lumira</text>
    </svg>
  )
}

export default function LandingPage() {
  const searchParams = useSearchParams()
  const [stage, setStage] = useState<Stage>('pregnancy')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const submittingRef = useRef(false)

  const buildAuthUrl = useCallback(() => {
    const params = new URLSearchParams()
    const s = searchParams.get('utm_source'), m = searchParams.get('utm_medium'), c = searchParams.get('utm_campaign')
    if (s) params.set('utm_source', s)
    if (m) params.set('utm_medium', m)
    if (c) params.set('utm_campaign', c)
    const qs = params.toString()
    return qs ? `/auth?${qs}` : '/auth'
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    if (!isValidEmail(email)) { setError('Please enter a valid email address.'); return }
    if (submittingRef.current) return
    submittingRef.current = true
    setLoading(true); setError(null)
    try {
      const params = new URLSearchParams(window.location.search)
      const supabase = createClient()
      const { error: dbError } = await supabase.from('early_access_queue').insert({
        email: email.trim(), stage,
        utm_source:    params.get('utm_source')   ? sanitizeString(params.get('utm_source')!,   200) : null,
        utm_medium:    params.get('utm_medium')   ? sanitizeString(params.get('utm_medium')!,   200) : null,
        utm_campaign:  params.get('utm_campaign') ? sanitizeString(params.get('utm_campaign')!, 200) : null,
        referral_code: params.get('ref')          ? sanitizeString(params.get('ref')!,          200) : null,
      })
      if (dbError?.code === '23505') setSubmitted(true)
      else if (dbError) setError('Could not join the waitlist. Please try again.')
      else setSubmitted(true)
    } catch {
      setError('Could not join the waitlist. Please try again.')
    } finally {
      setLoading(false)
      submittingRef.current = false
    }
  }

  const copy = COPY[stage]

  return (
    <>
      <style jsx global>{`
        html { scroll-behavior: smooth; }
        body { overflow: auto !important; background: ${SAND_0} !important; }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lp-fade { animation: fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .lp-d1 { animation-delay: 0.05s; }
        .lp-d2 { animation-delay: 0.15s; }
        .lp-d3 { animation-delay: 0.25s; }
        .lp-d4 { animation-delay: 0.35s; }
        .lp-d5 { animation-delay: 0.45s; }

        /* Responsive container */
        .lp-container {
          max-width: 520px;
          width: 100%;
          margin: 0 auto;
          padding: 0 24px;
          box-sizing: border-box;
        }

        /* Pain points grid: 1-col mobile, 3-col desktop */
        .lp-pain-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 768px) {
          .lp-pain-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
          .lp-container {
            max-width: 840px;
          }
          .lp-hero-content {
            max-width: 560px;
            margin: 0 auto;
          }
        }

        /* Section divider */
        .lp-divider {
          height: 1px;
          background: ${SAND_100};
          margin: 0 24px;
        }
      `}</style>

      <div style={{ background: SAND_0, fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

        {/* ── HERO ── */}
        <section style={{ padding: '52px 0 48px' }}>
          <div className="lp-container">
            <div className="lp-hero-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>

              <div className="lp-fade lp-d1">
                <LumiraLogo />
              </div>

              {/* Stage toggle */}
              <div
                className="lp-fade lp-d2"
                role="group"
                aria-label="Select your stage"
                style={{ display: 'flex', gap: 6, padding: 4, borderRadius: 28, background: 'white', border: `1px solid ${SAND_100}` }}
              >
                {([
                  { key: 'pregnancy' as Stage, label: "I'm pregnant" },
                  { key: 'infant'    as Stage, label: 'My baby is here' },
                ]).map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={stage === key}
                    onClick={() => setStage(key)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 24,
                      border: 'none',
                      background: stage === key ? SAGE_50 : 'transparent',
                      color: stage === key ? SAGE_500 : SAND_500,
                      fontWeight: stage === key ? 600 : 500,
                      fontSize: 14,
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      fontFamily: 'inherit',
                      minHeight: 44,
                      touchAction: 'manipulation',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Headline */}
              <h1
                className="lp-fade lp-d3"
                style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 700, lineHeight: 1.25, color: SLATE, textAlign: 'center', margin: 0, letterSpacing: '-0.5px' }}
              >
                {copy.headline}
              </h1>

              {/* Subtitle */}
              <p
                className="lp-fade lp-d4"
                style={{ fontSize: 16, lineHeight: 1.65, color: SAND_500, textAlign: 'center', margin: 0 }}
              >
                {copy.sub}
              </p>

              {/* Waitlist form */}
              <div className="lp-fade lp-d5" style={{ width: '100%' }}>
                {submitted ? (
                  <div style={{ textAlign: 'center', padding: '12px 0' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🌱</div>
                    <p style={{ fontSize: 17, fontWeight: 600, color: SLATE, margin: '0 0 4px' }}>You&apos;re on the list.</p>
                    <p style={{ fontSize: 14, color: SAND_500, margin: 0 }}>We&apos;ll be in touch soon. Thank you for being here early.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate style={{ width: '100%' }}>
                    <label htmlFor="waitlist-email" style={{ display: 'block', fontSize: 13, color: SAND_500, marginBottom: 6, textAlign: 'center' }}>
                      Get early access
                    </label>
                    <input
                      id="waitlist-email"
                      type="email"
                      inputMode="email"
                      required
                      maxLength={254}
                      autoComplete="email"
                      enterKeyHint="send"
                      placeholder="your@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      style={{ width: '100%', height: 48, padding: '0 16px', borderRadius: 10, border: `1.5px solid ${SAND_100}`, background: '#fff', fontSize: 16, fontFamily: 'inherit', color: SLATE, outline: 'none', marginBottom: 8, boxSizing: 'border-box' }}
                    />
                    <div role="alert" aria-live="polite">
                      {error && <p style={{ fontSize: 13, color: '#C53030', marginBottom: 8, textAlign: 'center' }}>{error}</p>}
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 52, background: loading ? SAND_500 : SAGE_500, color: 'white', fontSize: 16, fontWeight: 600, borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s ease, transform 0.1s ease', fontFamily: 'inherit' }}
                      onMouseEnter={e => { if (!loading) e.currentTarget.style.background = SAGE_700 }}
                      onMouseLeave={e => { if (!loading) e.currentTarget.style.background = SAGE_500 }}
                      onMouseDown={e  => { if (!loading) e.currentTarget.style.transform = 'scale(0.98)' }}
                      onMouseUp={e    => { if (!loading) e.currentTarget.style.transform = 'scale(1)' }}
                    >
                      {loading ? 'Joining\u2026' : 'Join the waitlist'}
                    </button>
                  </form>
                )}
              </div>

              <p style={{ fontSize: 12, color: SAND_300, textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
                Not a substitute for medical care. Informed by AAP, WHO, and NICE guidelines.
              </p>
            </div>
          </div>
        </section>

        <div className="lp-divider" />

        {/* ── PAIN POINTS ── */}
        <section style={{ padding: '48px 0' }}>
          <div className="lp-container">
            <div className="lp-pain-grid">
              {PAIN_POINTS.map((point, i) => (
                <div
                  key={i}
                  style={{ background: 'white', border: `1px solid ${SAND_100}`, borderRadius: 14, padding: '20px 20px 18px' }}
                >
                  <p style={{ fontSize: 16, fontWeight: 600, color: SLATE, margin: '0 0 8px', lineHeight: 1.4, fontStyle: 'italic' }}>
                    &ldquo;{point.quote}&rdquo;
                  </p>
                  <p style={{ fontSize: 14, color: SAND_500, margin: 0, lineHeight: 1.5 }}>
                    {point.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="lp-divider" />

        {/* ── HOW IT WORKS ── */}
        <section style={{ padding: '48px 0' }}>
          <div className="lp-container">
            <h2 style={{ fontSize: 18, fontWeight: 700, color: SLATE, textAlign: 'center', margin: '0 0 28px', letterSpacing: '-0.2px' }}>
              How it works
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {HOW_IT_WORKS.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 28, height: 28, minWidth: 28, borderRadius: '50%', background: SAGE_50, color: SAGE_500, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, marginTop: 1 }}>
                    {step.num}
                  </div>
                  <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.6, margin: 0 }}>{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="lp-divider" />

        {/* ── TRUST + CTA ── */}
        <section style={{ padding: '48px 0 72px' }}>
          <div className="lp-container">
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <p style={{ fontSize: 18, fontWeight: 600, color: SLATE, margin: '0 0 8px', lineHeight: 1.4 }}>
                Built on evidence, not guesswork.
              </p>
              <p style={{ fontSize: 13, color: SAND_300, margin: 0, letterSpacing: '0.4px', fontWeight: 500 }}>
                Benchmarked against: AAP &middot; WHO &middot; NICE &middot; RCOG
              </p>
            </div>

            <div className="lp-hero-content" style={{ maxWidth: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <a
                href={buildAuthUrl()}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 52, background: SAGE_500, color: 'white', fontSize: 16, fontWeight: 600, borderRadius: 12, textDecoration: 'none', transition: 'background 0.15s ease, transform 0.1s ease', fontFamily: 'inherit' }}
                onMouseEnter={e => (e.currentTarget.style.background = SAGE_700)}
                onMouseLeave={e => (e.currentTarget.style.background = SAGE_500)}
                onMouseDown={e  => (e.currentTarget.style.transform = 'scale(0.98)')}
                onMouseUp={e    => (e.currentTarget.style.transform = 'scale(1)')}
              >
                Get started — it&apos;s free
              </a>
              <p style={{ fontSize: 13, color: SAND_500, margin: 0, textAlign: 'center' }}>
                No app to download. Works on your phone right now.
              </p>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}
