import { describe, it, expect } from 'vitest'
import { selectOpeningPrompt, type AgeBandPrompts } from '@/lib/letters/prompt-selection'
import type { LetterPromptContext } from '@/types/letters'

/** Fixture bank — CT1's real lib/letters/prompts/age-bands.ts does not exist
 *  yet, so this test codes against the AgeBandPrompts interface directly. */
const bank: AgeBandPrompts = {
  bands: [
    { band: '0-3', minMonths: 0, maxMonths: 3, prompts: ['0-3 prompt A', '0-3 prompt B'] },
    { band: '4-6', minMonths: 4, maxMonths: 6, prompts: ['4-6 prompt A', '4-6 prompt B'] },
    { band: '7-9', minMonths: 7, maxMonths: 9, prompts: ['7-9 prompt A', '7-9 prompt B'] },
    { band: '10-12', minMonths: 10, maxMonths: 12, prompts: ['10-12 prompt A', '10-12 prompt B'] },
    { band: '13-15', minMonths: 13, maxMonths: 15, prompts: ['13-15 prompt A', '13-15 prompt B'] },
    { band: '16-24', minMonths: 16, maxMonths: 24, prompts: ['16-24 prompt A', '16-24 prompt B'] },
  ],
  evergreen: ['evergreen A', 'evergreen B'],
}

function baseCtx(overrides: Partial<LetterPromptContext> = {}): LetterPromptContext {
  return {
    babyName: 'Meera',
    ageInMonths: 11,
    ageInWeeks: 47,
    todaysMilestones: [],
    todaysCheckin: null,
    daysSinceLastEntry: 1,
    openThreads: [],
    ...overrides,
  }
}

describe('selectOpeningPrompt — priority branches', () => {
  it('fires gap recovery at exactly the 5-day threshold', () => {
    const result = selectOpeningPrompt(baseCtx({ daysSinceLastEntry: 5 }), bank, [])
    expect(result.source).toBe('gap_recovery')
    expect(result.text).toBe('The last few days, as one.')
    expect(result.sourceRef).toBe('gap:5')
  })

  it('does not fire gap recovery at 4 days', () => {
    const result = selectOpeningPrompt(
      baseCtx({ daysSinceLastEntry: 4, ageInMonths: null }),
      bank,
      []
    )
    expect(result.source).not.toBe('gap_recovery')
  })

  it('fires gap recovery for a much longer gap too', () => {
    const result = selectOpeningPrompt(baseCtx({ daysSinceLastEntry: 30 }), bank, [])
    expect(result.source).toBe('gap_recovery')
    expect(result.sourceRef).toBe('gap:30')
  })

  it('gap recovery beats a same-day milestone', () => {
    const ctx = baseCtx({
      daysSinceLastEntry: 6,
      todaysMilestones: [{ type: 'walking', note: null }],
    })
    const result = selectOpeningPrompt(ctx, bank, [])
    expect(result.source).toBe('gap_recovery')
  })

  it('opens on a milestone specifically, never a generic "how was your day"', () => {
    const ctx = baseCtx({
      daysSinceLastEntry: 1,
      todaysMilestones: [{ type: 'walking', note: null }],
    })
    const result = selectOpeningPrompt(ctx, bank, [])
    expect(result.source).toBe('milestone')
    expect(result.text).toBe("You logged Meera's first steps today. Tell me about the moment.")
    expect(result.text.toLowerCase()).not.toContain('how was your day')
    expect(result.sourceRef).toBe('milestone:walking')
  })

  it('falls back to the milestone note for an unrecognized milestone type', () => {
    const ctx = baseCtx({
      todaysMilestones: [{ type: 'unusual_type', note: 'said "dog" for the first time' }],
    })
    const result = selectOpeningPrompt(ctx, bank, [])
    expect(result.source).toBe('milestone')
    expect(result.text).toContain('said "dog" for the first time')
    expect(result.sourceRef).toBe('milestone:unusual_type')
  })

  it('opens on very low sleep from the check-in', () => {
    const ctx = baseCtx({
      todaysCheckin: { sleep_hours: 3.5, mood: null },
    })
    const result = selectOpeningPrompt(ctx, bank, [])
    expect(result.source).toBe('checkin')
    expect(result.text).toBe("3.5 hours of sleep. What's it actually like right now?")
    expect(result.sourceRef).toBe('checkin:sleep')
  })

  it('opens on a difficult mood from the check-in when sleep is fine', () => {
    const ctx = baseCtx({
      todaysCheckin: { sleep_hours: 8, mood: 'very_fussy' },
    })
    const result = selectOpeningPrompt(ctx, bank, [])
    expect(result.source).toBe('checkin')
    expect(result.sourceRef).toBe('checkin:mood')
  })

  it('does not treat a merely "fussy" mood or ample sleep as notable', () => {
    const ctx = baseCtx({
      todaysCheckin: { sleep_hours: 9, mood: 'fussy' },
    })
    const result = selectOpeningPrompt(ctx, bank, [])
    expect(result.source).not.toBe('checkin')
  })

  it("pulls from the age band matching the child's current age", () => {
    const ctx = baseCtx({ ageInMonths: 14 })
    const result = selectOpeningPrompt(ctx, bank, [])
    expect(result.source).toBe('age_band')
    expect(['13-15 prompt A', '13-15 prompt B']).toContain(result.text)
    expect(result.sourceRef).toBe('age_band:13-15')
  })

  it('places walking/first-word-age children in 13-15, not 10-12 (post-2022 CDC ages)', () => {
    // A child logging first steps at 13 months should NOT match a band that
    // expects walking at 12 months; 13-15 is the correct CDC-aligned band.
    const ctx = baseCtx({ ageInMonths: 13 })
    const result = selectOpeningPrompt(ctx, bank, [])
    expect(result.sourceRef).toBe('age_band:13-15')
  })

  it('falls back to evergreen for an age outside every band', () => {
    const ctx = baseCtx({ ageInMonths: 36 })
    const result = selectOpeningPrompt(ctx, bank, [])
    expect(result.source).toBe('evergreen')
    expect(['evergreen A', 'evergreen B']).toContain(result.text)
    expect(result.sourceRef).toBeNull()
  })

  it('falls back to evergreen when ageInMonths is null', () => {
    const ctx = baseCtx({ ageInMonths: null })
    const result = selectOpeningPrompt(ctx, bank, [])
    expect(result.source).toBe('evergreen')
    expect(result.sourceRef).toBeNull()
  })
})

