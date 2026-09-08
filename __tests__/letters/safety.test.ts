/**
 * Tests for lib/letters/safety.ts
 *
 * The tier boundaries encoded here are PRODUCT AND CLINICAL DECISIONS, not
 * implementation details. Do not "fix" a failing test by loosening it. If a
 * boundary is wrong, it is wrong in the PRD (§18.4) and needs a clinician, not
 * a code change.
 *
 * Two failure modes are being defended against, in both directions:
 *   1. Treating an ordinary ego-dystonic intrusive thought as an emergency.
 *      This ends the relationship and stops the parent ever speaking again.
 *   2. Missing stated intent.
 */

import { describe, it, expect } from 'vitest'
import { classify, TIER2_TEMPLATE_KEYS, SAFETY_RULESET_VERSION } from '@/lib/letters/safety'
import type { SafetyResult } from '@/types/letters'

const tier = (s: string): number => classify(s).tier

describe('classify — contract shape', () => {
  it('returns the SafetyResult shape and nothing else', () => {
    const r: SafetyResult = classify('Today was long but she smiled at me.')
    expect(Object.keys(r).sort()).toEqual(['category', 'templateKey', 'tier'])
  })

  it('exposes a ruleset version for escalation logging', () => {
    expect(typeof SAFETY_RULESET_VERSION).toBe('string')
    expect(SAFETY_RULESET_VERSION.length).toBeGreaterThan(0)
  })

  it('is deterministic — same input, same output, every time', () => {
    const input = "I'm terrified I might drop her on the stairs."
    const first = classify(input)
    for (let i = 0; i < 50; i++) {
      expect(classify(input)).toEqual(first)
    }
  })

  it('never returns the triggering text in any field', () => {
    const r = classify('I want to hurt her, I said it out loud tonight, pomegranate.')
    const serialised = JSON.stringify(r)
    expect(serialised).not.toContain('pomegranate')
    expect(serialised).not.toContain('hurt')
    expect(serialised).not.toContain('tonight')
  })

  it('never mutates or returns the transcript', () => {
    const input = 'I want to kill myself.'
    const copy = input.slice()
    classify(input)
    expect(input).toBe(copy)
  })
})

describe('empty, degenerate and hostile input', () => {
  it('handles empty string', () => {
    expect(classify('')).toEqual({ tier: 0, category: 'none', templateKey: null })
  })

  it('handles whitespace only', () => {
    expect(classify('   \n\t  ')).toEqual({ tier: 0, category: 'none', templateKey: null })
  })

  it('handles punctuation only', () => {
    expect(classify('... !!! ??')).toEqual({ tier: 0, category: 'none', templateKey: null })
  })

  it('handles a non-string at runtime without throwing', () => {
    const notAString = null as unknown as string
    expect(() => classify(notAString)).not.toThrow()
    expect(classify(notAString).tier).toBe(0)
  })

  it('handles very long input without throwing or hanging', () => {
    const long = 'She fed well and slept badly. '.repeat(5000)
    const start = Date.now()
    expect(classify(long).tier).toBe(0)
    expect(Date.now() - start).toBeLessThan(5000)
  })

  it('still finds risk buried deep inside a long transcript', () => {
    const long =
      'She fed well and slept badly. '.repeat(2000) + ' I want to kill myself. ' + 'And that was the day. '.repeat(500)
    expect(classify(long)).toEqual({
      tier: 2,
      category: 'self_harm',
      templateKey: TIER2_TEMPLATE_KEYS.self_harm,
    })
  })

  it('handles unicode, emoji and curly apostrophes', () => {
    expect(tier('Café day ☕️ — she napped 😴 and I didn’t.')).toBe(0)
    expect(classify('I’m a bad mother.').tier).toBe(1)
    expect(classify('I don’t want to be here anymore.').tier).toBe(2)
  })

  it('handles a transcript with no punctuation at all (dictated run-on speech)', () => {
    expect(classify('so today was fine she ate she slept i am shattered but ok').tier).toBe(0)
  })
})

