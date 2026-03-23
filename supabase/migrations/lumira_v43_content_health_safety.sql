-- =============================================================================
-- Lumira v43: Health, Illness & Safety Content Library
-- =============================================================================
-- 48 evidence-based articles covering:
--   • Fever (6 articles)
--   • Common illnesses (12 articles)
--   • Skin conditions (5 articles)
--   • Digestive health (6 articles)
--   • Vaccinations (5 articles)
--   • Safety (11 articles)
--   • Mental health signals (3 articles)
-- =============================================================================

INSERT INTO public.content_articles (stage, week_or_month, title, subtitle, body, category, reading_time_minutes, tags, medically_reviewed, culturally_sensitive) VALUES

-- ─────────────────────────────────────────────────────────────────────────────
-- FEVER
-- ─────────────────────────────────────────────────────────────────────────────

('infant', 0,
'Fever in Babies Under 3 Months: Always Treat It as Urgent',
'A temperature above 38°C in a newborn is a medical emergency until proven otherwise.',
'A fever in a baby under three months old is one situation where ''wait and see'' is never the right approach. Their immune system is still developing, and what looks like a mild illness can deteriorate very quickly.

**What counts as a fever in a newborn?**

Any temperature of 38°C (100.4°F) or above in a baby under three months requires immediate medical attention. Even if your baby seems otherwise well — feeding, calm, no rash — do not manage it at home.

**Why is this age group different?**

Newborns and very young babies cannot fight infection the same way older children can. Bacteria that cause relatively minor illness in adults (such as group B streptococcus or E. coli) can cause serious conditions like sepsis or meningitis in neonates. The risk of a serious bacterial infection is highest in the first 28 days of life and remains elevated through the first three months.

**What you should do**

- Do not give paracetamol to undress or "treat" the fever before being assessed — it can mask important symptoms
- Do not wait to see if the temperature comes down on its own
- Call 999 or go to your nearest A&E immediately if your baby is under 28 days old
- Call 999, go to A&E, or call 111 immediately for babies 1–3 months old

**Other red-flag signs to watch for**

Even without a fever, seek urgent help if your baby under three months has: a high-pitched or unusual cry, is floppy or unusually difficult to wake, has a bulging fontanelle, shows a non-blanching rash, or is breathing very fast or making grunting sounds.

**A note on thermometers**

Rectal temperature is the gold standard for accuracy in newborns, but this is typically done in a clinical setting. At home, use an armpit (axillary) thermometer and add 0.5°C to the reading as an approximation.

If in doubt, call 111 or go to A&E immediately. For babies under 28 days with any fever, call 999.',
'health', 4, ARRAY['fever', 'newborn', 'emergency', 'temperature', 'infant-illness'], true, false),

('infant', 12,
'Fever in Babies 3–12 Months: Home Management and When to Call',
'Most fevers in this age group are caused by viruses and resolve safely — but knowing the warning signs is essential.',
'Once your baby is past three months, fever becomes a more common visitor. Most of the time it signals the immune system doing its job. Knowing how to manage it at home — and when to stop and call — is one of the most useful skills you can develop.

**What is a fever?**

A temperature of 38°C or above is a fever. Between 38°C and 39°C is generally considered mild to moderate. Above 39.5°C is high, and above 40°C warrants a call to your GP or 111 even in an otherwise well-looking baby.

**Home comfort measures**

- Keep the room cool and comfortably ventilated — no need to bundle up
- Offer frequent feeds (breast or formula) to prevent dehydration
- Dress lightly; remove layers if the baby feels hot to the touch
- Paracetamol (e.g. Calpol) can be given from 2 months if the baby weighs over 4 kg and was not born prematurely — always use the weight-based dose on the packaging
- Ibuprofen can be given from 3 months (over 5 kg) — do not use if your baby has a fever and has not yet had fluids, as it can affect kidney function when dehydrated

**When to seek help — call 111 or see a GP the same day**

- Temperature above 39°C in a baby under 6 months
- Fever lasting more than 5 days
- Baby is not feeding or taking fluids
- Fewer wet nappies than usual (sign of dehydration)
- Baby is unusually irritable or difficult to console

**When to call 999 or go to A&E immediately**

- Fever with a non-blanching rash (press a glass against it — if it does not fade, it is an emergency)
- Floppy, unresponsive, or difficult to wake
- Difficulty breathing or making grunting noises
- Pale, mottled, or bluish skin
- A seizure (fit)

If in doubt at any point, call 111. You know your baby best — trust your instincts.',
'health', 4, ARRAY['fever', 'infant', 'paracetamol', 'ibuprofen', 'temperature', 'dehydration'], true, false),

('toddler', 12,
'Fever in Toddlers: Temperature, Treatment, and When to Go to A&E',
'Toddlers run fevers often. Here is a clear guide on what to do and when to escalate.',
'Toddlers pick up infections constantly as their immune systems build experience. A fever is almost always a normal part of that process. What matters is how your toddler looks and behaves alongside the temperature.

**Normal fever range and what to watch**

- 37.5–38°C: low-grade, monitor closely
- 38–39°C: give paracetamol or ibuprofen if the child is uncomfortable
- 39–40°C: treat with medication, encourage fluids, reassess after one hour
- Above 40°C: see a GP or call 111 the same day, even if the child seems well

**Treating a fever at home**

- Paracetamol (e.g. Calpol) from 2 months; ibuprofen from 3 months — both dosed by weight, not age
- Do not give both at the same time, but you can alternate them every 3–4 hours if one alone is not providing enough comfort
- Never give aspirin to children under 16
- Offer plenty of fluids — water, diluted juice, milk feeds
- Light clothing and a cool room help more than cold flannels or lukewarm baths (the evidence for these is weak)

**When to call 111 or see a GP**

- Fever lasting more than 5 days
- Child is not drinking and has not passed urine in 8+ hours
- Rash appears alongside the fever (see a doctor the same day)
- Child has returned from a tropical country within the last year

**When to go to A&E or call 999**

- Non-blanching (glass test) purple or red rash — possible meningitis, act immediately
- Difficulty breathing, persistent vomiting, or severe headache
- Febrile seizure (see separate article)
- Child is very pale, mottled, or unresponsive

Always trust your instincts. A parent''s concern is a valid reason to seek care. If in doubt, call 111.',
'health', 4, ARRAY['fever', 'toddler', 'temperature', 'paracetamol', 'ibuprofen', 'AE'], true, false),

('infant', 24,
'Febrile Convulsions: What to Do If Your Baby Has a Seizure with a Fever',
'Watching your baby have a febrile seizure is terrifying. Knowing what to do in advance can make a critical difference.',
'Febrile convulsions (also called febrile seizures) are fits that happen when a child''s temperature rises quickly. They affect around 1 in 30 children, most commonly between 6 months and 5 years. Although they look frightening, the vast majority resolve within 1–2 minutes without lasting harm.

**What does a febrile convulsion look like?**

- Stiffening and jerking of the limbs, often on both sides
- Eyes rolling back or staring
- Loss of consciousness
- Flushed, pale, or bluish skin
- May urinate or defecate during the seizure
- Usually lasts 1–3 minutes; nearly always stops by 5 minutes

**What to do during the seizure**

1. Stay calm and stay with your child
2. Lay them on their side (recovery position) on a soft, flat surface
3. Do not restrain them or put anything in their mouth
4. Time the seizure from when it starts
5. Do not give any medication during the seizure itself
6. Call 999 if: the seizure lasts more than 5 minutes, your child does not regain consciousness, they have difficulty breathing, or this is the first seizure and they are under 18 months

**After the seizure**

Most children are drowsy and confused for up to 30 minutes afterwards (the postictal phase). This is normal. They should be assessed by a doctor even if they recover quickly and seem fine.

**Will it happen again?**

Around 30% of children who have one febrile seizure will have another. This does not mean they have epilepsy — febrile seizures are distinct from epilepsy, though a child with recurrent complex febrile seizures may need specialist review.

**Preventing febrile seizures**

There is no reliable way to prevent them by treating fever aggressively — studies show paracetamol does not reduce seizure recurrence. Focus instead on recognising fever early and keeping your child comfortable.

Always call 999 for any seizure lasting more than 5 minutes, or go to A&E after any first febrile seizure.',
'health', 5, ARRAY['febrile-seizure', 'fever', 'convulsion', 'infant', 'emergency', 'first-aid'], true, false),

('infant', 0,
'How to Take Your Baby''s Temperature Accurately',
'Choosing the right thermometer and method can mean the difference between a correct reading and a missed fever.',
'Taking a baby''s temperature sounds simple, but the method you use and how you use it matters significantly. Here is a practical guide to the three most common approaches.

**Armpit (axillary) method — recommended for home use**

This is the most commonly used method at home and is safe from birth.
1. Place the thermometer tip in the centre of the dry armpit
2. Hold the arm gently but firmly against the body
3. Wait for the beep (digital) or the recommended time (strip)
4. A normal armpit temperature is 36.4°C — a reading of 37.5°C or above is considered a fever by this route

Armpit readings are typically 0.3–0.5°C lower than core temperature, so add this margin when assessing severity.

**Ear (tympanic) method — from 6 months**

Ear thermometers are convenient but prone to user error, particularly in babies under 6 months where the ear canal is very small.
1. Pull the ear gently back and upward to straighten the canal
2. Insert the tip snugly (not deeply)
3. Press the button and wait for the reading
4. Take three readings and use the highest

Do not use after swimming or if your baby has been lying on that ear.

**Forehead (temporal) method — quick but less reliable**

Forehead strip thermometers or infrared scanners are popular but give the least accurate readings. Sweat, room temperature, and technique all affect the result. They are best used as a quick screening tool, not for clinical decision-making.

**What not to use**

Mercury glass thermometers are no longer recommended due to breakage risk. Mouth (oral) temperature measurement is not practical or safe for infants and toddlers.

**Rectal temperature**

Rectal readings are the gold standard for accuracy but are rarely done at home. This method is typically reserved for clinical settings.

If your reading seems inconsistent with how your child appears, trust your instincts and use another method or call 111 for guidance.',
'health', 3, ARRAY['thermometer', 'temperature', 'fever', 'armpit', 'ear', 'forehead', 'newborn'], true, false),

('infant', 12,
'Paracetamol and Ibuprofen for Babies: Correct Dosing, Ages, and Timing',
'The two medicines most parents use most often — and the details that matter most about using them safely.',
'Paracetamol and ibuprofen are safe and effective when used correctly. The key word is correctly. Both are dosed by weight, not by age; both have a minimum age; and both have important timing rules.

**Paracetamol (e.g. Calpol, Medinol)**

- Can be given from 2 months if your baby weighs over 4 kg and was not born prematurely
- Dose: 15 mg per kg of body weight per dose
- Can be given every 4–6 hours; maximum 4 doses in 24 hours
- Infant suspension is usually 120 mg/5 ml — always check the concentration on the bottle
- Safe for use in fever, teething discomfort, and post-vaccination soreness

**Ibuprofen (e.g. Nurofen for Children, Calprofen)**

- Can be given from 3 months if your baby weighs over 5 kg
- Dose: 5–10 mg per kg per dose
- Can be given every 6–8 hours; maximum 3 doses in 24 hours
- Do not give ibuprofen if your baby has not had fluids recently (risk of kidney stress when dehydrated)
- Do not give to babies with known kidney problems, a bleeding disorder, or chickenpox
- Infant suspension is usually 100 mg/5 ml — check concentration

**Can you alternate them?**

Yes — alternating paracetamol and ibuprofen every 3–4 hours is a recognised approach when one alone is not giving sufficient comfort. However, this requires careful tracking to avoid double-dosing. Some parents keep a written log; there are also apps that help.

**What not to do**

- Never give aspirin to any child under 16
- Never exceed the maximum daily dose of either medicine
- Do not give both at the same time
- Do not use adult formulations for children

**Syringes, not spoons**

Always use the oral syringe provided or bought separately — kitchen teaspoons are not accurate enough. A 5 ml kitchen spoon can vary between 3 ml and 9 ml.

If you are unsure of your baby''s weight-based dose, your pharmacist can calculate it for you. When in doubt about whether to give a dose, call 111.',
'health', 4, ARRAY['paracetamol', 'ibuprofen', 'calpol', 'dosing', 'fever', 'medication', 'safety'], true, false),

