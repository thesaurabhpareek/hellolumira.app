/**
 * @module Utils
 * @description Shared utility functions used across the Lumira codebase.
 *   Includes Tailwind class merging, SHA-256 hashing for PII anonymisation,
 *   input sanitisation, and standard security headers for API responses.
 * @version 1.0.0
 * @since March 2026
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/** Merges Tailwind CSS class names, resolving conflicts via twMerge. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Hashes a string using SHA-256 and returns the hex digest.
 * Used to hash IP addresses before storage — raw IPs are never persisted.
 */
export async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Sanitize user input to prevent injection attacks.
 * Strips null bytes and trims whitespace. For display contexts,
 * HTML is escaped; for database storage, parameterized queries handle safety.
 */
export function sanitizeInput(input: string, maxLength = 5000): string {
  return input
    .replace(/\0/g, '')       // strip null bytes
    .trim()
    .slice(0, maxLength)       // enforce max length
}

/** Standard security headers for API responses. */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
} as const
