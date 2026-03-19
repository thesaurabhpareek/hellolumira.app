import { describe, it, expect } from 'vitest'
import {
  isValidUUID,
  isValidEmail,
  sanitizeString,
  validateRequiredFields,
  validateUUIDFields,
  isValidEnum,
  validateArray,
} from '@/lib/validation'

// ── isValidUUID ─────────────────────────────────────────────────────────

describe('isValidUUID', () => {
  it('accepts valid UUID v4', () => {
    expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
  })

  it('accepts uppercase UUID', () => {
    expect(isValidUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true)
  })

  it('accepts mixed case UUID', () => {
    expect(isValidUUID('550e8400-E29B-41d4-a716-446655440000')).toBe(true)
  })

  it('rejects null', () => {
    expect(isValidUUID(null)).toBe(false)
  })

  it('rejects undefined', () => {
    expect(isValidUUID(undefined)).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidUUID('')).toBe(false)
  })

  it('rejects non-UUID string', () => {
    expect(isValidUUID('not-a-uuid')).toBe(false)
  })

  it('rejects UUID-like string with wrong format', () => {
    expect(isValidUUID('550e8400-e29b-41d4-a716')).toBe(false)
  })

  it('rejects UUID with extra characters', () => {
    expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000-extra')).toBe(false)
  })

  it('rejects number', () => {
    expect(isValidUUID(12345)).toBe(false)
  })

  it('rejects object', () => {
    expect(isValidUUID({})).toBe(false)
  })

  it('rejects boolean', () => {
    expect(isValidUUID(true)).toBe(false)
  })

  it('rejects UUID with spaces', () => {
    expect(isValidUUID(' 550e8400-e29b-41d4-a716-446655440000 ')).toBe(false)
  })

  it('rejects UUID without dashes', () => {
    expect(isValidUUID('550e8400e29b41d4a716446655440000')).toBe(false)
  })
})

// ── isValidEmail ────────────────────────────────────────────────────────

describe('isValidEmail', () => {
  it('accepts standard email', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
  })

  it('accepts email with subdomain', () => {
    expect(isValidEmail('user@mail.example.com')).toBe(true)
  })

  it('accepts email with plus addressing', () => {
    expect(isValidEmail('user+tag@example.com')).toBe(true)
  })

  it('accepts email with dots in local part', () => {
    expect(isValidEmail('first.last@example.com')).toBe(true)
  })

  it('trims whitespace before validation', () => {
    expect(isValidEmail('  user@example.com  ')).toBe(true)
  })

  it('rejects null', () => {
    expect(isValidEmail(null)).toBe(false)
  })

  it('rejects undefined', () => {
    expect(isValidEmail(undefined)).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidEmail('')).toBe(false)
  })

  it('rejects string without @', () => {
    expect(isValidEmail('userexample.com')).toBe(false)
  })

  it('rejects string without domain', () => {
    expect(isValidEmail('user@')).toBe(false)
  })

  it('rejects string without local part', () => {
    expect(isValidEmail('@example.com')).toBe(false)
  })

  it('rejects string with spaces in middle', () => {
    expect(isValidEmail('user @example.com')).toBe(false)
  })

  it('rejects number', () => {
    expect(isValidEmail(12345)).toBe(false)
  })

  it('rejects string without TLD', () => {
    expect(isValidEmail('user@example')).toBe(false)
  })
})

// ── sanitizeString ──────────────────────────────────────────────────────

describe('sanitizeString', () => {
  it('trims whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello')
  })

  it('strips null bytes', () => {
    expect(sanitizeString('hello\0world')).toBe('helloworld')
  })

  it('enforces default max length (5000)', () => {
    const long = 'a'.repeat(6000)
    expect(sanitizeString(long)).toHaveLength(5000)
  })

  it('enforces custom max length', () => {
    const long = 'a'.repeat(100)
    expect(sanitizeString(long, 50)).toHaveLength(50)
  })

  it('returns empty string for whitespace-only input', () => {
    expect(sanitizeString('   ')).toBe('')
  })

  it('handles empty string', () => {
    expect(sanitizeString('')).toBe('')
  })

  it('strips null bytes then trims then slices', () => {
    const input = '  \0hello\0  '
    expect(sanitizeString(input)).toBe('hello')
  })

  it('preserves normal text', () => {
    expect(sanitizeString('Hello World')).toBe('Hello World')
  })

  it('handles string at exactly max length', () => {
    const exact = 'a'.repeat(5000)
    expect(sanitizeString(exact)).toHaveLength(5000)
  })
})

// ── validateRequiredFields ──────────────────────────────────────────────

