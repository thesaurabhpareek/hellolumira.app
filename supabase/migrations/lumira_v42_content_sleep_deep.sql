-- =============================================================================
-- Lumira v42: Deep-Dive Sleep Content Library
-- =============================================================================
-- 45 articles covering every major sleep question across infant and toddler stages.
-- Topics: foundations, safe sleep, naps, regressions, sleep training,
--         night feeding, environment, routine, travel, and illness.
-- Medical review: all articles contain disclaimers, evidence-based guidance.
-- Sources: AAP, WHO, NHS, Red Nose Foundation, SIDS and Kids, Sleep Foundation.
-- =============================================================================

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES

-- ─────────────────────────────────────────────────────────────────────────────
-- FOUNDATIONS (1–7)
-- ─────────────────────────────────────────────────────────────────────────────

(
  'infant',
  'sleep',
  'How Much Sleep Do Babies Need? A Full Age-by-Age Chart',
  $$**Sleep Needs Change Dramatically in the First Year**

One of the most common questions new parents have is: is my baby sleeping enough? The answer depends entirely on age, because sleep needs shift significantly in the first twelve months. Total sleep per day drops from around 16–18 hours in the newborn phase to roughly 12–14 hours by the end of the first year.

**Age-by-Age Sleep Chart**

| Age | Total daily sleep | Night sleep | Naps |
|---|---|---|---|
| 0–4 weeks | 15–18 hours | 8–9 hours (fragmented) | 7–9 hours across 4–6 naps |
| 1–2 months | 14–17 hours | 8–10 hours | 6–7 hours across 3–5 naps |
| 3–4 months | 14–16 hours | 9–10 hours | 4–5 hours across 3–4 naps |
| 5–6 months | 13–15 hours | 10–11 hours | 3–4 hours across 2–3 naps |
| 7–9 months | 12–15 hours | 10–12 hours | 2–3 hours across 2 naps |
| 10–12 months | 12–14 hours | 11–12 hours | 2–3 hours across 1–2 naps |

**Night sleep is fragmented — that is normal**

In the early weeks, night sleep is spread across many short stretches. Babies have tiny stomachs, immature nervous systems, and a circadian rhythm that has not yet developed. Expecting long unbroken nights before around four to six months is not realistic for most babies.

**Signs of a well-rested baby**

- Wakes in a reasonably good mood
- Has periods of alert, engaged wakefulness
- Does not fall asleep immediately every time they are held
- Feeds well and gains weight appropriately

**When to check in with your provider**

If your baby is consistently sleeping far less than the ranges above, is very difficult to wake, or shows signs of breathing irregularity during sleep, raise these with your paediatrician.

*This article is for informational purposes only and is not a substitute for personalised medical advice. Every baby is different — use these ranges as a guide, not a strict target.*$$,
  0,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'National Sleep Foundation', 'NHS UK'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-how-much-sleep-babies-need-chart'
),

(
  'infant',
  'sleep',
  'Understanding Baby Sleep Cycles: Why Babies Wake So Often',
  $$**Why Does My Baby Wake Up So Much?**

If you feel like your baby wakes at the slightest sound, or after every nap ends after exactly 30 minutes, sleep cycles are the explanation. Understanding them can make the exhaustion feel a little less bewildering.

**Adult vs baby sleep cycles**

Adults move through sleep cycles of roughly 90 minutes, spending extended time in deep non-REM sleep before surfacing briefly between cycles. Babies have much shorter cycles — roughly 45 to 50 minutes — and spend a much larger proportion of their sleep in lighter, active (REM) sleep.

**Why so much light sleep?**

Current research suggests that active sleep in infants may serve critical developmental functions. The brain is doing enormous processing work during this phase. It is also thought that the lighter sleep of early infancy is a protective mechanism — easier arousal may reduce the risk of SIDS.

**What happens at the end of a sleep cycle**

At the end of each cycle, all sleepers — adults included — surface slightly. Adults have learned to self-settle back to sleep without fully waking. Babies have not yet developed this skill, particularly if they rely on a feed, a cuddle, or rocking to fall asleep in the first place. When they surface, they look for the same conditions that were present when they went to sleep.

**What this means for you**

- Short naps of 30 to 45 minutes are developmentally normal in younger babies, not a problem to fix
- Frequent night wakings are expected, especially under four months
- As babies develop and learn to self-settle, consolidated sleep becomes more achievable

**Will it get better?**

Yes — for most babies, sleep consolidates meaningfully between four and twelve months, though the path is rarely linear.

*This article is for informational purposes only. Consult your healthcare provider with any concerns about your baby''s sleep or development.*$$,
  0,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'National Sleep Foundation', 'Mindell JA et al. - Pediatrics 2006'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-baby-sleep-cycles-why-babies-wake'
),

