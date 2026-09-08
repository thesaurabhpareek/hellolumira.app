import { describe, it, expect } from 'vitest'
import { composeKeepWords, type KeepWordsInput } from '@/lib/letters/compose-keep-words'
import type { FollowUp, VoiceProfile } from '@/types/letters'

function baseVoiceProfile(overrides: Partial<VoiceProfile> = {}): VoiceProfile {
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
    profanity_ceiling: 2,
    code_switch_terms: [],
    register_notes: null,
    banned_words: [],
    preferred_words: [],
    onboarding_complete: true,
    version: 1,
    ...overrides,
  }
}

function followUp(overrides: Partial<FollowUp> = {}): FollowUp {
  return {
    archetype: 'anchor',
    question: 'What did you notice?',
    answer: null,
    skipped: false,
    ...overrides,
  }
}

/** Lowercased alphanumeric/apostrophe tokens — punctuation-insensitive comparison. */
function words(text: string): Set<string> {
  const matches = text.toLowerCase().match(/[a-z0-9']+/g)
  return new Set(matches ?? [])
}

// ---------------------------------------------------------------------------
// Deterministic PRNG (mulberry32) — no new dependency, reproducible across CI.
// ---------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  let s = seed
  return function next(): number {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

const CONTENT_WORDS = [
  'baby', 'she', 'he', 'today', 'slept', 'cried', 'laughed', 'ate', 'crawled',
  'walked', 'smiled', 'giggled', 'milk', 'bottle', 'nap', 'bath', 'soft', 'warm',
  'tired', 'happy', 'mama', 'papa', 'beta', 'shabash', 'nani', 'arre', 'achha',
  'tiny', 'sock', 'blanket', 'window', 'floor', 'kitchen', 'stroller', 'grass',
] as const
const FILLER_CHUNKS = ['um', 'uh', 'like', 'you know', 'I mean'] as const
const PROFANITY_WORDS = ['damn', 'hell', 'shit', 'fuck', 'crap'] as const
/** Distinct nonsense tokens used ONLY in follow-up questions — never in a
 *  transcript or answer, so if one leaks into the body the invariant check
 *  below will catch it (proves questions are excluded, not just untested). */
const QUESTION_ONLY_WORDS = ['zqmark', 'vexlon', 'plamnu', 'ftorbik'] as const

function randomTranscript(rng: () => number): string {
  const len = 4 + Math.floor(rng() * 16)
  const chunks: string[] = []
  for (let i = 0; i < len; i++) {
    const r = rng()
    if (r < 0.12) chunks.push(pick(rng, FILLER_CHUNKS))
    else if (r < 0.18) chunks.push(pick(rng, PROFANITY_WORDS))
    else chunks.push(pick(rng, CONTENT_WORDS))
    // Occasionally simulate a false start: attach a dash to the word just added.
    if (rng() < 0.08 && chunks.length > 0) {
      chunks[chunks.length - 1] = chunks[chunks.length - 1] + '—'
    }
  }
  let s = chunks.join(' ')
  if (rng() < 0.5) s += '.'
  return s
}

function randomQuestion(rng: () => number): string {
  const n = 2 + Math.floor(rng() * 3)
  const out: string[] = []
  for (let i = 0; i < n; i++) out.push(pick(rng, QUESTION_ONLY_WORDS))
  return out.join(' ') + '?'
}

function randomFollowups(rng: () => number): FollowUp[] {
  const count = Math.floor(rng() * 3) // 0, 1 or 2
  const out: FollowUp[] = []
  for (let i = 0; i < count; i++) {
    const skipped = rng() < 0.3
    const hasAnswer = !skipped && rng() < 0.85
    out.push(
      followUp({
        archetype: pick(rng, ['anchor', 'thread', 'you'] as const),
        question: randomQuestion(rng),
        answer: hasAnswer ? randomTranscript(rng) : null,
        skipped,
      })
    )
  }
  return out
}

describe('composeKeepWords — authenticity invariant (property test)', () => {
  it('never outputs a word that was not in the transcript or a follow-up answer', () => {
    const rng = mulberry32(20260908)
    const iterations = 300

    for (let i = 0; i < iterations; i++) {
      const transcript = randomTranscript(rng)
      const followups = randomFollowups(rng)
      const ceiling = pick(rng, [0, 1, 2] as const)

      const input: KeepWordsInput = {
        transcript,
        followups,
        voiceProfile: baseVoiceProfile({ profanity_ceiling: ceiling }),
      }
      const result = composeKeepWords(input)

      const allowed = words(transcript)
      for (const f of followups) {
        if (typeof f.answer === 'string') {
          for (const w of Array.from(words(f.answer))) allowed.add(w)
        }
      }

      const produced = words(result.body)
      for (const w of Array.from(produced)) {
        if (!allowed.has(w)) {
          throw new Error(
            `Invariant violated at iteration ${i}: word "${w}" appeared in output but not ` +
              `in input.\ntranscript: ${JSON.stringify(transcript)}\n` +
              `followups: ${JSON.stringify(followups)}\nbody: ${JSON.stringify(result.body)}`
          )
        }
      }
    }
  })
})

describe('composeKeepWords — filler and disfluency removal', () => {
  it('removes leading "um" without losing meaning', () => {
    const result = composeKeepWords({ transcript: 'um she started crawling today' })
    expect(result.body).toBe('She started crawling today.')
  })

  it('removes "uh" mid-sentence without losing meaning', () => {
    const result = composeKeepWords({ transcript: 'she uh started crawling today' })
    expect(result.body).toBe('She started crawling today.')
  })

  it('removes comma-flanked "you know" as a discourse filler', () => {
    const result = composeKeepWords({ transcript: 'She was tired, you know, and fussy' })
    expect(result.body).toBe('She was tired, and fussy.')
  })

  it('removes leading "I mean," as filler', () => {
    const result = composeKeepWords({ transcript: 'I mean, she barely slept last night' })
    expect(result.body).toBe('She barely slept last night.')
  })

  it('preserves literal "I mean it" — not a comma-marked filler', () => {
    const result = composeKeepWords({ transcript: 'I mean it, she really did it' })
    expect(result.body).toBe('I mean it, she really did it.')
  })

  it('collapses a stammered function word', () => {
    const result = composeKeepWords({ transcript: 'she she started crawling today' })
    expect(result.body).toBe('She started crawling today.')
  })

  it('preserves an intentional repeated word (not in the closed stammer list)', () => {
    const result = composeKeepWords({ transcript: 'she was very very tired tonight' })
    expect(result.body).toBe('She was very very tired tonight.')
  })
})

describe('composeKeepWords — "like" disambiguation (critical)', () => {
  it('preserves "like" used as a comparison', () => {
    const result = composeKeepWords({ transcript: 'she looks like her mother' })
    expect(result.body).toBe('She looks like her mother.')
  })

  it('removes comma-flanked "like" as filler', () => {
    const result = composeKeepWords({ transcript: 'It was, like, really loud' })
    expect(result.body).toBe('It was, really loud.')
  })

  it('removes leading "Like," as filler', () => {
    const result = composeKeepWords({ transcript: 'Like, she just started crawling' })
    expect(result.body).toBe('She just started crawling.')
  })

  it('preserves "like" answering "what did it smell like" — no comma cue', () => {
    const result = composeKeepWords({
      transcript: 'She had a rough night.',
      followups: [
        followUp({ question: 'What did it smell like?', answer: 'like lavender, from the bath' }),
      ],
    })
    expect(result.body).toContain('Like lavender, from the bath.')
  })
})

describe('composeKeepWords — false starts and self-corrections', () => {
  it('drops the abandoned clause and keeps the correction (the example from spec)', () => {
    const result = composeKeepWords({
      transcript: 'she went to the— she crawled to the door',
    })
    expect(result.body).toBe('She crawled to the door.')
  })

  it('keeps only the text after the last of several restarts', () => {
    const result = composeKeepWords({
      transcript: 'we went to the store— no wait— we went to the market',
    })
    expect(result.body).toBe('We went to the market.')
  })

  it('does not treat a digit-flanked dash as a false start (a number range)', () => {
    const result = composeKeepWords({
      transcript: 'she slept 7–8 hours last night',
    })
    expect(result.body).toBe('She slept 7-8 hours last night.')
  })

  it('leaves a plain hyphenated compound word alone (not a dash marker)', () => {
    const result = composeKeepWords({ transcript: 'she is a well-behaved baby today' })
    expect(result.body).toBe('She is a well-behaved baby today.')
  })
})

describe('composeKeepWords — pass-through fidelity', () => {
  it('leaves already-clean, well-punctuated input nearly unchanged', () => {
    const clean =
      'She started crawling today. She got all the way across the kitchen floor before I could stop laughing.'
    const result = composeKeepWords({ transcript: clean })
    expect(result.body).toBe(clean)
  })

  it('handles a one-sentence input, fixing only capitalization and punctuation', () => {
    const result = composeKeepWords({ transcript: 'she smiled at me' })
    expect(result.body).toBe('She smiled at me.')
    expect(result.wordCount).toBe(4)
  })

  it('does not pad a short true entry — a short result is correct, not a failure', () => {
    const result = composeKeepWords({ transcript: 'good day' })
    expect(result.body).toBe('Good day.')
    expect(result.wordCount).toBe(2)
  })

  it('preserves non-English words and endearments exactly', () => {
    const result = composeKeepWords({ transcript: 'aaj usne bahut maza kiya, beta' })
    expect(result.body).toBe('Aaj usne bahut maza kiya, beta.')
  })

  it('preserves an English endearment untouched', () => {
    const result = composeKeepWords({ transcript: 'hi munchkin you did so good today' })
    expect(result.body).toBe('Hi munchkin you did so good today.')
  })
})

describe('composeKeepWords — profanity ceiling', () => {
  const transcript = 'This shit was so damn hard today'

  it('ceiling 0 (none): strips both mild and strong profanity', () => {
    const result = composeKeepWords({
      transcript,
      voiceProfile: baseVoiceProfile({ profanity_ceiling: 0 }),
    })
    expect(result.body).toBe('This was so hard today.')
  })

  it('ceiling 1 (mild): keeps mild profanity, strips strong', () => {
    const result = composeKeepWords({
      transcript,
      voiceProfile: baseVoiceProfile({ profanity_ceiling: 1 }),
    })
    expect(result.body).toBe('This was so damn hard today.')
  })

  it('ceiling 2 (unrestricted): preserves everything exactly as said', () => {
    const result = composeKeepWords({
      transcript,
      voiceProfile: baseVoiceProfile({ profanity_ceiling: 2 }),
    })
    expect(result.body).toBe('This shit was so damn hard today.')
  })

  it('defaults to unrestricted when no voice profile is supplied', () => {
    const result = composeKeepWords({ transcript })
    expect(result.body).toBe('This shit was so damn hard today.')
  })
})

describe('composeKeepWords — follow-up merging', () => {
  it('merges answered follow-ups in ask order as plain prose, never as Q&A', () => {
    const result = composeKeepWords({
      transcript: 'She had a rough night.',
      followups: [
        followUp({ question: 'What did she smell like?', answer: 'like lavender, from the bath' }),
        followUp({ question: 'How did you feel?', answer: null, skipped: true }),
      ],
    })
    expect(result.body).toBe('She had a rough night.\n\nLike lavender, from the bath.')
    expect(result.body).not.toContain('Q:')
    expect(result.body).not.toContain('A:')
    expect(result.body).not.toContain('smell')
    expect(result.body).not.toContain('feel')
  })

  it('ignores a skipped follow-up entirely', () => {
    const result = composeKeepWords({
      transcript: 'She ate well.',
      followups: [followUp({ answer: 'she finished the whole bowl', skipped: true })],
    })
    expect(result.body).toBe('She ate well.')
  })

  it('ignores a follow-up with a null answer even when not marked skipped', () => {
    const result = composeKeepWords({
      transcript: 'She ate well.',
      followups: [followUp({ question: 'How are you?', answer: null, skipped: false })],
    })
    expect(result.body).toBe('She ate well.')
  })

  it('ignores a follow-up whose answer is only whitespace', () => {
    const result = composeKeepWords({
      transcript: 'She ate well.',
      followups: [followUp({ answer: '   ', skipped: false })],
    })
    expect(result.body).toBe('She ate well.')
  })
})

describe('composeKeepWords — edge cases', () => {
  it('handles an empty transcript with no follow-ups', () => {
    const result = composeKeepWords({ transcript: '' })
    expect(result.body).toBe('')
    expect(result.wordCount).toBe(0)
    expect(result.slopAudit.clean).toBe('')
  })

  it('handles a whitespace-only transcript', () => {
    const result = composeKeepWords({ transcript: '   \n\n  ' })
    expect(result.body).toBe('')
  })

  it('handles no followups field at all', () => {
    const result = composeKeepWords({ transcript: 'she napped twice today' })
    expect(result.body).toBe('She napped twice today.')
  })

  it('produces a body entirely from follow-up answers when the transcript is empty', () => {
    const result = composeKeepWords({
      transcript: '',
      followups: [followUp({ answer: 'she rolled over for the first time' })],
    })
    expect(result.body).toBe('She rolled over for the first time.')
  })

  it('preserves unicode content (accents, non-Latin script) without throwing', () => {
    const result = composeKeepWords({ transcript: 'she said "bébé" and giggled, so cute' })
    expect(result.body.length).toBeGreaterThan(0)
    expect(result.body).toContain('bébé')
  })

  it('handles a very long transcript without throwing and preserves the invariant', () => {
    const sentence = 'she crawled across the kitchen floor and giggled at the dog. '
    const long = sentence.repeat(400) // ~2800 words
    const result = composeKeepWords({ transcript: long })
    expect(result.body.length).toBeGreaterThan(0)
    const allowed = words(long)
    for (const w of Array.from(words(result.body))) {
      expect(allowed.has(w)).toBe(true)
    }
  })

  it('never invents a closing line for a bare transcript', () => {
    const result = composeKeepWords({ transcript: 'tired' })
    expect(result.body).toBe('Tired.')
  })
})
