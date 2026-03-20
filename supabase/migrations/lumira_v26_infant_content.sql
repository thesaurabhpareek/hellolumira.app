-- Lumira v26: Infant Content Fill
-- Fills content gaps for infant stage: feeding, sleep, health, relationships
-- Medical review: articles contain disclaimers, source citations, evidence-based guidance
-- Legal review: no diagnostic claims, no medication advice, AAP/CDC/WHO sourced

-- ============================================================
-- FEEDING ARTICLES (4)
-- ============================================================

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'feeding',
  'Breastfeeding Basics and Latch',
  $$**Getting Started with Breastfeeding**

Breastfeeding is one of the most natural yet sometimes challenging skills a parent and baby learn together. In the early days, it is normal for both of you to need time to figure it out. Most challenges can be overcome with the right support and information.

**Why Latch Matters**

A good latch is the foundation of comfortable, effective breastfeeding. A shallow latch can cause nipple pain, reduce milk transfer, and frustrate your baby. A deep latch means your baby takes in a large portion of the areola — not just the nipple tip.

**Signs of a Good Latch**
- Baby's mouth is wide open, covering much of the areola
- Baby's lips are flanged outward (not tucked in)
- You hear rhythmic swallowing sounds
- Minimal nipple pain after the initial few seconds
- Baby seems satisfied and relaxed after feeding

**Positioning Options**
- **Cradle hold**: Baby rests across your forearm, tummy to tummy
- **Football hold**: Baby tucked under your arm like a football — great after a cesarean birth
- **Side-lying position**: Both of you lie on your sides facing each other — helpful for nighttime feeds
- **Laid-back nursing**: Reclined position using gravity to help baby stay on

**Common Early Challenges**
- **Engorgement**: Breasts may feel hard and full in the first week. Feeding frequently (8–12 times per 24 hours) helps regulate supply.
- **Sore nipples**: Usually improve after the first 1–2 weeks as you both find your rhythm. If pain persists, consult a lactation consultant.
- **Cluster feeding**: Babies often feed very frequently in the evenings — this is normal and helps build milk supply.

**Building Your Milk Supply**

Milk production works on a supply-and-demand basis. The more your baby nurses (or you pump), the more milk your body makes. Skin-to-skin contact, staying hydrated, and resting as much as possible all support supply.

**Seeking Support**

Lactation consultants (IBCLCs), your healthcare provider, peer support groups, and community resources are all valuable. Breastfeeding success looks different for every family — feeding your baby in a way that works for both of you is always the right choice.$$,
  0,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'World Health Organization (WHO)', 'La Leche League International'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-feeding-breastfeeding-basics-latch'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'feeding',
  'Formula Feeding: A Complete Guide',
  $$**Choosing Formula Feeding**

Formula feeding is a safe, healthy, and valid way to nourish your baby. Whether you choose formula exclusively, use it alongside breastfeeding, or transition from breast to bottle, modern infant formulas are designed to meet your baby's nutritional needs. There is no single right way to feed your baby — what matters most is that your baby is well-nourished and you feel supported.

**Types of Infant Formula**
- **Cow's milk-based formula**: The most common type; suitable for most healthy, full-term infants
- **Soy-based formula**: An option sometimes used for specific dietary or cultural preferences
- **Hydrolyzed (gentle/sensitive) formulas**: Contain partially or fully broken-down proteins; may be recommended by a provider for certain digestive sensitivities
- **Specialty formulas**: For premature babies or those with specific medical needs — use only under medical guidance

**Preparing Formula Safely**
- Wash hands thoroughly before preparing any feed
- Follow mixing instructions exactly — never dilute or concentrate formula
- Use water that meets local safety standards; boil and cool if advised by your provider
- Prepared formula can be stored in the refrigerator for up to 24 hours
- Discard any formula left in the bottle after a feed within 1–2 hours

**How Much and How Often**
- Newborns typically take 1–3 oz per feeding, every 2–3 hours
- By 2 months: approximately 4–5 oz every 3–4 hours
- By 4 months: approximately 4–6 oz every 4 hours
- Watch your baby's hunger and fullness cues — these are more reliable than a fixed schedule

**Hunger and Fullness Cues**
- **Hunger**: Rooting, sucking on hands, turning head, fussiness
- **Fullness**: Turning head away, slowing sucking, relaxed hands, falling asleep

**Feeding as Connection**

Bottle feeding is a meaningful opportunity for bonding. Hold your baby close, maintain eye contact, and switch arms occasionally during feeds to provide varied sensory experiences. Paced bottle feeding — holding the bottle more horizontally and allowing natural pauses — can help prevent overfeeding and gas.

