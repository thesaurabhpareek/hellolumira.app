// __tests__/api/api-auth-audit.test.ts
// Structural audit of all API routes for auth, validation, and error handling.
// These are specification tests that verify code patterns by inspecting source files.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const ROOT = join(__dirname, '..', '..')

function readRoute(path: string): string {
  return readFileSync(join(ROOT, path), 'utf-8')
}

// ── Auth verification audit ──

describe('API Auth Audit — every route must call supabase.auth.getUser()', () => {
  const AUTHENTICATED_ROUTES = [
    'app/api/chat/route.ts',
    'app/api/chat/threads/route.ts',
    'app/api/checkin-conversation/route.ts',
    'app/api/concern-summary/route.ts',
    'app/api/detect-patterns/route.ts',
    'app/api/generate-weekly-summary/route.ts',
    'app/api/invite-partner/route.ts',
    'app/api/notifications/route.ts',
    'app/api/notifications/dismiss/route.ts',
    'app/api/notifications/mark-all-read/route.ts',
    'app/api/notifications/mark-read/route.ts',
    'app/api/notifications/unread-count/route.ts',
    'app/api/privacy/consent-history/route.ts',
    'app/api/privacy/preferences/route.ts',
    'app/api/privacy/request-deletion/route.ts',
    'app/api/privacy/request-export/route.ts',
    'app/api/route-concern/route.ts',
    'app/api/weekly-guide/route.ts',
  ]

  it.each(AUTHENTICATED_ROUTES)(
    '%s calls supabase.auth.getUser()',
    (routePath) => {
      const source = readRoute(routePath)
      expect(source).toContain('auth.getUser()')
    }
  )
})

describe('API Auth Audit — routes that SHOULD return 401 on auth failure', () => {
  const ROUTES_THAT_SHOULD_401 = [
    'app/api/chat/route.ts',
    'app/api/chat/threads/route.ts',
    'app/api/checkin-conversation/route.ts',
    'app/api/concern-summary/route.ts',
    'app/api/detect-patterns/route.ts',
    'app/api/generate-weekly-summary/route.ts',
    'app/api/invite-partner/route.ts',
    'app/api/notifications/route.ts',
    'app/api/notifications/dismiss/route.ts',
    'app/api/notifications/mark-all-read/route.ts',
    'app/api/notifications/mark-read/route.ts',
    'app/api/privacy/consent-history/route.ts',
    'app/api/privacy/preferences/route.ts',
    'app/api/privacy/request-deletion/route.ts',
    'app/api/privacy/request-export/route.ts',
    'app/api/route-concern/route.ts',
    'app/api/weekly-guide/route.ts',
  ]

  it.each(ROUTES_THAT_SHOULD_401)(
    '%s returns 401 for unauthorized',
    (routePath) => {
      const source = readRoute(routePath)
      expect(source).toContain('status: 401')
    }
  )
})

describe('BUG-001 FIXED: notifications/unread-count now returns 401', () => {
  it('returns 401 when not authenticated', () => {
    const source = readRoute('app/api/notifications/unread-count/route.ts')
    const returns401 = source.includes('status: 401')
    expect(returns401).toBe(true) // BUG-001 was fixed
  })
})

// ── IDOR vulnerability audit ──

describe('BUG-004/005/006/007/008: IDOR — routes missing baby ownership verification', () => {
  const ROUTES_NEEDING_BABY_OWNERSHIP = [
    'app/api/chat/route.ts',
    'app/api/checkin-conversation/route.ts',
    'app/api/concern-summary/route.ts',
    'app/api/detect-patterns/route.ts',
    'app/api/generate-weekly-summary/route.ts',
  ]

  it.each(ROUTES_NEEDING_BABY_OWNERSHIP)(
    '%s now checks baby_profile_members (IDOR fix applied)',
    (routePath) => {
      const source = readRoute(routePath)
      const checksBabyOwnership = source.includes('verifyBabyOwnership')
      expect(checksBabyOwnership).toBe(true) // IDOR bugs 004-008 were fixed
    }
  )

  it('chat/threads DOES verify baby ownership (reference implementation)', () => {
    const source = readRoute('app/api/chat/threads/route.ts')
    expect(source).toContain('baby_profile_members')
  })
})

// ── Input validation audit ──