(
  'infant',
  'sleep',
  'Wake Windows by Age: The Key to Better Naps and Night Sleep',
  $$**What Is a Wake Window?**

A wake window is the amount of time a baby can comfortably stay awake between sleep periods before becoming overtired. It is one of the most useful concepts in infant sleep — get the timing right and naps and bedtime become significantly easier.

**Why wake windows matter**

An overtired baby produces more cortisol (a stress hormone) and actually finds it harder to fall asleep and stay asleep. An undertired baby is not ready for sleep and will resist it. The wake window sits in the sweet spot between these two states.

**Wake windows by age**

| Age | Wake window |
|---|---|
| 0–4 weeks | 45–60 minutes |
| 4–8 weeks | 60–90 minutes |
| 2–3 months | 75–90 minutes |
| 3–4 months | 90 minutes–2 hours |
| 4–5 months | 1.5–2.5 hours |
| 5–6 months | 2–2.5 hours |
| 6–8 months | 2.5–3 hours |
| 8–10 months | 3–3.5 hours |
| 10–12 months | 3.5–4 hours |

**The last wake window matters most**

The window before bedtime is especially important. Too short and your baby is not tired enough; too long and they become overtired. Many parents find that adjusting bedtime to align with the last wake window makes a noticeable difference.

**Watch the baby, not the clock**

Wake windows are guidelines. Tired cues — yawning, rubbing eyes, losing interest in play, staring blankly — matter more than the clock. Over time you will learn your baby''s rhythms.

**Common mistakes**

- Keeping babies awake longer to ''tire them out'' (backfires with overtiredness)
- Putting babies down too early (they resist and protest)
- Using one universal wake window regardless of age

*This article is for informational purposes only. Always follow your healthcare provider''s guidance for your individual baby.*$$,
  0,
  true,
  ARRAY['National Sleep Foundation', 'Weissbluth M - Healthy Sleep Habits, Happy Child', 'Mindell JA - Sleeping Through the Night'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-wake-windows-by-age-better-naps'
),

(
  'infant',
  'sleep',
  'Drowsy But Awake: Teaching Your Baby to Self-Settle',
  $$**What Does "Drowsy But Awake" Mean?**

''Drowsy but awake'' is one of the most repeated phrases in infant sleep advice — and one of the most misunderstood. It refers to putting your baby down in their sleep space when they are clearly sleepy but still conscious, giving them the chance to drift off without being fully asleep in your arms first.

**Why it matters**

When babies fall asleep in one place (your arms, at the breast, in the pram) and then wake in a different place (their cot), they can feel disoriented and alarmed — and cry out. If they fall asleep in the cot, they are more likely to be able to settle themselves back to sleep when they naturally surface between sleep cycles.

**What drowsy but awake actually looks like**

- Heavy, slow eyelids — blinking slowly
- Relaxed body, but still able to look around if stimulated
- Sucking may be slowing but still responding
- Not fully limp or deeply asleep

It is a narrow window — and it takes practice to catch it consistently.

**How to practise**

1. Run your usual wind-down routine (feed, bath, story, song)
2. When you notice drowsy cues, place your baby in the cot
3. Offer a reassuring hand or voice briefly, then give them space
4. It is normal for it to take time — this is a skill being learned

**A note on realistic expectations**

Many babies, especially under three to four months, are not developmentally ready to self-settle. If it is not working and causing significant distress, there is no harm in returning to whatever works for your family. Drowsy but awake is a useful tool, not a mandatory technique.

**Not every baby takes to it immediately**

Start with one sleep period — often the first nap of the day when your baby is freshest — rather than overhauling all sleep at once.

*This article is for informational purposes only. Consult your paediatrician or a certified sleep consultant for personalised guidance.*$$,
  8,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Mindell JA et al. - Pediatrics 2006', 'National Sleep Foundation'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-drowsy-but-awake-self-settling'
),

(
  'infant',
  'sleep',
  'Sleep Associations: Helpful vs. Dependent — What''s the Difference?',
  $$**What Is a Sleep Association?**

A sleep association is anything your baby links with falling asleep — a feed, being rocked, a dummy, white noise, or even a particular position. All humans have sleep associations. The question is whether yours are ''dependent'' (require your active involvement every time) or ''independent'' (your baby can re-create without you).

**Helpful sleep associations**

These are things your baby can access on their own after you leave the room:
- White noise playing from a speaker
- A dim room
- A sleep sack
- A familiar smell (a worn item of your clothing near — not in — the cot for older babies)
- A dummy that your baby can replace themselves (from around 6–7 months)

**Dependent sleep associations**

These require you to be present and actively doing something:
- Feeding to sleep
- Rocking or bouncing to sleep
- Holding until deeply asleep
- Patting that must continue until they are fully asleep

Dependent associations are not harmful — they are soothing and attachment-building. The trade-off is that your baby will call for you each time they naturally surface between sleep cycles overnight.

**Should you change them?**

Only if the current arrangement is not sustainable for your family. Many families are happy feeding or rocking to sleep for months. If night wakings are becoming unmanageable, shifting toward more independent sleep associations is one of the most effective changes you can make.

**How to shift gradually**

Start by introducing independent associations (white noise, sleep sack, dark room) consistently. Then begin putting your baby down slightly less asleep each night, over one to two weeks. Gradual change is easier on everyone than an abrupt switch.

*This article is for informational purposes only. Every family''s situation is unique — seek support from your healthcare provider or a certified infant sleep consultant if needed.*$$,
  4,
  true,
  ARRAY['Mindell JA et al. - Pediatrics 2006', 'National Sleep Foundation', 'American Academy of Pediatrics (AAP)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-associations-helpful-vs-dependent'
),

(
  'infant',
  'sleep',
  'White Noise for Babies: Safe Volume, Best Types, and How Long to Use It',
  $$**Why White Noise Works for Babies**

The womb is surprisingly loud — continuous whooshing sounds from blood flow and digestion register at around 80 to 85 decibels. For many newborns, silence is actually unfamiliar. White noise mimics this environment, helping babies settle and reducing their startle response.

**Types of white noise**

- **True white noise**: A flat, static sound covering all frequencies equally
- **Pink noise**: Emphasises lower frequencies; many babies respond well to this
- **Brown noise**: Even deeper, richer — similar to rushing water or a fan
- **Nature sounds**: Rain, ocean waves, river sounds — often effective and pleasant
- **Shushing sounds**: Similar to what parents do naturally when settling babies

**Safe volume — this matters**

The AAP and other paediatric organisations recommend keeping white noise machines at or below **50 decibels** at the baby''s ear level. Place the device at least 2 metres from the cot, not directly next to the baby''s head. At safe levels, white noise is not harmful to infant hearing.

To give you a reference point: normal conversation is around 60 decibels. Your white noise should be quieter than that.

**How long to use it**

White noise can be used for as long as it is helpful. There is no evidence of harm from continued use. Many families phase it out naturally as their toddler grows — and many continue it through toddlerhood. When you do decide to phase it out, reduce the volume gradually over one to two weeks rather than stopping abruptly.

**Practical tips**

- Use a dedicated white noise machine rather than a phone speaker (safer and more reliable)
- Keep it consistent for every sleep — naps and nights
- Do not vary the volume or type randomly; consistency helps association

*This article is for informational purposes only. Please consult your paediatrician if you have concerns about your baby''s hearing or sleep environment.*$$,
  0,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Hugh SC et al. - Pediatrics 2014', 'National Sleep Foundation'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-white-noise-safe-volume-types'
),

(
  'infant',
  'sleep',
  'Room Temperature for Safe Baby Sleep',
  $$**Why Room Temperature Matters**

Babies cannot regulate their own body temperature the way adults can. A room that is too warm increases the risk of overheating — a recognised risk factor for SIDS (sudden infant death syndrome). A room that is too cold disrupts sleep and can stress a young baby''s system.

**The recommended range**

Most paediatric and SIDS organisations recommend keeping a baby''s sleep room at **16 to 20 degrees Celsius** (61 to 68 degrees Fahrenheit). Within this range, most babies sleep comfortably when dressed appropriately for the temperature.

**How to dress your baby for the temperature**

A useful guide is the TOG (Thermal Overall Grade) system used on sleep sacks:

| Room temp | Suggested clothing + sleep sack TOG |
|---|---|
| Below 16°C | Vest + sleepsuit + 2.5 TOG or higher |
| 16–18°C | Vest + sleepsuit + 2.5 TOG |
| 18–20°C | Vest + sleepsuit + 1.0 TOG |
| 20–22°C | Vest + 1.0 TOG sleep sack |
| 22–24°C | Vest only + 0.5 TOG |
| Above 24°C | Nappy/vest only, consider a fan for air circulation |

**How to check if your baby is too hot or cold**

Check the back of the neck or chest — not the hands or feet, which are often cool even in a comfortable baby. Signs of overheating include sweating, flushed skin, rapid breathing, or feeling very warm to the touch.

**Never use loose blankets with young infants**

If your home is cold, use a sleep sack or swaddle rather than placing blankets in the cot. Loose bedding in the sleep space is a significant suffocation risk for babies under 12 months.

*This article is for informational purposes only. Always follow your regional safe sleep guidelines and consult your healthcare provider with any concerns.*$$,
  0,
  true,
  ARRAY['Red Nose Foundation Australia', 'American Academy of Pediatrics (AAP)', 'Lullaby Trust UK', 'NHS UK'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-room-temperature-safe-baby-sleep'
),

-- ─────────────────────────────────────────────────────────────────────────────
-- SAFE SLEEP (8–12)
-- ─────────────────────────────────────────────────────────────────────────────

(
  'infant',
  'sleep',
  'Back to Sleep: Why Babies Must Sleep on Their Back',
  $$**The Evidence Is Clear**

Since the ''Back to Sleep'' campaign launched in the early 1990s, rates of SIDS (sudden infant death syndrome) have dropped by more than 50% in countries where the guidance was widely adopted. Placing babies on their back to sleep is one of the most evidence-backed recommendations in all of paediatric medicine.

**Why back sleeping is safer**

When a baby sleeps on their stomach, several risks increase:
- Rebreathing exhaled carbon dioxide if the face becomes partially covered
- Overheating, as body heat cannot dissipate as easily
- Reduced ability to rouse from sleep in response to these stresses

Babies on their back can more easily turn their head, open their airway, and rouse themselves if needed.

**Common concerns — addressed**

*''My baby hates being on their back.''*
Many babies take time to adjust. Keep offering back sleep consistently. Their preference is not a safety indicator.

*''Won''t they choke if they spit up?''*
This is a very common worry and largely unfounded. Healthy babies have a natural reflex that protects their airway. Stomach sleeping actually increases choking risk because the airway is positioned differently.

*''My parents put me on my stomach and I was fine.''*
Many babies were — but the data on SIDS risk is compelling. Our understanding has improved significantly.

**When babies can roll**

Once a baby can roll from back to tummy and back again independently (typically around four to six months), you do not need to reposition them if they roll in their sleep. Continue placing them on their back to start each sleep.

**Supervised tummy time**

Tummy time while your baby is awake and supervised is essential for development. It builds neck and shoulder strength and helps prevent positional flat head. The rule is: back for sleep, tummy for play.

*This article is for informational purposes only. Please follow the safe sleep guidelines from your regional paediatric authority and consult your healthcare provider with any concerns.*$$,
  0,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Red Nose Foundation Australia', 'Lullaby Trust UK', 'WHO'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-back-to-sleep-why-babies-back'
),

(
  'infant',
  'sleep',
  'The ABCs of Safe Sleep: Alone, Back, Cot',
  $$**A Simple Framework That Saves Lives**

Safe sleep guidelines can feel overwhelming, but the core principle is often summarised in three letters: ABC — Alone, Back, Cot. This framework, supported by the AAP and equivalent bodies worldwide, captures the most protective conditions for infant sleep.

**A — Alone**

Your baby should sleep alone in their sleep space, without other people or pets sharing the surface. This means:
- No sharing a bed with adults, siblings, or pets (bed-sharing significantly increases SIDS risk, especially with soft mattresses, duvets, or if a parent has consumed alcohol, sedatives, or is a smoker)
- Room-sharing is encouraged — having your baby''s cot or bassinet in your room for at least the first six months reduces SIDS risk
- Room-sharing is not the same as bed-sharing

**B — Back**

Every sleep, every time. Back sleeping is the only recommended position for healthy infants. If your baby rolls independently, you do not need to reposition them, but always start them on their back.

**C — Cot (or safe sleep surface)**

Your baby should sleep on a firm, flat, safety-approved surface with a fitted sheet. This includes:
- A cot, bassinet, or Moses basket that meets current safety standards
- A firm, flat mattress with no sagging
- No inclined sleepers, loungers, or bouncers for unattended sleep
- No pillows, bumpers, positioners, or loose toys

**Room-sharing without bed-sharing**

Having your baby''s cot next to your bed offers the best of both worlds — proximity for feeding and comfort, with a safer sleep surface for your baby.

**If you fall asleep while feeding**

Plan ahead. If there is a chance you might doze off during a night feed, set up the safest possible surface in advance. A firm sofa arm or reclined chair is significantly more dangerous than a firm bed — so a firm bed with no loose bedding is preferable to a sofa if you do fall asleep.

*This article is for informational purposes only. Safe sleep guidelines may vary slightly by country. Always follow the guidance of your regional paediatric authority.*$$,
  0,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Red Nose Foundation Australia', 'Lullaby Trust UK', 'NHS UK'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-abcs-safe-sleep-alone-back-cot'
),

(
  'infant',
  'sleep',
  'Safe Cot Setup: What Should and Should Not Be in the Cot',
  $$**The Cot Is a Sleep Space, Not a Decoration Zone**

It is tempting to make a baby''s cot feel cosy and welcoming — but many of the items traditionally placed in cots are associated with suffocation and SIDS risk. A safe cot setup is a minimal one.

**What belongs in the cot**

- A firm, flat mattress that fits snugly with no gaps around the edges
- A single fitted sheet designed for that specific mattress size
- Your baby (and nothing else, for babies under 12 months)

**What does NOT belong in the cot**

- **Pillows**: Risk of suffocation; not needed until well into toddlerhood
- **Loose blankets or duvets**: Use a sleep sack instead
- **Cot bumpers**: Now strongly advised against by the AAP and many global bodies — they provide no safety benefit and can be a suffocation hazard
- **Soft toys or stuffed animals**: Save these for supervised playtime
- **Positioners or wedges**: No evidence of benefit; evidence of harm
- **Mobiles that can fall into the cot**
- **Blanket rolls or rolled towels**

**The mattress matters**

A good cot mattress should be:
- Firm and flat — your hand should not leave an impression
- The correct size for the cot (no gaps at the sides)
- Covered with a waterproof protector underneath a fitted sheet

**Second-hand cots and mattresses**

Second-hand cots are fine if they meet current safety standards (check the manufacture date and recall status). The AAP recommends using a new mattress where possible, as a mattress that has been exposed to moisture from another baby may have a different microbiological profile. If using a second-hand mattress, ensure it is firm, undamaged, and thoroughly clean.

*This article is for informational purposes only. Always follow your regional safe sleep standards. Consult your healthcare provider with any concerns.*$$,
  0,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Lullaby Trust UK', 'Red Nose Foundation Australia', 'Consumer Product Safety Commission (CPSC)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-safe-cot-setup-what-in-out'
),

(
  'infant',
  'sleep',
  'Sleep Positioners and Wedges: Why the Evidence Is Against Them',
  $$**What Are Sleep Positioners?**

Sleep positioners — also called wedges, anti-roll devices, or infant nests — are products designed to keep a baby in a specific position during sleep, often propped on a wedge or held in place by bolsters. They are marketed with claims around reflux, flat head prevention, or simply keeping a baby ''secure.''

**The evidence does not support their use**

Major paediatric bodies — including the AAP, the UK''s Medicines and Healthcare products Regulatory Agency (MHRA), and Australia''s Red Nose Foundation — advise against using sleep positioners for healthy infants. The reasons:

- Babies can become wedged against the side of a positioner with their face obstructed
- Several infant deaths have been linked to positioner use
- The claimed benefits (for reflux, flat head) are not supported by clinical evidence
- They create an unstable surface and can shift position during sleep

**The reflux argument**

Some positioners are sold for babies with gastro-oesophageal reflux. The evidence does not support elevation as a safe or effective intervention for infant reflux. The AAP specifically recommends against head-of-bed elevation for infant reflux. If your baby has significant reflux symptoms, work with your paediatrician on evidence-based management.

**What about flat head (positional plagiocephaly)?**

Flat head prevention is better addressed through supervised tummy time while awake, varied awake positioning, and — if needed — physiotherapy. Not through sleep positioners.

**What to use instead**

A firm, flat, empty cot with a well-fitted sheet is the safest sleep surface. If you are worried about your baby rolling or moving during sleep, rest assured that a firm flat surface without positioners is safer than one with them.

*This article is for informational purposes only. Please consult your paediatrician if you have specific concerns about your baby''s sleep position or reflux.*$$,
  0,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Red Nose Foundation Australia', 'MHRA UK', 'FDA USA'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-positioners-wedges-evidence-against'
),

(
  'infant',
  'sleep',
  'Sleeping in the Car Seat: The Risks of Extended Use',
  $$**Car Seats Are Designed for Travel, Not Sleep**

Car seats are life-saving devices when used correctly in vehicles. They are not safe sleep surfaces for extended, unsupervised use outside the car. This distinction matters — and it is one of the most overlooked safe sleep issues.

**Why car seat sleep carries risks**

When a baby sleeps in a car seat outside the car (in a pram frame, a trolley, or left in the seat at home), several risks arise:

- The semi-reclined angle can cause an infant''s head to fall forward, compressing the airway — this is called positional asphyxiation
- Young babies, particularly newborns and premature infants, have weak neck muscles and cannot correct their head position if it falls forward
- The risk is greatest when the seat is not at the correct recline angle (seats are designed to sit at a specific angle in the car installation, not always the angle they sit at independently)

**What the research shows**

A study published in Pediatrics found that more than 30% of infant sleep-related deaths in car seats, bouncers, and similar devices occurred while the infant was being supervised. Being nearby does not eliminate the risk if you are not watching continuously.

**Safe practices**

- Limit car seat time to the duration of travel
- Transfer your baby to a firm, flat sleep surface as soon as you arrive home
- If your baby falls asleep in the car, try to transfer them — or stay in the vehicle and watch them until you arrive at your destination
- Do not place a sleeping baby in their car seat on the floor, pram frame, or shopping trolley for a nap

**The pram question**

Many prams have a lie-flat position for newborns, which is significantly safer than a car seat recline. If you need your baby to sleep on the go, a lie-flat pram or carrier with appropriate head support is preferable to leaving them in the car seat.

*This article is for informational purposes only. Consult your paediatrician or child safety authority for guidance specific to your situation.*$$,
  0,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Liaw P et al. - Pediatrics 2019', 'Red Nose Foundation Australia', 'Lullaby Trust UK'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-car-seat-risks-extended-use'
),

-- ─────────────────────────────────────────────────────────────────────────────
-- NAPS (13–19)
-- ─────────────────────────────────────────────────────────────────────────────

(
  'infant',
  'sleep',
  'Newborn Naps: How Long, How Many, and Wake Windows',
  $$**Newborn Sleep Is Chaotic — and That''s Normal**

In the first eight weeks of life, naps do not follow a schedule. Newborns sleep in short bursts throughout the day and night, with no strong distinction between the two — their circadian rhythm has not yet developed. Trying to enforce a nap schedule at this stage tends to cause more stress than sleep.

**How many naps do newborns take?**

Most newborns take four to six naps in a 24-hour period, totalling seven to nine hours of daytime sleep. Each nap may last anywhere from 20 minutes to two hours. The variation is completely normal.

**Wake windows for newborns**

- Weeks 0 to 4: 45 to 60 minutes maximum awake time
- Weeks 4 to 8: 60 to 90 minutes maximum awake time

At these ages, watch closely for tired cues — yawning, losing interest in stimulation, staring, fussing. When you see two or three cues, it is time to begin settling.

**What newborn naps look like**

- Mostly happen in arms, at the breast, in a carrier, or in a pram — and that is fine
- Short naps (20 to 45 minutes) are the norm; a 90-minute nap is a gift, not an expectation
- Naps and night sleep are interchangeable at this stage — there is no meaningful day-night pattern yet

**Helping day-night distinction develop**

You can gently encourage circadian rhythm development from around two weeks:
- Bright light and activity during the day
- Keep nap environments slightly lighter and noisier than the night environment
- Dark, quiet, calm environment for night sleep

**What you do not need to do yet**

- Follow a strict eat-play-sleep routine
- Worry about nap location (cot vs arms)
- Limit nap length (unless advised by your provider for feeding reasons)

*This article is for informational purposes only and is not a substitute for personalised advice. Speak with your midwife, health visitor, or paediatrician with any concerns.*$$,
  0,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'National Sleep Foundation', 'Mindell JA - Sleeping Through the Night'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-newborn-naps-how-long-many-windows'
),

(
  'infant',
  'sleep',
  'The 4-to-3 Nap Transition: When It Happens and How to Navigate It',
  $$**When Do Babies Drop to Three Naps?**

Most babies make the transition from four naps to three naps somewhere between 3 and 4 months of age (around weeks 12 to 16). This is one of the earlier nap transitions and often happens gradually and somewhat naturally.

**Signs your baby is ready**

- Consistently resisting the fourth nap or taking a very long time to fall asleep for it
- The fourth nap is pushing bedtime very late
- Wake windows of around 90 minutes to 2 hours are becoming manageable
- Naps are starting to lengthen slightly (more than 30 to 45 minutes)

**Signs they are NOT ready**

- Still on very short wake windows (60 to 75 minutes)
- Extremely overtired without the fourth nap
- Under 12 weeks of age

**How to make the transition**

Rather than dropping the fourth nap abruptly, try extending wake windows by 10 to 15 minutes every few days. As wake windows grow, the gap between naps lengthens, and the fourth nap becomes unnecessary.

A sample three-nap structure:
- Wake around 7:00 am
- Nap 1 at around 8:30–9:00 am
- Nap 2 at around 12:00–12:30 pm
- Nap 3 (catnap) at around 3:00–3:30 pm
- Bedtime around 7:00–7:30 pm

The third nap at this stage is often a short catnap of 30 to 45 minutes — just enough to prevent overtiredness before bed.

**Expect some adjustment**

The transition period can last two to three weeks. Bedtime may need to be moved earlier temporarily while the new rhythm settles.

*This article is for informational purposes only. All babies develop at different rates — your health visitor or paediatrician can advise if you are uncertain.*$$,
  12,
  true,
  ARRAY['National Sleep Foundation', 'Weissbluth M - Healthy Sleep Habits, Happy Child', 'Mindell JA - Sleeping Through the Night'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-4-to-3-nap-transition'
),

(
  'infant',
  'sleep',
  'The 3-to-2 Nap Transition: Signs and How to Manage It',
  $$**When Do Babies Drop to Two Naps?**

The transition from three naps to two typically happens between four and six months of age (around weeks 16 to 24). It is one of the more straightforward transitions for most families, though it requires some schedule adjustment.

**Signs your baby is ready for two naps**

- Consistently refusing or fighting the third nap
- Taking a very long time to fall asleep for the third nap
- The third nap is pushing bedtime past 8:00 pm
- Wake windows of around 2 to 2.5 hours are manageable
- Naps are lasting 45 minutes or longer consistently

**Signs they are not quite ready**

- Becoming extremely overtired and cranky without the third nap
- Under 16 weeks of age
- Wake windows still under 90 minutes

**A sample two-nap schedule**

- Wake around 7:00 am
- Nap 1 around 9:00–9:30 am (45 minutes to 1.5 hours)
- Nap 2 around 1:00–1:30 pm (45 minutes to 1.5 hours)
- Bedtime around 7:00–7:30 pm (depending on when second nap ends)

**Managing the transition period**

- The third nap can be dropped gradually — try every other day first
- On days the third nap is dropped, move bedtime earlier by 30 to 45 minutes to avoid overtiredness
- Expect a two to three week adjustment period

**Why this transition can feel hard**

The gap between the second nap ending and bedtime can feel very long initially. An earlier bedtime is your best friend during this period — overtired babies do not sleep better, they sleep worse.

*This article is for informational purposes only. Every baby is different — consult your healthcare provider if you are unsure whether your baby is ready for this transition.*$$,
  16,
  true,
  ARRAY['National Sleep Foundation', 'Weissbluth M - Healthy Sleep Habits, Happy Child', 'Mindell JA - Sleeping Through the Night'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-3-to-2-nap-transition'
),

(
  'infant',
  'sleep',
  'The 2-to-1 Nap Transition: Navigating the Big One',
  $$**The Most Disruptive Nap Transition**

Moving from two naps to one is typically the most challenging transition in the first two years. It usually happens between 12 and 18 months (around weeks 40 to 72), and many families find their toddler seems caught between two nap needs for several weeks — too tired for one nap, too wakeful for two.

**Signs your baby might be ready**

- Consistently refusing one of the two naps, several days in a row
- Taking a very long time (45 minutes or more) to fall asleep for the second nap
- One nap is pushing bedtime very late
- Able to manage a wake window of around 4 to 5 hours

**Signs they are not ready yet**

- Under 12 months
- Only occasionally refusing a nap (developmental leaps and illness can cause temporary nap resistance)
- Becoming extremely overtired when naps are missed

**How to make the transition**

Rather than switching abruptly, try a gradual approach:
- Begin pushing the first nap later by 15 minutes every few days
- Work towards a single midday nap starting around 12:00 to 1:00 pm
- Keep this nap capped at 1.5 to 2 hours initially to protect night sleep
- Move bedtime earlier during the adjustment period — a 6:30 to 7:00 pm bedtime is common during transition

**The ''in-between'' phase**

Many children need two naps on some days and one on others for a period of two to six weeks. Follow your child''s cues rather than forcing a fixed schedule too quickly.

**What to expect after the transition**

Once settled on one nap, most toddlers sleep for 1.5 to 2.5 hours in the middle of the day and have a bedtime of around 7:00 to 8:00 pm.

*This article is for informational purposes only. Consult your paediatrician or health visitor if you are uncertain about your child''s readiness.*$$,
  40,
  true,
  ARRAY['National Sleep Foundation', 'Weissbluth M - Healthy Sleep Habits, Happy Child', 'American Academy of Pediatrics (AAP)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-2-to-1-nap-transition'
),

(
  'infant',
  'sleep',
  'Short Naps: Why Babies Wake After 30 to 40 Minutes',
  $$**Why Does My Baby Always Wake After 30 Minutes?**

If your baby wakes consistently at the 30 to 45 minute mark of every nap, you are witnessing sleep cycle endings in action. This is one of the most common infant sleep questions — and one of the most frustrating experiences for parents.

**The sleep cycle explanation**

Babies have sleep cycles of approximately 45 minutes. At the end of each cycle, all sleepers (including adults) surface slightly. Adults have learned to roll over and fall back asleep without fully waking. Many babies have not yet developed this skill, particularly if they rely on feeding or rocking to fall asleep in the first place.

**When nap extensions start to happen naturally**

Most babies begin linking sleep cycles (and taking longer naps) somewhere between four and six months — some earlier, some later. It is a developmental achievement, not something that happens on a fixed timeline.

**What you can try**

- **Pause before responding**: When you hear stirring at 30 minutes, wait two to three minutes before going in. Some babies will self-settle back to sleep.
- **Improve independent settling**: Babies who can fall asleep independently at nap start are more likely to link cycles, because they can re-create the conditions they need.
- **Adjust wake windows**: Putting a baby down when slightly more tired (but not overtired) can encourage deeper initial sleep.
- **Environmental consistency**: Ensure white noise, darkness, and temperature are consistent throughout the nap.

**When short naps are fine**

- Under four months: Short naps are completely normal and not a problem to solve
- If your baby wakes happy and feeds well, a 30-minute nap may be sufficient for their current needs
- Multiple short naps totalling adequate daily sleep are fine — it is the total that matters more than individual nap length

*This article is for informational purposes only. If you are concerned about your baby''s sleep, consult your healthcare provider or a certified infant sleep consultant.*$$,
  8,
  true,
  ARRAY['Mindell JA et al. - Pediatrics 2006', 'National Sleep Foundation', 'Weissbluth M - Healthy Sleep Habits, Happy Child'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-short-naps-why-wake-30-minutes'
),

(
  'infant',
  'sleep',
  'Naps on the Go: Car, Pram, and Carrier — Pros and Cons',
  $$**Does Nap Location Really Matter?**

Many parents find that their baby sleeps brilliantly in the pram or car but barely at all in the cot. The question then becomes: is this a problem? And the honest answer is — it depends on your stage and your goals.

**Car naps**

Pros: Motion is soothing, many babies settle quickly, useful when out and about.
Cons: You cannot go anywhere while the nap is happening; extended car seat use outside the car carries safety risks (positional asphyxiation); you cannot transfer most babies without waking them.

If car naps are your primary nap strategy, they work — but be aware that the nap ends when the car stops, and leaving a baby sleeping in a stationary car seat is not recommended for extended periods (see our article on car seat sleep safety).

**Pram naps**

Pros: Fresh air, flexibility, good for walking-dependent families, many babies love motion.
Cons: Motion becomes a dependent sleep association; naps may be shorter if the pram stops; not a controlled environment for temperature or noise.

A lie-flat pram position is much safer than a car seat angle for sleeping. If your baby naps in the pram regularly, this is completely fine.

**Carrier naps**

Pros: Close contact is soothing; hands-free; supports circadian rhythm through light exposure.
Cons: You cannot easily do other tasks; over time, contact becomes a dependent association; not ideal for all postures (ensure baby''s airway is open — TICKS guidelines apply).

**The ''nap anywhere'' stage: birth to ~4 months**

In the early weeks, nap location matters very little for development. The priority is that your baby sleeps. From around four months, many parents start to work toward some cot naps, but this is a gradual process, not an abrupt switch.

**When to shift toward cot naps**

If you are working on independent settling and sleep consolidation, cot naps support that work. One cot nap per day as a starting point — often the first morning nap — is a reasonable approach.

*This article is for informational purposes only. Safe carrier use and pram safety guidelines should always be followed.*$$,
  8,
  true,
  ARRAY['National Sleep Foundation', 'Baby Carrier Industry Alliance', 'Red Nose Foundation Australia'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-naps-on-the-go-car-pram-carrier'
),

(
  'infant',
  'sleep',
  'Nap Regressions: What They Are and How Long They Last',
  $$**Why Has My Baby''s Napping Suddenly Got Worse?**

Just when naps seem to be settling into a pattern, something shifts. Your baby who was taking two solid naps a day is suddenly fighting sleep, waking early from naps, or refusing one nap entirely. This is often described as a nap regression.

**What actually causes nap regressions**

Nap regressions are usually caused by one of three things:
1. **Developmental leaps**: When the brain is undergoing rapid development (rolling, crawling, pulling up, walking, language), sleep is often temporarily disrupted
2. **Nap transition readiness**: Fighting a nap may signal readiness to drop to fewer naps — but not necessarily
3. **Schedule drift**: Wake windows may need adjusting as your baby grows

**The most common nap regression periods**

- **Around 4 months**: The four-month sleep regression affects both naps and nights
- **Around 8 months**: Developmental leap, separation anxiety, and possible approach of the 2-to-1 nap transition
- **Around 12 to 18 months**: The extended 2-to-1 transition period

**How long do they last?**

A true developmental regression typically lasts two to four weeks. If nap difficulties persist beyond four to six weeks, it may be a schedule issue (wake windows need adjusting) rather than a regression.

**What to do during a nap regression**

- Stay consistent with your settling approach — inconsistency during regressions can create new dependent associations
- Check whether wake windows need extending for this age
- Rule out teething, illness, or environmental changes
- Consider whether a nap transition may be approaching

**What not to do**

- Abandon all structure entirely — some consistency helps
- Assume it will last forever — it will not

*This article is for informational purposes only. Consult your health visitor or paediatrician if sleep disruptions are prolonged or concerning.*$$,
  16,
  true,
  ARRAY['National Sleep Foundation', 'Mindell JA et al. - Pediatrics 2006', 'American Academy of Pediatrics (AAP)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-nap-regressions-what-how-long'
),

-- ─────────────────────────────────────────────────────────────────────────────
-- SLEEP REGRESSIONS (20–25)
-- ─────────────────────────────────────────────────────────────────────────────

(
  'infant',
  'sleep',
  'The 4-Month Sleep Regression: What Causes It and What Helps',
  $$**The Most Well-Known Sleep Regression**

The four-month sleep regression is not a myth — it is a real, documented neurological shift that permanently changes how your baby sleeps. Unlike other regressions, it does not resolve on its own and return to the previous sleep pattern. It represents a fundamental change in sleep architecture.

**What happens at four months**

Before this point, babies cycle between two sleep states: active (REM) and quiet (non-REM). At around three to four months, the brain matures and develops the adult pattern of four distinct sleep stages. This means more transitions between lighter and deeper sleep — and more opportunities to fully wake between cycles.

**Why does it feel so sudden?**

For many families, a baby who was sleeping in two to four hour stretches suddenly starts waking every 45 to 90 minutes overnight. It can feel like going backwards, but it is actually a sign of normal brain development.

**What helps**

- **Begin working on independent settling**: If your baby has only ever fallen asleep with feeding or rocking, this is a good time to start gradually shifting those associations
- **Adjust wake windows**: At four months, wake windows of 90 minutes to 2 hours are typical — overtiredness makes everything worse
- **Optimise the sleep environment**: Dark room, white noise, consistent temperature
- **Earlier bedtime**: Overtired babies have more frequent night wakings — a 7:00 to 7:30 pm bedtime often helps

**What does not help**

- Hoping it will pass without any changes (it may ease slightly, but the sleep architecture change is permanent)
- Keeping babies up later to ''make them more tired'' (backfires)
- Frequent schedule changes during the regression

**How long does it last?**

The regression itself typically peaks over two to four weeks. Sleep improvement depends largely on what changes you make to settling strategies.

*This article is for informational purposes only. Please consult your paediatrician or a certified sleep consultant for personalised support.*$$,
  16,
  true,
  ARRAY['Mindell JA et al. - Pediatrics 2006', 'National Sleep Foundation', 'American Academy of Pediatrics (AAP)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-4-month-regression-causes-what-helps'
),

(
  'infant',
  'sleep',
  'The 8 to 10 Month Sleep Regression: Separation Anxiety and Development',
  $$**Why the Eight to Ten Month Period Is Particularly Disruptive**

Many parents who navigated the four-month regression find that just as sleep was improving, a new wave of disruption arrives around eight to ten months. This regression is driven by a combination of developmental leaps and the emergence of separation anxiety.

**What is happening developmentally**

- Babies are learning major physical skills: crawling, pulling to stand, cruising along furniture
- **Object permanence** is emerging — your baby now knows you exist when you leave the room, which makes your absence more distressing
- **Separation anxiety** peaks between eight and eighteen months — it is a healthy sign of attachment, but it makes night wakings more fraught
- Language comprehension is expanding rapidly, adding cognitive load

**How it shows up in sleep**

- Increased night wakings after a period of better sleep
- Strong protests at bedtime or when placed in the cot
- Difficulty settling without a parent present
- Early waking or cat-napping returning

**What helps**

- **Maintain consistency**: Your settling approach matters more than ever during this period — inconsistency can reinforce the association of crying bringing you back
- **Daytime attachment activities**: Lots of eye contact, responsive play, and cuddles during the day can reduce anxiety at night
- **Peek-a-boo and object permanence games**: These actually help babies understand that you come back — great to do during awake time
- **Brief, calm goodnight ritual**: A predictable goodbye that does not drag on reduces distress
- **Consider adjusting wake windows**: At this age, wake windows of 2.5 to 3.5 hours are typical

**How long does it last?**

Usually two to six weeks. Separation anxiety as a broader phase may continue through twelve to eighteen months, but the acute sleep disruption typically improves.

*This article is for informational purposes only. If sleep disruption is severe or your baby seems unwell, consult your healthcare provider.*$$,
  32,
  true,
  ARRAY['National Sleep Foundation', 'Mindell JA et al. - Pediatrics 2006', 'American Academy of Pediatrics (AAP)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-8-10-month-regression-separation-anxiety'
),

(
  'infant',
  'sleep',
  'The 12-Month Sleep Regression: What to Expect',
  $$**Around the First Birthday**

The twelve-month sleep regression is one of the more common disruptions families report in the second half of the first year. It often coincides with a period of rapid physical and cognitive development — walking, language explosion, and a significant neurological leap.

**What drives the twelve-month regression**

- **Gross motor development**: Many babies are pulling to stand, cruising, or beginning to walk around this time — the brain is highly active
- **Nap transition signals**: Some babies begin showing signs of readiness for the 2-to-1 nap transition around 12 months (though most are not fully ready until 12 to 18 months)
- **Language and cognitive leaps**: Understanding more of the world around them; processing more during sleep
- **Separation anxiety**: Still present and active at this age

**How it presents**

- Previously good sleeper suddenly waking more overnight
- Fighting naps or one nap much more than usual
- Earlier morning waking
- Taking longer to settle at bedtime

**What to do**

- **Do not rush the nap transition**: Unless your baby is showing consistent, prolonged signs of readiness (not just during the regression), stick with two naps
- **Keep the routine consistent**: Predictability is comforting during a developmental leap
- **Check wake windows**: At twelve months, wake windows are typically 3 to 4 hours
- **Offer extra comfort during the day**: This can reduce the need for reassurance at night

**How long does it last?**

Typically two to four weeks, assuming no major schedule or environmental changes compound it.

*This article is for informational purposes only. Speak with your paediatrician if the regression seems unusually prolonged or if your child seems unwell.*$$,
  12,
  true,
  ARRAY['National Sleep Foundation', 'American Academy of Pediatrics (AAP)', 'Weissbluth M - Healthy Sleep Habits, Happy Child'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-12-month-regression'
),

(
  'toddler',
  'sleep',
  'The 18-Month Sleep Regression: Why It''s the Hardest One',
  $$**Often Considered the Most Challenging Regression**

Many parents report that the eighteen-month sleep regression is the most disruptive they experience. It arrives just when families feel they have established good sleep habits, and it can be particularly intense for several converging reasons.

**What makes eighteen months uniquely disruptive**

- **Separation anxiety peaks** around eighteen months — this is the developmental zenith of this phase
- **Language explosion**: Toddlers understand far more than they can express, which causes frustration and increased emotional reactivity
- **Independence vs. dependency tension**: The classic toddler paradox — wanting independence but also wanting to stay close to parents
- **The 2-to-1 nap transition** is often still in progress or recently completed, disrupting the schedule
- **Cognitive leaps**: Imagination is developing — fears, including nighttime fears, may begin

**How it shows up in sleep**

- Dramatic bedtime protests and requests to delay sleep
- Frequent night wakings calling for parents
- Early morning waking
- Nap refusal or very short naps
- Increased separation distress at drop-off

**What helps**

- **Hold the boundaries with empathy**: Acknowledge feelings while maintaining the bedtime routine
- **Predictable, consistent routine**: A visual bedtime routine chart (even a simple one) can help toddlers who resist transitions
- **A comfort object**: A teddy or special blanket can serve as an independent comfort source overnight
- **Daytime connection**: Lots of responsive, engaged daytime interaction reduces nighttime needs
- **Earlier bedtime**: 6:30 to 7:00 pm often works better than a later bedtime during this phase

**Duration**

Typically three to six weeks. The intensity can feel relentless in the thick of it — it does pass.

*This article is for informational purposes only. If your toddler''s sleep is severely disrupted for more than six weeks, consider speaking with your paediatrician or a certified sleep consultant.*$$,
  18,
  true,
  ARRAY['National Sleep Foundation', 'American Academy of Pediatrics (AAP)', 'Zero to Three Organisation'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'toddler-sleep-18-month-regression-hardest-one'
),

(
  'toddler',
  'sleep',
  'The 2-Year Sleep Regression: Causes and What to Do',
  $$**Sleep Disruption at Two Years**

The two-year sleep regression is often driven by a combination of developmental changes, nap transitions, and the toddler''s growing sense of autonomy. It can emerge suddenly or gradually, and it frequently coincides with other life changes — a new sibling, starting childcare, or toilet training.

**Why two-year-olds regress in sleep**

- **Developmental leap**: Language is expanding rapidly; toddlers are processing enormous amounts of social and emotional information
- **Imagination and fears**: By two years, many toddlers develop fears of the dark, monsters, or being alone — nighttime is when these surface
- **Autonomy and control**: Two-year-olds are asserting independence in every domain, including sleep
- **Dropping the nap**: Some two-year-olds begin resisting their single nap, creating overtiredness
- **Life changes**: New sibling, new room, toilet training, and childcare transitions all affect sleep

**What this looks like**

- Bedtime battles and stalling (asking for water, another story, more hugs)
- Calling out or leaving the bedroom repeatedly
- Night waking with calls for parents
- Nightmares or night terrors beginning
- Nap refusal

**What helps**

- **Clear, predictable routine**: Two-year-olds respond well to knowing what comes next
- **Choices within limits**: ''Do you want one story or two stories?'' gives a sense of control without opening unlimited negotiation
- **Address fears with empathy**: A nightlight, a monster-proof spray (water in a spray bottle), or a guardian toy can help
- **If dropping the nap**: Protect quiet time even if sleep does not happen — rest is still important
- **Firm, warm consistency**: Not punitive, but clear that the expectation remains

**Duration**

Usually two to six weeks. Significant life events can extend the disruption.

*This article is for informational purposes only. Please consult your healthcare provider for personalised guidance.*$$,
  24,
  true,
  ARRAY['National Sleep Foundation', 'American Academy of Pediatrics (AAP)', 'Zero to Three Organisation'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'toddler-sleep-2-year-regression-causes'
),

(
  'infant',
  'sleep',
  'Is This a Regression or Something Else? Teething, Illness, and Travel',
  $$**Not Every Sleep Disruption Is a Regression**

The term ''sleep regression'' is widely used — sometimes too widely. Before attributing disrupted sleep to a developmental regression, it is worth checking whether another explanation fits better.

**Teething**

Teething begins around four to seven months and continues through the second year. It is a genuine source of discomfort, but research suggests it is often blamed for more sleep disruption than it actually causes. Studies show that teething symptoms (drooling, fussiness, gum discomfort) are most intense in the 48 hours before and after a tooth emerges — not for weeks at a time.

If sleep disruption has lasted more than two or three days with no sign of a tooth emerging, teething is probably not the primary cause.

**Illness**

Any illness — a cold, an ear infection, a stomach bug — will disrupt sleep, often significantly. Disruption during illness is not a regression; it is a normal response. The key is not to reinforce new dependent associations during recovery. Offer extra comfort, but try to return to your normal settling approach as your baby recovers.

Post-illness sleep often takes one to two weeks to fully normalise.

**Travel and time zones**

Travel disrupts sleep through schedule changes, new environments, and jet lag. The younger the baby, the more adaptable they tend to be to environmental changes — but the more dependent they are on familiar sleep conditions. Bring your usual white noise machine and sleep sack if travelling.

Jet lag takes roughly one day per time zone crossed to resolve. Light exposure at appropriate local times helps reset circadian rhythms.

**Environmental changes**

Moving house, a new room, a new cot, even a different pram — these can all temporarily disrupt sleep. Allow one to two weeks for adjustment.

**How to tell the difference from a regression**

- If sleep disruption is accompanied by other developmental markers (rolling, standing, language burst): likely regression
- If accompanied by temperature, feeding changes, runny nose, pulling at ears: likely illness
- If it appeared around a schedule or environment change: likely situational

*This article is for informational purposes only. If you are concerned about your baby''s health, always consult your healthcare provider.*$$,
  16,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'National Sleep Foundation', 'Macknin ML et al. - Pediatrics 2000'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-regression-or-teething-illness-travel'
),

-- ─────────────────────────────────────────────────────────────────────────────
-- SLEEP TRAINING (26–34)
-- ─────────────────────────────────────────────────────────────────────────────

(
  'infant',
  'sleep',
  'Should I Sleep Train? Weighing It Up Without Judgment',
  $$**A Decision Only Your Family Can Make**

Sleep training is one of the most debated topics in parenting — and one where strong opinions abound. The goal of this article is not to tell you what to do, but to give you accurate information to make a decision that works for your family.

**What is sleep training?**

Sleep training is any intentional process of helping a baby learn to fall asleep with less or no parental intervention. It ranges from gentle, gradual approaches with minimal or no crying, to more direct methods that involve some crying while a parent waits or checks in at intervals.

**What does the research say?**

Multiple large, well-designed studies — including a landmark 2016 randomised controlled trial in Pediatrics — have found that sleep training methods (including those involving some crying) do not cause lasting emotional harm, do not affect attachment security, and significantly improve infant sleep and parental wellbeing. This finding has been replicated across multiple studies.

**Who sleep training helps**

Sleep training tends to be most helpful when:
- Night wakings are frequent enough to significantly impair parental functioning
- Your baby is developmentally ready (typically after four months, ideally from six months)
- The family is in a position to be consistent for several days

**Who might take a different path**

- Families for whom co-sleeping or feeding to sleep is a sustainable and satisfying arrangement
- Families whose cultural or personal values prioritise a different kind of nighttime parenting
- Families whose babies are not yet developmentally ready
- Babies with medical issues affecting sleep

**There is no single right approach**

Whether you choose a structured sleep training method, a gentle gradual approach, or no formal approach at all — what matters most is that the arrangement is sustainable for your family and your baby''s needs are being met.

*This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider or a certified infant sleep consultant for personalised guidance.*$$,
  16,
  true,
  ARRAY['Price AMH et al. - Pediatrics 2016', 'Gradisar M et al. - Pediatrics 2016', 'American Academy of Pediatrics (AAP)', 'Mindell JA et al. - Sleep 2006'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-should-i-sleep-train-weighing-up'
),

(
  'infant',
  'sleep',
  'Cry It Out (Extinction): The Evidence and How It Works',
  $$**What Is Extinction Sleep Training?**

Extinction — commonly called ''cry it out'' or CIO — is a sleep training method in which parents place their baby in the cot awake at bedtime and do not return until morning (or a set time), allowing the baby to settle themselves. It is the most direct and typically the fastest of the sleep training methods.

**The evidence**

Extinction has been studied extensively. The 2016 Gradisar et al. randomised controlled trial found that extinction and graduated extinction both significantly improved infant sleep and caused no measurable difference in cortisol levels, emotional health, or attachment outcomes at twelve months compared to no sleep training. This aligns with the broader research consensus.

**How to implement extinction**

1. Ensure your baby is developmentally ready (most practitioners recommend at least six months, though some suggest from four months after paediatric clearance)
2. Run a clear, consistent bedtime routine of 20 to 30 minutes
3. Place your baby in the cot awake — drowsy but awake, or even fully awake
4. Say goodnight calmly and leave the room
5. Do not return until morning or a pre-set wake time (unless your baby is clearly unwell)
6. Be consistent for at least three to five nights

**What to expect**

- Night one is typically the hardest — crying may last 30 to 60 minutes or longer
- Most babies improve dramatically by night three to five
- Some babies have a brief resurgence on night two before improving significantly

**Common concerns addressed**

*Will it damage our bond?* Research says no — secure attachment is built across thousands of interactions, not one night.
*Is it cruel?* Feeling upset when a baby cries is normal. The evidence suggests the outcome — independent settling — is beneficial for families, including babies.

**It is not for every family**

If extinction does not feel right for your values, there are alternative approaches.

*This article is for informational purposes only. Consult your paediatrician before beginning any sleep training.*$$,
  16,
  true,
  ARRAY['Gradisar M et al. - Pediatrics 2016', 'Price AMH et al. - Pediatrics 2016', 'Mindell JA et al. - Sleep 2006', 'American Academy of Pediatrics (AAP)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-cry-it-out-extinction-evidence-how'
),

(
  'infant',
  'sleep',
  'The Ferber Method (Graduated Extinction): Step-by-Step Guide',
  $$**What Is the Ferber Method?**

The Ferber method — developed by Dr Richard Ferber — is a form of graduated extinction. Unlike full extinction (cry it out), the Ferber method involves returning to your baby at gradually increasing intervals to offer brief reassurance, without picking them up or fully resettling them.

**The core principle**

The method teaches self-settling by gradually increasing the time before check-ins. The check-ins are brief and calm — a touch, a few words, and then leaving again. The parent''s presence reassures the baby but does not resettle them to sleep.

**The Ferber check-in schedule**

| Night | First wait | Second wait | Third wait | Subsequent waits |
|---|---|---|---|---|
| 1 | 3 min | 5 min | 10 min | 10 min |
| 2 | 5 min | 10 min | 12 min | 12 min |
| 3 | 10 min | 12 min | 15 min | 15 min |
| 4+ | Gradually increase further |

These are guidelines — many practitioners adjust the intervals based on individual baby temperament.

**How to do a check-in**

- Enter briefly (30 to 60 seconds maximum)
- Speak calmly: ''I love you, it''s time to sleep, I''ll see you in the morning''
- A brief touch or pat is fine — do not pick up
- Leave again even if your baby is crying
- The check-in is for your reassurance as much as your baby''s

**What to expect**

Many families see significant improvement by night three to five. Some babies become more upset during check-ins (the parent''s arrival and departure is more frustrating than a steady state). In those cases, full extinction may be a better fit.

**Minimum age**

Most practitioners recommend four to six months minimum, with medical clearance.

*This article is for informational purposes only. Please consult your paediatrician or certified sleep consultant before beginning sleep training.*$$,
  16,
  true,
  ARRAY['Ferber R - Solve Your Child''s Sleep Problems', 'Gradisar M et al. - Pediatrics 2016', 'American Academy of Pediatrics (AAP)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-ferber-method-graduated-extinction-guide'
),

(
  'infant',
  'sleep',
  'The Chair Method (Sleep Lady Shuffle): Gradual Retreat Explained',
  $$**What Is the Chair Method?**

The chair method — popularised by Kim West in her book ''Good Night, Sleep Tight'' and sometimes called the Sleep Lady Shuffle — is a gradual retreat approach to sleep training. It involves the parent sitting in the room while the baby learns to settle, and moving progressively further away over ten to fourteen days.

**The core idea**

Rather than abrupt separation, you physically remain in the room but reduce your active involvement in settling. Over time, you move your chair closer to the door each night until you are outside the room entirely.

**A typical chair method schedule**

- **Nights 1 to 3**: Sit in a chair next to the cot. Offer minimal physical comfort (intermittent patting). Avoid sustained rocking or feeding to sleep.
- **Nights 4 to 6**: Move the chair to the middle of the room.
- **Nights 7 to 9**: Move the chair to the doorway.
- **Nights 10 to 12**: Sit just outside the door, occasionally offering a verbal reassurance.
- **Night 13+**: Leave the room after the settling routine.

**The strengths of this method**

- Lower distress for many parents, who find it difficult to leave the room entirely
- A clear, progressive structure
- Works well for babies who are soothed by presence rather than active contact

**The challenges**

- Requires significant commitment from the parent sitting in the room
- Some babies become more distressed seeing a parent not respond actively — this can work against the method
- Takes longer than extinction or Ferber
- Consistency across both parents and carers is critical

**Who it suits best**

Parents who want to remain present during the process and can commit to the gradual timeline. It tends to work well for babies from around six months onwards.

*This article is for informational purposes only. Please consult your paediatrician or a certified sleep consultant before beginning sleep training.*$$,
  16,
  true,
  ARRAY['West K - Good Night, Sleep Tight', 'Mindell JA et al. - Sleep 2006', 'National Sleep Foundation'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-chair-method-sleep-lady-shuffle'
),

(
  'infant',
  'sleep',
  'Pick Up Put Down: A Gentle Approach for Younger Babies',
  $$**What Is Pick Up Put Down?**

Pick Up Put Down (PUPD) is a gentle sleep training technique developed by Tracy Hogg (The Baby Whisperer). It involves placing your baby in the cot awake, and if they cry, picking them up to calm — but not to sleep — then putting them back down. This is repeated until the baby settles.

**The principle**

PUPD aims to teach self-settling without leaving a baby to cry alone. The parent remains actively involved, offering physical comfort when needed, but encourages the baby to complete the process of falling asleep in the cot.

**How to do it**

1. Complete your wind-down routine and place your baby in the cot awake
2. If your baby cries beyond a brief protest, pick them up calmly
3. Hold them upright, pat their back, and speak soothingly until crying reduces (not until they fall asleep)
4. Place them back in the cot before they are fully asleep
5. If they cry again, wait briefly, then repeat
6. Continue until they settle

**Realistic expectations**

- PUPD can be very time-consuming, especially at first — some sessions can last 45 to 90 minutes
- It works better for younger babies (around 3 to 5 months) than for older ones, who may become more stimulated by pick-ups
- From around six months, some babies get more upset when picked up and put down repeatedly — at that point, a modified approach with fewer pick-ups may work better

**When it does not work well**

- For older, more alert babies (six months and above) who find pick-ups stimulating
- When parents are too exhausted to sustain the approach consistently
- If the baby becomes more aroused, not calmer, when picked up

**A gentle, time-intensive option**

PUPD is among the gentlest structured approaches — but it requires patience and consistency. It suits families committed to being present throughout the process.

*This article is for informational purposes only. Please consult your healthcare provider before making any changes to your baby''s sleep routine.*$$,
  12,
  true,
  ARRAY['Hogg T - Secrets of the Baby Whisperer', 'National Sleep Foundation', 'Mindell JA et al. - Sleep 2006'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-pick-up-put-down-gentle-approach'
),

(
  'infant',
  'sleep',
  'The Fading Method: Reducing Parental Support Gradually',
  $$**What Is the Fading Method?**

The fading method is a sleep training approach based on gradually reducing parental involvement in the settling process over time, rather than removing it abruptly. It is considered one of the gentler approaches and involves minimal to no prolonged crying.

**How fading works**

You identify your current settling habit and systematically reduce it step by step. The process looks different depending on your starting point:

**If you currently feed to sleep:**
- Feed to drowsy but not asleep → put down slightly more awake each night → feed before bath instead of just before cot → gradually separate the feed from sleep further

**If you currently rock or hold to sleep:**
- Rock until drowsy but not asleep → reduce rocking movement gradually → hold without rocking → sit next to cot with hand on baby → remove hand → sit nearby without touching → move chair progressively further

**If you use patting:**
- Pat until drowsy → reduce duration of patting → intermittent pats → presence without patting → leave room

**Timeframe**

Fading is the slowest of the sleep training methods — typically taking two to four weeks. Progress can feel frustratingly slow, but the gradual nature means most babies do not experience significant distress.

**Who it suits**

- Families who want to avoid any crying and are willing to invest more time
- Younger babies (four to six months) where a very gentle approach is preferred
- Families where one parent has strong feelings about not using extinction methods

**Risks to watch for**

- Inconsistency: If some nights you follow the plan and others you revert, progress will be very slow
- Moving too fast: Each step should be held for several nights before moving on

*This article is for informational purposes only. Please consult a certified infant sleep consultant or your healthcare provider for personalised guidance.*$$,
  16,
  true,
  ARRAY['Mindell JA et al. - Sleep 2006', 'National Sleep Foundation', 'Kuhn BR and Elliott AJ - Child and Adolescent Psychiatric Clinics 2003'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-fading-method-reducing-support-gradually'
),

(
  'infant',
  'sleep',
  'No-Cry Sleep Approaches: What Actually Works',
  $$**Can Babies Learn to Sleep Without Any Crying?**

The honest answer is: some can, some cannot — and it depends on your definition of ''no crying.'' Any change to a baby''s settled sleep routine will likely involve some protest. The question is the degree of distress and how it is managed.

**What no-cry approaches focus on**

No-cry sleep approaches (popularised by Elizabeth Pantley in ''The No-Cry Sleep Solution'') focus on:
- Gradually shifting sleep associations rather than removing them abruptly
- Watching and responding to cues
- Working with the baby''s natural rhythm rather than imposing a rigid schedule

**Techniques commonly used in no-cry approaches**

- **Pantley''s Gentle Removal Plan**: Unlatch or remove your input before the baby is fully asleep, then replace if needed — repeated over many nights to gradually shift the association
- **Fading** (see our full article on this method)
- **Consistent, calming bedtime routines**: Strong routines reduce the cognitive work of settling
- **Wake-to-sleep**: Lightly rousing a baby just before a predictable early waking to reset the cycle
- **Scheduled awakenings**: Waking your baby shortly before they would wake themselves — used for predictable night waking patterns

**What the evidence shows**

No-cry methods are less well-studied than extinction and graduated extinction, primarily because they are harder to standardise in research settings. What evidence exists suggests they can be effective, particularly for younger babies, but results take longer and outcomes vary more than with structured methods.

**Who they suit best**

- Families opposed to any form of crying
- Younger babies (under four to five months)
- Families with time and patience for a slower process

**Managing expectations**

Progress is real but slow — typically measured in weeks rather than days. Consistency is everything.

*This article is for informational purposes only. Please consult your healthcare provider or a certified infant sleep consultant for support.*$$,
  16,
  true,
  ARRAY['Pantley E - The No-Cry Sleep Solution', 'Mindell JA et al. - Sleep 2006', 'National Sleep Foundation'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-no-cry-approaches-what-works'
),

(
  'infant',
  'sleep',
  'When Sleep Training Does Not Work: Troubleshooting Guide',
  $$**Why Sleep Training Sometimes Fails**

Sleep training works for the vast majority of families when applied consistently to an appropriate candidate. When it does not work — or stops working — the reason is almost always one of the following.

**1. Inconsistency**

This is the most common reason. Sleep training requires doing the same thing every night, and ideally across every caregiver. If one parent does extinction while the other rocks to sleep, the baby learns that persistence pays off. Consistency does not mean rigidity, but it does mean all adults on the same page.

**2. Age or developmental readiness**

Some babies under four months are not yet developmentally ready to settle independently for extended periods. If your baby is younger than four months and sleep training is not working, that may simply be why.

**3. An underlying medical issue**

Babies with unmanaged reflux, sleep apnoea, allergies, ear infections, or other medical issues will not sleep train successfully until those issues are addressed. If your baby seems genuinely distressed (not just protesting) and sleep does not improve after several days, discuss this with your paediatrician.

**4. Schedules that are off**

A baby put down overtired or undertired will fight sleep regardless of method. If sleep training is not working, audit your wake windows and total sleep before assuming the method is the problem.

**5. Method mismatch**

Some babies respond better to presence (chair method) and some to no check-ins (extinction). If one approach is not working after five to seven consistent days, it may be worth trying a different method.

**6. Developmental leap or regression**

Sleep training during a major developmental leap (four-month regression, eight-month leap) is harder. It can still work, but progress may be slower.

**What to do**

- Review consistency and schedule first
- Rule out medical causes
- Consider a consultation with a certified infant sleep consultant

*This article is for informational purposes only. Please consult your paediatrician if you have concerns about your baby''s health or wellbeing.*$$,
  16,
  true,
  ARRAY['Mindell JA et al. - Sleep 2006', 'American Academy of Pediatrics (AAP)', 'National Sleep Foundation'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-training-troubleshooting-when-not-working'
),

(
  'infant',
  'sleep',
  'Sleep Training With Two Children Sharing a Room',
  $$**One of the Most Challenging Sleep Scenarios**

Families with two children sharing a room face a genuine logistical challenge when sleep training: will the older child be woken? Will crying disturb both? The answer depends on age gap, sleep stage, and the method you choose.

**What actually wakes older siblings**

Older children (toddlers and above) are often more resilient to a crying baby than parents expect. Children in deep sleep stages are very difficult to rouse. Many families find that once the older child is used to the baby being in the room, they sleep through early phases of sleep training.

**Strategies for room-sharing families**

- **Separate the settling times**: Get the older child to sleep first, then bring in the baby to settle. This reduces the overlap during the highest-crying window.
- **White noise**: A white noise machine benefits both children — it masks the baby''s crying for the older child and creates a consistent settling environment for the baby.
- **Temporary separation during training**: Some families temporarily move one child to another room for the first three to five nights of sleep training, then reintroduce room-sharing once the baby is settling more independently. A pack-and-play in a hallway or parents'' room can work.
- **Start with a short, predictable method**: Extinction or a rapid check-in approach (rather than the chair method) means crying is typically resolved faster.

**The older child**

Involve older children who are old enough to understand. A brief, honest explanation (''The baby is learning to sleep on their own — it might be loud for a few nights'') can reduce their anxiety and enlist their patience.

**What to expect**

Most families find that within three to five nights, disruption to the older child is minimal. The first two nights are typically the hardest.

*This article is for informational purposes only. Please consult your healthcare provider or sleep consultant for guidance specific to your family.*$$,
  16,
  true,
  ARRAY['Mindell JA et al. - Sleep 2006', 'National Sleep Foundation', 'American Academy of Pediatrics (AAP)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-training-two-children-sharing-room'
),

-- ─────────────────────────────────────────────────────────────────────────────
-- NIGHT FEEDING AND WEANING (35–38)
-- ─────────────────────────────────────────────────────────────────────────────

(
  'infant',
  'sleep',
  'Night Feeding by Age: What Is Developmentally Normal?',
  $$**Night Feeds Are Not a Problem to Solve — Until They Are**

Night feeding is biologically normal for young babies. Understanding what is developmentally typical for each age can help parents calibrate expectations and avoid unnecessary stress.

**Newborns (0 to 4 weeks)**

Feeding every one to three hours around the clock is normal and necessary. Newborns have tiny stomachs (initially the size of a marble), cannot distinguish day from night, and rely on frequent feeding to maintain blood sugar and support the establishment of milk supply. Never restrict or skip feeds at this age.

**1 to 3 months**

Most babies still require two to four night feeds. Some may naturally extend to one three to four hour stretch, particularly between midnight and early morning. This is a biological development, not something to engineer.

**4 to 6 months**

Many babies are physiologically capable of a longer sleep stretch (four to six hours) at some point in the night. However, ''capable'' does not mean ''will'' — sleep associations, growth spurts, and developmental leaps all influence actual night feeding. Two to three night feeds remain common.

**6 to 9 months**

For many babies, one to two night feeds is typical. Some breastfed babies continue to genuinely need or want a night feed at this age. Formula-fed babies may extend to one or zero night feeds.

**9 to 12 months**

Most term, healthy babies are physiologically capable of not needing calories overnight. Continued night waking at this age is often habit or sleep-association-based rather than hunger-driven — though comfort nursing or bottle feeding remains valid if it is working for your family.

**Cultural and individual variation**

Night feeding norms vary significantly across cultures. Many families worldwide continue night nursing through toddlerhood, with no negative outcomes. There is no universally ''right'' time to night wean.

*This article is for informational purposes only. Discuss night feeding with your paediatrician, particularly if your baby has weight or feeding concerns.*$$,
  0,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'WHO', 'Breastfeeding Medicine Academy', 'National Sleep Foundation'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-night-feeding-by-age-normal'
),

(
  'infant',
  'sleep',
  'Weaning From Night Feeds: Gradual Approaches That Work',
  $$**When and How to Begin Night Weaning**

Night weaning — reducing or eliminating feeds during the night hours — is appropriate when your baby is medically ready (typically after five to six months, with paediatric clearance) and you feel the current arrangement is not sustainable for your family.

**Before you begin**

Check with your paediatrician that your baby''s weight gain is on track and that they do not have medical reasons to continue night feeding. Confirm that daytime feeding is adequate to compensate for removed night calories.

**Approach 1: Gradual volume reduction (bottle)**

If bottle feeding, reduce the volume of each night feed by 30 ml every two to three nights. As feeds become very small, most babies stop waking for them — the caloric reward is no longer worth the waking effort.

**Approach 2: Gradual unlatching (breastfeeding)**

When your baby falls asleep at the breast during a night feed, gently unlatch and offer comfort settling (patting, shushing) rather than re-latching. Over one to two weeks, offer shorter nursing times and more settling without the breast.

**Approach 3: Dreamfeed and drop**

If you are currently doing a dreamfeed (a feed given to a sleeping baby before your own bedtime), this is often the last feed to establish and the first one families choose to drop. Gradually move the dreamfeed earlier until it merges with the bedtime routine.

**Approach 4: Stretch and delay**

When your baby wakes for a feed, try brief settling first (patting, shushing, a dummy) before offering a feed. Gradually extend the settling period each night. Over one to two weeks, many babies stop waking or accept minimal settling.

**What to expect**

Some protest is normal during the weaning process. A gradual approach means less acute distress than abrupt stopping, but there will still be nights of complaint during the adjustment.

*This article is for informational purposes only. Please discuss night weaning with your paediatrician before beginning, particularly if your baby is under six months.*$$,
  20,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Breastfeeding Medicine Academy', 'WHO', 'Pantley E - The No-Cry Sleep Solution'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-weaning-night-feeds-gradual-approaches'
),

(
  'infant',
  'sleep',
  'Dream Feeding: Does It Help Babies Sleep Longer Stretches?',
  $$**What Is a Dream Feed?**

A dream feed is a feed given to a sleeping (or nearly sleeping) baby — typically between 10:00 pm and 11:00 pm — before the parents go to bed. The idea is that ''topping up'' the baby''s stomach before the parents sleep will extend the stretch of time the baby sleeps without waking.

**Does it work?**

The evidence is mixed. Some families find that a dreamfeed meaningfully extends the baby''s first sleep stretch. Others find it has no effect, or even disrupts sleep by activating the baby. Individual response varies considerably.

**How to do a dream feed**

- Lift your baby gently without turning on bright lights
- Offer the breast or bottle while they are still drowsy — do not fully wake them
- Wind gently afterwards (this matters — skipping winding after a dreamfeed can cause discomfort)
- Place them back down without fully waking

**Best age for dream feeding**

Dreamfeeds tend to work best between about six weeks and four months. After the four-month sleep regression, when sleep cycles fragment further, many families find the dreamfeed stops helping and may actually create an additional waking. This is a common time to phase it out.

**How to phase out the dreamfeed**

Move the dreamfeed gradually earlier by ten to fifteen minutes every three to four days until it merges with the regular bedtime feed and is no longer a separate event.

**Who benefits most**

- Parents of younger babies (6 to 16 weeks) who want to attempt a longer stretch in the early part of the night
- Breastfeeding parents wanting to protect supply while also getting a longer sleep stretch

**Who it may not help**

- Babies after the four-month regression
- Babies who fully wake during the dreamfeed and cannot resettle

*This article is for informational purposes only. Please consult your midwife or paediatrician with any questions about your baby''s feeding needs.*$$,
  8,
  true,
  ARRAY['Mindell JA - Sleeping Through the Night', 'National Sleep Foundation', 'American Academy of Pediatrics (AAP)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-dream-feeding-longer-stretches'
),

(
  'infant',
  'sleep',
  'Comfort vs. Hunger Night Waking: How to Tell the Difference',
  $$**Not All Night Wakings Are About Hunger**

This is one of the most common questions from parents in the second half of the first year: my baby is waking up — are they hungry, or are they waking out of habit and comfort? The distinction matters because the response you choose will differ.

**Signs of genuine hunger**

- Waking with urgency — strong, escalating cry rather than a gradual build
- Feeds vigorously and takes a full feed before settling back to sleep
- Has a consistent pattern (wakes at roughly the same time each night)
- Is in a growth spurt or leap period with increased daytime feeding too
- Has not been gaining weight well and your paediatrician has recommended maintaining feeds

**Signs of comfort/habit waking**

- Wakes and settles quickly with minimal feeding (takes a few sips and falls asleep)
- Can be resettled by non-feeding means — a dummy, a brief pat, or a parent''s voice
- Wakes multiple times per night at variable intervals
- Is over six months, has good weight gain, and takes full daytime feeds
- The feed volume at night has been declining over time

**The feeding to sleep connection**

Many night wakings that appear to be hunger are actually sleep-association wakings. If feeding is your baby''s primary sleep association, they will search for it every time they surface between sleep cycles — even if they are not hungry. This can look like very frequent feeding but is driven by the need to return to sleep, not caloric need.

**A useful test**

Try offering settling without a feed first. If your baby settles within a few minutes of being patted or shushed, the waking was likely comfort-based. If they escalate and cannot be settled without feeding after five to ten minutes, it is more likely genuine hunger.

*This article is for informational purposes only. Always discuss your baby''s nutritional needs with your paediatrician, particularly if you have concerns about weight gain.*$$,
  16,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Mindell JA - Sleeping Through the Night', 'National Sleep Foundation'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-comfort-vs-hunger-night-waking'
),

-- ─────────────────────────────────────────────────────────────────────────────
-- ENVIRONMENT AND ROUTINE (39–45)
-- ─────────────────────────────────────────────────────────────────────────────

(
  'infant',
  'sleep',
  'Bedtime Routines: Why Consistency Matters More Than Content',
  $$**The Power of a Predictable Routine**

Bedtime routines are one of the most evidence-backed tools in infant and toddler sleep. Multiple studies — including a large 2009 Mindell et al. multi-country study — have shown that a consistent bedtime routine significantly improves infant sleep onset, reduces night wakings, and improves maternal mood.

**Why routines work**

Routines work through classical conditioning: the sequence of events (bath → massage → feed → story → song → cot) becomes a powerful cue for sleep. The body begins to prepare for sleep (melatonin rises, alertness drops) as the routine begins. This is why the content of the routine matters far less than its consistency.

**What a good bedtime routine includes**

A routine does not need to be elaborate. Most effective routines:
- Are 20 to 30 minutes long (toddlers can extend to 30 to 40 minutes)
- Happen at the same time each evening
- Follow the same order of steps
- Involve calming, low-stimulation activities
- End in the sleep space

Example: bath → moisturiser or massage → sleepsuit and sleep sack → dim room → feed → brief story or song → cot.

**What to avoid in the routine**

- Screens in the hour before bed (blue light suppresses melatonin)
- Stimulating play or physical activity
- Loud environments or visitors during the wind-down

**When can you start a routine?**

A brief, consistent wind-down can be introduced from as early as four to six weeks. It need not be complex — even a simple: feed, song, cot — starts building the association.

**Consistency beats perfection**

You do not need to do the ''right'' routine. You need to do the same routine reliably. A three-step routine done consistently outperforms a ten-step routine done inconsistently.

*This article is for informational purposes only. Consult your health visitor or paediatrician for personalised sleep guidance.*$$,
  8,
  true,
  ARRAY['Mindell JA et al. - Sleep 2009', 'American Academy of Pediatrics (AAP)', 'National Sleep Foundation'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-bedtime-routine-consistency-matters'
),

(
  'infant',
  'sleep',
  'Dark Rooms for Better Sleep: Blackout Blinds and Why They Work',
  $$**Light Is the Most Powerful Regulator of the Circadian Clock**

Melatonin — the hormone that signals sleep — is suppressed by light. Even modest light exposure during sleep periods can disrupt melatonin production and fragment sleep. For babies, whose circadian systems are still developing and particularly sensitive, room darkness makes a meaningful difference to sleep quality and duration.

**What level of darkness works?**

The goal is not pitch blackness but significant dimness. The practical test: if you can comfortably read a book in the room without turning on a light, it is too bright. A room where you can barely make out shapes is about right.

**Blackout blinds or curtains**

Blackout blinds are one of the most straightforwardly effective sleep environment investments. They are particularly valuable:
- In summer, when early sunrise extends significantly
- In climates where daylight persists until late evening
- For naps, when the sun is at its highest

**Red light vs. white or blue light**

If you need a nightlight for night feeds or settling checks, red-wavelength light has the least impact on melatonin compared to white or blue-spectrum lights. Many families use a dim red night light in a corner of the room.

**Light in the morning**

The flip side of darkness at night is the importance of bright light in the morning. Opening curtains or taking your baby outside after waking helps anchor the circadian clock and reinforces the day-night distinction.

**Practical tips**

- Blackout blind liners can be added to any existing curtain
- Portable, adhesive blackout panels are available for travel
- Consistent darkness at nap time supports better nap duration

*This article is for informational purposes only. Please consult your paediatrician if you have concerns about your baby''s sleep.*$$,
  8,
  true,
  ARRAY['National Sleep Foundation', 'Cajochen C et al. - Journal of Sleep Research', 'American Academy of Pediatrics (AAP)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-dark-rooms-blackout-blinds-why-work'
),

(
  'infant',
  'sleep',
  'Sleep Sacks and Sleeping Bags: Sizes, TOG Ratings, and When to Use Them',
  $$**A Safer Alternative to Loose Blankets**

Sleep sacks (also called sleeping bags or wearable blankets) are one of the most recommended infant sleep environment products — not because they ''improve sleep,'' but because they keep babies warm without the suffocation risk of loose blankets in the cot.

**Why sleep sacks instead of blankets?**

The AAP and equivalent organisations worldwide advise against loose blankets in the cot for babies under twelve months. Sleep sacks provide warmth safely — they cannot ride up over a baby''s face, and they prevent babies from slipping under bedding.

**TOG ratings explained**

TOG measures the thermal insulation of a sleep sack. The higher the TOG, the warmer the sack.

| TOG | Best for room temperature |
|---|---|
| 0.5 | 24–27°C |
| 1.0 | 20–24°C |
| 2.5 | 16–20°C |
| 3.5 | Below 16°C |

Always adjust the clothing underneath accordingly — in a warmer room with a lower TOG, less clothing is needed.

**Sizing**

Sleep sacks are sized by weight and height rather than age, as babies vary considerably. Check each brand''s size guide. The sack should be roomy enough for leg movement but not so large that the baby can slip inside it.

**When to start using a sleep sack**

Sleep sacks can be used from birth — they come in newborn sizes and are suitable from the earliest days. They are compatible with swaddling in the newborn phase (some ''transition'' sleep sacks have armhole wraps for the swaddle-to-sleep-sack transition).

**How long can you use them?**

Sleep sacks are available in sizes to fit toddlers through age four to five. There is no upper age limit — they remain a useful and safe option as long as they fit correctly and your child has not learned to climb out of them.

*This article is for informational purposes only. Please consult your paediatrician for advice specific to your baby''s needs.*$$,
  0,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Lullaby Trust UK', 'Red Nose Foundation Australia'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-sacks-sleeping-bags-tog-sizes-when-use'
),

(
  'infant',
  'sleep',
  'Swaddle-to-Sleep-Sack Transition: When and How to Make the Switch',
  $$**Why Swaddling Has a Time Limit**

Swaddling — wrapping a newborn snugly in a blanket or swaddle wrap — can be a powerful tool for settling young babies. It mimics the contained feeling of the womb and suppresses the startle reflex. However, swaddling must stop before your baby begins to roll.

**When to transition**

The swaddle-to-sleep-sack transition should happen as soon as your baby shows any signs of rolling — typically between eight and sixteen weeks. Rolling while swaddled (arms restrained) is a significant safety risk.

Signs to watch for:
- Rocking side to side when on their back
- Managing to roll during tummy time
- Wriggling out of the swaddle consistently

If your baby begins rolling, the swaddle must stop immediately, regardless of how much they seemed to rely on it.

**How to transition**

**Option 1: Cold turkey**
Remove the swaddle entirely and move to a sleep sack in one step. This is the simplest approach. Many babies adjust within two to five nights with some sleep disruption.

**Option 2: One arm out**
Transition one arm out of the swaddle for a few nights, then both arms free in the swaddle, then move to a sleep sack. This more gradual approach helps babies adjust to the loss of containment slowly.

**Option 3: Transition sleep sacks**
Several brands make sleep sacks with optional arm wraps that allow a gradual reduction of containment. These can be helpful for babies who seem particularly dependent on swaddling.

**What to expect**

Some increase in startle waking is normal for one to two weeks after the swaddle is removed. White noise and a consistent dark room can support the adjustment period.

*This article is for informational purposes only. If your baby is rolling or showing signs of it, stop swaddling immediately and consult your paediatrician.*$$,
  8,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Red Nose Foundation Australia', 'Lullaby Trust UK'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-swaddle-to-sleep-sack-transition'
),

(
  'infant',
  'sleep',
  'Teething and Sleep: What Really Helps at Night',
  $$**The Teething-Sleep Disruption Reality Check**

Teething is frequently blamed for sleep regression, but the relationship is more nuanced than commonly believed. Research suggests that teething symptoms are most acute in the 24 to 72 hours around a tooth erupting — not for weeks of continuous disruption.

**When teething actually disrupts sleep**

- In the few nights immediately before and after a tooth emerges
- When pain is significant enough to prevent settling — though many babies tolerate teething with minimal distress
- When gum inflammation is visible and your baby is clearly uncomfortable

**Signs teething is genuinely causing the waking**

- You can see or feel a tooth about to emerge
- Your baby is drooling excessively and chewing everything during the day
- They are settling briefly after waking but waking again repeatedly
- Other illness signs are absent

**What actually helps with teething pain at night**

- **Cool teething rings** offered before bedtime — not placed in the cot
- **Paracetamol or ibuprofen** (age-appropriate doses — check with your pharmacist or paediatrician before use; not suitable for all ages)
- **Teething gel with anaesthetic** has limited evidence and some gels are no longer recommended for young infants — check current guidance in your country
- **Gum rubbing** with a clean finger before sleep

**What to avoid**

- Teething necklaces (amber, silicone): associated with strangulation and choking risk; not recommended by any paediatric authority
- Homeopathic teething tablets: no evidence of efficacy
- Benzocaine-containing gels: not recommended for infants under two in many countries due to rare but serious adverse effects

**Maintaining sleep habits during teething**

Extra comfort is appropriate when your baby is in genuine pain. Try to return to your usual settling approach as soon as the acute phase passes.

*This article is for informational purposes only. Consult your pharmacist or paediatrician before giving any medication to your baby.*$$,
  24,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Macknin ML et al. - Pediatrics 2000', 'NHS UK', 'Therapeutic Goods Administration (TGA) Australia'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-teething-what-helps-at-night'
),

(
  'infant',
  'sleep',
  'Illness and Sleep: Getting Back on Track After a Bad Patch',
  $$**Why Illness Wrecks Sleep**

A sick baby needs more support, more comfort, and often more feeds. It is entirely appropriate — and kind — to offer extra holding, night feeds, and physical presence during an illness. The challenge comes in the recovery phase, when the illness resolves but the sleep disruptions and new habits linger.

**During the illness**

- Do what it takes to keep your baby comfortable
- Expect more night waking — congestion, ear pain, and general malaise all disrupt sleep
- Offer feeds on demand — unwell babies may need more calories and hydration
- Do not worry about ''undoing'' sleep training during this period

**The recovery trap**

During an illness, you may have reintroduced feeding to sleep, co-sleeping, or holding through the night. These are compassionate responses. The problem is that after recovery, the new habits can stick — your baby learned that those conditions are again available.

**How to get back on track**

**Step 1: Wait for full recovery**
Sleep is still disrupted for five to seven days after an illness even when your baby seems better. Do not attempt to re-establish routines immediately — allow full recovery first.

**Step 2: Reintroduce the routine first**
Before tackling night wakings, restore the bedtime routine — same time, same steps, same settling environment. This signals that things are returning to normal.

**Step 3: Gradually withdraw the illness-era support**
If you are now feeding to sleep again after previously having weaned that association, return to your previous settling approach over three to five nights. It will likely be faster than the first time — your baby still has the memory of independent settling.

**Expect a brief protest period**

Two to four nights of re-establishing is typical. It is usually shorter and less intense than the original sleep training.

*This article is for informational purposes only. Always prioritise your baby''s health and comfort during illness. Consult your healthcare provider with any medical concerns.*$$,
  0,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'National Sleep Foundation', 'Mindell JA - Sleeping Through the Night'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-illness-getting-back-on-track'
),

(
  'infant',
  'sleep',
  'Travel and Time Zones: Keeping Baby Sleep on Track',
  $$**Travelling With a Baby — Sleep Expectations**

Travel inevitably disrupts sleep. New environments, different light cycles, schedule changes, and the stress of travel itself all affect how babies sleep. That said, with some preparation, you can minimise the disruption and help your baby adjust reasonably quickly.

**Before you travel**

- Bring your usual sleep tools: portable white noise machine, a familiar sleep sack, a worn item of your clothing for scent (for older babies)
- Pack a portable blackout blind — many travel versions use suction cups or velcro and fold flat
- Research your accommodation''s cot or crib options in advance

**Managing jet lag**

The general rule is one day per time zone crossed for full adjustment. Young babies (under three months) often adapt faster than older babies and toddlers because their circadian rhythms are not yet strongly set.

**Strategies for eastward travel (harder direction)**

- Expose your baby to morning light as early as possible at the destination to shift the clock forward
- Keep naps capped to avoid them being too long in the new timezone
- Bring bedtime forward on arrival night

**Strategies for westward travel (easier direction)**

- Expose your baby to afternoon light to shift the clock back
- Allow a slightly later bedtime initially and adjust forward over several days

**Maintaining routine during travel**

The specific environment matters less than the routine. Running the same bedtime sequence (bath, feed, song, sleep sack) in a hotel room signals sleep as effectively as at home.

**Shared rooms while travelling**

If sharing a room with your baby during travel, a travel cot in the corner with your portable blackout and white noise creates a reasonable sleep environment. Some families temporarily co-sleep during travel — if so, follow safe sleep guidelines for bed-sharing.

**After you return home**

Expect two to five days of adjustment upon return. Return to your usual routine immediately rather than waiting for your baby to ''settle'' first.

*This article is for informational purposes only. Consult your paediatrician before long-haul travel with a young baby.*$$,
  12,
  true,
  ARRAY['National Sleep Foundation', 'American Academy of Pediatrics (AAP)', 'Centers for Disease Control and Prevention (CDC)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-travel-time-zones-keeping-on-track'
)

ON CONFLICT (slug) DO NOTHING;