**When to Ask Your Provider**
- Baby is not regaining birth weight by 2 weeks
- Frequent vomiting, blood in stool, or signs of an allergic reaction
- You are unsure which formula is right for your baby$$,
  0,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Centers for Disease Control and Prevention (CDC)', 'World Health Organization (WHO)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-feeding-formula-feeding-guide'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'feeding',
  'Introducing Solid Foods: Starting at 6 Months',
  $$**Is Your Baby Ready for Solids?**

Around 6 months of age, most babies begin showing signs of readiness for solid foods. Breast milk or formula remains the primary nutrition source through the first year — solids at this stage are about exploration, learning textures, and building a positive relationship with food.

**Signs of Readiness (Usually Around 6 Months)**
- Able to sit up with minimal support and hold head steady
- Shows interest in food when others eat (watching, reaching)
- Has lost the tongue-thrust reflex (no longer automatically pushes food out)
- Can move food to the back of the mouth and swallow
- Most babies are not developmentally ready before 4 months; the AAP recommends waiting until around 6 months

**Starting Solids: Practical Steps**
- Begin with single-ingredient purees or soft mashed foods
- Introduce one new food every 3–5 days to watch for reactions
- Start with iron-rich foods: iron-fortified cereals, pureed meats, mashed legumes
- Offer a variety of vegetables, fruits, grains, and proteins over time
- Offer small amounts (1–2 teaspoons) and gradually increase

**Baby-Led Weaning vs. Purees**

Both approaches can be safe and nutritious. Purees (spoon-feeding) allow easy portion control and are familiar to many families. Baby-led weaning (offering soft, appropriately sized finger foods for self-feeding) supports self-regulation and motor development. Many families use a combination. Discuss the approach with your healthcare provider.

**Foods to Introduce Early for Allergy Prevention**

Current evidence supports introducing common allergens (peanuts, eggs, tree nuts, fish) early — around 6 months — under guidance from your provider, especially if there is a family history of allergies.

**Foods to Avoid in the First Year**
- **Honey**: Risk of infant botulism
- **Cow's milk as a main drink**: Not before 12 months (small amounts in cooking are fine)
- **Added salt and sugar**: Avoid in infant foods
- **Hard, round, or sticky foods**: Choking hazards — grapes, nuts, raw carrots, large chunks of meat

**Cultural Foods and Family Traditions**

Your family's cultural foods are a wonderful place to start. Mild spices used in many cultural cuisines are safe and can help your baby develop a broad palate. There is no single "right" first food — follow your family's traditions alongside your provider's guidance.

**Continuing Breast Milk or Formula**

Continue offering breast milk or formula as the primary drink through 12 months. Water can be offered in small amounts once solids begin. Avoid juice in the first year.$$,
  6,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'World Health Organization (WHO)', 'Centers for Disease Control and Prevention (CDC)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-feeding-introducing-solid-foods-6-months'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'feeding',
  'Dealing with Common Feeding Challenges',
  $$**Feeding Challenges Are Common and Manageable**

Almost every family encounters some feeding difficulty in the first year. Whether you are breastfeeding, formula feeding, or doing both, challenges are a normal part of the journey — and most have practical solutions.

**Gas and Digestive Discomfort**
- Babies swallow air during feeds, leading to gas and fussiness
- Burp your baby during and after each feed (after 1–2 oz for bottle-fed babies, or when switching sides for breastfeeding)
- Try different burping positions: over the shoulder, sitting upright, or lying face-down on your lap
- Bicycle leg movements and gentle tummy massage may help relieve trapped gas

**Reflux and Spitting Up**
- Most babies spit up some milk after feeds — this is normal when it is not causing distress
- Keep baby upright for 20–30 minutes after feeds
- Smaller, more frequent feedings may reduce spitting up
- If your baby seems to be in pain, is not gaining weight, or is spitting up large amounts frequently, speak with your healthcare provider

**Bottle Refusal (From Breastfed Babies)**
- Some breastfed babies initially resist a bottle
- Try having a different caregiver offer the bottle
- Experiment with different bottle nipple shapes and flow rates
- Offer the bottle when baby is calm and not overly hungry
- Warming the milk to body temperature can help

**Nursing Strike**
- A breastfeeding baby may suddenly refuse to nurse due to illness, teething, a change in routine, or another reason
- Keep offering the breast in a calm, low-pressure way
- Continue expressing milk to maintain supply
- Most nursing strikes resolve within a few days

**Low Milk Supply Concerns**
- True low supply is less common than many parents worry about
- Signs your baby is getting enough: 6+ wet diapers per day, steady weight gain, seeming satisfied after feeds
- Increasing feeding frequency, ensuring good latch, and skin-to-skin contact can help
- Consult a lactation consultant if you have persistent concerns

**Nipple Confusion**
- The term refers to a baby having difficulty switching between breast and bottle
- Introducing a bottle after breastfeeding is established (typically around 3–4 weeks) may reduce this
- Paced bottle feeding mimics breastfeeding and can ease transitions

