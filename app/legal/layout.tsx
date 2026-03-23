// app/legal/layout.tsx — Shared layout for all legal pages
import type React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s — Lumira',
    default: 'Legal — Lumira',
  },
  description: 'Legal documents for Lumira, an AI parenting companion.',
}

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .legal-layout {
              min-height: 100dvh;
              height: auto;
              background: var(--color-surface, #FAFAF8);
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              color: var(--color-slate, #2D3748);
              overflow-y: auto;
              -webkit-overflow-scrolling: touch;
              overscroll-behavior-y: auto;
            }
            html:has(.legal-layout), html:has(.legal-layout) body {
              overflow-y: auto !important;
              height: auto !important;
              min-height: 0 !important;
            }

            /* ── Sticky header ── */
            .legal-topbar {
              position: sticky;
              top: 0;
              z-index: 50;
              background: rgba(250, 250, 248, 0.92);
              backdrop-filter: blur(12px);
              -webkit-backdrop-filter: blur(12px);
              border-bottom: 1px solid var(--color-border, #E2E8F0);
              padding: 0 16px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              height: 56px;
            }
            .dark .legal-topbar {
              background: rgba(19, 18, 16, 0.92);
            }
            @media (min-width: 640px) {
              .legal-topbar {
                padding: 0 24px;
              }
            }

            /* Back to app button — primary action */
            .legal-back-btn {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              font-size: 14px;
              font-weight: 600;
              color: var(--color-primary, #3D8178);
              text-decoration: none;
              padding: 8px 14px 8px 10px;
              border-radius: 10px;
              background: var(--color-primary-light, #EDF4F2);
              border: 1px solid var(--color-primary-mid, #A8CECA);
              transition: background 0.15s ease, border-color 0.15s ease;
              white-space: nowrap;
              line-height: 1;
            }
            .legal-back-btn:hover {
              background: #ddeee9;
              border-color: var(--color-primary, #3D8178);
            }
            .legal-back-btn:active {
              transform: scale(0.97);
            }

            /* Center brand */
            .legal-topbar-brand {
              font-size: 17px;
              font-weight: 700;
              color: #1F4F49;
              text-decoration: none;
              letter-spacing: -0.3px;
              position: absolute;
              left: 50%;
              transform: translateX(-50%);
            }
            .dark .legal-topbar-brand {
              color: var(--color-primary, #3D8178);
            }
            .legal-topbar-brand:hover {
              opacity: 0.85;
            }

            /* Right-side link (all docs) */
            .legal-topbar-secondary {
              font-size: 13px;
              font-weight: 500;
              color: var(--color-muted, #718096);
              text-decoration: none;
              display: flex;
              align-items: center;
              gap: 4px;
              white-space: nowrap;
            }
            .legal-topbar-secondary:hover {
              color: var(--color-primary, #3D8178);
            }

            /* ── Content area ── */
            .legal-main {
              max-width: 720px;
              margin: 0 auto;
              padding: 40px 16px 120px;
            }
            @media (min-width: 640px) {
              .legal-main {
                padding: 48px 32px 120px;
              }
            }

            /* Shared legal typography */
            .legal-h1 {
              font-size: 28px;
              font-weight: 700;
              color: var(--color-slate, #2D3748);
              margin-bottom: 6px;
              line-height: 1.25;
              letter-spacing: -0.4px;
            }
            .legal-meta {
              font-size: 13px;
              color: #5A6478;
              margin-bottom: 40px;
              display: flex;
              flex-wrap: wrap;
              gap: 6px 16px;
            }
            .dark .legal-meta {
              color: var(--color-muted, #9C9A94);
            }
            .legal-section {
              margin-bottom: 36px;
            }
            .legal-h2 {
              font-size: 19px;
              font-weight: 700;
              color: var(--color-slate, #2D3748);
              margin-bottom: 12px;
              line-height: 1.35;
            }
            .legal-h3 {
              font-size: 16px;
              font-weight: 600;
              color: var(--color-slate, #2D3748);
              margin-bottom: 8px;
              margin-top: 20px;
              line-height: 1.4;
            }
            .legal-body {
              font-size: 15px;
              line-height: 1.75;
              color: var(--color-slate, #2D3748);
            }
            .legal-body p {
              margin-bottom: 12px;
            }
            .legal-body ul, .legal-body ol {
              padding-left: 24px;
              margin-bottom: 12px;
            }
            .legal-body li {
              margin-bottom: 6px;
            }
            .legal-body a {
              color: #2C6058;
              text-decoration: underline;
              text-underline-offset: 2px;
            }
            .dark .legal-body a {
              color: var(--color-primary, #3D8178);
            }
            .legal-body a:hover {
              color: #1F4F49;
            }
            .dark .legal-body a:hover {
              color: var(--color-primary-mid, #A8CECA);
            }
            .legal-body strong {
              font-weight: 600;
            }

            /* Callout boxes */
            .legal-disclaimer-critical {
              background: #FDF0F3;
              border-left: 4px solid #E5737F;
              border-radius: 0 14px 14px 0;
              padding: 20px 20px 20px 20px;
              margin: 16px 0;
              font-size: 14px;
              line-height: 1.7;
            }
            .dark .legal-disclaimer-critical {
              background: var(--error-bg, #2D1515);
              border-left-color: var(--error-text, #FC8181);
            }
            .legal-disclaimer-ai {
              background: #FDF8EE;
              border: 1px solid #E8D5A8;
              border-radius: 14px;
              padding: 20px;
              margin: 16px 0;
              font-size: 14px;
              line-height: 1.7;
            }
            .dark .legal-disclaimer-ai {
              background: var(--warning-bg, #2A2008);
              border-color: var(--warning-border, #3D3110);
            }
            .legal-callout {
              background: #FFFFFF;
              border: 1px solid var(--color-border, #E2E8F0);
              border-radius: 14px;
              padding: 20px;
              margin: 16px 0;
              font-size: 14px;
              line-height: 1.7;
            }
            .dark .legal-callout {
              background: var(--color-white, #1C1A17);
            }

            /* Table styles */
            .legal-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 14px;
              margin: 16px 0;
              overflow-x: auto;
              display: block;
            }
            @media (min-width: 640px) {
              .legal-table {
                display: table;
              }
            }
            .legal-table th {
              text-align: left;
              padding: 10px 12px;
              border-bottom: 2px solid var(--color-border, #E2E8F0);
              font-weight: 600;
              color: var(--color-slate, #2D3748);
              font-size: 13px;
              white-space: nowrap;
            }
            .legal-table td {
              padding: 10px 12px;
              border-bottom: 1px solid var(--color-border, #E2E8F0);
              vertical-align: top;
              line-height: 1.6;
              color: var(--color-slate, #2D3748);
            }
            .legal-table tr:last-child td {
              border-bottom: none;
            }

            /* Caps-lock disclaimer text */
            .legal-caps {
              text-transform: uppercase;
              font-weight: 700;
              font-size: 14px;
              letter-spacing: 0.2px;
              line-height: 1.7;
            }

            /* Card grid for hub page */
            .legal-card-grid {
              display: flex;
              flex-direction: column;
              gap: 12px;
            }
            .legal-card {
              background: #FFFFFF;
              border: 1px solid var(--color-border, #E2E8F0);
              border-radius: 14px;
              padding: 20px;
              text-decoration: none;
              color: inherit;
              transition: border-color 0.15s ease, box-shadow 0.15s ease;
              display: block;
            }
            .dark .legal-card {
              background: var(--color-white, #1C1A17);
            }
            .legal-card:hover {
              border-color: var(--color-primary-mid, #A8CECA);
              box-shadow: 0 2px 8px rgba(61, 129, 120, 0.08);
            }
            .legal-card-title {
              font-size: 16px;
              font-weight: 600;
              color: var(--color-slate, #2D3748);
              margin-bottom: 4px;
            }
            .legal-card-desc {
              font-size: 14px;
              color: var(--color-muted, #718096);
              line-height: 1.5;
              margin-bottom: 8px;
            }
            .legal-card-date {
              font-size: 12px;
              color: var(--color-muted, #718096);
            }

            /* Print styles */
            @media print {
              .legal-topbar { display: none; }
              .legal-layout { background: white; }
              .legal-main { padding: 0; max-width: 100%; }
              .legal-h1 { font-size: 22px; }
              .legal-h2 { font-size: 16px; }
              .legal-body { font-size: 12px; }
              .legal-disclaimer-critical,
              .legal-disclaimer-ai,
              .legal-callout {
                break-inside: avoid;
              }
              a { color: #2D3748 !important; text-decoration: none !important; }
              a[href]::after { content: " (" attr(href) ")"; font-size: 10px; color: #718096; }
            }
          `,
        }}
      />
      <div className="legal-layout">
        <nav className="legal-topbar" aria-label="Legal pages">
          {/* Primary action: back to app */}
          <a href="/home" className="legal-back-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to app
          </a>

          {/* Center brand */}
          <a href="/" className="legal-topbar-brand" aria-label="Lumira home">Lumira</a>

          {/* Secondary: browse all legal docs */}
          <a href="/legal" className="legal-topbar-secondary">
            All docs
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </nav>
        <main className="legal-main">
          {children}
        </main>
      </div>
    </>
  )
}
