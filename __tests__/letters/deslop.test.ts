import { describe, it, expect } from 'vitest'
import { deslop, splitSentences } from '@/lib/letters/deslop'

// ── Character substitution ─────────────────────────────────────────────

describe('character substitution', () => {
  it('splits into two sentences when an em dash sits in a sentence-splitting position (next word capitalized)', () => {
    const r = deslop('It was calm—Then chaos hit.')
    expect(r.clean).toBe('It was calm. Then chaos hit.')
    expect(r.clean).not.toContain('—')
  })

  it('converts an em dash in a clause-continuing position (next word lowercase) to a comma', () => {
    const r = deslop('It was calm—then chaos hit for a while.')
    expect(r.clean).toBe('It was calm, then chaos hit for a while.')
    expect(r.clean).not.toContain('—')
  })

  it('does not leave a dangling artifact when an em dash trails off at the end of the entry', () => {
    const r = deslop("She just wouldn't settle—")
    expect(r.clean).toBe("She just wouldn't settle")
    expect(r.clean.endsWith(',')).toBe(false)
    expect(r.clean).not.toContain('—')
  })

  it('converts an en dash to a hyphen', () => {
    const r = deslop('Ages 6–12 months is the window.')
    expect(r.clean).toBe('Ages 6-12 months is the window.')
    expect(r.clean).not.toContain('–')
  })

  it('normalizes both curly single-quote pairs to straight apostrophes', () => {
    const r = deslop("She said ‘hi’ and then ‘bye’ in the same breath tonight.")
    expect(r.clean).toBe("She said 'hi' and then 'bye' in the same breath tonight.")
    expect(r.clean).not.toMatch(/[‘’]/)
  })

  it('normalizes both curly double-quote pairs to straight quotes', () => {
    const r = deslop('She looked at me and said “more” very clearly tonight.')
    expect(r.clean).toBe('She looked at me and said "more" very clearly tonight.')
    expect(r.clean).not.toMatch(/[“”]/)
  })

  it('normalizes the ellipsis character to three periods', () => {
    const r = deslop('She just stood there… and then laughed.')
    expect(r.clean).toBe('She just stood there... and then laughed.')
    expect(r.clean).not.toContain('…')
  })

  it('normalizes a non-breaking space to a regular space', () => {
    const r = deslop('She ate well tonight and slept fine.')
    expect(r.clean).not.toContain(' ')
    expect(r.clean).toContain('She ate well tonight')
  })

  it('normalizes a minus sign to a hyphen', () => {
    const r = deslop('It was about −2 degrees on the walk.')
    expect(r.clean).toBe('It was about -2 degrees on the walk.')
    expect(r.clean).not.toContain('−')
  })
})

// ── Tidy pass leaves no artifacts ───────────────────────────────────────

describe('tidy pass artifact freedom', () => {
  it('never leaves ", ." from a comma bumping into a period', () => {
    const r = deslop('She was tired, . and ready for bed.')
    expect(r.clean).not.toContain(', .')
  })

  it('collapses double commas produced by adjacent substitutions', () => {
    const r = deslop('She was tired,, and cranky tonight.')
    expect(r.clean).not.toContain(',,')
  })

  it('removes space before punctuation', () => {
    const r = deslop('She was tired , and cranky tonight .')
    expect(r.clean).not.toMatch(/ [,.]/)
  })

  it('does not leave a dangling trailing comma when the raw entry itself ends in one', () => {
    const r = deslop('She was so hungry,')
    expect(r.clean).toBe('She was so hungry')
  })

  it('does not leave a dangling trailing semicolon', () => {
    const r = deslop('She finally settled;')
    expect(r.clean).toBe('She finally settled')
  })

  it('preserves an intentional paragraph break (double newline) while stripping a dangling comma before it', () => {
    const r = deslop('First paragraph ends oddly,\n\nSecond paragraph continues on its own.')
    expect(r.clean).toBe('First paragraph ends oddly\n\nSecond paragraph continues on its own.')
  })
})

// ── splitSentences ───────────────────────────────────────────────────────

