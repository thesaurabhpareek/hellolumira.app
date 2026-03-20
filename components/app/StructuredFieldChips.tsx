/**
 * @module StructuredFieldChips
 * @description Chip-based structured data entry component for daily check-ins.
 *   Renders option chips (with optional emojis) for quick single-select input
 *   on fields like sleep quality, feeding, and mood.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useState } from 'react'
import type { StructuredField } from '@/types/app'

interface Props {
  fields: StructuredField[]
  onSelect: (fieldId: string, value: string) => void
}

export default function StructuredFieldChips({ fields, onSelect }: Props) {
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const handleSelect = (fieldId: string, value: string, label: string) => {
    setSelected((prev) => ({ ...prev, [fieldId]: value }))
    onSelect(fieldId, value)
    // Collapse the field after selection with a tiny delay
    setTimeout(() => {
      setCollapsed((prev) => ({ ...prev, [fieldId]: true }))
    }, 300)
    void label
  }

  return (
    <div className="flex flex-col gap-4">
      {fields.map((field) => {
        const selectedValue = selected[field.id]
        const isCollapsed = collapsed[field.id]
        const selectedOption = field.options.find((o) => o.value === selectedValue)

        if (isCollapsed && selectedOption) {
          return (
            <div
              key={field.id}
              className="animate-fade-in flex items-center gap-2 px-3 py-2 bg-secondary border border-sage-200 rounded-md"
            >
              <span className="text-primary text-sm">✓</span>
              <span className="text-[13px] text-muted-foreground">{field.label}:</span>
              <span className="text-sm font-semibold text-primary">
                {selectedOption.emoji && `${selectedOption.emoji} `}{selectedOption.label}
              </span>
            </div>
          )
        }

        return (
          <div key={field.id} className="animate-fade-in">
            <p className="text-[13px] font-semibold text-muted-foreground mb-2 uppercase tracking-[0.4px]">
              {field.label}
            </p>
            <div
              className="flex gap-2 pb-1"
              style={{
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
              }}
            >
              {field.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(field.id, option.value, option.label)}
                  className={`shrink-0 ${selectedValue === option.value ? 'chip chip-selected' : 'chip'}`}
                >
                  {option.emoji && (
                    <span className="mr-1">{option.emoji}</span>
                  )}
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
