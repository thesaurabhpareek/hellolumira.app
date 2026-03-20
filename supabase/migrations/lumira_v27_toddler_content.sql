-- =============================================================================
-- Lumira v27: Toddler Content — Feeding, Sleep, Health, Relationships, + Fills
-- =============================================================================
-- 22 articles filling missing/thin categories for the toddler stage (months 1-36).
-- Reviewed against AAP, NHS, WHO, NICE, ESPGHAN, CDC guidelines.
-- Legal: disclaimers present, no medical advice, culturally inclusive.
-- =============================================================================

INSERT INTO public.content_articles
  (slug, stage, week_or_month, title, subtitle, body, category, author,
   medically_reviewed, culturally_sensitive, reading_time_minutes, tags, is_published)
VALUES

-- ============================================================
-- CATEGORY: FEEDING
-- ============================================================

(
  'toddler-m13-picky-eating',
  'toddler', 13,
  'Why Toddlers Become Picky Eaters — and What the Science Says',
  'Food refusal at 13 months is a developmental stage, not a discipline problem. Here''s what''s really happening — and how to stay calm about it.',
  '**Why your confident eater just changed the rules**

If your toddler devoured everything at eight months and is now refusing foods they once loved, you are not alone — and you have not done anything wrong. Between 12 and 18 months, food neophobia (fear of new or unfamiliar foods) emerges in the majority of children worldwide. Research suggests this is likely an evolutionary protective mechanism: as toddlers became mobile enough to forage independently, wariness of unknown foods reduced the risk of accidental poisoning. Your toddler''s brain is doing exactly what it was designed to do.

Studies published in peer-reviewed nutrition journals estimate that food neophobia peaks between 18 and 24 months and, for most children, gradually decreases through the preschool years. It is not a character flaw, a phase to "fix," or a sign that your child will be a picky eater forever.

**The Division of Responsibility — a framework that changes everything**

One of the most robust and widely cited frameworks for feeding toddlers comes from registered dietitian and feeding therapist Ellyn Satter. Her Division of Responsibility (DOR) model, which has informed NHS and dietitian guidance internationally, proposes a clear boundary:

- The parent or caregiver is responsible for *what* food is offered, *when* it is offered, and *where* eating happens.
- The child is responsible for *whether* they eat and *how much* they eat.

When parents take on responsibility for whether a child eats — through coaxing, cajoling, pressure, or making separate "safe" meals — it frequently backfires. Research consistently shows that pressure at mealtimes is associated with greater food refusal and negative mealtime dynamics over time. Trusting your toddler''s hunger and fullness cues, while continuing to offer a variety of foods, gives them the autonomy they need to develop a healthy relationship with eating.

**Texture sensitivity is real**

Some toddlers are not simply being stubborn — they are genuinely more sensitive to certain textures, temperatures, or the mixing of foods on a plate. This is a normal variation in sensory processing. Gagging at a new texture is common and different from choking. If your toddler has significant, distressing reactions to textures across many foods and it is affecting growth or family mealtimes substantially, speak with your health visitor or GP, who may refer you to a paediatric dietitian or feeding specialist.

**What the evidence supports**

- **Repeated, low-pressure exposure works.** Research suggests it can take 10–15 exposures to a new food before a toddler accepts it. Continuing to place a food on the plate — without pressure to eat it — maintains exposure without conflict.
- **Eating together matters.** Children are more likely to try foods they see adults and older children eating. Family-style meals, where possible, are consistently supported by evidence.
- **Praise for eating can backfire.** Excessive praise ("You''re such a good boy for eating your broccoli!") can inadvertently communicate that eating certain foods is effortful or unpleasant, requiring reward.
- **Pressure increases refusal.** Multiple studies confirm that pressuring toddlers to eat is associated with reduced dietary variety, not greater acceptance.

**Celebrating cultural food diversity**

Toddlers around the world eat vastly different foods — spiced dals, fermented vegetables, fish broths, plantain, injera, congee — and thrive on them. If your family eats a culturally rich diet, there is no need to default to beige toddler food. Continue offering your family''s foods in age-appropriate textures. A toddler who grows up at a table where adults eat with enjoyment and variety has a significant advantage in developing adventurous eating.

If your family follows a vegetarian, vegan, halal, kosher, or other culturally or religiously informed diet, a paediatric dietitian can help ensure nutritional completeness, particularly for iron, zinc, and vitamin B12.

**What not to do (and why it matters)**

- Avoid making a separate "toddler-safe" meal at every sitting, as this reinforces the idea that the family meal is not for them.
- Avoid using screens or distraction to get food in — this disconnects eating from hunger and fullness cues.
- Avoid hiding vegetables in foods without the child''s knowledge for the long term — it may work briefly but does not build food acceptance.
- Avoid labelling your child as "picky" in front of them — identity labels tend to stick.

**When to speak to your child''s health team**

Contact your GP, health visitor, or paediatrician if:
- Your toddler is losing weight or not gaining weight appropriately
- They are eating fewer than 20 foods and the range is narrowing over time
- Mealtimes involve significant distress, gagging, or vomiting regularly
- You are concerned about nutritional gaps (particularly iron, calcium, or zinc)
- You feel mealtimes have become a significant source of family stress

A referral to a paediatric dietitian or feeding therapist can make a meaningful difference and is available through most healthcare systems.

*This article is for information only and is not a substitute for professional medical advice. Always consult your paediatrician, GP, or health visitor with concerns about your toddler''s eating or growth. Sources: Satter E (2000) Child of Mine: Feeding with Love and Good Sense; Cooke LJ et al (2003) Br J Nutr; AAP Nutrition Handbook; NHS Start4Life guidance.*',
  'feeding',
  'Lumira Medical Team',
  true, true, 6,
  ARRAY['picky eating','food neophobia','toddler nutrition','Ellyn Satter','feeding','mealtime'],
  true
),

(
  'toddler-m17-toddler-nutrition',
  'toddler', 17,
  'Feeding Your Toddler: A Practical Nutrition Guide',
  'What toddlers actually need nutritionally at 17 months — portions, key nutrients, meal ideas, and how to navigate the transition away from formula or toddler milk.',
  '**Toddler stomachs are small — and that''s normal**

At 17 months, your toddler''s stomach is roughly the size of their fist. This means portions that look tiny to you may be entirely appropriate for them. A common source of parental stress is expecting toddler portion sizes to resemble adult portions — they simply should not.

A useful starting guide (endorsed by paediatric dietitians and consistent with ESPGHAN toddler feeding guidelines) is to offer approximately one tablespoon of each food per year of age as a rough benchmark, accepting that intake will vary day to day and meal to meal. Toddlers are excellent regulators of energy intake across a day — even if individual meals look insufficient.

**Key nutrients at this stage**

The following nutrients deserve particular attention in toddler diets, as deficiency is common in many countries:

- **Iron.** Iron-deficiency anaemia is the most common nutritional deficiency in toddlers globally (WHO). After 12 months, breast milk and cow''s milk are poor sources of iron. Prioritise iron-rich foods: red meat, chicken, fish, eggs, lentils, chickpeas, beans, fortified cereals, tofu, and dark leafy greens. Pairing iron-rich plant foods with vitamin C (tomato, pepper, citrus) significantly improves absorption. Avoid giving large amounts of cow''s milk (over 400–500 ml/day) as this displaces iron-rich foods and inhibits iron absorption.
- **Calcium.** Supports bone development. Sources include full-fat cow''s milk, yoghurt, cheese, fortified plant milks, calcium-set tofu, tinned fish with bones, sesame/tahini, and broccoli.
- **Zinc.** Important for immune function and growth. Found in meat, shellfish, seeds, legumes, and wholegrains.
- **Omega-3 fatty acids.** Support brain development. Oily fish (salmon, sardines, mackerel) two portions per week is recommended by NHS and ESPGHAN. For families who do not eat fish, flaxseed, chia seeds, walnuts, and algae-based omega-3 supplements may be considered — discuss with your health visitor or GP.
- **Vitamin D.** The NHS recommends a daily supplement of 10 micrograms (400 IU) for all children aged 1–4 years, regardless of diet, as it is very difficult to obtain sufficient vitamin D from food alone in many climates.

**Finger foods and meals — what works at 17 months**

By 17 months, most toddlers have significant self-feeding skills and enjoy the autonomy of finger foods. A balance of finger foods and spoon-fed meals is appropriate. Good finger food options include:

- Soft-cooked vegetable pieces (broccoli florets, carrot batons, courgette)
- Small cubes of soft cheese or avocado
- Strips of cooked chicken, fish, or omelette
- Soft-cooked pasta shapes
- Soft fruit pieces (banana, mango, melon, soft pear)
- Toast fingers with nut butter (if no allergy) or hummus
- Legume-based foods such as soft-cooked lentils or smashed chickpeas

Continue to avoid foods that are choking hazards: whole grapes (halve or quarter them), whole cherry tomatoes (halve them), whole nuts, raw hard vegetables, whole berries for some toddlers, large pieces of tough meat, popcorn, and hard sweets.

**Ultra-processed foods — what the evidence says**

ESPGHAN, PAHO, and WHO have all issued guidance recommending that ultra-processed foods be limited or avoided in the first two years of life and minimised thereafter. Ultra-processed foods — defined by the NOVA classification as industrially manufactured products with multiple additives, emulsifiers, and ingredients not found in home cooking — are associated with higher sugar, salt, and saturated fat intake and reduced dietary diversity in children.

This does not mean your toddler can never have a biscuit or a packaged snack. It means building the foundation of their diet on minimally processed whole foods, reserving packaged items as occasional rather than daily choices. Many "toddler" snack products marketed specifically to this age group are high in added sugar and salt — checking labels is worthwhile.

**Milk at 17 months**

From 12 months, full-fat cow''s milk can be the main drink alongside water. The recommended amount is approximately 300–400 ml per day — enough to provide calcium without displacing food intake. Toddler formula or "growing-up milks" are not recommended by ESPGHAN, NHS, or AAP — they are not nutritionally necessary and are significantly more expensive than regular cow''s milk.

For families who do not use dairy (due to intolerance, allergy, cultural, or dietary preference), unsweetened, calcium-fortified soya milk is the closest nutritional alternative for toddlers. Other plant milks (oat, almond, coconut, rice) have lower protein and, in some cases, lower nutritional profiles — discuss with your GP or paediatric dietitian.

If you are still breastfeeding at 17 months, this is normal and beneficial in many cultures. WHO recommends continued breastfeeding alongside appropriate complementary foods for two years and beyond for families who wish to do so.

**When to speak to your child''s health team**

Contact your GP, health visitor, or paediatrician if:
- Your toddler appears pale, fatigued, or irritable — these can be signs of iron-deficiency anaemia
- Their weight gain has slowed or stalled
- You are concerned about nutritional adequacy on a restricted diet
- Your toddler has not transitioned well to family foods
- You would like a referral to a paediatric dietitian for tailored guidance

*This article is for information only and is not a substitute for professional medical advice. Always consult your paediatrician, GP, or health visitor with concerns about your toddler''s nutrition. Sources: ESPGHAN Committee on Nutrition (2017); WHO Global Nutrition Report; NHS Eatwell Guide (children); AAP Pediatric Nutrition Handbook.*',
  'feeding',
  'Lumira Medical Team',
  true, true, 7,
  ARRAY['toddler nutrition','iron','calcium','vitamin D','finger foods','ESPGHAN','feeding','17 months'],
  true
),

