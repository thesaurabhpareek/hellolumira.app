import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for Lumira e2e test suite.
 *
 * Browsers:
 *   General cross-browser projects: Chromium, Firefox, Edge, WebKit
 *   Chrome-specific projects (targeted by chrome.spec.ts):
 *     chrome-desktop      — 1280 × 800, Desktop Chrome, for CSS / dark-mode / perf tests
 *     chrome-pixel5       — Pixel 5 (393 × 851), Android Chrome emulation, touch enabled
 *     chrome-iphone12     — 390 × 844, Chrome Mobile UA on Chromium engine, touch enabled
 *     chrome-mobile-375   — 375 × 812, generic narrow mobile, touch enabled
 *
 * The Next.js dev server is started automatically before the test run when
 * it is not already listening on port 3000.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Directory that contains all e2e specs
  testDir: './__tests__/e2e',

  // Maximum time one test can run
  timeout: 30_000,

  // Shared expect timeout
  expect: {
    timeout: 5_000,
  },

  // Fail the build on CI if you accidentally left a test.only
  forbidOnly: !!process.env.CI,

  // Retry on CI to absorb transient flakiness; no retries locally
  retries: process.env.CI ? 2 : 0,

  // Run test files in parallel (workers scale to available CPUs by default)
  fullyParallel: true,

  // Reporter: HTML report for easy browsing; also dots on CI for concise logs
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['dot']]
    : [['html', { open: 'on-failure' }]],

  // Global settings shared across all projects
  use: {
    // All requests are relative to this origin
    baseURL: 'http://localhost:3000',

    // Capture a screenshot whenever a test fails
    screenshot: 'only-on-failure',

    // Record a video on the first retry so failures are easier to diagnose
    video: 'on-first-retry',

    // Collect traces on the first retry for timeline / network inspection
    trace: 'on-first-retry',
  },

  // ---------------------------------------------------------------------------
  // Browser projects
  // ---------------------------------------------------------------------------
  projects: [
    // ── Cross-browser projects (run all specs) ────────────────────────────────

    // -- Desktop Chromium ----------------------------------------------------
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // -- Desktop Firefox -----------------------------------------------------
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    // -- Desktop Microsoft Edge (Chromium) -----------------------------------
    {
      name: 'msedge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },

    // -- Mobile Chromium (Pixel 5) -------------------------------------------
    {
      name: 'chromium-mobile',
      use: { ...devices['Pixel 5'] },
    },

    // -- WebKit – iPhone 12 --------------------------------------------------
    {
      name: 'webkit',
      use: { ...devices['iPhone 12'] },
    },

    // -- WebKit – iPad -------------------------------------------------------
    {
      name: 'webkit-ipad',
      use: { ...devices['iPad Pro 11'] },
    },

    // ── Chrome-specific projects (targeted by __tests__/e2e/chrome.spec.ts) ──
    // Run only these with:
    //   npx playwright test chrome.spec.ts --project=chrome-desktop
    //   npx playwright test chrome.spec.ts --project=chrome-pixel5
    //   npx playwright test chrome.spec.ts --project=chrome-iphone12
    //   npx playwright test chrome.spec.ts --project=chrome-mobile-375
    // Or run all four at once:
    //   npx playwright test chrome.spec.ts --project=chrome-desktop --project=chrome-pixel5 \
    //       --project=chrome-iphone12 --project=chrome-mobile-375

    // -- Desktop Chrome 1280 × 800 -------------------------------------------
    {
      name: 'chrome-desktop',
      use: {
        ...devices['Desktop Chrome'],
        // Explicit viewport so tests know exactly what size to expect
        viewport: { width: 1280, height: 800 },
        // Enable backdrop-filter support (on by default in modern headless Chrome)
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            // Ensure CSS backdrop-filter is not disabled in headless mode
            '--enable-features=CSSBackdropFilter',
          ],
        },
      },
    },

    // -- Mobile Chrome – Pixel 5 (393 × 851, Android, touch) ----------------
    {
      name: 'chrome-pixel5',
      use: {
        // devices['Pixel 5'] already sets:
        //   browserName: 'chromium', isMobile: true, hasTouch: true,
        //   viewport: { width: 393, height: 851 }, deviceScaleFactor: 2.75
        ...devices['Pixel 5'],
        launchOptions: {
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-features=CSSBackdropFilter'],
        },
      },
    },

    // -- Mobile Chrome – iPhone 12 form factor (390 × 844, Chrome Mobile UA) -
    {
      name: 'chrome-iphone12',
      use: {
        // We use the iPhone 12 viewport/dpr from devices but force Chromium
        // (not WebKit) so we test Chrome-specific behaviour at iPhone proportions.
        ...devices['iPhone 12'],
        browserName: 'chromium',
        isMobile: true,
        hasTouch: true,
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        // Override the default WebKit UA with a Chrome Mobile UA so the app
        // does not apply any browser-sniffed WebKit-only code paths.
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 15_5 like Mac OS X) ' +
          'AppleWebKit/537.36 (KHTML, like Gecko) ' +
          'CriOS/116.0.5845.118 Mobile/15E148 Safari/604.1',
        launchOptions: {
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-features=CSSBackdropFilter'],
        },
      },
    },

    // -- Mobile Chrome – narrow 375 × 812 (iPhone SE / X form factor) --------
    {
      name: 'chrome-mobile-375',
      use: {
        browserName: 'chromium',
        viewport: { width: 375, height: 812 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2,
        userAgent:
          'Mozilla/5.0 (Linux; Android 11; Mobile) ' +
          'AppleWebKit/537.36 (KHTML, like Gecko) ' +
          'Chrome/116.0.0.0 Mobile Safari/537.36',
        launchOptions: {
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-features=CSSBackdropFilter'],
        },
      },
    },
  ],

  // ---------------------------------------------------------------------------
  // Dev server
  // Start the Next.js dev server automatically when tests run.
  // Playwright waits until the URL is reachable before proceeding.
  // ---------------------------------------------------------------------------
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    // Reuse a server that is already running (avoids double-start in watch mode)
    reuseExistingServer: !process.env.CI,
    // Give Next.js up to 60 s to compile on a cold start
    timeout: 60_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