describe('validateRequiredFields', () => {
  it('returns null when all required fields present', () => {
    const body = { name: 'Alice', email: 'alice@example.com' }
    expect(validateRequiredFields(body, ['name', 'email'])).toBeNull()
  })

  it('returns error for missing field', () => {
    const body = { name: 'Alice' }
    const error = validateRequiredFields(body, ['name', 'email'])
    expect(error).toBe('Missing required field: email')
  })

  it('returns error for null field', () => {
    const body = { name: null }
    const error = validateRequiredFields(body as Record<string, unknown>, ['name'])
    expect(error).toBe('Missing required field: name')
  })

  it('returns error for undefined field', () => {
    const body = { name: undefined }
    const error = validateRequiredFields(body as Record<string, unknown>, ['name'])
    expect(error).toBe('Missing required field: name')
  })

  it('returns error for empty string field', () => {
    const body = { name: '' }
    const error = validateRequiredFields(body, ['name'])
    expect(error).toBe('Missing required field: name')
  })

  it('returns error for first missing field only', () => {
    const body = {}
    const error = validateRequiredFields(body, ['a', 'b', 'c'])
    expect(error).toBe('Missing required field: a')
  })

  it('returns null for empty required fields list', () => {
    expect(validateRequiredFields({}, [])).toBeNull()
  })

  it('accepts numeric values as valid', () => {
    const body = { count: 0 }
    expect(validateRequiredFields(body, ['count'])).toBeNull()
  })

  it('accepts boolean false as valid', () => {
    const body = { active: false }
    expect(validateRequiredFields(body, ['active'])).toBeNull()
  })
})

// ── validateUUIDFields ──────────────────────────────────────────────────

describe('validateUUIDFields', () => {
  it('returns null when all UUID fields are valid', () => {
    const body = { id: '550e8400-e29b-41d4-a716-446655440000' }
    expect(validateUUIDFields(body, ['id'])).toBeNull()
  })

  it('returns error for invalid UUID', () => {
    const body = { id: 'not-a-uuid' }
    const error = validateUUIDFields(body, ['id'])
    expect(error).toContain('Invalid')
    expect(error).toContain('id')
    expect(error).toContain('UUID')
  })

  it('skips null fields (they are optional)', () => {
    const body = { id: null }
    expect(validateUUIDFields(body as Record<string, unknown>, ['id'])).toBeNull()
  })

  it('skips undefined fields (they are optional)', () => {
    const body = {}
    expect(validateUUIDFields(body, ['id'])).toBeNull()
  })
})

// ── isValidEnum ─────────────────────────────────────────────────────────

describe('isValidEnum', () => {
  const STAGES = ['pregnancy', 'infant', 'toddler'] as const

  it('returns true for valid enum value', () => {
    expect(isValidEnum('pregnancy', STAGES)).toBe(true)
  })

  it('returns false for invalid enum value', () => {
    expect(isValidEnum('teenager', STAGES)).toBe(false)
  })

  it('returns false for null', () => {
    expect(isValidEnum(null, STAGES)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isValidEnum(undefined, STAGES)).toBe(false)
  })

  it('returns false for number', () => {
    expect(isValidEnum(42, STAGES)).toBe(false)
  })

  it('returns false for empty string when not in list', () => {
    expect(isValidEnum('', STAGES)).toBe(false)
  })
})

// ── validateArray ───────────────────────────────────────────────────────

describe('validateArray', () => {
  it('returns null for valid array', () => {
    expect(validateArray([1, 2, 3], 'items')).toBeNull()
  })

  it('returns null for null/undefined when not required', () => {
    expect(validateArray(null, 'items')).toBeNull()
    expect(validateArray(undefined, 'items')).toBeNull()
  })

  it('returns error for null when required', () => {
    const error = validateArray(null, 'items', { required: true })
    expect(error).toContain('Missing required field: items')
  })

  it('returns error for non-array value', () => {
    const error = validateArray('not-array', 'items')
    expect(error).toContain('must be an array')
  })

  it('returns error when array exceeds max length', () => {
    const arr = Array.from({ length: 101 }, (_, i) => i)
    const error = validateArray(arr, 'items')
    expect(error).toContain('exceeds maximum length')
  })

  it('accepts array at exactly max length', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i)
    expect(validateArray(arr, 'items')).toBeNull()
  })

  it('validates element types when specified', () => {
    const error = validateArray([1, 'two', 3], 'items', { elementType: 'number' })
    expect(error).toContain('items[1]')
    expect(error).toContain('number')
  })

  it('accepts all elements of correct type', () => {
    expect(validateArray(['a', 'b', 'c'], 'items', { elementType: 'string' })).toBeNull()
  })

  it('respects custom max length', () => {
    const arr = Array.from({ length: 5 }, (_, i) => i)
    const error = validateArray(arr, 'items', { maxLength: 3 })
    expect(error).toContain('exceeds maximum length of 3')
  })

  it('returns null for empty array (not required)', () => {
    expect(validateArray([], 'items')).toBeNull()
  })
})
