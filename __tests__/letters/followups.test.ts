import { describe, it, expect } from 'vitest'
import { selectFollowUps } from '@/lib/letters/followups'
import type { LetterPromptContext, SafetyResult } from '@/types/letters'

function ctx(overrides: Partial<LetterPromptContext> = {}): LetterPromptContext {
  return {
    babyName: 'Meera',
    ageInMonths: 11,
    ageInWeeks: null,
    todaysMilestones: [],
    todaysCheckin: null,
    daysSinceLastEntry: 1,
    openThreads: [],
    ...overrides,
  }
}

function safety(tier: 0 | 1 | 2, overrides: Partial<SafetyResult> = {}): SafetyResult {
  return { tier, category: tier === 0 ? 'none' : 'distress', templateKey: tier === 2 ? 'x' : null, ...overrides }
}

// Long enough (>= 25 words) filler with zero sensory nouns and zero first-person
// affect vocabulary, used as a base for archetype-isolation tests.
const GENERIC_LONG =
  'Something happened today and everyone was busy and things moved fast throughout the whole ' +
  'entire day without much of a break at all really honestly and truly for once.'

// ── Archetype: anchor ────────────────────────────────────────────────────

describe('anchor archetype', () => {
  it('fires when the transcript has length but no concrete sensory noun', () => {
    const slots = selectFollowUps(GENERIC_LONG, ctx(), safety(0))
    expect(slots.some((s) => s.archetype === 'anchor')).toBe(true)
  })

  it('does not fire when a concrete sensory noun is present', () => {
    const text =
      'She wore her little yellow onesie all day and it made her giggle every time she saw ' +
      'herself in the mirror, which honestly was the best part of an otherwise long day.'
    const slots = selectFollowUps(text, ctx(), safety(0))
    expect(slots.some((s) => s.archetype === 'anchor')).toBe(false)
  })
})

// ── Archetype: you ───────────────────────────────────────────────────────

describe('you archetype', () => {
  it('fires when the transcript is all events and no first-person affect', () => {
    const slots = selectFollowUps(GENERIC_LONG, ctx(), safety(0))
    expect(slots.some((s) => s.archetype === 'you')).toBe(true)
  })

  it('does not fire when a first-person pronoun and an affect word both appear', () => {
    const text =
      'It was a long day and by the end of it I felt so exhausted I could barely stand up ' +
      'straight, but I also felt proud of how we both got through it together somehow.'
    const slots = selectFollowUps(text, ctx(), safety(0))
    expect(slots.some((s) => s.archetype === 'you')).toBe(false)
  })

  it('regression: the common word "is" must not be misread as the pronoun "I"', () => {
    // No first-person pronoun anywhere in this transcript (no "I", "my", "me").
    // It is stuffed with the word "is" and an affect word, which is exactly the
    // combination that a naive `\bi(?:e?s)?\b` pattern would misfire on.
    const text =
      'The nursery is finally quiet and the whole house is calm and everyone is exhausted ' +
      'from the day, and the crib is warm, and honestly the whole evening is a small relief.'
    const slots = selectFollowUps(text, ctx(), safety(0))
    expect(slots.some((s) => s.archetype === 'you')).toBe(true)
  })
})

// ── Archetype: thread ────────────────────────────────────────────────────

describe('thread archetype', () => {
  it('fires when an open thread exists and is not already mentioned tonight', () => {
    const threadCtx = ctx({
      openThreads: [{ entryId: 'entry-1', text: 'the new tooth coming in', entryDate: '2026-08-01' }],
    })
    const slots = selectFollowUps(GENERIC_LONG, threadCtx, safety(0))
    const thread = slots.find((s) => s.archetype === 'thread')
    expect(thread).toBeDefined()
    expect(thread?.sourceRef).toBe('entry-1')
  })

  it('does not fire when the thread topic is already mentioned tonight', () => {
    const threadCtx = ctx({
      openThreads: [{ entryId: 'entry-1', text: 'pulling up on the couch', entryDate: '2026-08-01' }],
    })
    const text =
      'She spent the whole evening pulling up on the couch over and over again and would not ' +
      'stop even when we tried to distract her with dinner, which went on for quite a while.'
    const slots = selectFollowUps(text, threadCtx, safety(0))
    expect(slots.some((s) => s.archetype === 'thread')).toBe(false)
  })

  it('picks the most stale (earliest entryDate) candidate thread as a stable tie-break', () => {
    const threadCtx = ctx({
      openThreads: [
        { entryId: 'newer', text: 'the crawling phase', entryDate: '2026-08-20' },
        { entryId: 'older', text: 'the daycare transition', entryDate: '2026-08-01' },
      ],
    })
    const slots = selectFollowUps(GENERIC_LONG, threadCtx, safety(0))
    const thread = slots.find((s) => s.archetype === 'thread')
    expect(thread?.sourceRef).toBe('older')
  })
})