describe('API Input Validation Audit', () => {
  it('early-access validates email format', () => {
    const source = readRoute('app/api/early-access/route.ts')
    // Now uses regex validation instead of simple includes check
    expect(source).toContain('emailRegex')
  })

  it('notifications/dismiss validates notification_id', () => {
    const source = readRoute('app/api/notifications/dismiss/route.ts')
    expect(source).toContain('!notification_id')
  })

  it('notifications/mark-read validates notification_ids is array', () => {
    const source = readRoute('app/api/notifications/mark-read/route.ts')
    expect(source).toContain('!Array.isArray(notification_ids)')
  })

  it('notifications/mark-read caps IDs at 50', () => {
    const source = readRoute('app/api/notifications/mark-read/route.ts')
    expect(source).toContain('.slice(0, 50)')
  })

  it('weekly-guide validates week_or_month is a number', () => {
    const source = readRoute('app/api/weekly-guide/route.ts')
    expect(source).toContain('isNaN(week_or_month)')
  })

  it('privacy/preferences validates data_retention_months', () => {
    const source = readRoute('app/api/privacy/preferences/route.ts')
    expect(source).toContain('VALID_RETENTION_MONTHS')
  })

  it('request-deletion requires confirmation = "DELETE"', () => {
    const source = readRoute('app/api/privacy/request-deletion/route.ts')
    expect(source).toContain("'DELETE'")
  })
})

// ── XSS audit ──

describe('BUG-022: XSS in unsubscribe HTML', () => {
  it('interpolates user-controlled `type` directly into HTML', () => {
    const source = readRoute('app/api/communications/unsubscribe/route.ts')
    // The template interpolates type directly without escaping
    expect(source).toContain('Unknown email type: "${type}"')
  })
})

// ── Error handling audit ──

describe('Error Handling Consistency', () => {
  it('detect-patterns silently returns 200 on errors', () => {
    const source = readRoute('app/api/detect-patterns/route.ts')
    // Catch block returns 200 instead of error status
    expect(source).toContain('patterns_detected: [], patterns_skipped: []')
    expect(source).toContain('Error (silent)')
  })

  it('route-concern silently returns 200 on errors', () => {
    const source = readRoute('app/api/route-concern/route.ts')
    expect(source).toContain("concern_type: 'other'")
  })
})

// ── Public routes ──

describe('Public routes (no auth required)', () => {
  it('early-access does NOT call auth.getUser()', () => {
    const source = readRoute('app/api/early-access/route.ts')
    expect(source).not.toContain('auth.getUser()')
  })

  it('unsubscribe uses JWT verification instead of session auth', () => {
    const source = readRoute('app/api/communications/unsubscribe/route.ts')
    expect(source).toContain('verifyJwt')
    expect(source).not.toContain('auth.getUser()')
  })
})

// ── Invite token exposure ──

describe('BUG-003: invite-partner returns token in response', () => {
  it('returns invite_url containing secret token', () => {
    const source = readRoute('app/api/invite-partner/route.ts')
    expect(source).toContain('invite_url: inviteUrl')
  })
})

// ── Fire-and-forget pattern detection ──

describe('BUG-015: chat fire-and-forget fetch without auth cookies', () => {
  it('calls detect-patterns via fetch without forwarding cookies', () => {
    const source = readRoute('app/api/chat/route.ts')
    expect(source).toContain("fetch(`${request.nextUrl.origin}/api/detect-patterns`")
    // Does not include cookies/headers from original request
    expect(source).not.toContain("headers: request.headers")
  })
})

// ── Cron routes validate CRON_SECRET ──

describe('Cron routes — all validate CRON_SECRET from Authorization header', () => {
  const CRON_ROUTES = [
    'app/api/cron/concern-followup/route.ts',
    'app/api/cron/daily-comms/route.ts',
    'app/api/cron/weekly-summary/route.ts',
  ]

  it.each(CRON_ROUTES)(
    '%s validates CRON_SECRET from authorization header',
    (routePath) => {
      const source = readRoute(routePath)
      expect(source).toContain('CRON_SECRET')
      expect(source).toContain('authorization')
      expect(source).toContain('Bearer')
      expect(source).toContain('status: 401')
    }
  )

  it.each(CRON_ROUTES)(
    '%s does NOT use session-based auth (uses service role client)',
    (routePath) => {
      const source = readRoute(routePath)
      // Cron routes should NOT call auth.getUser() — they use CRON_SECRET instead
      expect(source).not.toContain('auth.getUser()')
    }
  )

  it.each(CRON_ROUTES)(
    '%s uses service role Supabase client',
    (routePath) => {
      const source = readRoute(routePath)
      expect(source).toContain('SUPABASE_SERVICE_ROLE_KEY')
    }
  )
})

// ── export const dynamic = 'force-dynamic' audit ──

