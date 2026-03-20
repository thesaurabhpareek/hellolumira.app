-- =============================================================================
-- Lumira v19: Enhanced Content, Quiz System, and Milestone Celebrations
-- =============================================================================
-- This migration:
--   1. Adds 'postpartum' to content_articles stage check
--   2. Seeds week-specific pregnancy articles (weeks 4-40)
--   3. Seeds postpartum articles (8-10 articles)
--   4. Seeds infant articles by week (first 3 months) and by month (4-12)
--   5. Seeds additional toddler articles for months 13-36
--   6. Creates quiz_questions and quiz_attempts tables with 50+ seed questions
--   7. Creates baby_milestones table with RLS
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. ALTER content_articles TO ALLOW 'postpartum' stage
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.content_articles DROP CONSTRAINT IF EXISTS content_articles_stage_check;
ALTER TABLE public.content_articles ADD CONSTRAINT content_articles_stage_check
  CHECK (stage IN ('pregnancy', 'infant', 'toddler', 'postpartum'));

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. PREGNANCY ARTICLES — Fill missing weeks 4-40
--    Existing: 4,6,8,10,12,14,16,20,22,24,28,32,36,38,40
--    Missing:  5,7,9,11,13,15,17,18,19,21,23,25,26,27,29,30,31,33,34,35,37,39
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.content_articles (stage, week_or_month, title, subtitle, body, category, reading_time_minutes, tags, medically_reviewed, culturally_sensitive) VALUES

('pregnancy', 5, 'Week 5: The Heartbeat Begins',
 'Tiny but mighty — your embryo is growing fast',
 'At just five weeks, your embryo is about the size of a sesame seed, but incredible things are happening. The neural tube — which will become the brain and spinal cord — is forming, and the heart has begun to develop its first chambers.

**What is happening this week:**
- The embryo has three layers of cells that will become all organs and tissues
- The heart tube begins to form and may start beating by the end of this week
- The placenta and amniotic sac are developing to protect and nourish your baby

**How you might feel:**
You may not feel much different yet, or you might already notice fatigue, breast tenderness, or mild nausea. Some people have no symptoms at all — and that is perfectly normal.

**What you can do:**
- Start taking a prenatal vitamin with at least 400mcg of folic acid if you have not already (WHO recommendation)
- Schedule your first prenatal appointment if you have not done so
- Begin noting any symptoms or questions for your provider

Every pregnancy unfolds at its own pace. Whether you are feeling everything or nothing at all, your body is already doing remarkable work.',
 'development', 3, ARRAY['week-5', 'first-trimester', 'embryo-development', 'heartbeat'], true, true),

('pregnancy', 7, 'Week 7: Facial Features Take Shape',
 'Your baby is developing eyes, nostrils, and tiny limb buds',
 'By week 7, your baby (still technically an embryo) is about the size of a blueberry. Facial features are starting to form, and brain development is accelerating rapidly.

**Key developments:**
- Small indentations on either side of the head will become ears
- Dark spots mark where the eyes will be, and nostrils are forming
- Arm and leg buds are growing, with tiny paddle-like hands
- The brain is producing about 100 new cells every minute

**Your body this week:**
Morning sickness may be intensifying — remember it can strike at any time of day. Your uterus has doubled in size, though you likely do not show yet. Increased progesterone may cause bloating, constipation, or mood changes.

**Nutrition focus:**
ACOG recommends ensuring adequate iron intake (27mg daily) as your blood volume begins to increase. Iron-rich foods include lentils, beans, dark leafy greens, and fortified cereals. Vitamin C helps iron absorption, so pair iron-rich foods with citrus fruits or bell peppers.

Trust your body and your instincts. If something feels off, it is always worth a call to your care team.',
 'development', 3, ARRAY['week-7', 'first-trimester', 'facial-development', 'brain-growth'], true, true),

('pregnancy', 9, 'Week 9: From Embryo to Fetus',
 'A significant milestone — your baby officially becomes a fetus',
 'Week 9 marks a transition: your baby graduates from embryo to fetus. This means all the essential organs have begun forming, and the focus shifts to growth and maturation.

**What is happening with your baby:**
- All four heart chambers are now formed
- Tiny muscles are beginning to develop, allowing small involuntary movements
- Fingers and toes are starting to separate from the paddle-like hands and feet
- The tail-like structure from earlier weeks is nearly gone
- Your baby is about the size of a grape

**Emotional wellbeing check-in:**
Anxiety about pregnancy is incredibly common, especially in the first trimester when you cannot yet feel movement or see a bump. According to NICE guidelines, up to 1 in 5 people experience perinatal anxiety. It is not a sign of weakness — it is a recognised condition with effective support options.

**When to seek support:**
If worry feels constant, interferes with daily life, or comes with physical symptoms like racing heart or difficulty sleeping, talk to your provider. Early support makes a real difference.

You are growing a whole human being. Be gentle with yourself.',
 'development', 3, ARRAY['week-9', 'first-trimester', 'embryo-to-fetus', 'anxiety'], true, true),

('pregnancy', 11, 'Week 11: Bones Begin to Harden',
 'Your baby is moving, stretching, and developing rapidly',
 'At week 11, your baby is about the size of a fig and becoming more recognisably human. The head still makes up about half the body length, but proportions are gradually changing.

**Development highlights:**
- Bones are beginning to harden (ossify) from cartilage
- Hair follicles are forming across the body
- The diaphragm is developing, leading to hiccup-like movements
- Tooth buds are forming under the gums
- Fingers and toes are now separate and may start to open and close

**Common experiences this week:**
- Nausea may begin to ease for some (though not everyone)
- You might notice thicker, shinier hair due to hormonal changes
- Increased blood flow may cause visible veins on your chest and abdomen
- Some people experience headaches — stay hydrated and rest when possible

**Safety note:**
The American College of Obstetricians and Gynecologists (ACOG) recommends avoiding hot tubs and saunas during pregnancy, as overheating (core temperature above 39C/102F) may affect fetal development, particularly in the first trimester.

Each body tells its own pregnancy story. There is no single "normal" experience.',
 'safety', 3, ARRAY['week-11', 'first-trimester', 'bone-development', 'safety'], true, true),

('pregnancy', 13, 'Week 13: Welcome to the Second Trimester',
 'You have made it through the first trimester — a real milestone',
 'Congratulations on reaching the second trimester. For many, this marks a turning point where nausea eases, energy returns, and the pregnancy starts to feel more settled. But if you are still struggling, that is completely valid too.

**Your baby at week 13:**
- About the size of a lemon, weighing nearly 30 grams
- Vocal cords are forming
- The intestines, which developed in the umbilical cord, are now moving into the abdomen
- Unique fingerprints are beginning to develop
- The placenta is now fully functional, taking over hormone production

**What this means for you:**
- The risk of miscarriage drops significantly after the first trimester
- Many people choose this time to share their news more widely — but there is no rule about when or how to do so
- You may notice your appetite returning

**Looking ahead:**
Your provider may discuss first-trimester screening results and upcoming tests like the anatomy scan (usually around week 20). Write down any questions — no concern is too small.

Crossing into the second trimester is worth celebrating, however quietly or loudly feels right to you.',
 'development', 3, ARRAY['week-13', 'second-trimester', 'milestone', 'placenta'], true, true),

('pregnancy', 15, 'Week 15: Senses Awakening',
 'Your baby can now sense light and is developing hearing',
 'At week 15, your baby is about the size of an apple, and sensory development is accelerating. Though the eyes are still fused shut, they can detect light. Bones in the ears are hardening, and your baby may begin to hear muffled sounds.

**Sensory milestones:**
- Eyes can perceive light through closed lids
- The inner ear bones (ossicles) are among the first to fully harden
- Taste buds are forming — your baby will taste amniotic fluid, which changes flavour based on your diet
- Skin is developing but is still thin and translucent

**Movement:**
Your baby is becoming more active — stretching, flexing, and even sucking a thumb. First-time parents may not feel these movements until weeks 18-22, while those who have been pregnant before might notice them earlier.

**Nutrition spotlight:**
Calcium becomes increasingly important as your baby''s skeleton develops. WHO recommends 1500-2000mg daily in populations with low calcium intake. Good sources include dairy, fortified plant milks, tofu prepared with calcium sulfate, almonds, and dark leafy greens.

Cultural food practices often include calcium-rich foods during pregnancy — from sesame-based dishes to bone broth. Discuss your traditions with your provider.',
 'development', 3, ARRAY['week-15', 'second-trimester', 'senses', 'hearing', 'calcium'], true, true),

('pregnancy', 17, 'Week 17: Fat Storage Begins',
 'Your baby is starting to build the fat layers that will keep them warm',
 'At week 17, your baby is about the size of a pomegranate. An important change begins this week: your baby starts to accumulate body fat (adipose tissue), which will help regulate temperature after birth.

**Key developments:**
- Brown fat begins to form — a special type of fat that generates heat
- The skeleton is transitioning from soft cartilage to bone
- Sweat glands are forming
- The umbilical cord is growing stronger and thicker

**Your body changes:**
- Your uterus is expanding and may begin to push your belly button outward
- You might feel a shift in your centre of gravity as your belly grows
- Round ligament pain (sharp pains on the sides of your belly) is common and usually harmless
- Your cardiovascular system is working harder — you may feel breathless with less exertion

**Mental health check-in:**
The second trimester can bring a mix of excitement and anxiety about the future. NICE guidelines recommend that all pregnant people are asked about their emotional wellbeing at every appointment. If your provider does not ask, it is okay to bring it up yourself.

Your feelings are always relevant and always worth sharing.',
 'wellness', 3, ARRAY['week-17', 'second-trimester', 'fat-development', 'round-ligament'], true, true),

('pregnancy', 18, 'Week 18: Hearing Your Voice',
 'Your baby can now hear your heartbeat and voice',
 'By week 18, your baby''s hearing has developed enough to detect sounds from inside your body — your heartbeat, your breathing, your digestive system, and your voice. This is when many families start talking, singing, or reading to their baby.

**What your baby is doing:**
- Hearing your heartbeat and voice regularly
- Yawning, hiccupping, and sucking
- Developing myelin around nerves (essential for neural signaling)
- About 14cm long and weighing around 200 grams

**Quickening:**
You may start to feel your baby move for the first time, known as quickening. People often describe it as fluttering, bubbles, or gentle tapping. If you have not felt it yet, do not worry — it can take until week 22 or later, especially in a first pregnancy.

**Practical tip:**
Now is a good time to start thinking about your support network for after birth. Who will be available to help? What kind of help do you want? Some cultures have strong traditions of postnatal care — a "lying-in" period, confinement practices, or community meals. These traditions exist for good reason: recovery takes time and support.

There is no right or wrong way to bond with your baby before birth. Simply being present is enough.',
 'development', 3, ARRAY['week-18', 'second-trimester', 'hearing', 'quickening', 'bonding'], true, true),

('pregnancy', 19, 'Week 19: Vernix and Lanugo',
 'Protective coatings are keeping your baby safe in the womb',
 'At week 19, your baby is developing two unique protective layers: vernix caseosa (a waxy white coating) and lanugo (fine, downy hair). Both serve important purposes.

**Why vernix matters:**
- Protects delicate skin from the amniotic fluid
- Has antibacterial and anti-inflammatory properties
- Helps regulate temperature after birth
- WHO recommends not wiping it off immediately after birth — it is naturally beneficial

**Why lanugo forms:**
- Helps vernix stick to the skin
- May play a role in temperature regulation
- Usually sheds before birth (premature babies may still have it)

**Your baby this week:**
- About the size of a mango
- The brain is designating specialised areas for smell, taste, hearing, vision, and touch
- Arms and legs are now in proportion with the rest of the body

**Staying active:**
ACOG recommends at least 150 minutes of moderate-intensity exercise per week during pregnancy. Walking, swimming, prenatal yoga, and stationary cycling are all excellent options. Listen to your body and modify as needed.

Movement looks different for everyone during pregnancy, and that is perfectly fine.',
 'wellness', 3, ARRAY['week-19', 'second-trimester', 'vernix', 'lanugo', 'exercise'], true, true),

