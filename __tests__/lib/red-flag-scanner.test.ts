import { describe, it, expect } from 'vitest'
import { scanForRedFlags } from '@/lib/red-flag-scanner'

// ── GUARD / UNHAPPY PATHS ─────────────────────────────────────────────────

describe('Red Flag Scanner — Input validation guards', () => {
  it('returns none for null input', () => {
    const result = scanForRedFlags(null as unknown as string, 20)
    expect(result.level).toBe('none')
    expect(result.category).toBeNull()
    expect(result.pattern).toBeNull()
    expect(result.preAuthoredMessage).toBeNull()
    expect(result.actionUrl).toBeNull()
    expect(result.severity).toBeNull()
  })

  it('returns none for undefined input', () => {
    const result = scanForRedFlags(undefined as unknown as string, 20)
    expect(result.level).toBe('none')
  })

  it('returns none for empty string', () => {
    const result = scanForRedFlags('', 20)
    expect(result.level).toBe('none')
  })

  it('returns none for whitespace-only string', () => {
    const result = scanForRedFlags('   \t\n  ', 20)
    expect(result.level).toBe('none')
  })

  it('returns none for non-string input (number)', () => {
    const result = scanForRedFlags(42 as unknown as string, 20)
    expect(result.level).toBe('none')
  })

  it('returns none for non-string input (boolean)', () => {
    const result = scanForRedFlags(true as unknown as string, 20)
    expect(result.level).toBe('none')
  })

  it('returns none for non-string input (object)', () => {
    const result = scanForRedFlags({} as unknown as string, 20)
    expect(result.level).toBe('none')
  })

  it('returns none for non-string input (array)', () => {
    const result = scanForRedFlags([] as unknown as string, 20)
    expect(result.level).toBe('none')
  })

  it('handles NaN babyAgeWeeks gracefully (defaults to 0)', () => {
    const result = scanForRedFlags('baby has a fever', NaN)
    expect(result.level).toBe('urgent')
  })

  it('handles negative babyAgeWeeks gracefully (defaults to 0)', () => {
    const result = scanForRedFlags('baby has a fever', -5)
    expect(result.level).toBe('urgent')
  })

  it('handles non-number babyAgeWeeks as 0', () => {
    const result = scanForRedFlags('fever', 'abc' as unknown as number)
    expect(result.level).toBe('urgent')
  })

  it('handles very large input string (10000+ chars) without crashing', () => {
    const longMsg = 'Baby is doing fine. '.repeat(1000)
    const result = scanForRedFlags(longMsg, 20)
    expect(result.level).toBe('none')
  })

  it('detects pattern inside a very long string if within 10000 char limit', () => {
    const longText = 'a'.repeat(5000) + ' not breathing ' + 'b'.repeat(4000)
    const result = scanForRedFlags(longText, 8)
    expect(result.level).toBe('emergency')
    expect(result.category).toBe('breathing_emergency')
  })

  it('handles emoji-heavy input without crashing', () => {
    const result = scanForRedFlags('Baby is great! \u{1F476}\u{1F389}\u{1F973}\u{1F495}', 20)
    expect(result.level).toBe('none')
  })

  it('handles unicode characters without crashing', () => {
    const result = scanForRedFlags('Le b\u00e9b\u00e9 va bien, il dort bien', 20)
    expect(result.level).toBe('none')
  })

  it('does not crash on null bytes in string', () => {
    const result = scanForRedFlags('hello\0world', 20)
    expect(result.level).toBe('none')
  })

  it('does not crash on HTML/script injection input', () => {
    const result = scanForRedFlags('<script>alert("xss")</script>', 8)
    expect(result.level).toBe('none')
  })

  it('does not crash on SQL injection attempts', () => {
    const result = scanForRedFlags("'; DROP TABLE babies;--", 8)
    expect(result.level).toBe('none')
  })

  it('returns none for string with only punctuation', () => {
    const result = scanForRedFlags('??? !!! ...', 20)
    expect(result.level).toBe('none')
  })

  it('returns none for string with only emoji', () => {
    const result = scanForRedFlags('\u{1F60A}\u{1F476}\u{1F4A4}', 20)
    expect(result.level).toBe('none')
  })
})

