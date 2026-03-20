// app/legal/cookies/page.tsx — Cookie Policy
import type { Metadata } from 'next'
import { LEGAL_VERSIONS, formatLegalDate } from '@/lib/legal-content'

export const metadata: Metadata = {
  title: 'Cookie Policy — Lumira',
  description: 'How Lumira uses cookies. We use only essential session cookies — no tracking, no advertising.',
}

export default function CookiePolicyPage() {
  const v = LEGAL_VERSIONS.cookies
  return (
    <>
      <h1 className="legal-h1">Cookie Policy</h1>
      <div className="legal-meta">
        <span>Effective: {formatLegalDate(v.effectiveDate)}</span>
        <span>Version {v.version}</span>
        <span>Last updated: {formatLegalDate(v.lastUpdated)}</span>
      </div>

      {/* ─── Introduction ─── */}
      <section className="legal-section">
        <div className="legal-body">
          <p>
            This Cookie Policy explains what cookies are, what cookies Lumira uses, and how you can control them.
            Lumira takes a minimal approach to cookies: we use only the cookies that are strictly necessary to
            operate the Service. We do not use tracking cookies, advertising cookies, or any cookies that profile
            your behaviour across other websites.
          </p>
          <p>
            This policy applies to the Lumira web application at{' '}
            <a href="https://hellolumira.app">hellolumira.app</a> and supplements our{' '}
            <a href="/legal/privacy">Privacy Policy</a>.
          </p>
        </div>
      </section>

      {/* ─── 1. What Are Cookies ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">1. What Are Cookies?</h2>
        <div className="legal-body">
          <p>
            Cookies are small text files that a website stores on your device when you visit. They are widely used
            to make websites work, or work more efficiently, and to remember your preferences. Cookies can be
            &ldquo;session cookies&rdquo; (deleted when you close your browser) or &ldquo;persistent cookies&rdquo;
            (stored for a defined period).
          </p>
          <p>
            Cookies are set either by the website you are visiting (&ldquo;first-party cookies&rdquo;) or by
            third-party services embedded on that website (&ldquo;third-party cookies&rdquo;). Lumira sets only
            first-party cookies and uses no third-party cookies.
          </p>
        </div>
      </section>

      {/* ─── 2. Cookies We Use ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">2. Cookies We Use</h2>
        <div className="legal-body">
          <p>
            Lumira uses <strong>one category of cookies</strong>: strictly necessary session cookies. These are
            required for the Service to function and cannot be switched off without breaking the application.
          </p>

          <table className="legal-table">
            <thead>
              <tr>
                <th>Cookie name</th>
                <th>Type</th>
                <th>Duration</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>sb-{'{project}'}-auth-token</code></td>
                <td>Session / Authentication</td>
                <td>Up to 1 hour (access token); up to 7 days (refresh token)</td>
                <td>
                  Keeps you signed in to Lumira. Set by Supabase Auth when you authenticate via magic link.
                  The access token expires after 1 hour and is refreshed automatically using the refresh token
                  if you are still active. The refresh token expires after 7 days of inactivity.
                </td>
              </tr>
              <tr>
                <td><code>sb-{'{project}'}-auth-token-code-verifier</code></td>
                <td>Session / Security</td>
                <td>Session (deleted on browser close)</td>
                <td>
                  Used during the PKCE (Proof Key for Code Exchange) OAuth flow to verify that the magic link
                  was initiated by the same browser session. Prevents authorisation code interception attacks.
                  Deleted immediately after authentication completes.
                </td>
              </tr>
            </tbody>
          </table>

          <div className="legal-disclaimer-ai" style={{ marginTop: '24px' }}>
            <p><strong>No tracking. No advertising. No profiling.</strong></p>
            <p style={{ marginTop: '8px' }}>
              Lumira does not use Google Analytics, Meta Pixel, or any other advertising or analytics tracking
              cookies. We do not use cookies to build profiles of your behaviour across other websites. We do not
              share cookie data with advertisers, data brokers, or any third parties for commercial purposes.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 3. Cookies We Do NOT Use ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">3. Cookies We Do Not Use</h2>
        <div className="legal-body">
          <p>For absolute clarity, Lumira does <strong>not</strong> use:</p>
          <ul>
            <li><strong>Analytics cookies</strong> (e.g., Google Analytics, Mixpanel, Amplitude via cookies)</li>
            <li><strong>Advertising cookies</strong> (e.g., Meta Pixel, Google Ads, DoubleClick)</li>
            <li><strong>Functional / preference cookies</strong> (we store preferences in your account profile in our database, not in cookies)</li>
            <li><strong>Cross-site tracking cookies</strong></li>
            <li><strong>Third-party cookies</strong> of any kind</li>
            <li><strong>Fingerprinting</strong> or any cookie-equivalent tracking mechanism</li>
          </ul>
          <p>
            We collect certain usage data (such as which features you use and when) for product analytics, but
            this data is stored server-side in our own database and tied to your authenticated session — not via
            client-side tracking cookies. See our <a href="/legal/privacy">Privacy Policy</a> for full details.
          </p>
        </div>
      </section>

      {/* ─── 4. Local Storage ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">4. Local Storage &amp; Session Storage</h2>
        <div className="legal-body">
          <p>
            In addition to cookies, Lumira uses browser <strong>localStorage</strong> and{' '}
            <strong>sessionStorage</strong> to improve performance. These are not cookies — they cannot be sent
            to servers automatically and are read only by Lumira&apos;s own JavaScript. We store:
          </p>
          <ul>
            <li>
              <strong>Auth session tokens</strong> — The Supabase Auth client stores your session tokens in
              localStorage as a fallback when cookies are unavailable (e.g., in some Safari configurations).
              This data is the same as the cookie-based session described in Section 2.
            </li>
            <li>
              <strong>UI state</strong> — Temporary interface state such as which check-in step you are on,
              to prevent data loss if you accidentally navigate away. This data is transient and never sent
              to our servers.
            </li>
          </ul>
          <p>
            localStorage data persists until you clear your browser&apos;s site data or sign out of Lumira.
            sessionStorage data is deleted when you close the browser tab.
          </p>
        </div>
      </section>

      {/* ─── 5. Managing Cookies ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">5. Managing &amp; Deleting Cookies</h2>
        <div className="legal-body">
          <p>
            You can control and delete cookies through your browser settings. All major browsers allow you to:
          </p>
          <ul>
            <li>View cookies currently stored on your device</li>
            <li>Delete cookies individually or in bulk</li>
            <li>Block cookies from specific websites</li>
            <li>Block all third-party cookies (this will not affect Lumira, which uses none)</li>
          </ul>
          <p>
            <strong>Important:</strong> If you delete or block Lumira&apos;s authentication cookies, you will
            be signed out and will need to sign in again. Because these cookies are strictly necessary for the
            Service to function, blocking them will prevent you from using Lumira.
          </p>
          <p>Browser cookie settings guides:</p>
          <ul>
            <li>
              <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">
                Google Chrome
              </a>
            </li>
            <li>
              <a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer">
                Mozilla Firefox
              </a>
            </li>
            <li>
              <a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">
                Apple Safari
              </a>
            </li>
            <li>
              <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">
                Microsoft Edge
              </a>
            </li>
          </ul>
        </div>
      </section>

      {/* ─── 6. Consent ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">6. Cookie Consent</h2>
        <div className="legal-body">
          <p>
            Under the UK PECR (Privacy and Electronic Communications Regulations), EU ePrivacy Directive, and
            similar legislation, strictly necessary cookies do not require your prior consent. Because Lumira
            uses only strictly necessary cookies, we do not display a cookie consent banner.
          </p>
          <p>
            If we were ever to introduce non-essential cookies (for analytics or functionality), we would update
            this policy, add a consent mechanism, and notify you in advance.
          </p>
        </div>
      </section>

      {/* ─── 7. Changes ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">7. Changes to This Policy</h2>
        <div className="legal-body">
          <p>
            We will update this Cookie Policy if we change the cookies we use. Material changes — such as
            introducing new categories of cookies — will be communicated via email or a prominent in-app notice
            at least fourteen (14) days before the change takes effect. The version number and effective date at
            the top of this page indicate the current version.
          </p>
        </div>
      </section>

      {/* ─── 8. Contact ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">8. Contact</h2>
        <div className="legal-body">
          <p>If you have questions about our use of cookies, please contact us:</p>
          <div className="legal-callout">
            <strong>Lumira Privacy Team</strong><br />
            Email: <a href="mailto:privacy@hellolumira.app">privacy@hellolumira.app</a><br />
            Data Protection Officer: <a href="mailto:dpo@hellolumira.app">dpo@hellolumira.app</a>
          </div>
          <p style={{ marginTop: '16px' }}>
            See also our <a href="/legal/privacy">Privacy Policy</a> and{' '}
            <a href="/legal/data-practices">AI &amp; Data Practices</a> for complete information on how
            we handle your data.
          </p>
        </div>
      </section>
    </>
  )
}