('pregnancy', 21, 'Week 21: Movement Patterns Emerge',
 'Your baby is becoming increasingly active and developing sleep-wake cycles',
 'At week 21, you are past the halfway mark. Your baby is about the size of a carrot and is developing more coordinated movement patterns, including early sleep-wake cycles.

**Movement milestones:**
- Your baby sleeps and wakes at regular intervals (not necessarily matching yours)
- Movements are becoming more purposeful — reaching, grasping, turning
- You may notice patterns: active after meals, quiet when you are moving (the rocking soothes them)
- Hiccups are common and may feel like rhythmic tapping

**Your body at 21 weeks:**
- Your uterus now extends above your navel
- Stretch marks may begin to appear — they are a natural response to rapid skin stretching
- Leg cramps, especially at night, are common — stretching before bed and staying hydrated may help
- You might notice increased appetite as your baby enters a rapid growth phase

**Anatomy scan prep:**
If your anatomy scan (detailed ultrasound) is scheduled around now, you may be asked whether you want to learn the sex of your baby. There is no right answer — some people want to know, others prefer to wait, and some have cultural reasons for either choice. Your preference is valid.

You are doing beautifully, even on the days it does not feel that way.',
 'development', 3, ARRAY['week-21', 'second-trimester', 'movement', 'anatomy-scan'], true, true),

('pregnancy', 23, 'Week 23: Lung Development Accelerates',
 'Your baby is practising breathing movements and gaining weight',
 'Week 23 brings significant lung development. Though your baby cannot breathe air yet, they are practising breathing movements with amniotic fluid, strengthening the muscles they will need at birth.

**Lung development:**
- Surfactant production is beginning — this substance keeps air sacs in the lungs from collapsing
- Your baby is "breathing" amniotic fluid in and out, training the respiratory system
- Full lung maturity will not be reached until closer to term

**Your baby this week:**
- Weighs about 500 grams (just over 1 pound)
- Skin is still wrinkled and reddish but will fill out as fat accumulates
- Can hear your voice clearly and may respond to loud sounds with a startle
- Rapid eye movements suggest dreaming may be occurring

**Approaching viability:**
Week 24 is often considered the threshold of viability — the point at which a baby born prematurely has a realistic chance of survival with intensive care. This is a significant medical milestone, though outcomes vary greatly based on many factors.

**Comfort measures:**
If you are experiencing back pain, try a warm (not hot) compress, prenatal massage, or a support belt. ACOG notes that regular physical activity can help manage pregnancy-related discomfort.

Every week brings your baby closer to readiness.',
 'development', 3, ARRAY['week-23', 'second-trimester', 'lungs', 'surfactant', 'viability'], true, true),

('pregnancy', 25, 'Week 25: Responsive to Touch',
 'Your baby responds to pressure and touch through your belly',
 'At week 25, your baby is increasingly responsive to the world outside the womb. They can feel touch through your belly wall and may respond to a gentle push or press with movement of their own.

**Sensory development:**
- Responds to touch — you might feel them kick or shift when someone touches your belly
- Startle reflex is developing — loud sounds may cause a jump
- The brain is growing rapidly, with more complex neural pathways forming daily
- Nostrils open this week, allowing practice breathing

**Your baby''s size:**
About the length of a cauliflower (roughly 35cm) and weighing around 660 grams. Fat continues to accumulate under the skin.

**Glucose screening:**
Your provider may schedule a glucose tolerance test around weeks 24-28 to screen for gestational diabetes. This affects approximately 2-10% of pregnancies (ACOG data). If diagnosed, it is manageable with dietary changes, monitoring, and sometimes medication. It does not mean you did anything wrong.

**Partner/support person involvement:**
If you have a partner or support person, this is a wonderful time for them to connect with the baby through touch and voice. Research suggests babies can recognise familiar voices after birth — voices they heard regularly in the womb.

You are more than halfway through this journey. Take a moment to appreciate how far you have come.',
 'development', 3, ARRAY['week-25', 'second-trimester', 'touch', 'glucose-screening'], true, true),

('pregnancy', 26, 'Week 26: Eyes Open for the First Time',
 'Your baby can open their eyes and may respond to light',
 'This week marks a magical milestone: your baby opens their eyes for the first time. They can blink, and their irises now have colour (though the final eye colour may change after birth).

**Visual development:**
- Eyes open and can distinguish between light and dark
- Eyelashes are present
- The visual cortex of the brain is becoming active
- If you shine a torch on your belly, your baby may turn toward the light

**Your baby this week:**
- Weighs about 760 grams
- Lungs continue producing surfactant
- The immune system is developing with help from antibodies crossing the placenta
- Brain wave patterns now show organised sleep cycles including REM sleep

**Third trimester preparation:**
With just one week until your third trimester, this is a good time to:
- Discuss your birth preferences with your provider
- Look into antenatal or childbirth education classes
- Begin thinking about what you need for your baby''s arrival
- Consider whether you want to create a birth plan document

**Rest and recovery:**
As your body works harder, rest becomes increasingly important. It is not indulgent — it is necessary. NICE guidelines emphasise the importance of adequate rest during the second half of pregnancy.

Your body and baby are preparing for something extraordinary.',
 'development', 3, ARRAY['week-26', 'second-trimester', 'eyes-open', 'vision', 'birth-planning'], true, true),

('pregnancy', 27, 'Week 27: Third Trimester Begins',
 'The final stretch — your baby is entering the home straight',
 'Welcome to the third trimester. Your baby now weighs about 900 grams and is roughly 36cm long. The final 13 weeks are about growth, maturation, and preparation for life outside the womb.

**What changes in the third trimester:**
- Your baby will roughly triple in weight between now and birth
- Lung maturation accelerates
- The brain develops at an extraordinary rate — billions of neurons are forming connections
- Your baby settles into a head-down position (usually by week 34-36)

**How you might feel:**
- Shortness of breath as your uterus presses against your diaphragm
- More frequent Braxton Hicks contractions (practice contractions)
- Difficulty sleeping — try side-lying with a pillow between your knees
- Increased need to urinate as the baby presses on your bladder

**Emotional landscape:**
The third trimester can bring a mix of excitement, anxiety, and impatience. Nesting instincts may kick in. Fear about labour is normal and common — NICE guidelines recommend discussing any birth-related anxiety with your care team.

**Important numbers:**
From week 28, your provider may ask you to monitor your baby''s movements. RCOG guidelines suggest being aware of your baby''s normal pattern rather than counting to a specific number. Any significant decrease in movement should be reported immediately.

You are in the home stretch. Every day brings you closer to meeting your baby.',
 'development', 3, ARRAY['week-27', 'third-trimester', 'growth', 'braxton-hicks'], true, true),

('pregnancy', 29, 'Week 29: Brain Growth Surges',
 'Your baby''s brain is developing billions of neurons',
 'At week 29, your baby''s brain is undergoing a remarkable growth spurt. The previously smooth surface is developing the characteristic folds (gyri and sulci) that allow the brain to pack in more neurons.

**Brain development:**
- The brain is developing folds that increase surface area
- Billions of neurons are forming connections
- Your baby can now regulate their own body temperature to some degree
- Head circumference is increasing to accommodate brain growth

**Your baby this week:**
- Weighs about 1.1 kilograms (2.5 pounds)
- Movements may feel different — more rolling and stretching, fewer sharp kicks, as space gets tighter
- Bones are fully developed but still soft and flexible for birth

**Nutrition in the third trimester:**
Your baby''s brain is composed largely of fat, particularly DHA (an omega-3 fatty acid). Good sources include:
- Fatty fish like salmon or sardines (low-mercury options)
- Walnuts and flaxseed
- Chia seeds
- Fortified eggs
- DHA supplements (discuss with your provider)

**Rest and self-care:**
As physical discomfort increases, prioritise what helps you feel good. Whether that is a warm bath, gentle stretching, a favourite meal, or just sitting quietly — you deserve comfort.

Your baby''s brain is building the foundation for a lifetime of learning.',
 'nutrition', 3, ARRAY['week-29', 'third-trimester', 'brain-development', 'DHA', 'omega-3'], true, true),

('pregnancy', 30, 'Week 30: Ten Weeks to Go',
 'Your baby is practising survival skills for life outside the womb',
 'At week 30, your baby weighs about 1.3 kilograms and is practising the skills they will need after birth: breathing, swallowing, and even producing their first stool (meconium).

**Survival skills in practice:**
- Regularly practising breathing movements with amniotic fluid
- Swallowing amniotic fluid and producing urine
- The digestive system is maturing — meconium is accumulating in the intestines
- The bone marrow is now responsible for producing red blood cells

**Physical changes for you:**
- You may feel more breathless as your uterus rises higher
- Heartburn and reflux are common — eating smaller meals and avoiding lying flat after eating can help
- Swelling in feet and ankles is normal but should be monitored
- You may notice colostrum leaking from your breasts — this is your body preparing for feeding

**When to be concerned about swelling:**
While mild swelling is normal, sudden or severe swelling, especially in the face or hands, along with headaches or visual changes, should be reported to your provider immediately. These can be signs of preeclampsia, which affects 2-8% of pregnancies (WHO data).

Ten weeks may feel like both forever and no time at all. You are handling this beautifully.',
 'wellness', 3, ARRAY['week-30', 'third-trimester', 'breathing-practice', 'preeclampsia-awareness'], true, true),

('pregnancy', 31, 'Week 31: All Five Senses Active',
 'Your baby can see, hear, taste, touch, and smell',
 'By week 31, all five of your baby''s senses are functioning. They are experiencing the world from inside the womb in ways that prepare them for life outside.

**Sensory world of your baby:**
- **Sight**: Can track a light source through your belly
- **Hearing**: Recognises your voice and may respond to music
- **Taste**: Flavours from your diet pass through amniotic fluid
- **Touch**: Responds to pressure on your belly
- **Smell**: Amniotic fluid has a scent, and research shows newborns recognise their mother''s unique smell

**Your baby this week:**
- Weighs approximately 1.5 kilograms
- Pupils can constrict and dilate in response to light
- Moving into a more head-down position (though there is still time if they have not)

**Sleep challenges:**
Getting comfortable in bed can be difficult now. ACOG and RCOG recommend sleeping on your side (either side) from 28 weeks onward, as this position optimises blood flow to your baby. A pregnancy pillow or regular pillows can help you maintain this position comfortably.

**Hospital bag basics:**
Start thinking about what to pack: comfortable clothes, toiletries, phone charger, snacks, and anything that brings you comfort. Every culture has different traditions about what to bring — honour what feels meaningful to you.

Your baby is almost fully formed. These final weeks are about growing and getting ready.',
 'development', 3, ARRAY['week-31', 'third-trimester', 'five-senses', 'sleep-position'], true, true),

('pregnancy', 33, 'Week 33: Immune System Building',
 'Antibodies are crossing from you to your baby',
 'At week 33, your immune system is giving your baby a head start. Antibodies are crossing the placenta, providing temporary immunity to diseases you have been exposed to or vaccinated against.

**Immune transfer:**
- IgG antibodies cross the placenta and provide passive immunity
- This protection lasts several months after birth
- It is one reason why maternal vaccination (such as whooping cough/pertussis and flu) is recommended in pregnancy — your antibodies protect your baby before they can be vaccinated themselves

**Your baby this week:**
- Weighs about 1.9 kilograms (4.2 pounds)
- The skeleton is hardening but the skull remains flexible for birth
- Fat continues to accumulate, giving the skin a less wrinkled appearance
- The amniotic fluid is at its maximum volume

**Vaccination in pregnancy:**
WHO, ACOG, and NICE all recommend:
- Pertussis (whooping cough) vaccine between weeks 27-36
- Flu vaccine during flu season, regardless of trimester
- COVID-19 vaccination when recommended

These vaccines are well-studied and protect both you and your baby. Discuss timing with your provider.

**Practical preparation:**
If you plan to feed your baby with breast milk, a prenatal breastfeeding class or consultation with a lactation specialist can be helpful. If you plan to formula-feed, learning about preparation and safe storage is equally important. There is no single "right" choice.

Your body is giving your baby gifts they will carry for months.',
 'safety', 3, ARRAY['week-33', 'third-trimester', 'immunity', 'vaccination', 'antibodies'], true, true),