// ── CASE INSENSITIVITY ────────────────────────────────────────────────────

describe('Red Flag Scanner — Case insensitivity', () => {
  it('detects "CHOKING" (uppercase)', () => {
    const result = scanForRedFlags('MY BABY IS CHOKING', 20)
    expect(result.level).toBe('emergency')
    expect(result.category).toBe('choking')
  })

  it('detects "Choking" (title case)', () => {
    const result = scanForRedFlags('Baby is Choking on food', 20)
    expect(result.level).toBe('emergency')
    expect(result.category).toBe('choking')
  })

  it('detects "NOT BREATHING" (uppercase)', () => {
    const result = scanForRedFlags('BABY IS NOT BREATHING', 20)
    expect(result.level).toBe('emergency')
    expect(result.category).toBe('breathing_emergency')
  })

  it('detects "Seizure" (mixed case)', () => {
    const result = scanForRedFlags('Baby had a Seizure', 20)
    expect(result.level).toBe('emergency')
    expect(result.category).toBe('seizure')
  })

  it('detects "SELF HARM" (uppercase)', () => {
    const result = scanForRedFlags('I am thinking about SELF HARM', 20)
    expect(result.level).toBe('emergency')
    expect(result.category).toBe('suicidal_ideation')
  })

  it('detects "Swollen Face" (title case)', () => {
    const result = scanForRedFlags('Baby has a Swollen Face', 20)
    expect(result.level).toBe('emergency')
    expect(result.category).toBe('severe_allergic_reaction')
  })
})

// ── EMERGENCY PATTERNS (12 categories) ──────────────────────────────────