describe('tier 0 — benign and ordinary distress', () => {
  it('classifies an ordinary good day as nothing', () => {
    expect(classify('She rolled over twice today and laughed at the dog.')).toEqual({
      tier: 0,
      category: 'none',
      templateKey: null,
    })
  })

  it('classifies benign exhaustion as tier 0 distress — no escalation, no cards', () => {
    const r = classify(
      "I am so tired. I barely slept last night, she was up every two hours, and I cried in the shower this morning."
    )
    expect(r.tier).toBe(0)
    expect(r.category).toBe('distress')
    expect(r.templateKey).toBeNull()
  })

  it('treats "I hate this" as tier 0, not tier 1 (PRD §18.4)', () => {
    expect(tier('Honestly I hate this. Today was relentless.')).toBe(0)
  })
})

describe('false-positive protection — trigger words in innocent contexts', () => {
  const innocent: Array<[string, string]> = [
    ['nap hyperbole', 'She killed that nap today, three hours straight.'],
    ['tiredness hyperbole', "I'm dying of tiredness but we got through it."],
    ['baby is the subject', 'The baby dropped her toy in the park and screamed.'],
    ['dropped an object', 'I dropped her rattle under the pram and had to fish it out.'],
    ['drop off at nursery', 'I need to drop her off at nursery earlier tomorrow.'],
    ['hurt feelings', 'I hurt her feelings when I said the nursery photo was ugly.'],
    ['throw in the air', 'I want to throw her up in the air, she giggles every time.'],
    ['birthday party', 'I want to throw her a birthday party even though she is one.'],
    ['affectionate squeeze', 'I just want to squeeze her, she is so delicious.'],
    ['feeding worry', "I feel like I'm starving her because my supply dropped."],
    ['shake the rattle', 'I shake her rattle and she goes quiet instantly.'],
    ['bumped head', 'I hit her head on the doorframe by accident and felt awful.'],
    ['self-reproach idiom', 'I could kill myself for forgetting her bottle this morning.'],
    ['tired-to-death idiom', "I'm so tired I could die, but she is worth it."],
    ['dying laughing', 'She was dying laughing at the cat.'],
  ]

  it.each(innocent)('does not escalate to tier 2: %s', (_label, text) => {
    expect(classify(text).tier).toBeLessThan(2)
  })

  // KNOWN, ACCEPTED FALSE POSITIVE. Pronoun reference cannot be resolved by a
  // rule-based classifier: "I could kill him" about a partner and about the baby
  // are the same string. It caps at tier 1 — one warm normalizing sentence and
  // the interview continues — which is the cheap error. It must never be tier 2.
  it('caps idiomatic "I could kill him/her" at tier 1', () => {
    expect(tier('He forgot the bottles again, I could kill him honestly.')).toBe(1)
    expect(tier('I could kill her sometimes, she is so stubborn.')).toBe(1)
  })

  it('leaves plainly innocent sentences at tier 0 entirely', () => {
    expect(tier('She killed that nap today, three hours straight.')).toBe(0)
    expect(tier('The baby dropped her toy in the park.')).toBe(0)
    expect(tier('I dropped her off at nursery.')).toBe(0)
    expect(tier('I hurt her feelings when I snapped at my mum.')).toBe(0)
    expect(tier('I want to throw her up in the air, she giggles.')).toBe(0)
  })

  it('does not escalate a report of an actual accident (a hard-day story, not a risk signal)', () => {
    expect(tier('I dropped her bottle on her foot today and she screamed.')).toBe(0)
    expect(tier('I bumped her head on the car door getting her in the seat.')).toBe(0)
  })

  it('does not treat the self-reproach idiom as self-harm', () => {
    expect(classify('I could kill myself for forgetting her appointment.').category).not.toBe('self_harm')
  })
})

