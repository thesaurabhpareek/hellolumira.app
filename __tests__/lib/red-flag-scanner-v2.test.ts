// __tests__/lib/red-flag-scanner-v2.test.ts
// Tests against the ACTUAL red-flag-scanner module (not an inline copy)
import { describe, it, expect } from 'vitest'
import { scanForRedFlags } from '@/lib/red-flag-scanner'

describe('scanForRedFlags — actual module', () => {
  // ── Emergency categories ──

  describe('breathing emergencies', () => {
    it.each([
      'not breathing', 'stopped breathing', 'blue lips', 'turning blue',
      'going blue', 'blue around mouth', 'struggling to breathe',
      'cannot breathe', "can't breathe", 'nostrils flaring',
      'chest caving in', 'chest retracting', 'breathing stopped',
      'breathing very fast', 'gasping for air', 'laboured breathing',
    ])('detects EMERGENCY for "%s"', (pattern) => {
      const result = scanForRedFlags(`My baby is ${pattern}`, 20, 'infant')
      expect(result.level).toBe('emergency')
      expect(result.category).toBe('breathing_emergency')
      expect(result.preAuthoredMessage).toBeTruthy()
      expect(result.preAuthoredMessage).toContain('999')
      expect(result.preAuthoredMessage).toContain('911')
    })
  })

  describe('choking', () => {
    it.each([
      'choking', 'something stuck', 'swallowed something',
      'gagging on', 'object in throat',
    ])('detects EMERGENCY for "%s"', (pattern) => {
      const result = scanForRedFlags(`Baby is ${pattern}`, 20, 'infant')
      expect(result.level).toBe('emergency')
      expect(result.category).toBe('choking')
    })
  })

  describe('seizure', () => {
    it.each([
      'seizure', 'convulsion', 'shaking all over',
      'eyes rolling back', 'fitting',
    ])('detects EMERGENCY for "%s"', (pattern) => {
      const result = scanForRedFlags(`Baby had a ${pattern}`, 20, 'infant')
      expect(result.level).toBe('emergency')
      expect(result.category).toBe('seizure')
    })
  })

  describe('unresponsive', () => {
    it.each([
      'unresponsive', 'cannot wake', "can't wake", "won't wake up",
      'limp', 'floppy', 'unconscious', 'not responding',
    ])('detects EMERGENCY for "%s"', (pattern) => {
      const result = scanForRedFlags(`Baby is ${pattern}`, 20, 'infant')
      expect(result.level).toBe('emergency')
      expect(result.category).toBe('unresponsive')
    })
  })

  describe('suicidal ideation', () => {
    it.each([
      'suicidal', 'kill myself', 'end my life', 'want to die',
      'better off dead', "don't want to live", 'hurting myself',
      'self harm', 'self-harm',
    ])('detects EMERGENCY for "%s"', (pattern) => {
      const result = scanForRedFlags(`I feel ${pattern}`, 20, 'infant')
      expect(result.level).toBe('emergency')
      expect(result.category).toBe('suicidal_ideation')
      expect(result.preAuthoredMessage).toContain('Postpartum Support International')
      expect(result.preAuthoredMessage).toContain('988')
    })
  })

  describe('reduced fetal movement (pregnancy only)', () => {
    it('detects for pregnancy stage', () => {
      const result = scanForRedFlags('baby is not moving', 0, 'pregnancy')
      expect(result.level).toBe('emergency')
      expect(result.category).toBe('reduced_fetal_movement')
    })

    it('does NOT trigger for infant stage', () => {
      const result = scanForRedFlags('baby is not moving', 20, 'infant')
      // "not moving" should NOT match reduced_fetal_movement for infant
      expect(result.category).not.toBe('reduced_fetal_movement')
    })
  })

  describe('preterm labor signs (pregnancy only)', () => {
    it('detects for pregnancy stage', () => {
      const result = scanForRedFlags('having regular contractions and water broke early', 0, 'pregnancy')
      expect(result.level).toBe('emergency')
      expect(result.category).toBe('preterm_labor_signs')
    })

    it('does NOT trigger for infant stage', () => {
      const result = scanForRedFlags('premature contractions', 20, 'infant')
      expect(result.category).not.toBe('preterm_labor_signs')
    })
  })

  // ── Urgent patterns ──

  describe('urgent dehydration patterns', () => {
    it.each([
      'no wet nappies', 'no wet diapers', 'sunken fontanelle',
      'crying without tears', 'skin not bouncing back',
    ])('detects URGENT for "%s"', (pattern) => {
      const result = scanForRedFlags(`Baby has ${pattern}`, 30, 'infant')
      expect(result.level).toBe('urgent')
    })
  })

  // ── Call doctor patterns ──

  describe('call doctor patterns', () => {
    it.each([
      'crying for hours', 'inconsolable', 'screaming in pain',
      'rash spreading', 'barking cough', 'very drowsy',
    ])('detects CALL_DOCTOR for "%s"', (pattern) => {
      const result = scanForRedFlags(`Baby is ${pattern}`, 30, 'infant')
      expect(result.level).toBe('call_doctor')
    })
  })

  // ── Age-specific fever ──

  describe('age-specific fever escalation', () => {
    it('fever under 12 weeks -> urgent', () => {
      const result = scanForRedFlags('Baby has a fever', 8, 'infant')
      expect(result.level).toBe('urgent')
      expect(result.category).toBe('high_fever_newborn')
    })

    it('fever at 12-24 weeks -> call_doctor', () => {
      const result = scanForRedFlags('Baby has a fever', 16, 'infant')
      expect(result.level).toBe('call_doctor')
    })

    it('fever at 24+ weeks -> none (AI handles)', () => {
      const result = scanForRedFlags('Baby has a fever', 30, 'infant')
      expect(result.level).toBe('none')
    })
  })

  // ── False positive: fever substring matching (BUG-030) ──

  describe('BUG-030: fever false positives from numeric substrings', () => {
    it('"my baby is 38 weeks" triggers fever (KNOWN BUG)', () => {
      // This documents the false positive from matching '38' as substring
      const result = scanForRedFlags('my baby is 38 weeks old', 8, 'infant')
      // Currently this incorrectly triggers — documenting as known bug
      expect(result.level).toBe('urgent') // BUG: should be 'none'
    })
  })

  // ── Priority ordering ──

  describe('priority ordering', () => {
    it('emergency overrides urgent', () => {
      const result = scanForRedFlags('Baby has blue lips and no wet nappies', 20, 'infant')
      expect(result.level).toBe('emergency')
    })

    it('emergency overrides fever escalation', () => {
      const result = scanForRedFlags('Baby is not breathing and has a fever', 8, 'infant')
      expect(result.level).toBe('emergency')
    })
  })

  // ── Edge cases (BUG-009) ──

  describe('edge cases', () => {
    it('returns none for empty string', () => {
      const result = scanForRedFlags('', 20, 'infant')
      expect(result.level).toBe('none')
    })

    it('handles very long messages', () => {
      const msg = 'Baby is fine. '.repeat(5000)
      const result = scanForRedFlags(msg, 20, 'infant')
      expect(result.level).toBe('none')
    })

    it('BUG-009 FIXED: returns none for null input (was crashing)', () => {
      const result = scanForRedFlags(null as unknown as string, 20, 'infant')
      expect(result.level).toBe('none')
    })

    it('BUG-009 FIXED: returns none for undefined input (was crashing)', () => {
      const result = scanForRedFlags(undefined as unknown as string, 20, 'infant')
      expect(result.level).toBe('none')
    })

    it('no red flag for normal text', () => {
      const result = scanForRedFlags('Meera had a great day and napped well', 20, 'infant')
      expect(result.level).toBe('none')
      expect(result.category).toBeNull()
      expect(result.pattern).toBeNull()
    })
  })
})