describe('Red Flag Scanner — EMERGENCY patterns (12 categories)', () => {
  describe('breathing_emergency', () => {
    it.each([
      'not breathing', 'stopped breathing', 'blue lips', 'turning blue', 'going blue',
      'blue around mouth', 'struggling to breathe', 'cannot breathe', "can't breathe",
      'nostrils flaring', 'chest caving in', 'chest retracting', 'breathing stopped',
      'breathing very fast', 'gasping for air', 'laboured breathing', 'labored breathing',
    ])('detects EMERGENCY: "%s"', (pattern) => {
      const result = scanForRedFlags(`My baby is ${pattern}`, 20)
      expect(result.level).toBe('emergency')
      expect(result.category).toBe('breathing_emergency')
      expect(result.preAuthoredMessage).toBeTruthy()
      expect(result.preAuthoredMessage).toContain('emergency attention')
      expect(result.preAuthoredMessage).toContain('999')
      expect(result.preAuthoredMessage).toContain('911')
      expect(result.preAuthoredMessage).toContain('112')
      expect(result.preAuthoredMessage).toContain('000')
      expect(result.actionUrl).toBe('tel:911')
      expect(result.severity).toBe('emergency')
      expect(result.immediateAction).toBe('Call emergency services now')
      expect(result.pattern).toBe(pattern)
    })
  })

  describe('choking', () => {
    it.each([
      'choking', 'something stuck', 'swallowed something', 'gagging on',
      'cannot swallow', "can't swallow", 'object in throat', 'stuck in throat',
    ])('detects EMERGENCY: "%s"', (pattern) => {
      const result = scanForRedFlags(`Baby is ${pattern}`, 20)
      expect(result.level).toBe('emergency')
      expect(result.category).toBe('choking')
      expect(result.preAuthoredMessage).toContain('choking')
      expect(result.actionUrl).toBe('tel:911')
      expect(result.severity).toBe('emergency')
    })
  })

  describe('seizure', () => {
    it.each([
      'seizure', 'convulsion', 'shaking all over', 'eyes rolling back', 'fitting',
      'having a fit', 'convulsing', 'jerking movements',
    ])('detects EMERGENCY: "%s"', (pattern) => {
      const result = scanForRedFlags(`Baby is ${pattern}`, 20)
      expect(result.level).toBe('emergency')
      expect(result.category).toBe('seizure')
      expect(result.preAuthoredMessage).toContain('seizure')
      expect(result.severity).toBe('emergency')
    })
  })

  describe('unresponsive', () => {
    it.each([
      'unresponsive', 'cannot wake', "can't wake", 'wont wake up', "won't wake up",
      'limp', 'floppy', 'unconscious', 'passed out', 'not responding',
      'not waking up', 'completely still',
    ])('detects EMERGENCY: "%s"', (pattern) => {
      const result = scanForRedFlags(`Baby is ${pattern}`, 20)
      expect(result.level).toBe('emergency')
      expect(result.category).toBe('unresponsive')
      expect(result.severity).toBe('emergency')
    })
  })

  describe('severe_bleeding', () => {
    it.each([
      'bleeding heavily', 'severe bleeding', 'blood everywhere', 'deep cut',
      'blood wont stop', "blood won't stop", 'gushing blood',
      'arterial bleeding', 'blood in vomit', 'vomiting blood',
    ])('detects EMERGENCY: "%s"', (pattern) => {
      const result = scanForRedFlags(`Baby has ${pattern}`, 20)
      expect(result.level).toBe('emergency')
      expect(result.category).toBe('severe_bleeding')
      expect(result.severity).toBe('emergency')
    })
  })

  describe('head_injury', () => {
    it.each([
      'head injury', 'fell from', 'dropped baby', 'fall from height',
      'serious fall', 'hit head hard', 'head trauma', 'skull',
    ])('detects EMERGENCY: "%s"', (pattern) => {
      const result = scanForRedFlags(`There was a ${pattern}`, 20)
      expect(result.level).toBe('emergency')
      expect(result.category).toBe('head_injury')
      expect(result.severity).toBe('emergency')
    })
  })

  describe('ingestion_poison', () => {
    it.each([
      'swallowed poison', 'ate detergent', 'drank bleach', 'swallowed pills',
      'ate medication', 'ingested', 'swallowed battery', 'ate cleaning',
      'drank cleaning', 'poisoning', 'swallowed chemicals',
    ])('detects EMERGENCY: "%s"', (pattern) => {
      const result = scanForRedFlags(`Baby ${pattern}`, 20)
      expect(result.level).toBe('emergency')
      expect(result.category).toBe('ingestion_poison')
      expect(result.actionUrl).toBe('tel:18002221222')
      expect(result.preAuthoredMessage).toContain('Poison Control')
    })
  })

  describe('severe_allergic_reaction', () => {
    it.each([
      'swollen face', 'swollen throat', 'swollen tongue', 'hives everywhere',
      'anaphylaxis', 'allergic shock', 'allergic reaction spreading',
      'face swelling', 'throat swelling', 'lips swelling',
    ])('detects EMERGENCY: "%s"', (pattern) => {
      const result = scanForRedFlags(`Baby has ${pattern}`, 20)
      expect(result.level).toBe('emergency')
      expect(result.category).toBe('severe_allergic_reaction')
      expect(result.preAuthoredMessage).toContain('allergic reaction')
    })
  })

  describe('reduced_fetal_movement (pregnancy only)', () => {
    it.each([
      'not moving', 'stopped moving', 'no movement', 'reduced movement',
      'less movement', 'baby not kicking', 'stopped kicking', 'no kicks',
      'fewer kicks', 'less kicking', "hasn't moved", 'not felt movement',
      'no fetal movement',
    ])('detects "%s" for pregnancy stage', (pattern) => {
      const result = scanForRedFlags(`baby ${pattern}`, 28, 'pregnancy')
      expect(result.level).toBe('emergency')
      expect(result.category).toBe('reduced_fetal_movement')
      expect(result.severity).toBe('same_day')
      expect(result.actionUrl).toBe('tel:111')
      expect(result.immediateAction).toBe('Contact your healthcare provider today')
    })

    it('skips reduced_fetal_movement for infant stage', () => {
      const result = scanForRedFlags('baby not moving', 20, 'infant')
      expect(result.category).not.toBe('reduced_fetal_movement')
    })

    it('skips reduced_fetal_movement for toddler stage', () => {
      const result = scanForRedFlags('baby stopped moving', 80, 'toddler')
      expect(result.category).not.toBe('reduced_fetal_movement')
    })

    it('detects reduced_fetal_movement when stage is undefined', () => {
      const result = scanForRedFlags('baby not moving', 0)
      expect(result.level).toBe('emergency')
      expect(result.category).toBe('reduced_fetal_movement')
    })
  })

  describe('preterm_labor_signs (pregnancy only)', () => {
    it.each([
      'contractions early', 'preterm contractions', 'premature contractions',
      'water broke early', 'water breaking', 'waters broken', 'leaking fluid',
      'regular contractions', 'contractions before 37', 'preterm labor',
      'preterm labour', 'premature labor', 'premature labour',
    ])('detects EMERGENCY: "%s" for pregnancy', (pattern) => {
      const result = scanForRedFlags(pattern, 30, 'pregnancy')
      expect(result.level).toBe('emergency')
      expect(result.category).toBe('preterm_labor_signs')
      expect(result.severity).toBe('emergency')
    })

    it('skips preterm_labor_signs for infant stage', () => {
      const result = scanForRedFlags('preterm contractions', 20, 'infant')
      expect(result.category).not.toBe('preterm_labor_signs')
    })

    it('skips preterm_labor_signs for toddler stage', () => {
      const result = scanForRedFlags('preterm labor', 80, 'toddler')
      expect(result.category).not.toBe('preterm_labor_signs')
    })
  })

  describe('suicidal_ideation', () => {
    it.each([
      'suicidal', 'kill myself', 'end my life', 'want to die', 'better off dead',
      'end it all', "don't want to live", "don't want to be alive",
      "wish I wasn't here", 'wish i was dead', 'no reason to live',
      'hurting myself', 'hurt myself', 'self harm', 'self-harm',
    ])('detects EMERGENCY: "%s"', (pattern) => {
      const result = scanForRedFlags(`I feel ${pattern}`, 20)
      expect(result.level).toBe('emergency')
      expect(result.category).toBe('suicidal_ideation')
      expect(result.actionUrl).toBe('tel:18009444773')
    })

    it('includes PSI helpline in pre-authored message', () => {
      const result = scanForRedFlags('I feel suicidal', 20)
      expect(result.preAuthoredMessage).toContain('1-800-944-4773')
      expect(result.preAuthoredMessage).toContain('988')
      expect(result.preAuthoredMessage).toContain('Samaritans')
    })
  })
})