**When to Seek Help**
- Baby not regaining birth weight by 2 weeks or losing weight after
- Fewer than 6 wet diapers per day after day 5
- Signs of pain during feeds (arching, crying, pulling away persistently)
- Blood in stool or vomit

No matter how you feed your baby, you are doing a wonderful job. Reach out to your healthcare provider or a lactation consultant whenever you need guidance.$$,
  0,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'La Leche League International', 'Mayo Clinic'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-feeding-dealing-with-feeding-challenges'
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SLEEP ARTICLES (4)
-- ============================================================

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'sleep',
  'Understanding Newborn Sleep Patterns',
  $$**Why Newborns Sleep So Differently**

Newborn sleep is unlike adult sleep in almost every way. Understanding how and why newborns sleep the way they do can reduce frustration and help you respond to your baby with more confidence.

**How Much Do Newborns Sleep?**
- Newborns sleep 14–17 hours in a 24-hour period, in cycles of 2–4 hours
- Their internal clock (circadian rhythm) is not yet developed; they do not distinguish day from night at first
- By 6–8 weeks, many babies begin sleeping slightly longer stretches at night
- By 3–4 months, more consolidated night sleep often begins to emerge — though this varies widely

**Sleep Cycles in Infants**
- Infant sleep cycles are shorter than adults' (approximately 45–60 minutes)
- Babies spend more time in active (REM) sleep, which is lighter and more restorative for brain development
- You may notice twitching, irregular breathing, or small sounds during REM sleep — this is normal
- Babies often wake briefly between cycles and may need support to return to sleep

**Day-Night Confusion**

In the first few weeks, many babies are more awake at night and sleepier during the day — the opposite of what parents hope for.
- Expose baby to natural light and gentle activity during the day
- Keep nighttime interactions calm, quiet, and dimly lit
- Most babies begin naturally shifting toward more nighttime sleep by 6–8 weeks

**Newborn Sleep Cues**
- Yawning, rubbing eyes, staring blankly, pulling at ears
- Becoming quieter and less active
- Acting fussy or overstimulated
- Responding to sleep cues quickly — before overtiredness sets in — makes settling easier

**A Note on Parental Sleep**

Fragmented sleep is one of the hardest parts of new parenthood. Sharing the load with a partner, family member, or support person whenever possible helps. Sleeping when your baby sleeps is advice that works for some families and not others — do what is realistic for you.

**Normal Variation**

Every baby is different. Some newborns sleep in longer stretches from early on; others wake frequently for months. Neither means you have done something wrong. Development, temperament, feeding needs, and growth spurts all affect infant sleep.$$,
  0,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'National Sleep Foundation', 'Mayo Clinic'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-newborn-sleep-patterns'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'sleep',
  'Safe Sleep Guidelines: Reducing the Risk of SIDS',
  $$**What Is SIDS?**

Sudden Infant Death Syndrome (SIDS) is the unexplained death of an otherwise healthy baby under 1 year of age, typically during sleep. While the exact cause of SIDS is not fully understood, research has identified several risk factors and protective practices that significantly reduce risk. Following safe sleep guidelines is one of the most important things caregivers can do.

**The ABCs of Safe Sleep (AAP Recommendations)**
- **A — Alone**: Baby should sleep alone in their own sleep space, not in an adult bed, sofa, armchair, or with other children
- **B — Back**: Always place baby on their back to sleep — for every sleep, every time, including naps
- **C — Crib (or bassinet/play yard)**: Baby should sleep in a safety-approved crib, bassinet, or play yard that meets current safety standards

**The Safe Sleep Environment**
- Use a firm, flat mattress with a well-fitted sheet — no additional padding
- Keep the sleep area completely clear of soft objects: no pillows, loose blankets, bumper pads, positioners, stuffed animals, or wedges
- Do not use inclined sleepers, bouncers, or car seats for routine sleep
- Maintain a comfortable room temperature (not too warm); dress baby lightly
- Keep the sleep area smoke-free — during pregnancy and after birth

**Room-Sharing vs. Bed-Sharing**

The AAP recommends room-sharing without bed-sharing for at least the first 6 months, ideally the first year. Having baby's sleep surface next to your bed (not in your bed) is associated with a reduced risk of SIDS while supporting feeding and closeness.

**Other Protective Factors**
- Breastfeeding or feeding breast milk is associated with a reduced risk of SIDS
- Offering a pacifier at sleep times may reduce risk (if breastfeeding, introduce after feeding is well established)
- Up-to-date immunizations are associated with a reduced risk
- Tummy time during awake, supervised hours builds strength and does not conflict with back-sleeping

**Cultural Practices and Safe Sleep**

