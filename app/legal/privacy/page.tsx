// app/legal/privacy/page.tsx — Privacy Policy (Complete, GDPR/CCPA/DPDPA-compliant)
import type { Metadata } from 'next'
import { LEGAL_VERSIONS, formatLegalDate } from '@/lib/legal-content'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Lumira. How we collect, use, store, and protect your data and your baby\'s data under GDPR, CCPA/CPRA, DPDPA, and other privacy regulations.',
}

export default function PrivacyPolicyPage() {
  const v = LEGAL_VERSIONS.privacy
  return (
    <>
      <h1 className="legal-h1">Privacy Policy</h1>
      <div className="legal-meta">
        <span>Effective: {formatLegalDate(v.effectiveDate)}</span>
        <span>Version {v.version}</span>
        <span>Last updated: {formatLegalDate(v.lastUpdated)}</span>
      </div>

      {/* ─── 1. Introduction ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">1. Introduction &amp; Data Controller</h2>
        <div className="legal-body">
          <p>
            Lumira (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;) operates the AI parenting companion available at
            hellolumira.app (&ldquo;the Service&rdquo;). We are the data controller responsible for your personal data as
            described in this Privacy Policy.
          </p>
          <p>
            This Privacy Policy explains what data we collect, how we use it, who we share it with, how long we keep it, and
            what rights you have. It applies to all users of Lumira worldwide. For detailed information about how our
            AI system processes your data, please also see our <a href="/legal/data-practices">AI &amp; Data Practices</a> document.
          </p>
          <div className="legal-callout">
            <strong>Data Controller</strong><br />
            Lumira<br />
            Silicon Valley, California, United States<br /><br />
            <strong>Privacy contact:</strong> <a href="mailto:privacy@hellolumira.app">privacy@hellolumira.app</a><br />
            <strong>Legal contact:</strong> <a href="mailto:legal@hellolumira.app">legal@hellolumira.app</a><br /><br />
            <strong>Data Protection Officer:</strong> <a href="mailto:dpo@hellolumira.app">dpo@hellolumira.app</a><br />
            <strong>EU/UK Representative:</strong> To be appointed. Until appointed, enquiries may be directed to privacy@hellolumira.app.<br />
            <strong>India Grievance Officer:</strong> To be appointed. Until appointed, grievances may be directed to privacy@hellolumira.app.
          </div>
        </div>
      </section>

      {/* ─── 2. Information We Collect ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">2. Information We Collect</h2>
        <div className="legal-body">

          <h3 className="legal-h3">2.1 Account Data</h3>
          <p><em>Legal basis: Contract performance (GDPR Art. 6(1)(b))</em></p>
          <ul>
            <li>Email address (used for authentication and communication)</li>
            <li>First name (used for personalisation)</li>
            <li>Authentication tokens (managed by Supabase Auth; we do not store passwords as we use passwordless magic link authentication)</li>
            <li>First-time parent status (yes/no)</li>
          </ul>

          <h3 className="legal-h3">2.2 Baby Profile Data</h3>
          <p><em>Legal basis: Contract performance + Parental consent (GDPR Art. 6(1)(b), 6(1)(a))</em></p>
          <ul>
            <li>Baby&apos;s name (optional &mdash; if not provided, we use &ldquo;Baby&rdquo; or &ldquo;your baby&rdquo;)</li>
            <li>Date of birth or expected due date</li>
            <li>Developmental stage (pregnancy, infant, or toddler)</li>
            <li>Milestone records (type, date, optional notes)</li>
            <li>Pregnancy appointments (type, date, optional notes)</li>
          </ul>

          <h3 className="legal-h3">2.3 Health-Adjacent Data</h3>
          <p><em>Legal basis: Explicit consent (GDPR Art. 6(1)(a), Art. 9(2)(a))</em></p>
          <div className="legal-disclaimer-ai">
            <p style={{ marginBottom: '8px' }}>
              <strong>Why we treat this as sensitive data:</strong> While daily check-in data (sleep quality, feeding patterns, mood)
              may not strictly qualify as &ldquo;health data&rdquo; under GDPR Article 9 in every interpretation, we treat all
              data relating to infant health, baby care, and parental wellbeing with the same care and protections as special
              category data. We require explicit consent before collecting any of this data.
            </p>
          </div>
          <ul>
            <li><strong>Daily check-in data:</strong> sleep quality (poor/ok/good), night wakings count, feeding patterns (less/normal/more), baby mood (calm/fussy/very fussy), diaper observations (normal/fewer/more/unusual), nausea level (none/mild/moderate/severe for pregnancy), energy level (low/ok/good), symptom log (free text), kept-food-down indicator</li>
            <li><strong>Concern flow responses:</strong> structured answers to concern-specific questions (e.g., symptom descriptions, duration, severity ratings), free-text concern descriptions</li>
            <li><strong>AI conversation logs:</strong> your messages to Lumira and the AI-generated responses, stored as chat messages within conversation threads linked to each check-in or concern session</li>
            <li><strong>Concern summaries:</strong> AI-generated summaries containing likely causes, suggested actions, monitoring guidance, and escalation criteria</li>
            <li><strong>Pattern observations:</strong> automated analysis of check-in trends (e.g., &ldquo;3 consecutive nights of poor sleep detected&rdquo;), generated by rule-based logic (not machine learning)</li>
            <li><strong>Weekly summaries:</strong> AI-generated weekly summaries of check-in trends, patterns, and developmental observations, stored per baby profile and week number</li>
            <li><strong>Weekly developmental guides:</strong> AI-generated, age-appropriate weekly guides covering what to expect at your baby&apos;s current developmental stage, cached per gestational week or age</li>
          </ul>

          <h3 className="legal-h3">2.4 Emotional State Data</h3>
          <p><em>Legal basis: Explicit consent (GDPR Art. 6(1)(a), Art. 9(2)(a))</em></p>
          <ul>
            <li><strong>Inferred emotional signals:</strong> ok, tired, struggling, or distressed. These are determined by keyword matching against your messages (not by AI analysis). See our <a href="/legal/data-practices">AI &amp; Data Practices</a> page for the full explanation.</li>
            <li><strong>Parent wellbeing indicators:</strong> derived from emotional signal history over time.</li>
          </ul>
          <p>
            When a &ldquo;distressed&rdquo; signal is detected, Lumira will surface wellbeing resources and helpline information.
            This is an automated safety mechanism, not a clinical assessment.
          </p>

          <h3 className="legal-h3">2.5 Journal Entries</h3>
          <p><em>Legal basis: Explicit consent (GDPR Art. 6(1)(a))</em></p>
          <ul>
            <li>Free-text reflections and personal notes</li>
            <li>Entry dates</li>
          </ul>
          <p>
            Journal entries are personal to each parent. In a two-parent account, each parent&apos;s journal entries are visible
            only to them and are <strong>never</strong> shared with the other parent or sent to the AI.
          </p>

          <h3 className="legal-h3">2.6 Communication Data</h3>
          <p><em>Legal basis: Consent (GDPR Art. 6(1)(a)) and Legitimate interest (GDPR Art. 6(1)(f))</em></p>
          <ul>
            <li>Communication preferences (email, WhatsApp, SMS, push notification settings)</li>
            <li>Phone number (if voluntarily provided for WhatsApp or SMS; masked in the UI after entry)</li>
            <li>Preferred check-in time and timezone</li>
            <li>Quiet hours settings</li>
            <li>Communication delivery logs (channel, message type, delivery status, timestamp &mdash; for delivery debugging and anti-spam enforcement)</li>
          </ul>

          <h3 className="legal-h3">2.7 Notification Data</h3>
          <p><em>Legal basis: Contract performance (GDPR Art. 6(1)(b))</em></p>
          <ul>
            <li>In-app notifications (type, title, body, read/unread status, associated links)</li>
            <li>Notification delivery timestamps</li>
          </ul>
          <p>
            Notifications are used to inform you about pattern observations, weekly guide availability,
            concern follow-ups, and other Service-related updates. Notification data is deleted when your
            account is deleted.
          </p>

          <h3 className="legal-h3">2.8 Consent &amp; Preference Data</h3>
          <p><em>Legal basis: Legal obligation (GDPR Art. 6(1)(c))</em></p>
          <ul>
            <li><strong>Consent records:</strong> We track your consent status for each of the following categories: terms of service, privacy policy, data processing, sensitive data, community guidelines, acceptable use, AI data practices, marketing email, marketing SMS, marketing WhatsApp, analytics, product improvement, and third-party sharing. Each consent event (granted or withdrawn) is recorded as an immutable, timestamped entry.</li>
            <li><strong>Privacy preferences:</strong> AI processing opt-in/out, analytics opt-in/out, product improvement opt-in/out, and your chosen data retention period (12, 24, or 36 months).</li>
          </ul>

          <h3 className="legal-h3">2.9 Technical Data</h3>
          <p><em>Legal basis: Legitimate interest (GDPR Art. 6(1)(f))</em></p>
          <ul>
            <li>IP address &mdash; <strong>SHA-256 hashed before storage</strong>. We never store your raw IP address. Hashed IPs are used solely for security auditing and fraud prevention.</li>
            <li>User agent string (browser and device type)</li>
            <li>Session data (managed by Supabase)</li>
          </ul>
          <p><strong>We do NOT collect:</strong></p>
          <ul>
            <li>Precise or approximate location data</li>
            <li>Device identifiers (IDFA, GAID, or similar)</li>
            <li>Contact lists or address books</li>
            <li>Photos, camera, or microphone data</li>
            <li>Biometric data</li>
            <li>Financial or payment information (future payment processing will use a PCI-compliant third-party processor)</li>
          </ul>
        </div>
      </section>

      {/* ─── 3. How We Use Your Data ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">3. How We Use Your Data</h2>
        <div className="legal-body">
          <ul>
            <li><strong>Provide personalised parenting guidance:</strong> Your check-in data, baby&apos;s age, and stage are used to generate contextual, age-appropriate AI responses.</li>
            <li><strong>Generate weekly developmental guides:</strong> Your baby&apos;s gestational age or age in weeks is used to generate and cache stage-specific weekly content.</li>
            <li><strong>Detect patterns:</strong> Your check-in data over time is analysed using rule-based logic to identify trends in sleep, feeding, mood, and other categories (e.g., &ldquo;3 consecutive nights of poor sleep&rdquo;).</li>
            <li><strong>Screen for safety concerns:</strong> Your messages are scanned by a keyword-based red flag scanner (running locally within Lumira&apos;s infrastructure, not sent to AI) that detects twelve (12) categories of potentially urgent symptoms and directs you to emergency services or your healthcare provider when appropriate.</li>
            <li><strong>Infer emotional state:</strong> Your messages are scanned using keyword matching to infer whether you may be tired, struggling, or in distress, so Lumira can provide an appropriate tone of response and surface wellbeing resources when needed.</li>
            <li><strong>Generate concern summaries:</strong> When you use the concern flow feature, your structured answers are sent to the AI to generate a summary with likely causes, suggested actions, monitoring guidance, and escalation criteria.</li>
            <li><strong>Generate weekly summaries:</strong> Your check-in data is aggregated weekly to produce AI-generated summaries highlighting trends, observations, and developmental progress.</li>
            <li><strong>Track milestones:</strong> Your baby&apos;s milestone records are stored and used to provide contextual, stage-appropriate guidance.</li>
            <li><strong>Send notifications:</strong> We generate in-app notifications for pattern observations, weekly guide availability, and other Service-related updates.</li>
            <li><strong>Send communications:</strong> With your consent, we send daily check-in reminders, pattern alerts, weekly guide previews, and concern follow-ups via your preferred channel (email, WhatsApp, SMS, or push notification).</li>
            <li><strong>Provide community features:</strong> Your display name and posted content are shared within Tribes communities you join.</li>
            <li><strong>Improve the Service:</strong> We use anonymised, aggregated data (with all personal identifiers removed) to understand how the Service is used, identify and fix issues, and improve features. We never use identifiable personal data for product improvement without your explicit consent.</li>
            <li><strong>Comply with legal obligations:</strong> We retain consent records and audit logs as required by GDPR, CCPA, and other applicable regulations.</li>
          </ul>
        </div>
      </section>

      {/* ─── 4. AI Processing Transparency ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">4. AI Processing Transparency</h2>
        <div className="legal-body">
          <div className="legal-disclaimer-ai">
            <p style={{ marginBottom: '8px' }}><strong>What is sent to the AI</strong></p>
            <p style={{ marginBottom: '8px' }}>
              When you interact with Lumira, the following data is assembled into a context block and sent to Anthropic&apos;s
              Claude API to generate a response:
            </p>
            <ul style={{ paddingLeft: '20px', marginBottom: '8px' }}>
              <li>Your first name (for personalisation)</li>
              <li>Your baby&apos;s name and age/gestational week</li>
              <li>Your baby&apos;s developmental stage</li>
              <li>Your current message</li>
              <li>Recent check-in data (sleep, feeding, mood from the last few days)</li>
              <li>Recent conversation history (current session only)</li>
              <li>Recent pattern observations, if any</li>
              <li>A weekly summary of trends, if available</li>
            </ul>
            <p style={{ marginBottom: '8px' }}><strong>What is NOT sent to the AI:</strong></p>
            <ul style={{ paddingLeft: '20px' }}>
              <li>Your email address</li>
              <li>Your phone number</li>
              <li>Other users&apos; data</li>
              <li>Your journal entries</li>
              <li>Raw database records</li>
              <li>Consent records or audit logs</li>
            </ul>
          </div>
          <p>
            <strong>Anthropic&apos;s data handling.</strong> We use Anthropic&apos;s API (not the consumer product). Under
            Anthropic&apos;s API Terms of Service, Anthropic does <strong>not</strong> use API inputs or outputs to train its
            models. Your conversations with Lumira are not used by Anthropic for model training, fine-tuning, or improvement.
          </p>
          <p>
            <strong>AI model settings.</strong> Lumira uses Claude (currently claude-sonnet-4-6) with a temperature of 0.4 (a conservative
            setting that reduces randomness) and a maximum token output of 800 per response. These settings are chosen to favour
            consistency and conservatism over creativity.
          </p>
          <p>
            <strong>Opting out.</strong> You can disable AI processing at any time in Settings &rarr; Privacy &amp; Data. When AI
            processing is disabled, your check-ins are still recorded and patterns are still detected, but Lumira will not generate
            AI-powered conversational responses or send your data to Anthropic.
          </p>
        </div>
      </section>

      {/* ─── 5. Legal Basis (GDPR) ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">5. Legal Basis for Processing (GDPR)</h2>
        <div className="legal-body">
          <p>
            For users in the European Union and United Kingdom, we process your data under the following legal bases:
          </p>
          <table className="legal-table">
            <thead>
              <tr>
                <th>Data category</th>
                <th>Legal basis</th>
                <th>GDPR Article</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Account data (email, name)</td>
                <td>Contract performance</td>
                <td>Art. 6(1)(b)</td>
              </tr>
              <tr>
                <td>Baby profile data</td>
                <td>Contract performance + Parental consent</td>
                <td>Art. 6(1)(b), 6(1)(a)</td>
              </tr>
              <tr>
                <td>Health-adjacent check-in data</td>
                <td>Explicit consent</td>
                <td>Art. 6(1)(a), Art. 9(2)(a)</td>
              </tr>
              <tr>
                <td>Emotional state data</td>
                <td>Explicit consent</td>
                <td>Art. 6(1)(a), Art. 9(2)(a)</td>
              </tr>
              <tr>
                <td>Journal entries</td>
                <td>Explicit consent</td>
                <td>Art. 6(1)(a)</td>
              </tr>
              <tr>
                <td>AI conversation logs</td>
                <td>Explicit consent</td>
                <td>Art. 6(1)(a)</td>
              </tr>
              <tr>
                <td>Weekly summaries and guides</td>
                <td>Explicit consent (AI-generated content)</td>
                <td>Art. 6(1)(a)</td>
              </tr>
              <tr>
                <td>Notification records</td>
                <td>Contract performance</td>
                <td>Art. 6(1)(b)</td>
              </tr>
              <tr>
                <td>Communication preferences</td>
                <td>Contract (transactional) + Consent (marketing)</td>
                <td>Art. 6(1)(b), 6(1)(a)</td>
              </tr>
              <tr>
                <td>Communication delivery logs</td>
                <td>Legitimate interest</td>
                <td>Art. 6(1)(f)</td>
              </tr>
              <tr>
                <td>Technical data (hashed IP, user agent)</td>
                <td>Legitimate interest (security)</td>
                <td>Art. 6(1)(f)</td>
              </tr>
              <tr>
                <td>Consent records</td>
                <td>Legal obligation</td>
                <td>Art. 6(1)(c)</td>
              </tr>
              <tr>
                <td>Audit logs</td>
                <td>Legal obligation + Legitimate interest</td>
                <td>Art. 6(1)(c), 6(1)(f)</td>
              </tr>
            </tbody>
          </table>
          <p>
            <strong>Legitimate interest assessments.</strong> Where we rely on legitimate interest, we have conducted a balancing
            test to ensure our interests do not override your fundamental rights and freedoms. Our legitimate interests include:
            ensuring security and preventing fraud (technical data), maintaining delivery quality and enforcing anti-spam rules
            (communication logs), and meeting legal accountability requirements (audit logs). You have the right to object to
            processing based on legitimate interest (see Section 9).
          </p>
        </div>
      </section>

      {/* ─── 6. Data Sharing ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">6. Data Sharing &amp; Sub-Processors</h2>
        <div className="legal-body">
          <table className="legal-table">
            <thead>
              <tr>
                <th>Processor</th>
                <th>Purpose</th>
                <th>Data shared</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Anthropic, Inc. (Claude API)</td>
                <td>AI response generation</td>
                <td>Conversation context, baby age/stage, recent check-in data, first name, baby name</td>
                <td>United States</td>
              </tr>
              <tr>
                <td>Supabase, Inc.</td>
                <td>Database hosting, authentication, file storage</td>
                <td>All stored data (encrypted at rest)</td>
                <td>United States (AWS)</td>
              </tr>
              <tr>
                <td>Vercel, Inc.</td>
                <td>Application hosting, edge functions, CDN</td>
                <td>HTTP request metadata (routing only)</td>
                <td>Global CDN</td>
              </tr>
              <tr>
                <td>Resend, Inc.</td>
                <td>Transactional and marketing email delivery</td>
                <td>Email address, first name, email content</td>
                <td>United States</td>
              </tr>
              <tr>
                <td>Twilio, Inc.</td>
                <td>SMS and WhatsApp message delivery</td>
                <td>Phone number (if provided), message content</td>
                <td>United States</td>
              </tr>
            </tbody>
          </table>
          <p>
            Each sub-processor is bound by a Data Processing Agreement (DPA) that requires them to process data only on our
            instructions and to implement appropriate technical and organisational security measures.
          </p>
          <div className="legal-disclaimer-critical">
            <p style={{ marginBottom: '0' }}>
              <strong>We do NOT sell your personal data.</strong> We do NOT share your data with third parties for advertising.
              We do NOT use third-party advertising or marketing cookies. We do NOT permit our sub-processors to use your data
              for their own purposes.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 7. International Transfers ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">7. International Data Transfers</h2>
        <div className="legal-body">
          <p>
            Lumira is operated from the United States, and your data is primarily stored on servers located in the United States
            (via Supabase on AWS infrastructure).
          </p>
          <p>
            <strong>For EU/UK users:</strong> Personal data transferred from the European Economic Area (EEA) or United Kingdom
            to the United States is protected by Standard Contractual Clauses (SCCs) as adopted by the European Commission
            (Decision 2021/914) and, where applicable, the UK International Data Transfer Agreement or Addendum. Each of our
            sub-processors maintains SCCs or equivalent transfer mechanisms.
          </p>
          <p>
            <strong>For Indian users:</strong> Transfers of personal data outside India comply with the cross-border data
            transfer provisions of the Digital Personal Data Protection Act, 2023 (DPDPA). The Central Government of India has
            not yet notified restricted countries for data transfer; we will comply with any such restrictions when they are published.
          </p>
          <p>
            <strong>For Australian users:</strong> Transfers comply with Australian Privacy Principle (APP) 8. We take
            reasonable steps to ensure overseas recipients handle your personal information in accordance with the Australian
            Privacy Act 1988.
          </p>
          <p>
            <strong>For Canadian users:</strong> Transfers comply with PIPEDA. Your personal information may be accessible to
            law enforcement and national security authorities of the United States under US law.
          </p>
        </div>
      </section>

      {/* ─── 8. Data Retention ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">8. Data Retention</h2>
        <div className="legal-body">
          <table className="legal-table">
            <thead>
              <tr>
                <th>Data category</th>
                <th>Retention period</th>
                <th>Basis</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Active user data (profiles, check-ins, concerns, milestones, journals)</td>
                <td>User-configurable: 12, 24, or 36 months from last activity (default: 24 months)</td>
                <td>User preference</td>
              </tr>
              <tr>
                <td>AI conversation logs (chat threads and messages)</td>
                <td>Same as above (linked to check-ins and concern sessions)</td>
                <td>User preference</td>
              </tr>
              <tr>
                <td>Communication delivery logs</td>
                <td>2 years from creation</td>
                <td>Legitimate interest (delivery debugging)</td>
              </tr>
              <tr>
                <td>Consent records</td>
                <td>7 years from creation (immutable, append-only)</td>
                <td>Legal obligation (GDPR accountability)</td>
              </tr>
              <tr>
                <td>Audit logs</td>
                <td>7 years from creation (anonymised after account deletion)</td>
                <td>Legal obligation + Legitimate interest</td>
              </tr>
              <tr>
                <td>Notification records</td>
                <td>Same as active user data (user-configurable retention period)</td>
                <td>User preference</td>
              </tr>
              <tr>
                <td>Data export request logs</td>
                <td>90 days from creation</td>
                <td>Legitimate interest (request fulfillment and auditing)</td>
              </tr>
              <tr>
                <td>Anonymised aggregate data</td>
                <td>Indefinite</td>
                <td>Legitimate interest (product improvement)</td>
              </tr>
            </tbody>
          </table>
          <p>
            <strong>Account deletion.</strong> When you delete your account, the following occurs immediately:
          </p>
          <ul>
            <li>Personal identifiers (name, email, phone) are permanently erased.</li>
            <li>Check-in data, journal entries, chat threads and messages, concern sessions, weekly summaries, notifications, and pattern observations are permanently deleted.</li>
            <li>If you are in a two-parent account, the shared baby profile is retained for the other parent. If both parents delete, the baby profile is permanently deleted.</li>
            <li>Consent records are retained (with profile_id) for 7 years as required for GDPR accountability.</li>
            <li>Audit log entries are anonymised (profile_id set to NULL) and retained for 7 years.</li>
            <li>Your authentication record is deleted from Supabase Auth.</li>
          </ul>
          <p>
            You can configure your data retention period at any time in Settings &rarr; Privacy &amp; Data.
          </p>
        </div>
      </section>

      {/* ─── 9. Your Rights ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">9. Your Rights</h2>
        <div className="legal-body">

          <h3 className="legal-h3">9.1 Rights for All Users</h3>
          <p>Regardless of your location, you have the right to:</p>
          <ul>
            <li><strong>Access</strong> your data: Settings &rarr; Privacy &amp; Data &rarr; Download My Data (JSON export, generated within minutes, download link valid for 48 hours).</li>
            <li><strong>Correct</strong> inaccurate data: Settings &rarr; Profile, or contact us.</li>
            <li><strong>Delete</strong> your account and data: Settings &rarr; Privacy &amp; Data &rarr; Delete Account (confirmed via email verification for security).</li>
            <li><strong>Withdraw consent</strong> at any time: Settings &rarr; Privacy &amp; Data for AI processing, analytics, and individual communication channels. Withdrawal does not affect the lawfulness of processing performed before withdrawal.</li>
            <li><strong>Object to automated profiling:</strong> You may request human review of any automated assessment by contacting <a href="mailto:privacy@hellolumira.app">privacy@hellolumira.app</a>.</li>
            <li><strong>Lodge a complaint</strong> with your local data protection supervisory authority.</li>
          </ul>

          <h3 className="legal-h3">9.2 Additional Rights for EU/UK Users (GDPR)</h3>
          <p>Under the General Data Protection Regulation (GDPR) and UK GDPR, you also have the right to:</p>
          <ul>
            <li><strong>Data portability (Art. 20):</strong> Receive your personal data in a structured, commonly used, machine-readable format (JSON). Available via the Download My Data feature.</li>
            <li><strong>Restriction of processing (Art. 18):</strong> Request that we restrict the processing of your personal data in certain circumstances (e.g., while we verify the accuracy of data you have contested).</li>
            <li><strong>Object to processing based on legitimate interest (Art. 21):</strong> Object to our processing of your data where we rely on legitimate interest as the legal basis. We will cease processing unless we demonstrate compelling legitimate grounds that override your interests.</li>
            <li><strong>Right not to be subject to automated decision-making (Art. 22):</strong> Lumira does not make automated decisions with legal or similarly significant effects. Emotional state inferences and pattern observations are used for informational and supportive purposes only. You may request human review of any automated assessment.</li>
          </ul>
          <p>
            <strong>EU supervisory authorities:</strong> You may lodge a complaint with the data protection authority in your
            EU member state of habitual residence, place of work, or place of the alleged infringement.
            <br /><strong>UK supervisory authority:</strong> Information Commissioner&apos;s Office (ICO), ico.org.uk.
          </p>

          <h3 className="legal-h3">9.3 Additional Rights for California Residents (CCPA/CPRA)</h3>
          <p>Under the California Consumer Privacy Act (CCPA) as amended by the California Privacy Rights Act (CPRA), California residents have the right to:</p>
          <ul>
            <li><strong>Right to know:</strong> Request disclosure of the categories and specific pieces of personal information we have collected, the categories of sources, the business or commercial purpose for collecting, and the categories of third parties with whom we share personal information.</li>
            <li><strong>Right to delete:</strong> Request deletion of personal information we have collected (subject to certain exceptions under CCPA Section 1798.105).</li>
            <li><strong>Right to correct:</strong> Request correction of inaccurate personal information.</li>
            <li><strong>Right to opt-out of sale:</strong> We do <strong>NOT</strong> sell your personal information. We do not share personal information for cross-context behavioural advertising. No opt-out is necessary because no sale or sharing for advertising occurs.</li>
            <li><strong>Right to limit use of sensitive personal information:</strong> You may limit our use of sensitive personal information (health-adjacent check-in data, emotional state data) to uses necessary to provide the Service. Contact <a href="mailto:privacy@hellolumira.app">privacy@hellolumira.app</a>.</li>
            <li><strong>Right to non-discrimination:</strong> We will not discriminate against you for exercising your CCPA rights. You will not receive different pricing, quality of service, or access levels for exercising your rights.</li>
          </ul>
          <p>
            <strong>Categories of personal information collected in the preceding 12 months:</strong> Identifiers (name, email),
            internet activity (session data, hashed IP), health-related information (check-in data, concern flows), inferences
            (emotional state, pattern observations). We have not sold any personal information. We have disclosed personal
            information to our service providers as described in Section 6.
          </p>

          <h3 className="legal-h3">9.4 Additional Rights for Virginia, Colorado, Connecticut, Texas, Oregon, and Other US State Residents</h3>
          <p>
            If you reside in a US state with a comprehensive privacy law (including the Virginia Consumer Data Protection Act,
            Colorado Privacy Act, Connecticut Data Privacy Act, Texas Data Privacy and Security Act, Oregon Consumer Privacy Act,
            and others), you may have similar rights to access, delete, correct, and opt-out of certain processing. Contact{' '}
            <a href="mailto:privacy@hellolumira.app">privacy@hellolumira.app</a> to exercise these rights. We will respond within
            the timeframe required by your state&apos;s law (typically 45 days, extendable by an additional 45 days with notice).
          </p>

          <h3 className="legal-h3">9.5 Rights for Indian Users (DPDPA 2023)</h3>
          <p>Under the Digital Personal Data Protection Act, 2023 (DPDPA), Indian users (&ldquo;Data Principals&rdquo;) have the right to:</p>
          <ul>
            <li><strong>Access personal data:</strong> Request a summary of your personal data and processing activities.</li>
            <li><strong>Correction and erasure:</strong> Request correction of inaccurate data and erasure of data that is no longer necessary.</li>
            <li><strong>Nomination:</strong> Designate another person to exercise your data rights in the event of your death or incapacity.</li>
            <li><strong>Grievance redressal:</strong> Contact our Grievance Officer (or, until appointed, <a href="mailto:privacy@hellolumira.app">privacy@hellolumira.app</a>) for any complaints. We will acknowledge your grievance within 48 hours and resolve it within 30 days.</li>
          </ul>
          <p>
            As a Data Fiduciary, Lumira will comply with all obligations under the DPDPA, including obtaining verifiable consent
            before processing and implementing reasonable security safeguards.
          </p>

          <h3 className="legal-h3">9.6 Rights for Australian Users</h3>
          <p>
            Under the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs), you have the right to access and
            correct your personal information. If you believe we have breached the APPs, you may lodge a complaint with the
            Office of the Australian Information Commissioner (OAIC) at oaic.gov.au.
          </p>

          <h3 className="legal-h3">9.7 How to Exercise Your Rights</h3>
          <div className="legal-callout">
            <strong>Self-service (fastest):</strong> Settings &rarr; Privacy &amp; Data (access, download, delete, consent management)<br /><br />
            <strong>By email:</strong> <a href="mailto:privacy@hellolumira.app">privacy@hellolumira.app</a><br /><br />
            <strong>Response times:</strong> We will acknowledge your request within 48 hours and fulfil it within 30 days
            (or 45 days for CCPA requests, extendable by 45 days with notice). For complex requests, we may extend by an
            additional 60 days under GDPR Art. 12(3), with notice.<br /><br />
            <strong>Verification:</strong> We may ask you to verify your identity before processing your request to prevent
            unauthorised access to your data. Verification is typically performed via your authenticated Lumira session or
            a magic link sent to your registered email address.
          </div>
        </div>
      </section>

      {/* ─── 10. Children's Data ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">10. Children&apos;s Data</h2>
        <div className="legal-body">
          <p>
            Lumira processes data <strong>about</strong> children (infants and toddlers aged 0&ndash;36 months), not <strong>from</strong> children.
            All baby data is provided by and controlled by the parent or legal guardian who creates the account.
          </p>
          <ul>
            <li>Only a parent or legal guardian may enter data about their child into Lumira.</li>
            <li>In a two-parent account, both parents have equal data rights over the shared baby profile.</li>
            <li>Baby profile data is deleted when the parent account is deleted, unless a co-parent account retains access to the baby profile.</li>
            <li>Children do not use Lumira directly. The Service is designed for use by adults (18+) only.</li>
          </ul>
          <p>
            <strong>COPPA (US):</strong> Because Lumira does not collect personal information directly from children under 13,
            COPPA&apos;s verifiable parental consent requirements do not apply in the traditional sense. Nonetheless, because
            we process sensitive data about children (provided by their parents), we apply COPPA-level protections to all baby data.
          </p>
          <p>
            <strong>GDPR Art. 8 (EU):</strong> Information society services requiring consent from children require parental
            consent. As Lumira is used by parents and collects child data from parents, the parent&apos;s explicit consent at
            onboarding satisfies this requirement.
          </p>
          <p>
            <strong>UK Age Appropriate Design Code (AADC):</strong> Lumira&apos;s data practices for child data comply with
            the &ldquo;best interests of the child&rdquo; standard. We collect the minimum data necessary, apply the highest
            privacy settings by default, and do not use child data for profiling or marketing.
          </p>
          <p>
            <strong>DPDPA Section 9 (India):</strong> Lumira obtains verifiable consent from the parent or legal guardian
            before processing any data relating to a child. We do not track, behaviourally monitor, or target advertising at
            children.
          </p>
        </div>
      </section>

      {/* ─── 11. Cookies ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">11. Cookies &amp; Tracking</h2>
        <div className="legal-body">
          <p>
            Lumira uses a minimal cookie footprint. The only cookies we use are:
          </p>
          <table className="legal-table">
            <thead>
              <tr>
                <th>Cookie</th>
                <th>Purpose</th>
                <th>Type</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Supabase auth session</td>
                <td>Authenticating your logged-in session</td>
                <td>Strictly necessary</td>
                <td>Session / 7 days</td>
              </tr>
            </tbody>
          </table>
          <p>
            We do <strong>not</strong> use:
          </p>
          <ul>
            <li>Analytics cookies (no Google Analytics, Mixpanel, Amplitude, or similar)</li>
            <li>Advertising cookies</li>
            <li>Third-party tracking cookies</li>
            <li>Tracking pixels or web beacons</li>
            <li>Browser fingerprinting</li>
            <li>Cross-site tracking of any kind</li>
          </ul>
          <p>
            Because we only use strictly necessary cookies, no cookie consent banner is required. If we add non-essential cookies
            in the future, we will update this policy and implement a consent mechanism before deploying them.
          </p>
        </div>
      </section>

      {/* ─── 12. Security ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">12. Security</h2>
        <div className="legal-body">
          <p>
            We implement technical and organisational measures to protect your personal data, including:
          </p>
          <ul>
            <li><strong>Encryption in transit:</strong> All data transmitted between your browser and Lumira&apos;s servers is encrypted using TLS 1.3.</li>
            <li><strong>Encryption at rest:</strong> All data stored in our database (Supabase on AWS) is encrypted at rest using AES-256.</li>
            <li><strong>Row Level Security (RLS):</strong> Every database table is protected by Supabase Row Level Security policies, ensuring users can only access their own data. RLS policies are enforced at the database level and cannot be bypassed by application code.</li>
            <li><strong>IP address hashing:</strong> IP addresses are SHA-256 hashed before storage. Raw IP addresses are never written to any database table or log.</li>
            <li><strong>Immutable audit trail:</strong> Consent records and audit logs are append-only. Database rules prevent any UPDATE or DELETE operations on these tables. Every consent change creates a new, timestamped, immutable record.</li>
            <li><strong>Passwordless authentication:</strong> Magic link authentication eliminates the risk of password-based attacks (credential stuffing, brute force).</li>
            <li><strong>Minimal data collection:</strong> We collect only the data necessary to provide the Service (see Section 2.9 for data we do NOT collect).</li>
          </ul>
          <p>
            <strong>Data breach response.</strong> In the event of a data breach involving personal data:
          </p>
          <ol>
            <li>We will assess the scope of the breach within 24 hours of detection.</li>
            <li>If the breach is likely to result in a risk to your rights and freedoms, we will notify the relevant supervisory authority within 72 hours (per GDPR Art. 33).</li>
            <li>If the breach is likely to result in a high risk to your rights and freedoms, we will notify affected users without undue delay (per GDPR Art. 34).</li>
            <li>All breach response actions will be logged in the audit trail.</li>
          </ol>
        </div>
      </section>

      {/* ─── 13. Do Not Track ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">13. Do Not Track</h2>
        <div className="legal-body">
          <p>
            We honour Do Not Track (DNT) browser signals. However, because we do not engage in any form of cross-site tracking,
            third-party tracking, or behavioural advertising, your experience with Lumira is the same regardless of your DNT setting.
            We do not track you across third-party websites or services.
          </p>
        </div>
      </section>

      {/* ─── 14. Changes ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">14. Changes to This Policy</h2>
        <div className="legal-body">
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements,
            or for other operational reasons.
          </p>
          <ul>
            <li><strong>Material changes:</strong> We will provide at least thirty (30) days&apos; prior notice via the email address associated with your account. We may also require you to re-consent during your next login.</li>
            <li><strong>Non-material changes:</strong> We will update the &ldquo;Effective date&rdquo; and &ldquo;Version&rdquo; at the top of this page.</li>
          </ul>
          <p>
            Your continued use of Lumira after the effective date of the updated Privacy Policy constitutes your acceptance of
            those changes. If you disagree with the updated policy, you should stop using the Service and delete your account.
          </p>
        </div>
      </section>

      {/* ─── 15. Contact ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">15. Contact</h2>
        <div className="legal-body">
          <div className="legal-callout">
            <strong>Privacy enquiries:</strong> <a href="mailto:privacy@hellolumira.app">privacy@hellolumira.app</a><br />
            <strong>Legal enquiries:</strong> <a href="mailto:legal@hellolumira.app">legal@hellolumira.app</a><br />
            <strong>Data protection requests:</strong> Settings &rarr; Privacy &amp; Data, or email privacy@hellolumira.app<br /><br />
            <strong>EU/UK complaints:</strong> You may lodge a complaint with your local supervisory authority. UK: Information Commissioner&apos;s Office (ICO), ico.org.uk.<br />
            <strong>India grievances:</strong> <a href="mailto:privacy@hellolumira.app">privacy@hellolumira.app</a> (Grievance Officer to be appointed)<br />
            <strong>Australia complaints:</strong> Office of the Australian Information Commissioner (OAIC), oaic.gov.au
          </div>
        </div>
      </section>
    </>
  )
}
