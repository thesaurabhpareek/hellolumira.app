-- Lumira v25: Pregnancy Content Fill
-- Fills content gaps for pregnancy stage: feeding, sleep, health, relationships, mental_health
-- Medical review: articles contain disclaimers, source citations, evidence-based guidance
-- Legal review: no diagnostic claims, no specific medication advice, WHO/ACOG/CDC sourced

-- ============================================================
-- FEEDING (3 articles)
-- ============================================================

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'pregnancy',
  'feeding',
  'Nutrition During Pregnancy: Building Blocks for You and Your Baby',
  $$**Why Nutrition Matters During Pregnancy**

What you eat during pregnancy directly supports your baby''s growth and your own health. Rather than "eating for two" in quantity, focus on the quality and variety of foods you consume. Nutritional needs shift throughout each trimester, and working with your healthcare provider can help you meet them in a way that fits your cultural food traditions and personal preferences.

**Key Nutrients to Prioritize**

- **Folate and folic acid:** Found in leafy greens, legumes, fortified grains, and citrus fruits. Supports neural tube development, especially in the first trimester. Many healthcare providers recommend a prenatal supplement containing folic acid.
- **Iron:** Needed for increased blood production. Sources include lentils, beans, tofu, dark leafy greens, lean meats, and fortified cereals. Pairing iron-rich foods with vitamin C-rich foods (such as tomatoes or bell peppers) can help with absorption.
- **Calcium:** Supports bone development for both you and your baby. Found in dairy products, fortified plant milks, tofu, sesame seeds, almonds, and leafy greens such as bok choy and kale.
- **Omega-3 fatty acids (DHA):** Important for fetal brain and eye development. Found in low-mercury fish, flaxseeds, chia seeds, walnuts, and algae-based supplements (a good option for those who do not eat fish).
- **Vitamin D:** Supports calcium absorption and immune function. Sources include sunlight exposure, fortified foods, and some fatty fish. Supplementation may be recommended depending on your levels and diet.
- **Protein:** Essential for fetal tissue growth. Good sources include eggs, legumes, nuts, seeds, dairy, fish, poultry, and plant-based proteins such as tempeh and edamame.

**Hydration**

Staying well-hydrated supports increased blood volume, amniotic fluid levels, and digestion. Water, herbal teas (check with your provider on which are safe), broths, and water-rich fruits and vegetables all contribute to daily fluid intake.

**Adapting Nutrition to Your Food Culture**

Pregnancy nutrition guidelines are often written with Western diets in mind, but diverse food traditions can absolutely meet nutritional needs during pregnancy. Traditional diets rich in legumes, whole grains, vegetables, and fermented foods often provide excellent nutritional foundations. If your diet excludes certain food groups — due to religious practice, cultural tradition, vegetarianism, or veganism — speak with a dietitian who can help you identify suitable alternatives.

**Practical Tips**

