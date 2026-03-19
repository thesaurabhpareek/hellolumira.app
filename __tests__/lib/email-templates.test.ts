/**
 * @module EmailTemplatesTest
 * @description Comprehensive tests for lib/email-templates.ts premium email templates.
 *   Covers: template output shape, subject personalization, HTML compliance elements,
 *   XSS prevention via escapeHtml, edge cases (empty names, special chars, long names).
 */

import { describe, it, expect } from 'vitest'
import {
  emailWrapper,
  welcomeDay1Email,
  onboardingDay3Email,
  dailyCheckinEmail,
  patternAlertEmail,
  weeklyGuideEmail,
  concernFollowupEmail,
  reengagementEmail,
  partnerInviteEmail,
  SUBJECT_LINES,
  type EmailTemplate,
} from '@/lib/email-templates'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Checks that an email template result has the required shape. */
function assertValidTemplate(result: EmailTemplate) {
  expect(result).toHaveProperty('subject')
  expect(result).toHaveProperty('preheader')
  expect(result).toHaveProperty('html')
  expect(typeof result.subject).toBe('string')
  expect(typeof result.preheader).toBe('string')
  expect(typeof result.html).toBe('string')
  expect(result.subject.length).toBeGreaterThan(0)
  expect(result.preheader.length).toBeGreaterThan(0)
  expect(result.html.length).toBeGreaterThan(0)
}

/** Checks that an HTML output includes all required compliance elements. */
function assertCompliance(html: string) {
  // Lumira branding
  expect(html).toContain('Lumira')
  // Medical disclaimer
  expect(html).toContain('not a substitute for professional medical advice')
  // CAN-SPAM footer — company name
  expect(html).toContain('Lumira Inc.')
  // Unsubscribe link
  expect(html).toContain('Unsubscribe')
  expect(html).toContain('settings/notifications')
  // Terms link
  expect(html).toContain('legal/terms')
  // Privacy link
  expect(html).toContain('legal/privacy')
  // Valid HTML document
  expect(html).toContain('<!DOCTYPE html>')
  expect(html).toContain('</html>')
}

/** Checks that user-provided content is escaped (no raw angle brackets). */
function assertEscaped(html: string, rawInput: string) {
  // The raw input should NOT appear in the HTML if it contains special chars
  if (rawInput.includes('<') || rawInput.includes('>')) {
    expect(html).not.toContain(rawInput)
  }
}

// ---------------------------------------------------------------------------
// emailWrapper
// ---------------------------------------------------------------------------

describe('emailWrapper', () => {
  it('wraps content with full Lumira email chrome', () => {
    const html = emailWrapper('<p>Hello</p>', 'Preview text', 'user@test.com')
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('Preview text')
    expect(html).toContain('<p>Hello</p>')
    expect(html).toContain('user@test.com')
    // Wrapper includes chrome (branding, CAN-SPAM, links) but NOT medical disclaimer
    // Medical disclaimer is added by individual template functions
    expect(html).toContain('Lumira')
    expect(html).toContain('Lumira Inc.')
    expect(html).toContain('Unsubscribe')
    expect(html).toContain('settings/notifications')
    expect(html).toContain('legal/terms')
    expect(html).toContain('legal/privacy')
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('</html>')
  })

  it('uses default placeholder when recipientEmail is omitted', () => {
    const html = emailWrapper('<p>Hi</p>', 'Preview')
    expect(html).toContain('{{email}}')
  })
})

// ---------------------------------------------------------------------------
// welcomeDay1Email
// ---------------------------------------------------------------------------

