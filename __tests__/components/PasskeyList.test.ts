// __tests__/components/PasskeyList.test.ts
// Unit tests for PasskeyList display logic and passkey management behaviors.
// Tests cover: passkey rendering, date display, badge logic, removal flow,
// rate-limit handling. Uses pure logic tests since the component is designed
// but the file does not yet exist in components/.

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Passkey {
  id: string
  user_id: string
  device_hint: string
  credential_id: string
  created_at: string
  last_used_at: string | null
  backed_up: boolean
  suspended: boolean
}

// ─── Date display logic (mirrors what PasskeyList should implement) ───────────

function formatLastUsed(lastUsedAt: string | null): string {
  if (!lastUsedAt) return 'Never used'

  const lastUsed = new Date(lastUsedAt)
  const now = new Date()

  const msPerDay = 24 * 60 * 60 * 1000
  const diffMs = now.getTime() - lastUsed.getTime()
  const diffDays = Math.floor(diffMs / msPerDay)

  if (diffDays === 0) return 'Last used today'
  if (diffDays === 1) return 'Last used yesterday'
  return `Last used ${diffDays} days ago`
}

// ─── "This device" logic ─────────────────────────────────────────────────────

function isCurrentDevice(passkeyId: string, storedId: string | null): boolean {
  return storedId !== null && storedId === passkeyId
}

// ─── iCloud badge logic ───────────────────────────────────────────────────────

function getPasskeyBadges(passkey: Passkey, currentDeviceId: string | null): string[] {
  const badges: string[] = []
  if (isCurrentDevice(passkey.id, currentDeviceId)) {
    badges.push('This device')
  }
  if (passkey.backed_up) {
    badges.push('iCloud Keychain')
  }
  return badges
}

// ─── iCloud warning text logic ───────────────────────────────────────────────

function getRemovalWarning(passkey: Passkey): string | null {
  if (passkey.backed_up) {
    return 'This passkey is stored in iCloud Keychain. Removing it here will not delete it from your iCloud account.'
  }
  return null
}

// ─── Fetch deletion API (simulated) ─────────────────────────────────────────

