-- Lumira v27: Toddler Content Fill
-- Fills content gaps for toddler stage: feeding, sleep, health, relationships, safety
-- Medical review: articles contain disclaimers, source citations, evidence-based guidance
-- Legal review: no diagnostic claims, no medication advice, AAP/CDC/Safe Kids sourced

-- ============================================================
-- FEEDING (4 articles)
-- ============================================================

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'toddler',
  'feeding',
  'Strategies for Picky Eaters',
  $$**Understanding Picky Eating**

Picky eating is one of the most common concerns parents raise during toddler well-child visits. Between ages 1 and 3, many children suddenly refuse foods they once loved, demand only a narrow range of meals, or reject new foods on sight. This shift is developmentally normal — toddlers are asserting autonomy as their growth rate slows and their appetite decreases compared to infancy.

Across cultures, feeding battles can carry significant emotional weight. In many households, food is tied to love, hospitality, and tradition. It is helpful to remind yourself that a toddler refusing a dish is not rejecting your care — it is a natural part of their development.

**Why Toddlers Become Picky**

- Growth slows after the first year, so toddlers genuinely need fewer calories
- Neophobia (fear of new foods) peaks between ages 2–3 and is an evolutionary protective mechanism
- Toddlers are developing independence; food refusal is often about control, not taste
- Sensory sensitivities (texture, color, smell) are common and vary widely across children

**Evidence-Based Strategies**

- **Repeated exposure without pressure:** Research shows it can take 10–15 exposures to a new food before a toddler accepts it. Offer without forcing.
- **Division of responsibility:** Parents decide what food is offered and when; children decide whether and how much to eat. This approach, supported by the AAP, reduces mealtime conflict.
- **Eat together when possible:** Family meals model positive eating behaviors. Share the same food across all family members rather than preparing separate "kid meals."
- **Keep portions small:** Large portions can overwhelm toddlers. A tablespoon per year of age is a rough guide for serving size.
- **Involve toddlers in food choices:** Let them pick between two vegetables or help rinse berries. Agency increases willingness to try.
- **Avoid using food as reward or punishment:** This can create unhealthy emotional associations with eating.
- **Respect cultural food norms:** Introduce your family's traditional foods early and often. There is no evidence that mild spices or complex flavors are harmful to toddlers.

**When to Seek Support**

Consult your healthcare provider if your toddler is losing weight, dropping below growth curve expectations, gagging or vomiting consistently at meals, or eating fewer than 20 foods total. A pediatric dietitian or feeding therapist can provide individualized guidance.

**A Note on Cultural Diversity**

Food is deeply tied to identity and community. Whether your family eats rice and lentils, tortillas and beans, injera, or noodle soups, these foods are nourishing and appropriate for toddlers. Avoid the assumption that bland, processed "toddler foods" are superior — traditional whole foods from diverse cuisines are excellent choices.
$$,
  15,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Satter, E. (2000). Child of Mine: Feeding with Love and Good Sense', 'Mayo Clinic'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'toddler-feeding-strategies-picky-eaters'
) ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'toddler',
  'feeding',
  'Healthy Toddler Meal Ideas for Busy Families',
  $$**Feeding Toddlers Well Without Complicated Cooking**

Toddlers need a balanced mix of nutrients to support rapid brain development, bone growth, and immune function — but this does not require elaborate meal preparation. Simple, minimally processed foods from all food groups provide excellent nutrition and are easy to adapt across different household budgets and cultural traditions.

**Key Nutrients to Prioritize**

- **Iron:** Supports brain development. Found in meat, poultry, fish, lentils, beans, tofu, and iron-fortified cereals. Pair with vitamin C-rich foods to boost absorption.
- **Calcium:** Critical for bone development. Found in dairy products, fortified plant milks, leafy greens, sesame paste (tahini), and small fish with soft bones.
- **Healthy fats:** Essential for brain growth. Found in avocado, full-fat dairy, eggs, oily fish, nuts and nut butters (thinly spread or blended), and cooking oils.
- **Fiber:** Supports digestion. Found in whole grains, vegetables, fruits, legumes, and seeds.

**Simple Meal Ideas by Food Tradition**

- **South Asian:** Soft khichdi (rice and lentils), mashed dal with rice, small pieces of roti with ghee and mashed vegetables, yogurt with soft fruit
- **East Asian:** Congee (rice porridge) with egg and minced vegetables, soft tofu with steamed greens, noodle soup with shredded chicken
- **Latin American:** Black beans with soft rice, soft scrambled eggs with tomatoes, mashed sweet plantains, corn tortillas with avocado
- **West African:** Soft fufu with vegetable soup, mashed yam with egg sauce, bean porridge
- **Mediterranean/Middle Eastern:** Hummus with soft pita pieces, lentil soup, yogurt with cucumber, scrambled eggs with vegetables

**Practical Tips for Busy Parents and Caregivers**

- Batch cook grains, legumes, and proteins at the start of the week
- Freeze portions of soups, stews, and porridges for quick reheating
- Toddlers eat better when not overtired — offer the main meal when energy is highest
- Offer water as the primary drink. Limit fruit juice; whole fruit is preferable.
- Cow's milk (or appropriate fortified plant alternatives) can continue after 12 months — discuss amounts with your provider

**Foods to Limit or Avoid**

- Added sugars and high-sodium processed foods
- Honey before 12 months (safe after 12 months)
- Choking hazards: whole grapes, raw carrots, whole nuts, large chunks of meat (cut or modify these foods)
- Unpasteurized dairy or juice

**Portion Guidance**

Toddler appetites vary widely day to day. Offer regular meals and 2–3 planned snacks. Avoid grazing throughout the day, which can reduce appetite at mealtimes. Trust your toddler's hunger and fullness cues.
$$,
  18,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'World Health Organization (WHO)', 'Academy of Nutrition and Dietetics'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'toddler-feeding-healthy-meal-ideas'
) ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'toddler',
  'feeding',
  'Transitioning Toddlers to Family Meals',
  $$**Why Family Meals Matter**

Transitioning your toddler from purées and separate "baby food" to eating alongside the family is a milestone that benefits both nutrition and development. Research consistently shows that children who eat regular family meals have better dietary variety, stronger language development from mealtime conversation, and a more positive relationship with food long-term.

This transition typically happens gradually between 12 and 24 months, though every child's readiness differs. There is no single "right" age, and the process looks different across cultures and household structures.

**Signs Your Toddler Is Ready**

- Can sit independently at a table or high chair
- Shows interest in what others are eating
- Can chew a variety of soft textures
- Attempts to self-feed with hands or utensils

**How to Make the Transition Smoothly**

