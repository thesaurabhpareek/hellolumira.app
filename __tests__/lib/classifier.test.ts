import { describe, it, expect } from 'vitest'
import { classifyConcern } from '@/lib/chat/classifier'

describe('classifyConcern', () => {
  // ── Single category matches ──

  describe('single category classification', () => {
    it.each([
      ['sleep', 'baby waking up every hour'],
      ['sleep', 'she is not napping well'],
      ['sleep', 'bedtime routine is not working'],
      ['sleep', 'I think this is a sleep regression'],
      ['sleep', 'what is a wake window'],
    ])('classifies "%s" concern: "%s"', (expected, msg) => {
      expect(classifyConcern(msg)).toBe(expected)
    })

    it.each([
      ['feeding', 'she is refusing the bottle'],
      ['feeding', 'breastfeeding is painful'],
      ['feeding', 'when to start weaning'],
      ['feeding', 'milk supply is low'],
      ['feeding', 'cluster feeding all night'],
    ])('classifies "%s" concern: "%s"', (expected, msg) => {
      expect(classifyConcern(msg)).toBe(expected)
    })

    it.each([
      ['crying', 'baby has been fussy all day'],
      ['crying', 'she is screaming and inconsolable'],
      ['crying', 'I think it might be colic'],
    ])('classifies "%s" concern: "%s"', (expected, msg) => {
      expect(classifyConcern(msg)).toBe(expected)
    })

    it.each([
      ['digestion', 'baby has reflux and seems bloated'],
      ['digestion', 'green poop is that normal'],
      ['digestion', 'seems gassy and bloated'],
      ['digestion', 'constipation for 3 days'],
    ])('classifies "%s" concern: "%s"', (expected, msg) => {
      expect(classifyConcern(msg)).toBe(expected)
    })

    it('classifies teething concerns', () => {
      expect(classifyConcern('I think she is teething')).toBe('teething')
      expect(classifyConcern('baby drooling excessively')).toBe('teething')
    })

    it('classifies illness concerns', () => {
      expect(classifyConcern('baby has a bad cough')).toBe('illness')
      expect(classifyConcern('runny nose and congestion')).toBe('illness')
      expect(classifyConcern('baby seems unwell today')).toBe('illness')
    })

    it('classifies development concerns', () => {
      expect(classifyConcern('she is not crawling yet')).toBe('development')
      expect(classifyConcern('is he behind in development')).toBe('development')
      expect(classifyConcern('when do babies start to walk')).toBe('development')
    })

    it('classifies skin concerns', () => {
      expect(classifyConcern('baby has eczema on her face')).toBe('skin')
      expect(classifyConcern('cradle cap treatment')).toBe('skin')
      expect(classifyConcern('nappy rash is getting worse')).toBe('multiple') // 'nappy' matches digestion, 'rash' matches illness + skin
    })

    it('classifies safety concerns', () => {
      expect(classifyConcern('is the car seat installed right')).toBe('safety')
      expect(classifyConcern('safe sleep advice')).toBe('sleep') // 'sleep' category matches first in object iteration
    })

    it('classifies mental health concerns', () => {
      expect(classifyConcern('I am struggling and depressed')).toBe('mental_health_parent')
      expect(classifyConcern('feeling overwhelmed and not coping')).toBe('mental_health_parent')
      expect(classifyConcern('I need support with postpartum anxiety')).toBe('mental_health_parent')
    })
  })

  // ── Multi-category classification ──

  describe('multi-category classification', () => {
    it('returns first match when exactly 2 categories match', () => {
      const result = classifyConcern('baby is not sleeping and not feeding well')
      // 2 matches: returns matched[0] (not "multiple")
      expect(result).not.toBe('multiple')
      expect(['sleep', 'feeding']).toContain(result)
    })

    it('returns "multiple" when 3+ categories match', () => {
      const result = classifyConcern('baby is not sleeping, not feeding, and crying all day')
      expect(result).toBe('multiple')
    })
  })

  // ── Default / edge cases ──

  describe('edge cases', () => {
    it('returns "general" for unclassifiable text', () => {
      expect(classifyConcern('what time is the appointment')).toBe('general')
    })

    it('returns "general" for empty string', () => {
      expect(classifyConcern('')).toBe('general')
    })

    it('returns "general" for null input', () => {
      expect(classifyConcern(null as unknown as string)).toBe('general')
    })

    it('returns "general" for undefined input', () => {
      expect(classifyConcern(undefined as unknown as string)).toBe('general')
    })

    it('returns "general" for whitespace-only input', () => {
      expect(classifyConcern('   \t\n  ')).toBe('general')
    })

    it('returns "general" for non-string input (number)', () => {
      expect(classifyConcern(42 as unknown as string)).toBe('general')
    })

    it('returns "general" for non-string input (boolean)', () => {
      expect(classifyConcern(true as unknown as string)).toBe('general')
    })

    it('returns "general" for emoji-only input', () => {
      expect(classifyConcern('\u{1F60A}\u{1F476}\u{1F4A4}\u{1F37C}')).toBe('general')
    })

    it('returns "general" for punctuation-only input', () => {
      expect(classifyConcern('??? !!! ...')).toBe('general')
    })

    it('returns "general" for numbers-only input', () => {
      expect(classifyConcern('12345')).toBe('general')
    })

    it('returns "general" for non-English text with no matching keywords', () => {
      expect(classifyConcern('comment va le bebe')).toBe('general')
    })

    it('is case-insensitive', () => {
      expect(classifyConcern('BABY IS TEETHING')).toBe('teething')
    })

    it('handles very long input without crashing', () => {
      const msg = 'everything is fine '.repeat(500) + 'but she has a cough'
      expect(classifyConcern(msg)).toBe('illness')
    })
  })
})
