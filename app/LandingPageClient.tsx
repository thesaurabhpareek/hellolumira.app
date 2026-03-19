'use client'
// app/LandingPageClient.tsx — Lumira coming-soon / waitlist landing page
// v1.3 — Tightened spacing, responsive desktop layout, restored SVG wordmark logo

import { useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'

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
    headline: 'You shouldn\u2019t have to figure this out alone.',
    sub: 'Week-by-week guidance on your body and your baby \u2014 from someone who notices what you\u2019re afraid to ask about, and never makes you feel behind.',
  },
  infant: {
    headline: 'The fourth trimester is hard. We see that.',
    sub: 'Daily check-ins that help you keep track of sleep, feeding, and how your baby is changing \u2014 so nothing slips through the cracks between appointments.',
  },
}

const PAIN_POINTS = [
  {
    quote: 'Something feels off and I can\u2019t explain it.',
    answer: 'Lumira gives you space to talk it through \u2014 calmly and without judgment.',
  },
  {
    quote: 'Is this normal, or should I be worried?',
    answer: 'Age-matched guides with clear answers, grounded in real clinical guidelines.',
  },
  {
    quote: 'Everyone\u2019s asking about the baby. Nobody\u2019s asking about me.',
    answer: 'Lumira makes space for how you\u2019re doing, too. Every single day.',
  },
]

const HOW_IT_WORKS = [
  { num: '1', text: 'Tell Lumira about your pregnancy or your baby. Two minutes, no forms, no overwhelm.' },
  { num: '2', text: 'Lumira checks in with you each day \u2014 an AI-powered conversation, not another thing to log.' },
  { num: '3', text: 'Lumira helps you notice things that are easy to overlook \u2014 so you can bring them up with your care team.' },
]

// ── Logo — womb-shaped curve (open arch pointing up) with circle dot at peak ──
function LumiraLogo() {
  return (
    <svg
      viewBox="0 0 220 48"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Lumira"
      style={{ width: 'clamp(130px, 18vw, 185px)', height: 'auto' }}
    >
      {/* Circle dot at the peak */}
      <circle cx="16" cy="9" r="5" fill="#C4844E" />

      {/* Womb arch — wide, rounded U shape opening upward.
          Starts and ends at the bottom, curves up and over like a womb/dome. */}
      <path
        d="M 3,38 C 3,14 29,14 29,38"
        fill="none"
        stroke="#3D8178"
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* Wordmark */}
      <text x="38" y="36" fontFamily="'Plus Jakarta Sans', -apple-system, sans-serif" fontSize="30" fontWeight="700" fill="#1A1A2E" letterSpacing="-0.7">Lumira</text>
    </svg>
  )
}

export default function LandingPage() {
  const searchParams = useSearchParams()
  const [stage, setStage] = useState<Stage>('pregnancy')
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [waitlistError, setWaitlistError] = useState('')

  const buildAuthUrl = useCallback(() => {
    const params = new URLSearchParams()
    const s = searchParams.get('utm_source'), m = searchParams.get('utm_medium'), c = searchParams.get('utm_campaign')
    if (s) params.set('utm_source', s)
    if (m) params.set('utm_medium', m)
    if (c) params.set('utm_campaign', c)
    const qs = params.toString()
    return qs ? `/login?${qs}` : '/login'
  }, [searchParams])

  const copy = COPY[stage]

  return (
    <>
      <style jsx global>{`
        html { scroll-behavior: smooth; }
        body { background: ${SAND_0} !important; }

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
                  { key: 'pregnancy' as Stage, label: "I'm expecting" },
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

              {/* CTA */}
              <div className="lp-fade lp-d5" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <a
                  href={buildAuthUrl()}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 52, background: SAGE_500, color: 'white', fontSize: 16, fontWeight: 600, borderRadius: 12, textDecoration: 'none', transition: 'background 0.15s ease, transform 0.1s ease', fontFamily: 'inherit' }}
                  onMouseEnter={e => (e.currentTarget.style.background = SAGE_700)}
                  onMouseLeave={e => (e.currentTarget.style.background = SAGE_500)}
                  onMouseDown={e  => (e.currentTarget.style.transform = 'scale(0.98)')}
                  onMouseUp={e    => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  Start for free — no download needed
                </a>
                <p style={{ fontSize: 13, color: SAND_300, margin: 0 }}>Opens right in your browser. Ready in under two minutes.</p>
              </div>

              {/* Waitlist email signup */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <label htmlFor="waitlist-email" style={{ fontSize: 14, color: SAND_500, fontWeight: 500 }}>
                  Or join our waitlist for updates
                </label>
                <div style={{ display: 'flex', width: '100%', gap: 8 }}>
                  <input
                    id="waitlist-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={waitlistEmail}
                    onChange={e => { setWaitlistEmail(e.target.value); setWaitlistStatus('idle'); setWaitlistError('') }}
                    style={{ flex: 1, height: 48, padding: '0 14px', borderRadius: 10, border: `1px solid ${SAND_100}`, fontSize: 16, fontFamily: 'inherit', outline: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!waitlistEmail || !waitlistEmail.includes('@')) {
                        setWaitlistStatus('error')
                        setWaitlistError('Please enter a valid email.')
                        return
                      }
                      setWaitlistStatus('success')
                    }}
                    style={{ height: 48, padding: '0 20px', borderRadius: 10, border: 'none', background: SAGE_500, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', touchAction: 'manipulation' }}
                  >
                    Join
                  </button>
                </div>
                <div aria-live="polite" style={{ minHeight: 20, fontSize: 13 }}>
                  {waitlistStatus === 'error' && <p style={{ color: '#c53030', margin: 0 }}>{waitlistError}</p>}
                  {waitlistStatus === 'success' && <p style={{ color: SAGE_500, margin: 0 }}>You&apos;re on the list!</p>}
                </div>
              </div>

              <p style={{ fontSize: 12, color: SAND_300, textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
                Lumira is an AI companion, not a doctor or midwife. It does not diagnose or detect medical conditions. Always consult your healthcare provider for medical concerns. In an emergency call 911 (US) or 999 (UK).
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
                Grounded in trusted guidelines. Delivered like a friend.
              </p>
              <p style={{ fontSize: 13, color: SAND_300, margin: 0, letterSpacing: '0.4px', fontWeight: 500 }}>
                Content informed by AAP &middot; WHO &middot; NICE &middot; RCOG
              </p>
              <p style={{ fontSize: 11, color: SAND_300, margin: '6px 0 0', fontStyle: 'italic' }}>
                Not affiliated with or endorsed by these organizations.
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
                Start for free — no download needed
              </a>
              <p style={{ fontSize: 13, color: SAND_500, margin: 0, textAlign: 'center' }}>
                Opens right in your browser. Ready in under two minutes.
              </p>
            </div>

            {/* Legal footer */}
            <div style={{ marginTop: 40, paddingTop: 20, borderTop: `1px solid ${SAND_100}` }}>
              <p style={{ fontSize: 11, color: SAND_300, textAlign: 'center', margin: 0, lineHeight: 1.8 }}>
                Lumira is an AI companion — not a doctor, midwife, or mental health professional. It does not diagnose or detect medical conditions. Always consult your healthcare provider for medical concerns.{' '}
                <strong style={{ fontWeight: 600 }}>In an emergency, call 911 (US) or 999 (UK).</strong>
                <br />
                Postpartum mental health support:{' '}
                <a href="https://www.postpartum.net" target="_blank" rel="noopener noreferrer" style={{ color: SAGE_500, textDecoration: 'none' }}>
                  Postpartum Support International
                </a>{' '}
                · 1-800-944-4773
              </p>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}
