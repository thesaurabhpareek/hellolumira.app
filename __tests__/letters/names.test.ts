import { describe, it, expect } from 'vitest'
import { seedCorrections, applyCorrections, learnCorrection } from '@/lib/letters/names'
import type { NameCorrection } from '@/types/letters'

function correction(
  heard: string,
  correct: string,
  overrides: Partial<NameCorrection> = {}
): NameCorrection {
  return { heard, correct, hit_count: 1, source: 'seeded', ...overrides }
}

// ── seedCorrections ─────────────────────────────────────────────────────

describe('seedCorrections', () => {
  describe('input validation', () => {
    it('returns an empty array for an empty names list', () => {
      expect(seedCorrections([])).toEqual([])
    })

    it('ignores blank / whitespace-only names', () => {
      expect(seedCorrections(['   ', ''])).toEqual([])
    })

    it('does not mutate its input array', () => {
      const names = ['Meera']
      seedCorrections(names)
      expect(names).toEqual(['Meera'])
    })
  })

  describe('hardcoded high-confidence variants', () => {
    it('includes the known Meera mishearings from the PRD (§0.4 risk #2)', () => {
      const result = seedCorrections(['Meera'])
      const heard = result.map((r) => r.heard)
      expect(heard).toEqual(
        expect.arrayContaining(['Mira', 'Meara', 'Mera', 'Mirror', 'Myra'])
      )
      expect(result.every((r) => r.correct === 'Meera')).toBe(true)
      expect(result.every((r) => r.source === 'seeded')).toBe(true)
      expect(result.every((r) => r.hit_count === 0)).toBe(true)
    })

    it('looks up the hardcoded dictionary case-insensitively', () => {
      const result = seedCorrections(['meera'])
      expect(result.some((r) => r.heard === 'Mira')).toBe(true)
    })
  })

  describe('algorithmic (phonetic) generation', () => {
    it('generates additional candidates beyond the hardcoded list for a name with no dictionary entry', () => {
      const result = seedCorrections(['Sanjay'])
      expect(result.length).toBeGreaterThan(0)
      expect(result.every((r) => r.correct === 'Sanjay')).toBe(true)
    })

    it('never emits a correction whose heard equals its correct (would be a silent no-op / loop)', () => {
      const result = seedCorrections(['Meera', 'Papa', 'Sanjay', 'Zara'])
      expect(
        result.every((r) => r.heard.toLowerCase() !== r.correct.toLowerCase())
      ).toBe(true)
    })

    it('produces no duplicate heard/correct pairs', () => {
      const result = seedCorrections(['Meera'])
      const keys = result.map((r) => `${r.heard.toLowerCase()}=>${r.correct.toLowerCase()}`)
      expect(new Set(keys).size).toBe(keys.length)
    })

    it('returns an empty array (not a throw) for a name too short to generate variants', () => {
      expect(() => seedCorrections(['Al'])).not.toThrow()
      expect(seedCorrections(['Al'])).toEqual([])
    })
  })

  describe('multi-word names', () => {
    it('seeds each token of a multi-word name independently, never the full phrase', () => {
      const result = seedCorrections(['Meera Rose'])
      expect(result.length).toBeGreaterThan(0)
      expect(result.every((r) => r.correct === 'Meera' || r.correct === 'Rose')).toBe(true)
      expect(result.some((r) => r.correct === 'Meera Rose')).toBe(false)
    })
  })

  describe('unicode and diacritics', () => {
    it('handles a name with diacritics without throwing', () => {
      expect(() => seedCorrections(['José'])).not.toThrow()
      const result = seedCorrections(['José'])
      expect(result.every((r) => r.correct === 'José')).toBe(true)
    })
  })

  describe('determinism', () => {
    it('returns identical output for identical input across calls', () => {
      expect(seedCorrections(['Meera', 'Ishita'])).toEqual(seedCorrections(['Meera', 'Ishita']))
    })
  })
})

// ── applyCorrections ────────────────────────────────────────────────────

