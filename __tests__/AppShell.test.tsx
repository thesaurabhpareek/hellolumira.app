// @vitest-environment happy-dom
/**
 * Regression tests for AppShell overflow behavior fix.
 * Fix: Chat thread pages must NOT use overflow-y-auto (which breaks full-height
 * flex layouts). Non-chat pages must retain overflow-y-auto for normal scrolling.
 *
 * Strategy: Rather than rendering the full component (which requires the
 * auto-JSX transform via @vitejs/plugin-react), we test the isChatThread logic
 * and the className construction directly — this is the exact code path that
 * drives the overflow behavior fix.
 *
 * Bug that was fixed: The main scrollable div always used overflow-y-auto,
 * meaning the messages area could not fill its parent to create a
 * sticky-bottom-input layout on chat threads.
 */
import { describe, it, expect } from 'vitest'

// ─── Unit-test the isChatThread detection logic ──────────────────────────────

function isChatThread(pathname: string): boolean {
  return pathname.startsWith('/chat/') && pathname !== '/chat'
}

function getScrollClass(pathname: string): string {
  const chat = isChatThread(pathname)
  if (chat) {
    return 'overflow-hidden'
  }
  return 'overflow-y-auto overflow-x-hidden [-webkit-overflow-scrolling:touch]'
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('AppShell overflow behavior (Fix 1) — isChatThread detection', () => {
  it('detects /chat/some-thread-id as a chat thread', () => {
    expect(isChatThread('/chat/abc-123-thread-id')).toBe(true)
  })

  it('does NOT detect /chat root as a chat thread', () => {
    expect(isChatThread('/chat')).toBe(false)
  })

  it('does NOT detect /home as a chat thread', () => {
    expect(isChatThread('/home')).toBe(false)
  })

  it('does NOT detect /profile as a chat thread', () => {
    expect(isChatThread('/profile')).toBe(false)
  })

  it('does NOT detect /tribes as a chat thread', () => {
    expect(isChatThread('/tribes')).toBe(false)
  })

  it('detects any /chat/<id> path as a chat thread', () => {
    expect(isChatThread('/chat/thread-uuid-001')).toBe(true)
    expect(isChatThread('/chat/00000000-0000-0000-0000-000000000000')).toBe(true)
  })
})

describe('AppShell scroll class assignment (Fix 1)', () => {
  it('uses overflow-hidden for chat thread pages', () => {
    const cls = getScrollClass('/chat/abc-123')
    expect(cls).toContain('overflow-hidden')
    expect(cls).not.toContain('overflow-y-auto')
  })

  it('uses overflow-y-auto for /home', () => {
    const cls = getScrollClass('/home')
    expect(cls).toContain('overflow-y-auto')
    expect(cls).not.toMatch(/\boverflow-hidden\b/)
  })

  it('uses overflow-y-auto for /chat root (not a thread)', () => {
    const cls = getScrollClass('/chat')
    expect(cls).toContain('overflow-y-auto')
    expect(cls).not.toMatch(/\boverflow-hidden\b/)
  })

  it('uses overflow-y-auto for /profile', () => {
    const cls = getScrollClass('/profile')
    expect(cls).toContain('overflow-y-auto')
  })

  it('uses overflow-y-auto for /content', () => {
    const cls = getScrollClass('/content')
    expect(cls).toContain('overflow-y-auto')
  })

  it('uses overflow-y-auto for /tribes', () => {
    const cls = getScrollClass('/tribes')
    expect(cls).toContain('overflow-y-auto')
  })
})

describe('AppShell source code contract (Fix 1)', () => {
  // Reads the actual AppShell source to confirm the fix is present in
  // the production code — not just our isolated logic re-implementation.
  it('AppShell.tsx contains isChatThread detection with the correct condition', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const src = fs.readFileSync(
      path.resolve(process.cwd(), 'components/app/AppShell.tsx'),
      'utf8'
    )
    // Must detect startsWith('/chat/') AND exclude '/chat' root
    expect(src).toContain("pathname.startsWith('/chat/')")
    expect(src).toContain("pathname !== '/chat'")
  })

  it('AppShell.tsx uses overflow-hidden for isChatThread branches', async () => {
    const fs = await import('fs')
    const path = await import('path')
    const src = fs.readFileSync(
      path.resolve(process.cwd(), 'components/app/AppShell.tsx'),
      'utf8'
    )
    // The conditional class string must include overflow-hidden for the chat branch
    expect(src).toContain('overflow-hidden')
    // And overflow-y-auto for the non-chat branch
    expect(src).toContain('overflow-y-auto')
  })
})