-- ─────────────────────────────────────────────────────────────────────────────
-- COMMON ILLNESSES
-- ─────────────────────────────────────────────────────────────────────────────

('infant', 0,
'Baby Colds: Symptoms, Home Care, and When to Seek Help',
'Babies get up to 12 colds in their first year. Most are harmless — but a few warning signs matter.',
'Colds are the most common illness in infancy. They are caused by viruses (most often rhinovirus) and cannot be cured with antibiotics. The good news: most colds resolve on their own within 7–10 days. The less good news: a blocked nose is genuinely miserable for a baby who feeds nasally.

**Typical cold symptoms in babies**

- Runny or blocked nose (clear, then white or yellow mucus — this is normal, not a sign of bacterial infection)
- Mild fever (usually under 38.5°C)
- Sneezing, mild cough
- Reduced appetite and slightly disrupted sleep
- Mild crankiness

**Home care**

- Saline nasal drops (available over the counter) can help loosen mucus before feeds
- A nasal aspirator can provide temporary relief
- Prop the head of the cot mattress slightly (wedge under the mattress, not a pillow)
- Offer more frequent, smaller feeds — a blocked nose makes long feeds tiring
- Ensure the room is humidified but not overheated
- Decongestant products (e.g. Karvol) are not recommended for babies under 3 months and should only be used with caution in older infants

**Colds and formula**

Continue normal formula feeding. Do not water down formula, even if your baby seems off their feeds.

**When to see a GP or call 111**

- Fever above 38°C in babies under 3 months (urgent — see fever article)
- Breathing becomes fast, noisy, or laboured
- Baby is not feeding and has fewer wet nappies than usual
- Cold lasts more than 10 days without improvement
- Baby seems significantly more unwell than a typical cold would explain

**When to call 999**

- Baby''s lips or skin turn blue
- Visible recession of the ribs or throat with every breath
- Baby is too breathless to feed

If in doubt, call 111. Cold season is no time to hesitate.',
'health', 4, ARRAY['cold', 'infant-illness', 'blocked-nose', 'saline', 'rhinovirus', 'common-cold'], true, false),

('infant', 0,
'Bronchiolitis: Recognition, Home Management, and Warning Signs',
'The most common cause of serious breathing problems in babies under 12 months — what every parent needs to know.',
'Bronchiolitis is a viral infection of the small airways (bronchioles) in the lungs. It is most common in babies under 6 months and peaks between October and March. In the UK, tens of thousands of babies are hospitalised with bronchiolitis every year.

**What causes it?**

Respiratory Syncytial Virus (RSV) causes about 80% of bronchiolitis cases. Other viruses (rhinovirus, adenovirus, human metapneumovirus) can also cause it.

**Symptoms — what to look for**

Bronchiolitis usually starts as a cold, then progresses over 2–3 days to:
- Rapid breathing (more than 60 breaths per minute is fast for a baby)
- Wheezing or a crackling sound on breathing
- A persistent, low-pitched cough
- Poor feeding — taking less than half of normal feeds
- Mild fever

Most babies with bronchiolitis can be cared for at home.

**Home care**

- Small, frequent feeds to reduce breathing effort
- Keep the baby upright during and after feeds
- Saline nasal drops before feeds to clear the airway
- Avoid smoke exposure entirely
- Paracetamol for discomfort or fever (weight-based dose)

**Signs of worsening — seek help the same day (GP, 111, or urgent care)**

- Breathing faster than 60 breaths per minute
- Not feeding or less than 50–75% of usual intake
- Fewer wet nappies than usual
- Visible chest wall retractions (the skin sucks in between or below the ribs)

**Emergency signs — call 999 immediately**

- Blue or pale lips or skin (cyanosis)
- Severe breathing difficulty
- Prolonged pauses in breathing (apnoea)
- Floppy or unresponsive

Bronchiolitis is more serious in: premature babies, babies with congenital heart or lung conditions, and babies under 6 weeks. These babies should be reviewed earlier at lower thresholds.

Always call 999 or go to A&E if your baby shows any emergency signs.',
'health', 5, ARRAY['bronchiolitis', 'RSV', 'breathing', 'infant', 'respiratory', 'winter-illness'], true, false),

('infant', 0,
'RSV: What It Is, Seasonality, and When to Worry',
'Respiratory Syncytial Virus is behind most serious breathing illnesses in young babies — here is what parents need to know.',
'RSV (Respiratory Syncytial Virus) is one of the most common respiratory viruses in the world. By the age of 2, almost all children have been infected at least once. For healthy toddlers and adults it is similar to a cold. For babies — particularly those under 6 months — it can be much more serious.

**When does RSV circulate?**

In the UK and most northern hemisphere countries, RSV peaks between November and February. The 2023 introduction of the maternal RSV vaccine (Abrysvo) in the UK means that from 28 weeks of pregnancy, mothers can now receive a vaccine that passes protective antibodies to their newborn.

**What RSV looks like**

RSV starts with cold-like symptoms: runny nose, cough, mild fever. In most babies over 6 months, this is as far as it goes. In younger or more vulnerable babies, it can progress to bronchiolitis or, less commonly, pneumonia.

**Higher-risk babies**

The following groups are at greater risk of severe RSV and are closely monitored:
- Premature babies (especially under 29 weeks)
- Babies with chronic lung disease of prematurity
- Babies with congenital heart disease
- Immunocompromised babies

These groups may qualify for palivizumab (Synagis), a monthly preventive injection given through RSV season.

**What parents can do**

- Wash hands frequently and thoroughly
- Avoid crowded indoor settings with young babies during RSV season
- Keep babies away from people with colds, especially in the first 2 months
- Do not smoke around your baby — this dramatically increases RSV severity

**When to seek care**

See the bronchiolitis article for the specific warning signs. For any baby under 3 months who develops breathing difficulties, worsening cough, or feeding problems during RSV season, do not wait — call 111 or go to A&E.

If your baby''s lips look blue, call 999 immediately.',
'health', 4, ARRAY['RSV', 'respiratory-syncytial-virus', 'bronchiolitis', 'winter-illness', 'vaccine', 'infant'], true, false),

('toddler', 12,
'Croup: The Barking Cough, the Steam Myth, and What Actually Helps',
'That frightening seal-like bark in the night — what croup is, what helps, and when to get urgent help.',
'Croup is a viral infection (most often parainfluenza virus) that causes swelling around the voice box and windpipe. It is most common in children aged 6 months to 3 years and tends to arrive suddenly, often in the middle of the night.

**What croup sounds like**

The hallmark is unmistakable once you''ve heard it:
- A harsh, barking cough (like a seal or a dog)
- A high-pitched, noisy sound when breathing in (stridor)
- A hoarse voice
- Usually a mild fever

Symptoms are worst at night and often improve during the day. Most cases last 3–5 days.

**Mild croup — home care**

For a child with mild stridor only when upset or coughing (not at rest):
- Keep them calm — anxiety worsens stridor by increasing breathing effort
- A single dose of oral dexamethasone or prednisolone (prescribed at the GP or A&E) is the most effective treatment and can dramatically reduce swelling within 30 minutes

**The steam myth**

You may have been told to sit in a steamy bathroom. Multiple randomised controlled trials have found that steam inhalation does not help croup and can cause burns. Do not use steam.

**Cool night air**

Some parents report their child improves during the car journey to hospital. This may be due to breathing cooler outdoor air, which can reduce airway swelling. While not a proven treatment, it is safe.

**When to call 999 or go to A&E**

- Stridor at rest (noisy breathing even when calm)
- Visible recession — the throat or ribs pulling in with every breath
- Rapidly worsening breathing
- Child is drooling and unable to swallow (this may indicate epiglottitis — different from croup, also rare but serious)
- Skin or lips turning blue
- Child is exhausted from the effort of breathing

For any child with stridor at rest, this is an emergency. Call 999 or get to A&E immediately.',
'health', 4, ARRAY['croup', 'barking-cough', 'stridor', 'toddler', 'parainfluenza', 'breathing'], true, false),

('toddler', 12,
'Hand, Foot and Mouth Disease: What It Looks Like and What to Do',
'A common toddler illness that sounds alarming but is usually mild — here is the full picture.',
'Hand, foot and mouth disease (HFMD) is a common viral illness in young children, caused by enteroviruses (most often Coxsackievirus A16). It is not related to foot-and-mouth disease in animals.

**What it looks like**

HFMD typically follows this sequence:
1. Fever, sore throat, and feeling unwell for 1–2 days
2. Painful mouth ulcers appear (inside cheeks, gums, tongue)
3. A rash develops on the palms of the hands and soles of the feet — usually small red spots or blisters that are not itchy
4. Spots may also appear on the buttocks, knees, and elbows

The rash typically resolves within 7–10 days. Some children (particularly those infected with Coxsackievirus A6) develop a more widespread rash and, weeks later, nail shedding — this looks dramatic but is temporary.

**Is it contagious?**

Yes — highly. HFMD spreads through contact with saliva, mucus, blisters, and faeces. Children should be kept home from nursery until they are well (no fever, able to eat and drink normally) — though the virus can be shed for weeks after recovery.

**Home care**

- Paracetamol or ibuprofen for pain and fever
- Cold foods and fluids (ice lollies, cold water) can soothe mouth ulcers
- Soft foods that do not require much chewing
- Good hand hygiene — wash hands frequently and thoroughly
- Avoid sharing cups, cutlery, or towels

**When to seek help**

- Child is unable to drink and shows signs of dehydration (dry mouth, no tears, fewer wet nappies/trips to toilet)
- High fever lasting more than 3 days
- Child becomes very unwell or develops a stiff neck
- Severe headache or sensitivity to light

If in doubt, call your GP or 111.',
'health', 4, ARRAY['hand-foot-mouth', 'HFMD', 'toddler', 'viral', 'coxsackievirus', 'mouth-ulcers'], true, false),

('toddler', 18,
'Chickenpox: Recognition, Comfort Measures, and When to Call the GP',
'Most children get chickenpox before school age. Here is how to manage it at home and spot the warning signs.',
'Chickenpox (varicella) is caused by the varicella-zoster virus and is one of the most contagious infections known. Before the UK introduces routine childhood vaccination, almost every child will get it — usually before the age of 10. It is most common in late winter and spring.

**Spotting chickenpox**

The rash is distinctive:
- Starts as small red spots that quickly develop into fluid-filled blisters
- Appears in crops over 3–5 days (so different stages are present at the same time)
- Usually starts on the chest, back, and face before spreading
- Intensely itchy
- Blisters crust over and scab within 5–7 days

Children are contagious from 1–2 days before the rash appears until all blisters have crusted over (usually day 5–7 of the rash).

**Home comfort measures**

- Paracetamol for fever and discomfort (NOT ibuprofen during chickenpox — there is evidence it may increase risk of serious skin infection; NOT aspirin — never in children under 16)
- Cool baths or showers can reduce itching
- Calamine lotion or non-sedating antihistamine (e.g. cetirizine) for itch relief
- Keep nails short and clean to reduce scratching and infection risk
- Loose, cool clothing
- Keep the child hydrated and offer soft foods if mouth spots make eating painful

**When to contact your GP**

- Spots that become very red, swollen, or warm to touch (possible secondary bacterial infection — impetigo or cellulitis)
- High fever lasting more than 4 days
- Child is immunocompromised, on steroids, or has a skin condition like eczema (higher risk of severe disease)
- Any pregnant woman or immunocompromised person in the household who has not had chickenpox or the vaccine — they need urgent antiviral advice

**When to call 999 or go to A&E**

- Difficulty breathing, severe headache, or stiff neck
- Child becomes very unwell, floppy, or confused
- A rash that looks infected with spreading redness

If in doubt, call 111.',
'health', 4, ARRAY['chickenpox', 'varicella', 'toddler', 'itchy-rash', 'viral', 'contagious'], true, false),

