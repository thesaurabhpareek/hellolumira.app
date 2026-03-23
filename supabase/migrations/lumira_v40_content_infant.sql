-- Lumira v40: Infant Stage Content (2–12 months / weeks 8–52)
-- 50 articles covering development, sleep, feeding/solids, health, play, and parent wellbeing
-- Medical disclaimer included in every article body
-- Sources: AAP, WHO, NHS, CDC

-- ============================================================
-- DEVELOPMENT MILESTONES
-- ============================================================

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'milestones',
  'Your 2–3 Month Old: Social Smiles, Cooing, and Tracking',
  $$## What to Expect at 2–3 Months

Between weeks 8 and 12, your baby transforms from a sleepy newborn into a socially aware little person. These weeks are often described by parents as "the magic moment" — and for good reason.

**Social Smiling**

The first real, intentional smile — known as a social smile — typically appears between 6 and 8 weeks. Unlike the reflex smiles of the newborn period, these smiles are directed at you. Your baby is learning that faces are interesting, safe, and rewarding. Smile back, talk, and let the exchange go back and forth.

**Cooing and Early Vocalisation**

Around 8–12 weeks, most babies begin making soft cooing or gurgling sounds. These are your baby's first attempts at conversation. Respond warmly and give them time to "talk" back — this turn-taking is the foundation of language development.

**Visual Tracking**

Your baby''s vision is sharpening. By 3 months, most babies can track a moving object across their full field of vision and will turn their head to follow sounds and faces. Hold a toy or your face about 20–30 cm away and move it slowly side to side.

**How to Support Development**

- Spend time face-to-face at feeding and changing times
- Narrate what you are doing ("Now I''m putting on your nappy — there we go!")
- Use a variety of facial expressions and tones of voice
- Give supervised tummy time daily to build neck and shoulder strength

**When to Mention to Your Doctor**

If by 12 weeks your baby is not making eye contact, not responding to your face or voice, or not producing any cooing sounds, mention this at your next check-up.

*This article is for informational purposes only and does not constitute medical advice. Always consult your healthcare provider with concerns about your baby''s development.*$$,
  8,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'NHS UK', 'Zero to Three'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-milestones-2-3-months-smiling-cooing-tracking'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'milestones',
  'Your 4–5 Month Old: Rolling, Hand Discovery, and Laughing',
  $$## Weeks 16–20: Big Motor and Social Leaps

The 4–5 month window is packed with exciting firsts. Your baby is growing stronger, more curious, and far more fun to be around.

**Rolling Over**

Most babies begin rolling from tummy to back first, around 4 months, followed by back to tummy closer to 5 months. Rolling is a sign of growing core and arm strength. Always supervise floor time and never leave your baby unattended on a raised surface — rolling can happen suddenly and unexpectedly.

**Hand Discovery**

Watch your baby stare at their own hands in fascination. They are figuring out that those things at the end of their arms are actually theirs and under their control. Expect lots of hand-to-mouth action, batting at dangling toys, and attempts to grasp objects placed near them.

**Laughing**

The first proper belly laugh is one of parenthood''s great joys. Gentle tickles, funny faces, and silly sounds are all likely triggers. Laughter is a social milestone — it shows your baby trusts you and feels safe enough to express delight.

**Supporting Development**

- Offer age-appropriate rattles and soft toys to encourage reaching and grasping
- Continue daily tummy time — aim for 20–30 minutes spread across the day
- Play peek-a-boo to build anticipation and joy
- Read board books with high-contrast images

**A Note on Variation**

All babies develop at their own pace. Rolling can appear anywhere from 3 to 6 months and still be entirely typical. If you have concerns, your health visitor or GP is your best first point of contact.

*This article is for informational purposes only and does not constitute medical advice. Always consult your healthcare provider with concerns about your baby''s development.*$$,
  16,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'NHS UK', 'CDC Developmental Milestones'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-milestones-4-5-months-rolling-hands-laughing'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'milestones',
  'Your 5–6 Month Old: Sitting with Support, Babbling, and Object Permanence',
  $$## Weeks 20–24: A World Opening Up

At 5–6 months, your baby is becoming aware that the world is a rich, interesting place — and they want to explore it.

**Sitting with Support**

Most babies can sit with support from a caregiver or cushions around 5 months. Their back and core muscles are still developing, so they will wobble. By 6 months, many babies begin to tripod sit — leaning forward on their hands for balance. Avoid propping them in a seated position for long periods before they are ready, as this can interrupt natural motor sequencing.

**Babbling**

Those early coos evolve into consonant-vowel combinations: "ba," "ma," "da." This babbling is your baby practising the sounds of your language. Respond as if they''re saying something meaningful — because to them, they are. This back-and-forth is a vital precursor to real words.

**The Beginning of Object Permanence**

Before now, "out of sight" was truly "out of mind." Around 5–6 months, babies begin to understand that objects continue to exist even when they can''t see them. You may notice your baby looking for a toy that has rolled away or reaching for your face when you briefly cover it. This is a significant cognitive leap.

**What You Can Do**

- Play simple hiding games — hide a toy under a cloth and watch them search
- Sit on the floor and play together, supporting their emerging seated position
- Narrate and respond to every babble and sound
- Offer different textures, shapes, and sizes of safe objects to explore

*This article is for informational purposes only and does not constitute medical advice. Always consult your healthcare provider with concerns about your baby''s development.*$$,
  20,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Zero to Three', 'NHS UK'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-milestones-5-6-months-sitting-babbling-object-permanence'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'milestones',
  'Your 6–8 Month Old: Independent Sitting, Stranger Anxiety, and Reaching',
  $$## Weeks 24–32: Building Independence and Social Awareness

The 6–8 month period brings both exciting independence and some new emotional complexity.

**Sitting Independently**

By 6–7 months, most babies can sit without support for short periods. By 8 months, many sit confidently and can pivot to reach toys around them. This frees their hands for exploration and marks a major shift in how they interact with the world.

**Stranger Anxiety**

If your easy-going baby suddenly cries when a relative reaches for them, this is completely normal. Stranger anxiety emerges because your baby now recognises you as their safe base — and everyone else is potentially uncertain. Handle it with empathy: give your baby time to warm up and don''t force interactions.

**Reaching, Grabbing, and Transferring**

Babies at this stage love to grab everything within reach. They are also learning to pass objects from hand to hand, a skill called transferring. Offer safe household items — a wooden spoon, a small Tupperware — alongside proper toys.

**What to Encourage**

- Floor play with a variety of textures and shapes
- Social time with familiar people to gently broaden their comfort zone
- Singing and repetitive games like "round and round the garden"
- Begin reading simple board books with few words and bold images

**Signs to Discuss with Your GP**

If your baby is not sitting with support by 9 months, not reaching for objects, or showing no social interaction, raise this at your next appointment.

*This article is for informational purposes only and does not constitute medical advice. Always consult your healthcare provider with concerns about your baby''s development.*$$,
  24,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'NHS UK', 'CDC Developmental Milestones'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-milestones-6-8-months-sitting-stranger-anxiety-reaching'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'milestones',
  'Your 8–10 Month Old: Crawling, Pulling to Stand, and Pincer Grip',
  $$## Weeks 32–40: On the Move

Eight to ten months is when many babies shift from stationary to mobile — and your home will never be the same.

**Crawling — in All Its Variations**

Not all babies crawl in the classic hands-and-knees style. Some shuffle on their bottom, some commando crawl on their belly, others roll everywhere. All of these are valid ways to get around. What matters is that your baby is finding a way to move purposefully through space.

**Pulling to Stand**

As soon as your baby discovers they can pull up on furniture, they will do it constantly. Expect plenty of wobbles and tumbles — this is part of how they learn. Ensure furniture is stable and that there are no sharp edges at head height.

**The Pincer Grip**

Watch for your baby using their thumb and index finger together to pick up small objects. This usually begins around 9 months and is a significant fine motor milestone. It also means small objects become a serious choking hazard — now is the time to get the floor very clean.

**Encouraging Development**

- Create a safe, padded play space for free exploration
- Offer finger foods of appropriate size (soft pea-sized pieces) to practise the pincer grip
- Stack cups and simple containers encourage cause-and-effect learning
- Walk with your baby holding both your hands to build confidence

**Baby-Proofing Reminder**

With mobility comes risk. Stair gates, cabinet locks, and socket covers should all be in place by now.

*This article is for informational purposes only and does not constitute medical advice. Always consult your healthcare provider with concerns about your baby''s development.*$$,
  32,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'NHS UK', 'Zero to Three'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-milestones-8-10-months-crawling-pulling-pincer'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'milestones',
  'Your 10–12 Month Old: Cruising, First Words, Waving, and Pointing',
  $$## Weeks 40–48: The Edge of Toddlerhood

The final stretch of infancy brings a flurry of communication and motor milestones that hint at the toddler just around the corner.

**Cruising**

Cruising is walking while holding on to furniture for support. Your baby may have started pulling to stand at 8–9 months; now they are beginning to side-step along the sofa. This builds the strength and balance needed for independent walking, which most babies achieve somewhere between 9 and 15 months.

**First Words**

Around 10–12 months, many babies produce their first recognisable words — "mama," "dada," "more," "no." A word at this stage means your baby uses it consistently to refer to something specific. Continue to narrate your day, read aloud, and respond enthusiastically to every attempt at communication.

**Waving Bye-Bye**

Social gestures like waving emerge as your baby imitates what they see you do. Wave hello and goodbye consistently, and your baby will soon wave back — a delightful sign of shared attention and social understanding.

**Pointing**

Pointing is one of the most important milestones of the first year. When your baby points at something and looks at you — they are sharing their attention with you. This is called joint attention and it underpins language, social connection, and learning.

**What to Watch For**

By 12 months, most babies wave, point, and say at least one or two words. If these are not present, discuss with your GP or health visitor — early support makes a significant difference.

*This article is for informational purposes only and does not constitute medical advice. Always consult your healthcare provider with concerns about your baby''s development.*$$,
  40,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'NHS UK', 'CDC Developmental Milestones'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-milestones-10-12-months-cruising-first-words-waving-pointing'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'development',
  'Red Flags in Infant Development — When to Bring Up Concerns',
  $$## Knowing When to Ask

Every baby develops at their own pace, and there is a wide range of "typical." But there are certain signs that warrant a conversation with your GP or health visitor — not because something is definitely wrong, but because early support, when needed, is always better than waiting.

**Red Flags by Age**

**By 3 months:**
- Not making eye contact or responding to faces
- No smiling or social response
- Not reacting to loud sounds

**By 6 months:**
- Not reaching for objects
- No babbling or cooing
- Not laughing or making squealing sounds
- Does not seem to recognise familiar faces

