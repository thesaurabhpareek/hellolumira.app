import { describe, it, expect, vi } from 'vitest'
import type { Anthropic } from '@anthropic-ai/sdk'
import {
  LETTER_COMPOSITION_EXTENSION,
  LETTER_MAX_WORDS,
  MAX_SOURCE_LOGS,
  MILESTONE_WINDOW_DAYS,
  NoSourceLogsError,
  buildLetterRequest,
  calendarMonthRange,
  composeLetter,
  enforceLetterLength,
  isoWeekRange,
  parseLetterResponse,
  renderLetterUserTurn,
  selectSourceLogs,
  usableSources,
} from '@/lib/letters/compose-letter'
import { COMPOSITION_SYSTEM_PROMPT } from '@/lib/letters/compose-shaped'
import type {
  EntryKind,
  JournalEntryRow,
  LetterCompositionInput,
  VoiceProfile,
} from '@/types/letters'

/* ------------------------------------------------------------------ fixtures */

function log(
  id: string,
  entry_date: string,
  overrides: Partial<JournalEntryRow> = {},
): JournalEntryRow {
  return {
    id,
    profile_id: 'p1',
    baby_id: 'b1',
    entry_kind: 'log' as EntryKind,
    entry_date,
    source_entry_ids: [],
    letter_span: null,
    body: `body for ${id}`,
    raw_transcript: `transcript for ${id}`,
    composed_body: null,
    edited_body: null,
    compose_mode: 'keep_words',
    capture_mode: 'spoken',
    visibility: 'private',
    child_safe: false,
    voice_profile_version: 1,
    slop_audit: null,
    followups: [],
    word_count: 3,
    duration_seconds: 40,
    covers_from: null,
    covers_to: null,
    composed_at: null,
    created_at: `${entry_date}T21:00:00.000Z`,
    updated_at: `${entry_date}T21:00:00.000Z`,
    ...overrides,
  }
}

const voiceProfile: VoiceProfile = {
  id: 'vp1',
  profile_id: 'p1',
  baby_id: 'b1',
  endearments: ['beta', 'bug'],
  partner_name_for_child: 'Mumma',
  self_name_for_child: 'Papa',
  mean_sentence_len: 12,
  sentence_len_stdev: 7,
  contraction_rate: 0.6,
  question_rate: 0.1,
  formality: 2,
  humor_mode: 'dry',
  profanity_ceiling: 1,
  code_switch_terms: [{ term: 'nani', gloss: 'grandmother' }],
  register_notes: 'talks fast, trails off',
  banned_words: ['journey'],
  preferred_words: ['tiny'],
  onboarding_complete: true,
  version: 3,
}

function input(overrides: Partial<LetterCompositionInput> = {}): LetterCompositionInput {
  return {
    span: 'week',
    sources: [
      { id: 'a', entry_date: '2026-03-02', body: 'She grabbed the spoon.', raw_transcript: null },
      { id: 'b', entry_date: '2026-03-05', body: 'You slept through.', raw_transcript: null },
    ],
    voiceProfile,
    babyName: 'Meera',
    ageInMonths: 11,
    ...overrides,
  }
}

/* --------------------------------------------------------- date range helpers */

describe('isoWeekRange / calendarMonthRange', () => {
  it('runs Monday to Sunday for a midweek anchor', () => {
    expect(isoWeekRange('2026-03-04')).toEqual({ from: '2026-03-02', to: '2026-03-08' })
  })

  it('treats Sunday as the END of its week, not the start', () => {
    expect(isoWeekRange('2026-03-08')).toEqual({ from: '2026-03-02', to: '2026-03-08' })
    expect(isoWeekRange('2026-03-01')).toEqual({ from: '2026-02-23', to: '2026-03-01' })
  })

  it('spans a month boundary without clipping', () => {
    expect(isoWeekRange('2026-04-01')).toEqual({ from: '2026-03-30', to: '2026-04-05' })
  })

  it('returns whole calendar months, leap February included', () => {
    expect(calendarMonthRange('2026-03-17')).toEqual({ from: '2026-03-01', to: '2026-03-31' })
    expect(calendarMonthRange('2024-02-10')).toEqual({ from: '2024-02-01', to: '2024-02-29' })
    expect(calendarMonthRange('2026-02-10')).toEqual({ from: '2026-02-01', to: '2026-02-28' })
  })

  it('returns null on malformed or impossible dates', () => {
    expect(isoWeekRange('not-a-date')).toBeNull()
    expect(isoWeekRange('2026-13-01')).toBeNull()
    expect(calendarMonthRange('2026-02-30')).toBeNull()
    expect(calendarMonthRange('')).toBeNull()
  })
})