('infant', 12,
'Gastroenteritis and Vomiting Bugs: Hydration and When to Worry',
'Tummy bugs are common in babies and toddlers. The key battleground is always hydration.',
'Gastroenteritis — a gut infection causing vomiting and/or diarrhoea — is one of the most frequent reasons parents seek medical advice in the first two years. It is usually caused by norovirus or rotavirus (the latter is now largely preventable by the UK''s routine oral vaccination at 8 and 12 weeks).

**What to expect**

- Vomiting often starts suddenly and may be frequent in the first 12–24 hours
- Diarrhoea typically follows and can last 5–7 days
- Mild fever and stomach cramping are common
- Appetite usually returns gradually as symptoms improve

**The priority: fluids, fluids, fluids**

Dehydration is the main risk. For babies still on breast or formula:
- Continue breastfeeding on demand — breast milk is the ideal fluid
- Formula can continue in normal dilution
- For significant vomiting or diarrhoea in babies over 6 months, an oral rehydration solution (ORS) such as Dioralyte is more effective than water, juice, or fizzy drinks at replacing salts and sugars lost

**Do not give anti-diarrhoeal medications to babies and toddlers.**

**Signs of mild-moderate dehydration (see a GP)**

- Dry mouth and lips
- Sunken fontanelle (soft spot on head) in infants
- Fewer wet nappies (less than half the normal number)
- Dark, concentrated urine
- No tears when crying

**Signs of severe dehydration — go to A&E**

- Sunken eyes
- Very dry mouth, no saliva
- No wet nappy or urine output for 8–12 hours
- Lethargic, floppy, or difficult to wake
- Cold or mottled skin

**Return to normal diet**

Bland food is no longer recommended. Offer normal, easily digestible foods as soon as your child can keep them down. Avoid fruit juice and sugary drinks during recovery.

Call 111 if you are unsure, or go to A&E if your baby shows signs of severe dehydration.',
'health', 4, ARRAY['gastroenteritis', 'vomiting', 'diarrhoea', 'dehydration', 'norovirus', 'rotavirus', 'ORS'], true, false),

('infant', 12,
'Ear Infections: Signs in Pre-Verbal Babies and Treatment Options',
'Ear infections cannot be diagnosed by a screaming baby alone — but there are patterns worth knowing.',
'Ear infections (acute otitis media) are one of the most common bacterial infections in young children. By age 3, around 80% of children will have had at least one. They often follow a cold and are caused by bacteria or viruses entering the middle ear via the Eustachian tube.

**Why babies are more prone**

A baby''s Eustachian tube (the drainage channel between the middle ear and the back of the throat) is shorter and more horizontal than in adults, making it easier for fluid and bacteria to travel up from the throat.

**Signs in a pre-verbal baby**

Babies cannot tell you their ear hurts. Look for:
- Tugging or pulling at one or both ears (less reliable in isolation — babies also touch their ears when teething)
- Crying that seems out of proportion, especially when lying flat
- Disturbed sleep that is unusual even for that baby
- Fever — often the most reliable indicator
- Discharge from the ear (yellow or creamy fluid) — this indicates the eardrum has perforated, which sounds alarming but usually heals and relieves pain
- Reduced appetite (sucking can increase ear pressure)

**Diagnosis**

Ear infections are diagnosed by examining the eardrum with an otoscope. This is a clinical diagnosis — you cannot diagnose it at home. If you suspect an ear infection, see your GP.

**Treatment**

- Most ear infections in children over 2 years resolve without antibiotics within 3 days
- For babies under 2, the threshold for antibiotic prescription is lower
- Paracetamol and ibuprofen are effective for pain management while the infection resolves

**When to seek urgent help**

- Swelling or redness behind the ear (mastoiditis — rare but serious)
- Child appears very unwell, with high fever and stiff neck
- Facial weakness on one side

If you notice ear discharge or your baby seems in significant pain, see your GP. Call 111 out of hours.',
'health', 4, ARRAY['ear-infection', 'otitis-media', 'infant', 'fever', 'antibiotic', 'hearing'], true, false),

('infant', 0,
'Conjunctivitis in Babies: Sticky Eye vs Infection',
'Almost every baby gets sticky eyes at some point. Most of the time it is not an infection.',
'Sticky, gunky eyes are very common in newborns and young babies. The vast majority of cases are due to a blocked or immature tear duct (nasolacrimal duct obstruction) — not an infection. Understanding the difference saves unnecessary antibiotic use.

**Sticky eye (nasolacrimal obstruction)**

- Present in around 10% of newborns
- Yellow or white crusting especially in the morning, but the eye itself is white (not red)
- Usually resolves spontaneously by 12 months as the duct matures
- Management: gently wipe from inner corner outward with a clean cotton wool ball dampened with cooled boiled water; massage the lacrimal duct (your GP or health visitor can show the technique)

**Infective conjunctivitis**

This is a true infection caused by bacteria (most commonly Staphylococcus, Streptococcus) or viruses.
- The white of the eye is red or pink
- Discharge is more copious, often purulent
- Both eyes may be affected
- Baby may resist having the eye touched

In newborns under 28 days, any eye discharge or redness requires same-day medical assessment — gonorrhoea and chlamydia (acquired during birth) can cause severe conjunctivitis and vision damage if untreated.

**Treatment**

- Viral conjunctivitis resolves without treatment; keep the eye clean
- Bacterial conjunctivitis may be treated with antibiotic eye drops (chloramphenicol) from 2 years over the counter; prescription required under 2 years
- Do not share towels or flannels; wash hands before and after touching the eye

**When to see a GP urgently**

- Eye becomes very swollen or the eyelid is red and swollen (orbital cellulitis — rare but serious)
- Newborn under 28 days with any eye discharge
- Sensitivity to light or changes in vision (in older babies)

If in doubt about any eye discharge in a newborn, call your GP or 111 the same day.',
'health', 3, ARRAY['conjunctivitis', 'sticky-eye', 'tear-duct', 'newborn', 'eye-infection', 'infant'], true, false),

('infant', 0,
'Urinary Tract Infections in Babies: Often Missed Signs to Know',
'UTIs are one of the most commonly missed infections in babies — because the symptoms look like almost anything else.',
'Urinary tract infections (UTIs) are among the most common serious bacterial infections in infants and young children, affecting around 1 in 10 girls and 1 in 30 boys before the age of 10. In babies, especially those under 3 months, the symptoms are notoriously non-specific — making early recognition critical.

**Why UTIs are easy to miss in babies**

Babies cannot tell you it stings when they urinate. There is no typical "burning when weeing" complaint. Instead, UTIs in infants often present as:
- Unexplained fever without a clear source
- Irritability and excessive crying
- Poor feeding or vomiting
- Lethargy or unusual tiredness
- Jaundice in the newborn period (especially prolonged jaundice)
- Strong-smelling urine (though difficult to detect through a nappy)

**Why early treatment matters**

Untreated UTIs in young babies can spread to the kidneys (pyelonephritis) and bloodstream (urosepsis) very quickly. Repeated UTIs can also cause kidney scarring if not managed properly.

**Diagnosis**

UTI is diagnosed by urine culture. In babies, getting a clean sample is the challenge — options include:
- Clean-catch specimen (catch urine mid-flow with a clean container)
- Urine collection pads
- Catheter sample (in clinical settings for accuracy)
- Dipstick alone is not sufficient for diagnosis in infants

**Treatment**

UTIs in infants are treated with antibiotics (oral in most cases; IV if unwell or under 3 months).

**Investigations after a UTI**

Following a confirmed UTI in a baby under 6 months, NICE guidelines recommend an ultrasound of the kidneys and bladder. Further investigations (DMSA scan, MCUG) depend on age and severity.

If your baby has unexplained fever and no obvious source, ask your GP about ruling out a UTI. Call 111 or go to A&E for a baby under 3 months with unexplained fever.',
'health', 4, ARRAY['UTI', 'urinary-tract-infection', 'infant', 'fever', 'bacterial-infection', 'kidney'], true, false),

('infant', 0,
'Meningitis: The Glass Test, Symptoms, and Acting Fast',
'Meningitis is rare but life-threatening. Every parent should know the symptoms and what to do.',
'Meningitis is inflammation of the membranes covering the brain and spinal cord, most often caused by bacterial or viral infection. Bacterial meningitis is the more dangerous form and can be fatal within hours. Meningococcal disease (which causes meningitis and septicaemia together) is the leading infectious cause of death in children under 5 in the UK.

**Recognising meningitis — the symptoms**

Not all of these will be present, and they can appear in any order:
- High fever, cold hands and feet
- Severe headache (in verbal children)
- Stiff neck — difficulty touching chin to chest
- Photophobia — dislike of bright light
- Vomiting
- Confusion, drowsiness, or difficulty waking
- Fontanelle bulging (in babies)
- A distinctive non-blanching rash

**The glass (tumbler) test for the rash**

Press a clear glass firmly against a red or purple rash. If the rash does NOT fade under pressure (non-blanching), this is a medical emergency. Call 999 immediately. The rash may start as small spots and spread rapidly to large blotches.

Important: the rash is often a LATE sign. Do not wait for a rash to appear before seeking help.

**In babies, the warning signs include**

- High-pitched moaning or unusual cry
- Refusing feeds
- Floppy or stiff body
- Bulging fontanelle
- Pale, blotchy, or mottled skin
- Difficulty waking

**Action**

If you suspect meningitis in any child:
1. Call 999 immediately — do not drive yourself; call an ambulance
2. Note the time symptoms started
3. Do not give food or drink (in case surgery is needed)

Early treatment with IV antibiotics dramatically improves outcomes. Time is critical.

If in doubt, call 999. Meningitis can kill within hours.',
'health', 5, ARRAY['meningitis', 'glass-test', 'rash', 'emergency', 'septicaemia', 'meningococcal'], true, false),

('infant', 0,
'Sepsis in Children: Early Signs and Why to Act Immediately',
'Sepsis is the body''s extreme response to infection. Recognising it early can save a child''s life.',
'Sepsis occurs when the body''s response to an infection spirals out of control and starts damaging its own tissues and organs. In children, it can progress from early signs to life-threatening collapse in a matter of hours. It is treatable — but only if caught in time.

**What causes sepsis in babies and toddlers?**

Any infection can trigger sepsis, including pneumonia, UTI, meningitis, gastroenteritis, and even skin infections. The source is not always obvious.

**Early warning signs — the UK Sepsis Trust uses ''Think Sepsis''**

In babies and young children, look for any combination of:
- Fever (or unusually low temperature — hypothermia can also signal sepsis in newborns)
- Fast breathing or difficulty breathing
- Fast heart rate
- Pale, mottled, or bluish skin
- Cold extremities (hands and feet) despite a hot core
- Child is unusually drowsy, limp, or difficult to wake
- Rash that does not fade under the glass test
- Reduced urine output

**In babies specifically**

- Bulging fontanelle
- High-pitched or whimpering cry
- Refusing feeds and listless

**The key message: trust your gut**

Experienced parents and healthcare professionals agree — when a child ''just doesn''t look right,'' that instinct matters. Sepsis can present subtly in the early stages.

**What to do**

- Call 999 immediately if your child has any of the emergency signs above
- Tell the call handler or triage nurse: ''I am worried about sepsis''
- Do not wait for all symptoms to be present — early treatment saves lives

In hospital, sepsis is treated with IV antibiotics, IV fluids, and monitoring. The ''sepsis six'' bundle of care within the first hour dramatically improves survival.

Call 999 immediately if you suspect sepsis. Do not call 111 — call 999.',
'health', 4, ARRAY['sepsis', 'emergency', 'infant', 'toddler', 'infection', 'life-threatening', 'think-sepsis'], true, false),

-- ─────────────────────────────────────────────────────────────────────────────
-- SKIN CONDITIONS
-- ─────────────────────────────────────────────────────────────────────────────