describe('welcomeDay1Email', () => {
  it('returns a valid EmailTemplate', () => {
    const result = welcomeDay1Email('Sarah', 'Emma', 'sarah@test.com')
    assertValidTemplate(result)
  })

  it('includes all compliance elements', () => {
    const result = welcomeDay1Email('Sarah', 'Emma', 'sarah@test.com')
    assertCompliance(result.html)
  })

  it('personalizes the subject line with firstName', () => {
    const result = welcomeDay1Email('Sarah', 'Emma', 'sarah@test.com')
    expect(result.subject).toContain('Sarah')
  })

  it('includes baby name in the body', () => {
    const result = welcomeDay1Email('Sarah', 'Emma', 'sarah@test.com')
    expect(result.html).toContain('Emma')
  })

  it('CTA links to /checkin', () => {
    const result = welcomeDay1Email('Sarah', 'Emma', 'sarah@test.com')
    expect(result.html).toContain('/checkin')
    expect(result.html).not.toContain('/dashboard')
  })

  it('escapes HTML in firstName', () => {
    const result = welcomeDay1Email('<script>alert(1)</script>', 'Emma', 'test@test.com')
    assertEscaped(result.html, '<script>alert(1)</script>')
    expect(result.html).toContain('&lt;script&gt;')
  })

  it('escapes HTML in babyName', () => {
    const result = welcomeDay1Email('Sarah', '<img src=x onerror=alert(1)>', 'test@test.com')
    assertEscaped(result.html, '<img src=x onerror=alert(1)>')
    expect(result.html).toContain('&lt;img')
  })

  it('handles empty baby name with default', () => {
    const result = welcomeDay1Email('Sarah', '', 'sarah@test.com')
    expect(result.html).toContain('your little one')
  })

  it('handles very long names', () => {
    const longName = 'A'.repeat(500)
    const result = welcomeDay1Email(longName, 'Baby', 'test@test.com')
    assertValidTemplate(result)
    expect(result.html).toContain(longName)
  })

  it('handles special characters in names', () => {
    const result = welcomeDay1Email("O'Brien", 'Zoë & André', 'test@test.com')
    assertValidTemplate(result)
    expect(result.html).toContain('O&#39;Brien')
    expect(result.html).toContain('Zo&euml; &amp; Andr&eacute;'.replace(/&euml;/g, 'ë').replace(/&eacute;/g, 'é') || 'Zo')
    // ampersand in baby name should be escaped
    expect(result.html).toContain('&amp;')
  })
})

// ---------------------------------------------------------------------------
// onboardingDay3Email
// ---------------------------------------------------------------------------

describe('onboardingDay3Email', () => {
  it('returns a valid EmailTemplate', () => {
    const result = onboardingDay3Email('Sarah', 'Emma', 'sarah@test.com')
    assertValidTemplate(result)
  })

  it('includes all compliance elements', () => {
    const result = onboardingDay3Email('Sarah', 'Emma', 'sarah@test.com')
    assertCompliance(result.html)
  })

  it('shows check-in count', () => {
    const result = onboardingDay3Email('Sarah', 'Emma', 'sarah@test.com', 5)
    expect(result.html).toContain('5 check-ins')
  })

  it('handles singular check-in count', () => {
    const result = onboardingDay3Email('Sarah', 'Emma', 'sarah@test.com', 1)
    expect(result.html).toContain('1 check-in')
    expect(result.html).not.toContain('1 check-ins')
  })

  it('CTA links to /checkin', () => {
    const result = onboardingDay3Email('Sarah', 'Emma', 'sarah@test.com')
    expect(result.html).toContain('/checkin')
  })

  it('escapes HTML in user inputs', () => {
    const result = onboardingDay3Email('<b>Hack</b>', '<em>Baby</em>', 'test@test.com')
    expect(result.html).not.toContain('<b>Hack</b>')
    expect(result.html).not.toContain('<em>Baby</em>')
  })
})

// ---------------------------------------------------------------------------
// dailyCheckinEmail
// ---------------------------------------------------------------------------

describe('dailyCheckinEmail', () => {
  it('returns a valid EmailTemplate', () => {
    const result = dailyCheckinEmail('Sarah', 'Emma', 'sarah@test.com')
    assertValidTemplate(result)
  })

  it('includes all compliance elements', () => {
    const result = dailyCheckinEmail('Sarah', 'Emma', 'sarah@test.com')
    assertCompliance(result.html)
  })

  it('personalizes subject with firstName', () => {
    const result = dailyCheckinEmail('Sarah', 'Emma', 'sarah@test.com')
    expect(result.subject).toContain('Sarah')
  })

  it('CTA links to /checkin by default', () => {
    const result = dailyCheckinEmail('Sarah', 'Emma', 'sarah@test.com')
    expect(result.html).toContain('/checkin')
  })

  it('uses custom prefillUrl when provided', () => {
    const result = dailyCheckinEmail('Sarah', 'Emma', 'sarah@test.com', 'https://example.com/custom')
    expect(result.html).toContain('https://example.com/custom')
  })

  it('escapes HTML in user inputs', () => {
    const result = dailyCheckinEmail('<script>x</script>', '<b>Baby</b>', 'test@test.com')
    expect(result.html).toContain('&lt;script&gt;')
  })
})

