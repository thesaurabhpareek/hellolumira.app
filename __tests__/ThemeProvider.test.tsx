// @vitest-environment happy-dom
/**
 * Unit tests for ThemeProvider and useTheme hook.
 * Tests default theme, dark/light class toggling, localStorage persistence,
 * and system preference change handling.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'

// ─── localStorage mock ──────────────────────────────────────────────────────

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// ─── matchMedia mock factory ─────────────────────────────────────────────────

type MediaQueryListener = () => void

interface MockMediaQuery {
  matches: boolean
  addEventListener: ReturnType<typeof vi.fn>
  removeEventListener: ReturnType<typeof vi.fn>
  _trigger: () => void
}

function createMatchMediaMock(prefersDark: boolean): MockMediaQuery {
  const listeners: MediaQueryListener[] = []
  const mq: MockMediaQuery = {
    matches: prefersDark,
    addEventListener: vi.fn((_event: string, cb: MediaQueryListener) => {
      listeners.push(cb)
    }),
    removeEventListener: vi.fn((_event: string, cb: MediaQueryListener) => {
      const idx = listeners.indexOf(cb)
      if (idx !== -1) listeners.splice(idx, 1)
    }),
    _trigger: () => {
      mq.matches = !mq.matches
      listeners.forEach((cb) => cb())
    },
  }
  return mq
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function setupMatchMedia(prefersDark = false): MockMediaQuery {
  const mq = createMatchMediaMock(prefersDark)
  Object.defineProperty(globalThis, 'matchMedia', {
    value: vi.fn(() => mq),
    writable: true,
    configurable: true,
  })
  return mq
}

function renderThemeHook() {
  // Import inside function so module is freshly resolved each time via vi.resetModules
  const { ThemeProvider, useTheme } = require('@/components/ThemeProvider')
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(ThemeProvider, null, children)
  return renderHook(() => useTheme(), { wrapper })
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    document.documentElement.classList.remove('dark', 'theme-transition')
    setupMatchMedia(false) // default: system prefers light
    vi.resetModules()
  })

  afterEach(() => {
    document.documentElement.classList.remove('dark', 'theme-transition')
  })

  // 1. Default theme is 'system'
  it('default theme is system', () => {
    localStorageMock.getItem.mockReturnValue(null)
    const { result } = renderThemeHook()
    expect(result.current.theme).toBe('system')
  })

  // 2. setTheme('dark') adds 'dark' class to document.documentElement
  it('setTheme dark adds dark class to documentElement', () => {
    const { result } = renderThemeHook()
    act(() => {
      result.current.setTheme('dark')
    })
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(result.current.resolvedTheme).toBe('dark')
  })

  // 3. setTheme('light') removes 'dark' class
  it('setTheme light removes dark class from documentElement', () => {
    document.documentElement.classList.add('dark')
    const { result } = renderThemeHook()
    act(() => {
      result.current.setTheme('light')
    })
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(result.current.resolvedTheme).toBe('light')
  })

  // 4. Preference persists to localStorage
  it('setTheme persists the choice to localStorage', () => {
    const { result } = renderThemeHook()
    act(() => {
      result.current.setTheme('dark')
    })
    expect(localStorageMock.setItem).toHaveBeenCalledWith('lumira-theme', 'dark')

    act(() => {
      result.current.setTheme('light')
    })
    expect(localStorageMock.setItem).toHaveBeenCalledWith('lumira-theme', 'light')

    act(() => {
      result.current.setTheme('system')
    })
    expect(localStorageMock.setItem).toHaveBeenCalledWith('lumira-theme', 'system')
  })

  // 5. Reads persisted preference on mount
  it('reads persisted dark preference from localStorage on mount', () => {
    localStorageMock.getItem.mockImplementation((key: string) =>
      key === 'lumira-theme' ? 'dark' : null,
    )
    const { result } = renderThemeHook()
    expect(result.current.theme).toBe('dark')
    expect(result.current.resolvedTheme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('reads persisted light preference from localStorage on mount', () => {
    document.documentElement.classList.add('dark')
    localStorageMock.getItem.mockImplementation((key: string) =>
      key === 'lumira-theme' ? 'light' : null,
    )
    const { result } = renderThemeHook()
    expect(result.current.theme).toBe('light')
    expect(result.current.resolvedTheme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  // 6. System preference change updates resolvedTheme when theme='system'
  it('system preference change updates resolvedTheme when theme is system', () => {
    const mq = setupMatchMedia(false) // starts light
    vi.resetModules()
    const { result } = renderThemeHook()

    // Should start as light (system prefers light)
    expect(result.current.resolvedTheme).toBe('light')
    expect(result.current.theme).toBe('system')

    // Simulate OS switching to dark
    act(() => {
      mq._trigger() // toggles matches to true (dark)
    })

    expect(result.current.resolvedTheme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  // 7. System preference change is ignored when theme explicitly set
  it('system preference change is ignored when theme is explicitly set to light', () => {
    const mq = setupMatchMedia(false)
    vi.resetModules()
    const { result } = renderThemeHook()

    // Explicitly set to light
    act(() => {
      result.current.setTheme('light')
    })
    expect(result.current.theme).toBe('light')
    expect(result.current.resolvedTheme).toBe('light')

    // OS switches to dark — should have no effect
    act(() => {
      mq._trigger() // toggles matches to true
    })

    expect(result.current.resolvedTheme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('system preference change is ignored when theme is explicitly set to dark', () => {
    const mq = setupMatchMedia(true) // OS starts dark
    vi.resetModules()
    const { result } = renderThemeHook()

    // Explicitly set to dark
    act(() => {
      result.current.setTheme('dark')
    })
    expect(result.current.theme).toBe('dark')

    // OS switches to light — should have no effect
    act(() => {
      mq._trigger() // toggles matches to false
    })

    expect(result.current.resolvedTheme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