('infant', 0,
'Eczema in Babies: Diagnosis, Triggers, Management, and Moisturising',
'Eczema affects 1 in 5 children in the UK. Early, consistent management makes a significant difference.',
'Eczema (atopic dermatitis) is a chronic inflammatory skin condition causing dry, itchy, and inflamed skin. It most commonly appears in the first 6 months of life and affects around 20% of UK children. The good news: many children grow out of it by school age, and with good management it is very controllable.

**What does baby eczema look like?**

- In babies under 6 months: red, weeping, or crusty patches on the cheeks and scalp
- In older babies and toddlers: patches in the skin folds — behind the knees, inside the elbows, around the wrists and ankles
- In all ages: dry, scaly, itchy skin; scratching leads to thickening over time

**Diagnosing eczema**

Eczema is a clinical diagnosis — there is no blood test. Your GP will diagnose it based on the pattern of the rash, itch, and family history of atopy (eczema, asthma, hay fever).

**The cornerstone of management: emollients**

Moisturising frequently is the single most important thing you can do. Apply emollient (e.g. Cetraben, Hydromol, Aveeno) at least twice daily, or more often if the skin is very dry. Apply generously — the typical dose for a baby is 150–200 g per week.
- Apply after baths (within 3 minutes to lock in moisture)
- Use in place of soap (emollient wash instead of bubble bath)
- Avoid emollients containing sodium lauryl sulfate (SLS) or fragrances

**Steroid creams**

Mild topical steroids (e.g. 1% hydrocortisone) are safe and effective for flares when used correctly — short courses only on affected areas. Your GP or pharmacist will advise on potency and frequency.

**Triggers to identify**

- Heat and sweating
- Rough fabrics (wool, polyester)
- Fragrant washing powders
- Certain foods (particularly cow''s milk protein and egg in early eczema)
- Environmental allergens (house dust mite, pet dander)

**When to see a GP**

- Eczema not responding to emollient alone
- Signs of infected eczema: weeping, crusted, honey-coloured areas (secondary impetigo)
- If you suspect a food allergy is driving the eczema

Call your GP if the eczema becomes infected, or call 111 out of hours.',
'health', 5, ARRAY['eczema', 'atopic-dermatitis', 'emollient', 'moisturiser', 'infant-skin', 'itchy'], true, false),

('infant', 0,
'Nappy Rash: Types, Causes, Prevention, and Treatment',
'Almost every baby gets nappy rash. Most cases clear with simple measures — but a few need medical treatment.',
'Nappy rash (napkin dermatitis) is inflammation of the skin in the nappy area. It affects around 25% of babies at any one time and is most common between 9 and 12 months, when stools become more varied with weaning.

**Types of nappy rash**

- **Irritant contact dermatitis** (most common): caused by prolonged skin contact with urine and faeces. Appears as red, shiny skin in the nappy area, sparing the skin folds
- **Candida (thrush) nappy rash**: bright red rash with satellite spots extending into the skin folds; often follows a course of antibiotics; does not respond to standard barrier cream
- **Seborrhoeic dermatitis**: yellowish, greasy scales; may extend to the trunk or scalp

**Causes**

- Infrequent nappy changes
- Prolonged contact with wet or soiled nappy
- Diarrhoea (loosens the skin barrier)
- Antibiotics (alter gut bacteria, leading to candida overgrowth)
- New foods during weaning
- Occlusive nappies trapping heat

**Prevention**

- Change nappies frequently — at every feed or at least every 2–3 hours
- Allow nappy-free time daily to air the skin
- Clean gently from front to back with fragrance-free wipes or cotton wool and water
- Apply a thick barrier cream (zinc oxide, petroleum jelly, or Sudocrem) at every change

**Treatment**

- Mild rash: increase nappy changes, apply barrier cream liberally, allow air time
- Candida rash: antifungal cream (e.g. clotrimazole or miconazole) — available on prescription or over the counter
- If rash does not clear within 3–4 days of treatment, see your GP

**When to see a GP**

- Rash extends beyond the nappy area
- Blisters, open sores, or bleeding
- No improvement after 3–4 days of consistent treatment
- You suspect thrush (satellite spots, skin fold involvement)

If in doubt, contact your GP or call 111.',
'health', 3, ARRAY['nappy-rash', 'napkin-dermatitis', 'candida', 'thrush', 'barrier-cream', 'infant-skin'], true, false),

('infant', 0,
'Cradle Cap: What It Is, How Long It Lasts, and How to Manage It',
'Cradle cap looks alarming but is harmless. Here is what is actually happening and what (little) you need to do.',
'Cradle cap (seborrhoeic dermatitis of the scalp) is one of the most common conditions in young babies, affecting around half of all infants in the first few months. It looks worse than it is.

**What cradle cap looks like**

- Thick, yellowish or brownish, greasy, scaly patches on the scalp
- Can also appear on the eyebrows, behind the ears, or in skin folds
- Does not usually itch or cause the baby any discomfort
- The skin beneath may appear slightly red

**What causes it?**

Cradle cap is thought to be caused by overactive sebaceous (oil) glands, possibly stimulated by maternal hormones that crossed the placenta before birth. It is not caused by poor hygiene, allergies, or infection.

**Does it need treatment?**

In most cases, no. Cradle cap resolves on its own by 6–12 months. There is no need to remove the scales forcefully.

**What you can do if it bothers you**

- Apply a small amount of baby oil, coconut oil, or petroleum jelly to the scalp and leave for 15–30 minutes (or overnight) to loosen the scales
- Gently brush with a soft baby brush or comb
- Wash off with a gentle baby shampoo
- Do not pick or scrape the scales forcefully — this can cause irritation or infection
- Anti-dandruff shampoos (ketoconazole) are sometimes used in older babies under GP guidance

**When to see a GP**

- Rash extends beyond the scalp to the face, body, or nappy area
- Skin becomes red, weeping, or shows signs of infection (crusting, pus)
- The baby appears uncomfortable or itchy (may indicate eczema rather than cradle cap)
- Cradle cap persists beyond 12 months

Cradle cap is not dangerous and does not require urgent attention. If you are unsure, your health visitor or GP can confirm the diagnosis.',
'health', 3, ARRAY['cradle-cap', 'seborrhoeic-dermatitis', 'scalp', 'infant-skin', 'newborn', 'scales'], true, false),

('infant', 0,
'Heat Rash (Prickly Heat) in Babies',
'Overdressing is one of the most common causes of skin problems in babies — and heat rash is its signature.',
'Heat rash (miliaria, or prickly heat) occurs when sweat ducts become blocked and sweat leaks into the skin. Babies are particularly vulnerable because their sweat glands are still developing and they cannot regulate their own temperature.

**What heat rash looks like**

- Small, red, or clear fluid-filled bumps (like tiny blisters)
- Appears in clusters on skin folds, neck, armpits, chest, and back
- May look similar to pimples or small insect bites
- Usually appears within hours of overheating
- Babies may seem irritable or scratchy

**Causes**

- Overdressing — the most common cause
- Warm weather or a hot room
- Sleeping under too many layers
- Wearing synthetic, non-breathable fabrics
- Applying thick creams that block pores

**Treatment: cool the baby down**

- Remove excess layers or move the baby to a cooler room
- Dress in light, breathable cotton clothing
- Cool (not cold) water to wipe the affected area
- Do not apply thick creams or lotions to heat rash — they can worsen it
- Heat rash usually resolves within 2–3 days of cooling

**Prevention**

- Use the ''one more layer than you'' rule: dress your baby in one more layer than you are comfortable in, but no more
- Choose cotton over synthetic fabrics
- Keep the room temperature between 16–20°C for sleeping
- Avoid direct sunlight and ensure adequate ventilation

**When to see a GP**

- Rash does not improve within 3 days of cooling measures
- Signs of infection: increasing redness, swelling, pus, or fever
- Baby appears very unwell

Heat rash is not dangerous. If you are unsure whether a rash is heat rash or something else, your GP or health visitor can advise. Call 111 if the baby has a fever alongside the rash.',
'health', 3, ARRAY['heat-rash', 'prickly-heat', 'miliaria', 'overheating', 'infant-skin', 'summer'], true, false),

('infant', 24,
'Viral Rashes: Roseola, Slapped Cheek, and Other Post-Viral Rashes',
'Most childhood rashes are viral and harmless — but knowing which ones require action is essential.',
'After a fever or illness, many babies and toddlers develop a rash. Most of these viral rashes are harmless, resolve on their own, and require no treatment. Here is a guide to the most common ones.

**Roseola (roseola infantum / sixth disease)**

Caused by human herpesvirus 6 (HHV-6). Extremely common in babies 6–24 months.
- High fever (often 39–40°C) for 3–5 days, then fever breaks suddenly
- As the fever disappears, a pink, flat or slightly raised rash appears on the trunk and spreads outward
- The rash usually lasts 1–2 days and fades without treatment
- The child appears well once the rash appears — this is reassuring

**Slapped cheek disease (fifth disease / erythema infectiosum)**

Caused by parvovirus B19. Most common in toddlers and school-age children.
- Bright red, ''slapped'' appearance on both cheeks
- Then a lacy, pinkish rash spreads to the body and limbs
- Often a mild cold precedes the rash
- Usually harmless in healthy children

Important: parvovirus B19 can cause serious problems in pregnancy (hydrops fetalis). If a pregnant woman has been exposed to slapped cheek, she should contact her midwife or GP promptly.

**Post-viral rashes**

Many common viruses produce a generalised pink rash as the immune system responds. These rashes typically:
- Appear as the fever settles
- Are flat or mildly raised (maculopapular)
- Fade when the skin is stretched (blanching)
- Cause no distress

**The critical difference: the glass test**

A blanching rash (fades under glass pressure) is almost always benign. A non-blanching rash is an emergency — it may indicate meningococcal disease or septicaemia.

If you are ever unsure whether a rash is blanching, call 111 or go to A&E immediately.',
'health', 4, ARRAY['roseola', 'slapped-cheek', 'parvovirus', 'viral-rash', 'post-viral', 'toddler', 'HHV6'], true, false),

-- ─────────────────────────────────────────────────────────────────────────────
-- DIGESTIVE
-- ─────────────────────────────────────────────────────────────────────────────

('infant', 0,
'Infant Reflux and GERD: Diagnosis, Feeding Positions, and Medication',
'Spitting up is normal. But when does reflux become a problem that needs treatment?',
'Most babies bring up small amounts of milk after feeds — this is called posseting or gastro-oesophageal reflux (GOR) and is entirely normal. In a small number of babies it becomes problematic enough to affect feeding, weight gain, or cause pain — this is called GORD (gastro-oesophageal reflux disease) and may need management.

**Normal reflux vs GORD**

Normal reflux:
- Baby spits up after some feeds
- Gaining weight well
- Happy and feeding normally between episodes
- No action needed beyond reassurance

GORD or problematic reflux may be indicated by:
- Persistent distress and crying, especially during or after feeds
- Arching the back during feeding
- Refusing feeds or feeding poorly
- Frequent vomiting that is large in volume
- Poor weight gain
- Breathing difficulties (milk aspirated into airways)

**Non-medication management first**

- Keep baby upright for 20–30 minutes after feeds
- Wind thoroughly mid-feed and after
- If bottle-feeding, ensure the teat flow rate is appropriate (too fast causes gulping and air swallowing)
- Smaller, more frequent feeds may help
- If breastfeeding, consider a dairy-free elimination diet for 2–4 weeks (under dietitian guidance) as CMPA can mimic or worsen reflux

**When GP review is needed**

- Poor weight gain (crossing centile lines downward)
- Projectile vomiting in every feed (possible pyloric stenosis — typically presents at 2–8 weeks, more common in boys)
- Blood in vomit or stool
- Baby appears to be in pain

**Medication**

Gaviscon Infant is sometimes used to thicken feeds. Proton pump inhibitors (e.g. omeprazole) are reserved for GORD where there is evidence of oesophagitis. Medication decisions should be made with a GP or paediatrician.

If you are concerned about your baby''s reflux, contact your GP. For projectile vomiting at every feed, seek same-day medical advice.',
'health', 5, ARRAY['reflux', 'GORD', 'GERD', 'posseting', 'feeding', 'infant-digestion', 'pyloric-stenosis'], true, false),

