/**
 * @module HomeFeedData
 * @description Static data pools for the home feed's daily rotating cards:
 *   daily reflection questions and quick-fact quizzes.
 *
 *   Both pools rotate deterministically by day-of-year so the content
 *   changes once per calendar day and is consistent across sessions.
 *   No database round-trips required.
 *
 * @version 1.0.0
 * @since March 2026
 */

import type { Stage } from '@/types/app'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DailyQuestion {
  question: string
  /** Pre-filled message sent to chat when user taps "Reflect with Lumira" */
  chatPrompt: string
}

export interface QuizQuestion {
  question: string
  options: [string, string, string]
  /** Zero-based index of the correct option */
  answerIndex: 0 | 1 | 2
  explanation: string
}

// ---------------------------------------------------------------------------
// Daily reflection questions
// ---------------------------------------------------------------------------

/* eslint-disable quotes */
const PREGNANCY_QUESTIONS: DailyQuestion[] = [
  {
    question: "What's one thing your body did this week that amazed you?",
    chatPrompt: "I've been thinking about how amazing pregnancy is. Can we talk about what my body is actually doing right now?",
  },
  {
    question: "Have you told someone close to you how you're really feeling lately?",
    chatPrompt: "I want to talk about how I've been feeling emotionally during pregnancy. Sometimes it's hard to open up to people.",
  },
  {
    question: "What's one thing you're looking forward to about meeting your baby?",
    chatPrompt: "I've been imagining what it will be like when my baby arrives. Can we talk about what to expect in those first moments?",
  },
  {
    question: "Is there anything you've been worrying about that you haven't shared yet?",
    chatPrompt: "There's something on my mind about my pregnancy that I'd like to talk through with you.",
  },
  {
    question: "How are you taking care of yourself \u2014 not just physically, but emotionally?",
    chatPrompt: "I want to talk about emotional wellbeing during pregnancy. What should I be doing to look after myself mentally?",
  },
  {
    question: "What's one question you'd love to ask your doctor but haven't yet?",
    chatPrompt: "I have a question I've been wanting to ask my midwife or doctor but haven't. Can you help me think it through?",
  },
  {
    question: "If you could tell your pre-pregnancy self one thing, what would it be?",
    chatPrompt: "I've been reflecting on how much has changed since I became pregnant. Can we talk about the emotional journey?",
  },
  {
    question: "Are there any symptoms you've been experiencing that you'd like to understand better?",
    chatPrompt: "I've noticed some symptoms lately that I'm curious about. Can you help me understand what my body is doing?",
  },
  {
    question: "What's your biggest hope for your birth experience?",
    chatPrompt: "I'd love to talk about birth planning. What are my options and what should I be thinking about?",
  },
  {
    question: "What's one thing you wish you'd known before getting pregnant?",
    chatPrompt: "I'm learning so much about pregnancy. What are the most important things first-time parents wish they'd known earlier?",
  },
  {
    question: "How are you and your partner (or support person) preparing for this together?",
    chatPrompt: "I want to talk about how to prepare my partner or support person for labour and the newborn phase.",
  },
  {
    question: "What part of your daily routine has changed the most?",
    chatPrompt: "My routine has changed a lot during pregnancy. What habits are most important to maintain for a healthy pregnancy?",
  },
  {
    question: "When did pregnancy feel most real to you?",
    chatPrompt: "I've been reflecting on my pregnancy journey. Can we talk about the different milestones and what they mean?",
  },
  {
    question: "Is there anything about labour or birth you'd like to feel more confident about?",
    chatPrompt: "I want to feel more prepared for labour. Can you walk me through what to expect and how to manage it?",
  },
  {
    question: "What's one thing you're doing to rest and recharge right now?",
    chatPrompt: "I want to understand more about rest and sleep during pregnancy. What's actually helpful versus what's just advice overload?",
  },
]