- **Start with shared ingredients:** Rather than a complete separate meal, modify a portion of the family meal for your toddler. Remove heavy spices, reduce salt, and cut food into small pieces.
- **Modify texture, not the meal:** If the family is having stew, mash or cut the toddler's portion finely. If having rice and vegetables, ensure pieces are soft and bite-sized.
- **Sit together:** Even if schedules are difficult, aim for at least one shared meal daily. Toddlers learn to eat by watching others.
- **Avoid short-order cooking:** Cooking separate meals for your toddler long-term can reinforce selectivity. Offer the family meal plus one or two familiar safe foods if needed.
- **Respect cultural mealtimes:** Many cultures eat late evening meals or have larger communal midday meals. Adapt the strategy to your household's rhythm, not a prescriptive schedule.

**Managing the Transition Practically**

- Offer meals and snacks at consistent times to regulate appetite
- Allow self-feeding even when it is messy — it builds confidence and fine motor skills
- Use child-sized utensils and dishes to support independence
- Keep distractions (screens, toys) away from the table to support mindful eating

**Navigating Grandparents and Extended Family**

In many families, grandparents or extended family members play a significant role in feeding toddlers. This can be a gift — it exposes toddlers to more variety and cultural foods. Communicate your feeding approach warmly, framing it as shared information rather than instruction.

**When Transition Feels Stuck**

If your toddler is consistently unable to eat table foods due to texture aversions, gagging on most foods, or significantly lagging in growth, speak with your pediatrician. A feeding evaluation can rule out underlying oral-motor or sensory issues.
$$,
  20,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Satter, E. (2000). Child of Mine: Feeding with Love and Good Sense', 'Academy of Nutrition and Dietetics'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'toddler-feeding-transitioning-to-family-meals'
) ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'toddler',
  'feeding',
  'Managing Mealtime Tantrums',
  $$**When Mealtimes Become Battlegrounds**

Mealtime tantrums are one of the most exhausting feeding challenges parents face with toddlers. Between ages 1 and 3, toddlers are developmentally primed for big emotions, strong preferences, and fierce bids for autonomy — and the dinner table is a prime location for all three to collide. Understanding why tantrums happen at meals can help you respond with calm and strategy rather than frustration.

**Common Triggers for Mealtime Tantrums**

- **Hunger or low blood sugar:** Paradoxically, a very hungry toddler may be too dysregulated to eat calmly. Offering a small snack about 30 minutes before a meal if the toddler is extremely hungry can help.
- **Fatigue:** Mealtimes that fall close to nap times or bedtime are harder. When possible, schedule meals when your toddler is rested.
- **Lack of control:** Toddlers need to feel some agency. Offering limited choices (e.g., "Do you want peas or carrots today?") reduces power struggles.
- **Food refusal:** If a disliked food appears on the plate, some toddlers escalate immediately. Serving the disliked item in tiny amounts alongside favorites reduces the threat.
- **Transition from play:** Abrupt transitions from play to eating are harder. Give a 5-minute warning before mealtime.

**Strategies That Help**

- **Stay calm:** Your emotional state sets the tone. A matter-of-fact response ("I see you don't want that — that's okay, it will stay on your plate") is more effective than negotiating or raising your voice.
- **Set predictable routines:** Toddlers thrive on routine. A consistent mealtime sequence (wash hands, sit down, eat, finish) reduces anxiety around meals.
- **Avoid pressure and force:** The AAP and feeding experts consistently advise against forcing toddlers to eat. Pressure increases resistance and can create long-term negative associations with food.
- **Use positive language:** "You can leave the table when you've sat with us for a bit" rather than "You're not leaving until you eat."
- **End meals neutrally:** If a tantrum escalates, calmly remove the plate and end the meal without drama. Do not replace rejected food with a preferred alternative, as this reinforces refusal.

**Cultural Context**

In cultures where communal eating involves extended family, mealtime tantrums can feel especially high-stakes. Extended family members may offer advice that conflicts with your approach. It can help to frame your boundaries around your child's specific needs — "She does better with small portions and fewer choices right now" — rather than around general parenting philosophy.

**When to Seek Help**

If mealtime tantrums are severe, frequent, and accompanied by significant food refusal or weight loss, speak with your pediatrician or a pediatric feeding therapist. Mealtime distress can sometimes signal sensory sensitivities, anxiety, or other needs that benefit from professional support.
$$,
  22,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Satter, E. (2000). Child of Mine: Feeding with Love and Good Sense', 'Zero to Three'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'toddler-feeding-managing-mealtime-tantrums'
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SLEEP (4 articles)
-- ============================================================

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'toddler',
  'sleep',
  'Understanding Toddler Sleep Regressions',
  $$**What Is a Sleep Regression?**

A sleep regression is a period when a toddler who was previously sleeping well suddenly begins waking more frequently, refusing to go to bed, or having shorter naps. Sleep regressions can feel alarming, but they are typically temporary and connected to significant developmental leaps — not a sign that something is wrong.

The most commonly noted toddler sleep regressions occur around 18 months and again around 2 years. Both coincide with major cognitive, language, and emotional development milestones.

**The 18-Month Sleep Regression**

Around 18 months, many toddlers experience a marked disruption to previously stable sleep. Contributing factors include:

- A developmental leap in language and comprehension
- Increased separation anxiety as toddlers understand permanence more fully
- Molars erupting, which can cause discomfort
- Transition from two naps to one nap disrupting the daily rhythm
- Increased independence drive, making bedtime a target for assertion

**The 2-Year Sleep Regression**

Around 24 months, sleep can again become disrupted. Common drivers:

- Cognitive leaps including imaginative thinking, which can make fears more vivid
- Nighttime fears and early nightmares emerge as imagination develops
- Big life changes (new sibling, new childcare arrangement, potty training) create stress that disrupts sleep
- Toddlers testing limits as autonomy development intensifies

**How to Respond**

- **Maintain your routine:** Consistency is the most powerful tool during regressions. Stick to your regular bedtime sequence even when it is challenging.
- **Offer extra reassurance:** A brief increase in comfort and responsiveness during regressions does not create long-term dependency. Toddlers need to feel secure to return to good sleep.
- **Avoid major changes during regressions:** This is not the time to transition from a crib to a bed or remove a pacifier. Wait for the regression to pass.
- **Respond calmly to night wakings:** Brief, boring check-ins that reassure without fully waking the toddler are most effective.

**Cultural Considerations**

Sleep arrangements vary widely across cultures. Many families worldwide practice bed-sharing or room-sharing throughout toddlerhood, and sleep regressions within those arrangements may look different — increased night nursing, more restlessness, or seeking closer physical contact. There is no single "correct" sleep arrangement; safety is the priority regardless of where your toddler sleeps.

**Duration**

