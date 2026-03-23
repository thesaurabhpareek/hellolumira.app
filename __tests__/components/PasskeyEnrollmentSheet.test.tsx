// @vitest-environment happy-dom
// __tests__/components/PasskeyEnrollmentSheet.test.tsx
// Unit tests for the PasskeyEnrollmentSheet component.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import React from 'react'

// ─── Mock webauthn-client module ─────────────────────────────────────────────

const mockEnrollPasskey = vi.fn()
const mockIsPasskeySupported = vi.fn(() => true)

vi.mock('@/lib/webauthn-client', () => ({
  enrollPasskey: (...args: unknown[]) => mockEnrollPasskey(...args),
  isPasskeySupported: () => mockIsPasskeySupported(),
}))

// Import after mock
import PasskeyEnrollmentSheet from '@/components/app/PasskeyEnrollmentSheet'

// ─── Default props ────────────────────────────────────────────────────────────

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onEnrolled: vi.fn(),
}

function renderSheet(props: Partial<typeof defaultProps> = {}) {
  return render(
    React.createElement(PasskeyEnrollmentSheet, { ...defaultProps, ...props })
  )
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('PasskeyEnrollmentSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockIsPasskeySupported.mockReturnValue(true)
    // Default: enrollment succeeds
    mockEnrollPasskey.mockResolvedValue({
      success: true,
      passkeyId: 'passkey-uuid-001',
      deviceHint: 'iPhone 15',
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // 1. isOpen=false — sheet should not show its content prominently
  // The component always renders the dialog element (for animation), but hides it via transform
  it('sheet is translated out of view when isOpen=false', async () => {
    renderSheet({ isOpen: false })
    // The sheet div should have transform: translateY(100%) when closed
    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).toBeTruthy()
    // style should include translateY(100%)
    const style = (dialog as HTMLElement).style.transform
    expect(style).toContain('translateY(100%)')
  })

  // 2. Renders sheet content when isOpen=true
  it('renders sheet content when isOpen=true', async () => {
    renderSheet({ isOpen: true })
    // Headline
    expect(screen.getByText(/unlock lumira with one tap/i)).toBeTruthy()
    // Body copy
    expect(screen.getByText(/no waiting for an email/i)).toBeTruthy()
    // CTA button
    expect(screen.getByRole('button', { name: /set up face id/i })).toBeTruthy()
    // Dismiss link
    expect(screen.getByText(/maybe later/i)).toBeTruthy()
  })

  // 3. "Maybe later" calls onClose and stores dismissed timestamp in localStorage
  it('"Maybe later" button calls onClose and sets dismissed timestamp in localStorage', () => {
    const onClose = vi.fn()
    renderSheet({ isOpen: true, onClose })

    const maybeLaterBtn = screen.getByText(/maybe later/i)
    fireEvent.click(maybeLaterBtn)

    expect(onClose).toHaveBeenCalledTimes(1)
    const dismissedAt = localStorage.getItem('lumira_passkey_nudge_dismissed_at')
    expect(dismissedAt).not.toBeNull()
    expect(Number(dismissedAt)).toBeGreaterThan(0)
  })

  // 4. "Set up Face ID sign-in" button calls enrollPasskey() and shows loading state
  it('"Set up Face ID sign-in" button calls enrollPasskey and shows loading state', async () => {
    // Never resolves during the test so we can observe loading state
    let resolveEnroll: (value: unknown) => void
    mockEnrollPasskey.mockImplementation(
      () => new Promise(resolve => { resolveEnroll = resolve })
    )

    renderSheet()
    const enrollBtn = screen.getByRole('button', { name: /set up face id/i })

    await act(async () => {
      fireEvent.click(enrollBtn)
    })

    // Should show "Setting up..." text while in-progress
    expect(screen.getByText(/setting up/i)).toBeTruthy()

    // Cleanup
    await act(async () => {
      resolveEnroll!({ success: false, cancelled: true, error: 'Cancelled' })
    })
  })

  // 5. Successful enrollment: calls onEnrolled, does not show error
  it('successful enrollment calls onEnrolled', async () => {
    const onEnrolled = vi.fn()
    mockEnrollPasskey.mockResolvedValue({
      success: true,
      passkeyId: 'passkey-uuid-001',
      deviceHint: 'iPhone 15',
    })

    renderSheet({ isOpen: true, onEnrolled })
    const enrollBtn = screen.getByRole('button', { name: /set up face id/i })

    await act(async () => {
      fireEvent.click(enrollBtn)
    })

    await waitFor(() => {
      expect(onEnrolled).toHaveBeenCalledTimes(1)
    })

    // No error message shown
    expect(screen.queryByRole('alert')).toBeNull()
  })

  // 6. Cancelled enrollment: calls onClose silently, no error shown
  it('cancelled enrollment (cancelled=true) calls onClose, shows no error', async () => {
    const onClose = vi.fn()
    const onEnrolled = vi.fn()
    mockEnrollPasskey.mockResolvedValue({
      success: false,
      cancelled: true,
      error: 'Cancelled',
    })

    renderSheet({ isOpen: true, onClose, onEnrolled })
    const enrollBtn = screen.getByRole('button', { name: /set up face id/i })

    await act(async () => {
      fireEvent.click(enrollBtn)
    })

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    expect(onEnrolled).not.toHaveBeenCalled()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  // 7. Failed enrollment: shows error message inline, keeps sheet open
  it('failed enrollment shows error message inline, does not call onClose', async () => {
    const onClose = vi.fn()
    const onEnrolled = vi.fn()
    mockEnrollPasskey.mockResolvedValue({
      success: false,
      cancelled: false,
      error: 'Could not verify your passkey.',
    })

    renderSheet({ isOpen: true, onClose, onEnrolled })
    const enrollBtn = screen.getByRole('button', { name: /set up face id/i })

    await act(async () => {
      fireEvent.click(enrollBtn)
    })

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeTruthy()
    })

    expect(screen.getByText(/could not verify your passkey/i)).toBeTruthy()
    expect(onClose).not.toHaveBeenCalled()
    expect(onEnrolled).not.toHaveBeenCalled()
  })

  // 8. Sheet dialog element always present in DOM (animation-based show/hide)
  it('dialog element is present in DOM regardless of isOpen', async () => {
    renderSheet({ isOpen: false })
    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).toBeTruthy()
  })

  // 9. Accessibility: sheet has role="dialog", buttons are accessible
  it('sheet has role="dialog" and accessible buttons', () => {
    renderSheet({ isOpen: true })
    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).toBeTruthy()
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
    expect(dialog?.getAttribute('aria-label')).toBeTruthy()

    // All interactive elements must be buttons (accessible)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })

  // 10. Error is cleared when sheet re-opens
  it('error is cleared when sheet opens (isOpen changes to true)', async () => {
    const onClose = vi.fn()
    mockEnrollPasskey.mockResolvedValue({
      success: false,
      cancelled: false,
      error: 'Something went wrong.',
    })

    const { rerender } = renderSheet({ isOpen: true, onClose })
    const enrollBtn = screen.getByRole('button', { name: /set up face id/i })

    await act(async () => {
      fireEvent.click(enrollBtn)
    })

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeTruthy()
    })

    // Close and reopen
    await act(async () => {
      rerender(
        React.createElement(PasskeyEnrollmentSheet, {
          ...defaultProps,
          isOpen: false,
          onClose,
        })
      )
    })

    await act(async () => {
      rerender(
        React.createElement(PasskeyEnrollmentSheet, {
          ...defaultProps,
          isOpen: true,
          onClose,
        })
      )
    })

    // Error should be gone after re-open
    await waitFor(() => {
      expect(screen.queryByRole('alert')).toBeNull()
    })
  })

  // 11. enrollPasskey is called exactly once per click
  it('enrollPasskey is called exactly once when CTA is clicked', async () => {
    renderSheet()
    const enrollBtn = screen.getByRole('button', { name: /set up face id/i })

    await act(async () => {
      fireEvent.click(enrollBtn)
    })

    await waitFor(() => {
      expect(mockEnrollPasskey).toHaveBeenCalledTimes(1)
    })
  })
})