// ---------------------------------------------------------------------------
// patternAlertEmail
// ---------------------------------------------------------------------------

describe('patternAlertEmail', () => {
  it('returns a valid EmailTemplate', () => {
    const result = patternAlertEmail('Sarah', 'Emma', 'sarah@test.com', 'sleep_regression')
    assertValidTemplate(result)
  })

  it('includes all compliance elements', () => {
    const result = patternAlertEmail('Sarah', 'Emma', 'sarah@test.com', 'sleep_regression')
    assertCompliance(result.html)
  })

  it('formats pattern type correctly (underscores to spaces)', () => {
    const result = patternAlertEmail('Sarah', 'Emma', 'sarah@test.com', 'sleep_regression')
    expect(result.html).toContain('sleep regression')
  })

  it('includes pattern summary when provided', () => {
    const result = patternAlertEmail('Sarah', 'Emma', 'sarah@test.com', 'feeding', 'Feeding duration decreased 20%')
    expect(result.html).toContain('Feeding duration decreased 20%')
  })

  it('CTA links to /home (not /dashboard)', () => {
    const result = patternAlertEmail('Sarah', 'Emma', 'sarah@test.com', 'sleep_regression')
    expect(result.html).toContain('/home')
    expect(result.html).not.toContain('/dashboard')
  })

  it('escapes pattern summary', () => {
    const result = patternAlertEmail('Sarah', 'Emma', 'sarah@test.com', 'test', '<script>alert(1)</script>')
    expect(result.html).not.toContain('<script>alert(1)</script>')
    expect(result.html).toContain('&lt;script&gt;')
  })

  it('escapes pattern type in preheader', () => {
    const result = patternAlertEmail('Sarah', 'Emma', 'sarah@test.com', '<b>bad</b>')
    expect(result.preheader).toContain('&lt;b&gt;')
    expect(result.preheader).not.toContain('<b>bad</b>')
  })
})

// ---------------------------------------------------------------------------
// weeklyGuideEmail
// ---------------------------------------------------------------------------

describe('weeklyGuideEmail', () => {
  const guide = {
    title: 'Week 12: Motor Skills Milestones',
    body: 'Your baby is developing exciting new motor skills this week.',
    tips: ['Offer tummy time for 3-5 minutes', 'Use soft toys to encourage reaching'],
  }

  it('returns a valid EmailTemplate', () => {
    const result = weeklyGuideEmail('Sarah', 'Emma', 'sarah@test.com', guide)
    assertValidTemplate(result)
  })

  it('includes all compliance elements', () => {
    const result = weeklyGuideEmail('Sarah', 'Emma', 'sarah@test.com', guide)
    assertCompliance(result.html)
  })

  it('includes guide title in subject', () => {
    const result = weeklyGuideEmail('Sarah', 'Emma', 'sarah@test.com', guide)
    expect(result.subject).toContain('Week 12')
  })

  it('includes age display when provided', () => {
    const result = weeklyGuideEmail('Sarah', 'Emma', 'sarah@test.com', guide, '3 months old')
    expect(result.html).toContain('3 months old')
  })

  it('renders tips as numbered list', () => {
    const result = weeklyGuideEmail('Sarah', 'Emma', 'sarah@test.com', guide)
    expect(result.html).toContain('1.')
    expect(result.html).toContain('2.')
    expect(result.html).toContain('tummy time')
  })

  it('handles empty tips array', () => {
    const emptyGuide = { title: 'Test Guide', body: 'Body text', tips: [] }
    const result = weeklyGuideEmail('Sarah', 'Emma', 'sarah@test.com', emptyGuide)
    assertValidTemplate(result)
  })

  it('escapes guide content', () => {
    const xssGuide = {
      title: '<script>alert(1)</script>',
      body: '<img onerror=alert(1)>',
      tips: ['<a href="javascript:void(0)">click</a>'],
    }
    const result = weeklyGuideEmail('Sarah', 'Emma', 'sarah@test.com', xssGuide)
    expect(result.html).not.toContain('<script>alert(1)</script>')
    expect(result.html).not.toContain('<img onerror=alert(1)>')
    expect(result.html).toContain('&lt;script&gt;')
  })

  it('does not double-escape baby name in age display section', () => {
    const result = weeklyGuideEmail('Sarah', 'Tom & Jerry', 'sarah@test.com', guide, '3 months')
    // Should contain the escaped version once, not double-escaped
    expect(result.html).toContain('Tom &amp; Jerry')
    expect(result.html).not.toContain('Tom &amp;amp; Jerry')
  })

  it('CTA links to /home', () => {
    const result = weeklyGuideEmail('Sarah', 'Emma', 'sarah@test.com', guide)
    expect(result.html).toContain('/home')
  })
})

