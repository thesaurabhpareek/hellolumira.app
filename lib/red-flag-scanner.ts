/**
 * @module RedFlagScanner
 * @description Hard-coded red flag scanner for emergency, urgent, and call-doctor
 *   escalation levels. Runs BEFORE any AI call on every user message. If an
 *   emergency is detected, Claude is NEVER called and a pre-authored response
 *   card is returned directly. Covers 12 emergency categories with pre-authored
 *   responses including emergency numbers for UK, US, India, and Australia.
 * @version 1.0.0
 * @since March 2026
 */

import type { RedFlagResult, RedFlagCategory } from '@/types/chat'

/** Default "no red flag detected" result, reused to avoid object duplication. */
const NO_FLAG_RESULT: RedFlagResult = Object.freeze({
  level: 'none',
  category: null,
  pattern: null,
  immediateAction: null,
  preAuthoredMessage: null,
  actionUrl: null,
  severity: null,
}) as RedFlagResult

// ── Emergency patterns (CALL 911 / 999 / 112) ──────────────────────────────
// Patterns are plain lowercase strings matched via String.includes() on the
// lowercased user message. Categories are checked in insertion order; the first
// match wins and short-circuits further scanning.

const CATEGORY_PATTERNS: Record<RedFlagCategory, {
  patterns: string[]
  preAuthoredMessage: string
  actionUrl: string
  severity: 'emergency' | 'urgent' | 'same_day'
}> = {
  breathing_emergency: {
    patterns: [
      'not breathing', 'stopped breathing', 'blue lips', 'turning blue', 'going blue',
      'blue around mouth', 'struggling to breathe', 'cannot breathe', "can't breathe",
      'nostrils flaring', 'chest caving in', 'chest retracting', 'breathing stopped',
      'breathing very fast', 'gasping for air', 'laboured breathing', 'labored breathing',
    ],
    preAuthoredMessage: `This needs emergency attention right now.

If your baby is not breathing or has blue lips, call emergency services immediately:
UK: 999  |  US: 911  |  India: 112  |  Australia: 000

While waiting:
- Place baby on a firm, flat surface
- Check airway is clear
- If trained, begin infant CPR

Do not wait to see if it improves. Get help now.

I will be here when things are okay.`,
    actionUrl: 'tel:911',
    severity: 'emergency',
  },

  choking: {
    patterns: [
      'choking', 'something stuck', 'swallowed something', 'gagging on',
      'cannot swallow', "can't swallow", 'object in throat', 'stuck in throat',
    ],
    preAuthoredMessage: `This needs emergency attention right now.

If your baby is choking and cannot breathe, cry, or cough:
Call emergency services immediately:
UK: 999  |  US: 911  |  India: 112  |  Australia: 000

While waiting:
- For infants: 5 back blows, then 5 chest thrusts
- Do NOT put your fingers in their mouth to sweep

Do not wait. Get help now.

I will be here when things are okay.`,
    actionUrl: 'tel:911',
    severity: 'emergency',
  },

  seizure: {
    patterns: [
      'seizure', 'convulsion', 'shaking all over', 'eyes rolling back', 'fitting',
      'having a fit', 'convulsing', 'jerking movements',
    ],
    preAuthoredMessage: `This needs emergency attention right now.

If your baby is having a seizure:
Call emergency services immediately:
UK: 999  |  US: 911  |  India: 112  |  Australia: 000

While waiting:
- Place baby on their side on a safe surface
- Do NOT restrain them or put anything in their mouth
- Time the seizure if you can
- Clear the area of hard objects

Do not wait. Get help now.

I will be here when things are okay.`,
    actionUrl: 'tel:911',
    severity: 'emergency',
  },

  high_fever_newborn: {
    patterns: [], // Handled by age-specific fever logic below
    preAuthoredMessage: `Because your baby is under 3 months old, any fever needs to be assessed by a doctor right now — not tomorrow. This is a consistent AAP guideline.

Please call your pediatrician or go to urgent care now.

If temperature is above 100.4°F (38°C), this is urgent.

I will be here when things are okay.`,
    actionUrl: 'tel:911',
    severity: 'urgent',
  },

  unresponsive: {
    patterns: [
      'unresponsive', 'cannot wake', "can't wake", 'wont wake up', "won't wake up",
      'limp', 'floppy', 'unconscious', 'passed out', 'not responding',
      'not waking up', 'completely still',
    ],
    preAuthoredMessage: `This needs emergency attention right now.

If your baby is unresponsive or will not wake up:
Call emergency services immediately:
UK: 999  |  US: 911  |  India: 112  |  Australia: 000

While waiting:
- Check if baby is breathing
- Keep baby warm
- If not breathing and you are trained, begin infant CPR

Do not wait. Get help now.

I will be here when things are okay.`,
    actionUrl: 'tel:911',
    severity: 'emergency',
  },

  severe_bleeding: {
    patterns: [
      'bleeding heavily', 'severe bleeding', 'blood everywhere', 'deep cut',
      'blood wont stop', "blood won't stop", 'gushing blood', 'arterial bleeding',
      'blood in vomit', 'vomiting blood',
    ],
    preAuthoredMessage: `This needs emergency attention right now.

For severe bleeding:
Call emergency services immediately:
UK: 999  |  US: 911  |  India: 112  |  Australia: 000

While waiting:
- Apply firm, direct pressure with a clean cloth
- Do NOT remove the cloth — add more on top if needed
- Keep baby calm and warm

Do not wait. Get help now.

I will be here when things are okay.`,
    actionUrl: 'tel:911',
    severity: 'emergency',
  },

  head_injury: {
    patterns: [
      'head injury', 'fell from', 'dropped baby', 'fall from height',
      'serious fall', 'hit head hard', 'head trauma', 'skull',
    ],
    preAuthoredMessage: `This needs emergency attention right now.

After a head injury or serious fall:
Call emergency services immediately:
UK: 999  |  US: 911  |  India: 112  |  Australia: 000

Watch for:
- Loss of consciousness (even briefly)
- Vomiting
- Unusual drowsiness
- Unequal pupils
- Bulging fontanelle (soft spot)

Even if baby seems fine now, a medical assessment is needed today.

I will be here when things are okay.`,
    actionUrl: 'tel:911',
    severity: 'emergency',
  },

  ingestion_poison: {
    patterns: [
      'swallowed poison', 'ate detergent', 'drank bleach', 'swallowed pills',
      'ate medication', 'ingested', 'swallowed battery', 'ate cleaning',
      'drank cleaning', 'poisoning', 'swallowed chemicals',
    ],
    preAuthoredMessage: `This needs emergency attention right now.

If your baby has ingested something potentially dangerous:
Call Poison Control: 1-800-222-1222 (US)
UK: 111  |  India: 112  |  Australia: 13 11 26

Do NOT make them vomit unless told to by a professional.
Keep the container or substance — bring it with you.

If baby is unconscious or having difficulty breathing:
Call 911 / 999 / 112 immediately.

I will be here when things are okay.`,
    actionUrl: 'tel:18002221222',
    severity: 'emergency',
  },

  severe_allergic_reaction: {
    patterns: [
      'swollen face', 'swollen throat', 'swollen tongue', 'hives everywhere',
      'anaphylaxis', 'allergic shock', 'allergic reaction spreading',
      'face swelling', 'throat swelling', 'lips swelling',
    ],
    preAuthoredMessage: `This needs emergency attention right now.

If your baby is having a severe allergic reaction:
Call emergency services immediately:
UK: 999  |  US: 911  |  India: 112  |  Australia: 000

Signs of anaphylaxis:
- Swelling of face, lips, tongue, or throat
- Difficulty breathing or wheezing
- Hives spreading rapidly
- Becoming limp or unresponsive

If you have an EpiPen prescribed for your baby, use it now.

Do not wait. Get help now.

I will be here when things are okay.`,
    actionUrl: 'tel:911',
    severity: 'emergency',
  },

  reduced_fetal_movement: {
    patterns: [
      'not moving', 'stopped moving', 'no movement', 'reduced movement',
      'less movement', 'baby not kicking', 'stopped kicking', 'no kicks',
      'fewer kicks', 'less kicking', "hasn't moved", 'not felt movement',
      'no fetal movement',
    ],
    preAuthoredMessage: `Please contact your midwife, maternity ward, or maternity helpline immediately.

Reduced fetal movement after 24 weeks should always be assessed the same day. Do not wait until tomorrow.

UK: Call your maternity unit or 111
US: Call your OB or go to labor & delivery
India: Go to your nearest maternity hospital

Do not rely on home dopplers or kick-counting apps as reassurance. Professional assessment is needed.

I will be here when things are okay.`,
    actionUrl: 'tel:111',
    severity: 'same_day',
  },

  preterm_labor_signs: {
    patterns: [
      'contractions early', 'preterm contractions', 'premature contractions',
      'water broke early', 'water breaking', 'waters broken', 'leaking fluid',
      'regular contractions', 'contractions before 37', 'preterm labor',
      'preterm labour', 'premature labor', 'premature labour',
    ],
    preAuthoredMessage: `Please go to your hospital or maternity unit now.

Signs of preterm labor need immediate assessment:
- Regular contractions before 37 weeks
- Fluid leaking or waters breaking
- Persistent lower back pain with tightening
- Pelvic pressure

UK: Go to your maternity unit
US: Go to labor & delivery
India: Go to your nearest maternity hospital

Time your contractions if you can. Do not wait.

I will be here when things are okay.`,
    actionUrl: 'tel:911',
    severity: 'emergency',
  },

  suicidal_ideation: {
    patterns: [
      'suicidal', 'kill myself', 'end my life', 'want to die', 'better off dead',
      'end it all', "don't want to live", "don't want to be alive",
      "wish i wasn't here", 'wish i was dead', 'no reason to live',
      'hurting myself', 'hurt myself', 'self harm', 'self-harm',
    ],
    preAuthoredMessage: `I hear you, and I am glad you said something. What you are feeling is real, and you deserve support right now.

Please reach out to someone who can help:

Postpartum Support International: 1-800-944-4773
Crisis Text Line: Text HOME to 741741
National Suicide Prevention Lifeline: 988
UK: Samaritans 116 123
India: iCall 9152987821

You are not alone. You are not a bad parent. You are a parent who is struggling, and that takes courage to say.

I will be here whenever you are ready to talk.`,
    actionUrl: 'tel:18009444773',
    severity: 'emergency',
  },
}

