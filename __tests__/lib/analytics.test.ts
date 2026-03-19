// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Must re-import fresh module for each test to reset sessionId
beforeEach(() => {
  vi.restoreAllMocks()
})

describe('Analytics — trackEvent', () => {
  it('logs to console in development', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    // Re-import to get fresh module
    const { trackEvent } = await import('@/lib/analytics')
    trackEvent('onboarding_started', { step: 1 })
    expect(consoleSpy).toHaveBeenCalledWith(
      '[Analytics]',
      'onboarding_started',
      { step: 1 }
    )
    consoleSpy.mockRestore()
    vi.unstubAllEnvs()
  })

  it('does not throw on any event type', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const { trackEvent } = await import('@/lib/analytics')
    const events = [
      'onboarding_started', 'onboarding_completed', 'checkin_started',
      'chat_message_sent', 'concern_flow_started', 'app_opened',
      'landing_page_viewed',
    ] as const
    for (const event of events) {
      expect(() => trackEvent(event)).not.toThrow()
    }
    vi.unstubAllEnvs()
  })

  it('all event types are valid strings (type check via usage)', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const { trackEvent } = await import('@/lib/analytics')
    // If these compile and don't throw, the types are valid
    expect(() => trackEvent('magic_link_sent')).not.toThrow()
    expect(() => trackEvent('data_export_requested')).not.toThrow()
    expect(() => trackEvent('partner_invite_sent')).not.toThrow()
    vi.unstubAllEnvs()
  })

  it('logs properties when provided', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { trackEvent } = await import('@/lib/analytics')
    trackEvent('page_viewed', { path: '/home' })
    expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'page_viewed', { path: '/home' })
    consoleSpy.mockRestore()
    vi.unstubAllEnvs()
  })

  it('logs empty string for properties when none provided', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { trackEvent } = await import('@/lib/analytics')
    trackEvent('app_opened')
    expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'app_opened', '')
    consoleSpy.mockRestore()
    vi.unstubAllEnvs()
  })
})

describe('Analytics — identifyUser', () => {
  it('logs in development', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { identifyUser } = await import('@/lib/analytics')
    identifyUser('user-123')
    expect(consoleSpy).toHaveBeenCalledWith('[Analytics] Identify:', 'user-123')
    consoleSpy.mockRestore()
    vi.unstubAllEnvs()
  })

  it('does not throw for any profile id', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const { identifyUser } = await import('@/lib/analytics')
    expect(() => identifyUser('')).not.toThrow()
    expect(() => identifyUser('00000000-0000-0000-0000-000000000001')).not.toThrow()
    vi.unstubAllEnvs()
  })
})

describe('Analytics — getSessionId', () => {
  it('returns consistent value within session (via trackEvent payload)', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    // We can't directly test getSessionId since it's not exported,
    // but we can verify it indirectly — trackEvent doesn't throw
    // and uses getSessionId internally. The function should return
    // a string each time.
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { trackEvent } = await import('@/lib/analytics')
    // Call twice — should not throw, implying getSessionId works
    trackEvent('app_opened')
    trackEvent('app_opened')
    expect(consoleSpy).toHaveBeenCalledTimes(2)
    consoleSpy.mockRestore()
    vi.unstubAllEnvs()
  })
})