('infant', 0,
'Colic: The Crying Peak, Theories, and Coping',
'Colic is one of the most exhausting parts of early parenthood. Understanding it does not solve it — but it helps.',
'Colic is defined as crying for more than 3 hours a day, for more than 3 days a week, for more than 3 weeks, in an otherwise healthy, well-fed baby. It affects around 1 in 5 babies and typically peaks at 4–6 weeks before improving and largely resolving by 3–4 months.

**What does colic crying look like?**

- Intense, inconsolable crying, often in the late afternoon or evening
- Baby pulls legs up to the stomach
- Face may flush red
- Hard, distended abdomen
- Passes wind during or after crying episodes
- Baby calms briefly then starts again

**Is it really ''colic''?**

Colic is a diagnosis of exclusion — it means the crying is not explained by hunger, illness, nappy rash, or another identifiable cause. Before accepting a colic label, it is worth ruling out:
- CMPA (cow''s milk protein allergy)
- Reflux
- Ear infection or other infection
- Incorrect formula preparation

**What is causing it?**

Honestly: the cause is not fully understood. Theories include intestinal gas, gut microbiome immaturity, overstimulation, and developing nervous system. None is definitively proven.

**What helps (somewhat)**

- Rhythmic motion: rocking, car rides, walks in the pram
- White noise: vacuum cleaner sounds, a fan, dedicated apps
- Feeding position adjustments to reduce air swallowing
- Infant massage (some evidence for benefit)
- For breastfed babies: a 2–4 week dairy elimination diet may be worth trying if CMPA is suspected

**What does not help**

Simethicone drops (e.g. Infacol) have limited evidence but are widely used; probiotics (Lactobacillus reuteri) have small emerging evidence for breastfed babies.

**Coping as a parent**

Colic is exhausting and can feel relentless. It is always acceptable to put a settled baby down safely and take 10 minutes away. Reach out to your health visitor or GP — they can support both baby and parent.

If your baby''s crying is accompanied by fever, vomiting, or any change in appearance, seek medical advice promptly. Call 111 or your GP.',
'health', 4, ARRAY['colic', 'crying', 'infant', 'evening-crying', 'newborn', 'CMPA', 'coping'], true, false),

('infant', 0,
'Constipation in Formula-Fed Babies: Causes and Remedies',
'Constipation is more common in formula-fed babies than breastfed ones — here is why and what to do.',
'Breastfed babies rarely get constipated because breast milk is perfectly tailored to be fully absorbed with little residue. Formula-fed babies produce firmer, more regular stools — and constipation is a genuine problem for some.

**What counts as constipation?**

Frequency alone is not the guide. Some formula-fed babies go once or twice a day; others every 2–3 days. What matters is the stool consistency and whether the baby is straining in discomfort.

Signs of constipation:
- Hard, pellet-like stools (rabbit-dropping consistency)
- Crying or obvious straining to pass a stool
- Firm, distended abdomen
- Infrequent stools with visible discomfort

**What does not count as constipation?**

- Straining and going red in the face before passing a normal, soft stool — this is called grunting baby syndrome, a normal phenomenon as babies learn to coordinate abdominal muscles and bowel function

**Causes in formula-fed babies**

- Incorrect formula preparation (too concentrated — always use level, not heaped, scoops)
- Insufficient fluid intake
- Change in formula brand
- Starting solid foods (usually around 6 months)

**What helps**

- Extra cooled boiled water (in addition to formula feeds) — especially in warm weather
- Gentle tummy massage in a clockwise direction
- Bicycle leg movements
- A warm bath can relax the bowel
- Do not add sugar, juice, or extra water to formula feeds

**When to see a GP**

- No bowel movement for more than 5 days
- Baby is in significant distress
- Blood in or around the stool
- Ribbon-like or very thin stools (rare, but warrants assessment)
- Vomiting alongside the constipation
- Baby''s abdomen feels hard and distended

Do not use laxatives in babies without medical advice. If in doubt, contact your GP or call 111.',
'health', 3, ARRAY['constipation', 'formula-fed', 'infant', 'stool', 'bowel', 'digestion'], true, false),

('infant', 24,
'Constipation During Weaning: Managing It With Diet',
'Starting solid foods is exciting — but it often comes with a side of constipation. Here is how to manage it.',
'Constipation is one of the most common side effects of introducing solid foods. As the gut adjusts from a purely liquid diet to processing fibre and complex carbohydrates, the bowel slows down. This is usually temporary and manageable.

**Why weaning causes constipation**

- The gut is encountering fibre for the first time — this takes adjustment
- Lower fluid intake relative to energy consumed
- Foods like banana, rice, and processed baby foods can be binding
- The microbiome shifts significantly during weaning

**Foods that help: natural laxatives**

- Prunes, pears, and peaches (P fruits) — pureed, stewed, or in smooth form
- Mango, papaya, kiwi
- Lentils and legumes (cooked soft)
- Oat-based porridge
- Leafy green vegetables
- Water with meals (from 6 months, cooled boiled is fine; tap water fine from 6 months)

**Foods to limit during a constipation episode**

- Banana (ripe bananas are more constipating than unripe)
- White rice, white bread, processed cereals
- Excessive dairy (cheese, fromage frais) before resolving the episode

**Other measures**

- Offer water in a free-flow cup at meals — babies need fluid to help fibre move through the gut
- Tummy massage and bicycle legs
- Warm bath
- Continue formula or breastfeeds normally alongside solids

**When to see a GP**

- Blood in or on the stool
- Baby in significant distress or not passing stool for more than 5 days
- Constipation that does not improve with dietary changes over 1–2 weeks
- Vomiting alongside the constipation

Your health visitor is also a great first point of contact for weaning-related constipation. If in doubt, contact your GP or call 111.',
'health', 3, ARRAY['constipation', 'weaning', 'solids', 'infant', 'fibre', 'digestion', 'prunes'], true, false),

('infant', 0,
'Diarrhoea in Babies: When to Treat at Home vs Seek Help',
'Loose stools are common in early infancy. Here is how to tell normal from worrying.',
'Diarrhoea in babies is defined as a sudden increase in the frequency and looseness of stools, distinct from that baby''s normal pattern. Breastfed babies naturally have loose, seedy, yellow stools — this is not diarrhoea. Understanding what is normal for your baby is the baseline.

**Common causes**

- Viral gastroenteritis (norovirus, rotavirus) — the most common cause
- Bacterial infection (Salmonella, Campylobacter) — less common, often associated with undercooked food or water
- Antibiotic use (disrupts gut flora)
- Food intolerance, especially CMPA
- Teething (mild, brief loose stools are common but should not be severe)

**Home management**

- Continue breastfeeding or formula feeding normally
- Offer oral rehydration solution (ORS, e.g. Dioralyte) between feeds if your baby has significant diarrhoea
- Do not dilute formula
- Do not give anti-diarrhoeal medication to babies and toddlers
- Change nappies promptly and apply barrier cream to prevent nappy rash

**Signs of dehydration — see a GP or call 111**

- Fewer wet nappies than usual
- Dry mouth and lips
- Sunken fontanelle
- No tears when crying
- Lethargy

**When to go to A&E**

- No wet nappy for 8–12 hours
- Child is very unwell, floppy, or unresponsive
- Blood or mucus in the stool (may indicate bacterial infection or intussusception — a bowel obstruction in young babies)
- Severe abdominal pain or inconsolable crying
- Diarrhoea lasting more than 7 days

Blood in the stool in a baby warrants same-day medical review. Call 111 or go to A&E if you are concerned.',
'health', 4, ARRAY['diarrhoea', 'gastroenteritis', 'infant', 'dehydration', 'ORS', 'loose-stools'], true, false),

('infant', 0,
'Food Allergies vs Intolerance in Babies: CMPA, Symptoms, and Testing',
'Cow''s milk protein allergy is the most common food allergy in infancy — and it is frequently delayed and misdiagnosed.',
'Food allergies affect around 5–8% of young children. Cow''s milk protein allergy (CMPA) is the most common, affecting 2–3% of babies. Understanding the difference between an IgE-mediated allergy and a non-IgE-mediated reaction is important because symptoms, testing, and management differ significantly.

**IgE-mediated (immediate) reactions**

These occur within minutes to 2 hours of ingesting the food:
- Hives, urticaria, or welts
- Swelling of lips, tongue, or face (angioedema)
- Vomiting
- Wheeze or breathing difficulty
- In severe cases: anaphylaxis (pale, floppy, unconscious, not breathing properly)

If your baby has an immediate reaction like this, call 999 if breathing is affected, or go to A&E.

**Non-IgE-mediated (delayed) reactions — more common in infants**

These occur hours to days after eating the food:
- Persistent eczema not responding to treatment
- Reflux-like symptoms
- Colic-like crying
- Chronic diarrhoea or constipation
- Blood or mucus in stools
- Faltering growth

**Diagnosing CMPA**

Non-IgE CMPA is diagnosed clinically — there is no blood test for delayed reactions. Standard allergy testing (skin prick, specific IgE) tests only IgE reactions. A supervised exclusion trial (removing all cow''s milk protein for 2–4 weeks) followed by a re-challenge is the diagnostic gold standard.

**Management**

- Breastfed babies: maternal dairy exclusion for 2–4 weeks (dietitian support recommended)
- Formula-fed babies: extensively hydrolysed formula (eHF) prescribed by GP (e.g. Aptamil Pepti, Nutramigen); soya formula is an alternative but may cross-react in younger infants
- Introduce other allergenic foods at weaning as normal (early introduction reduces later allergy)

If you suspect food allergy in your baby, see your GP. Do not attempt prolonged elimination diets without dietitian guidance.',
'health', 5, ARRAY['CMPA', 'food-allergy', 'cow-milk-protein', 'intolerance', 'infant', 'eczema', 'allergy'], true, false),

-- ─────────────────────────────────────────────────────────────────────────────
-- VACCINATIONS
-- ─────────────────────────────────────────────────────────────────────────────

('infant', 8,
'UK Vaccination Schedule Overview: What Is Given When and Why',
'The UK childhood vaccination programme is one of the most effective public health tools available. Here is what to expect.',
'Vaccinations protect babies from serious, potentially life-threatening diseases at exactly the age when they are most vulnerable. The UK''s NHS childhood immunisation schedule is carefully timed to give protection as early as safely possible.

**The UK schedule (as of 2024/25)**

- **8 weeks**: 6-in-1 (diphtheria, tetanus, polio, Hib, hepatitis B, whooping cough); Rotavirus (oral); MenB
- **12 weeks**: 6-in-1 (2nd dose); Rotavirus (2nd dose); PCV (pneumococcal)
- **16 weeks**: 6-in-1 (3rd dose); MenB (2nd dose)
- **12–13 months**: Hib/MenC; MMR (measles, mumps, rubella); PCV booster; MenB booster; (from 2025) RSV vaccine review at birth for eligible mothers
- **2–3 years**: Annual flu vaccine (nasal spray)
- **3 years 4 months**: MMR (2nd dose); 4-in-1 pre-school booster

**Why so early?**

The timing is not arbitrary — it reflects when maternal antibodies (passed during pregnancy) begin to wane and when the baby''s own immune system is ready to respond. Whooping cough, for example, is most deadly in babies under 3 months who are too young to have been vaccinated.

**Does my baby really need all these vaccines?**

The diseases these vaccines prevent — meningitis, septicaemia, measles encephalitis, whooping cough — still exist. Vaccination rates above 95% are needed for herd immunity to protect those who cannot be vaccinated (immunocompromised, premature babies, newborns). Your baby''s vaccinations protect other babies too.

**What if we miss a vaccine?**

The schedule can be caught up — speak to your GP surgery or health visitor. Vaccines given later are still effective.

Keep your child''s Red Book updated with vaccination dates. Contact your GP surgery if you have any questions about the schedule.',
'health', 4, ARRAY['vaccination', 'immunisation', 'NHS-schedule', 'MMR', '6-in-1', 'MenB', 'infant'], true, false),