describe('selectOpeningPrompt — null fields throughout', () => {
  it('handles a fully-null context without throwing and without an empty age band', () => {
    const ctx: LetterPromptContext = {
      babyName: null,
      ageInMonths: null,
      ageInWeeks: null,
      todaysMilestones: [],
      todaysCheckin: null,
      daysSinceLastEntry: null,
      openThreads: [],
    }
    const result = selectOpeningPrompt(ctx, bank, [])
    expect(result.source).toBe('evergreen')
    expect(result.sourceRef).toBeNull()
    expect(result.text).not.toContain('undefined')
    expect(result.text).not.toContain('null')
  })

  it('never renders "undefined" or an empty name slot for a null babyName milestone', () => {
    const ctx = baseCtx({ babyName: null, todaysMilestones: [{ type: 'rolling', note: null }] })
    const result = selectOpeningPrompt(ctx, bank, [])
    expect(result.text).toBe('You logged rolling over today. Tell me about the moment.')
    expect(result.text).not.toContain('undefined')
    expect(result.text).not.toMatch(/\s{2,}/) // no doubled-up whitespace from an empty slot
  })

  it('treats daysSinceLastEntry: null as "not a gap" (no crash, no false gap-recovery)', () => {
    const ctx = baseCtx({ daysSinceLastEntry: null })
    const result = selectOpeningPrompt(ctx, bank, [])
    expect(result.source).not.toBe('gap_recovery')
  })

  it('treats a milestone note of null gracefully for an unrecognized type', () => {
    const ctx = baseCtx({ todaysMilestones: [{ type: 'unrecognized', note: null }] })
    const result = selectOpeningPrompt(ctx, bank, [])
    expect(result.source).toBe('milestone')
    expect(result.text).not.toContain('null')
    expect(result.text).not.toContain('undefined')
  })
})

