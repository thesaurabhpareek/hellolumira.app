/**
 * @module /api/cron/seed-stories
 * @description Cron endpoint: posts a new story from the Lumira Community
 *   profile every 4–5 hours. Rotates through a pool of tips, questions,
 *   and polls deterministically by slot index so stories never repeat
 *   within the same rotation cycle.
 *
 * Called by Vercel Cron — secured via CRON_SECRET header.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SYSTEM_PROFILE_ID = '00000000-0000-4000-8000-000000000001'

/* ── Story pool ─────────────────────────────────────────────────────────── */

type StoryDef =
  | { type: 'text';     text: string;     bg: string }
  | { type: 'question'; question: string; bg: string }
  | { type: 'poll';     question: string; optA: string; optB: string; bg: string }

const STORY_POOL: StoryDef[] = [
  // ── Text tips ────────────────────────────────────────────────────────────
  {
    type: 'text',
    text: '🍃 Iron-rich foods matter in pregnancy. Lean meats, lentils, spinach, and fortified cereals all support your growing baby\'s development. Pair them with vitamin C for better absorption.',
    bg: '#3D6B5A',
  },
  {
    type: 'text',
    text: '🧠 Your baby\'s brain develops most rapidly in the third trimester. Omega-3s found in fatty fish, walnuts, and flaxseeds support this process — even a small daily serving makes a difference.',
    bg: '#2D4A7A',
  },
  {
    type: 'text',
    text: '💤 Newborns sleep 14–17 hours a day, but not in long stretches. Waking every 2–3 hours is completely normal — their tiny stomachs need frequent refuelling.',
    bg: '#4A3D6B',
  },
  {
    type: 'text',
    text: '🤱 Skin-to-skin contact in the first hours after birth helps regulate your baby\'s temperature, heart rate, and stress hormones. It also supports milk production and bonding.',
    bg: '#6B3D4A',
  },
  {
    type: 'text',
    text: '🎵 Babies can hear sounds from about week 18 of pregnancy. Talking, reading, and playing music may feel early — but your voice is already familiar to them at birth.',
    bg: '#3D5A6B',
  },
  {
    type: 'text',
    text: '🌡️ A fever above 38°C (100.4°F) in a baby under 3 months is always a reason to seek medical care promptly — even if they otherwise seem well.',
    bg: '#6B4A3D',
  },
  {
    type: 'text',
    text: '🚗 Car seat safety tip: the chest clip should be at armpit level, and straps should pass the pinch test (no slack). Check this at every ride.',
    bg: '#3D6B4A',
  },
  {
    type: 'text',
    text: '🍼 If breastfeeding feels painful beyond the first few seconds of latch, it\'s worth getting support. A good latch shouldn\'t hurt — and lactation consultants can transform the experience.',
    bg: '#5A6B3D',
  },
  {
    type: 'text',
    text: '🌙 The "drowsy but awake" technique for putting babies to sleep helps them learn to self-settle over time. It doesn\'t have to be perfect — consistency matters more than technique.',
    bg: '#3D4A5A',
  },
  {
    type: 'text',
    text: '🌱 Around week 6, many parents notice a peak in fussiness — sometimes called the "6-week growth spurt." It usually passes within a week. You\'re doing great.',
    bg: '#5A3D6B',
  },
  {
    type: 'text',
    text: '💊 Folic acid before and early in pregnancy significantly reduces the risk of neural tube defects. Most guidelines recommend starting at least 1 month before conception.',
    bg: '#2D6A7A',
  },
  {
    type: 'text',
    text: '👶 Tummy time from day one (when awake and supervised) builds the neck and shoulder strength babies need to roll, sit, and eventually crawl. Start with just 1–2 minutes at a time.',
    bg: '#7A4A2D',
  },
  {
    type: 'text',
    text: '🧴 Baby massage using plain vegetable or sunflower oil (not mineral oil) can soothe a fussy baby, improve sleep, and strengthen the parent–infant bond.',
    bg: '#4A6B3D',
  },
  {
    type: 'text',
    text: '📱 Postpartum mental health matters. One in five new parents experience postpartum depression or anxiety — and it\'s treatable. Talking to your provider is always the right move.',
    bg: '#3D3D6B',
  },
  {
    type: 'text',
    text: '🦷 Teething usually starts between 4–7 months, though the range is wide. A cold teething ring, gentle gum massage, or a clean damp cloth can help ease discomfort.',
    bg: '#6B5A3D',
  },
  {
    type: 'text',
    text: '🥑 Starting solids is usually recommended around 6 months — look for signs of readiness like head control, sitting with support, and interest in food. Age alone isn\'t the only signal.',
    bg: '#3D6A4A',
  },
  {
    type: 'text',
    text: '🌿 Preconception health matters too. Both partners\' nutrition, sleep, and stress levels can influence fertility and early fetal development. It\'s never too early to start.',
    bg: '#4A5C3D',
  },
  {
    type: 'text',
    text: '🏃 Gentle movement during pregnancy — like walking, swimming, or prenatal yoga — supports circulation, mood, sleep, and can ease common discomforts. Listen to your body.',
    bg: '#3D5C6B',
  },

  // ── Questions ────────────────────────────────────────────────────────────
  {
    type: 'question',
    question: 'What surprised you most about the first week home with your baby? 🏠',
    bg: '#4A3D6B',
  },
  {
    type: 'question',
    question: 'If you could send a message to yourself at the start of your pregnancy, what would you say? 💌',
    bg: '#3D6B5A',
  },
  {
    type: 'question',
    question: 'What\'s the best piece of parenting advice you\'ve received — or ignored? 😊',
    bg: '#6B3D4A',
  },
  {
    type: 'question',
    question: 'What\'s one small thing that\'s made a big difference for you lately? ✨',
    bg: '#2D4A7A',
  },
  {
    type: 'question',
    question: 'What do you wish there was more honest conversation about in early parenthood? 🤍',
    bg: '#5A6B3D',
  },
  {
    type: 'question',
    question: 'How are you taking care of yourself this week — even just a little? 🌿',
    bg: '#3D4A6B',
  },
  {
    type: 'question',
    question: 'What\'s your baby\'s current favourite thing? Doesn\'t matter how small! 👶',
    bg: '#6B4A2D',
  },

  // ── Polls ────────────────────────────────────────────────────────────────
  {
    type: 'poll',
    question: 'Where do you turn first when you have a parenting question?',
    optA: '📱 Search / apps',
    optB: '👩‍👩‍👧 Family or friends',
    bg: '#3D5A6B',
  },
  {
    type: 'poll',
    question: 'How would you describe your sleep right now?',
    optA: '☠️ What is sleep',
    optB: '😴 Managing okay',
    bg: '#5A3D6B',
  },
  {
    type: 'poll',
    question: 'Are you planning a birth announcement?',
    optA: '📸 Yes, sharing widely',
    optB: '🤫 Keeping it close',
    bg: '#3D6B4A',
  },
  {
    type: 'poll',
    question: 'How prepared did you feel on your baby\'s first day home?',
    optA: '✅ More ready than expected',
    optB: '😅 Nothing could prepare me',
    bg: '#6B3D5A',
  },
  {
    type: 'poll',
    question: 'Feeding method right now?',
    optA: '🤱 Breastfeeding / pumping',
    optB: '🍼 Formula / combo',
    bg: '#4A6B3D',
  },
  {
    type: 'poll',
    question: 'Who has been your biggest support?',
    optA: '💑 Partner',
    optB: '👨‍👩‍👧 Family / friends',
    bg: '#3D4A5A',
  },
  {
    type: 'poll',
    question: 'How\'s your confidence feeling this week?',
    optA: '📈 Growing every day',
    optB: '🌊 Still finding my footing',
    bg: '#6B5A3D',
  },
]

