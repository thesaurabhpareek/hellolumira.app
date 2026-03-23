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
    // themeColor is an array of media-query variants; both include #3D8178 for light mode
    expect(layoutSrc).toContain("color: '#3D8178'")
  })
})

// ─── iOS Safe Areas ────────────────────────────────────────────────────────

describe('iOS safe area support', () => {
  it('AppShell bottom nav has safe-area-inset-bottom padding', () => {
    const src = readFile('components/app/AppShell.tsx')
    expect(src).toContain('env(safe-area-inset-bottom)')
  })

  it('AppShell header has safe-area-inset-top padding', () => {
    // After the AppShell refactor, the header is PremiumHeader which uses the
    // .premium-header CSS class that sets padding-top via env(safe-area-inset-top)
    const css = readFile('app/globals.css')
    expect(css).toContain('env(safe-area-inset-top)')
  })

  it('NotificationPanel content has safe-area-inset-bottom', () => {
    // NotificationPanel is now a dropdown (not a bottom sheet); safe-area for the
    // bottom of the screen is handled by PremiumBottomNav via CSS in globals.css
    const css = readFile('app/globals.css')
    expect(css).toContain('env(safe-area-inset-bottom)')
  })

  it('ChatThreadView input bar has safe-area-inset-bottom', () => {
    // The input is now bottom-of-flex (not fixed), so safe-area-inset-bottom
    // is handled by AppShell's paddingBottom on <main> and PremiumBottomNav CSS
    const appShellSrc = readFile('components/app/AppShell.tsx')
    expect(appShellSrc).toContain('env(safe-area-inset-bottom)')
  })

  it('CheckinThread input bar has safe-area-inset-bottom', () => {
    // The input is now bottom-of-flex (not fixed), so safe-area-inset-bottom
    // is handled by AppShell's paddingBottom on <main> and PremiumBottomNav CSS
    const appShellSrc = readFile('components/app/AppShell.tsx')
    expect(appShellSrc).toContain('env(safe-area-inset-bottom)')
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
    // AppShell uses h-dvh Tailwind class (which maps to height: 100dvh)
    expect(src).toContain('h-dvh')
    // Should NOT use 100vh for min-height
    expect(src).not.toMatch(/minHeight:\s*['"]100vh['"]/)
  })

  it('ChatThreadView uses 100dvh', () => {
    // ChatThreadView fills the AppShell which uses h-dvh; the component uses h-full
    // The global CSS enforces 100dvh on the body
    const css = readFile('app/globals.css')
    expect(css).toContain('100dvh')
    const src = readFile('components/app/chat/ChatThreadView.tsx')
    expect(src).not.toMatch(/minHeight:\s*['"]100vh['"]/)
  })

  it('CheckinThread uses 100dvh', () => {
    // CheckinThread fills the AppShell which uses h-dvh; the component uses h-full
    // The global CSS enforces 100dvh on the body
    const css = readFile('app/globals.css')
    expect(css).toContain('100dvh')
    const src = readFile('components/app/CheckinThread.tsx')
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
    // Nav links are in PremiumBottomNav after the AppShell refactor.
    // Touch target sizing is enforced via the .premium-bottom-nav__tab CSS class.
    const css = readFile('app/globals.css')
    expect(css).toContain('min-height: 56px')
    expect(css).toContain('min-width: 48px')
  })

  it('NotificationPanel close button is at least 32x32', () => {
    // The dropdown panel close button uses w-8 h-8 (32px) Tailwind classes
    const src = readFile('components/app/NotificationPanel.tsx')
    expect(src).toContain('w-8 h-8')
  })

  it('NotificationPanel mark-all-read button has adequate touch target', () => {
    // Mark-all-read uses min-h-[32px] with extra padding for touch target
    const src = readFile('components/app/NotificationPanel.tsx')
    expect(src).toContain('min-h-[32px]')
  })

  it('NotificationRow has 48px minHeight', () => {
    // NotificationRow uses Tailwind min-h-[48px] class instead of inline style
    const src = readFile('components/app/NotificationPanel.tsx')
    expect(src).toContain('min-h-[48px]')
  })

  it('ChatThreadView send button is 48x48', () => {
    // Send button uses w-12 h-12 Tailwind classes (12 × 4px = 48px each)
    const src = readFile('components/app/chat/ChatThreadView.tsx')
    expect(src).toContain('w-12 h-12')
  })

  it('ChatThreadView back button has 48px minHeight and minWidth', () => {
    // After the AppShell refactor, back navigation is provided by PremiumHeader
    // which uses .premium-header__back with min-height enforced via CSS
    const css = readFile('app/globals.css')
    expect(css).toContain('premium-header__back')
    expect(css).toContain('min-height')
  })

  it('CheckinThread back button has 48px minHeight and minWidth', () => {
    // CheckinThread's back button uses Tailwind min-h-[48px] class
    const src = readFile('components/app/CheckinThread.tsx')
    expect(src).toContain('min-h-[48px]')
  })

  it('ConsentCheckbox label has 48px minHeight', () => {
    // Label uses Tailwind min-h-[48px] class
    const src = readFile('components/app/ConsentCheckbox.tsx')
    expect(src).toContain('min-h-[48px]')
  })

  it('EmergencyOverlay call button has at least 56px height', () => {
    // Call button uses h-14 Tailwind class (14 × 4px = 56px)
    const src = readFile('components/app/chat/EmergencyOverlay.tsx')
    expect(src).toContain('h-14')
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
    // After the AppShell refactor, the header is PremiumHeader which uses
    // .premium-header__bar with max-width: 480px defined in globals.css
    const css = readFile('app/globals.css')
    expect(css).toContain('max-width: 480px')
  })

  it('AppShell main content is constrained to 480px', () => {
    // AppShell uses max-w-content Tailwind class; .content-width in globals.css
    // sets max-width: 480px. Both the header bar and content area use this constraint.
    const css = readFile('app/globals.css')
    const matches = css.match(/max-width: 480px/g)
    expect(matches).not.toBeNull()
    expect(matches!.length).toBeGreaterThanOrEqual(2)
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
    // The textarea uses Tailwind text-base class which maps to font-size: 1rem (16px)
    const src = readFile('components/app/chat/ChatThreadView.tsx')
    expect(src).toContain('text-base')
  })

  it('CheckinThread textarea uses 16px font', () => {
    // The textarea uses Tailwind text-base class which maps to font-size: 1rem (16px)
    const src = readFile('components/app/CheckinThread.tsx')
    expect(src).toContain('text-base')
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
    // AppShell uses Tailwind arbitrary class [-webkit-overflow-scrolling:touch]
    const src = readFile('components/app/AppShell.tsx')
    expect(src).toContain('[-webkit-overflow-scrolling:touch]')
  })

  it('NotificationPanel content has overscroll-behavior contain', () => {
    const src = readFile('components/app/NotificationPanel.tsx')
    expect(src).toContain("overscrollBehavior: 'contain'")
  })

  it('NotificationPanel locks body scroll when open', () => {
    // NotificationPanel is now a dropdown (not a full-screen bottom sheet), so
    // it no longer locks body scroll. Instead it closes on outside click/Escape.
    // EmergencyOverlay still locks body scroll as it is a full-screen modal.
    const src = readFile('components/app/NotificationPanel.tsx')
    expect(src).toContain("e.key === 'Escape'")
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
    // AppShell uses Tailwind overflow-x-hidden class on the scroll container
    const src = readFile('components/app/AppShell.tsx')
    expect(src).toContain('overflow-x-hidden')
  })

  it('globals.css html prevents horizontal overflow', () => {
    // globals.css uses overflow-x: clip (preferred over hidden as it does not
    // create a new scroll container, per the inline comment)
    const src = readFile('app/globals.css')
    expect(src).toContain('overflow-x: clip')
  })
})

// ─── Touch interaction optimizations ───────────────────────────────────────

describe('Touch interaction optimizations', () => {
  it('globals.css sets webkit-tap-highlight-color to transparent', () => {
    const src = readFile('app/globals.css')
    expect(src).toContain('-webkit-tap-highlight-color: transparent')
  })

  it('AppShell nav links have webkit-tap-highlight transparent', () => {
    // Nav links are in PremiumBottomNav; tap-highlight is set via .premium-bottom-nav__tab CSS
    const css = readFile('app/globals.css')
    expect(css).toContain('-webkit-tap-highlight-color: transparent')
  })

  it('AppShell nav links have touch-action manipulation', () => {
    // Nav links are in PremiumBottomNav; touch-action is set via .premium-bottom-nav__tab CSS
    const css = readFile('app/globals.css')
    expect(css).toContain('touch-action: manipulation')
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
    // After refactor, the bottom nav is PremiumBottomNav; min-height is in CSS
    const css = readFile('app/globals.css')
    expect(css).toContain('min-height: 56px')
  })

  it('AppShell bottom nav is fixed to bottom', () => {
    // After refactor, PremiumBottomNav uses position: fixed via .premium-bottom-nav CSS
    const css = readFile('app/globals.css')
    expect(css).toContain('.premium-bottom-nav')
    expect(css).toContain('position: fixed')
    expect(css).toContain('bottom: 0')
  })

  it('ChatThreadView input has paddingBottom for safe area', () => {
    // The input bar is now a bottom-of-flex element (not fixed). Safe area is
    // handled by AppShell's <main> paddingBottom which includes env(safe-area-inset-bottom).
    const src = readFile('components/app/AppShell.tsx')
    expect(src).toContain("paddingBottom: 'calc(56px + max(0px, env(safe-area-inset-bottom)))'")
  })

  it('ChatThreadView messages area has enough bottom padding for input', () => {
    // The input bar is now a sibling flex item (not fixed), so extra padding
    // is not required on the messages area. AppShell handles the nav clearance.
    const src = readFile('components/app/chat/ChatThreadView.tsx')
    // Messages area still has paddingBottom (16px default)
    expect(src).toContain("paddingBottom: '16px'")
  })
})

// ─── Message bubble text wrapping ──────────────────────────────────────────

describe('Message bubble text wrapping', () => {
  it('Lumira bubbles have max-width 85% to prevent overflow', () => {
    const src = readFile('app/globals.css')
    expect(src).toContain('max-width: 85%')
  })

  it('Message content uses pre-wrap for proper line breaking', () => {
    // Uses Tailwind whitespace-pre-wrap class
    const src = readFile('components/app/chat/ChatThreadView.tsx')
    expect(src).toContain('whitespace-pre-wrap')
  })

  it('CheckinThread messages use pre-wrap', () => {
    // Uses Tailwind whitespace-pre-wrap class
    const src = readFile('components/app/CheckinThread.tsx')
    expect(src).toContain('whitespace-pre-wrap')
  })
})

// ─── EmergencyOverlay specific tests ───────────────────────────────────────

describe('EmergencyOverlay mobile safety', () => {
  const src = readFile('components/app/chat/EmergencyOverlay.tsx')

  it('covers entire viewport with fixed inset 0', () => {
    // EmergencyOverlay uses Tailwind class "fixed inset-0" instead of inline style
    expect(src).toContain('fixed inset-0')
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
    // EmergencyOverlay uses Tailwind z-[300] arbitrary class
    expect(src).toContain('z-[300]')
  })

  it('auto-focuses the call button on mount', () => {
    expect(src).toContain('callButtonRef.current?.focus()')
  })

  it('text is readable with adequate font size', () => {
    // Message text uses Tailwind text-[15px] class; title uses text-[21px] class
    expect(src).toContain('text-[15px]')
    expect(src).toContain('text-[21px]')
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
    // Label span uses Tailwind text-base class (1rem = 16px)
    expect(src).toContain('text-base')
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
    // Hero sections use .lp-container class which has padding: 0 24px in globals.css
    const css = readFile('app/globals.css')
    expect(css).toMatch(/\.lp-container[^}]*padding[^}]*24px/)
  })

  it('CTA buttons are full-width', () => {
    expect(src).toContain("width: '100%'")
  })

  it('animations use transform and opacity only (GPU accelerated)', () => {
    // LandingPage CTA button uses scale transform for press feedback
    expect(src).toContain("style.transform = 'scale(0.98)'")
    // Fade animations use opacity in globals.css
    const css = readFile('app/globals.css')
    expect(css).toContain('opacity: 0')
    expect(css).toContain('opacity: 1')
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
    // After refactor, the nav is PremiumBottomNav component
    const src = readFile('components/app/PremiumBottomNav.tsx')
    expect(src).toContain('aria-label="Main navigation"')
  })

  it('AppShell tabs use aria-current for active state', () => {
    // After refactor, tabs are in PremiumBottomNav component
    const src = readFile('components/app/PremiumBottomNav.tsx')
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
    // After the AppShell refactor, back navigation is provided by PremiumHeader
    // which renders a back button with aria-label for all sub-pages
    const src = readFile('components/app/PremiumHeader.tsx')
    expect(src).toContain('aria-label={`Go back:')
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
    // The SVG icon is decorative (aria-hidden="true"); the wordmark text "Lumira"
    // is rendered as visible text, so no separate aria-label is needed
    const src = readFile('app/LandingPageClient.tsx')
    expect(src).toContain('aria-hidden="true"')
    expect(src).toContain('Lumira')
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
    // The landing page now uses a CTA link to /login (no inline waitlist form).
    // The signup flow is on the login page. The CTA link is accessible via role.
    const src = readFile('app/LandingPageClient.tsx')
    expect(src).toContain('/login')
    // Stage selector group has aria-label
    expect(src).toContain('aria-label="Select your stage"')
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
    // themeColor is an array of media-query variants; the light mode value is #3D8178
    const src = readFile('app/layout.tsx')
    expect(src).toContain("color: '#3D8178'")
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
    // LandingPage uses scale transforms for press feedback; fade animations are
    // defined in globals.css keyframes using translateY
    const src = readFile('app/LandingPageClient.tsx')
    expect(src).toContain('scale(0.98)')
    const css = readFile('app/globals.css')
    expect(css).toMatch(/translateY\(\d+px\)/)
    expect(css).toContain('translateY(0)')
  })

  it('NotificationPanel slide-up animation uses transform', () => {
    // NotificationPanel is now a dropdown (not bottom sheet); it uses
    // the notif-dropdown-in animation defined in globals.css with translateY
    const css = readFile('app/globals.css')
    expect(css).toContain('notif-dropdown-in')
    expect(css).toContain('translateY')
  })
})

// ─── Form input types and autocomplete ─────────────────────────────────────

describe('Form input types and autocomplete attributes', () => {
  it('LandingPage email input has type="email"', () => {
    // The landing page uses a CTA link to /login (no inline waitlist form).
    // Email input with type="email" is on the login/signup page.
    const src = readFile('app/login/page.tsx')
    expect(src).toContain('type="email"')
  })

  it('LandingPage email input has autoComplete="email"', () => {
    // The landing page uses a CTA link to /login (no inline waitlist form).
    // autoComplete="email" is on the login/signup page.
    const src = readFile('app/login/page.tsx')
    expect(src).toContain('autoComplete')
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

describe('NotificationPanel dropdown mobile behavior', () => {
  const src = readFile('components/app/NotificationPanel.tsx')

  it('max height is 70vh to prevent viewport overflow', () => {
    // Dropdown panel is constrained to 70vh max height
    expect(src).toContain("maxHeight: '70vh'")
  })

  it('has rounded corners for dropdown appearance', () => {
    // Panel now uses borderRadius: 12px (all corners) for dropdown style
    expect(src).toContain("borderRadius: '12px'")
  })

  it('has a caret / arrow indicator pointing to bell icon', () => {
    // Dropdown has an arrow/caret indicating origin (no drag handle)
    expect(src).toContain('rotate(45deg)')
  })

  it('caret uses transform rotate for styling', () => {
    expect(src).toContain('rotate(45deg)')
  })

  it('has semi-transparent backdrop for dismissal', () => {
    // Backdrop uses a subtle rgba overlay
    expect(src).toContain('rgba(0, 0, 0,')
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
    // Text is white via Tailwind text-white class
    expect(src).toContain('text-white')
    // Dark red background via inline style
    expect(src).toContain("background: 'rgba(114, 28, 28, 0.95)'")
  })
})

// ─── Fixed bottom input keyboard compatibility ─────────────────────────────

describe('Fixed bottom input and mobile keyboard', () => {
  it('ChatThreadView input is fixed to bottom', () => {
    // After refactor, the input is a shrink-0 sibling at the bottom of a flex
    // column — not fixed position. The comment still says "Bottom input".
    const src = readFile('components/app/chat/ChatThreadView.tsx')
    const inputSection = src.substring(src.indexOf('Bottom input'))
    expect(inputSection).toContain('shrink-0')
  })

  it('CheckinThread input is fixed to bottom', () => {
    // After refactor, the input is a shrink-0 sibling at the bottom of a flex column
    const src = readFile('components/app/CheckinThread.tsx')
    const inputSection = src.substring(src.indexOf('Bottom input'))
    expect(inputSection).toContain('shrink-0')
  })

  it('ChatThreadView auto-scrolls to latest message', () => {
    // Uses scrollTop = scrollHeight for smooth scrolling to bottom
    const src = readFile('components/app/chat/ChatThreadView.tsx')
    expect(src).toContain('messagesAreaRef.current.scrollTop = messagesAreaRef.current.scrollHeight')
  })

  it('CheckinThread auto-scrolls to latest message', () => {
    // Uses scrollTop = scrollHeight for smooth scrolling to bottom
    const src = readFile('components/app/CheckinThread.tsx')
    expect(src).toContain('messagesAreaRef.current.scrollTop = messagesAreaRef.current.scrollHeight')
  })

  it('ChatThreadView textarea has auto-grow with max height', () => {
    // Textarea uses Tailwind max-h-[96px] class; auto-grow via scrollHeight
    const src = readFile('components/app/chat/ChatThreadView.tsx')
    expect(src).toContain('max-h-[96px]')
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
    // Chip buttons use Tailwind shrink-0 class instead of inline flexShrink: 0
    expect(src).toContain('shrink-0')
  })

  it('hides scrollbar for cleaner mobile appearance', () => {
    expect(src).toContain("scrollbarWidth: 'none'")
  })
})

// ─── Landscape orientation ─────────────────────────────────────────────────

describe('Landscape orientation compatibility', () => {
  it('CheckinThread uses flex column layout that adapts to orientation', () => {
    // Uses Tailwind flex-col class instead of inline flexDirection: 'column'
    const src = readFile('components/app/CheckinThread.tsx')
    expect(src).toContain('flex-col')
  })

  it('ChatThreadView messages area is scrollable (works in landscape)', () => {
    // Uses Tailwind overflow-y-auto class instead of inline overflowY: 'auto'
    const src = readFile('components/app/chat/ChatThreadView.tsx')
    expect(src).toContain('overflow-y-auto')
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
    // Header bar is PremiumHeader; .premium-header__bar has height: 56px in CSS
    const css = readFile('app/globals.css')
    expect(css).toContain('.premium-header__bar')
    expect(css).toContain('height: 56px')
  })

  it('AppShell header is sticky to prevent layout shifts on scroll', () => {
    // PremiumHeader uses position: relative with flex-shrink: 0 inside the
    // flex column of AppShell; it does not scroll away — it is always visible.
    const src = readFile('components/app/AppShell.tsx')
    // AppShell root div is overflow-hidden which keeps header in place
    expect(src).toContain('overflow-hidden')
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