// Additional patterns for urgent/call_doctor levels (non-emergency).
// Ordered by clinical frequency — most commonly reported symptoms first
// to maximise early-exit probability.
const URGENT_PATTERNS = [
  'no wet nappies', 'no wet diapers', 'not urinating', 'not weeing', 'dry mouth',
  'sunken fontanelle', 'sunken soft spot', 'no tears', 'crying without tears',
  'skin not bouncing back', 'very dry',
  'vomiting repeatedly', 'vomiting for hours', 'cannot keep anything down',
  'projectile vomiting',
  'blood in stool', 'blood in poop', 'black poop', 'tarry poop',
  'red blood in nappy', 'rectal bleeding',
]

const CALL_DOCTOR_PATTERNS = [
  'crying for hours', 'inconsolable', 'cannot be soothed', 'crying non stop',
  'cried for 3 hours', 'cried for 4 hours', 'screaming in pain',
  'high pitched cry', 'unusual cry', 'different cry',
  'rash spreading', 'rash all over', 'rash with fever', 'purple rash',
  'does not recognise', 'very drowsy', 'unusually sleepy', 'hard to rouse',
  'breathing seems fast', 'breathing noisy', 'grunting when breathing',
  'persistent cough', 'barking cough',
]

/**
 * Age-specific fever check (AAP 2022 guidelines)
 */
