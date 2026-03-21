/**
 * @module StageHeroCard
 * @description Stage-personalised hero card shown at the top of the home feed.
 *   Adapts content and messaging based on the user's parenting stage.
 * @version 1.0.0
 * @since March 2026
 */

import Link from 'next/link'
import type { Stage } from '@/types/app'

interface Props {
  stage: Stage
  babyName: string | null
  /** Only relevant for planning stage */
  planningSubOption?: string | null
}

type StageConfig = {
  tagline: string
  description: string
  ctaLabel: string
  ctaHref: string
  bgGradient: string
  items: { icon: string; label: string }[]
}

function getStageConfig(stage: Stage, babyName: string | null, planningSubOption?: string | null): StageConfig {
  const name = babyName || 'baby'

  if (stage === 'planning') {
    const subLabel = planningSubOption === 'adopting'
      ? 'adoption'
      : planningSubOption === 'surrogacy'
      ? 'surrogacy'
      : planningSubOption === 'ivf_fertility'
      ? 'fertility'
      : 'conception'

    return {
      tagline: 'Planning your journey to parenthood',
      description: `We're here to support you through every step of your ${subLabel} journey.`,
      ctaLabel: 'Talk to Lumira',
      ctaHref: '/chat',
      bgGradient: 'linear-gradient(135deg, #87A28F, #6B8F73)',
      items: [
        { icon: '\uD83D\uDCC5', label: 'Preconception checklist' },
        { icon: '\uD83D\uDCB0', label: 'Financial planning' },
        { icon: '\u2764\uFE0F', label: 'Fertility guidance' },
        { icon: '\uD83E\uDDE0', label: 'Emotional prep' },
      ],
    }
  }

  if (stage === 'pregnancy') {
    return {
      tagline: `Growing together`,
      description: `Your body is doing incredible things right now. Let Lumira guide you week by week.`,
      ctaLabel: 'This week\u2019s guide',
      ctaHref: '/chat',
      bgGradient: 'linear-gradient(135deg, #C4A882, #A8906C)',
      items: [
        { icon: '\uD83C\uDF31', label: 'Baby development' },
        { icon: '\uD83C\uDFE5', label: 'Birth preparation' },
        { icon: '\uD83E\uDDD8', label: 'Wellness tips' },
        { icon: '\uD83D\uDCCB', label: 'Appointment prep' },
      ],
    }
  }

  if (stage === 'infant') {
    return {
      tagline: `Every day is a new discovery`,
      description: `${name === 'baby' ? 'Your little one' : name} is growing fast. We'll help you make the most of each stage.`,
      ctaLabel: 'Log a milestone',
      ctaHref: '/milestones',
      bgGradient: 'linear-gradient(135deg, #87A28F, #5E8A6E)',
      items: [
        { icon: '\u2B50', label: 'Milestone tracking' },
        { icon: '\uD83C\uDF7C', label: 'Feeding support' },
        { icon: '\uD83D\uDE34', label: 'Sleep guidance' },
        { icon: '\uD83C\uDFB2', label: 'Activities' },
      ],
    }
  }

  // toddler / postpartum
  return {
    tagline: `Adventure awaits`,
    description: `${name === 'baby' ? 'Your toddler' : name} is becoming their own little person. What a joy to witness.`,
    ctaLabel: 'Activity ideas',
    ctaHref: '/content',
    bgGradient: 'linear-gradient(135deg, #C4A882, #B0926A)',
    items: [
      { icon: '\uD83D\uDEB6', label: 'Development' },
      { icon: '\uD83C\uDFA8', label: 'Activity ideas' },
      { icon: '\uD83E\uDDE9', label: 'Behaviour tips' },
      { icon: '\uD83D\uDCD6', label: 'Learning' },
    ],
  }
}

export default function StageHeroCard({ stage, babyName, planningSubOption }: Props) {
  const config = getStageConfig(stage, babyName, planningSubOption)

  return (
    <div
      style={{
        background: config.bgGradient,
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        marginBottom: '16px',
        color: '#FFFFFF',
      }}
    >
      <p
        style={{
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          opacity: 0.8,
          marginBottom: '6px',
        }}
      >
        Your stage
      </p>
      <p
        style={{
          fontSize: '18px',
          fontWeight: 700,
          marginBottom: '6px',
          lineHeight: 1.3,
        }}
      >
        {config.tagline}
      </p>
      <p
        style={{
          fontSize: '14px',
          opacity: 0.9,
          lineHeight: 1.5,
          marginBottom: '16px',
        }}
      >
        {config.description}
      </p>

      {/* Quick-access items */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginBottom: '16px',
        }}
      >
        {config.items.map((item) => (
          <div
            key={item.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            <span style={{ fontSize: '16px', lineHeight: 1 }}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </div>

      <Link
        href={config.ctaHref}
        style={{
          display: 'inline-block',
          padding: '10px 24px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: 'var(--radius-md)',
          fontSize: '14px',
          fontWeight: 600,
          color: '#FFFFFF',
          textDecoration: 'none',
          transition: 'background 0.15s ease',
        }}
      >
        {config.ctaLabel} &rarr;
      </Link>
    </div>
  )
}