describe('tier 1 — ego-dystonic intrusive thoughts (THE CRUX)', () => {
  const intrusive: Array<[string, string]> = [
    ['what if, past conditional', 'What if I dropped her down the stairs? I keep seeing it.'],
    ['terrified + modal', "I'm terrified I might drop her when I carry her downstairs."],
    ['terrified + going to', "I'm terrified I'm going to hurt her one day."],
    ['scared + will', "I'm so scared I'll hurt her without meaning to."],
    ['keep imagining', 'I keep imagining dropping her over the bannister.'],
    ['keep thinking about', "I keep thinking about hurting her and I hate myself for it."],
    ['would never', 'I would never hurt her, but these thoughts keep coming.'],
    ['named intrusive thoughts', 'I get intrusive thoughts and they make me feel like a monster.'],
    ['awful thoughts', "I had this awful thought in the night and I can't shake it."],
    ['thought of', 'The thought of smothering her came into my head and I froze.'],
    ['fear of harm coming to her', 'What if something terrible happens to her while I sleep?'],
    ['scares me', 'It scares me that I could drop her in the bath.'],
  ]

  it.each(intrusive)('is tier 1, not tier 2: %s', (_label, text) => {
    const r = classify(text)
    expect(r.tier).toBe(1)
    expect(r.category).toBe('intrusive_thoughts')
  })

  it('returns no templateKey at tier 1 — a crisis template must never render here', () => {
    const r = classify("I'm terrified I might drop her.")
    expect(r.templateKey).toBeNull()
  })

  it('demotes a volitional surface form carrying an explicit disavowal', () => {
    // The canonical way a parent verbalises an intrusive thought with insight.
    const r = classify('I want to throw her out the window some nights, I would never do it.')
    expect(r.tier).toBe(1)
  })

  it('carries an earlier disclosure of intrusive thoughts across sentences', () => {
    const r = classify('I get these horrible intrusive thoughts. I might smother her. I would never do it.')
    expect(r.tier).toBe(1)
  })
})

describe('tier 1 — relational: self-blame, absent bond, rage', () => {
  const relational: Array<[string, string]> = [
    ['bad mother', "I'm a bad mother. I know it."],
    ['bad mum, spelled', "I'm such a terrible mum and everyone can see it."],
    ['failing her', "I'm failing her every single day."],
    ['no bond', "I don't feel bonded with her yet and it has been nine months."],
    ['no love', "I don't love her the way I'm supposed to."],
    ['feels nothing', 'I feel nothing when I look at her and it frightens me.'],
    ['regret', 'Some days I regret having her and then I feel sick about it.'],
    ['rage', 'I felt such rage tonight when she would not stop screaming.'],
    ['lost temper', 'I lost my temper with her and shouted right in her face.'],
    ['hates motherhood', 'I hate being a mother. I never say that out loud.'],
  ]

  it.each(relational)('is tier 1 bonding_difficulty: %s', (_label, text) => {
    const r = classify(text)
    expect(r.tier).toBe(1)
    expect(r.category).toBe('bonding_difficulty')
    expect(r.templateKey).toBeNull()
  })

  it('"I\'m a bad mother" is tier 1 — never tier 2', () => {
    expect(classify("I'm a bad mother and she deserves better.").tier).toBe(1)
  })
})

describe('tier 2 — stated self-harm intent or plan', () => {
  const selfHarm: Array<[string, string]> = [
    ['explicit', 'I want to kill myself.'],
    ['plan', "I've been working out how I would kill myself when he's at work."],
    ['end my life', 'I think about ending my life most nights now.'],
    ['hurt myself', "I hurt myself last night and I haven't told anyone."],
    ['suicidal', "I've been suicidal since she was born."],
    ['passive, wish', "I wish I wasn't here anymore."],
    ['passive, better off', 'They would all be better off without me.'],
    ['not be here', "I don't want to be here anymore."],
    ['not wake up', 'I want to go to sleep and not wake up.'],
  ]

  it.each(selfHarm)('is tier 2 self_harm with a fixed template: %s', (_label, text) => {
    const r = classify(text)
    expect(r.tier).toBe(2)
    expect(r.category).toBe('self_harm')
    expect(r.templateKey).toBe(TIER2_TEMPLATE_KEYS.self_harm)
  })

  it('does not demote self-harm even when ego-dystonically framed (deliberate asymmetry)', () => {
    expect(classify("I'm scared I might hurt myself.").tier).toBe(2)
    expect(classify("What if I hurt myself?").tier).toBe(2)
  })

  it('leaves "I want to disappear for a day" alone — ordinary exhaustion talk', () => {
    expect(classify('I want to disappear for a day and sleep in a hotel.').tier).toBeLessThan(2)
  })

  it('escalates unqualified "I want to disappear"', () => {
    expect(classify('I want to disappear.').tier).toBe(2)
  })
})

