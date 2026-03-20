-- Lumira v28: Content Fill — Postpartum Nutrition/Safety/Sleep, Pregnancy Mental Health, Infant Relationships
-- Fills thin content gaps across multiple stages
-- Medical review: disclaimers, citations, evidence-based, emergency guidance included
-- Legal review: no diagnostic claims, crisis resources included for mental health articles

-- ============================================================
-- POSTPARTUM NUTRITION (3 articles)
-- ============================================================

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'postpartum',
  'nutrition',
  'Postpartum Nutrition for Recovery',
  $$**Why Nutrition Matters After Birth**

Your body has just accomplished something extraordinary. Whether you gave birth vaginally or by cesarean, your body worked hard — and now it needs real nourishment to rebuild. Postpartum nutrition isn't about "bouncing back" in shape. It's about supporting healing, energy, and your overall wellbeing during one of the most demanding transitions of your life.

**Key Nutrients to Prioritize**

In the weeks after birth, certain nutrients are especially important for recovery:

- **Iron:** Blood loss during delivery can deplete iron stores. Iron-rich foods such as lentils, beans, dark leafy greens, and lean meats can help restore levels. Pair them with vitamin C-rich foods to improve absorption.
- **Protein:** Tissue repair requires adequate protein. Eggs, poultry, fish, tofu, legumes, and dairy are all excellent sources. Aim to include protein at every meal.
- **Calcium and Vitamin D:** Important for bone health, especially if breastfeeding. Dairy products, fortified plant milks, salmon, and leafy greens are good sources.
- **Omega-3 fatty acids:** Found in fatty fish (salmon, sardines), walnuts, and flaxseed, omega-3s support mood, brain function, and inflammation reduction.
- **Fiber:** Constipation is common postpartum, especially after a cesarean or with pain medications. Whole grains, fruits, vegetables, and legumes support healthy digestion.

**Staying Hydrated**

Hydration is often overlooked but critically important. If you are breastfeeding, your fluid needs increase significantly. Keep a large water bottle nearby and sip consistently throughout the day. Soups, broths, and water-rich fruits and vegetables also contribute to your intake.

**Eating When Life Feels Chaotic**

With a newborn at home, formal mealtimes may feel impossible. A few strategies that help:

- Accept all offers of food from family and friends — and be specific about what you need
- Keep easy snacks accessible: nuts, cheese, fruit, yogurt, whole grain crackers
- Prepare or freeze simple meals before baby arrives if possible
- Do not skip meals; low blood sugar worsens fatigue and mood
- Ask your care team about continuing your prenatal vitamin postpartum

**A Note on Diet Culture**

The pressure to "get your body back" postpartum is real — and harmful. Your body deserves fuel, not restriction. Focus on adding nourishment rather than eliminating foods. Speak with a registered dietitian if you have specific concerns or dietary restrictions.

Recovery takes time, and what you eat is one of the most meaningful ways you can support yourself right now.
$$,
  2,
  true,
  ARRAY['American College of Obstetricians and Gynecologists (ACOG). Nutrition During Pregnancy and the Postpartum Period.', 'Academy of Nutrition and Dietetics. Eating Well After Baby.', 'Linus Pauling Institute. Iron. Oregon State University.'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'postpartum-nutrition-recovery'
) ON CONFLICT (slug) DO NOTHING;

-- -------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'postpartum',
  'nutrition',
  'Foods That Support Milk Supply',
  $$**Understanding Milk Supply**

Many new parents worry about whether they are producing enough milk. Milk supply is driven primarily by frequent, effective nursing or pumping — the more milk is removed from the breast, the more the body produces. That said, overall nutrition and hydration play an important supporting role in maintaining your energy and wellbeing while breastfeeding.

**Galactagogues: What the Evidence Says**

A galactagogue is a food, herb, or substance traditionally believed to support or increase milk supply. Some commonly mentioned options include oats, fenugreek, brewer's yeast, and fennel. While cultural traditions around these foods are meaningful and worth honoring, the scientific evidence for most galactagogues is limited or mixed.

If you are interested in incorporating these foods into your diet, there is little harm in trying whole-food sources like oats or fennel — but if you are concerned about low supply, please speak with a lactation consultant before turning to supplements or herbal remedies, as some can interact with medications.

**Foods That Genuinely Support Breastfeeding**

Rather than focusing on any single "magic" food, the most evidence-backed approach is a varied, nourishing diet:

- **Whole grains:** Oatmeal, brown rice, whole wheat bread — satisfying and nutrient-dense
- **Leafy greens:** Spinach, kale, and fenugreek leaves are nutritious regardless of their effect on supply
- **Legumes:** Lentils, chickpeas, and beans provide protein, iron, and fiber
- **Healthy fats:** Avocado, nuts, seeds, and olive oil support energy and fat-soluble vitamin absorption
- **Protein at every meal:** Supports tissue recovery and sustained energy through long nights

**Hydration Is Non-Negotiable**

Breastfeeding significantly increases your fluid needs. Signs that you may not be drinking enough include dark urine, headaches, and fatigue (beyond the normal newborn-exhaustion level). Practical tips:

- Keep a water bottle at every nursing station in your home
- Drink a glass of water each time you sit down to nurse or pump
- Herbal teas, broths, and water-rich fruits and vegetables all count toward intake
- Avoid excessive caffeine — most experts suggest keeping it under 200–300 mg per day

**What to Limit**

- **Alcohol:** If you choose to drink, timing matters. Speak with your provider or a lactation consultant about guidance specific to your situation.
- **Fish high in mercury:** Limit shark, swordfish, king mackerel, and tilefish. Low-mercury options like salmon and sardines are excellent choices.

**When to Seek Help**

