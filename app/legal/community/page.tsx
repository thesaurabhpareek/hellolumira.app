// app/legal/community/page.tsx — Community Guidelines (Tribes)
import type { Metadata } from 'next'
import { LEGAL_VERSIONS, formatLegalDate } from '@/lib/legal-content'

export const metadata: Metadata = {
  title: 'Community Guidelines',
  description: 'Community Guidelines for Lumira Tribes. Standards for respectful, safe participation in our parenting community.',
}

export default function CommunityGuidelinesPage() {
  const v = LEGAL_VERSIONS.community
  return (
    <>
      <h1 className="legal-h1">Community Guidelines</h1>
      <div className="legal-meta">
        <span>Effective: {formatLegalDate(v.effectiveDate)}</span>
        <span>Version {v.version}</span>
        <span>Last updated: {formatLegalDate(v.lastUpdated)}</span>
      </div>

      {/* ─── Introduction ─── */}
      <section className="legal-section">
        <div className="legal-body">
          <p>
            Lumira Tribes (&ldquo;Tribes&rdquo;) is a community feature that connects parents to share experiences,
            ask questions, and support one another through the journey of pregnancy and early parenthood. These Community
            Guidelines (&ldquo;Guidelines&rdquo;) set the standards for participation in Tribes. They are incorporated
            into and form part of our <a href="/legal/terms">Terms of Service</a>.
          </p>
          <p>
            By posting, commenting, reacting, or otherwise participating in Tribes, you agree to abide by these Guidelines.
            Violations may result in content removal, temporary suspension, or permanent ban from Tribes and/or Lumira,
            at our sole discretion.
          </p>
        </div>
      </section>

      {/* ─── 1. Our Values ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">1. Our Community Values</h2>
        <div className="legal-body">
          <p>
            Tribes is built on the following principles:
          </p>
          <ul>
            <li><strong>Empathy first.</strong> Parenting is hard. Every parent&apos;s journey is different. Lead with compassion, not judgement.</li>
            <li><strong>Safety above all.</strong> The wellbeing of children is paramount. Content that could endanger a child&apos;s health or safety is never acceptable.</li>
            <li><strong>Honesty without harm.</strong> Share your experiences openly, but do so in a way that does not shame, belittle, or distress other parents.</li>
            <li><strong>Respect for privacy.</strong> Protect your own family&apos;s privacy and the privacy of others. Never share another person&apos;s personal information without their explicit consent.</li>
          </ul>
        </div>
      </section>

      {/* ─── 2. Medical Content ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">2. Medical Content Restrictions</h2>
        <div className="legal-body">
          <div className="legal-disclaimer-critical">
            <p className="legal-caps" style={{ marginBottom: '12px' }}>
              TRIBES IS NOT A FORUM FOR MEDICAL ADVICE. USERS MUST NOT PROVIDE MEDICAL DIAGNOSES, TREATMENT
              RECOMMENDATIONS, OR PRESCRIPTION GUIDANCE TO OTHER USERS.
            </p>
            <p>
              If you believe a child may be in danger or a parent describes symptoms that sound urgent, encourage
              them to contact their healthcare provider or emergency services immediately. Do not attempt to diagnose
              or prescribe.
            </p>
          </div>
          <p>The following medical content rules apply to all Tribes posts and comments:</p>
          <ul>
            <li>
              <strong>No medical advice.</strong> Do not diagnose conditions, recommend medications (prescription or
              over-the-counter), suggest dosages, or advise on medical treatments. Phrases such as &ldquo;you should
              give them...&rdquo; or &ldquo;it sounds like they have...&rdquo; followed by a medical condition or
              medication are not permitted.
            </li>
            <li>
              <strong>Sharing personal experience is allowed.</strong> You may share your own experience (&ldquo;when my
              baby had similar symptoms, our paediatrician recommended...&rdquo;) as long as you clearly frame it as
              your personal experience and not as advice applicable to others.
            </li>
            <li>
              <strong>Always recommend professional consultation.</strong> When discussing health-related topics,
              include a reminder to consult a qualified healthcare professional. Example: &ldquo;Every baby is
              different &mdash; please check with your doctor.&rdquo;
            </li>
            <li>
              <strong>No anti-vaccination content.</strong> Content that discourages vaccination, spreads vaccine
              misinformation, or promotes unproven alternative treatments in place of evidence-based medicine is
              prohibited.
            </li>
            <li>
              <strong>No unsafe sleep or feeding practices.</strong> Content promoting sleep or feeding practices that
              contradict established safety guidelines (such as those published by the American Academy of Pediatrics,
              the NHS, or the WHO) is not permitted.
            </li>
          </ul>
        </div>
      </section>

      {/* ─── 3. Prohibited Content ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">3. Prohibited Content</h2>
        <div className="legal-body">
          <p>The following content is strictly prohibited in Tribes:</p>
          <ul>
            <li><strong>Harassment, bullying, and intimidation.</strong> Targeting another user with insults, threats, repeated unwanted contact, doxxing (publishing private information), or coordinated harassment campaigns.</li>
            <li><strong>Hate speech.</strong> Content that attacks, demeans, or incites violence against individuals or groups based on race, ethnicity, national origin, religion, gender, gender identity, sexual orientation, disability, age, or any other protected characteristic.</li>
            <li><strong>Shaming and judgement.</strong> Shaming other parents for their parenting choices (feeding method, birth plan, childcare arrangements, etc.). Healthy discussion is welcome; personal attacks are not.</li>
            <li><strong>Sexual or explicit content.</strong> Pornography, sexually explicit material, or content depicting minors in a sexual or exploitative manner. This is an absolute, zero-tolerance rule.</li>
            <li><strong>Child exploitation or endangerment.</strong> Any content that exploits, endangers, or promotes harm to children. We report such content to the National Center for Missing &amp; Exploited Children (NCMEC) and relevant law enforcement authorities.</li>
            <li><strong>Violence and threats.</strong> Content that threatens, glorifies, incites, or promotes violence against any person or group.</li>
            <li><strong>Misinformation.</strong> Deliberately false or misleading health information, conspiracy theories related to child health, or fabricated stories presented as fact.</li>
            <li><strong>Spam and self-promotion.</strong> Unsolicited commercial messages, affiliate links, MLM/pyramid scheme promotions, or repetitive self-promotional content.</li>
            <li><strong>Impersonation.</strong> Pretending to be another user, a healthcare professional, or a Lumira team member.</li>
            <li><strong>Illegal content.</strong> Content that promotes or facilitates illegal activities under applicable law.</li>
          </ul>
        </div>
      </section>

      {/* ─── 4. Age-Appropriate Content ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">4. Age-Appropriate Content</h2>
        <div className="legal-body">
          <p>
            While Lumira is an 18+ platform, our community is focused on babies, infants, and young children. All
            content shared in Tribes must be appropriate for a parenting context:
          </p>
          <ul>
            <li>Images of children should be shared only with the explicit consent of the child&apos;s parent or legal guardian. Do not share images of other people&apos;s children.</li>
            <li>Graphic descriptions of medical procedures, birth trauma, or bodily functions should include a content warning at the beginning of the post.</li>
            <li>Discussions of sensitive topics (postpartum depression, pregnancy loss, domestic violence, substance use) are permitted and encouraged where they provide mutual support, but must be handled with care and empathy. Use Lumira&apos;s content warning feature when available.</li>
            <li>Do not post content that normalises or promotes substance use during pregnancy or around young children.</li>
          </ul>
        </div>
      </section>

      {/* ─── 5. Privacy & Data ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">5. Privacy in Community Spaces</h2>
        <div className="legal-body">
          <p>
            Protecting your family&apos;s privacy and respecting the privacy of others is essential:
          </p>
          <ul>
            <li><strong>Your own data.</strong> Think carefully before sharing identifying information (full names, locations, school names, etc.) about yourself or your child. Content posted in Tribes is visible to other users in that Tribe.</li>
            <li><strong>Other people&apos;s data.</strong> Do not share personal information about other users, their children, or their families. Do not screenshot or redistribute other users&apos; posts outside of Lumira without their explicit permission.</li>
            <li><strong>Anonymous posting.</strong> Tribes supports anonymous posting for sensitive topics. Even when posting anonymously, you remain bound by these Guidelines and our <a href="/legal/terms">Terms of Service</a>. Lumira retains the ability to identify anonymous posters internally for moderation and safety purposes.</li>
            <li><strong>Healthcare providers.</strong> Do not share the personal contact details of healthcare professionals without their consent. You may share general recommendations (e.g., &ldquo;I found a great lactation consultant in [city]&rdquo;) without publishing personal contact information.</li>
          </ul>
        </div>
      </section>

      {/* ─── 6. Content Moderation ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">6. Content Moderation</h2>
        <div className="legal-body">
          <p>
            Lumira employs a combination of automated systems and human review to moderate Tribes content:
          </p>
          <ul>
            <li><strong>Automated screening.</strong> Posts and comments are screened by keyword-based filters for prohibited content, unsafe medical advice, and potentially harmful content. Flagged content may be held for review before publication.</li>
            <li><strong>Human review.</strong> Flagged content is reviewed by Lumira&apos;s community team. We aim to review flagged content within 24 hours, though response times may vary.</li>
            <li><strong>Moderation actions.</strong> Depending on the severity and frequency of violations, Lumira may take one or more of the following actions:
              <ul>
                <li>Remove the offending content with a notification explaining why.</li>
                <li>Issue a warning to the user.</li>
                <li>Temporarily restrict the user&apos;s ability to post or comment (24 hours to 30 days).</li>
                <li>Permanently ban the user from Tribes.</li>
                <li>Suspend or terminate the user&apos;s Lumira account (in severe cases).</li>
                <li>Report the content to law enforcement (where legally required or where child safety is at risk).</li>
              </ul>
            </li>
            <li><strong>Appeals.</strong> If you believe your content was removed or your account was actioned in error, you may appeal by emailing <a href="mailto:community@hellolumira.app">community@hellolumira.app</a> within 14 days of the action. Include your account email and a description of the content or action you are appealing. We will review your appeal and respond within 10 business days.</li>
          </ul>
        </div>
      </section>

      {/* ─── 7. Reporting ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">7. Reporting Mechanism</h2>
        <div className="legal-body">
          <p>
            If you encounter content that violates these Guidelines, please report it promptly using one of the following methods:
          </p>
          <ul>
            <li><strong>In-app reporting.</strong> Tap the three-dot menu on any post or comment and select &ldquo;Report.&rdquo; Choose the reason for your report from the provided categories. Reports are anonymous &mdash; the reported user will not know who filed the report.</li>
            <li><strong>Email.</strong> Send a report to <a href="mailto:community@hellolumira.app">community@hellolumira.app</a> with the subject line &ldquo;Community Report.&rdquo; Include a description of the content, the username of the poster (if known), and the approximate date and time of the post.</li>
            <li><strong>Urgent safety concerns.</strong> If you believe a child is in immediate danger, contact your local emergency services first, then report to us at <a href="mailto:safety@hellolumira.app">safety@hellolumira.app</a>.</li>
          </ul>
          <p>
            We take all reports seriously and investigate each one. Filing a report in good faith will never result in negative
            consequences for your account. However, filing false or malicious reports repeatedly may itself be treated as a
            violation of these Guidelines.
          </p>
        </div>
      </section>

      {/* ─── 8. Intellectual Property ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">8. Intellectual Property in Community Content</h2>
        <div className="legal-body">
          <p>
            When you post content in Tribes:
          </p>
          <ul>
            <li>You retain ownership of your original content.</li>
            <li>You grant Lumira a non-exclusive, worldwide, royalty-free licence to display, distribute, and reproduce your content within the Lumira platform for the purpose of operating Tribes.</li>
            <li>You represent that you have the right to share the content and that it does not infringe any third party&apos;s rights.</li>
            <li>Do not post copyrighted material (articles, book excerpts, images) without proper attribution or permission. Brief quotations for discussion purposes are permitted under fair use principles.</li>
          </ul>
          <p>
            If you believe content in Tribes infringes your copyright, please submit a DMCA takedown notice as described on
            our <a href="/legal">Legal Hub</a>.
          </p>
        </div>
      </section>

      {/* ─── 9. Engagement with AI ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">9. AI-Generated Content in Community Spaces</h2>
        <div className="legal-body">
          <p>
            To maintain authenticity and trust in Tribes:
          </p>
          <ul>
            <li>Do not post AI-generated content (from Lumira or any other AI tool) as if it were your own personal experience or professional opinion.</li>
            <li>If you share information derived from an AI tool, clearly disclose that the information was AI-generated.</li>
            <li>Do not use AI tools to generate bulk posts, comments, or messages in Tribes.</li>
          </ul>
        </div>
      </section>

      {/* ─── 10. Enforcement ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">10. Enforcement &amp; Consequences</h2>
        <div className="legal-body">
          <p>
            We apply these Guidelines consistently and proportionally. Enforcement depends on the severity, frequency,
            and context of the violation:
          </p>
          <table className="legal-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Examples</th>
                <th>Typical Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Low</td>
                <td>Off-topic post, minor self-promotion, unintentional insensitivity</td>
                <td>Content removal + educational notice</td>
              </tr>
              <tr>
                <td>Medium</td>
                <td>Unsolicited medical advice, sharing others&apos; information, repeated low-level violations</td>
                <td>Content removal + formal warning + temporary posting restriction (up to 7 days)</td>
              </tr>
              <tr>
                <td>High</td>
                <td>Harassment, hate speech, dangerous medical misinformation, privacy violations</td>
                <td>Content removal + extended restriction (up to 30 days) or permanent Tribes ban</td>
              </tr>
              <tr>
                <td>Critical</td>
                <td>Child exploitation, credible threats of violence, illegal content</td>
                <td>Immediate permanent ban + report to law enforcement + account termination</td>
              </tr>
            </tbody>
          </table>
          <p>
            Lumira reserves the right to take any action it deems appropriate, including actions beyond those listed above,
            to protect the safety of our community.
          </p>
        </div>
      </section>

      {/* ─── 11. Changes ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">11. Changes to These Guidelines</h2>
        <div className="legal-body">
          <p>
            We may update these Community Guidelines from time to time to address new community needs, platform features,
            or legal requirements. When we make material changes, we will notify you via email or through a prominent
            notice within the Service at least fourteen (14) days before the changes take effect. Your continued
            participation in Tribes after the effective date constitutes your acceptance of the updated Guidelines.
          </p>
        </div>
      </section>

      {/* ─── 12. Contact ─── */}
      <section className="legal-section">
        <h2 className="legal-h2">12. Contact</h2>
        <div className="legal-body">
          <p>
            If you have questions about these Community Guidelines, need to report a violation, or wish to appeal a
            moderation decision, contact us:
          </p>
          <div className="legal-callout">
            <strong>Lumira Community Team</strong><br />
            Community enquiries: <a href="mailto:community@hellolumira.app">community@hellolumira.app</a><br />
            Urgent safety concerns: <a href="mailto:safety@hellolumira.app">safety@hellolumira.app</a><br />
            General legal enquiries: <a href="mailto:legal@hellolumira.app">legal@hellolumira.app</a>
          </div>
        </div>
      </section>
    </>
  )
}
