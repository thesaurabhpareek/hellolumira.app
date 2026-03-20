-- =============================================================================
-- Lumira v24: Postpartum Content Articles (Weeks 1–12)
-- =============================================================================
-- 36 medically grounded, culturally sensitive articles covering the fourth
-- trimester. References: ACOG, AAP, NICE, WHO, RCOG, La Leche League.
-- Categories used: mental-health, health, feeding, sleep, nutrition,
--   wellness, safety, development, relationships.
-- All articles: medically_reviewed = true, culturally_sensitive = true.
-- =============================================================================

INSERT INTO public.content_articles
  (slug, stage, week_or_month, title, subtitle, body, category, author,
   medically_reviewed, culturally_sensitive, reading_time_minutes, tags, is_published)
VALUES

-- ═══════════════════════════════════════════════════════
-- WEEK 1
-- ═══════════════════════════════════════════════════════

(
  'postpartum-w1-physical-recovery',
  'postpartum', 1,
  'Your Body in Week One: What''s Normal, What to Watch For',
  'A calm, honest guide to the physical changes happening right now.',
  '**What''s happening to your body**

The first week after birth is one of the most intense physical experiences of your life — even if everything is going well. Your uterus is contracting back to its pre-pregnancy size (you may feel strong cramps, especially when breastfeeding), your hormones are dropping sharply, and your body is beginning a weeks-long healing process.

**Lochia: your postpartum bleeding**

After birth, you will have vaginal discharge called lochia. In week one it is typically bright red and heavier than a period — this is normal. Soaking more than one thick pad per hour for two or more hours, or passing clots larger than a golf ball, warrants a call to your midwife or doctor.

**Perineal healing**

If you had a vaginal birth, your perineum may be sore, swollen, or stitched. Cool packs, a peri bottle (warm water when wiping), and sitting on a cushion can help. Most stitches dissolve within 2–4 weeks.

**C-section care**

If you had a caesarean, you are recovering from major abdominal surgery. Avoid lifting anything heavier than your baby, keep the incision dry and clean, and watch for signs of infection (increasing redness, warmth, discharge, or fever above 38°C/100.4°F).

**Afterpains**

Uterine contractions after birth, known as afterpains, can be surprisingly strong — often more intense with second and subsequent babies and during breastfeeding. They are a sign your uterus is recovering well.

**When to seek help urgently**

Contact your healthcare provider immediately if you experience:
- Heavy bleeding (soaking more than a pad per hour)
- Fever above 38°C / 100.4°F
- Severe headache, visual changes, or sudden swelling (signs of pre-eclampsia, which can occur postpartum)
- Difficulty urinating or signs of urinary tract infection
- Signs of wound infection

**A note on rest**

Rest is not a luxury right now — it is medicine. Your body is doing extraordinary repair work. Every culture has its own wisdom about postpartum rest; whether it is the Indian tradition of a 40-day confinement, the Chinese zuo yuezi practice, or the Latin cuarentena, the underlying message is the same: slow down and let people care for you.

Always consult your midwife, GP, or obstetrician for personalised guidance about your recovery.',
  'health',
  'Lumira Editorial — reviewed against ACOG and NICE postpartum guidelines',
  true, true, 5,
  ARRAY['recovery', 'healing', 'lochia', 'c-section', 'perineum'],
  true
),

(
  'postpartum-w1-breastfeeding-basics',
  'postpartum', 1,
  'Breastfeeding in the First Days: Colostrum, Latching, and What to Expect',
  'The first feeds matter — here''s what''s normal and how to get off to a good start.',
  '**Colostrum: liquid gold**

In the first 2–5 days, your breasts produce colostrum — a thick, yellowish fluid packed with antibodies, proteins, and growth factors. It is produced in small amounts (often just a few millilitres per feed) and this is intentional: your newborn''s stomach is the size of a marble. Colostrum is perfectly calibrated for this stage.

**Getting a good latch**

A comfortable, effective latch is the foundation of successful breastfeeding. Signs of a good latch:
- Baby''s mouth is wide open, covering most of the areola (not just the nipple)
- Baby''s chin touches your breast
- You hear rhythmic swallowing (not just sucking)
- Feeding is not painful after the first 30–60 seconds

If latching is consistently painful, ask your midwife or a lactation consultant to observe a feed. Nipple pain that persists throughout feeding is not something to push through — it usually means something can be adjusted.

**How often to feed**

Newborns typically feed 8–12 times in 24 hours. This frequent feeding stimulates your milk supply through a demand-and-supply process. Skipping feeds in the early days can delay milk coming in.

**When your milk comes in**

Between days 2 and 5, your milk transitions from colostrum to transitional and then mature milk. Your breasts may feel very full, hard, and warm — this is called engorgement. Feeding frequently, hand-expressing before feeds to soften the areola, and cabbage leaves (surprisingly effective) can help. Engorgement usually settles within 24–48 hours.

**If breastfeeding isn''t working for you**

Breastfeeding is recommended by the WHO and AAP for the first six months and beyond, but it is not always possible or right for every family. If you are formula feeding, by choice or necessity, your baby will thrive. Feeding your baby with love matters more than the method.

**When to get support**

Contact a lactation consultant, your midwife, or a breastfeeding helpline if:
- Feeding is painful throughout
- Your baby is not regaining birth weight by day 10–14
- You have concerns about milk supply
- You notice white or yellow patches in baby''s mouth (possible thrush)',
  'feeding',
  'Lumira Editorial — reviewed against WHO, AAP, and La Leche League guidance',
  true, true, 5,
  ARRAY['breastfeeding', 'colostrum', 'latching', 'newborn-feeding', 'lactation'],
  true
),

(
  'postpartum-w1-baby-blues-vs-ppd',
  'postpartum', 1,
  'Baby Blues vs. Postpartum Depression: Understanding the Difference',
  'Feeling tearful or overwhelmed is common — but knowing when to ask for help is important.',
  '**The baby blues**

Up to 80% of new mothers experience the "baby blues" — a brief period of emotional sensitivity, tearfulness, mood swings, and irritability that typically begins on day 2–4 after birth and resolves on its own within two weeks. The cause is hormonal: after delivery, progesterone and oestrogen drop sharply and rapidly, triggering an emotional response.

The baby blues are very common, normal, and self-resolving. Rest, support from people you trust, and gentle reassurance are usually all that is needed.

**Postpartum depression**

Postpartum depression (PPD) is different. It is a clinical condition affecting approximately 1 in 7 new mothers (and some fathers and non-birthing parents), and it requires support and often treatment. Unlike the baby blues, PPD:
- Lasts longer than two weeks
- May begin at any time in the first year, not just right after birth
- Involves persistent low mood, not just occasional tearfulness
- Can include loss of interest in your baby or difficulty bonding
- May involve feelings of hopelessness, worthlessness, or persistent anxiety

**Signs that warrant a call to your GP or midwife**

- Persistent low mood or emptiness lasting more than two weeks
- Inability to sleep even when the baby sleeps
- Feeling detached from your baby
- Intrusive or frightening thoughts (these are more common than people realise and do not mean you are a bad parent)
- Feeling like your family would be better off without you

**You are not alone**

Postpartum depression is not a character flaw or a sign of weakness. It is a treatable medical condition. Many cultures carry stigma around maternal mental health — please know that asking for help is one of the bravest things you can do for yourself and your baby.

**Postpartum psychosis**

Postpartum psychosis is rare (1–2 in 1,000 births) but is a psychiatric emergency. Symptoms include confusion, hallucinations, rapid mood swings, and bizarre behaviour, typically within the first two weeks. Call emergency services immediately if you observe these signs.

If you are concerned about your mental health, contact your midwife, GP, or a mental health professional. In a crisis, call your local emergency number.',
  'mental-health',
  'Lumira Editorial — reviewed against NICE CG192 and Postpartum Support International guidelines',
  true, true, 4,
  ARRAY['baby-blues', 'postpartum-depression', 'PPD', 'mental-health', 'emotional-wellbeing'],
  true
),

-- ═══════════════════════════════════════════════════════
-- WEEK 2
-- ═══════════════════════════════════════════════════════

(
  'postpartum-w2-sleep-deprivation',
  'postpartum', 2,
  'Surviving Sleep Deprivation: What Actually Helps',
  'You''re not imagining how hard this is. Here are strategies grounded in evidence, not myth.',
  '**Why new parent sleep deprivation is uniquely brutal**

New parents lose an average of 44 minutes of sleep per night in the first year compared to pre-baby sleep, but this average hides the reality: in the first weeks, you may be getting only 4–5 fragmented hours in 24. Fragmented sleep — repeatedly broken into short chunks — is cognitively more impairing than simply getting fewer hours. This is not weakness; it is biology.

**What actually helps**

- **Sleep in shifts.** If you have a partner, divide nights. One person takes the first half (10pm–2am), the other takes the second half. Both get one longer sleep block.
- **Nap when the baby naps — really.** Resist the urge to catch up on tasks. A 20-minute nap can restore alertness dramatically.
- **Lower your threshold for what a "clean house" means.** Cognitive load from unfinished tasks steals mental energy. Let it go.
- **Limit visitors in the early weeks.** Well-meaning visitors can extend your awake time by hours.
- **Accept help with night shifts.** If a family member can take a bottle feed at 2am, say yes.

**What doesn''t help**

- Caffeine after 2pm — it impairs the sleep you do get
- Scrolling your phone at night — blue light delays sleep onset by up to 30 minutes
- Trying to "sleep train" before 4–6 months — most babies'' brains are not developmentally ready earlier

**The 2am rule**

If you''re awake at 2am feeling overwhelmed, anxious, or despairing — that is not a reliable reflection of reality. Sleep deprivation amplifies negative emotions significantly. Give yourself permission not to make important decisions between midnight and 6am.

**When sleep deprivation becomes dangerous**

If you are driving, operating machinery, or making medical decisions while severely sleep-deprived, pause. Sleep deprivation at extreme levels is cognitively equivalent to being over the legal limit for alcohol. Ask for help before getting behind the wheel.',
  'sleep',
  'Lumira Editorial',
  true, true, 4,
  ARRAY['sleep-deprivation', 'new-parent-sleep', 'exhaustion', 'night-feeds'],
  true
),