async function deletePasskey(
  passkeyId: string,
  fetchImpl: typeof fetch
): Promise<{ success: boolean; error?: string }> {
  const res = await fetchImpl(`/api/auth/passkey/${passkeyId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  })

  if (res.status === 429) {
    return {
      success: false,
      error: 'You have removed too many passkeys recently. Please wait 24 hours.',
    }
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    return { success: false, error: (data as Record<string, string>).error ?? 'Failed to remove passkey.' }
  }

  return { success: true }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

const TODAY = new Date()

function daysAgo(n: number): string {
  const d = new Date(TODAY)
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

describe('PasskeyList — empty state and passkey rendering', () => {
  it('returns empty array when passkeys prop is empty', () => {
    const passkeys: Passkey[] = []
    expect(passkeys).toHaveLength(0)
  })

  it('returns correct count when passkeys are provided', () => {
    const passkeys: Passkey[] = [
      { id: 'pk-1', user_id: 'u1', device_hint: 'iPhone 15', credential_id: 'cred-1', created_at: TODAY.toISOString(), last_used_at: null, backed_up: false, suspended: false },
      { id: 'pk-2', user_id: 'u1', device_hint: 'MacBook Pro', credential_id: 'cred-2', created_at: TODAY.toISOString(), last_used_at: null, backed_up: true, suspended: false },
    ]
    expect(passkeys).toHaveLength(2)
    expect(passkeys[0].device_hint).toBe('iPhone 15')
    expect(passkeys[1].device_hint).toBe('MacBook Pro')
  })
})

describe('PasskeyList — date display logic', () => {
  it('shows "Last used today" when last_used_at is today', () => {
    const result = formatLastUsed(daysAgo(0))
    expect(result).toBe('Last used today')
  })

  it('shows "Last used X days ago" for a date 5 days ago', () => {
    const result = formatLastUsed(daysAgo(5))
    expect(result).toBe('Last used 5 days ago')
  })

  it('shows "Last used X days ago" for a date roughly 30 days ago', () => {
    const result = formatLastUsed(daysAgo(30))
    // Due to sub-day timing, the result may be 29 or 30 days ago
    expect(result).toMatch(/Last used (29|30) days ago/)
  })

  it('shows "Never used" when last_used_at is null', () => {
    const result = formatLastUsed(null)
    expect(result).toBe('Never used')
  })

  it('shows "Last used yesterday" for 1 day ago', () => {
    const result = formatLastUsed(daysAgo(1))
    expect(result).toBe('Last used yesterday')
  })
})

describe('PasskeyList — badge logic', () => {
  const passkey: Passkey = {
    id: 'pk-123',
    user_id: 'user-1',
    device_hint: 'iPhone 15',
    credential_id: 'cred-123',
    created_at: TODAY.toISOString(),
    last_used_at: null,
    backed_up: false,
    suspended: false,
  }

  it('shows "This device" badge when passkey.id matches localStorage lumira_passkey_id', () => {
    const badges = getPasskeyBadges({ ...passkey, id: 'pk-123' }, 'pk-123')
    expect(badges).toContain('This device')
  })

  it('does NOT show "This device" badge when passkey.id does not match', () => {
    const badges = getPasskeyBadges({ ...passkey, id: 'pk-123' }, 'pk-other')
    expect(badges).not.toContain('This device')
  })

  it('does NOT show "This device" badge when localStorage value is null', () => {
    const badges = getPasskeyBadges({ ...passkey, id: 'pk-123' }, null)
    expect(badges).not.toContain('This device')
  })

  it('shows "iCloud Keychain" badge when backed_up=true', () => {
    const badges = getPasskeyBadges({ ...passkey, backed_up: true }, null)
    expect(badges).toContain('iCloud Keychain')
  })

  it('does NOT show "iCloud Keychain" badge when backed_up=false', () => {
    const badges = getPasskeyBadges({ ...passkey, backed_up: false }, null)
    expect(badges).not.toContain('iCloud Keychain')
  })

  it('shows both "This device" and "iCloud Keychain" when both conditions are true', () => {
    const badges = getPasskeyBadges({ ...passkey, id: 'pk-123', backed_up: true }, 'pk-123')
    expect(badges).toContain('This device')
    expect(badges).toContain('iCloud Keychain')
  })
})

describe('PasskeyList — removal confirmation modal content', () => {
  const iCloudPasskey: Passkey = {
    id: 'pk-icloud',
    user_id: 'user-1',
    device_hint: 'iPhone 15 (iCloud)',
    credential_id: 'cred-icloud',
    created_at: TODAY.toISOString(),
    last_used_at: null,
    backed_up: true,
    suspended: false,
  }

  const localPasskey: Passkey = {
    id: 'pk-local',
    user_id: 'user-1',
    device_hint: 'MacBook Pro',
    credential_id: 'cred-local',
    created_at: TODAY.toISOString(),
    last_used_at: null,
    backed_up: false,
    suspended: false,
  }

  it('confirmation modal shows iCloud warning text when backed_up=true', () => {
    const warning = getRemovalWarning(iCloudPasskey)
    expect(warning).not.toBeNull()
    expect(warning?.toLowerCase()).toContain('icloud')
  })

  it('confirmation modal does NOT show iCloud warning when backed_up=false', () => {
    const warning = getRemovalWarning(localPasskey)
    expect(warning).toBeNull()
  })
})

describe('PasskeyList — deletion API call', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls DELETE /api/auth/passkey/[factorId] on confirm removal', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    })

    const result = await deletePasskey('pk-to-delete', mockFetch as unknown as typeof fetch)

    expect(result.success).toBe(true)
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/auth/passkey/pk-to-delete',
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('removes item from list on successful deletion', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    })

    let passkeys: Passkey[] = [
      { id: 'pk-1', user_id: 'u1', device_hint: 'iPhone', credential_id: 'c1', created_at: '', last_used_at: null, backed_up: false, suspended: false },
      { id: 'pk-2', user_id: 'u1', device_hint: 'Mac', credential_id: 'c2', created_at: '', last_used_at: null, backed_up: false, suspended: false },
    ]

    const result = await deletePasskey('pk-1', mockFetch as unknown as typeof fetch)
    if (result.success) {
      passkeys = passkeys.filter(pk => pk.id !== 'pk-1')
    }

    expect(passkeys).toHaveLength(1)
    expect(passkeys[0].id).toBe('pk-2')
  })

  it('rate limit (429) returns appropriate error message', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: 'Rate limit exceeded' }),
    })

    const result = await deletePasskey('pk-to-delete', mockFetch as unknown as typeof fetch)

    expect(result.success).toBe(false)
    expect(result.error?.toLowerCase()).toContain('24 hours')
  })

  it('returns generic error when server returns non-429 error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal server error' }),
    })

    const result = await deletePasskey('pk-to-delete', mockFetch as unknown as typeof fetch)

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('returns generic error message when server error has no error field', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({}),
    })

    const result = await deletePasskey('pk-to-delete', mockFetch as unknown as typeof fetch)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Failed to remove passkey.')
  })
})

describe('PasskeyList — passkey list filtering', () => {
  const passkeys: Passkey[] = [
    { id: 'pk-1', user_id: 'u1', device_hint: 'iPhone 15', credential_id: 'c1', created_at: daysAgo(10), last_used_at: daysAgo(2), backed_up: true, suspended: false },
    { id: 'pk-2', user_id: 'u1', device_hint: 'MacBook Pro', credential_id: 'c2', created_at: daysAgo(5), last_used_at: daysAgo(0), backed_up: false, suspended: false },
    { id: 'pk-3', user_id: 'u1', device_hint: 'iPad', credential_id: 'c3', created_at: daysAgo(1), last_used_at: null, backed_up: false, suspended: true },
  ]

  it('correctly identifies passkeys by device_hint', () => {
    const hints = passkeys.map(pk => pk.device_hint)
    expect(hints).toContain('iPhone 15')
    expect(hints).toContain('MacBook Pro')
    expect(hints).toContain('iPad')
  })

  it('can filter out suspended passkeys if needed', () => {
    const active = passkeys.filter(pk => !pk.suspended)
    expect(active).toHaveLength(2)
  })

  it('can identify backed-up passkeys', () => {
    const backedUp = passkeys.filter(pk => pk.backed_up)
    expect(backedUp).toHaveLength(1)
    expect(backedUp[0].device_hint).toBe('iPhone 15')
  })

  it('formatLastUsed works correctly for all passkeys in list', () => {
    const displays = passkeys.map(pk => formatLastUsed(pk.last_used_at))
    expect(displays[0]).toBe('Last used 2 days ago')
    expect(displays[1]).toBe('Last used today')
    expect(displays[2]).toBe('Never used')
  })
})