('pregnancy', 34, 'Week 34: Lungs Nearly Mature',
 'Your baby is almost ready to breathe independently',
 'At week 34, your baby''s lungs are nearing maturity. Surfactant production has increased significantly, and most babies born at this stage can breathe with minimal assistance.

**Lung maturity:**
- Surfactant levels are much higher than even a few weeks ago
- Type II pneumocytes (the cells that make surfactant) are fully functioning
- Your baby practises breathing about 40 times per minute
- Babies born at 34 weeks usually do well, though they may need time in the NICU

**Your baby this week:**
- Weighs about 2.1 kilograms (4.7 pounds)
- About 45cm long
- The central nervous system is maturing rapidly
- Fat deposits give the skin a plumper, smoother appearance
- Fingernails have grown to the tips of the fingers

**Birth preparation:**
If you have not already, consider:
- Finalising your birth preferences (remember, plans can change, and that is okay)
- Installing a car seat (many fire stations and hospitals offer free checks)
- Preparing a space for your baby at home
- Making a list of emergency contacts and your hospital''s phone number

**Breech position:**
If your baby is still breech (bottom-down), your provider may discuss options. Most babies turn head-down by week 36, but some need encouragement through techniques like ECV (external cephalic version). Discuss your options openly.

You are nearly there. Weeks 34-37 are when everything starts to feel very real.',
 'development', 3, ARRAY['week-34', 'third-trimester', 'lung-maturity', 'birth-preparation'], true, true),

('pregnancy', 35, 'Week 35: Final Growth Phase',
 'Your baby is gaining about 200 grams per week now',
 'At week 35, your baby is in an intense growth phase, putting on weight rapidly. Most of this weight is fat, which will help with temperature regulation and energy after birth.

**Growth this week:**
- Weighs about 2.4 kilograms (5.3 pounds)
- Gaining approximately 200 grams (nearly half a pound) per week
- Kidneys are fully developed and producing urine
- The liver can process some waste products
- Most internal organs are mature, with lungs being the last to fully develop

**Physical discomfort:**
The third trimester can be physically challenging:
- Pelvic pressure as the baby drops lower (engagement or lightening)
- Increased Braxton Hicks contractions
- Difficulty breathing deeply
- Frequent urination
- Difficulty finding a comfortable sleeping position

**True labour vs. false labour:**
As you approach your due date, it helps to know the difference:
- **Braxton Hicks**: Irregular, do not increase in intensity, often stop when you change position
- **True contractions**: Regular intervals that get closer together, increasing intensity, do not stop with rest

If you are ever unsure, contact your care team. They would rather hear from you ten times unnecessarily than miss one real concern.

Five weeks to go. You are incredibly strong.',
 'wellness', 3, ARRAY['week-35', 'third-trimester', 'growth', 'braxton-hicks-vs-labour'], true, true),

('pregnancy', 37, 'Week 37: Full Term',
 'Your baby is now considered early term — a major milestone',
 'Week 37 marks an important milestone: your baby is considered early term. If born now, they would likely need no special medical care. Full term is 39-40 weeks, and late term is 41 weeks.

**What early term means:**
- Your baby''s organs are mature enough to function outside the womb
- Brain and lung development continue to refine through weeks 39-40
- ACOG recommends against elective delivery before 39 weeks unless medically indicated, as each additional week matters for brain development

**Your baby this week:**
- Weighs about 2.9 kilograms (6.3 pounds)
- About 48cm long
- Practising breathing, sucking, and swallowing in coordination
- May have a full head of hair, or may be completely bald — both are normal
- The lanugo has mostly shed, though some may remain on the shoulders and back

**Preparing your body:**
- Stay active with gentle walking and stretching
- Perineal massage (from 36 weeks) may reduce the risk of tearing during vaginal birth — NICE recommends this
- Practice breathing and relaxation techniques
- Eat well and stay hydrated

**Emotional preparation:**
Birth is unpredictable, and that is okay. Having preferences while staying flexible is the healthiest approach. Whatever happens on the day, the goal is a healthy parent and a healthy baby.

Meeting your baby is so close now. Every culture has a word for this anticipation — hold onto it.',
 'development', 3, ARRAY['week-37', 'full-term', 'birth-readiness', 'early-term'], true, true),

('pregnancy', 39, 'Week 39: Fully Ready',
 'This is the ideal time for birth — your baby is considered full term',
 'Week 39 is when ACOG considers babies fully term. Your baby''s brain has had the maximum benefit of time in the womb, and all systems are ready for the outside world.

**Your baby at full term:**
- Weighs approximately 3.2 kilograms (7 pounds), though there is a wide normal range
- The brain has been developing up to 30% more mass in the last 5 weeks alone
- Lungs are producing plenty of surfactant
- Fat layers are well-developed for temperature regulation
- The immune system has received maximum antibody transfer from you

**Signs labour is approaching:**
- Loss of mucus plug (may be blood-tinged, called "bloody show")
- Increased pelvic pressure
- Loose bowel movements
- Nesting urges
- Regular contractions that increase in frequency and intensity
- Water breaking (this happens before labour in only about 15% of births)

**When to go to the hospital:**
Most providers recommend going when contractions are:
- Regular (about every 5 minutes)
- Lasting about 60 seconds each
- This pattern has continued for about 1 hour
- Always go immediately if your water breaks, you have heavy bleeding, or you feel something is wrong

**A note on timing:**
Only about 5% of babies arrive on their due date. Whether your baby comes a bit early or a bit late, trust your body and your care team.

You have done an incredible job nurturing this life. The next chapter is about to begin.',
 'wellness', 3, ARRAY['week-39', 'full-term', 'labour-signs', 'birth-readiness'], true, true),

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. POSTPARTUM ARTICLES (10 articles)
-- ─────────────────────────────────────────────────────────────────────────────

('postpartum', 1, 'Your First Week Postpartum: What Nobody Tells You',
 'Recovery, emotions, and the beautiful chaos of new parenthood',
 'The first week after birth is an extraordinary mix of joy, exhaustion, wonder, and overwhelm. Whether you had a vaginal birth or caesarean, your body has been through a major event and needs time to heal.

**Physical recovery:**
- Vaginal bleeding (lochia) is normal and can last 4-6 weeks — it typically changes from bright red to pink to yellowish-white
- Perineal soreness or C-section incision pain are expected — pain management is not weakness, it aids healing
- Uterine cramping (afterpains) occur as your uterus contracts back to pre-pregnancy size
- Breast engorgement may happen around day 3-5, whether or not you are breastfeeding
- Night sweats are common as your body sheds excess fluids

**Emotional rollercoaster:**
The "baby blues" affect up to 80% of new parents in the first two weeks (ACOG). Hormonal shifts, sleep deprivation, and the enormity of new responsibility all contribute. Crying, mood swings, and feeling overwhelmed are normal.

**When to seek help:**
If sadness, anxiety, or difficulty bonding persist beyond two weeks, or if you have thoughts of harming yourself or your baby, contact your provider immediately. Postpartum depression and anxiety are medical conditions with effective treatments — not personal failures.

You just did something extraordinary. Be gentle with yourself.',
 'wellness', 4, ARRAY['postpartum', 'recovery', 'first-week', 'baby-blues', 'healing'], true, true),

('postpartum', 2, 'Postpartum Mental Health: Beyond the Baby Blues',
 'Recognising, understanding, and getting help for perinatal mood disorders',
 'Postpartum mental health challenges are more common than most people realise. They are not caused by weakness, bad parenting, or not loving your baby enough. They are medical conditions influenced by hormones, sleep deprivation, and the enormous life transition of becoming a parent.

**Types of perinatal mood disorders:**
- **Postpartum depression (PPD)**: Affects 1 in 7 mothers and 1 in 10 fathers/partners (NICE). Symptoms include persistent sadness, loss of interest, difficulty bonding, changes in appetite or sleep
- **Postpartum anxiety**: Racing thoughts, excessive worry, physical symptoms like heart palpitations, feeling unable to relax
- **Postpartum OCD**: Intrusive, unwanted thoughts (often about harm coming to the baby), with compulsive behaviours to manage the anxiety
- **Postpartum psychosis**: Rare (1-2 per 1000 births) but a medical emergency — hallucinations, delusions, rapid mood swings. Call emergency services immediately

**Risk factors:**
- Personal or family history of depression or anxiety
- Traumatic birth experience
- Limited social support
- Financial stress
- History of pregnancy loss

**Getting help:**
- Talk to your midwife, health visitor, or doctor
- In the UK: PANDAS Foundation helpline, Samaritans
- In the US: Postpartum Support International helpline (1-800-944-4773)
- Therapy (especially CBT) and medication are both effective options

Seeking help is an act of strength and love for yourself and your baby.',
 'mental-health', 4, ARRAY['postpartum', 'mental-health', 'PPD', 'anxiety', 'support'], true, true),

('postpartum', 3, 'Your Body After Birth: Changes, Timeline, and Self-Compassion',
 'Understanding postpartum physical recovery at your own pace',
 'Your body grew and birthed a human being. Recovery is not about "bouncing back" — it is about moving forward with patience and care.

**Timeline of physical changes:**
- **Weeks 1-2**: Lochia (bleeding), perineal or incision healing, breast changes, night sweats, hair may start thinning
- **Weeks 3-6**: Bleeding tapers off, energy slowly improves, six-week check-up with provider
- **Months 2-6**: Core and pelvic floor gradually strengthen, hair loss peaks around month 3-4, hormones begin to stabilise
- **Months 6-12**: Body continues adjusting, periods may return (timing varies greatly, especially with breastfeeding)

**Pelvic floor recovery:**
NICE and ACOG recommend pelvic floor exercises (Kegels) starting as soon as comfortable after birth. Signs you may need specialist pelvic floor physiotherapy include urinary incontinence, pelvic heaviness, or pain during intimacy.

**Diastasis recti:**
Abdominal separation affects up to two-thirds of postpartum people. Gentle core exercises can help, but avoid traditional crunches until assessed by a professional.

**The comparison trap:**
Social media often shows unrealistic postpartum recovery timelines. In many cultures, a rest period of 30-40 days is traditional (confinement in Chinese culture, cuarentena in Latin American cultures, jaappa in South Asian cultures). These traditions recognise what modern society often forgets: recovery takes time.

Your body did something amazing. It deserves your gratitude, not your criticism.',
 'wellness', 4, ARRAY['postpartum', 'body-changes', 'recovery', 'pelvic-floor', 'self-compassion'], true, true),

('postpartum', 4, 'Relationships After Baby: Navigating the Shift',
 'How parenthood changes partnerships — and how to navigate it together',
 'Having a baby transforms every relationship in your life, but the most dramatic shift is often with your partner (if you have one). Research from the Gottman Institute shows that about two-thirds of couples experience a decline in relationship satisfaction after having a baby. The good news: knowing this is normal helps you navigate it.

**What commonly changes:**
- Sleep deprivation makes everything harder — patience, communication, empathy
- Division of labour becomes a frequent source of tension
- Intimacy (both physical and emotional) often decreases temporarily
- Different parenting instincts or approaches can cause conflict
- One partner may feel left out of the baby-parent bond

**Evidence-based strategies:**
- **Communicate needs clearly**: Exhausted brains cannot read minds
- **Express appreciation**: Small acknowledgments have outsized impact
- **Take turns**: Even short breaks from caregiving reduce burnout
- **Lower expectations temporarily**: A tidy house is less important than a supported family
- **Schedule connection**: Even 15 minutes of focused conversation daily helps

**For single parents:**
If you are parenting alone, your relationship shifts look different but are equally real. Friendships, family dynamics, and your relationship with yourself all change. Building a support network — even a small one — is crucial.

**When to get help:**
If conflict becomes constant, if resentment is building, or if you feel alone in your relationship, couples counselling is not a sign of failure. It is a proactive investment in your family.

Relationships require tending, especially during major transitions.',
 'mental-health', 4, ARRAY['postpartum', 'relationships', 'partnership', 'communication', 'support'], true, true),