describe('applyCorrections', () => {
  describe('input validation / empty cases', () => {
    it('returns the transcript unchanged for an empty transcript', () => {
      expect(applyCorrections('', [correction('mira', 'Meera')])).toEqual({
        text: '',
        applied: [],
      })
    })

    it('returns the transcript unchanged for an empty corrections list', () => {
      expect(applyCorrections('hello mira', [])).toEqual({
        text: 'hello mira',
        applied: [],
      })
    })

    it('leaves a whitespace-only transcript untouched', () => {
      expect(applyCorrections('   ', [correction('mira', 'Meera')])).toEqual({
        text: '   ',
        applied: [],
      })
    })

    it('silently drops corrections with a blank heard or correct field', () => {
      const result = applyCorrections('mira here', [
        { heard: '', correct: 'x', hit_count: 1, source: 'seeded' },
        { heard: 'mira', correct: '  ', hit_count: 1, source: 'seeded' },
      ])
      expect(result).toEqual({ text: 'mira here', applied: [] })
    })
  })

  describe('case preservation', () => {
    it('preserves all-lowercase', () => {
      expect(applyCorrections('mira is happy', [correction('mira', 'Meera')]).text).toBe(
        'meera is happy'
      )
    })

    it('preserves title case', () => {
      expect(applyCorrections('Mira is happy', [correction('mira', 'Meera')]).text).toBe(
        'Meera is happy'
      )
    })

    it('preserves ALL CAPS', () => {
      expect(applyCorrections('MIRA is happy', [correction('mira', 'Meera')]).text).toBe(
        'MEERA is happy'
      )
    })

    it('matches regardless of the correction heard field casing', () => {
      // dictionary stores "Mira" but the transcript has lowercase "mira"
      expect(applyCorrections('mira is happy', [correction('Mira', 'Meera')]).text).toBe(
        'meera is happy'
      )
    })
  })

  describe('possessives', () => {
    it("corrects a possessive without corrupting the trailing 's", () => {
      expect(applyCorrections("Mira's laugh is loud", [correction('mira', 'Meera')]).text).toBe(
        "Meera's laugh is loud"
      )
    })

    it('handles a curly-quote possessive', () => {
      expect(applyCorrections('Mira’s laugh', [correction('mira', 'Meera')]).text).toBe(
        'Meera’s laugh'
      )
    })
  })

  describe('substring safety', () => {
    it('does not corrupt real words that merely contain the heard text as a substring', () => {
      const result = applyCorrections(
        'Admiral Mirabelle greeted Mira and admired her.',
        [correction('mira', 'Meera')]
      )
      expect(result.text).toBe('Admiral Mirabelle greeted Meera and admired her.')
      expect(result.applied).toEqual([{ heard: 'mira', correct: 'Meera', count: 1 }])
    })
  })

  describe('multiple different names in one transcript', () => {
    it('applies every distinct correction independently, each with its own count', () => {
      const result = applyCorrections('mira and papu played, then mira napped', [
        correction('mira', 'Meera'),
        correction('papu', 'Papa'),
      ])
      expect(result.text).toBe('meera and papa played, then meera napped')
      const byHeard = Object.fromEntries(result.applied.map((a) => [a.heard, a]))
      expect(byHeard.mira).toEqual({ heard: 'mira', correct: 'Meera', count: 2 })
      expect(byHeard.papu).toEqual({ heard: 'papu', correct: 'Papa', count: 1 })
    })
  })

  describe('infinite-loop guard (heard === correct)', () => {
    it('drops a correction whose heard exactly equals correct', () => {
      expect(applyCorrections('mira is here', [correction('mira', 'mira')])).toEqual({
        text: 'mira is here',
        applied: [],
      })
    })

    it('drops a correction that differs only by case (case-preservation would make it a no-op anyway)', () => {
      expect(applyCorrections('papa is here', [correction('papa', 'Papa')])).toEqual({
        text: 'papa is here',
        applied: [],
      })
    })

    it('does not chain corrections against each other — matches are located against the original text only', () => {
      // A pathological, contradictory pair: if correction A's output fed into
      // correction B (or vice versa), this would bounce forever. Because
      // matches are found in a single pass over the original text, each word
      // is corrected exactly once and the pair simply swaps positions.
      const result = applyCorrections('mira and meera', [
        correction('meera', 'mira'),
        correction('mira', 'meera'),
      ])
      expect(result.text).toBe('meera and mira')
    })
  })

  describe('unicode and diacritics', () => {
    it('replaces a plain-ASCII mishearing with the correctly-accented name', () => {
      expect(applyCorrections('Jose was here', [correction('Jose', 'José')]).text).toBe(
        'José was here'
      )
    })
  })

  describe('duplicate corrections', () => {
    it('dedupes corrections that share the same heard text, keeping the first', () => {
      const result = applyCorrections('mira is here', [
        correction('mira', 'Meera'),
        correction('mira', 'SomethingElse'),
      ])
      expect(result.text).toBe('meera is here')
    })
  })

  describe('purity', () => {
    it('does not mutate the corrections array or its entries', () => {
      const corrections = [correction('mira', 'Meera')]
      const snapshot = JSON.parse(JSON.stringify(corrections))
      applyCorrections('mira', corrections)
      expect(corrections).toEqual(snapshot)
    })
  })

  describe('very long input', () => {
    it('corrects every occurrence in a long transcript without pathological slowdown', () => {
      const longText = new Array(20000).fill('mira said hello today').join('. ')
      const start = Date.now()
      const result = applyCorrections(longText, [correction('mira', 'Meera')])
      expect(Date.now() - start).toBeLessThan(5000)
      expect(result.applied).toEqual([{ heard: 'mira', correct: 'Meera', count: 20000 }])
    })
  })
})

