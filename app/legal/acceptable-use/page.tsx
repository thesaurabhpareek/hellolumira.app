// app/legal/acceptable-use/page.tsx — Acceptable Use Policy
import type { Metadata } from 'next'
import { LEGAL_VERSIONS, formatLegalDate } from '@/lib/legal-content'

export const metadata: Metadata = {
  title: 'Acceptable Use Policy',
  description: 'Acceptable Use Policy for Lumira. Defines permitted and prohibited uses of the Lumira AI parenting companion.',
}

export default function AcceptableUsePolicyPage() {
  const v = LEGAL_VERSIONS['acceptable-use']
  return (
    <>
      <h1 className="legal-h1">Acceptable Use Policy</h1>
      <div className="legal-meta">
        <span>Effective: {formatLegalDate(v.effectiveDate)}</span>
        <span>Version {v.version}</span>
        <span>Last updated: {formatLegalDate(v.lastUpdated)}</span>
      </div>

      {/* ─── Introduction ─── */}
      <section className="legal-section">
        <div className="legal-body">
          <p>
            This Acceptable Use Policy (&ldquo;AUP&rdquo;) defines what is and is not permitted when using Lumira
            (&ldquo;the Service&rdquo;). This AUP is incorporated into and forms part of our{' '}
            <a href="/legal/terms">Terms of Service</a>. Capitalised terms not defined here have the meanings given
            to them in the Terms of Service.
          </p>
          <p>
            By accessing or using Lumira, you agree to comply with this AUP. Violations may result in content removal,
            account suspension, or permanent account termination.
          </p>
        </div>
      </section>

      {/* ─── 1. Permitted Use ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">1. Permitted Use</h2>
        <div className="legal-body">
          <p>
            Lumira is designed exclusively to support parents and expecting parents. Permitted uses include:
          </p>
          <ul>
            <li>Logging daily check-ins about your baby&apos;s feeding, sleep, and development, and about your own wellbeing as a parent.</li>
            <li>Receiving AI-generated parenting guidance, weekly developmental guides, and concern summaries for informational and educational purposes.</li>
            <li>Journaling about your parenting experience.</li>
            <li>Tracking your baby&apos;s milestones and developmental patterns.</li>
            <li>Participating in Lumira Tribes (community feature) in accordance with our <a href="/legal/community">Community Guidelines</a>.</li>
            <li>Inviting a partner or co-parent to share a baby profile.</li>
            <li>Exporting your personal data for your own records.</li>
          </ul>
        </div>
      </section>

      {/* ─── 2. Prohibited Uses ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">2. Prohibited Uses</h2>
        <div className="legal-body">
          <p>
            You must not use Lumira for any of the following purposes. This list is not exhaustive; Lumira reserves the
            right to determine, in its sole discretion, whether any use violates the spirit of this AUP.
          </p>

          <h3 className="legal-h3">2.1 Misuse of AI Features</h3>
          <ul>
            <li>Attempting to extract medical diagnoses, prescription recommendations, or clinical treatment plans from Lumira&apos;s AI.</li>
            <li>Attempting to circumvent, disable, override, or interfere with Lumira&apos;s safety filters, red flag scanner, content moderation systems, or medical disclaimer mechanisms.</li>
            <li>Using prompt injection, jailbreak techniques, or adversarial inputs to manipulate the AI into producing content outside its intended scope (parenting support).</li>
            <li>Attempting to cause the AI to generate content that is harmful, misleading, defamatory, obscene, or illegal.</li>
            <li>Using the AI to generate content for commercial purposes, including articles, marketing copy, social media content, or any content intended for publication or distribution outside of your personal use.</li>
            <li>Systematically querying the AI to extract, reverse-engineer, or replicate the underlying system prompts, safety instructions, or model behaviour.</li>
            <li>Using the Service to evaluate, benchmark, or compare AI models for commercial or research purposes without Lumira&apos;s prior written consent.</li>
          </ul>

          <h3 className="legal-h3">2.2 Data Misuse</h3>
          <ul>
            <li>Entering health data about a child who is not your own without the explicit consent of the child&apos;s parent or legal guardian.</li>
            <li>Entering fabricated, intentionally inaccurate, or misleading data about a child&apos;s health, development, or symptoms.</li>
            <li>Using the Service to collect, store, or process personal data about third parties without their consent.</li>
            <li>Scraping, harvesting, or systematically collecting data from the Service, including AI responses, community content, or other user-generated content.</li>
            <li>Sharing your account credentials with anyone or allowing any other person to access your account.</li>
          </ul>

          <h3 className="legal-h3">2.3 Technical Misuse</h3>
          <ul>
            <li>Using automated scripts, bots, crawlers, scrapers, or other automated means to access, interact with, or extract data from the Service.</li>
            <li>Reverse engineering, decompiling, disassembling, or otherwise attempting to derive the source code, algorithms, or data structures of the Service.</li>
            <li>Interfering with, disrupting, or creating an undue burden on the Service, its servers, or its networks.</li>
            <li>Attempting to gain unauthorised access to any part of the Service, other user accounts, or the systems and networks connected to the Service.</li>
            <li>Uploading or transmitting viruses, malware, worms, Trojan horses, or any other malicious code.</li>
            <li>Circumventing any technological measures implemented by Lumira to protect the Service or its users.</li>
            <li>Using the Service through any interface other than the official Lumira web application at hellolumira.app, unless explicitly authorised by Lumira.</li>
          </ul>

          <h3 className="legal-h3">2.4 Harmful Conduct</h3>
          <ul>
            <li>Using the Service for any purpose that is illegal under applicable law, including the laws of the State of California, United States federal law, or the law of your jurisdiction.</li>
            <li>Harassment, stalking, intimidation, or threatening other users of the Service.</li>
            <li>Impersonating any person or entity, or falsely representing your affiliation with any person or entity.</li>
            <li>Using the Service in connection with any form of child exploitation, abuse, or endangerment.</li>
            <li>Using the Service to promote or facilitate self-harm, eating disorders, or substance abuse.</li>
            <li>Using the Service for any commercial purpose, including reselling access, redistributing content, or licensing Lumira&apos;s AI outputs.</li>
            <li>Framing or mirroring any part of the Service on any other website or application.</li>
          </ul>
        </div>
      </section>

      {/* ─── 3. AI Interaction Rules ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">3. AI Interaction Rules</h2>
        <div className="legal-body">
          <div className="legal-disclaimer-ai">
            <p style={{ marginBottom: '8px' }}><strong>Interacting with Lumira&apos;s AI responsibly</strong></p>
            <p>
              Lumira&apos;s AI is designed to provide supportive, informational parenting guidance within clearly defined
              safety boundaries. These boundaries exist to protect you and your child.
            </p>
          </div>
          <p>When interacting with Lumira&apos;s AI, you agree to the following rules:</p>
          <ul>
            <li>
              <strong>Do not attempt to override safety features.</strong> Lumira&apos;s AI includes safety filters, a
              red flag scanner, and medical disclaimers. These systems are designed to protect your family. Any attempt
              to bypass, disable, or circumvent these features is a serious violation of this AUP.
            </li>
            <li>
              <strong>Provide accurate information.</strong> The quality and safety of AI-generated guidance depends on
              the accuracy of the information you provide. Intentionally providing false information could result in
              inappropriate or potentially harmful guidance.
            </li>
            <li>
              <strong>Do not treat AI output as medical advice.</strong> Regardless of how the AI phrases its response,
              AI-generated content is not medical advice. Always verify health-related information with a qualified
              healthcare professional.
            </li>
            <li>
              <strong>Report concerning AI behaviour.</strong> If Lumira&apos;s AI generates a response that seems
              inappropriate, inaccurate, or potentially harmful, please report it to{' '}
              <a href="mailto:safety@hellolumira.app">safety@hellolumira.app</a>. Your reports help us improve the
              safety and quality of the Service.
            </li>
            <li>
              <strong>Respect scope.</strong> Lumira&apos;s AI is designed to discuss topics related to pregnancy,
              infant and toddler care, child development, parental wellbeing, and related subjects. Do not attempt
              to use it for unrelated purposes.
            </li>
          </ul>
        </div>
      </section>

      {/* ─── 4. Content Restrictions ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">4. Content Restrictions</h2>
        <div className="legal-body">
          <p>
            You must not upload, post, transmit, or otherwise make available through the Service any content that:
          </p>
          <ul>
            <li>Is unlawful, harmful, threatening, abusive, harassing, tortious, defamatory, vulgar, obscene, libellous, invasive of another&apos;s privacy, hateful, or racially, ethnically, or otherwise objectionable.</li>
            <li>Exploits, harms, or endangers children in any way.</li>
            <li>Constitutes unsolicited or unauthorised advertising, promotional materials, junk mail, spam, chain letters, or any other form of solicitation.</li>
            <li>Contains software viruses or any other code designed to interrupt, destroy, or limit the functionality of any computer software or hardware.</li>
            <li>Infringes any patent, trademark, trade secret, copyright, or other proprietary right of any party.</li>
            <li>Contains personally identifiable information about another person without their explicit consent.</li>
            <li>Impersonates any person or entity, or falsely states or otherwise misrepresents your identity or affiliation.</li>
          </ul>
        </div>
      </section>

      {/* ─── 5. Account Termination Grounds ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">5. Account Termination Grounds</h2>
        <div className="legal-body">
          <p>
            Lumira may suspend or permanently terminate your account, with or without prior notice, for any of the
            following reasons:
          </p>
          <ul>
            <li><strong>Violation of this AUP.</strong> Any violation of this Acceptable Use Policy, whether a single serious violation or a pattern of repeated minor violations.</li>
            <li><strong>Violation of Terms of Service.</strong> Any breach of our <a href="/legal/terms">Terms of Service</a> or <a href="/legal/community">Community Guidelines</a>.</li>
            <li><strong>Safety risk.</strong> Conduct that, in Lumira&apos;s reasonable judgement, poses a risk to the safety or wellbeing of other users, their children, or the integrity of the Service.</li>
            <li><strong>Fraudulent activity.</strong> Creating accounts under false identities, using the Service for fraudulent purposes, or misrepresenting your eligibility to use the Service.</li>
            <li><strong>AI safety violations.</strong> Repeated or egregious attempts to circumvent AI safety features, extract prohibited content from the AI, or manipulate the AI in ways that could produce harmful outputs.</li>
            <li><strong>Legal compliance.</strong> Where required by law, regulation, court order, or government request.</li>
            <li><strong>Extended inactivity.</strong> Twelve (12) or more consecutive months of inactivity, subject to thirty (30) days&apos; prior email notice.</li>
          </ul>
          <p>
            <strong>Effect of termination.</strong> Upon account termination, your right to use the Service ceases
            immediately. Your personal data will be processed in accordance with our{' '}
            <a href="/legal/privacy">Privacy Policy</a>. You may request a data export before termination by
            contacting <a href="mailto:privacy@hellolumira.app">privacy@hellolumira.app</a>.
          </p>
          <p>
            <strong>Appeals.</strong> If you believe your account was terminated in error, you may appeal within
            thirty (30) days by emailing <a href="mailto:legal@hellolumira.app">legal@hellolumira.app</a> with
            the subject line &ldquo;Account Termination Appeal.&rdquo; We will review your appeal and respond
            within fifteen (15) business days.
          </p>
        </div>
      </section>

      {/* ─── 6. Reporting Violations ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">6. Reporting Violations</h2>
        <div className="legal-body">
          <p>
            If you become aware of any violation of this AUP, please report it to us:
          </p>
          <ul>
            <li><strong>AI safety concerns:</strong> <a href="mailto:safety@hellolumira.app">safety@hellolumira.app</a></li>
            <li><strong>Community violations:</strong> <a href="mailto:community@hellolumira.app">community@hellolumira.app</a></li>
            <li><strong>General AUP violations:</strong> <a href="mailto:legal@hellolumira.app">legal@hellolumira.app</a></li>
          </ul>
          <p>
            Good-faith reports will never result in adverse action against the reporting user&apos;s account.
          </p>
        </div>
      </section>

      {/* ─── 7. Changes ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">7. Changes to This Policy</h2>
        <div className="legal-body">
          <p>
            We may update this Acceptable Use Policy from time to time. When we make material changes, we will notify
            you via email or through a prominent notice within the Service at least fourteen (14) days before the changes
            take effect. The &ldquo;Effective date&rdquo; and &ldquo;Version&rdquo; at the top of this page indicate
            when the policy was last revised. Your continued use of the Service after the effective date constitutes
            your acceptance of the updated AUP.
          </p>
        </div>
      </section>

      {/* ─── 8. Contact ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">8. Contact</h2>
        <div className="legal-body">
          <p>
            If you have questions about this Acceptable Use Policy, please contact us:
          </p>
          <div className="legal-callout">
            <strong>Lumira Legal</strong><br />
            Email: <a href="mailto:legal@hellolumira.app">legal@hellolumira.app</a><br />
            AI safety concerns: <a href="mailto:safety@hellolumira.app">safety@hellolumira.app</a><br />
            Privacy enquiries: <a href="mailto:privacy@hellolumira.app">privacy@hellolumira.app</a>
          </div>
        </div>
      </section>
    </>
  )
}