const INFANT_QUESTIONS: DailyQuestion[] = [
  {
    question: "What's one moment from today that made you smile \u2014 even a small one?",
    chatPrompt: "I'd love to talk about the small moments of joy in early parenthood and how to hold onto them on hard days.",
  },
  {
    question: "Is there one thing about parenting that feels harder than you expected?",
    chatPrompt: "Something about new parenthood is harder than I expected. Can we talk about it?",
  },
  {
    question: "How is your sleep going \u2014 honestly?",
    chatPrompt: "I'd love to talk about sleep deprivation as a new parent. What are realistic strategies that actually help?",
  },
  {
    question: "When did you last do something just for yourself, even for 10 minutes?",
    chatPrompt: "I'm struggling to find time for myself since having a baby. Can we talk about parental wellbeing and how to protect it?",
  },
  {
    question: "What's one thing your baby has done this week that surprised you?",
    chatPrompt: "My baby did something that surprised me. Can you help me understand what's happening developmentally?",
  },
  {
    question: "Is there a parenting decision you're second-guessing right now?",
    chatPrompt: "I've been second-guessing a parenting decision and would love an evidence-based perspective.",
  },
  {
    question: "How are you feeling about feeding \u2014 whether breast, bottle, or both?",
    chatPrompt: "I want to talk about feeding. I have some questions and concerns I'd like to work through.",
  },
  {
    question: "What's one thing that's going really well that you want to keep doing?",
    chatPrompt: "Something in our routine is going well and I want to build on it. Can we talk about how to reinforce good habits?",
  },
  {
    question: "Have you talked to another parent recently about how you're really doing?",
    chatPrompt: "I feel quite isolated as a new parent sometimes. Can we talk about community, connection, and how other parents cope?",
  },
  {
    question: "What does your baby seem to love most right now?",
    chatPrompt: "I've noticed my baby responds strongly to certain things. What does that tell me about their development?",
  },
  {
    question: "Is there anything about your baby's health you'd like to understand better?",
    chatPrompt: "I have some questions about my baby's health that I'd love to go through.",
  },
  {
    question: "What's one myth about newborns you've discovered isn't true?",
    chatPrompt: "I want to separate fact from fiction about newborn care. What are the most common myths?",
  },
  {
    question: "How is your relationship with your body feeling right now?",
    chatPrompt: "I'd like to talk about postpartum body changes and how to approach recovery with kindness.",
  },
  {
    question: "What would you tell a new parent who's just starting out?",
    chatPrompt: "What's the most valuable advice for brand new parents in the first weeks?",
  },
  {
    question: "What's one thing you're proud of yourself for as a parent?",
    chatPrompt: "I want to reflect on what's going well in my parenting. Can you help me appreciate my own progress?",
  },
]

const TODDLER_QUESTIONS: DailyQuestion[] = [
  {
    question: "What made your toddler laugh out loud today?",
    chatPrompt: "I want to understand more about toddler humour and social development. What are they learning through play and laughter?",
  },
  {
    question: "Is there a behaviour that's been challenging you lately?",
    chatPrompt: "My toddler has been doing something that I find challenging. Can we talk through it with an evidence-based approach?",
  },
  {
    question: "What's one new word or phrase your toddler has surprised you with?",
    chatPrompt: "My toddler's language is developing fast. Can you explain what's happening developmentally right now?",
  },
  {
    question: "How do you handle the tantrums \u2014 what's working, what isn't?",
    chatPrompt: "I want to understand toddler tantrums better. What's actually happening in their brain and what are the best responses?",
  },
  {
    question: "What's your toddler most obsessed with right now?",
    chatPrompt: "My toddler has a strong current obsession. What does that tell me about their development?",
  },
  {
    question: "How is sleep going in your household these days?",
    chatPrompt: "I want to talk about toddler sleep. We're having some challenges and I'd love evidence-based advice.",
  },
  {
    question: "What's one boundary you've set that you feel good about?",
    chatPrompt: "Setting limits with toddlers is hard. Can we talk about what works, what doesn't, and why consistency matters?",
  },
  {
    question: "What's the messiest, most chaotic part of your day right now?",
    chatPrompt: "Life with a toddler is beautifully chaotic. Can we talk about managing the mentally demanding parts of toddler parenting?",
  },
  {
    question: "Are you getting enough support as a parent?",
    chatPrompt: "I want to talk about parental wellbeing and what support actually looks like for parents of toddlers.",
  },
  {
    question: "What does your toddler do that makes you feel like you're doing a good job?",
    chatPrompt: "I want to reflect on positive parenting moments. What signs tell us we're raising a securely attached child?",
  },
  {
    question: "What's one part of your toddler's personality that surprises you?",
    chatPrompt: "My toddler's personality is emerging so strongly. Can we talk about temperament and what shapes it?",
  },
  {
    question: "How do you handle screen time in your house? Happy with it?",
    chatPrompt: "I want to talk about screen time for toddlers \u2014 what does the evidence say and how do I find the right balance?",
  },
  {
    question: "What's one activity that reliably brings you and your toddler joy?",
    chatPrompt: "What activities are most beneficial for toddler development and are fun for parents too?",
  },
  {
    question: "What's something you've stopped worrying about that you used to stress over?",
    chatPrompt: "As a parent, perspective shifts over time. What are the things parents of toddlers can stop stressing about?",
  },
  {
    question: "If your toddler could describe your day together, what do you think they'd say?",
    chatPrompt: "I'd love a different perspective on my parenting. What does secure attachment look like from a toddler's point of view?",
  },
]
/* eslint-enable quotes */