describe('splitSentences', () => {
  it('does not split on "Dr." mid-sentence', () => {
    expect(splitSentences("Dr. Patel said she's growing well.")).toEqual([
      "Dr. Patel said she's growing well.",
    ])
  })

  it('does not split on "8 a.m."', () => {
    expect(splitSentences('She woke at 8 a.m. and ate right away.')).toEqual([
      'She woke at 8 a.m. and ate right away.',
    ])
  })

  it('does not split a decimal like "4.5 oz"', () => {
    expect(splitSentences('She drank 4.5 oz before bed.')).toEqual([
      'She drank 4.5 oz before bed.',
    ])
  })

  it('does not split on "U.S."', () => {
    expect(splitSentences('We are visiting the U.S. next month.')).toEqual([
      'We are visiting the U.S. next month.',
    ])
  })

  it('does not split on a single capital initial like "J. Smith"', () => {
    expect(splitSentences('J. Smith stopped by today.')).toEqual(['J. Smith stopped by today.'])
  })

  it('treats a run of ellipsis dots as one terminator, producing two sentences', () => {
    expect(splitSentences('She just stared at me... then she smiled.')).toEqual([
      'She just stared at me...',
      'then she smiled.',
    ])
  })

  it('treats "?!" as one terminator run, producing two sentences', () => {
    expect(splitSentences('Is she okay?! I panicked for a second.')).toEqual([
      'Is she okay?!',
      'I panicked for a second.',
    ])
  })

  it('returns the whole text as one sentence when there is no terminal punctuation', () => {
    expect(splitSentences('She slept through the whole night for once')).toEqual([
      'She slept through the whole night for once',
    ])
  })

  it('returns an empty array for an empty string', () => {
    expect(splitSentences('')).toEqual([])
  })

  it('returns an empty array for a whitespace-only string', () => {
    expect(splitSentences('   \n\t  ')).toEqual([])
  })
})

// ── False-positive protection ───────────────────────────────────────────

describe('false-positive protection: rule-of-three and antithesis used once', () => {
  it('does not flag a naturally long final sentence that happens to contain three commas', () => {
    const r = deslop(
      'It was a long evening. By the time we got her down, changed the sheets that had ' +
        'somehow gotten soaked through, and finally sat down ourselves, it was almost midnight.'
    )
    expect(r.violations).not.toContain('tricolon_closer')
  })

  it('does not flag a single, well-written "not X, but Y" contrast', () => {
    const r = deslop(
      "It wasn't a good night, but we made it through okay. She slept eventually and so did " +
        "we, eventually settling into a rhythm that felt almost normal by 2am, a small mercy " +
        "after the week we'd had."
    )
    expect(r.violations).not.toContain('antithesis_x2')
    expect(r.violations.some((v) => v.startsWith('antithesis'))).toBe(false)
  })

  it('does not flag a single genuine rule-of-three used mid-entry, not as the closer', () => {
    const r = deslop(
      'She ate, she played, she napped, all before nine this morning. Then the whole afternoon ' +
        'fell apart in ways I did not see coming at all, which is just how these days go sometimes.'
    )
    expect(r.violations).not.toContain('tricolon_closer')
  })
})

// ── Variance rules and VARIANCE_MIN_SENTENCES ───────────────────────────

describe('variance rules respect VARIANCE_MIN_SENTENCES', () => {
  it('lets a short, uniform two-sentence entry pass untouched (PRD 9.4: short is a goal)', () => {
    const r = deslop('Rough night. She finally slept.')
    expect(r.passed).toBe(true)
    expect(r.violations).toEqual([])
  })

  it('does not apply uniform_sentence_length below the minimum sentence count', () => {
    const r = deslop('She ate well. She slept well. She played well.')
    expect(r.violations).not.toContain('uniform_sentence_length')
    expect(r.violations).not.toContain('no_short_sentence')
    expect(r.violations).not.toContain('no_long_sentence')
  })

  it('can apply uniform_sentence_length once at/above the minimum sentence count', () => {
    const r = deslop(
      'She ate her food today. She slept in her crib. She played on the mat. She smiled at us.'
    )
    expect(r.violations).toContain('uniform_sentence_length')
  })
})

// ── Structural checks ────────────────────────────────────────────────────