// ── URGENT PATTERNS ───────────────────────────────────────────────────────

describe('Red Flag Scanner — URGENT patterns', () => {
  it.each([
    'no wet nappies', 'no wet diapers', 'not urinating', 'not weeing', 'dry mouth',
    'sunken fontanelle', 'sunken soft spot', 'no tears', 'crying without tears',
    'skin not bouncing back', 'very dry',
    'vomiting repeatedly', 'vomiting for hours', 'cannot keep anything down',
    'projectile vomiting',
    'blood in stool', 'blood in poop', 'black poop', 'tarry poop',
    'red blood in nappy', 'rectal bleeding',
  ])('detects URGENT: "%s"', (pattern) => {
    const result = scanForRedFlags(`Baby has ${pattern}`, 30)
    expect(result.level).toBe('urgent')
    expect(result.immediateAction).toBe('Seek medical attention today')
    expect(result.category).toBeNull()
    expect(result.preAuthoredMessage).toBeNull()
    expect(result.actionUrl).toBeNull()
  })
})

// ── CALL_DOCTOR PATTERNS ────────────────────────────────────────────────

describe('Red Flag Scanner — CALL_DOCTOR patterns', () => {
  it.each([
    'crying for hours', 'inconsolable', 'cannot be soothed', 'crying non stop',
    'cried for 3 hours', 'cried for 4 hours', 'screaming in pain',
    'high pitched cry', 'unusual cry', 'different cry',
    'rash spreading', 'rash all over', 'rash with fever', 'purple rash',
    'does not recognise', 'very drowsy', 'unusually sleepy', 'hard to rouse',
    'breathing seems fast', 'breathing noisy', 'grunting when breathing',
    'persistent cough', 'barking cough',
  ])('detects CALL_DOCTOR: "%s"', (pattern) => {
    const result = scanForRedFlags(`Baby is ${pattern}`, 30)
    expect(result.level).toBe('call_doctor')
    expect(result.immediateAction).toBe('Contact your pediatrician')
    expect(result.category).toBeNull()
    expect(result.preAuthoredMessage).toBeNull()
  })
})

