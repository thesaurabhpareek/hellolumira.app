/**
 * @module ChatClassifier
 * @description Rule-based concern classification for parenting messages.
 *   Fast, deterministic classification using substring matching across 10
 *   concern categories. Returns 'general' for unclassifiable messages and
 *   'multiple' when more than 2 categories match.
 * @version 1.0.0
 * @since March 2026
 */

import type { ConcernCategory } from '@/types/chat'

const CATEGORY_PATTERNS: Record<ConcernCategory, string[]> = {
  sleep: [
    'sleep', 'wake', 'waking', 'nap', 'bedtime', 'overtired', 'regression',
    'night feed', 'settling', 'self settle', 'dream feed', 'wake window',
  ],
  feeding: [
    'feed', 'feeding', 'breast', 'formula', 'bottle', 'latch', 'milk',
    'solids', 'weaning', 'puree', 'eating', 'hunger cues', 'cluster feed',
  ],
  crying: [
    'cry', 'crying', 'colic', 'fussy', 'fussiness', 'unsettled', 'screaming',
    'whining', 'inconsolable', 'colicky',
  ],
  digestion: [
    'poop', 'poo', 'stool', 'nappy', 'diaper', 'constipat', 'gas', 'wind',
    'bloat', 'reflux', 'spit up', 'vomit', 'tummy',
  ],
  teething: [
    'teeth', 'teething', 'gum', 'drool', 'biting', 'chewing',
  ],
  illness: [
    'fever', 'temperature', 'cold', 'sick', 'unwell', 'rash', 'cough',
    'runny nose', 'congestion', 'ear', 'infection', 'virus', 'ill',
  ],
  development: [
    'milestone', 'crawl', 'walk', 'talk', 'roll', 'sit', 'stand',
    'development', 'delay', 'behind', 'ahead', 'developmental',
  ],
  skin: [
    'rash', 'eczema', 'cradle cap', 'dry skin', 'bumps', 'spots', 'hives',
    'nappy rash', 'diaper rash',
  ],
  safety: [
    'safe sleep', 'car seat', 'fall', 'safety', 'choke', 'swallow',
  ],
  mental_health_parent: [
    'struggling', 'overwhelmed', 'anxious', 'depressed', 'crying myself',
    'not coping', 'postpartum', 'postnatal', 'exhausted', 'cannot do this',
    'falling apart', 'help me', 'support',
  ],
  general: [],
  emergency: [],
  multiple: [],
}

/**
 * Classifies a parent's message into a concern category.
 *
 * Skips empty categories ('general', 'emergency', 'multiple') during iteration.
 * Returns the first match if exactly one category matches, 'multiple' if >2 match,
 * or 'general' if no patterns match.
 *
 * @param message - The parent's raw message text.
 * @returns The classified concern category.
 */
export function classifyConcern(message: string): ConcernCategory {
  // Guard: null, undefined, or non-string input
  if (!message || typeof message !== 'string' || !message.trim()) {
    return 'general'
  }
  const lower = message.toLowerCase()
  const matched: ConcernCategory[] = []

  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    if (category === 'general' || category === 'emergency' || category === 'multiple') continue
    if (patterns.some(p => lower.includes(p))) {
      matched.push(category as ConcernCategory)
    }
  }

  if (matched.length === 0) return 'general'
  if (matched.length === 1) return matched[0]
  if (matched.length > 2) return 'multiple'
  return matched[0]
}