(
  'postpartum-w2-nutrition-healing',
  'postpartum', 2,
  'Eating to Heal: Nutrition for New Mothers',
  'What your body needs to recover, make milk, and keep you functioning.',
  '**Why postpartum nutrition is different**

Your body has just completed one of its most demanding biological events and — if you are breastfeeding — is now producing an average of 750–1000ml of milk per day. This requires significant nutritional support that goes well beyond "eating a balanced diet."

**Calories**

Breastfeeding mothers need approximately 400–500 extra calories per day above their pre-pregnancy needs. This is not the time for calorie restriction. Restricting calories below 1,800/day while breastfeeding can reduce milk supply and leave you depleted.

**Key nutrients**

- **Iron.** Blood loss during delivery can leave iron stores low. Signs of iron deficiency include extreme fatigue, shortness of breath, and dizziness. Iron-rich foods: red meat, lentils, spinach, fortified cereals. Pair plant-based iron with vitamin C to improve absorption.
- **Calcium.** Breastfeeding draws calcium from your bones if dietary intake is low. Aim for 3–4 servings of dairy or calcium-rich foods daily (dairy, fortified plant milks, tahini, almonds, leafy greens).
- **Omega-3 DHA.** Important for your baby''s brain development and for your mood. Oily fish (salmon, sardines, mackerel) 2–3 times weekly, or a DHA supplement if you don''t eat fish.
- **Vitamin D.** Most people in northern latitudes are deficient. If breastfeeding, both you and your baby likely need supplementation — check with your healthcare provider.
- **Hydration.** Breastfeeding mothers need an additional ~500ml of fluid daily. Keep a water bottle next to wherever you feed.

**Practical tips**

- Batch cook and freeze meals before birth so you have real food available
- Accept every offer of a home-cooked meal
- Keep one-handed snacks accessible (nuts, fruit, cheese, oat bars) for night feeds
- Limit ultra-processed foods not because of calories but because they leave you nutrient-depleted

**Cultural foods for postpartum recovery**

Many cultures have traditional postpartum foods developed over centuries to support recovery: Indian methi (fenugreek) ladoos, Mexican atole, Chinese soups with goji and astragalus, Nigerian pepper soup, Japanese miso. These traditions exist for good reason — honour them if they are part of your heritage.

Speak with a registered dietitian if you have specific dietary needs or restrictions.',
  'nutrition',
  'Lumira Editorial — reviewed against NHS and ACOG postpartum nutrition guidance',
  true, true, 4,
  ARRAY['postpartum-nutrition', 'breastfeeding-diet', 'iron', 'healing-foods', 'hydration'],
  true
),

(
  'postpartum-w2-milk-supply',
  'postpartum', 2,
  'Understanding Your Milk Supply: The Science Behind Demand and Supply',
  'Why your milk supply is more robust than you think — and what genuinely threatens it.',
  '**How milk supply works**

Breast milk operates on a supply-and-demand principle regulated by prolactin and oxytocin. The more frequently and effectively your baby removes milk from your breast (or you express), the more milk your body produces. Conversely, if feeds are skipped or shortened, supply decreases over time.

This means supply is not fixed — it is dynamic and responsive.

**What protects your supply**

- Feeding frequently (8–12 times in 24 hours in the early weeks)
- Ensuring effective milk removal at each feed (good latch and adequate drainage)
- Feeding on demand, not on a strict schedule in the early weeks
- Pumping or expressing if your baby is in NICU or unable to latch
- Staying well-hydrated and adequately nourished

**What can reduce supply**

- Supplementing with formula without expressing (reduces breast stimulation)
- Feeding on a strict timed schedule that spaces feeds too far apart
- Pacifier use in the early weeks before feeding is well established
- Certain medications — check with your doctor or pharmacist
- Significant stress or illness (though supply usually recovers)

**The let-down reflex**

Many women feel a tingling or rush of warmth when their milk lets down (ejects from the ducts). Some don''t feel it at all. Both are normal. Let-down is triggered by oxytocin — the same hormone released by skin-to-skin contact, hearing your baby cry, or thinking about your baby.

**When to seek support**

Signs that milk supply may genuinely be low:
- Baby is not regaining birth weight by 10–14 days
- Fewer than 6 wet nappies per day after day 5
- Baby seems constantly hungry and unsettled after feeds
- You are producing less than expected when pumping

A lactation consultant can assess your supply objectively and suggest targeted strategies. Do not rely on breast size, "fullness," or pumping output alone as indicators of supply.',
  'feeding',
  'Lumira Editorial — reviewed against La Leche League and ABM (Academy of Breastfeeding Medicine) protocols',
  true, true, 4,
  ARRAY['milk-supply', 'breastfeeding', 'prolactin', 'let-down', 'lactation'],
  true
),

-- ═══════════════════════════════════════════════════════
-- WEEK 3
-- ═══════════════════════════════════════════════════════

(
  'postpartum-w3-cluster-feeding',
  'postpartum', 3,
  'Cluster Feeding: Why Your Baby Feeds Constantly (and Why It''s Normal)',
  'When your baby wants to feed every 30 minutes, it doesn''t mean your milk isn''t enough.',
  '**What is cluster feeding?**

Cluster feeding is when your baby feeds very frequently — sometimes every 20–40 minutes — for several hours, usually in the late afternoon or evening. This is a normal developmental behaviour, not a sign that your milk supply is inadequate or that something is wrong with your baby.

**Why it happens**

- **Growth spurts.** Babies typically have growth spurts around 3 weeks, 6 weeks, 3 months, and 6 months. During these periods, frequent feeding stimulates your body to increase milk supply to meet growing demands.
- **Comfort and regulation.** Breastfeeding is not just about nutrition. The sucking reflex and skin-to-skin contact are deeply regulating for newborns. Fussy, overstimulated, or gassy babies often want to feed to calm down.
- **Developmental.** The evening cluster is theorised to be related to lower milk fat in the evening, your baby "tanking up" before a longer sleep stretch, or simply circadian rhythm development.

**What to do during a cluster feeding session**

- Settle in with water, snacks, and something to watch or read
- Alternate breasts to ensure both are adequately stimulated
- Accept help with everything else (meals, older children, household tasks)
- Trust your body — cluster feeding is your baby''s way of programming your supply

**When cluster feeding is not normal**

Cluster feeding that never stops — meaning your baby never has settled, content periods — or is accompanied by significant weight loss, jaundice, or other symptoms should prompt a call to your paediatrician or midwife. Occasional cluster feeds are normal; a baby who seems perpetually distressed is worth investigating.',
  'feeding',
  'Lumira Editorial',
  true, true, 3,
  ARRAY['cluster-feeding', 'growth-spurt', 'milk-supply', 'newborn-feeding', 'fussiness'],
  true
),

(
  'postpartum-w3-postpartum-anxiety',
  'postpartum', 3,
  'Postpartum Anxiety: When Worry Won''t Switch Off',
  'Anxiety is at least as common as postpartum depression — but far less talked about.',
  '**What is postpartum anxiety?**

Postpartum anxiety (PPA) affects approximately 15–20% of new mothers — making it at least as common as postpartum depression, yet significantly less discussed. It is characterised by excessive, persistent worry that feels impossible to control and that interferes with daily functioning.

**Common presentations**

- Constant worry about your baby''s health, breathing, or safety
- Inability to sleep even when the baby is sleeping, because your mind won''t quiet
- Physical symptoms: racing heart, chest tightness, shortness of breath, nausea
- Repetitive checking behaviours (checking if baby is breathing every few minutes)
- Intrusive thoughts — disturbing images or scenarios that pop into your mind unbidden
- Feeling constantly on edge or "wired"

**Intrusive thoughts: a special note**

Intrusive thoughts — unwanted, disturbing mental images that feel horrifying to you — are extremely common in new parents and do not reflect who you are or what you want. Research suggests up to 80–90% of new parents have them. The distress you feel about these thoughts is evidence that they are ego-dystonic (contrary to your values). They are a feature of anxiety, not an indicator of danger.

**What helps**

- **Speaking to your GP or midwife.** Postpartum anxiety responds well to therapy (particularly CBT) and, where appropriate, medication. Many medications are compatible with breastfeeding.
- **Limiting "just in case" Google searches.** Anxiety feeds on uncertainty, and searching for reassurance provides only temporary relief while amplifying anxiety long-term.
- **Structured support.** Regular, predictable help from a partner or family member can reduce the hypervigilance that drives anxiety.
- **Sleep.** Severe sleep deprivation and anxiety are bidirectionally linked — treating one helps the other.

You do not have to push through. Reaching out for support is the right thing to do.

Contact your GP, midwife, or a mental health professional if anxiety is significantly affecting your daily life.',
  'mental-health',
  'Lumira Editorial — reviewed against NICE CG192 and Postpartum Support International guidelines',
  true, true, 5,
  ARRAY['postpartum-anxiety', 'PPA', 'intrusive-thoughts', 'worry', 'mental-health'],
  true
),