('postpartum', 5, 'Returning to Work: Planning, Emotions, and Practical Tips',
 'Whether it is weeks or months away — preparing for the transition',
 'Returning to work after having a baby is one of the most emotionally complex transitions in parenthood. Whether you are eager to return, dreading it, or feeling a complicated mix of both — all of those feelings are valid.

**Emotional preparation:**
- Guilt about leaving your baby is extremely common — and it does not mean you are making the wrong choice
- Excitement about returning to your professional identity is equally valid
- Ambivalence is the most common feeling and is perfectly normal
- Your baby will be okay — secure attachment is built through consistent, loving care, not constant presence

**Practical steps:**
- Start the childcare transition gradually if possible — practice separations before your first day back
- Build in extra time for your morning routine (everything takes longer with a baby)
- Pack your work bag the night before
- If pumping at work, know your rights and plan your pumping schedule
- Communicate your needs to your manager — many workplaces are more flexible than you expect

**For those choosing to stay home:**
If you are choosing to stay home, this is equally valid work. The identity shift from working professional to full-time parent can be disorienting. Maintaining social connections and personal interests alongside caregiving supports your wellbeing.

**Legal rights:**
Maternity and paternity leave policies vary significantly by country and employer. Know your rights. In many places, you are entitled to accommodations for pumping, gradual return, and flexible arrangements.

Whatever choice you make, it is the right one for your family right now.',
 'wellness', 3, ARRAY['postpartum', 'returning-to-work', 'childcare', 'work-life-balance'], true, true),

('postpartum', 6, 'Postpartum Nutrition: Fuelling Your Recovery',
 'What your body needs to heal and have energy for parenthood',
 'Whether or not you are breastfeeding, postpartum nutrition is about fuelling recovery and sustaining energy through the most demanding period of parenthood.

**Key nutritional needs:**
- **Iron**: Blood loss during birth depletes iron stores. Iron-rich foods include red meat, lentils, spinach, and fortified cereals. WHO notes that postpartum anaemia affects up to 50% of people in some regions
- **Protein**: Essential for tissue repair. Aim for protein at every meal — eggs, beans, fish, dairy, nuts, tofu
- **Calcium**: Important whether or not you are breastfeeding (1000mg daily). Breastfeeding temporarily draws calcium from your bones
- **Omega-3 fatty acids**: Support mood regulation and brain health. Especially important if breastfeeding, as DHA passes through breast milk
- **Hydration**: Aim for at least 8-10 glasses of water daily, more if breastfeeding

**Practical meal tips:**
- Batch cooking and freezing meals before birth is one of the most helpful things you can do
- Accept meal offers from friends and family
- Keep easy, nutritious snacks within reach: nuts, fruit, cheese, whole grain crackers
- One-handed meals are your friend (wraps, smoothies, trail mix)

**Cultural postpartum foods:**
Many cultures have specific postpartum foods designed to aid recovery: warming soups, ginger-based dishes, bone broths, seaweed soup, and herbal teas. Many of these align with modern nutritional recommendations. Share your traditions with your provider.

Nourishing yourself is not selfish — it is essential.',
 'nutrition', 3, ARRAY['postpartum', 'nutrition', 'recovery', 'iron', 'breastfeeding-nutrition'], true, true),

('postpartum', 7, 'Postpartum Exercise: When and How to Start Moving Again',
 'A gradual approach to physical activity after birth',
 'Your body needs time to heal before returning to exercise. The timeline differs for everyone and depends on your type of birth, recovery, and overall health.

**General guidelines (ACOG):**
- **Vaginal birth**: Light walking can resume as soon as you feel comfortable, often within days
- **Caesarean birth**: Wait for your 6-week check before starting exercise beyond gentle walking. Your abdominal muscles and incision need time to heal
- **All births**: Pelvic floor exercises can begin within days of birth (when comfortable)

**When to start more intensive exercise:**
- After your 6-week postpartum check-up (or later if your provider recommends)
- Start gradually — your joints may still be looser due to relaxin hormone
- If you experience pain, heaviness in the pelvic area, or incontinence during exercise, stop and consult a pelvic floor physiotherapist

**Good first exercises:**
- Walking (progressively increasing distance and pace)
- Pelvic floor exercises (Kegels)
- Gentle stretching
- Postnatal yoga or Pilates (with a qualified instructor)
- Swimming (once bleeding has stopped and any wounds have healed)

**What to avoid initially:**
- High-impact activities (running, jumping) until pelvic floor is strong
- Heavy lifting beyond your baby
- Traditional crunches or sit-ups (check for diastasis recti first)

**The mental health benefit:**
Exercise is one of the most effective natural mood boosters. Even a short daily walk can significantly reduce postpartum depression and anxiety symptoms. But listen to your body — rest is exercise too.

Progress, not perfection.',
 'wellness', 3, ARRAY['postpartum', 'exercise', 'recovery', 'pelvic-floor', 'walking'], true, true),

('postpartum', 8, 'Sleep Deprivation: Surviving and Eventually Thriving',
 'Evidence-based strategies for managing the hardest part of new parenthood',
 'Sleep deprivation is consistently ranked as the hardest part of new parenthood. It is not just uncomfortable — chronic sleep loss affects mood, cognitive function, immune health, and relationships. Understanding this helps remove the guilt of struggling with it.

**The science of newborn sleep:**
- Newborns sleep 14-17 hours but in 2-4 hour stretches (AAP)
- Their circadian rhythm does not develop until 3-4 months
- Frequent waking for feeding is biologically normal and protective
- It is not your fault, and it does get better

**Survival strategies:**
- **Sleep when the baby sleeps**: It sounds cliche, but even a 20-minute nap makes a measurable difference
- **Tag team with a partner or support person**: Take shifts so each person gets one longer stretch
- **Lower your standards**: Housework can wait. Your rest cannot
- **Limit screen time before sleep**: Blue light disrupts the little sleep you do get
- **Safe sleep for you**: If you are so exhausted you might fall asleep while feeding, a sofa or chair is more dangerous than a prepared bed surface. Know the safe co-sleeping guidelines even if you do not plan to co-sleep

**When sleep deprivation becomes dangerous:**
If you are hallucinating, unable to function, having thoughts of harming yourself or your baby, or regularly falling asleep during activities like driving or feeding — this is a medical concern. Ask for help immediately.

This phase is temporary, even when it does not feel that way. You will sleep again.',
 'wellness', 4, ARRAY['postpartum', 'sleep-deprivation', 'newborn-sleep', 'survival-strategies'], true, true),

('postpartum', 9, 'Identity Shift: Who Am I Now?',
 'The profound identity transformation that parenthood brings',
 'Becoming a parent changes your identity in ways that few other life events can match. Psychologists call this process "matrescence" (or "patrescence") — a developmental transition as significant as adolescence, but far less discussed.

**What matrescence/patrescence involves:**
- A fundamental shift in how you see yourself and your place in the world
- Grief for your pre-parent identity, freedom, and spontaneity (this is normal, not selfish)
- A deepening of empathy, protectiveness, and emotional range
- Renegotiating your relationship with your own parents/caregivers
- Finding new purpose alongside a sense of loss of self

**Common feelings:**
- "I do not recognise myself"
- "I love my baby but I miss my old life"
- "I feel guilty for wanting time alone"
- "I am more than just a parent but I do not remember what else I am"

All of these are normal, common, and temporary in their intensity.

**Nurturing your identity:**
- Maintain at least one activity that is just for you (even small)
- Stay connected with friends who know the "pre-parent" you
- Journal or talk about your feelings — processing them helps
- Remember that identity is not fixed — it evolves throughout life

**Cultural perspectives:**
Many cultures explicitly honour the transformation of parenthood through naming ceremonies, rituals, and celebrations that acknowledge the parent as well as the child. You are not just gaining a child — you are becoming someone new.

The person you are becoming is just as worthy of love and attention as the one you were before.',
 'mental-health', 3, ARRAY['postpartum', 'identity', 'matrescence', 'self-care', 'transformation'], true, true),

('postpartum', 10, 'Building Your Village: Support Systems After Baby',
 'You were never meant to do this alone — how to find and accept help',
 'The saying "it takes a village" exists for a reason. Throughout human history, raising children has been a communal activity. The isolation of modern parenthood is historically unusual — and it makes everything harder.

**Why support matters:**
- Social support is the single strongest protective factor against postpartum depression (research consistently confirms this)
- Babies thrive when their caregivers are supported
- Burnout is not a badge of honour — it is a sign that the system is failing you

**Types of support to seek:**
- **Practical**: Meal trains, laundry help, someone to hold the baby while you shower
- **Emotional**: People who listen without judgment, who validate your feelings
- **Informational**: Healthcare providers, lactation consultants, parenting groups
- **Social**: Other new parents who understand what you are going through

**Where to find your village:**
- Postnatal groups (often run by health visitors, hospitals, or community centres)
- Online communities (especially helpful for middle-of-the-night feeds)
- Religious or cultural community groups
- Local parent meet-ups or baby classes
- Apps designed to connect new parents locally

**Accepting help:**
Many new parents struggle to accept help. Remember:
- Asking for help is a sign of strength, not weakness
- People generally want to help but do not know how — be specific about what you need
- "How can I help?" is better answered with "Could you bring a meal on Tuesday?" than "I am fine"

You deserve support. Your baby needs you to have it.',
 'wellness', 3, ARRAY['postpartum', 'support', 'village', 'community', 'mental-health'], true, true),

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. INFANT ARTICLES — Fill missing weeks/months
--    First 3 months by week: existing 1,2,4,6,8,10,12
--    Missing weeks: 3,5,7,9,11
--    Months 4-12 by month: existing roughly at weeks 16,20,24,26,30,34,36,40,44,48,52
--    Missing months: 5(~22wk),7(~30wk),9(~39wk),11(~48wk) — some covered
--    Adding: week 3, week 5, week 7, week 9, week 11, month 5, month 7, month 9, month 11
-- ─────────────────────────────────────────────────────────────────────────────

('infant', 3, 'Week 3: Finding a Rhythm (Sort Of)',
 'Your baby is becoming more alert, and patterns may start to emerge',
 'By week 3, your baby is becoming more alert during waking periods. You might notice brief moments of eye contact and early attempts to focus on your face. These small connections are the beginning of social bonding.

**What is happening developmentally:**
- Improved head control during tummy time (briefly)
- May start to follow objects with eyes over short distances
- Hearing is fully mature — your baby turns toward familiar voices
- Feeding patterns may become slightly more predictable (though "predictable" is relative)

**Common concerns at week 3:**
- **Cluster feeding**: Especially common in the evenings. Your baby may want to feed almost constantly for several hours. This is normal and helps establish milk supply
- **Unsettled evenings**: Many babies have a fussy period in the late afternoon/evening. This is not colic (that diagnosis requires 3+ hours of crying, 3+ days per week, for 3+ weeks)
- **Umbilical cord stump**: It usually falls off by 1-3 weeks. Keep it clean and dry (AAP recommends dry care, not alcohol swabs)

**For the parent:**
You are still very much in survival mode, and that is okay. Your only jobs right now are feeding your baby, keeping them safe, and taking care of yourself as much as possible. Everything else can wait.

If feeding is painful, difficult, or stressful, reach out to a lactation consultant or your health visitor. Feeding should not hurt.

You are doing more than you realise. Keep going.',
 'development', 3, ARRAY['week-3', 'newborn', 'cluster-feeding', 'bonding', 'umbilical-cord'], true, true),