// ── AGE-SPECIFIC FEVER ESCALATION ───────────────────────────────────────

describe('Red Flag Scanner — Age-specific fever escalation', () => {
  it('fever under 3 months (8 weeks) returns urgent', () => {
    const result = scanForRedFlags('Baby has a fever of 38.2', 8)
    expect(result.level).toBe('urgent')
    expect(result.pattern).toBe('fever_under_3_months')
    expect(result.category).toBe('high_fever_newborn')
    expect(result.severity).toBe('urgent')
  })

  it('fever at exactly 0 weeks returns urgent', () => {
    const result = scanForRedFlags('fever', 0)
    expect(result.level).toBe('urgent')
    expect(result.category).toBe('high_fever_newborn')
  })

  it('fever at 11 weeks returns urgent (still under 12)', () => {
    const result = scanForRedFlags('Temperature of 38.5', 11)
    expect(result.level).toBe('urgent')
    expect(result.category).toBe('high_fever_newborn')
  })

  it('fever at exactly 12 weeks returns call_doctor (boundary)', () => {
    const result = scanForRedFlags('Baby has a fever', 12)
    expect(result.level).toBe('call_doctor')
    expect(result.pattern).toBe('fever_3_to_6_months')
    expect(result.category).toBeNull()
  })

  it('fever at 23 weeks returns call_doctor', () => {
    const result = scanForRedFlags('fever', 23)
    expect(result.level).toBe('call_doctor')
    expect(result.pattern).toBe('fever_3_to_6_months')
  })

  it('fever at 24 weeks returns none (6+ months, beyond age-specific logic)', () => {
    const result = scanForRedFlags('Baby has a fever', 24)
    expect(result.level).toBe('none')
  })

  it('temperature keyword with "100.4" triggers fever check', () => {
    const result = scanForRedFlags('Baby temp is 100.4', 8)
    expect(result.level).toBe('urgent')
  })

  it('"38" triggers fever check', () => {
    const result = scanForRedFlags('temp is 38 degrees', 6)
    expect(result.level).toBe('urgent')
  })

  it('"39" triggers fever check', () => {
    const result = scanForRedFlags('temp is 39 degrees', 6)
    expect(result.level).toBe('urgent')
  })

  it('"40" triggers fever check', () => {
    const result = scanForRedFlags('temp is 40', 6)
    expect(result.level).toBe('urgent')
  })

  it('no fever keyword returns none', () => {
    const result = scanForRedFlags('Baby is sleeping a lot', 8)
    expect(result.level).toBe('none')
  })
})

// ── PRIORITY ORDERING ───────────────────────────────────────────────────

describe('Red Flag Scanner — Priority ordering', () => {
  it('EMERGENCY takes priority over URGENT', () => {
    const result = scanForRedFlags('Baby has blue lips and no wet nappies', 20)
    expect(result.level).toBe('emergency')
  })

  it('EMERGENCY takes priority over fever escalation', () => {
    const result = scanForRedFlags('Baby is not breathing and has a fever', 8)
    expect(result.level).toBe('emergency')
    expect(result.category).toBe('breathing_emergency')
  })

  it('fever_under_3months (urgent) takes priority over general urgent patterns', () => {
    const result = scanForRedFlags('Baby has fever and sunken fontanelle', 8)
    expect(result.level).toBe('urgent')
    expect(result.pattern).toBe('fever_under_3_months')
  })

  it('first emergency category in object order wins when multiple present', () => {
    const result = scanForRedFlags('Baby is choking and having a seizure', 20)
    expect(result.level).toBe('emergency')
    expect(result.category).toBe('choking')
  })

  it('breathing_emergency wins over all others', () => {
    const result = scanForRedFlags('not breathing and choking and seizure', 20)
    expect(result.category).toBe('breathing_emergency')
  })
})

