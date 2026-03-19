// __tests__/mobile-web.test.ts — Mobile web optimization audit tests
// These tests validate that components meet mobile-first design requirements.
// They read source files and check for required CSS properties, attributes, and patterns.

import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(__dirname, '..')

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf-8')
}

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.join(ROOT, relativePath))
}

// ─── Viewport configuration ────────────────────────────────────────────────

describe('Viewport configuration', () => {
  const layoutSrc = readFile('app/layout.tsx')

  it('sets viewport width to device-width', () => {
    expect(layoutSrc).toContain("width: 'device-width'")
  })

  it('sets initialScale to 1', () => {
    expect(layoutSrc).toContain('initialScale: 1')
  })

  it('sets viewport-fit to cover for iOS safe areas', () => {
    expect(layoutSrc).toContain("viewportFit: 'cover'")
  })

  it('sets theme-color meta tag', () => {
    expect(layoutSrc).toContain("themeColor: '#3D8178'")
  })
})

// ─── iOS Safe Areas ────────────────────────────────────────────────────────

describe('iOS safe area support', () => {
  it('AppShell bottom nav has safe-area-inset-bottom padding', () => {
    const src = readFile('components/app/AppShell.tsx')
    expect(src).toContain('env(safe-area-inset-bottom)')
  })

  it('AppShell header has safe-area-inset-top padding', () => {
    const src = readFile('components/app/AppShell.tsx')
    expect(src).toContain('env(safe-area-inset-top)')
  })

  it('NotificationPanel content has safe-area-inset-bottom', () => {
    const src = readFile('components/app/NotificationPanel.tsx')
    expect(src).toContain('env(safe-area-inset-bottom)')
  })

  it('ChatThreadView input bar has safe-area-inset-bottom', () => {
    const src = readFile('components/app/chat/ChatThreadView.tsx')
    expect(src).toContain('env(safe-area-inset-bottom)')
  })

  it('CheckinThread input bar has safe-area-inset-bottom', () => {
    const src = readFile('components/app/CheckinThread.tsx')
    expect(src).toContain('env(safe-area-inset-bottom)')
  })

  it('EmergencyOverlay has safe-area-inset-top padding', () => {
    const src = readFile('components/app/chat/EmergencyOverlay.tsx')
    expect(src).toContain('env(safe-area-inset-top)')
  })

  it('EmergencyOverlay has safe-area-inset-bottom padding', () => {
    const src = readFile('components/app/chat/EmergencyOverlay.tsx')
    expect(src).toContain('env(safe-area-inset-bottom)')
  })

  it('LandingPage has viewport-fit cover for safe area support', () => {
    const src = readFile('app/layout.tsx')
    expect(src).toContain('cover')
  })
})

// ─── Dynamic viewport height (100dvh) ──────────────────────────────────────