describe('All API routes export dynamic = force-dynamic', () => {
  const ALL_ROUTES = [
    'app/api/analytics/route.ts',
    'app/api/chat/route.ts',
    'app/api/chat/threads/route.ts',
    'app/api/checkin-conversation/route.ts',
    'app/api/concern-summary/route.ts',
    'app/api/cron/concern-followup/route.ts',
    'app/api/cron/daily-comms/route.ts',
    'app/api/cron/weekly-summary/route.ts',
    'app/api/detect-patterns/route.ts',
    'app/api/early-access/route.ts',
    'app/api/generate-weekly-summary/route.ts',
    'app/api/invite-partner/route.ts',
    'app/api/notifications/route.ts',
    'app/api/notifications/dismiss/route.ts',
    'app/api/notifications/mark-all-read/route.ts',
    'app/api/notifications/mark-read/route.ts',
    'app/api/notifications/unread-count/route.ts',
    'app/api/privacy/consent-history/route.ts',
    'app/api/privacy/export/[token]/route.ts',
    'app/api/privacy/preferences/route.ts',
    'app/api/privacy/request-deletion/route.ts',
    'app/api/privacy/request-export/route.ts',
    'app/api/privacy/verify-deletion/route.ts',
    'app/api/route-concern/route.ts',
    'app/api/weekly-guide/route.ts',
    'app/api/communications/unsubscribe/route.ts',
    'app/api/communications/update-preferences/route.ts',
  ]

  it.each(ALL_ROUTES)(
    '%s has export const dynamic = force-dynamic',
    (routePath) => {
      const source = readRoute(routePath)
      expect(source).toContain("export const dynamic = 'force-dynamic'")
    }
  )
})

// ── try/catch error handling audit ──

describe('All API routes have top-level try/catch (never throw unhandled)', () => {
  const ALL_ROUTES = [
    'app/api/analytics/route.ts',
    'app/api/chat/route.ts',
    'app/api/chat/threads/route.ts',
    'app/api/checkin-conversation/route.ts',
    'app/api/concern-summary/route.ts',
    'app/api/cron/concern-followup/route.ts',
    'app/api/cron/daily-comms/route.ts',
    'app/api/cron/weekly-summary/route.ts',
    'app/api/detect-patterns/route.ts',
    'app/api/early-access/route.ts',
    'app/api/generate-weekly-summary/route.ts',
    'app/api/invite-partner/route.ts',
    'app/api/notifications/route.ts',
    'app/api/notifications/dismiss/route.ts',
    'app/api/notifications/mark-all-read/route.ts',
    'app/api/notifications/mark-read/route.ts',
    'app/api/notifications/unread-count/route.ts',
    'app/api/privacy/consent-history/route.ts',
    'app/api/privacy/export/[token]/route.ts',
    'app/api/privacy/preferences/route.ts',
    'app/api/privacy/request-deletion/route.ts',
    'app/api/privacy/request-export/route.ts',
    'app/api/privacy/verify-deletion/route.ts',
    'app/api/route-concern/route.ts',
    'app/api/weekly-guide/route.ts',
    'app/api/communications/unsubscribe/route.ts',
    'app/api/communications/update-preferences/route.ts',
  ]

  it.each(ALL_ROUTES)(
    '%s has try/catch error handling',
    (routePath) => {
      const source = readRoute(routePath)
      expect(source).toContain('} catch')
    }
  )
})

// ── Prompt sanitization on all AI routes ──

describe('All AI routes apply sanitizeForPrompt to user input', () => {
  const AI_ROUTES = [
    'app/api/chat/route.ts',
    'app/api/checkin-conversation/route.ts',
    'app/api/concern-summary/route.ts',
    'app/api/route-concern/route.ts',
    'app/api/generate-weekly-summary/route.ts',
  ]

  it.each(AI_ROUTES)(
    '%s imports and uses sanitizeForPrompt',
    (routePath) => {
      const source = readRoute(routePath)
      expect(source).toContain('sanitizeForPrompt')
    }
  )
})

// ── Rate limiting on AI routes ──

describe('All AI routes apply rate limiting', () => {
  const AI_ROUTES_WITH_RATE_LIMIT = [
    'app/api/chat/route.ts',
    'app/api/checkin-conversation/route.ts',
    'app/api/concern-summary/route.ts',
    'app/api/route-concern/route.ts',
    'app/api/generate-weekly-summary/route.ts',
    'app/api/detect-patterns/route.ts',
    'app/api/weekly-guide/route.ts',
  ]

  it.each(AI_ROUTES_WITH_RATE_LIMIT)(
    '%s imports and uses checkRateLimit',
    (routePath) => {
      const source = readRoute(routePath)
      expect(source).toContain('checkRateLimit')
      expect(source).toContain('status: 429')
    }
  )
})

// ── CSP headers in next.config.mjs ──