Many cultures have traditions around co-sleeping and communal sleeping that carry deep meaning. If your family's practices differ from these guidelines, speaking with your healthcare provider can help you find the safest possible approach within your context. The goal is to protect your baby while honoring your family's values.$$,
  0,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Centers for Disease Control and Prevention (CDC)', 'National Institutes of Health (NIH)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-safe-sleep-guidelines-sids-prevention'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'sleep',
  'Sleep Training: An Overview of Approaches',
  $$**What Is Sleep Training?**

Sleep training refers to various approaches parents use to help babies learn to fall asleep more independently and consolidate nighttime sleep. It is a personal decision with no single right answer — different approaches work for different families, babies, and circumstances.

**When Is Sleep Training Appropriate?**

Most sleep training approaches are typically considered after 4–6 months, once a baby's circadian rhythm is more developed and they have demonstrated an ability to go longer stretches without feeding for nutrition. Always discuss timing with your healthcare provider, especially if your baby was premature or has any medical needs.

**Common Approaches**

**Graduated Extinction ("Ferber" or "Check-and-Console")**
- Baby is placed in the crib drowsy but awake
- Parents check in at increasing time intervals if baby cries (e.g., 3 minutes, 5 minutes, 10 minutes)
- Over several days, most babies learn to settle independently
- Research shows this method does not cause lasting emotional harm when babies are developmentally ready

**Full Extinction ("Cry It Out")**
- Baby is placed in the crib after a consistent bedtime routine and parents do not return until morning (or a set feed time)
- Can be effective but requires parental readiness and confidence
- Not appropriate for all temperaments or family situations

**Fading and "No-Cry" Approaches**
- Gradual reduction of parental involvement at bedtime over days to weeks
- Chair method: parent sits nearby and gradually moves further from crib each night
- Pick-up/put-down: parent picks baby up briefly to soothe, then replaces in crib
- Generally gentler but may take longer

**Bedtime Routine as Foundation**

Regardless of approach, a consistent, calming bedtime routine (e.g., bath, feeding, song, sleep) is one of the strongest predictors of healthy infant sleep. Routines signal to the brain that sleep is coming.

**Important Considerations**
- Sleep training is not recommended during periods of illness, major transitions, or family stress
- All sleep training should happen in a safe sleep environment (back to sleep, firm surface, clear crib)
- There is no universal "right age" — follow your baby's cues and your provider's guidance
- Parents' mental health and sustainability matter too — a well-rested parent is a better parent

**No Judgment, Many Paths**

Some families choose not to sleep train at all and instead practice responsive parenting or shared sleep in their cultural tradition. All of these can lead to healthy, securely attached children. The most important thing is that your whole family is getting enough rest.$$,
  4,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'American Academy of Sleep Medicine', 'Mayo Clinic'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-sleep-training-approaches-overview'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'sleep',
  'Transitioning from Bassinet to Crib',
  $$**When to Make the Move**

Many families start their baby in a bassinet or bedside sleeper in the parents' room for the first weeks or months. Transitioning to a full-size crib in a separate nursery (or another part of the room) is a big milestone — for babies and parents alike.

**Signs Your Baby May Be Ready**
- Approaching or exceeding the weight or height limit of the bassinet
- Rolling over or pushing up on hands and knees (higher sides become important for safety)
- Around 3–6 months, when some babies sleep more consolidatedly and the transition disrupts less
- When a consistent bedtime routine is already established

The AAP recommends room-sharing for at least the first 6 months. If you move baby to a crib in a separate room before 6 months, this is a personal decision — discuss it with your provider if you are unsure.

**Preparing the Crib Environment**
- Ensure the crib meets current safety standards (check for recalls)
- Use only a firm, flat, safety-certified mattress with a fitted sheet
- No bumpers, pillows, positioners, blankets, or stuffed animals
- The room should be dark, cool, and quiet — blackout curtains and a white noise machine can help

**Strategies for a Smoother Transition**
- **Gradual introduction**: Place baby in the crib for naps first before moving to overnight sleep
- **Familiar scent**: Place a worn (unwashed) parent T-shirt near (not in) the crib so the space smells familiar
- **Consistent routine**: Your bedtime routine signals safety regardless of the sleep location
- **Give it time**: Most babies adapt within 1–2 weeks; expect a few more wake-ups initially

**Managing Parental Anxiety**

The transition can be harder emotionally for parents than for the baby. Using a monitor, keeping the nursery door open, and doing a gradual room-sharing wind-down can all help parents feel more at ease.

**What If Baby Resists?**
- Increased wake-ups are normal for the first week — stay consistent
- Avoid introducing multiple new sleep changes at once (e.g., dropping a night feed and moving to crib simultaneously)
- If baby is ill or going through a developmental leap, consider waiting until things settle

**Room-Sharing Alternatives**