const QUESTION_POOLS: Record<Stage, DailyQuestion[]> = {
  pregnancy: PREGNANCY_QUESTIONS,
  infant: INFANT_QUESTIONS,
  toddler: TODDLER_QUESTIONS,
  postpartum: INFANT_QUESTIONS, // Postpartum uses same questions as infant stage
}

// ---------------------------------------------------------------------------
// Quick-fact quiz questions
// ---------------------------------------------------------------------------

const PREGNANCY_QUIZZES: QuizQuestion[] = [
  {
    question: "By how much does your blood volume increase during pregnancy?",
    options: ["10\u201315%", "25\u201330%", "40\u201350%"],
    answerIndex: 2,
    explanation: "Your body produces 40\u201350% more blood during pregnancy to supply the placenta and support your baby's growth. That's why many pregnant people feel warmer than usual!",
  },
  {
    question: "When do most babies start reacting to sounds from outside the womb?",
    options: ["Week 16", "Week 25", "Week 36"],
    answerIndex: 1,
    explanation: "By around week 25, your baby's ears are developed enough to detect sounds from the outside world. Talking, reading aloud, or playing music can all reach them.",
  },
  {
    question: "At which trimester do fingerprints form?",
    options: ["First", "Second", "Third"],
    answerIndex: 1,
    explanation: "Fingerprints form between weeks 10\u201318 (second trimester) and are unique from the start \u2014 no two people's fingerprints are identical, even identical twins.",
  },
  {
    question: "What does the placenta produce to help sustain the pregnancy?",
    options: ["Insulin", "Progesterone", "Adrenaline"],
    answerIndex: 1,
    explanation: "After the first trimester the placenta takes over producing progesterone, which helps maintain the uterine lining and supports foetal development.",
  },
  {
    question: "Which nutrient is most critical in the first 12 weeks to prevent neural tube defects?",
    options: ["Iron", "Calcium", "Folic acid"],
    answerIndex: 2,
    explanation: "Folic acid (vitamin B9) is essential in early pregnancy to close the neural tube, which becomes the brain and spinal cord. Many guidelines recommend starting before conception.",
  },
  {
    question: "When can babies typically open their eyes in the womb?",
    options: ["Week 16", "Week 28", "Week 36"],
    answerIndex: 1,
    explanation: "Babies can open their eyes around week 28, though it's dark in there! They can detect light filtering through, and some research shows they even respond to bright external light.",
  },
  {
    question: "What percentage of known pregnancies end in miscarriage?",
    options: ["5\u201310%", "15\u201320%", "30\u201340%"],
    answerIndex: 1,
    explanation: "About 15\u201320% of known pregnancies end in miscarriage, most in the first trimester. It's far more common than people realise, which is why many choose not to share news early.",
  },
  {
    question: "Which organ develops first in a growing embryo?",
    options: ["Brain", "Heart", "Kidneys"],
    answerIndex: 1,
    explanation: "The heart starts forming around week 3\u20134 and begins beating around week 5\u20136 \u2014 before many people even know they're pregnant.",
  },
  {
    question: "What is vernix caseosa?",
    options: ["A prenatal supplement", "A waxy coating on newborn skin", "A type of ultrasound"],
    answerIndex: 1,
    explanation: "Vernix caseosa is the white, creamy coating that protects your baby's skin in the womb. It also has antibacterial properties and helps with temperature regulation after birth.",
  },
  {
    question: "How many movements in 2 hours is generally considered healthy at 28+ weeks?",
    options: ["2 movements", "6 movements", "10 movements"],
    answerIndex: 2,
    explanation: "Most guidelines suggest feeling at least 10 movements in 2 hours. If you notice a significant change in your baby's movement pattern, contact your midwife or doctor.",
  },
]