(
  'toddler-m22-cup-bottle-transition',
  'toddler', 22,
  'Moving On From the Bottle: A Gradual, Gentle Transition',
  'Most guidelines recommend weaning from the bottle by 18 months — but if you haven''t yet, here''s how to approach it calmly and compassionately at 22 months.',
  '**Why the bottle matters beyond just feeding**

For many toddlers, the bottle is not just a vessel for milk — it is a source of comfort, a sleep association, and a familiar object in a world full of change. Recognising this emotional component is essential to a gentle transition. Abrupt removal of the bottle is rarely necessary and can create significant distress.

That said, most major paediatric guidelines — including those from the American Academy of Pediatrics (AAP) and the NHS — recommend weaning from the bottle by around 12 to 18 months of age. If your toddler is 22 months and still using a bottle regularly, you are not alone, and it is not too late to transition with patience and sensitivity.

**Why prolonged bottle use matters**

The concerns around extended bottle use are primarily twofold:

- **Dental health.** Frequent and prolonged contact with milk or juice (particularly when a bottle is used to fall asleep or carried around throughout the day) significantly increases the risk of early childhood caries (tooth decay). Milk pools around the teeth and feeds bacteria that produce enamel-eroding acids. The AAP and American Academy of Pediatric Dentistry are clear that bottles should not be used as a sleep aid beyond infancy.
- **Iron status.** Toddlers who consume large amounts of cow''s milk (typically facilitated by bottle use) are at risk of iron-deficiency anaemia. Milk is a poor source of iron, and excessive milk intake displaces iron-rich foods. The AAP recommends no more than 400–500 ml (approximately 16 oz) of cow''s milk per day for toddlers, and bottle use tends to make limiting intake more difficult.

**Cup types — what works**

At 22 months, most toddlers are capable of drinking from:

- **Open cups** — the gold standard developmentally. Messy at first, but builds oral motor skills and is the most tooth-friendly option.
- **Straw cups** — a good transitional option that is easier than open cups but still appropriate for dental health.
- **Free-flow beakers (no-spill cups without a valve)** — recommended by NHS dentists over valve sippy cups, which require sucking action similar to a bottle.

Valve-type sippy cups, while convenient, are not recommended by dental health guidelines as a long-term solution — they prolong the sucking pattern associated with bottles.

**A gradual approach**

For a 22-month-old with an established bottle habit, a gradual, multi-week transition tends to work better than cold-turkey removal:

1. **Start with the easiest bottle.** Drop the mid-day bottle first, replacing it with a cup. Keep the bedtime or morning bottle for now.
2. **Make the cup special.** Let your toddler choose their own cup at the shop — personalisation increases buy-in.
3. **Change the bottle-to-sleep association first.** If the bedtime bottle is the hardest, adjust the bedtime routine so the bottle or cup of milk comes before teeth-brushing and the bath/story/song sequence — not as the final step before sleep.
4. **Water only in any remaining bottle.** If they insist on a bottle for comfort, transitioning the contents to water removes the dental and nutritional concerns while you work on the cup.
5. **Celebrate the transition.** Many families find a simple ritual — a "big-kid cup" celebration, or letting the toddler "post" the bottle into a box — helps mark the change positively.

**Attachment and cultural context**

In many cultures, extended bottle use is common and the bottle serves an important soothing function. The goal is not to shame families but to provide information about the oral health and nutritional risks so that informed decisions can be made. If your toddler uses the bottle primarily for comfort rather than nutrition, working with your health visitor to find alternative comfort strategies (a favourite toy, a specific song, a comfort cloth) can support the transition.

Extended breastfeeding beyond 12 or 22 months does not carry the same dental risks as bottle use, as breastfeeding requires different oral mechanics that do not result in milk pooling around teeth in the same way. Families who are still breastfeeding should discuss the specific dental context with their dentist.

**When to speak to your child''s health team**

Contact your GP, health visitor, or paediatrician if:
- Your toddler is consuming more than 500 ml of milk per day via bottle
- You have noticed visible changes to their tooth enamel (white spots, brown patches)
- The transition is causing significant distress after several weeks of gentle attempts
- You would like a referral to a paediatric dentist for dental health assessment

*This article is for information only and is not a substitute for professional medical advice. Always consult your paediatrician, GP, health visitor, or dentist with concerns about your toddler''s feeding or dental health. Sources: AAP Clinical Report on Oral Health (2014); American Academy of Pediatric Dentistry; NHS Start4Life; ESPGHAN.*',
  'feeding',
  'Lumira Medical Team',
  true, true, 6,
  ARRAY['bottle weaning','cup transition','toddler teeth','dental health','feeding','22 months'],
  true
),

-- ============================================================
-- CATEGORY: SLEEP
-- ============================================================

(
  'toddler-m14-sleep-regression-14m',
  'toddler', 14,
  'The 12–15 Month Sleep Regression: Why Your Good Sleeper Stopped',
  'If your toddler suddenly started waking at night or refusing naps around their first birthday, there are several compelling developmental reasons why — and it is temporary.',
  '**What is a sleep regression?**

A sleep regression is a period during which a child who has been sleeping reasonably well begins waking more frequently at night, resisting naps, or taking longer to fall asleep. The term is widely used among parents and health visitors, though it is worth noting that sleep development is not a straight line — all children have periods of disrupted sleep that tend to coincide with developmental leaps.

The 12-to-15-month period is one of the most commonly reported sleep disruption windows, and there are several well-supported developmental reasons for it.

**The developmental drivers**

- **Learning to walk.** The months around a toddler''s first steps are neurologically intense. The motor planning required for walking is processed during sleep — research has found that infants and toddlers often practise new motor skills during sleep, and the brain activity associated with motor learning can disrupt sleep architecture. Many parents notice that the period just before or after first steps coincides with nights of frequent waking.
- **Language explosion.** The 12-to-15-month window is typically when receptive language (understanding words) accelerates dramatically and some toddlers begin producing their first words. Language processing is cognitively demanding and may contribute to lighter or more disrupted sleep.
- **First molars.** The first molars typically emerge between 13 and 19 months and can be more uncomfortable than earlier teeth, due to their larger surface area. Teething discomfort can disrupt sleep and cause fussiness that parents may not immediately connect to dental eruption.
- **Separation anxiety peak.** Separation anxiety typically peaks between 10 and 18 months. At night, being in a separate room from caregivers can feel threatening to a toddler whose understanding of object permanence — the idea that people continue to exist when out of sight — is still developing.
- **Nap transition.** Most toddlers transition from two naps to one somewhere between 12 and 18 months. This transition is rarely smooth and can temporarily disrupt night sleep as the circadian rhythm adjusts.

**What to do (and what to avoid)**

During a regression, the instinct to do whatever gets everyone back to sleep fastest is understandable and human. However, introducing new sleep associations during a regression — such as nursing or feeding to sleep every waking, or bringing the toddler into the parental bed only during regressions — can extend the regression and create patterns that are harder to shift later.

This does not mean comfort is wrong. It means trying to offer comfort in a way that is consistent with your regular sleep approach. If you normally settle your toddler with a pat on the back and a calm voice, continue to do that — it may take longer during a regression, but consistency generally shortens them.

**Evidence-based strategies during this period**

- **Maintain the bedtime routine.** Consistent, predictable bedtime routines are one of the most robustly supported interventions in paediatric sleep research. A routine of bath, story, song, and calm goodnight — approximately 20–30 minutes — signals to the toddler''s brain that sleep is coming.
- **Keep wake windows in mind.** At 14 months, most toddlers need approximately 3–4 hours of wake time before their nap and 4–5 hours after their nap before bedtime. Overtiredness makes falling and staying asleep harder, not easier.
- **Preserve the nap.** Even if your toddler is fighting one nap, this is not necessarily the time to drop the remaining nap entirely. A temporary earlier nap time or shorter nap may help.
- **Respond with calm consistency.** Brief, reassuring check-ins for toddlers who are crying at night — without prolonged play or stimulation — help them feel safe without fully arousing them.

**When does it end?**

Most sleep regressions at this age last two to six weeks. If sleep disruption persists significantly beyond six weeks without improvement, it is worth discussing with your health visitor or GP to rule out other contributing factors such as discomfort, illness, or a need for adjusted sleep structure.

**A note on cultural context**

Sleep arrangements vary enormously across cultures. Room-sharing, bed-sharing with appropriate safety measures, and extended night nursing are common and practised safely in many parts of the world. If your family bed-shares, your sleep regression experience may look quite different — toddlers who sleep alongside caregivers typically wake frequently but resettle quickly with proximity. The evidence on safe bed-sharing practices (firm mattress, no alcohol or sedating medications, no smoking in the household) should be reviewed with your health visitor.

**When to speak to your child''s health team**

Contact your GP, health visitor, or paediatrician if:
- Sleep disruption has lasted more than six weeks with no improvement
- Your toddler seems in significant discomfort at night
- You are concerned about snoring, mouth breathing, or pauses in breathing during sleep (these can indicate sleep-disordered breathing)
- The sleep deprivation is significantly affecting your mental health or ability to function

*This article is for information only and is not a substitute for professional medical advice. Always consult your paediatrician or GP with concerns about your toddler''s sleep. Sources: AAP Task Force on Sudden Infant Death Syndrome; NHS Health Visitor Sleep Guidance; Mindell JA et al (2006) Sleep; Sadeh A (2011) Sleep Medicine Reviews.*',
  'sleep',
  'Lumira Medical Team',
  true, true, 6,
  ARRAY['sleep regression','toddler sleep','14 months','night waking','nap transition','walking'],
  true
),

(
  'toddler-m19-bedtime-battles',
  'toddler', 19,
  'Bedtime Battles: Why Toddlers Fight Sleep and What to Do',
  'Bedtime resistance at 19 months is developmentally normal — and almost universal. Here''s what''s driving it, and what the evidence says actually helps.',
  '**Why toddlers fight bedtime**

A toddler who fights sleep is not misbehaving — they are being entirely developmentally appropriate. At 19 months, several forces conspire to make bedtime challenging:

- **Increased autonomy and limit-testing.** Toddlers at this age are in the early stages of asserting independence. Bedtime — where they have no choice about stopping activity — is a prime territory for asserting "no."
- **Fear of missing out.** Toddlers do not yet have a reliable grasp of time. Going to sleep feels, at some level, like everything interesting will continue without them. This is not manipulation — it is a genuine cognitive and emotional experience.
- **Overtiredness.** Counterintuitively, an overtired toddler is harder to get to sleep. Cortisol — the stress hormone — rises with tiredness and creates a "second wind" that can make a toddler appear energised just when you need them to wind down.
- **Separation anxiety.** Still active at 19 months for many children, separation anxiety means that the prospect of being alone in a dark room feels genuinely threatening, not simply inconvenient.
- **Developmental leaps.** Language, motor skills, and social understanding are all advancing rapidly — the brain is busy, and slowing down is hard.

**What the evidence supports**

Paediatric sleep research consistently identifies a small number of evidence-based practices that reduce bedtime resistance:

- **A consistent, predictable bedtime routine.** This is the single most robustly evidenced recommendation in paediatric sleep research. A routine of 20–30 minutes — for example, bath, pyjamas, teeth, story, song, goodnight — is not just a nice tradition. It creates conditioned cues that the brain associates with sleep onset. A 2009 randomised controlled trial (Mindell et al) found that a consistent bedtime routine significantly reduced sleep onset time and night waking in toddlers.
- **An appropriate, consistent bedtime.** Most 19-month-olds need 11–14 hours of total sleep in 24 hours (AAP). A bedtime between 6:30 pm and 8:00 pm works for most families, depending on the morning wake time and nap schedule. Bedtimes that drift late — often from a desire to spend time with a toddler after work — can compound overtiredness and make resistance worse.
- **Limiting stimulation before bed.** Screens, rough play, and exciting activities in the hour before bed raise arousal and make settling harder. A calm, dim environment signals to the brain that sleep is approaching.
- **Offering limited, structured choice.** Giving a toddler the illusion of control ("Do you want the blue pyjamas or the stripy ones?") can reduce power struggles. The boundary is clear — it is bedtime — but the toddler has a stake in how it unfolds.

**The "curtain call" problem**

Many toddlers develop a repertoire of delay tactics at bedtime: requests for water, another story, a cuddle, a trip to the toilet, a snack. These are sometimes genuine needs and sometimes tests of the limit. A useful approach is offering one clearly defined post-bedtime request. Research by Friman et al (1999) found that giving children one token to exchange for a legitimate post-bedtime request significantly reduced curtain calls while preserving the child''s sense of agency.

**Flexible vs consistent approaches across cultures**

It is worth acknowledging that the Western model of a single child sleeping alone in a dark room at a fixed early bedtime is not universal. In many Mediterranean, South Asian, East Asian, and Latin American families, children go to sleep at the same time as adults, often in shared spaces. Sleep problems as defined by Western clinical frameworks are reported less frequently in cultures with later, more flexible bedtimes and co-sleeping arrangements. Neither approach is inherently right or wrong — what matters is that the family''s sleep arrangements feel sustainable and supportive of both the child''s and caregivers'' wellbeing.

**When to speak to your child''s health team**

Contact your GP, health visitor, or paediatrician if:
- Bedtime resistance takes more than an hour every night and has persisted for more than a month
- Your toddler appears distressed beyond normal protest
- You are concerned about snoring, breathing pauses, or restless sleep
- Sleep deprivation is significantly affecting your own mental health

*This article is for information only and is not a substitute for professional medical advice. Always consult your paediatrician, GP, or health visitor with concerns about your toddler''s sleep. Sources: AAP (2016) Healthy Sleep Habits; Mindell JA et al (2009) Sleep; Friman PC et al (1999) Pediatrics; NHS Sleep advice for toddlers.*',
  'sleep',
  'Lumira Medical Team',
  true, true, 5,
  ARRAY['bedtime battles','toddler sleep','sleep resistance','19 months','bedtime routine','sleep tips'],
  true
),

