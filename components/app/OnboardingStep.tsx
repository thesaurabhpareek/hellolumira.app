/**
 * @module OnboardingStep
 * @description Reusable step card for the onboarding wizard. Renders a title,
 *   description, and child content with consistent layout and animation.
 * @version 1.1.0 — Migrated inline styles → Tailwind classes
 * @since March 2026
 */
'use client'

import type React from 'react'

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
        className="flex justify-center gap-2 mb-8"
      >
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: i === step - 1 ? '24px' : '8px',
              background: i < step ? 'var(--color-primary)' : 'var(--color-border)',
            }}
          />
        ))}
      </div>

      {/* Title */}
      <h1 className="text-h1 text-foreground mb-2">{title}</h1>

      {/* Subtitle */}
      {subtitle ? (
        <p className="text-body-muted leading-relaxed mb-6">{subtitle}</p>
      ) : (
        <div className="mb-6" />
      )}

      {/* Content */}
      <div>{children}</div>
    </div>
  )
}