const INFANT_QUIZZES: QuizQuestion[] = [
  {
    question: "How many hours per day does a typical newborn sleep?",
    options: ["10\u201312 hours", "12\u201314 hours", "14\u201317 hours"],
    answerIndex: 2,
    explanation: "Newborns sleep 14\u201317 hours a day \u2014 but in short stretches of 2\u20134 hours, which doesn't feel restful for parents! Their sleep cycles are shorter than adults' and they wake easily.",
  },
  {
    question: "At what age do most babies start social smiling?",
    options: ["2 weeks", "6\u20138 weeks", "4 months"],
    answerIndex: 1,
    explanation: "The first \"real\" social smile \u2014 in response to your face or voice \u2014 typically appears around 6\u20138 weeks. It's one of the most rewarding milestones in early parenthood.",
  },
  {
    question: "What does \"rooming-in\" mean in safe sleep guidelines?",
    options: ["Baby sleeping in the same bed", "Baby sleeping in the same room", "Baby sleeping in the nursery"],
    answerIndex: 1,
    explanation: "Rooming-in means baby sleeps in a separate safe space (like a bassinet) in your room. The AAP recommends this for at least the first 6 months to reduce SIDS risk and support feeding.",
  },
  {
    question: "The \"period of PURPLE crying\" usually peaks at what age?",
    options: ["1\u20132 weeks", "6\u20138 weeks", "4\u20135 months"],
    answerIndex: 1,
    explanation: "The PURPLE crying phase peaks around 6\u20138 weeks and typically resolves by 3\u20134 months. PURPLE stands for: Peak, Unexpected, Resists soothing, Pain-like face, Long lasting, Evening clustering.",
  },
  {
    question: "When should you start tummy time?",
    options: ["After 6 weeks", "From day one (awake and supervised)", "After the first check-up"],
    answerIndex: 1,
    explanation: "Tummy time can start from day one, for short periods while baby is awake and you're watching. It builds neck and shoulder strength and prevents positional plagiocephaly (flat spots).",
  },
  {
    question: "At what age do babies typically start rolling over?",
    options: ["2 months", "4\u20136 months", "8 months"],
    answerIndex: 1,
    explanation: "Most babies start rolling from tummy to back around 4\u20135 months, and back to tummy slightly later. Regular tummy time helps build the strength they need for this milestone.",
  },
  {
    question: "What colours can newborns see most clearly?",
    options: ["Pastels and soft tones", "High-contrast black and white", "Bright primary colours"],
    answerIndex: 1,
    explanation: "Newborns can only focus about 20\u201330cm from their face and see contrast much better than colour. High-contrast black-and-white patterns are most stimulating for their developing visual system.",
  },
  {
    question: "When does the soft spot (fontanelle) on a baby's head typically close?",
    options: ["3\u20136 months", "6\u20139 months", "12\u201318 months"],
    answerIndex: 2,
    explanation: "The soft spot usually closes between 12\u201318 months. It allows the skull to flex during birth and gives the brain room to grow rapidly. You can touch it gently \u2014 it won't hurt your baby.",
  },
  {
    question: "What age does the AAP recommend introducing solid foods?",
    options: ["3\u20134 months", "Around 6 months", "9\u201312 months"],
    answerIndex: 1,
    explanation: "The AAP and WHO recommend starting solids around 6 months, when babies show signs of readiness: sitting with minimal support, showing interest in food, and having lost the tongue-thrust reflex.",
  },
  {
    question: "What is the safest sleep environment for an infant?",
    options: ["Soft mattress with bumpers", "Firm, flat surface alone in a cot or bassinet", "Co-sleeping in an adult bed"],
    answerIndex: 1,
    explanation: "The ABCs of safe sleep: Alone, on their Back, in a Cot (or bassinet). A firm, flat, bare surface reduces SIDS risk. No pillows, blankets, bumpers, or soft toys in the sleep space.",
  },
]

