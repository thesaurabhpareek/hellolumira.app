/**
 * @module ConcernStepCard
 * @description Step-by-step concern flow card with single/multi-select options
 *   and free-text input. Part of the structured concern-logging wizard.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useState } from 'react'
import type { ConcernQuestion } from '@/types/app'

interface Props {
  question: ConcernQuestion
  answer: string | string[] | null
  onChange: (v: string | string[]) => void
}

export default function ConcernStepCard({ question, answer, onChange }: Props) {
  const [sliderValue, setSliderValue] = useState<number>(
    typeof answer === 'string' && answer ? parseInt(answer, 10) : 5
  )

  const handleSingleChoice = (value: string) => {
    onChange(value)
  }

  const handleMultiChoice = (value: string) => {
    const current = Array.isArray(answer) ? answer : []
    if (current.includes(value)) {
      onChange(current.filter((v) => v !== value))
    } else {
      onChange([...current, value])
    }
  }

  const handleSlider = (value: number) => {
    setSliderValue(value)
    onChange(String(value))
  }

  return (
    <div className="lumira-card">
      {/* Question text */}
      <h2
        className="text-h3 mb-6"
        style={{ color: 'var(--color-slate)', lineHeight: 1.4 }}
      >
        {question.text}
      </h2>

      {/* Single choice */}
      {question.inputType === 'single_choice' && question.options && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {question.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSingleChoice(opt.value)}
              style={{
                padding: '14px 20px',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${answer === opt.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: answer === opt.value ? 'var(--color-primary-light)' : 'var(--color-white)',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: answer === opt.value ? 600 : 400,
                color: answer === opt.value ? 'var(--color-primary)' : 'var(--color-slate)',
                minHeight: '52px',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Multi choice */}
      {question.inputType === 'multi_choice' && question.options && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px',
          }}
        >
          {question.options.map((opt) => {
            const isSelected = Array.isArray(answer) && answer.includes(opt.value)
            return (
              <button
                key={opt.value}
                onClick={() => handleMultiChoice(opt.value)}
                className={isSelected ? 'chip chip-selected' : 'chip'}
                style={{
                  height: 'auto',
                  minHeight: '52px',
                  padding: '12px',
                  flexDirection: 'column',
                  gap: '4px',
                  textAlign: 'center',
                  lineHeight: 1.3,
                  fontSize: '13px',
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Scale / slider */}
      {question.inputType === 'scale' && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}
          >
            <span style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
              {question.scale_min_label || '1'}
            </span>
            <span
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: 'var(--color-primary)',
              }}
            >
              {sliderValue}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
              {question.scale_max_label || '10'}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={sliderValue}
            onChange={(e) => handleSlider(parseInt(e.target.value, 10))}
            style={{
              width: '100%',
              height: '6px',
              accentColor: 'var(--color-primary)',
              cursor: 'pointer',
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '8px',
            }}
          >
            <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
              {question.scale_min_label || 'None'}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
              {question.scale_max_label || 'Severe'}
            </span>
          </div>
        </div>
      )}

      {/* Free text */}
      {question.inputType === 'free_text' && (
        <textarea
          value={typeof answer === 'string' ? answer : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer here..."
          rows={4}
          style={{
            width: '100%',
            minHeight: '100px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--color-border)',
            fontSize: '15px',
            lineHeight: 1.6,
            resize: 'vertical',
            color: 'var(--color-slate)',
            fontFamily: 'inherit',
            outline: 'none',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
        />
      )}
    </div>
  )
}