// ── PRE-AUTHORED MESSAGES ───────────────────────────────────────────────

describe('Red Flag Scanner — Pre-authored messages', () => {
  it('emergency result always includes pre-authored message with all country numbers', () => {
    const result = scanForRedFlags('Baby has blue lips', 20)
    expect(result.preAuthoredMessage).toBeTruthy()
    expect(result.preAuthoredMessage).toContain('999')
    expect(result.preAuthoredMessage).toContain('911')
    expect(result.preAuthoredMessage).toContain('112')
    expect(result.preAuthoredMessage).toContain('000')
  })

  it('emergency result includes immediateAction', () => {
    const result = scanForRedFlags('Baby had a seizure', 20)
    expect(result.immediateAction).toBeTruthy()
  })

  it('emergency result includes actionUrl', () => {
    const result = scanForRedFlags('Baby had a seizure', 20)
    expect(result.actionUrl).toBeTruthy()
  })

  it('emergency result includes severity', () => {
    const result = scanForRedFlags('Baby had a seizure', 20)
    expect(result.severity).toBe('emergency')
  })

  it('urgent patterns have null pre-authored message', () => {
    const result = scanForRedFlags('Baby has no wet nappies', 30)
    expect(result.level).toBe('urgent')
    expect(result.preAuthoredMessage).toBeNull()
  })

  it('call_doctor patterns have null pre-authored message', () => {
    const result = scanForRedFlags('baby is inconsolable', 30)
    expect(result.level).toBe('call_doctor')
    expect(result.preAuthoredMessage).toBeNull()
  })

  it('ingestion_poison has Poison Control number', () => {
    const result = scanForRedFlags('baby swallowed poison', 20)
    expect(result.preAuthoredMessage).toContain('1-800-222-1222')
  })

  it('suicidal_ideation includes "I will be here" reassurance', () => {
    const result = scanForRedFlags('I feel suicidal', 20)
    expect(result.preAuthoredMessage).toContain('I will be here')
  })

  it('high_fever_newborn urgent includes AAP reference', () => {
    const result = scanForRedFlags('fever', 4)
    expect(result.preAuthoredMessage).toContain('under 3 months')
    expect(result.preAuthoredMessage).toContain('100.4')
  })
})

// ── SAFE NON-MATCHES ────────────────────────────────────────────────────

describe('Red Flag Scanner — Safe non-matches', () => {
  it('returns none for normal check-in text', () => {
    const result = scanForRedFlags('Meera had a great day, she napped well', 20)
    expect(result.level).toBe('none')
  })

  it('returns none for mild concern text', () => {
    const result = scanForRedFlags('She seems a bit cranky today', 20)
    expect(result.level).toBe('none')
  })

  it('"breathing normally" does not trigger breathing_emergency', () => {
    const result = scanForRedFlags('baby is breathing normally', 8)
    expect(result.category).not.toBe('breathing_emergency')
  })

  it('"sleeping peacefully" does not trigger emergency', () => {
    const result = scanForRedFlags('baby is sleeping peacefully', 8)
    expect(result.level).toBe('none')
  })

  it('"eating well" does not trigger any flag', () => {
    const result = scanForRedFlags('baby is eating well', 8)
    expect(result.level).toBe('none')
  })

  it('"happy and kicking" does not trigger reduced_fetal_movement', () => {
    const result = scanForRedFlags('baby is happy and kicking lots', 28, 'pregnancy')
    expect(result.category).not.toBe('reduced_fetal_movement')
  })

  it('result has all null fields when level is none', () => {
    const result = scanForRedFlags('Good day today', 20)
    expect(result).toEqual({
      level: 'none',
      category: null,
      pattern: null,
      immediateAction: null,
      preAuthoredMessage: null,
      actionUrl: null,
      severity: null,
    })
  })
})
