// app/legal/layout.tsx — Shared layout for all legal pages
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
              background: #FAFAF8;
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              color: #2D3748;
              overflow-y: auto;
            }
            .legal-topbar {
              position: sticky;
              top: 0;
              z-index: 50;
              background: rgba(250, 250, 248, 0.92);
              backdrop-filter: blur(12px);
              -webkit-backdrop-filter: blur(12px);
              border-bottom: 1px solid #E2E8F0;
              padding: 12px 24px;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .legal-topbar-brand {
              font-size: 17px;
              font-weight: 700;
              color: #4A6FA5;
              text-decoration: none;
              letter-spacing: -0.3px;
            }
            .legal-topbar-brand:hover {
              opacity: 0.85;
            }
            .legal-topbar-back {
              font-size: 14px;
              font-weight: 500;
              color: #718096;
              text-decoration: none;
              display: flex;
              align-items: center;
              gap: 4px;
            }
            .legal-topbar-back:hover {
              color: #4A6FA5;
            }
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
              color: #2D3748;
              margin-bottom: 6px;
              line-height: 1.25;
              letter-spacing: -0.4px;
            }
            .legal-meta {
              font-size: 13px;
              color: #718096;
              margin-bottom: 40px;
              display: flex;
              flex-wrap: wrap;
              gap: 6px 16px;
            }
            .legal-section {
              margin-bottom: 36px;
            }
            .legal-h2 {
              font-size: 19px;
              font-weight: 700;
              color: #2D3748;
              margin-bottom: 12px;
              line-height: 1.35;
            }
            .legal-h3 {
              font-size: 16px;
              font-weight: 600;
              color: #2D3748;
              margin-bottom: 8px;
              margin-top: 20px;
              line-height: 1.4;
            }
            .legal-body {
              font-size: 15px;
              line-height: 1.75;
              color: #2D3748;
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
              color: #3D8178;
              text-decoration: underline;
              text-underline-offset: 2px;
            }
            .legal-body a:hover {
              color: #2C6058;
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
            .legal-disclaimer-ai {
              background: #FDF8EE;
              border: 1px solid #E8D5A8;
              border-radius: 14px;
              padding: 20px;
              margin: 16px 0;
              font-size: 14px;
              line-height: 1.7;
            }
            .legal-callout {
              background: #FFFFFF;
              border: 1px solid #E2E8F0;
              border-radius: 14px;
              padding: 20px;
              margin: 16px 0;
              font-size: 14px;
              line-height: 1.7;
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
              border-bottom: 2px solid #E2E8F0;
              font-weight: 600;
              color: #2D3748;
              font-size: 13px;
              white-space: nowrap;
            }
            .legal-table td {
              padding: 10px 12px;
              border-bottom: 1px solid #E2E8F0;
              vertical-align: top;
              line-height: 1.6;
              color: #2D3748;
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
              border: 1px solid #E2E8F0;
              border-radius: 14px;
              padding: 20px;
              text-decoration: none;
              color: inherit;
              transition: border-color 0.15s ease, box-shadow 0.15s ease;
              display: block;
            }
            .legal-card:hover {
              border-color: #B8CCE8;
              box-shadow: 0 2px 8px rgba(74, 111, 165, 0.08);
            }
            .legal-card-title {
              font-size: 16px;
              font-weight: 600;
              color: #2D3748;
              margin-bottom: 4px;
            }
            .legal-card-desc {
              font-size: 14px;
              color: #718096;
              line-height: 1.5;
              margin-bottom: 8px;
            }
            .legal-card-date {
              font-size: 12px;
              color: #A0AEC0;
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
        <nav className="legal-topbar">
          <a href="/" className="legal-topbar-brand">Lumira</a>
          <a href="/legal" className="legal-topbar-back">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            All legal documents
          </a>
        </nav>
        <main className="legal-main">
          {children}
        </main>
      </div>
    </>
  )
}
