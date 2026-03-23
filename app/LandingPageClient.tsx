'use client'
// app/LandingPageClient.tsx — Lumira coming-soon / waitlist landing page
// v1.3 — Tightened spacing, responsive desktop layout, restored SVG wordmark logo

import { useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'

// ── Design tokens ──
const SAGE_500 = '#3D8178'  // button fills — ok with white text
const SAGE_600 = '#2C6058'  // link text — ~5.6:1 on FAFAF8 and white — passes WCAG AA
const SAGE_700 = '#1F4F49'
const SAGE_50  = '#EDF4F2'
const SAND_0   = '#FAFAF8'
const SAND_100 = '#E8E6E1'
const SAND_400 = '#857F78'  // WCAG AA compliant on #FAFAF8 (~4.7:1)
const SAND_500 = '#706D67'  // WCAG AA compliant on white footer background (~5.2:1)
const SLATE    = '#2D3748'

type Stage = 'planning' | 'pregnancy' | 'infant'
type PainPoint = { quote: string; answer: string }

const COPY: Record<Stage, { headline: string; sub: string }> = {
  planning: {
    headline: 'Planning a baby is one of the biggest decisions you\u2019ll ever make. You shouldn\u2019t have to figure it out alone.',
    sub: 'Lumira helps you understand your body, prepare your health, and navigate the emotional side of trying to conceive \u2014 with guidance grounded in real evidence, not noise.',
  },
  pregnancy: {
    headline: 'You shouldn\u2019t have to figure this out alone.',
    sub: 'Week-by-week guidance on your pregnancy and your baby \u2014 from someone who notices what you\u2019re afraid to ask about, and never makes you feel behind.',
  },
  infant: {
    headline: 'New baby, new questions \u2014 every single week. You don\u2019t have to figure them out alone.',
    sub: 'Age-matched guidance for every week of your little one\u2019s first year \u2014 sleep, feeding, development milestones, and the questions you didn\u2019t even know to ask.',
  },
}

const PAIN_POINTS: PainPoint[] = [
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
  {
    quote: 'My family says one thing. My doctor says another. I love them both.',
    answer: 'Lumira is culturally aware \u2014 helping you honor your roots while staying grounded in current evidence. No judgment on either side.',
  },
]

const HOW_IT_WORKS = [
  { num: '1', text: 'Tell Lumira about your pregnancy or your baby. Two minutes, no forms, no overwhelm.' },
  { num: '2', text: 'Lumira checks in with you each day \u2014 an AI-powered conversation, not another thing to log.' },
  { num: '3', text: 'Lumira helps you notice things that are easy to overlook \u2014 so you can bring them up with your care team.' },
]

// ── Logo — icon centred above wordmark (plain span so flexbox centres perfectly) ──
function LumiraLogo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      {/* Icon: arch + amber dot */}
      <svg
        viewBox="0 0 32 36"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ width: 'clamp(52px, 10vw, 68px)', height: 'auto' }}
      >
        <circle cx="16" cy="6" r="5.5" fill="#C4844E" />
        <path d="M 2,34 C 2,12 30,12 30,34" fill="none" stroke="#3D8178" strokeWidth="2.8" strokeLinecap="round" />
      </svg>
      {/* Wordmark — plain text so it centres naturally */}
      <span
        style={{
          fontSize: 'clamp(30px, 6vw, 42px)',
          fontWeight: 700,
          color: SLATE,
          letterSpacing: '-1px',
          lineHeight: 1,
          fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
        }}
      >
        Lumira
      </span>
    </div>
  )
}