const TODDLER_QUIZZES: QuizQuestion[] = [
  {
    question: "How many words should most 18-month-olds know?",
    options: ["5\u201310 words", "20\u201350 words", "100+ words"],
    answerIndex: 1,
    explanation: "Most 18-month-olds know around 20\u201350 words, but there's a wide normal range. What matters more is that they're communicating \u2014 with words, gestures, and eye contact. Talk to your paediatrician if you have concerns.",
  },
  {
    question: "What's the recommended max daily screen time for toddlers aged 2\u20135?",
    options: ["30 minutes", "1 hour", "2 hours"],
    answerIndex: 1,
    explanation: "The WHO and AAP recommend no more than 1 hour of quality screen time per day for 2\u20135 year olds, ideally watched together so you can talk about what you're seeing.",
  },
  {
    question: "At what age do toddlers typically start showing empathy?",
    options: ["12 months", "18\u201324 months", "36 months"],
    answerIndex: 1,
    explanation: "Empathy begins emerging around 18\u201324 months. You might see your toddler trying to comfort a crying friend or offering their favourite toy to someone upset \u2014 a beautiful developmental moment.",
  },
  {
    question: "Why do toddlers repeat the same books or activities over and over?",
    options: ["Limited attention span", "They're building neural pathways", "They're bored of new things"],
    answerIndex: 1,
    explanation: "Repetition is how toddlers learn! Each time they hear the same story or do the same activity, their brain strengthens neural pathways. It's a sign of healthy cognitive development, not boredom.",
  },
  {
    question: "What is \"parallel play\" and when does it typically appear?",
    options: ["Playing together, age 18 months", "Playing alongside but separately, age 18\u201324 months", "Taking turns, age 3\u20134 years"],
    answerIndex: 1,
    explanation: "Parallel play \u2014 where toddlers play next to each other but independently \u2014 typically begins around 18\u201324 months. It's a normal and important step before cooperative play develops.",
  },
  {
    question: "What causes most toddler tantrums?",
    options: ["Bad behaviour", "Emotional regulation skill gaps", "Attention-seeking"],
    answerIndex: 1,
    explanation: "Tantrums happen because the prefrontal cortex \u2014 responsible for emotional regulation \u2014 is still developing. Toddlers literally can't manage big emotions yet. They're not manipulating you; they're overwhelmed.",
  },
  {
    question: "How many hours of sleep does a 2-year-old typically need (including naps)?",
    options: ["10\u201311 hours", "11\u201314 hours", "15\u201317 hours"],
    answerIndex: 1,
    explanation: "Toddlers aged 1\u20132 need 11\u201314 hours of sleep including naps. By age 3, naps may disappear for some children, though quiet rest time is still beneficial.",
  },
  {
    question: "What type of play best supports language development in toddlers?",
    options: ["Educational apps", "Back-and-forth conversations", "Watching educational TV"],
    answerIndex: 1,
    explanation: "Conversational \"serve and return\" interactions \u2014 where you respond to your toddler's sounds, words, and gestures \u2014 are the most powerful driver of language development. No screen can replicate it.",
  },
  {
    question: "By age 3, how many words can a typical toddler use?",
    options: ["About 50", "About 200", "Over 1,000"],
    answerIndex: 2,
    explanation: "Most 3-year-olds have a vocabulary of 1,000+ words and can hold simple conversations. Language development in the toddler years is remarkably rapid \u2014 often adding several new words each day.",
  },
  {
    question: "When is a toddler considered truly \"potty trained\"?",
    options: ["When they use the toilet alone", "When they stay dry for several hours", "When they reliably initiate toilet trips independently"],
    answerIndex: 2,
    explanation: "True potty training means your toddler independently recognises the urge and initiates toilet trips most of the time. This typically happens between 2\u20134 years, with a wide normal range.",
  },
]

const QUIZ_POOLS: Record<Stage, QuizQuestion[]> = {
  pregnancy: PREGNANCY_QUIZZES,
  infant: INFANT_QUIZZES,
  toddler: TODDLER_QUIZZES,
  postpartum: INFANT_QUIZZES,
}

// ---------------------------------------------------------------------------
// Picker utility (same deterministic rotation used across the app)
// ---------------------------------------------------------------------------

function pickByDayOfYear<T>(items: T[]): T {
  const start = new Date(new Date().getFullYear(), 0, 0)
  const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86_400_000)
  return items[dayOfYear % items.length]
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns the daily reflection question for the user's stage.
 * Rotates once per calendar day.
 */
export function getDailyQuestion(stage: Stage): DailyQuestion {
  return pickByDayOfYear(QUESTION_POOLS[stage])
}

/**
 * Returns the daily quiz question for the user's stage.
 * Uses an offset so it differs from the reflection question each day.
 */
export function getDailyQuiz(stage: Stage): QuizQuestion {
  const pool = QUIZ_POOLS[stage]
  const start = new Date(new Date().getFullYear(), 0, 0)
  const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86_400_000)
  // Offset by half the pool length so quiz and question never sync up
  const offset = Math.floor(pool.length / 2)
  return pool[(dayOfYear + offset) % pool.length]
}