function checkFeverEscalation(
  message: string,
  babyAgeWeeks: number
): RedFlagResult | null {
  if (!message || typeof message !== 'string') return null
  const lower = message.toLowerCase()
  const hasFever = lower.includes('fever') || lower.includes('temperature') ||
    lower.includes('100.4') || lower.includes('38') || lower.includes('39') || lower.includes('40')
  if (!hasFever) return null

  if (babyAgeWeeks < 12) {
    return {
      level: 'urgent',
      category: 'high_fever_newborn',
      pattern: 'fever_under_3_months',
      immediateAction: 'Contact your doctor or go to urgent care now',
      preAuthoredMessage: CATEGORY_PATTERNS.high_fever_newborn.preAuthoredMessage,
      actionUrl: 'tel:911',
      severity: 'urgent',
    }
  }
  if (babyAgeWeeks >= 12 && babyAgeWeeks < 24) {
    return {
      level: 'call_doctor',
      category: null,
      pattern: 'fever_3_to_6_months',
      immediateAction: 'Call your pediatrician today',
      preAuthoredMessage: null,
      actionUrl: null,
      severity: null,
    }
  }
  return null
}

/**
 * scanForRedFlags — runs on every user message BEFORE Claude is called.
 * If level === 'emergency', Claude is NEVER called. Pre-authored card returned directly.
 */