Most sleep regressions resolve within 2–6 weeks. If sleep difficulties persist beyond 6 weeks or are significantly impacting your family's wellbeing, speak with your pediatrician.
$$,
  18,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Zero to Three', 'National Sleep Foundation'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'toddler-sleep-regressions'
) ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'toddler',
  'sleep',
  'Navigating Nap Transitions: From Two Naps to One to None',
  $$**Why Nap Transitions Happen**

As toddlers grow, their sleep consolidates and they require fewer daytime sleep periods. Managing these transitions thoughtfully can prevent overtiredness and protect nighttime sleep. Understanding the typical timeline — and recognizing that every child moves at their own pace — helps parents approach this change with flexibility rather than anxiety.

**The Transition from Two Naps to One (Around 12–18 Months)**

Most toddlers transition from two naps to one somewhere between 12 and 18 months, though some make this shift as early as 11 months or as late as 20 months.

Signs your toddler may be ready:
- Consistently refusing one of the two naps for 2 or more weeks
- Taking a long time to fall asleep for the second nap
- Second nap pushes bedtime very late

How to manage:
- Gradually shift the morning nap later by 15–30 minutes every few days until it consolidates into one midday nap
- Temporarily move bedtime earlier (by 30–60 minutes) during the transition to prevent overtiredness
- Expect a period of adjustment lasting several weeks

**The Transition from One Nap to None (Around 3–4 Years)**

The shift from one nap to none typically occurs between ages 3 and 4, though some toddlers drop the nap closer to 2.5 years and others continue napping past 4.

Signs your toddler may be ready:
- Consistently taking more than 30 minutes to fall asleep at naptime
- Nap is consistently disrupting nighttime sleep onset
- Toddler completes a full day without showing overtiredness signs

Managing the transition:
- Introduce a "quiet time" to replace naptime — 30–60 minutes of calm independent activity in their room
- Move bedtime earlier temporarily (30–60 minutes) to compensate for lost daytime sleep
- On difficult days, a brief 20-minute nap (avoid longer) can prevent evening meltdowns without disrupting nighttime sleep

**Total Sleep Needs by Age**

- 12–18 months: 12–15 hours total (1–2 naps)
- 18–24 months: 11–14 hours total (1 nap)
- 2–3 years: 11–14 hours total (1 nap or transitioning)
- 3–5 years: 10–13 hours total (nap optional)

**A Note on Cultural Sleep Practices**

In many cultures, afternoon rest periods for the whole family (siesta, riposo, qailula) are the norm. Toddlers in these households may maintain napping longer into childhood, which is not problematic as long as nighttime sleep is adequate. Adapt your approach to your family's lifestyle and cultural rhythms.
$$,
  20,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'National Sleep Foundation', 'Mindell, J.A. & Owens, J.A. (2015). A Clinical Guide to Pediatric Sleep'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'toddler-sleep-nap-transitions'
) ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'toddler',
  'sleep',
  'Building an Effective Toddler Bedtime Routine',
  $$**Why Bedtime Routines Work**

A consistent bedtime routine is one of the most evidence-supported strategies for improving toddler sleep. Routines work because they signal to the brain that sleep is coming, allow the nervous system to down-regulate after an active day, and give toddlers the predictability they need to feel secure enough to separate from caregivers at sleep time.

Research published in pediatric sleep journals consistently shows that toddlers with predictable bedtime routines fall asleep faster, wake less frequently, and have better overall sleep quality than those without.

**Core Elements of an Effective Routine**

A toddler bedtime routine typically runs 20–45 minutes and includes calming, sequenced activities. The exact content matters less than consistency. Consider including:

- **Wind-down cue:** Dimming lights and reducing noise level in the home 30–60 minutes before bedtime to signal the transition
- **Bath or washing:** Warm water has a physiological calming effect and is a clear environmental cue for many toddlers
- **Pajamas and hygiene:** Diaper change or toilet, brushing teeth, and changing into sleep clothes create a predictable sequence
- **Quiet connection time:** Reading together, singing, gentle storytelling, or a quiet conversation about the day — this is a powerful bonding opportunity
- **Final sleep cue:** A consistent closing ritual (a particular song, a phrase, a hug sequence) that signals "now it is time for sleep"

**Timing Matters**

Most toddlers aged 1–3 sleep best with a bedtime between 7:00 and 8:30 PM. Overtired toddlers often take longer to settle, so earlier is often better. Watch for sleepy cues — eye rubbing, decreased activity, or fussiness — and begin the routine before overtiredness peaks.

**Adapting the Routine to Your Family**

- Routines look different in every household. A family that co-sleeps may include nursing or being held to sleep as part of the routine — this is valid and effective.
- In households with shift workers, grandparent caregivers, or multiple adults, consistency is still possible with a shared sequence. Write it down and share it with all caregivers.
- Religious or cultural practices — bedtime prayers, storytelling in a heritage language, specific songs — are meaningful components of bedtime routines and support identity development.

**Handling Bedtime Resistance**

- Offer limited choices within the routine ("Do you want the dinosaur book or the bear book?") to reduce power struggles
- Use a visual routine chart for toddlers who respond well to pictures
- If your toddler repeatedly calls out or leaves the room, respond briefly and calmly, then return them to bed with minimal engagement
- Avoid screens in the hour before bed; blue light suppresses melatonin production
$$,
  24,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'National Sleep Foundation', 'Mindell, J.A. et al. (2009). A nightly bedtime routine: impact on sleep in young children. Sleep, 32(5), 599–606'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'toddler-sleep-bedtime-routine-tips'
) ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'toddler',
  'sleep',
  'Night Wakings and Nightmares in Toddlers',
  $$**Understanding Why Toddlers Wake at Night**

Night wakings are common across the toddler years and can stem from many different causes. Understanding the most likely reason for your toddler's wakings helps you respond in a way that supports both their needs and your family's rest.

**Common Causes of Night Wakings**

- **Sleep associations:** Toddlers who fall asleep with a parent present, nursing, or being rocked may need the same conditions to return to sleep when they naturally rouse between sleep cycles.
- **Developmental milestones:** New skills (walking, language, cognitive leaps) can temporarily disrupt sleep as the brain processes new information.
- **Illness or teething:** Physical discomfort is a common and legitimate cause of night waking, particularly around the 2-year molar eruption.
- **Life changes:** A new sibling, change in childcare, moving home, or family stress can all disrupt toddler sleep.
- **Nightmares:** Begin emerging around 18–24 months as imaginative thinking develops.

**Nightmares vs. Night Terrors**

These are different phenomena requiring different responses:

- **Nightmares** occur in REM (lighter) sleep, usually in the second half of the night. The toddler wakes fully, may be frightened and distressed, and will seek comfort. They can often describe what frightened them. Comfort and reassurance are appropriate and effective.
- **Night terrors** occur in deep (non-REM) sleep, usually 1–3 hours after falling asleep. The child appears awake — eyes open, possibly crying or screaming — but is actually still asleep. They will not remember it in the morning. Do not try to wake or restrain the child; stay nearby to ensure safety and wait for the episode to end naturally.

**How to Respond to Nightmares**

- Go to your toddler promptly — reassurance is appropriate and will not create dependency
- Offer physical comfort: holding, patting, soothing voice
- Validate the feeling: "That sounds scary. You are safe. I am here."
- Keep the lights low and your voice calm to help them return to sleep
- Brief comfort is most effective; prolonged interaction can fully wake the toddler

**Reducing Nightmare Risk**

- Maintain consistent, age-appropriate bedtimes and avoid overtiredness
- Limit exposure to frightening or overstimulating media, especially in the hours before bed
- Check in about fears during the day — toddlers often process worries through play and conversation
- A nightlight and a comfort object (stuffed animal, blanket) can provide reassurance

**Cultural Approaches to Night Waking**

In families that co-sleep, night wakings are often managed with immediate proximity and nursing or touch, which is an accepted and effective approach in many cultural traditions. There is no single correct response; what matters is that the child is comforted and sleep quality across the family is supported. Discuss any significant concerns with your healthcare provider.
$$,
  28,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'National Sleep Foundation', 'Zero to Three'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'toddler-sleep-night-wakings-nightmares'
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- HEALTH (4 articles)
-- ============================================================

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'toddler',
  'health',
  'Toddler Dental Care: A Complete Guide',
  $$**Why Dental Health Starts Early**

Dental care for toddlers is an essential part of overall health, yet it is often underemphasized until problems arise. Primary (baby) teeth are not temporary placeholders — they are essential for chewing, speech development, jaw development, and holding space for permanent teeth. Early childhood cavities (previously called "baby bottle tooth decay") are the most common chronic childhood condition and are largely preventable.

The American Dental Association (ADA) and the American Academy of Pediatrics (AAP) recommend a first dental visit by age 1 or when the first tooth erupts, whichever comes first.

**Brushing: Technique and Timing**

- Begin brushing as soon as the first tooth appears, using a soft-bristled infant toothbrush
- Use a rice-grain-sized amount of fluoride toothpaste from the first tooth through age 3
- At ages 3–6, increase to a pea-sized amount
- Brush twice daily — after breakfast and before bed
- A caregiver should brush (or at minimum supervise) until the child has the dexterity to tie their own shoes — typically around age 6–8

**Technique:**
- Hold the toothbrush at a 45-degree angle toward the gumline
- Use gentle circular or small back-and-forth motions
- Brush all surfaces: outer, inner, and chewing surfaces of each tooth
- Gently brush the tongue to reduce bacteria

**Fluoride**

Fluoride is a naturally occurring mineral that strengthens tooth enamel and is one of the most effective tools for preventing tooth decay. The AAP and ADA recommend fluoride toothpaste for all children from the first tooth onward. If your water supply is not fluoridated, your dentist may recommend fluoride supplements — discuss this with your provider.

**Preventing Early Childhood Cavities**

- Avoid putting your toddler to bed with a bottle containing anything other than water
- Limit sippy cup use to mealtimes; use an open cup for drinking throughout the day
- Reduce sticky, sugary foods and sugary drinks including fruit juice
- Do not share utensils or lick pacifiers — cavity-causing bacteria can transfer from adult to child

**Teething and Second-Year Molars**

Toddlers typically begin getting their first-year molars around 12–16 months and second-year molars around 20–30 months. Teething can cause drooling, irritability, and mild discomfort. Cold teething rings or a chilled (not frozen) washcloth can soothe sore gums. Discuss appropriate pain management options with your healthcare provider.

**Cultural and Access Considerations**

Dental anxiety is common across cultures. Normalizing dental visits early — talking about them positively, reading books about dentist visits — sets the foundation for a lifetime of oral health. If cost or access is a barrier, community health centers and federally qualified health centers often provide low-cost or sliding-scale dental care for young children.
$$,
  18,
  true,
  ARRAY['American Dental Association (ADA)', 'American Academy of Pediatrics (AAP)', 'Centers for Disease Control and Prevention (CDC)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'toddler-health-dental-care'
) ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'toddler',
  'health',
  'Common Toddler Illnesses: What to Know',
  $$**Toddlers Get Sick — And That Is Normal**

The toddler years bring a surge in social interaction — playgroups, childcare, and family gatherings — which means increased exposure to viruses and bacteria. Most healthy toddlers experience 6–10 colds per year plus a range of other common illnesses. While this can feel overwhelming, most of these illnesses are mild, self-limiting, and part of building a healthy immune system.

This guide covers the most common toddler illnesses, key signs to watch for, and when to seek medical care.

**Common Cold (Upper Respiratory Infection)**

- Symptoms: Runny or stuffy nose, mild cough, low-grade fever, fussiness
- Duration: 7–10 days; nasal discharge may thicken and change color — this is normal
- Care: Rest, fluids, saline nasal drops to relieve congestion, humidifier in the room
- When to call your provider: High fever, difficulty breathing, symptoms worsening after day 7, ear pain, or persistent cough

**Ear Infections (Otitis Media)**

- Symptoms: Ear pain (toddlers may tug at ears), fever, disrupted sleep, fussiness, fluid draining from ear
- More common in toddlers due to the angle of the Eustachian tube
- Care: Your provider will assess and advise on appropriate management
- Prevention: Breastfeeding if possible, avoiding secondhand smoke, keeping vaccinations current

**Stomach Virus (Gastroenteritis)**

- Symptoms: Vomiting, diarrhea, low-grade fever, decreased appetite
- Duration: Vomiting typically 1–2 days; diarrhea may last 5–7 days
- Key concern: Dehydration — offer small, frequent sips of fluids; watch for signs of dehydration (no tears, very dark urine, very dry mouth, sunken eyes)
- When to seek care: Signs of dehydration, blood in stool or vomit, high fever, or symptoms beyond 7 days

**Hand, Foot, and Mouth Disease**

- Symptoms: Sores in the mouth and a rash of blisters on hands and feet, fever, sore throat
- Caused by a common virus; most common in children under 5
- Care: Comfort measures, fluids, soft foods if mouth sores are painful
- Contagious: Keep toddler home from childcare until fever-free and sores are healing

**Fever: General Guidance**

Fever is a sign of the immune system working — not a disease in itself. In toddlers over 12 months, a fever under a certain threshold is generally not dangerous on its own; the child's overall behavior and appearance matter more than the number.