/* ---------------------------------------------------------- selectSourceLogs */

describe('selectSourceLogs — span windows', () => {
  const week = [
    log('sun-prev', '2026-03-01'),
    log('mon', '2026-03-02'),
    log('wed', '2026-03-04'),
    log('sun', '2026-03-08'),
    log('mon-next', '2026-03-09'),
  ]

  it('week: Monday and Sunday are inside, the days either side are not', () => {
    const picked = selectSourceLogs(week, 'week', '2026-03-04')
    expect(picked.map((r) => r.id)).toEqual(['mon', 'wed', 'sun'])
  })

  it('week: anchoring on the Sunday selects the same week', () => {
    expect(selectSourceLogs(week, 'week', '2026-03-08').map((r) => r.id)).toEqual([
      'mon',
      'wed',
      'sun',
    ])
  })

  it('month: first and last day are inside, adjacent months are not', () => {
    const logs = [
      log('feb-last', '2026-02-28'),
      log('mar-first', '2026-03-01'),
      log('mar-mid', '2026-03-15'),
      log('mar-last', '2026-03-31'),
      log('apr-first', '2026-04-01'),
    ]
    expect(selectSourceLogs(logs, 'month', '2026-03-15').map((r) => r.id)).toEqual([
      'mar-first',
      'mar-mid',
      'mar-last',
    ])
  })

  it(`milestone: takes +/- ${MILESTONE_WINDOW_DAYS} days around the anchor, inclusive`, () => {
    const logs = [
      log('too-early', '2026-03-11'),
      log('edge-low', '2026-03-12'),
      log('anchor', '2026-03-15'),
      log('edge-high', '2026-03-18'),
      log('too-late', '2026-03-19'),
    ]
    expect(selectSourceLogs(logs, 'milestone', '2026-03-15').map((r) => r.id)).toEqual([
      'edge-low',
      'anchor',
      'edge-high',
    ])
  })

  it('single: returns exactly one, the log on the anchor date', () => {
    const picked = selectSourceLogs(week, 'single', '2026-03-04')
    expect(picked).toHaveLength(1)
    expect(picked[0].id).toBe('wed')
  })

  it('single: falls back to the nearest log when the anchor has none', () => {
    const picked = selectSourceLogs(week, 'single', '2026-03-05')
    expect(picked).toHaveLength(1)
    expect(picked[0].id).toBe('wed')
  })

  it('custom: takes the pool as given, since the range lives in the caller', () => {
    expect(selectSourceLogs(week, 'custom', '2026-03-04')).toHaveLength(week.length)
  })

  it('is deterministic and chronological regardless of input order', () => {
    const shuffled = [week[3], week[1], week[2], week[0], week[4]]
    expect(selectSourceLogs(shuffled, 'week', '2026-03-04').map((r) => r.id)).toEqual([
      'mon',
      'wed',
      'sun',
    ])
  })
})

