import { describe, it, expect } from 'vitest'
import { inferEmotionalSignal } from '@/lib/emotional-signals'

describe('inferEmotionalSignal', () => {
  // ── INPUT VALIDATION ────────────────────────────────────────────────────

  describe('input validation', () => {
    it('returns null for null input', () => {
      expect(inferEmotionalSignal(null as unknown as string)).toBeNull()
    })

    it('returns null for undefined input', () => {
      expect(inferEmotionalSignal(undefined as unknown as string)).toBeNull()
    })

    it('returns null for empty string', () => {
      expect(inferEmotionalSignal('')).toBeNull()
    })

    it('returns null for whitespace-only string', () => {
      expect(inferEmotionalSignal('   \t\n  ')).toBeNull()
    })

    it('returns null for non-string input (number)', () => {
      expect(inferEmotionalSignal(42 as unknown as string)).toBeNull()
    })

    it('returns null for non-string input (boolean)', () => {
      expect(inferEmotionalSignal(true as unknown as string)).toBeNull()
    })

    it('returns null for non-string input (object)', () => {
      expect(inferEmotionalSignal({} as unknown as string)).toBeNull()
    })

    it('returns null for non-string input (array)', () => {
      expect(inferEmotionalSignal([] as unknown as string)).toBeNull()
    })

    it('returns null for neutral text', () => {
      expect(inferEmotionalSignal('Meera had a good day today')).toBeNull()
    })

    it('returns null for string with only punctuation', () => {
      expect(inferEmotionalSignal('!!! ??? ...')).toBeNull()
    })

    it('returns null for string with only emoji', () => {
      expect(inferEmotionalSignal('\u{1F60A}\u{1F44D}\u{2764}')).toBeNull()
    })

    it('returns null for numbers only', () => {
      expect(inferEmotionalSignal('12345')).toBeNull()
    })

    it('handles very long input (5000+ chars) without timeout', () => {
      const longText = 'Everything is fine. '.repeat(300) + ' I am tired.'
      expect(inferEmotionalSignal(longText)).toBe('tired')
    })

    it('handles very long neutral text without crashing', () => {
      const longText = 'Baby is doing great today! '.repeat(500)
      expect(inferEmotionalSignal(longText)).toBeNull()
    })

    it('handles non-English text without crashing', () => {
      expect(inferEmotionalSignal('Le b\u00e9b\u00e9 dort bien')).toBeNull()
    })

    it('handles emoji-heavy input without crashing', () => {
      expect(inferEmotionalSignal('Baby is great! \u{1F476}\u{1F389}\u{1F973}')).toBeNull()
    })

    it('handles unicode characters without crashing', () => {
      expect(inferEmotionalSignal('\u{0000}\u{FFFF}\u{200B}')).toBeNull()
    })
  })

  // ── TIRED DETECTION ─────────────────────────────────────────────────────

  describe('TIRED signals — single words', () => {
    it.each([
      'tired', 'exhausted', 'shattered', 'knackered', 'drained',
      'fatigued', 'bleary',
    ])('detects TIRED keyword: "%s"', (word) => {
      expect(inferEmotionalSignal(`I am ${word}`)).toBe('tired')
    })
  })

  describe('TIRED signals — phrases', () => {
    it.each([
      'worn out', 'running on empty', 'no sleep', 'barely slept',
      "didn't sleep", 'sleep deprived', 'dead on my feet', 'so tired',
      'really tired', "haven't slept", 'up all night', 'no rest', 'need sleep',
      'wiped out', 'running low', 'barely functioning',
    ])('detects TIRED phrase: "%s"', (phrase) => {
      expect(inferEmotionalSignal(`I feel ${phrase} today`)).toBe('tired')
    })
  })

  // ── STRUGGLING DETECTION ────────────────────────────────────────────────

  describe('STRUGGLING signals — single words', () => {
    it.each([
      'struggling', 'overwhelming', 'overwhelmed', 'burnout', 'anxious',
      'anxiety', 'panicking', 'failing', 'terrified', 'dread', 'dreading',
    ])('detects STRUGGLING keyword: "%s"', (word) => {
      expect(inferEmotionalSignal(`I am ${word}`)).toBe('struggling')
    })
  })

  describe('STRUGGLING signals — phrases', () => {
    it.each([
      "can't cope", 'losing it', 'at my limit', 'breaking point',
      "can't do this", "don't know how", 'falling apart', 'burned out',
      'burnt out', 'too much', "can't keep up", 'barely managing', 'hard week',
      'really hard', 'not okay', 'not doing well', 'feeling low', 'so stressed',
      'worried sick', "can't handle", 'feel like a failure', 'bad parent', 'so scared',
    ])('detects STRUGGLING phrase: "%s"', (phrase) => {
      expect(inferEmotionalSignal(`I feel like ${phrase} right now`)).toBe('struggling')
    })
  })

  // ── DISTRESSED DETECTION (HIGHEST PRIORITY) ─────────────────────────────

  describe('DISTRESSED signals — single words', () => {
    it.each([
      'depressed', 'depression', 'postpartum', 'postnatal',
      'suicidal', 'disappear',
    ])('detects DISTRESSED keyword: "%s"', (word) => {
      expect(inferEmotionalSignal(`I feel ${word}`)).toBe('distressed')
    })
  })

  describe('DISTRESSED signals — phrases', () => {
    it.each([
      "can't go on", "don't want to do this anymore", 'want to give up',
      'hate this', 'hate being a parent', 'hate my life', 'breaking down',
      'having a breakdown', 'fell apart', 'crying all day', "can't stop crying",
      'hurting myself', 'hurt myself', 'not safe',
      "don't want to be here", "can't be here",
      'end it', 'no way out', "can't take this anymore", "wish I wasn't here",
    ])('detects DISTRESSED phrase: "%s"', (phrase) => {
      expect(inferEmotionalSignal(`I feel like ${phrase} right now`)).toBe('distressed')
    })
  })

  // ── PRIORITY ORDERING ──────────────────────────────────────────────────

  describe('priority ordering: distressed > struggling > tired', () => {
    it('DISTRESSED wins over STRUGGLING when both match', () => {
      expect(inferEmotionalSignal('I am overwhelmed and depressed')).toBe('distressed')
    })

    it('DISTRESSED wins over TIRED when both match', () => {
      expect(inferEmotionalSignal('I am tired and suicidal')).toBe('distressed')
    })

    it('STRUGGLING wins over TIRED when both match', () => {
      expect(inferEmotionalSignal('I am exhausted and struggling')).toBe('struggling')
    })

    it('all three present: DISTRESSED wins', () => {
      expect(inferEmotionalSignal('I am tired, struggling, and depressed')).toBe('distressed')
    })
  })

  // ── CASE INSENSITIVITY ─────────────────────────────────────────────────

  describe('case insensitivity', () => {
    it('detects UPPERCASE input', () => {
      expect(inferEmotionalSignal('I AM TIRED')).toBe('tired')
    })

    it('detects MiXeD CaSe input', () => {
      expect(inferEmotionalSignal('I am Struggling')).toBe('struggling')
    })

    it('detects EXHAUSTED (uppercase)', () => {
      expect(inferEmotionalSignal('COMPLETELY EXHAUSTED')).toBe('tired')
    })

    it('detects DEPRESSED (uppercase)', () => {
      expect(inferEmotionalSignal('I AM DEPRESSED')).toBe('distressed')
    })
  })

  // ── WORD BOUNDARY MATCHING ─────────────────────────────────────────────

  describe('word boundary matching', () => {
    it('"tired" matches as standalone word', () => {
      expect(inferEmotionalSignal('I am tired')).toBe('tired')
    })

    it('"retired" does NOT match "tired"', () => {
      expect(inferEmotionalSignal('My dad retired last year')).toBeNull()
    })

    it('"untiring" does NOT match "tired"', () => {
      expect(inferEmotionalSignal('Her untiring efforts paid off')).toBeNull()
    })

    it('"unimpressed" does NOT match "depressed"', () => {
      expect(inferEmotionalSignal('I am unimpressed')).toBeNull()
    })

    it('"overwhelming" matches as single word', () => {
      expect(inferEmotionalSignal('This is overwhelming')).toBe('struggling')
    })
  })

  // ── ZERO FALSE NEGATIVES (SAFETY-CRITICAL) ────────────────────────────

  describe('zero false negatives for all DISTRESSED signals (safety-critical)', () => {
    const ALL_DISTRESSED_WORDS = ['depressed', 'depression', 'postpartum', 'postnatal', 'suicidal', 'disappear']
    const ALL_DISTRESSED_PHRASES = [
      "can't go on", "don't want to do this anymore", 'want to give up',
      'hate this', 'hate being a parent', 'hate my life', 'breaking down',
      'having a breakdown', 'fell apart', 'crying all day', "can't stop crying",
      'hurting myself', 'hurt myself', 'not safe',
      "don't want to be here", "can't be here",
      'end it', 'no way out', "can't take this anymore", "wish I wasn't here",
    ]

    it.each(ALL_DISTRESSED_WORDS)(
      'MUST detect distressed word "%s"',
      (keyword) => {
        expect(inferEmotionalSignal(keyword)).toBe('distressed')
      }
    )

    it.each(ALL_DISTRESSED_PHRASES)(
      'MUST detect distressed phrase "%s"',
      (phrase) => {
        expect(inferEmotionalSignal(phrase)).toBe('distressed')
      }
    )
  })
})