Some families continue room-sharing well beyond 6 months, which remains a safe option. Cultural norms, housing situations, and family preference all shape this decision — there is no universal right answer.$$,
  3,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Consumer Product Safety Commission (CPSC)', 'National Sleep Foundation'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-sleep-transitioning-bassinet-to-crib'
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- HEALTH ARTICLES (4)
-- ============================================================

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'health',
  'Common Infant Illnesses and Warning Signs',
  $$**Your Baby's Immune System Is Still Developing**

Infants — especially in the first months of life — have immature immune systems and are more vulnerable to infections. Most illnesses in infancy are mild and resolve on their own, but knowing which symptoms require prompt medical attention is essential for every caregiver.

**Common Illnesses in Infancy**

**Colds and Respiratory Infections**
- Symptoms: runny nose, mild cough, congestion, slight fever
- Most colds are caused by viruses and resolve within 7–10 days
- Keep baby hydrated and comfortable; saline drops can ease congestion
- Avoid giving over-the-counter cold medications to infants unless directed by a healthcare provider

**Ear Infections**
- Symptoms: unusual fussiness (especially when lying down), difficulty sleeping, pulling at ears, fever
- More common after 6 months; require evaluation by a healthcare provider

**Gastroenteritis (Stomach Bug)**
- Symptoms: diarrhea, vomiting, decreased appetite
- Focus on hydration — continue breast milk or formula; ask your provider about oral rehydration solutions if needed
- Signs of dehydration include dry mouth, no tears, sunken fontanelle, significantly fewer wet diapers

**Thrush**
- White patches inside the mouth that do not wipe off; may cause discomfort during feeding
- Requires assessment and treatment from a healthcare provider

**Warning Signs: Seek Medical Care Promptly**

Contact your healthcare provider or seek emergency care if your baby shows any of the following:
- **Under 3 months**: ANY fever (temperature of 100.4 degrees F / 38 degrees C or higher) — this is a medical emergency in very young infants
- Difficulty breathing: fast breathing, nostrils flaring, chest pulling in with each breath
- Persistent vomiting or inability to keep fluids down
- Signs of dehydration: no wet diapers for 6+ hours, sunken eyes or soft spot on head
- Unusual or inconsolable crying
- Skin rash that spreads rapidly or is accompanied by fever
- Limpness, unresponsiveness, or difficulty waking
- Seizure of any kind
- Blue or gray tint to lips, tongue, or fingernails

**Prevention**
- Keep immunizations up to date
- Frequent handwashing by all caregivers
- Limit contact with sick individuals, especially in the first 2 months
- Breastfeeding provides passive immune support

Trust your instincts — you know your baby best. When in doubt, call your provider.$$,
  0,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Centers for Disease Control and Prevention (CDC)', 'Mayo Clinic'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-health-common-illnesses-warning-signs'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'health',
  'Infant Immunization Schedule: What to Expect',
  $$**Why Vaccines Matter**

Vaccines are one of the most effective tools in protecting your baby from serious, potentially life-threatening diseases. Infants receive several vaccines in the first year of life, starting at birth. The immunization schedule recommended by the CDC and AAP is carefully designed to provide protection as early as possible, when babies are most vulnerable.

**The First-Year Vaccine Schedule (General Overview)**

Always confirm the current schedule with your healthcare provider, as recommendations are periodically updated.

**At Birth**
- Hepatitis B (first dose)

**At 1–2 Months**
- Hepatitis B (second dose, if not given at 1 month)

**At 2 Months**
- DTaP (diphtheria, tetanus, pertussis)
- Hib (Haemophilus influenzae type b)
- IPV (polio)
- PCV15 or PCV20 (pneumococcal)
- RV (rotavirus)

**At 4 Months**
- DTaP, Hib, IPV, PCV, RV (second doses)

**At 6 Months**
- DTaP, Hib, PCV, RV (third doses as scheduled)
- IPV (third dose, given between 6–18 months)
- Hepatitis B (third dose, given between 6–18 months)
- Annual influenza vaccine (starting at 6 months)

**What to Expect After Vaccines**

Mild reactions are common and expected — they are signs the immune system is responding:
- Low-grade fever
- Fussiness or crying for a day or two
- Redness, swelling, or tenderness at the injection site
- Sleepiness

These reactions typically resolve within 1–2 days. Contact your provider if your baby has a high fever, excessive inconsolable crying lasting more than 3 hours, or any reaction that concerns you.

**Vaccine Safety**

Vaccines used in the current schedule have undergone extensive safety testing and ongoing monitoring. The benefits of vaccination far outweigh the risks for the vast majority of infants. Discuss any concerns or questions with your baby's healthcare provider — they can provide personalized guidance.

**Catch-Up Schedules**

If your baby misses a vaccine appointment, a catch-up schedule can be arranged. It is not necessary to restart a vaccine series — missing doses can be completed at the next visit.

**Cultural and Religious Considerations**