describe('Content-Security-Policy in next.config.mjs', () => {
  const config = readFileSync(join(ROOT, 'next.config.mjs'), 'utf-8')

  it('sets default-src to self', () => {
    expect(config).toContain("default-src 'self'")
  })

  it('sets frame-ancestors to none', () => {
    expect(config).toContain("frame-ancestors 'none'")
  })

  it('restricts connect-src to known hosts', () => {
    expect(config).toContain('connect-src')
    expect(config).toContain('*.supabase.co')
    expect(config).toContain('api.anthropic.com')
  })

  it('sets X-Frame-Options to DENY', () => {
    expect(config).toContain("'X-Frame-Options', value: 'DENY'")
  })

  it('sets X-Content-Type-Options to nosniff', () => {
    expect(config).toContain('nosniff')
  })

  it('sets Strict-Transport-Security with preload', () => {
    expect(config).toContain('Strict-Transport-Security')
    expect(config).toContain('preload')
  })

  it('sets Referrer-Policy to strict-origin-when-cross-origin', () => {
    expect(config).toContain('strict-origin-when-cross-origin')
  })

  it('restricts Permissions-Policy for camera/mic/geo', () => {
    expect(config).toContain('camera=()')
    expect(config).toContain('microphone=()')
    expect(config).toContain('geolocation=()')
  })

  it('sets base-uri to self', () => {
    expect(config).toContain("base-uri 'self'")
  })

  it('sets form-action to self', () => {
    expect(config).toContain("form-action 'self'")
  })
})

// ── No hardcoded secrets in source ──

describe('No hardcoded secrets in API route source files', () => {
  const ALL_ROUTES = [
    'app/api/chat/route.ts',
    'app/api/checkin-conversation/route.ts',
    'app/api/concern-summary/route.ts',
    'app/api/cron/concern-followup/route.ts',
    'app/api/cron/daily-comms/route.ts',
    'app/api/cron/weekly-summary/route.ts',
    'app/api/detect-patterns/route.ts',
    'app/api/early-access/route.ts',
    'app/api/generate-weekly-summary/route.ts',
    'app/api/invite-partner/route.ts',
    'app/api/privacy/request-deletion/route.ts',
    'app/api/privacy/request-export/route.ts',
    'app/api/privacy/verify-deletion/route.ts',
  ]

  it.each(ALL_ROUTES)(
    '%s does not contain hardcoded API keys (sk_live, sk_test)',
    (routePath) => {
      const source = readRoute(routePath)
      expect(source).not.toMatch(/sk_live_[a-zA-Z0-9]+/)
      expect(source).not.toMatch(/sk_test_[a-zA-Z0-9]+/)
      expect(source).not.toMatch(/apikey\s*=\s*['"][a-zA-Z0-9]+['"]/)
    }
  )
})

// ── Token-based routes validate token properly ──

describe('Token-based routes (export, deletion) validate tokens properly', () => {
  it('export/[token] validates token length >= 16', () => {
    const source = readRoute('app/api/privacy/export/[token]/route.ts')
    expect(source).toContain('token.length < 16')
    expect(source).toContain('status: 400')
  })

  it('verify-deletion validates token length >= 16', () => {
    const source = readRoute('app/api/privacy/verify-deletion/route.ts')
    expect(source).toContain('body.token.length < 16')
    expect(source).toContain('status: 400')
  })

  it('export/[token] checks expiry and returns 410 for expired', () => {
    const source = readRoute('app/api/privacy/export/[token]/route.ts')
    expect(source).toContain('expires_at')
    expect(source).toContain('status: 410')
  })

  it('verify-deletion checks request status is pending_verification', () => {
    const source = readRoute('app/api/privacy/verify-deletion/route.ts')
    expect(source).toContain("'pending_verification'")
    expect(source).toContain('status: 400')
  })
})

// ── Conversation history sanitization ──

describe('Conversation history is sanitized before injection into AI prompts', () => {
  it('chat route sanitizes conversation history content with sanitizeForPrompt', () => {
    const source = readRoute('app/api/chat/route.ts')
    // The history mapping should apply sanitizeForPrompt to m.content
    expect(source).toMatch(/safeHistory[\s\S]*sanitizeForPrompt\(/)
  })

  it('checkin-conversation sanitizes conversation_so_far content with sanitizeForPrompt', () => {
    const source = readRoute('app/api/checkin-conversation/route.ts')
    // The history mapping should apply sanitizeForPrompt to m.content
    expect(source).toMatch(/conversation_so_far[\s\S]*sanitizeForPrompt\(/)
  })
})

// ── Analytics route has input size limits ──

describe('Analytics route has input size protection', () => {
  it('limits body size to prevent log injection', () => {
    const source = readRoute('app/api/analytics/route.ts')
    expect(source).toContain('10_000')
    expect(source).toContain('.slice(0, 255)')
  })
})

// ── Unsubscribe route escapes HTML output ──

describe('Unsubscribe route HTML output escaping', () => {
  it('uses escapeHtml function to prevent XSS', () => {
    const source = readRoute('app/api/communications/unsubscribe/route.ts')
    expect(source).toContain('escapeHtml')
    expect(source).toContain('safeTitle')
    expect(source).toContain('safeBody')
  })
})
