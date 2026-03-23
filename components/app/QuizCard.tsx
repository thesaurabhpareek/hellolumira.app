/**
 * @module QuizCard
 * @description Home feed quick-fact quiz card with 3 multiple-choice options.
 *   Reveals the correct answer and explanation after the user taps an option.
 *   Question rotates daily (see lib/home-feed-data.ts).
 *
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useState } from 'react'

interface Props {
  question: string
  options: [string, string, string]
  answerIndex: 0 | 1 | 2
  explanation: string
}

export default function QuizCard({
  question,
  options,
  answerIndex,
  explanation,
}: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const revealed = selected !== null
  const isCorrect = selected === answerIndex

  const handleSelect = (i: number) => {
    if (revealed) return
    setSelected(i)
  }

  const getOptionStyle = (i: number): React.CSSProperties => {
    const base: React.CSSProperties = {
      width: '100%',
      textAlign: 'left',
      padding: '12px 14px',
      borderRadius: 'var(--radius-md)',
      border: '1.5px solid',
      fontSize: '14px',
      fontWeight: 500,
      cursor: revealed ? 'default' : 'pointer',
      transition: 'all 0.15s ease',
      touchAction: 'manipulation',
      WebkitTapHighlightColor: 'transparent',
      lineHeight: 1.4,
      marginBottom: i < 2 ? '8px' : '0',
    }

    if (!revealed) {
      return {
        ...base,
        background: 'var(--color-white)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-slate)',
      }
    }

    // Revealed state
    if (i === answerIndex) {
      return {
        ...base,
        background: 'var(--success-bg)',
        borderColor: 'var(--success-border)',
        color: 'var(--success-text)',
        fontWeight: 600,
      }
    }
    if (i === selected) {
      return {
        ...base,
        background: 'var(--error-bg)',
        borderColor: 'var(--error-border)',
        color: 'var(--error-text)',
      }
    }
    return {
      ...base,
      background: 'var(--color-surface)',
      borderColor: 'var(--color-border)',
      color: 'var(--color-muted)',
      opacity: 0.6,
    }
  }

  return (
    <div className="bg-[var(--color-white)] border border-border rounded-lg p-5 mb-4">
      {/* Label */}
      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.8px] mb-3">
        🧠 QUICK QUIZ
      </p>

      {/* Question */}
      <p className="text-[15px] font-semibold text-foreground leading-[1.5] mb-4">
        {question}
      </p>

      {/* Options */}
      <div role="group" aria-label="Quiz options">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            disabled={revealed}
            style={getOptionStyle(i)}
            aria-pressed={selected === i}
          >
            <span className="inline-flex items-center gap-2">
              {/* Indicator dot / checkmark */}
              <span
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: revealed && i === answerIndex
                    ? '2px solid #22C55E'
                    : revealed && i === selected && i !== answerIndex
                    ? '2px solid #F87171'
                    : '2px solid var(--color-border)',
                  background: revealed && i === answerIndex
                    ? '#22C55E'
                    : revealed && i === selected && i !== answerIndex
                    ? '#F87171'
                    : 'transparent',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  color: '#fff',
                  transition: 'all 0.15s ease',
                }}
                aria-hidden="true"
              >
                {revealed && i === answerIndex && '✓'}
                {revealed && i === selected && i !== answerIndex && '✕'}
              </span>
              {opt}
            </span>
          </button>
        ))}
      </div>

      {/* Revealed explanation */}
      {revealed && (
        <div
          className="animate-fade-in mt-4 rounded-md"
          style={{
            padding: '14px 16px',
            background: isCorrect ? 'var(--success-bg)' : 'var(--warning-bg)',
            border: `1px solid ${isCorrect ? 'var(--success-border)' : 'var(--warning-border)'}`,
          }}
        >
          <p
            className="text-[13px] font-bold mb-[6px]"
            style={{ color: isCorrect ? 'var(--success-text)' : 'var(--warning-text)' }}
          >
            {isCorrect ? '✓ Correct!' : `✕ Not quite — the answer is: ${options[answerIndex]}`}
          </p>
          <p className="text-[13px] text-foreground leading-[1.6] m-0">
            {explanation}
          </p>
        </div>
      )}

      {!revealed && (
        <p className="text-[12px] text-muted-foreground mt-3 text-center">
          Tap an option to reveal the answer
        </p>
      )}
    </div>
  )
}