(
  'toddler-m25-crib-to-bed',
  'toddler', 25,
  'Moving from Cot to Bed: Timing, Safety, and Strategies',
  'There''s no single right time to transition from cot to bed — but most children are ready between two and three years. Here''s how to navigate it safely and smoothly.',
  '**When is the right time?**

The transition from cot to bed is one that parents often feel pressure to make earlier than necessary. The honest answer from paediatric sleep specialists is: there is no universal right time, and many children transition too early.

Most children manage the cot-to-bed transition most easily between 2.5 and 3.5 years. At this age, they have enough language and cognitive development to understand "stay in your bed" as a rule, and enough emotional regulation to follow it most of the time. Transitioning at 22–24 months — while developmentally common — often coincides with the height of toddler limit-testing and can result in months of the child leaving their room repeatedly.

The most common practical trigger for the transition is a child climbing out of the cot — at which point the cot becomes a safety hazard. Other triggers include a new sibling needing the cot, or the child expressing readiness.

**Safety considerations**

- **Bed rails.** For toddlers who roll in sleep, a temporary bed rail on the side of the bed is recommended until they are reliably used to the bed''s edges. Ensure any rail used is specifically designed for toddlers and installed correctly — bed rails can present entrapment hazards if improperly fitted.
- **Mattress height.** Lower the mattress to floor level initially, or use a floor mattress, to minimise fall risk.
- **Room safety.** Before the cot goes, ensure the room is safe for independent exploration, because a toddler in a bed can get up at night unsupervised. Secure furniture to walls, remove choking hazards, use a stair gate at the bedroom door or top of stairs.
- **Darkness and door.** A slightly open door or a dim nightlight may ease the transition for children who find darkness frightening. Motion-sensitive nightlights that turn on only when the child moves are a practical option.

**The sleep disruption that often follows**

Many families experience a temporary worsening of sleep in the weeks after the transition — increased night waking, early rising, or frequent trips out of the new bed. This is common and, for most children, resolves within two to four weeks with consistency.

Strategies that help:
- **Keep the bedtime routine identical.** Continuity signals to the child''s brain that the same expectations apply in the new bed.
- **Return them calmly and without extended engagement.** When a toddler leaves their room, a brief, calm, consistent return with minimal interaction ("It''s sleep time. Back to bed.") is more effective than lengthy explanations or negotiations.
- **A reward chart may help.** A simple visual sticker chart for "staying in bed until the sun comes up" can motivate toddlers who are verbal enough to understand it.

**Room-sharing and cultural practices**

In many cultures, children do not transition from cot to their own bed at all — they transition into the family bed or continue in a shared room. Room-sharing (in the same room but separate sleep surfaces) is recommended by the AAP as protective against SIDS through 12 months, and many families continue beyond this period by preference. There is nothing developmentally harmful about a toddler sharing a room with siblings or parents, and in many parts of the world this remains the norm through childhood.

If your family co-sleeps, the "transition" may be less of a distinct event and more of a gradual shift over time. Your health visitor can offer guidance tailored to your family''s specific setup.

**When to speak to your child''s health team**

Contact your GP, health visitor, or paediatrician if:
- Sleep disruption after the transition has lasted more than four to six weeks without improvement
- Your child is regularly leaving their room and it is unsafe to do so
- You have concerns about your child''s sleep quality or duration
- The transition is significantly affecting family functioning

*This article is for information only and is not a substitute for professional medical advice. Always consult your paediatrician, GP, or health visitor with concerns about your toddler''s sleep or safety. Sources: AAP Safe Sleep Guidelines; NHS Sleep and your toddler; American Academy of Sleep Medicine toddler sleep guidelines.*',
  'sleep',
  'Lumira Medical Team',
  true, true, 5,
  ARRAY['cot to bed','toddler sleep','bed transition','sleep safety','25 months','room sharing'],
  true
),

-- ============================================================
-- CATEGORY: HEALTH
-- ============================================================

(
  'toddler-m13-wellchild-visits',
  'toddler', 13,
  'Your Toddler''s Health Checks: What Happens at 12, 15, and 18 Months',
  'The well-child checks in the first year and a half of toddlerhood are some of the most important — covering development, immunisations, growth, and your questions.',
  '**Why these checks matter**

The well-child visits at 12, 15, and 18 months are not just for vaccinations — they are structured developmental surveillance appointments that allow your health visitor, GP, or paediatrician to monitor your toddler''s physical growth, developmental progress, and overall wellbeing. They are also an opportunity for you to raise any concerns in a supported environment.

Different countries deliver these checks differently — in the UK, the health visitor-led 12-month review is a key contact, followed by the 2–2.5 year review. In the US, AAP-recommended well-child visits occur at 12, 15, and 18 months. In Australia, the Maternal and Child Health service conducts checks at 12 months and 18 months. Ask your healthcare provider which checks are standard in your area.

**What is assessed at these visits**

- **Growth monitoring.** Your toddler''s weight, height, and head circumference are plotted on a growth chart. Tracking the trend over time matters more than any single measurement. A child can be healthy at the 3rd or 97th percentile — what clinicians look for is whether growth is following a consistent curve.
- **Developmental surveillance.** Clinicians assess whether your toddler is meeting key developmental milestones across four domains:
  - *Motor development* — pulling to stand, cruising, independent walking, pincer grip, building towers of blocks
  - *Language and communication* — babbling, pointing, first words, following simple instructions, responding to their name
  - *Social and emotional development* — social smile, waving, pointing to share interest (joint attention), appropriate stranger awareness
  - *Cognitive development* — object permanence, problem-solving, imitative play
- **Vision and hearing screening.** These may be formally assessed at this stage or flagged for further testing if concerns arise. Parents are often the first to notice signs of hearing or vision concerns.
- **Autism spectrum screening.** In some systems, a standardised autism screening tool (such as the M-CHAT-R/F in the US) is administered at the 18-month check. This is a screening tool only — a positive screen does not mean a diagnosis.
- **Immunisations.** Vaccines due in this window vary by country. In the UK, the MMR (measles, mumps, rubella) and Hib/MenC vaccines are typically given at around 12 months, with boosters following. In the US, the 12, 15, and 18-month visits include the MMR, varicella, hepatitis A, influenza, and DTaP boosters depending on the schedule. Your healthcare provider will advise on exactly which vaccines are due.

**Questions to consider bringing to the visit**

Well-child visits can feel rushed. Writing down your questions in advance helps ensure you cover what matters to you. Consider:
- Is my toddler''s language developing appropriately?
- Are there foods I should be introducing or avoiding?
- How much sleep should they be getting?
- Is their behaviour (tantrums, separation anxiety) within the normal range?
- Are there safety issues I should know about?
- What are the signs I should come in urgently between scheduled visits?

**When to raise concerns between appointments**

You do not need to wait for a scheduled check if you are concerned. The NHS 111 service (UK), your GP surgery, or your paediatrician''s office can advise on whether concerns need same-day attention. Trust your instincts — parents often notice developmental changes before formal assessment does.

**When to speak to your child''s health team**

Contact your GP, health visitor, or paediatrician promptly if, at any point around this age, your toddler:
- Is not pointing to things to show interest by 12 months
- Has no words by 16 months
- Is not walking by 18 months
- Has lost skills they previously had (regression in language or motor development)
- Is not making eye contact or responding to their name consistently

*This article is for information only and is not a substitute for professional medical advice. Always consult your paediatrician, GP, or health visitor with concerns about your toddler''s health or development. Sources: AAP Bright Futures (2022); NHS Health Visitor Schedule; CDC Developmental Milestones; M-CHAT-R/F (Robins et al, 2014).*',
  'health',
  'Lumira Medical Team',
  true, true, 6,
  ARRAY['well-child visit','developmental check','immunisations','growth monitoring','12 months','15 months','18 months','milestones'],
  true
),

(
  'toddler-m17-dental-health',
  'toddler', 17,
  'Your Toddler''s Teeth: Starting Good Dental Habits Early',
  'The habits you build around dental care in toddlerhood lay the foundation for a lifetime of oral health. Here''s what the evidence recommends.',
  '**Why toddler dental health matters more than you might think**

Early childhood caries (tooth decay) is the most common chronic disease in children worldwide — more common than asthma (WHO). Despite being preventable, it causes pain, infection, and sometimes procedures requiring general anaesthesia in very young children. The habits established in toddlerhood — brushing, diet, fluoride exposure, dental visits — have a measurable impact on both primary and permanent teeth.

Primary ("baby") teeth matter even though they will eventually fall out. They hold space for permanent teeth, support speech and language development, and allow proper chewing for nutrition. Losing them early to decay can affect jaw development and permanent tooth positioning.

**When should your toddler first see a dentist?**

The American Academy of Pediatric Dentistry (AAPD) and the AAP both recommend a child''s first dental visit by their first birthday — or within six months of the first tooth erupting, whichever comes first. In the UK, NHS dental care is free for children, and the NHS recommends taking children to the dentist as soon as their first tooth appears and continuing regularly thereafter.

Many families delay the first dental visit until age two or three, often believing there is nothing to check before then. In fact, the first visit familiarises the child with the dental environment, allows the dentist to check for early signs of decay or enamel defects, and gives parents guidance on brushing technique, diet, and fluoride.

**Brushing: technique and timing**

- Brush twice daily — once after breakfast and once before bed (the bedtime brush is most important, as saliva flow decreases during sleep, reducing the mouth''s natural protection).
- Use a small, soft-bristled toothbrush appropriate for toddler mouths.
- Children cannot brush effectively without parental help until around age 7–8 — parents should assist rather than simply supervise brushing at this age.
- Use a small amount of fluoride toothpaste. In the UK, the NHS recommends a smear for under-3s and a pea-sized amount from age 3. In the US, the AAP recommends a rice grain-sized amount for children under 3. Confirm current guidance with your dentist, as recommendations are periodically updated.
- Spit, do not rinse — rinsing immediately after brushing washes away the protective fluoride film.

**Fluoride: why it matters**

Fluoride strengthens tooth enamel and has a well-established evidence base for preventing decay. The UK NHS, AAP, and WHO all support appropriate fluoride use in toddlers. Concerns about fluoride are common among parents — it is worth knowing that the amounts in age-appropriate toothpaste are safe and beneficial. The risk of fluorosis (white spots on permanent teeth from excessive fluoride) is why amounts are age-adjusted, not a reason to avoid fluoride entirely.

In areas without fluoridated water, fluoride supplements may be discussed with your dentist.

**Diet and teeth**

- Limit free sugars (sugar added to foods and drinks, and sugars naturally present in fruit juice, honey, and syrups). Sugars feed the bacteria that produce enamel-eroding acids.
- Fruit juice — even 100% fruit juice — is not recommended as a regular drink for toddlers by NICE or the AAP. Water and milk are the tooth-friendly drinks.
- Never allow a toddler to fall asleep with a bottle of milk, juice, or formula. Milk pooling around teeth during sleep is a leading cause of early childhood caries.
- Dried fruit, while nutritious, is sticky and high in sugar — offer it as part of a meal rather than as a snack, and follow with water.

**Cultural context**

In many cultures, sharing food from adult utensils or pre-chewing food is standard practice. It is worth knowing that dental caries-causing bacteria (primarily Streptococcus mutans) can be transmitted from adult to child via saliva — sharing spoons or pre-chewing food may transfer these bacteria. This is shared as information rather than judgement; the impact is reduced significantly by good child dental hygiene practices.

Traditional diets across many cultures contain fermented foods, spiced dishes, and minimal added sugar — these are generally supportive of good dental health. The main dental risks come from added sugars in processed foods and drinks that have become widespread in many communities.

**When to speak to your child''s health team**

Contact your dentist, GP, or health visitor if:
- You notice white spots, brown patches, or any visible changes on your toddler''s teeth
- Your toddler complains of tooth discomfort or is reluctant to eat hard foods
- Your toddler has not yet had a dental check
- You have questions about fluoride supplementation in your area

*This article is for information only and is not a substitute for professional medical advice. Always consult your dentist, paediatrician, or health visitor with concerns about your toddler''s dental health. Sources: AAPD Guideline on Periodicity (2022); AAP Bright Futures; NHS Dental Health in Children; WHO Oral Health (2020); NICE Public Health Guidance PH55.*',
  'health',
  'Lumira Medical Team',
  true, true, 6,
  ARRAY['toddler teeth','dental health','brushing','fluoride','first dental visit','tooth decay','17 months'],
  true
),