If you are concerned that your baby is not getting enough milk — signs include infrequent wet diapers, poor weight gain, or constant fussiness at the breast — reach out to a lactation consultant or your pediatric care provider. Supply concerns are common and very often addressable with the right support.
$$,
  4,
  true,
  ARRAY['Academy of Breastfeeding Medicine. ABM Clinical Protocol #9: Use of Galactogogues in Initiating or Augmenting the Rate of Maternal Milk Secretion (First Revision January 2011).', 'Centers for Disease Control and Prevention (CDC). Breastfeeding: Maternal Diet.', 'La Leche League International. Increasing Low Milk Supply.'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'postpartum-nutrition-milk-supply'
) ON CONFLICT (slug) DO NOTHING;

-- -------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'postpartum',
  'nutrition',
  'Postpartum Meal Planning on Minimal Sleep',
  $$**The Reality of Eating Postpartum**

When you are operating on two to three hours of broken sleep, "meal planning" can feel like a cruel joke. But eating well — even imperfectly — matters enormously for your recovery, your mood, and your ability to care for your baby. This article is about making nourishment as low-friction as possible.

**The Batch Cooking Approach**

If you have any capacity before baby arrives, or if someone offers to help in the early weeks, batch cooking is one of the highest-return investments you can make. Ideas that work well:

- Cook large batches of grains (rice, quinoa, oats) and refrigerate or freeze in portions
- Prepare soups, stews, or curries in a slow cooker or instant pot and freeze in single-serving containers
- Hard-boil a dozen eggs at once for quick protein throughout the week
- Roast a large tray of vegetables to mix into grain bowls or eat alongside protein

**One-Handed, One-Minute Snacks**

Much of postpartum eating happens with a baby in one arm. Stock your home with foods that require zero preparation:

- Nuts and nut butters (with crackers or fruit)
- String cheese or cheese cubes
- Whole grain crackers
- Greek yogurt or cottage cheese
- Bananas, apples, clementines
- Hummus with pre-cut vegetables
- Trail mix (look for varieties without added sugar)

**Efficient Meals for Exhausted Parents**

You do not need to cook elaborate meals. A few high-nutrition, minimal-effort meals to keep in rotation:

- **Sheet pan meals:** Toss protein and vegetables with olive oil, roast for 25 minutes. Minimal prep, minimal dishes.
- **Grain bowls:** Leftover grains + canned beans or rotisserie chicken + a handful of greens + olive oil and lemon. Five minutes.
- **Egg scrambles:** Eggs with whatever vegetables are in the fridge — done in ten minutes.
- **Smoothies:** Blend frozen fruit, leafy greens, Greek yogurt or protein powder, and milk or water. Drink through a straw while nursing.
- **Overnight oats:** Prepare the night before with oats, milk, chia seeds, and fruit. Ready when you wake up.

**Accepting and Asking for Help**

When people offer to bring food, say yes. When they ask what you need, be specific: "A casserole that freezes well" or "lunch foods I can eat one-handed." Many communities have meal train apps and services that friends and family can use to coordinate.

**Permission to Use Convenience Foods**

Rotisserie chicken, canned beans, frozen vegetables, pre-washed salad greens, and store-bought soups are not failures — they are tools. Use them freely. The goal is nourishment, not a perfect home-cooked meal.