describe('empty openThreads never invents a thread question', () => {
  it('produces no thread slot when openThreads is an empty array', () => {
    const slots = selectFollowUps(GENERIC_LONG, ctx({ openThreads: [] }), safety(0))
    expect(slots.some((s) => s.archetype === 'thread')).toBe(false)
  })

  it('produces no thread slot when openThreads is missing from the context object', () => {
    const partialCtx = { ...ctx() } as LetterPromptContext
    // @ts-expect-error deliberately simulating a malformed/partial context at a runtime boundary
    delete partialCtx.openThreads
    const slots = selectFollowUps(GENERIC_LONG, partialCtx, safety(0))
    expect(slots.some((s) => s.archetype === 'thread')).toBe(false)
    for (const slot of slots) {
      if (slot.archetype === 'thread') expect(slot.sourceRef).not.toBeNull()
    }
  })

  it('never returns a thread slot whose sourceRef is not a real row id from openThreads', () => {
    const threads = [{ entryId: 'real-id', text: 'the sleep regression', entryDate: '2026-08-01' }]
    const slots = selectFollowUps(GENERIC_LONG, ctx({ openThreads: threads }), safety(0))
    const thread = slots.find((s) => s.archetype === 'thread')
    if (thread) expect(thread.sourceRef).toBe('real-id')
  })
})

// ── Safety suppression ──────────────────────────────────────────────────

describe('safety suppression', () => {
  it('tier 1 returns only the containing slot, overriding every archetype', () => {
    const slots = selectFollowUps(GENERIC_LONG, ctx(), safety(1))
    expect(slots).toEqual([{ archetype: 'containing', templateKey: 'containing.private_layer', sourceRef: null }])
  })

  it('tier 2 returns only the containing slot, overriding every archetype', () => {
    const slots = selectFollowUps(GENERIC_LONG, ctx(), safety(2))
    expect(slots).toEqual([{ archetype: 'containing', templateKey: 'containing.private_layer', sourceRef: null }])
  })

  it('tier 1 fires the containing slot even on a very short transcript (checked before the word-count gate)', () => {
    const slots = selectFollowUps('I do not know', ctx(), safety(1))
    expect(slots).toEqual([{ archetype: 'containing', templateKey: 'containing.private_layer', sourceRef: null }])
  })

  it('tier 1 fires the containing slot even on an empty transcript', () => {
    const slots = selectFollowUps('', ctx(), safety(1))
    expect(slots).toEqual([{ archetype: 'containing', templateKey: 'containing.private_layer', sourceRef: null }])
  })

  it('tier 0 never returns a containing slot on its own', () => {
    const slots = selectFollowUps(GENERIC_LONG, ctx(), safety(0))
    expect(slots.some((s) => s.archetype === 'containing')).toBe(false)
  })
})

// ── Short transcripts / low-material nights ─────────────────────────────

describe('short transcripts produce zero follow-ups', () => {
  it('returns [] for a transcript under the minimum word count', () => {
    const words24 = Array(24).fill('word').join(' ')
    expect(selectFollowUps(words24, ctx(), safety(0))).toEqual([])
  })

  it('allows follow-ups once the transcript reaches the minimum word count', () => {
    const words25 = Array(25).fill('word').join(' ')
    expect(selectFollowUps(words25, ctx(), safety(0)).length).toBeGreaterThan(0)
  })

  it('returns [] for an empty transcript at tier 0', () => {
    expect(selectFollowUps('', ctx(), safety(0))).toEqual([])
  })

  it('returns [] for a padded "nothing much" entry even if it clears the word-count floor', () => {
    const text =
      'Not much today, just the usual routine and nothing really worth writing down at all, ' +
      'same as always honestly, nothing much to report tonight really, truly nothing at all.'
    expect(selectFollowUps(text, ctx(), safety(0))).toEqual([])
  })
})

// ── Hard cap of 2 ─────────────────────────────────────────────────────────

describe('hard cap of 2 follow-ups', () => {
  it('never returns more than 2 slots even when thread, anchor, and you would all fire', () => {
    const threadCtx = ctx({
      openThreads: [{ entryId: 'entry-1', text: 'the new tooth coming in', entryDate: '2026-08-01' }],
    })
    const slots = selectFollowUps(GENERIC_LONG, threadCtx, safety(0))
    expect(slots.length).toBeLessThanOrEqual(2)
  })

  it('prioritizes thread over anchor over you when capped', () => {
    const threadCtx = ctx({
      openThreads: [{ entryId: 'entry-1', text: 'the new tooth coming in', entryDate: '2026-08-01' }],
    })
    const slots = selectFollowUps(GENERIC_LONG, threadCtx, safety(0))
    expect(slots.map((s) => s.archetype)).toEqual(['thread', 'anchor'])
  })

  it('caps at 2 even for a longer real-world entry that fires all three archetypes', () => {
    const threadCtx = ctx({
      openThreads: [{ entryId: 'entry-9', text: 'starting to say a few words', entryDate: '2026-07-15' }],
    })
    const text =
      'Today was a full day and a lot happened between the morning and bedtime routine, and ' +
      'the whole thing felt like it took forever to get through from start to finish honestly.'
    const slots = selectFollowUps(text, threadCtx, safety(0))
    expect(slots.length).toBe(2)
  })
})

// ── Determinism ───────────────────────────────────────────────────────────

describe('determinism', () => {
  it('returns the same result for the same inputs called repeatedly', () => {
    const threadCtx = ctx({
      openThreads: [{ entryId: 'entry-1', text: 'the new tooth coming in', entryDate: '2026-08-01' }],
    })
    const first = selectFollowUps(GENERIC_LONG, threadCtx, safety(0))
    const second = selectFollowUps(GENERIC_LONG, threadCtx, safety(0))
    expect(second).toEqual(first)
  })
})