(
  'toddler-m22-common-illnesses',
  'toddler', 22,
  'Common Toddler Illnesses: What to Expect and When to Worry',
  'Toddlers — especially those in daycare — get a lot of illnesses. Most are normal immune-building experiences. Here''s what to expect, and which symptoms need urgent attention.',
  '**Why toddlers get ill so often**

It is entirely normal for a toddler in daycare or nursery to have 8–12 respiratory illnesses per year (NHS, AAP). This is not a sign of poor immune function — it is the immune system doing exactly what it is supposed to do, building memory against the viruses it encounters. Most viral illnesses in toddlers are self-limiting and resolve within five to seven days without specific treatment.

The toddler immune system is still maturing. Maternal antibodies transferred during pregnancy begin to wane after around six months, and it takes several years for children to build their own comprehensive immune memory. This is why the first two to three years of daycare attendance are typically the most illness-heavy — things do improve.

**Common toddler illnesses: what to know**

- **Upper respiratory infections (colds).** Caused by rhinovirus and dozens of other viruses. Symptoms include runny nose, mild cough, low-grade fever, and irritability. Treatment is supportive: hydration, rest, nasal saline drops if congested, and fever management as needed. Antibiotics do not treat viral infections and should not be given for straightforward colds.

- **Croup.** A viral infection causing swelling of the larynx and trachea, characterised by a distinctive barking cough (often described as a seal bark) and, in more severe cases, a high-pitched sound when breathing in (stridor). Croup typically worsens at night. Mild croup can often be managed at home with exposure to cool night air or steam from a shower. **Moderate to severe croup — characterised by stridor at rest, significant respiratory distress, or bluish colouring around the lips — requires emergency care.** Your GP or NHS 111 can guide you on severity.

- **Hand, foot, and mouth disease.** A highly contagious viral illness (usually caused by Coxsackievirus) common in toddlers. Symptoms include fever, followed by sores in the mouth and a rash or blisters on the hands, feet, and sometimes buttocks. It is usually mild and self-limiting within seven to ten days. It spreads easily in nurseries — keep your toddler home during the acute phase and practise good hand hygiene. There is no specific treatment; focus on keeping your toddler comfortable and hydrated.

- **Ear infections (otitis media).** Common in toddlers due to the anatomy of the Eustachian tube, which is shorter and more horizontal than in adults. Signs include ear pulling, irritability, disturbed sleep, and sometimes fever. Most acute middle ear infections in children over two years resolve without antibiotics (NICE guidelines CG60). Your GP will assess whether watchful waiting or antibiotics is appropriate based on age, severity, and other clinical factors. Recurrent ear infections warrant discussion with your GP about referral for hearing assessment.

- **Gastroenteritis.** Vomiting and diarrhoea caused by viral (usually norovirus or rotavirus) or bacterial infection. The primary risk in toddlers is dehydration. Signs of dehydration include a dry mouth, no tears when crying, reduced wet nappies or trips to the toilet, sunken eyes, and unusual lethargy. Oral rehydration solutions (such as Dioralyte in the UK) can help replace lost fluids and electrolytes — discuss use with your GP or health visitor. Plain water alone does not replace electrolytes adequately in significant gastroenteritis.

**NICE fever guidance — what it means in practice**

NICE (CG160) provides clear guidance on fever assessment in children. Fever itself is not dangerous — it is a normal immune response. The concern is not the number on the thermometer but the overall appearance and behaviour of the child:

- **Low risk:** Your toddler is alert, responsive, has normal skin colour, and is not showing signs of dehydration. Can be monitored at home with regular review.
- **Intermediate risk:** Fever over 39°C (102.2°F), not responding normally, has a dry mouth, reduced wet nappies. Contact your GP or NHS 111.
- **High risk — seek emergency care immediately:** High-pitched or continuous crying, non-blanching rash, difficulty breathing, blue or pale lips, severe lethargy or unresponsiveness, fever in a child under three months, or fever that has lasted five or more days.

Always follow the specific guidance of your healthcare provider regarding fever management, as recommendations may be updated.

**When antibiotics are not needed**

Most toddler illnesses — including most ear infections, sore throats, and all colds and flu — are caused by viruses, which do not respond to antibiotics. Antibiotic resistance is a growing global public health concern. Unnecessary antibiotic use in childhood is associated with disruption of the gut microbiome and does not speed recovery from viral illness. If your GP does not prescribe antibiotics, it is usually because the evidence does not support their use, not because your concern has not been taken seriously.

**When to speak to your child''s health team**

Seek emergency care immediately if your toddler has:
- A non-blanching rash (press a glass to it — if it does not fade, call 999/112/911)
- Difficulty breathing, visible ribs when breathing, or blue around the lips
- Unusual limpness, difficulty waking, or severe distress
- Signs of severe dehydration

Contact your GP, NHS 111, or equivalent urgently if:
- Fever has lasted more than five days
- Your toddler is getting worse rather than better after three to four days
- You are concerned about ear discomfort, significant breathing difficulty, or unusual symptoms

*This article is for information only and is not a substitute for professional medical advice. Always consult your paediatrician, GP, or health visitor with concerns about your toddler''s health. In an emergency, call your local emergency number immediately. Sources: NICE CG160 (Fever in under-5s); NICE CG60 (Otitis media); NHS toddler illness guidance; AAP Red Book; WHO.*',
  'health',
  'Lumira Medical Team',
  true, true, 7,
  ARRAY['toddler illness','croup','ear infection','hand foot mouth','fever','NICE guidelines','common illnesses','22 months'],
  true
),

(
  'toddler-m25-vision-hearing',
  'toddler', 25,
  'Toddler Vision and Hearing: Checks That Matter and Signs to Watch',
  'Hearing and vision problems in toddlers can be subtle — and easy to miss. Here''s what is assessed at the two-year check and what signs should prompt an earlier review.',
  '**Why early detection matters so much**

Vision and hearing are foundational to almost every aspect of early development — language acquisition, social interaction, cognitive development, and literacy. Problems in either area that go undetected can have cascading effects that are harder to address the longer they remain unidentified.

The good news is that toddlers are remarkably adaptable, and early intervention — whether glasses, hearing aids, speech therapy, or other support — is highly effective when started early. This is why developmental surveillance at the two-year check includes assessment of both senses.

**Hearing: what is assessed and why**

Most babies in countries with universal newborn hearing screening (including the UK, US, Australia, and much of Europe) have their hearing tested at birth. However, some hearing losses are progressive and may not be present at birth — and a normal newborn screen does not rule out hearing problems that develop later.

In the toddler years, hearing assessment is typically conducted by a health visitor or audiologist. Methods include:

- **Distraction testing** in younger toddlers.
- **Visual reinforcement audiometry (VRA)** — the child turns to sounds and is rewarded with a visual stimulus.
- **Play audiometry** — the child performs a simple task (such as placing a block in a bucket) each time they hear a sound.
- **Otoacoustic emissions (OAEs) and tympanometry** — used to assess middle ear function and the cochlea, particularly if glue ear (fluid in the middle ear) is suspected.

Glue ear (otitis media with effusion) is common in toddlers and one of the most frequent causes of mild to moderate hearing loss. It often resolves on its own but can cause speech and language delays if prolonged. Your GP can look in your toddler''s ears and refer for audiological assessment if concerned.

**Signs that may indicate a hearing concern**

- Not responding to their name consistently by 12 months
- Not turning toward sounds from across a room
- Delayed or limited speech and language development
- Speaking unusually loudly
- Appearing to hear well some days and not others (which may indicate glue ear, which fluctuates)
- Pulling at ears frequently (though this can also be habitual or related to teething)
- Not following simple instructions when your face is not visible

**Vision: what is assessed**

The two-year developmental review typically includes observation of visual behaviour — whether the child makes eye contact, tracks moving objects, reaches accurately, and shows appropriate interest in pictures and faces.

Formal vision testing in toddlers is challenging because they cannot read a chart. Methods include:

- **Cover testing** — covers one eye to check for a squint (strabismus).
- **Red reflex examination** — a light is shone into the eye to check for cataracts, tumours, or other structural problems.
- **Observation of visual behaviour** — does the child tilt their head, close one eye, or sit very close to screens?

**Amblyopia (lazy eye)** — a condition where one eye does not develop normal visual acuity — affects approximately 2–4% of children. It is treatable if detected early (typically before age 7) but progressively harder to treat as the brain''s visual pathways mature. Early detection is the critical window.

**Signs that may indicate a vision concern**

- Eyes that appear to turn in, out, up, or down (squint/strabismus)
- Eyes that are not aligned consistently
- Sitting very close to screens or books
- Tilting or turning the head to look at things
- Excessive blinking or rubbing of eyes
- Sensitivity to light
- A white reflection in the pupil in photographs (this should be assessed promptly — it can rarely indicate a serious eye condition)

**Cultural context and access**

Families from communities with limited healthcare access, or those who do not routinely attend well-child appointments, may miss the standard screening checks. If your toddler has not had a formal hearing or vision check, raising this with your GP or health visitor will ensure a referral is made. Community health workers and outreach services in many areas can support families who face barriers to attendance.

**When to speak to your child''s health team**

Contact your GP, health visitor, or paediatrician promptly if:
- You notice any of the vision or hearing signs listed above
- Your toddler has a speech or language delay that has not been investigated
- You have any concern about how your toddler is seeing or hearing
- Your toddler has had recurrent ear infections (which can affect hearing)
- A white reflection appears in one or both pupils in photographs

*This article is for information only and is not a substitute for professional medical advice. Always consult your paediatrician, GP, or health visitor with concerns about your toddler''s vision or hearing. Sources: NHS Newborn and Infant Physical Examination Programme; AAP Bright Futures vision and hearing guidance; RANZCO early childhood vision guidelines.*',
  'health',
  'Lumira Medical Team',
  true, true, 6,
  ARRAY['toddler vision','toddler hearing','squint','glue ear','amblyopia','developmental check','25 months'],
  true
),

-- ============================================================
-- CATEGORY: RELATIONSHIPS
-- ============================================================

(
  'toddler-m14-tantrums-relationship',
  'toddler', 14,
  'Tantrums and Your Relationship: Staying United When Parenting Gets Hard',
  'Toddler tantrums put pressure on even strong partnerships. Here''s why parenting disagreements are normal — and how to align without having to agree on everything.',
  '**Why tantrums stress couples**

A screaming toddler on a supermarket floor affects more than just the shopping trip. Tantrums are one of the most common sources of parenting conflict in relationships during the toddler years. The reasons are both practical and deep:

- Each parent typically brings a different model of discipline from their own childhood.
- Tantrums trigger different emotional responses — one parent may feel embarrassed, another may feel guilty, another may feel irritated.
- Being overridden in the moment — when one parent contradicts the other''s stated limit — is deeply frustrating and erodes confidence.
- Sleep deprivation (near-universal with toddlers) reduces emotional regulation in adults as much as in children.
- The division of caregiving responsibilities can be unequal, meaning one partner carries more of the emotional weight of behavioural management.

Research on relationship satisfaction consistently shows a drop following the birth of a child, with a further dip during the toddler years — a period when behavioural challenges peak and parental disagreements about discipline tend to surface. This is normal. Recognising it does not make it easier, but it helps to know you are not alone.

**You don''t have to agree on everything — but consistency matters**

A common misconception is that partners must share identical discipline philosophies to parent effectively. They do not. Research in developmental psychology suggests that what matters for children is not uniformity between parents, but predictability within each parent. A toddler can adapt to different rules with different people — they do this naturally with nursery staff, grandparents, and childminders.

What genuinely creates difficulty for toddlers is being actively contradicted in the moment — when one parent overrides the other''s stated limit in front of the child. This is confusing for the toddler (which adult''s reality is real?) and corrosive for the adult relationship.

**A framework for navigating differences**

- **Discuss discipline approaches privately, not during a tantrum.** The moment of a meltdown is not the moment to debate strategy.
- **Agree on a small number of shared non-negotiable limits** — the ones that are about safety or significant values. Everything else can have some variation between parents.
- **Use a "back each other up, debrief later" approach.** When one parent has set a limit, the other supports it in the moment — even if they disagree — and raises it privately afterwards.
- **Acknowledge that different cultural backgrounds shape parenting instincts.** If one parent grew up in a household where certain discipline methods were standard and the other did not, this needs a careful, respectful conversation about values — not assumptions.

**Different cultural frameworks on discipline**

Parenting approaches vary significantly across cultures and are deeply shaped by cultural values. Collectivist cultures may emphasise family harmony and social belonging; individualist cultures may emphasise autonomy and self-expression. Authoritative parenting (warm but with clear limits) has a robust evidence base for child outcomes across many cultural contexts — but how warmth and limits are expressed varies enormously. Physical punishment is clearly contraindicated by current research evidence and is illegal in a growing number of jurisdictions. Beyond this, there is legitimate variation in how families navigate discipline, and cultural sensitivity is important.

**When you feel like you''re parenting alone**

If one partner feels the primary burden of discipline and emotional management of the toddler falls entirely on them, this is worth naming explicitly. Unequal division of the emotional and practical labour of parenting is a significant source of resentment in relationships. A conversation — ideally outside of a stressful moment — about how responsibilities are divided can open a more sustainable negotiation.

**When to speak to your child''s health team**

Contact your GP, health visitor, or a family therapist if:
- Discipline disagreements are escalating into significant conflict in your relationship
- You are concerned about the emotional wellbeing of either partner
- You would like support in developing a shared approach to behaviour management
- You have concerns about any discipline practices being used with your toddler

*This article is for information only and is not a substitute for professional medical advice. Always consult your GP, health visitor, or a qualified family therapist with concerns about your relationship or your toddler''s behaviour. Sources: Gottman JM (2011) Raising an Emotionally Intelligent Child; AAP Discipline guidance; NSPCC guidance on positive parenting.*',
  'relationships',
  'Lumira Medical Team',
  true, true, 5,
  ARRAY['tantrums','parenting relationship','couple','discipline','parenting conflict','14 months'],
  true
),

