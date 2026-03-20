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
      <h2 className="text-h3 mb-6 text-foreground leading-[1.4]">
        {question.text}
      </h2>

      {/* Single choice */}
      {question.inputType === 'single_choice' && question.options && (
        <div className="flex flex-col gap-[10px]">
          {question.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSingleChoice(opt.value)}
              className="rounded-md text-left cursor-pointer text-[15px] min-h-[52px] flex items-center transition-all duration-150 ease-out"
              style={{
                padding: '14px 20px',
                border: `2px solid ${answer === opt.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: answer === opt.value ? 'var(--color-primary-light)' : 'var(--color-white)',
                fontWeight: answer === opt.value ? 600 : 400,
                color: answer === opt.value ? 'var(--color-primary)' : 'var(--color-slate)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Multi choice */}
      {question.inputType === 'multi_choice' && question.options && (
        <div className="grid grid-cols-2 gap-[10px]">
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
          <div className="flex justify-between mb-2">
            <span className="text-[13px] text-muted-foreground">
              {question.scale_min_label || '1'}
            </span>
            <span className="text-[24px] font-bold text-primary">
              {sliderValue}
            </span>
            <span className="text-[13px] text-muted-foreground">
              {question.scale_max_label || '10'}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={sliderValue}
            onChange={(e) => handleSlider(parseInt(e.target.value, 10))}
            className="w-full cursor-pointer"
            style={{
              height: '6px',
              accentColor: 'var(--color-primary)',
            }}
          />
          <div className="flex justify-between mt-2">
            <span className="text-[12px] text-muted-foreground">
              {question.scale_min_label || 'None'}
            </span>
            <span className="text-[12px] text-muted-foreground">
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
          placeholder="Share whatever feels relevant..."
          rows={4}
          className="w-full rounded-md text-base leading-[1.6] text-foreground resize-y outline-none"
          style={{
            minHeight: '100px',
            padding: '12px 16px',
            border: '1.5px solid var(--color-border)',
            fontSize: '16px',
            fontFamily: 'inherit',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
        />
      )}
    </div>
  )
}
