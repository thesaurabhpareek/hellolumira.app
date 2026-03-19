// app/legal/terms/page.tsx — Terms of Service (Complete)
import type { Metadata } from 'next'
import { LEGAL_VERSIONS, formatLegalDate } from '@/lib/legal-content'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Lumira, an AI parenting companion. Includes medical disclaimers, AI limitations, liability, and dispute resolution.',
}

export default function TermsOfServicePage() {
  const v = LEGAL_VERSIONS.terms
  return (
    <>
      <h1 className="legal-h1">Terms of Service</h1>
      <div className="legal-meta">
        <span>Effective: {formatLegalDate(v.effectiveDate)}</span>
        <span>Version {v.version}</span>
        <span>Last updated: {formatLegalDate(v.lastUpdated)}</span>
      </div>

      {/* ─── 1. Acceptance ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">1. Acceptance of Terms</h2>
        <div className="legal-body">
          <p>
            By creating an account on Lumira (&ldquo;the Service&rdquo;), accessing or using the Service at hellolumira.app,
            or by clicking &ldquo;I agree&rdquo; during onboarding, you (&ldquo;you&rdquo; or &ldquo;User&rdquo;) agree to be
            bound by these Terms of Service (&ldquo;Terms&rdquo;), our <a href="/legal/privacy">Privacy Policy</a>,
            our <a href="/legal/acceptable-use">Acceptable Use Policy</a>, our <a href="/legal/community">Community Guidelines</a>,
            and our <a href="/legal/data-practices">AI &amp; Data Practices</a> document,
            all of which are incorporated by reference.
          </p>
          <p>
            If you do not agree to these Terms, do not create an account or use the Service.
          </p>
          <p>
            Your continued use of Lumira after we post updated Terms constitutes your acceptance of the updated Terms,
            subject to the notice provisions in Section 17 below. We track document versions; you may be asked to re-consent
            when material changes are made.
          </p>
        </div>
      </section>

      {/* ─── 2. Service Description ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">2. Service Description</h2>
        <div className="legal-body">
          <p>
            Lumira is an AI-powered parenting companion designed to provide informational and educational support to parents
            and expecting parents. The Service includes personalised daily check-ins, AI-generated weekly developmental guides,
            concern summaries, pattern observations, milestone tracking, journal features, and a community feature (&ldquo;Tribes&rdquo;).
          </p>
          <p>
            Lumira is <strong>not</strong> a medical device, healthcare provider, or clinical decision support system.
            Lumira is <strong>not</strong> a substitute for professional medical advice, diagnosis, or treatment.
            Lumira does not and cannot physically examine your child.
          </p>
        </div>
      </section>

      {/* ─── 3. Medical Disclaimer ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">3. Medical Disclaimer</h2>
        <div className="legal-body">
          <div className="legal-disclaimer-critical">
            <p className="legal-caps" style={{ marginBottom: '12px' }}>
              LUMIRA IS NOT A MEDICAL DEVICE AND IS NOT INTENDED TO DIAGNOSE, TREAT, CURE, OR PREVENT ANY DISEASE
              OR MEDICAL CONDITION.
            </p>
            <p style={{ marginBottom: '12px' }}>
              The information provided by Lumira, including AI-generated content, weekly developmental guides, concern
              summaries, pattern observations, and conversational responses, is for <strong>informational and educational
              purposes only</strong>. This information does not constitute medical advice and should not be relied upon
              as a substitute for consultation with a qualified healthcare professional.
            </p>
            <p style={{ marginBottom: '12px' }}>
              <strong>ALWAYS</strong> seek the advice of your physician, paediatrician, midwife, or other qualified health
              provider with any questions regarding a medical condition affecting you or your child. <strong>NEVER</strong>{' '}
              disregard professional medical advice or delay in seeking it because of something you have read, received,
              or been told through Lumira.
            </p>
            <p className="legal-caps">
              IN CASE OF A MEDICAL EMERGENCY, CALL 911 (US), 999 (UK), 112 (EU/INDIA), 000 (AUSTRALIA), OR YOUR LOCAL
              EMERGENCY NUMBER IMMEDIATELY. DO NOT USE LUMIRA TO MAKE EMERGENCY MEDICAL DECISIONS.
            </p>
          </div>
          <p>
            You acknowledge and agree that:
          </p>
          <ul>
            <li>Lumira&apos;s AI-generated responses are not peer-reviewed medical literature and may contain errors, inaccuracies, or omissions.</li>
            <li>The AI cannot physically examine, observe, or assess your child and therefore cannot detect physical symptoms, signs, or conditions that require visual or tactile examination.</li>
            <li>Lumira&apos;s red flag scanner (a keyword-based safety system that screens for potentially urgent symptoms) is a supplementary safety net and is <strong>not</strong> a comprehensive diagnostic tool. It may fail to identify serious or emergency conditions.</li>
            <li>Pattern observations (sleep, feeding, mood) are generated from user-provided data using rule-based logic and are observational, not diagnostic.</li>
            <li>Emotional state inferences (e.g., &ldquo;tired,&rdquo; &ldquo;struggling,&rdquo; &ldquo;distressed&rdquo;) are derived from keyword matching in your messages and are approximate. They are used solely to provide appropriate supportive responses and wellbeing resources.</li>
          </ul>
        </div>
      </section>

      {/* ─── 4. AI Disclosure ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">4. AI Disclosure &amp; Limitations</h2>
        <div className="legal-body">
          <div className="legal-disclaimer-ai">
            <p style={{ marginBottom: '8px' }}><strong>How AI works in Lumira</strong></p>
            <p>
              Lumira uses Claude, a large language model developed by Anthropic, Inc., to generate conversational responses,
              weekly guides, and concern summaries. When you interact with Lumira, a contextual summary of your baby&apos;s
              age, recent check-in data, and your message is sent to Anthropic&apos;s API to generate a response.
            </p>
          </div>
          <p>You acknowledge and agree that:</p>
          <ul>
            <li>AI can and does make errors. It may generate inaccurate, misleading, or incomplete information.</li>
            <li>AI-generated content is <strong>not</strong> reviewed by a physician, nurse, midwife, or any healthcare professional before being delivered to you.</li>
            <li>AI output should be treated as one data point among many &mdash; not as authoritative guidance.</li>
            <li>Lumira uses a conservative AI temperature setting (0.4) to reduce variability, but this does not guarantee accuracy, correctness, or safety of responses.</li>
            <li>The AI model may be updated, replaced, or modified by Lumira or its upstream provider (Anthropic) at any time, which may affect the nature, quality, or style of responses.</li>
            <li>You may opt out of AI processing entirely in Settings &rarr; Privacy &amp; Data. If opted out, Lumira will continue to log check-ins and track patterns but will not generate AI-powered conversational responses.</li>
          </ul>
        </div>
      </section>

      {/* ─── 5. Eligibility ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">5. Eligibility</h2>
        <div className="legal-body">
          <p>To use Lumira, you must:</p>
          <ul>
            <li>Be at least eighteen (18) years of age.</li>
            <li>Be a parent, legal guardian, or person with legal parental responsibility for the child whose data you enter into Lumira.</li>
            <li>Have the legal authority and capacity to consent to data processing for both yourself and your child under applicable law.</li>
            <li>Not have been previously terminated or banned from the Service.</li>
          </ul>
          <p>
            By creating an account, you represent and warrant that all of the above conditions are true. If we discover or
            reasonably believe that any of these conditions are not met, we may suspend or terminate your account without prior notice.
          </p>
        </div>
      </section>

      {/* ─── 6. Account ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">6. Account Registration &amp; Security</h2>
        <div className="legal-body">
          <p>
            Lumira uses passwordless authentication (&ldquo;magic link&rdquo;) sent to your registered email address. You are
            responsible for:
          </p>
          <ul>
            <li>Maintaining the security of the email account associated with your Lumira account.</li>
            <li>All activity that occurs under your account, whether or not you authorised that activity.</li>
            <li>Notifying us immediately at <a href="mailto:legal@hellolumira.app">legal@hellolumira.app</a> if you believe your account has been compromised.</li>
          </ul>
          <p>
            You may create only one account per person. You must provide accurate, current, and complete information during
            registration and keep your account information up to date. Creating accounts under false identities or on behalf of
            someone other than yourself (except through the partner invite mechanism described in Section 8) is prohibited.
          </p>
        </div>
      </section>

      {/* ─── 7. User Conduct ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">7. User Conduct &amp; Acceptable Use</h2>
        <div className="legal-body">
          <p>
            Your use of Lumira is subject to our <a href="/legal/acceptable-use">Acceptable Use Policy</a>, which is
            incorporated into these Terms by reference. In addition to the restrictions set forth there, you agree not to:
          </p>
          <ul>
            <li>Use Lumira&apos;s AI features for purposes unrelated to parenting, infant care, or pregnancy support.</li>
            <li>Attempt to extract medical diagnoses or prescription recommendations from the AI.</li>
            <li>Attempt to circumvent, disable, or interfere with Lumira&apos;s safety filters, red flag scanner, or content moderation systems.</li>
            <li>Enter health information about a child who is not your own without the legal guardian&apos;s explicit consent.</li>
            <li>Use the Service for any commercial purpose, including reselling, redistributing, or licensing Lumira content.</li>
            <li>Use automated scripts, bots, scrapers, or other automated means to access the Service.</li>
            <li>Reverse engineer, decompile, or disassemble any part of the Service.</li>
            <li>Interfere with, disrupt, or create an undue burden on the Service or its infrastructure.</li>
          </ul>
        </div>
      </section>

      {/* ─── 8. Two-Parent Accounts ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">8. Two-Parent Accounts</h2>
        <div className="legal-body">
          <p>
            Lumira supports a partner invite mechanism that allows a second parent or legal guardian to link their account
            to a shared baby profile. The following rules apply:
          </p>
          <ul>
            <li><strong>Invitation:</strong> The primary account holder may invite a partner by email. The invited person must create their own Lumira account and accept the invitation.</li>
            <li><strong>Shared access:</strong> Both parents have equal read and write access to the shared baby profile, including check-in data, concern summaries, pattern observations, milestones, and weekly guides.</li>
            <li><strong>Personal data remains private:</strong> Each parent&apos;s personal data &mdash; including their own emotional state check-ins, journal entries, and personal conversation history &mdash; is visible only to them and is not shared with the other parent.</li>
            <li><strong>Revocation:</strong> Either parent may revoke the other&apos;s access to the shared baby profile at any time through Settings. Revocation removes the linked parent&apos;s access to the baby profile but does not delete their Lumira account or personal data.</li>
            <li><strong>Account deletion:</strong> If one parent deletes their account, their personal data is deleted in accordance with our <a href="/legal/privacy">Privacy Policy</a>. The shared baby profile is <strong>retained</strong> for the remaining linked parent. If both parents delete their accounts, the baby profile and all associated data are permanently deleted.</li>
          </ul>
        </div>
      </section>

      {/* ─── 9. Intellectual Property ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">9. Intellectual Property</h2>
        <div className="legal-body">
          <p>
            <strong>Lumira&apos;s IP.</strong> The Service, including its design, code, AI system prompts, algorithms,
            branding, logos, and all AI-generated outputs, is the property of Lumira and its licensors. These Terms do not
            grant you any right, title, or interest in the Service except the limited right to use it in accordance with these Terms.
          </p>
          <p>
            <strong>Your data.</strong> You retain ownership of the personal data, check-in responses, journal entries, and
            concern descriptions you provide to Lumira. By using the Service, you grant Lumira a limited, non-exclusive,
            non-transferable, revocable licence to process your data solely for the purpose of providing and improving the Service.
            This licence terminates when you delete your account.
          </p>
          <p>
            <strong>AI-generated content.</strong> AI-generated responses, weekly guides, concern summaries, and other
            content produced by Lumira&apos;s AI are owned by Lumira. You are granted a personal, non-exclusive, non-transferable
            licence to view and use this content for your personal, non-commercial parenting purposes.
          </p>
        </div>
      </section>

      {/* ─── 10. Community Content ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">10. Community Content (Tribes)</h2>
        <div className="legal-body">
          <p>
            Lumira&apos;s Tribes feature allows users to share experiences, ask questions, and support one another. By posting
            content in Tribes, you agree to the following:
          </p>
          <ul>
            <li><strong>Licence grant:</strong> You grant Lumira a non-exclusive, worldwide, royalty-free, sublicensable licence to display, distribute, and reproduce your community content within the Lumira platform for the purpose of operating the Tribes feature. This licence does not extend to uses outside the Lumira platform.</li>
            <li><strong>Content ownership:</strong> You retain ownership of the content you post. You represent and warrant that you have the right to post it and that it does not infringe any third party&apos;s intellectual property or other rights.</li>
            <li><strong>Content moderation:</strong> Lumira reserves the right to remove, edit, or restrict any community content that violates our <a href="/legal/community">Community Guidelines</a>, these Terms, or applicable law, without prior notice.</li>
            <li><strong>Anonymous posting:</strong> Tribes supports anonymous posting for sensitive topics. Even when posting anonymously, you remain bound by these Terms and our Community Guidelines.</li>
            <li><strong>No expectation of privacy:</strong> Content posted in Tribes is visible to other Lumira users in that Tribe. Do not share information you wish to keep private.</li>
            <li><strong>DMCA takedown:</strong> If you believe community content infringes your copyright, you may submit a takedown notice as described on our <a href="/legal">Legal Hub page</a>.</li>
          </ul>
        </div>
      </section>

      {/* ─── 11. Subscription & Payment ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">11. Subscription &amp; Payment</h2>
        <div className="legal-body">
          <p>
            Lumira currently offers a free tier. In the future, Lumira may offer paid subscription plans. If and when paid plans
            are introduced, the following terms will apply:
          </p>
          <ul>
            <li><strong>Pricing:</strong> Subscription pricing will be clearly displayed before purchase. Anticipated pricing is $9.99/month or $79/year (subject to change with 30 days&apos; prior notice).</li>
            <li><strong>Billing:</strong> Subscriptions are billed in advance on a recurring basis (monthly or annually, depending on the plan you select). You authorise us to charge your payment method at the beginning of each billing cycle.</li>
            <li><strong>Cancellation:</strong> You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. You will continue to have access to paid features until the end of the period you have already paid for.</li>
            <li><strong>Refunds:</strong> Monthly subscriptions are non-refundable. Annual subscriptions are eligible for a pro-rata refund if cancelled within the first 30 days. After 30 days, annual subscriptions are non-refundable but remain active until the end of the annual period.</li>
            <li><strong>Price changes:</strong> We will provide at least thirty (30) days&apos; prior written notice (via email) of any price increase. If you do not agree to the new price, you may cancel before the new price takes effect.</li>
            <li><strong>Free tier:</strong> Lumira reserves the right to modify the features and limitations of the free tier at any time.</li>
          </ul>
        </div>
      </section>

      {/* ─── 12. Limitation of Liability ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">12. Limitation of Liability</h2>
        <div className="legal-body">
          <div className="legal-disclaimer-critical">
            <p className="legal-caps" style={{ marginBottom: '12px' }}>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL LUMIRA, ITS FOUNDERS, OFFICERS, DIRECTORS,
              EMPLOYEES, AGENTS, LICENSORS, OR SERVICE PROVIDERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
              EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA,
              OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF OR INABILITY TO USE THE SERVICE.
            </p>
            <p style={{ marginBottom: '12px' }}>
              This limitation applies to, without limitation, damages arising from:
            </p>
            <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
              <li>(a) your reliance on AI-generated health guidance, concern summaries, or pattern observations;</li>
              <li>(b) the failure of Lumira or its AI to identify, flag, or escalate a medical condition, symptom, or emergency;</li>
              <li>(c) delayed or forgone professional medical care attributable in whole or in part to information received through Lumira;</li>
              <li>(d) emotional distress arising from the use of the Service;</li>
              <li>(e) errors, inaccuracies, or omissions in AI-generated content;</li>
              <li>(f) unauthorised access to or alteration of your data;</li>
              <li>(g) service interruptions, downtime, or unavailability.</li>
            </ul>
            <p className="legal-caps">
              IN NO EVENT SHALL LUMIRA&apos;S TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATED TO
              THESE TERMS OR THE SERVICE EXCEED THE GREATER OF (I) THE TOTAL AMOUNT YOU HAVE PAID TO LUMIRA IN THE TWELVE (12)
              MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM, OR (II) ONE HUNDRED UNITED STATES DOLLARS (US$100).
            </p>
          </div>
          <p>
            <strong>California Civil Code Section 1542 Waiver.</strong> You expressly waive and relinquish all rights and benefits
            under Section 1542 of the California Civil Code, which provides: &ldquo;A general release does not extend to claims
            that the creditor or releasing party does not know or suspect to exist in his or her favor at the time of executing
            the release and that, if known by him or her, would have materially affected his or her settlement with the debtor or
            released party.&rdquo;
          </p>
          <p>
            Some jurisdictions do not allow the exclusion or limitation of incidental or consequential damages, so the above
            limitations may not apply to you. In such jurisdictions, Lumira&apos;s liability is limited to the maximum extent
            permitted by law.
          </p>
        </div>
      </section>

      {/* ─── 13. Indemnification ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">13. Indemnification</h2>
        <div className="legal-body">
          <p>
            You agree to defend, indemnify, and hold harmless Lumira, its founders, officers, directors, employees, agents,
            and licensors from and against any and all claims, damages, obligations, losses, liabilities, costs, and expenses
            (including reasonable attorneys&apos; fees) arising from or related to:
          </p>
          <ul>
            <li>Any medical, health, or parenting decision you make based on AI-generated content or other information provided by the Service.</li>
            <li>Your misrepresentation of parental authority, legal guardianship, or eligibility to use the Service.</li>
            <li>Your violation of these Terms, our Acceptable Use Policy, or our Community Guidelines.</li>
            <li>Your violation of any applicable law, regulation, or third-party right.</li>
            <li>Any content you post in Tribes that infringes the intellectual property rights, privacy rights, or other rights of any third party.</li>
            <li>Your negligent or wilful misconduct.</li>
          </ul>
        </div>
      </section>

      {/* ─── 14. Disclaimer of Warranties ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">14. Disclaimer of Warranties</h2>
        <div className="legal-body">
          <div className="legal-disclaimer-critical">
            <p className="legal-caps" style={{ marginBottom: '12px' }}>
              THE SERVICE IS PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS, WITHOUT WARRANTIES OF
              ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS
              FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
            </p>
            <p style={{ marginBottom: '8px' }}>Without limiting the foregoing, Lumira makes no warranty that:</p>
            <ul style={{ paddingLeft: '20px' }}>
              <li>AI-generated content will be accurate, complete, reliable, current, or error-free.</li>
              <li>The red flag scanner will identify all emergencies, urgent symptoms, or conditions requiring immediate medical attention.</li>
              <li>Pattern observations or emotional state inferences will be correct or clinically meaningful.</li>
              <li>The Service will be uninterrupted, timely, secure, or free from viruses or other harmful components.</li>
              <li>The results obtained from use of the Service will meet your expectations or requirements.</li>
              <li>Any errors in the Service will be corrected.</li>
            </ul>
          </div>
          <p>
            You expressly understand and agree that your use of the Service is at your sole risk. No advice or information,
            whether oral or written, obtained by you from Lumira or through the Service shall create any warranty not expressly
            stated in these Terms.
          </p>
        </div>
      </section>

      {/* ─── 15. Governing Law & Disputes ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">15. Governing Law &amp; Dispute Resolution</h2>
        <div className="legal-body">
          <p>
            <strong>Governing law.</strong> These Terms shall be governed by and construed in accordance with the laws of the
            State of California, United States of America, without regard to its conflict of law provisions. The United Nations
            Convention on Contracts for the International Sale of Goods does not apply.
          </p>

          <h3 className="legal-h3">15.1 Informal Resolution</h3>
          <p>
            Before initiating any formal dispute resolution proceeding, you agree to first contact us at{' '}
            <a href="mailto:legal@hellolumira.app">legal@hellolumira.app</a> and attempt to resolve the dispute informally
            for at least thirty (30) calendar days. Most concerns can be resolved this way.
          </p>

          <h3 className="legal-h3">15.2 Binding Arbitration</h3>
          <p>
            If we are unable to resolve a dispute informally, any dispute, controversy, or claim arising out of or relating to
            these Terms or the breach, termination, or validity thereof shall be finally settled by binding arbitration administered
            by the American Arbitration Association (&ldquo;AAA&rdquo;) under its Commercial Arbitration Rules and, where applicable,
            its Supplementary Procedures for Consumer-Related Disputes. The arbitration shall take place in San Francisco County,
            California, or, at your election, may be conducted remotely by videoconference. The language of arbitration shall be English.
          </p>
          <p>
            The arbitrator&apos;s decision shall be final and binding. Judgement on the arbitration award may be entered in any
            court of competent jurisdiction.
          </p>

          <h3 className="legal-h3">15.3 Small Claims Court</h3>
          <p>
            Notwithstanding the foregoing, either party may bring an individual action in small claims court for disputes or
            claims within the jurisdictional limits of such court (generally $10,000 or less, depending on your jurisdiction).
          </p>

          <h3 className="legal-h3">15.4 Class Action Waiver</h3>
          <div className="legal-disclaimer-critical">
            <p className="legal-caps">
              YOU AND LUMIRA AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY, AND NOT
              AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS, CONSOLIDATED, OR REPRESENTATIVE PROCEEDING. THE ARBITRATOR MAY
              NOT CONSOLIDATE MORE THAN ONE PERSON&apos;S CLAIMS AND MAY NOT OTHERWISE PRESIDE OVER ANY FORM OF A CLASS OR
              REPRESENTATIVE PROCEEDING.
            </p>
          </div>
          <p>
            If this class action waiver is found to be unenforceable, then the entirety of the arbitration provision in this
            Section 15 shall be null and void, and the dispute shall be resolved in the state or federal courts located in
            San Francisco County, California.
          </p>

          <h3 className="legal-h3">15.5 Venue</h3>
          <p>
            To the extent that litigation is permitted under these Terms, you consent to the exclusive jurisdiction of and
            venue in the state and federal courts located in San Francisco County, California, for all disputes arising out of
            or relating to these Terms.
          </p>
        </div>
      </section>

      {/* ─── 16. Termination ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">16. Termination</h2>
        <div className="legal-body">
          <p>
            <strong>By you.</strong> You may terminate your account at any time by using the account deletion feature in
            Settings &rarr; Privacy &amp; Data &rarr; Delete Account. Account deletion is confirmed via an email verification
            link for your security. Upon confirmed deletion, your personal data will be processed in accordance with our{' '}
            <a href="/legal/privacy">Privacy Policy</a>.
          </p>
          <p>
            <strong>By Lumira.</strong> We may suspend or terminate your account, with or without notice, if:
          </p>
          <ul>
            <li>You violate these Terms, our Acceptable Use Policy, or our Community Guidelines.</li>
            <li>Your use of the Service poses a risk to the safety, security, or rights of other users.</li>
            <li>We are required to do so by law, regulation, or court order.</li>
            <li>We reasonably believe your account has been compromised.</li>
            <li>You have been inactive for more than twelve (12) consecutive months (with 30 days&apos; prior email notice).</li>
          </ul>
          <p>
            <strong>Effect of termination.</strong> Upon termination, your right to use the Service immediately ceases.
            Your personal data will be deleted in accordance with our Privacy Policy and applicable data retention requirements.
            Anonymised audit data (with all personal identifiers removed) may be retained for up to seven (7) years to comply
            with legal obligations. Provisions of these Terms that by their nature should survive termination shall survive,
            including Sections 3, 4, 9, 12, 13, 14, 15, and 18.
          </p>
        </div>
      </section>

      {/* ─── 17. Modifications ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">17. Modifications to These Terms</h2>
        <div className="legal-body">
          <p>
            We may update these Terms from time to time. When we make material changes, we will:
          </p>
          <ul>
            <li>Provide at least thirty (30) days&apos; prior notice via the email address associated with your account.</li>
            <li>Update the &ldquo;Effective date&rdquo; and &ldquo;Version&rdquo; at the top of this page.</li>
            <li>May require you to re-consent during your next login if the changes are significant.</li>
          </ul>
          <p>
            Your continued use of the Service after the effective date of the updated Terms constitutes your acceptance of
            those changes. If you do not agree to the updated Terms, you must stop using the Service and delete your account
            before the effective date of the updated Terms.
          </p>
        </div>
      </section>

      {/* ─── 18. General Provisions ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">18. General Provisions</h2>
        <div className="legal-body">
          <h3 className="legal-h3">18.1 Severability</h3>
          <p>
            If any provision of these Terms is held to be invalid, illegal, or unenforceable by a court of competent
            jurisdiction, the remaining provisions shall remain in full force and effect. The invalid or unenforceable
            provision shall be modified to the minimum extent necessary to make it valid and enforceable while preserving
            the parties&apos; original intent.
          </p>

          <h3 className="legal-h3">18.2 Entire Agreement</h3>
          <p>
            These Terms, together with our Privacy Policy, Acceptable Use Policy, Community Guidelines, AI &amp; Data
            Practices document, and any other policies referenced herein, constitute the entire agreement between you and
            Lumira with respect to the Service and supersede all prior agreements, understandings, negotiations, and
            discussions, whether oral or written.
          </p>

          <h3 className="legal-h3">18.3 Assignment</h3>
          <p>
            You may not assign or transfer these Terms, or any rights or obligations hereunder, without Lumira&apos;s prior
            written consent. Lumira may assign these Terms freely in connection with a merger, acquisition, corporate
            reorganisation, or sale of substantially all of its assets, provided the assignee agrees to be bound by these Terms.
          </p>

          <h3 className="legal-h3">18.4 Force Majeure</h3>
          <p>
            Lumira shall not be liable for any failure or delay in performing its obligations under these Terms where such
            failure or delay results from circumstances beyond its reasonable control, including but not limited to acts of God,
            pandemic, epidemic, war, terrorism, riot, government action, power failure, internet or telecommunications failure,
            fire, flood, earthquake, or any failure of Lumira&apos;s third-party service providers.
          </p>

          <h3 className="legal-h3">18.5 No Waiver</h3>
          <p>
            The failure of Lumira to enforce any right or provision of these Terms shall not constitute a waiver of that right
            or provision. Any waiver of any provision of these Terms will be effective only if in writing and signed by Lumira.
          </p>

          <h3 className="legal-h3">18.6 Notices</h3>
          <p>
            Lumira may send you notices via the email address associated with your account. You may send notices to Lumira at{' '}
            <a href="mailto:legal@hellolumira.app">legal@hellolumira.app</a>. Notices are deemed received when sent via email
            (except where the sender receives a bounce notification).
          </p>
        </div>
      </section>

      {/* ─── 19. Contact ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">19. Contact</h2>
        <div className="legal-body">
          <p>
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <div className="legal-callout">
            <strong>Lumira Legal</strong><br />
            Email: <a href="mailto:legal@hellolumira.app">legal@hellolumira.app</a><br />
            Privacy enquiries: <a href="mailto:privacy@hellolumira.app">privacy@hellolumira.app</a><br />
            Community enquiries: <a href="mailto:community@hellolumira.app">community@hellolumira.app</a>
          </div>
        </div>
      </section>
    </>
  )
}