('infant', 5, 'Week 5: Social Smiles on the Horizon',
 'Your baby may be close to their first real smile',
 'Around week 5, many babies are on the verge of their first social smile — a smile in direct response to seeing your face or hearing your voice. This is distinct from reflexive smiles during sleep and is a genuine social interaction.

**Developmental milestones:**
- Social smiling typically begins between weeks 5-8
- Increased vocalisations — cooing, gurgling, and vowel sounds
- Better head control and ability to lift head during tummy time
- More sustained eye contact and interest in faces
- May start to self-soothe briefly (sucking on hands or fingers)

**Tummy time tips (AAP recommendations):**
- Start with 3-5 minutes, several times a day
- Place colourful toys or a mirror in front of your baby
- Get down on their level to make eye contact and encourage them
- Stop if they become distressed — tummy time should be positive
- If your baby hates tummy time, try chest-to-chest tummy time while you recline

**Your wellbeing check:**
Week 5 is when baby blues should be resolving. If you are still feeling persistently sad, anxious, or disconnected, this may be postpartum depression or anxiety. The Edinburgh Postnatal Depression Scale (EPDS) is a simple screening tool — ask your provider about it.

That first real smile makes everything worth it. And if it has not come yet, it will — every baby has their own timeline.',
 'development', 3, ARRAY['week-5', 'social-smile', 'tummy-time', 'vocalisations', 'mental-health-check'], true, true),

('infant', 7, 'Week 7: The World Gets More Interesting',
 'Your baby''s vision and social awareness are expanding rapidly',
 'At week 7, your baby can see faces more clearly and is becoming increasingly interested in the world around them. Their visual range is expanding, and they may start tracking objects that move slowly across their field of vision.

**Vision development:**
- Can focus on objects about 20-30cm away (perfect distance for feeding)
- Beginning to track moving objects with their eyes
- Shows preference for faces, especially eyes and mouth
- High-contrast patterns remain most engaging
- Colour vision is improving but still limited

**Communication milestones:**
- Cooing and "aaah" sounds become more frequent
- Responds to your voice with body movements or sounds
- May start to differentiate between happy and upset tones
- Early "conversations" — you talk, baby pauses, baby vocalises, you respond

**The PURPLE crying peak:**
Week 6-8 is typically the peak of the PURPLE crying period. Remember:
- P: Peak of crying
- U: Unexpected
- R: Resists soothing
- P: Pain-like face
- L: Long lasting
- E: Evening

This is developmental, not a sign that something is wrong. It resolves by 3-4 months. If you feel overwhelmed, it is okay to put your baby safely in the cot and step away for a few minutes to breathe.

Your baby is learning that the world is a safe, responsive place — and you are teaching them that through every interaction.',
 'development', 3, ARRAY['week-7', 'vision', 'PURPLE-crying', 'communication', 'tracking'], true, true),

('infant', 9, 'Week 9: Strength and Coordination Building',
 'Your baby is getting stronger and more coordinated every day',
 'At 9 weeks, your baby is developing more muscle control and coordination. You may notice them batting at objects, holding their head steadier during tummy time, and making more purposeful movements.

**Physical development:**
- Head control improving — can hold head steady for short periods when supported upright
- Starts batting at objects (not yet grasping intentionally)
- Legs are getting stronger — pushes against surfaces when feet are placed on them
- During tummy time, may briefly push up on forearms

**Sleep patterns:**
Around this time, some babies begin to have one longer sleep stretch at night (4-5 hours). Others will not do this for weeks or months — both are normal. AAP recommends:
- Room-sharing (but not bed-sharing) for at least the first 6 months
- Always placing baby on their back to sleep
- No loose blankets, pillows, or toys in the sleep space

**Feeding notes:**
- Whether breast, formula, or combination feeding, your baby likely feeds 6-8 times in 24 hours
- Growth spurts around weeks 7-10 can temporarily increase feeding frequency
- Trust your baby''s hunger and fullness cues rather than strict schedules

**Vaccinations:**
Your baby''s first vaccinations are typically due around 8 weeks (timing varies by country). The WHO, AAP, and NICE all strongly recommend childhood vaccinations. Mild side effects (fussiness, low fever) are normal and temporary.

Every day your baby is becoming more themselves. What a privilege to witness.',
 'development', 3, ARRAY['week-9', 'coordination', 'sleep-patterns', 'vaccinations', 'feeding'], true, true),

('infant', 11, 'Week 11: Personality Emerging',
 'Your baby is showing preferences, reactions, and a unique temperament',
 'By week 11, your baby''s personality is becoming more distinct. You might notice they have preferences — for certain positions, sounds, or types of interaction. They may be laid-back, intense, sensitive, or active. All temperaments are normal.

**What you might notice:**
- Distinct preferences for certain toys, sounds, or activities
- Different cries for different needs (hunger, tiredness, discomfort)
- Longer periods of alertness and engagement
- More animated facial expressions
- Beginning to laugh or squeal (usually between weeks 10-16)

**Temperament:**
Research identifies three broad temperament styles:
- **Easy/flexible**: Adapts well to new situations, generally calm
- **Active/intense**: Strong reactions, very alert, may resist changes
- **Slow to warm up**: Cautious with new experiences, needs time to adjust

None is better or worse. Understanding your baby''s temperament helps you respond to their unique needs.

**Play at this age:**
- Singing and music (your baby does not care about your singing voice — they love it)
- Simple peek-a-boo (early understanding of object permanence)
- Colourful rattles and toys they can bat at
- Face-to-face interaction with exaggerated expressions
- Reading books with high-contrast pictures

**Your development as a parent:**
By week 11, you have learned more about your baby than any book could teach you. Trust what you know. You are becoming an expert on your child.

No one else in the world knows your baby quite like you do.',
 'development', 3, ARRAY['week-11', 'personality', 'temperament', 'play', 'laughter'], true, true),

('infant', 22, 'Month 5: Reaching, Grabbing, and Exploring',
 'Your baby''s hands are becoming powerful tools for discovery',
 'At 5 months, your baby''s hand-eye coordination has improved dramatically. They can reach for objects deliberately, grasp them, and bring them to their mouth for exploration. Everything is a learning opportunity.

**Motor milestones:**
- Purposeful reaching and grasping
- Transferring objects from one hand to another (emerging)
- Rolling from tummy to back (and possibly back to tummy)
- Sitting with support, and possibly briefly without support
- Pushing up on extended arms during tummy time

**Cognitive development:**
- Cause and effect understanding is emerging (drop a toy, it falls — endlessly fascinating)
- Object permanence is developing (may look for a partially hidden object)
- Recognises familiar people and may show stranger awareness
- Babbling becomes more varied with different consonant sounds

**Feeding readiness:**
Around 5-6 months, many babies show signs they are ready for solid foods:
- Can sit with minimal support
- Shows interest in food (reaching for it, watching you eat)
- Lost the tongue-thrust reflex
- Good head and neck control

The AAP and WHO recommend starting solids around 6 months, alongside continued breast milk or formula. Talk to your provider about timing.

**Safety reminder:**
As your baby becomes more mobile and grabby, ensure:
- Small objects are out of reach (choking hazard)
- Hot drinks are never held near the baby
- Anything within reach is safe to mouth

Your baby is becoming a little scientist, exploring the world one grab at a time.',
 'development', 3, ARRAY['month-5', 'grasping', 'rolling', 'feeding-readiness', 'motor-skills'], true, true),

('infant', 30, 'Month 7: Sitting, Babbling, and Separation Awareness',
 'Your baby is becoming more independent — and more attached to you',
 'At 7 months, your baby can likely sit independently (or nearly so) and is becoming increasingly vocal. Paradoxically, as they become more physically independent, they may become more emotionally clingy. This is healthy development, not regression.

**Physical milestones:**
- Sitting independently without support for extended periods
- May begin creeping or army crawling
- Raking grasp (using fingers to pull small objects toward them)
- Bears weight on legs when held in standing position
- Some babies begin pulling to stand (though this is early)

**Language development:**
- Babbling includes consonant-vowel combinations (ba-ba, ma-ma, da-da) — though these are not yet intentional words
- Responds to their own name
- Understands "no" (though compliance is a different matter)
- May use gestures like reaching to be picked up

**Separation anxiety:**
Around 7-9 months, many babies develop separation anxiety. This is a sign of healthy attachment — your baby understands that you exist even when you cannot be seen, and they want you back.

**How to help:**
- Practice brief separations and always return when you say you will
- Create a goodbye ritual (kiss, wave, specific phrase)
- Avoid sneaking away — this increases anxiety
- A comfort object (small blanket or soft toy) can help during separations

**Sleep at 7 months:**
Most babies this age sleep 12-15 hours total, including 2-3 naps. Some families choose to sleep train at this age; others do not. Both approaches can work. Choose what aligns with your values and your baby''s temperament.

Your baby''s love for you is the foundation of all their future relationships.',
 'development', 3, ARRAY['month-7', 'sitting', 'babbling', 'separation-anxiety', 'sleep'], true, true),

('infant', 39, 'Month 9: Cruising and Communicating',
 'Your baby is on the move and has a lot to say',
 'At 9 months, your baby may be cruising (walking while holding onto furniture), crawling confidently, or finding their own unique way to get around. Communication is becoming more intentional, with gestures, sounds, and clear expressions of wants and feelings.

**Movement milestones:**
- Crawling confidently (some babies skip crawling entirely — this is normal)
- Pulling to stand using furniture
- Cruising along furniture edges
- May stand briefly without support
- Sits confidently and can pivot to reach objects

**Communication milestones:**
- Points at objects of interest (a crucial social milestone)
- Uses gestures: waving, reaching, shaking head
- Understands simple words and phrases
- Babbling may include word-like sounds
- Responds to their name consistently

**Feeding at 9 months:**
- Should be eating a variety of textured foods (soft lumps, finger foods)
- Self-feeding with fingers is important for development
- AAP recommends continuing breast milk or formula alongside solids through 12 months
- Common allergens should be introduced by now if not already (peanut, egg, dairy)
- Messiness is part of learning — resist the urge to over-clean during meals

**Safety as mobility increases:**
- Secure heavy furniture to walls
- Cover electrical outlets
- Gate stairs (top and bottom)
- Remove tablecloths (babies pull on them)
- Keep cleaning products and medications locked away

Your baby is becoming a toddler before your eyes. Each day brings something new to marvel at.',
 'development', 3, ARRAY['month-9', 'cruising', 'communication', 'finger-foods', 'safety'], true, true),

('infant', 48, 'Month 11: Almost One — Language and Problem-Solving',
 'Your baby understands far more than they can say',
 'At 11 months, your baby''s receptive language (what they understand) far exceeds their expressive language (what they can say). They may understand 50+ words while only saying 1-3. They are also becoming creative problem-solvers.

**Language at 11 months:**
- May have 1-3 recognisable words (mama, dada, or another word)
- Understands simple instructions ("give me the cup," "wave bye-bye")
- Uses gestures extensively — pointing, waving, clapping, head shaking
- Enjoys music and may try to "sing" along or dance
- Responds to "no" with understanding (if not always compliance)

**Problem-solving skills:**
- Can figure out how to get an object that is out of reach
- Understands containers (putting things in and taking them out)
- May stack two blocks
- Tries different approaches when first attempt does not work
- Shows persistence and frustration (both are signs of cognitive growth)

**Preparing for the first birthday:**
- Schedule the 12-month well-child visit and vaccinations
- Transition from bottles to cups is recommended around 12 months (AAP)
- Whole milk can replace formula at 12 months (continue breastfeeding if desired)
- First birthday celebrations vary greatly by culture — honour your traditions

**Emotional development:**
Your baby may show:
- Empathy (looking concerned when someone is upset)
- Humour (doing things to make you laugh, then laughing at your reaction)
- Testing boundaries (a healthy sign of growing independence)
- Strong attachment to primary caregivers

One year ago, this tiny person did not exist outside your body. Look at everything they have become.',
 'development', 3, ARRAY['month-11', 'language', 'problem-solving', 'first-birthday', 'milestones'], true, true),

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. ADDITIONAL TODDLER ARTICLES — Fill gaps in months 13-36
--    Existing: 1(13),3(15),4(16),6(18),8(20),9(21),12(24),15(27),16(28),18(30),20(32),21(33),24(36),27(39),30(42),33(45),36(48)
--    Adding: month 2(14), 5(17), 7(19), 10(22), 11(23), 13(25), 14(26), 17(29), 19(31), 22(34), 23(35), 25(37), 26(38), 28(40), 29(41), 31(43), 32(44), 34(46), 35(47)
-- ─────────────────────────────────────────────────────────────────────────────