describe('selectOpeningPrompt — repeat suppression', () => {
  it('does not repeat the same age-band prompt two nights running', () => {
    const ctx = baseCtx({ ageInMonths: 5 })
    const recent = ['4-6 prompt A']
    const result = selectOpeningPrompt(ctx, bank, recent)
    expect(result.source).toBe('age_band')
    expect(result.text).toBe('4-6 prompt B')
  })

  it('does not repeat the same evergreen prompt two nights running', () => {
    const ctx = baseCtx({ ageInMonths: null })
    const recent = ['evergreen A']
    const result = selectOpeningPrompt(ctx, bank, recent)
    expect(result.source).toBe('evergreen')
    expect(result.text).toBe('evergreen B')
  })

  it('falls through past a repeated milestone prompt to the next tier', () => {
    const alreadyShown = 'You logged first steps today. Tell me about the moment.'
    const ctx = baseCtx({
      babyName: null,
      ageInMonths: 14,
      todaysMilestones: [{ type: 'walking', note: null }],
    })
    const result = selectOpeningPrompt(ctx, bank, [alreadyShown])
    expect(result.source).not.toBe('milestone')
    expect(result.source).toBe('age_band')
  })

  it('reuses the only available option when every candidate in the band was recent', () => {
    const ctx = baseCtx({ ageInMonths: 5 })
    const recent = ['4-6 prompt A', '4-6 prompt B']
    const result = selectOpeningPrompt(ctx, bank, recent)
    expect(result.source).toBe('age_band')
    expect(['4-6 prompt A', '4-6 prompt B']).toContain(result.text)
  })

  it('gap recovery is exempt from suppression — it persists while the gap continues', () => {
    const ctx = baseCtx({ daysSinceLastEntry: 5 })
    const recent = ['The last few days, as one.']
    const result = selectOpeningPrompt(ctx, bank, recent)
    expect(result.source).toBe('gap_recovery')
    expect(result.text).toBe('The last few days, as one.')
  })
})

describe('selectOpeningPrompt — determinism and purity', () => {
  it('returns the same result for the same inputs across repeated calls', () => {
    const ctx = baseCtx({ ageInMonths: 8 })
    const first = selectOpeningPrompt(ctx, bank, [])
    const second = selectOpeningPrompt(ctx, bank, [])
    expect(second).toEqual(first)
  })

  it('never mutates the recentPromptTexts array it is given', () => {
    const ctx = baseCtx({ ageInMonths: 5 })
    const recent = ['4-6 prompt A']
    const before = [...recent]
    selectOpeningPrompt(ctx, bank, recent)
    expect(recent).toEqual(before)
  })
})

describe('selectOpeningPrompt — no developmental judgment', () => {
  it('never asserts an assessment like "normal" or "behind" in any branch', () => {
    const scenarios: LetterPromptContext[] = [
      baseCtx({ daysSinceLastEntry: 6 }),
      baseCtx({ todaysMilestones: [{ type: 'sitting', note: null }] }),
      baseCtx({ todaysCheckin: { sleep_hours: 2, mood: null } }),
      baseCtx({ ageInMonths: 8 }),
      baseCtx({ ageInMonths: null }),
    ]
    const banned = /\b(normal|abnormal|delayed|behind|advanced|on track|concerning)\b/i
    for (const ctx of scenarios) {
      const result = selectOpeningPrompt(ctx, bank, [])
      expect(result.text).not.toMatch(banned)
    }
  })
})

describe('selectOpeningPrompt — unicode and long input', () => {
  it('handles a unicode baby name and milestone note without corruption', () => {
    const ctx = baseCtx({
      babyName: 'Zoë 🌙',
      todaysMilestones: [{ type: 'unrecognized', note: '第一次说话 👶' }],
    })
    const result = selectOpeningPrompt(ctx, bank, [])
    expect(result.text).toContain('Zoë 🌙')
    expect(result.text).toContain('第一次说话 👶')
  })

  it('truncates a very long milestone note rather than embedding it whole', () => {
    const longNote = 'a'.repeat(500)
    const ctx = baseCtx({ todaysMilestones: [{ type: 'unrecognized', note: longNote }] })
    const result = selectOpeningPrompt(ctx, bank, [])
    expect(result.text.length).toBeLessThan(longNote.length)
  })
})