Always contact your healthcare provider for guidance on fever management specific to your child's age and health history. Seek immediate care if your toddler has a fever with difficulty breathing, a rash, persistent crying, or is unusually difficult to rouse.

**Keeping Vaccinations Current**

Many serious childhood illnesses are preventable with vaccination. Follow your healthcare provider's recommended schedule for immunizations. If you have concerns or questions about vaccines, discuss them with your pediatrician.
$$,
  24,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Centers for Disease Control and Prevention (CDC)', 'Mayo Clinic'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'toddler-health-common-illnesses'
) ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'toddler',
  'health',
  'Toilet Training: Recognizing Readiness Signs',
  $$**Toilet Training on Your Child''s Timeline**

Toilet training is a significant developmental milestone for toddlers and families — and it works best when it is child-led and based on readiness rather than age or external pressure. Research consistently shows that training initiated before a child shows readiness signs takes longer and is more stressful for both child and caregiver. There is no universal "right" age, and readiness varies widely across children.

In many cultures, elimination timing practices begin in infancy (sometimes called elimination communication or infant potty training). For families using these practices, formal toilet training in toddlerhood may look different but is equally valid.

**Physical Readiness Signs**

- Stays dry for at least 1–2 hours at a stretch (bladder control is developing)
- Has predictable bowel movements
- Noticeably uncomfortable in a wet or soiled diaper
- Can pull pants up and down independently
- Can walk to and from the bathroom

**Cognitive and Emotional Readiness Signs**

- Understands simple two-step instructions ("Go get your shoes and bring them here")
- Can communicate the need to use the toilet — verbally or through gesture
- Shows interest in the toilet, watching others use it, or wanting "big kid" underwear
- Understands what the toilet is for
- Can sit still on a toilet or potty seat for 2–5 minutes

**When Readiness Is Absent**

Starting training before a child shows clear readiness signs often results in power struggles, accidents, and regression. If your toddler shows no interest at 2.5–3 years, discuss this with your pediatrician to rule out any developmental factors — but in most cases, patience is the most effective approach.

**Creating a Supportive Environment**

- Introduce a child-sized potty or a toilet seat insert — let your toddler choose if possible
- Dress your toddler in easy-to-remove clothing during training
- Offer praise for trying, not just for succeeding — the effort matters
- Stay neutral about accidents ("Oops, let''s clean it up — next time we''ll try the potty")
- Never punish or shame a child for accidents; this creates anxiety and can prolong the process

**Nighttime Training**

Nighttime dryness is controlled by a different physiological mechanism than daytime dryness and typically comes later — often months to over a year after daytime training is complete. Do not rush nighttime training; use a protective mattress cover and respond to nighttime accidents calmly and without judgment.

**Regression**

It is common for toddlers who have been trained to regress during times of stress (new sibling, move, change in routine). Respond with patience and a brief return to more support. Regression is temporary in most cases.
$$,
  30,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Zero to Three', 'Canadian Paediatric Society'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'toddler-health-toilet-training-readiness'
) ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'toddler',
  'health',
  'Vision and Hearing Milestones for Toddlers',
  $$**Why Screening Matters**

Vision and hearing are foundational to nearly every aspect of toddler development — language acquisition, social connection, motor coordination, and learning. Early identification of any difficulty allows for intervention during the most sensitive period for sensory development, maximizing outcomes for your child.

Many vision and hearing issues in toddlers are not visible to parents until a problem has already impacted development. This is why routine screening at well-child visits is so important, even when a child appears to see and hear normally.

**Typical Vision Milestones**

- **12–18 months:** Follows moving objects smoothly, points to things of interest, recognizes familiar people across a room
- **18–24 months:** Looks at pictures in books, interested in small objects, scribbles spontaneously
- **2–3 years:** Matches and sorts shapes and colors, copies a circle, recognizes themselves in photos

**Signs That May Warrant Evaluation**

- Eyes that appear crossed, turned out, or misaligned (strabismus)
- One eye that drifts inward or outward — even intermittently
- Excessive eye rubbing or frequent squinting
- Tilting or turning the head to look at things
- Sensitivity to light
- Holding books or objects very close to the face
- Lagging behind on visual developmental milestones

**Typical Hearing Milestones**

- **12 months:** Responds to name, follows simple directions, uses 1–2 words
- **18 months:** Follows simple 2-step instructions, vocabulary of 5–20 words
- **24 months:** Two-word phrases, points to body parts when named, understands simple questions
- **3 years:** Vocabulary of 200+ words, strangers can understand most speech

**Signs That May Warrant Hearing Evaluation**

- Not responding to their name consistently
- Delayed speech or language development
- Frequently saying "what?" or asking for repetition
- Turning one ear toward sounds
- Speaking very loudly or very softly
- History of frequent ear infections
- Pulling at ears with accompanying behavioral changes

**What Screening Involves**

- Vision screening at well-child visits may involve visual acuity charts, cover tests, and instrument-based screening for children who cannot cooperate with traditional eye charts
- Hearing screening may involve behavioral audiometry or referral to an audiologist if concerns arise

**Follow-Up and Early Intervention**

If your provider identifies a concern, they will refer you to an ophthalmologist (eye doctor) or audiologist (hearing specialist) for a comprehensive evaluation. Early treatment — whether glasses, patching therapy, hearing aids, or speech therapy — is highly effective when started early. Contact your local early intervention program if your child is under 3 years with a developmental concern.
$$,
  36,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'American Academy of Ophthalmology (AAO)', 'American Speech-Language-Hearing Association (ASHA)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'toddler-health-vision-hearing-milestones'
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- RELATIONSHIPS (4 articles)
-- ============================================================

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'toddler',
  'relationships',
  'Managing Sibling Rivalry in the Toddler Years',
  $$**Why Sibling Conflict Is Normal**

Sibling rivalry is one of the most universal family experiences across cultures and throughout history. When a new baby arrives or as siblings grow and compete for resources, attention, and space, conflict is a natural outcome — not a sign of failure in parenting or family dynamics.

For toddlers specifically, sibling conflict provides an early training ground for negotiation, empathy, and emotional regulation. How caregivers respond to these conflicts shapes how children learn to navigate relationships for years to come.

**Understanding the Toddler''s Perspective**

Toddlers lack the cognitive and emotional tools to manage jealousy, frustration, and the complex feelings that come with sharing a caregiver. When a sibling takes a toy or receives parental attention, the emotional response is immediate and intense — not manipulative or malicious. Toddlers are operating from a very present-moment, emotional brain state.

A toddler who was the only child and now has a sibling has genuinely lost something — exclusive access to caregiver attention. Acknowledging this loss with empathy ("It''s hard when the baby needs so much of my time") can reduce the emotional charge.

**Strategies That Help**