describe('structural checks', () => {
  it('flags a short tricolon closer (three comma-separated beats, <= 20 words)', () => {
    const r = deslop('We got home so late tonight. She laughed, she cried, she finally slept.')
    expect(r.violations).toContain('tricolon_closer')
  })

  it('flags a sentimental closer when an abstract-closer word lands in the final 15 words', () => {
    const r = deslop(
      'It was a long day with a lot of ordinary moments packed into it from start to finish. ' +
        'I will always treasure this."'
    )
    expect(r.violations).toContain('sentimental_closer')
  })

  it('flags a summarizing final paragraph above the 40% content-overlap threshold', () => {
    const r = deslop(
      'She loved the swings and giggled the whole time, kicking her little legs and shrieking ' +
        'with delight at every single push we gave her from behind.\n\n' +
        'She loved the swings and giggled the whole time, kicking her little legs and shrieking ' +
        'with delight, the swings and the giggling and the kicking legs summing up her whole day.'
    )
    expect(r.violations).toContain('summarizing_final_paragraph')
  })

  it('does not flag a final paragraph below the 40% content-overlap threshold', () => {
    const r = deslop(
      'We went to the park today. She loved the swings and giggled the whole time, kicking her ' +
        'little legs like she was trying to fly off into the sky above the trees.\n\n' +
        "Anyway bedtime was rough and I am tired now, more tired than I've been in weeks, and I " +
        'just want to sleep for eleven hours straight without waking up once tonight.'
    )
    expect(r.violations).not.toContain('summarizing_final_paragraph')
  })

  it('does not flag antithesis on a single occurrence but does on two or more', () => {
    const once = deslop(
      "It wasn't easy, but we figured it out eventually and things settled down after a while " +
        'once everyone had finally caught their breath for the night.'
    )
    expect(once.violations.some((v) => v.startsWith('antithesis'))).toBe(false)

    const twice = deslop(
      "It wasn't a good night, but we made it through. It wasn't easy, but it worked out. She " +
        'finally slept and so did we and that felt like a real win tonight after a long stretch.'
    )
    expect(twice.violations.some((v) => v.startsWith('antithesis'))).toBe(true)
  })
})

// ── Banned lexical tokens ────────────────────────────────────────────────

describe('banned lexical tokens', () => {
  const cases: Array<[string, string]> = [
    ['She loved to delve into every basket of toys.', 'banned:delve'],
    ['Her whole babyhood feels like a tapestry of tiny moments.', 'banned:tapestry'],
    ['Tonight was a testament to how far she has come.', 'banned:testament to'],
    ['We are learning to navigate the chaos of teething.', 'banned:navigate the'],
    ['Her laugh still resonates with me hours later.', 'banned:resonate'],
    ['She is a little beacon of joy in this house.', 'banned:beacon'],
    ['We are deep in the realm of sleep regression.', 'banned:realm'],
    ['She made a myriad of new sounds tonight.', 'banned:myriad'],
    ['We are about to embark on solids next week.', 'banned:embark'],
    ['Her unwavering focus on the dog was funny.', 'banned:unwavering'],
    ['Bedtime was a whirlwind of tears and giggles.', 'banned:whirlwind'],
    ['In that moment I finally understood the fuss.', 'banned:in that moment'],
    ['Little did I know the night would go this way.', 'banned:little did i know'],
    ["It's not just a nap, it's a whole negotiation.", "banned:it's not just X it's Y"],
    ['Firstly she ate, then she napped.', 'banned:essay connective'],
    ["This isn't about the crying, it's about the crib.", 'banned:this is not about'],
  ]

  for (const [input, expected] of cases) {
    it(`flags "${expected}" for: ${input}`, () => {
      const r = deslop(input)
      expect(r.violations).toContain(expected)
    })
  }
})

// ── Idempotency ───────────────────────────────────────────────────────────

describe('idempotency', () => {
  const inputs = [
    'It was calm—then chaos, chaos, all evening long.',
    "She said ‘hi’ and “bye” in the same breath… tonight—Then she waved.",
    'She ate well. She slept well. She played well. She smiled a lot.',
    'Trailing comma at the very end,',
    '',
    '   ',
    'She smiled so big today 😊 — first real belly laugh!',
  ]

  for (const input of inputs) {
    it(`deslop(deslop(x).clean).clean === deslop(x).clean for: ${JSON.stringify(input)}`, () => {
      const once = deslop(input)
      const twice = deslop(once.clean)
      expect(twice.clean).toBe(once.clean)
    })
  }
})

// ── Unicode, emoji, whitespace-only ──────────────────────────────────────

describe('unicode, emoji, and whitespace-only input', () => {
  it('preserves emoji through the pipeline without corruption', () => {
    const r = deslop('She smiled so big today 😊 and it made the whole week better honestly.')
    expect(r.clean).toContain('😊')
  })

  it('preserves non-Latin unicode content (e.g. a name in Devanagari)', () => {
    const r = deslop('We call her मीरा when we are being silly at home.')
    expect(r.clean).toContain('मीरा')
  })

  it('returns clean="" and passed=true for a whitespace-only entry', () => {
    const r = deslop('   \n\t   ')
    expect(r).toEqual({ clean: '', violations: [], stdev: 0, passed: true })
  })

  it('returns clean="" and passed=true for an empty string', () => {
    const r = deslop('')
    expect(r).toEqual({ clean: '', violations: [], stdev: 0, passed: true })
  })
})