(
  'postpartum-w3-safe-sleep',
  'postpartum', 3,
  'Safe Sleep for Newborns: The ABCs Every Parent Needs to Know',
  'Simple, evidence-based guidelines that significantly reduce the risk of SIDS.',
  '**Why safe sleep matters**

Sudden Infant Death Syndrome (SIDS) and other sleep-related infant deaths, while rare, are the leading cause of death in babies aged 1–12 months. The good news: following safe sleep guidelines significantly reduces risk.

**The ABCs of safe sleep (AAP guidelines)**

- **Alone.** Baby should sleep alone in their own sleep space — not with parents, siblings, or pets in the same bed. Room-sharing (same room, different surface) is recommended for at least the first 6 months and ideally the first year.
- **Back.** Always place baby on their back to sleep — for every sleep, every time. The "back to sleep" campaign reduced SIDS deaths by over 50%.
- **Cot (or safety-approved sleep surface).** Use a firm, flat, safety-approved mattress with a fitted sheet. No pillows, duvets, bumpers, positioners, or soft toys in the sleep space.

**Additional safe sleep recommendations**

- Keep the sleep environment smoke-free — before and after birth
- Avoid overheating: keep the room at 16–20°C (60–68°F), use a sleep sack instead of a blanket
- Offer a dummy/pacifier at the start of sleep once breastfeeding is established (usually by 3–4 weeks)
- Avoid inclined sleepers, car seats, and swings for extended unsupervised sleep

**What about bed-sharing?**

The safest option is a separate sleep surface in the same room. If you do choose to bed-share, understand the risk factors that significantly increase danger: parental smoking, alcohol or sedative use, extreme tiredness, soft bedding, and a very young or premature infant. Resources like the UNICEF Baby Friendly Initiative''s safer sleep guidance can help you make an informed decision.

**Tummy time while awake**

Safe sleep is for sleeping — when baby is awake and supervised, tummy time is important for development. Aim for short sessions from birth, building to 30+ minutes per day by 3 months.',
  'safety',
  'Lumira Editorial — reviewed against AAP Safe Sleep guidelines 2022 and UNICEF Baby Friendly Initiative',
  true, true, 4,
  ARRAY['safe-sleep', 'SIDS', 'back-to-sleep', 'sleep-safety', 'cot-safety'],
  true
),

-- ═══════════════════════════════════════════════════════
-- WEEK 4
-- ═══════════════════════════════════════════════════════

(
  'postpartum-w4-csection-recovery',
  'postpartum', 4,
  'C-Section Recovery: A Week-by-Week Guide',
  'A caesarean is major surgery. Here''s how recovery typically progresses and what to watch for.',
  '**Weeks 1–2: immediate recovery**

Your priority in the first two weeks is wound care and managing pain while keeping blood clots at bay. You will be encouraged to move gently as soon as you are able — short walks, even just to the bathroom and back, prevent blood clots and aid recovery. Do not lift anything heavier than your baby.

Expect:
- Pain and soreness around the incision, managed with prescribed analgesia
- Numbness or tingling around the scar (nerve regeneration takes months to years)
- A low shelf or overhang above the scar as swelling settles (this usually improves)
- Fatigue — your body is healing from major surgery while caring for a newborn

**Wound care**

Keep the incision clean and dry. Pat dry (never rub) after washing. Wear high-waisted, soft underwear that doesn''t sit on the scar line. Signs of infection to watch for: increasing redness, swelling, warmth, discharge (especially yellow or green), or worsening pain after initial improvement.

**Weeks 3–6: gradual return to activity**

As pain decreases, gently expand activity. Short walks become longer. Stairs are fine. However, avoid:
- Heavy lifting (nothing heavier than your baby)
- Core exercises (sit-ups, planks) — your abdominal fascia is still healing
- Driving — until you can perform an emergency stop without hesitation (usually 4–6 weeks)

**6 weeks and beyond**

Your 6-week check is an important milestone. By this point, most superficial healing is complete, but deep healing of the uterine scar continues for up to a year. Pelvic floor physiotherapy is recommended for all postnatal women, including c-section mothers — even without vaginal birth, pregnancy significantly affects the pelvic floor.

**Scar massage**

From around 6–8 weeks (once the incision is fully healed), gentle scar massage — applying light circular pressure to and around the scar — can improve sensation, reduce adhesions, and improve cosmetic appearance over time. A women''s health physiotherapist can guide you.

Always follow the specific advice of your surgical team, as recommendations vary based on your individual surgery and recovery.',
  'health',
  'Lumira Editorial — reviewed against RCOG and NICE caesarean section guidelines',
  true, true, 5,
  ARRAY['c-section', 'caesarean', 'surgery-recovery', 'scar-care', 'postpartum-recovery'],
  true
),

(
  'postpartum-w4-managing-visitors',
  'postpartum', 4,
  'Managing Visitors: Setting Boundaries With Love',
  'How to protect your recovery and bonding time without damaging relationships.',
  '**Why this is harder than it sounds**

In many cultures, welcoming visitors after a birth is a joyful tradition — and the impulse to share this new person with the people you love is entirely natural. But visitors, even loving ones, can disrupt feeds, shorten your rest windows, carry infections to an immunologically naive newborn, and add invisible labour (hosting, entertaining, cleaning up) at the worst possible time.

Setting boundaries is not about keeping people out — it is about creating the conditions for you to recover and for your baby to settle.

**The practical reality**

A visit that feels like "just an hour" often extends. People want to hold the baby. You feel obligated to make tea. You end up exhausted and behind on the sleep you desperately needed.

**Scripts that help**

You do not need to justify your decisions, but having words ready makes it easier:
- "We''re keeping visits to immediate family for the first two weeks — we''d love to see you once we''re a bit more settled."
- "Would you be up for dropping off a meal rather than a visit? It would honestly be the greatest gift right now."
- "Can we do a 30-minute visit in [week X]? We''ll let you know when we''re ready."

**Make help conditional**

The most helpful visitors are those who do tasks without being asked. Redirecting enthusiasm: "The best thing you could do is hang out the washing / grab groceries / hold the baby while I shower." Good visitors will be glad to be useful.

**Your partner as gatekeeper**

If possible, delegate visitor management to your partner. You should not have to be the person sending the "not yet" messages when you are recovering from birth.

**Cultural nuance**

In many cultures — South Asian, Middle Eastern, African, Latin American — the expectation of communal support after birth is embedded in the social fabric, and refusing it can feel isolating or disrespectful. The goal is not to refuse support, but to channel it productively. Family members cooking, cleaning, and taking care of older children is invaluable. Hovering over a sleeping baby less so.',
  'relationships',
  'Lumira Editorial',
  true, true, 3,
  ARRAY['visitors', 'boundaries', 'postpartum-recovery', 'support', 'family'],
  true
),

(
  'postpartum-w4-cultural-recovery-practices',
  'postpartum', 4,
  'Postpartum Confinement Practices Around the World',
  'The world''s oldest cultures had postpartum care figured out. Here''s what we can learn.',
  '**The universal wisdom of postpartum rest**

Across cultures and centuries, the idea that new mothers need an extended period of rest, warmth, nourishing food, and social support after birth has emerged independently. The specific practices differ; the underlying principle does not.

**Sitting the month (zuo yuezi) — Chinese tradition**

In traditional Chinese culture, new mothers observe a 30-day period of confinement following birth, during which they rest, eat warming foods (ginger, sesame oil, liver, bone broth), avoid cold air and water, and are cared for by female family members. The science is catching up: some studies suggest women who observe zuo yuezi report better postpartum mental health outcomes, likely because of the social support and enforced rest rather than specific food avoidance.

**La cuarentena — Latin American tradition**

The 40-day postpartum period (echoing the number forty found across many religious and cultural traditions) involves rest, nutrient-dense foods, and protection from cold and wind. Female relatives take over household duties. Similar traditions exist across Middle Eastern cultures.

**Jaappa — South Asian tradition**

In many South Asian communities, new mothers observe a 40-day recovery period involving massage with warming oils, special foods (methi ladoos, ajwain water, haldi milk), and care from the maternal grandmother. These foods often have genuine nutritional and anti-inflammatory properties.

**What modern research suggests**

A 2014 systematic review in Women and Birth found that structured postpartum rest and social support practices were associated with better maternal health outcomes across cultures. The common elements — rest, warmth, nourishment, and being cared for — are biologically sensible regardless of their cultural framing.

**Integrating tradition with modern life**

Even if a full 40-day confinement is not practical, the underlying principle applies: accept help, eat nourishing food, rest when possible, and allow yourself to be cared for. If cultural practices from your heritage feel right for you, honour them. If they feel like pressure, it is also fine to adapt them.',
  'wellness',
  'Lumira Editorial',
  true, true, 4,
  ARRAY['cultural-practices', 'postpartum-confinement', 'zuo-yuezi', 'cuarentena', 'jaappa', 'rest'],
  true
),

-- ═══════════════════════════════════════════════════════
-- WEEK 5
-- ═══════════════════════════════════════════════════════