(
  'toddler-m19-sibling-prep',
  'toddler', 19,
  'Preparing Your Toddler for a New Baby: What Works and What Doesn''t',
  'A new sibling is a huge change for a toddler. With developmentally appropriate preparation and realistic expectations, the transition can be smoother for everyone.',
  '**What a 19-month-old actually understands**

At 19 months, your toddler''s grasp of abstract concepts — like a baby growing inside a bump or the idea that a new person will soon join the family — is limited. They live very much in the present moment. Lengthy explanations of what is coming are less useful than short, simple, repeated conversations and concrete experiences.

A useful benchmark: explain the new baby roughly in terms your toddler already understands. "A baby is growing in mummy''s tummy. The baby will come and live with us. The baby will be very small." Repetition and physical books that show baby siblings can be more effective than abstract explanation.

**What does and doesn''t work in preparation**

*What can help:*
- **Reading books together** about new siblings (widely available in many languages and cultural contexts)
- **Letting your toddler touch and talk to the bump** — building a sense of connection ahead of arrival
- **Visiting a friend with a new baby** so your toddler has a concrete reference point for what "small baby" means
- **Involving your toddler in gentle preparations** — choosing a toy for the baby, helping set up the nursery
- **Gradual changes before the birth** — if the toddler will move to a new room or bed, making that change several months before the baby arrives avoids the toddler associating the change with displacement
- **Using the language "our baby"** rather than "mummy and daddy''s baby"

*What typically doesn''t work:*
- **Detailed or lengthy explanations** — cognitively out of reach at this age
- **Promising the baby will be a playmate immediately** — newborns are not interesting to a toddler in the way an older child would be
- **Telling the toddler they are "the big one now"** and should behave accordingly — this can backfire and create pressure
- **Expecting the toddler to be excited** — ambivalence and even apparent indifference are normal responses

**Regression: a normal, temporary response**

After the birth of a sibling, regression in a toddler is extremely common and normal. Your 19-month-old may begin seeking a bottle again, asking to be carried more, using babytalk, having more accidents if recently toilet trained, or sleeping more poorly. This is not a problem to solve — it is a signal that your toddler is processing a significant change.

The most effective response to regression is to meet it without fanfare. If your toddler wants to be carried, carry them. If they want a bottle, give them one. Meeting the regressed need briefly and warmly — while continuing to offer age-appropriate engagement — typically resolves regression within a few weeks.

**Protected one-to-one time**

Research on sibling adjustment consistently identifies protected one-to-one time with each child as one of the most helpful factors. Even 10 to 15 minutes of undivided, phone-free attention on the older child''s terms each day makes a significant difference to adjustment.

**Cultural rituals and traditions**

Many cultures have meaningful traditions around welcoming a new sibling — naming ceremonies, blessings, special roles for the older child, family gatherings. Including the toddler in whatever cultural rituals your family practises gives them a sense of significance and belonging in the new family configuration.

In cultures where extended family are closely involved in childcare, the practical and emotional transition may look different. Grandparents, aunts, uncles, and family friends stepping in to give the older child attention and continuity during the newborn period can be enormously helpful.

**When to speak to your child''s health team**

Contact your GP, health visitor, or a child and family specialist if:
- Regression is severe and prolonged (lasting beyond two to three months)
- Your toddler is showing significant aggression toward the baby
- You are concerned about your toddler''s emotional wellbeing
- You would like support in managing the family adjustment

*This article is for information only and is not a substitute for professional medical advice. Always consult your health visitor, GP, or a qualified family therapist with concerns about your children''s adjustment. Sources: Dunn J (1983) Sibling relationships in early childhood; NHS Health Visitor guidance on sibling adjustment; AAP developmental guidance.*',
  'relationships',
  'Lumira Medical Team',
  true, true, 5,
  ARRAY['new baby','sibling preparation','toddler regression','family adjustment','19 months','sibling'],
  true
),

(
  'toddler-m25-multicultural-parenting',
  'toddler', 25,
  'Raising a Toddler Across Two Cultures: What Parents Need to Know',
  'Navigating two cultural identities, two languages, and sometimes two sets of family expectations is genuinely complex. Here''s what the evidence says — and why it''s worth the effort.',
  '**The gift and the challenge of two cultures**

Raising a toddler across two cultures — whether through mixed-heritage partnerships, migration, diaspora identity, or international families — involves navigating complexity that is often invisible to those outside it. Which language do you speak at home? Which traditions do you prioritise? What happens when grandparents from different backgrounds have different expectations about food, sleep, discipline, or gender?

The evidence is unambiguous that bilingualism and bicultural identity are assets, not liabilities. But the path to raising a confident, bicultural child requires intentionality — and self-compassion, because it is genuinely hard work.

**Language: the bilingual advantage**

Research consistently shows that children raised bilingually develop stronger executive function — the set of cognitive skills including attention switching, inhibition, and working memory. Bilingual children who are exposed to two languages from early life do not end up confused or delayed, as was once feared. They may have slightly smaller vocabularies in each individual language initially (measured separately), but their combined vocabulary across both languages typically equals or exceeds monolinguals.

The critical factor is exposure. Children need substantial, regular exposure to each language to develop proficiency in both. Strategies that support bilingual development include:

- **One parent, one language** — each parent consistently speaks their language. This is one of the most widely studied approaches and works well when both parents are consistent.
- **Minority language at home** — the language less supported by the community (often a heritage or ancestral language) is used at home, while the dominant community language is acquired through nursery, playgroups, and the wider community.
- **Language-rich environments** — books, songs, and community contacts in both languages enrich exposure.

If your toddler''s language development appears delayed in both languages, discuss this with your health visitor — bilingualism itself does not cause language delay, and any delay should be investigated in the usual way.

**Managing grandparent differences**

Grandparents from different cultural backgrounds may have strongly held and divergent views on feeding, sleep, discipline, physical affection, gender roles, and religious practice. This is one of the most frequently cited sources of stress in multicultural families.

Some strategies that can help:
- **Name the shared goal** — all grandparents typically want what is best for the child. Starting from this shared intention can open a more productive conversation than starting from the disagreement.
- **Be clear about non-negotiables** and flexible about preferences. Safety matters are non-negotiable (car seat use, safe sleep practices). Cultural traditions and food preferences are areas where flexibility is appropriate and can be enriching.
- **Use a trusted third party** — your health visitor or GP can sometimes help mediate disagreements about health and safety practices in a way that feels less personal than a direct family confrontation.

**Food traditions across cultures**

Food is one of the most deeply cultural aspects of family life. Toddlers raised across two food traditions have the potential to develop more diverse, adventurous eating — an advantage for nutrition and for life. Continue to offer foods from both cultural backgrounds. If there are tensions between family members about what toddlers should eat (traditional foods vs. perceived "toddler-appropriate" foods), the evidence supports offering a variety of culturally familiar, nutritionally adequate foods rather than defaulting to processed toddler products.

If your family''s traditional diet is plant-based or low in certain nutrients (B12 and iodine in vegan diets; iron in some vegetarian diets; calcium in dairy-free diets), targeted supplementation or dietary planning with a paediatric dietitian ensures nothing is missed.

**Discipline and family authority**

Discipline norms vary significantly across cultures. Research in developmental psychology identifies authoritative parenting (warmth combined with clear, consistent limits) as beneficial across many cultural contexts — but acknowledges that the expression of warmth and authority is culturally shaped. In some cultures, family authority, communal decision-making, and deference to elders are important values that shape how discipline is exercised. These are valid and should be respected within the bounds of child safety.

**Identity development**

A toddler at 25 months is not yet consciously aware of their cultural identity, but the experiences of this period — the foods they eat, the languages they hear, the stories told about their family and heritage — form the foundation of how they will later understand who they are. Families who maintain connection to both cultural heritages, through language, food, celebration, and community, tend to raise children who have a stronger, more resilient sense of identity.

**When to speak to your child''s health team**

Contact your GP, health visitor, or a family therapist if:
- You have concerns about language development in either language
- Cultural differences are creating significant family conflict that is affecting your toddler''s wellbeing
- You would like a referral to a bilingual speech and language therapist

*This article is for information only and is not a substitute for professional medical advice. Always consult your health visitor, GP, or a qualified specialist with concerns about your toddler''s development or family wellbeing. Sources: Bialystok E (2011) Bilingualism: consequences for mind and brain; AAP Promoting Cultural Identity; NHS multicultural family health resources.*',
  'relationships',
  'Lumira Medical Team',
  true, true, 6,
  ARRAY['multicultural parenting','bilingual','two cultures','heritage','language development','grandparents','25 months'],
  true
),

(
  'toddler-m28-social-skills',
  'toddler', 28,
  'Playdates, Sharing, and Social Skills: What''s Developmentally Normal',
  'Your 28-month-old is not selfish for refusing to share — they are developmentally on track. Here''s what the science says about toddler social development and what actually helps.',
  '**The myth of the sharing toddler**

One of the most common sources of playdate stress is a toddler who refuses to share. Parents feel embarrassed; other children cry; everyone goes home feeling like something went wrong. But developmental psychology is clear: the ability to share willingly and spontaneously does not emerge reliably until around age 3 to 4, and genuine reciprocal sharing is a skill still consolidating through early childhood.

At 28 months, your toddler understands ownership ("mine!") long before they understand the social logic of giving and receiving in turn. Forcing a toddler to hand over a toy — particularly one they are currently using — teaches compliance in the moment but does not build genuine prosocial skills. It can also undermine their developing sense of autonomy.

Research by developmental psychologist Michael Tomasello and colleagues at the Max Planck Institute shows that toddlers are innately cooperative in many contexts — they will spontaneously help adults who are struggling with tasks, share food in some situations, and comfort distressed peers — but the kind of voluntary, turn-based sharing of desired objects requires more cognitive and emotional development than a 28-month-old typically has.

**Parallel play vs cooperative play**

At 28 months, most toddlers engage primarily in:

- **Solitary play** — playing alone, absorbed in their own activity
- **Parallel play** — playing alongside another child, engaged in similar activities, but not truly playing together

True **cooperative play** — where children negotiate, take turns, assign roles, and pursue a shared goal — typically begins to emerge from around age 3 to 4 and consolidates through the preschool years.

This does not mean playdates are pointless at 28 months. Parallel play builds comfort with peers, exposes children to others'' play styles, and lays the social foundation for later cooperative play. But expecting toddlers to "play nicely together" in the adult sense of the phrase is setting an unrealistic developmental bar.

**What actually supports social development**

- **Narrate social situations rather than enforce them.** "Henry is using that truck. When he''s finished, it''ll be your turn" is more effective than physically removing the toy.
- **Use play setups that reduce conflict.** Having two of the same toy, or setting up activities where there is enough for everyone, reduces the conditions for sharing conflict.
- **Model turn-taking.** Playing games with the child that involve your own turn-taking (building blocks together, passing a ball) teaches the concept more effectively than instruction.
- **Validate feelings.** "It''s hard when someone takes your toy. You were using it" validates the toddler''s experience without endorsing aggression.
- **Avoid forced apologies.** Requiring a toddler to say sorry before they understand the concept teaches the word, not the feeling. Empathy-building conversations after the heat of the moment are more useful.

**Social-emotional learning in early childhood**

Evidence from longitudinal studies shows that social-emotional skills developed in early childhood — identifying emotions, regulating distress, perspective-taking, conflict resolution — are among the strongest predictors of later academic achievement, relationship quality, and mental health. These skills are built through thousands of small, ordinary interactions — not through formal lessons.

You are building your toddler''s social-emotional capacity every time you name feelings, stay calm during their big emotions, set limits with warmth, and repair after conflict.

**Daycare transitions and peer relationships**

If your toddler is starting or has recently started nursery or daycare, adjusting to a room full of peers is a significant experience. Some children adapt quickly; others take months. Key factors that support the transition include a warm key person relationship, a predictable routine, and parents who have a calm goodbye ritual.

**When to speak to your child''s health team**

Contact your GP, health visitor, or paediatrician if:
- Your toddler shows no interest in other children
- There is significant aggression (biting, hitting) that is not responding to consistent management
- Your toddler appears distressed at daycare consistently after more than six to eight weeks of settling
- You have concerns about social development in the context of other developmental differences

*This article is for information only and is not a substitute for professional medical advice. Always consult your health visitor, GP, or a developmental specialist with concerns about your toddler''s social development. Sources: Tomasello M (2009) Why We Cooperate; CASEL Social-Emotional Learning Research; AAP developmental milestones; NHS play and development guidance.*',
  'relationships',
  'Lumira Medical Team',
  true, true, 6,
  ARRAY['sharing','parallel play','social skills','playdates','toddler development','28 months','social-emotional learning'],
  true
),