describe('selectSourceLogs — never returns zero sources', () => {
  const logs = [log('old', '2026-01-05'), log('recent', '2026-02-20')]

  it('falls back to the nearest log when the week window is empty', () => {
    const picked = selectSourceLogs(logs, 'week', '2026-03-04')
    expect(picked).toHaveLength(1)
    expect(picked[0].id).toBe('recent')
  })

  it('falls back to the nearest log when the month window is empty', () => {
    const picked = selectSourceLogs(logs, 'month', '2025-12-15')
    expect(picked).toHaveLength(1)
    expect(picked[0].id).toBe('old')
  })

  it('falls back to the nearest log when the milestone window is empty', () => {
    expect(selectSourceLogs(logs, 'milestone', '2026-02-01')[0].id).toBe('recent')
  })

  it('falls back to the most recent log when the anchor date is malformed', () => {
    expect(selectSourceLogs(logs, 'week', 'garbage')[0].id).toBe('recent')
    expect(selectSourceLogs(logs, 'single', '')[0].id).toBe('recent')
  })

  it('every span returns at least one source for a single-log pool', () => {
    const one = [log('only', '2026-03-04')]
    for (const span of ['single', 'week', 'month', 'milestone', 'custom'] as const) {
      expect(selectSourceLogs(one, span, '2027-09-09')).toHaveLength(1)
    }
  })

  it('throws rather than composing a letter with no provenance', () => {
    expect(() => selectSourceLogs([], 'week', '2026-03-04')).toThrow(NoSourceLogsError)
  })
})

describe('selectSourceLogs — eligibility', () => {
  it('ignores letters and ai_summary rows', () => {
    const mixed = [
      log('letter', '2026-03-03', { entry_kind: 'letter', source_entry_ids: ['x'], letter_span: 'week' }),
      log('summary', '2026-03-04', { entry_kind: 'ai_summary' }),
      log('real', '2026-03-05'),
    ]
    expect(selectSourceLogs(mixed, 'week', '2026-03-04').map((r) => r.id)).toEqual(['real'])
  })

  it('throws when the pool contains no logs at all', () => {
    const none = [log('letter', '2026-03-03', { entry_kind: 'letter' })]
    expect(() => selectSourceLogs(none, 'week', '2026-03-04')).toThrow(NoSourceLogsError)
  })

  it('drops rows with unparseable entry_date instead of trusting them', () => {
    const logs = [log('bad', '03/04/2026'), log('good', '2026-03-04')]
    expect(selectSourceLogs(logs, 'week', '2026-03-04').map((r) => r.id)).toEqual(['good'])
  })

  it(`caps a runaway custom span at ${MAX_SOURCE_LOGS}, keeping the most recent`, () => {
    const many = Array.from({ length: MAX_SOURCE_LOGS + 10 }, (_, i) =>
      log(`d${String(i).padStart(3, '0')}`, `2026-0${i < 25 ? '1' : '2'}-${String((i % 25) + 1).padStart(2, '0')}`),
    )
    const picked = selectSourceLogs(many, 'custom', '2026-02-10')
    expect(picked).toHaveLength(MAX_SOURCE_LOGS)
    expect(picked[picked.length - 1].entry_date >= picked[0].entry_date).toBe(true)
  })
})

/* --------------------------------------------------------- buildLetterRequest */