describe('tier 2 — stated intent to harm the child', () => {
  const harmChild: Array<[string, string]> = [
    ['want to hurt her', 'I want to hurt her.'],
    ['want to hurt the baby', 'Sometimes I want to hurt the baby and I mean it.'],
    ['going to', "I'm going to hurt her if she screams one more time."],
    ['want to smother', 'I want to smother her.'],
    ['feel like drowning her', 'I feel like drowning her in the bath.'],
    ['unframed modal, hard verb', 'I might smother her tonight.'],
    ['unframed modal, baby object', 'I could kill my baby.'],
    ['pillow', 'I keep a pillow by the cot because I want to put a pillow over her face.'],
  ]

  it.each(harmChild)('is tier 2 harm_to_child with a fixed template: %s', (_label, text) => {
    const r = classify(text)
    expect(r.tier).toBe(2)
    expect(r.category).toBe('harm_to_child')
    expect(r.templateKey).toBe(TIER2_TEMPLATE_KEYS.harm_to_child)
  })

  it('does not let a coordinator smuggle intent under a fear frame', () => {
    // "and" is not a permitted bridge for a volitional clause.
    expect(classify("I'm scared about money and I want to hurt her.").tier).toBe(2)
  })

  it('distinguishes intent from the ego-dystonic version of the same verb', () => {
    expect(classify('I want to hurt her.').tier).toBe(2)
    expect(classify("I'm terrified I'm going to hurt her.").tier).toBe(1)
  })
})

describe('tier 2 — psychosis markers', () => {
  const psychosis: Array<[string, string]> = [
    ['not mine', "She isn't really my baby. I know how that sounds."],
    ['swapped', 'They swapped her at the hospital, I am certain of it.'],
    ['command voices', 'The voices are telling me to take her outside at night.'],
    ['hearing voices', "I keep hearing voices when the house is quiet."],
  ]

  it.each(psychosis)('is tier 2 with the psychosis template: %s', (_label, text) => {
    const r = classify(text)
    expect(r.tier).toBe(2)
    expect(r.category).toBe('severe_maternal_distress')
    expect(r.templateKey).toBe(TIER2_TEMPLATE_KEYS.psychosis)
  })

  it('does not fire on affectionate hyperbole', () => {
    expect(classify("She's a little devil at 3am, I swear.").tier).toBeLessThan(2)
    expect(classify("The voices in my head keep telling me I'm useless.").tier).toBeLessThan(2)
  })
})

describe('precedence and mixed transcripts', () => {
  it('self-harm outranks everything else present', () => {
    const r = classify("I'm exhausted, I'm a bad mother, and I want to kill myself.")
    expect(r.category).toBe('self_harm')
  })

  it('tier 2 anywhere beats tier 1 earlier in the transcript', () => {
    const r = classify("What if I dropped her? I'm terrified. Honestly I want to hurt her.")
    expect(r.tier).toBe(2)
  })

  it('tier 1 beats tier 0 in a mixed transcript', () => {
    const r = classify("I'm so tired I could cry. I'm a bad mother.")
    expect(r.tier).toBe(1)
  })

  it('a templateKey is present if and only if the tier is 2', () => {
    const samples = [
      'She napped well today.',
      "I'm exhausted and I cried.",
      "I'm terrified I might drop her.",
      "I'm a bad mother.",
      'I want to kill myself.',
      'I want to hurt her.',
    ]
    for (const s of samples) {
      const r = classify(s)
      expect(r.templateKey === null).toBe(r.tier !== 2)
    }
  })
})
