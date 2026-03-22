-- =============================================================================
-- Lumira v34: Content Gap Fill
-- =============================================================================
-- 1. Fix pregnancy articles with wrong category key 'mental_health' -> 'mental-health'
-- 2. Add planning stage articles (8 categories x 4 articles = 32)
-- 3. Add toddler mental-health articles (4 more, was critically thin at 1)
-- 4. Add toddler nutrition articles (4 more, was critically thin at 1)
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. FIX DATA QUALITY: pregnancy mental_health -> mental-health
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE public.content_articles
SET category = 'mental-health'
WHERE stage = 'pregnancy' AND category = 'mental_health';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. PLANNING STAGE ARTICLES
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.content_articles (stage, week_or_month, title, subtitle, body, category, reading_time_minutes, tags, medically_reviewed, culturally_sensitive) VALUES

-- ── NUTRITION ────────────────────────────────────────────────────────────────

('planning', 0,
'Folic Acid Before Pregnancy: Why Starting Early Matters',
'The most important nutrient to start taking before you even get a positive test.',
'If there is one thing most doctors agree on when it comes to preconception nutrition, it is this: start folic acid before you conceive, not after.

**Why timing matters so much**

The neural tube -- the structure that becomes your baby''s brain and spinal cord -- closes in the first 28 days after conception. That is often before many people even know they are pregnant. Adequate folic acid in the weeks leading up to conception and in those first critical weeks gives this process the best possible support.

**How much do you need?**

Most health authorities worldwide recommend 400 to 800 micrograms (mcg) of folic acid daily for anyone planning a pregnancy. Some people need more -- those with a history of neural tube defects in previous pregnancies, or those taking certain medications, may be advised to take 4,000 to 5,000 mcg under medical supervision. Always discuss the right dose with your doctor or midwife.

**A note on MTHFR**

Some people carry a gene variant called MTHFR, which affects how the body processes folic acid. If you know you have this variant, ask your healthcare provider whether methylfolate (the active form) might be a better fit for you.

**Food sources to include**

- Dark leafy greens: spinach, kale, methi (fenugreek leaves), moringa leaves
- Legumes: lentils, chickpeas, black-eyed peas
- Citrus fruits and juices
- Fortified cereals and grains (where available in your country)
- Edamame and avocado

Food sources alone are unlikely to provide enough folate for pregnancy, which is why a supplement is recommended alongside a balanced diet -- not instead of it.

**Other nutrients worth discussing with your doctor**

Iodine deficiency affects large portions of the population in many parts of Asia, Africa, and parts of Europe. It is critical for thyroid function and fetal brain development. Vitamin D deficiency is also widespread globally. Iron stores matter too, especially if you have heavy periods or follow a plant-based diet.

The key message: a preconception supplement containing folic acid is one of the most evidence-backed things you can do before trying to conceive. Start it at least one month before you stop using contraception -- ideally three months before.',
'nutrition', 4, ARRAY['folic-acid', 'preconception', 'neural-tube', 'supplements', 'planning'], true, true),

('planning', 0,
'Eating for Fertility: What the Research Actually Shows',
'Sorting evidence from wishful thinking when it comes to food and conception.',
'The internet is full of "fertility superfoods" and miracle diets. The truth is more nuanced -- and more reassuring.

**What the evidence does support**

Research consistently points toward an overall dietary pattern rather than any single food. A Mediterranean-style eating pattern -- rich in vegetables, fruits, whole grains, legumes, fish, and healthy fats -- is associated with better reproductive outcomes in multiple studies. This does not mean you must eat Greek food. A traditional Indian thali loaded with dals, vegetables, and whole grains, or a Japanese diet built around fish, fermented foods, and rice, fits these principles just as well.

**Caffeine: moderate is fine**

Current evidence suggests keeping caffeine below 200mg per day when trying to conceive -- roughly one to two cups of coffee. Tea, matcha, and even dark chocolate contain caffeine, so it is worth doing a rough total if you are a heavy consumer. There is no need to cut it out entirely.

**What to reduce**

- Ultra-processed foods: high in refined sugar and trans fats, associated with lower fertility in some research
- Excess alcohol: current evidence does not establish a safe amount during TTC; reducing or stopping is a sensible choice
- High-mercury fish: swordfish, king mackerel, tilefish -- these are best limited even before conception

**What the evidence does not support**

Specific "fertility teas," detox cleanses, or dramatically restrictive diets have no reliable evidence behind them and may do more harm than good. Extreme caloric restriction disrupts the hormonal signals that regulate ovulation.

**The bigger picture**

Eating well before pregnancy is not about achieving a perfect diet. It is about giving your body consistent, varied nourishment. If you cook from scratch most days, eat plenty of plants, and limit highly processed foods, you are already doing a lot right. Focus on sustainable patterns, not short-term fixes.',
'nutrition', 4, ARRAY['fertility-diet', 'preconception', 'mediterranean-diet', 'caffeine', 'planning'], true, true),

('planning', 0,
'Preconception Supplements: A Practical Guide',
'Which supplements are worth taking before pregnancy, and which to approach with caution.',
'Walking into a pharmacy before pregnancy can feel overwhelming. Here is a grounded guide to what matters most.

**The essentials**

**Folic acid or methylfolate** is the foundation. Aim for 400 to 800 mcg daily. Begin at least one month before you stop contraception.

**Vitamin D** is deficient in a significant portion of the global population -- people in northern climates, those who spend most time indoors, and those with darker skin tones are particularly at risk. Most health bodies recommend 1,000 to 2,000 IU daily, though your doctor can test your levels and advise accordingly.

**Iodine** is essential for thyroid health and fetal brain development. Many prenatal supplements include it, but if yours does not, discuss supplementing 150 to 220 mcg daily with your healthcare provider. Iodine deficiency remains common in parts of South Asia, sub-Saharan Africa, and some European regions.

**DHA (omega-3 fatty acid)** supports fetal brain and eye development. If you eat oily fish two to three times per week, you may be getting enough. If not, a supplement of 200 to 300mg DHA is a reasonable consideration.

**Iron** may be worth checking before conception, particularly if you have heavy periods or follow a plant-based diet. Low iron stores can worsen significantly during pregnancy.

**What to be cautious about**

High-dose Vitamin A as retinol (found in some liver supplements and some skin care products taken internally) can be teratogenic in excess. Most prenatal vitamins use beta-carotene instead, which the body converts only as needed.

**Do you need a prenatal multivitamin?**

A quality prenatal multivitamin is a convenient way to cover the basics. Look for one that includes folic acid or methylfolate, iodine, Vitamin D, and iron. Check the Vitamin A is from beta-carotene rather than retinol.

Always tell your doctor or pharmacist about any supplements you take, as some interact with medications.',
'nutrition', 4, ARRAY['supplements', 'preconception', 'vitamin-d', 'iodine', 'folic-acid', 'planning'], true, true),

('planning', 0,
'Nourishing Yourself While Trying to Conceive',
'Building sustainable eating habits that support your body during this season.',
'The pressure to eat "perfectly" while trying to conceive is real -- and largely unhelpful. Here is a gentler, more realistic approach.

**Sustainable beats perfect**

Crash diets, dramatic cleanses, and eliminating entire food groups can actually disrupt your hormonal balance. Your reproductive system is sensitive to signals of scarcity. Consistent, varied, adequate nutrition tells your body it is safe to conceive.

**Protein variety matters**

Protein is essential for hormonal production. Diverse sources are better than relying heavily on just one. Eggs, legumes, fish, dairy, poultry, tofu, paneer, nuts, and seeds all contribute. If you follow a plant-based diet, combining protein sources across the day helps ensure you get all essential amino acids.

**Iron-rich foods to prioritise**

Iron is one of the most commonly depleted nutrients, especially in people with heavy periods. Good sources include:
- Red meat and liver (in moderation)
- Legumes: lentils, kidney beans, chickpeas
- Tofu and tempeh
- Dark leafy greens
- Fortified cereals

Pairing iron-rich plant foods with Vitamin C (lemon juice, peppers, tomatoes) significantly improves absorption.

**Hydration is often overlooked**

Adequate fluid intake supports cervical mucus quality and overall reproductive health. Water is best. Herbal teas are generally fine in moderation, though a few (high-dose raspberry leaf, for example) are traditionally recommended only later in pregnancy.

**A note on weight**

Both very low and very high body weight can affect ovulation and fertility. However, aggressive restriction rarely helps and can increase stress hormones that suppress fertility. Focus on nourishing habits rather than a number on the scale, and work with your healthcare provider if weight is a concern.',
'nutrition', 4, ARRAY['preconception-nutrition', 'sustainable-eating', 'iron', 'protein', 'planning'], true, true),

-- ── WELLNESS ─────────────────────────────────────────────────────────────────

