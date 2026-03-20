/**
 * @module CheckinOpeners
 * @description Varied conversation openers and post-checkin follow-up questions.
 *   Keeps the daily checkin feeling fresh and personalised per session.
 * @version 1.0.0
 * @since March 2026
 */

type TimeOfDay = 'early_morning' | 'late_morning' | 'afternoon' | 'evening' | 'late_night'

/**
 * Opening prompt hints sent to Claude so it generates varied first questions.
 * Each includes a mood/angle to explore so the opener feels different each day.
 */
const OPENER_ANGLES: Array<{
  angle: string
  stages: ('pregnancy' | 'infant' | 'toddler')[]
  times?: TimeOfDay[]
}> = [
  // Universal — any stage, any time
  { angle: 'Ask about how they slept last night — frame it warmly.', stages: ['pregnancy', 'infant', 'toddler'] },
  { angle: 'Ask about one thing they are looking forward to today.', stages: ['pregnancy', 'infant', 'toddler'] },
  { angle: 'Ask what is on their mind right now — open and curious.', stages: ['pregnancy', 'infant', 'toddler'] },
  { angle: 'Ask about their energy levels today — are they running on fumes or feeling okay?', stages: ['pregnancy', 'infant', 'toddler'] },
  { angle: 'Ask about a small win from the last 24 hours.', stages: ['pregnancy', 'infant', 'toddler'] },
  { angle: 'Ask about how they are taking care of themselves lately.', stages: ['pregnancy', 'infant', 'toddler'] },
  { angle: 'Ask if anything surprised them about parenting/pregnancy recently.', stages: ['pregnancy', 'infant', 'toddler'] },
  { angle: 'Ask about their mood in one word, then follow up warmly.', stages: ['pregnancy', 'infant', 'toddler'] },

  // Pregnancy-specific
  { angle: 'Ask about any new physical sensations or changes they have noticed.', stages: ['pregnancy'] },
  { angle: 'Ask about what they are most excited about regarding baby arriving.', stages: ['pregnancy'] },
  { angle: 'Ask about how their appetite has been today.', stages: ['pregnancy'] },
  { angle: 'Ask if they have any questions about what is happening this week of pregnancy.', stages: ['pregnancy'] },
  { angle: 'Ask about how their body is feeling — back, feet, energy.', stages: ['pregnancy'] },
  { angle: 'Ask about nesting — any preparations they have been making.', stages: ['pregnancy'] },
  { angle: 'Ask about their birth plan or how they feel about delivery.', stages: ['pregnancy'] },

  // Infant-specific
  { angle: 'Ask about how the baby slept and how they are managing.', stages: ['infant'] },
  { angle: 'Ask about feeding — how is it going? Any changes?', stages: ['infant'] },
  { angle: 'Ask about a cute or funny moment with baby recently.', stages: ['infant'] },
  { angle: 'Ask about how they are adjusting to the routine (or lack of one).', stages: ['infant'] },
  { angle: 'Ask about the baby — what new thing have they noticed?', stages: ['infant'] },
  { angle: 'Ask if they have had any help today and how that feels.', stages: ['infant'] },
  { angle: 'Ask about any concerns — big or small — that are floating around.', stages: ['infant'] },

  // Toddler-specific
  { angle: 'Ask about what the little one got up to today — any adventures?', stages: ['toddler'] },
  { angle: 'Ask about mealtimes — are they eating well or being picky?', stages: ['toddler'] },
  { angle: 'Ask about any new words, behaviours, or milestones they have noticed.', stages: ['toddler'] },
  { angle: 'Ask about their patience levels — toddlerhood is a workout.', stages: ['toddler'] },

  // Time-specific
  { angle: 'It is early morning — ask how the night went, warmly and gently.', stages: ['pregnancy', 'infant', 'toddler'], times: ['early_morning'] },
  { angle: 'It is late night — acknowledge they are up late and ask how they are holding up.', stages: ['pregnancy', 'infant', 'toddler'], times: ['late_night'] },
  { angle: 'It is evening — ask how the day went, wrap-up style.', stages: ['pregnancy', 'infant', 'toddler'], times: ['evening'] },
  { angle: 'It is afternoon — ask how the day is going so far.', stages: ['pregnancy', 'infant', 'toddler'], times: ['afternoon'] },
]

/**
 * Pick a varied opening angle for this checkin session.
 * Filters by stage and time, then picks pseudo-randomly based on date + hour
 * so the same user doesn't see repeats within the same day.
 */
