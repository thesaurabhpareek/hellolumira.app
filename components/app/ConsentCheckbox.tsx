/**
 * @module ConsentCheckbox
 * @description Accessible checkbox component for legal consent capture during
 *   onboarding. Includes a link to the relevant legal document.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

interface ConsentCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
}

export default function ConsentCheckbox({ checked, onChange, error }: ConsentCheckboxProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      onChange(!checked)
    }
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      <label
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          cursor: 'pointer',
          minHeight: '48px',
          padding: '12px 0',
        }}
      >
        {/* Custom checkbox */}
        <div
          role="checkbox"
          aria-checked={checked}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onClick={() => onChange(!checked)}
          style={{
            flexShrink: 0,
            width: '24px',
            height: '24px',
            marginTop: '1px',
            borderRadius: 'var(--radius-sm)',
            border: `2px solid ${error ? 'var(--color-red)' : checked ? 'var(--color-primary)' : 'var(--color-border)'}`,
            background: checked ? 'var(--color-primary)' : 'var(--color-white)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
        >
          {checked && (
            <svg
              width="14"
              height="11"
              viewBox="0 0 14 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 5L5 9L13 1"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        {/* Label text */}
        <span
          style={{
            fontSize: '16px',
            lineHeight: 1.5,
            color: 'var(--color-slate)',
          }}
          onClick={(e) => e.preventDefault()}
        >
          I agree to the{' '}
          <a
            href="/legal/terms"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              color: 'var(--color-primary)',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
              fontWeight: 500,
            }}
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href="/legal/privacy"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              color: 'var(--color-primary)',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
              fontWeight: 500,
            }}
          >
            Privacy Policy
          </a>
          <span
            style={{
              color: 'var(--color-red)',
              marginLeft: '4px',
              fontWeight: 600,
            }}
          >
            *
          </span>
        </span>
      </label>

      {/* Error message */}
      {error && (
        <p
          style={{
            fontSize: '14px',
            color: 'var(--color-red)',
            marginTop: '4px',
            paddingLeft: '36px',
          }}
        >
          {error}
        </p>
      )}
    </div>
  )
}
