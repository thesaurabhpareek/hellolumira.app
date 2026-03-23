/**
 * Custom Playwright fixtures for the Lumira e2e test suite.
 *
 * Usage in a spec file:
 *
 *   import { test, expect } from '../fixtures'
 *
 *   test('dashboard loads', async ({ authenticatedPage }) => {
 *     await authenticatedPage.goto('/home')
 *     await expect(authenticatedPage).toHaveTitle(/Lumira/)
 *   })
 *
 * Fixtures provided:
 *   - `authenticatedPage`  – Page with a mock Supabase auth session injected.
 *   - `darkModePage`       – Page with the dark-mode theme set in localStorage.
 *   - `mobilePage`         – Page locked to a 390×844 mobile viewport.
 *
 * Helper functions (exported separately):
 *   - `waitForNavigation`  – Wait for the Next.js router transition to settle.
 *   - `fillAndSubmit`      – Fill a form field and submit the nearest form.
 *   - `expectToastMessage` – Assert a toast / status message is visible.
 *   - `dismissModal`       – Click outside or press Escape to close a modal.
 */

import { test as base, expect, type Page, type BrowserContext } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LumiraFixtures = {
  /** A Playwright Page that already has a Supabase auth session set. */
  authenticatedPage: Page
  /** A Playwright Page with the dark-mode theme applied via localStorage. */
  darkModePage: Page
  /** A Playwright Page constrained to a 390×844 mobile viewport. */
  mobilePage: Page
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_URL = 'http://localhost:3000'

/** Path written by global-setup when real credentials are available. */
const AUTH_STORAGE_STATE_PATH = path.resolve(
  __dirname,
  '.auth',
  'storage-state.json'
)

const MOBILE_VIEWPORT = { width: 390, height: 844 }

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Inject a fake Supabase auth session directly into the browser's localStorage
 * so the app treats the page as authenticated without a real network round-trip.
 *
 * The mock session contains a JWT-shaped access_token that the Supabase JS
 * client stores under `sb-<project-ref>-auth-token`.  Because Lumira's
 * middleware calls `supabase.auth.getUser()` server-side (which hits the
 * Supabase REST API), this approach works best for tests that do NOT exercise
 * server-side auth guards.  For full stack auth tests prefer the real
 * storage state captured by global-setup.
 */
async function injectMockAuthSession(page: Page): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321'
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
  const sessionKey = `sb-${projectRef}-auth-token`

  // A minimal valid-looking (but not cryptographically real) access token
  // payload.  Tests that rely on server-side session validation should use
  // the real storage state from global-setup instead.
  const fakeAccessToken = [
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', // header
    btoa(
      JSON.stringify({
        sub: 'test-user-00000000-0000-0000-0000-000000000000',
        email: 'e2e-test@lumira.test',
        role: 'authenticated',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
        aud: 'authenticated',
      })
    ).replace(/=/g, ''), // payload (base64url, no padding)
    'mock-signature',    // signature (ignored client-side)
  ].join('.')

  const mockSession = {
    access_token: fakeAccessToken,
    refresh_token: 'mock-refresh-token-for-e2e',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: {
      id: 'test-user-00000000-0000-0000-0000-000000000000',
      email: 'e2e-test@lumira.test',
      role: 'authenticated',
      app_metadata: { provider: 'email' },
      user_metadata: { first_name: 'Test', last_name: 'User' },
    },
  }

  await page.evaluate(
    ({ sessionKey, mockSession }) => {
      localStorage.setItem(sessionKey, JSON.stringify(mockSession))
    },
    { sessionKey, mockSession }
  )
}

/**
 * Apply the dark-mode theme token to `localStorage` and `document` so
 * components that read `data-theme` or check `prefers-color-scheme` via JS
 * get a consistent dark context.
 */
async function applyDarkMode(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.setItem('lumira-theme', 'dark')
    document.documentElement.setAttribute('data-theme', 'dark')
    document.documentElement.classList.add('dark')
  })
}

// ---------------------------------------------------------------------------
// Extended test object with custom fixtures
// ---------------------------------------------------------------------------