- **One-on-one time:** Even 10–15 minutes of undivided attention with each child daily significantly reduces rivalry behaviors. Let the toddler choose the activity.
- **Avoid comparisons:** Resist comparing children''s behaviors, achievements, or personalities — even positively. Each child benefits from being seen as an individual.
- **Coaching, not refereeing:** Rather than constantly judging who is right and wrong, coach children through conflict: "What can you two figure out together?" (for older toddlers) or step in and model sharing for younger ones.
- **Validate all feelings:** "You are both frustrated right now. That makes sense." Emotional validation reduces escalation.
- **Avoid taking sides:** When possible, stay neutral and focus on the behavior rather than the child: "Hitting hurts. We find another way."
- **Protect special possessions:** Allow each child to have a few items they do not have to share, to reduce conflict over prized objects.

**Cultural Context**

In many cultures, older children are expected to defer to younger siblings, while in others the eldest child''s authority is respected. These dynamics shape how sibling relationships unfold. Be mindful of inadvertently assigning the role of "little parent" to an older toddler — this can create resentment. All children benefit from having their own needs met.

**When to Seek Support**

If sibling conflict is frequent, intense, and involves physical aggression that you cannot manage, speak with your pediatrician or a family therapist. A professional can provide individualized strategies.
$$,
  24,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Zero to Three', 'Faber, A. & Mazlish, E. (1987). Siblings Without Rivalry'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'toddler-relationships-sibling-rivalry'
) ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'toddler',
  'relationships',
  'Teaching Empathy and Sharing to Toddlers',
  $$**The Developmental Reality of Sharing**

True sharing — willingly giving something you want, for the benefit of another — requires empathy, impulse control, and a grasp of time ("I will get it back"). These capacities are still developing in toddlers. Expecting a 2-year-old to spontaneously share a beloved toy is developmentally unrealistic, and forced sharing rarely builds the skill — it builds resentment.

This does not mean toddlers cannot learn pro-social behaviors. It means the approach matters enormously.

**How Empathy Develops**

Empathy emerges gradually through early childhood:

- By 12–18 months, toddlers show early signs of empathy — offering a toy to a crying child, looking concerned when someone is hurt
- By 24 months, many toddlers can identify basic emotions in themselves and others
- By 36 months, children can begin to understand that others have different feelings than they do (early theory of mind)

Empathy is shaped by experience — it is taught through modeling, reflection, and language, not through demands.

**Strategies for Building Empathy**

- **Name emotions clearly:** "You look sad. Are you sad because we have to leave?" Using feeling words consistently helps toddlers build emotional vocabulary.
- **Model empathy:** When you respond empathetically to your toddler, you are teaching them what empathy looks like. Your behavior is the most powerful teacher.
- **Narrate others'' emotions:** "Look at that little girl — she''s crying. I wonder how she feels."
- **Read books with emotional content:** Stories with characters experiencing a range of emotions give toddlers a safe way to explore feelings.
- **Acknowledge hurt without minimizing:** "You hit her and now she''s crying. You made her feel hurt. Let''s see what we can do."

**Strategies for Building Sharing Skills**

- **Turn-taking instead of sharing:** "First it''s your turn, then it''s her turn" is more concrete and manageable than abstract sharing.
- **Use a timer:** A visual timer (even a simple sand timer) makes "your turn is almost up" tangible and reduces conflict.
- **Practice low-stakes sharing:** Sharing a snack together, passing a ball back and forth — build the experience of give-and-take in easy contexts.
- **Do not force sharing of special items:** Allow toddlers to put away a few treasured items before playdates.
- **Praise genuine sharing:** When you observe spontaneous generous behavior, name it warmly: "You shared your crackers with your friend. That was so kind."

**Cultural Perspectives**

In many collectivist cultures, sharing and communal ownership of resources is a fundamental value taught from early childhood. In more individualistic cultures, personal property rights are emphasized earlier. Both cultural orientations contain wisdom, and families can draw from their own values while supporting toddlers'' developmental capacity for empathy.
$$,
  22,
  true,
  ARRAY['Zero to Three', 'American Academy of Pediatrics (AAP)', 'Eisenberg, N. & Fabes, R.A. (1998). Prosocial development. Handbook of Child Psychology'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'toddler-relationships-empathy-and-sharing'
) ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'toddler',
  'relationships',
  'Single Parenting Through the Toddler Years',
  $$**Raising a Toddler Solo: Strengths and Challenges**

Single parenting during the toddler years is one of the most demanding parenting situations — and one of the most common. According to census data, a significant proportion of children are raised in single-parent households in every region of the world. Single parents come from all backgrounds and family structures: parents who were never partnered, those who are separated or divorced, those who have been widowed, and those who chose solo parenthood.

Single parents often bring extraordinary strengths to their role: resilience, focused one-on-one time with their child, clear and consistent routines, and deep knowledge of their child. This article offers practical strategies for managing the particular challenges of solo toddler parenting.

**Managing Physical and Emotional Exhaustion**

Solo parenting leaves no built-in backup when you are depleted. Sustainable single parenting requires actively building a support network:

- Identify 2–3 people (family, friends, neighbors) who can provide short-term childcare relief
- Explore community resources: parent groups, religious community support, toddler drop-in programs
- Accept help when it is offered — receiving support models generosity for your toddler
- Prioritize your own basic needs (sleep, nutrition, health care) as an act of care for your child

**Creating Stability and Predictability**

Toddlers thrive on routine and predictability. As a single parent, consistent routines serve double duty — they reduce behavioral challenges and reassure your toddler that the world is reliable:

- Consistent wake, meal, nap, and bedtime schedules
- Clear and calm transitions with advance notice ("In 5 minutes we will leave the park")
- A physical environment that is organized enough for your toddler to navigate independently

**Positive Discipline Without a Second Parent**

Managing toddler behavior without a co-parent to consult or share the load requires a solid, simple approach:

- Identify your 3–5 most important household rules and hold them consistently
- Use calm, brief, and immediate consequences connected to the behavior
- Repair after conflict — "I got frustrated earlier. I love you and I''m sorry I yelled." Models accountability.
- Seek support from parenting courses or groups if you feel unsupported in your discipline approach

**Financial Considerations**

Single-income households face particular pressures. Investigate what benefits and programs may be available in your area: childcare subsidies, child tax credits, food assistance programs, and community resource centers can make a meaningful difference.

**Your Wellbeing Matters**

Parental wellbeing is one of the strongest predictors of child wellbeing. Attending to your mental health — whether through therapy, peer support, physical activity, or meaningful connection — is not a luxury; it is an investment in your child''s flourishing.
$$,
  20,
  true,
  ARRAY['Zero to Three', 'American Academy of Pediatrics (AAP)', 'National Alliance on Mental Illness (NAMI)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'toddler-relationships-single-parenting'
) ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'toddler',
  'relationships',
  'Navigating Co-Parenting with a Toddler',
  $$**What Co-Parenting Means for Your Toddler**