// ── learnCorrection ──────────────────────────────────────────────────────

describe('learnCorrection', () => {
  describe('detects a genuine name fix', () => {
    it('learns a simple single-word substitution', () => {
      expect(learnCorrection('mira loves her toys', 'Meera loves her toys', ['Meera'])).toEqual({
        heard: 'mira',
        correct: 'Meera',
        hit_count: 1,
        source: 'learned',
      })
    })

    it('learns a fix made inside a possessive', () => {
      expect(
        learnCorrection("I love mira's laugh", "I love Meera's laugh", ['Meera'])
      ).toEqual({ heard: 'mira', correct: 'Meera', hit_count: 1, source: 'learned' })
    })

    it('picks the correct known name out of several when the edit lands on it', () => {
      expect(
        learnCorrection('ishitha was tired', 'Ishita was tired', ['Meera', 'Ishita'])
      ).toEqual({ heard: 'ishitha', correct: 'Ishita', hit_count: 1, source: 'learned' })
    })
  })

  describe('infinite-loop / no-op guard', () => {
    it('returns null when before and after are identical', () => {
      expect(learnCorrection('Meera is here', 'Meera is here', ['Meera'])).toBeNull()
    })

    it('returns null when the only difference is casing of an already-known name', () => {
      expect(learnCorrection('mira is here', 'Mira is here', ['Mira'])).toBeNull()
    })
  })

  describe('does not learn unrelated edits', () => {
    it('returns null when the corrected word is not one of the known names', () => {
      expect(learnCorrection('the cat sat there', 'the dog sat there', ['Meera'])).toBeNull()
    })

    it('returns null when the original word is not phonetically plausible as a mishearing', () => {
      expect(learnCorrection('the cat was here', 'Meera was here', ['Meera'])).toBeNull()
    })

    it('returns null for a multi-word rewrite (not an unambiguous single-word fix)', () => {
      expect(
        learnCorrection('mira is happy today', 'Meera is very happy', ['Meera'])
      ).toBeNull()
    })

    it('returns null for a pure insertion', () => {
      expect(learnCorrection('mira laughed', 'hello mira laughed', ['Meera'])).toBeNull()
    })
  })

  describe('unicode and diacritics', () => {
    it('learns a correction that adds a diacritic to match a known name', () => {
      expect(learnCorrection('jose was here', 'José was here', ['José'])).toEqual({
        heard: 'jose',
        correct: 'José',
        hit_count: 1,
        source: 'learned',
      })
    })
  })

  describe('empty / degenerate input', () => {
    it('returns null for two empty strings', () => {
      expect(learnCorrection('', '', ['Meera'])).toBeNull()
    })

    it('returns null when before is empty and after is not', () => {
      expect(learnCorrection('', 'Meera is here', ['Meera'])).toBeNull()
    })

    it('returns null when the known-names list is empty', () => {
      expect(learnCorrection('mira is here', 'Meera is here', [])).toBeNull()
    })
  })

  describe('purity', () => {
    it('does not mutate the known names array', () => {
      const known = ['Meera']
      learnCorrection('mira is here', 'Meera is here', known)
      expect(known).toEqual(['Meera'])
    })
  })
})
