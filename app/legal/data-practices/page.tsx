// app/legal/data-practices/page.tsx — AI & Data Practices
import type { Metadata } from 'next'
import { LEGAL_VERSIONS, formatLegalDate } from '@/lib/legal-content'

export const metadata: Metadata = {
  title: 'AI & Data Practices',
  description: 'How Lumira uses AI, processes your data, and protects your privacy. A plain-language guide to our AI and data practices.',
}

export default function AIDataPracticesPage() {
  const v = LEGAL_VERSIONS['data-practices']
  return (
    <>
      <h1 className="legal-h1">AI &amp; Data Practices</h1>
      <div className="legal-meta">
        <span>Effective: {formatLegalDate(v.effectiveDate)}</span>
        <span>Version {v.version}</span>
        <span>Last updated: {formatLegalDate(v.lastUpdated)}</span>
      </div>

      {/* ─── Introduction ─── */}
      <section className="legal-section">
        <div className="legal-body">
          <p>
            This document explains, in plain language, how Lumira uses artificial intelligence, what data is sent to
            AI systems, how we protect that data, and what safeguards we have in place. This document supplements our{' '}
            <a href="/legal/privacy">Privacy Policy</a> and <a href="/legal/terms">Terms of Service</a> and is
            intended to provide transparency about our AI system in accordance with the EU AI Act, GDPR, CCPA/CPRA,
            India&apos;s Digital Personal Data Protection Act 2023 (DPDPA), and Australia&apos;s Privacy Act.
          </p>
          <div className="legal-disclaimer-critical">
            <p className="legal-caps" style={{ marginBottom: '12px' }}>
              LUMIRA IS NOT A MEDICAL DEVICE. LUMIRA IS NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL ADVICE, DIAGNOSIS,
              OR TREATMENT. AI-GENERATED CONTENT IS FOR INFORMATIONAL AND EDUCATIONAL PURPOSES ONLY.
            </p>
            <p>
              All AI outputs should be verified with a qualified healthcare professional before acting on them.
              In case of a medical emergency, call 911 (US), 999 (UK), 112 (EU/India), 000 (Australia), or your local
              emergency number immediately.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 1. AI System Overview ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">1. How AI Works in Lumira</h2>
        <div className="legal-body">
          <div className="legal-disclaimer-ai">
            <p style={{ marginBottom: '8px' }}><strong>AI System Transparency (EU AI Act Compliance)</strong></p>
            <p>
              Lumira uses Claude, a large language model (LLM) developed by Anthropic, Inc. (San Francisco, California).
              Lumira is classified as a limited-risk AI system under the EU AI Act, as it interacts directly with users
              and generates content that users may rely upon for parenting decisions. In accordance with Article 50
              of the EU AI Act (Regulation (EU) 2024/1689), we provide the following transparency disclosures.
            </p>
          </div>

          <h3 className="legal-h3">1.1 What the AI does</h3>
          <p>Lumira&apos;s AI performs the following functions:</p>
          <ul>
            <li><strong>Conversational responses.</strong> When you submit a check-in or ask a parenting question, the AI generates a personalised, supportive response based on your baby&apos;s developmental stage and the context you provide.</li>
            <li><strong>Weekly developmental guides.</strong> The AI generates age-appropriate weekly guides covering what to expect at your baby&apos;s current stage.</li>
            <li><strong>Concern summaries.</strong> When you express a concern during a check-in, the AI generates a structured summary with context, potential explanations, and recommendations (always including a recommendation to consult a healthcare professional).</li>
            <li><strong>Pattern observations.</strong> Rule-based logic (not AI) analyses your check-in history to identify trends in sleep, feeding, mood, and energy. The AI may reference these patterns in its responses.</li>
          </ul>

          <h3 className="legal-h3">1.2 What the AI does not do</h3>
          <ul>
            <li>The AI does not diagnose medical conditions.</li>
            <li>The AI does not prescribe or recommend medications.</li>
            <li>The AI does not make automated decisions with legal or similarly significant effects on you.</li>
            <li>The AI does not replace the judgement of a qualified healthcare professional.</li>
            <li>The AI does not have access to real-time medical databases, clinical trial results, or electronic health records.</li>
            <li>The AI cannot physically examine, observe, or assess your child.</li>
          </ul>

          <h3 className="legal-h3">1.3 Human oversight (EU AI Act)</h3>
          <p>
            In accordance with the EU AI Act&apos;s requirements for human oversight of AI systems:
          </p>
          <ul>
            <li>All AI system prompts are designed, reviewed, and maintained by Lumira&apos;s team.</li>
            <li>The red flag scanner (Section 3) operates as a pre-AI safety layer with human-defined rules.</li>
            <li>Users can report concerning AI responses at any time, and reports are reviewed by humans.</li>
            <li>Users can opt out of AI processing entirely in Settings, maintaining full access to non-AI features.</li>
            <li>Medical disclaimers are hardcoded into the application interface and cannot be overridden by AI output.</li>
          </ul>
        </div>
      </section>

      {/* ─── 2. AI Configuration ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">2. AI Configuration &amp; Anti-Hallucination Measures</h2>
        <div className="legal-body">
          <p>
            We configure Lumira&apos;s AI with safety and accuracy as primary objectives:
          </p>

          <h3 className="legal-h3">2.1 Temperature setting</h3>
          <p>
            Lumira uses a temperature setting of <strong>0.4</strong> (on a scale of 0.0 to 1.0) for AI content
            generation. A lower temperature produces more consistent, predictable responses with less creative
            variation. We chose 0.4 as a balance between consistency and natural conversational tone. This does
            not guarantee accuracy &mdash; temperature controls randomness in word selection, not factual correctness.
          </p>

          <h3 className="legal-h3">2.2 Anti-hallucination measures</h3>
          <p>
            &ldquo;Hallucination&rdquo; refers to AI generating plausible-sounding but factually incorrect information.
            Lumira employs several measures to reduce hallucination risk:
          </p>
          <ul>
            <li><strong>Structured system prompts.</strong> The AI operates under detailed system instructions that constrain its responses to the domain of parenting support and require it to acknowledge uncertainty when appropriate.</li>
            <li><strong>Explicit uncertainty language.</strong> The AI is instructed to use hedging language (&ldquo;this might be,&rdquo; &ldquo;some parents find,&rdquo; &ldquo;consider asking your doctor about&rdquo;) rather than making definitive claims about medical or developmental topics.</li>
            <li><strong>No citation of specific studies.</strong> The AI is instructed not to cite specific research studies, journal articles, or statistics, as it cannot verify citation accuracy in real time.</li>
            <li><strong>Scope boundaries.</strong> The AI is instructed to decline requests outside its scope (e.g., legal advice, financial advice, relationship counselling beyond the parenting context).</li>
            <li><strong>Consistent medical disclaimers.</strong> Medical disclaimer text is rendered by the application, not generated by the AI, ensuring it cannot be omitted or altered by AI output.</li>
          </ul>
          <p>
            <strong>Important:</strong> Despite these measures, AI hallucination cannot be fully eliminated with current
            technology. AI-generated content may still contain inaccuracies. Always verify information with a qualified
            professional.
          </p>
        </div>
      </section>

      {/* ─── 3. Red Flag Scanner ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">3. Red Flag Scanner</h2>
        <div className="legal-body">
          <div className="legal-disclaimer-critical">
            <p style={{ marginBottom: '12px' }}>
              <strong>The red flag scanner is a supplementary safety layer, not a diagnostic tool.</strong> It may
              fail to identify serious or emergency medical conditions. It does not replace the judgement of a
              qualified healthcare professional.
            </p>
          </div>
          <p>
            Before your message reaches the AI model, it passes through a <strong>red flag scanner</strong> &mdash;
            a keyword-based safety system that runs entirely within Lumira&apos;s infrastructure (not sent to
            Anthropic). The scanner covers <strong>twelve (12) emergency categories</strong> (including breathing
            emergencies, choking, seizures, high fever in newborns, unresponsiveness, severe bleeding, head
            injuries, ingestion/poisoning, severe allergic reactions, reduced fetal movement, preterm labour
            signs, and suicidal ideation) and assigns one of four escalation levels: <strong>emergency</strong>,{' '}
            <strong>urgent</strong>, <strong>call_doctor</strong>, or <strong>monitor</strong>. The scanner operates as follows:
          </p>
          <ul>
            <li><strong>Keyword matching.</strong> The scanner checks your message against a curated list of keywords and phrases associated with potentially urgent symptoms (e.g., &ldquo;not breathing,&rdquo; &ldquo;high fever,&rdquo; &ldquo;seizure,&rdquo; &ldquo;blue lips&rdquo;).</li>
            <li><strong>Immediate safety response.</strong> If a red flag is detected, Lumira displays an immediate, prominent safety message directing you to contact emergency services or your healthcare provider, <em>before</em> the AI generates its response.</li>
            <li><strong>Not a filter.</strong> The red flag scanner does not prevent the AI from responding. It adds a safety layer on top of the normal AI response flow.</li>
            <li><strong>Rule-based, not AI.</strong> The scanner uses deterministic keyword matching, not AI. It is not subject to hallucination but is limited to the keywords in its database.</li>
          </ul>
          <p>
            The red flag scanner keyword list is maintained by Lumira&apos;s team and is updated periodically. It is
            designed to be over-inclusive (false positives are preferred over false negatives).
          </p>
        </div>
      </section>

      {/* ─── 4. What Data Is Sent to AI ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">4. What Data Is Sent to the AI</h2>
        <div className="legal-body">
          <p>
            When Lumira generates an AI response, the following contextual data is included in the prompt sent to
            Anthropic&apos;s Claude API:
          </p>
          <table className="legal-table">
            <thead>
              <tr>
                <th>Data sent</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Baby&apos;s developmental stage (e.g., &ldquo;12 weeks old&rdquo;)</td>
                <td>Generate age-appropriate guidance</td>
              </tr>
              <tr>
                <td>Current check-in data (mood, energy, sleep, feeding notes)</td>
                <td>Personalise the response to your current situation</td>
              </tr>
              <tr>
                <td>Your message or concern text</td>
                <td>Respond to your specific question or concern</td>
              </tr>
              <tr>
                <td>Recent pattern summary (e.g., &ldquo;sleep has decreased over 5 days&rdquo;)</td>
                <td>Provide contextual observations</td>
              </tr>
              <tr>
                <td>Pregnancy status and trimester (if applicable)</td>
                <td>Generate pregnancy-stage-appropriate content</td>
              </tr>
              <tr>
                <td>Baby&apos;s name (first name only, e.g., &ldquo;Meera&rdquo;)</td>
                <td>Personalise responses (use baby&apos;s name instead of &ldquo;your baby&rdquo;)</td>
              </tr>
              <tr>
                <td>Parent&apos;s first name</td>
                <td>Personalise the conversational tone</td>
              </tr>
              <tr>
                <td>Weekly summary of trends (if available)</td>
                <td>Provide additional context for more informed responses</td>
              </tr>
              <tr>
                <td>Recent conversation history (current session)</td>
                <td>Maintain conversational continuity within the session</td>
              </tr>
            </tbody>
          </table>

          <h3 className="legal-h3">4.1 What is NOT sent to the AI</h3>
          <table className="legal-table">
            <thead>
              <tr>
                <th>Data not sent</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Email address</td>
                <td>Not needed for AI response generation</td>
              </tr>
              <tr>
                <td>Physical address or location</td>
                <td>Not collected by Lumira</td>
              </tr>
              <tr>
                <td>IP address (raw or hashed)</td>
                <td>Not relevant to AI processing</td>
              </tr>
              <tr>
                <td>Account identifiers (user ID, session ID)</td>
                <td>Not needed for AI response generation</td>
              </tr>
              <tr>
                <td>Journal entries</td>
                <td>Personal and private; never processed by AI</td>
              </tr>
              <tr>
                <td>Phone number</td>
                <td>Not needed for AI response generation</td>
              </tr>
              <tr>
                <td>Partner or co-parent data</td>
                <td>Not relevant to individual AI interaction</td>
              </tr>
              <tr>
                <td>Consent records or audit logs</td>
                <td>Administrative data; not relevant to AI processing</td>
              </tr>
              <tr>
                <td>Payment information</td>
                <td>Not collected by Lumira directly</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── 5. Emotional Signal Detection ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">5. Emotional Signal Detection</h2>
        <div className="legal-body">
          <div className="legal-disclaimer-ai">
            <p style={{ marginBottom: '8px' }}><strong>Disclaimer</strong></p>
            <p>
              Emotional signal detection is an approximate, keyword-based system. It is not a mental health screening
              tool, diagnostic instrument, or clinical assessment. It cannot detect clinical depression, anxiety
              disorders, or other mental health conditions. If you are experiencing mental health difficulties,
              please contact a qualified mental health professional or a crisis helpline.
            </p>
          </div>
          <p>
            Lumira includes a basic emotional signal detection system that analyses keywords in your check-in messages
            to infer approximate emotional states (e.g., &ldquo;tired,&rdquo; &ldquo;struggling,&rdquo;
            &ldquo;overwhelmed,&rdquo; &ldquo;happy,&rdquo; &ldquo;grateful&rdquo;). This system:
          </p>
          <ul>
            <li>Uses keyword matching, not AI-based sentiment analysis.</li>
            <li>Is used to tailor the tone of AI responses (e.g., offering more empathetic language when distress signals are detected).</li>
            <li>May surface wellbeing resources (e.g., postpartum support helplines) when sustained distress patterns are detected over multiple check-ins.</li>
            <li>Does not store emotional state data separately from your check-in records.</li>
            <li>Does not share emotional state data with third parties.</li>
            <li>Can be disabled in Settings &rarr; Privacy &amp; Data.</li>
          </ul>
          <p>
            <strong>Limitations.</strong> This system cannot detect sarcasm, irony, or nuanced emotional expression.
            It may misidentify your emotional state. If you find the emotional signal detection unhelpful or
            inaccurate, you may disable it without affecting other Lumira features.
          </p>
        </div>
      </section>

      {/* ─── 6. Data Retention for AI ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">6. Data Retention</h2>
        <div className="legal-body">
          <h3 className="legal-h3">6.1 Lumira&apos;s data retention</h3>
          <p>
            Your check-in data, journal entries, concern summaries, and AI-generated responses are stored in
            Lumira&apos;s database (hosted on Supabase). You control your data retention period through Settings:
          </p>
          <ul>
            <li>Available retention periods: <strong>12 months</strong>, <strong>24 months</strong>, or <strong>36 months</strong>.</li>
            <li>When data exceeds your chosen retention period, it is automatically and permanently deleted.</li>
            <li>You may request immediate deletion of all your data at any time by deleting your account or contacting <a href="mailto:privacy@hellolumira.app">privacy@hellolumira.app</a>.</li>
            <li>Consent records are retained for seven (7) years as immutable, append-only entries (required for GDPR accountability). Audit logs are anonymised upon account deletion and retained for seven (7) years.</li>
          </ul>

          <h3 className="legal-h3">6.2 Anthropic&apos;s data handling</h3>
          <p>
            When data is sent to Anthropic&apos;s Claude API for processing:
          </p>
          <ul>
            <li><strong>No training on your data.</strong> Lumira uses Anthropic&apos;s API with data usage controls that prevent your data from being used to train or improve Anthropic&apos;s models. This is contractually guaranteed through our data processing agreement with Anthropic.</li>
            <li><strong>Transient processing.</strong> Data sent to Anthropic&apos;s API is processed to generate a response and is not retained by Anthropic beyond the duration necessary to generate that response, subject to Anthropic&apos;s data retention policies for API customers (which provide for short-term logging for abuse prevention and safety monitoring).</li>
            <li><strong>No human review by Anthropic.</strong> Under normal operating conditions, your prompts and responses are not reviewed by Anthropic employees. Anthropic reserves the right to review API logs in limited circumstances (e.g., investigating safety incidents or policy violations), as described in Anthropic&apos;s API terms of service.</li>
          </ul>
        </div>
      </section>

      {/* ─── 7. Jurisdiction-Specific Rights ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">7. Your Rights by Jurisdiction</h2>
        <div className="legal-body">
          <p>
            Depending on your location, you may have specific rights regarding how your data is processed by Lumira&apos;s
            AI system. For full details, see our <a href="/legal/privacy">Privacy Policy</a>. A summary of key
            jurisdiction-specific rights related to AI processing follows.
          </p>

          <h3 className="legal-h3">7.1 European Union &amp; United Kingdom (GDPR)</h3>
          <ul>
            <li><strong>Lawful basis.</strong> AI processing of your data is based on your explicit consent, which you grant during onboarding and may withdraw at any time in Settings.</li>
            <li><strong>Right to explanation.</strong> You have the right to understand how AI-generated content is produced. This document serves as our transparency disclosure.</li>
            <li><strong>Right to object.</strong> You may object to AI processing at any time by opting out in Settings &rarr; Privacy &amp; Data.</li>
            <li><strong>Right to lodge a complaint.</strong> You have the right to lodge a complaint with your local data protection supervisory authority (e.g., the ICO in the UK, CNIL in France, BfDI in Germany).</li>
            <li><strong>Data Protection Officer.</strong> You may contact our Data Protection Officer at <a href="mailto:dpo@hellolumira.app">dpo@hellolumira.app</a>.</li>
            <li><strong>Data transfers.</strong> Data sent to Anthropic&apos;s API is processed in the United States. We rely on Standard Contractual Clauses (SCCs) as the transfer mechanism.</li>
          </ul>

          <h3 className="legal-h3">7.2 California, United States (CCPA/CPRA)</h3>
          <ul>
            <li><strong>Right to know.</strong> You have the right to know what personal information we collect about you, the purposes for which it is used, and the categories of third parties with whom it is shared.</li>
            <li><strong>Right to delete.</strong> You may request deletion of your personal information, subject to certain exceptions under the CCPA.</li>
            <li><strong>Right to opt out of sale.</strong> Lumira does not sell your personal information. We do not sell personal data to third parties, and we do not share personal data for cross-context behavioural advertising. You have the right to direct us not to sell your personal information by contacting <a href="mailto:privacy@hellolumira.app">privacy@hellolumira.app</a> with the subject line &ldquo;Do Not Sell My Personal Information.&rdquo;</li>
            <li><strong>Right to non-discrimination.</strong> We will not discriminate against you for exercising any of your CCPA rights.</li>
            <li><strong>Sensitive personal information.</strong> Health-related data you provide (check-in data, concerns, feeding and sleep information) is classified as sensitive personal information under the CPRA. We use this data solely for the purpose of providing the Service and do not use it for purposes beyond what is reasonably expected by consumers.</li>
          </ul>

          <h3 className="legal-h3">7.3 India (DPDPA 2023)</h3>
          <ul>
            <li><strong>Data fiduciary obligations.</strong> Lumira, as a data fiduciary, processes your personal data only for the purposes you have consented to and in accordance with the Digital Personal Data Protection Act 2023.</li>
            <li><strong>Consent.</strong> We obtain your clear, informed, and specific consent before processing your personal data. You may withdraw consent at any time through Settings.</li>
            <li><strong>Right to correction and erasure.</strong> You have the right to request correction of inaccurate data and erasure of your personal data.</li>
            <li><strong>Right to grievance redressal.</strong> You may raise a grievance about our data processing practices by contacting <a href="mailto:privacy@hellolumira.app">privacy@hellolumira.app</a>. We will acknowledge your grievance within 48 hours and provide a response within 30 days.</li>
            <li><strong>Children&apos;s data.</strong> Data about your child is processed with your verifiable parental consent, in accordance with the DPDPA&apos;s provisions regarding children&apos;s data.</li>
          </ul>

          <h3 className="legal-h3">7.4 Australia (Privacy Act 1988)</h3>
          <ul>
            <li><strong>Australian Privacy Principles (APPs).</strong> Lumira complies with the APPs in its collection, use, and disclosure of personal information of Australian users.</li>
            <li><strong>Cross-border disclosure.</strong> Your personal information may be disclosed to Anthropic, Inc. in the United States for AI processing. By using the Service, you consent to this cross-border transfer.</li>
            <li><strong>Access and correction.</strong> You have the right to access and request correction of your personal information held by Lumira.</li>
            <li><strong>Complaints.</strong> If you believe we have breached the APPs, you may lodge a complaint by emailing <a href="mailto:privacy@hellolumira.app">privacy@hellolumira.app</a>. If you are not satisfied with our response, you may lodge a complaint with the Office of the Australian Information Commissioner (OAIC).</li>
          </ul>
        </div>
      </section>

      {/* ─── 8. Security ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">8. Data Security</h2>
        <div className="legal-body">
          <p>
            We implement the following technical and organisational measures to protect data processed by our AI system:
          </p>
          <ul>
            <li><strong>Encryption in transit.</strong> All data sent between your device, Lumira&apos;s servers, and Anthropic&apos;s API is encrypted using TLS 1.3.</li>
            <li><strong>Encryption at rest.</strong> All data stored in Lumira&apos;s database is encrypted at rest using AES-256 encryption.</li>
            <li><strong>Minimal data in prompts.</strong> We send only the contextual data necessary for generating a relevant response (see Section 4). We do not send your full account profile or historical data to the AI in every request.</li>
            <li><strong>Row-level security.</strong> Supabase row-level security (RLS) policies ensure that users can only access their own data.</li>
            <li><strong>IP address hashing.</strong> We never store raw IP addresses. All IP addresses are hashed using SHA-256 before storage.</li>
            <li><strong>Audit logging.</strong> All consent changes, data access events, and account actions are logged in append-only audit tables.</li>
            <li><strong>Regular review.</strong> AI system prompts, safety filters, and data handling practices are reviewed and updated regularly.</li>
          </ul>
        </div>
      </section>

      {/* ─── 9. Opt-Out ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">9. Opting Out of AI Processing</h2>
        <div className="legal-body">
          <p>
            You have the right to use Lumira without AI-powered features. To opt out:
          </p>
          <ul>
            <li>Navigate to <strong>Settings &rarr; Privacy &amp; Data &rarr; AI Processing</strong>.</li>
            <li>Toggle off &ldquo;Enable AI-powered responses.&rdquo;</li>
          </ul>
          <p>
            When AI processing is disabled:
          </p>
          <ul>
            <li>You will still be able to log daily check-ins, track milestones, and use the journal feature.</li>
            <li>Pattern observations (sleep, feeding, mood trends) will continue to work, as they use rule-based logic, not AI.</li>
            <li>You will not receive AI-generated conversational responses, concern summaries, or weekly developmental guides.</li>
            <li>No data will be sent to Anthropic&apos;s API.</li>
          </ul>
          <p>
            You may re-enable AI processing at any time in Settings.
          </p>
        </div>
      </section>

      {/* ─── 10. Changes ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">10. Changes to This Document</h2>
        <div className="legal-body">
          <p>
            We may update this AI &amp; Data Practices document as our AI systems, data handling practices, or
            applicable regulations evolve. When we make material changes, we will notify you via email or through a
            prominent notice within the Service at least fourteen (14) days before the changes take effect. The version
            number and effective date at the top of this page indicate the current version.
          </p>
        </div>
      </section>

      {/* ─── 11. Contact ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">11. Contact</h2>
        <div className="legal-body">
          <p>
            If you have questions about Lumira&apos;s AI system, data practices, or this document, please contact us:
          </p>
          <div className="legal-callout">
            <strong>Lumira Data &amp; AI Team</strong><br />
            Privacy enquiries: <a href="mailto:privacy@hellolumira.app">privacy@hellolumira.app</a><br />
            Data Protection Officer: <a href="mailto:dpo@hellolumira.app">dpo@hellolumira.app</a><br />
            AI safety concerns: <a href="mailto:safety@hellolumira.app">safety@hellolumira.app</a><br />
            General legal enquiries: <a href="mailto:legal@hellolumira.app">legal@hellolumira.app</a>
          </div>
        </div>
      </section>
    </>
  )
}