('planning', 0,
'Exercise and Fertility: Finding the Right Balance',
'What the research says about staying active while trying to conceive.',
'Regular physical activity is good for your overall health -- and for reproductive health. But context matters.

**Moderate activity supports fertility**

Studies consistently show that moderate exercise is associated with better fertility outcomes. This includes:
- 150 minutes of moderate aerobic activity per week (brisk walking, swimming, cycling)
- Strength training two to three times per week
- Yoga and low-impact movement

Exercise supports healthy weight, reduces insulin resistance, lowers chronic inflammation, and improves mood and sleep -- all of which benefit reproductive health.

**When too much becomes a concern**

Extreme exercise volume, especially combined with low energy availability (not eating enough to fuel training), can suppress reproductive hormone levels and disrupt or stop ovulation. This is known as Relative Energy Deficiency in Sport (RED-S) and is most common in endurance athletes and those doing very high-volume training while eating very restrictively.

Signs worth discussing with your doctor:
- Irregular or missing periods
- Extreme fatigue despite adequate sleep
- Frequent stress fractures or injuries

**You do not need to train hard to conceive**

If you do not currently exercise, starting a gentle routine like daily walks or a yoga class is beneficial. You do not need to reach any particular fitness level to conceive.

**Listen to what your body is telling you**

Stress on the body -- whether from over-exercise, under-eating, illness, or life circumstances -- signals the same hormonal pathways. If you feel exhausted and rundown, more rest is often more helpful than more exercise.

If you are uncertain about what is appropriate for your situation, a conversation with your doctor, a physiotherapist, or a sports medicine physician can give personalised guidance.',
'wellness', 4, ARRAY['exercise', 'fertility', 'preconception', 'physical-activity', 'planning'], true, true),

('planning', 0,
'Stress and Conception: What the Science Actually Shows',
'Understanding the relationship between stress and fertility -- without adding more stress.',
'You may have been told "just relax and it will happen." That advice, while well-meaning, can feel deeply frustrating. Here is a more honest look at what the science shows.

**The biology of stress and reproduction**

Chronic, significant stress does affect the hormonal systems that regulate ovulation and sperm production. The hypothalamic-pituitary-adrenal (HPA) axis -- your body''s stress response system -- and the hypothalamic-pituitary-gonadal axis -- which governs reproductive hormones -- interact closely.

In conditions of prolonged, severe stress, the body can deprioritise reproduction. This is a protective mechanism, not a permanent one.

**What the research does not show**

Everyday stress -- work pressure, relationship challenges, the anxiety of trying to conceive -- does not clearly prevent pregnancy in people who would otherwise conceive without difficulty. The evidence on this is genuinely mixed.

Telling people to "just relax" often adds a layer of shame ("Is my stress causing this?") that is neither fair nor evidence-based.

**What does help**

Rather than targeting stress reduction as a fertility intervention, focus on it as something that improves your overall wellbeing during what can be a difficult season:

- **Physical movement**: yoga, walking, swimming, dancing -- whatever you actually enjoy
- **Sleep**: prioritising 7 to 9 hours where possible
- **Social connection**: spending time with people who understand and support you
- **Limiting social media**: particularly accounts that trigger comparison or anxiety
- **Therapy or counselling**: cognitive behavioural therapy (CBT) has good evidence for managing fertility-related anxiety

**You are allowed to feel what you feel**

Trying to conceive can be emotionally challenging. Acknowledging that, rather than suppressing it, is the healthiest response.',
'wellness', 4, ARRAY['stress', 'fertility', 'mental-wellbeing', 'anxiety', 'planning'], true, true),

('planning', 0,
'Sleep and Fertility: The Overlooked Connection',
'How your nightly rest affects reproductive hormones -- and what to do about it.',
'Sleep is one of the most underrated preconception health factors. It is also one of the most actionable.

**How sleep affects reproductive hormones**

Melatonin, produced during darkness and sleep, has antioxidant properties that protect egg quality and sperm from oxidative stress. Luteinising hormone (LH), which triggers ovulation, is released in pulses during sleep. Disrupted sleep patterns -- particularly shift work and irregular schedules -- are associated with menstrual irregularity and reduced fertility in research studies.

**What the research shows**

Studies of women undergoing IVF have found associations between poor sleep quality and lower oocyte (egg) quality. Research in male fertility shows sleep deprivation is associated with reduced testosterone levels and poorer sperm parameters.

This does not mean one bad night affects your chances. It is chronic sleep disruption that has the most impact.

**If you do shift work**

Shift work is a reality for millions of healthcare workers, emergency responders, factory workers, and others worldwide. If this is your situation, speak with your doctor -- there may be strategies to minimise the impact and support your reproductive health during this period.

**Practical sleep hygiene to try**

- Keep a consistent wake time, even on weekends
- Dim lights and screens for the hour before bed
- Keep the bedroom cool and dark where possible
- Limit caffeine after midday
- If you wake anxious, a brief mindfulness or breathing practice can help settle the nervous system

**A note on sleep and anxiety**

Trying to conceive can bring its own sleep disruptions -- racing thoughts, cycle tracking anxiety, the two-week wait. This is normal. If sleep anxiety is significant, speaking to a therapist can be genuinely helpful.',
'wellness', 4, ARRAY['sleep', 'fertility', 'melatonin', 'hormones', 'preconception', 'planning'], true, true),

('planning', 0,
'Reducing Everyday Toxin Exposure Before Pregnancy',
'Practical, non-alarmist steps to limit endocrine-disrupting chemicals in your environment.',
'Talk of toxins can quickly become overwhelming -- and sometimes alarmist. Here is a grounded, practical guide to what matters most.

**What are endocrine disruptors?**

Endocrine-disrupting chemicals (EDCs) are substances that can interfere with hormonal signalling. Some research suggests certain EDCs may affect fertility and fetal development. The key word is "may" -- causation in humans is difficult to establish, and the doses matter enormously.

**Where they commonly appear**

- **Plastics**: BPA and phthalates in some plastic food containers and packaging
- **Personal care products**: certain fragrances, parabens, and preservatives in cosmetics and lotions
- **Non-stick cookware**: PFAS chemicals in some non-stick coatings at high heat
- **Pesticide residue**: on some conventionally grown produce
- **Cleaning products**: some solvents and disinfectants

**Practical swaps -- prioritise these**

- Store food in glass, stainless steel, or ceramic rather than plastic where easy and affordable
- Avoid microwaving food in plastic containers
- Choose fragrance-free or naturally scented personal care products where possible
- Ventilate your home regularly -- indoor air quality matters
- Rinse fruit and vegetables thoroughly; peeling when practical helps with pesticide residue

**What you do not need to do**

A full home detox is not necessary or evidence-based. Do not spend money on expensive "toxin-removing" supplements -- there is no reliable evidence they work.

**Keep perspective**

The human body is remarkably resilient. Billions of healthy pregnancies happen in environments with everyday chemical exposure. These steps are about sensible risk reduction, not about achieving an impossible standard of purity.',
'wellness', 4, ARRAY['toxins', 'endocrine-disruptors', 'preconception', 'BPA', 'environment', 'planning'], true, true),

-- ── MENTAL HEALTH ─────────────────────────────────────────────────────────────

('planning', 0,
'The Emotional Reality of Trying to Conceive',
'The hope, the anxiety, the waiting -- and how to navigate it all.',
'Trying to conceive is not just a physical process. For many people, it is one of the most emotionally intense experiences of their lives.

**The cycle of hope and disappointment**

Each month can feel like a complete emotional arc -- hope building through the first half of the cycle, anxiety mounting during the two-week wait, and then either joy or grief at the end. Even when you know intellectually that it often takes time, each negative test can feel like a fresh loss.

This is normal. It is not weakness or overreacting.

**The comparison trap**

It is hard not to notice when friends, family members, or social media contacts announce pregnancies. These moments can be genuinely painful even when you feel happy for the people involved. Allowing yourself to feel both things at once -- joy for them, grief for yourself -- is human.

**What tends to help**

- Naming the feelings: anxiety, grief, frustration, hope, all of it is valid
- Limiting the amount of time spent on fertility forums and social media if they increase anxiety
- Keeping one or two close people informed so you are not carrying it entirely alone
- Continuing to invest in your relationship and your own interests -- not letting TTC become your whole identity
- Mindfulness-based approaches, which have good evidence for managing fertility-related distress

**When to seek professional support**

If anxiety or low mood is significantly affecting your daily functioning, relationships, or ability to work, please reach out to a mental health professional. Fertility-specialised therapists and counsellors exist in most countries and can be genuinely helpful. You do not need to wait until things feel dire.',
'mental-health', 4, ARRAY['trying-to-conceive', 'emotional-health', 'anxiety', 'grief', 'planning'], true, true),

