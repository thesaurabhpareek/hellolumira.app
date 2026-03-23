// @vitest-environment happy-dom
// __tests__/components/PasskeyNudge.test.ts
// Tests for the PasskeyNudge component and its integration with
// getPasskeyEnrollmentNudgeState().
//
// Strategy: PasskeyNudge is a thin wrapper around PasskeyEnrollmentSheet that
// drives open/close state from getPasskeyEnrollmentNudgeState(). We test:
//   1. Source-level contract (structure, delegation, timer pattern)
//   2. Nudge state logic (shouldShow conditions via getPasskeyEnrollmentNudgeState)

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import { getPasskeyEnrollmentNudgeState } from '@/components/app/PasskeyEnrollmentSheet'

// ─── Load source once ─────────────────────────────────────────────────────────

const NUDGE_PATH = path.resolve(process.cwd(), 'app/(app)/home/PasskeyNudge.tsx')
const src = fs.readFileSync(NUDGE_PATH, 'utf8')

// ─── Source-level contract tests ──────────────────────────────────────────────

describe('PasskeyNudge source — structure', () => {
  it('imports PasskeyEnrollmentSheet', () => {
    expect(src).toContain('PasskeyEnrollmentSheet')
  })

  it('imports getPasskeyEnrollmentNudgeState', () => {
    expect(src).toContain('getPasskeyEnrollmentNudgeState')
  })

  it('uses useEffect to evaluate nudge state client-side (after hydration)', () => {
    expect(src).toContain('useEffect')
  })

  it('uses setTimeout to delay sheet appearance (let page render first)', () => {
    expect(src).toContain('setTimeout')
  })

  it('clears the timer on cleanup (no memory leak)', () => {
    expect(src).toContain('clearTimeout')
  })

  it('renders null when isOpen=false (no DOM noise on non-nudge sessions)', () => {
    expect(src).toContain('if (!isOpen) return null')
  })

  it('passes isOpen, onClose, and onEnrolled props to PasskeyEnrollmentSheet', () => {
    expect(src).toContain('isOpen={isOpen}')
    expect(src).toContain('onClose={handleClose}')
    expect(src).toContain('onEnrolled={handleEnrolled}')
  })

  it('is marked as a client component', () => {
    expect(src).toContain("'use client'")
  })
})

// ─── Nudge state logic ────────────────────────────────────────────────────────
// Tests getPasskeyEnrollmentNudgeState() which PasskeyNudge delegates to.
// Implementation: checks lumira_passkey_enrolled='1', dismissed count >= 3,
// dismissedAt within 7 days, and window.PublicKeyCredential support.

describe('getPasskeyEnrollmentNudgeState — shouldShow logic', () => {
  const mockStorage: Record<string, string> = {}

  beforeEach(() => {
    // Mock localStorage with correct key names
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, val: string) => { mockStorage[key] = val },
      removeItem: (key: string) => { delete mockStorage[key] },
      clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]) },
    })
    // Mock PublicKeyCredential as available so isPasskeySupported() returns true
    vi.stubGlobal('PublicKeyCredential', class {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    Object.keys(mockStorage).forEach(k => delete mockStorage[k])
  })

  it('shouldShow=false when lumira_passkey_enrolled="1" (user already enrolled)', () => {
    mockStorage['lumira_passkey_enrolled'] = '1'
    const { shouldShow } = getPasskeyEnrollmentNudgeState()
    expect(shouldShow).toBe(false)
  })

  it('shouldShow=false when nudge dismissed count >= 3 (max dismissals reached)', () => {
    mockStorage['lumira_passkey_nudge_dismissed_count'] = '3'
    mockStorage['lumira_passkey_nudge_dismissed_at'] = '0' // old timestamp — irrelevant
    const { shouldShow } = getPasskeyEnrollmentNudgeState()
    expect(shouldShow).toBe(false)
  })

  it('shouldShow=false when dismissed within 7 days (snooze window active)', () => {
    // Dismissed 1 minute ago
    mockStorage['lumira_passkey_nudge_dismissed_at'] = String(Date.now() - 60_000)
    mockStorage['lumira_passkey_nudge_dismissed_count'] = '1'
    const { shouldShow } = getPasskeyEnrollmentNudgeState()
    expect(shouldShow).toBe(false)
  })

  it('shouldShow=true when dismissed 8 days ago (snooze window expired)', () => {
    // Dismissed 8 days ago — outside the 7-day window
    mockStorage['lumira_passkey_nudge_dismissed_at'] = String(Date.now() - 8 * 24 * 60 * 60 * 1000)
    mockStorage['lumira_passkey_nudge_dismissed_count'] = '1'
    const { shouldShow } = getPasskeyEnrollmentNudgeState()
    expect(shouldShow).toBe(true)
  })

  it('shouldShow=true when no localStorage keys are set and passkeys supported (fresh user)', () => {
    // All storage empty, PublicKeyCredential mocked as available
    const { shouldShow } = getPasskeyEnrollmentNudgeState()
    expect(shouldShow).toBe(true)
  })

  it('shouldShow=true when lumira_passkey_enrolled is "0" (not enrolled)', () => {
    // "0" !== "1" so enrolled check passes; should nudge if other conditions clear
    mockStorage['lumira_passkey_enrolled'] = '0'
    const { shouldShow } = getPasskeyEnrollmentNudgeState()
    expect(shouldShow).toBe(true)
  })

  it('shouldShow=false when lumira_passkey_enrolled is "1" (truthy enrolled value)', () => {
    mockStorage['lumira_passkey_enrolled'] = '1'
    const { shouldShow } = getPasskeyEnrollmentNudgeState()
    expect(shouldShow).toBe(false)
  })

  it('shouldShow=false when dismissed count is exactly 3', () => {
    mockStorage['lumira_passkey_nudge_dismissed_count'] = '3'
    const { shouldShow } = getPasskeyEnrollmentNudgeState()
    expect(shouldShow).toBe(false)
  })

  it('shouldShow=true when dismissed count is 2 (one dismiss remaining)', () => {
    mockStorage['lumira_passkey_nudge_dismissed_count'] = '2'
    // No recent dismissal timestamp — old or unset
    mockStorage['lumira_passkey_nudge_dismissed_at'] = '0'
    const { shouldShow } = getPasskeyEnrollmentNudgeState()
    expect(shouldShow).toBe(true)
  })
})

// ─── Timer delay contract ──────────────────────────────────────────────────────

describe('PasskeyNudge source — delay value', () => {
  it('uses a delay of at least 1000ms (lets page render before sheet appears)', () => {
    // Extract the setTimeout delay value from source
    const match = src.match(/setTimeout\s*\([^,]+,\s*(\d+)\s*\)/)
    expect(match).not.toBeNull()
    const delay = parseInt(match![1], 10)
    expect(delay).toBeGreaterThanOrEqual(1000)
  })

  it('delay is at most 3000ms (nudge appears reasonably soon)', () => {
    const match = src.match(/setTimeout\s*\([^,]+,\s*(\d+)\s*\)/)
    const delay = parseInt(match![1], 10)
    expect(delay).toBeLessThanOrEqual(3000)
  })
})
