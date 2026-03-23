/**
 * Playwright global setup
 *
 * Runs once before any test worker is spawned.  Use this file to:
 *   - Verify the dev server is healthy before wasting time on every test.
 *   - Seed any global state (e.g. storage state written to disk so tests can
 *     start pre-authenticated without repeating the login flow).
 *
 * @see https://playwright.dev/docs/test-global-setup-teardown
 */

import { chromium, FullConfig } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'
const MAX_RETRIES = 5
const RETRY_INTERVAL_MS = 2_000

/**
 * Poll the dev server until it responds with a 2xx or 3xx status, or until
 * MAX_RETRIES is exhausted.  Throws if the server never becomes reachable.
 */
async function waitForDevServer(): Promise<void> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(BASE_URL, { redirect: 'follow' })
      if (res.ok || (res.status >= 300 && res.status < 400)) {
        console.log(`[global-setup] Dev server is ready at ${BASE_URL}`)
        return
      }
      console.warn(
        `[global-setup] Dev server returned HTTP ${res.status} (attempt ${attempt}/${MAX_RETRIES})`
      )
    } catch {
      console.warn(
        `[global-setup] Dev server not yet reachable (attempt ${attempt}/${MAX_RETRIES})`
      )
    }

    if (attempt < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS))
    }
  }

  throw new Error(
    `[global-setup] Dev server at ${BASE_URL} did not become reachable after ${MAX_RETRIES} attempts. ` +
      'Run `npm run dev` and wait for it to compile before running Playwright.'
  )
}

/**
 * Capture authenticated storage state and persist it to disk.
 *
 * Because Lumira uses Supabase magic-link / Google OAuth, full browser-based
 * auth is not practical in CI without a real inbox.  Instead we inject a
 * test-only session cookie via the Supabase service-role key (set in
 * SUPABASE_SERVICE_ROLE_KEY + SUPABASE_TEST_USER_EMAIL env vars).
 *
 * If those env vars are absent the step is skipped and tests that need auth
 * must handle it themselves (e.g. via the `authenticatedPage` fixture).
 */
async function captureAuthStorageState(): Promise<void> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const testUserEmail = process.env.SUPABASE_TEST_USER_EMAIL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!serviceRoleKey || !testUserEmail || !supabaseUrl) {
    console.log(
      '[global-setup] Skipping auth storage state capture ' +
        '(SUPABASE_SERVICE_ROLE_KEY / SUPABASE_TEST_USER_EMAIL / NEXT_PUBLIC_SUPABASE_URL not set)'
    )
    return
  }

  // Exchange service-role credentials for a session token so that we can
  // set the Supabase auth cookies without a real email round-trip.
  let accessToken: string
  let refreshToken: string

  try {
    const signInRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        email: testUserEmail,
        password: process.env.SUPABASE_TEST_USER_PASSWORD ?? '',
      }),
    })

    if (!signInRes.ok) {
      console.warn(
        `[global-setup] Could not sign in test user (HTTP ${signInRes.status}). ` +
          'Auth storage state will not be saved.'
      )
      return
    }

    const json = (await signInRes.json()) as {
      access_token: string
      refresh_token: string
    }
    accessToken = json.access_token
    refreshToken = json.refresh_token
  } catch (err) {
    console.warn('[global-setup] Auth exchange request failed:', err)
    return
  }

  // Write the Supabase session tokens into browser storage so every test that
  // loads `storageState` starts already authenticated.
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto(BASE_URL)

  // Supabase SSR stores tokens in cookies named sb-<project-ref>-auth-token.*
  // Setting them via localStorage mirrors the JS-client behaviour.
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0]

  await page.evaluate(
    ({ projectRef, accessToken, refreshToken }) => {
      const sessionKey = `sb-${projectRef}-auth-token`
      const session = {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      }
      localStorage.setItem(sessionKey, JSON.stringify(session))
    },
    { projectRef, accessToken, refreshToken }
  )

  await context.storageState({ path: './__tests__/e2e/.auth/storage-state.json' })
  await browser.close()

  console.log('[global-setup] Auth storage state saved to __tests__/e2e/.auth/storage-state.json')
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------
export default async function globalSetup(config: FullConfig): Promise<void> {
  // 1. Confirm the dev server is alive (webServer in playwright.config.ts
  //    should have already started it, but we double-check here for clarity).
  await waitForDevServer()

  // 2. Optionally pre-authenticate so tests can reuse the session.
  await captureAuthStorageState()

  console.log('[global-setup] Setup complete.')
}