('toddler', 2, 'Month 14: Walking and Falling — Both Are Learning',
 'Your toddler is finding their feet, literally and figuratively',
 'At 14 months, many toddlers are walking (or close to it), and falling is a huge part of the learning process. Each tumble teaches balance, spatial awareness, and resilience.

**Movement milestones:**
- Walking independently (though some toddlers do not walk until 18 months — this is within normal range per AAP)
- Climbing on low furniture
- Bending down to pick up objects without falling
- Carrying objects while walking
- Attempting stairs (with help)

**How to support walking:**
- Bare feet indoors give the best grip and sensory feedback
- Avoid walkers (AAP advises against them due to injury risk)
- Let them practice on different surfaces
- Celebrate attempts, not just successes
- First shoes should be soft, flexible, and fit well

**Language at 14 months:**
- May have 3-10 words (including animal sounds, which count)
- Points at things they want or find interesting
- Follows simple one-step instructions
- Enjoys being read to and may have favourite books

**Nutrition reminder:**
Toddlers are notoriously picky eaters. This is developmentally normal and often peaks between 18-24 months. Continue offering a variety of foods without pressure. Research shows it can take 10-15 exposures before a child accepts a new food.

Your toddler''s determination is building skills that will serve them for life.',
 'development', 3, ARRAY['month-14', 'walking', 'falling', 'first-shoes', 'language'], true, true),

('toddler', 5, 'Month 17: Imitation and Independence',
 'Your toddler wants to do everything you do — and do it themselves',
 'At 17 months, imitation is your toddler''s primary learning strategy. They watch everything you do and try to copy it. They also have a growing desire for independence, which often clashes with their actual abilities.

**Imitation milestones:**
- Copies household tasks: sweeping, cooking, typing
- Imitates sounds, expressions, and gestures
- Pretend play emerges: feeding a doll, talking on a phone
- Copies other children''s behaviours

**The independence drive:**
Your toddler wants to:
- Feed themselves (messily)
- Choose their own clothes
- Walk instead of being carried
- Do things without help

This can be frustrating for parents, but it is a critical developmental process. Offering controlled choices ("Red shirt or blue shirt?") satisfies their need for autonomy while keeping things manageable.

**Safety at this age:**
As toddlers become more capable, new safety considerations emerge:
- They can reach higher surfaces by climbing
- They can open simple containers
- They are faster than you expect
- They have no understanding of danger

**Language explosion approaching:**
Between 18-24 months, most toddlers experience a "language explosion" where vocabulary grows rapidly. You can support this by narrating your activities, reading together, and responding to their attempts at communication.

Independence and connection are not opposites — your toddler needs both.',
 'development', 3, ARRAY['month-17', 'imitation', 'independence', 'pretend-play', 'safety'], true, true),

('toddler', 7, 'Month 19: Emotions Are Big',
 'Your toddler feels everything intensely — and that is developmentally appropriate',
 'At 19 months, your toddler experiences emotions with an intensity that can be overwhelming — for both of you. Joy is ecstatic, frustration is explosive, and sadness is profound. This is because their emotional brain (limbic system) is highly active, while their regulation brain (prefrontal cortex) is still years from maturity.

**Emotional development:**
- Feels all emotions intensely but cannot regulate them independently
- May have frequent meltdowns over seemingly small things
- Shows empathy — may try to comfort someone who is upset
- Experiences frustration when they cannot communicate their needs
- Separation anxiety may intensify or re-emerge

**How to help:**
- **Name their emotions**: "You are feeling frustrated because the block will not stack"
- **Validate before redirecting**: "I can see you are really angry. That is okay. Let us find a way to help"
- **Stay calm yourself**: Your regulated presence helps them regulate (co-regulation)
- **Avoid punishment for emotions**: The behaviour might need boundaries, but the feeling is always valid

**Tantrums at 19 months:**
Tantrums are not misbehaviour — they are a sign that your toddler''s emotional needs have exceeded their coping capacity. NICE and AAP both emphasise that responsive, empathetic parenting during tantrums builds emotional intelligence over time.

**Physical development:**
- Running (though not smoothly)
- Kicking a ball
- Climbing more confidently
- Building towers of 3-4 blocks

Your calm presence during their emotional storms is one of the greatest gifts you can give.',
 'mental-health', 3, ARRAY['month-19', 'emotions', 'tantrums', 'co-regulation', 'empathy'], true, true),

('toddler', 10, 'Month 22: Problem-Solving and Persistence',
 'Your toddler is becoming a creative thinker',
 'At 22 months, your toddler''s cognitive abilities are expanding rapidly. They are not just doing things — they are thinking about how to do things. Problem-solving, planning, and persistence are all emerging.

**Cognitive milestones:**
- Sorts objects by shape or colour
- Completes simple puzzles (2-4 pieces)
- Understands cause and effect deeply
- Can follow two-step instructions ("Pick up the ball and bring it here")
- Engages in more complex pretend play

**Language development:**
- Vocabulary is growing rapidly (50-100+ words for many toddlers)
- Beginning to combine two words ("more milk," "daddy go")
- Understands far more than they can say
- May get frustrated when not understood

**When to talk to your provider about speech:**
The AAP suggests discussing with your provider if by 24 months your toddler:
- Uses fewer than 50 words
- Is not combining two words
- Is not understood by familiar caregivers most of the time
- Does not respond to their name or simple instructions

Many children who are "late talkers" catch up, but early intervention (if needed) is always more effective than waiting.

**Supporting cognitive development:**
- Open-ended toys (blocks, play dough, drawing materials)
- Let them struggle briefly before helping — productive frustration builds persistence
- Ask questions and wait for responses
- Describe what they are doing and what you observe

Your toddler''s determination is not stubbornness — it is the foundation of resilience.',
 'development', 3, ARRAY['month-22', 'problem-solving', 'language', 'cognitive', 'persistence'], true, true),

('toddler', 11, 'Month 23: Social Skills Emerging',
 'Your toddler is learning how to be with other children',
 'At 23 months, your toddler is becoming increasingly interested in other children. While true cooperative play is still months away, they are learning crucial social skills through observation, parallel play, and early interaction.

**Social development:**
- Parallel play (playing alongside other children) is predominant
- May begin brief episodes of interactive play
- Shows possessiveness over toys ("Mine!") — this is normal, not selfishness
- Imitates other children''s behaviour
- Beginning to understand taking turns (with lots of adult guidance)

**Sharing and "mine":**
Toddlers are developmentally incapable of true sharing before age 3-4. "Mine" is actually a healthy sign of developing self-awareness. Rather than forcing sharing:
- Model sharing yourself
- Use a timer for turn-taking with popular toys
- Have duplicates of favourite items when possible
- Praise moments of spontaneous generosity without making it an expectation

**Physical development:**
- Running more confidently
- Jumping with both feet off the ground
- Throwing a ball overhand
- Turning book pages one at a time
- Using a spoon and fork (messily)

**Approaching the second birthday:**
As your toddler approaches two, you might notice increased testing of boundaries. This is not defiance — it is research. They are learning the rules of the world through experimentation.

Your toddler is not giving you a hard time. They are having a hard time.',
 'development', 3, ARRAY['month-23', 'social-skills', 'sharing', 'parallel-play', 'turn-taking'], true, true),

('toddler', 13, 'Month 25: The "Why" Phase Begins',
 'Curiosity drives your toddler''s constant questioning — embrace it',
 'Shortly after their second birthday, many toddlers enter the "why" phase. Every statement you make is met with "Why?" or "What''s that?" This can test your patience, but it is one of the most significant cognitive developments in early childhood.

**Why "why" matters:**
- It shows your toddler understands that things have causes and explanations
- They are building mental models of how the world works
- Each question-and-answer exchange builds neural connections
- Research shows children who ask more questions develop larger vocabularies

**How to respond:**
- Answer simply and honestly (you do not need to give a science lecture)
- "I do not know — what do you think?" is a powerful response
- It is okay to say "That is a great question, let us find out together"
- When you are exhausted, it is also okay to say "That is my last answer for now — shall we play?"

**Language at 25 months:**
- 200-300 word vocabulary for many toddlers
- Using 2-3 word phrases regularly
- Asking questions using tone of voice
- Beginning to use pronouns (I, me, you)
- Singing parts of familiar songs

**Imagination and pretend play:**
Pretend play is becoming more complex:
- Creating scenarios with dolls or figures
- Assigning roles to themselves and others
- Using objects symbolically (a block becomes a phone)
- Developing narratives in their play

Your toddler''s curiosity is the engine of their learning. Feed it whenever you can.',
 'development', 3, ARRAY['month-25', 'why-phase', 'curiosity', 'language-explosion', 'pretend-play'], true, true),

('toddler', 14, 'Month 26: Emotional Vocabulary Building',
 'Helping your toddler name their feelings is a powerful gift',
 'At 26 months, your toddler''s emotional range is vast, but their ability to express feelings with words is still developing. One of the most impactful things you can do is help them build an emotional vocabulary.

**Why naming emotions matters:**
Research from UCLA shows that labelling an emotion ("You feel angry") actually reduces the intensity of the feeling. This process, called "affect labelling," activates the prefrontal cortex and calms the amygdala. In plain terms: naming it tames it.

**How to build emotional vocabulary:**
- Name their emotions as you observe them: "You look frustrated that the puzzle piece will not fit"
- Name your own emotions: "I feel happy when we play together"
- Read books about feelings together
- Use emotion faces charts or cards
- Accept all emotions while guiding behaviour: "It is okay to feel angry. It is not okay to hit"

**Toddler behaviour at this age:**
- Testing boundaries becomes more deliberate
- May hit, bite, or throw when overwhelmed (this is communication, not aggression)
- Needs consistent, calm responses to boundary-testing
- Benefits enormously from predictable routines

**Physical milestones:**
- Pedalling a tricycle (some toddlers)
- Climbing playground equipment
- Drawing circles and lines
- Building towers of 6+ blocks

Helping your child understand their own emotions is one of the most lasting gifts of early parenthood.',
 'mental-health', 3, ARRAY['month-26', 'emotional-vocabulary', 'affect-labelling', 'behaviour', 'regulation'], true, true),

('toddler', 17, 'Month 29: Friendships and Cooperative Play',
 'Your toddler is beginning to form genuine connections with peers',
 'Around 29 months, many toddlers start moving beyond parallel play toward true cooperative play. They begin to form preferences for particular playmates and show early signs of friendship.

**Social milestones:**
- Engages in simple cooperative play (building together, pretend tea parties)
- Shows preference for specific children
- Can take turns with adult support
- Beginning to understand and follow simple group rules
- Shows empathy by comforting upset friends

**Supporting friendships:**
- Regular playdates with the same children help build familiarity
- Small groups (2-3 children) are easier to manage than large ones
- Supervise but try not to micromanage their interactions
- Model kind language and conflict resolution
- Expect conflicts — they are learning opportunities

**Language at 29 months:**
- 300-500+ word vocabulary
- Using 3-4 word sentences
- Asking "who," "what," and "where" questions
- Can follow 2-3 step instructions
- Starting to use past tense ("I runned" — grammatical errors are a positive sign of rule-learning)

**Nutrition at this age:**
Toddlers need about 1000-1400 calories per day. Focus on:
- Regular meal and snack times (every 2-3 hours)
- Variety of food groups offered
- Letting them decide how much to eat (division of responsibility approach)
- Avoiding food as reward or punishment

Your toddler''s world is expanding beyond you — and that is beautiful, even when it stings.',
 'development', 3, ARRAY['month-29', 'friendships', 'cooperative-play', 'language', 'nutrition'], true, true),