(
  'postpartum-w5-hair-loss',
  'postpartum', 5,
  'Postpartum Hair Loss: Why It Happens and When It Stops',
  'Alarming but normal. Here''s the biology behind postpartum shedding.',
  '**The science of postpartum hair loss**

During pregnancy, elevated oestrogen levels extend the growth phase of your hair follicles, meaning fewer hairs than usual complete their normal shedding cycle. The result: thicker, more lustrous pregnancy hair.

After delivery, oestrogen drops sharply. All those hairs that were "held" in the growth phase suddenly transition to the shedding phase simultaneously. The clinical term is telogen effluvium, and it typically begins around 3–4 months after birth, peaks around months 4–6, and resolves by 12 months postpartum.

**What to expect**

- Large amounts of hair in the shower drain, on your pillow, and on your brush
- Thinning especially around the temples and hairline
- New shorter hairs appearing as regrowth begins

This can be alarming. Many women describe it as feeling like they are going bald. In the vast majority of cases, full regrowth occurs within a year.

**What you can do**

- **Nothing, really** — the process is hormonally driven and largely unavoidable
- Ensure adequate nutrition (iron, protein, biotin) — deficiency can worsen shedding
- Gentle hair care: avoid tight styles, minimise heat, use a wide-tooth comb on wet hair
- Scalp massage may support circulation and feels good regardless

**When to see your GP**

See your doctor if:
- Hair loss is extreme or accompanied by other symptoms (fatigue, weight changes, feeling cold) — this could indicate postpartum thyroiditis
- Hair does not begin to regrow by 12 months postpartum
- Hair loss is patchy (which may indicate alopecia areata, a different condition)

**The emotional side**

Hair is often tied to identity and self-image. Significant postpartum hair loss can affect how you feel about yourself at an already vulnerable time. This is valid. Being kind to yourself — and knowing it is temporary — is the main prescription.',
  'health',
  'Lumira Editorial',
  true, true, 3,
  ARRAY['postpartum-hair-loss', 'telogen-effluvium', 'hormones', 'hair-regrowth'],
  true
),

(
  'postpartum-w5-breastfeeding-challenges',
  'postpartum', 5,
  'Breastfeeding Past the First Month: Common Challenges and Solutions',
  'If you''ve made it to five weeks, you''ve done the hardest part. Here''s what comes next.',
  '**The five-week mark**

If you are still breastfeeding at five weeks, the hardest biological challenges — milk coming in, learning the latch, cluster feeding peaks, engorgement — are largely behind you. Many women describe a shift around weeks 4–6 where feeding becomes easier and more intuitive.

But new challenges often emerge. Here are the most common ones.

**Nipple pain or damage**

Nipple pain after the first 30–60 seconds of a feed (once let-down occurs) is not normal and is almost always addressable. Common causes include: latch issues, tongue tie, thrush (fungal infection), dermatitis, or Raynaud''s syndrome (nipple vasospasm causing colour change and pain). Each has different treatment — a lactation consultant can identify the cause.

**Perceived low supply**

Many breastfeeding mothers worry their supply is inadequate, but true low supply is less common than feared. Before supplementing with formula, which can reduce breast stimulation, consult a lactation consultant. Indicators of adequate supply: your baby is gaining weight appropriately and has sufficient wet nappies. Feeling "empty" or not leaking does not indicate low supply.

**Nursing strikes**

A nursing strike — when a baby who has been feeding well suddenly refuses the breast — is different from natural weaning. Common causes: ear infection (feeding hurts), teething, disruption to routine, a reaction to a new smell (perfume, soap). Offer the breast frequently, try different positions, and seek support if the strike lasts more than 2–3 days.

**Returning to work**

Planning to return to work while continuing to breastfeed is absolutely possible with preparation. Research your workplace''s pumping facilities and legal rights early. Most experts recommend establishing a pumping routine and building a freezer supply 2–4 weeks before your return.

Contact a lactation consultant, your GP, or breastfeeding helpline for personalised support.',
  'feeding',
  'Lumira Editorial — reviewed against ABM (Academy of Breastfeeding Medicine) clinical protocols',
  true, true, 4,
  ARRAY['breastfeeding-challenges', 'nipple-pain', 'low-supply', 'nursing-strike', 'pumping'],
  true
),

(
  'postpartum-w5-sleep-windows',
  'postpartum', 5,
  'Sleep Windows and Wake Windows: Understanding Your Baby''s Sleep',
  'Why timing matters as much as routine in helping your baby sleep better.',
  '**What is a wake window?**

A wake window is the amount of time a baby can comfortably stay awake between sleep periods before becoming overtired. Overtiredness triggers a stress hormone (cortisol) response that paradoxically makes it harder for babies to fall and stay asleep — the opposite of what you might expect.

**Wake windows by age**

At 4–6 weeks, most babies can manage approximately 45–90 minutes of awake time before needing to sleep again. This is very short. Attempting to keep a young baby awake longer than this window in hopes they will "sleep better" usually backfires.

As babies mature, wake windows lengthen:
- 2–3 months: 60–90 minutes
- 3–4 months: 75–120 minutes
- 5–6 months: 2–2.5 hours

**Sleepy cues vs. overtired cues**

Catching your baby at the right time in their wake window — before overtiredness sets in — makes settling easier. Sleepy cues include: slowing movements, staring, pulling at ears, yawning. Overtired cues include: arching back, inconsolable crying, red-rimmed eyes, difficulty settling despite obvious exhaustion.

**Your own sleep windows**

The concept applies to you too. Going to bed before you are exhausted — while you are sleepy but still calm — leads to better sleep quality than waiting until you''re at the point of collapse. This is hard with a newborn; the point is directionally useful even if imperfectly implemented.

**What this is not**

Understanding wake windows is not a sleep training method and does not require strict scheduling in the newborn period. It is simply a framework for recognising your baby''s signals. The goal is connection, not control.',
  'sleep',
  'Lumira Editorial',
  true, true, 3,
  ARRAY['wake-windows', 'newborn-sleep', 'sleep-cues', 'overtiredness', 'baby-sleep'],
  true
),

-- ═══════════════════════════════════════════════════════
-- WEEK 6
-- ═══════════════════════════════════════════════════════

(
  'postpartum-w6-postnatal-check',
  'postpartum', 6,
  'Your 6-Week Postnatal Check: What to Ask, What to Mention',
  'This appointment is about you — not just your baby. Here''s how to make the most of it.',
  '**What the 6-week check is**

The 6-week postnatal check is a routine appointment with your GP or midwife to review your physical and emotional recovery from birth. In many countries, it is also when your baby receives their first developmental check and vaccinations.

The appointment is often short (10–15 minutes). Coming prepared helps you use the time well.

**Physical topics to raise**

- **Wound healing.** Any ongoing pain, unusual discharge, or concerns about your perineal wound or c-section scar.
- **Bladder and bowel function.** Urinary incontinence, urgency, or difficulty emptying your bladder are common after birth and very treatable — but you need to raise them.
- **Pelvic floor.** Even if you had a c-section, ask for a pelvic floor physiotherapy referral. Most women benefit.
- **Contraception.** If relevant, discuss your options. Ovulation can return before your first period — sometimes as early as 3–4 weeks postpartum if not exclusively breastfeeding.
- **Pain.** Any ongoing pelvic, back, or joint pain.
- **Thyroid symptoms.** Fatigue, hair loss, weight changes, and mood symptoms that feel out of proportion can indicate postpartum thyroiditis.

**Mental health topics to raise**

Be honest. Ask your doctor to screen you for postpartum depression and anxiety. Standard validated tools (Edinburgh Postnatal Depression Scale) take 5 minutes. You can complete one online before your appointment if it helps.

Mention: persistent low mood, inability to sleep when baby sleeps, excessive worry, intrusive thoughts, feeling detached from your baby, or feeling like you are not coping.

**Don''t leave without**

- Pelvic floor physiotherapy referral (if not already in place)
- Mental health follow-up if relevant
- Contraception plan
- Answers to anything that was worrying you before the appointment

You deserve the full 15 minutes. It is appropriate to say "I have a few things I''d like to cover."',
  'health',
  'Lumira Editorial — reviewed against NICE postnatal care guidelines',
  true, true, 5,
  ARRAY['6-week-check', 'postnatal-appointment', 'GP-visit', 'pelvic-floor', 'postpartum-care'],
  true
),

(
  'postpartum-w6-pelvic-floor',
  'postpartum', 6,
  'Pelvic Floor Recovery: Why It Matters Beyond Leakage',
  'The pelvic floor does much more than prevent leaks. Here''s the complete picture.',
  '**What the pelvic floor actually is**

The pelvic floor is a group of muscles and connective tissues that form a hammock-like structure at the base of the pelvis, supporting the bladder, bowel, and uterus. During pregnancy, these structures bear 9 months of increasing load. During vaginal birth, they are stretched to remarkable lengths (and sometimes torn). Even after c-section, pregnancy alone causes significant pelvic floor changes.

**What pelvic floor dysfunction looks like**

It is not just leaking urine when you sneeze. Pelvic floor dysfunction can present as:
- Urinary incontinence (stress or urge incontinence)
- Urinary urgency or frequency
- Difficulty emptying the bladder completely
- Bowel control issues (faecal urgency or incontinence)
- Pelvic organ prolapse (a feeling of heaviness or bulging)
- Pelvic pain, including pain with sex
- Pain or difficulty with bowel movements

**Why everyone benefits from a physiotherapy assessment**

NICE guidelines in the UK recommend pelvic floor exercises for all postnatal women. Many countries now recommend a specialist pelvic floor physiotherapy assessment, not just a leaflet with Kegel diagrams. A physiotherapist can assess the actual function of your pelvic floor — whether it is too weak, too tight (which requires relaxation, not strengthening), or something in between.

Many pelvic floor problems are undertreated because women feel embarrassed to raise them or believe they are an inevitable part of having a baby. They are not.

**The right way to do pelvic floor exercises**

The traditional "squeeze and hold" Kegel is one component. A full pelvic floor rehabilitation programme also includes:
- Coordination exercises (engaging during exertion, releasing at rest)
- Relaxation/down-training for hypertonic (too tight) pelvic floors
- Functional exercises integrated into daily life

Ask for a referral to a women''s health physiotherapist at your 6-week check. This should be available through your healthcare system.',
  'wellness',
  'Lumira Editorial — reviewed against NICE CG37 and POGP (Pelvic, Obstetric and Gynaecological Physiotherapy) guidelines',
  true, true, 5,
  ARRAY['pelvic-floor', 'physiotherapy', 'incontinence', 'prolapse', 'kegel', 'recovery'],
  true
),