- Eat smaller, more frequent meals if nausea makes large meals difficult
- Keep nutrient-dense snacks accessible (nuts, fruit, yogurt, whole grain crackers)
- Discuss prenatal vitamin options with your provider, especially if dietary restrictions are a factor
- Avoid skipping meals, as stable blood sugar can support energy levels and mood$$,
  8,
  true,
  ARRAY['American College of Obstetricians and Gynecologists (ACOG)', 'World Health Organization (WHO)', 'Academy of Nutrition and Dietetics'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'pregnancy-feeding-nutrition-during-pregnancy'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'pregnancy',
  'feeding',
  'Managing Food Aversions During Pregnancy',
  $$**Why Food Aversions Happen**

Food aversions — strong feelings of disgust or nausea triggered by certain foods or smells — are common during pregnancy, particularly in the first trimester. They are thought to be related to hormonal shifts, including rising levels of human chorionic gonadotropin (hCG) and heightened olfactory sensitivity. While aversions can be frustrating, especially if they affect foods you previously enjoyed or foods that are culturally significant to you, they are generally considered a normal part of early pregnancy.

**Common Triggers**

- Strong-smelling foods (certain meats, fish, eggs, garlic, onions)
- Foods with strong flavors or textures
- Previously favorite foods
- Cooking smells, even from foods you can eat comfortably

Triggers vary widely between individuals and across pregnancies. What bothers one person may not affect another at all.

**Strategies for Coping**

- **Eat what you can tolerate.** Prioritizing gentle, bland foods during periods of strong aversion is a valid approach. Toast, rice, noodles, plain crackers, and fruit are commonly tolerated.
- **Try cold or room-temperature foods.** Hot foods tend to release stronger aromas. Cold or room-temperature alternatives may be easier to tolerate.
- **Eat small, frequent meals.** An empty stomach can intensify nausea. Small, frequent meals or snacks may help maintain blood sugar and reduce discomfort.
- **Modify preparation methods.** If a food itself is fine but its cooking smell is the problem, ask someone else to cook, use a kitchen fan, or try preparing foods that require less cooking (salads, smoothies, cold dishes).
- **Adapt traditional dishes.** If foods that are culturally meaningful to you have become difficult to eat, consider adjusted versions — milder spices, different cooking methods, or eating them in smaller amounts alongside more tolerable foods.
- **Focus on nutritional variety over specific foods.** If you cannot eat a specific nutrient-rich food, look for alternatives. For example, if meat is aversive, beans, lentils, or tofu may be more tolerable sources of protein and iron.

**When to Speak with Your Provider**

If aversions are contributing to significant weight loss, inability to keep fluids down, or severe nausea and vomiting, contact your healthcare provider. Hyperemesis gravidarum — a more severe form of pregnancy nausea and vomiting — may require medical support.

**Looking Ahead**

For many people, food aversions ease after the first trimester as hormone levels stabilize. Some aversions persist throughout pregnancy, but most people find it possible to maintain adequate nutrition by adapting their diet flexibly.$$,
  9,
  true,
  ARRAY['American College of Obstetricians and Gynecologists (ACOG)', 'Mayo Clinic', 'National Institutes of Health (NIH)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'pregnancy-feeding-managing-food-aversions'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'pregnancy',
  'feeding',
  'Safe Foods and Foods to Approach with Caution During Pregnancy',
  $$**Understanding Food Safety in Pregnancy**

During pregnancy, certain changes in immune function can make some foodborne illnesses more serious for both the pregnant person and the developing baby. Understanding which foods carry higher risks — and how to reduce those risks — helps you make informed choices without unnecessary restriction.

This guide is based on widely accepted public health guidance. Recommendations can vary by region and individual health circumstances, so always discuss specific dietary questions with your healthcare provider.

**Foods to Approach with Caution**

- **Raw or undercooked meat, poultry, and seafood:** These can carry bacteria such as Salmonella, Listeria, or Toxoplasma. Cooking to recommended internal temperatures significantly reduces risk. Well-done preparations of these proteins are generally considered safe.
- **High-mercury fish:** Certain large fish (such as shark, swordfish, king mackerel, and tilefish) have higher mercury concentrations. Many health authorities suggest limiting these while pregnant. Lower-mercury fish and seafood (such as salmon, sardines, shrimp, and tilapia) are widely considered safe in moderate amounts and are valuable sources of omega-3 fatty acids.
- **Unpasteurized dairy and juices:** Raw (unpasteurized) milk and cheeses made from unpasteurized milk carry a risk of Listeria. Pasteurized versions are generally considered safe. In regions where pasteurized dairy is not available, boiling milk is an effective alternative.
- **Raw sprouts:** Sprouts (alfalfa, bean sprouts, clover) can harbor bacteria. Cooking sprouts thoroughly reduces this risk.
- **Soft-cooked or raw eggs:** Dishes that include lightly cooked or raw eggs (such as some sauces, dressings, or desserts) may carry Salmonella risk. Fully cooked eggs are generally considered safe.
- **Deli meats and ready-to-eat processed meats:** These can carry Listeria risk, particularly if stored for extended periods. Heating these until steaming hot before eating is one approach to reducing risk.
- **Unpasteurized fermented products:** Many traditional fermented foods are made from pasteurized ingredients and are safe to eat. If you are unsure about a traditionally prepared fermented food in your cultural diet, speaking with a local dietitian or your healthcare provider can help clarify the risk.

**Foods That Are Widely Considered Safe**

- Fully cooked meats and eggs
- Pasteurized dairy products
- Well-washed fresh fruits and vegetables
- Cooked grains, legumes, and pulses
- Commercially pasteurized juices
- Most cooked traditional dishes across diverse food cultures

**Practical Food Safety Steps**

- Wash hands before and after handling raw foods
- Keep raw meats separate from ready-to-eat foods
- Refrigerate perishable foods promptly
- Reheat leftovers thoroughly

**A Note on Cultural Foods**

Many traditional food practices across cultures are nutritious and safe during pregnancy. If you have questions about a specific traditional food, dish preparation method, or cultural dietary practice, your healthcare provider or a registered dietitian can offer personalized guidance without judgment.$$,
  14,
  true,
  ARRAY['Centers for Disease Control and Prevention (CDC)', 'American College of Obstetricians and Gynecologists (ACOG)', 'World Health Organization (WHO)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'pregnancy-feeding-safe-foods-and-cautions'
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SLEEP (3 articles)
-- ============================================================

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'pregnancy',
  'sleep',
  'Sleep Positions During Pregnancy: What You Need to Know',
  $$**How Sleep Position Affects Pregnancy**

As your pregnancy progresses, finding a comfortable and safe sleep position becomes increasingly important. Your growing uterus affects blood flow, digestion, and pressure on surrounding structures — all of which can influence how well you sleep and how you feel upon waking.

**Side Sleeping: The Generally Preferred Position**

Many healthcare providers suggest sleeping on your side during pregnancy, particularly as you move into the second and third trimesters. Side sleeping — especially on the left side — is thought to support circulation to the uterus, kidneys, and fetus by reducing pressure on the inferior vena cava, a major vein that runs along the right side of the spine.

That said, sleeping on your right side has not been shown to be harmful, and alternating between sides throughout the night is common and generally fine. The key is avoiding lying flat on your back for extended periods during the later stages of pregnancy.

**Back Sleeping in Later Pregnancy**

In the third trimester, lying flat on your back for prolonged periods may place pressure on the inferior vena cava, potentially reducing blood flow. Some people experience symptoms such as dizziness, shortness of breath, or nausea when lying on their back — these are signs to change position.

If you wake up on your back during the night, do not be alarmed. Simply shift to your side. Waking up suggests your body''s natural awareness is working. Research indicates that the act of waking and repositioning is more significant than the position itself.

**Using Pillows for Support and Comfort**

Pillows can make side sleeping significantly more comfortable:

- Place a pillow between your knees to reduce pressure on your hips and lower back
- Use a pillow to support your abdomen from below
- A full-length body pillow or pregnancy pillow can provide multi-point support
- Elevating your upper body slightly with an extra pillow may help if heartburn or reflux is an issue

**Adjusting to Different Sleeping Environments**

Sleep setups vary widely around the world — from Western-style beds with mattresses to floor mattresses, bedding rolls, or shared sleeping surfaces. The principles of side sleeping and pillow support can be adapted to most sleeping environments. Using folded blankets or cushions to create support is an effective alternative to specialty pregnancy pillows.

**When to Speak with Your Provider**

If you experience significant discomfort, pain, or shortness of breath related to sleep position, or if you have been advised about specific conditions such as placenta previa, discuss appropriate sleep positions with your provider, as individual recommendations may vary.$$,
  20,
  true,
  ARRAY['American College of Obstetricians and Gynecologists (ACOG)', 'Mayo Clinic', 'National Institutes of Health (NIH)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'pregnancy-sleep-positions-during-pregnancy'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'pregnancy',
  'sleep',
  'Dealing with Insomnia During Pregnancy',
  $$**Why Insomnia is Common During Pregnancy**

Sleep disruption and insomnia are among the most commonly reported pregnancy experiences. Studies suggest that a significant proportion of pregnant people experience some form of sleep difficulty, particularly in the first and third trimesters. Understanding why it happens can help you approach it with less frustration and more practical strategies.

**Common Contributors to Pregnancy Insomnia**

- **Hormonal changes:** Rising progesterone in early pregnancy can cause fatigue during the day but also disrupt nighttime sleep continuity. As pregnancy progresses, hormonal shifts continue to affect sleep architecture.
- **Physical discomfort:** Back pain, pelvic pressure, leg cramps, and the physical challenge of finding a comfortable position can all interfere with staying asleep.
- **Frequent urination:** Increased kidney function and, later, uterine pressure on the bladder make nighttime trips to the bathroom common.
- **Heartburn and reflux:** These are particularly common in the second and third trimesters and can disrupt sleep when lying down.
- **Restless legs:** Some pregnant people experience restless leg syndrome, characterized by an uncomfortable urge to move the legs, which tends to worsen at night.
- **Anxiety and anticipation:** Thoughts about the upcoming birth, parenting, work, relationships, or changes to family life can make it difficult to wind down.

**Strategies That May Help**

- **Establish a consistent wind-down routine.** A predictable pre-sleep routine (such as a warm bath or shower, gentle stretching, reading, or calming breathing exercises) can signal to your body that it is time to sleep.
- **Limit screen exposure before bed.** Bright screens can interfere with melatonin production. Dimming lights and putting screens away in the hour before bed may support the onset of sleep.
- **Create a comfortable sleep environment.** Room temperature, noise, and light all affect sleep quality. Consider what adjustments are possible in your setting.
- **Address heartburn proactively.** Eating smaller meals earlier in the evening and elevating your head while sleeping may reduce nighttime reflux.
- **Limit fluids in the hour or two before bed** to reduce nighttime urination, while ensuring you remain well-hydrated earlier in the day.
- **Gentle movement and stretching** earlier in the day can support sleep quality. Leg stretches before bed may help with cramps.
- **Rest without pressure.** If you cannot sleep, resting quietly — even without sleeping — is still restorative. Avoid watching the clock, which can increase anxiety.

**When to Speak with Your Provider**

If insomnia is severely affecting your wellbeing, or if you have concerns about restless legs, sleep apnea symptoms (loud snoring, gasping), or anxiety that feels unmanageable, talk with your healthcare provider. There are options for support, and you do not need to simply endure severe sleep disruption throughout pregnancy.$$,
  28,
  true,
  ARRAY['American College of Obstetricians and Gynecologists (ACOG)', 'National Sleep Foundation', 'Mayo Clinic'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'pregnancy-sleep-dealing-with-insomnia'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'pregnancy',
  'sleep',
  'Sleep Hygiene During Pregnancy: Building Habits for Better Rest',
  $$**What Is Sleep Hygiene?**

Sleep hygiene refers to a collection of behavioral and environmental practices that support consistent, quality sleep. During pregnancy, when sleep is often disrupted by physical and emotional changes, building good sleep habits can meaningfully improve rest quality and overall wellbeing.

The following strategies are evidence-informed and can be adapted to a wide range of living situations, cultural contexts, and household arrangements.

**Daytime Habits That Support Nighttime Sleep**

- **Consistent wake and sleep times:** Going to sleep and waking at roughly the same times each day — including weekends — helps regulate your body''s internal clock (circadian rhythm). This consistency can make falling asleep easier over time.
- **Moderate physical activity:** Regular gentle movement during pregnancy, such as walking or prenatal yoga, is associated with improved sleep quality. Avoid vigorous exercise close to bedtime if you find it makes winding down harder.
- **Limit caffeine in the afternoon and evening:** Caffeine has a longer half-life during pregnancy, meaning it stays in your system longer. Many healthcare providers suggest limiting caffeine intake overall during pregnancy; consuming it only in the morning hours may support better sleep.
- **Get natural light exposure during the day:** Daylight helps regulate melatonin rhythms. Spending time outdoors or near a window during daylight hours supports healthy circadian function.

**Evening and Bedtime Practices**

- **Wind-down routine:** A consistent sequence of calming activities before bed (gentle stretching, a warm bath, herbal tea your provider has confirmed is safe, reading, or breathing exercises) signals to your nervous system that sleep is coming.
- **Limit screens:** Light from phones, tablets, and televisions can suppress melatonin. Reducing screen use in the hour or two before bed is a widely recommended sleep hygiene practice.
- **Comfortable sleep environment:** Cooler room temperatures are generally associated with better sleep. If possible, adjust bedding or ventilation to support comfort. Blackout curtains or an eye mask can help if light is an issue.
- **Comfortable sleep surface:** Whether you sleep on a mattress, a floor futon, or another surface, use pillows or folded blankets to support your hips, abdomen, and lower back.

**Managing a Busy Mind**

Pregnancy brings many thoughts and emotions. If worry or mental activity is keeping you awake:

- Try writing down thoughts or a to-do list before bed to "offload" mental activity
- Practice a breathing or relaxation technique — slow, deep breathing can activate the parasympathetic nervous system
- If your mind is very active, try a brief body scan or progressive muscle relaxation exercise

**Napping**

Short naps (20–30 minutes) earlier in the day can supplement nighttime sleep without interfering too much with nighttime sleep drive. Long or late-afternoon naps may make it harder to fall asleep at night.$$,
  16,
  true,
  ARRAY['National Sleep Foundation', 'American College of Obstetricians and Gynecologists (ACOG)', 'Centers for Disease Control and Prevention (CDC)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'pregnancy-sleep-hygiene-tips'
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- HEALTH (4 articles)
-- ============================================================

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'pregnancy',
  'health',
  'Prenatal Care Essentials: What to Expect at Prenatal Visits',
  $$**Why Prenatal Care Matters**

Regular prenatal care is one of the most important things you can do during pregnancy. It allows your healthcare team to monitor the health of both you and your developing baby, identify any concerns early, and support you with information and resources throughout each stage of pregnancy.

Prenatal care looks different in different healthcare systems and settings. Whether your care is provided by an obstetrician, midwife, general practitioner, or community health worker, the core goals are similar: monitor progress, screen for potential complications, and support your wellbeing.

**Typical Prenatal Visit Schedule**

While schedules vary by location and individual risk factors, a common approach in many settings is:

- **Weeks 4–28:** One visit approximately every 4 weeks
- **Weeks 28–36:** One visit approximately every 2 weeks
- **Weeks 36–40:** One visit approximately every week until delivery

If you have a higher-risk pregnancy, you may have more frequent visits or additional monitoring.

**What Happens at Prenatal Visits**

- **Physical measurements:** Blood pressure, weight, and fundal height (measuring your uterus) are commonly tracked to assess progress.
- **Fetal heartbeat monitoring:** Hearing your baby''s heartbeat is a routine part of most visits from early in the second trimester.
- **Urine testing:** Routine urine tests screen for signs of urinary tract infections, protein, and glucose levels.
- **Blood tests:** Early pregnancy blood work typically screens for blood type, anemia, immunity status, and certain infections. Additional blood tests may be offered at different points in pregnancy.
- **Ultrasounds:** Ultrasound scans are used to confirm due dates, monitor fetal development, check the placenta, and screen for certain conditions. Timing and number of scans offered vary by country and care setting.
- **Prenatal screening options:** Various screening tests are available during pregnancy to assess the likelihood of certain chromosomal or structural conditions. These are optional, and your provider can explain what each test involves and what results would mean for you.

**Preparing for Your Visits**

- Keep a note of any symptoms, questions, or concerns to discuss
- Bring a support person if that is helpful to you
- Bring your pregnancy health record or notes from previous visits
- Be honest about your lifestyle, health history, and any traditional remedies or supplements you are using — this helps your provider give you the most accurate support

**Access and Advocacy**

If cost, transportation, language barriers, or other factors make accessing prenatal care difficult, community health centers, midwifery services, and telehealth options may be available. Speaking with a social worker or patient navigator can help connect you with support.$$,
  10,
  true,
  ARRAY['American College of Obstetricians and Gynecologists (ACOG)', 'World Health Organization (WHO)', 'Centers for Disease Control and Prevention (CDC)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'pregnancy-health-prenatal-care-essentials'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'pregnancy',
  'health',
  'Common Pregnancy Discomforts and How to Find Relief',
  $$**Pregnancy Discomforts Are Normal — and Often Manageable**

Pregnancy involves significant physical changes, and many people experience a range of discomforts along the way. Most common pregnancy discomforts are not harmful, though they can affect your daily comfort and quality of life. Understanding what causes them — and what may help — can make a real difference.

Always check with your healthcare provider before using any remedies, supplements, or treatments during pregnancy.

**Morning Sickness (Nausea and Vomiting)**

Nausea is most common in the first trimester. Helpful strategies include eating small, frequent meals, keeping bland snacks nearby, staying hydrated, and avoiding triggers such as strong smells. Ginger (in teas, foods, or lozenges) is commonly used and has some evidence supporting its use for mild nausea — discuss with your provider if considering supplements. If nausea is severe or you cannot keep fluids down, contact your provider.

**Heartburn and Acid Reflux**

As the uterus grows, it can push stomach acid upward. Eating smaller meals, avoiding lying down immediately after eating, elevating your head while sleeping, and identifying personal food triggers may help. Your provider can recommend appropriate interventions if lifestyle adjustments are insufficient.

**Back Pain and Pelvic Discomfort**

The shifting center of gravity and hormonal relaxation of ligaments contribute to back and pelvic pain. Strategies that may help:

- Wearing supportive footwear
- Using a pregnancy support belt if recommended
- Gentle exercise such as walking, swimming, or prenatal yoga
- Applying warmth (a warm cloth or pad) to sore areas
- Maintaining a posture that reduces lower back strain
- Asking for a referral to a physiotherapist if pain is significant

**Swelling (Edema)**

Mild swelling of the feet, ankles, and legs is common, especially in the third trimester. Elevating the feet when resting, staying well-hydrated, wearing comfortable shoes, and gentle movement can help. Sudden or significant swelling, especially of the face or hands, should be evaluated by your provider promptly.

**Fatigue**

Fatigue is particularly common in the first and third trimesters. Rest when you can, accept help when offered, and prioritize sleep. Fatigue may also be related to iron levels — your provider can check and advise accordingly.

**Leg Cramps**

Leg cramps, especially at night, are common in the second and third trimesters. Gentle stretching of the calf muscles before bed, staying hydrated, and ensuring adequate dietary calcium and magnesium may help. Speak with your provider about whether any supplementation is appropriate for you.

**Constipation**

Hormonal changes slow digestion during pregnancy. Increasing dietary fiber (through fruits, vegetables, legumes, and whole grains), staying hydrated, and gentle physical activity support bowel regularity. Your provider can advise on safe options if dietary changes alone are not sufficient.$$,
  22,
  true,
  ARRAY['American College of Obstetricians and Gynecologists (ACOG)', 'Mayo Clinic', 'National Health Service (NHS)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'pregnancy-health-common-discomforts-and-relief'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'pregnancy',
  'health',
  'Exercise Safety During Pregnancy: Staying Active for You and Your Baby',
  $$**The Benefits of Exercise During Pregnancy**

Physical activity during pregnancy is associated with a range of benefits for both the pregnant person and the developing baby. These include improved cardiovascular fitness, better weight management, reduced back pain, improved sleep quality, lower risk of gestational diabetes, and positive effects on mood and emotional wellbeing. For most people with uncomplicated pregnancies, regular moderate exercise is considered safe and beneficial.

Always discuss exercise plans with your healthcare provider, particularly if you have a higher-risk pregnancy or specific health conditions.

**How Much Exercise Is Generally Recommended?**

Major health organizations, including the American College of Obstetricians and Gynecologists, generally suggest that healthy pregnant people aim for at least 150 minutes of moderate-intensity aerobic activity per week, spread across most days. This can be broken into shorter sessions of 10–30 minutes and does not need to occur all at once.

**Types of Exercise Generally Considered Safe**

- **Walking:** Accessible to most people, low-impact, and easily adjusted to your energy level. Walking outdoors also provides fresh air and natural light.
- **Swimming and water aerobics:** The buoyancy of water reduces joint stress and supports the growing abdomen. Many pregnant people find water exercise particularly comfortable in the later trimesters.
- **Prenatal yoga and stretching:** Supports flexibility, posture, balance, and relaxation. Many classes are specifically designed for pregnancy and address common discomforts.
- **Low-impact aerobics:** Stationary cycling, elliptical training, and similar activities are generally well-tolerated.
- **Strength training:** Light to moderate strength training can be continued or started during pregnancy, with modifications as the pregnancy progresses. Free weights, resistance bands, or bodyweight exercises are common approaches.

**Activities to Approach with Caution or Avoid**

- Contact sports or activities with a high risk of falls or abdominal impact
- Scuba diving (due to decompression risk)
- High-altitude activities (if you are not already acclimatized)
- Exercising flat on your back for extended periods in the second and third trimesters
- Activities that feel excessively strenuous — you should be able to hold a conversation while exercising (the "talk test")

**Listening to Your Body**

Intensity and capacity change throughout pregnancy. What felt comfortable at 12 weeks may need to be modified at 30 weeks. Signs that you should stop exercising and contact your provider include chest pain, difficulty breathing, dizziness, calf pain or swelling, vaginal bleeding, or decreased fetal movement.

**Adapting Exercise to Your Context**

Exercise does not require a gym membership or specialized equipment. Many forms of traditional movement, dance, household activities, and outdoor work provide meaningful physical activity. The goal is consistent, moderate movement that fits your life and feels good in your body.$$,
  18,
  true,
  ARRAY['American College of Obstetricians and Gynecologists (ACOG)', 'Centers for Disease Control and Prevention (CDC)', 'World Health Organization (WHO)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'pregnancy-health-exercise-safety'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'pregnancy',
  'health',
  'Preparing for Labor: What to Expect and How to Get Ready',
  $$**Why Preparation Matters**

Preparing for labor and birth — physically, emotionally, and practically — can help you feel more confident and informed as your due date approaches. While birth is inherently unpredictable and no two experiences are the same, understanding what labor involves and thinking through your preferences and support plan can reduce anxiety and help you communicate effectively with your care team.

**Understanding the Stages of Labor**

Labor is generally described in three stages:

1. **First stage — cervical dilation:** The uterus contracts rhythmically, and the cervix gradually opens (dilates) and thins (effaces). This stage is often divided into early labor (less active, cervix dilating to about 6 cm) and active labor (more intense contractions, cervix dilating to 10 cm). This is typically the longest stage.
2. **Second stage — birth of the baby:** Active pushing (or breathing the baby down) helps guide the baby through the birth canal. This stage can last minutes to a few hours.
3. **Third stage — delivery of the placenta:** After the baby is born, the placenta is delivered. This typically takes between 5 and 30 minutes with active management, or longer with physiological management.

**Signs That Labor May Be Starting**

- Regular, intensifying contractions that become closer together over time
- Your waters breaking (rupture of membranes)
- A "show" — a small discharge of blood-tinged mucus as the cervical plug loosens
- Increasing pressure or backache

Contact your healthcare provider with any concerns, and follow their guidance about when to go to your birth location.

**Building Your Birth Preferences**

A birth preferences document (sometimes called a birth plan) is a way of communicating your preferences for labor and birth to your care team. Considerations may include:

- Preferences for pain management approaches (ranging from breathing techniques and movement to epidural analgesia)
- Preferences for who will be present during labor
- Cultural or spiritual practices important to you during birth
- Preferences regarding intervention
- Skin-to-skin contact and early feeding intentions after birth

Birth preferences are not a rigid script — labor often unfolds differently than expected — but they support informed communication with your care team.

**Practical Preparation**

- Attend childbirth education classes (available in person, online, or through community programs)
- Know your route to your planned birth location
- Prepare a bag with items you may want during labor and for your hospital or birth center stay
- Arrange care for other children or dependents
- Confirm your support person''s availability and discuss their role

**Emotional Preparation**

Anticipation, excitement, and fear can all be present simultaneously as labor approaches. Speaking with your provider, a midwife, a doula, or a counselor about concerns can be helpful. Connecting with others who have recently given birth — whether family, friends, or community groups — can also provide reassurance and practical insight.$$,
  36,
  true,
  ARRAY['American College of Obstetricians and Gynecologists (ACOG)', 'World Health Organization (WHO)', 'National Health Service (NHS)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'pregnancy-health-preparing-for-labor'
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- RELATIONSHIPS (3 articles)
-- ============================================================

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'pregnancy',
  'relationships',
  'Communicating with Your Partner About Pregnancy',
  $$**Pregnancy Changes Relationships**

Pregnancy is a significant life transition, and it affects the dynamics of partnerships in many ways — emotionally, practically, and sometimes physically. Open, honest communication between partners during this time can strengthen your relationship and help both of you feel supported and involved, even when your experiences of pregnancy are quite different.

Partnership looks different in every family. This article is written for any kind of partnership structure — romantic partnerships, co-parenting arrangements, or any configuration in which two or more adults are navigating pregnancy together.

**Why Communication Can Be Challenging**

Pregnancy brings a range of changes and emotions that are not always easy to share:

- The pregnant partner may be dealing with physical discomfort, fatigue, nausea, or anxiety that is hard to articulate
- The non-pregnant partner may feel uncertain about their role or unsure how to help
- Both partners may have different expectations, fears, or visions for the pregnancy and early parenting
- Practical stressors (finances, housing, work, family) often intensify during pregnancy
- Cultural or family expectations about pregnancy and parenting roles can create additional pressure

**Practices That Support Communication**

- **Regular, low-pressure check-ins:** Set aside time — even briefly — to connect and ask each other how you are doing. This does not need to be a formal "relationship conversation"; it can simply be a habit of staying in touch.
- **Share what you are experiencing:** The pregnant partner sharing physical and emotional experiences can help their partner understand what pregnancy feels like day to day. Equally, the non-pregnant partner sharing their feelings — including uncertainty, excitement, or concern — is valid and important.
- **Be specific about what you need:** Rather than hoping your partner will guess, try to name what would help — whether that is practical assistance, a listening ear, space, or physical comfort.
- **Acknowledge the asymmetry:** Pregnancy is, by nature, an unequal physical experience. Acknowledging this — rather than comparing or minimizing — can reduce resentment and build empathy.
- **Discuss expectations early:** Conversations about parenting values, division of responsibilities, birth preferences, and family support are easier when started early and revisited as the pregnancy progresses.

**Navigating Disagreements**

Disagreements during pregnancy are normal. Hormonal changes, stress, and fatigue can lower emotional tolerance for both partners. Agreeing on a way to pause heated conversations and return to them when calmer can prevent escalation. If communication difficulties are persistent or significant, speaking with a couples counselor or therapist — many offer this during pregnancy — can be very helpful.

**Seeking Support Together**

Attending prenatal appointments, childbirth classes, or parenting preparation sessions together (when possible and desired) can be a powerful way to feel like a team approaching birth and parenthood.$$,
  16,
  true,
  ARRAY['American College of Obstetricians and Gynecologists (ACOG)', 'American Psychological Association (APA)', 'Mayo Clinic'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'pregnancy-relationships-communicating-with-partner'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'pregnancy',
  'relationships',
  'Involving Family and Friends During Pregnancy',
  $$**The Role of Social Support in Pregnancy**

Social support — from family, friends, community, and cultural networks — is consistently associated with positive outcomes during pregnancy and the transition to parenthood. Feeling connected and supported can reduce stress, improve emotional wellbeing, and help pregnant people feel more confident in navigating the changes ahead.

What "support" looks like, and from whom it is expected or welcomed, varies enormously across cultures, family structures, and personal preferences. There is no single right way to involve others in your pregnancy.

**Deciding What Level of Involvement Feels Right**

Pregnancy is a personal experience, and you have the right to decide:

- Who to tell, and when
- How much information to share
- What kinds of support you want and from whom
- What kinds of involvement feel welcome or unwelcome

Some people come from cultural traditions where pregnancy is a community event, with extended family and community members deeply involved in care and preparation. Others prefer to keep pregnancy private until later, or to involve a smaller circle. Both approaches are valid.

**Having Conversations About Roles and Expectations**

Family members and friends often have their own ideas about what their involvement will look like. It can be helpful to have explicit conversations — especially with close family — about:

- How much advice or involvement feels helpful versus overwhelming
- Cultural or traditional practices you do or do not wish to incorporate
- How decisions will be made, and by whom
- What practical support would actually be useful (such as help with cooking, childcare for other children, or accompanying you to appointments)

These conversations can prevent misunderstandings and allow loved ones to support you in ways that are genuinely helpful.

**Navigating Cultural Expectations**

Many cultures have rich traditions around pregnancy — rituals, dietary guidance, rest practices, naming ceremonies, or postpartum customs. These traditions often carry deep meaning and can be a source of comfort and connection. At the same time, it is natural for individuals to make choices that adapt or depart from family or cultural expectations. Navigating this respectfully — acknowledging the intention behind traditions while also honoring your own needs — is an ongoing and sometimes challenging process.

**When Family Dynamics Are Complicated**

Not everyone has access to supportive family relationships. If family relationships are strained, absent, or harmful, it is important to know that support can come from many sources — friends, community organizations, faith communities, pregnancy support groups, doulas, and healthcare providers. Building a support network that genuinely sustains you is what matters, regardless of its form.

**Accepting Help**

Many pregnant people find it difficult to accept help, particularly if they are accustomed to being independent. Allowing others to contribute — whether through meals, errands, emotional support, or presence — can be deeply valuable, both during pregnancy and in the early weeks after birth.$$,
  12,
  true,
  ARRAY['American Psychological Association (APA)', 'World Health Organization (WHO)', 'Centers for Disease Control and Prevention (CDC)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'pregnancy-relationships-involving-family-and-friends'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'pregnancy',
  'relationships',
  'Intimacy During Pregnancy: What to Know',
  $$**Intimacy and Pregnancy**

Intimacy — which includes, but is not limited to, sexual intimacy — is a natural part of many partnerships, and questions about how pregnancy affects intimacy are common. Concerns, curiosity, and changing desires are all normal during this time. Open communication between partners and honest conversations with healthcare providers can help navigate this aspect of pregnancy with confidence and care.

**Is Sexual Activity Safe During Pregnancy?**

For most people with uncomplicated pregnancies, sexual activity is considered safe throughout pregnancy. The amniotic sac and uterine muscles protect the baby, and the cervical mucus plug provides an additional barrier. Sexual activity does not harm the baby.

However, there are specific circumstances in which healthcare providers recommend avoiding sexual activity. These include situations such as placenta previa (placenta positioned low over the cervix), unexplained bleeding, a history of preterm labor in certain contexts, or ruptured membranes. Your provider can advise you on whether any restrictions apply in your individual situation.

**How Desire and Comfort Change**

It is common for sexual desire and comfort to shift throughout pregnancy:

- **First trimester:** Nausea, fatigue, and breast tenderness may reduce interest in sexual activity for some people.
- **Second trimester:** Many people experience a return of energy and libido as early pregnancy discomforts ease. Increased blood flow to the pelvic region can heighten sensitivity.
- **Third trimester:** The size of the abdomen, physical discomfort, and emotional preoccupation with the approaching birth can again affect desire and comfort. Adapting positions and approaches to accommodate physical changes is common.

These patterns vary widely — some people feel more connected to their bodies and their partners sexually during pregnancy; others find their desire decreases. Both experiences are normal.

**Communication Is Key**

Changes in desire, discomfort with certain activities, or the need to adapt how you and your partner connect physically all require communication. Expressing your needs, listening to your partner''s experiences, and approaching changes with curiosity rather than judgment supports the relationship during this transitional time.

**Broadening the Definition of Intimacy**

Intimacy encompasses much more than sexual activity. Emotional closeness, physical affection, shared rituals, quality time, and mutual support are all forms of intimacy that can be nurtured during pregnancy — especially if physical intimacy is limited for any reason. Many couples find that pregnancy deepens their emotional connection and communication in meaningful ways.

**When to Seek Guidance**

If you have pain during sexual activity, spotting or bleeding after, significant changes in desire that are causing distress, or relationship difficulties related to intimacy, speak with your healthcare provider or a counselor. These are appropriate topics to discuss openly with your care team.$$,
  20,
  true,
  ARRAY['American College of Obstetricians and Gynecologists (ACOG)', 'Mayo Clinic', 'National Health Service (NHS)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'pregnancy-relationships-intimacy-during-pregnancy'
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- MENTAL_HEALTH (2 articles)
-- ============================================================

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'pregnancy',
  'mental_health',
  'Managing Anxiety During Pregnancy',
  $$**Anxiety During Pregnancy Is Common**

Anxiety is one of the most commonly reported emotional experiences during pregnancy. Concerns about the baby''s health, the birth experience, parenting, finances, relationships, or other life changes are natural responses to a significant life transition. For many people, these feelings come and go and are manageable with support and self-care strategies.

For some, however, anxiety during pregnancy is more persistent, intense, or disabling. Research suggests that prenatal anxiety affects a meaningful proportion of pregnant people worldwide, and it is recognized as an important aspect of perinatal mental health — not simply "nerves" to push through. Seeking support is a sign of strength, not weakness.

**What Pregnancy Anxiety Can Look Like**

- Persistent worry about the baby''s health or the birth
- Difficulty concentrating or making decisions
- Physical symptoms such as a racing heart, muscle tension, or difficulty breathing
- Avoidance of information or appointments due to fear
- Sleep disruption driven by anxious thoughts
- Feeling constantly "on edge" or unable to relax
- Intrusive or unwanted thoughts

These experiences exist on a spectrum, and their significance depends partly on how much they affect your daily life and wellbeing.

**Strategies That May Help**

- **Acknowledge and name what you are feeling.** Simply recognizing anxiety — without judging it as "irrational" — can reduce its intensity. Anxiety during pregnancy is a reasonable response to real uncertainties.
- **Talk about it.** Sharing feelings with a trusted partner, friend, family member, or healthcare provider can provide relief and perspective. Isolation tends to amplify anxiety.
- **Limit information overload.** While staying informed is valuable, endless searching for information online — particularly about rare complications — can increase rather than reduce anxiety. Designating specific times to seek information, rather than constant searching, may help.
- **Grounding and breathing practices.** Simple breathing exercises (such as slow, extended exhales) activate the parasympathetic nervous system and can reduce acute anxiety. Mindfulness practices, even brief ones, have evidence supporting their use for anxiety during pregnancy.
- **Gentle physical activity.** Regular movement is associated with reduced anxiety and improved mood during pregnancy.
- **Prepare where you can.** For some people, taking practical steps — attending childbirth classes, creating a birth plan, or preparing the home — can reduce a sense of helplessness and provide a sense of agency.

**When to Seek Professional Support**

If anxiety is significantly affecting your sleep, relationships, daily functioning, or quality of life, or if you are experiencing panic attacks, speak with your healthcare provider. Effective, evidence-based support options exist for prenatal anxiety, including therapy approaches such as cognitive behavioral therapy (CBT). Your provider can discuss options appropriate for pregnancy.

**Cultural Considerations**

Anxiety can manifest differently across cultural contexts, and attitudes toward seeking mental health support vary. In some communities, there may be stigma around discussing emotional difficulties. Speaking with a provider who understands your cultural background, or finding peer support in your community, can make accessing help feel more manageable.$$,
  14,
  true,
  ARRAY['American College of Obstetricians and Gynecologists (ACOG)', 'American Psychological Association (APA)', 'World Health Organization (WHO)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'pregnancy-mental-health-anxiety-management'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'pregnancy',
  'mental_health',
  'Bonding with Your Unborn Baby During Pregnancy',
  $$**What Is Prenatal Bonding?**

Prenatal bonding refers to the feelings of connection, attachment, and emotional engagement that develop between a pregnant person and their unborn baby during pregnancy. Research in perinatal psychology suggests that early bonding during pregnancy can support the development of a positive parent-infant relationship after birth — and can also contribute to maternal emotional wellbeing during pregnancy itself.

It is important to acknowledge that bonding experiences vary widely. Some people feel an immediate and profound connection to their baby from the earliest weeks; others find that connection grows more gradually, particularly as pregnancy becomes more tangible (such as when movement is felt). Both experiences are normal, and the absence of immediate bonding does not predict the quality of the parent-child relationship after birth.

**Factors That Influence Prenatal Bonding**

- Emotional wellbeing and mental health during pregnancy
- The nature of the pregnancy (planned or unplanned, uncomplicated or high-risk)
- Past experiences of loss or difficult pregnancies
- Stress, anxiety, and social support levels
- The point in pregnancy — bonding often deepens as the pregnancy becomes more physically tangible
- Cultural context and family beliefs about pregnancy and the unborn child

**Practices That May Support Bonding**

- **Talking to your baby.** Fetuses develop the ability to hear sounds from around 18–25 weeks of pregnancy. Speaking, singing, or reading aloud to your baby can be a meaningful practice for many people, regardless of whether the baby understands the words.
- **Responding to movement.** When you feel your baby move, taking a moment to acknowledge it — placing your hand on your abdomen, talking or responding — can reinforce a sense of connection and presence.
- **Visualization and imagination.** Taking time to imagine your baby — their personality, appearance, or what meeting them might feel like — can help some people develop a more concrete sense of connection during pregnancy.
- **Involving your partner or support people.** Sharing pregnancy milestones — hearing the heartbeat, seeing ultrasound images, feeling movement together — can strengthen both your own sense of connection to the baby and your relationship with those who will share in parenting.
- **Journaling.** Writing to or about your baby, documenting thoughts, feelings, and hopes, is a practice many people find meaningful.
- **Prenatal mindfulness.** Practices that involve conscious attention to your pregnant body and developing baby have been associated with increased prenatal attachment in some studies.

**When Bonding Feels Difficult**

If you are struggling to feel connected to your pregnancy or baby — particularly if this is accompanied by emotional numbness, persistent low mood, or significant anxiety — this is worth discussing with your healthcare provider. Prenatal depression and anxiety can affect the experience of bonding, and effective support is available. Addressing your own emotional needs during pregnancy benefits both you and your baby.

**Cultural Dimensions of Prenatal Bonding**

Cultural beliefs about when "personhood" begins, appropriate emotional expression during pregnancy, or practices around acknowledging the baby before birth vary considerably. These beliefs are meaningful and deserve respect. There is no single culturally correct way to experience or express prenatal connection.$$,
  20,
  true,
  ARRAY['American Psychological Association (APA)', 'National Institutes of Health (NIH)', 'World Health Organization (WHO)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'pregnancy-mental-health-bonding-with-unborn-baby'
) ON CONFLICT (slug) DO NOTHING;
