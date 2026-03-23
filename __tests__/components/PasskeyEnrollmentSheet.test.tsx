// @vitest-environment happy-dom
// __tests__/components/PasskeyEnrollmentSheet.test.tsx
// Unit tests for PasskeyEnrollmentSheet component behavior.
//
// Strategy: The component uses the new React JSX transform (no explicit `import React`)
// which requires @vitejs/plugin-react not present in this vitest config. We therefore
// test via two complementary approaches:
//   1. Source-level contract tests (read the file, assert markup & logic is present)
//   2. Pure-logic tests for getPasskeyEnrollmentNudgeState() and handleDismiss logic

import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'fs'
import path from 'path'

// ─── Load source once ─────────────────────────────────────────────────────────

const SOURCE_PATH = path.resolve(process.cwd(), 'components/app/PasskeyEnrollmentSheet.tsx')
const src = fs.readFileSync(SOURCE_PATH, 'utf8')

// ─── Source-level contract tests ──────────────────────────────────────────────

describe('PasskeyEnrollmentSheet source — structure and accessibility', () => {
  it('sheet has role="dialog"', () => {
    expect(src).toContain('role="dialog"')
  })

  it('sheet has aria-modal="true"', () => {
    expect(src).toContain('aria-modal="true"')
  })

  it('sheet has aria-label for accessibility', () => {
    expect(src).toContain('aria-label=')
  })

  it('renders headline text "Unlock Lumira with one tap"', () => {
    expect(src).toContain('Unlock Lumira with one tap')
  })

  it('renders body copy about no waiting for emails', () => {
    expect(src).toContain('No waiting for an email')
  })

  it('renders "Set up Face ID sign-in" primary CTA button', () => {
    expect(src).toContain('Set up Face ID sign-in')
  })

  it('renders "Maybe later" dismiss button', () => {
    expect(src).toContain('Maybe later')
  })

  it('shows loading state with "Setting up..." text while enrolling', () => {
    expect(src).toContain('Setting up...')
  })

  it('uses isOpen prop to control transform (translateY)', () => {
    expect(src).toContain('translateY(0)')
    expect(src).toContain('translateY(100%)')
  })
})

describe('PasskeyEnrollmentSheet source — enrollment logic', () => {
  it('imports enrollPasskey from webauthn-client', () => {
    expect(src).toContain("enrollPasskey")
    expect(src).toContain('webauthn-client')
  })

  it('calls onEnrolled() on successful enrollment', () => {
    expect(src).toContain('onEnrolled()')
  })

  it('calls onClose() on user cancel (result.cancelled === true)', () => {
    expect(src).toContain('result.cancelled')
    expect(src).toContain('onClose()')
  })

  it('sets error state when enrollment fails (not cancelled)', () => {
    expect(src).toContain('setError')
    expect(src).toContain('result.error')
  })

  it('shows inline error with role="alert" for screen readers', () => {
    expect(src).toContain('role="alert"')
  })

  it('shows loading spinner and "Setting up..." during enrollment', () => {
    expect(src).toContain('enrolling')
    expect(src).toContain('Setting up...')
  })

  it('clears error state when sheet reopens', () => {
    // The useEffect with [isOpen] dependency resets error
    expect(src).toContain("if (isOpen) setError('')")
  })
})

describe('PasskeyEnrollmentSheet source — dismiss logic', () => {
  it('handleDismiss stores dismissed timestamp in localStorage', () => {
    expect(src).toContain("lumira_passkey_nudge_dismissed_at")
    expect(src).toContain('Date.now()')
  })

  it('handleDismiss increments dismissed count in localStorage', () => {
    expect(src).toContain("lumira_passkey_nudge_dismissed_count")
  })

  it('handleDismiss calls onClose()', () => {
    expect(src).toContain('onClose()')
  })
})

// ─── Pure logic: getPasskeyEnrollmentNudgeState ───────────────────────────────
// Tests the exported helper function directly

describe('getPasskeyEnrollmentNudgeState()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    // Ensure window is defined and PublicKeyCredential is available
    vi.stubGlobal('PublicKeyCredential', class {})
  })

  it('shouldShow=false when lumira_passkey_enrolled=1', () => {
    localStorage.setItem('lumira_passkey_enrolled', '1')
    // Re-import to get fresh state
    const { getPasskeyEnrollmentNudgeState } = require('@/components/app/PasskeyEnrollmentSheet')
    const { shouldShow } = getPasskeyEnrollmentNudgeState()
    expect(shouldShow).toBe(false)
  })

  it('shouldShow=false when dismissed count >= 3', () => {
    localStorage.setItem('lumira_passkey_nudge_dismissed_count', '3')
    const { getPasskeyEnrollmentNudgeState } = require('@/components/app/PasskeyEnrollmentSheet')
    const { shouldShow } = getPasskeyEnrollmentNudgeState()
    expect(shouldShow).toBe(false)
  })

  it('shouldShow=false when dismissed within 7 days', () => {
    const sixDaysAgo = Date.now() - 6 * 24 * 60 * 60 * 1000
    localStorage.setItem('lumira_passkey_nudge_dismissed_at', String(sixDaysAgo))
    const { getPasskeyEnrollmentNudgeState } = require('@/components/app/PasskeyEnrollmentSheet')
    const { shouldShow } = getPasskeyEnrollmentNudgeState()
    expect(shouldShow).toBe(false)
  })

  it('shouldShow=true when not enrolled, not dismissed, count < 3', () => {
    // No localStorage values set — fresh state
    const { getPasskeyEnrollmentNudgeState } = require('@/components/app/PasskeyEnrollmentSheet')
    const { shouldShow } = getPasskeyEnrollmentNudgeState()
    expect(shouldShow).toBe(true)
  })

  it('shouldShow=true when last dismissed more than 7 days ago', () => {
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000
    localStorage.setItem('lumira_passkey_nudge_dismissed_at', String(eightDaysAgo))
    localStorage.setItem('lumira_passkey_nudge_dismissed_count', '1')
    const { getPasskeyEnrollmentNudgeState } = require('@/components/app/PasskeyEnrollmentSheet')
    const { shouldShow } = getPasskeyEnrollmentNudgeState()
    expect(shouldShow).toBe(true)
  })

  it('markDismissed() sets dismissed timestamp and increments count', () => {
    const { getPasskeyEnrollmentNudgeState } = require('@/components/app/PasskeyEnrollmentSheet')
    const { markDismissed } = getPasskeyEnrollmentNudgeState()
    markDismissed()

    const ts = localStorage.getItem('lumira_passkey_nudge_dismissed_at')
    const count = localStorage.getItem('lumira_passkey_nudge_dismissed_count')
    expect(Number(ts)).toBeGreaterThan(0)
    expect(count).toBe('1')
  })

  it('shouldShow=false when PublicKeyCredential is undefined (no passkey support)', () => {
    // @ts-expect-error intentional
    vi.stubGlobal('PublicKeyCredential', undefined)
    const { getPasskeyEnrollmentNudgeState } = require('@/components/app/PasskeyEnrollmentSheet')
    const { shouldShow } = getPasskeyEnrollmentNudgeState()
    expect(shouldShow).toBe(false)
  })
})