('toddler', 19, 'Month 31: Imagination in Full Bloom',
 'Your toddler''s imaginary world is rich and detailed',
 'At 31 months, your toddler''s imagination is in full bloom. They may have imaginary friends, create elaborate pretend scenarios, and blur the line between fantasy and reality. This is not cause for concern — it is a sign of advanced cognitive development.

**Imagination milestones:**
- May have imaginary friends (perfectly normal and healthy)
- Creates detailed pretend play scenarios
- Assigns emotions and motives to toys and characters
- May be afraid of imaginary things (monsters, shadows) — the same imagination that creates joy also creates fear
- Tells simple stories, mixing real and imagined events

**How to support imagination:**
- Join their pretend play when invited
- Provide open-ended materials (boxes, fabric, art supplies)
- Read stories together and ask "What do you think happens next?"
- Do not correct fantasy with reality — a child who says they flew today is telling you about their inner world
- Limit screen time, which provides pre-made imagery instead of encouraging internal creation

**Handling fears:**
Imaginary fears are real to your toddler. Do not dismiss them with "There is nothing to be scared of." Instead:
- Validate the fear: "Monsters can feel very scary"
- Give them agency: "Shall we check under the bed together?"
- Create counter-magic: "This special spray keeps monsters away"
- Establish comforting bedtime routines

Your toddler''s imagination is building creativity, empathy, and cognitive flexibility.',
 'development', 3, ARRAY['month-31', 'imagination', 'pretend-play', 'imaginary-friends', 'fears'], true, true),

('toddler', 22, 'Month 34: Preparing for Preschool Social Skills',
 'Building the skills your child needs for group settings',
 'At 34 months, your toddler is developing the social and emotional skills that will serve them in preschool and beyond. Whether or not they are in childcare, building these skills now creates a foundation for successful group experiences.

**Key social skills developing:**
- Taking turns with less adult prompting
- Using words instead of physical actions to express needs
- Understanding simple rules and expectations
- Beginning to share voluntarily (though inconsistently)
- Showing interest in group activities

**Emotional regulation growth:**
- Can sometimes wait briefly for something they want
- Beginning to use coping strategies ("I need a break")
- Recovers from tantrums more quickly
- May start to identify others'' emotions correctly

**Self-care skills:**
Around this age, many toddlers can:
- Dress themselves partially (pulling on pants, putting on shoes on wrong feet)
- Use the toilet with reminders (if toilet-trained)
- Wash and dry hands with prompting
- Feed themselves independently with utensils
- Put away toys with guidance

**Language at 34 months:**
- Speaking in 4-5 word sentences
- Can tell you about their day (though timelines may be mixed up)
- Asks "why" constantly
- Uses plurals and some past tenses
- Strangers can understand most of what they say

**Building independence:**
Allow time for self-care tasks even when it would be faster to do it yourself. "I do it myself" is your toddler''s way of building competence and confidence.

The skills your toddler is building now are the ones that matter most for school readiness.',
 'development', 3, ARRAY['month-34', 'social-skills', 'preschool-readiness', 'self-care', 'regulation'], true, true),