**By 9 months:**
- Not sitting with support
- No back-and-forth gestures or sounds
- Not responding to their own name

**By 12 months:**
- No waving, pointing, or other gestures
- No words at all
- Not following simple directions
- Loss of any previously acquired skill (always urgent)

**How to Bring It Up**

You don''t need a specific reason to raise a concern — "I''ve noticed X and wanted to check in" is enough. Trust your instincts. Parents are often the first to sense that something is different, and clinicians take parental concern seriously.

**What Happens Next**

Raising a concern does not automatically mean there is a problem. It may lead to a referral for assessment, watchful waiting with a follow-up, or reassurance. Either way, you will have more information — and that is always better.

*This article is for informational purposes only and does not constitute medical advice. Always consult your healthcare provider with concerns about your baby''s development.*$$,
  24,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'NHS UK', 'CDC ''Learn the Signs. Act Early.'''],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-development-red-flags-when-to-seek-help'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'development',
  'Fine Motor Skills — How to Encourage Hand and Finger Development',
  $$## Small Hands, Big Learning

Fine motor skills refer to the small, precise movements of the hands and fingers. In infancy, these skills develop rapidly and lay the groundwork for feeding, writing, and self-care in later years.

**The Progression**

- **3–4 months**: Swiping and batting at objects
- **4–5 months**: Grasping objects placed in the palm (palmar grasp)
- **6–7 months**: Transferring objects from hand to hand
- **8–9 months**: Raking objects toward themselves
- **9–10 months**: Emerging pincer grip (thumb and index finger)
- **11–12 months**: Refined pincer grip; poking with one finger; stacking

**How to Encourage Fine Motor Development**

- Offer a variety of safe objects of different shapes, textures, and sizes
- Let your baby self-feed finger foods — messy but invaluable for hand control
- Provide stacking cups, shape sorters, and pop-up toys
- Encourage water play and sand play when age-appropriate
- Let them press buttons, turn pages of board books, and explore musical toys

**Why It Matters**

Fine motor development is closely linked to cognitive development. When a baby manipulates an object — turning it, mouthing it, banging it — they are building understanding of the physical world. The hands are, in many ways, the brain''s primary research tool in the first year.

**When to Talk to Your Doctor**

If your baby is not grasping objects by 5 months, not transferring between hands by 7 months, or not developing any pincer grip by 12 months, raise this with your health visitor or GP.

*This article is for informational purposes only and does not constitute medical advice. Always consult your healthcare provider with concerns about your baby''s development.*$$,
  16,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'NHS UK', 'Zero to Three'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-development-fine-motor-skills-hands-fingers'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'development',
  'Gross Motor Skills — From Rolling to Walking Readiness',
  $$## The Big Movements of the First Year

Gross motor skills involve the large muscle groups — the core, arms, and legs — and underpin every physical milestone of infancy, from rolling to cruising toward first steps.

**The Typical Sequence**

- **3–4 months**: Head control improves; pushes up on arms during tummy time
- **4–5 months**: Rolls tummy to back
- **5–6 months**: Rolls back to tummy; begins to bear weight on legs when held standing
- **6–7 months**: Sits with support; tripod sits
- **7–8 months**: Sits independently; starts to lunge forward
- **8–9 months**: Crawling begins (in any style); pulls to stand
- **9–10 months**: Cruising along furniture
- **10–15 months**: First independent steps

**Tummy Time Is the Foundation**

Supervised tummy time, ideally started from birth, builds the neck, shoulder, and core strength that underpins every subsequent gross motor milestone. Aim for short, frequent sessions spread throughout the day.

**How to Support Gross Motor Growth**

- Give maximum floor time and minimum time in bouncers, swings, and car seats when not travelling
- Never use a baby walker — they delay gross motor development and are a serious safety risk
- Let your baby practise pulling to stand and cruising without immediately "rescuing" them from wobbles
- Swimming and water play are excellent for building strength and body awareness

**Normal Variation**

Not all babies crawl before they walk — some go straight to cruising. The sequence matters more than the exact timing.

*This article is for informational purposes only and does not constitute medical advice. Always consult your healthcare provider with concerns about your baby''s development.*$$,
  16,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'NHS UK', 'CDC Developmental Milestones'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-development-gross-motor-rolling-to-walking'
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- INFANT SLEEP
-- ============================================================

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'sleep',
  'The 4-Month Sleep Regression — What Causes It and How to Survive It',
  $$## Why Sleep Suddenly Gets Harder

Just when you thought you were turning a corner, your baby starts waking every hour. Welcome to the 4-month sleep regression — arguably the most disruptive sleep shift of the entire first year.

**What Is Actually Happening**

Around 3.5–4 months, your baby''s sleep architecture permanently matures. Newborns cycle between light and deep sleep quite simply. After this developmental shift, they cycle through multiple sleep stages — just like adults — including a light stage where they partially rouse between sleep cycles. Adults roll over and fall back asleep unconsciously. Babies, who haven''t yet learned to resettle independently, wake fully and call for you.

**Signs You''re In It**

- Dramatic increase in night wakings (possibly every 45–90 minutes)
- Short naps (the infamous 30–45 minute "catnap")
- Increased fussiness and clinginess during the day
- Baby seems tired but fights sleep

**How to Respond**

There is no way to prevent this regression — it is developmental, not a problem you caused. However, how you respond can shape what comes next:

- **Introduce a bedtime routine** if you haven''t already — bath, feed, wind-down, bed
- **Put baby down drowsy but awake** when you can, to begin building independent sleep associations
- **Keep the room dark and use white noise** to smooth the transitions between sleep cycles

**Will It End?**

Yes — typically within 2–6 weeks. For some families it resolves on its own; others choose to use this window to begin more formal sleep shaping.

*This article is for informational purposes only and does not constitute medical advice. Always consult your healthcare provider with concerns about your baby''s sleep.*$$,
  16,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'NHS UK', 'Sleep Foundation'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-4-month-regression'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'sleep',
  'Sleep Training Methods Compared — CIO, Ferber, Chair, Fading, and Pick-Up-Put-Down',
  $$## Choosing an Approach That Works for Your Family

Sleep training is one of the most debated topics in parenting. The good news: multiple methods are supported by evidence, and choosing the right one is about fit for your family — not a moral judgement.

**Cry-It-Out (Extinction)**
Baby is placed in the cot awake and left to fall asleep without parental intervention. Research consistently shows this is safe and effective. It is not for every family emotionally, but there is no evidence it causes harm.

**Ferber Method (Graduated Extinction)**
Parents check in at increasing intervals (e.g., 3, 5, 10 minutes) without picking the baby up, offering brief reassurance. Widely used and well-studied. Often leads to results within 5–7 nights.

**Chair Method (Sleep Lady Shuffle)**
A parent sits in a chair next to the cot, gradually moving further away over 1–2 weeks. More parental presence, slower results, but gentler for families not comfortable with more crying.

**Fading / Parental Presence Fading**
Gradual withdrawal of whatever the current sleep association is — whether feeding, rocking, or patting. Very slow and gentle; requires consistency over several weeks.

**Pick-Up-Put-Down (PUPD)**
Baby is placed down awake; if they cry, parent picks up to calm, then puts back down. Can be effective but is often stimulating for older babies who become more awake with each pick-up.

**What All Methods Share**

Regardless of method: a consistent bedtime routine, an age-appropriate schedule, and parental consistency are more predictive of success than the specific technique.

**When to Begin**

Most sleep consultants and paediatricians suggest no formal sleep training before 4–6 months. Always discuss with your health provider first.

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.*$$,
  16,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Sleep Foundation', 'Mindell et al. (2006) Sleep'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-training-methods-compared'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'sleep',
  'Nap Transitions — From 4 Naps to 3 to 2',
  $$## How Daytime Sleep Evolves in the First Year

Daytime sleep changes dramatically across the first year. Understanding these transitions helps you avoid over-tiredness and the night-waking that comes with it.

**The 4-to-3 Nap Transition (Around 3–4 Months)**

Newborns nap frequently throughout the day. Around 3–4 months, most babies consolidate to 3 naps: a morning nap, an afternoon nap, and a short late-afternoon catnap. Signs it''s time: the fourth nap is a battle, bedtime is being pushed late, or night sleep is improving.

**The 3-to-2 Nap Transition (Around 6–8 Months)**

The late-afternoon catnap disappears. This is often the trickiest transition because it creates a longer awake window in the afternoon — and an overtired baby by bedtime. During the transition, bring bedtime temporarily earlier (6–6:30pm) to compensate.

Signs of readiness for 2 naps:
- Consistently fighting the third nap
- Two naps are long and restorative
- Total daytime sleep is 2.5–3.5 hours on two naps

**The 2-to-1 Transition (Around 12–18 Months)**

This one usually happens in the toddler stage. At 12 months, most babies still need two naps, though some ready-early babies begin moving to one around 12 months.

**General Nap Principles**

- Watch for tired cues rather than watching the clock
- Keep the sleep environment consistent (dark room, white noise)
- Avoid naps too close to bedtime — aim for bedtime 1.5–2 hours after the last nap ends

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.*$$,
  16,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Huckleberry Sleep', 'Taking Cara Babies'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-nap-transitions-4-to-2'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'sleep',
  'The 8–10 Month Sleep Regression — Separation Anxiety and Night Waking',
  $$## Why Sleep Gets Hard Again at 8–10 Months

Just as you settled into a rhythm, the 8–10 month regression arrives. This one is driven by a perfect storm of developmental change.

**What''s Behind It**

- **Separation anxiety**: Your baby now fully understands object permanence — meaning they know you exist even when you''re not there. And they want you. Badly. This is cognitively sophisticated behaviour, not manipulation.
- **Motor development**: Crawling, pulling to stand, cruising — major gross motor leaps often disrupt sleep as the brain consolidates new skills overnight.
- **New awareness**: Your baby''s world is expanding rapidly. There is a lot to process.

**What It Looks Like**

- Increased night waking after a period of better sleep
- Difficulty settling at bedtime — crying when you leave the room
- Early morning waking
- Separation distress at nap time

**How to Respond**

- **Maintain your sleep routine** — consistency is the antidote to anxiety
- **Brief, boring check-ins** reassure without reinforcing waking
- **Practise separation during the day** — short periods out of sight, with a warm return, build trust
- **Avoid creating new sleep associations** that you are not happy to maintain long-term (e.g., bringing baby into bed if that''s not your plan)

**Duration**

Most regressions at this age last 2–6 weeks. Keeping your routine intact is the single most helpful thing you can do.

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.*$$,
  32,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Sleep Foundation', 'NHS UK'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-8-10-month-regression-separation-anxiety'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'sleep',
  'Moving Baby to Their Own Room — When and How to Make the Transition',
  $$## Room-Sharing to Independent Sleep