('planning', 0,
'When Trying to Conceive Feels Lonely',
'How to find support without losing yourself in the process.',
'One of the less talked-about parts of trying to conceive is the isolation it can bring. Here is how to navigate it.

**Why it feels lonely**

TTC is often secret -- many people do not share until a pregnancy is confirmed. This means carrying something enormous while appearing to the outside world as if nothing is happening. Baby announcements, pregnancy photos, and conversations about children can feel like constant reminders. Meanwhile, the people who might most understand are often going through it too, and also not talking about it.

**The social media double-edged sword**

Online fertility communities can be a source of real connection and information. They can also become a source of anxiety -- reading worst-case scenarios, comparing timelines, feeling behind. Pay attention to whether your time in these spaces is leaving you feeling supported or more distressed. It is fine to step back.

**Being specific when asking for support**

Vague requests for support often go unmet, not because people do not care, but because they do not know what to offer. Being specific helps:
- "I need someone to talk to, not give advice"
- "Can you not ask me about it for a while?"
- "It would help if you came with me to this appointment"

**For partners: supporting each other**

Partners often experience TTC differently -- different levels of worry, different coping styles, different timelines for processing. This can create distance. Checking in about what each of you needs, rather than assuming you should feel the same way, matters.

**Community can look different things**

A close friend, a supportive online group, a therapist, a fertility support group -- community does not have to be large. One or two people who truly understand can be enough.',
'mental-health', 4, ARRAY['loneliness', 'support', 'trying-to-conceive', 'community', 'planning'], true, true),

('planning', 0,
'Managing Anxiety About Becoming a Parent',
'Anticipatory anxiety about parenthood is more common than you think.',
'Wanting to become a parent and feeling anxious about becoming one are not contradictory. Both can be completely true at once.

**What anticipatory anxiety looks like**

- Wondering whether you are ready, whether you will be a good parent
- Obsessively researching every aspect of pregnancy and parenting
- Worrying about your relationship changing, your freedom, your identity
- Fear of something going wrong with the pregnancy or the baby
- Anxiety about your own childhood and whether you will repeat patterns

All of these are common. They do not mean you are not ready, or that you will not be a good parent.

**The research spiral**

Many people respond to fertility and pregnancy anxiety by researching obsessively -- forums, papers, statistics. This can feel productive while actually increasing anxiety. Information is genuinely useful up to a point, and then it becomes a way of trying to control what cannot be controlled.

Notice if research is calming you or escalating your worry. Choosing reliable sources -- medical institutions, established parenting organisations -- over anonymous forums is a good starting point.

**You do not need to feel ready**

Very few parents feel fully ready before their first child. Readiness is built in the doing, not achieved in advance. The fact that you are thinking carefully about this at all suggests you are taking it seriously in the right ways.

**When to get extra support**

If anxiety is intrusive -- constant, hard to set aside, affecting your sleep or relationships -- a therapist who works with perinatal mental health can provide real tools. Cognitive behavioural therapy and acceptance and commitment therapy both have good evidence for anxiety management.',
'mental-health', 4, ARRAY['anxiety', 'parenthood', 'anticipatory-anxiety', 'mental-health', 'planning'], true, true),

('planning', 0,
'Preparing Your Relationship for Parenthood',
'The conversations worth having before a baby changes everything.',
'Having a baby is one of the most significant changes a relationship can go through. Some preparation before conception -- and before the chaos of the newborn period -- can make a real difference.

**Start with the big conversations**

- **Division of labour**: Who will take parental leave? How will night feeds and childcare be shared? What happens to careers?
- **Finances**: How will the costs of raising a child affect your household? Will one partner reduce work hours?
- **Location and family support**: Do you have family nearby? Do you want them involved in childcare?
- **Parenting values**: Discipline approaches, schooling, religion, cultural traditions, what matters to each of you?

These conversations are not about getting everything resolved -- they are about knowing where each other stands and beginning to align.

**Different timelines and desires**

If one partner is more eager to start trying than the other, this is worth addressing honestly. Resentment built up before a baby arrives tends to compound under the sleep deprivation and stress of new parenthood.

**Solo parenting by choice**

If you are planning to parent alone -- through donor conception, adoption, fostering, or other paths -- preparing your support network is especially important. Who will be your village? Practical planning now reduces pressure later.

**Relationship maintenance during TTC**

The focus on timing, testing, and outcomes can make sex feel mechanical and cause couples to drift. Intentionally investing in connection -- time together that has nothing to do with conception -- matters more than people often realise.

**Counselling is not just for crisis**

Seeing a couples therapist before a baby arrives, rather than after things become difficult, is increasingly recognised as a wise investment. Many therapists offer preconception or "parenting preparation" sessions.',
'mental-health', 4, ARRAY['relationship', 'parenthood', 'communication', 'planning', 'couples'], true, true),

-- ── HEALTH ────────────────────────────────────────────────────────────────────

('planning', 0,
'Your Preconception Health Checklist',
'Everything worth reviewing with your doctor before you start trying.',
'A preconception visit is one of the most valuable appointments you can make -- yet many people skip it. Here is what to cover.

**General health review**

- Blood pressure check
- Blood glucose screening (especially with a family history of diabetes)
- Full blood count and iron stores
- Thyroid function (undiagnosed thyroid conditions can affect fertility and early pregnancy)
- STI screening where relevant

**Reproductive health review**

- Cervical screening up to date?
- Any menstrual irregularities worth investigating before conception?
- Any history of infections that could affect fertility (such as chlamydia, which can cause tubal damage without symptoms)?

**Dental health**

Pregnancy increases the risk of gum disease, which has been associated with preterm birth. Getting a dental check-up before conception is a genuinely good idea.

**Vaccination review**

Rubella (German measles) infection during pregnancy can cause serious harm to the developing baby. If you are not immune, vaccination should happen at least one month before trying to conceive. Other vaccinations to discuss include varicella (chickenpox), hepatitis B, and COVID-19.

**Weight and metabolic health**

Both very low and very high body weight can affect fertility. Polycystic ovary syndrome (PCOS), which affects 1 in 10 women of reproductive age globally, is worth investigating if periods are irregular.

**For both partners**

Male fertility accounts for roughly half of all fertility challenges. A semen analysis can be requested from a GP or urologist. Lifestyle factors including smoking, alcohol, anabolic steroids, and heat exposure all affect sperm quality.

**Ask about your medications**

Some prescription medications are not safe during pregnancy. Now is the time to review every medication and supplement you take -- not to stop anything without guidance, but to ensure your healthcare provider is informed.',
'health', 4, ARRAY['preconception-health', 'health-check', 'GP', 'fertility', 'planning'], true, true),

('planning', 0,
'Medications to Review Before Getting Pregnant',
'Some medications need to change before conception -- here is what to discuss with your doctor.',
'If you take any regular medications, a preconception conversation with your doctor is essential. Some treatments need to be switched, tapered, or stopped before conception -- but never without medical guidance.

**Do not stop any medication without speaking to your doctor first**

This bears saying clearly: suddenly stopping certain medications can be more dangerous than continuing them. Always discuss changes with your prescribing doctor.

**Medications commonly reviewed before conception**

- **Isotretinoin (Accutane and equivalents)**: Used for acne, this is teratogenic -- it causes birth defects. Most guidelines require effective contraception during treatment and for at least one month (sometimes longer) after stopping. If you are on this medication, speak with your dermatologist about your plans.

- **Valproate (sodium valproate/valproic acid)**: Used for epilepsy and bipolar disorder. Associated with significant risks in pregnancy. Alternative medications exist -- do not stop without specialist guidance.

- **Methotrexate**: Used for autoimmune conditions including rheumatoid arthritis and psoriasis. Must be stopped before conception, with a washout period. Your rheumatologist or dermatologist can advise.

- **Warfarin and some other anticoagulants**: Associated with risks in early pregnancy. Switching to alternatives like low-molecular-weight heparin is often recommended.

- **Some antihypertensive medications**: Certain blood pressure medications are not safe during pregnancy. Your doctor can switch you to alternatives that are better tolerated.

**Herbal supplements**

St John''s Wort, high-dose evening primrose oil, and several other herbal supplements may interact with medications or have effects in early pregnancy. Discuss these too.

**Mental health medications**

This is an area requiring careful, individual discussion. The risks of untreated mental illness during pregnancy are also real. Work with your psychiatrist or GP -- do not make decisions alone.',
'health', 4, ARRAY['medications', 'preconception', 'prescription', 'safety', 'planning'], true, true),