(
  'postpartum-w6-returning-to-intimacy',
  'postpartum', 6,
  'Returning to Intimacy After Birth: No Pressure, No Timeline',
  'Physical readiness and emotional readiness are different things — and both matter.',
  '**The 6-week guidance**

You may have heard that sex is "allowed" again at 6 weeks postpartum. This is a medical guideline based on wound healing, not a prescription. Physical readiness and emotional readiness often diverge significantly, and there is no obligation to return to any form of intimacy on any particular timeline.

**Physical considerations**

Even if wounds have healed, many women experience:
- Vaginal dryness — breastfeeding reduces oestrogen levels, causing a similar dryness to menopause. A vaginal moisturiser or water-based lubricant can make a significant difference.
- Tenderness at the perineum or c-section scar
- Decreased libido — also related to breastfeeding hormones, sleep deprivation, and the overall demands of new parenthood

**Emotional and relational considerations**

Your body has been pregnant, birthed a baby, and is now potentially feeding that baby. You may feel that your body belongs entirely to your baby, leaving little sense of it as yours or as intimate. This is very common and does not indicate a relationship problem.

Partners frequently feel uncertain about timing, worried about causing pain or pressure, or themselves struggling with the transition to parenthood in ways that affect intimacy.

**What actually helps**

- Honest conversation with your partner about how you are feeling — without pressure to arrive at a solution
- Non-sexual physical affection (touch, holding, time alone together) that rebuilds connection without expectation
- Recognising that a temporary shift in your sexual relationship is normal and expected, not a warning sign
- Addressing pain with a pelvic floor physiotherapist if discomfort persists

If painful intercourse (dyspareunia) is ongoing beyond the early postpartum weeks, a women''s health physiotherapist or gynaecologist can help. This is a medical issue, not something to simply push through.',
  'relationships',
  'Lumira Editorial — reviewed against RCOG and NICE postnatal care guidance',
  true, true, 4,
  ARRAY['intimacy', 'sex-after-birth', 'postpartum-libido', 'relationship', 'pelvic-floor'],
  true
),

-- ═══════════════════════════════════════════════════════
-- WEEK 7
-- ═══════════════════════════════════════════════════════

(
  'postpartum-w7-social-smile',
  'postpartum', 7,
  'Your Baby''s First Real Smile: What''s Happening Developmentally',
  'That first smile isn''t just adorable — it''s a neurological milestone.',
  '**Reflex vs. social smile**

In the early weeks, you may notice your baby''s face arrange itself into what looks like a smile during sleep or when passing wind. These are reflex smiles — spontaneous muscle movements not yet under conscious control.

The social smile typically appears between 6–8 weeks and is categorically different. It is:
- Triggered by your face, voice, or interaction
- Accompanied by eye contact and whole-body engagement
- Intentional — your baby is responding to you

This is one of the most significant moments in early development. The social smile marks the beginning of reciprocal communication — your baby is not just reacting to stimuli, but initiating a social exchange.

**What''s happening in the brain**

By 6–8 weeks, the prefrontal cortex is developing rapidly. Your baby is learning to recognise faces (they already prefer yours), process emotional expressions, and engage in proto-conversations — the back-and-forth exchanges of looks, sounds, and expressions that lay the foundation for language and attachment.

**How to encourage social development**

- **Face time.** Hold your baby at the optimal visual focal length (20–30cm) and let them study your face
- **Serve and return.** Respond to every coo, gurgle, and expression. These "conversational" exchanges build neural pathways.
- **Narrate your day.** Even to a baby who cannot understand words, hearing language and seeing your expressive face is developmentally rich
- **Tummy time.** Strengthens the neck muscles needed to hold the head up and look at faces

**A note on variation**

Some babies smile on the earlier end of the 6–8 week range; some take a little longer. Premature babies often meet milestones based on their adjusted age (calculated from due date, not birth date). If you have any concerns about your baby''s social responsiveness, raise them with your paediatrician.',
  'development',
  'Lumira Editorial — reviewed against AAP developmental milestones guidance',
  true, true, 3,
  ARRAY['social-smile', 'infant-development', 'milestones', 'brain-development', '6-weeks'],
  true
),

(
  'postpartum-w7-postpartum-rage',
  'postpartum', 7,
  'Postpartum Rage: The Emotion Nobody Talks About',
  'Intense anger after having a baby is real, recognised, and treatable.',
  '**What is postpartum rage?**

Postpartum rage — episodes of intense, disproportionate anger that feel frightening in their intensity — is a recognised feature of postpartum mood disorders, yet it receives a fraction of the attention given to postpartum depression. It is thought to affect a significant proportion of new parents and is particularly common in people with a history of anxiety or PTSD.

It can manifest as:
- Explosive anger over minor frustrations
- Rage directed at a partner, family member, or even the baby
- Intense irritability and a low tolerance threshold for noise, mess, or disruption
- A sense that the anger feels foreign — "this isn''t who I am"

**Why it happens**

Postpartum rage is not a character flaw or evidence that you are a bad parent. Contributing factors include:
- Profound sleep deprivation (which significantly impairs emotional regulation)
- Hormonal fluctuations (particularly oestrogen and progesterone withdrawal)
- The unrelenting demands of newborn care with inadequate support
- Unmet needs — physical, social, emotional
- An underlying mood disorder including postpartum depression or anxiety

In some models, anger is conceptualised as a "secondary emotion" protecting against more vulnerable feelings of fear, grief, or helplessness.

**What to do in the moment**

- Leave the room if you need to (placing a baby safely in their cot and taking two minutes to regulate is appropriate and safe)
- Slow breathing activates the parasympathetic nervous system and reduces the physiological anger response
- Contact a trusted person

**When to seek help**

Postpartum rage that is frequent, severe, or frightening to you warrants a conversation with your GP or a mental health professional. It often responds well to the same treatments as postpartum depression and anxiety — therapy, support, and where appropriate, medication.

You are not a danger. You are a person in need of support.',
  'mental-health',
  'Lumira Editorial — reviewed against Postpartum Support International clinical resources',
  true, true, 4,
  ARRAY['postpartum-rage', 'anger', 'mood-disorder', 'emotional-regulation', 'PPD'],
  true
),

(
  'postpartum-w7-returning-to-work-emotional',
  'postpartum', 7,
  'The Emotional Side of Returning to Work',
  'The logistics get most of the attention. But the feelings deserve it too.',
  '**The complexity of going back**

Returning to work after having a baby is rarely a simple logistical exercise. Even when it goes smoothly on paper, the emotional experience can be unexpectedly complex.

Common feelings include:
- **Grief** — genuinely mourning time with your baby
- **Relief** — also real, and completely valid, even when accompanied by guilt about feeling relieved
- **Anxiety** — about childcare quality, pumping logistics, being "behind," or colleagues'' perceptions
- **Identity confusion** — feeling like neither a good enough parent nor a good enough employee
- **Loss of identity** — for some, work is a significant part of self-concept, and parental leave has changed both you and your relationship to work

**There is no "right" feeling**

Feeling sad about returning is not evidence that you love your baby more than people who feel ready. Feeling ready — even excited — is not evidence that you love your baby less. The emotional landscape here is genuinely complex, and most parents experience multiple contradictory feelings simultaneously.

**Practical supports for emotional wellbeing**

- **A transition period.** Starting back part-time or with a phased return, where your employer allows, can reduce the abruptness of the transition.
- **Routines that work for you.** Morning rituals that allow connection time before the day begins — even 15 minutes — can make the separation feel less stark.
- **Talking to other parents.** The normalisation that comes from hearing "I felt that too" is genuinely therapeutic.
- **Checking in with yourself.** If you are struggling significantly beyond the first few weeks of return, speak to your GP — postpartum mood disorders can emerge or worsen at work return.

Your experience of this transition is valid, whatever it looks like.',
  'wellness',
  'Lumira Editorial',
  true, true, 4,
  ARRAY['returning-to-work', 'maternity-leave', 'working-parent', 'identity', 'emotions'],
  true
),

-- ═══════════════════════════════════════════════════════
-- WEEK 8
-- ═══════════════════════════════════════════════════════

(
  'postpartum-w8-immunisations',
  'postpartum', 8,
  'The 8-Week Vaccination Schedule: What Your Baby Receives and Why',
  'Understanding the immunisations your baby needs — and the science behind why they''re given now.',
  '**Why vaccinations start at 8 weeks**

Newborns receive some maternal antibodies through the placenta and breast milk, but this protection is partial and wanes over time. The immune system matures to a point at 8 weeks where it can mount a robust response to vaccines. Starting at 8 weeks provides protection before natural maternal antibody levels fall.

**What is typically given at 8 weeks (UK/NHS schedule)**

- **6-in-1 vaccine** (DTaP/IPV/Hib/HepB): diphtheria, tetanus, whooping cough, polio, Hib meningitis, hepatitis B
- **Rotavirus vaccine** (oral, not injected): protects against the most common cause of severe gastroenteritis in infants
- **MenB vaccine**: meningococcal group B, a cause of bacterial meningitis

*Note: vaccination schedules vary by country. Your paediatrician or health visitor will advise on the schedule in your region.*

**What to expect after the vaccinations**

Many babies are unsettled, feverish, or have a sore leg in the 24–48 hours following vaccination — this is a normal immune response, not illness. A dose of infant paracetamol (ibuprofen is not recommended under 3 months) can manage discomfort. The MenB vaccine in particular is associated with higher fever rates.

**Signs to watch for**

Contact your GP or emergency services if your baby develops:
- High fever (above 38°C / 100.4°F) in the first 2–3 months of life
- Inconsolable crying lasting more than 3 hours
- Breathing changes or unusual rash

**Vaccine safety**

Vaccines used in national immunisation programmes have undergone extensive clinical trials and ongoing safety monitoring. The benefits of protecting against serious childhood diseases significantly outweigh the risks of the vaccines themselves. If you have concerns, your GP or paediatrician can discuss them with you.',
  'health',
  'Lumira Editorial — reviewed against NHS immunisation schedule and WHO vaccine guidance',
  true, true, 4,
  ARRAY['vaccinations', '8-week-jabs', 'immunisations', 'baby-health', 'DTaP'],
  true
),