export function pickOpenerAngle(
  stage: 'pregnancy' | 'infant' | 'toddler',
  timeOfDay: TimeOfDay
): string {
  // Filter to matching stage and (optionally) time
  const candidates = OPENER_ANGLES.filter(
    (o) => o.stages.includes(stage) && (!o.times || o.times.includes(timeOfDay))
  )

  // Pseudo-random seed based on date + hour to vary across sessions
  const now = new Date()
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate() + now.getHours()
  const index = seed % candidates.length

  return candidates[index]?.angle || 'Ask how they are doing today — warm and open.'
}

// ─────────────────────────────────────────────────
// POST-CHECKIN FOLLOW-UP QUESTIONS
// ─────────────────────────────────────────────────

interface FollowUpQuestion {
  question: string
  stages: ('pregnancy' | 'infant' | 'toddler')[]
  /** If set, only shown to parents in these roles */
  roles?: ('mother' | 'father' | 'partner' | 'any')[]
  category: 'emotional' | 'practical' | 'relationship' | 'self-care' | 'developmental' | 'reflection'
}

const FOLLOW_UP_QUESTIONS: FollowUpQuestion[] = [
  // ── Emotional ──
  { question: 'What is one thing you wish someone would ask you about right now?', stages: ['pregnancy', 'infant', 'toddler'], category: 'emotional' },
  { question: 'If you could describe your current headspace in a colour, what would it be?', stages: ['pregnancy', 'infant', 'toddler'], category: 'emotional' },
  { question: 'What part of this week has been hardest to talk about?', stages: ['pregnancy', 'infant', 'toddler'], category: 'emotional' },
  { question: 'When was the last time you felt genuinely calm? What were you doing?', stages: ['pregnancy', 'infant', 'toddler'], category: 'emotional' },
  { question: 'Is there something you have been holding in that you want to say out loud?', stages: ['pregnancy', 'infant', 'toddler'], category: 'emotional' },
  { question: 'How are you feeling about the kind of parent you are becoming?', stages: ['pregnancy', 'infant', 'toddler'], category: 'emotional' },
  { question: 'What emotion showed up the most this past week?', stages: ['pregnancy', 'infant', 'toddler'], category: 'emotional' },

  // ── Practical ──
  { question: 'What is one routine that is working well for you right now?', stages: ['infant', 'toddler'], category: 'practical' },
  { question: 'If you could wave a wand and fix one thing about your daily schedule, what would it be?', stages: ['pregnancy', 'infant', 'toddler'], category: 'practical' },
  { question: 'Have you figured out any clever hacks or shortcuts this week?', stages: ['infant', 'toddler'], category: 'practical' },
  { question: 'What is the one thing that takes the most mental energy each day?', stages: ['pregnancy', 'infant', 'toddler'], category: 'practical' },
  { question: 'Is there a decision you have been putting off? Want to think through it together?', stages: ['pregnancy', 'infant', 'toddler'], category: 'practical' },
  { question: 'How is the household workload feeling — balanced or lopsided?', stages: ['infant', 'toddler'], category: 'practical' },

  // ── Relationship ──
  { question: 'How are you and your partner doing — as a team, not just as parents?', stages: ['pregnancy', 'infant', 'toddler'], category: 'relationship' },
  { question: 'When was the last time you and your partner had a real conversation that was not about the baby?', stages: ['infant', 'toddler'], category: 'relationship' },
  { question: 'Has parenthood changed any of your friendships? How does that feel?', stages: ['infant', 'toddler'], category: 'relationship' },
  { question: 'Do you feel supported by the people around you? What would help more?', stages: ['pregnancy', 'infant', 'toddler'], category: 'relationship' },
  { question: 'Is there a family dynamic that has shifted since the baby? Something you want to talk about?', stages: ['infant', 'toddler'], category: 'relationship' },
  { question: 'How are you navigating unsolicited advice from family or friends?', stages: ['pregnancy', 'infant', 'toddler'], category: 'relationship' },

  // ── Self-care ──
  { question: 'What is one thing you did for yourself this week — even something tiny?', stages: ['pregnancy', 'infant', 'toddler'], category: 'self-care' },
  { question: 'If you had one hour totally to yourself right now, what would you do?', stages: ['pregnancy', 'infant', 'toddler'], category: 'self-care' },
  { question: 'How is your body feeling today? Any aches, tensions, or changes worth noting?', stages: ['pregnancy', 'infant', 'toddler'], category: 'self-care' },
  { question: 'Are you eating well, or just surviving on whatever is within arm\'s reach?', stages: ['infant', 'toddler'], category: 'self-care' },
  { question: 'Have you been outside today? Even a short walk can shift the whole day.', stages: ['pregnancy', 'infant', 'toddler'], category: 'self-care' },
  { question: 'On a scale of 1 to 10, how would you rate your energy right now?', stages: ['pregnancy', 'infant', 'toddler'], category: 'self-care' },
  { question: 'Are you drinking enough water? Sounds basic but it is the first thing to go.', stages: ['pregnancy', 'infant', 'toddler'], category: 'self-care' },

  // ── Developmental ──
  { question: 'What new thing has your little one done recently that made you smile?', stages: ['infant', 'toddler'], category: 'developmental' },
  { question: 'Is there anything about your baby\'s development that you are curious or wondering about?', stages: ['infant', 'toddler'], category: 'developmental' },
  { question: 'What does a typical interaction with your baby look like right now?', stages: ['infant'], category: 'developmental' },
  { question: 'Have you noticed any new sounds, movements, or responses from baby this week?', stages: ['infant'], category: 'developmental' },
  { question: 'How is your toddler\'s language coming along? Any funny new words?', stages: ['toddler'], category: 'developmental' },
  { question: 'What is your baby\'s favourite thing to look at or play with right now?', stages: ['infant', 'toddler'], category: 'developmental' },

  // ── Reflection ──
  { question: 'What is one thing you know now that you wish you knew a month ago?', stages: ['pregnancy', 'infant', 'toddler'], category: 'reflection' },
  { question: 'What is the best piece of parenting advice you have received so far?', stages: ['pregnancy', 'infant', 'toddler'], category: 'reflection' },
  { question: 'If future-you could send a message to present-you, what would it say?', stages: ['pregnancy', 'infant', 'toddler'], category: 'reflection' },
  { question: 'What were your expectations of this stage — and how does reality compare?', stages: ['pregnancy', 'infant', 'toddler'], category: 'reflection' },
  { question: 'What is something you are proud of from this past week?', stages: ['pregnancy', 'infant', 'toddler'], category: 'reflection' },
  { question: 'Is there something you have been comparing yourself to other parents about?', stages: ['pregnancy', 'infant', 'toddler'], category: 'reflection' },
  { question: 'What do you think your baby would say about you if they could talk?', stages: ['infant', 'toddler'], category: 'reflection' },
  { question: 'What is one thing about this stage you never want to forget?', stages: ['pregnancy', 'infant', 'toddler'], category: 'reflection' },

  // ── Father/partner-specific ──
  { question: 'How are you adjusting to fatherhood — what has surprised you most?', stages: ['infant', 'toddler'], roles: ['father', 'partner'], category: 'emotional' },
  { question: 'Do you feel like you have space to express how you are feeling about all this?', stages: ['pregnancy', 'infant', 'toddler'], roles: ['father', 'partner'], category: 'emotional' },
  { question: 'How do you feel about your bond with the baby? Is it growing the way you hoped?', stages: ['infant'], roles: ['father', 'partner'], category: 'emotional' },
  { question: 'What is one thing you wish your partner understood about how you are feeling?', stages: ['pregnancy', 'infant', 'toddler'], roles: ['father', 'partner'], category: 'relationship' },
  { question: 'Have you been able to do any skin-to-skin or solo time with the baby?', stages: ['infant'], roles: ['father', 'partner'], category: 'practical' },

  // ── Mother-specific ──
  { question: 'How is your body recovering? Are you being gentle with yourself?', stages: ['infant'], roles: ['mother'], category: 'self-care' },
  { question: 'How is breastfeeding or feeding going — any wins or frustrations?', stages: ['infant'], roles: ['mother'], category: 'practical' },
  { question: 'Are you getting any time that feels like it is just yours?', stages: ['infant', 'toddler'], roles: ['mother'], category: 'self-care' },
  { question: 'How do you feel about your body right now? This is a safe space.', stages: ['pregnancy', 'infant'], roles: ['mother'], category: 'emotional' },
  { question: 'Is there anything about motherhood that feels different from what you expected?', stages: ['infant', 'toddler'], roles: ['mother'], category: 'reflection' },
]

/**
 * Pick a follow-up question for a post-checkin conversation.
 * Filters by stage and (optionally) parent role, then picks based on
 * a rotating index that avoids repeats within the same week.
 */
export function pickFollowUpQuestion(
  stage: 'pregnancy' | 'infant' | 'toddler',
  parentRole?: 'mother' | 'father' | 'partner' | null
): string {
  const candidates = FOLLOW_UP_QUESTIONS.filter((q) => {
    if (!q.stages.includes(stage)) return false
    if (q.roles && parentRole && !q.roles.includes(parentRole) && !q.roles.includes('any')) return false
    if (q.roles && !parentRole) return false // skip role-specific if role unknown
    return true
  })

  // Rotate through questions using day-of-year + hour so they vary across visits
  const now = new Date()
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  )
  const seed = dayOfYear * 24 + now.getHours()
  const index = seed % candidates.length

  return candidates[index]?.question || 'How are you feeling right now — honestly?'
}