describe('buildLetterRequest', () => {
  it('reuses the PRD 17.4 preamble verbatim as the first, cached block', () => {
    const req = buildLetterRequest(input())
    expect(req.system[0].text).toBe(COMPOSITION_SYSTEM_PROMPT)
    expect(req.system[0].cache_control).toEqual({ type: 'ephemeral' })
  })

  it('adds the multi-source extension as a second cached block', () => {
    const req = buildLetterRequest(input())
    expect(req.system[1].text).toBe(LETTER_COMPOSITION_EXTENSION)
    expect(req.system[1].cache_control).toEqual({ type: 'ephemeral' })
  })

  it('appends the voice profile after both static blocks, and omits it when null', () => {
    expect(buildLetterRequest(input()).system).toHaveLength(3)
    expect(buildLetterRequest(input()).system[2].text).toContain('HIS VOICE PROFILE')
    expect(buildLetterRequest(input({ voiceProfile: null })).system).toHaveLength(2)
  })

  it('prefills the assistant turn to force second person', () => {
    const req = buildLetterRequest(input())
    const last = req.messages[req.messages.length - 1]
    expect(last.role).toBe('assistant')
    expect(last.content).toBe('You')
  })

  it('puts every source log, dated, in the user turn and nowhere else', () => {
    const req = buildLetterRequest(input())
    const user = String(req.messages[0].content)
    expect(user).toContain('2026-03-02')
    expect(user).toContain('She grabbed the spoon.')
    expect(user).toContain('2026-03-05')
    expect(user).toContain('You slept through.')
    expect(user).toContain('LOG 1 of 2')
    expect(req.system.map((b) => b.text).join('\n')).not.toContain('She grabbed the spoon.')
  })

  it('forbids invented connective tissue in the extension', () => {
    expect(LETTER_COMPOSITION_EXTENSION).toContain('Do not invent connective tissue')
    expect(LETTER_COMPOSITION_EXTENSION).toContain('Do not build an arc')
    expect(LETTER_COMPOSITION_EXTENSION).toContain('Only what is in the logs')
    expect(LETTER_COMPOSITION_EXTENSION).toContain('second\nperson')
    expect(LETTER_COMPOSITION_EXTENSION).toContain(String(LETTER_MAX_WORDS))
    expect(LETTER_COMPOSITION_EXTENSION).not.toContain('—')
  })

  it('carries model, temperature and a bounded max_tokens', () => {
    const req = buildLetterRequest(input())
    expect(req.model).toBe('claude-sonnet-4-6')
    expect(req.temperature).toBe(1.0)
    expect(req.max_tokens).toBeGreaterThan(0)
  })

  it('falls back to raw_transcript when a log body is empty', () => {
    const req = buildLetterRequest(
      input({ sources: [{ id: 'a', entry_date: '2026-03-02', body: '   ', raw_transcript: 'she said nani' }] }),
    )
    expect(String(req.messages[0].content)).toContain('she said nani')
  })

  it('throws when every source is empty rather than prompting for invention', () => {
    expect(() =>
      buildLetterRequest(
        input({ sources: [{ id: 'a', entry_date: '2026-03-02', body: '', raw_transcript: null }] }),
      ),
    ).toThrow(NoSourceLogsError)
  })

  it('frames a single-source letter differently from a week', () => {
    const single = renderLetterUserTurn(
      input({ span: 'single', sources: [{ id: 'a', entry_date: '2026-03-02', body: 'One night.', raw_transcript: null }] }),
    )
    expect(single).toContain('built from one log')
    expect(renderLetterUserTurn(input({ span: 'month' }))).toContain('in one month')
    expect(renderLetterUserTurn(input({ span: 'week' }))).toContain('Days he did not write are absent')
  })

  it('usableSources drops empty logs so citations match what the model saw', () => {
    const picked = usableSources([
      { id: 'a', entry_date: '2026-03-02', body: 'real', raw_transcript: null },
      { id: 'b', entry_date: '2026-03-03', body: '', raw_transcript: '  ' },
    ])
    expect(picked.map((s) => s.id)).toEqual(['a'])
  })
})

/* -------------------------------------------------------- parseLetterResponse */

const FLAG_SHAPES = [
  '[[LUMIRA_FLAG: self_harm]]',
  '[[lumira_flag: self_harm]]',
  '[[LUMIRA-FLAG: self_harm]]',
  '[[LUMIRA FLAG: self_harm]]',
  '[[LUMIRA_FLAG: self_harm',
  'LUMIRA_FLAG: self_harm',
  '[[LUMIRA_FLAG:self_harm]]',
  '[[ LUMIRA_FLAG : self harm ]]',
]