/* ── Handler ────────────────────────────────────────────────────────────── */

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // Determine which story to post using current UTC hour slot (every 4h = 6 slots/day)
  const now = new Date()
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000,
  )
  const slotInDay = Math.floor(now.getUTCHours() / 4) // 0–5
  const slotsPerDay = 6
  const slot = (dayOfYear * slotsPerDay + slotInDay) % STORY_POOL.length
  const pick = STORY_POOL[slot]

  // Build insert row
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row: Record<string, any> = {
    profile_id: SYSTEM_PROFILE_ID,
    story_type: pick.type,
    text_bg_color: pick.bg,
    text_color: '#FFFFFF',
    visibility: 'everyone',
    expires_at: expiresAt,
  }

  if (pick.type === 'text') {
    row.text_content = pick.text
  } else if (pick.type === 'question') {
    row.question_text = pick.question
  } else if (pick.type === 'poll') {
    row.poll_question = pick.question
    row.poll_option_a = pick.optA
    row.poll_option_b = pick.optB
  }

  const { data, error } = await supabase.from('stories').insert(row).select('id').single()

  if (error) {
    console.error('[seed-stories] insert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log(`[seed-stories] Posted story ${data.id} (slot ${slot}/${STORY_POOL.length - 1}): ${pick.type}`)
  return NextResponse.json({ ok: true, storyId: data.id, slot, type: pick.type })
}