('infant', 8,
'Common Vaccine Reactions: What Is Normal and What Is Not',
'Most vaccine reactions are mild and short-lived. Here is how to tell a normal reaction from one that needs attention.',
'Vaccines work by provoking an immune response — which means mild reactions are not just common, they are expected and reassuring. They tell you the immune system is doing its job.

**Normal reactions (expected, resolve within 1–3 days)**

- Redness, swelling, or firmness at the injection site
- Low-grade fever (usually under 38.5°C), especially after MenB vaccine
- Irritability and unsettled behaviour in the 24–48 hours after vaccination
- Drowsiness or increased sleep
- Reduced appetite
- After the MMR vaccine (given at 12–13 months): a mild fever and faint rash may appear 7–14 days later as a delayed immune response — this is normal

**Managing normal reactions**

- Paracetamol is recommended after MenB vaccination to reduce fever (see NHS guidance on timing and dose)
- Cuddles, skin-to-skin, and feeding for comfort
- Keep the injection site clean and uncovered; do not massage it
- A cool flannel on the injection site can help with local soreness

**Reactions that require medical attention — call your GP or 111**

- Fever above 39.5°C
- Crying that lasts more than 3 hours and is inconsolable
- Significant swelling of the limb at the injection site
- Pallor, limpness, or abnormal responsiveness
- Seizure (see febrile convulsions article)

**Rare reactions — call 999**

- Anaphylaxis: occurs within 15 minutes of vaccination (this is why you wait at the surgery after vaccines)
- Signs: hives, swelling, difficulty breathing, pale or blue skin, collapse

Anaphylaxis after vaccination is extremely rare (approximately 1–2 cases per million doses) and is why clinical settings have protocols and adrenaline available. The risks of not vaccinating far exceed the risks of vaccination.

If you are concerned about any reaction after vaccination, call your GP surgery, NHS 111, or go to A&E if the reaction is severe.',
'health', 4, ARRAY['vaccine-reaction', 'vaccination', 'MenB', 'fever', 'side-effects', 'infant', 'MMR'], true, false),

('infant', 8,
'Managing Vaccine Day: Feeding, Comfort, and Paracetamol',
'Practical advice for before, during, and after your baby''s vaccination appointments.',
'Vaccine days can be stressful for both babies and parents. A little preparation makes a meaningful difference — and knowing exactly what paracetamol to give (and when) for MenB is something many parents are not told clearly enough.

**Before the appointment**

- Feed your baby as normal before attending — a hungry baby is harder to comfort after injections
- Dress your baby in an outfit that gives easy access to the thighs (where most infant injections are given)
- Bring the Red Book
- If your baby has been unwell with a fever in the preceding week, let the practice nurse know — they may delay one dose

**During the injection**

- Hold your baby skin-to-skin or in your arms during the injection if possible — studies show this reduces distress
- Breastfeeding during or immediately after vaccination significantly reduces pain scores
- For formula-fed babies, offering a feed immediately after helps
- Sweet-tasting solution (e.g. a few drops of sugar water) has evidence for pain reduction in newborns and young infants

**Paracetamol after MenB vaccine**

The NHS specifically recommends giving infant paracetamol after the 8-week, 16-week, and 12-month MenB vaccinations to prevent fever. This is one of the few situations where paracetamol is recommended proactively rather than reactively:
- Give the first dose as soon as possible after the vaccine (within 2 hours)
- Give a second dose 4–6 hours later
- A third dose 4–6 hours after that if still feverish
- Use weight-based dosing; most 8-week babies will receive 2.5 ml of 120 mg/5 ml suspension

**After vaccination**

- Normal feeding and sleep
- Watch for the reactions described in the vaccine reactions article
- Contact your GP or 111 if you are concerned at any point

You do not need to keep your baby at home after vaccines unless they are unwell. Vaccine day cuddles and closeness are the best medicine.',
'health', 3, ARRAY['vaccine-day', 'vaccination', 'MenB', 'paracetamol', 'comfort', 'infant', 'appointment'], true, false),

('toddler', 12,
'The MMR Vaccine: Addressing Concerns with Evidence',
'Decades of research across hundreds of millions of children is clear: MMR is safe and effective.',
'The MMR vaccine (measles, mumps, and rubella) is given at 12–13 months and again at 3 years 4 months. It is one of the most studied vaccines in history — and one of the most important.

**What MMR protects against**

- **Measles**: a highly contagious virus that can cause pneumonia, encephalitis (brain swelling), and death. It kills more than 100,000 people globally every year — mainly children under 5
- **Mumps**: can cause deafness, meningitis, and, in post-pubertal males, orchitis (testicular inflammation)
- **Rubella (German measles)**: mild in children but devastating if contracted in pregnancy — causes congenital rubella syndrome (heart defects, deafness, blindness in the unborn baby)

**Is MMR linked to autism?**

No. This claim originated from a 1998 paper by Andrew Wakefield, which was found to be fraudulent, was retracted by The Lancet, and resulted in Wakefield losing his medical licence. Since then, studies involving hundreds of millions of children across multiple countries have found no link between MMR and autism. A 2019 Danish cohort study of over 650,000 children found no association.

**What are the actual side effects?**

- Local soreness and redness at injection site
- Mild fever and a faint rash 7–14 days after vaccination (delayed immune response — not contagious)
- Very rarely: a brief febrile seizure (risk: 1 in 3,000 doses; lower than the seizure risk from measles infection itself)
- Anaphylaxis: approximately 1–2 per million doses

**Herd immunity threshold for measles**

Measles requires 95% vaccination coverage to prevent outbreaks. When coverage drops below this, measles returns — as seen in multiple European countries since 2018.

If you have concerns about MMR, your GP or health visitor can discuss them with you. The evidence supporting MMR safety and efficacy is overwhelmingly robust.',
'health', 4, ARRAY['MMR', 'measles', 'vaccination', 'autism-myth', 'evidence', 'toddler', 'immunisation'], true, false),

('toddler', 12,
'Flu Vaccine for Children: What It Is and Why It Matters',
'The children''s flu vaccine is given as a nasal spray — and it protects your child and those around them.',
'The annual flu vaccine is offered to all children aged 2–18 years in the UK. Children aged 2 and 3 years receive it through their GP surgery; children aged 4 and above typically receive it at school. For eligible younger children (those with certain health conditions), it may be offered earlier.

**Why is flu more serious in young children?**

Children under 5 are hospitalised with influenza at higher rates than other age groups. Flu in young children can cause:
- Febrile seizures
- Croup and bronchiolitis
- Secondary bacterial pneumonia
- Rarely, encephalitis

**The nasal spray vaccine (LAIV)**

The children''s flu vaccine is a live attenuated influenza vaccine (LAIV), given as a painless nasal spray — no injection needed. It is highly effective in young children and produces a stronger immune response than the injected version in this age group.

**Is it safe?**

Yes. Side effects are typically mild:
- Runny nose or nasal congestion (most common)
- Mild fever
- Reduced appetite
- Headache in older children

The nasal spray contains a very weakened form of flu virus that cannot cause flu.

**Who should not receive the nasal spray?**

- Children who are severely immunocompromised (they receive an injected version instead)
- Children taking aspirin (rare)
- Children with severe egg allergy (seek specialist advice)
- Children with severe asthma or active wheezing at the time of vaccination

**Why vaccinate every year?**

Flu viruses mutate rapidly. The vaccine is reformulated each year to match the strains predicted to circulate that season.

The flu vaccine also protects family members and vulnerable people your child comes into contact with. Speak to your GP surgery to book your toddler''s flu vaccine before flu season begins (ideally September–October).

If your child develops a high fever or difficulty breathing after the vaccine, contact your GP or call 111.',
'health', 3, ARRAY['flu-vaccine', 'influenza', 'nasal-spray', 'LAIV', 'toddler', 'annual-vaccine', 'prevention'], true, false),

-- ─────────────────────────────────────────────────────────────────────────────
-- SAFETY
-- ─────────────────────────────────────────────────────────────────────────────

('infant', 0,
'Car Seat Safety: All Stages, Installation, and Transitions',
'Car seats save lives — but only when used correctly. Most errors happen at home, not in the shop.',
'Car seat safety is non-negotiable. Road traffic accidents are among the leading causes of death in children under 5. The correct car seat, correctly installed and correctly used, reduces the risk of fatal injury by up to 71%.

**Group 0 / Infant carrier (birth to ~12–15 months)**

- Rear-facing only
- Weight limit typically 13 kg; move on when the baby''s head is within 2.5 cm of the top of the seat
- Never place in a front seat with an active airbag
- The handle should be in the correct position for in-car use (check your specific seat''s manual — it varies)

**Group 0+/1 Extended Rear-Facing (ERF) seats**

- UK and international road safety guidance recommends keeping children rear-facing for as long as possible — ideally to 15–25 kg (approximately 3–4 years)
- Rear-facing is up to 5x safer than forward-facing in a frontal collision because the force is spread across the child''s entire back rather than concentrating on the neck and chest

**Group 1 Forward-Facing (9–18 kg)**

- If not using ERF, children move to forward-facing seats from approximately 9 kg
- Must use a 5-point harness; never remove the harness to put a coat on — remove the coat instead, or use a thin fleece under the harness

**Group 2/3 High-Back Booster (15–36 kg / approximately age 4–12)**

- A high-back booster with side-impact protection is strongly preferred over a backless booster cushion
- Do not move to an adult seatbelt only until the child is 135 cm tall or 12 years old

**Common installation errors**

- Straps too loose — you should not be able to pinch excess fabric at the shoulder
- Chest clip (where fitted) not at armpit level
- Seat not installed tightly enough (less than 1 inch of movement at the belt path)
- Second-hand seats without full history — avoid if unknown history; an unseen impact may have compromised the seat

Get your seat installation checked — many fire stations and car seat retailers offer free checks. If in doubt, contact your local road safety team or the Which? car seat advice line.',
'safety', 5, ARRAY['car-seat', 'road-safety', 'rear-facing', 'infant', 'toddler', 'installation', 'ERF'], true, false),

('infant', 0,
'Choking First Aid for Babies Under 12 Months: Clear Step-by-Step',
'Choking is terrifying. Knowing exactly what to do before it happens can save your baby''s life.',
'Choking happens when an object partially or completely blocks the airway. In babies under 12 months, the most common causes are small objects, unsuitable foods (whole grapes, chunks of raw carrot, hard sweets), and — occasionally — large volumes of milk swallowed too quickly.

**When is it choking vs gagging?**

- **Gagging**: baby goes red, coughs vigorously, eyes may water — this is normal and protective. Do not intervene; the cough is doing its job
- **Choking**: baby cannot cough effectively, makes a high-pitched wheeze or no sound at all, lips turn blue, or becomes floppy

**If your baby is choking (under 12 months)**

**Step 1: 5 back blows**
- Hold the baby face-down along your forearm, supporting the head (which should be lower than the chest)
- Use the heel of your hand to give 5 firm back blows between the shoulder blades

**Step 2: Check the mouth**
- Turn the baby face-up on your thigh
- If you can see the object, remove it with a single finger sweep
- Never do a blind finger sweep — you may push the object further in

**Step 3: 5 chest thrusts (not abdominal)**
- Two fingers on the breastbone, just below the nipple line
- Give 5 sharp inward and upward thrusts
- Do NOT use abdominal thrusts (Heimlich manoeuvre) on babies under 12 months — the liver and spleen sit higher and can be damaged

**Repeat up to 3 cycles while calling 999**

If the baby becomes unconscious at any point, start infant CPR and call 999 immediately.

**Call 999 if:**
- The object is not cleared after 3 cycles
- The baby loses consciousness
- The baby''s lips or skin turn blue

Take an infant first aid course — the technique above is easier to learn in person than to read. St John Ambulance and the British Red Cross offer courses throughout the UK.',
'safety', 5, ARRAY['choking', 'first-aid', 'back-blows', 'chest-thrusts', 'infant', 'airway', 'emergency'], true, false),