(
  'postpartum-w8-postpartum-body-image',
  'postpartum', 8,
  'Postpartum Body Image: Making Peace With Your Changed Body',
  'Your body did something extraordinary. It deserves care, not criticism.',
  '**The gap between expectation and reality**

Cultural messaging about postpartum bodies — the expectation of "bouncing back," celebrity narratives about post-baby bodies, social media imagery — creates a profoundly damaging gap between what is normal and what is presented as ideal.

Here is what is actually normal at 8 weeks postpartum:
- Your uterus has returned to approximately pre-pregnancy size, but the rest of your body is still adjusting
- Abdominal muscles may have separation (diastasis recti) that affects how your belly looks and functions
- Your hips may be slightly wider — the pelvis genuinely changes in pregnancy and birth
- Stretch marks are permanent; their colour fades but they do not disappear
- Your breast size and shape have changed; if breastfeeding, they will continue to change

**What body neutrality looks like**

A helpful reframe: rather than loving your body (hard to achieve on demand), practise body neutrality — relating to your body in terms of what it can do rather than how it looks. Your body:
- Grew and nurtured a human being for 9 months
- Birthed that person
- Is currently producing milk (if breastfeeding) or recovering from surgery while sleep-deprived

This is not a body that needs to "get back" to anything. It is a body doing remarkable ongoing work.

**Practical support**

- Wear clothes that fit you now, not aspirationally. Physical discomfort worsens mood and body image.
- Take a break from social media accounts that trigger comparison
- Talk to someone — a friend, your partner, a therapist — if negative body image is significantly affecting you

If body image concerns are severe, persistent, or accompanied by restriction of eating or purging, please speak with your GP. Eating disorders can develop or resurface in the postpartum period.',
  'mental-health',
  'Lumira Editorial',
  true, true, 4,
  ARRAY['body-image', 'postpartum-body', 'body-neutrality', 'diastasis-recti', 'self-image'],
  true
),

-- ═══════════════════════════════════════════════════════
-- WEEK 9
-- ═══════════════════════════════════════════════════════

(
  'postpartum-w9-formula-feeding',
  'postpartum', 9,
  'Formula Feeding Without Guilt: Everything You Need to Know',
  'Formula is a safe, complete nutrition source. Here''s how to use it well.',
  '**Feeding your baby matters more than how you feed**

Whether you are formula feeding by choice, medical necessity, or because breastfeeding did not work out, your baby can thrive. Formula is a regulated product scientifically formulated to meet infants'' nutritional needs. A fed, loved baby is the goal — the method matters far less than the culture around feeding suggests.

**Choosing a formula**

For full-term, healthy infants, standard infant formula (stage 1) is appropriate for the first 12 months. Follow-on formulas (stage 2) are marketed from 6 months but offer no proven advantage over stage 1 formula. Specialist formulas (hypoallergenic, lactose-free) should only be used on medical advice.

**Preparing formula safely**

Safe formula preparation is important as powdered formula is not sterile:
- Wash your hands thoroughly
- Use freshly boiled water (not repeatedly re-boiled) that has cooled to no less than 70°C — this temperature kills any bacteria
- Prepare each feed fresh rather than making a batch
- Discard any unused formula after 2 hours at room temperature or 24 hours refrigerated

**Responsive bottle feeding**

You can apply the same responsive feeding principles to bottle feeding as to breastfeeding:
- Feed on demand, not on a strict schedule
- Pace the feed — hold the bottle horizontal, take breaks, let baby indicate satiation
- Don''t pressure baby to finish the bottle
- Make feeds a time of connection: skin-to-skin where possible, eye contact, talking to your baby

**Volume guidance**

Approximate formula amounts vary by age and weight — your paediatrician can advise. A rough guide: about 150–200ml per kilogram of body weight per day, divided into feeds. Growth and contentment are better indicators than hitting exact volume targets.',
  'feeding',
  'Lumira Editorial — reviewed against NHS and WHO infant feeding guidance',
  true, true, 4,
  ARRAY['formula-feeding', 'bottle-feeding', 'infant-formula', 'responsive-feeding', 'feeding-without-guilt'],
  true
),

(
  'postpartum-w9-fourth-trimester-body',
  'postpartum', 9,
  'The Fourth Trimester: Understanding Your Body''s Reset',
  'The concept of the fourth trimester explains a lot about what you''re experiencing.',
  '**What is the fourth trimester?**

The "fourth trimester" refers to the first three months after birth — a period of profound transition for both you and your baby. The concept acknowledges that birth is not an endpoint but a midpoint: your body and your baby''s body are continuing a major developmental process.

**For your baby**

Human babies are born at a relatively early developmental stage compared to other primates — a consequence of our large brains and narrow pelvises. A newborn''s nervous system is immature and easily overwhelmed. Recreating womb-like conditions — warmth, motion, sound, containment — is not "spoiling" but appropriately meeting developmental needs.

**For your body**

Your body is simultaneously:
- Healing from birth (whether vaginal or caesarean)
- Undergoing the largest hormonal withdrawal since puberty
- Producing milk (if breastfeeding) — a metabolically demanding process
- Adapting to severe sleep disruption
- Reorganising neurologically around the needs of another person

The term "matrescence" — coined by medical anthropologist Dana Raphael in 1973 and recently popularised by Dr. Alexandra Sacks — describes the psychological developmental process of becoming a mother: a transition as profound as adolescence, involving identity shifts, grief, ambivalence, and growth.

**What this means practically**

Lower your expectations for yourself accordingly. You are not "recovered" at 6 weeks. You are not "back to normal" at 3 months. The fourth trimester is its own distinct developmental phase. Give it the time and attention it deserves.',
  'wellness',
  'Lumira Editorial',
  true, true, 4,
  ARRAY['fourth-trimester', 'matrescence', 'postpartum-recovery', 'identity', 'transition'],
  true
),

(
  'postpartum-w9-unsolicited-advice',
  'postpartum', 9,
  'Navigating Unsolicited Parenting Advice',
  'Why everyone has an opinion about your baby — and how to handle it with your sanity intact.',
  '**Why it happens**

Everyone who has had a baby has an opinion. Many people feel compelled to share it. A crying baby in a pram, a feeding choice, a sleep arrangement, a parenting decision — all become open targets for commentary. Well-meaning grandparents, strangers in supermarkets, friends without children: all may offer opinions you did not ask for.

This is particularly intense for new parents because parenting decisions feel high-stakes, because there is conflicting evidence on many questions, and because other people''s choices implicitly comment on your own.

**Why it is more loaded than it looks**

Unsolicited advice often carries an implicit message: you are doing it wrong. For sleep-deprived, hormonally disrupted, first-time parents, this can land hard. If you find yourself distressed by comments that you "know" shouldn''t matter, it is not irrationality — it is vulnerability.

**Responses that preserve your energy**

You are not obligated to defend, explain, or justify your parenting choices. Some approaches that keep you out of debates you don''t want:
- "We''re doing what works for us." (End of discussion)
- "Thanks, I''ll look into that." (Non-committal and non-confrontational)
- "Our paediatrician is happy with how things are going." (Introduces professional authority without being aggressive)
- Silence and a smile (valid)

**Cultural dynamics**

In many cultures, elder family members — grandparents especially — hold legitimate authority in family systems, and dismissing their advice can cause real relationship damage. Finding ways to honour their experience while maintaining your own decision-making autonomy is a genuine skill worth developing. "Tell me what worked for you" is different from "I''ll do it your way."

**The one piece of advice worth taking**

Listen to your paediatrician, your midwife, and the people you specifically ask for advice. For everyone else, remember: you know your baby. Trust yourself.',
  'relationships',
  'Lumira Editorial',
  true, true, 3,
  ARRAY['parenting-advice', 'boundaries', 'family-dynamics', 'trust-yourself', 'new-parents'],
  true
),

-- ═══════════════════════════════════════════════════════
-- WEEK 10
-- ═══════════════════════════════════════════════════════

(
  'postpartum-w10-postnatal-depletion',
  'postpartum', 10,
  'Postnatal Depletion: When Tiredness Goes Deeper Than Sleep',
  'Dr. Oscar Serrallach''s concept explains why some women feel depleted for years after birth.',
  '**What is postnatal depletion?**

Postnatal depletion — a term developed by Australian GP Dr. Oscar Serrallach — describes a syndrome of physical and psychological depletion that persists beyond the immediate postpartum period, sometimes for years. It is distinct from postpartum depression and reflects the genuine nutritional, hormonal, and neurological demands that pregnancy and parenthood place on a woman''s body.

**The biology**

Pregnancy draws heavily on maternal reserves to build a baby:
- The baby''s brain development depletes maternal DHA (an omega-3 fatty acid critical for neurological function)
- Iron stores are depleted through blood loss and fetal demand
- Zinc, iodine, vitamin B12, vitamin D, and folate are all drawn down
- Sleep deprivation causes measurable changes in brain structure, hormones, and immune function

If these reserves are not replenished — and they often are not, because postpartum nutrition and rest are inadequately supported — the deficit compounds.

**Symptoms of postnatal depletion**

- Profound fatigue that does not resolve with rest
- Cognitive symptoms: brain fog, poor memory, difficulty concentrating
- Hypersensitivity (to noise, touch, emotions)
- Loss of sense of self or purpose
- Anxiety and low mood that does not meet criteria for clinical depression
- Physical symptoms: hair loss, dry skin, joint pain

**What helps**

- Comprehensive nutritional assessment (ask your GP for blood tests including ferritin, B12, vitamin D, thyroid function)
- Targeted supplementation based on results
- Prioritising sleep even if imperfectly
- Reducing demands and increasing support

**A note of caution**

Postnatal depletion is not yet widely recognised in mainstream medicine. Symptoms should be investigated by your GP to rule out treatable conditions (anaemia, thyroid dysfunction, depression) before attributing them to a depletion framework. These are not mutually exclusive.

Always speak with your healthcare provider before starting supplementation.',
  'health',
  'Lumira Editorial — referencing Dr Oscar Serrallach''s clinical work and ACOG postpartum care guidelines',
  true, true, 5,
  ARRAY['postnatal-depletion', 'fatigue', 'brain-fog', 'DHA', 'postpartum-nutrition', 'recovery'],
  true
),

