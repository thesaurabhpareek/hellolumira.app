// __tests__/lib/emotional-signals-edge-cases.test.ts
// Additional edge case tests for emotional-signals module
import { describe, it, expect } from 'vitest'
import { inferEmotionalSignal } from '@/lib/emotional-signals'

describe('inferEmotionalSignal — additional edge cases', () => {
  // ── BUG-010: null/undefined input ──

  describe('BUG-010 FIXED: null/undefined input handled gracefully', () => {
    it('returns null for null input (was crashing, now fixed)', () => {
      expect(inferEmotionalSignal(null as unknown as string)).toBeNull()
    })

    it('returns null for undefined input (was crashing, now fixed)', () => {
      expect(inferEmotionalSignal(undefined as unknown as string)).toBeNull()
    })

    it('returns null for numeric input (was crashing, now fixed)', () => {
      expect(inferEmotionalSignal(42 as unknown as string)).toBeNull()
    })
  })

  // ── Regex edge cases ──

  describe('regex special characters in input', () => {
    it('handles input with regex metacharacters', () => {
      // Should not crash even with regex-special chars
      expect(inferEmotionalSignal('I feel (tired) [really]')).toBe('tired')
    })

    it('handles input with backslashes', () => {
      expect(inferEmotionalSignal('path\\to\\tired\\file')).toBe('tired')
    })

    it('handles input with newlines', () => {
      expect(inferEmotionalSignal('I am\ntired\ntoday')).toBe('tired')
    })

    it('handles input with tabs', () => {
      expect(inferEmotionalSignal('I am\ttired')).toBe('tired')
    })
  })

  // ── Boundary matching precision ──

  describe('boundary matching edge cases', () => {
    it('"I am tired." with punctuation matches', () => {
      expect(inferEmotionalSignal('I am tired.')).toBe('tired')
    })

    it('"tired!" with exclamation matches', () => {
      expect(inferEmotionalSignal('So tired!')).toBe('tired')
    })

    it('"tired," with comma matches', () => {
      expect(inferEmotionalSignal('I am tired, so very tired')).toBe('tired')
    })

    it('"overtired" should NOT match "tired" alone', () => {
      // "overtired" contains "tired" — word boundary should prevent matching
      // But the keyword list has "tired" which with \b will NOT match inside "overtired"
      // because "overtired" has 'o' before the boundary
      // Wait — \btired\b does match in "overtired" because 'e' is a word char and 't' is a word char
      // Actually \b is between 'r' and 't'? No — 'overtired' = o-v-e-r-t-i-r-e-d
      // \btired\b would look for word-boundary + tired + word-boundary
      // In "overtired" there is no word boundary before 't' in 'tired'
      // So this should NOT match
      const result = inferEmotionalSignal('baby is overtired today')
      // This depends on whether regex treats it correctly
      expect(result).toBeNull()
    })
  })

  // ── Multi-keyword in single message ──

  describe('multiple signals in one message', () => {
    it('distressed + struggling + tired -> distressed (highest priority)', () => {
      expect(
        inferEmotionalSignal('I am tired, struggling, and depressed')
      ).toBe('distressed')
    })
  })

  // ── Unicode and international text ──

  describe('unicode handling', () => {
    it('handles emoji-only input', () => {
      expect(inferEmotionalSignal('😭😭😭')).toBeNull()
    })

    it('handles mixed unicode and English', () => {
      expect(inferEmotionalSignal('Je suis tired and fatigued')).toBe('tired')
    })

    it('handles right-to-left text', () => {
      expect(inferEmotionalSignal('مرحبا tired')).toBe('tired')
    })
  })
})