describe('parseLetterResponse — the flag must never reach the body', () => {
  it.each(FLAG_SHAPES)('strips %s and never leaks the marker', (shape) => {
    const { body, flag } = parseLetterResponse(`You reached for the spoon today.\n${shape}`)
    expect(body).toBe('You reached for the spoon today.')
    expect(body).not.toMatch(/LUMIRA/i)
    expect(flag).toBe('self_harm')
  })

  it('strips repeated flag lines, keeping the first recognised category', () => {
    const raw = [
      'You slept badly.',
      '[[LUMIRA_FLAG: domestic_violence]]',
      'You woke at four.',
      '[[LUMIRA_FLAG: self_harm]]',
      '[[LUMIRA_FLAG: infant_safety]]',
    ].join('\n')
    const { body, flag } = parseLetterResponse(raw)
    expect(body).toBe('You slept badly.\nYou woke at four.')
    expect(body).not.toMatch(/LUMIRA/i)
    expect(flag).toBe('domestic_violence')
  })

  it('strips an inline flag without eating the sentence around it', () => {
    const { body, flag } = parseLetterResponse('You laughed. [[LUMIRA_FLAG: harm_to_child]] Twice.')
    expect(body).toContain('You laughed.')
    expect(body).toContain('Twice.')
    expect(body).not.toMatch(/LUMIRA/i)
    expect(flag).toBe('harm_to_child')
  })

  it('strips an unrecognised category but reports no flag', () => {
    const { body, flag } = parseLetterResponse('You held the cup.\n[[LUMIRA_FLAG: nonsense_category]]')
    expect(body).toBe('You held the cup.')
    expect(body).not.toMatch(/LUMIRA/i)
    expect(flag).toBeNull()
  })

  it('leaves clean output untouched and reports no flag', () => {
    const raw = 'You grabbed the spoon.\n\nYou would not let go.'
    expect(parseLetterResponse(raw)).toEqual({ body: raw, flag: null })
  })

  it('handles empty, whitespace and non-string input without throwing', () => {
    expect(parseLetterResponse('')).toEqual({ body: '', flag: null })
    expect(parseLetterResponse('   \n\n ')).toEqual({ body: '', flag: null })
    expect(parseLetterResponse(undefined as unknown as string)).toEqual({ body: '', flag: null })
  })

  it('leaves nothing but a dropped line when the flag is the only content', () => {
    const { body, flag } = parseLetterResponse('[[LUMIRA_FLAG: infant_safety]]')
    expect(body).toBe('')
    expect(flag).toBe('infant_safety')
  })
})

/* ------------------------------------------------------------ length capping */

function sentences(count: number, wordsEach: number): string {
  return Array.from({ length: count }, (_, i) =>
    [`Sentence${i}`, ...Array.from({ length: wordsEach - 1 }, () => 'word')].join(' ') + '.',
  ).join(' ')
}

const wordCount = (s: string): number => (s.trim() ? s.trim().split(/\s+/).length : 0)

describe('enforceLetterLength — PRD 17.5 ceiling', () => {
  it('leaves a letter under the cap alone', () => {
    const text = sentences(10, 10)
    expect(enforceLetterLength(text)).toBe(text)
  })

  it('truncates a long letter to at most the cap', () => {
    const capped = enforceLetterLength(sentences(60, 10))
    expect(wordCount(capped)).toBeLessThanOrEqual(LETTER_MAX_WORDS)
    expect(wordCount(capped)).toBeGreaterThan(LETTER_MAX_WORDS - 20)
  })

  it('always ends on a sentence boundary, never mid-clause', () => {
    const capped = enforceLetterLength(sentences(60, 7))
    expect(capped.endsWith('.')).toBe(true)
  })

  it('keeps a single over-long sentence whole rather than mangling it', () => {
    const runOn = sentences(1, 400)
    expect(enforceLetterLength(runOn)).toBe(runOn.trim())
  })

  it('honours an explicit lower cap', () => {
    expect(wordCount(enforceLetterLength(sentences(20, 5), 20))).toBeLessThanOrEqual(20)
  })

  it('handles empty input', () => {
    expect(enforceLetterLength('')).toBe('')
    expect(enforceLetterLength('   ')).toBe('')
  })

  it('is applied by parseLetterResponse, after the flag is removed', () => {
    const raw = `${sentences(60, 10)}\n[[LUMIRA_FLAG: distress]]`
    const { body, flag } = parseLetterResponse(raw)
    expect(wordCount(body)).toBeLessThanOrEqual(LETTER_MAX_WORDS)
    expect(body).not.toMatch(/LUMIRA/i)
    expect(flag).toBe('distress')
  })
})