('toddler', 12,
'Choking First Aid for Toddlers: Back Blows and Abdominal Thrusts',
'The technique changes once a child is over 12 months — here is exactly what to do.',
'Toddlers are at high risk of choking as they become mobile, exploratory, and opinionated about what goes in their mouths. Common hazards include whole grapes, cherry tomatoes, hard sweets, small toys, coins, button batteries, and large chunks of food.

**Cut these foods before offering to toddlers**
- Grapes: cut lengthways into quarters, not rounds
- Cherry tomatoes: halved
- Blueberries: halved for under-3s
- Raw carrot: grated or cooked soft, not sticks
- Sausages: cut lengthways, not rounds
- Nuts: ground or in butters only under 5 years (allergy guidance aside)

**If your toddler (over 12 months) is choking**

**Step 1: 5 back blows**
- Lean the child forward (seated or standing) or hold them across your lap face-down
- Use the heel of your hand to give 5 firm back blows between the shoulder blades

**Step 2: Check the mouth**
- If the object is visible, remove it with a single finger sweep
- Do not do blind finger sweeps

**Step 3: 5 abdominal thrusts (Heimlich manoeuvre for over 12 months)**
- Stand or kneel behind the child
- Make a fist with one hand and place it thumb-side in, just above the navel and well below the breastbone
- Cover your fist with the other hand
- Give 5 sharp inward and upward thrusts

**Repeat up to 3 cycles while calling 999**

If the child becomes unconscious, start child CPR and call 999 immediately.

**Call 999 immediately if:**
- Choking is not resolved after 3 cycles
- The child loses consciousness or cannot breathe
- Lips or skin turn blue or grey

Always seek medical review after a choking episode even if the object was cleared, to check no fragments remain in the airway.

Learning first aid in person saves lives — book a course with St John Ambulance or the British Red Cross.',
'safety', 5, ARRAY['choking', 'first-aid', 'heimlich', 'abdominal-thrusts', 'toddler', 'airway', 'emergency'], true, false),

('infant', 0,
'Drowning Prevention: Baths, Paddling Pools, and Garden Ponds',
'Drowning can happen in very shallow water and very quickly. Prevention is everything.',
'Drowning is one of the leading causes of accidental death in children under 5. It can occur in as little as 5 cm of water, and it is often silent — drowning children do not typically splash and shout as portrayed in films.

**Baths**

- Never leave a baby or toddler alone in the bath, even for a second
- "Supervision" means within arm''s reach — not in the next room
- Bath seats and rings are aids, not safety devices; they do not prevent drowning
- Run cold water first before hot to prevent scalding
- Empty the bath immediately after use
- If the doorbell or phone rings during bath time, either ignore it or take your child with you

**Paddling pools**

- Empty paddling pools after every use — a toddler can drown in a paddling pool left in the garden
- Never leave a child unattended in or near a paddling pool
- Inflatable pools are not self-supporting safety devices

**Garden ponds**

- Garden ponds are one of the highest-risk water features for toddlers under 3
- Fence off or drain garden ponds if you have young children
- A rigid mesh cover over the pond surface is an effective barrier
- Children this age are top-heavy and cannot right themselves in water

**General water safety principles**

- Supervision means constant visual contact — not turning away to check your phone
- Flotation devices (armbands, swim seats) are not life-saving devices and are not a substitute for supervision
- If a child goes missing at a property with water, check the water first

**In the event of a near-drowning**

Call 999 immediately and begin CPR if the child is not breathing. Cold water near-drowning victims can survive with appropriate treatment — never assume it is too late.

If in doubt about any water hazard, contact your local council or the Royal Society for the Prevention of Accidents (RoSPA) for guidance.',
'safety', 4, ARRAY['drowning', 'water-safety', 'bath', 'paddling-pool', 'pond', 'supervision', 'prevention'], true, false),

('infant', 24,
'Baby-Proofing Room by Room: Stair Gates, Socket Covers, and Furniture',
'Once your baby starts moving, the home becomes an obstacle course. Here is a systematic approach.',
'The moment a baby starts rolling, crawling, or pulling to stand, your home changes. Baby-proofing is not about creating a padded cell — it is about removing the most serious hazards while allowing safe exploration.

**Stair gates**

- Install pressure-fit gates for rooms and doorways; use screw-fix gates at the TOP and BOTTOM of stairs (pressure-fit gates are not safe at the top of stairs)
- The gate should have no more than 4.5 cm between bars
- Check the gate is BSI-approved (BS EN 1930:2011 for baby gates)
- Gates on wider-than-standard openings need extension kits

**Socket covers**

The evidence on socket covers is nuanced — UK sockets already have built-in shutters. The real risk is that improperly fitting socket covers can be removed by toddlers and become choking hazards. Use covers that are tested to BS standard only, or simply redirect attention with furniture placement.

**Furniture and falling hazards**

- Anchor tall furniture (bookshelves, wardrobes, chest of drawers) to the wall using furniture straps
- Secure TVs on stands with anti-tip straps or mount on the wall
- Remove or secure glass-topped tables
- Use corner and edge protectors on sharp furniture

**Kitchen hazards**

- Always use the back hob rings; turn pan handles inward
- Keep sharp objects in locked drawers
- Do not leave hot drinks within reach — burns and scalds are among the most common childhood injuries

**Medication and cleaning products**

- All medications (including vitamins and iron tablets) in locked or child-resistant storage out of reach and out of sight
- Cleaning products in high locked cupboards
- Button batteries and magnets require special mention — see the dedicated article

**Lounge and bedrooms**

- Check for blind cords, charging cables, and small objects on low surfaces
- Remove or secure toy chests with heavy lids (entrapment risk)

A room-by-room safety check once a month as your baby''s abilities develop is good practice. RoSPA offers free guidance at rospa.com.',
'safety', 4, ARRAY['baby-proofing', 'stair-gate', 'socket-cover', 'furniture', 'home-safety', 'infant', 'toddler'], true, false),

('infant', 12,
'Burns and Scalds: Prevention and First Aid for Babies and Toddlers',
'Scalds from hot drinks are the most common cause of serious burns in under-5s. Prevention is straightforward once you know the risks.',
'Burns and scalds are among the most common serious accidents in children under 5 in the UK. Hot drinks cause the majority of scalds in babies and toddlers — a cup of tea can cause a serious burn up to 15 minutes after it is made. Knowing both prevention and first aid is essential.

**Prevention first**

- Never hold a baby while drinking a hot drink
- Do not pass hot drinks over a baby''s head or across the table where a toddler can reach
- Keep hot drinks out of reach of toddlers entirely — a single pull of a tablecloth can cause a life-changing scald
- Always use back hob rings and turn pan handles inward
- Use a cordless kettle and cool it away from the counter edge
- Test bath water with an elbow or a thermometer — aim for 37–38°C
- Use a bath thermometer; fit a thermostatic mixing valve (TMV) to your hot water supply (maximum 48°C from taps) — highly recommended if you have young children
- Check car seats left in the sun — metal buckles can cause burns

**First aid for burns and scalds**

1. **Cool the burn immediately**: run cool (not cold, not iced) water over the burn for at least 20 minutes
2. **Remove clothing and jewellery** around the burn — but do not remove anything that is stuck to the skin
3. **Cover loosely** with cling film (not wrapped tight) or a clean non-fluffy dressing. Do not use butter, toothpaste, or any home remedy
4. **Do not burst blisters**
5. **Seek medical help for any burn in a baby or toddler**

**When to call 999 or go to A&E**

- Burns larger than a 50p piece in a child
- Burns on the face, hands, feet, genitals, or across a joint
- Chemical or electrical burns
- Any burn where the skin is white, brown, or black
- If in any doubt

Do not delay cooling — 20 minutes of cool running water significantly improves outcomes. Call 999 for serious burns, or take your child to A&E immediately.',
'safety', 4, ARRAY['burns', 'scalds', 'hot-drink', 'first-aid', 'prevention', 'infant', 'toddler'], true, false),

('infant', 16,
'Sun Safety: Sunscreen Age Guidance, Shade, and Hydration',
'Babies and toddlers have delicate skin that burns quickly. Sun protection needs to start from day one outdoors.',
'Sunburn in infancy and early childhood significantly increases the lifetime risk of melanoma. Babies and toddlers have thinner skin, less melanin, and spend more time outdoors during summer — which makes them particularly vulnerable.

**Under 6 months: no sunscreen, only shade**

The NHS and British Skin Foundation recommend keeping babies under 6 months out of direct sunlight, especially between 11am and 3pm. Their skin is too sensitive to process chemical sunscreen ingredients, and physical sunscreens (zinc oxide, titanium dioxide) are generally preferred from 6 months.

**From 6 months: sunscreen guidance**

- Use SPF 30 or higher with UVA protection (4 or 5 star UVA rating)
- Apply generously and evenly 15–30 minutes before going out
- Reapply every 2 hours and after water or towel contact
- Don''t forget: ears, back of neck, tops of feet, and back of the hands
- Physical/mineral sunscreens (zinc oxide) are often better tolerated on infant skin than chemical formulas

**Clothing and shade**

- UV-protective clothing (UPF 50+) is highly effective — a normal white cotton T-shirt is around UPF 6 when dry and even less when wet
- Wide-brimmed hats to protect face, ears, and neck
- Sunglasses with UV400 protection for toddlers
- Shade is the most effective protection — plan outdoor time for before 11am or after 3pm

**Hydration**

Babies cannot tell you they are thirsty. In hot weather:
- Breastfed babies: feed more frequently; no water needed under 6 months
- Formula-fed babies: offer cooled boiled water in addition to normal feeds from 6 months
- Toddlers: ensure regular water intake; watch for signs of dehydration (fewer wet nappies, dry mouth, lethargy)

**Signs of heatstroke in a baby**

Call 999 if your baby has very hot skin, stops sweating, is confused or unresponsive, or has a very high temperature with no ability to cool down.

If in doubt about sun protection products for your baby, ask your pharmacist or health visitor.',
'safety', 4, ARRAY['sun-safety', 'sunscreen', 'SPF', 'UV', 'shade', 'hydration', 'infant', 'toddler', 'heatstroke'], true, false),

('toddler', 12,
'Button Battery Safety: The Urgent Swallowing Risk',
'Button batteries are found in dozens of household items and can cause life-threatening injury within 2 hours of swallowing.',
'Button batteries — small, coin-shaped lithium batteries — are one of the most dangerous objects a toddler can swallow. They are found in remote controls, bathroom scales, key fobs, hearing aids, musical greeting cards, watches, and toys. They are shiny, small, and often accessible.

**Why are button batteries so dangerous?**

When a button battery lodges in the oesophagus (gullet), it creates an electrical current that generates hydroxide (caustic alkali) at the negative pole. This causes a chemical burn to the tissue within 2 hours. The oesophagus can be perforated. Damage to surrounding structures — the aorta, trachea — can be fatal.

Importantly, the battery does not need to be new to cause harm. A ''dead'' battery still carries enough charge.

**What to do if you suspect swallowing**

- Call 999 or go to A&E immediately — do not wait for symptoms
- Do not induce vomiting
- Do not give food or drink
- If the child has swallowed a button battery and you have honey available (for children over 12 months), early studies suggest giving 2 teaspoons of honey every 10 minutes on the way to hospital may coat the battery and slow injury — but this does not replace emergency care and should never delay it

**Warning symptoms**

- Drooling or difficulty swallowing
- Vomiting
- Chest pain or pain on swallowing
- Coughing
- Refusing to eat

Do not wait for symptoms — by the time symptoms appear, significant damage may already have occurred.

**Prevention**

- Tape over battery compartments with strong packing tape
- Store spare batteries in locked containers high out of reach
- Discard used batteries safely immediately
- Check all battery-containing items in the home for secure compartments

Call 999 or go immediately to A&E if a button battery has been swallowed or may have been swallowed.',
'safety', 4, ARRAY['button-battery', 'swallowing', 'toddler', 'emergency', 'choking-hazard', 'poisoning', 'safety'], true, false),

