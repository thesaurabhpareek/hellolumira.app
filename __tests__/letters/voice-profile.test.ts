import { describe, it, expect } from 'vitest'
import {
  extractMechanical,
  extractEndearments,
  diffEdit,
  applyDelta,
  type OnboardingAnswers,
  type VoiceProfileDelta,
} from '@/lib/letters/voice-profile'
import type { VoiceProfile } from '@/types/letters'

function baseProfile(overrides: Partial<VoiceProfile> = {}): VoiceProfile {
  return {
    id: 'vp-1',
    profile_id: 'profile-1',
    baby_id: 'baby-1',
    endearments: [],
    partner_name_for_child: null,
    self_name_for_child: null,
    mean_sentence_len: null,
    sentence_len_stdev: null,
    contraction_rate: null,
    question_rate: null,
    formality: null,
    humor_mode: null,
    profanity_ceiling: 0,
    code_switch_terms: [],
    register_notes: null,
    banned_words: [],
    preferred_words: [],
    onboarding_complete: true,
    version: 1,
    ...overrides,
  }
}

function baseAnswers(overrides: Partial<OnboardingAnswers> = {}): OnboardingAnswers {
  return {
    birth_story: null,
    endearments_raw: null,
    partner_name_raw: null,
    never_forget: null,
    code_switch_raw: null,
    profanity_ceiling_raw: null,
    hard_night: null,
    humor_raw: null,
    ...overrides,
  }
}

describe('extractMechanical', () => {
  it('handles empty input without throwing and without dividing by zero', () => {
    const stats = extractMechanical([])
    expect(stats.sentence_count).toBe(0)
    expect(stats.token_count).toBe(0)
    expect(stats.mean_sentence_len).toBeNull()
    expect(stats.sentence_len_stdev).toBeNull()
    expect(stats.type_token_ratio).toBeNull()
    expect(stats.contraction_rate).toBeNull()
    expect(stats.question_rate).toBeNull()
    expect(stats.exclamation_rate).toBeNull()
    expect(stats.non_english_tokens).toEqual([])

    const statsEmptyStrings = extractMechanical(['', '   '])
    expect(statsEmptyStrings.sentence_count).toBe(0)
    expect(statsEmptyStrings.mean_sentence_len).toBeNull()
  })

  it('handles a single sentence: stdev is defined and zero, not NaN', () => {
    const stats = extractMechanical(['She slept for four whole hours tonight.'])
    expect(stats.sentence_count).toBe(1)
    expect(stats.mean_sentence_len).not.toBeNull()
    expect(stats.sentence_len_stdev).toBe(0)
    expect(Number.isNaN(stats.sentence_len_stdev)).toBe(false)
    expect(stats.question_rate).toBe(0)
    expect(stats.exclamation_rate).toBe(0)
  })

  it('computes rates and a windowed (MATTR) type-token ratio on long input', () => {
    const MATTR_TOKEN_FLOOR = 20
    const longTranscript = Array.from(
      { length: 40 },
      (_, i) => `I can't believe how fast she is growing, honestly, is this real? ${i % 3 === 0 ? 'Amazing!' : ''}`
    ).join(' ')
    const stats = extractMechanical([longTranscript])
    expect(stats.sentence_count).toBeGreaterThan(20)
    expect(stats.token_count).toBeGreaterThan(MATTR_TOKEN_FLOOR)
    expect(stats.type_token_ratio).not.toBeNull()
    expect(stats.type_token_ratio as number).toBeGreaterThan(0)
    expect(stats.type_token_ratio as number).toBeLessThanOrEqual(1)
    expect(stats.ttr_window_size).toBeGreaterThan(0)
    expect(stats.contraction_rate).toBeGreaterThan(0)
    expect(stats.question_rate).toBeGreaterThan(0)
    expect(stats.exclamation_rate).toBeGreaterThan(0)
  })

  it('collects repeated non-English/romanized tokens but not one-off rare words', () => {
    const transcripts = [
      'Chalo beta, let us go. Chalo, chalo, we are late.',
      'She said beta again this morning, so sweet.',
    ]
    const stats = extractMechanical(transcripts)
    expect(stats.non_english_tokens).toContain('chalo')
    expect(stats.non_english_tokens).toContain('beta')
  })
})

describe('extractEndearments', () => {
  it('extracts multiple endearments including non-English terms', () => {
    const answers = baseAnswers({
      endearments_raw: 'I call her Meeru, beta, and sometimes Little Bear',
      partner_name_raw: 'Mumma, sometimes Mama',
    })
    const result = extractEndearments(answers)
    expect(result.endearments).toContain('Meeru')
    expect(result.endearments).toContain('beta')
    expect(result.endearments).toContain('Little Bear')
    expect(result.partnerName).toBe('Mumma')
  })

  it('handles a bare answer with no lead-in phrase', () => {
    const answers = baseAnswers({ endearments_raw: 'jaan' })
    const result = extractEndearments(answers)
    expect(result.endearments).toEqual(['jaan'])
  })

  it('returns nulls when nothing was said', () => {
    const result = extractEndearments(baseAnswers())
    expect(result.endearments).toEqual([])
    expect(result.selfName).toBeNull()
    expect(result.partnerName).toBeNull()
  })

  it('infers self name from free text when not asked directly', () => {
    const answers = baseAnswers({
      hard_night: 'She would only settle when I held her and said call me Papa, it is okay.',
    })
    const result = extractEndearments(answers)
    expect(result.selfName).toBe('Papa')
  })
})