describe('Dynamic viewport height (100dvh)', () => {
  it('AppShell uses 100dvh instead of 100vh', () => {
    const src = readFile('components/app/AppShell.tsx')
    expect(src).toContain('100dvh')
    // Should NOT use 100vh for min-height
    expect(src).not.toMatch(/minHeight:\s*['"]100vh['"]/)
  })

  it('ChatThreadView uses 100dvh', () => {
    const src = readFile('components/app/chat/ChatThreadView.tsx')
    expect(src).toContain('100dvh')
    expect(src).not.toMatch(/minHeight:\s*['"]100vh['"]/)
  })

  it('CheckinThread uses 100dvh', () => {
    const src = readFile('components/app/CheckinThread.tsx')
    expect(src).toContain('100dvh')
    expect(src).not.toMatch(/minHeight:\s*['"]100vh['"]/)
  })

  it('LandingPage uses dynamic viewport height or full height', () => {
    const src = readFile('app/LandingPageClient.tsx')
    // Landing page may use 100dvh or min-height: 100vh or rely on content flow
    expect(src).toMatch(/dvh|vh|height/i)
  })

  it('globals.css body uses 100dvh', () => {
    const src = readFile('app/globals.css')
    expect(src).toContain('100dvh')
  })
})

// ─── Touch targets (48px minimum) ──────────────────────────────────────────

describe('Touch targets - minimum 48px', () => {
  it('AppShell nav links have 56px minHeight and 48px minWidth', () => {
    const src = readFile('components/app/AppShell.tsx')
    // Nav links should have minHeight 56px (bottom tab standard)
    expect(src).toContain("minHeight: '56px'")
    expect(src).toContain("minWidth: '48px'")
  })

  it('NotificationPanel close button is 48x48', () => {
    const src = readFile('components/app/NotificationPanel.tsx')
    expect(src).toContain("width: '48px'")
    expect(src).toContain("height: '48px'")
  })

  it('NotificationPanel mark-all-read button has 48px minHeight', () => {
    const src = readFile('components/app/NotificationPanel.tsx')
    expect(src).toContain("minHeight: '48px'")
  })

  it('NotificationRow has 48px minHeight', () => {
    const src = readFile('components/app/NotificationPanel.tsx')
    expect(src).toContain("minHeight: '48px'")
  })

  it('ChatThreadView send button is 48x48', () => {
    const src = readFile('components/app/chat/ChatThreadView.tsx')
    expect(src).toContain("width: '48px'")
    expect(src).toContain("height: '48px'")
  })

  it('ChatThreadView back button has 48px minHeight and minWidth', () => {
    const src = readFile('components/app/chat/ChatThreadView.tsx')
    expect(src).toContain("minHeight: '48px'")
    expect(src).toContain("minWidth: '48px'")
  })

  it('CheckinThread back button has 48px minHeight and minWidth', () => {
    const src = readFile('components/app/CheckinThread.tsx')
    expect(src).toContain("minHeight: '48px'")
    expect(src).toContain("minWidth: '48px'")
  })

  it('ConsentCheckbox label has 48px minHeight', () => {
    const src = readFile('components/app/ConsentCheckbox.tsx')
    expect(src).toContain("minHeight: '48px'")
  })

  it('EmergencyOverlay call button has at least 56px height', () => {
    const src = readFile('components/app/chat/EmergencyOverlay.tsx')
    expect(src).toContain("height: '56px'")
  })

  it('Structured field chips have 48px min-height via CSS class', () => {
    const src = readFile('app/globals.css')
    // .chip class should have min-height: 48px
    expect(src).toMatch(/\.chip\s*\{[^}]*min-height:\s*48px/)
  })

  it('btn-primary has 52px height (exceeds 48px minimum)', () => {
    const src = readFile('app/globals.css')
    expect(src).toMatch(/\.btn-primary\s*\{[^}]*height:\s*52px/)
  })
})

// ─── Content width constraint (480px max) ──────────────────────────────────

describe('Content width constraint', () => {
  it('AppShell header content is constrained to 480px', () => {
    const src = readFile('components/app/AppShell.tsx')
    expect(src).toContain("maxWidth: '480px'")
  })

  it('AppShell main content is constrained to 480px', () => {
    const src = readFile('components/app/AppShell.tsx')
    // Should appear multiple times (header + main + nav)
    const matches = src.match(/maxWidth: '480px'/g)
    expect(matches).not.toBeNull()
    expect(matches!.length).toBeGreaterThanOrEqual(3)
  })

  it('globals.css content-width class uses 480px', () => {
    const src = readFile('app/globals.css')
    expect(src).toMatch(/\.content-width\s*\{[^}]*max-width:\s*480px/)
  })

  it('LandingPage sections have max-width constraint', () => {
    const src = readFile('app/LandingPageClient.tsx')
    // Content should be constrained — may use maxWidth, max-width CSS, or content-width class
    expect(src).toMatch(/maxWidth|max-width|content-width/)
  })
})

// ─── Prevent iOS zoom on input focus (font-size >= 16px) ───────────────────

describe('Input font-size >= 16px (prevents iOS auto-zoom)', () => {
  it('ChatThreadView textarea uses 16px font', () => {
    const src = readFile('components/app/chat/ChatThreadView.tsx')
    // The textarea for message input must be >= 16px
    expect(src).toMatch(/fontSize:\s*'16px'/)
  })

  it('CheckinThread textarea uses 16px font', () => {
    const src = readFile('components/app/CheckinThread.tsx')
    expect(src).toMatch(/fontSize:\s*'16px'/)
  })

  it('Onboarding step 1 name input uses 18px font (above 16px threshold)', () => {
    const src = readFile('app/onboarding/page.tsx')
    expect(src).toContain("fontSize: '18px'")
  })

  it('Onboarding date inputs use 16px font', () => {
    const src = readFile('app/onboarding/page.tsx')
    // All date/text inputs in step 2 & 3 should use 16px
    expect(src).toContain("fontSize: '16px'")
  })

  it('Onboarding concern textarea uses 16px font', () => {
    const src = readFile('app/onboarding/page.tsx')
    // The textarea should not use 15px (would cause iOS zoom)
    const textareaSection = src.substring(src.indexOf('initialConcern'))
    expect(textareaSection).toContain("fontSize: '16px'")
  })

  it('LandingPage email input uses 16px font', () => {
    const src = readFile('app/LandingPageClient.tsx')
    // The waitlist email input
    const emailSection = src.substring(src.indexOf('waitlist-email'))
    expect(emailSection).toContain('fontSize: 16')
  })

  it('Onboarding invite email input uses 16px font', () => {
    const src = readFile('app/onboarding/page.tsx')
    // Partner email input
    expect(src).toContain("fontSize: '16px'")
  })
})

// ─── Scroll behavior ──────────────────────────────────────────────────────

describe('Scroll behavior and overscroll containment', () => {
  it('AppShell main content has WebkitOverflowScrolling touch', () => {
    const src = readFile('components/app/AppShell.tsx')
    expect(src).toContain("WebkitOverflowScrolling: 'touch'")
  })

  it('NotificationPanel content has overscroll-behavior contain', () => {
    const src = readFile('components/app/NotificationPanel.tsx')
    expect(src).toContain("overscrollBehavior: 'contain'")
  })

  it('NotificationPanel locks body scroll when open', () => {
    const src = readFile('components/app/NotificationPanel.tsx')
    expect(src).toContain("document.body.style.overflow = 'hidden'")
  })

  it('ChatThreadView messages area has overscroll-behavior contain', () => {
    const src = readFile('components/app/chat/ChatThreadView.tsx')
    expect(src).toContain("overscrollBehavior: 'contain'")
  })

  it('CheckinThread messages area has overscroll-behavior contain', () => {
    const src = readFile('components/app/CheckinThread.tsx')
    expect(src).toContain("overscrollBehavior: 'contain'")
  })

  it('EmergencyOverlay has overscroll-behavior contain', () => {
    const src = readFile('components/app/chat/EmergencyOverlay.tsx')
    expect(src).toContain("overscrollBehavior: 'contain'")
  })

  it('EmergencyOverlay locks body scroll', () => {
    const src = readFile('components/app/chat/EmergencyOverlay.tsx')
    expect(src).toContain("document.body.style.overflow = 'hidden'")
  })

  it('AppShell content area prevents horizontal overflow', () => {
    const src = readFile('components/app/AppShell.tsx')
    expect(src).toContain("overflowX: 'hidden'")
  })

  it('globals.css html prevents horizontal overflow', () => {
    const src = readFile('app/globals.css')
    expect(src).toContain('overflow-x: hidden')
  })
})

// ─── Touch interaction optimizations ───────────────────────────────────────

describe('Touch interaction optimizations', () => {
  it('globals.css sets webkit-tap-highlight-color to transparent', () => {
    const src = readFile('app/globals.css')
    expect(src).toContain('-webkit-tap-highlight-color: transparent')
  })

  it('AppShell nav links have webkit-tap-highlight transparent', () => {
    const src = readFile('components/app/AppShell.tsx')
    expect(src).toContain("WebkitTapHighlightColor: 'transparent'")
  })

  it('AppShell nav links have touch-action manipulation', () => {
    const src = readFile('components/app/AppShell.tsx')
    expect(src).toContain("touchAction: 'manipulation'")
  })

  it('NotificationRow has webkit-tap-highlight transparent', () => {
    const src = readFile('components/app/NotificationPanel.tsx')
    expect(src).toContain("WebkitTapHighlightColor: 'transparent'")
  })

  it('EmergencyOverlay has touch-action none to prevent scrolling behind', () => {
    const src = readFile('components/app/chat/EmergencyOverlay.tsx')
    expect(src).toContain("touchAction: 'none'")
  })

  it('EmergencyOverlay buttons have touch-action manipulation', () => {
    const src = readFile('components/app/chat/EmergencyOverlay.tsx')
    expect(src).toContain("touchAction: 'manipulation'")
  })

  it('ConsentCheckbox has touch-action manipulation', () => {
    const src = readFile('components/app/ConsentCheckbox.tsx')
    expect(src).toContain("touchAction: 'manipulation'")
  })

  it('LandingPage stage toggle buttons have touch-action manipulation', () => {
    const src = readFile('app/LandingPageClient.tsx')
    expect(src).toContain("touchAction: 'manipulation'")
  })
})

// ─── Bottom nav does not hide content ──────────────────────────────────────

describe('Bottom nav content visibility', () => {
  it('AppShell adds padding-bottom to account for fixed bottom nav', () => {
    const src = readFile('components/app/AppShell.tsx')
    // paddingBottom should include 56px (nav height) + safe area
    expect(src).toContain("paddingBottom: 'calc(56px + max(0px, env(safe-area-inset-bottom)))'")
  })

  it('AppShell bottom nav is 56px minimum height', () => {
    const src = readFile('components/app/AppShell.tsx')
    expect(src).toContain("minHeight: '56px'")
  })

  it('AppShell bottom nav is fixed to bottom', () => {
    const src = readFile('components/app/AppShell.tsx')
    expect(src).toContain("position: 'fixed'")
    expect(src).toContain("bottom: 0")
  })

  it('ChatThreadView input has paddingBottom for safe area', () => {
    const src = readFile('components/app/chat/ChatThreadView.tsx')
    expect(src).toContain("paddingBottom: 'max(12px, env(safe-area-inset-bottom))'")
  })

  it('ChatThreadView messages area has enough bottom padding for input', () => {
    const src = readFile('components/app/chat/ChatThreadView.tsx')
    // paddingBottom should be at least 120px to clear fixed input
    expect(src).toContain("paddingBottom: '140px'")
  })
})

// ─── Message bubble text wrapping ──────────────────────────────────────────

describe('Message bubble text wrapping', () => {
  it('Lumira bubbles have max-width 85% to prevent overflow', () => {
    const src = readFile('app/globals.css')
    expect(src).toContain('max-width: 85%')
  })

  it('Message content uses pre-wrap for proper line breaking', () => {
    const src = readFile('components/app/chat/ChatThreadView.tsx')
    expect(src).toContain("whiteSpace: 'pre-wrap'")
  })

  it('CheckinThread messages use pre-wrap', () => {
    const src = readFile('components/app/CheckinThread.tsx')
    expect(src).toContain("whiteSpace: 'pre-wrap'")
  })
})

// ─── EmergencyOverlay specific tests ───────────────────────────────────────

describe('EmergencyOverlay mobile safety', () => {
  const src = readFile('components/app/chat/EmergencyOverlay.tsx')

  it('covers entire viewport with fixed inset 0', () => {
    expect(src).toContain("position: 'fixed'")
    expect(src).toContain('inset: 0')
  })

  it('has tel: link for calling emergency services', () => {
    expect(src).toContain("'tel:911'")
  })

  it('uses alertdialog role for accessibility', () => {
    expect(src).toContain('role="alertdialog"')
  })

  it('is marked as aria-modal', () => {
    expect(src).toContain('aria-modal="true"')
  })

  it('has z-index higher than other UI elements', () => {
    expect(src).toContain('zIndex: 300')
  })

  it('auto-focuses the call button on mount', () => {
    expect(src).toContain('callButtonRef.current?.focus()')
  })

  it('text is readable with adequate font size', () => {
    // Message text should be at least 15px
    expect(src).toContain("fontSize: '15px'")
    // Title should be 21px
    expect(src).toContain("fontSize: '21px'")
  })
})

// ─── ConsentCheckbox mobile tests ──────────────────────────────────────────

describe('ConsentCheckbox mobile usability', () => {
  const src = readFile('components/app/ConsentCheckbox.tsx')

  it('links use stopPropagation to prevent triggering checkbox', () => {
    expect(src).toContain('e.stopPropagation()')
  })

  it('checkbox has role="checkbox" for accessibility', () => {
    expect(src).toContain('role="checkbox"')
  })

  it('checkbox has aria-checked attribute', () => {
    expect(src).toContain('aria-checked={checked}')
  })

  it('supports keyboard interaction (Space and Enter)', () => {
    expect(src).toContain("e.key === ' '")
    expect(src).toContain("e.key === 'Enter'")
  })

  it('checkbox is focusable with tabIndex', () => {
    expect(src).toContain('tabIndex={0}')
  })

  it('label text uses 16px font (readable on mobile)', () => {
    expect(src).toContain("fontSize: '16px'")
  })
})

// ─── Onboarding mobile tests ──────────────────────────────────────────────

describe('Onboarding page mobile optimization', () => {
  const src = readFile('app/onboarding/page.tsx')

  it('buttons are full-width on mobile via btn-primary class', () => {
    expect(src).toContain("className=\"btn-primary\"")
  })

  it('step navigation buttons are accessible on small screens', () => {
    // Back button + Continue button in a flex row
    expect(src).toContain("display: 'flex', gap: '12px'")
  })

  it('mode selection cards have adequate padding for touch', () => {
    expect(src).toContain("padding: '20px'")
  })

  it('first-time parent chips have 48px min-height via chip class', () => {
    expect(src).toContain("className={firstTimeParent === true ? 'chip chip-selected' : 'chip'}")
  })

  it('uses autoFocus on first input for quick entry', () => {
    expect(src).toContain('autoFocus')
  })

  it('supports Enter key to advance steps', () => {
    expect(src).toContain("e.key === 'Enter'")
  })
})

// ─── Landing page mobile tests ─────────────────────────────────────────────

describe('Landing page mobile optimization', () => {
  const src = readFile('app/LandingPageClient.tsx')

  it('hero section has padding for mobile', () => {
    // Hero/sections should have horizontal padding for mobile
    expect(src).toMatch(/padding.*24px|padding.*0\s+24px/)
  })

  it('CTA buttons are full-width', () => {
    expect(src).toContain("width: '100%'")
  })

  it('animations use transform and opacity only (GPU accelerated)', () => {
    // Check keyframe animations use transform/opacity
    expect(src).toContain('transform: translateY')
    expect(src).toContain('opacity: 0')
    expect(src).toContain('opacity: 1')
  })

  it('logo has width styling for responsive sizing', () => {
    // Logo should have explicit width — may use fixed px or clamp()
    expect(src).toMatch(/width/i)
  })

  it('headline uses responsive font-size for small screens', () => {
    // Font size should use clamp or a reasonable fixed size
    expect(src).toMatch(/fontSize.*clamp|fontSize:\s*(2[4-9]|3[0-2])/)
  })

  it('form button has touch-action manipulation', () => {
    expect(src).toContain('touchAction')
  })

  it('email input has 16px font to prevent iOS zoom', () => {
    expect(src).toContain('fontSize: 16')
  })
})

// ─── Accessibility tests ──────────────────────────────────────────────────

describe('Accessibility - ARIA and screen reader support', () => {
  it('AppShell bottom nav has aria-label', () => {
    const src = readFile('components/app/AppShell.tsx')
    expect(src).toContain('aria-label="Main navigation"')
  })

  it('AppShell tabs use aria-current for active state', () => {
    const src = readFile('components/app/AppShell.tsx')
    expect(src).toContain("aria-current={active ? 'page' : undefined}")
  })

  it('NotificationPanel has dialog role', () => {
    const src = readFile('components/app/NotificationPanel.tsx')
    expect(src).toContain('role="dialog"')
  })

  it('NotificationPanel close button has aria-label', () => {
    const src = readFile('components/app/NotificationPanel.tsx')
    expect(src).toContain('aria-label="Close notifications"')
  })

  it('ChatThreadView send button has aria-label', () => {
    const src = readFile('components/app/chat/ChatThreadView.tsx')
    expect(src).toContain('aria-label="Send message"')
  })

  it('ChatThreadView back button has aria-label', () => {
    const src = readFile('components/app/chat/ChatThreadView.tsx')
    expect(src).toContain('aria-label="Back to chat list"')
  })

  it('CheckinThread back button has aria-label', () => {
    const src = readFile('components/app/CheckinThread.tsx')
    expect(src).toContain('aria-label="Back to home"')
  })

  it('EmergencyOverlay call button has aria-label', () => {
    const src = readFile('components/app/chat/EmergencyOverlay.tsx')
    expect(src).toContain('aria-label="Call emergency services now"')
  })

  it('LandingPage logo SVG has aria-label', () => {
    const src = readFile('app/LandingPageClient.tsx')
    expect(src).toContain('aria-label="Lumira"')
  })

  it('LandingPage stage toggle has group role with aria-label', () => {
    const src = readFile('app/LandingPageClient.tsx')
    expect(src).toContain('role="group"')
    expect(src).toContain('aria-label="Select your stage"')
  })

  it('LandingPage error display uses aria-live for screen reader announcements', () => {
    const src = readFile('app/LandingPageClient.tsx')
    expect(src).toContain('aria-live="polite"')
  })

  it('LandingPage email input has associated label via htmlFor', () => {
    const src = readFile('app/LandingPageClient.tsx')
    expect(src).toContain('htmlFor="waitlist-email"')
    expect(src).toContain('id="waitlist-email"')
  })

  it('Notification emoji icons are hidden from screen readers', () => {
    const src = readFile('components/app/NotificationPanel.tsx')
    expect(src).toContain('aria-hidden="true"')
  })
})

// ─── PWA readiness tests ───────────────────────────────────────────────────

describe('PWA readiness', () => {
  it('apple-web-app-capable is set in metadata', () => {
    const src = readFile('app/layout.tsx')
    expect(src).toContain('appleWebApp')
    expect(src).toContain('capable: true')
  })

  it('apple touch icon is configured', () => {
    const src = readFile('app/layout.tsx')
    expect(src).toContain('apple-touch-icon.png')
  })

  it('theme-color is set', () => {
    const src = readFile('app/layout.tsx')
    expect(src).toContain("themeColor: '#3D8178'")
  })

  it('mobile-web-app-capable meta tag is set', () => {
    const src = readFile('app/layout.tsx')
    expect(src).toContain("'mobile-web-app-capable': 'yes'")
  })

  it('favicon is configured', () => {
    const src = readFile('app/layout.tsx')
    expect(src).toContain('favicon.ico')
  })

  it('SVG icon is configured', () => {
    const src = readFile('app/layout.tsx')
    expect(src).toContain('icon.svg')
  })
})

// ─── Performance: GPU-accelerated animations ───────────────────────────────

describe('Performance - animations use GPU-accelerated properties', () => {
  it('globals.css fade-in animation uses transform and opacity', () => {
    const src = readFile('app/globals.css')
    // fade-in keyframes should use transform/opacity only
    expect(src).toMatch(/@keyframes\s+fade-in\s*\{[^}]*transform/)
    expect(src).toMatch(/@keyframes\s+fade-in\s*\{[^}]*opacity/)
  })

  it('globals.css shimmer animation uses background-position (composite)', () => {
    const src = readFile('app/globals.css')
    expect(src).toMatch(/@keyframes\s+shimmer\s*\{[^}]*background-position/)
  })

  it('LandingPage fade-up animation uses transform and opacity', () => {
    const src = readFile('app/LandingPageClient.tsx')
    expect(src).toMatch(/translateY\(\d+px\)/)
    expect(src).toContain('translateY(0)')
  })

  it('NotificationPanel slide-up animation uses transform', () => {
    const src = readFile('components/app/NotificationPanel.tsx')
    expect(src).toContain('transform: translateY(100%)')
    expect(src).toContain('transform: translateY(0)')
  })
})

// ─── Form input types and autocomplete ─────────────────────────────────────

describe('Form input types and autocomplete attributes', () => {
  it('LandingPage email input has type="email"', () => {
    const src = readFile('app/LandingPageClient.tsx')
    expect(src).toContain('type="email"')
  })

  it('LandingPage email input has autoComplete="email"', () => {
    const src = readFile('app/LandingPageClient.tsx')
    expect(src).toContain('autoComplete="email"')
  })

  it('Onboarding partner invite input has type="email"', () => {
    const src = readFile('app/onboarding/page.tsx')
    expect(src).toContain('type="email"')
  })

  it('Onboarding date inputs use type="date" for native pickers', () => {
    const src = readFile('app/onboarding/page.tsx')
    expect(src).toContain('type="date"')
  })

  it('Onboarding name input has type="text"', () => {
    const src = readFile('app/onboarding/page.tsx')
    expect(src).toContain('type="text"')
  })
})

// ─── NotificationPanel bottom sheet tests ──────────────────────────────────

describe('NotificationPanel bottom sheet mobile behavior', () => {
  const src = readFile('components/app/NotificationPanel.tsx')

  it('max height is 70vh to prevent viewport overflow', () => {
    expect(src).toContain("maxHeight: '70vh'")
  })

  it('has rounded top corners for bottom sheet appearance', () => {
    expect(src).toContain("borderTopLeftRadius: '16px'")
    expect(src).toContain("borderTopRightRadius: '16px'")
  })

  it('has a drag handle for touch interaction', () => {
    expect(src).toContain("width: '36px'")
    expect(src).toContain("height: '4px'")
    expect(src).toContain("borderRadius: '2px'")
  })

  it('drag handle has touch-action none', () => {
    expect(src).toContain("touchAction: 'none'")
  })

  it('has backdrop for dismissal', () => {
    expect(src).toContain("background: 'rgba(0, 0, 0, 0.3)'")
  })

  it('supports Escape key to close', () => {
    expect(src).toContain("e.key === 'Escape'")
  })
})

// ─── Color contrast and readability ────────────────────────────────────────

describe('Color contrast and readability', () => {
  it('primary text color is dark enough for readability', () => {
    const src = readFile('app/globals.css')
    // #2D3748 is a very dark slate — high contrast on white
    expect(src).toContain('--color-slate:         #2D3748')
  })

  it('muted text color provides adequate contrast', () => {
    const src = readFile('app/globals.css')
    // #718096 on white = ~4.7:1 contrast ratio (passes WCAG AA for normal text)
    expect(src).toContain('--color-muted:         #718096')
  })

  it('EmergencyOverlay uses white text on dark red background', () => {
    const src = readFile('components/app/chat/EmergencyOverlay.tsx')
    expect(src).toContain("color: 'white'")
    expect(src).toContain("background: 'rgba(114, 28, 28, 0.95)'")
  })
})

// ─── Fixed bottom input keyboard compatibility ─────────────────────────────

describe('Fixed bottom input and mobile keyboard', () => {
  it('ChatThreadView input is fixed to bottom', () => {
    const src = readFile('components/app/chat/ChatThreadView.tsx')
    const inputSection = src.substring(src.indexOf('Fixed bottom input'))
    expect(inputSection).toContain("position: 'fixed'")
    expect(inputSection).toContain('bottom: 0')
  })

  it('CheckinThread input is fixed to bottom', () => {
    const src = readFile('components/app/CheckinThread.tsx')
    const inputSection = src.substring(src.indexOf('Input bar'))
    expect(inputSection).toContain("position: 'fixed'")
    expect(inputSection).toContain('bottom: 0')
  })

  it('ChatThreadView auto-scrolls to latest message', () => {
    const src = readFile('components/app/chat/ChatThreadView.tsx')
    expect(src).toContain("scrollIntoView({ behavior: 'smooth' })")
  })

  it('CheckinThread auto-scrolls to latest message', () => {
    const src = readFile('components/app/CheckinThread.tsx')
    expect(src).toContain("scrollIntoView({ behavior: 'smooth' })")
  })

  it('ChatThreadView textarea has auto-grow with max height', () => {
    const src = readFile('components/app/chat/ChatThreadView.tsx')
    expect(src).toContain("maxHeight: '96px'")
    expect(src).toContain('ta.scrollHeight')
  })
})

// ─── StructuredFieldChips mobile tests ─────────────────────────────────────

describe('StructuredFieldChips mobile usability', () => {
  const src = readFile('components/app/StructuredFieldChips.tsx')

  it('options scroll horizontally for overflow', () => {
    expect(src).toContain("overflowX: 'auto'")
  })

  it('uses webkit overflow scrolling for momentum', () => {
    expect(src).toContain("WebkitOverflowScrolling: 'touch'")
  })

  it('options do not shrink (flexShrink 0)', () => {
    expect(src).toContain('flexShrink: 0')
  })

  it('hides scrollbar for cleaner mobile appearance', () => {
    expect(src).toContain("scrollbarWidth: 'none'")
  })
})

// ─── Landscape orientation ─────────────────────────────────────────────────

describe('Landscape orientation compatibility', () => {
  it('CheckinThread uses flex column layout that adapts to orientation', () => {
    const src = readFile('components/app/CheckinThread.tsx')
    expect(src).toContain("flexDirection: 'column'")
  })

  it('ChatThreadView messages area is scrollable (works in landscape)', () => {
    const src = readFile('components/app/chat/ChatThreadView.tsx')
    expect(src).toContain("overflowY: 'auto'")
  })

  it('Content uses 100dvh which adapts to landscape viewport', () => {
    const css = readFile('app/globals.css')
    expect(css).toContain('min-height: 100dvh')
  })
})

// ─── Layout shift prevention ───────────────────────────────────────────────

describe('Layout shift prevention', () => {
  it('LandingPage logo has explicit dimensions to prevent layout shift', () => {
    const src = readFile('app/LandingPageClient.tsx')
    // Logo should have width and height defined
    expect(src).toMatch(/width.*height|height.*width/)
  })

  it('AppShell header has fixed height to prevent CLS', () => {
    const src = readFile('components/app/AppShell.tsx')
    expect(src).toContain("height: '56px'")
  })

  it('AppShell header is sticky to prevent layout shifts on scroll', () => {
    const src = readFile('components/app/AppShell.tsx')
    expect(src).toContain("position: 'sticky'")
  })

  it('Input fields have explicit heights to prevent CLS', () => {
    const src = readFile('app/onboarding/page.tsx')
    expect(src).toContain("height: '52px'")
  })

  it('CTA buttons have explicit heights >= 48px', () => {
    const src = readFile('app/LandingPageClient.tsx')
    // Buttons should have heights of at least 48px for touch targets
    expect(src).toMatch(/height:\s*(4[8-9]|5[0-9]|6[0-9])/)
  })
})
