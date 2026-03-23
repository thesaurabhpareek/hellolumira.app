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
        className="no-scrollbar pb-1"
        style={{
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}
      >
        <div className="flex gap-2" style={{ width: 'max-content' }}>
          {displayPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => onSelect(prompt.message)}
              className="shrink-0 min-h-[48px] px-4 text-sm font-medium text-primary bg-secondary border border-sage-200 cursor-pointer whitespace-nowrap transition-all duration-150 ease-out"
              style={{
                borderRadius: '24px',
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
    <div className="grid grid-cols-2 gap-2">
      {displayPrompts.map((prompt, i) => (
        <button
          key={i}
          onClick={() => onSelect(prompt.message)}
          className="p-[14px_16px] text-sm font-medium leading-[1.4] rounded-lg bg-[var(--color-white)] border border-border text-foreground cursor-pointer text-left transition-all duration-150 ease-out min-h-[64px] flex items-center"
          style={{
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
