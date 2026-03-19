/**
 * @module Consent
 * @description GDPR/CCPA/DPDPA-compliant consent recording system. All consent
 *   events are append-only (INSERT only, no UPDATE/DELETE) in the consent_records
 *   table, creating an immutable audit trail. Supports single and batch consent
 *   recording with IP hashing and capture method tracking.
 * @version 1.0.0
 * @since March 2026
 */

import { createServiceClient } from '@/lib/supabase/server'
import { sha256 } from '@/lib/utils'

/**
 * Consent types that Lumira collects, per PRODUCT.md Section 18.5.
 * Each maps to a row in the `consent_records` table (append-only, no UPDATE/DELETE).
 *
 * IMPORTANT: This type must stay in sync with ConsentType in @/types/app.ts.
 */
export type ConsentType =
  | 'terms_of_service'
  | 'privacy_policy'
  | 'data_processing'
  | 'sensitive_data'
  | 'community_guidelines'
  | 'acceptable_use'
  | 'ai_data_practices'
  | 'marketing_email'
  | 'marketing_sms'
  | 'marketing_whatsapp'
  | 'analytics'
  | 'product_improvement'
  | 'third_party_sharing'

/** The action applied to a consent record. */
export type ConsentAction = 'granted' | 'withdrawn' | 'updated'

/** Options for recording a consent event. */
export type ConsentOptions = {
  /** Version of the legal document accepted (e.g. "1.2"). */
  document_version?: string
  /** How consent was captured (e.g. "onboarding_checkbox", "settings_toggle"). */
  capture_method: string
  /** Raw IP address — will be SHA-256 hashed before storage. */
  ip_address?: string
  /** User-Agent string from the request. */
  user_agent?: string
  /** The page URL where consent was captured. */
  page_url?: string
}

/** Result of a consent recording operation. */
export type ConsentResult = {
  success: boolean
  error?: string
}

const VALID_CONSENT_TYPES: ConsentType[] = [
  'terms_of_service', 'privacy_policy', 'data_processing', 'sensitive_data',
  'community_guidelines', 'acceptable_use', 'ai_data_practices',
  'marketing_email', 'marketing_sms', 'marketing_whatsapp',
  'analytics', 'product_improvement', 'third_party_sharing',
]

const VALID_CONSENT_ACTIONS: ConsentAction[] = ['granted', 'withdrawn', 'updated']

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Records a single consent event to the `consent_records` table.
 *
 * Uses the service-role Supabase client because `consent_records` has
 * RLS policies that forbid UPDATE and DELETE — only INSERT is allowed,
 * ensuring an immutable audit trail of consent decisions.
 *
 * This function **never throws**. On failure it returns `{ success: false, error }`.
 *
 * @param profileId   - The profile UUID granting/withdrawing consent.
 * @param consentType - Which consent is being recorded.
 * @param action      - Whether consent is granted, withdrawn, or updated.
 * @param options     - Additional context about how consent was captured.
 * @returns A result indicating success or failure with an error message.
 */
export async function recordConsent(
  profileId: string,
  consentType: ConsentType,
  action: ConsentAction,
  options?: ConsentOptions
): Promise<ConsentResult> {
  // Guard: required fields
  if (!profileId || typeof profileId !== 'string') {
    return { success: false, error: 'profileId is required' }
  }
  // Validate profile_id is a valid UUID format
  if (!UUID_REGEX.test(profileId)) {
    return { success: false, error: 'profileId must be a valid UUID' }
  }
  if (!consentType || typeof consentType !== 'string') {
    return { success: false, error: 'consentType is required' }
  }
  // Validate consent_type against allowed list
  if (!VALID_CONSENT_TYPES.includes(consentType)) {
    return { success: false, error: `Invalid consent type: ${consentType}` }
  }
  if (!action || typeof action !== 'string') {
    return { success: false, error: 'action is required' }
  }
  // Validate action against allowed list
  if (!VALID_CONSENT_ACTIONS.includes(action)) {
    return { success: false, error: `Invalid consent action: ${action}` }
  }
  // Validate document_version is non-empty if provided
  if (options?.document_version !== undefined && (typeof options.document_version !== 'string' || !options.document_version.trim())) {
    return { success: false, error: 'document_version must be a non-empty string if provided' }
  }

  try {
    const supabase = await createServiceClient()

    // Hash IP address if provided — never store raw
    let ipHash: string | null = null
    if (options?.ip_address) {
      ipHash = await sha256(options.ip_address)
    }

    const { error } = await supabase.from('consent_records').insert({
      profile_id: profileId,
      consent_type: consentType,
      action,
      document_version: options?.document_version ?? null,
      capture_method: options?.capture_method ?? 'unknown',
      ip_address: ipHash,
      user_agent: options?.user_agent ?? null,
      page_url: options?.page_url ?? null,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error('[consent] Failed to record consent:', error.message, {
        profileId,
        consentType,
        action,
      })
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[consent] Unexpected error in recordConsent:', message, {
      profileId,
      consentType,
      action,
    })
    return { success: false, error: message }
  }
}

/**
 * Records multiple consent events in a single batch insert.
 *
 * Designed for the onboarding flow where a user grants up to 4 consents
 * simultaneously (terms, privacy, data processing, marketing).
 *
 * All records share the same options (IP, user agent, capture method, etc.).
 * This function **never throws** — on partial or full failure it returns
 * `{ success: false, error }`.
 *
 * @param profileId    - The profile UUID granting consent.
 * @param consents     - Array of `{ consentType, action }` pairs to record.
 * @param options      - Shared options applied to all consent records in the batch.
 * @returns A result indicating success or failure with an error message.
 */
export async function recordConsentBatch(
  profileId: string,
  consents: { consentType: ConsentType; action: ConsentAction }[],
  options?: ConsentOptions
): Promise<ConsentResult> {
  // Guard: required fields
  if (!profileId || typeof profileId !== 'string') {
    return { success: false, error: 'profileId is required' }
  }
  if (!UUID_REGEX.test(profileId)) {
    return { success: false, error: 'profileId must be a valid UUID' }
  }
  if (!Array.isArray(consents) || consents.length === 0) {
    return { success: false, error: 'consents array is required and must not be empty' }
  }
  // Validate each consent entry
  for (const c of consents) {
    if (!c.consentType || !VALID_CONSENT_TYPES.includes(c.consentType)) {
      return { success: false, error: `Invalid consent type in batch: ${c.consentType}` }
    }
    if (!c.action || !VALID_CONSENT_ACTIONS.includes(c.action)) {
      return { success: false, error: `Invalid consent action in batch: ${c.action}` }
    }
  }

  try {
    const supabase = await createServiceClient()

    // Hash IP address once for the entire batch
    let ipHash: string | null = null
    if (options?.ip_address) {
      ipHash = await sha256(options.ip_address)
    }

    const now = new Date().toISOString()

    const rows = consents.map(({ consentType, action }) => ({
      profile_id: profileId,
      consent_type: consentType,
      action,
      document_version: options?.document_version ?? null,
      capture_method: options?.capture_method ?? 'unknown',
      ip_address: ipHash,
      user_agent: options?.user_agent ?? null,
      page_url: options?.page_url ?? null,
      created_at: now,
    }))

    const { error } = await supabase.from('consent_records').insert(rows)

    if (error) {
      console.error('[consent] Failed to record consent batch:', error.message, {
        profileId,
        count: consents.length,
      })
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[consent] Unexpected error in recordConsentBatch:', message, {
      profileId,
      count: consents.length,
    })
    return { success: false, error: message }
  }
}