Current safe sleep guidelines from the AAP recommend room-sharing (but not bed-sharing) for at least the first 6 months, and ideally the first year. When you''re ready to move your baby to their own room, the transition can go smoothly with the right approach.

**When Is the Right Time?**

There is no single "right" time. Many families move their baby between 6 and 9 months. Some wait until 12 months. Consider:
- Is your baby waking more because they can hear/smell you?
- Are you sleeping worse because of their normal sleep sounds?
- Do you feel ready?

**Making the Transition**

1. **Start with the nap**: Put your baby down for one nap a day in their own room first, so the space feels familiar.
2. **Keep the routine identical**: Same bath, feed, songs, wind-down — just a different room.
3. **Use a monitor**: A video monitor helps you trust the space without needing to physically check.
4. **Match the sleep environment**: Same white noise machine, same room temperature, same dark conditions.
5. **Expect a few rough nights**: Any environmental change can temporarily disrupt sleep. Stay consistent.

**Safe Sleep in Their Own Room**

- Firm, flat sleep surface — approved cot or Moses basket
- No loose bedding, pillows, or soft toys in the sleep space
- Room temperature 16–20°C
- Continue placing baby on their back to sleep

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.*$$,
  16,
  true,
  ARRAY['American Academy of Pediatrics (AAP) Safe Sleep Guidelines', 'NHS UK', 'The Lullaby Trust'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-moving-baby-own-room'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'sleep',
  'Teething and Sleep — Managing Night Waking During Teething',
  $$## When Sore Gums Disrupt the Night

Teething typically begins between 4 and 7 months, though some babies teethe earlier or later. The discomfort — which peaks in the 1–2 days before and after a tooth breaks through — can interfere with sleep.

**How Teething Disrupts Sleep**

Gum pressure and pain are typically worse at night when there are fewer distractions. You may notice your baby:
- Waking more frequently than usual
- Difficult to settle back to sleep
- Drooling more, chewing on hands, or fussier than normal during the day

**What Actually Helps**

- **Cold teething rings** (not frozen — too hard for gums): Chill in the fridge, not the freezer
- **Gentle gum massage** with a clean finger before bed
- **Infant paracetamol or ibuprofen** at the appropriate age and dose, if your baby is clearly in pain — discuss with your pharmacist or GP first
- **Extra comfort** at night — brief reassurance without creating new long-term habits

**What Doesn''t Help**

- Teething gels containing lidocaine — not recommended for infants due to safety concerns
- Amber teething necklaces — these pose a choking and strangulation risk and have no evidence of effectiveness

**Keeping Perspective**

Teething discomfort is real but temporary. Most teeth cause disruption for only a day or two each. Once the tooth is through, sleep usually returns to its previous pattern.

*This article is for informational purposes only and does not constitute medical advice. Always consult your healthcare provider before giving any medication to your baby.*$$,
  24,
  true,
  ARRAY['NHS UK', 'American Academy of Pediatrics (AAP)', 'Oral Health Foundation'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-teething-night-waking'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'sleep',
  'Early Waking — Why Babies Wake at 5am and What to Do',
  $$## The Dawn Chorus Problem

A baby who reliably wakes at 5am regardless of what time they went to bed is one of the most common — and exhausting — infant sleep complaints.

**Why It Happens**

Sleep is governed by two forces: sleep pressure (how tired you are) and circadian rhythm (your body clock). In the early morning hours, sleep pressure is low and the circadian clock is signalling "time to wake." At this point, even a slight disturbance — light, sound, a brief partial waking — can tip a baby into full wakefulness.

**Common Causes of Early Waking**

- **Too much light in the morning**: Even small amounts of dawn light can trigger waking. Blackout blinds are often transformative.
- **Overtiredness**: Counterintuitively, a baby who goes to bed too late or naps too little often wakes earlier.
- **Too-early bedtime for their age**: Rare, but some babies genuinely need a later bedtime.
- **Hunger**: Common in younger babies or those going through growth spurts.
- **Developmental phase**: Early waking often clusters around developmental leaps.

**What to Try**

1. Install true blackout blinds
2. Add white noise to mask early morning sounds
3. Review wake windows and nap schedule — is your baby overtired?
4. If they are 6+ months, resist immediately rushing in — give them 5–10 minutes to see if they resettle
5. Try a "dream feed" in older babies to top up overnight calories

**Realistic Expectations**

Some babies are biologically early risers. Before 6am is a reasonable goal. 5am may simply be their natural wake time.

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.*$$,
  12,
  true,
  ARRAY['Sleep Foundation', 'NHS UK', 'American Academy of Pediatrics (AAP)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-early-waking-5am'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'sleep',
  'Building a Sleep Routine — Bath, Book, Feed, Bed',
  $$## Why Routine Is Your Sleep Superpower

A consistent bedtime routine is one of the most evidence-backed tools for improving infant sleep. It works by signalling to your baby''s developing brain that sleep is coming — helping them transition from the stimulation of the day to the stillness of the night.

**When to Start**

You can introduce a simple routine from as early as 6–8 weeks. It does not need to be elaborate. Consistency matters far more than length or complexity.

**A Simple Template**

1. **Bath** (or a warm wash if not a bath night): Warm water is naturally calming and signals the shift to sleep mode. A warm bath has been shown to lower core body temperature slightly — a biological cue for sleep.
2. **Massage or lotion**: Skin-to-skin touch and a few minutes of gentle massage can reduce cortisol and support relaxation.
3. **Feed** (breast or bottle): A comfortable, calm feed as part of the routine — but ideally not the very last thing before they go into the cot, to avoid a feed-to-sleep association.
4. **Book or song**: Reading aloud or singing the same song each night creates a powerful sleep cue. Your baby does not need to understand the words for this to work.
5. **Bed**: Into the cot, drowsy but not fully asleep, with a consistent phrase: "Night night, I love you."

**Keep It the Same**

The order matters more than the individual elements. Same order, same room, same cues, every night. Your baby''s brain will begin to anticipate sleep at the first step.

**Expect It to Take Time**

A routine typically takes 2–3 weeks of consistency before you see reliable results. Keep going.

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.*$$,
  12,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'NHS UK', 'National Sleep Foundation'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-building-bedtime-routine'
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- INFANT FEEDING — INTRODUCING SOLIDS
-- ============================================================

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'feeding',
  'When to Start Solid Foods — Signs of Readiness and WHO Guidance',
  $$## The Right Time to Begin

Starting solid foods is one of the most anticipated milestones of the first year. Getting the timing right matters for both nutrition and safety.

**What the Guidelines Say**

The World Health Organization (WHO) recommends exclusive breastfeeding for the first 6 months, followed by the introduction of complementary foods alongside continued breastfeeding. The NHS and AAP align with starting solids at around 6 months — not before 17 weeks (4 months) under any circumstances.

**Signs of Developmental Readiness**

Age alone is not sufficient. Look for all three of these signs together:

1. **Sitting with support and holding their head steady**: Your baby needs to be able to hold their head upright and stable to eat safely.
2. **Loss of the tongue-thrust reflex**: Younger babies automatically push food out of their mouths. When this reflex fades, they can move food to the back of the mouth and swallow.
3. **Interest in food**: Watching you eat, reaching for your food, or opening their mouth when food approaches.

**What Is Not a Sign of Readiness**

- Waking more at night (this is developmental, not hunger-driven)
- Chewing fists (this is normal infant behaviour)
- Seeming unsatisfied after milk feeds (growth spurts mimic this)

**Starting Before 6 Months**

Some babies, particularly those born prematurely, may need adjusted guidance. Always consult your GP or health visitor before starting solids before 6 months.

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before introducing solid foods.*$$,
  24,
  true,
  ARRAY['World Health Organization (WHO)', 'NHS UK', 'American Academy of Pediatrics (AAP)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-feeding-when-to-start-solids'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'feeding',
  'Baby-Led Weaning Explained — Approach, First Foods, and Gagging vs Choking',
  $$## What Is Baby-Led Weaning?

Baby-led weaning (BLW) is an approach to introducing solids that skips purees and goes straight to soft, appropriately sized whole foods that your baby can pick up and self-feed. The philosophy is that babies who can sit and are developmentally ready to eat can also self-regulate how much they eat and explore food at their own pace.

**The Principles**

- Baby feeds themselves from the start — no spoon-feeding purees
- Food is offered in strips or chunks that can be held in the fist (initially)
- Milk remains the primary nutrition source for the first few months of weaning
- Family mealtimes are shared experiences

**Good First BLW Foods**

- Soft-cooked broccoli florets (held by the stalk)
- Steamed carrot sticks (cooked until easily squished between fingers)
- Avocado in long strips
- Banana strips
- Toast fingers with a thin scrape of nut butter
- Soft-cooked pasta

**Gagging vs Choking — Understanding the Difference**

Gagging is normal and protective. It is your baby''s reflex moving food forward from the back of their mouth. Gagging looks dramatic — retching, red face, watery eyes — but baby recovers quickly and without intervention. Choking is silent, occurs when the airway is blocked, and requires immediate action.

BLW babies gag frequently at first; this is how they learn. The gag reflex is positioned further forward in infants than adults, making it highly effective.

**Who BLW May Not Suit**

Babies with certain swallowing difficulties, premature babies, or babies with motor delays may need a different approach. Discuss with your health visitor or GP.

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before introducing solid foods.*$$,
  24,
  true,
  ARRAY['Rapley & Murkett — Baby-Led Weaning', 'NHS UK', 'American Academy of Pediatrics (AAP)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-feeding-baby-led-weaning-explained'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'feeding',
  'Traditional Purees — How to Start, Textures, and Progression',
  $$## Starting with Spoon-Fed Purees

Puree-based weaning has been the traditional approach to introducing solids for decades. When done well, it is safe, nutritious, and can be a lovely bonding experience.

**Starting Out**

Begin with single-ingredient, smooth purees at around 6 months. Offer a small amount — a teaspoon or two — once a day, at a time when your baby is alert and neither ravenously hungry nor full. The first goal is exploration, not nutrition.

**Good First Purees**

- Sweet potato
- Butternut squash
- Carrot
- Parsnip
- Apple or pear (cooked)
- Avocado (no cooking needed — just mash)

**The Texture Progression**

Moving through textures is as important as introducing new foods. A baby who stays on smooth purees too long can have difficulty accepting lumps later.

- **6 months**: Smooth, runny purees
- **7 months**: Thicker purees with some soft lumps
- **8–9 months**: Mashed and minced textures; soft finger foods alongside
- **10–12 months**: Chopped family foods; largely finger feeding

**Tips for Success**

- Offer new foods 3–5 times before concluding your baby dislikes it — repeated exposure is key
- Avoid adding salt, sugar, or honey to any baby food
- Batch cook and freeze in ice cube trays for convenience
- Let your baby touch and smell food even if they do not eat it — sensory exploration matters

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before introducing solid foods.*$$,
  24,
  true,
  ARRAY['NHS UK Start4Life', 'American Academy of Pediatrics (AAP)', 'First Steps Nutrition Trust'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-feeding-traditional-purees-how-to-start'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'feeding',
  'The Combination Approach — Mixing BLW and Purees',
  $$## The Best of Both Worlds

You do not have to choose between baby-led weaning and purees. A combination approach — also called "modified baby-led weaning" — is what most families end up doing naturally, and it is entirely supported by current evidence.

**What It Looks Like**

- Offer some soft finger foods for your baby to self-feed (BLW style)
- Also offer some spoon-fed purees or mashes
- Allow your baby to take the spoon and explore it themselves
- Let them set the pace — no pressure to finish any amount

**Why It Works**

- Finger foods build chewing skills, motor development, and autonomy
- Purees allow you to pack in more iron-rich or nutrient-dense foods easily
- It suits families where time or food preparation varies
- It accommodates babies who are keen self-feeders alongside those who need more time

**Practical Tips**

- Offer a loaded spoon and let your baby bring it to their mouth themselves when they are ready
- Serve finger food and puree at the same meal
- Avoid using spoon-feeding as a way to get large amounts of food in quickly — follow your baby''s cues
- As your baby''s skills grow, shift the balance more toward finger foods and family textures

**The Evidence**

Research comparing BLW, traditional weaning, and combination approaches shows no significant differences in outcomes when food safety practices are followed. The best approach is the one that works for your family and your baby.

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before introducing solid foods.*$$,
  24,
  true,
  ARRAY['NHS UK', 'Rapley & Murkett — Baby-Led Weaning', 'Cameron et al. (2015) BMJ Open'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-feeding-combination-blw-purees'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'nutrition',
  'First Foods for Baby — What to Offer and in What Order',
  $$## Getting Started with Real Food

The order in which you introduce foods matters less than you might think — variety and iron are the key priorities. Here is a practical guide to the first weeks of weaning.

**Priority 1: Iron-Rich Foods**

Babies are born with iron stores that start to deplete around 6 months. Breast milk is low in iron, so introducing iron-rich foods early is essential. Start with:
- Pureed or minced meat and poultry (beef, chicken, lamb)
- Cooked and pureed lentils, chickpeas, and beans
- Fortified infant cereals (mixed with milk, not water)

**Priority 2: Vegetables**

Offering vegetables before fruit helps develop a preference for less sweet foods. Try:
- Broccoli, cauliflower, courgette, peas
- Carrot, sweet potato, butternut squash
- Spinach blended into a puree

**Priority 3: Fruit, Grains, and Dairy-Based Foods**

Fruit, soft-cooked grains, and full-fat plain yoghurt can all be introduced in the first few weeks. Full-fat cow''s milk can be used in cooking and mixed into food from 6 months, though it should not replace breast or formula milk as a drink until 12 months.

**A Suggested First Two Weeks**

- Days 1–3: Sweet potato or carrot puree
- Days 4–6: Pureed lentils or beef
- Days 7–9: Broccoli or peas
- Days 10–12: Soft fruit (pear or banana)
- Days 13–14: Combine two foods already accepted

**Key Reminder**

Introduce new foods one at a time, with 2–3 days between each new food, so you can identify any reactions.

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before introducing solid foods.*$$,
  24,
  true,
  ARRAY['NHS UK Start4Life', 'First Steps Nutrition Trust', 'American Academy of Pediatrics (AAP)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-nutrition-first-foods-what-to-offer'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'feeding',
  'Allergen Introduction — The 8 Major Allergens, When and How',
  $$## Early Introduction Reduces Allergy Risk

Current evidence strongly supports introducing the major food allergens early — around 6 months — rather than avoiding them. The LEAP study (Learning Early About Peanut Allergy) demonstrated that early introduction of peanuts significantly reduces the risk of peanut allergy.

**The 8 Major Allergens**

1. Peanuts
2. Tree nuts (cashews, walnuts, almonds, etc.)
3. Cow''s milk
4. Egg
5. Wheat
6. Soy
7. Fish
8. Shellfish

**How to Introduce Each Allergen**

- Introduce one new allergen at a time, on a day when you are at home and can observe your baby
- Offer a small amount first, then wait 10–15 minutes before giving more
- If tolerated, continue offering that allergen regularly (2–3 times per week) to maintain tolerance
- Do not introduce a new allergen on the same day as another new allergen

**Signs of an Allergic Reaction**

Mild: rash, hives, mild swelling around the mouth
Severe (anaphylaxis — call 999/911 immediately): difficulty breathing, significant swelling of lips/tongue/throat, baby becomes pale or floppy

**Higher-Risk Babies**

Babies with severe eczema or a known food allergy may need specialist guidance before allergen introduction. Discuss with your GP or allergy team.

**Peanuts Specifically**

Offer as smooth peanut butter thinned with milk or water — never whole peanuts, which are a choking hazard.

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before introducing allergens if your baby has eczema or known allergies.*$$,
  24,
  true,
  ARRAY['LEAP Study (Du Toit et al. 2015)', 'American Academy of Pediatrics (AAP)', 'NHS UK', 'Anaphylaxis UK'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-feeding-allergen-introduction'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'safety',
  'Gagging vs Choking — Understanding the Difference',
  $$## Two Very Different Things

One of the biggest fears parents have about introducing solid foods — especially finger foods — is choking. Understanding the difference between gagging and choking is essential for staying calm and responding correctly.

**Gagging**

Gagging is a normal, protective reflex. It moves food forward in the mouth and prevents it from reaching the airway. In babies, the gag reflex is positioned further forward on the tongue than in adults — making it an excellent safety mechanism.

What gagging looks like:
- Retching or heaving sounds
- Red face
- Watery eyes
- May spit food out or cough dramatically
- Baby recovers quickly and without help

**What to do**: Stay calm. Don''t reach into the mouth or pat the baby''s back. Let the reflex do its job.

**Choking**

Choking occurs when something partially or fully blocks the airway. It is silent — because if the airway is blocked, no air (and no sound) can pass through.

What choking looks like:
- Sudden silence after eating
- Baby cannot cry or cough
- Face turns blue or pale
- Distressed, panicked expression

**What to do**: Act immediately. Lay baby face-down on your forearm, supporting the head. Give up to 5 back blows between the shoulder blades. If unsuccessful, turn face-up and give up to 5 chest thrusts. Call emergency services (999/911).

**Reducing Choking Risk**

- Always supervise mealtimes
- Never give whole grapes, cherry tomatoes, whole nuts, hard raw vegetables, or large chunks of meat
- Sit your baby upright — never reclined — during eating
- Learn infant first aid before starting weaning

*This article is for informational purposes only. Learning infant first aid from a qualified instructor is strongly recommended.*$$,
  24,
  true,
  ARRAY['NHS UK', 'St John Ambulance', 'American Academy of Pediatrics (AAP)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-safety-gagging-vs-choking'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'nutrition',
  'Iron-Rich Foods for Babies — Why Iron Is Critical at 6 Months',
  $$## The Iron Gap

Iron is one of the most important nutrients in your baby''s diet during the second half of the first year — and one of the most commonly under-provided.

**Why 6 Months Is the Critical Point**

Babies are born with iron stores accumulated during pregnancy. These stores begin to deplete around 4–6 months. At the same time, breast milk — while perfectly balanced for early infancy — is naturally low in iron. Formula is iron-fortified, but as solids replace milk, ensuring iron from food becomes essential.

Iron deficiency in infancy is associated with impaired cognitive development, poor growth, and reduced immunity. The good news: it is very preventable with the right foods.

**Best Dietary Sources of Iron**

*Haem iron (most easily absorbed):*
- Red meat (beef, lamb) — pureed or minced
- Chicken and turkey — especially dark meat
- Oily fish like salmon and sardines

*Non-haem iron (plant-based — less easily absorbed):*
- Lentils, chickpeas, kidney beans
- Tofu
- Dark leafy greens (spinach, kale)
- Fortified infant cereals

**The Vitamin C Trick**

Non-haem iron absorption increases significantly when eaten alongside vitamin C. Pair lentils with tomato sauce, or offer a small amount of orange or mango alongside plant-based iron sources.

**How Much Iron Does a Baby Need?**

Around 8mg per day at 7–12 months. Aim to include an iron-rich food at least twice a day once weaning is established.

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider or dietitian with questions about your baby''s nutrition.*$$,
  24,
  true,
  ARRAY['NHS UK', 'First Steps Nutrition Trust', 'American Academy of Pediatrics (AAP)', 'WHO'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-nutrition-iron-rich-foods-6-months'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'feeding',
  'Finger Foods Progression — From Soft to Lumpy to Family Foods',
  $$## Building Texture Confidence

Progressing through textures is one of the most important — and most often skipped — steps in weaning. Babies who stay on smooth purees too long often struggle to accept lumps and family foods, a pattern that can persist into toddlerhood.

**The Texture Ladder**

**6–7 months:**
- Soft, dissolvable finger foods: puffed rice snacks, soft-cooked broccoli florets, avocado strips, banana
- Let baby explore with their hands even if little makes it to their mouth

**7–8 months:**
- Thicker mashes and soft lumps alongside finger foods
- Toast fingers, soft-cooked pasta, soft cheese cubes
- Encourage the pincer grip to develop

**9–10 months:**
- More complex textures: minced meat, flaked fish, grated cheese, small soft pieces
- Loaded spoons baby can self-feed
- Mini rice cakes, small pieces of omelette

**10–12 months:**
- Chopped versions of family meals (before adding salt or seasoning)
- Soft-cooked vegetables in pieces, pasta pieces, soft bread
- Transition toward eating what the family eats

**Why This Matters**

Texture exposure is time-sensitive. Research suggests that babies who are not exposed to textured food by 9–10 months are significantly more likely to develop feeding difficulties. Move forward even if it''s messy and imperfect.

**Making Mealtimes Positive**

Never force food, pressure your baby to eat more, or react negatively to rejection. A calm, exploratory mealtime environment supports long-term healthy eating attitudes.

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.*$$,
  24,
  true,
  ARRAY['NHS UK Start4Life', 'First Steps Nutrition Trust', 'Coulthard et al. (2009) Maternal & Child Nutrition'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-feeding-finger-foods-progression'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'feeding',
  'Managing a Baby Who Refuses Solids',
  $$## When Weaning Doesn''t Go to Plan

Most babies take to solids enthusiastically within a few weeks of starting. But some babies push food away, clamp their mouths shut, gag on everything, or simply show no interest. This is more common than you might think, and it rarely reflects anything you''re doing wrong.

**Common Reasons for Solid Food Refusal**

- **Not ready yet**: If you started before 6 months, wait a week and try again
- **A bad experience**: Gagging that frightened baby, being pushed to eat more than they wanted
- **Illness or teething**: Temporarily reduced appetite is normal when unwell or teething
- **Texture sensitivity**: Some babies tolerate purees but not lumps, or vice versa
- **Too full of milk**: If baby fills up on a big milk feed just before solids, they won''t be interested

**What to Try**

- Offer solids when baby is happy and alert — not tired or hungry
- Eat together and let baby see you enjoying food
- Offer the same food 10–15 times before deciding they dislike it
- Try different textures — some babies prefer finger foods to spoons
- Make mealtimes pressure-free: offer food, let them explore, remove it without fuss if refused
- Reduce the milk feed preceding the solid meal slightly

**When to Seek Help**

If your baby is still consistently refusing all solids by 8–9 months, is losing weight, or if mealtimes are highly stressful for the whole family, speak to your health visitor or GP. A paediatric dietitian or feeding therapist can make a significant difference.

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.*$$,
  24,
  true,
  ARRAY['NHS UK', 'First Steps Nutrition Trust', 'American Academy of Pediatrics (AAP)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-feeding-baby-refuses-solids'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'safety',
  'Foods to Avoid Under 12 Months — Honey, Salt, Sugar, and More',
  $$## What Stays Off the Menu in Year One

Some foods are unsafe or inappropriate for babies under 12 months. Knowing what to avoid keeps your baby safe and sets healthy habits from the start.

**Honey (Avoid Until 12 Months)**

Honey can contain Clostridium botulinum spores, which can cause infant botulism — a rare but potentially life-threatening illness. A baby''s gut is not yet mature enough to prevent the spores from germinating. This applies to all forms of honey, including "organic" or "raw" honey, and to foods cooked or baked with honey.

**Added Salt**

Babies'' kidneys cannot process significant amounts of sodium. Do not add salt to any food you prepare for your baby, and avoid processed foods, stock cubes, sauces, and ready meals that are high in salt.

**Added Sugar**

There is no nutritional need for added sugar in infancy. Avoiding it helps protect developing teeth and prevents early habituation to very sweet flavours. Avoid biscuits, cakes, sweets, sugary yoghurts, and fruit juices.

**Whole Nuts and Hard Raw Vegetables**

These are choking hazards. Nuts should be offered as smooth nut butter only. Raw carrots, apple pieces, and celery should be cooked until soft.

**Whole Cow''s Milk as a Drink**

Cow''s milk can be used in cooking and mixed into foods from 6 months. However, it should not replace breast milk or formula as the main drink until 12 months, as it is low in iron and does not meet a baby''s overall nutritional needs.

**Unpasteurised Cheeses and Raw Shellfish**

These carry a risk of foodborne illness. Stick to pasteurised cheeses (including hard cheeses and full-fat cream cheese) and fully cooked seafood.

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.*$$,
  24,
  true,
  ARRAY['NHS UK', 'American Academy of Pediatrics (AAP)', 'Food Standards Agency'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-safety-foods-to-avoid-under-12-months'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'feeding',
  'Baby Water and Drinks — When to Introduce and How Much',
  $$## Hydration in the First Year

In the first year, milk — breast milk or formula — provides virtually all of your baby''s hydration. Understanding when and how to introduce water and other drinks prevents both dehydration and over-hydration.

**Under 6 Months**

Babies under 6 months do not need water. Breast milk and formula provide all the fluid they need. Giving water to young babies can actually interfere with milk intake and, in large amounts, cause a dangerous drop in sodium levels (hyponatraemia).

**6–12 Months: Introducing Sips of Water**

Once you begin solids, you can offer small sips of water from an open cup or free-flow sippy cup at mealtimes. Start with just a few sips — the goal at this stage is familiarisation and beginning to develop drinking-from-a-cup skills, not replacing milk feeds.

How much: There is no strict amount — let your baby guide you. A few tablespoons to a small cup at mealtimes is typical.

**What to Use**

In the UK, tap water is safe for babies over 6 months. Before 6 months (if water is needed for formula), water should be boiled and cooled. Bottled water is not recommended for regular use as it can be high in sodium or sulfate.

**Drinks to Avoid Under 12 Months**

- Fruit juice — high in sugar, low in nutrition, bad for emerging teeth
- Squash and flavoured drinks
- Tea or coffee — tannins interfere with iron absorption
- Plant-based milks as the main drink (oat, almond, etc.)

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.*$$,
  24,
  true,
  ARRAY['NHS UK', 'American Academy of Pediatrics (AAP)', 'UNICEF Baby Friendly Initiative'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-feeding-water-and-drinks'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'feeding',
  'Breastfeeding Alongside Solids — How to Balance Milk and Food',
  $$## Milk Still Matters

When you begin introducing solid foods around 6 months, it is important to understand that milk — breast milk or formula — remains the primary source of nutrition for your baby well into the second half of the first year.

**The Principle: Food Before One Is Just for Fun**

This phrase (slightly simplified) captures an important truth: in the early weeks of weaning, the amount of food your baby actually eats is tiny. Solid foods are about exploration, texture, flavour exposure, and developing eating skills — not yet about replacing milk feeds.

**How to Sequence Feeds**

- Offer breast milk first, then solids — particularly in the first few months of weaning
- As your baby''s solid intake grows (typically from around 8–9 months), you can begin to shift the balance
- By 10–12 months, many breastfed babies are eating three small meals plus snacks and naturally reducing milk feeds

**How Many Milk Feeds?**

- 6–7 months: 5–6 breastfeeds or 500–600ml formula daily (solids are additional)
- 8–9 months: 4–5 breastfeeds or 450–500ml formula
- 10–12 months: 3–4 breastfeeds or 350–400ml formula

These are approximate guides — follow your baby''s hunger and satiety cues.

**Continuing to Breastfeed**

The WHO recommends continued breastfeeding alongside complementary foods for two years or beyond. There is no nutritional or medical reason to stop breastfeeding at 12 months — the decision is entirely personal.

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider or lactation consultant with questions about breastfeeding.*$$,
  24,
  true,
  ARRAY['World Health Organization (WHO)', 'NHS UK', 'UNICEF Baby Friendly Initiative', 'La Leche League'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-feeding-breastfeeding-alongside-solids'
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- INFANT HEALTH
-- ============================================================

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'health',
  'Teething — Timeline, Symptoms, and What Actually Helps',
  $$## The Truth About Teething

Teething is one of the most over-attributed causes of infant symptoms. While it is genuinely uncomfortable, understanding what teething does — and doesn''t — cause helps you respond appropriately.

**The Teething Timeline**

Most babies cut their first tooth between 4 and 7 months, though anywhere from 3 to 12 months is within the normal range. A small number of babies are born with teeth; some don''t teethe until after their first birthday.

Typical order:
- Lower central incisors (bottom front) — 6–10 months
- Upper central incisors (top front) — 8–12 months
- Upper lateral incisors — 9–13 months
- Lower lateral incisors — 10–16 months
- First molars, canines, second molars — 13–24 months

**Genuine Teething Symptoms**

- Drooling (often beginning weeks before a tooth appears)
- Chewing and gnawing on objects
- Swollen, tender gum tissue
- Mild irritability and disrupted sleep in the 1–2 days around tooth eruption

**What Teething Does NOT Cause**

High fever, diarrhoea, rashes, significant illness. These symptoms coincide with teething because babies teethe during the same period they encounter many viruses — but the virus (not the tooth) is the cause.

**What Actually Helps**

- Cold teething rings (chilled, not frozen)
- Gentle gum massage with a clean finger
- Age-appropriate pain relief (infant paracetamol or ibuprofen) — discuss dose with your pharmacist
- Extra cuddles and comfort

**What to Avoid**

- Teething gels with lidocaine or benzocaine (not safe for infants)
- Amber teething necklaces (choking and strangulation risk)

*This article is for informational purposes only. Consult your GP if your baby has a high fever or significant symptoms during teething.*$$,
  24,
  true,
  ARRAY['NHS UK', 'American Academy of Pediatrics (AAP)', 'Oral Health Foundation'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-health-teething-timeline-symptoms'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'health',
  'Infant Vaccinations — The Schedule and Common Reactions',
  $$## Protecting Your Baby from the Start

Vaccination is one of the most effective health interventions in human history. Understanding the schedule and what to expect helps you feel prepared and confident.

**The UK Infant Vaccination Schedule (Summary)**

- **8 weeks**: 6-in-1, MenB, Rotavirus
- **12 weeks**: 6-in-1 (2nd), Rotavirus (2nd), PCV (pneumococcal)
- **16 weeks**: 6-in-1 (3rd), MenB (2nd)
- **12 months**: MMR (1st), MenC, Hib/MenC booster, MenB (3rd), PCV booster

The 6-in-1 vaccine protects against diphtheria, tetanus, whooping cough, polio, Hib, and hepatitis B.

Note: Schedules vary by country. If you are outside the UK, consult your local health authority for the schedule that applies to you.

**Common and Expected Reactions**

- Soreness, redness, or mild swelling at the injection site
- Low-grade fever (especially after the MenB vaccine at 8 and 16 weeks)
- Increased fussiness, sleepiness, or reduced appetite for 24–48 hours

For MenB specifically, the NHS recommends giving infant paracetamol (at the correct dose) at the time of the vaccination to reduce fever risk — this is one situation where paracetamol is recommended proactively.

**When to Seek Medical Advice**

- High fever (above 38°C in babies under 3 months; above 39°C in older babies)
- Crying that is inconsolable for more than 3 hours
- A significant allergic reaction (rare): hives, swelling, difficulty breathing — call 999 immediately

**Vaccine Safety**

All vaccines on the UK schedule are rigorously tested for safety and efficacy before approval, and are continuously monitored. The risks of the diseases they prevent far outweigh the risks of vaccination.

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider with questions about your baby''s vaccination schedule.*$$,
  8,
  true,
  ARRAY['NHS UK Vaccination Schedule', 'CDC', 'World Health Organization (WHO)', 'JCVI (UK)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-health-vaccinations-schedule-reactions'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'health',
  'Ear Infections in Babies — Signs, Treatment, and Recurring Issues',
  $$## A Common and Painful Problem

Ear infections (otitis media) are among the most common reasons babies and young children see a doctor. Understanding the signs helps you seek help at the right time.

**Why Babies Are Prone to Ear Infections**

The Eustachian tube (which connects the middle ear to the back of the throat) is shorter and more horizontal in babies and young children than in adults. This makes it easier for bacteria or viruses from the upper respiratory tract to travel to the middle ear.

**Signs of an Ear Infection**

- Pulling, tugging, or batting at one or both ears
- Increased crying and irritability, particularly when lying flat
- Difficulty sleeping
- Fever
- Fluid draining from the ear
- Reduced hearing or not responding normally to sounds

Note: Ear tugging alone is not a reliable sign — babies explore their ears from around 4 months. Look for it in combination with other symptoms.

**Treatment**

- Many ear infections in babies resolve on their own within 2–3 days
- Your GP may recommend a watch-and-wait approach or prescribe antibiotics depending on the baby''s age, severity of symptoms, and whether both ears are affected
- Infant paracetamol or ibuprofen helps with pain and fever
- Babies under 6 months with a suspected ear infection should always be seen by a doctor

**Recurring Ear Infections**

Some babies have repeated infections due to anatomy or persistent fluid in the middle ear (glue ear). If your baby has had 3 or more ear infections in 6 months, ask for a referral for further assessment. Grommets (ear tubes) are sometimes recommended in persistent cases.

*This article is for informational purposes only and does not constitute medical advice. Always consult your GP if you suspect an ear infection.*$$,
  12,
  true,
  ARRAY['NHS UK', 'American Academy of Pediatrics (AAP)', 'NICE Guidelines'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-health-ear-infections'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'health',
  'Eczema in Babies — Managing Dry, Itchy Skin',
  $$## Understanding Infant Eczema

Eczema (atopic dermatitis) is very common in infancy, affecting around 1 in 5 children in the UK. It causes dry, itchy, inflamed skin that can significantly disrupt sleep and comfort.

**What It Looks Like**

In babies, eczema most commonly appears on the cheeks, scalp, and forehead, and the fronts of knees and elbows. The skin may be red, dry, scaly, or weeping. Babies often rub or scratch the affected areas, especially at night.

**What Causes It?**

Eczema is caused by a combination of genetic factors and a skin barrier that doesn''t retain moisture effectively. It is not caused by poor hygiene, diet (in most cases), or anything parents have done wrong. It often runs in families alongside hay fever and asthma (the atopic triad).

**Managing Eczema**

**Emollients (moisturisers) are the foundation:**
- Apply generously and frequently — at least twice daily and after every bath
- Use prescribed or dermatologist-recommended emollients, not regular moisturisers which may contain fragrances and irritants
- Pat skin dry gently after bathing, then apply emollient immediately

**Bathing:**
- Daily baths in lukewarm water, no longer than 5–10 minutes
- Use a fragrance-free, soap-free wash
- Avoid bubble baths and heavily fragranced products

**Topical steroids:**
- Prescribed topical corticosteroids are safe and effective when used as directed for flare-ups
- Apply thinly to affected areas only, not preventatively

**Triggers to avoid:**
- Overheating (dress in layers)
- Scratchy fabrics (choose 100% cotton)
- Biological detergents and fabric softeners

**When to See Your GP**

If eczema is not controlled with regular emollient use, if there are signs of infection (weeping, crusting, or yellow discharge), or if your baby''s sleep is significantly affected, seek medical review.

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider for personalised eczema management.*$$,
  4,
  true,
  ARRAY['NHS UK', 'National Eczema Society', 'NICE Guidelines', 'AAP'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-health-eczema-managing-dry-itchy-skin'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'health',
  'Baby Colds — When to Treat at Home vs Seek Help',
  $$## Colds Are Common — But Not Always Simple

Babies can have up to 8–10 colds in their first year of life as their immune system encounters new viruses. Understanding when home care is enough — and when to seek help — is an essential skill for every parent.

**Typical Cold Symptoms**

- Runny or blocked nose (clear mucus turning yellow or green — this is normal and does not mean antibiotics are needed)
- Mild fever
- Sneezing
- Reduced appetite
- Disturbed sleep
- Mild cough

Most colds last 7–10 days. The worst of the symptoms is usually days 2–4.

**Home Care**

- Keep your baby hydrated — continue breastfeeding or bottle-feeding on demand
- Use a saline nasal spray or drops to help clear a blocked nose before feeds
- Elevate the head end of the mattress slightly (place a rolled towel under the mattress, not inside the cot)
- Age-appropriate paracetamol or ibuprofen for fever or discomfort — follow dosing instructions carefully
- Do not use over-the-counter cold and cough medicines for babies under 2 years

**When to Seek Medical Help**

Call your GP or NHS 111 (or equivalent) if:
- Your baby is under 3 months and has a fever above 38°C
- Your baby is struggling to breathe — nostrils flaring, drawing in under the ribs, breathing very fast
- Baby is unable to feed or becoming dehydrated (no wet nappies for 8+ hours, sunken fontanelle, dry mouth)
- Symptoms worsen significantly after day 4–5
- You are worried — always trust your instincts

**When to Call 999**

Bluish lips or fingertips, very laboured breathing, unresponsive or floppy — call emergency services immediately.

*This article is for informational purposes only and does not constitute medical advice. Always consult your healthcare provider if you are worried about your baby.*$$,
  0,
  true,
  ARRAY['NHS UK', 'American Academy of Pediatrics (AAP)', 'NICE Guidelines'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-health-baby-colds-home-vs-seek-help'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'health',
  'Constipation in Babies — Causes and Remedies',
  $$## When Things Slow Down

Constipation in babies can be confusing because what counts as "normal" varies widely. Understanding what to look for — and what to do — helps you respond confidently.

**Normal Bowel Patterns**

Breastfed babies may poo multiple times a day or only once a week — both are normal, provided the stool is soft. Formula-fed babies typically poo 1–4 times a day. Once solids are introduced, most babies move to once or twice a day.

**Signs of Constipation**

- Hard, dry, pellet-like stools
- Straining or significant discomfort when passing stools
- Stools less frequent than usual with associated distress
- A hard, distended tummy

Note: straining without hard stools is not constipation — it is called infant dyschezia and resolves on its own.

**Common Causes**

- Switching from breast milk to formula (or changing formula)
- Starting solid foods, particularly starchy foods (banana, rice, white bread)
- Not enough fluid intake
- Illness causing dehydration

**What Helps**

- **Hydration**: Increase fluid intake — breast milk on demand, or offer small sips of water in babies over 6 months
- **Fruit juice**: 2–4oz of prune, pear, or apple juice diluted with water can help in babies over 6 months — discuss with your health visitor
- **Dietary changes**: Offer more fruit and vegetables; reduce banana, rice, and white bread
- **Bicycle legs**: Gentle movement of your baby''s legs in a cycling motion may stimulate the bowel
- **Tummy massage**: Gentle clockwise circular massage of the abdomen

**When to See Your GP**

If constipation persists more than 2 weeks, if your baby is in significant pain, if there is blood in the stool, or if a newborn baby (especially under 6 weeks) has not passed a stool, seek medical advice promptly.

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.*$$,
  12,
  true,
  ARRAY['NHS UK', 'American Academy of Pediatrics (AAP)', 'NICE Guidelines'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-health-constipation-causes-remedies'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'health',
  'Baby Rashes — Identifying Common Rashes',
  $$## Not All Rashes Are the Same

Rashes are extremely common in babies. Knowing how to identify the most frequent causes — and which ones need urgent attention — is genuinely useful knowledge for every parent.

**Nappy Rash**

Red, sore skin in the nappy area. Almost all babies get it at some point. Caused by prolonged contact with wet or soiled nappies. Treatment: frequent nappy changes, barrier cream (zinc oxide), and nappy-free time where possible. See your GP if it does not improve, spreads, or looks infected.

**Heat Rash (Prickly Heat)**

Tiny red bumps or blisters caused by overheating and blocked sweat glands. Appears on the neck, chest, or in skin folds. Resolves with cooling — remove layers and move to a cooler environment. No treatment needed.

**Viral Rashes**

Many common baby viruses cause a rash as the illness passes. Roseola (high fever followed by a pink blotchy rash as fever resolves) is a classic example. These rashes are not harmful and require no treatment.

**Allergic Rashes (Hives)**

Raised, itchy welts that can appear suddenly — often triggered by food, medication, or contact with an irritant. Usually resolves within hours. If accompanied by swelling of the face, lips, or throat, or breathing difficulty, call 999.

**Eczema**

Dry, itchy, red patches — commonly on the face, behind the knees, and in elbow creases. Chronic condition requiring ongoing moisturiser use. (See the dedicated eczema article for full guidance.)

**The Glass Test**

If your baby has a rash and is unwell, press a clear glass firmly against the rash. If the rash does not fade under pressure (non-blanching), call 999. This can be a sign of meningococcal disease.

*This article is for informational purposes only and does not constitute medical advice. Always seek urgent help for a non-blanching rash or a baby who is seriously unwell.*$$,
  0,
  true,
  ARRAY['NHS UK', 'American Academy of Pediatrics (AAP)', 'British Association of Dermatologists'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-health-rashes-identifying-common-types'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'health',
  'Heat Rash, Cradle Cap, and Other Common Skin Conditions',
  $$## Everyday Skin Issues in the First Months

Several very common skin conditions appear in the first months of life and worry new parents unnecessarily. Most are harmless and self-resolving.

**Cradle Cap (Seborrhoeic Dermatitis)**

Yellowish, greasy, scaly patches on the scalp — sometimes extending to the eyebrows, behind the ears, or into the neck folds. Caused by overactive sebaceous (oil) glands and not related to hygiene. Very common in newborns and young babies.

Management: Gently massage a small amount of baby oil or coconut oil into the scalp, leave for 15–30 minutes, then gently brush with a soft baby brush and wash off with baby shampoo. Do not pick the scales. Usually resolves by 12 months. Hydrocortisone cream may be prescribed for stubborn cases — speak to your GP.

**Heat Rash**

Fine red bumps or tiny blisters in skin folds or on covered areas when baby is too warm. Resolve by cooling the environment, removing layers, and ensuring the skin is dry. No treatment required.

**Milia**

Tiny white spots — usually on the nose and cheeks — caused by blocked keratin-filled pores. Completely harmless and resolve spontaneously within the first few weeks. Do not squeeze.

**Baby Acne**

Red or white pimple-like spots on the cheeks, nose, and forehead appearing in the first 2–4 weeks. Caused by maternal hormones. Resolves without treatment by 3 months. Wash gently with water — no creams needed.

**Mongolian Blue Spots**

Flat, blue-grey birthmarks — often on the lower back or buttocks — common in babies with darker skin tones. Completely benign and not associated with any medical condition. Usually fade by school age.

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider if you are unsure about any skin condition.*$$,
  0,
  true,
  ARRAY['NHS UK', 'British Association of Dermatologists', 'American Academy of Pediatrics (AAP)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-health-heat-rash-cradle-cap-skin-conditions'
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- ACTIVITY AND PLAY
-- ============================================================

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'development',
  'Why Play Matters — How Babies Learn Through Exploration',
  $$## Play Is the Work of Infancy

When your baby bats a rattle, drops a spoon from the high chair, or splashes in the bath, they are not just passing time. They are conducting scientific experiments on how the world works.

**How Babies Learn Through Play**

Play in infancy is multimodal — babies learn through touch, taste, sight, sound, and movement simultaneously. Every experience creates and strengthens neural connections. A baby mouthing a wooden block is learning about hardness, temperature, taste, and shape all at once.

**Types of Play in Infancy**

- **Sensory play**: Touching different textures, splashing, crumpling paper — all stimulate sensory processing
- **Social play**: Peek-a-boo, face-to-face games, copying expressions — build emotional attunement and social understanding
- **Object play**: Grasping, banging, dropping, and examining objects develop motor skills and early cause-and-effect understanding
- **Physical play**: Rolling, crawling, climbing — build strength, coordination, and spatial awareness

**You Are the Best Toy**

No piece of equipment or expensive toy replaces the learning that happens in responsive interaction with a caregiver. Your face, voice, and responsiveness are your baby''s most important developmental tools.

**What Research Shows**

Studies consistently show that play-based learning in early childhood produces better long-term outcomes in cognition, language, social skills, and emotional regulation than direct instruction. Unstructured, exploratory play matters.

**Creating a Play-Friendly Environment**

- Floor time is essential — get your baby out of equipment and onto a safe play mat
- Rotate toys to maintain novelty and interest
- Follow your baby''s lead — respond to what captures their attention

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider with questions about your baby''s development.*$$,
  12,
  true,
  ARRAY['Zero to Three', 'American Academy of Pediatrics (AAP)', 'UNICEF Early Childhood Development'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-development-why-play-matters'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'wellness',
  'Age-Appropriate Play Ideas: 3–6 Months',
  $$## Playing with Your 3–6 Month Old

At this age, your baby is becoming more alert, more social, and increasingly interested in the world. Play at this stage supports sensory development, emerging motor skills, and the crucial social bond between you.

**What Your Baby Can Do**

- Track moving objects visually
- Reach for and bat at objects
- Respond to faces and voices with smiles and sounds
- Bear weight on arms during tummy time
- Begin to grasp objects placed in hand

**Play Ideas**

**Face-to-face games**
Make exaggerated facial expressions and give your baby time to respond. Copy their expressions back to them — they will be fascinated.

**Sensory exploration**
Offer safe objects of different textures: a soft cloth, a crinkly wrapper, a wooden ring. Let them grasp, mouth, and explore.

**Mirror play**
Babies love looking at faces — including their own. A baby-safe mirror on the floor during tummy time provides great visual stimulation.

**Cause and effect**
Shake a rattle, then hand it to your baby. They are beginning to understand that their actions cause things to happen.

**Singing and rhymes**
Action songs like "Incy Wincy Spider," "Row, Row, Row Your Boat," and "Round and Round the Garden" captivate babies at this age.

**Movement**
Gentle bicycle legs, lifting their arms, and supported bouncing on your lap all delight babies at this stage and build body awareness.

**What to Avoid**

Avoid screen time (other than video calling with family) and avoid over-stimulating with too many toys at once. Simpler is usually better.

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider with questions about your baby''s development.*$$,
  12,
  true,
  ARRAY['Zero to Three', 'NHS UK', 'American Academy of Pediatrics (AAP)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-wellness-play-ideas-3-6-months'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'wellness',
  'Age-Appropriate Play Ideas: 6–9 Months',
  $$## Playing with Your 6–9 Month Old

The 6–9 month window is exciting — your baby is more mobile, more communicative, and deeply curious. Play becomes richer and more interactive.

**What Your Baby Can Do Now**

- Sit independently or with minimal support
- Transfer objects between hands
- Babble in consonant-vowel combinations
- Show preference for familiar people
- Begin to understand object permanence
- Start crawling (in some form)

**Play Ideas**

**Peek-a-boo and hiding games**
Cover your face with your hands, then reveal yourself. Hide a toy under a cloth and let your baby find it. These games build object permanence and delight.

**Cause and effect toys**
Pop-up toys, activity centres, and musical buttons that respond to pressing teach babies that their actions have consequences.

**Container play**
Put objects into a container and tip them out. Repeat. And repeat. This simple game teaches in-and-out, full-and-empty, and object permanence all at once.

**Physical exploration**
With your baby sitting on the floor, roll a ball toward them, support them as they lunge forward. Encourage crawling by placing a toy just out of reach.

**Texture and sensory bins**
A shallow tray of dried pasta, water beads (baby-safe versions), or fabric scraps gives endless sensory interest. Always supervise.

**Books**
At this age, books are for chewing, banging, and exploring as much as reading. Board books with bright pictures and few words are perfect. Point to pictures and name them simply.

**Messy play**
Finger painting with baby-safe paint or food (squished banana, avocado on a tray) is rich sensory experience and excellent fine motor development.

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.*$$,
  24,
  true,
  ARRAY['Zero to Three', 'NHS UK', 'American Academy of Pediatrics (AAP)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-wellness-play-ideas-6-9-months'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'wellness',
  'Age-Appropriate Play Ideas: 9–12 Months',
  $$## Playing with Your 9–12 Month Old

Your baby is now a purposeful, communicative, mobile little person. Play at this stage is active, social, and increasingly sophisticated.

**What Your Baby Can Do**

- Pull to stand and cruise along furniture
- Use a refined pincer grip
- Point at things that interest them
- Wave bye-bye and play simple imitative games
- Understand simple words and phrases
- Begin to use 1–2 words intentionally

**Play Ideas**

**Stacking and building**
Stacking cups, blocks, and rings support fine motor skills, spatial reasoning, and the deeply satisfying crash when it all comes down.

**Shape sorters**
These develop problem-solving, hand-eye coordination, and shape recognition. Start with simple 2–3 shape versions.

**Push-and-pull toys**
Babies cruising and beginning to walk love push toys that move with them. Pull-along toys when they begin to walk independently.

**Imitative play**
At this age, babies love to copy you. Stir a pretend pot, talk on a toy phone, pat a doll. This is the beginning of symbolic play.

**Ball play**
Roll a ball back and forth. Simple turn-taking, anticipation, and gross motor development all in one game.

**Water play**
Bath time is a rich play environment — cups, small containers, rubber animals. You can also create a supervised water tray activity.

**Social games with action songs**
"If You''re Happy and You Know It," "Head Shoulders Knees and Toes," and similar songs build body awareness, imitation, and joy.

**Reading**
Point to pictures and name them. Encourage your baby to point. Ask "where is the dog?" — they will soon start to respond correctly.

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.*$$,
  36,
  true,
  ARRAY['Zero to Three', 'NHS UK', 'American Academy of Pediatrics (AAP)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-wellness-play-ideas-9-12-months'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'wellness',
  'Screen Time Guidelines for Babies Under 12 Months',
  $$## What the Evidence Says About Screens in the First Year

The guidance on screen time for very young children is clear and consistent: the WHO, AAP, and most major health organisations recommend avoiding recreational screen time for babies under 18–24 months, with the exception of video calling.

**Why Screens Are Different for Babies**

Babies learn through responsive, two-way interaction. When you talk to your baby, you respond to their cues, adjust your pace, and engage in the back-and-forth that drives language and social development. Screens cannot do this. Even educational programming offers no benefit in this age group — babies under 2 cannot meaningfully learn language or concepts from a screen.

**The Exception: Video Calls**

Live video calling with a familiar person (grandparent, parent who is away) appears to be beneficial when the adult is responsive and engaging. This is interactive in a way that passive TV viewing is not.

**The Real Concern**

The risk isn''t primarily from the screen itself — it''s from what screen time displaces: conversation, play, movement, and sleep. A baby sitting in front of a screen is not being talked to, held, or allowed to explore.

**Background TV**

Research suggests that background television — even when a baby is "not watching" — disrupts the quality of parent-child interaction and reduces language input. It''s worth being mindful of this.

**Practical Approach**

- Avoid TV and videos as entertainment for your baby under 12 months
- Keep mealtimes and feeding screen-free
- Video calls with family are fine
- Be curious, not guilty — this is about optimising, not catastrophising

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider with questions about your baby''s development.*$$,
  0,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'World Health Organization (WHO)', 'NHS UK'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-wellness-screen-time-under-12-months'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'development',
  'Reading to Babies — Why It Matters Even Before They Understand',
  $$## Books Before Words

Reading to a baby who can''t yet understand a single word can feel a little absurd. But the research on reading aloud in infancy is unequivocal: it is one of the most powerful things you can do for your child''s development.

**What Babies Gain from Being Read To**

- **Language exposure**: Every word you read adds to the bank of language your baby''s brain is cataloguing. Long before they speak, they are building vocabulary.
- **Listening and attention skills**: Following the rhythm and flow of language builds the listening circuits that underpin reading and communication.
- **Bonding**: Being held and read to in a warm, calm moment is a powerful bonding experience that builds emotional security.
- **A love of books**: Babies who are read to regularly grow up associating books with comfort, safety, and pleasure.

**What to Read**

At 0–3 months: High-contrast black-and-white books or simple face illustrations. Your baby''s vision is still developing and contrast captures attention.

At 4–6 months: Books with bright colours, simple pictures, and repeated sounds or words.

At 6–9 months: Board books they can grab, mouth, and explore. Lift-the-flap books introduce a satisfying interactive element.

At 9–12 months: Simple stories with familiar words. Naming pictures. Books about daily routines.

**How to Read**

There is no wrong way. Use different voices, point at pictures, let your baby touch and turn pages, stop when they lose interest. Reading doesn''t need to mean sitting still — let it be interactive and playful.

**Five Books a Day**

You don''t need to read whole stories — five minutes of shared book time across the day is beneficial. Build it into the bedtime routine, nappy changes, or quiet time after a feed.

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider with questions about your baby''s development.*$$,
  0,
  true,
  ARRAY['American Academy of Pediatrics (AAP) — Reach Out and Read', 'NHS UK', 'Booktrust UK'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-development-reading-to-babies'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'safety',
  'Baby-Proofing Your Home — A Practical Room-by-Room Guide',
  $$## When Your Baby Gets Mobile, Your Home Changes

The moment your baby starts rolling, sitting, or crawling, the familiar landscape of your home becomes a series of hazards. Baby-proofing is not about eliminating all risk — it is about removing the most serious dangers.

**General Principles**

- Get down to floor level and see your home from your baby''s perspective
- Focus on the rooms where your baby spends most time
- Install fixes before your baby reaches the relevant stage — it always happens faster than you expect

**Living Room**

- Secure heavy furniture (bookshelves, TVs, chests) to the wall to prevent tip-over
- Use corner and edge guards on coffee tables and hearths
- Remove small objects, coins, and batteries from the floor — all serious choking hazards
- Cover electrical sockets
- Secure or hide trailing cables

**Kitchen**

- Use cupboard locks on cabinets containing cleaning products, sharp objects, and plastic bags
- Keep hot drinks well away from the edge of surfaces and never hold a hot drink while holding your baby
- Install an oven guard if possible
- Keep the dishwasher closed and cutlery stored safely

**Stairs**

- Install stair gates at the top and bottom before your baby can crawl — top gates must be fixed to the wall, not pressure-mounted

**Bathroom**

- Never leave your baby unattended in or near water — even an inch of water is a drowning risk
- Lock away all medications, razors, and cleaning products
- Set your water heater to below 48°C to prevent scalds

**Bedroom**

- Ensure the cot meets current safety standards — no loose parts, no drop sides
- Remove all cot bumpers, pillows, and soft toys from the sleep space

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider or a certified childproofer if you have specific safety concerns.*$$,
  24,
  true,
  ARRAY['NHS UK', 'Royal Society for the Prevention of Accidents (RoSPA)', 'American Academy of Pediatrics (AAP)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-safety-baby-proofing-room-by-room'
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PARENT WELLBEING
-- ============================================================

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'mental-health',
  'Returning to Work After Maternity Leave — Emotional and Practical Preparation',
  $$## One of Parenting''s Harder Transitions

Returning to work after maternity or parental leave is a significant transition — practically, emotionally, and identity-wise. Whether you are dreading it, looking forward to it, or feeling guilty about looking forward to it, your feelings are valid.

**The Emotional Reality**

Most parents experience a complex mix: relief, grief, guilt, excitement, and anxiety — sometimes simultaneously. You may worry about your baby''s wellbeing in your absence, wonder if your career has moved on without you, or feel uncertain about who you are now in a professional context.

All of this is normal. It does not mean you are making the wrong choice.

**Practical Preparation**

- **Start the settling-in process early**: Most nurseries and childminders offer settling-in sessions. Begin 4–6 weeks before your return date so both you and your baby have time to adjust.
- **Do a trial run**: Return to work for a day while your childcare is in place before your official start date — it gives you a chance to troubleshoot.
- **Have a back-up plan for illness**: Babies get sick frequently in their first year in childcare. Know in advance who your back-up caregiver is.
- **Communicate with your employer**: Discuss any flexibility needs — feeding breaks, part-time options, or a phased return — before you go back.

**If You Are Breastfeeding**

You have a legal right to time and space to express milk at work in many countries. Practise pumping before returning so your supply is established.

**Give Yourself Time**

Most parents report that after 4–6 weeks back at work, the transition feels much more manageable. The first week is usually the hardest.

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider if you are struggling with anxiety or low mood around your return to work.*$$,
  16,
  true,
  ARRAY['NHS UK', 'ACAS', 'Mind UK', 'Maternity Action'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-mental-health-returning-to-work'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'mental-health',
  'Childcare Options — Nursery, Childminder, Nanny, and Family',
  $$## Finding the Right Childcare for Your Family

Choosing childcare is one of the biggest decisions of the first year. There is no universally "best" option — the right choice depends on your baby, your work pattern, your finances, and your values.

**Nursery (Day Care)**

A group setting, usually registered and inspected by a regulatory body (Ofsted in England). Staff are shared between multiple children. Often the most affordable professional option; many offer subsidised places. Social exposure to other children is a benefit. Settings vary widely in quality — visit, ask questions, and review inspection reports.

**Childminder**

A registered carer who looks after a small number of children in their own home. Often offers a more home-like environment, smaller ratios, and more flexibility. Good for babies who settle better in quieter settings. Also regulated and inspectable.

**Nanny**

A professional childcarer who comes to your home. Highest ratio of care (often 1:1 or 1:2). Most flexible for working hours. Significant employment responsibilities — you become an employer. Nanny-shares with another family can reduce costs.

**Au Pair**

Typically a young person from abroad who lives with your family and provides some childcare in exchange for accommodation and a stipend. Not trained carers — appropriate for supplementary care, not sole care for young babies.

**Family (Grandparents etc.)**

Free or low-cost; familiar faces your baby already knows. Can be wonderful. Also requires clear communication about expectations, parenting differences, and boundaries.

**Questions to Ask Any Childcare Provider**

- What is your settling-in process?
- What is your key person approach?
- How do you handle sleep, feeding, and routines?
- What is your staff turnover?
- Can I visit unannounced?

*This article is for informational purposes only. Please consult relevant government resources for financial entitlements to childcare support in your country.*$$,
  16,
  true,
  ARRAY['NHS UK', 'Gov.uk Childcare', 'Family and Childcare Trust', 'NDNA'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-mental-health-childcare-options'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'mental-health',
  'The Identity Shift of Parenthood — Who Am I Now?',
  $$## Matrescence and the Self You Are Becoming

There is a word for the process of becoming a mother: matrescence. Coined by anthropologist Dana Raphael and recently popularised by developmental psychologist Aurelie Athan, it describes the profound physical, psychological, and social transformation that occurs when a person becomes a parent.

It is, in some ways, as seismic as adolescence — and just as disorienting.

**What the Identity Shift Can Feel Like**

- A sense of loss for the person you were before
- Feeling like your previous identity (professional, social, physical) no longer fits
- Uncertainty about who you are now, beyond "parent"
- Resentment — and guilt about the resentment
- Moments of profound love alongside boredom, frustration, and longing for your old life

All of these are normal. They do not mean you made a mistake or that you are a bad parent.

**What Research Shows**

Brain imaging studies show measurable structural changes in the maternal brain during the transition to parenthood — particularly in areas governing social cognition, empathy, and threat detection. Your brain is literally reorganising itself around this new role.

**Finding Yourself in the New Self**

- Your pre-parent identity is not gone — it is integrating with something new
- Protect some time and space that belongs to the person you are beyond parenting
- Seek out other parents who are willing to speak honestly about their experience
- Journaling, therapy, or honest conversations with a trusted person can help process the shift

**When It Becomes Something More**

If the loss of identity is accompanied by persistent low mood, inability to feel joy, or significant anxiety, speak to your GP. This may be more than identity adjustment — and support is available.

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider if you are struggling with your mental health.*$$,
  12,
  true,
  ARRAY['Aurelie Athan — Matrescence Research', 'Hoekzema et al. (2017) Nature Neuroscience', 'Mind UK', 'PANDAS Foundation'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-mental-health-identity-shift-parenthood'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'relationships',
  'Your Relationship at 6–12 Months — Reconnecting as a Couple',
  $$## When the Baby Comes Between You

Having a baby reshapes every relationship — including the one with your partner. The 6–12 month period is often when couples begin to feel the cumulative toll of sleep deprivation, reduced intimacy, divided attention, and the seismic shift in identity that parenthood brings.

**What Commonly Happens**

- Less time for each other as individuals and as a couple
- Different parenting styles surfacing and causing friction
- Resentment around the division of domestic and childcare labour
- Reduced physical and emotional intimacy
- Feeling like co-parents rather than partners

All of this is normal. Relationship satisfaction typically dips in the first year after a baby — across almost all couples, regardless of how strong the relationship was before.

**What Helps**

**Name it without blame**: "I miss us" is a very different conversation than "you never pay attention to me." Start there.

**Divide fairly, not equally**: Fair doesn''t always mean 50/50. Have explicit conversations about who is doing what — assumptions breed resentment.

**Protect connection, however small**: A ten-minute conversation after the baby is in bed, without phones, matters more than a monthly date night you can''t manage.

**Physical reconnection at your own pace**: Postnatal bodies need time to recover. Intimacy does not have to start with sex — rebuilding through non-sexual physical affection first is healthy and valid.

**Get support**: Couples counselling is not a sign of failure. Many therapists specialize in the transition to parenthood.

**If Things Are Serious**

If you are experiencing domestic abuse, coercive control, or fear for your safety, contact a domestic abuse helpline. These patterns can escalate after the birth of a baby.

*This article is for informational purposes only and does not constitute medical advice. Please consult a qualified therapist or your healthcare provider for relationship or mental health support.*$$,
  24,
  true,
  ARRAY['Gottman Institute', 'Relate UK', 'NHS UK', 'National Domestic Abuse Helpline'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-relationships-reconnecting-as-couple-6-12-months'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'mental-health',
  'Milestones Anxiety — Managing the Pressure to Hit Every Marker',
  $$## When Milestones Become a Source of Dread

Developmental milestones exist as useful clinical screening tools. In the age of parenting apps, social media, and competitive parent groups, they have become something else: a league table that many parents feel their baby is constantly failing.

**The Problem with Milestone Culture**

- Milestone ranges are wide — a skill listed at "6 months" may typically appear anywhere from 4 to 9 months
- Social media amplifies early developers and creates a distorted picture of "average"
- Comparisons between individual babies are largely meaningless — development is non-linear and domain-specific
- Milestone anxiety causes parents to watch their babies anxiously rather than joyfully

**What Milestones Are Actually For**

Developmental milestones were designed as population-level screening tools. They help clinicians identify children who might benefit from early support. A baby who hasn''t rolled by a specific week is not failing — they are one data point that a clinician might choose to monitor.

**Holding Milestones Lightly**

- Learn the milestones as background knowledge, not a performance target
- Focus on the trajectory — is your baby developing, engaging, learning, and growing over time?
- Celebrate your individual baby''s pace and personality rather than racing to the next milestone

**When Concern Is Warranted**

There is a difference between milestone anxiety (worry about normal variation) and genuine concern (noticing a consistent gap or regression). If something truly feels off, trust your instincts and raise it with your GP — that is exactly what milestone awareness is for.

**You Are Not Competing**

Your baby is not in a race. Their worth — and yours as a parent — is not measured in weeks achieved.

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider with concerns about your baby''s development.*$$,
  16,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Zero to Three', 'CDC ''Learn the Signs. Act Early.''', 'Mind UK'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-mental-health-milestones-anxiety'
) ON CONFLICT (slug) DO NOTHING;
