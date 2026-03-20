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
        background: '#F0FDF4',
        borderColor: '#22C55E',
        color: '#15803D',
        fontWeight: 600,
      }
    }
    if (i === selected) {
      return {
        ...base,
        background: '#FEF2F2',
        borderColor: '#F87171',
        color: '#B91C1C',
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
    <div
      style={{
        background: 'var(--color-white)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        marginBottom: '16px',
      }}
    >
      {/* Label */}
      <p
        style={{
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--color-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          marginBottom: '12px',
        }}
      >
        🧠 QUICK QUIZ
      </p>

      {/* Question */}
      <p
        style={{
          fontSize: '15px',
          fontWeight: 600,
          color: 'var(--color-slate)',
          lineHeight: 1.5,
          marginBottom: '16px',
        }}
      >
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
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
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
          className="animate-fade-in"
          style={{
            marginTop: '16px',
            padding: '14px 16px',
            background: isCorrect ? '#F0FDF4' : '#FFF7ED',
            border: `1px solid ${isCorrect ? '#BBF7D0' : '#FED7AA'}`,
            borderRadius: 'var(--radius-md)',
          }}
        >
          <p
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: isCorrect ? '#15803D' : '#9A3412',
              marginBottom: '6px',
            }}
          >
            {isCorrect ? '✓ Correct!' : `✕ Not quite — the answer is: ${options[answerIndex]}`}
          </p>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--color-slate)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {explanation}
          </p>
        </div>
      )}

      {!revealed && (
        <p
          style={{
            fontSize: '12px',
            color: 'var(--color-muted)',
            marginTop: '12px',
            textAlign: 'center',
          }}
        >
          Tap an option to reveal the answer
        </p>
      )}
    </div>
  )
}