-- ============================================================
-- CATEGORY: NUTRITION (fill)
-- ============================================================

(
  'toddler-m11-milk-transition',
  'toddler', 11,
  'Moving from Formula or Breast Milk to Cow''s Milk: A Practical Guide',
  'Around the first birthday, most toddlers can begin transitioning to cow''s milk as their main drink. Here''s how to do it smoothly — and what to do if dairy isn''t right for your family.',
  '**When does the transition happen?**

The shift from formula or breast milk to cow''s milk as the primary drink is recommended by most major health organisations — including the AAP, NHS, WHO, and ESPGHAN — at around 12 months of age. At 11 months, you are approaching this milestone and can begin preparing for the transition.

It is important to distinguish between two things: cow''s milk as a *drink*, and dairy as part of *food*. Soft pasteurised cheeses, yoghurt, and foods cooked with milk can all be introduced from around 6 months (NHS guidance). The recommendation to wait until 12 months applies specifically to cow''s milk as a main drink, because before 12 months it is nutritionally incomplete compared to breast milk or formula — it is lower in iron and certain vitamins and has a mineral profile that places greater demands on young infant kidneys.

**Full-fat, not low-fat**

From 12 months to 2 years, full-fat (whole) cow''s milk is recommended. The fat content supports brain development and provides energy density appropriate to this period of rapid growth. Semi-skimmed milk is generally not recommended before age 2, and skimmed milk before age 5.

**How much milk is the right amount?**

Approximately 300–400 ml (about 10–14 oz) per day is the recommended amount for toddlers — enough to provide calcium and some protein without displacing iron-rich foods. More than 500 ml per day is associated with an increased risk of iron-deficiency anaemia because milk displaces iron-containing foods and can inhibit iron absorption.

**Making the transition**

For many babies, the transition from formula to cow''s milk is straightforward. For others, particularly those used to warmed formula, the temperature difference or taste can be initially off-putting. Strategies that can help:

- Begin by mixing cow''s milk with formula or expressed breast milk in the bottle or cup, gradually increasing the proportion of cow''s milk over one to two weeks.
- Offer cow''s milk at a similar temperature to formula (slightly warm, not cold) initially.
- Introduce cow''s milk in a cup rather than a bottle if you are working toward bottle weaning at the same time.
- Persist — it may take several exposures before your toddler accepts the change.

**When to continue breastfeeding**

If you are breastfeeding at 11 months, there is no requirement to stop at 12 months. WHO recommends breastfeeding alongside appropriate complementary foods for two years and beyond for as long as is mutually desired. Breastfeeding can continue alongside the introduction of cow''s milk as a drink, or can remain the primary milk source — there is no single right approach. If you are still breastfeeding, discuss your toddler''s overall nutrition with your health visitor, particularly iron intake, which may need additional attention.

**Dairy-free families: what are the alternatives?**

For families who do not use dairy due to cow''s milk protein allergy (CMPA), lactose intolerance, or dietary or cultural reasons (including vegan families), the alternatives are:

- **Fortified soya milk** — the most nutritionally comparable plant-based alternative to cow''s milk for toddlers, with similar protein and often fortified with calcium and vitamins. This is the plant milk most commonly recommended as an alternative for toddlers by ESPGHAN and NHS.
- **Oat, almond, coconut, or rice milks** — significantly lower in protein than cow''s or soya milk and not recommended as a main milk drink for toddlers without paediatric dietitian guidance.
- **Specialist formulas for CMPA** — for children with confirmed cow''s milk protein allergy, your GP or paediatric dietitian will guide the appropriate formula choice and duration.

If your family follows a vegan diet, a registered paediatric dietitian can provide tailored guidance on meeting calcium, iron, vitamin B12, iodine, and omega-3 needs from plant sources.

**When to speak to your child''s health team**

Contact your GP, health visitor, or paediatrician if:
- Your toddler has a suspected or confirmed cow''s milk protein allergy
- You are concerned about your toddler''s growth or nutritional intake on a dairy-free diet
- Your toddler refuses cow''s milk entirely and you are unsure how to meet calcium needs
- You would like a referral to a paediatric dietitian for tailored guidance

*This article is for information only and is not a substitute for professional medical advice. Always consult your paediatrician, GP, or health visitor with concerns about your toddler''s nutrition or milk transition. Sources: AAP Clinical Report on Cow''s Milk (2019); NHS Start4Life; WHO Breastfeeding guidance; ESPGHAN Committee on Nutrition.*',
  'nutrition',
  'Lumira Medical Team',
  true, true, 5,
  ARRAY['milk transition','cow''s milk','formula','breastfeeding','dairy-free','toddler nutrition','11 months'],
  true
),

(
  'toddler-m26-healthy-plate',
  'toddler', 26,
  'Building a Healthy Plate for Toddlers: Simple, Practical, Realistic',
  'Toddler nutrition does not have to be complicated. Here''s how to build a varied, balanced diet that works for real families — without turning mealtimes into a battle.',
  '**Starting with realistic expectations**

At 26 months, you are in the thick of the toddler eating phase — unpredictable appetite, food refusal, strong opinions, and meals that get eaten one day and rejected the next. This is normal. The goal of this phase is not to achieve a perfectly balanced meal at every sitting, but to offer a variety of nutritious foods regularly and trust your toddler''s appetite to regulate intake across days, not individual meals.

Research on toddler energy regulation shows that children naturally compensate across a day — eating more at one meal if they ate less at the previous one. Parental anxiety about single meals is often a larger source of stress than the toddler''s actual intake warrants.

**The toddler plate — a practical guide**

Rather than a strict framework, think of the toddler plate in approximate proportions:

- **Starchy carbohydrates (approximately one quarter to one third of the plate):** Bread, pasta, rice, potatoes, noodles, couscous, polenta, chapatti, injera, rice cakes. These provide energy and B vitamins. Wholegrain versions add fibre but should not dominate — too much fibre in toddler diets can reduce absorption of key minerals.
- **Protein (approximately one quarter of the plate):** Meat, fish, eggs, legumes (lentils, chickpeas, black beans, soya), tofu, dairy. Aim for two portions of oily fish per week where the diet includes fish.
- **Vegetables and fruit (one third or more):** Aim for a variety of colours where possible — this is one of the best practical proxies for nutritional variety. Frozen and tinned vegetables count equally.
- **Dairy or calcium-rich foods:** Full-fat milk, yoghurt, cheese, or fortified plant alternatives. About three portions per day covers calcium needs for this age group.
- **Healthy fats:** Avocado, nut butters, olive oil, oily fish, seeds. Toddlers need fat — low-fat diets are not appropriate before age 2, and healthy fats support brain development.

ESPGHAN and NHS guidance both emphasise that toddler diets should be varied and minimally processed, with no added salt (the kidneys are still maturing) and minimal added sugar.

**Rainbow eating — a practical approach**

One of the most evidence-supported and parent-friendly ways to think about variety is colour diversity. Different colours in vegetables and fruit reflect different phytonutrients:

- Red/orange: tomatoes, peppers, carrots, sweet potato — rich in beta-carotene and lycopene
- Green: broccoli, peas, spinach, kale, cucumber — rich in folate, iron, vitamin K
- Purple/blue: blueberries, red cabbage, aubergine — rich in anthocyanins
- White/beige: cauliflower, parsnip, onion, garlic — contain allicin and quercetin
- Yellow: corn, yellow pepper, mango — vitamin C and carotenoids

Eating a rainbow is not about perfection at each meal — it is about variety across the week.

**Food as reward — why to avoid it**

Using food (particularly sweet foods) as a reward for eating other foods ("if you eat your peas, you can have ice cream") has been consistently shown in research to reduce preference for the "virtuous" food and increase preference for the reward food. The message the child receives, cognitively, is that the reward food must be more desirable than the food being rewarded. The AAP and paediatric dietitians broadly advise against this approach.

This does not mean sweet foods are forbidden. Offering a dessert as a normal, neutral part of the meal — without it being contingent on eating anything else — keeps it from becoming the emotionally loaded prize it becomes when used as a reward.

**Celebrating cultural food traditions**

Nutritional adequacy does not require conformity to any single cultural diet. Traditional diets around the world — from West African groundnut stews to Japanese miso broths, from Indian dals to Scandinavian rye breads — can all provide excellent toddler nutrition. Cultural foods often have the additional advantage of being foods the family eats together, and shared family mealtimes are one of the most consistent protective factors for healthy eating patterns in children.

If your family''s traditional diet is plant-based or low in certain nutrients (B12 and iodine in vegan diets; iron in some vegetarian diets; calcium in dairy-free diets), targeted supplementation or dietary planning with a paediatric dietitian ensures nothing is missed.

**When to speak to your child''s health team**

Contact your GP, health visitor, or paediatrician if:
- Your toddler''s weight gain has slowed or stalled
- You are concerned about a nutritional deficiency
- Your toddler eats fewer than 20 foods across all food groups
- You would like a referral to a paediatric dietitian for personalised guidance

*This article is for information only and is not a substitute for professional medical advice. Always consult your paediatrician, GP, or health visitor with concerns about your toddler''s nutrition or growth. Sources: ESPGHAN Committee on Nutrition (2017); NHS Eatwell Guide (children); AAP Pediatric Nutrition Handbook; WHO Complementary Feeding guidelines.*',
  'nutrition',
  'Lumira Medical Team',
  true, true, 6,
  ARRAY['toddler nutrition','healthy plate','rainbow eating','ESPGHAN','balanced diet','26 months','toddler meals'],
  true
),

-- ============================================================
-- CATEGORY: MENTAL HEALTH (fill)
-- ============================================================