('planning', 0,
'Managing Chronic Conditions Before and During Pregnancy',
'Having a health condition does not mean you cannot have a healthy pregnancy.',
'Many people with chronic health conditions go on to have healthy pregnancies. The key is planning -- and working closely with your healthcare team.

**Diabetes (Type 1 and Type 2)**

Blood glucose control before conception significantly reduces the risk of complications. HbA1c levels are typically assessed before giving the green light to try. Folic acid at a higher dose (5mg) is often recommended. Your diabetes care team and obstetrician should be involved from the start.

**Thyroid conditions**

Both underactive (hypothyroidism) and overactive (hyperthyroidism) thyroid function can affect fertility and increase miscarriage risk. Thyroid levels should be optimised before conception and monitored closely throughout pregnancy. If you take thyroid medication, your dose often needs adjusting in the first trimester.

**Autoimmune conditions**

Conditions like lupus, rheumatoid arthritis, and inflammatory bowel disease require careful review. Some medications need to change; others are safe to continue. Disease activity at conception matters -- better-controlled disease generally means lower-risk pregnancy.

**Epilepsy**

This requires specialist preconception planning. Medication review is essential, as some anti-epileptic drugs are associated with higher folic acid doses and some require switching. Uncontrolled seizures in pregnancy carry their own risks. Work with your neurologist.

**Mental health conditions**

Depression and anxiety left untreated during pregnancy and postpartum carry real risks for both the birthing person and baby. Treatment decisions during pregnancy are nuanced -- for most people, the benefits of continued treatment outweigh the risks of stopping. Work with your mental health provider.

**The message**

A chronic condition does not disqualify you from parenthood. It means working more closely with your medical team -- which is exactly what that team is there for.',
'health', 4, ARRAY['chronic-conditions', 'diabetes', 'thyroid', 'autoimmune', 'planning'], true, true),

('planning', 0,
'Vaccinations to Check Before You Conceive',
'Some vaccines need to be given before pregnancy -- here is what to review.',
'Checking your vaccination status is a practical and often overlooked step in preconception health. Some vaccines cannot be given during pregnancy, so confirming immunity now gives you options.

**Rubella (German measles)**

Rubella infection during pregnancy can cause constillbirth or serious abnormalities including deafness, heart defects, and cataracts in the baby. The MMR (measles, mumps, rubella) vaccine is live and should not be given during pregnancy. If you are not immune, you should be vaccinated at least one month before trying to conceive.

**Varicella (chickenpox)**

Chickenpox in pregnancy can cause complications for both the pregnant person and the baby. If you have never had chickenpox and are not vaccinated, speak with your doctor. The varicella vaccine is live and also needs to be given before pregnancy.

**How to check your immunity**

A simple blood test can measure antibody levels for both rubella and varicella. Ask your GP or primary care provider.

**Hepatitis B**

Hepatitis B can be transmitted from a birthing parent to a newborn. If you are not vaccinated, this series can usually be started before pregnancy and continued if needed.

**Flu vaccine**

Influenza during pregnancy increases the risk of complications. The flu vaccine is safe and recommended during pregnancy, but starting the season already vaccinated is ideal.

**COVID-19**

COVID-19 vaccines are recommended for those who are pregnant or planning pregnancy in most global health guidelines. Speak with your doctor about the current guidance in your country.

**Global context**

Vaccine schedules vary by country. What matters most is reviewing your specific history with your healthcare provider and filling any gaps that can be addressed before conception.',
'health', 4, ARRAY['vaccines', 'rubella', 'varicella', 'preconception', 'immunity', 'planning'], true, true),

-- ── DEVELOPMENT (understanding fertility and conception) ──────────────────────

('planning', 0,
'How Conception Works: A Clear Guide',
'Understanding the biology of conception, step by step.',
'Understanding conception does not require a medical degree -- but a clear picture of the process can reduce anxiety and help you time things well.

**The menstrual cycle**

The menstrual cycle is typically counted from day one of a period. In a textbook 28-day cycle, ovulation occurs around day 14. But cycles vary enormously between individuals -- anywhere from 21 to 35 days is common -- and ovulation timing shifts accordingly.

**Ovulation**

Ovulation is when a mature egg is released from one of the ovaries. The egg can be fertilised for roughly 12 to 24 hours after release. Sperm, however, can survive in the reproductive tract for up to five days. This means the fertile window extends to the five or so days before ovulation plus the day of.

**Fertilisation and implantation**

If a sperm reaches and fertilises the egg, a zygote forms. It travels down the fallopian tube over three to five days, dividing as it goes, and implants in the uterine lining around day 6 to 10 after fertilisation.

**Why it does not always work immediately**

Even with well-timed intercourse, each cycle carries roughly a 15 to 25% chance of conception for people of typical fertility under 35. This is not failure -- it is biology. Most couples conceive within 12 months of trying.

**What affects sperm**

Both partners contribute to the chances of conception. Sperm quality -- count, motility, morphology -- is affected by age, lifestyle, heat exposure, and health conditions. Male factor infertility is present in roughly half of all cases where conception takes longer than expected.',
'development', 3, ARRAY['conception', 'ovulation', 'fertilisation', 'menstrual-cycle', 'planning'], true, true),

('planning', 0,
'Understanding Your Cycle and Fertile Window',
'Practical ways to identify when you are most likely to conceive.',
'Knowing your fertile window is one of the most practical things you can do when trying to conceive. Here is how to identify it.

**Cycle length varies -- and that is normal**

The fertile window is roughly five days before ovulation plus ovulation day itself. To find it, you need to identify when you ovulate -- which depends on your cycle length.

If your cycle is consistently 28 days, ovulation is likely around day 14. If your cycle is 32 days, ovulation is likely around day 18. If cycles vary from month to month, fertile window prediction is less precise.

**Basal body temperature (BBT)**

Your resting temperature rises by 0.2 to 0.5 degrees Celsius after ovulation due to progesterone. Tracking this every morning before getting up can, over several cycles, reveal a pattern. The limitation: it confirms ovulation has already happened, rather than predicting it in advance.

**Cervical mucus changes**

As ovulation approaches, vaginal discharge changes to a clear, stretchy consistency often compared to raw egg white. This is fertile-quality cervical mucus and indicates the body is approaching ovulation. Learning to notice this takes a few cycles but is free and always available.

**Ovulation predictor kits (OPKs)**

These detect the LH surge that occurs 24 to 36 hours before ovulation. They are widely available and reasonably reliable for people with regular cycles.

**Cycle tracking apps**

Apps that predict ovulation based on cycle history alone use averages and can be significantly off for people with irregular cycles. Apps combined with BBT or OPK data are more accurate.

**You do not have to track everything**

Some people find tracking empowering; others find it adds stress. Having regular intercourse every two to three days throughout the fertile window -- without precise timing -- is also an effective approach and can feel less pressured.',
'development', 4, ARRAY['ovulation', 'fertile-window', 'BBT', 'cycle-tracking', 'OPK', 'planning'], true, true),

('planning', 0,
'Age and Fertility: What the Research Actually Says',
'A realistic and non-alarmist look at how age affects conception.',
'Few topics generate more anxiety for people planning families than age and fertility. The reality is more nuanced than the headlines suggest.

**What changes with age**

Egg quality and quantity do decline with age. This is a biological reality. But the decline is gradual, not a sudden drop at 35 -- the age often cited as a fertility "cliff edge." The 35 figure comes largely from 18th-century French church records and does not reflect modern reproductive medicine.

For most people in their mid-to-late thirties, fertility is lower than in their twenties but still very much present. The chance of conceiving naturally each cycle decreases, and the time to conception may be longer on average.

**Male fertility also changes with age**

Sperm quality -- motility, morphology, and DNA integrity -- declines gradually with age, particularly after 45. This is discussed less often but is equally relevant.

**What age does not change**

The love and capacity for parenthood. Older parents often have greater financial stability, more established relationships, and a clearer sense of what they value. Research on child outcomes for children of older parents is generally positive.

**Miscarriage risk**

Chromosomal abnormalities in embryos do become more common with age, which is why miscarriage rates increase. This is a painful reality worth knowing, not to cause fear, but so that if it happens, people understand it is rarely caused by anything they did.

**Assisted reproduction**

If conception is taking longer than expected, assisted reproductive technologies including IUI and IVF are more accessible than ever, though access varies widely by country and healthcare system.

**The bottom line**

If you are in your mid-thirties or older and planning a pregnancy, having a preconception conversation with your doctor sooner rather than later is sensible. It is not a reason for panic -- it is a reason for informed planning.',
'development', 4, ARRAY['age', 'fertility', 'egg-quality', 'sperm', 'planning'], true, true),