Co-parenting — raising a child together with a partner you no longer live with or are in a romantic relationship with — is a significant adjustment for all involved. For toddlers, the central concern is stability, predictability, and continued access to loving, consistent caregivers. Research shows that toddlers can adapt well to two-home situations when conflict between co-parents is low and each home provides warmth and structure.

**What Toddlers Need from Co-Parenting Arrangements**

- **Consistency:** Similar routines across both homes — mealtimes, naptimes, bedtimes — reduce toddler stress
- **Reassurance:** Toddlers need to know they are loved in both homes and that both caregivers are okay
- **Appropriate transitions:** Goodbyes and hellos are often emotionally intense for toddlers. Keep them warm, brief, and positive.
- **Freedom from conflict:** Exposing toddlers to parental conflict — arguments, negative talk about the other parent — causes measurable harm to their emotional development

**Communication Between Co-Parents**

Effective co-parenting communication is business-like and child-focused:

- Use written communication (text, email, co-parenting apps) to reduce emotional escalation
- Keep all communication focused on the child''s needs: schedules, health, childcare, developmental concerns
- Avoid using the child as a messenger
- Agree in advance on major decisions (medical care, childcare choices, discipline approaches) and document agreements
- Co-parenting apps (such as OurFamilyWizard or TalkingParents) can help with scheduling and communication records

**Managing Your Own Emotions**

Co-parenting often involves ongoing grief, anger, or resentment — these are valid feelings. Processing them through therapy, peer support, or trusted relationships is important, and doing so away from your toddler is protective. Your toddler does not need to know your feelings about the other parent; they need to know that both parents love them.

**Transitions and Toddler Behavior**

Many toddlers act out after transitions between homes — more tantrums, clinginess, or regression. This is typical and does not indicate that one home is problematic. It reflects the emotional adjustment of the transition itself. Respond with warmth, routine, and patience.

**Legal and Cultural Considerations**

Co-parenting arrangements are shaped by legal agreements that vary by jurisdiction and cultural context. If your arrangement is informal, it can be helpful to put agreements in writing. If formal legal arrangements are in place, work within them and seek modification through appropriate legal channels if needs change. Extended family members — grandparents, aunts and uncles — can play a meaningful supportive role in both homes.
$$,
  18,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Zero to Three', 'American Psychological Association (APA)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'toddler-relationships-co-parenting'
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SAFETY (4 articles)
-- ============================================================

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'toddler',
  'safety',
  'Childproofing Your Home for Toddlers',
  $$**Why Childproofing Is an Ongoing Process**

Home safety for toddlers is not a one-time event — it is a continuous process that evolves as your child gains new physical abilities. A toddler who could not climb at 12 months will be scaling furniture by 18 months and opening doors by 24 months. Regular reassessment of your home environment is one of the most effective ways to prevent injury, which remains a leading cause of toddler emergency room visits.

Childproofing looks different across living situations — apartment, house, multigenerational home — and across cultural contexts. The principles remain the same: reduce access to hazards, create safe spaces for exploration, and supervise actively.

**Room-by-Room Safety Essentials**

**Throughout the home:**
- Install safety gates at the top and bottom of all staircases (use hardware-mounted gates at the top)
- Cover electrical outlets with tamper-resistant outlet covers
- Anchor all tall furniture (bookshelves, dressers, TV stands) to the wall with anti-tip straps — tip-overs are a leading cause of toddler fatality
- Use corner and edge guards on sharp furniture corners
- Keep cords from blinds and curtains out of reach; use cordless window coverings
- Store all cleaning products, medications, vitamins, and personal care products in locked or latched high cabinets

**Kitchen:**
- Use back burners when possible; turn pot handles away from the stove edge
- Keep knives and sharp utensils out of reach in locked drawers
- Install childproof latches on lower cabinets containing dangerous items
- Keep dishwasher closed and latched; dishwasher pods are highly toxic

**Bathroom:**
- Keep the toilet lid closed with a latch; toddlers can drown in very small amounts of water
- Store all medications (including over-the-counter products) in a locked cabinet — not just a high shelf
- Set water heater to no higher than 120°F (49°C) to prevent scalding

**Bedroom/Living Areas:**
- Remove small objects that could be choking hazards (coins, batteries, small toys)
- Keep button batteries locked away — they cause severe internal injuries if swallowed
- Secure TVs to the wall or TV stand

**Poison Safety**

Call your regional Poison Control center immediately if you suspect your toddler has ingested a harmful substance. Store the number in your phone. Do not induce vomiting unless specifically directed by Poison Control.

**Balancing Safety with Exploration**

Toddlers need to explore to develop. The goal is not to create an environment so restricted that normal play is impossible, but to remove the most serious hazards while allowing age-appropriate physical exploration in safe conditions.
$$,
  15,
  true,
  ARRAY['Safe Kids Worldwide', 'American Academy of Pediatrics (AAP)', 'Centers for Disease Control and Prevention (CDC)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'toddler-safety-childproofing-home'
) ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'toddler',
  'safety',
  'Water Safety for Toddlers',
  $$**Drowning: The Risk Toddlers Face**

Drowning is one of the leading causes of unintentional injury death in children aged 1–4, and it can happen silently in seconds in small amounts of water. Toddlers are at particular risk because they are newly mobile, curious, and lack the physical strength and coordination to self-rescue.

Critically, drowning is almost always silent — there is no splashing, no calling for help. This makes supervision the single most important protective factor.

**Key Principle: Touch Supervision**

Around any water — pools, bathtubs, ponds, open buckets, or any standing water — toddlers require "touch supervision": an adult within arm''s reach, fully focused on the child, not distracted by a phone, conversation, or other task. This is not the time for multi-tasking.

**Bathtub Safety**

- Never leave a toddler alone in the bathtub, even for a moment
- If you must leave, take the toddler with you
- Empty the bathtub immediately after use
- Bath seats and rings are convenience devices — they are not safety devices and do not prevent drowning

**Backyard Pool Safety**

If you have a backyard pool, a four-sided fence with a self-closing, self-latching gate is the most effective single intervention for preventing toddler drowning. The fence must isolate the pool on all four sides — using the house as one side allows direct access through a door.

Additional pool safety measures:
- Install door and gate alarms
- Keep rescue equipment (reaching pole, life ring) at poolside
- Learn CPR — immediate bystander CPR dramatically improves outcomes in drowning emergencies
- Remove all pool toys from the water when not in use to avoid attracting toddlers to the pool edge