(
  'toddler-m13-separation-anxiety',
  'toddler', 13,
  'Separation Anxiety in Toddlers: Why It Peaks and How to Help',
  'Clinging and crying at goodbye is developmentally normal in the second year. Here''s why it happens, what helps, and when it becomes a concern worth discussing.',
  '**Why separation anxiety peaks in the second year**

Separation anxiety is one of the most universal experiences of early childhood — and one of the most misunderstood. Parents often worry that their toddler''s intense distress at goodbye indicates insecurity, attachment problems, or that they are "too clingy." In most cases, the opposite is true.

Separation anxiety is, developmentally speaking, a sign of healthy attachment. A toddler who cries when their caregiver leaves has formed a secure attachment bond — they know who their safe person is, and they miss them when they are gone. Research on attachment theory (Bowlby, Ainsworth) and subsequent developmental psychology confirms that the capacity to miss a caregiver is a positive developmental sign, not a problem.

Separation anxiety typically emerges at around 6 to 8 months, intensifies between 12 and 18 months (coinciding with the 13-month period covered here), and generally decreases through the preschool years as object permanence, language, and emotional regulation mature.

The developmental reason for the peak at this age is partly cognitive: toddlers now understand that their caregiver exists and continues to exist when out of sight (object permanence), but they do not yet have a reliable sense of time or the emotional regulation tools to manage the waiting. They know you are gone — they just cannot yet trust that you will come back in a way that feels manageable.

**What helps at the moment of goodbye**

The goodbye itself is often the worst part. Research on nursery and daycare transitions consistently shows that prolonged, drawn-out goodbyes tend to increase — not decrease — distress. A brief, warm, consistent goodbye ritual is more supportive:

- **Acknowledge the feeling, briefly.** "I know it''s hard when I go. I love you and I''ll be back after your nap."
- **Give a specific, concrete return cue** the child can understand. "I''ll be back when you''ve had your snack and your play" is more meaningful than "I''ll be back at 4pm."
- **Keep the goodbye consistent.** A predictable ritual — a specific phrase, a hug, a wave at the window — gives the toddler a script they can rely on.
- **Then go.** Returning because they are crying can signal that crying is effective. It may prolong the distress more than a clean, confident exit does.

**What happens after you leave**

Most parents are surprised to discover that a toddler who appeared inconsolable at goodbye is often happily engaged within a few minutes of the parent leaving. Nursery and childminder staff almost universally report this. If you are worried, most nurseries are happy to send a brief message or photo after settling — many parents find this reassuring in the early weeks.

**Temperament matters**

Some children are naturally more cautious and slow-to-warm than others. This is a temperamental trait with a neurobiological basis — not a behaviour problem and not caused by "bad" parenting. Cautious, inhibited toddlers typically need longer warm-up periods in new environments and with new people, and tend to take longer to settle at nursery or with childminders. A nursery key person who understands this and allows gradual settling-in time can make a significant difference.

**Cultural context**

In many cultures, toddlers are rarely separated from their primary caregivers in the first two to three years — they are carried, co-sleep, and are cared for within an extended family network. In these contexts, separation anxiety may manifest differently or less intensely, because the child has less experience of separation. This is neither better nor worse — it is a different developmental context. Families who have not used daycare and are beginning it later may find their toddler needs a longer settling-in period.

**When does separation anxiety become excessive?**

Separation anxiety that is developmentally typical tends to:
- Peak at goodbye and resolve within minutes of the caregiver leaving
- Improve over weeks as the child builds familiarity with the environment
- Not significantly interfere with the child''s ability to enjoy their day

Separation anxiety that warrants further assessment tends to:
- Persist for months without improvement
- Involve extreme distress that lasts well beyond the point of the caregiver leaving
- Prevent the child from engaging in any enjoyable activity throughout the day
- Appear (in older toddlers or preschoolers) alongside significant physical symptoms

**When to speak to your child''s health team**

Contact your GP, health visitor, or paediatrician if:
- Separation anxiety is severe and not improving after several weeks at nursery or with a new carer
- Your toddler''s distress at separation is significantly affecting family functioning
- You are concerned about anxiety or emotional wellbeing more broadly
- You would like a referral to a clinical or educational psychologist for assessment

*This article is for information only and is not a substitute for professional medical advice. Always consult your paediatrician, GP, or health visitor with concerns about your toddler''s emotional wellbeing. Sources: Bowlby J (1988) A Secure Base; Ainsworth MDS (1978) Patterns of Attachment; AAP Developmental milestones; NHS Start4Life.*',
  'mental-health',
  'Lumira Medical Team',
  true, true, 6,
  ARRAY['separation anxiety','toddler attachment','nursery','goodbye','13 months','mental health','emotional development'],
  true
),

(
  'toddler-m20-big-emotions',
  'toddler', 20,
  'Big Feelings, Small Person: Understanding Toddler Emotional Development',
  'Meltdowns, frustration, and big emotions are not signs of poor parenting — they are signs of a brain still under construction. Here''s what''s really happening, and what helps.',
  '**The toddler brain: under construction**

The prefrontal cortex — the part of the brain responsible for impulse control, emotional regulation, rational decision-making, and the capacity to consider consequences — is not fully developed until the mid-twenties. At 20 months, it is in the earliest stages of functional development.

This is not a metaphor. Neuroimaging research confirms that the connections between the emotional processing centres of the brain (particularly the amygdala, which generates emotional responses) and the prefrontal cortex that regulates them are sparse in toddlerhood. When a 20-month-old has a meltdown because their banana broke, or because they wanted the red cup and got the blue one, they are not being unreasonable — their brain simply does not yet have the architecture to manage that level of emotional intensity.

Paediatric neuroscientist Daniel Siegel and parenting author Tina Payne Bryson describe toddlers as having a very active "downstairs brain" (emotional, reactive) with a barely-online "upstairs brain" (rational, regulating). This framing, grounded in neurological evidence, is one of the most practically useful ways for parents to understand why toddler behaviour is what it is — and why punitive responses rarely work at this age.

**Co-regulation: the parent''s role**

Self-regulation — the ability to manage one''s own emotional states — is a skill that develops over years and is learned primarily through a process called co-regulation. Co-regulation means that a calm, regulated adult nervous system helps to soothe and regulate the child''s dysregulated one.

This is not just theory. Research on the neurophysiology of stress response shows that a child''s cortisol levels (a marker of stress) in the presence of a calm caregiver are significantly lower than when left alone during emotional distress. The presence of a regulated adult is physiologically regulating for the child.

In practice, co-regulation means:
- Staying as calm as possible during a meltdown (this is the hardest part)
- Getting physically close — a low voice, a calm face, and physical proximity (where the child accepts it) signal safety
- Naming the feeling: "You''re really frustrated. You wanted the other cup."
- Not reasoning or explaining in the middle of the meltdown — the rational brain is offline; logic won''t land
- Waiting until the storm passes before any conversation about the behaviour

**Building emotional vocabulary — gradually**

Naming feelings for your toddler — even before they can name feelings themselves — builds the neural scaffolding for emotional literacy over time. Simple, consistent emotion-naming ("You seem sad. The block fell over." "You''re excited about the dog!") gradually builds the child''s capacity to identify and communicate their own internal states. This approach, grounded in attachment research, is consistent with the "Yes Brain" framework described by Siegel and Bryson — emphasising the importance of responding to children''s emotional states with receptive engagement rather than dismissal.

**What doesn''t help**

- Threatening or shaming a toddler in the middle of emotional dysregulation increases the stress response and damages the trust relationship.
- Ignoring the emotion and engaging only with the behaviour ("Don''t hit your sister") leaves the emotional state that led to the behaviour unresolved.
- Expecting a 20-month-old to "use their words" — language at this age is still emerging. Emotional vocabulary requires years of scaffolding to develop.
- Forced apologies before the child understands empathy teach the word, not the feeling.

**A note on time-out**

There is ongoing debate about the use of brief separation (time-out) in developmental psychology. A brief, calm separation from an overwhelming situation can sometimes help a child who is overstimulated — but only when used thoughtfully, briefly, and with a warm reconnection afterward. It is not a neutral tool and may not suit all children or cultural contexts. Discuss specific behaviour management approaches with your health visitor or GP if you are unsure.

**When to speak to your child''s health team**

Contact your GP, health visitor, or paediatrician if:
- Emotional dysregulation is extreme and occurring many times a day, persisting beyond the typical toddler period
- Meltdowns involve self-injurious behaviour that seems distressing rather than attention-seeking
- You are concerned about your toddler''s overall emotional or behavioural development
- Your own mental health is significantly affected by the demands of managing your toddler''s big emotions
- You would like a referral to a clinical or educational psychologist or family support worker

*This article is for information only and is not a substitute for professional medical advice. Always consult your paediatrician, GP, or health visitor with concerns about your toddler''s emotional development. Sources: Siegel DJ & Bryson TP (2011) The Whole-Brain Child; Siegel DJ & Bryson TP (2018) The Yes Brain; NSPCC Positive Parenting; AAP Emotional development guidance.*',
  'mental-health',
  'Lumira Medical Team',
  true, true, 6,
  ARRAY['big emotions','toddler tantrums','emotional development','co-regulation','prefrontal cortex','20 months','mental health'],
  true
),

-- ============================================================
-- CATEGORY: SAFETY (fill)
-- ============================================================

(
  'toddler-m11-toddlerproofing',
  'toddler', 11,
  'Toddler-Proofing Your Home: Room by Room Guide',
  'As your baby becomes a toddler, the home hazards change rapidly. Here''s what the evidence identifies as the highest priorities — room by room.',
  '**Why this moment matters**

The period around 11 to 14 months — when babies begin pulling to stand, cruising, and taking first steps — is one of the highest-risk windows for home accidents. A baby who was content to stay where you put them six weeks ago is now able to access drawers, climb stairs, and reach objects previously out of reach. The injury profile changes rapidly with mobility.

Falls and poisoning are among the leading causes of injury-related emergency department visits in toddlers (AAP, RoSPA, WHO). Most are preventable with targeted environmental modifications.

**Stair gates**

Stair gates should be installed at the top and bottom of all staircases as soon as your baby begins to pull to stand. For the top of the stairs, a screw-fixed gate is essential — pressure-mounted gates are not recommended at the top of stairs as they can be dislodged by a falling child. Gates should conform to relevant safety standards (BS EN 1930 in the UK; ASTM F1004 in the US). It is also worth teaching toddlers to navigate stairs safely (going down backwards with supervision), as stair gates are a safety layer, not a guarantee.

**Kitchen**

- Use hob guards or consistently use rear burners to prevent pan-pulling.
- Keep sharp objects, cleaning products, and dishwasher tablets locked or in high cupboards. Dishwasher tablets are a particular risk — brightly coloured and easily accessible, they can cause serious harm if ingested.
- Do not leave hot drinks unattended — scalds from hot drinks are one of the most common burn injuries in toddlers. A hot cup of tea can cause a serious scald for some time after it was made.
- Secure the oven door if possible and prevent access to the hob.

**Bathroom**

- Never leave a toddler alone in the bath — drowning can occur in inches of water within seconds.
- Set your hot water thermostat to no higher than 48°C (118°F) to prevent scalding from taps.
- Lock or restrict access to medications, razors, and cleaning products.
- Install a non-slip mat in the bath.

**Living areas**

- Secure all tall furniture — bookshelves, chests of drawers, wardrobes — to the wall with anti-tip straps. Furniture tip-overs cause serious injuries in young children every year.
- Keep blind and curtain cords out of reach or use cordless blinds. Blind cord strangulation is a well-documented hazard.
- Remove small objects (coins, button batteries, small toys from older siblings) from the floor. Button batteries are particularly dangerous — if swallowed, they require emergency treatment promptly.

**Socket covers — the evidence is nuanced**

Traditional plastic socket covers have been widely recommended but are now less endorsed by UK safety organisations including RoSPA. Modern UK three-pin sockets have a built-in shutter safety mechanism, meaning the socket is already protected without additional covers. Some plastic covers can actually reduce socket safety if incorrectly inserted or if toddlers learn to remove them. Check current RoSPA guidance for your region.

**Medication storage**

All medications — including vitamins, supplements, and over-the-counter medicines — should be stored in a locked container or high cupboard inaccessible to toddlers. Never leave a bag with medications on the floor or within easy reach. If you are concerned your toddler has ingested any medication, contact your local emergency services or poison control centre immediately.

**Garden and outdoor spaces**

- Ensure garden gates are toddler-proof and self-closing.
- Cover or fence garden ponds and water features — a toddler can drown in very shallow water with no warning.
- Store garden chemicals, tools, and fertilisers locked away.
- Check for toxic plants — contact your local poison control or NHS 111 if your toddler has eaten any plant and you are unsure.

**When to speak to your child''s health team**

Seek emergency care immediately if your toddler:
- Has swallowed a button battery, magnet, or any corrosive substance
- Has a burn, head injury, or loss of consciousness following a fall
- Has swallowed any medication or toxic substance

Contact your GP or health visitor for:
- Guidance on specific home hazards for your living situation
- Referral to a home safety assessment (available in some areas)

*This article is for information only and is not a substitute for professional medical advice. Always consult your paediatrician, GP, or health visitor with safety concerns. In an emergency, call your local emergency number immediately. Sources: AAP Child Safety guidance; RoSPA Home Safety; WHO Child Injury Prevention; CPSC safety data.*',
  'safety',
  'Lumira Medical Team',
  true, true, 7,
  ARRAY['toddlerproofing','home safety','stair gates','poisoning prevention','11 months','childproofing','safety'],
  true
),

