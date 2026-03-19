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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {fields.map((field) => {
        const selectedValue = selected[field.id]
        const isCollapsed = collapsed[field.id]
        const selectedOption = field.options.find((o) => o.value === selectedValue)

        if (isCollapsed && selectedOption) {
          return (
            <div
              key={field.id}
              className="animate-fade-in"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'var(--color-primary-light)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-primary-mid)',
              }}
            >
              <span style={{ color: 'var(--color-primary)', fontSize: '14px' }}>✓</span>
              <span style={{ fontSize: '13px', color: 'var(--color-muted)' }}>{field.label}:</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-primary)' }}>
                {selectedOption.emoji && `${selectedOption.emoji} `}{selectedOption.label}
              </span>
            </div>
          )
        }

        return (
          <div key={field.id} className="animate-fade-in">
            <p
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-muted)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
              }}
            >
              {field.label}
            </p>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '4px',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
              }}
            >
              {field.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(field.id, option.value, option.label)}
                  className={selectedValue === option.value ? 'chip chip-selected' : 'chip'}
                  style={{ flexShrink: 0 }}
                >
                  {option.emoji && (
                    <span style={{ marginRight: '4px' }}>{option.emoji}</span>
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