('planning', 0,
'When to Seek Help from a Fertility Specialist',
'Knowing when to reach out -- and what to expect when you do.',
'Seeking help is not failure. For many people, it is the most proactive thing they can do.

**General guidelines**

Most fertility guidelines suggest seeking evaluation after:
- 12 months of regular unprotected intercourse for people under 35
- 6 months for people 35 and over
- Sooner if there are known factors: irregular or absent periods, previous pelvic infections, endometriosis, a known male factor issue, or multiple miscarriages

These are starting points, not rules. If something feels wrong, or if you have known risk factors, there is no reason to wait.

**Both partners should be evaluated**

Male factor infertility is involved in roughly half of all cases. A semen analysis is a relatively simple, non-invasive test that can be arranged through a GP or urologist. It is worth doing early, as it provides important information regardless of the result.

**What the initial evaluation typically involves**

- Hormone tests: FSH, LH, oestradiol, AMH (ovarian reserve), thyroid
- Pelvic ultrasound: to visualise ovaries and uterus, count antral follicles
- Hysterosalpingography (HSG) or sonohysterogram: to check whether fallopian tubes are open
- Semen analysis for the partner

**What does not necessarily mean IVF**

Many causes of delayed conception are addressable without IVF. Ovulation induction, lifestyle changes, surgical treatment of conditions like fibroids or endometriosis, and intrauterine insemination (IUI) all have roles.

**Access and equity**

Fertility treatment is not equally accessible everywhere. Costs, clinic availability, and what insurance or public healthcare covers vary enormously. Knowing your options in your specific context is worth researching. Patient advocacy organisations and online communities can be helpful resources.

**It is okay to feel the emotions this brings up**

Seeking fertility help is a significant step. Whatever you feel -- relief at finally getting answers, grief, hope, anxiety -- is valid.',
'development', 5, ARRAY['fertility-specialist', 'IVF', 'semen-analysis', 'evaluation', 'planning'], true, true),

-- ── RELATIONSHIPS ─────────────────────────────────────────────────────────────

('planning', 0,
'Having the Important Conversations Before Baby',
'The topics most couples wish they had discussed earlier.',
'The newborn period has a way of surfacing every unresolved tension in a relationship. Having some of the big conversations now -- before exhaustion makes everything harder -- is genuinely useful.

**Money**

Raising a child changes finances significantly. Questions worth discussing:
- Will both partners continue working full-time?
- Who will take parental leave, and for how long? (Policies vary enormously by country and employer.)
- How will childcare costs be handled?
- Do you have emergency savings? What is the plan if one income disappears temporarily?
- How are financial decisions made in your household now, and how might that change?

**Division of care**

Research consistently shows that household and childcare labour is distributed unequally in most households, and that this disparity tends to increase after a baby. Talking explicitly about expectations -- feeding, night wakings, nappy changes, medical appointments, mental load -- before the baby arrives is more effective than assuming.

**Extended family and cultural expectations**

What role will grandparents play? What cultural or religious traditions matter to you? Where do you draw the line when family input conflicts with your choices? If you come from different cultural backgrounds, how will you navigate those differences for your child?

**What happens if things get hard**

Discussing this is not pessimistic -- it is wise. If postnatal depression occurs, if one partner struggles, if the relationship goes through a difficult patch -- what is the plan? Who do you both trust to reach out to?

**You will not solve everything**

These conversations are not about having all the answers. They are about being in the habit of talking about the hard things -- a habit that will serve you well throughout parenthood.',
'relationships', 4, ARRAY['relationships', 'communication', 'finances', 'planning', 'couples'], true, true),

('planning', 0,
'Aligning on Parenting Philosophy with Your Partner',
'Finding shared ground on the values that will shape your family.',
'You and your partner do not need to agree on everything to raise a child well together. But knowing where you agree, where you differ, and how you will handle disagreements matters.

**Attachment and responsiveness**

Do you both believe in responding quickly to an infant''s cries, or does one of you lean toward "letting them settle"? Understanding each other''s instincts here -- which are often shaped by your own childhoods -- is a useful starting point.

**Discipline approaches**

What did discipline look like in your childhood? What do you want to carry forward, and what do you want to do differently? Research on child development broadly supports warm, consistent, age-appropriate boundaries -- but how those are implemented varies between families and cultures.

**Education and learning**

Do you have strong views on schooling -- state versus private, religious versus secular, home schooling? What about language? If you speak different languages, will you raise the child bilingually?

**Cultural and religious identity**

How important is cultural heritage to each of you? Religion, traditions, festivals, language, food -- how will you pass these on, or balance them between two different backgrounds?

**The reality is you will disagree sometimes**

Even people who have discussed all of this will disagree in the moment. What matters most is: can you disagree respectfully, hear each other out, and come to workable solutions? That capacity is more important than any specific agreement reached before the baby arrives.

**A family counsellor or therapist can help**

If there are significant differences in values or significant disagreement, a few sessions with a couples therapist or family counsellor can be genuinely productive. This is not a sign of relationship trouble -- it is a sign of taking parenthood seriously.',
'relationships', 4, ARRAY['parenting-values', 'relationship', 'culture', 'communication', 'planning'], true, true),

('planning', 0,
'Building Your Village Before You Need It',
'Social support is one of the strongest predictors of parenting wellbeing. Start building it now.',
'The phrase "it takes a village to raise a child" exists for good reason. Isolation in early parenthood is associated with higher rates of postnatal depression and lower parenting satisfaction. Building your support network before the baby arrives is one of the most practical things you can do.

**Who is already in your village?**

Think about who in your life you could call at 2am. Who would genuinely show up? Who makes you feel better after spending time with them? These are your people. Invest in those relationships now.

**Being specific about asking for help**

Most people want to help but do not know how. Vague offers ("let me know if you need anything") often go unclaimed because new parents are too exhausted to coordinate. Specific requests work better: "Could you bring a meal on Thursday?" or "Could you hold the baby for an hour while I sleep?"

Start practising asking for help now, before you need it urgently.

**Online community as a supplement**

Online parenting communities, apps like this one, and local parenting groups can extend your village meaningfully -- especially for people who have moved away from family or live in areas where their peers do not yet have children. They work best as a supplement to in-person connection, not a replacement.

**For those without close family nearby**

Many people raise children far from their families of origin. Expat communities, local parent groups, faith communities, and neighbourhood connections can all become sources of support. Seeking these out before the baby arrives -- when you have more energy -- gives relationships time to develop.

**For solo parents**

If you are parenting alone, your village is not optional -- it is essential. Being very deliberate about who is in it, and having frank conversations with those people about what you will need, matters enormously.',
'relationships', 4, ARRAY['support-network', 'community', 'village', 'social-support', 'planning'], true, true),

('planning', 0,
'Parenting Solo by Choice: Planning for a Different Path',
'For those planning to parent without a partner, here is what to think about before you begin.',
'Single parenting by choice -- through donor conception, adoption, fostering, or other paths -- is increasingly common and takes courage and intention to plan well.

**Clarifying your motivation and readiness**

This is not about doubting yourself -- it is about being honest with yourself. Are you choosing solo parenthood because you genuinely want to parent and have not found the right partner, or because you feel pressured by a biological clock? Both are valid starting points, but clarity helps with planning.

**Routes to parenthood**

- **Donor conception (sperm or egg donor)**: Access to registered donors varies by country. In some countries, donor-conceived children have the right to know their donor''s identity when they come of age. In others, anonymous donation is still common. Consider what kind of information you want your child to have access to.
- **Adoption**: Processes, eligibility criteria, and timelines vary significantly by country and region.
- **Co-parenting arrangements**: Some people plan to co-parent with a friend or known person without a romantic relationship. These arrangements require very clear legal agreements.

**Legal and financial planning**

Single parenting without a co-parent means sole financial responsibility. Review:
- Your income, savings, and maternity or parental leave entitlements
- Life insurance and wills -- who would care for your child if something happened to you?
- Legal parentage in donor conception scenarios (laws vary)

**Building your support network**

Your village is especially important when there is one of you. Be explicit with friends and family about what you are planning and what you will need. Communities of single parents by choice exist in most countries and online -- finding yours before you conceive is valuable.

**Talking to your child about their origins**

Research consistently supports being open with donor-conceived children about their origins from an early age. Deciding now how you want to approach this gives you time to prepare.',
'relationships', 5, ARRAY['solo-parenting', 'donor-conception', 'single-parent', 'adoption', 'planning'], true, true),

-- ── SAFETY ────────────────────────────────────────────────────────────────────

('planning', 0,
'Alcohol Before and During Early Pregnancy',
'What the evidence shows -- and a realistic approach to reducing intake.',
'Questions about alcohol and conception are common, and the answers deserve honesty rather than oversimplification.

**During established pregnancy**

Current guidance from health authorities worldwide is consistent: no alcohol consumption has been established as safe during pregnancy. Alcohol crosses the placenta and can affect fetal development. The most well-established harm is Fetal Alcohol Spectrum Disorder (FASD), associated with heavy, consistent drinking.

**Before you know you are pregnant**

The neural tube -- the structure that becomes the brain and spinal cord -- closes at around 4 weeks of pregnancy, often before a person knows they are pregnant. This is why guidance to avoid alcohol while trying to conceive exists.

**The evidence on light drinking during TTC**

The evidence on occasional light drinking before a confirmed pregnancy is genuinely less clear than for drinking during confirmed pregnancy. Some studies show no effect from occasional light drinking before conception; others suggest even light intake may reduce monthly conception rates slightly.

**A practical approach**

Rather than a rule you feel unable to follow and then feel guilty about, consider:
- Reducing intake gradually during the months leading up to trying to conceive
- Stopping or largely stopping once you are actively trying
- Not drinking during the two-week wait

**Without shame**

Alcohol is embedded in social life across many cultures. If you have drunk before knowing you were pregnant, you are not alone -- many pregnancies are unplanned, and guilt about early alcohol exposure is very common and very rarely warranted. Speak with your doctor if you are concerned.',
'safety', 4, ARRAY['alcohol', 'preconception', 'safety', 'FASD', 'planning'], true, true),

