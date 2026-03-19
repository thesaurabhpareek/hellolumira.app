/**
 * @module SuggestedPromptsRow
 * @description Horizontally scrollable row of suggested conversation prompts.
 *   Stage-aware: shows different prompts for pregnancy vs infant vs toddler.
 *   Prompts are tappable chips that auto-send the message.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import type { Stage } from '@/types/app'

interface Props {
  stage: Stage
  babyAgeWeeks?: number
  pregnancyWeek?: number
  babyName: string | null
  onSelect: (message: string) => void
  layout: 'scroll' | 'grid'
}

interface PromptItem {
  label: string
  message: string
}

function getPrompts(
  stage: Stage,
  babyName: string | null,
  pregnancyWeek?: number,
  babyAgeWeeks?: number
): PromptItem[] {
  const name = babyName || 'my baby'

  if (stage === 'pregnancy') {
    const week = pregnancyWeek || 20
    return [
      {
        label: `How is week ${week} different?`,
        message: `How is week ${week} different from last week? What should I expect?`,
      },
      {
        label: 'Is this symptom normal?',
        message: `Is it normal to feel new symptoms at this stage of pregnancy?`,
      },
      {
        label: 'Hospital bag checklist',
        message: 'What should I pack in my hospital bag? When should I have it ready?',
      },
      {
        label: "I'm worried about something",
        message: "I have a worry about my pregnancy that I'd like to talk through.",
      },
      {
        label: 'What to expect at my next appointment',
        message: `I have a prenatal appointment coming up. What should I expect at week ${week}?`,
      },
      {
        label: 'Sleep positions',
        message: 'What are the best sleep positions during pregnancy? I keep waking up on my back.',
      },
    ]
  }

  // Infant / toddler prompts
  const ageWeeks = babyAgeWeeks || 8
  const ageDisplay = ageWeeks < 8
    ? `${ageWeeks} weeks`
    : `${Math.floor(ageWeeks / 4)} months`

  return [
    {
      label: 'Is this sleep pattern normal?',
      message: `Is ${name}'s sleep pattern normal for ${ageDisplay}? Here's what's been happening...`,
    },
    {
      label: 'When should I worry?',
      message: `When should I worry about something I've noticed with ${name}?`,
    },
    {
      label: 'Getting enough milk?',
      message: `How do I know if ${name} is getting enough milk?`,
    },
    {
      label: 'Developmental milestones',
      message: `What developmental milestones should I expect for ${name} at ${ageDisplay}?`,
    },
    {
      label: 'Fussy / crying more',
      message: `${name} has been more fussy than usual lately. Is this normal?`,
    },
    {
      label: 'Something on my mind',
      message: `I have a question about ${name} that I'd like to talk through.`,
    },
  ]
}

export default function SuggestedPromptsRow({
  stage,
  babyAgeWeeks,
  pregnancyWeek,
  babyName,
  onSelect,
  layout,
}: Props) {
  const prompts = getPrompts(stage, babyName, pregnancyWeek, babyAgeWeeks)
  const displayPrompts = layout === 'scroll' ? prompts.slice(0, 6) : prompts.slice(0, 4)

  if (layout === 'scroll') {
    return (
      <div
        className="no-scrollbar"
        style={{
          overflowX: 'auto',
          paddingBottom: '4px',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', width: 'max-content' }}>
          {displayPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => onSelect(prompt.message)}
              style={{
                flexShrink: 0,
                minHeight: '48px',
                padding: '0 16px',
                fontSize: '14px',
                fontWeight: 500,
                borderRadius: '24px',
                background: 'var(--color-primary-light)',
                border: '1px solid var(--color-primary-mid)',
                color: 'var(--color-primary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {prompt.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Grid layout
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
      }}
    >
      {displayPrompts.map((prompt, i) => (
        <button
          key={i}
          onClick={() => onSelect(prompt.message)}
          style={{
            padding: '14px 16px',
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: 1.4,
            borderRadius: 'var(--radius-lg)',
            background: 'var(--color-white)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-slate)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease',
            minHeight: '64px',
            display: 'flex',
            alignItems: 'center',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {prompt.label}
        </button>
      ))}
    </div>
  )
}
