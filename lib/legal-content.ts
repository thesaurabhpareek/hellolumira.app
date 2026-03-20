/**
 * @module LegalContent
 * @description Legal document version management for terms, privacy policy,
 *   community guidelines, acceptable use, and data practices. Provides version
 *   checking to determine when users need to re-consent after document updates.
 * @version 1.0.0
 * @since March 2026
 */

export type LegalDocumentSlug =
  | 'terms'
  | 'privacy'
  | 'community'
  | 'acceptable-use'
  | 'data-practices'
  | 'cookies'

export type LegalDocumentMeta = {
  slug: LegalDocumentSlug
  title: string
  shortTitle: string
  description: string
  path: string
  version: string
  effectiveDate: string
  lastUpdated: string
}

export const LEGAL_VERSIONS: Record<LegalDocumentSlug, { version: string; effectiveDate: string; lastUpdated: string }> = {
  terms: { version: '1.0', effectiveDate: '2026-03-18', lastUpdated: '2026-03-18' },
  privacy: { version: '1.0', effectiveDate: '2026-03-18', lastUpdated: '2026-03-18' },
  community: { version: '1.0', effectiveDate: '2026-03-18', lastUpdated: '2026-03-18' },
  'acceptable-use': { version: '1.0', effectiveDate: '2026-03-18', lastUpdated: '2026-03-18' },
  'data-practices': { version: '1.0', effectiveDate: '2026-03-18', lastUpdated: '2026-03-18' },
  cookies: { version: '1.0', effectiveDate: '2026-03-18', lastUpdated: '2026-03-18' },
}

export function getLegalDocuments(): LegalDocumentMeta[] {
  return [
    {
      slug: 'terms',
      title: 'Terms of Service',
      shortTitle: 'Terms',
      description: 'Rules governing your use of Lumira, including medical disclaimers, liability limitations, and dispute resolution.',
      path: '/legal/terms',
      ...LEGAL_VERSIONS.terms,
    },
    {
      slug: 'privacy',
      title: 'Privacy Policy',
      shortTitle: 'Privacy',
      description: 'How we collect, use, store, and protect your personal data and your baby\'s data, including your rights under GDPR, CCPA, and DPDPA.',
      path: '/legal/privacy',
      ...LEGAL_VERSIONS.privacy,
    },
    {
      slug: 'community',
      title: 'Community Guidelines',
      shortTitle: 'Community',
      description: 'Standards for participating in Lumira Tribes, our community feature for parents.',
      path: '/legal/community',
      ...LEGAL_VERSIONS.community,
    },
    {
      slug: 'acceptable-use',
      title: 'Acceptable Use Policy',
      shortTitle: 'Acceptable Use',
      description: 'What you can and cannot do with Lumira, including AI interaction rules and prohibited conduct.',
      path: '/legal/acceptable-use',
      ...LEGAL_VERSIONS['acceptable-use'],
    },
    {
      slug: 'data-practices',
      title: 'AI & Data Practices',
      shortTitle: 'Data Practices',
      description: 'A plain-language guide to how Lumira uses AI, processes your data, and keeps it secure.',
      path: '/legal/data-practices',
      ...LEGAL_VERSIONS['data-practices'],
    },
    {
      slug: 'cookies',
      title: 'Cookie Policy',
      shortTitle: 'Cookies',
      description: 'How Lumira uses cookies. We use only essential session cookies — no tracking, no advertising.',
      path: '/legal/cookies',
      ...LEGAL_VERSIONS.cookies,
    },
  ]
}

/**
 * Check if a user has accepted the latest version of a specific legal document.
 * Compare the version string the user consented to against the current version.
 */
export function hasAcceptedLatestTerms(
  documentSlug: LegalDocumentSlug,
  userConsentVersion: string | null | undefined
): boolean {
  if (!userConsentVersion) return false
  const current = LEGAL_VERSIONS[documentSlug]
  return userConsentVersion === current.version
}

/**
 * Check if a user needs to re-consent to any legal documents.
 * Returns slugs of documents that need fresh consent.
 */
export function getDocumentsNeedingConsent(
  userConsents: Partial<Record<LegalDocumentSlug, string | null>>
): LegalDocumentSlug[] {
  const needsConsent: LegalDocumentSlug[] = []
  const requiredDocs: LegalDocumentSlug[] = ['terms', 'privacy']

  for (const slug of requiredDocs) {
    if (!hasAcceptedLatestTerms(slug, userConsents[slug])) {
      needsConsent.push(slug)
    }
  }

  return needsConsent
}

/**
 * Format a date string (YYYY-MM-DD) for display in legal documents.
 */
export function formatLegalDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