(
  'postpartum-w10-tummy-time',
  'postpartum', 10,
  'Tummy Time: Why It Matters and How to Make It Work',
  'The foundation of motor development starts face-down. Here''s how to build a tummy time practice.',
  '**Why tummy time is essential**

Since the "Back to Sleep" campaign in the 1990s dramatically reduced SIDS rates, more babies are spending less time on their tummies overall. While back sleeping is absolutely the right recommendation for unsupervised sleep, supervised tummy time is important for development.

Tummy time:
- Strengthens neck, shoulder, and core muscles needed for rolling, sitting, and crawling
- Prevents positional plagiocephaly (flat head) caused by too much time on the back
- Develops the visual and sensory processing needed for exploring the world

**How much tummy time**

- **Newborns:** Start from day one with short sessions on your chest (skin-to-skin counts as tummy time)
- **1–3 months:** Work up to 30 minutes total daily in short sessions of 3–5 minutes
- **3–6 months:** 30+ minutes daily; this is when tummy time really pays off developmentally

**Why babies hate it (at first)**

Young babies often protest tummy time because it is genuinely effortful — their neck muscles are not yet strong enough to lift the head comfortably. This is normal and not a reason to stop.

**Making it more tolerable**

- Get on your tummy facing your baby at eye level — your face is the best motivation
- Place a rolled towel under the chest to prop slightly
- A tummy time mat with mirrors, textures, and toys gives more to engage with
- Try tummy time on your lap, on your forearm (the "football hold"), or on your chest
- Do it when baby is fed, awake, and alert — not when tired or hungry

Most babies learn to enjoy tummy time as they get stronger. The first few weeks require persistence.',
  'development',
  'Lumira Editorial — reviewed against AAP developmental milestones guidance',
  true, true, 3,
  ARRAY['tummy-time', 'motor-development', 'flat-head', 'plagiocephaly', 'infant-development'],
  true
),

(
  'postpartum-w10-when-to-seek-ppd-help',
  'postpartum', 10,
  'When to Seek Help for Postpartum Depression: A Direct Guide',
  'The most important article in this library. Please read it.',
  '**Postpartum depression is treatable**

Postpartum depression affects approximately 1 in 7 new mothers, and a significant proportion of fathers and non-birthing parents. It is a medical condition — not a failure, not weakness, not something you should be able to manage alone. And it is treatable.

The most important thing about postpartum depression: seeking help earlier leads to better outcomes for you and your baby.

**Signs that you should seek help today**

Contact your GP, midwife, or a mental health professional as soon as possible if you are experiencing:

- Persistent low mood that lasts most of the day, most days, for more than two weeks
- Loss of interest in things that used to matter to you
- Inability to sleep even when you have the opportunity (as distinct from normal newborn disruption)
- Feeling detached from your baby, or feeling unable to love them
- Persistent feelings of worthlessness, shame, or inadequacy as a parent
- Excessive, uncontrollable anxiety or panic
- Intrusive, frightening thoughts that you cannot control (though these alone do not indicate danger)
- Thoughts that your family would be better off without you, or thoughts of harming yourself

**Signs to call emergency services immediately**

- Thoughts of suicide or self-harm with a plan
- Behaviour that feels out of control and frightening to you
- Any thought of harming your baby (this is more common than reported but always requires professional assessment)
- Rapid confusion, hallucinations, or severely erratic behaviour (possible postpartum psychosis)

**What getting help looks like**

Your GP can assess your symptoms, screen you using validated tools, and discuss options including therapy (CBT is highly effective), peer support, and medication. Many antidepressants are compatible with breastfeeding — this does not have to be a reason to avoid medication.

**You deserve support**

Getting treatment for postpartum depression is one of the best things you can do for your baby. Children thrive when their primary caregiver''s mental health is supported. Maternal mental health is infant health.

If you are in crisis now, please call your local emergency services or a mental health crisis line. In the UK: Samaritans 116 123. In the US: 988 Suicide and Crisis Lifeline. Postpartum Support International helpline: 1-800-944-4773.',
  'mental-health',
  'Lumira Editorial — reviewed against NICE CG192 and Postpartum Support International guidelines',
  true, true, 5,
  ARRAY['postpartum-depression', 'PPD', 'seek-help', 'mental-health', 'treatment', 'recovery'],
  true
),

-- ═══════════════════════════════════════════════════════
-- WEEK 11
-- ═══════════════════════════════════════════════════════

(
  'postpartum-w11-breastfeeding-fertility',
  'postpartum', 11,
  'Breastfeeding and Your Fertility: What You Actually Need to Know',
  'The lactational amenorrhoea method is more nuanced than "breastfeeding prevents pregnancy."',
  '**The hormonal connection**

Prolactin — the hormone that stimulates milk production — also suppresses ovulation by inhibiting GnRH (gonadotropin-releasing hormone). This is why exclusively breastfeeding mothers often do not have periods. However, the suppression is not absolute.

**The Lactational Amenorrhoea Method (LAM)**

LAM is a recognised, evidence-based contraceptive method, but it has specific criteria that must all be met:
1. Your baby is under 6 months old
2. Your periods have not returned
3. You are exclusively breastfeeding — no formula, no solids, feeding on demand day and night, no extended gaps between feeds

When all three criteria are met, LAM is over 98% effective. If any criterion is not met, effectiveness drops and additional contraception is needed.

**When fertility returns**

Ovulation can return before your first postpartum period — meaning you can get pregnant before you even know your cycle has resumed. This typically happens sooner if:
- You are partially or not breastfeeding
- Your baby sleeps longer stretches at night
- You introduce solids (replacing feeds)
- Your baby is over 6 months

**Contraception options while breastfeeding**

Most contraception is safe while breastfeeding, with one exception: combined hormonal contraceptives (combined pill, patch, ring) are generally avoided in the early months of breastfeeding as oestrogen can reduce milk supply. Options that are safe include:
- Progestogen-only pill ("mini-pill")
- Hormonal IUS (Mirena) or copper IUD
- Implant or injectable contraception
- Barrier methods

Discuss options with your GP at your 6-week check.',
  'feeding',
  'Lumira Editorial — reviewed against Faculty of Sexual and Reproductive Healthcare (FSRH) guidelines',
  true, true, 3,
  ARRAY['breastfeeding', 'fertility', 'LAM', 'contraception', 'periods', 'postpartum'],
  true
),

(
  'postpartum-w11-sleep-debt',
  'postpartum', 11,
  'Night Feeds, Sleep Debt, and Your Long-Term Health',
  'How to manage cumulative sleep loss without burning out.',
  '**Sleep debt is real — and it accumulates**

Sleep debt is the cumulative effect of consistently getting less sleep than your body needs. A 2019 study in Current Biology showed that weekend "catch-up" sleep can partially offset weekday sleep deprivation, but chronic sleep restriction causes measurable cognitive, metabolic, and immune impairment that is not fully reversed by short recovery periods.

For new parents dealing with months of disrupted nights, this is not a theoretical risk.

**The effects of chronic sleep deprivation**

Research shows that sustained sleep restriction:
- Impairs decision-making, emotional regulation, and attention comparably to being legally drunk
- Increases risk of anxiety and depression
- Affects metabolic function and immune response
- Impairs maternal sensitivity (your ability to read and respond to your baby''s cues)

**Prioritisation over perfection**

Perfect sleep is not available in the fourth trimester. But marginal improvements matter:
- **The most valuable sleep window is the longest one.** Even if you get only one 3-hour uninterrupted block, that is meaningfully different from six 30-minute fragments
- **Divide nights strategically.** If you have a partner or support person, establish clear roles to protect one longer sleep block per person per night
- **Decline night visitors.** Well-meaning family who visit in the evening extend your waking time
- **Lower all other standards.** Energy spent on a clean house is energy not spent on rest

**Night feeds are temporary**

Most babies begin to consolidate sleep (including a longer first sleep stretch) between 3–6 months, though there is wide normal variation. Some fully breastfed babies continue frequent night feeding beyond this. Changes in feeding patterns (introducing solids, introducing a bottle for night feeds) can extend overnight sleep for some families, but are not guaranteed solutions.',
  'sleep',
  'Lumira Editorial',
  true, true, 4,
  ARRAY['sleep-debt', 'night-feeds', 'sleep-deprivation', 'chronic-sleep-loss', 'new-parent-sleep'],
  true
),