**Natural Water: Ponds, Lakes, Beaches**

- Use a Coast Guard-approved life jacket at all times around natural open water — not water wings or inflatable toys, which are not safety devices
- Life jackets should be properly fitted: snug with the chin and ear support visible above the collar
- Stay within arm''s reach in water; never assume a child who can play at the water''s edge is safe from deeper water

**Swimming Lessons**

The AAP supports swimming lessons beginning as early as age 1 for toddlers, recognizing that drowning risk reduction is the primary benefit at this age. Swimming lessons are not a substitute for supervision — they are one additional layer of protection.

**Other Water Hazards**

- Standing water in buckets, coolers, and containers — empty immediately after use
- Irrigation ditches, drainage ponds, and decorative garden water features
- Water tables: empty after use and store upside down
$$,
  18,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Safe Kids Worldwide', 'Centers for Disease Control and Prevention (CDC)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'toddler-safety-water-safety'
) ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'toddler',
  'safety',
  'Car Seat Safety Guide for Toddlers',
  $$**Why Car Seat Safety Matters**

Motor vehicle crashes are a leading cause of death and serious injury for young children. Properly installed and used car seats dramatically reduce the risk of fatal injury — but only when used correctly every time. Research consistently shows that many car seats are used incorrectly, reducing their protective benefit.

This guide reflects current guidance from the American Academy of Pediatrics (AAP) as of the time of publication. Always refer to your specific car seat manufacturer''s instructions and your vehicle owner''s manual for seat-specific installation guidance.

**Current AAP Guidance: Rear-Facing**

The AAP recommends that children ride rear-facing for as long as possible, up to the highest weight or height allowed by the car seat manufacturer. There is no specific age at which children must turn forward-facing — weight and height limits on the specific seat are what matter.

Many convertible car seats accommodate rear-facing children up to 40–50 lbs. Most toddlers can and should remain rear-facing well past their second birthday.

**Why Rear-Facing Is Safer**

Rear-facing seats distribute crash forces across the child''s entire back, head, and neck — the strongest part of the body. Forward-facing children experience the full force of a front collision across the harness straps at the shoulders and pelvis. Toddlers'' proportionally large heads and developing neck muscles make rear-facing significantly more protective.

**Correct Harness Use**

Whether rear-facing or forward-facing, harness fit is critical:
- Harness straps should be snug — you should not be able to pinch excess webbing at the shoulder
- The chest clip must be at armpit level — not at the belly, which can cause abdominal injury in a crash
- No thick coats under the harness in cold weather — coats compress in a crash, creating dangerous slack. Buckle the child in, then place the coat on backward over the harness, or use a thin fleece layer
- Remove aftermarket padding, head inserts, or strap covers not included with the seat — these can affect crash performance

**Installation**

- Use either the vehicle seat belt or the LATCH system — not both simultaneously (unless the manufacturer explicitly states otherwise)
- The seat should not move more than 1 inch side to side or front to back when tested at the belt path
- The recline angle must match the manufacturer''s instructions for your child''s age and the seat''s position

**Getting Your Installation Checked**

Car seat inspection stations, often staffed by certified Child Passenger Safety Technicians (CPSTs), offer free installation checks. Safe Kids Worldwide maintains a locator for inspection stations.

**Taxis, Rideshares, and Travel**

When traveling, bring your own car seat whenever possible. In taxis and rideshares, toddlers require a car seat by law in most jurisdictions. Travel car seats should be lightweight, FAA-approved convertible seats if flying.
$$,
  24,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Safe Kids Worldwide', 'National Highway Traffic Safety Administration (NHTSA)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'toddler-safety-car-seat-guide'
) ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------

INSERT INTO content_articles (stage, category, title, body, week_or_month, is_published, source_citations, medical_disclaimer, medically_reviewed, culturally_sensitive, slug)
VALUES (
  'toddler',
  'safety',
  'Teaching Body Safety to Toddlers',
  $$**Why Body Safety Education Starts Early**

Teaching toddlers about body safety is one of the most important protective steps parents and caregivers can take. Research on child abuse prevention shows that children who have been taught clear, accurate language about their bodies and basic safety concepts are better able to recognize, resist, and report inappropriate touch.

This education is age-appropriate, empowering, and does not require frightening or overly explicit content. For toddlers, body safety education focuses on correct naming, body autonomy, and trusted adults.

**Use Correct Anatomical Names**

Teaching toddlers the accurate names for all body parts — including genitals — is a fundamental step in body safety education. Children who know the correct words can communicate clearly if something happens, and accurate language is understood by adults in a way that nicknames or euphemisms may not be.

This also normalizes all body parts as simply body parts, reducing shame while ensuring children have the vocabulary to speak up.

**Body Autonomy: Teaching Consent**

Toddlers can begin to understand that their body belongs to them:

- Do not force children to hug, kiss, or touch others — including family members — when they do not want to. Offer alternatives: a wave, a high five, or a verbal greeting.
- Respect your toddler''s "no" in appropriate contexts (tickling, roughhousing, dressing) to reinforce that "no" is a valid and powerful word
- Teach "private parts are private" — the parts covered by a bathing suit are private and no one should touch or look at them except for health and hygiene reasons (with a caregiver present)
- Teach that their body belongs to them and no one has the right to touch private parts in ways that feel wrong or uncomfortable

**Safe and Unsafe Touch**

Frame this in simple, accessible language:

- Safe touch: Touches that feel good and are kind (hugs from people you choose, a doctor''s exam with a caregiver present)
- Unsafe touch: Touches to private parts by someone other than a caregiver helping with health or hygiene, or any touch that feels wrong, hurts, or makes them uncomfortable

**Trusted Adults**

Help your toddler identify 3–5 trusted adults they can talk to if something feels wrong or confusing. Practice this: "Who are your safe people?" Reassure them that they will never be in trouble for telling a trusted adult about a touch that felt wrong.

**Ongoing Conversations**

Body safety is not a single talk — it is an ongoing conversation that grows in depth and complexity as children grow. Start simple, use everyday moments (bath time, books), and revisit regularly.

**For Caregivers**

If a child discloses something concerning, remain calm, thank them for telling you, avoid expressing shock or alarm, do not question or pressure for more details, and contact appropriate authorities for guidance. Your response in the first moments matters significantly.
$$,
  30,
  true,
  ARRAY['American Academy of Pediatrics (AAP)', 'Darkness to Light (Stewards of Children)', 'Child Welfare Information Gateway (CWIG)'],
  'This article is for informational purposes only and does not constitute medical advice. Please consult your healthcare provider before making any health decisions.',
  true,
  true,
  'toddler-safety-body-safety'
) ON CONFLICT (slug) DO NOTHING;