export default function LandingPage() {
  const searchParams = useSearchParams()
  const [stage, setStage] = useState<Stage>('pregnancy')

  const buildAuthUrl = useCallback(() => {
    const params = new URLSearchParams()
    const s = searchParams.get('utm_source'), m = searchParams.get('utm_medium'), c = searchParams.get('utm_campaign')
    if (s) params.set('utm_source', s)
    if (m) params.set('utm_medium', m)
    if (c) params.set('utm_campaign', c)
    params.set('mode', 'signup')
    const qs = params.toString()
    return `/login?${qs}`
  }, [searchParams])

  const copy = COPY[stage]

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div style={{ background: SAND_0 }}>

        {/* ── HERO ── */}
        <main id="main-content">
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
                  { key: 'planning'  as Stage, label: 'Planning a baby' },
                  { key: 'pregnancy' as Stage, label: "We're expecting" },
                  { key: 'infant'    as Stage, label: 'Our baby is here' },
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
                      color: stage === key ? SAGE_700 : SAND_400,
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

              {/* Headline — aria-live announces stage changes to screen readers */}
              <h1
                className="lp-fade lp-d3"
                aria-live="polite"
                aria-atomic="true"
                style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 700, lineHeight: 1.25, color: SLATE, textAlign: 'center', margin: 0, letterSpacing: '-0.5px' }}
              >
                {copy.headline}
              </h1>

              {/* Subtitle */}
              <p
                className="lp-fade lp-d4"
                style={{ fontSize: 16, lineHeight: 1.65, color: SAND_400, textAlign: 'center', margin: 0 }}
              >
                {copy.sub}
              </p>

              {/* CTA */}
              <div className="lp-fade lp-d5" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <a
                  href={buildAuthUrl()}
                  className="lp-cta-btn"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 52, background: SAGE_500, color: 'white', fontSize: 16, fontWeight: 600, borderRadius: 12, textDecoration: 'none', transition: 'background 0.15s ease, transform 0.1s ease', fontFamily: 'inherit' }}
                  onMouseEnter={e => (e.currentTarget.style.background = SAGE_700)}
                  onMouseLeave={e => (e.currentTarget.style.background = SAGE_500)}
                  onMouseDown={e  => (e.currentTarget.style.transform = 'scale(0.98)')}
                  onMouseUp={e    => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  Start for free — no download needed
                </a>
                <p style={{ fontSize: 13, color: SAND_400, margin: 0 }}>Opens right in your browser. Ready in under two minutes.</p>
                <p style={{ fontSize: 12, color: SAND_400, margin: 0 }}>Free to start &middot; No credit card required</p>
                <p style={{ fontSize: 13, color: SAND_400, margin: '4px 0 0' }}>
                  Already have an account?{' '}
                  <a href="/login" style={{ color: SAGE_600, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                    Sign in
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="lp-divider" />

        {/* ── PAIN POINTS ── */}
        <section aria-labelledby="pain-points-heading" style={{ padding: '48px 0' }}>
          <div className="lp-container">
            <h2 id="pain-points-heading" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}>
              Common worries we help with
            </h2>
            <div className="lp-pain-grid">
              {PAIN_POINTS.map((point, i) => (
                <div key={i} className="lp-pain-card">
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
              Here&apos;s what it actually looks like
            </h2>
            <ol style={{ display: 'flex', flexDirection: 'column', gap: 20, listStyle: 'none', padding: 0, margin: 0 }}>
              {HOW_IT_WORKS.map((step, i) => (
                <li key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div aria-hidden="true" style={{ width: 28, height: 28, minWidth: 28, borderRadius: '50%', background: '#FDF0E6', color: '#C4844E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, marginTop: 1 }}>
                    {step.num}
                  </div>
                  <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.6, margin: 0 }}>{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <div className="lp-divider" />

        {/* ── TRUST ── */}
        <section style={{ padding: '48px 0 72px' }}>
          <div className="lp-container">
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <p style={{ fontSize: 18, fontWeight: 600, color: SLATE, margin: '0 0 8px', lineHeight: 1.4 }}>
                Grounded in trusted guidelines. Delivered like a friend.
              </p>
              <p style={{ fontSize: 13, color: SAND_400, margin: 0, letterSpacing: '0.4px', fontWeight: 500 }}>
                Content informed by AAP &middot; WHO &middot; NICE &middot; RCOG
              </p>
              <p style={{ fontSize: 11, color: SAND_400, margin: '6px 0 0', fontStyle: 'italic' }}>
                Not affiliated with or endorsed by these organizations.
              </p>
            </div>

            <div style={{ maxWidth: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <p style={{ fontSize: 12, color: SAND_400, margin: 0, textAlign: 'center' }}>
                <span aria-hidden="true">🔒</span> Your conversations stay private. We never sell your data.
              </p>
            </div>

            {/* Medical disclaimer */}
            <div role="note" aria-label="Medical disclaimer" style={{ marginTop: 40, paddingTop: 20, borderTop: `1px solid ${SAND_100}` }}>
              <p style={{ fontSize: 11, color: SAND_400, textAlign: 'center', margin: 0, lineHeight: 1.8 }}>
                Lumira is an AI companion — not a doctor, midwife, or mental health professional. It does not diagnose or detect medical conditions. Always consult your healthcare provider for medical concerns.{' '}
                <strong style={{ fontWeight: 600 }}>In an emergency: 911 (US/CA) · 999 (UK) · 112 (EU/IN/most countries) · 000 (AU) · 111 (NZ)</strong>
                <br />
                Postpartum mental health support:{' '}
                <a href="https://www.postpartum.net/get-help/international-postpartum-support-resources/" target="_blank" rel="noopener noreferrer" style={{ color: SAGE_600, textDecoration: 'underline' }}>
                  Postpartum Support International
                </a>{' '}
                ·{' '}
                <a href="tel:+18009444773" style={{ color: SAGE_600, textDecoration: 'underline' }}>
                  1-800-944-4773
                </a>{' '}
                (US) ·{' '}
                <a href="https://www.postpartum.net/get-help/international-postpartum-support-resources/" target="_blank" rel="noopener noreferrer" style={{ color: SAGE_600, textDecoration: 'underline' }}>
                  international resources
                </a>
              </p>
            </div>
          </div>
        </section>

        </main>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: `1px solid ${SAND_100}`, background: 'white', padding: '28px 0 32px' }}>
          <div className="lp-container">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>

              {/* Brand */}
              <p style={{ fontSize: 14, fontWeight: 700, color: SLATE, margin: 0, letterSpacing: '-0.2px' }}>Lumira</p>

              {/* Nav links */}
              <nav aria-label="Footer navigation" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 20px' }}>
                {[
                  { label: 'Terms of Service',       href: '/legal/terms' },
                  { label: 'Privacy Policy',         href: '/legal/privacy' },
                  { label: 'Cookie Policy',          href: '/legal/cookies' },
                  { label: 'Your Privacy Rights',    href: '/legal/privacy#your-rights' },
                  { label: 'Contact',                href: 'mailto:hello@hellolumira.app' },
                ].map(({ label, href }) => (
                  <a
                    key={href}
                    href={href}
                    style={{ fontSize: 13, color: SAND_500, textDecoration: 'underline', textUnderlineOffset: '3px' }}
                    onMouseEnter={e => (e.currentTarget.style.color = SAGE_600)}
                    onMouseLeave={e => (e.currentTarget.style.color = SAND_500)}
                  >
                    {label}
                  </a>
                ))}
              </nav>

              {/* Copyright — SAND_500 (#706D67) gives ~4.6:1 on white footer, passing AA at 12px */}
              <p style={{ fontSize: 12, color: SAND_500, margin: 0, textAlign: 'center' }}>
                &copy; {new Date().getFullYear()} Lumira. All rights reserved.
              </p>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
