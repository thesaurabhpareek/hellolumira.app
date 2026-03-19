// lib/validation.ts — Reusable validation utilities for API routes
import { NextRequest, NextResponse } from 'next/server'
import { SECURITY_HEADERS } from '@/lib/utils'

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Validates a string is a valid UUID v4 format.
 */
export function isValidUUID(id: unknown): id is string {
  return typeof id === 'string' && UUID_REGEX.test(id)
}

/**
 * Validates a string is a plausible email address.
 */
export function isValidEmail(email: unknown): email is string {
  return typeof email === 'string' && EMAIL_REGEX.test(email.trim())
}

/**
 * Sanitizes a string: trims whitespace, strips null bytes, enforces max length.
 */
export function sanitizeString(input: string, maxLength = 5000): string {
  return input
    .replace(/\0/g, '')
    .trim()
    .slice(0, maxLength)
}

/**
 * Validates that all required fields exist on the body and are non-empty strings.
 * Returns an error message for the first missing/invalid field, or null if all valid.
 */
export function validateRequiredFields(
  body: Record<string, unknown>,
  fields: string[]
): string | null {
  for (const field of fields) {
    const value = body[field]
    if (value === undefined || value === null || value === '') {
      return `Missing required field: ${field}`
    }
  }
  return null
}

/**
 * Validates that specified fields are valid UUIDs.
 * Returns an error message for the first invalid UUID, or null if all valid.
 */
export function validateUUIDFields(
  body: Record<string, unknown>,
  fields: string[]
): string | null {
  for (const field of fields) {
    const value = body[field]
    if (value !== undefined && value !== null && !isValidUUID(value)) {
      return `Invalid ${field} format — expected UUID`
    }
  }
  return null
}

/**
 * Safely parses JSON from a NextRequest body.
 * Returns the parsed data or an error response.
 */
export async function parseJsonBody<T = Record<string, unknown>>(
  request: NextRequest
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const data = (await request.json()) as T
    if (data === null || typeof data !== 'object') {
      return {
        data: null,
        error: NextResponse.json(
          { error: true, message: 'Request body must be a JSON object' },
          { status: 400, headers: SECURITY_HEADERS }
        ),
      }
    }
    return { data, error: null }
  } catch {
    return {
      data: null,
      error: NextResponse.json(
        { error: true, message: 'Invalid JSON body' },
        { status: 400, headers: SECURITY_HEADERS }
      ),
    }
  }
}

/**
 * Verifies that the authenticated user is a member of the given baby profile.
 * Prevents IDOR attacks where a user could pass any baby_id to access other users' data.
 * @returns true if the user is a member, false otherwise
 */
export async function verifyBabyOwnership(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: { from: (table: string) => any },
  userId: string,
  babyId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('baby_profile_members')
    .select('baby_id')
    .eq('baby_id', babyId)
    .eq('profile_id', userId)
    .maybeSingle()
  return !!data
}

/**
 * Validates a value is one of the allowed enum values.
 */
export function isValidEnum<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
}

/**
 * Validates an array field: checks it's an array, enforces max length, and validates element types.
 * Returns an error message or null.
 */
export function validateArray(
  value: unknown,
  fieldName: string,
  options: { maxLength?: number; elementType?: string; required?: boolean } = {}
): string | null {
  const { maxLength = 100, elementType, required = false } = options

  if (value === undefined || value === null) {
    if (required) return `Missing required field: ${fieldName}`
    return null
  }

  if (!Array.isArray(value)) {
    return `${fieldName} must be an array`
  }

  if (value.length > maxLength) {
    return `${fieldName} exceeds maximum length of ${maxLength}`
  }

  if (elementType) {
    for (let i = 0; i < value.length; i++) {
      if (typeof value[i] !== elementType) {
        return `${fieldName}[${i}] must be of type ${elementType}`
      }
    }
  }

  return null
}