export const test = base.extend<LumiraFixtures>({
  // -------------------------------------------------------------------------
  // authenticatedPage
  // -------------------------------------------------------------------------
  authenticatedPage: async ({ browser }, use) => {
    // Prefer the real auth storage state captured during global-setup (it
    // contains genuine Supabase cookies and passes server-side auth checks).
    const storageStateExists = fs.existsSync(AUTH_STORAGE_STATE_PATH)

    const context: BrowserContext = await browser.newContext(
      storageStateExists
        ? { storageState: AUTH_STORAGE_STATE_PATH }
        : {}
    )

    const page = await context.newPage()

    // Navigate to the base URL so localStorage is scoped to the right origin.
    await page.goto(BASE_URL)

    // If we don't have a real storage state, inject a mock session token so
    // at least client-side auth guards pass (e.g. components that read from
    // the Supabase JS client).
    if (!storageStateExists) {
      await injectMockAuthSession(page)
    }

    await use(page)
    await context.close()
  },

  // -------------------------------------------------------------------------
  // darkModePage
  // -------------------------------------------------------------------------
  darkModePage: async ({ browser }, use) => {
    // Use prefers-color-scheme: dark so CSS media queries also pick up the
    // dark theme without relying solely on the localStorage flag.
    const context: BrowserContext = await browser.newContext({
      colorScheme: 'dark',
    })

    const page = await context.newPage()

    // Navigate first so localStorage writes go to the correct origin.
    await page.goto(BASE_URL)
    await applyDarkMode(page)

    await use(page)
    await context.close()
  },

  // -------------------------------------------------------------------------
  // mobilePage
  // -------------------------------------------------------------------------
  mobilePage: async ({ browser }, use) => {
    const context: BrowserContext = await browser.newContext({
      viewport: MOBILE_VIEWPORT,
      // Simulate a mid-range Android device user-agent so the app's mobile
      // detection logic (if any) is exercised consistently.
      userAgent:
        'Mozilla/5.0 (Linux; Android 13; Pixel 6) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      isMobile: true,
      hasTouch: true,
    })

    const page = await context.newPage()

    await use(page)
    await context.close()
  },
})

// Re-export `expect` so consumers only need to import from this module.
export { expect }

// ---------------------------------------------------------------------------
// Shared helper functions
// ---------------------------------------------------------------------------

/**
 * Wait for a Next.js client-side navigation to complete.
 *
 * Playwright's built-in `page.waitForURL` is usually sufficient, but this
 * helper additionally waits for the network to go idle so dynamic data is
 * fetched before assertions run.
 *
 * @param page    The Playwright Page instance.
 * @param urlOrPattern  A string, RegExp, or predicate matching the expected URL.
 */
export async function waitForNavigation(
  page: Page,
  urlOrPattern: string | RegExp | ((url: URL) => boolean)
): Promise<void> {
  await page.waitForURL(urlOrPattern, { waitUntil: 'networkidle' })
}

/**
 * Fill a form field identified by `label` (accessible label or placeholder)
 * and, optionally, submit the closest `<form>` element.
 *
 * @param page    The Playwright Page instance.
 * @param label   Accessible label, placeholder, or aria-label for the input.
 * @param value   Text to type into the field.
 * @param submit  Whether to press Enter / click the submit button afterwards.
 */
export async function fillAndSubmit(
  page: Page,
  label: string,
  value: string,
  submit = false
): Promise<void> {
  // Try accessible label first, then placeholder as fallback.
  const field =
    page.getByLabel(label).first() ??
    page.getByPlaceholder(label).first()

  await field.fill(value)

  if (submit) {
    await field.press('Enter')
  }
}

/**
 * Assert that a visible toast / alert / status message contains `text`.
 *
 * Lumira uses `role="status"` (success), `role="alert"` (error), and
 * `aria-live` regions for feedback.  This helper checks all of them.
 *
 * @param page  The Playwright Page instance.
 * @param text  Substring or RegExp expected inside the message.
 */
export async function expectToastMessage(
  page: Page,
  text: string | RegExp
): Promise<void> {
  const matcher = typeof text === 'string' ? new RegExp(text, 'i') : text

  // Look for ARIA live regions that Lumira uses for user feedback.
  const message = page
    .locator('[role="status"], [role="alert"], [aria-live]')
    .filter({ hasText: matcher })
    .first()

  await expect(message).toBeVisible({ timeout: 8_000 })
}

/**
 * Dismiss the currently open modal / dialog by pressing Escape.
 * Falls back to clicking the document body outside the modal.
 *
 * @param page  The Playwright Page instance.
 */
export async function dismissModal(page: Page): Promise<void> {
  await page.keyboard.press('Escape')

  // Give the close animation a moment to finish before the caller proceeds.
  await page.waitForTimeout(300)
}

/**
 * Click a navigation link by its visible text and wait for the URL to change.
 *
 * @param page     The Playwright Page instance.
 * @param linkText Exact visible text of the `<a>` or button.
 * @param expectedUrl  URL (string or pattern) to wait for after the click.
 */
export async function clickNavLink(
  page: Page,
  linkText: string,
  expectedUrl: string | RegExp
): Promise<void> {
  await page.getByRole('link', { name: linkText }).click()
  await waitForNavigation(page, expectedUrl)
}