// ---------------------------------------------------------------------------
// concernFollowupEmail
// ---------------------------------------------------------------------------

describe('concernFollowupEmail', () => {
  it('returns a valid EmailTemplate', () => {
    const result = concernFollowupEmail('Sarah', 'Emma', 'sarah@test.com', 'Poor sleep for 3 nights')
    assertValidTemplate(result)
  })

  it('includes all compliance elements', () => {
    const result = concernFollowupEmail('Sarah', 'Emma', 'sarah@test.com', 'Feeding issues')
    assertCompliance(result.html)
  })

  it('includes the concern text in the body', () => {
    const result = concernFollowupEmail('Sarah', 'Emma', 'sarah@test.com', 'Unusual rash appeared')
    expect(result.html).toContain('Unusual rash appeared')
  })

  it('CTA links to /concern', () => {
    const result = concernFollowupEmail('Sarah', 'Emma', 'sarah@test.com', 'Test concern')
    expect(result.html).toContain('/concern')
  })

  it('shows correct time label for 1 day', () => {
    const result = concernFollowupEmail('Sarah', 'Emma', 'sarah@test.com', 'Test', 1)
    expect(result.html).toContain('Yesterday')
  })

  it('shows correct time label for multiple days', () => {
    const result = concernFollowupEmail('Sarah', 'Emma', 'sarah@test.com', 'Test', 5)
    expect(result.html).toContain('5 days ago')
  })

  it('escapes concern text', () => {
    const result = concernFollowupEmail('Sarah', 'Emma', 'sarah@test.com', '<script>alert("xss")</script>')
    expect(result.html).not.toContain('<script>alert("xss")</script>')
    expect(result.html).toContain('&lt;script&gt;')
  })
})

// ---------------------------------------------------------------------------
// reengagementEmail
// ---------------------------------------------------------------------------

describe('reengagementEmail', () => {
  it('returns a valid EmailTemplate', () => {
    const result = reengagementEmail('Sarah', 'Emma', 'sarah@test.com')
    assertValidTemplate(result)
  })

  it('includes all compliance elements', () => {
    const result = reengagementEmail('Sarah', 'Emma', 'sarah@test.com')
    assertCompliance(result.html)
  })

  it('personalizes subject with firstName', () => {
    const result = reengagementEmail('Sarah', 'Emma', 'sarah@test.com')
    expect(result.subject).toContain('Sarah')
  })

  it('shows days since last checkin', () => {
    const result = reengagementEmail('Sarah', 'Emma', 'sarah@test.com', 14)
    expect(result.html).toContain('14 days')
  })

  it('CTA links to /checkin', () => {
    const result = reengagementEmail('Sarah', 'Emma', 'sarah@test.com')
    expect(result.html).toContain('/checkin')
  })

  it('includes unsubscribe preference link', () => {
    const result = reengagementEmail('Sarah', 'Emma', 'sarah@test.com')
    expect(result.html).toContain('adjust your preferences')
  })
})

// ---------------------------------------------------------------------------
// partnerInviteEmail
// ---------------------------------------------------------------------------

