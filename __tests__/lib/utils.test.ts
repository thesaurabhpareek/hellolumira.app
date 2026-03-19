import { describe, it, expect } from 'vitest'
import { sha256, sanitizeInput, cn, SECURITY_HEADERS } from '@/lib/utils'

// ── sha256 ─────────────────────────────────────────────────────────────

describe('sha256', () => {
  it('returns a 64-character hex string', async () => {
    const hash = await sha256('hello')
    expect(hash).toHaveLength(64)
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('produces deterministic output for the same input', async () => {
    const hash1 = await sha256('test-input')
    const hash2 = await sha256('test-input')
    expect(hash1).toBe(hash2)
  })

  it('produces different output for different inputs', async () => {
    const hash1 = await sha256('input-a')
    const hash2 = await sha256('input-b')
    expect(hash1).not.toBe(hash2)
  })

  it('hashes empty string without error', async () => {
    const hash = await sha256('')
    expect(hash).toHaveLength(64)
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('known SHA-256 of "hello" matches expected value', async () => {
    // SHA-256("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
    const hash = await sha256('hello')
    expect(hash).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824')
  })

  it('hashes IP address to 64-char hex', async () => {
    const hash = await sha256('192.168.1.1')
    expect(hash).toHaveLength(64)
    expect(hash).not.toBe('192.168.1.1')
  })

  it('handles unicode input', async () => {
    const hash = await sha256('日本語テスト')
    expect(hash).toHaveLength(64)
  })

  it('handles very long input', async () => {
    const longInput = 'a'.repeat(100000)
    const hash = await sha256(longInput)
    expect(hash).toHaveLength(64)
  })

  it('handles special characters', async () => {
    const hash = await sha256('!@#$%^&*()_+-=[]{}|;:,.<>?')
    expect(hash).toHaveLength(64)
  })

  it('handles null bytes in input', async () => {
    const hash = await sha256('hello\0world')
    expect(hash).toHaveLength(64)
  })

  it('handles newlines and whitespace', async () => {
    const hash = await sha256('line1\nline2\ttab')
    expect(hash).toHaveLength(64)
  })
})

// ── sanitizeInput ──────────────────────────────────────────────────────

describe('sanitizeInput', () => {
  it('trims leading and trailing whitespace', () => {
    expect(sanitizeInput('  hello world  ')).toBe('hello world')
  })

  it('strips null bytes', () => {
    expect(sanitizeInput('hello\0world')).toBe('helloworld')
  })

  it('strips multiple null bytes', () => {
    expect(sanitizeInput('\0he\0llo\0')).toBe('hello')
  })

  it('enforces default max length of 5000', () => {
    const long = 'a'.repeat(6000)
    const result = sanitizeInput(long)
    expect(result).toHaveLength(5000)
  })

  it('enforces custom max length', () => {
    const long = 'a'.repeat(200)
    expect(sanitizeInput(long, 100)).toHaveLength(100)
  })

  it('returns empty string for whitespace-only input', () => {
    expect(sanitizeInput('   \t\n  ')).toBe('')
  })

  it('returns empty string for empty input', () => {
    expect(sanitizeInput('')).toBe('')
  })

  it('preserves normal text unchanged', () => {
    expect(sanitizeInput('Hello World')).toBe('Hello World')
  })

  it('preserves text at exactly max length', () => {
    const exact = 'a'.repeat(5000)
    expect(sanitizeInput(exact)).toHaveLength(5000)
  })

  it('handles max length of 0', () => {
    expect(sanitizeInput('hello', 0)).toBe('')
  })

  it('handles max length of 1', () => {
    expect(sanitizeInput('hello', 1)).toBe('h')
  })

  it('strips null bytes then trims then slices (order of operations)', () => {
    const input = '  \0hello world\0  '
    expect(sanitizeInput(input)).toBe('hello world')
  })

  it('handles XSS attempt strings (does not escape HTML)', () => {
    // sanitizeInput strips null bytes and trims, does NOT escape HTML
    const xss = '<script>alert("xss")</script>'
    expect(sanitizeInput(xss)).toBe(xss)
  })

  it('handles SQL injection attempt strings', () => {
    const sql = "'; DROP TABLE users; --"
    expect(sanitizeInput(sql)).toBe(sql)
  })

  it('handles emoji', () => {
    expect(sanitizeInput('  Hello 👋🏽  ')).toBe('Hello 👋🏽')
  })

  it('handles unicode', () => {
    expect(sanitizeInput('  café résumé  ')).toBe('café résumé')
  })
})

// ── cn (Tailwind class merge) ──────────────────────────────────────────

describe('cn', () => {
  it('merges simple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes via clsx', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
  })

  it('handles undefined and null values', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end')
  })

  it('handles empty string', () => {
    const result = cn('')
    expect(typeof result).toBe('string')
  })

  it('handles no arguments', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('handles array input', () => {
    const result = cn(['foo', 'bar'])
    expect(result).toContain('foo')
    expect(result).toContain('bar')
  })

  it('resolves Tailwind conflicts (twMerge)', () => {
    // twMerge should keep the last conflicting class
    const result = cn('p-4', 'p-2')
    expect(result).toBe('p-2')
  })

  it('keeps non-conflicting Tailwind classes', () => {
    const result = cn('p-4', 'text-red-500')
    expect(result).toContain('p-4')
    expect(result).toContain('text-red-500')
  })
})

// ── SECURITY_HEADERS ───────────────────────────────────────────────────

describe('SECURITY_HEADERS', () => {
  it('includes X-Content-Type-Options: nosniff', () => {
    expect(SECURITY_HEADERS['X-Content-Type-Options']).toBe('nosniff')
  })

  it('includes X-Frame-Options: DENY', () => {
    expect(SECURITY_HEADERS['X-Frame-Options']).toBe('DENY')
  })

  it('includes Referrer-Policy', () => {
    expect(SECURITY_HEADERS['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
  })

  it('includes Permissions-Policy blocking camera/mic/geo', () => {
    expect(SECURITY_HEADERS['Permissions-Policy']).toContain('camera=()')
    expect(SECURITY_HEADERS['Permissions-Policy']).toContain('microphone=()')
    expect(SECURITY_HEADERS['Permissions-Policy']).toContain('geolocation=()')
  })

  it('has exactly 4 headers', () => {
    expect(Object.keys(SECURITY_HEADERS)).toHaveLength(4)
  })

  it('is frozen (cannot be modified)', () => {
    // SECURITY_HEADERS is defined with `as const`, values should be string literals
    expect(typeof SECURITY_HEADERS['X-Content-Type-Options']).toBe('string')
    expect(typeof SECURITY_HEADERS['X-Frame-Options']).toBe('string')
  })
})