export function scanForRedFlags(
  message: string,
  babyAgeWeeks: number,
  stage?: string
): RedFlagResult {
  // Guard: null, undefined, or non-string input
  if (!message || typeof message !== 'string') {
    return NO_FLAG_RESULT
  }

  // Guard: whitespace-only input
  if (!message.trim()) {
    return NO_FLAG_RESULT
  }

  // Guard: ensure babyAgeWeeks is a valid number
  if (typeof babyAgeWeeks !== 'number' || isNaN(babyAgeWeeks) || babyAgeWeeks < 0) {
    babyAgeWeeks = 0
  }

  // Guard: truncate to 10000 chars max before processing
  const truncated = message.trim().slice(0, 10000)
  const lower = truncated.toLowerCase()

  // 1. Check all emergency categories (12 categories)
  for (const [category, config] of Object.entries(CATEGORY_PATTERNS)) {
    const cat = category as RedFlagCategory

    // Skip reduced_fetal_movement for non-pregnancy
    if (cat === 'reduced_fetal_movement' && stage && stage !== 'pregnancy') continue
    // Skip preterm_labor_signs for non-pregnancy
    if (cat === 'preterm_labor_signs' && stage && stage !== 'pregnancy') continue

    for (const pattern of config.patterns) {
      if (lower.includes(pattern)) {
        return {
          level: 'emergency',
          category: cat,
          pattern,
          immediateAction: config.severity === 'same_day'
            ? 'Contact your healthcare provider today'
            : 'Call emergency services now',
          preAuthoredMessage: config.preAuthoredMessage,
          actionUrl: config.actionUrl,
          severity: config.severity,
        }
      }
    }
  }

  // 2. Fever age-specific check (may return urgent)
  const feverResult = checkFeverEscalation(message, babyAgeWeeks)
  if (feverResult && feverResult.level === 'urgent') return feverResult

  // 3. Urgent patterns (not full emergency, but need same-day care)
  for (const pattern of URGENT_PATTERNS) {
    if (lower.includes(pattern)) {
      return {
        level: 'urgent',
        category: null,
        pattern,
        immediateAction: 'Seek medical attention today',
        preAuthoredMessage: null,
        actionUrl: null,
        severity: null,
      }
    }
  }

  // 4. Call doctor patterns
  if (feverResult?.level === 'call_doctor') return feverResult
  for (const pattern of CALL_DOCTOR_PATTERNS) {
    if (lower.includes(pattern)) {
      return {
        level: 'call_doctor',
        category: null,
        pattern,
        immediateAction: 'Contact your pediatrician',
        preAuthoredMessage: null,
        actionUrl: null,
        severity: null,
      }
    }
  }

  // 5. No red flag detected
  return NO_FLAG_RESULT
}