If you have cultural, religious, or personal concerns about vaccines, speak openly with your healthcare provider. They can provide evidence-based information and help you make the most informed decision for your family.$$,
  2,
  true,
  ARRAY['Centers for Disease Control and Prevention (CDC)', 'American Academy of Pediatrics (AAP)', 'World Health Organization (WHO)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-health-immunization-schedule'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'health',
  'Well-Baby Visits: What to Expect',
  $$**The Purpose of Well-Baby Visits**

Well-baby visits (also called wellness checkups or health supervision visits) are scheduled appointments with your baby's healthcare provider during which there is no illness to treat. These visits are among the most important preventive healthcare tools available for your growing infant.

**Typical Well-Baby Visit Schedule in the First Year**
- **3–5 days after birth** (or within 48–72 hours of hospital discharge): Weight check, jaundice screening, feeding assessment
- **1 month**
- **2 months**
- **4 months**
- **6 months**
- **9 months**
- **12 months**

Your provider may schedule visits more frequently if your baby has any health concerns or was born prematurely.

**What Happens at Each Visit**

**Physical Measurements**
- Weight, length, and head circumference are measured and plotted on a growth chart
- Growth trends over time matter more than any single measurement

**Physical Examination**
- Head-to-toe check including eyes, ears, mouth, heart, lungs, abdomen, hips, genitals, and skin
- Assessment of muscle tone, reflexes, and development

**Developmental Screening**
- Your provider will ask about and observe developmental milestones: social smiling, tracking objects, babbling, reaching, sitting, standing
- Formal developmental screening tools may be used at 9 and 12 months

**Vaccinations**
- Most well-baby visits include one or more scheduled vaccines
- Your provider will discuss which vaccines are due and answer your questions

**Guidance and Education**

Visits are also a time for your provider to offer guidance on:
- Feeding (breast milk, formula, introducing solids at 6 months)
- Sleep safety and patterns
- Injury prevention and childproofing as baby becomes mobile
- Oral health (first tooth or by 12 months — first dental visit)
- Sun safety, travel, and childcare

**Making the Most of Your Visit**
- Write down questions before you go — visits can feel rushed
- Bring a list of any concerns, no matter how small
- Note any new behaviors, changes in feeding or sleep, or anything that has worried you
- Bring your baby's immunization record if you have one

**If You Cannot Attend**

Try to reschedule as soon as possible. Well-baby visits provide the best opportunity to catch developmental concerns early, when intervention is most effective.$$,
  1,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Centers for Disease Control and Prevention (CDC)', 'Bright Futures / American Academy of Pediatrics'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-health-well-baby-visits-what-to-expect'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'health',
  'Fever Management in Infants',
  $$**Understanding Fever in Infants**

A fever is a sign that your baby's immune system is working to fight an infection. However, fever in infants — especially very young ones — is taken more seriously than in older children because it can signal a more serious illness. Knowing when to act quickly and when to watch and wait is an important skill for caregivers.

**What Counts as a Fever?**

A rectal temperature is the most accurate way to measure temperature in infants. A rectal reading of 100.4 degrees F (38 degrees C) or higher is considered a fever.

**Age Matters Most for Fever Response**
- **Under 3 months (12 weeks)**: Any fever of 100.4 degrees F (38 degrees C) or higher requires immediate medical evaluation — call your provider or go to the emergency room. Do not wait to see if it goes down. Very young infants can become seriously ill quickly and may not show other symptoms of infection.
- **3–6 months**: Fever of 100.4 degrees F (38 degrees C) or higher should be evaluated by a healthcare provider, especially if baby appears unwell
- **6–12 months**: Fever is common with viral illnesses. Contact your provider based on how your baby looks and acts, not just the number on the thermometer

**Warning Signs Alongside Fever — Seek Care Urgently**
- Difficulty breathing or unusual breathing sounds
- Stiff neck or unusual posturing
- Rash (especially one that does not fade when pressed)
- Persistent vomiting or diarrhea with signs of dehydration
- Inconsolable crying or extreme irritability
- Unusual lethargy or difficulty waking
- Seizure

**How to Take a Temperature**

Rectal temperature is most accurate for infants. Use a digital rectal thermometer:
- Apply a small amount of petroleum jelly to the thermometer tip
- Insert gently about half to one inch into the rectum
- Hold in place for the time recommended by the thermometer

Ear (tympanic) and forehead (temporal artery) thermometers are less accurate in young infants.

**Comfort Measures**
- Ensure your baby is not overdressed or in a too-warm environment
- Offer frequent feedings to prevent dehydration
- Do not use alcohol rubs
- Do not give aspirin to infants or children

**Regarding Fever-Reducing Medications**

Only use fever-reducing medications under the direction of your healthcare provider, who will guide you on appropriate options and dosing for your baby's age and weight. Never give medications to infants under 3 months without medical guidance.

Always call your provider if you are unsure — there is no wrong question when it comes to your baby's health.$$,
  0,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Centers for Disease Control and Prevention (CDC)', 'Mayo Clinic'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-health-fever-management'
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- RELATIONSHIPS ARTICLES (4)
-- ============================================================

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'relationships',
  'Bonding with Your Newborn',
  $$**What Is Bonding?**

Bonding is the deep emotional attachment that develops between a caregiver and a baby. It is the foundation for your child's sense of security, trust, and emotional development. For most parents, bonding is not a single moment — it is a process that unfolds over days, weeks, and months through everyday interactions.

**It Does Not Always Happen Instantly**

Many parents expect to feel an immediate, overwhelming rush of love — and some do. But many others feel a quieter, growing connection that deepens over time. This is completely normal, and it does not reflect how much you love your baby or what kind of parent you will be. Factors like birth trauma, postpartum mood changes, illness, or a difficult early period can all affect the pace of bonding.

**Building Connection Every Day**

**Skin-to-Skin Contact**
- Holding your baby skin-to-skin (often called "kangaroo care") is one of the most powerful bonding tools available
- It regulates baby's temperature, heart rate, and breathing; soothes crying; and releases oxytocin in both parent and baby
- Any caregiver can practice skin-to-skin — it is not limited to the birthing parent

**Responsiveness**
- Responding to your baby's cries, cues, and sounds builds trust
- Babies whose needs are consistently met learn that the world is safe and that they matter
- You cannot "spoil" a newborn by responding to them

**Eye Contact and Face-to-Face Interaction**
- Newborns can focus best at about 8–12 inches — the perfect distance for your face during feeding
- Talking, singing, and making facial expressions helps baby learn and connect

**Touch and Holding**
- Carrying, rocking, swaying, and gentle massage all communicate love through touch
- Infant massage can be a beautiful ritual for any caregiver

**Talking and Reading**
- Your voice is your baby's favorite sound
- Narrating your day, reading aloud, and singing all support language development and attachment

**For Non-Birthing and Co-Parents**

Partners, co-parents, and other caregivers build bonds just as powerfully through daily care — diapering, bathing, feeding, and soothing. Time and presence are the ingredients for connection.

**When Bonding Feels Difficult**

If you feel disconnected from your baby, emotionally numb, anxious, or overwhelmed for more than a couple of weeks, speak with your healthcare provider. These feelings may be signs of a postpartum mood disorder, which is common and very treatable.$$,
  0,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Zero to Three', 'World Health Organization (WHO)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-relationships-bonding-with-your-newborn'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'relationships',
  'Supporting Sibling Adjustment to a New Baby',
  $$**A Big Change for the Whole Family**

The arrival of a new baby changes the family dynamic for everyone — and often most noticeably for older siblings. Children of all ages can experience a mix of excitement, curiosity, jealousy, and confusion. With preparation and ongoing support, siblings can develop a loving relationship with the new baby from the very beginning.

**Before Baby Arrives: Preparation**
- Use age-appropriate language to explain what is coming: a real baby cries a lot, needs constant care, and cannot play yet
- Involve older children in preparations: choosing baby items, setting up the nursery, talking about their role as a sibling
- Read books together about becoming an older brother or sister
- Avoid making other major transitions (e.g., potty training, moving to a big bed) right at the time of the new baby's arrival if possible

**When Baby Comes Home**
- Greet older children before introducing the baby — let them feel seen first
- If possible, have someone other than the primary parent carry the baby in, so the parent can give the older child a hug
- Allow the sibling to meet and interact with the baby at their own pace — do not force interaction

**Managing Regression and Behavior Changes**

It is very common for older siblings to regress (e.g., wanting a bottle again, bedwetting, baby talk) or act out after a new baby arrives. This is a normal stress response.
- Respond with empathy, not punishment
- Name their feelings: "I know it is hard when the baby needs so much attention"
- Try to maintain the older child's routines as much as possible

**Making Time for Each Child**
- Even brief, undivided one-on-one time with the older sibling — a few minutes of focused play or reading — makes a significant difference
- Involve older siblings in gentle baby care: fetching a diaper, singing to the baby, holding a hand
- Praise the older child's role: "The baby loves it when you sing to them"

**For Toddlers vs. Older Children**
- Toddlers (1–3 years) may not fully understand the change; they need consistent routines and patient responses to regression
- Preschoolers (3–5 years) may ask a lot of questions and benefit from simple, honest answers
- School-age children may feel proud but also displaced; acknowledge both feelings

**The Long View**

The sibling relationship is one of the longest and most influential of a person's life. The early months may be bumpy, but with warmth, patience, and inclusion, most siblings develop a meaningful bond with their younger sibling.$$,
  0,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Zero to Three', 'Mayo Clinic'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-relationships-supporting-sibling-adjustment'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'relationships',
  'Involving Grandparents and Extended Family',
  $$**The Gift of Extended Family**

Grandparents, aunts, uncles, and close family friends can be among the greatest sources of support, love, and practical help in your baby's early life. At the same time, navigating extended family relationships during this tender time can require thoughtful communication and clear boundaries.

**The Value of Extended Family Involvement**
- Research consistently shows that children with close relationships with grandparents and extended family benefit socially and emotionally
- Extended family can provide caregiving support, allowing new parents to rest, return to work, or take a break
- Grandparents and elders often carry cultural knowledge, traditions, stories, and a sense of continuity across generations that enrich your baby's identity

**Cultural Traditions and Intergenerational Wisdom**

Many cultures have rich traditions around welcoming a new baby — naming ceremonies, foods, rituals, and practices passed down through generations. These traditions can be a meaningful source of identity and belonging for your child. When traditions feel supportive, embracing them can strengthen family bonds and give your baby a sense of roots.

**Setting Respectful Boundaries**

It is normal and healthy for new parents to set limits on visits, advice, and involvement — even with people they love.
- Be clear and consistent about your family's values and decisions (feeding choices, sleep arrangements, care practices)
- Use "we" language: "We have decided to..." rather than placing blame
- Acknowledge the grandparent's experience while being firm about what works for your family
- Prepare in advance for conversations about topics where you know you differ (e.g., sleep safety, solids timing)

**Updating Extended Family on Current Guidance**

Safe sleep and other pediatric recommendations have changed significantly in recent decades. Grandparents raised children under different guidance — this is not a criticism, but an opportunity to share what you have learned.
- Share information from your pediatrician
- Frame updates positively: "Our doctor told us..." or "We learned that..."

**Long-Distance Family**

Video calls, regular photos, and voice messages allow grandparents and family members who live far away to build real relationships with your baby. Babies as young as 2–3 months begin recognizing faces they see regularly — even on a screen.

**When Family Relationships Are Complicated**

Not all extended family dynamics are warm or straightforward. If certain relationships feel harmful, unsafe, or deeply stressful, it is okay to create distance. You are not obligated to expose your baby to relationships that do not feel safe or supportive — and protecting your own wellbeing protects your baby too.$$,
  1,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Zero to Three', 'American Psychological Association (APA)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-relationships-involving-grandparents-and-family'
) ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'relationships',
  'Single Parenting an Infant: Strength and Support',
  $$**Single Parenting Is a Valid and Common Reality**

