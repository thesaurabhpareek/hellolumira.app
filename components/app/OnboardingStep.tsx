/**
 * @module OnboardingStep
 * @description Reusable step card for the onboarding wizard. Renders a title,
 *   description, and child content with consistent layout and animation.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

interface Props {
  step: number
  total: number
  title: string
  subtitle?: string
  children: React.ReactNode
}

export default function OnboardingStep({ step, total, title, subtitle, children }: Props) {
  return (
    <div className="animate-fade-in">
      {/* Progress dots */}
      <div
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Step ${step} of ${total}`}
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '32px',
        }}
      >
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === step - 1 ? '24px' : '8px',
              height: '8px',
              borderRadius: '100px',
              background: i < step ? 'var(--color-primary)' : 'var(--color-border)',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* Title */}
      <h1
        className="text-h1 mb-2"
        style={{ color: 'var(--color-slate)' }}
      >
        {title}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <p
          className="text-body-muted mb-6"
          style={{ lineHeight: 1.6 }}
        >
          {subtitle}
        </p>
      )}

      {!subtitle && <div style={{ marginBottom: '24px' }} />}

      {/* Content */}
      <div>{children}</div>
    </div>
  )
}
