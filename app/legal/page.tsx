// app/legal/page.tsx — Legal Hub
import type { Metadata } from 'next'
import { getLegalDocuments, formatLegalDate } from '@/lib/legal-content'

export const metadata: Metadata = {
  title: 'Legal — Lumira',
  description: 'Legal documents for Lumira, an AI parenting companion. Terms of Service, Privacy Policy, Community Guidelines, and more.',
}

export default function LegalHubPage() {
  const docs = getLegalDocuments()

  return (
    <>
      <h1 className="legal-h1">Legal</h1>
      <p style={{ fontSize: '15px', color: '#718096', marginBottom: '32px', lineHeight: 1.6 }}>
        These documents govern your use of Lumira. We have written them to be as clear and
        readable as possible. If you have questions about anything below, please contact us
        at <a href="mailto:legal@hellolumira.app" style={{ color: '#3D8178' }}>legal@hellolumira.app</a>.
      </p>

      <div className="legal-card-grid">
        {docs.map((doc) => (
          <a key={doc.slug} href={doc.path} className="legal-card">
            <div className="legal-card-title">{doc.title}</div>
            <div className="legal-card-desc">{doc.description}</div>
            <div className="legal-card-date">
              Version {doc.version} &middot; Effective {formatLegalDate(doc.effectiveDate)}
            </div>
          </a>
        ))}
      </div>

      <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #E2E8F0' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#2D3748', marginBottom: '12px' }}>
          DMCA &amp; Copyright
        </h2>
        <div className="legal-body">
          <p>
            Lumira respects the intellectual property rights of others. If you believe that content available through Lumira
            infringes your copyright, you may submit a notice under the Digital Millennium Copyright Act (DMCA) to our
            designated agent:
          </p>
          <div className="legal-callout">
            <strong>DMCA Agent</strong><br />
            Lumira Legal<br />
            Email: <a href="mailto:legal@hellolumira.app">legal@hellolumira.app</a><br />
            Subject line: &ldquo;DMCA Takedown Notice&rdquo;
          </div>
          <p>
            Your notice must include: (1) identification of the copyrighted work; (2) identification of the infringing material
            and its location on Lumira; (3) your contact information; (4) a statement that you have a good faith belief that the
            use is not authorised; (5) a statement, under penalty of perjury, that the information in the notice is accurate and
            that you are the copyright owner or authorised to act on the owner&apos;s behalf; and (6) your physical or electronic signature.
          </p>
        </div>
      </div>

      <div style={{ marginTop: '36px', fontSize: '13px', color: '#A0AEC0', lineHeight: 1.5 }}>
        <p>
          Lumira is operated from Silicon Valley, California, United States.
          For general legal enquiries: <a href="mailto:legal@hellolumira.app" style={{ color: '#3D8178' }}>legal@hellolumira.app</a>.
          For privacy-specific enquiries: <a href="mailto:privacy@hellolumira.app" style={{ color: '#3D8178' }}>privacy@hellolumira.app</a>.
        </p>
      </div>
    </>
  )
}