describe('diffEdit', () => {
  it('returns a no-op delta when nothing changed', () => {
    const profile = baseProfile()
    const text = 'Tonight you fell asleep on my chest and I did not want to move.'
    const delta = diffEdit(text, text, profile)
    expect(delta.is_noop).toBe(true)
    expect(delta.banned_lexicon_hits).toEqual([])
    expect(delta.swap_candidates).toEqual([])
    expect(delta.closer_overreach_delta).toBe(0)
  })

  it('flags a deleted banned-lexicon word', () => {
    const profile = baseProfile()
    const composed = 'Tonight felt like a testament to how far you have come.'
    const edited = 'Tonight felt like proof of how far you have come.'
    const delta = diffEdit(composed, edited, profile)
    expect(delta.banned_lexicon_hits.some((h) => h.term === 'testament')).toBe(true)
  })

  it('detects a single-word swap candidate from one edit', () => {
    const profile = baseProfile()
    const composed = 'You are growing so fast, little.'
    const edited = 'You are growing so fast, beta.'
    const delta = diffEdit(composed, edited, profile)
    expect(delta.swap_candidates).toEqual(
      expect.arrayContaining([expect.objectContaining({ from: 'little', to: 'beta' })])
    )
  })

  it('flags closer overreach when the final sentence is deleted entirely', () => {
    const profile = baseProfile()
    const composed = 'You slept through the night. I am so proud of you today.'
    const edited = 'You slept through the night.'
    const delta = diffEdit(composed, edited, profile)
    expect(delta.closer_overreach_delta).toBe(1)
  })

  it('does not flag closer overreach when the final sentence survives', () => {
    const profile = baseProfile()
    const composed = 'You slept through the night. I am so proud of you today.'
    const edited = 'You slept well tonight. I am so proud of you today.'
    const delta = diffEdit(composed, edited, profile)
    expect(delta.closer_overreach_delta).toBe(0)
  })
})

describe('applyDelta', () => {
  it('does not promote a swap into banned/preferred words after only one occurrence', () => {
    const profile = baseProfile()
    const delta: VoiceProfileDelta = {
      banned_lexicon_hits: [],
      closer_overreach_delta: 0,
      swap_candidates: [{ from: 'little one', to: 'beta' }],
      is_noop: false,
    }
    const next = applyDelta(profile, delta)
    expect(next.banned_words).not.toContain('little one')
    expect(next.preferred_words).not.toContain('beta')
    // version still bumps: the delta carried real signal even if not yet promoted
    expect(next.version).toBe(profile.version + 1)
  })

  it('promotes a swap only once it recurs across a second diffEdit call', () => {
    const profile1 = baseProfile()
    const delta: VoiceProfileDelta = {
      banned_lexicon_hits: [],
      closer_overreach_delta: 0,
      swap_candidates: [{ from: 'little one', to: 'beta' }],
      is_noop: false,
    }
    const profile2 = applyDelta(profile1, delta)
    expect(profile2.banned_words).not.toContain('little one')

    const profile3 = applyDelta(profile2, delta)
    expect(profile3.banned_words).toContain('little one')
    expect(profile3.preferred_words).toContain('beta')
    expect(profile3.version).toBe(profile1.version + 2)
  })

  it('bumps version on a real delta and leaves it unchanged on a no-op delta', () => {
    const profile = baseProfile({ version: 5 })
    const noop: VoiceProfileDelta = {
      banned_lexicon_hits: [],
      closer_overreach_delta: 0,
      swap_candidates: [],
      is_noop: true,
    }
    const unchanged = applyDelta(profile, noop)
    expect(unchanged.version).toBe(5)
    expect(unchanged).toEqual(profile)

    const withSignal: VoiceProfileDelta = {
      banned_lexicon_hits: [{ term: 'delve', weight_delta: 2 }],
      closer_overreach_delta: 0,
      swap_candidates: [],
      is_noop: false,
    }
    const bumped = applyDelta(profile, withSignal)
    expect(bumped.version).toBe(6)
    expect(bumped.banned_words).toContain('delve')
  })

  it('never leaks raw transcript text into register_notes', () => {
    const profile = baseProfile({ register_notes: 'Prefers short, plain sentences.' })
    const delta: VoiceProfileDelta = {
      banned_lexicon_hits: [{ term: 'delve', weight_delta: 2 }],
      closer_overreach_delta: 1,
      swap_candidates: [],
      is_noop: false,
    }
    const next = applyDelta(profile, delta)
    expect(next.register_notes).toContain('Prefers short, plain sentences.')
    expect(next.register_notes).not.toMatch(/\braw_transcript\b/)
  })

  it('caps banned_words growth and evicts the lowest-weight entries first', () => {
    let profile = baseProfile()
    // Push 55 distinct banned-lexicon terms through applyDelta, one at a time,
    // each crossing the promotion threshold on its own delta, with strictly
    // increasing weight so eviction order is fully deterministic (no ties).
    for (let i = 0; i < 55; i++) {
      const delta: VoiceProfileDelta = {
        banned_lexicon_hits: [{ term: `slopword${i}`, weight_delta: 10 + i }],
        closer_overreach_delta: 0,
        swap_candidates: [],
        is_noop: false,
      }
      profile = applyDelta(profile, delta)
    }
    // Exactly 50 kept: the cap.
    expect(profile.banned_words).toHaveLength(50)
    // The 5 lowest-weight (earliest, weight 10-14) terms were evicted.
    expect(profile.banned_words).not.toContain('slopword0')
    expect(profile.banned_words).not.toContain('slopword4')
    // The highest-weight terms survive.
    expect(profile.banned_words).toContain('slopword5')
    expect(profile.banned_words).toContain('slopword54')
  })
})
