// @vitest-environment happy-dom
/**
 * Unit tests for ThemeToggleButton component.
 * Tests icon rendering per resolved theme, click-to-toggle behaviour, and
 * the aria-label value in each mode.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

// ─── Mock useTheme ───────────────────────────────────────────────────────────

const mockSetTheme = vi.fn()

// We mock the entire ThemeProvider module so the component never needs a real
// context tree, and we can drive `resolvedTheme` from each test.
vi.mock('@/components/ThemeProvider', () => ({
  useTheme: vi.fn(),
}))

import { useTheme } from '@/components/ThemeProvider'
import ThemeToggleButton from '@/components/app/ThemeToggleButton'

const mockUseTheme = useTheme as ReturnType<typeof vi.fn>

// ─── Helpers ─────────────────────────────────────────────────────────────────

function renderInLightMode() {
  mockUseTheme.mockReturnValue({ resolvedTheme: 'light', setTheme: mockSetTheme })
  return render(React.createElement(ThemeToggleButton))
}

function renderInDarkMode() {
  mockUseTheme.mockReturnValue({ resolvedTheme: 'dark', setTheme: mockSetTheme })
  return render(React.createElement(ThemeToggleButton))
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ThemeToggleButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 1. Renders moon icon in light mode (aria-label contains "dark")
  it('renders a moon SVG in light mode', () => {
    renderInLightMode()
    // In light mode the moon path is present; the sun's central <circle> is absent
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBe(1)
    // Moon icon uses a single <path> element, no <circle>
    const paths = svgs[0].querySelectorAll('path')
    expect(paths.length).toBeGreaterThanOrEqual(1)
    const circles = svgs[0].querySelectorAll('circle')
    expect(circles.length).toBe(0)
  })

  // 2. Renders sun icon in dark mode (aria-label contains "light")
  it('renders a sun SVG in dark mode', () => {
    renderInDarkMode()
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBe(1)
    // Sun icon uses a <circle> element at its core
    const circles = svgs[0].querySelectorAll('circle')
    expect(circles.length).toBeGreaterThanOrEqual(1)
  })

  // 3. Clicking toggles from light to dark
  it('calls setTheme with dark when clicked in light mode', () => {
    renderInLightMode()
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(mockSetTheme).toHaveBeenCalledTimes(1)
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('calls setTheme with light when clicked in dark mode', () => {
    renderInDarkMode()
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(mockSetTheme).toHaveBeenCalledTimes(1)
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  // 4. Correct aria-label per mode
  it('has aria-label containing "dark" in light mode (prompts user to switch to dark)', () => {
    renderInLightMode()
    const button = screen.getByRole('button')
    expect(button.getAttribute('aria-label')?.toLowerCase()).toContain('dark')
  })

  it('has aria-label containing "light" in dark mode (prompts user to switch to light)', () => {
    renderInDarkMode()
    const button = screen.getByRole('button')
    expect(button.getAttribute('aria-label')?.toLowerCase()).toContain('light')
  })
})