(
  'postpartum-w11-rediscovering-yourself',
  'postpartum', 11,
  'Rediscovering Yourself: Identity Beyond "Mum"',
  'Becoming a parent changes your identity. That doesn''t mean you have to lose yourself.',
  '**Matrescence: the identity shift of becoming a mother**

Medical anthropologist Dana Raphael coined the term "matrescence" in 1973 to describe the developmental transition of becoming a mother. Like adolescence, matrescence involves genuine neurobiological changes, identity restructuring, and a period of instability before a new sense of self emerges.

A 2016 study in Nature Neuroscience found significant grey matter changes in the brains of first-time mothers that persisted for at least two years after birth — changes associated with enhanced maternal responsiveness. Becoming a mother is a neurological event.

**The grief of self-continuity**

Many women experience a sense of loss around the pre-baby version of themselves — their spontaneity, their professional identity, their body autonomy, their friendships, their sense of competence in a world they navigated well. This grief is real and valid, and it can coexist with love for your child and gratitude for your life.

It is possible to simultaneously love your baby deeply and grieve what you have lost. These are not contradictions.

**Finding your way back to yourself**

Not the same self — a new self that integrates your identity as a parent with who else you are.

- **Name what you''ve lost.** Not to dwell, but to honour. Grief acknowledged heals faster than grief suppressed.
- **Identify one thing that feels like you.** Reading, running, a creative practice, music, conversation with a particular friend. Even 20 minutes of something that connects you to your pre-parent self matters.
- **Be patient with the timeline.** The research suggests full re-stabilisation of identity after becoming a parent takes approximately 3 years — longer than the fourth trimester, longer than parental leave, longer than we are typically told.

You will find yourself again. A version of yourself that has been through something significant.',
  'wellness',
  'Lumira Editorial',
  true, true, 4,
  ARRAY['identity', 'matrescence', 'motherhood', 'self', 'postpartum-wellbeing', 'fourth-trimester'],
  true
),

-- ═══════════════════════════════════════════════════════
-- WEEK 12
-- ═══════════════════════════════════════════════════════

(
  'postpartum-w12-postpartum-thyroiditis',
  'postpartum', 12,
  'Postpartum Thyroiditis: The Condition Many New Mothers Don''t Know About',
  'It affects 5–10% of women after birth and is often mistaken for general postpartum fatigue.',
  '**What is postpartum thyroiditis?**

Postpartum thyroiditis is an inflammation of the thyroid gland that occurs in 5–10% of women in the first year after birth. It is thought to be an autoimmune condition — during pregnancy, the immune system is modulated to tolerate the foetus; after delivery, immune activity rebounds and can attack the thyroid.

**The typical pattern**

Postpartum thyroiditis often follows a biphasic pattern:
1. **Hyperthyroid phase** (1–4 months postpartum): the inflamed thyroid releases stored hormones. Symptoms: anxiety, rapid heartbeat, irritability, weight loss, heat intolerance, trouble sleeping.
2. **Hypothyroid phase** (4–8 months postpartum): the thyroid becomes underactive as stores are depleted. Symptoms: profound fatigue, depression, weight gain, cold intolerance, brain fog, dry skin, constipation.

Some women experience only one phase; some experience neither prominent phase and have no symptoms.

**Why it matters**

Postpartum thyroiditis is frequently mistaken for:
- Normal postpartum tiredness
- Postpartum depression
- Anxiety
- Postnatal depletion

Without proper diagnosis, women may be treated for depression when the underlying issue is thyroid dysfunction. Thyroid function tests (TSH, free T4) are a simple blood test — request one from your GP if you have significant fatigue, mood symptoms, or other symptoms described above.

**Treatment**

The hyperthyroid phase is usually managed conservatively (monitoring, beta-blockers for symptoms if needed). The hypothyroid phase may require levothyroxine (thyroid hormone replacement). Most cases resolve within 12–18 months, though approximately 20–30% of women develop permanent hypothyroidism.

**Who is at higher risk**

- Previous autoimmune thyroid disease
- Family history of thyroid disease
- Presence of thyroid antibodies (measurable in a blood test)
- Type 1 diabetes

Ask your GP for a thyroid function test at any point if your symptoms suggest this might be a contributing factor.',
  'health',
  'Lumira Editorial — reviewed against American Thyroid Association guidelines',
  true, true, 4,
  ARRAY['postpartum-thyroiditis', 'thyroid', 'hypothyroid', 'fatigue', 'postpartum-health'],
  true
),

(
  'postpartum-w12-building-attachment',
  'postpartum', 12,
  'Building Attachment: What the Research Actually Says',
  'Secure attachment is built over thousands of small moments — not one big thing you could miss.',
  '**What is attachment?**

Attachment theory, developed by John Bowlby and Mary Ainsworth, describes the deep emotional bond between a child and their primary caregiver — a bond that shapes the child''s sense of security, their ability to regulate emotions, and their relationships throughout life.

Secure attachment is not built in a single moment. It is built through the accumulation of thousands of ordinary interactions over the first years of life.

**The serve-and-return interaction**

The foundational mechanism of attachment is what Harvard''s Center for the Developing Child calls "serve and return." Your baby "serves" — a gesture, a sound, a look. You "return" — by responding, acknowledging, mirroring. This repeated exchange, across millions of interactions, builds the neural architecture of secure attachment and early language.

You are doing this every time you:
- Make eye contact and smile back when your baby looks at you
- Pick up your baby when they cry
- Narrate what you''re doing in a warm tone ("Now we''re putting on your clean vest")
- Respond to babbling with your own sounds

**What attachment research does not say**

It does not say:
- That you must be with your baby every moment
- That using childcare damages attachment
- That one "missed" interaction is harmful
- That postpartum depression prevents attachment (though it can make it harder, and is another reason to seek treatment)

Attachment is built through the general pattern of responsiveness over time, not through perfection in each moment.

**By 12 weeks**

By now, your baby knows your face, voice, and smell. They calm more readily in your arms than in a stranger''s. They track you across the room. This is attachment in action — and you built it, one response at a time.',
  'development',
  'Lumira Editorial — reviewed against Harvard Center on the Developing Child research summaries and Bowlby/Ainsworth attachment literature',
  true, true, 4,
  ARRAY['attachment', 'secure-attachment', 'serve-and-return', 'infant-development', 'bonding'],
  true
),

(
  'postpartum-w12-completing-fourth-trimester',
  'postpartum', 12,
  'Completing the Fourth Trimester: What Changes at Three Months',
  'Week 12 is not the end of postpartum — but it is a genuine turning point.',
  '**Why three months is a milestone**

The end of the fourth trimester — approximately 12 weeks — marks real neurological and developmental change for both you and your baby. This is not an arbitrary milestone.

**For your baby**

At around 12 weeks:
- The social smile is well established; your baby is a genuine interactive partner
- Periods of contentment and alertness are longer
- Colic (if present) typically resolves around weeks 12–16
- Sleep may begin to consolidate, though this varies widely
- Head control is significantly improved
- The intense, reflexive newborn has become an emerging personality

**For you**

- The acute hormonal storm of early postpartum has largely settled
- Your body''s gross structural healing is largely complete (though deep healing continues)
- If you have been breastfeeding, the mechanics are usually well established by now
- You likely have a better sense of your baby''s rhythms, cues, and temperament

**What three months is not**

Three months is not "back to normal." Postpartum recovery — physical, hormonal, neurological, and psychological — continues well beyond this point. The matrescence literature suggests full identity re-stabilisation takes approximately 3 years. Postpartum mood disorders can emerge or persist well into the first year.

The expectation that you should "have it together" by three months is both unrealistic and unkind.

**What to carry forward**

- Keep the relationships with your midwife, GP, and health visitor active
- Continue pelvic floor physiotherapy if you have not yet addressed it
- If your mental health has not been assessed, now is a good time
- Accept that the journey of becoming a parent is long, gradual, and richly worth the difficulty

You are not at the end. You are well into the beginning.',
  'wellness',
  'Lumira Editorial',
  true, true, 4,
  ARRAY['fourth-trimester', 'three-months', 'postpartum-milestone', 'development', 'recovery'],
  true
),

(
  'postpartum-w12-postpartum-planning-return',
  'postpartum', 12,
  'Planning Your Return to Work: A Practical and Emotional Checklist',
  'The logistics and the feelings — both deserve attention before your first day back.',
  '**Start earlier than you think**

Many parents leave work-return planning too late, which adds stress to an already complex transition. Ideally, practical planning begins 4–6 weeks before your return date.

**Childcare**

- Is your childcare arrangement confirmed, with a backup plan?
- Have you done settling-in sessions (most nurseries and childminders recommend 2–4 sessions of increasing length)?
- Does your childcare provider know about feeding (breast milk, formula, feeding preferences)?
- Do you have an emergency contact plan if childcare falls through?

**Feeding logistics**

- If breastfeeding and returning to work, have you established a pumping schedule?
- Does your workplace have a private space (not a toilet) and a fridge for milk storage?
- In the UK, you have a legal right to appropriate rest and facilities for expressing milk. Know your rights.
- Have you introduced your baby to a bottle (if needed) with enough time for acceptance? Some breastfed babies resist bottles when introduced too close to return-to-work.

**The emotional preparation**

- Have you talked to your manager about a phased return, flexible start, or adjusted schedule?
- Do you have a plan for the emotional difficulty of the first week?
- Have you given yourself permission to find it hard, even if part of you is glad to be back?

**On the day**

Leave extra time. Have a goodbye ritual that works for you and your baby. Acknowledge to your childcare provider that you may need a moment. Text a friend when you get to work.

And then: do the work you''re there to do. You were good at this before. You still are.',
  'relationships',
  'Lumira Editorial',
  true, true, 4,
  ARRAY['return-to-work', 'childcare', 'pumping-at-work', 'maternity-leave', 'working-parent'],
  true
)

ON CONFLICT (slug) DO NOTHING;