Millions of families are led by a single parent, and infants raised in single-parent households can — and do — thrive. Single parenting takes many forms: solo parenting by choice, co-parenting after separation, navigating loss, or raising a child as an unmarried parent. Whatever brought you to this moment, your love and presence are what matter most to your baby.

**The Unique Challenges**

Single parents often face a heavier practical load — no one to hand the baby to at 3 a.m., no built-in backup during illness, and often less financial margin. Acknowledging these challenges honestly is important. You are not doing something wrong if it is hard; you are doing something that requires extraordinary effort.

**Building Your Support Network**

You do not have to do this alone, even if you are parenting alone.
- **Family**: If relationships are supportive, lean on grandparents, siblings, or other relatives for practical help — a cooked meal, a few hours of baby time, or simply companionship
- **Friends**: Close friends who show up with practical support are invaluable
- **Community**: Parenting groups (in-person or online), faith communities, and neighborhood resources can reduce isolation
- **Parenting programs**: Many communities offer support groups specifically for single parents
- **Professional support**: Social workers, family therapists, and parenting coaches can help navigate challenges

**Practical Strategies for Daily Life**
- Accept help when it is offered — and ask for it when it is not
- Simplify wherever possible: meal prep, consistent routines, lowering perfectionist expectations of yourself
- Nap when the baby naps if you can; rest is not a luxury, it is a necessity
- Use your support network for concrete tasks, not just emotional support
- If co-parenting, consistent communication and child-centered agreements reduce conflict and benefit your baby

**Your Baby Is Watching You**

Single parents often model extraordinary resilience, resourcefulness, and love. Your baby is learning from you — not just from the number of adults in the home. Secure attachment is built through consistent, responsive caregiving, which one loving parent can absolutely provide.

**Mental Health Matters**

Postpartum mood difficulties are common in all new parents and may be even more challenging without a co-parent's support. Please seek help if you feel persistently low, anxious, disconnected, or overwhelmed. Your wellbeing is inseparable from your baby's wellbeing. You deserve support too.

**You Are Enough**

There is no ideal family structure for raising a happy, healthy child — there is only love, consistency, and presence. You have all of that.$$,
  0,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Zero to Three', 'American Psychological Association (APA)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-relationships-single-parenting-an-infant'
) ON CONFLICT (slug) DO NOTHING;