/* -------------------------------------------------------------- composeLetter */

function stubClient(text: string, extra: Partial<Anthropic.Message> = {}) {
  const create = vi.fn().mockResolvedValue({
    content: [{ type: 'text', text }],
    stop_reason: 'end_turn',
    usage: {
      input_tokens: 900,
      output_tokens: 260,
      cache_read_input_tokens: 800,
      cache_creation_input_tokens: 0,
    },
    ...extra,
  } as unknown as Anthropic.Message)
  return { client: { messages: { create } }, create }
}

describe('composeLetter — injected client only', () => {
  it('cites the source ids so the reading view can say "built from N entries"', async () => {
    const { client } = stubClient(' reached for the spoon.')
    const result = await composeLetter(client, input())
    expect(result.sourceEntryIds).toEqual(['a', 'b'])
    expect(result.span).toBe('week')
    expect(result.body).toBe('You reached for the spoon.')
    expect(result.wordCount).toBe(5)
    expect(result.usage?.cache_read_input_tokens).toBe(800)
  })

  it('cites only sources that actually contributed text', async () => {
    const { client } = stubClient(' slept.')
    const result = await composeLetter(
      client,
      input({
        sources: [
          { id: 'a', entry_date: '2026-03-02', body: 'real', raw_transcript: null },
          { id: 'empty', entry_date: '2026-03-03', body: '', raw_transcript: null },
        ],
      }),
    )
    expect(result.sourceEntryIds).toEqual(['a'])
  })

  it('sends the request buildLetterRequest produced', async () => {
    const { client, create } = stubClient(' slept.')
    await composeLetter(client, input())
    expect(create).toHaveBeenCalledTimes(1)
    expect(create.mock.calls[0][0].system[0].text).toBe(COMPOSITION_SYSTEM_PROMPT)
  })

  it('strips the flag before the body is ever returned', async () => {
    const { client } = stubClient(' cried.\n[[LUMIRA_FLAG: infant_safety]]')
    const result = await composeLetter(client, input())
    expect(result.body).toBe('You cried.')
    expect(result.body).not.toMatch(/LUMIRA/i)
    expect(result.flag).toBe('infant_safety')
  })

  it('caps a runaway generation', async () => {
    const { client } = stubClient(` ${sentences(80, 10)}`)
    const result = await composeLetter(client, input())
    expect(result.wordCount).toBeLessThanOrEqual(LETTER_MAX_WORDS)
  })

  it('refuses to compose with no usable sources', async () => {
    const { client, create } = stubClient(' x.')
    await expect(
      composeLetter(client, input({ sources: [{ id: 'a', entry_date: '2026-03-02', body: '', raw_transcript: null }] })),
    ).rejects.toBeInstanceOf(NoSourceLogsError)
    expect(create).not.toHaveBeenCalled()
  })

  it('throws on a refusal and on empty content', async () => {
    const refused = stubClient('', { stop_reason: 'refusal' as Anthropic.StopReason })
    await expect(composeLetter(refused.client, input())).rejects.toThrow(/refused/)
    const empty = stubClient('   ')
    await expect(composeLetter(empty.client, input())).rejects.toThrow(/Empty response/)
  })

  it('passes a caller signal straight through', async () => {
    const { client, create } = stubClient(' slept.')
    const controller = new AbortController()
    await composeLetter(client, input(), { signal: controller.signal })
    expect(create.mock.calls[0][1].signal).toBe(controller.signal)
  })

  it('supplies its own abort signal when the caller gives none', async () => {
    const { client, create } = stubClient(' slept.')
    await composeLetter(client, input())
    expect(create.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal)
  })
})
