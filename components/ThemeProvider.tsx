'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

type Theme = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const STORAGE_KEY = 'lumira-theme'

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')

  const applyTheme = useCallback((resolved: ResolvedTheme) => {
    const root = document.documentElement
    // Add transition class for smooth switch
    root.classList.add('theme-transition')
    if (resolved === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    // Update meta theme-color dynamically
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', resolved === 'dark' ? '#131210' : '#3D8178')
    }
    setResolvedTheme(resolved)
    // Remove transition class after animation completes
    setTimeout(() => root.classList.remove('theme-transition'), 350)
  }, [])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    try { localStorage.setItem(STORAGE_KEY, newTheme) } catch {}
    const resolved = newTheme === 'system' ? getSystemTheme() : newTheme
    applyTheme(resolved)
  }, [applyTheme])

  // Initialize from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    const initial = stored || 'system'
    setThemeState(initial)
    const resolved = initial === 'system' ? getSystemTheme() : initial
    // Don't add transition on initial load
    if (resolved === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    setResolvedTheme(resolved)
  }, [])

  // Listen for system preference changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (theme === 'system') {
        applyTheme(getSystemTheme())
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme, applyTheme])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