(
  'toddler-m20-outdoor-safety',
  'toddler', 20,
  'Outdoor Safety for Toddlers: Sun, Water, Parks, and Roads',
  'The outdoors is wonderful for toddlers — and comes with real hazards. Here''s what to prioritise for sun safety, water, playgrounds, and roads.',
  '**Sun safety**

Toddler skin is more sensitive to UV radiation than adult skin, and sun exposure in childhood is a significant contributor to lifetime skin cancer risk (Cancer Research UK, WHO). The good news is that sun protection habits established in early childhood tend to persist.

Key recommendations (aligned with Cancer Research UK, NHS, and AAP):

- **SPF 30 or above** broad-spectrum sunscreen, applied 15–30 minutes before going outside and reapplied every two hours, or after swimming or sweating.
- **Shade** is the most effective sun protection — particularly between 11am and 3pm when UV is strongest.
- **Hats with a wide brim** protect the face, neck, and ears — the areas most commonly burned in toddlers.
- **UV-protective clothing (UPF 50+)** is effective for body coverage.
- **Sunglasses** with UV400 or CE EN 1836 marking protect developing eyes from UV damage.
- In the UK, vitamin D supplementation (10 micrograms/day) is recommended for children aged 1–4 regardless, because sun avoidance — while important — reduces vitamin D synthesis.

There is no safe minimum age for starting sunscreen use in toddlers. Products labelled for sensitive or baby/toddler skin tend to use mineral filters (zinc oxide, titanium dioxide) which are generally well-tolerated.

**Water safety — the highest priority**

Drowning is among the leading causes of unintentional injury death in children aged 1–4 in many countries (WHO, CDC). Critically, drowning in toddlers is typically silent — there is no splashing, calling for help, or obvious distress. A toddler can drown in very little water in a very short time.

This means:

- **Supervision must be constant and within arm''s reach** near any water — including the bath, paddling pools, garden ponds, ornamental water features, and any open body of water.
- **Garden ponds and water features should be fenced or covered** whenever possible.
- **Paddling pools should be emptied and stored after use** — a paddling pool left with a few inches of water is a serious hazard.
- **Life jackets/flotation devices should be properly fitted** when near open water — inflatable armbands are not safety devices and should not be relied upon.
- In areas with swimming pool access, barrier fencing around pools with self-closing, self-latching gates significantly reduces drowning risk.
- Enrolling toddlers in developmentally appropriate water familiarisation and swimming lessons can reduce risk, though it does not eliminate the need for supervision.

**Playground and park safety**

Playgrounds are designed to be age-appropriate, but toddlers at 20 months can access equipment they are not yet developmentally ready for — particularly when older siblings are present.

- Age guidance on playground equipment (typically 2–5 or 5–12 years) exists for safety reasons — falls from high equipment can cause serious head injuries.
- Supervision means being physically close enough to intervene — not watching from a distance.
- Check playground surfaces — impact-absorbing surfaces (wood chips, rubber matting, sand) significantly reduce injury severity compared to hard surfaces.
- Avoid clothing with drawstring hoods or cords near playground equipment — entanglement is a documented hazard.

**Road safety**

Toddlers have no concept of road danger. Their impulsivity, speed, and lack of awareness make roads one of the highest-risk environments for this age group.

- **Always use wrist reins, a pushchair, or a firm handhold on or near roads** — a toddler can run into traffic faster than any adult can react.
- Teach road safety from the very beginning — even though a 20-month-old will not reliably apply the rules, the habit of stopping at kerbs and holding hands is being built.
- Ensure your car seat is correctly fitted and appropriate for your toddler''s weight and height. Refer to the article on car seat safety for detailed guidance.
- Use correct car seats every time, every journey — even short ones.

**When to speak to your child''s health team**

Seek emergency care immediately if your toddler has:
- Any near-drowning experience (even if they seem fine — secondary drowning can occur hours later and requires urgent medical assessment)
- A significant fall from height, with head injury, loss of consciousness, or unusual drowsiness afterwards
- A significant burn from sun or heat exposure

*This article is for information only and is not a substitute for professional medical advice. Always consult your paediatrician or GP with safety concerns. In an emergency, call your local emergency number immediately. Sources: WHO Global Drowning Prevention; CDC Drowning Prevention; Cancer Research UK sun safety; AAP Car Seat Safety; RoSPA Playground Safety.*',
  'safety',
  'Lumira Medical Team',
  true, true, 6,
  ARRAY['outdoor safety','sun safety','drowning prevention','playground safety','road safety','20 months','water safety'],
  true
),

(
  'toddler-m28-road-car-safety',
  'toddler', 28,
  'Car Seat Safety for Toddlers: The Complete Guide',
  'Car seats save lives — but only when correctly selected and installed. Here''s what you need to know at 28 months, wherever you live.',
  '**Why car seat safety matters at 28 months**

Road traffic collisions are a leading cause of injury and death in young children globally. The correct use of an appropriate child car restraint reduces the risk of death in a collision significantly compared with no restraint (WHO). At 28 months, most toddlers are at a transition point in car seat use — understanding where they are in that journey is important for keeping them as safe as possible.

**A note on regional differences**

Car seat regulations vary significantly between countries. The guidance below reflects the major frameworks — the US AAP/NHTSA guidelines, European ECE R129 (i-Size) standards, and UK/Australian equivalents. Always verify the legal requirements in your country and confirm with your car seat manufacturer that the seat is appropriate for your child''s current weight and height.

**Rear-facing: the safest position for toddlers**

Rear-facing car seats are the safest position for young children. In a frontal collision — the most common and most severe type — a rear-facing seat distributes crash forces across the entire back, head, and neck, rather than concentrating them on the harness straps. This is the physical reason rear-facing is safer, not a matter of opinion.

- **AAP guidance (USA):** Children should remain rear-facing until they reach the maximum height or weight limit for their rear-facing seat — not at a specific age. Many convertible car seats support rear-facing up to significant weights. The AAP no longer specifies a minimum age for forward-facing — the guidance is to stay rear-facing as long as possible within the seat''s limits.
- **ECE R129 i-Size (Europe, UK):** Children must be rear-facing until at least 15 months under i-Size regulations. Most safety organisations and manufacturers recommend rear-facing significantly beyond this — many families keep children rear-facing to 3–4 years or beyond.
- At 28 months, many toddlers who are still within their seat''s rear-facing weight and height limits are safest remaining rear-facing. A toddler''s legs being bent or touching the back seat is normal and not a safety reason to turn them forward.

**When the child outgrows rear-facing**

Once a child exceeds the rear-facing weight or height limit of their seat, they move to a forward-facing car seat with a harness:

- A five-point harness seat (forward-facing with harness straps over the shoulders) is significantly safer than a booster seat for this age group and is appropriate for most toddlers well into the preschool years.
- Children should remain in a harnessed forward-facing seat until they reach the maximum weight or height limit for that seat.
- Booster seats (which use the vehicle seatbelt rather than a harness) are generally not appropriate until around 4 years and beyond — check your country-specific guidance.

**Installation: the most commonly missed safety step**

A car seat that is incorrectly installed offers significantly reduced protection. Studies consistently find that a large proportion of car seats are used incorrectly — with loose installation, incorrect harness routing, or failure to use available locking systems.

- **ISOFIX/LATCH systems** (metal anchor points built into the vehicle) provide a more secure connection than seatbelt installation in many seats. Check whether your car and seat both support ISOFIX/LATCH.
- **Harness tightness** — the harness should be snug enough that you cannot pinch any slack at the collarbone. A loose harness is one of the most common and dangerous errors.
- **Clip position** — the chest clip should be at armpit level, not at the stomach.
- Many fire stations, children''s hospitals, and road safety organisations offer free car seat checks. In the UK, RoSPA-trained inspectors and retailer checks are available.

**Coats in car seats**

Thick coats should not be worn under car seat harnesses — they compress in a collision and create slack that can allow the child to be ejected. Instead, put the coat on backwards over the buckled harness, or use a thin layer under the harness and a blanket over the top.

**Second-hand car seats**

Avoid purchasing second-hand car seats unless you can verify the full history of the seat. Car seats involved in collisions may have invisible structural damage that compromises their protective capacity.

**When to speak to your child''s health team**

Contact your GP or health visitor if:
- You are unsure whether your car seat is appropriate for your toddler''s current weight and height
- You would like guidance on local car seat checking services
- Your car seat has been in a collision

*This article is for information only and is not a substitute for professional medical advice. Always verify car seat guidance with your national road safety authority and your car seat manufacturer. Sources: AAP Car Seat Guidelines (2023); ECE R129 i-Size regulation; RoSPA Child Car Seats; NHTSA Child Passenger Safety; WHO Road Safety guidelines.*',
  'safety',
  'Lumira Medical Team',
  true, true, 6,
  ARRAY['car seat','toddler safety','rear facing','ISOFIX','road safety','28 months','child restraint'],
  true
),

(
  'toddler-m34-screen-time',
  'toddler', 34,
  'Screen Time and Toddlers: What the Evidence Actually Says',
  'The debate about toddlers and screens is fierce — and often more nuanced than headlines suggest. Here''s what the evidence actually shows, without the guilt trip.',
  '**Where the guidelines stand**

The two most cited authorities on toddler screen time are the World Health Organization (WHO) and the American Academy of Pediatrics (AAP), and both have published guidance worth understanding in context:

- **WHO (2019):** Sedentary screen time (passive watching) is not recommended for children under 2, and for children aged 2–4 years, no more than one hour per day is advised. The emphasis is on *sedentary* use — screen time that replaces physical activity, sleep, or face-to-face interaction.
- **AAP:** Recommends avoiding solo digital media use for children under 18–24 months except video calling, and that children 2–5 years should have no more than one hour per day of high-quality programming, ideally co-viewed with a caregiver.

At 34 months, your toddler falls in the 2–5 year bracket. These recommendations should be understood as guidelines based on available evidence, not absolute rules with catastrophic consequences for every exceedance.

**What the evidence actually shows**

The research on screen time and toddlers is real but sometimes overstated in public discourse:

- **Language development.** Studies show that toddlers learn language significantly better from live interaction than from screens. A "video deficit" — the finding that toddlers do not learn as effectively from video as from the same content presented by a live person — is well established in developmental psychology. However, high-quality interactive content (where the child must respond to prompts) appears to narrow this gap compared to passive content.
- **Sleep.** Screen use, particularly with bright screens, in the hour before bedtime is consistently associated with delayed sleep onset in toddlers and children. This is the most robustly replicated concern in the literature.
- **Attention.** Some studies associate heavy fast-paced media exposure with attention difficulties, but the evidence is not strong enough to establish clear causation, and methodological limitations in this research area are significant.
- **Co-viewing.** The most consistent finding is that the quality of screen content, and whether a caregiver watches alongside and discusses it with the child, matters far more than raw minutes. A child who watches 45 minutes of age-appropriate, slow-paced programming with a parent who engages with the content has a very different experience from a child who watches 45 minutes of fast-paced content alone.

**Quality matters more than time**

The distinction between content types is significant and often missing from headline-level screen time discussions:

- **High-quality, slow-paced, educational content** — age-appropriate programmes with clear narratives, prosocial themes, and opportunities for child engagement — is associated with fewer negative outcomes and some positive ones.
- **Fast-paced, heavily stimulating content** (particularly content that autoplays and chains clips automatically) is associated with more negative attention and sleep outcomes.
- **Video calling** (FaceTime, WhatsApp calls with grandparents) is explicitly excluded from screen time concerns in most guidelines — it involves real-time social interaction, which has different cognitive properties from passive viewing.

**A realistic framing for working parents**

Many families use screens for reasons that deserve acknowledgement rather than shame: a parent working from home, a caregiver managing a difficult day, a toddler who is unwell, a long journey, or simply a moment of rest for an exhausted parent. None of these represent developmental failure.

The evidence does not support catastrophising about occasional or contextual screen use beyond one hour per day. What it does support is:

- Prioritising interactive, high-quality content over passive, fast-paced content
- Keeping the hour before bed screen-free
- Co-viewing and engaging with content when possible
- Ensuring screens do not consistently displace sleep, physical activity, or face-to-face interaction

**Cultural and global context**

Screen time research is conducted primarily in high-income Western contexts, and the findings may not translate directly to all cultural settings. In many parts of the world, access to educational digital content via screens represents an opportunity, not a risk. Context matters enormously in how screen time recommendations are applied.

**When to speak to your child''s health team**

Contact your GP, health visitor, or paediatrician if:
- Your toddler''s screen use appears to be significantly displacing sleep, physical activity, or social interaction
- You are concerned about language development and wonder if screen use is a contributing factor
- Screen use is a significant source of family conflict
- Your toddler becomes extremely distressed when screens are turned off (beyond typical toddler frustration)

*This article is for information only and is not a substitute for professional medical advice. Always consult your paediatrician, GP, or health visitor with concerns about your toddler''s development or screen use. Sources: WHO Guidelines on Physical Activity, Sedentary Behaviour and Sleep for children under 5 (2019); AAP Media and Young Minds (2016); Courage ML & Howe ML (2010) Dev Rev; Linebarger DL & Walker D (2005) Dev Psychol.*',
  'screen-time',
  'Lumira Medical Team',
  true, true, 6,
  ARRAY['screen time','toddler screens','WHO guidelines','AAP','language development','digital media','34 months'],
  true
)

ON CONFLICT (slug) DO NOTHING;