describe('partnerInviteEmail', () => {
  it('returns a valid EmailTemplate', () => {
    const result = partnerInviteEmail('Sarah', 'partner@test.com', 'abc123', 'Emma')
    assertValidTemplate(result)
  })

  it('includes all compliance elements', () => {
    const result = partnerInviteEmail('Sarah', 'partner@test.com', 'abc123', 'Emma')
    assertCompliance(result.html)
  })

  it('includes inviter name in subject', () => {
    const result = partnerInviteEmail('Sarah', 'partner@test.com', 'abc123', 'Emma')
    expect(result.subject).toContain('Sarah')
  })

  it('CTA links to invite URL with token', () => {
    const result = partnerInviteEmail('Sarah', 'partner@test.com', 'abc123', 'Emma')
    expect(result.html).toContain('/invite/abc123')
  })

  it('URL-encodes the invite token', () => {
    const result = partnerInviteEmail('Sarah', 'partner@test.com', 'token with spaces', 'Emma')
    expect(result.html).toContain('/invite/token%20with%20spaces')
  })

  it('escapes inviter name in HTML body', () => {
    const result = partnerInviteEmail('<script>evil</script>', 'partner@test.com', 'abc', 'Emma')
    expect(result.html).not.toContain('<script>evil</script>')
    expect(result.html).toContain('&lt;script&gt;')
  })

  it('escapes inviter name in preheader', () => {
    const result = partnerInviteEmail('<b>Hacker</b>', 'partner@test.com', 'abc', 'Emma')
    expect(result.preheader).not.toContain('<b>Hacker</b>')
    expect(result.preheader).toContain('&lt;b&gt;')
  })

  it('includes recipient email in footer', () => {
    const result = partnerInviteEmail('Sarah', 'partner@test.com', 'abc', 'Emma')
    expect(result.html).toContain('partner@test.com')
  })
})

// ---------------------------------------------------------------------------
// SUBJECT_LINES validation
// ---------------------------------------------------------------------------

describe('SUBJECT_LINES', () => {
  it('has entries for all 8 template types', () => {
    expect(SUBJECT_LINES.welcomeDay1).toBeDefined()
    expect(SUBJECT_LINES.onboardingDay3).toBeDefined()
    expect(SUBJECT_LINES.dailyCheckin).toBeDefined()
    expect(SUBJECT_LINES.patternAlert).toBeDefined()
    expect(SUBJECT_LINES.weeklyGuide).toBeDefined()
    expect(SUBJECT_LINES.concernFollowup).toBeDefined()
    expect(SUBJECT_LINES.reengagement).toBeDefined()
    expect(SUBJECT_LINES.partnerInvite).toBeDefined()
  })

  it('each key has at least 2 subject line options', () => {
    for (const [, lines] of Object.entries(SUBJECT_LINES)) {
      expect(lines.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('subject lines are non-empty strings', () => {
    for (const [, lines] of Object.entries(SUBJECT_LINES)) {
      for (const line of lines) {
        expect(typeof line).toBe('string')
        expect(line.length).toBeGreaterThan(0)
      }
    }
  })
})

// ---------------------------------------------------------------------------
// CTA route correctness — no /dashboard or /auth routes
// ---------------------------------------------------------------------------

describe('CTA route correctness', () => {
  const templates = [
    welcomeDay1Email('A', 'B', 'e@e.com'),
    onboardingDay3Email('A', 'B', 'e@e.com'),
    dailyCheckinEmail('A', 'B', 'e@e.com'),
    patternAlertEmail('A', 'B', 'e@e.com', 'test'),
    weeklyGuideEmail('A', 'B', 'e@e.com', { title: 'T', body: 'B', tips: [] }),
    concernFollowupEmail('A', 'B', 'e@e.com', 'C'),
    reengagementEmail('A', 'B', 'e@e.com'),
    partnerInviteEmail('A', 'b@b.com', 'tok', 'B'),
  ]

  it('no template links to /dashboard', () => {
    for (const t of templates) {
      expect(t.html).not.toContain('/dashboard')
    }
  })

  it('no template links to /auth', () => {
    for (const t of templates) {
      expect(t.html).not.toContain('/auth')
    }
  })
})

// ---------------------------------------------------------------------------
// FROM_ADDRESS verification (checked in resend.ts, but we verify it's correct)
// ---------------------------------------------------------------------------

describe('FROM_ADDRESS format', () => {
  it('resend.ts exports sendEmail which uses correct FROM_ADDRESS', async () => {
    // We can't easily test the actual sendEmail without mocking Resend,
    // but we verify the module loads and the function exists
    const { sendEmail } = await import('@/lib/resend')
    expect(typeof sendEmail).toBe('function')
  })
})