('infant', 16,
'Blind Cord Safety: Strangulation Risk and What to Do',
'Blind cords are a silent and serious strangulation hazard for young children. The UK has strict regulations for good reason.',
'Loop cords on window blinds are a known and preventable cause of child strangulation death. Tragically, deaths continue to occur — mostly in children aged 1–3 years who are mobile, curious, and at exactly the right height for dangling loops when near a cot, bed, or piece of furniture.

**Why blind cords are dangerous**

A looped cord creates a fixed noose. Children who become entangled cannot remove themselves, and unconsciousness from strangulation can occur in as little as 30 seconds. Many incidents occur during nap time or brief unsupervised moments.

**The current UK regulations**

Since 2014, new blinds sold in the UK must either have no accessible loop, a cord that breaks under tension (breakaway connector), or a cord that retracts automatically. However, millions of pre-2014 blinds remain in UK homes.

**How to make your home safe now**

- Replace all looped cord blinds with cordless or motorised alternatives — this is the only fully safe solution
- If replacement is not immediately possible:
  - Use a cord wind-up device to keep cords short and tightly wound
  - Install a cord cleat mounted high on the wall (at least 1.5 m from the floor) and wind the cord around it after every use
  - Keep all furniture, cots, and beds away from windows with blinds

**Most important rules**

- A cot or bed must never be placed within reach of a blind cord — a child can climb up onto a cot mattress and reach far higher than you expect
- Check every window in the house

**Reporting unsafe blinds**

Blinds not meeting current safety standards can be reported to the Royal Society for the Prevention of Accidents (RoSPA) or Trading Standards.

If a child is found entangled in a cord and is unresponsive, call 999 immediately and start CPR if the child is not breathing.',
'safety', 3, ARRAY['blind-cord', 'strangulation', 'window-blind', 'home-safety', 'infant', 'toddler', 'prevention'], true, false),

('infant', 0,
'Safe Sleep Positions: Why Back, Firm Mattress, and No Pillows',
'The safest sleep position for all babies is on their back. This single change has saved thousands of lives.',
'Sudden Infant Death Syndrome (SIDS) — sometimes called cot death — is the sudden, unexplained death of a baby under 12 months who appears healthy. It is devastating and largely unexplained, but a number of evidence-based practices dramatically reduce the risk.

**The safest sleep position**

Always place your baby on their BACK to sleep, for every sleep, from birth. This single recommendation — introduced in the UK in the early 1990s as part of the ''Back to Sleep'' campaign — reduced SIDS rates by over 50% within a decade.

**Safe sleep environment**

- **Firm, flat mattress**: a firm, new or near-new mattress that fits the cot or Moses basket without gaps; never soft mattresses, memory foam, or waterbeds
- **No pillows, duvets, or bumpers**: these can cause overheating or obstruct the airway; a firm, flat sleeping surface with a well-fitting sheet is all that is needed
- **Feet to foot position**: place baby with their feet at the foot of the cot so they cannot wriggle under any covering
- **Light covering**: one or two cellular cotton blankets tucked in firmly; sleeping bags with the correct tog for the room temperature are a safe alternative
- **No soft toys in the cot** during sleep in the first 12 months
- **Room temperature**: 16–20°C is the recommended sleep temperature for babies; use a room thermometer

**Other risk-reduction measures**

- Never smoke in the home or car
- Never share a bed with your baby if you or your partner smoke, have consumed alcohol or sedating drugs, or are very tired
- The safest place for a baby to sleep is in a cot or Moses basket in the same room as a caregiver for the first 6 months
- Breastfeeding reduces the risk of SIDS
- A dummy (pacifier) at the start of sleep after breastfeeding is established has been associated with reduced SIDS risk — though the mechanism is unknown

**Tummy time**

Supervised tummy time when your baby is awake and you are watching is important for development. The ''back to sleep, tummy to play'' message is the standard guidance.

If you find your baby in an unresponsive state, call 999 immediately. Contact your midwife or health visitor for any questions about safe sleep.',
'health', 5, ARRAY['safe-sleep', 'SIDS', 'cot-death', 'back-to-sleep', 'firm-mattress', 'newborn', 'sleep-safety'], true, false),

('infant', 24,
'Water Safety at Swimming: Age, Flotation Devices, and Supervision',
'Swimming with your baby is a joy and a great bonding activity — with the right safety knowledge.',
'Taking your baby swimming is a wonderful activity that builds water confidence, promotes physical development, and is enjoyable for both parent and baby. It also requires clear-headed safety awareness.

**When can babies start swimming?**

There is no minimum age — your baby can go to a pool at any time after birth. Many pools ask that babies under 6 weeks have their newborn check first. The NHS advises waiting until your baby has had their first set of vaccines (8 weeks) if you want extra peace of mind, but this is not a hard medical requirement for healthy babies.

**Water temperature**

Babies under 3 months should swim in pools heated to at least 32°C. Most leisure pools run at 30–32°C. Cold water causes rapid heat loss in infants — keep swim sessions to 10–20 minutes for babies under 3 months.

**Flotation devices — what is safe and what is not**

- **Swim nappies** (reusable or disposable): essential — standard nappies expand catastrophically in water. All babies should wear a swim nappy
- **Armbands and rubber rings**: are NOT life-saving devices. They are play aids only and can deflate, slip off, or tip the child face-down
- **Rigid baby swim seats**: not recommended — they can tip forward easily and give a false sense of security
- **Parent contact**: for babies and toddlers, the safest ''flotation device'' is a parent''s arms. Keep physical contact at all times in the water

**Supervision rules**

- Never leave a baby or toddler unattended in or near a pool — this includes poolside while you answer your phone
- Always be within arm''s reach
- Drowning in supervised settings often happens during momentary lapses in attention

**After swimming**

- Dry and warm your baby quickly after the session
- Feed well — swimming burns energy and stimulates appetite
- Check ears: repeated swimming exposure can contribute to ear infections; dry ears gently with a towel after swimming

If your child is ever unresponsive in or near water, call 999 immediately and begin CPR if they are not breathing.',
'safety', 4, ARRAY['swimming', 'water-safety', 'infant', 'toddler', 'flotation', 'supervision', 'swim-nappy'], true, false),

-- ─────────────────────────────────────────────────────────────────────────────
-- MENTAL HEALTH SIGNALS
-- ─────────────────────────────────────────────────────────────────────────────

('postpartum', 1,
'Postnatal Depression: Symptoms, Getting Help, and You Are Not Alone',
'Postnatal depression affects 1 in 10 new mothers — and a significant number of fathers and partners. It is treatable, and asking for help is the bravest thing you can do.',
'Postnatal depression (PND) is a type of depression that can develop in the weeks and months following the birth of a baby. It is not a sign of weakness, failure, or bad parenting. It is a medical condition — as real and as treatable as a broken bone.

**How is PND different from the ''baby blues''?**

The baby blues are a short-lived emotional dip that affects up to 80% of new mothers, typically starting 3–5 days after birth and resolving within two weeks. It involves tearfulness, mood swings, and feeling overwhelmed — but it passes.

PND is different in intensity and duration. It persists beyond 2 weeks and significantly affects daily functioning.

**Symptoms of postnatal depression**

PND can look different in different people, but commonly includes:
- Persistent low mood or sadness that doesn''t lift
- Loss of interest in things you used to enjoy, including your baby
- Exhaustion beyond ordinary new-parent tiredness
- Difficulty bonding with your baby — feeling emotionally detached or numb
- Irritability, anger, or resentment (often underrecognised as PND)
- Anxiety, worry, or panic attacks
- Difficulty sleeping even when the baby sleeps
- Negative thoughts about yourself — guilt, worthlessness, being a bad parent
- In severe cases: thoughts of self-harm or harming the baby

**PND in fathers and partners**

PND in fathers affects approximately 1 in 10 men. It often presents as irritability, overworking, withdrawal, and substance use rather than sadness. It is underdiagnosed and undertreated.

**Getting help**

- Talk to your GP, midwife, or health visitor — they will not judge you and they will not take your baby away
- Your GP can prescribe antidepressants that are safe to take while breastfeeding
- Talking therapies (CBT, interpersonal therapy) are effective and available on the NHS — ask about IAPT referral
- PANDAS Foundation UK (pandasfoundation.org.uk) offers peer support
- The Samaritans (116 123) are available 24/7 if you need to talk

If you have thoughts of harming yourself or your baby, call 999, go to A&E, or call the crisis line at your community mental health team. You are not alone, and this gets better with the right support.',
'mental-health', 5, ARRAY['postnatal-depression', 'PND', 'mental-health', 'postpartum', 'new-parent', 'support', 'treatment'], true, true),

('postpartum', 1,
'Postnatal Anxiety: The Worried Parent Pattern',
'Postnatal anxiety is as common as postnatal depression — and far less talked about. You deserve support for this too.',
'Anxiety is the most common mental health difficulty following childbirth. Yet while postnatal depression receives significant attention, postnatal anxiety is far less discussed. Many parents are left feeling that their constant worry is just a normal part of parenthood — not recognising it as something that can and should be treated.

**What postnatal anxiety looks like**

- Constant, hard-to-control worry about the baby''s health, breathing, or safety
- Repeatedly checking that the baby is breathing at night (multiple times per hour)
- Intrusive ''what if'' thoughts that cannot be switched off
- Avoiding certain situations out of fear (not going out in case the baby gets cold, never leaving the baby with others)
- Physical symptoms: racing heart, tightness in the chest, breathlessness, nausea, dizziness
- Difficulty sleeping even when exhausted — mind racing
- Snapping at your partner over perceived risks to the baby
- Seeking excessive reassurance from health professionals, friends, or the internet — but never feeling truly reassured

**Is some worry normal?**

Yes. Being more cautious and alert as a new parent is adaptive — it evolved to protect babies. The difference is degree and impairment. If the anxiety is affecting your sleep, your relationships, your ability to enjoy parenthood, or your daily functioning, it deserves the same attention as any other condition.

**Risk factors**

- History of anxiety, OCD, or depression before pregnancy
- Traumatic birth experience
- Baby with health complications or time in NICU
- Lack of social support
- History of miscarriage or pregnancy loss

**Getting support**

- Speak to your GP, midwife, or health visitor — be specific about the symptoms
- CBT-based therapy (available through IAPT on the NHS) is highly effective for postnatal anxiety
- Some SSRIs are safe during breastfeeding — your GP can advise
- Breathing techniques and grounding exercises can provide immediate relief while awaiting therapy

If anxiety is severe, or you are having panic attacks that prevent you caring for your baby, contact your GP same day. If you are in crisis, call 999 or the Samaritans on 116 123.',
'mental-health', 4, ARRAY['postnatal-anxiety', 'PNA', 'worry', 'mental-health', 'postpartum', 'CBT', 'new-parent'], true, true),

('postpartum', 1,
'Intrusive Thoughts in New Parents: How Common They Are',
'Disturbing thoughts about something happening to your baby are experienced by the vast majority of new parents. They do not make you a bad person.',
'One of the least discussed — and most distressing — experiences of new parenthood is intrusive thoughts. These are unwanted, involuntary thoughts or mental images, often involving harm coming to the baby. They can be shocking in their specificity and violence, and they trigger enormous shame and guilt.

**What intrusive thoughts look like**

Examples might include:
- A sudden image of dropping the baby
- A thought of what would happen if the baby was left in the bath
- An unwanted mental image of the baby being harmed
- A fleeting thought of intentionally hurting the baby
- Fear of losing control

**The most important thing to know**

Up to 90% of new parents — mothers and fathers — experience intrusive thoughts in the early postpartum period. They are overwhelmingly more common than most people believe, because almost no one talks about them.

Having an intrusive thought does not mean you want to act on it. In fact, the distress they cause is precisely because they are so contrary to how you feel about your baby. The thought is ego-dystonic — it goes against who you are, which is why it horrifies you.

**When are intrusive thoughts part of normal adjustment?**

Most intrusive thoughts in new parents are a feature of a hypervigilant, protective mind. They tend to reduce in frequency and intensity as confidence grows.

**When do they become a clinical concern?**

Intrusive thoughts become a significant concern when:
- They are persistent and consuming most of your thinking time
- They feel like urges rather than unwanted thoughts (rare but important distinction)
- They are accompanied by compulsive behaviours (hiding sharp objects, refusing to be alone with the baby)
- They are causing significant distress or impairment
- They are part of a wider picture of OCD, PTSD, or psychosis

**If you''re experiencing thoughts like these**

- Tell your GP, midwife, or health visitor honestly — this will not lead to your baby being removed; it will lead to you getting help
- CBT and ERP (Exposure and Response Prevention) therapy are highly effective
- PANDAS Foundation and Mind both have resources for this

If you are experiencing thoughts that feel like urges to harm your baby, or if you hear voices or have unusual beliefs, contact your GP urgently or go to A&E. You deserve support without shame.',
'mental-health', 4, ARRAY['intrusive-thoughts', 'postpartum', 'OCD', 'mental-health', 'new-parent', 'anxiety', 'normalising'], true, true);
