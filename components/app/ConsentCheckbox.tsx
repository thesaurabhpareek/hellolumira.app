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
    <div className="mb-5">
      <label className="flex items-start gap-3 cursor-pointer min-h-[48px] py-3">
        {/* Custom checkbox */}
        <div
          role="checkbox"
          aria-checked={checked}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onClick={() => onChange(!checked)}
          className="shrink-0 w-6 h-6 mt-[1px] rounded-sm flex items-center justify-center transition-all duration-150 ease-out cursor-pointer"
          style={{
            border: `2px solid ${error ? 'var(--color-red)' : checked ? 'var(--color-primary)' : 'var(--color-border)'}`,
            background: checked ? 'var(--color-primary)' : 'var(--color-white)',
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
          className="text-base leading-[1.5] text-foreground"
          onClick={(e) => e.preventDefault()}
        >
          I agree to the{' '}
          <a
            href="/legal/terms"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-primary underline underline-offset-[2px] font-medium"
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href="/legal/privacy"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-primary underline underline-offset-[2px] font-medium"
          >
            Privacy Policy
          </a>
          <span className="text-destructive ml-1 font-semibold">
            *
          </span>
        </span>
      </label>

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive mt-1 pl-9">
          {error}
        </p>
      )}
    </div>
  )
}