A well-fed parent is a better-resourced parent. Give yourself permission to make eating as easy as possible right now.
$$,
  6,
  true,
  ARRAY['Academy of Nutrition and Dietetics. Postpartum Nutrition: What New Moms Need to Know.', 'American College of Obstetricians and Gynecologists (ACOG). Postpartum Care Recommendations.', 'Perez-Escamilla R, et al. Dietary interventions for postpartum recovery. Maternal & Child Nutrition, 2023.'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'postpartum-nutrition-meal-planning-sleep'
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- POSTPARTUM SAFETY (3 articles)
-- ============================================================

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'postpartum',
  'safety',
  'Recognizing Postpartum Depression vs Baby Blues',
  $$**You Are Not Alone**

Becoming a parent is life-changing — and for many people, that change includes difficult emotions that nobody warned them about. Feeling weepy, overwhelmed, or not quite like yourself after having a baby is far more common than most people realize. Understanding the difference between the baby blues and postpartum depression (PPD) can help you get the right support at the right time.

**Baby Blues: Normal and Temporary**

The "baby blues" affect up to 80% of new parents. Signs include:

- Tearfulness or crying without a clear reason
- Irritability, mood swings, or anxiety
- Feeling overwhelmed or emotionally fragile
- Difficulty sleeping even when the baby sleeps

Baby blues typically begin within the first few days after birth and **resolve on their own within two weeks**. They are thought to be related to the dramatic hormonal shift that happens after delivery. The most helpful thing during this time is rest, support, connection, and patience with yourself.

**Postpartum Depression: When to Seek Help**

Postpartum depression is different from baby blues in its intensity and duration. Signs that may indicate PPD include:

- Persistent sadness, hopelessness, or emptiness lasting more than two weeks
- Feeling disconnected from your baby or unable to bond
- Difficulty functioning in daily tasks or caring for yourself or your baby
- Intense anxiety, panic attacks, or intrusive frightening thoughts
- Feeling like a failure as a parent or that your baby would be better off without you
- Loss of interest in things you used to enjoy
- Changes in appetite or sleep beyond what newborn care explains

PPD can affect any parent — regardless of gender, birth experience, whether you are breastfeeding, or how much you wanted this baby. It is not a character flaw. It is a medical condition, and **it is treatable**.

**Postpartum Psychosis: A Rare Emergency**

Postpartum psychosis is rare but serious. Symptoms include hallucinations, delusions, rapid mood swings, confusion, or feeling out of touch with reality. **If you or someone you know experiences these symptoms, seek emergency care immediately.**

**When and Where to Get Help**

You do not have to wait until things feel unbearable. If you are concerned about how you are feeling, please reach out:

- **Your OB, midwife, or primary care provider** — they screen for PPD and can connect you with treatment
- **National Maternal Mental Health Hotline:** Call or text **1-833-943-5746** — free, confidential, available 24/7
- **Postpartum Support International:** postpartum.net — resources, support groups, and a helpline (1-800-944-4773)
- **Crisis Text Line:** Text HOME to 741741

**A Word to Partners and Support People**

PPD does not always look like sadness. Watch for withdrawal, irritability, or a parent seeming detached from their baby. Encourage help without judgment. Offering to make the call or come to an appointment makes a real difference.

Seeking help is an act of strength — and one of the best things you can do for yourself and your baby.
$$,
  3,
  true,
  ARRAY['American College of Obstetricians and Gynecologists (ACOG). Postpartum Depression. FAQ090.', 'Postpartum Support International. Postpartum Depression Facts. postpartum.net.', 'National Institute of Mental Health (NIMH). Perinatal Depression. nimh.nih.gov.'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'postpartum-safety-ppd-vs-baby-blues'
) ON CONFLICT (slug) DO NOTHING;

-- -------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'postpartum',
  'safety',
  'Safe Sleep Environment Setup',
  $$**Why Safe Sleep Matters**

Sudden Unexpected Infant Death (SUID) — which includes SIDS (Sudden Infant Death Syndrome) and other sleep-related infant deaths — is one of the leading causes of infant mortality in the first year of life. The good news: the risk can be significantly reduced by following evidence-based safe sleep guidelines. This article walks you through what a safe sleep environment looks like from your perspective as a new parent.

**The ABCs of Safe Sleep**

The American Academy of Pediatrics (AAP) recommends that every infant sleep:

- **A — Alone:** Baby should sleep in their own sleep space, not in an adult bed, sofa, or armchair. Room-sharing (but not bed-sharing) is recommended for at least the first six months, ideally the first year.
- **B — Back:** Always place baby on their back for every sleep — naps and nighttime. Once babies can roll both ways independently, they can be left in whatever position they roll to, but always start them on their back.
- **C — Crib (or safe sleep surface):** Use a firm, flat sleep surface — a crib, bassinet, or play yard that meets current safety standards. The mattress should be firm with a tight-fitting sheet.

**Setting Up a Safe Sleep Space**

When preparing your baby's sleep area, keep it simple and bare:

- **No soft bedding:** Remove pillows, quilts, comforters, bumper pads, sleep positioners, and stuffed animals from the sleep space
- **No loose items:** Nothing in the crib except baby and a firm, flat mattress with a fitted sheet
- **No sleep positioners or wedges:** These are not considered safe by the AAP, even if marketed for infant use
- **Temperature:** Keep the room comfortably cool (around 68–72°F / 20–22°C). Dress baby in one layer more than you would wear. Avoid overheating.
- **Pacifier:** Offering a pacifier at sleep time is associated with a reduced risk of SIDS — but do not force it, and do not attach it to clothing or a stuffed animal

**What About Swaddles and Wearable Blankets?**

Swaddling can be soothing for newborns. If you swaddle, ensure baby's hips can move freely and that the swaddle is not too tight around the chest. **Stop swaddling as soon as your baby shows any signs of rolling.** Sleep sacks (wearable blankets) are a safe alternative to loose blankets at any age.

**Feeding and Sleep Safety**

Falling asleep while feeding is common and understandable. If you are nursing or bottle feeding in bed at night, set an alarm or ask your partner to take the baby after the feed. Having a safe sleep space right next to your bed (a bedside bassinet) makes this transfer easier.

**A Note for Grandparents and Caregivers**

Anyone who cares for your baby should be aware of current safe sleep guidelines — including grandparents, who may have been taught different practices. Safe sleep recommendations have changed significantly over the decades. Share this information gently and clearly, as it affects every person who puts your baby down to sleep.
$$,
  1,
  true,
  ARRAY['American Academy of Pediatrics (AAP). Safe Sleep: Recommendations. healthychildren.org.', 'AAP Task Force on Sudden Infant Death Syndrome. SIDS and Other Sleep-Related Infant Deaths: Updated 2016 Recommendations for a Safe Infant Sleeping Environment. Pediatrics. 2016.', 'CDC. Sudden Unexpected Infant Death and Sudden Infant Death Syndrome. cdc.gov.'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'postpartum-safety-safe-sleep-setup'
) ON CONFLICT (slug) DO NOTHING;

-- -------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'postpartum',
  'safety',
  'Postpartum Physical Recovery Warning Signs',
  $$**Your Body After Birth**

Most postpartum recovery is uncomfortable but normal — soreness, fatigue, cramping, and bleeding are expected in the days and weeks after birth. But some symptoms are signs of serious complications that require prompt medical attention. Knowing the difference could save your life.

**Seek Emergency Care Immediately For:**

If you experience any of the following, **call 911 or go to the emergency room right away**:

- **Heavy bleeding:** Soaking more than one pad per hour for two consecutive hours, or passing clots larger than a golf ball
- **Chest pain or difficulty breathing:** Can be signs of pulmonary embolism (blood clot in the lungs) — a life-threatening emergency
- **Leg pain, redness, or swelling:** Particularly in one calf — may indicate deep vein thrombosis (DVT), especially combined with warmth or redness
- **Sudden, severe headache:** Especially with vision changes, which can indicate a dangerous rise in blood pressure (postpartum preeclampsia)
- **Vision changes:** Blurring, seeing spots, or temporary vision loss
- **Seizures or loss of consciousness**
- **Signs of severe infection:** High fever (above 100.4°F / 38°C), shaking chills, or a wound that is warm, red, swollen, or producing discharge

**Call Your Provider Promptly For:**

These symptoms are not emergencies requiring 911, but they warrant a same-day call to your care team:

- Fever above 100.4°F (38°C) — even without other symptoms
- Unusual or foul-smelling vaginal discharge
- Increasing (rather than decreasing) pelvic pain or cramping after the first few days
- Redness, swelling, or discharge at a cesarean incision or perineal repair
- Painful, hard, or red areas on the breast (which may indicate mastitis)
- Difficulty urinating, burning with urination, or inability to empty your bladder
- Signs of postpartum depression or anxiety (see our related article on PPD)

**Normal Postpartum Symptoms vs. Warning Signs**

Normal: Lochia (red to pink to brown discharge) decreasing over weeks
Warning sign: Sudden increase in bright red bleeding or large clots

Normal: Mild cramping as uterus contracts
Warning sign: Severe or worsening pelvic pain

Normal: Low-grade soreness or fatigue
Warning sign: High fever (above 100.4°F / 38°C), shaking chills

Normal: Some swelling in legs early postpartum
Warning sign: One-sided calf pain, redness, or warmth

Normal: Mild breast engorgement
Warning sign: Red, painful, hot area on breast with fever

**Advocating for Yourself**

Studies show that postpartum complications are sometimes missed or dismissed, particularly for Black and Indigenous birthing people who face significant disparities in maternal mortality. Trust your instincts. If something feels wrong, say so clearly and persistently. You are your own best advocate.

**The First Six Weeks Are Critical**

Your 6-week postpartum visit is important, but do not wait until then if you are concerned. Most complications occur in the first two weeks. Contact your provider anytime something feels off — they would always rather hear from you than have you wait.
$$,
  2,
  true,
  ARRAY['American College of Obstetricians and Gynecologists (ACOG). Postpartum Warning Signs. acog.org.', 'ACOG. Optimizing Postpartum Care. Committee Opinion No. 736. 2018.', 'Centers for Disease Control and Prevention (CDC). Hear Her: Urgent Maternal Warning Signs. cdc.gov.'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'postpartum-safety-physical-recovery-warning-signs'
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- POSTPARTUM SLEEP (2 articles)
-- ============================================================

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'postpartum',
  'sleep',
  'Sleep When Baby Sleeps — Making It Work',
  $$**The Advice Everyone Gives (and Why It''s Hard)**

"Sleep when the baby sleeps" is the most common advice given to new parents — and also one of the most frustrating to hear. It sounds so simple. But when the baby finally goes down, there is laundry, dishes, a shower you have been putting off, texts to return, and a mind that refuses to quiet.

This article is not about guilt. It is about practical strategies to actually capture more rest in the chaos of early parenthood.

**Why Sleep Deprivation Is a Real Health Issue**

Losing sleep is not just an inconvenience. Chronic sleep deprivation in the postpartum period is linked to increased risk of postpartum depression and anxiety, impaired immune function, slowed physical recovery, reduced milk supply in breastfeeding parents, and difficulty coping with the emotional demands of new parenthood.

Rest is not a luxury. It is part of your recovery.

**Making the Most of Baby''s Sleep Windows**

When your baby goes to sleep, the window is often short and unpredictable. A few strategies to help you use that time for rest:

- **Lower the bar on everything else:** The dishes can wait. Your sleep cannot. Give yourself permission to lie down before tidying.
- **Prepare your sleep environment in advance:** Have your bedroom ready — curtains closed, phone on do-not-disturb — so you can lie down immediately when the baby goes down.
- **Try a "micro-rest" even if you can''t sleep:** Simply lying down with your eyes closed for 20–30 minutes has documented restorative effects, even without full sleep.
- **Use white noise for yourself:** The same white noise that helps babies sleep can help adults fall asleep faster and stay asleep during a brief window.
- **Don''t lie awake anxious:** If your mind races with worry or to-do lists, keep a notebook nearby to "dump" thoughts before resting.

**Divide and Conquer Nights**

If you have a partner, structured night shifts can give each of you a longer uninterrupted sleep block:

- One partner takes the first half of the night (e.g., 9pm–2am), the other takes the second half (2am–7am)
- The "off" partner sleeps in a separate room if possible to avoid being woken unnecessarily
- Agree on signals and routines in advance so there is no negotiating at 3am

**Managing the Mental Load**

Sometimes the barrier to rest isn''t physical — it''s the mental load of new parenthood. Anxiety, intrusive thoughts, or difficulty "switching off" are common. If you regularly cannot sleep even when your baby is sleeping, talk to your provider. Cognitive behavioral therapy for insomnia (CBT-I) is effective and can be adapted for the postpartum period.

**You Will Sleep Again**

This phase is finite. It is hard and exhausting and sometimes lonely at 3am — but it does pass. Be patient with yourself, ask for help wherever you can find it, and protect your rest as fiercely as you protect everything else for your baby.
$$,
  3,
  true,
  ARRAY['Insana SP, et al. Infant sleep and parental sleep-related impairment in the first year of life: Relationships with maternal postpartum depression. Behavioral Sleep Medicine. 2014.', 'National Sleep Foundation. Sleep and New Parents. sleepfoundation.org.', 'Mindell JA, Jacobson BJ. Sleep disturbances during pregnancy. Journal of Obstetric, Gynecologic & Neonatal Nursing. 2000.'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'postpartum-sleep-when-baby-sleeps'
) ON CONFLICT (slug) DO NOTHING;

-- -------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'postpartum',
  'sleep',
  'Partner Sleep Strategies for Postpartum Recovery',
  $$**Sleep Is a Team Effort**

When a new baby arrives, sleep deprivation affects the entire household. But how sleep deprivation is shared — or not shared — between partners has a significant impact on both individual health and relationship wellbeing. This article offers practical strategies for dividing nighttime duties in a way that supports everyone, including your partnership.

**Why Equitable Night Duty Matters**

Research consistently shows that unequal distribution of nighttime infant care is a major source of postpartum relationship conflict. When one partner carries the full burden of night waking — whether because of breastfeeding, a "default parent" dynamic, or simply not waking up — it leads to resentment, exhaustion, and feeling unsupported. Both partners benefit when nights are shared intentionally.

**Choosing a Night Schedule That Works for You**

There is no single right approach. Some structures that families find helpful:

- **Split shifts:** One partner takes early night (e.g., 9pm–2am), the other takes late night/early morning (2am–7am). Each person gets one longer uninterrupted sleep block.
- **Alternating nights:** One partner is "on" for all wake-ups on odd nights, the other on even nights. This works well for families who are not breastfeeding exclusively.
- **Pump and share:** If one parent is breastfeeding, they can pump expressed milk for a bottle feed during one wake-up so the other partner can take that shift, giving the breastfeeding parent a longer stretch.
- **Weekday/weekend split:** One partner handles all weeknights (since the other works), and the working partner fully covers weekends to give the primary caregiver rest.

**Communication Is the Foundation**

No system works without open, non-combative communication. Some tips:

- Discuss your night plan during the day — not at 3am when you are both depleted
- Use "I feel" language rather than blame: "I feel like I''m doing more nights and I need us to rebalance" rather than "You never get up"
- Check in weekly and adjust as the baby''s patterns change
- Acknowledge each other''s efforts — feeling seen matters even when you are both exhausted

**For Non-Birthing Partners**

The postpartum period can feel ambiguous for non-birthing partners — uncertain of your role, worried about your partner, and also deeply sleep-deprived. Your contribution to nighttime care is not "helping out" — it is equal parenting. And protecting your partner''s sleep during physical recovery from birth is one of the most impactful things you can do.

**When Roles Are Not Equal**

In single-parent households, or households where one partner works long hours or travels, equal splits may not be realistic. In those cases, maximizing the primary caregiver''s rest still matters:

- Ask family or friends to cover a night or two when possible
- Consider a postpartum doula for overnight support in the early weeks
- Prioritize daytime rest whenever possible to compensate

**Sleep Debt Is Real**

Both partners are likely accumulating significant sleep debt. Be patient with each other. Irritability, poor memory, and emotional sensitivity are all symptoms of sleep deprivation — not character flaws. The more you can approach night duty as a shared problem to solve together, the better for everyone.
$$,
  4,
  true,
  ARRAY['Meijer AM, van den Wittenboer GL. Contribution of infants'' sleep and crying to marital relationship of first-time parent couples in the 1st year after childbirth. Journal of Family Psychology. 2007.', 'Doss BD, et al. The effect of the transition to parenthood on relationship quality: An 8-year prospective study. Journal of Personality and Social Psychology. 2009.', 'National Sleep Foundation. Postpartum Sleep Deprivation. sleepfoundation.org.'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'postpartum-sleep-partner-strategies'
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PREGNANCY MENTAL HEALTH (3 articles)
-- ============================================================

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'pregnancy',
  'mental_health',
  'Managing Pregnancy Anxiety',
  $$**Anxiety During Pregnancy Is Common**

Worry is a natural part of pregnancy. You are growing a new life, your body is changing rapidly, and there are real uncertainties ahead. Some degree of anxiety is normal and even adaptive. But when anxiety becomes persistent, intense, or interferes with your daily life, it deserves attention and care — just like any other pregnancy symptom.

Research suggests that anxiety disorders affect up to 20% of pregnant people, making them at least as common as depression during pregnancy. Yet anxiety is less frequently screened for and less often discussed.

**Signs That Anxiety May Need More Support**

Consider speaking with your provider if you notice:

- Persistent worry that is difficult to control, even when things are going well
- Physical symptoms such as racing heart, difficulty breathing, or muscle tension
- Difficulty sleeping due to anxious thoughts
- Avoiding routine prenatal care or appointments due to fear
- Intrusive or unwanted thoughts about harm to yourself or your baby
- Panic attacks

**CBT Techniques That Help**

Cognitive Behavioral Therapy (CBT) is one of the most well-researched approaches for anxiety, and many of its tools can be used on your own or with a therapist:

- **Thought challenging:** When a worried thought arises, ask: "What is the evidence for and against this thought? What would I say to a friend who had this worry?"
- **Behavioral activation:** Anxiety often leads to avoidance. Gently re-engaging with activities you enjoy can interrupt the anxiety cycle.
- **Worry time:** Set aside 15–20 minutes per day as designated "worry time." When anxious thoughts arise outside that window, remind yourself you have a time set aside for them.
- **Gradual exposure:** If specific fears (like medical appointments or labor) are triggering avoidance, a therapist can help you gradually work toward them.

**Mindfulness Practices**

Mindfulness does not eliminate anxiety — it changes your relationship with anxious thoughts. Simple practices include:

- **Grounding:** Focus on five things you can see, four you can touch, three you can hear, two you can smell, one you can taste
- **Breathing:** Slow, diaphragmatic breathing activates the parasympathetic nervous system and reduces the physical symptoms of anxiety. Try inhaling for 4 counts, holding for 4, exhaling for 6.
- **Body scan:** Lying down, slowly bring attention to each part of your body without judgment — releasing tension as you go

**When to Seek Professional Support**

You do not need to be in crisis to benefit from therapy. If anxiety is affecting your sleep, your relationships, or your ability to enjoy pregnancy, speaking with a mental health professional who has experience with perinatal mental health is worthwhile.

If medications are being considered, your OB or midwife can discuss options that are considered compatible with pregnancy — this is not an automatic barrier to treatment.

**You Are Not Failing**

Anxiety during pregnancy does not mean you are not ready to be a parent, that something is wrong with you, or that you are not grateful enough. It means your nervous system is under real stress and would benefit from support. Asking for help is brave.
$$,
  12,
  true,
  ARRAY['Fawcett EJ, et al. The Prevalence of Anxiety Disorders During Pregnancy and the Postpartum Period: A Multivariate Bayesian Meta-Analysis. Journal of Clinical Psychiatry. 2019.', 'Hofmann SG, et al. The Efficacy of Cognitive Behavioral Therapy: A Review of Meta-analyses. Cognitive Therapy and Research. 2012.', 'American College of Obstetricians and Gynecologists (ACOG). Mental Health Conditions During and After Pregnancy. acog.org.'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'pregnancy-mental-health-managing-anxiety'
) ON CONFLICT (slug) DO NOTHING;

-- -------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'pregnancy',
  'mental_health',
  'Navigating Difficult Emotions During Pregnancy',
  $$**Pregnancy Is Emotionally Complex**

Pregnancy is often portrayed as a time of pure joy and glowing anticipation. And sometimes it is. But for many people, it is also a time of grief, fear, ambivalence, identity upheaval, and complicated feelings that coexist — sometimes uncomfortably — alongside excitement and love.

Whatever you are feeling right now is valid. You do not have to perform happiness you do not feel.

**Ambivalence: When You Feel Both Ways**

Feeling uncertain, conflicted, or even scared about having a baby — even a very wanted one — is extraordinarily common. Ambivalence does not mean you are making a mistake or that you will be a bad parent. It means you are a thoughtful human being facing a permanent, enormous life change.

Give yourself permission to hold two feelings at once: "I am excited and I am terrified." "I love this baby and I am grieving my old life." Both are true, and both deserve space.

**Grief During Pregnancy**

Pregnancy can activate or intensify grief in unexpected ways:

- Grief for the pregnancy or birth experience you hoped for (after complications, changes in plans, or a high-risk diagnosis)
- Grief for a previous pregnancy loss, which can feel more present during a subsequent pregnancy
- Grief for a person who is no longer alive to meet your child
- Grief for an earlier version of your life or identity
- Grief for a relationship that has ended or changed

Grief during pregnancy is not a problem to be solved — it is a normal human response. It can coexist with joy. Allowing yourself to feel it (rather than suppressing it) is usually more healing.

**Fear of Labor, Birth, or Parenting**

Fear of childbirth — sometimes called tokophobia in its more extreme form — is common and exists on a spectrum. Mild worry about labor is almost universal. Intense, intrusive fear that causes significant distress or avoidance of prenatal care may benefit from professional support.

Talking through your fears with your midwife, OB, or a perinatal therapist can help you build realistic expectations, develop a birth plan, and feel more in control of the process.

**Identity Shifts**

Becoming a parent changes who you are in fundamental ways. It is normal to feel grief or unease about aspects of your identity — your career, your relationships, your body, your independence — that may shift. This transition has been called "matrescence" (for birthing parents) — the process of becoming a parent, which is as profound a developmental shift as adolescence.

**Processing Difficult Emotions**

Some approaches that people find helpful:

- **Journaling:** Writing without editing or judgment can help externalise and process emotions
- **Talking to someone you trust:** A partner, friend, therapist, or support group
- **Somatic practices:** Movement, breathwork, or body-based therapies that help process emotion physically
- **Therapy:** A perinatal mental health specialist can offer tools tailored to the emotional landscape of pregnancy

**When to Seek Extra Support**

If difficult emotions feel constant, unmanageable, or are interfering with your daily life or prenatal care, please reach out to your provider or a mental health professional. You do not have to navigate this alone.
$$,
  16,
  true,
  ARRAY['Orchard ER, et al. Matrescence: Lifetime impact of motherhood on cognition and the brain. Trends in Cognitive Sciences. 2023.', 'Bayrampour H, et al. Risk factors of childbirth fear in pregnancy: A systematic review. Women and Birth. 2017.', 'American Psychological Association (APA). Grief and Loss. apa.org.'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'pregnancy-mental-health-difficult-emotions'
) ON CONFLICT (slug) DO NOTHING;

-- -------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'pregnancy',
  'mental_health',
  'Building Your Postpartum Support Plan During Pregnancy',
  $$**Why Plan Now?**

The postpartum period is one of the most demanding transitions of a person''s life — and it arrives when you are also recovering physically, sleep-deprived, and in the thick of a steep learning curve. Having a support plan in place before baby arrives is not pessimistic — it is one of the most practical, loving things you can do for your future self.

Research consistently shows that social support is one of the strongest protective factors against postpartum depression and anxiety. Planning for that support during pregnancy gives you the best chance of actually having it when you need it.

**Start With an Honest Assessment**

Before building a plan, it helps to be honest about your current situation:

- Who do you have in your life who can offer practical help (meals, household tasks, baby holding)?
- Who offers emotional support without judgment?
- Are there relationships or dynamics that tend to add stress rather than reduce it?
- What is your financial situation around parental leave, childcare, or professional support?

You do not need a large village — a few consistent, reliable people are more valuable than a long list of well-wishers.

**Practical Postpartum Support to Arrange in Advance**

- **Meal support:** Ask friends or family to set up a meal train for the first two to four weeks. Provide specific dietary needs and a drop-off location so visits are not mandatory.
- **Household help:** Laundry, dishes, and grocery runs are genuinely valuable contributions. Be specific when people ask how they can help.
- **Postpartum doula:** A postpartum doula provides non-medical support — baby care education, meal preparation, light housekeeping, and emotional support for parents. If this is accessible to you, it can be a significant resource in the early weeks.
- **Lactation support:** If you plan to breastfeed, find a local or telehealth lactation consultant before baby arrives. Breastfeeding challenges are extremely common, and having a contact ready saves precious time.

**Emotional and Mental Health Support**

- If you have a history of depression, anxiety, or previous perinatal mental health struggles, speak with your provider now about a monitoring and support plan for the postpartum period.
- Identify a therapist who specializes in perinatal mental health before baby arrives, even if you do not think you will need them.
- Know the warning signs of postpartum depression and anxiety (see related article).
- Share this information with your partner, close family member, or support person so they can watch for signs and know what to do.

**Setting Expectations With Your Support Network**

One of the hardest parts of asking for help is doing so clearly and without guilt. Some things worth communicating in advance:

- How long visitors should stay and whether you want drop-off only in the early days
- What kind of support you actually want vs. what feels like more work to host
- Your preferences around holding or handling the baby
- That you may need to say no or change plans depending on how you are feeling

**A Note on Diverse Support Structures**

Support looks different across different families, cultures, and communities. Some families have rich multigenerational support; others are geographically isolated or estranged from family. Single parents, same-sex couples, and parents who have immigrated away from their extended family may face different support landscapes — and deserve the same level of care and planning. Professional support services exist for many situations; your midwife or care team can help connect you with community resources.

**Write It Down**

Create a simple document — even a list in your phone — with:

- Names and contact details of key support people and their offered role
- Your birth preferences and postpartum goals
- Mental health contacts and crisis resources
- Practical helpers (meal, household, childcare)

Share it with your partner or a trusted person. Update it as your pregnancy progresses. You will thank yourself later.
$$,
  32,
  true,
  ARRAY['Dennis CL, Ross L. Women''s perceptions of partner support and conflict in the development of postpartum depressive symptoms. Journal of Advanced Nursing. 2006.', 'American College of Obstetricians and Gynecologists (ACOG). Optimizing Postpartum Care. Committee Opinion No. 736. 2018.', 'Postpartum Support International. Creating a Postpartum Plan. postpartum.net.'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'pregnancy-mental-health-postpartum-support-plan'
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- INFANT RELATIONSHIPS (3 articles)
-- ============================================================

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'relationships',
  'Building Secure Attachment in the First Year',
  $$**What Is Attachment?**

Attachment theory, developed by psychologist John Bowlby and later expanded by Mary Ainsworth, describes the deep emotional bond that forms between an infant and their primary caregivers. This bond is not just emotionally meaningful — it is neurologically foundational. The quality of early attachment shapes how a child learns to regulate emotion, relate to others, and experience the world.

The goal is not perfection. It is "good enough" consistency over time.

**What Secure Attachment Looks Like**

A securely attached infant:

- Uses their caregiver as a "safe base" from which to explore the world
- Expresses distress when separated from their caregiver
- Is comforted and returns to calm when reunited with their caregiver
- Over time, develops confidence in their own ability to cope

Secure attachment does not mean your baby never cries or is always happy. It means they have learned, through repeated experience, that their needs will be responded to — and that the world is fundamentally safe.

**The "Serve and Return" Dynamic**

Harvard''s Center on the Developing Child describes the core mechanism of healthy attachment as "serve and return" — the back-and-forth interaction between a baby and their caregiver:

- **Baby serves:** A look, sound, gesture, or expression
- **Caregiver returns:** A response — picking up, talking, mirroring the expression, meeting the need

These interactions, repeated thousands of times in the first year, build neural connections and form the basis of your baby''s sense of self and safety. You do not need to do anything elaborate. Eye contact, talking, singing, holding, and responding when baby cries are the building blocks.

**Responding to Crying**

A persistent myth is that responding promptly to infant crying will "spoil" the baby. Research does not support this. In the first year, promptly and warmly responding to your baby''s cries builds secure attachment — it does not create dependence. Babies cannot self-soothe independently in early infancy; they are learning to trust.

**Everyday Moments That Build Attachment**

Attachment does not require special activities. It is built through:

- Eye contact during feeds
- Narrating what you are doing ("Now I''m putting on your fresh diaper")
- Singing, talking, cooing
- Skin-to-skin contact
- Responding to cries and distress
- Following your baby''s lead during play — letting them set the pace
- Soothing, rocking, holding

**When Attachment Feels Hard**

Not all parents feel an immediate bond with their baby. This is normal and does not predict your child''s outcomes. Bonding can take days, weeks, or longer — especially after a difficult birth, postpartum depression, or other challenges. If you are struggling to feel connected to your baby, speak with your care provider. Support is available, and early intervention makes a meaningful difference.

Attachment security is built over the entire first year (and beyond) — not in a single moment. There is always time.
$$,
  2,
  true,
  ARRAY['Bowlby J. Attachment and Loss: Volume 1. Attachment. Basic Books. 1969.', 'Ainsworth MDS, et al. Patterns of Attachment: A Psychological Study of the Strange Situation. Erlbaum. 1978.', 'Center on the Developing Child, Harvard University. Serve and Return. developingchild.harvard.edu.'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-relationships-secure-attachment'
) ON CONFLICT (slug) DO NOTHING;

-- -------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'relationships',
  'Navigating Advice from Well-Meaning Family',
  $$**Everyone Has an Opinion**

The arrival of a new baby seems to activate advice-giving instincts in everyone around you. Grandparents, aunts and uncles, friends who had children years ago, strangers in the grocery store — suddenly, everyone has a view on how you should feed, hold, sleep-train, or raise your baby.

Much of this advice comes from love. Some of it comes from genuine experience. And some of it is outdated, culturally specific, or simply not a fit for your family. Learning to receive what is useful, redirect what is not, and protect your peace in the process is one of the underrated skills of early parenthood.

**Why Unsolicited Advice Feels So Overwhelming**

In the early postpartum weeks, you are sleep-deprived, emotionally raw, and still finding your footing as a parent. Receiving criticism — even well-intentioned — can feel like a verdict on your worth as a caregiver. It is worth naming that the vulnerability you feel right now is real, and that protecting your confidence matters.

**The Difference Between Information and Pressure**

Not all advice is equal. Some things to consider:

- Is this advice based on current evidence, or practices from a different era?
- Is the person offering information, or are they pressuring you to do things their way?
- Does following this advice feel right for your family and values, or does it feel coerced?

You get to decide what information is useful. You do not have to follow advice simply because it is offered by someone you love or someone with more parenting experience.

**Strategies for Managing Advice Gracefully**

- **The neutral acknowledgment:** "That''s interesting, thank you for sharing" — no commitment, no argument
- **The redirect:** "We''re still figuring things out, but I''ll keep that in mind"
- **The confident statement:** "We''ve talked with our pediatrician and this is what we''ve decided" — invoking a professional can help close down pressure
- **The honest conversation:** For patterns that are causing real friction, a calm, direct conversation about your preferences is sometimes the most sustainable approach

**Setting Limits on Visits and Involvement**

Early postpartum is an appropriate time to set norms around visits, advice, and involvement. Specific things that are reasonable to communicate:

- Visit lengths and frequency that work for your family
- Topics that feel off-limits (feeding choices, sleep arrangements, parenting decisions)
- Preferences about who holds the baby and when
- Your need for rest over entertainment of guests

You do not need to justify these preferences at length. "We''re still settling in and need some quiet time" is a complete sentence.

**Cultural Dynamics**

In many families and cultures, the arrival of a baby is a community event, and the involvement of extended family — including strong opinions — is part of that tradition. Navigating this respectfully while still advocating for your own approach can be genuinely complex.

It is possible to honor a family member''s cultural knowledge and experience while also making decisions based on your values and current evidence. Those two things can coexist.

**What to Remember**

You are the parent. You know your baby best. Advice is information, not instruction. Take what serves you, gently redirect what does not, and give yourself permission to trust yourself — even when you are still learning.
$$,
  1,
  true,
  ARRAY['Darvill R, et al. Flexibility and vigilance: Grounded theory of first-time parenting in the first year. Journal of Advanced Nursing. 2010.', 'Meszaros G. Navigating family relationships after having a baby. Zero to Three. zerotothree.org.', 'American Academy of Pediatrics (AAP). Family Support in the First Year. healthychildren.org.'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-relationships-navigating-family-advice'
) ON CONFLICT (slug) DO NOTHING;

-- -------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'infant',
  'relationships',
  'Co-Parenting an Infant: Communication Tips',
  $$**Co-Parenting Is a Skill**

Whether you are in a romantic partnership, co-parenting with an ex-partner, or sharing parenting responsibilities in any other arrangement, raising an infant together requires communication, flexibility, and a commitment to putting the baby''s wellbeing at the center. This does not come naturally to most people — especially when everyone is exhausted.

This article is for any parents sharing the care of an infant, regardless of their relationship to each other.

**The Communication Breakdown of New Parenthood**

Sleep deprivation is one of the most significant threats to communication. Research on sleep-deprived adults shows decreased empathy, reduced ability to read others'' emotions, increased irritability, and impaired problem-solving. In other words: the exact skills needed for healthy communication are the first to go when you are not sleeping.

Knowing this — and naming it together — can help both of you respond with more patience when conflict arises.

**Fundamentals of Effective Co-Parenting Communication**

- **Separate parenting decisions from relationship grievances:** Even if other aspects of your relationship are strained, try to keep infant care discussions focused on the baby''s needs.
- **Use low-stakes windows for important conversations:** When one or both of you is exhausted, hungry, or in the middle of a feed is not the time for a big talk. Choose a moment when both people are as rested and calm as possible.
- **Be specific rather than general:** "I need you to take the 2am feed on Tuesday and Thursday nights" is more actionable than "I need more help at night."
- **Avoid keeping score:** It rarely reflects the whole picture accurately, and it shifts the conversation from collaboration to competition.
- **Check in regularly:** A brief weekly check-in — what is working, what needs adjustment — can catch resentment before it builds.

**Division of Labor With an Infant**

Household labor and infant care rarely divide equally, and the first months are often the most imbalanced. Some areas worth discussing explicitly:

- Who handles which nighttime responsibilities and on which nights
- Who manages daytime feeds, changes, and naps
- Who coordinates medical appointments and tracks developmental information
- Who handles household tasks (dishes, laundry, groceries) and how
- How time for each person to rest, shower, or have time alone is protected

It is worth having these conversations proactively rather than waiting until someone reaches a breaking point.

**When Co-Parenting Partners Are Not Together**

If you are co-parenting with someone you are no longer in a romantic relationship with, clear structure becomes even more important:

- Put agreed-upon care schedules in writing
- Use a shared communication tool (many co-parenting apps exist for this purpose) to log feeding times, wake windows, and health information
- Keep direct communication about the baby separate from unresolved adult relationship issues
- Involve a mediator or co-parenting counselor if communication has broken down

**Protecting Your Partnership (If Applicable)**

Research shows relationship satisfaction often drops in the first year after having a baby. This is normal, not a sign of failure. Some things that help:

- Acknowledge each other''s contributions, even small ones — feeling seen matters
- Find even brief moments of connection that aren''t about logistics
- Be honest when you are struggling rather than waiting until you are resentful
- Consider couples counseling as a proactive tool, not a last resort

**The Bottom Line**

Good co-parenting communication does not require a perfect relationship — it requires a shared commitment to the infant''s wellbeing and a willingness to keep talking, even when it is hard. Your baby benefits enormously when the adults caring for them work as a team.
$$,
  3,
  true,
  ARRAY['Doss BD, et al. The effect of the transition to parenthood on relationship quality: An 8-year prospective study. Journal of Personality and Social Psychology. 2009.', 'Feinberg ME. The internal structure and ecological context of coparenting: A framework for research and intervention. Parenting: Science and Practice. 2003.', 'Zero to Three. Co-Parenting in the Early Years. zerotothree.org.'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'infant-relationships-co-parenting-communication'
) ON CONFLICT (slug) DO NOTHING;