('planning', 0,
'Medications and Substances to Stop Before TTC',
'A practical guide to what to review -- and how to do it safely.',
'Some medications and substances need to change before trying to conceive. But how you make changes matters as much as the changes themselves.

**The golden rule: do not stop anything without speaking to your doctor**

This applies especially to prescription medications. Suddenly stopping antidepressants, anti-epileptics, blood pressure medications, or other regular prescriptions can be more dangerous than continuing them in the short term. Always discuss changes with your prescribing doctor.

**Medications most commonly reviewed**

- **Isotretinoin (for acne)**: Teratogenic. Must be stopped well before trying to conceive, with a waiting period after stopping. Your dermatologist will advise on timing.
- **Valproate**: Used for epilepsy and bipolar disorder. Significant teratogen. Do not stop without specialist guidance -- alternatives exist.
- **Methotrexate**: Used for autoimmune conditions. Must be stopped before conception with a washout period.
- **Some acne antibiotics**: Discuss with your dermatologist.

**Recreational substances**

- **Tobacco/nicotine**: Smoking reduces fertility in both partners and significantly increases pregnancy complications. Quitting before conception is one of the highest-impact changes you can make.
- **Cannabis**: Evidence suggests cannabis affects sperm quality and may affect implantation. Stopping before TTC is advised.
- **Other recreational drugs**: Should be discussed honestly with your doctor.

**Herbal supplements**

Some herbal supplements can interfere with fertility or early pregnancy. St John''s Wort interacts with many medications. High-dose herbal preparations should be reviewed with a pharmacist or doctor.',
'safety', 4, ARRAY['medications', 'substances', 'smoking', 'cannabis', 'preconception', 'safety', 'planning'], true, true),

('planning', 0,
'Workplace Hazards and Pregnancy Planning',
'Knowing your rights and your risks before you need to act on them.',
'For many people, work-related exposures are a real concern when planning a pregnancy. Here is what to know.

**Types of workplace hazards relevant to pregnancy planning**

- **Chemical exposures**: Solvents, pesticides, heavy metals (lead, mercury), anaesthetic gases, certain cleaning products
- **Radiation**: Ionising radiation in healthcare, nuclear, or industrial settings
- **Physical demands**: Prolonged standing, heavy lifting, shift work
- **Infectious hazards**: Healthcare workers may have increased exposure to certain infections harmful in pregnancy

**What to do**

First, identify whether your role involves any of these. Your employer is legally required (in most countries) to carry out a workplace risk assessment once you inform them of a pregnancy -- but many hazards are better addressed before conception.

**Know your rights**

Employment protections for pregnant workers and those planning pregnancy vary by country, but most jurisdictions provide some protections. In many countries, employers are required to offer alternative duties or adjust working conditions once a pregnancy is disclosed.

**Practical steps before TTC**

- Review your workplace''s health and safety policies
- Speak to your occupational health department if your employer has one
- Document any concerns
- Talk to your GP or obstetrician about specific exposures -- they can advise on actual risk levels

**A note on night shifts**

Shift work, particularly night shifts, disrupts circadian rhythms and melatonin production, which affects reproductive hormones. If you do regular night shifts, discussing this with your doctor before TTC is worth doing.',
'safety', 4, ARRAY['workplace', 'occupational-health', 'hazards', 'rights', 'planning'], true, true),

('planning', 0,
'Environmental Factors at Home to Consider Before Conceiving',
'Simple, practical steps to reduce household environmental risks.',
'Concern about household environmental factors is understandable -- but it is easy for this topic to become overwhelming. Here is a grounded, prioritised approach.

**Lead**

Lead paint was widely used in homes built before the 1970s-1980s in many countries. If your home was built before this period and has not been renovated, lead paint may be present. Disturbing it (through sanding or drilling) releases lead dust, which is particularly harmful in pregnancy.

What to do: If you are planning any renovation, get the property assessed for lead paint beforehand. Avoid DIY sanding of old paintwork.

**Mould**

Significant mould growth in the home is associated with respiratory problems and should be addressed regardless of pregnancy plans. Fix the source (usually damp or poor ventilation) rather than just cleaning the surface.

**Pesticides**

If you have a garden or live in an agricultural area, consider reducing pesticide use. Store-bought produce: rinsing thoroughly and peeling where practical reduces residue.

**Plastics and food storage**

Replacing single-use plastic food containers with glass, stainless steel, or ceramic is a reasonable, practical swap. Avoid microwaving food in plastic containers.

**Water quality**

In many parts of the world, tap water is safe and well-regulated. In some older properties or regions, lead pipes may affect water quality. If in doubt, a water filter certified for heavy metals is an option.

**Air quality**

Ventilate your home regularly. If you live in an area with significant outdoor pollution, indoor air filters can help. Avoid burning incense or candles in unventilated spaces for prolonged periods.

**Keep perspective**

Humans have been conceiving and bearing children in imperfect environments throughout history. These steps are about sensible risk reduction, not perfection.',
'safety', 4, ARRAY['home-environment', 'lead', 'pesticides', 'toxins', 'air-quality', 'planning'], true, true),

-- ── FEEDING ───────────────────────────────────────────────────────────────────

('planning', 0,
'Thinking About Infant Feeding Before Baby Arrives',
'Why it helps to start thinking about feeding decisions before you''re in the thick of it.',
'Feeding decisions are often made under enormous pressure in the exhausting days after birth. Thinking about them now, while you have the space to reflect, can reduce that pressure later.

**The landscape of infant feeding**

Babies can be fed in several ways:
- Exclusive breastfeeding
- Exclusive formula feeding
- Combination feeding (breast and formula)
- Expressed breast milk via bottle

All of these can result in a well-nourished, thriving baby. The best option is the one that works for your body, your circumstances, your mental health, and your baby.

**Why the pressure is so high**

Breastfeeding is strongly promoted by health organisations worldwide -- and for good reason: when it works well, it offers benefits for both baby and birthing parent. But the intensity of that messaging can leave people who cannot or do not breastfeed feeling like failures. They are not.

**Questions worth beginning to explore**

- Do you want to try breastfeeding?
- If so, what support might you need -- lactation consultant, midwife support?
- If breastfeeding does not work out, how do you feel about formula?
- Will your partner or co-parent be involved in feeding? How?
- Does your workplace have provisions for expressing milk, if relevant?

**You can change your mind**

No decision made now is binding. The goal is simply to have thought it through enough that whatever happens feels like a choice rather than something that happened to you.',
'feeding', 3, ARRAY['infant-feeding', 'breastfeeding', 'formula', 'planning', 'preconception'], true, true),

('planning', 0,
'Preparing for Breastfeeding: What to Know Now',
'Knowledge before birth makes the early days easier.',
'Breastfeeding is a skill -- for both the parent and the baby. Like most skills, it goes more smoothly when you have some foundation of knowledge going in.

**How breastfeeding works**

Breast milk production works on a supply-and-demand principle. The more milk is removed from the breast (through feeding or expressing), the more is produced. In the first days, the breasts produce colostrum -- a small volume of highly concentrated first milk that is exactly right for a newborn''s tiny stomach.

**Common early challenges**

- **Latch difficulties**: The single biggest factor in breastfeeding success is a good latch. A baby feeding from the nipple alone rather than a mouthful of breast tissue is painful and inefficient. A lactation consultant or trained midwife can assess and correct this.
- **Engorgement**: When milk "comes in" (usually day 3-4), breasts can become very full and firm. Frequent feeding helps.
- **Concern about supply**: Most people who want to breastfeed can, but worry about supply is extremely common. A good indicator of adequate intake is regular wet nappies and steady weight gain.

**What helps**

- Skin-to-skin contact in the first hour after birth, where possible
- Feeding on demand rather than on a schedule in the early weeks
- Getting hands-on support from a trained professional early, rather than waiting until problems are established
- Knowing who to call: a lactation consultant (IBCLC), your midwife, or a breastfeeding helpline

**Before birth**

Attending a breastfeeding preparation class or reading a reliable guide now means you will recognise what is normal when you are in the middle of it.',
'feeding', 4, ARRAY['breastfeeding', 'lactation', 'latch', 'colostrum', 'planning'], true, true),