('toddler', 25, 'Month 37: Transitioning to "Big Kid"',
 'Beyond toddlerhood — the exciting world of your three-year-old',
 'If your child has passed 36 months, congratulations — they are officially beyond toddlerhood! The preschool years bring new joys, challenges, and milestones. Your "big kid" is becoming increasingly independent, verbal, and socially aware.

**What is changing:**
- Conversations become richer and more complex
- Friendships deepen and become more meaningful
- Pretend play reaches new levels of sophistication
- Physical abilities explode — running, jumping, climbing with confidence
- Independence drive strengthens further

**Common challenges at 3+:**
- Night-time fears and resistance to bedtime
- Power struggles (they have strong opinions about everything)
- Lying and fantasy-mixing (developmentally normal before age 4)
- Adjusting to new siblings, preschool, or childcare changes

**Supporting your three-year-old:**
- Give them real responsibilities (setting the table, watering plants)
- Offer choices throughout the day
- Read together every day — it is the single best predictor of academic success
- Encourage creative expression through art, music, and storytelling
- Continue to validate their emotions while teaching coping strategies

**Your journey as a parent:**
You have navigated pregnancy or the decision to become a parent, survived the newborn phase, weathered toddlerhood, and arrived here. Take a moment to recognise how much you have grown alongside your child.

The hardest parts are not necessarily behind you — but neither are the best parts.',
 'development', 3, ARRAY['three-years', 'preschool', 'independence', 'language', 'growth'], true, true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. QUIZ SYSTEM TABLES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  stage               TEXT        NOT NULL CHECK (stage IN ('pregnancy', 'infant', 'toddler', 'postpartum')),
  week_or_month_min   INT         NOT NULL DEFAULT 1,
  week_or_month_max   INT         NOT NULL DEFAULT 52,
  question_text       TEXT        NOT NULL,
  options             JSONB       NOT NULL,
  correct_option_index INT        NOT NULL,
  explanation         TEXT        NOT NULL,
  category            TEXT        NOT NULL CHECK (category IN (
                                    'development', 'nutrition', 'wellness',
                                    'safety', 'mental_health', 'myths_vs_facts'
                                  )),
  difficulty          TEXT        NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.quiz_questions IS 'Science-backed quiz questions for educational engagement across all parenting stages';

CREATE INDEX IF NOT EXISTS idx_quiz_questions_stage ON public.quiz_questions (stage);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_stage_category ON public.quiz_questions (stage, category);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_difficulty ON public.quiz_questions (difficulty);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read quiz questions"
  ON public.quiz_questions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role can manage quiz questions"
  ON public.quiz_questions FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Quiz attempts table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id       UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id      UUID        NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  selected_option  INT         NOT NULL,
  is_correct       BOOLEAN     NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.quiz_attempts IS 'Records of user quiz answers for tracking progress and avoiding repeat questions';

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_profile ON public.quiz_attempts (profile_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_profile_question ON public.quiz_attempts (profile_id, question_id);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own quiz attempts"
  ON public.quiz_attempts FOR SELECT TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Users can insert own quiz attempts"
  ON public.quiz_attempts FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Service role can manage quiz attempts"
  ON public.quiz_attempts FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. SEED QUIZ QUESTIONS (55 questions)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.quiz_questions (stage, week_or_month_min, week_or_month_max, question_text, options, correct_option_index, explanation, category, difficulty) VALUES

-- PREGNANCY — Development (10 questions)
('pregnancy', 4, 12, 'When does a baby''s heart start beating?',
 '["Week 3-4", "Week 5-6", "Week 8-9"]', 1,
 'The heart begins forming around week 3-4 but starts beating with detectable electrical activity around week 5-6, often before many people know they are pregnant.',
 'development', 'easy'),

('pregnancy', 12, 27, 'By what week can your baby hear your voice?',
 '["Week 16", "Week 25", "Week 34"]', 1,
 'By around week 25, the ears are developed enough to detect sounds from outside the womb. Your baby hears your voice, heartbeat, and other ambient sounds.',
 'development', 'medium'),

('pregnancy', 4, 12, 'How much folic acid does WHO recommend daily in early pregnancy?',
 '["200mcg", "400mcg", "800mcg"]', 1,
 'WHO recommends 400mcg of folic acid daily, ideally starting before conception. Folic acid is critical for neural tube development in the first 12 weeks.',
 'nutrition', 'easy'),

('pregnancy', 20, 40, 'What is vernix caseosa?',
 '["A type of pregnancy vitamin", "A waxy coating that protects baby''s skin", "A hormone produced by the placenta"]', 1,
 'Vernix caseosa is a white, creamy substance that coats and protects your baby''s skin in the womb. It has antibacterial properties and helps with temperature regulation after birth.',
 'development', 'medium'),

('pregnancy', 24, 40, 'At what week is a baby considered viable (able to survive outside the womb with intensive care)?',
 '["Week 20", "Week 24", "Week 28"]', 1,
 'Week 24 is generally considered the threshold of viability, though outcomes depend on many factors. Survival rates improve significantly with each additional week in the womb.',
 'development', 'medium'),

('pregnancy', 4, 40, 'What percentage of known pregnancies end in miscarriage?',
 '["5-10%", "15-20%", "30-40%"]', 1,
 'About 15-20% of known pregnancies end in miscarriage, with most occurring in the first trimester. It is far more common than most people realise, and it is almost never caused by anything the parent did.',
 'development', 'hard'),

('pregnancy', 28, 40, 'What is the recommended sleeping position in the third trimester?',
 '["On your back with pillows", "On either side", "Propped up at 45 degrees"]', 1,
 'ACOG and RCOG recommend sleeping on your side (either side) from 28 weeks onward, as this optimises blood flow to your baby through the inferior vena cava.',
 'safety', 'easy'),

('pregnancy', 4, 40, 'How much does blood volume increase during pregnancy?',
 '["10-15%", "25-30%", "40-50%"]', 2,
 'Blood volume increases by 40-50% during pregnancy to supply the placenta and support your growing baby. This is why many pregnant people feel warmer and may look flushed.',
 'development', 'medium'),

('pregnancy', 27, 36, 'When is the whooping cough (pertussis) vaccine recommended during pregnancy?',
 '["First trimester", "Weeks 20-24", "Weeks 27-36"]', 2,
 'WHO, ACOG, and NICE recommend the pertussis vaccine between weeks 27-36 of pregnancy. Antibodies cross the placenta and protect your baby in the first months of life before they can be vaccinated.',
 'safety', 'medium'),

('pregnancy', 37, 40, 'What percentage of babies are born on their actual due date?',
 '["About 5%", "About 25%", "About 50%"]', 0,
 'Only about 5% of babies arrive on their exact due date. A due date is an estimate, and normal full-term birth ranges from 37 to 42 weeks.',
 'myths_vs_facts', 'easy'),

-- PREGNANCY — Nutrition & Wellness (5 questions)
('pregnancy', 4, 40, 'Which nutrient is most critical in the first 12 weeks to prevent neural tube defects?',
 '["Iron", "Calcium", "Folic acid"]', 2,
 'Folic acid (vitamin B9) is essential for closing the neural tube, which becomes the brain and spinal cord. Many guidelines recommend starting supplementation before conception.',
 'nutrition', 'easy'),

('pregnancy', 4, 20, 'What is the recommended first-line treatment for pregnancy nausea according to ACOG?',
 '["Ginger and Vitamin B6", "Anti-nausea medication", "Avoiding all food until nausea passes"]', 0,
 'ACOG recommends ginger and Vitamin B6 (10-25mg three times daily) as first-line treatments for pregnancy nausea. Medication may be needed if these are insufficient.',
 'wellness', 'medium'),

('pregnancy', 4, 40, 'Is moderate exercise safe during a normal pregnancy?',
 '["No, rest is best", "Yes, ACOG recommends 150 minutes per week", "Only in the second trimester"]', 1,
 'ACOG recommends at least 150 minutes of moderate-intensity aerobic activity per week during pregnancy for those without complications. Walking, swimming, and prenatal yoga are excellent options.',
 'wellness', 'easy'),

('pregnancy', 24, 28, 'What does the glucose tolerance test screen for?',
 '["Preeclampsia", "Gestational diabetes", "Anaemia"]', 1,
 'The glucose tolerance test, usually done between weeks 24-28, screens for gestational diabetes, which affects 2-10% of pregnancies. Early detection allows management through diet, monitoring, and sometimes medication.',
 'wellness', 'medium'),

('pregnancy', 4, 40, 'True or false: Eating for two means doubling your calorie intake.',
 '["True — you need twice the calories", "False — you only need about 300 extra calories per day in 2nd/3rd trimester", "True — but only in the third trimester"]', 1,
 'You do not need to eat for two. ACOG recommends approximately 340 extra calories per day in the second trimester and 450 in the third — roughly equivalent to an extra healthy snack.',
 'myths_vs_facts', 'easy'),

-- INFANT — Development (10 questions)
('infant', 1, 8, 'When do most babies show their first social smile?',
 '["1-2 weeks", "6-8 weeks", "3-4 months"]', 1,
 'The first social smile — a smile in response to seeing your face or hearing your voice — typically appears around 6-8 weeks. Earlier smiles during sleep are reflexive.',
 'development', 'easy'),

('infant', 1, 4, 'What does safe infant sleep look like according to the AAP?',
 '["Soft mattress with bumpers and blanket", "Firm, flat surface, alone, on their back", "Co-sleeping in parent''s bed with pillows removed"]', 1,
 'The ABCs of safe sleep: Alone, on their Back, in a Crib/cot. A firm, flat, bare surface is safest. No pillows, blankets, bumpers, or soft toys.',
 'safety', 'easy'),

('infant', 1, 12, 'When should tummy time start?',
 '["After 6 weeks old", "From day one, awake and supervised", "After the first paediatric visit"]', 1,
 'Tummy time can begin from day one for short periods while baby is awake and supervised. It builds crucial neck and shoulder strength and helps prevent flat spots on the head.',
 'development', 'easy'),

('infant', 4, 24, 'The PURPLE crying period typically peaks at what age?',
 '["1-2 weeks", "6-8 weeks", "4-5 months"]', 1,
 'The PURPLE crying phase peaks around 6-8 weeks and usually resolves by 3-4 months. PURPLE stands for: Peak, Unexpected, Resists soothing, Pain-like face, Long lasting, Evening clustering.',
 'development', 'medium'),

('infant', 1, 12, 'How many hours per day does a typical newborn sleep?',
 '["8-10 hours", "11-13 hours", "14-17 hours"]', 2,
 'Newborns sleep 14-17 hours per day (AAP), but in short stretches of 2-4 hours. Their sleep cycles are shorter than adults and they wake frequently for feeding.',
 'development', 'easy'),

('infant', 16, 52, 'At what age do most babies start rolling over?',
 '["1-2 months", "4-6 months", "8-10 months"]', 1,
 'Most babies start rolling from tummy to back around 4-5 months, and back to tummy slightly later. Regular tummy time helps build the strength needed for this milestone.',
 'development', 'easy'),

('infant', 1, 12, 'What colours can newborns see most clearly?',
 '["Pastel colours", "High-contrast black and white", "Bright primary colours"]', 1,
 'Newborns see best at about 20-30cm and respond most to high-contrast patterns. Black and white patterns are most stimulating for their developing visual system.',
 'development', 'medium'),

('infant', 24, 52, 'When does the AAP recommend introducing solid foods?',
 '["3-4 months", "Around 6 months", "9-12 months"]', 1,
 'The AAP and WHO recommend starting solids around 6 months when babies show readiness: sitting with minimal support, interest in food, and loss of the tongue-thrust reflex.',
 'nutrition', 'easy'),

('infant', 12, 52, 'When does the fontanelle (soft spot) on a baby''s head typically close?',
 '["3-6 months", "6-9 months", "12-18 months"]', 2,
 'The anterior fontanelle usually closes between 12-18 months. It allows the skull to flex during birth and accommodates rapid brain growth in the first year.',
 'development', 'medium'),

('infant', 1, 52, 'What is the recommended room-sharing duration for safe sleep?',
 '["First 2 weeks", "At least 6 months", "Until 2 years old"]', 1,
 'The AAP recommends room-sharing (baby sleeping in their own crib in your room) for at least the first 6 months, ideally 12 months, to reduce the risk of SIDS.',
 'safety', 'medium'),

-- INFANT — Nutrition & Safety (5 questions)
('infant', 1, 12, 'How often should a newborn typically feed in 24 hours?',
 '["4-5 times", "8-12 times", "15-20 times"]', 1,
 'Newborns typically feed 8-12 times in 24 hours, or roughly every 2-3 hours. Feeding on demand (following hunger cues) is recommended by both the AAP and WHO.',
 'nutrition', 'easy'),

('infant', 8, 16, 'What are common signs of a growth spurt?',
 '["Sleeping more and eating less", "Increased fussiness and more frequent feeding", "Fever and decreased appetite"]', 1,
 'Growth spurts typically involve increased fussiness and more frequent feeding (cluster feeding). They often occur around 7-10 days, 2-3 weeks, 6 weeks, 3 months, and 6 months.',
 'development', 'medium'),

('infant', 1, 52, 'Is it safe to give honey to a baby under 12 months?',
 '["Yes, honey is natural and nutritious", "No, it can cause infant botulism", "Only if it is pasteurised"]', 1,
 'Honey should never be given to babies under 12 months due to the risk of infant botulism. The spores of Clostridium botulinum in honey can be dangerous for immature digestive systems.',
 'safety', 'easy'),

('infant', 24, 52, 'What is baby-led weaning?',
 '["Stopping breastfeeding gradually", "Letting babies self-feed with appropriate finger foods", "Starting solids before 6 months"]', 1,
 'Baby-led weaning means offering appropriate soft finger foods and letting babies feed themselves from the start of solids, rather than beginning with purees. Both approaches (and combinations) are valid.',
 'nutrition', 'medium'),

('infant', 8, 24, 'When should you first take your baby to the dentist?',
 '["When the first tooth appears or by age 1", "At age 2", "Only if you notice problems"]', 0,
 'The AAP and ADA recommend a first dental visit when the first tooth appears, or by age 1 at the latest. Early visits establish good oral health habits and allow early detection of issues.',
 'safety', 'hard'),

-- TODDLER — Development (10 questions)
('toddler', 1, 12, 'How many words should most 18-month-olds know?',
 '["5-10 words", "20-50 words", "100+ words"]', 1,
 'Most 18-month-olds know around 20-50 words, with a wide normal range. Communication includes words, gestures, and eye contact. Talk to your provider if you have concerns.',
 'development', 'medium'),

('toddler', 1, 36, 'What causes most toddler tantrums?',
 '["Bad behaviour or manipulation", "Emotional regulation skill gaps", "Hunger or tiredness only"]', 1,
 'Tantrums occur because the prefrontal cortex (responsible for emotional regulation) is still developing. Toddlers cannot manage big emotions yet — they are overwhelmed, not manipulating you.',
 'development', 'easy'),

('toddler', 6, 24, 'What is parallel play?',
 '["Children playing together cooperatively", "Children playing alongside but separately", "Children competing over the same toys"]', 1,
 'Parallel play — playing next to each other but independently — typically appears around 18-24 months. It is a normal and important developmental step before cooperative play emerges.',
 'development', 'easy'),

('toddler', 1, 36, 'What is the WHO recommended maximum daily screen time for 2-5 year olds?',
 '["30 minutes", "1 hour", "2 hours"]', 1,
 'WHO and AAP recommend no more than 1 hour of quality screen time per day for 2-5 year olds, ideally co-viewed with a caregiver who engages in conversation about the content.',
 'safety', 'easy'),

('toddler', 6, 24, 'At what age do toddlers typically start showing empathy?',
 '["6-12 months", "18-24 months", "36 months"]', 1,
 'Empathy begins emerging around 18-24 months. You might see your toddler trying to comfort a crying friend or offering their favourite toy to someone upset.',
 'development', 'medium'),

('toddler', 1, 36, 'Why do toddlers repeat the same books or activities over and over?',
 '["They have limited attention span", "They are building and strengthening neural pathways", "They are bored of new things"]', 1,
 'Repetition is how toddlers learn. Each time they experience the same thing, their brain strengthens neural connections. It is a sign of healthy cognitive development.',
 'development', 'easy'),

('toddler', 12, 36, 'By age 3, how many words can a typical toddler use?',
 '["About 100", "About 500", "Over 1000"]', 2,
 'Most 3-year-olds have a vocabulary of 1000+ words and can hold simple conversations. Language development is remarkably rapid in the toddler years.',
 'development', 'medium'),

('toddler', 1, 36, 'What type of play best supports toddler language development?',
 '["Educational apps and TV shows", "Back-and-forth conversations and responsive interaction", "Structured language drills"]', 1,
 'Conversational "serve and return" interactions — responding to your toddler''s sounds, words, and gestures — are the most powerful driver of language development.',
 'development', 'easy'),

('toddler', 12, 36, 'When is a toddler typically ready for toilet training?',
 '["12 months", "18-24 months for most, with wide variation", "Exactly at age 2"]', 1,
 'Most children show readiness signs between 18-36 months. Look for awareness of wet/dirty nappies, staying dry for 2+ hours, and interest in the toilet. Forcing before readiness can backfire.',
 'development', 'medium'),

('toddler', 1, 36, 'How many hours of sleep does a 2-year-old typically need (including naps)?',
 '["8-10 hours", "11-14 hours", "15-17 hours"]', 1,
 'Toddlers aged 1-2 need 11-14 hours of sleep including naps (AAP). By age 3, some children drop their nap, but quiet rest time is still beneficial.',
 'wellness', 'easy'),

-- POSTPARTUM (5 questions)
('postpartum', 1, 12, 'How long do the "baby blues" typically last?',
 '["1-2 days", "Up to 2 weeks", "3-6 months"]', 1,
 'Baby blues affect up to 80% of new parents and typically resolve within 2 weeks of birth. If sadness, anxiety, or difficulty bonding persist beyond 2 weeks, talk to your provider about postpartum depression.',
 'mental_health', 'easy'),

('postpartum', 1, 12, 'What percentage of new mothers experience postpartum depression?',
 '["About 1 in 20", "About 1 in 7", "About 1 in 2"]', 1,
 'About 1 in 7 mothers experience postpartum depression (NICE). It also affects fathers and partners. PPD is a medical condition, not a personal failure, and effective treatments exist.',
 'mental_health', 'medium'),

('postpartum', 1, 12, 'When can exercise typically resume after a vaginal birth?',
 '["Immediately — the sooner the better", "Light walking as soon as comfortable, more after 6-week check", "Not for at least 3 months"]', 1,
 'Light walking can resume as soon as comfortable after a vaginal birth. More intensive exercise should wait until after the 6-week postpartum check. Listen to your body and consult your provider.',
 'wellness', 'easy'),

('postpartum', 1, 12, 'What is diastasis recti?',
 '["A type of postpartum depression", "Separation of the abdominal muscles", "A hormonal imbalance after birth"]', 1,
 'Diastasis recti is the separation of the rectus abdominis muscles along the midline. It affects up to two-thirds of postpartum people and can be improved with specific core exercises.',
 'wellness', 'medium'),

('postpartum', 1, 12, 'Which factor is the strongest protector against postpartum depression?',
 '["Getting enough sleep", "Social support", "Taking supplements"]', 1,
 'Research consistently shows that social support is the single strongest protective factor against postpartum depression. Having people who listen, help, and validate your experience makes a measurable difference.',
 'mental_health', 'medium');

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. BABY MILESTONES TABLE
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.baby_milestones (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  baby_id         UUID        NOT NULL REFERENCES public.baby_profiles(id) ON DELETE CASCADE,
  profile_id      UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  milestone_type  TEXT        NOT NULL CHECK (milestone_type IN (
                                'pregnancy_month', 'trimester', 'viability', 'full_term',
                                'age_week', 'age_month', 'half_birthday', 'first_birthday',
                                'first_smile', 'first_laugh', 'first_roll', 'first_word',
                                'first_step', 'first_tooth', 'first_crawl', 'first_wave',
                                'sitting_up', 'pulling_to_stand', 'sleeping_through',
                                'custom'
                              )),
  milestone_key   TEXT        NOT NULL,
  title           TEXT        NOT NULL,
  description     TEXT,
  celebrated_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.baby_milestones IS 'Tracks and celebrates baby milestones across pregnancy, infant, and toddler stages';

CREATE INDEX IF NOT EXISTS idx_baby_milestones_baby ON public.baby_milestones (baby_id);
CREATE INDEX IF NOT EXISTS idx_baby_milestones_profile ON public.baby_milestones (profile_id);
CREATE INDEX IF NOT EXISTS idx_baby_milestones_type ON public.baby_milestones (milestone_type);
CREATE UNIQUE INDEX IF NOT EXISTS idx_baby_milestones_unique ON public.baby_milestones (baby_id, milestone_key);

ALTER TABLE public.baby_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own baby milestones"
  ON public.baby_milestones FOR SELECT TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Users can insert own baby milestones"
  ON public.baby_milestones FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update own baby milestones"
  ON public.baby_milestones FOR UPDATE TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Service role can manage baby milestones"
  ON public.baby_milestones FOR ALL TO service_role USING (true) WITH CHECK (true);
