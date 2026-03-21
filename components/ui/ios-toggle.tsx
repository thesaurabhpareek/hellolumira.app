'use client'

import React from 'react'

interface IOSToggleProps {
  checked: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
}

/**
 * iOS-style toggle switch.
 *
 * - 51 x 31 px (matches native iOS dimensions)
 * - Green (#34C759) when on, gray (#E5E5EA) when off
 * - White circular knob with subtle shadow
 * - Smooth 200 ms transition
 */
export default function IOSToggle({ checked, onChange, disabled }: IOSToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        position: 'relative',
        width: '51px',
        height: '31px',
        minWidth: '51px',
        borderRadius: '9999px',
        background: checked ? '#34C759' : '#E5E5EA',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.2s ease',
        opacity: disabled ? 0.5 : 1,
        padding: 0,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '22px' : '2px',
          width: '27px',
          height: '27px',
          borderRadius: '50%',
          background: '#FFFFFF',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2), 0 0 1px rgba(0,0,0,0.1)',
          transition: 'left 0.2s ease',
        }}
      />
    </button>
  )
}