('planning', 0,
'Formula Feeding: Making an Informed and Guilt-Free Choice',
'Everything you need to know about formula -- without the judgment.',
'For many families, formula feeding is the right choice -- chosen freely, or arrived at when breastfeeding does not work out. Either way, formula is a safe, nutritionally complete option for feeding a baby.

**Modern infant formula**

Infant formulas are regulated in most countries and are designed to meet all of a baby''s nutritional needs in the first six months of life. They contain proteins, fats, carbohydrates, vitamins, and minerals in carefully calibrated proportions.

**Types of formula**

- **Standard cow''s milk-based formula**: Suitable for most babies
- **Partially hydrolysed formula**: Sometimes used for babies with mild sensitivity; discuss with your healthcare provider
- **Extensively hydrolysed or amino acid formula**: For babies with confirmed cow''s milk protein allergy; prescribed or recommended by a doctor
- **Soy-based formula**: Used in some contexts; discuss suitability with your doctor
- **Goat milk formula**: Available in some countries; regulated similarly to cow''s milk formula

**Safe preparation**

The most important aspects of formula safety are:
- Clean water (boiled where tap water is not safe)
- Sterilised equipment
- Correct powder-to-water ratio (never dilute or concentrate formula to save money)
- Use within two hours of preparation

**Formula and bonding**

Bonding with a baby happens through touch, eye contact, talking, and being present -- not through the feeding method. Bottle feeding allows the non-birthing partner or others to take full feeds, which many families find valuable.

**The guilt is not warranted**

A fed baby is a thriving baby. Full stop.',
'feeding', 4, ARRAY['formula', 'infant-formula', 'bottle-feeding', 'planning', 'fed-is-best'], true, true),

('planning', 0,
'Releasing the Pressure Around Feeding Decisions',
'Why the feeding debate is so charged -- and how to step back from it.',
'Few parenting topics generate as much heat as how babies are fed. Understanding where that pressure comes from can help you step back from it.

**Why this topic is so charged**

Breastfeeding advocates -- many of them well-intentioned -- sometimes communicate in ways that leave formula-using parents feeling like they have failed. Formula companies have historically marketed aggressively in ways that undermined breastfeeding in communities that needed it. Both things are true. The result is a topic that carries more emotional baggage than it deserves.

**What the evidence actually shows**

Breastfeeding does offer benefits -- particularly in settings where safe water and adequate income are not guaranteed, where the protection against gastrointestinal infections is especially valuable. In high-resource settings, the differences in outcomes between breastfed and formula-fed babies are real but generally modest.

The significant mental health impact of a breastfeeding experience that is painful, unsupported, or not working is also real and also matters.

**Cultural variation**

Breastfeeding rates and cultural attitudes vary enormously worldwide. In some cultures, supplementing with formula or water is the norm. In others, exclusive breastfeeding for six months is standard. Neither approach is universal, and judging families outside your own cultural context is rarely helpful.

**What actually matters for babies**

- Adequate nutrition (from any safe source)
- Responsive, loving caregiving
- Physical touch and connection
- A calm, relatively low-stress household

None of these require a specific feeding method.

**Give yourself permission**

You are allowed to choose based on your own body, circumstances, mental health, and family situation. You are allowed to change your mind. You are allowed to prioritise your own wellbeing alongside your baby''s.',
'feeding', 4, ARRAY['feeding-pressure', 'fed-is-best', 'breastfeeding', 'formula', 'planning', 'mental-health'], true, true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. TODDLER MENTAL-HEALTH ARTICLES (was 1, adding 4 more)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.content_articles (stage, week_or_month, title, subtitle, body, category, reading_time_minutes, tags, medically_reviewed, culturally_sensitive) VALUES

('toddler', 13,
'Your Toddler''s Big Feelings: What''s Normal and Why',
'Tantrums are not misbehaviour -- they are development in action.',
'If your toddler erupts into tears over the wrong-coloured cup or dissolves on the floor because their banana broke, you are not alone. This is one of the most universal experiences of toddler parenthood.

**Why toddlers have such big feelings**

The emotional experience of a toddler is intense. They feel joy, frustration, fear, and rage as powerfully as adults do -- but they have almost none of the neurological infrastructure for managing those feelings. The prefrontal cortex, the part of the brain responsible for impulse control, reasoning, and emotional regulation, is not fully developed until the mid-twenties.

Tantrums are not manipulation. They are not "naughtiness." They are a child''s nervous system being overwhelmed.

**What helps in the moment**

- **Stay calm yourself** (easier said than done, but your regulated nervous system helps regulate theirs)
- **Name the feeling**: "You''re really frustrated that the banana broke. That feels so disappointing."
- **Stay close without forcing contact**: Some children want to be held during a meltdown; others need space
- **Wait it out**: Trying to reason with a child mid-tantrum rarely works -- the thinking brain is offline
- **Reconnect after**: A hug and calm return to connection after the storm is powerful

**What does not help**

- Shaming or punishing the emotion (shaming the behaviour is different)
- Matching their intensity
- Giving in to requests made during a meltdown (this is not about being harsh -- it is about consistency)

**Emotional regulation is a skill, not a character trait**

Children learn to regulate their emotions by repeatedly experiencing a caring adult helping them come back to calm. You are teaching this skill every time you stay steady through a tantrum.',
'mental-health', 4, ARRAY['tantrums', 'emotional-regulation', 'toddler-development', 'big-feelings'], true, true),

('toddler', 18,
'Separation Anxiety in Toddlers: Why It Peaks and How to Help',
'Clingy behaviour is a sign of secure attachment -- and a normal developmental stage.',
'Your toddler was fine being left with the childminder for months -- and now they are glued to your leg every morning and screaming when you leave. What happened?

**Separation anxiety is a developmental milestone**

Between roughly 12 and 24 months, separation anxiety typically intensifies. This is not a regression -- it is a sign that your child understands you exist even when you are not present (object permanence) and that your leaving is meaningful. Counterintuitively, it is often a sign of secure attachment.

**What is happening in their brain**

Toddlers are beginning to anticipate the future but do not yet have a reliable sense of time. "Mummy is leaving" can feel, to a toddler, like "Mummy might never come back." Their distress is real and genuine, even when the separation is brief.

**Strategies that help**

- **Consistent goodbye rituals**: A specific sequence -- hug, kiss, wave from the window -- gives predictability. Drawn-out goodbyes tend to increase anxiety; brief but warm works better.
- **Transition objects**: A soft toy or item of your clothing that comes with them
- **Acknowledgment over reassurance**: "I know it''s hard when I go. I always come back. I love you." rather than "Don''t cry, it''s fine."
- **Consistency**: The same caregiver, the same routine, the same space where possible

**What makes it worse**

Disappearing without saying goodbye (to avoid the tears) often increases anxiety because the child does not learn that goodbyes are followed by returns.

**It does pass**

For most children, separation anxiety eases through toddlerhood as trust is built through repeated experience: you go, you come back, they survive and even enjoy the time. This understanding develops with repetition and time.',
'mental-health', 4, ARRAY['separation-anxiety', 'attachment', 'toddler', 'childcare', 'clingy'], true, true),

('toddler', 24,
'Supporting Your Toddler Through Change',
'How toddlers process big transitions -- and what helps.',
'Toddlers thrive on predictability. When something significant changes -- a new sibling, a house move, starting nursery -- the disruption can show up in behaviour that feels baffling or frustrating.

**Why change hits toddlers so hard**

Toddlers are building their understanding of the world through patterns and repetition. Routines are not just convenient -- they are how toddlers feel safe. When a familiar pattern breaks, the nervous system responds as if to a threat.

**Common signs a toddler is adjusting to change**

- Sleep disruption: difficulty settling, night waking, early waking
- Regression: returning to behaviours from earlier (thumb sucking, nappy accidents after being potty trained, wanting a bottle)
- Increased tantrums or clinginess
- Changes in appetite

These are all normal responses to transition, not signs that something has gone wrong.

**What helps**

- **Name it simply and honestly**: "We''re moving to a new house. It''s going to feel different at first. We''ll all be there together."
- **Maintain as much routine as possible**: Within whatever is changing, keep what can stay the same -- mealtimes, bedtime routines, familiar objects
- **Expect regression without shaming it**: If your potty-trained child starts having accidents, calmly return to nappies for a while
- **Give it time**: Most toddlers adjust within a few weeks to a couple of months

**New sibling specifically**

The arrival of a new sibling is one of the most significant changes a toddler faces. Involving them where possible, preserving one-on-one time, and accepting that complicated feelings are normal (for you and them) all help.',
'mental-health', 4, ARRAY['change', 'transition', 'new-sibling', 'regression', 'toddler-adjustment'], true, true),

('toddler', 30,
'Toddler Parenting Burnout: Your Mental Health Matters Too',
'The relentlessness of this season is real. So is the help available.',
'Toddler parenting is wonderful and exhausting in roughly equal measure. The physical demands, the emotional intensity, and the relentlessness of keeping a small, determined person alive and regulated takes a toll -- and that toll is rarely discussed honestly enough.

**What toddler parenting burnout feels like**

- Emotional exhaustion that sleep does not fully fix
- Feeling detached or resentful toward your child -- and then guilty about it
- Losing patience far more quickly than you used to
- Dreading the day ahead when you wake up
- Feeling like you have no self left outside of being a parent

These feelings are common. They do not make you a bad parent.

**The decision fatigue is real**

Toddler parents make hundreds of micro-decisions every day. What to feed them, how to respond to the third tantrum before 9am, whether the screen time today was too much, how to handle the hitting phase. This cognitive load is exhausting and often invisible.

**Parental rage**

Flashes of intense anger toward a toddler -- even the impulse to shout or be rougher than you intended -- are more common than parents admit. The shame around it keeps it hidden, which means people suffer in isolation. If this is happening, please speak with your doctor or a therapist. There is help, and it is not a sign you are beyond it.

**What actually helps**

- **Rest**: Even brief, intentional rest matters. Not scrolling -- actual quiet or sleep.
- **Respite**: Someone else taking the child so you can have uninterrupted time, even for a few hours
- **Talking to someone who gets it**: Honest conversation with other parents, or a professional
- **Lowering the bar**: The house does not need to be clean. The meals do not need to be elaborate.
- **Seeking professional support**: Therapy, your GP, a parenting support line -- all are valid options',
'mental-health', 5, ARRAY['burnout', 'parental-wellbeing', 'mental-health', 'toddler', 'self-care', 'parental-rage'], true, true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. TODDLER NUTRITION ARTICLES (was 1, adding 4 more)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.content_articles (stage, week_or_month, title, subtitle, body, category, reading_time_minutes, tags, medically_reviewed, culturally_sensitive) VALUES

('toddler', 12,
'Transitioning to Family Foods: What Toddlers Need',
'Moving from purees to shared meals -- what works and what to watch for.',
'Around 12 months, most toddlers are ready to eat much of what the rest of the family eats. This transition is exciting -- and sometimes bumpy.

**What changes at 12 months**

- Cow''s milk (or a suitable alternative) can now be introduced as a main drink in many guidelines, replacing formula
- Honey is now safe (it must be avoided before 12 months due to botulism risk)
- Most textures are manageable with adequate chewing ability
- Appetite becomes more variable and self-regulated

**What toddlers need nutritionally**

- **Iron**: Critical for brain development and often underprovided. Red meat, legumes, lentils, tofu, fortified cereals, dark leafy greens. Pair plant-based iron with Vitamin C to improve absorption.
- **Calcium**: Dairy (milk, cheese, yoghurt), fortified plant milks, fish with soft bones (like tinned sardines), tofu, leafy greens
- **Healthy fats**: Full-fat dairy, avocado, oily fish, nuts (in age-appropriate forms), eggs
- **Varied protein**: Across animal and plant sources

**Finger foods and textures**

Finger foods support fine motor development and help children learn to self-feed. Offer soft pieces that can be gummed even without molars.

**Choking safety reminders**

- Whole grapes, cherry tomatoes, and blueberries: cut into quarters or halves
- Whole nuts: not appropriate until around age 4 (nut butters are fine, spread thinly)
- Hard raw vegetables: cook or grate finely
- Round, firm foods: always modify the size and shape

**Salt**

Toddlers'' kidneys are still maturing. The daily recommended salt limit for 1-3 year olds is around 2g. Avoid adding salt to food and limit processed foods high in sodium.',
'nutrition', 4, ARRAY['toddler-nutrition', 'finger-foods', 'iron', 'family-foods', 'weaning'], true, true),

('toddler', 15,
'Toddler Food Refusal: Why It Happens and What Actually Helps',
'The science behind fussy eating -- and why pressure tends to backfire.',
'If your toddler has gone from eating everything to refusing most things, you are in good company. Food refusal peaks between 18 and 24 months and affects the vast majority of toddlers.

**Food neophobia: the biological reason**

Food neophobia -- fear of new foods -- is a biological drive that peaks in toddlerhood. Evolutionary theory suggests it developed to protect newly mobile young children from eating unfamiliar and potentially toxic plants. It is not a modern parenting failure. It is ancient biology.

**What does not help**

- **Pressure and coercion**: "Just one more bite," hiding vegetables, rewarding eating with treats. Research consistently shows these approaches increase pickiness over time and can establish unhealthy relationships with food.
- **Separate "kids meals"**: Consistently preparing different food for the toddler can reinforce the idea that family food is not for them.
- **Emotional reactions to refusal**: Frustration and anxiety at mealtimes heighten a child''s stress around food.

**What does help**

The Division of Responsibility model, developed by dietitian Ellyn Satter, is supported by research:
- **Parent''s job**: What food is offered, when, and where
- **Child''s job**: Whether and how much they eat

This approach takes pressure off both parties. Offer, allow refusal, do not force. Keep offering rejected foods alongside accepted ones -- exposure without pressure, over time, works.

**The magic number is 15 to 20 exposures**

Research suggests children may need to be exposed to a new food 15 to 20 times before accepting it. Offering it repeatedly without pressure, even when it is pushed away, is progress.

**When to seek help**

If a toddler is significantly limiting their intake to fewer than 20 foods, dropping weight, showing extreme distress around mealtimes, or gagging on most textures, a paediatric dietitian or feeding therapist can assess whether more support is needed.',
'nutrition', 4, ARRAY['fussy-eating', 'food-refusal', 'neophobia', 'division-of-responsibility', 'toddler-feeding'], true, true),

('toddler', 20,
'Toddler Portion Sizes and Hunger Cues',
'Why toddlers eat less than you expect -- and how to trust the process.',
'One of the most common concerns of toddler parents is that their child is not eating enough. In most cases, they are.

**Toddler stomachs are small**

A rough guide to toddler portion sizes: about one quarter of an adult portion, or one tablespoon of each food per year of age. A one-year-old eating two tablespoons of pasta with some sauce and a small piece of chicken has had a nutritionally adequate meal.

**Growth slows down in toddlerhood**

Infant growth is rapid -- babies triple their birth weight in the first year. Toddler growth slows significantly. With slower growth comes lower caloric need. This is normal and does not indicate a feeding problem.

**Toddlers are good at self-regulating -- when we let them**

Research shows toddlers are born with the ability to regulate their intake to their energy needs. This capacity is best preserved when caregivers offer food without pressure and allow the child to determine how much they eat. It is undermined by pressure, reward systems, and forced eating.

**Grazing versus structured meals**

Constant grazing -- nibbling throughout the day -- can suppress appetite at mealtimes. Most feeding experts recommend three meals and two to three planned snacks, with a clear end to each eating opportunity. This helps build hunger rhythms.

**Growth spurts**

Appetite increases noticeably during growth spurts. These can appear suddenly and feel dramatic. If a toddler is suddenly hungrier, follow their lead.

**Signs to discuss with your doctor**

- Consistent weight loss or failure to gain weight over time
- Extreme pallor or fatigue (iron deficiency)
- Fewer than three to four wet nappies per day (dehydration)
- A significant change in energy or behaviour',
'nutrition', 4, ARRAY['portion-sizes', 'appetite', 'hunger-cues', 'toddler-growth', 'grazing'], true, true),

('toddler', 28,
'Toddler Nutrition Myths -- Sorted',
'Separating the evidence from the noise on toddler food and feeding.',
'Parenting advice about toddler food is everywhere -- and a lot of it is contradictory. Here is a clear-eyed look at some of the most common myths.

**Myth: Toddlers who only eat beige/bland food are being spoiled**

Reality: Neophobia and preference for familiar, plain foods peaks in toddlerhood. This is developmental, not behavioural. It typically eases through the preschool years with consistent, pressure-free exposure to varied foods.

**Myth: You need to buy organic food for toddlers**

Reality: The evidence that organic food meaningfully improves health outcomes in children is not strong. Rinsing produce thoroughly significantly reduces pesticide residue. A varied diet of conventional fruits and vegetables is vastly better than a limited organic one.

**Myth: Vitamin D is not needed if you live somewhere sunny**

Reality: Vitamin D deficiency is widespread globally, including in sunny countries, because of indoor lifestyles, skin pigmentation, sunscreen use, and air pollution. Most health authorities recommend a daily Vitamin D supplement for infants and young children. Discuss the appropriate dose for your child with your healthcare provider.

**Myth: Sugar causes hyperactivity**

Reality: Multiple double-blind studies have found no evidence that sugar causes hyperactivity in children. The belief persists because of expectation bias -- parents who are told their child had sugar rate their behaviour as more hyper, even when they had not. This does not mean sugar in large quantities is beneficial; it is worth limiting for dental and nutritional reasons.

**Myth: Plant-based toddlers cannot get adequate nutrition**

Reality: A well-planned plant-based diet can meet a toddler''s nutritional needs, but it requires attention to vitamin B12, iron, calcium, iodine, zinc, and omega-3 fatty acids. Working with a paediatric dietitian is recommended to ensure nothing is missed.',
'nutrition', 4, ARRAY['nutrition-myths', 'toddler-nutrition', 'vitamin-D', 'organic', 'plant-based', 'sugar'], true, true);
