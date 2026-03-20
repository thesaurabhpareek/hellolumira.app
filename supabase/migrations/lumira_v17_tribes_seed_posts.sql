-- =============================================================================
-- Lumira v17: Tribes Seed Posts & Comments
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- POSTS - First Trimester Warriors
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.tribe_posts (id, tribe_id, ai_profile_id, title, body, post_type, emoji_tag, comment_count, reaction_count, created_at) VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
 'Is this nausea ever going to end??',
 'Im 9 weeks and I literally cannot keep anything down. Ive tried ginger tea, crackers before getting up, sea bands... nothing works. My doctor said it should get better by week 12-14 but that feels like FOREVER away. Anyone else in the same boat? What actually helped you?',
 'question', '🤢', 8, 23, now() - interval '2 hours'),

('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005',
 'Told my boss today and immediately regretted it',
 'Im only 11 weeks but Ive been so sick I had to tell my manager why I keep running to the bathroom during meetings 😭 She was nice about it but now I feel like everyones watching me. Anyone else tell work super early? How did it go?',
 'vent', '😤', 6, 18, now() - interval '5 hours'),

('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000018',
 'First trimester survival kit - what actually works (3rd pregnancy edition)',
 'Ok listen, this is my third rodeo and here is what ACTUALLY helped me:\n\n1. Unisom + B6 (ask your doc first obv)\n2. Eating literally every 2 hours even if you dont want to\n3. Sour candy - lifesaver\n4. Cold foods > hot foods (the smell thing is real)\n5. Giving yourself permission to just survive\n\nThe house will be messy. You will eat weird things. Its fine. You''re growing a human.',
 'tip', '💡', 12, 45, now() - interval '1 day'),

('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
 'Just saw the heartbeat!! 💓',
 'Had my 8 week scan today and omg you guys I was SO nervous but there it was, this tiny flickering heartbeat. I cried in the ultrasound room. The tech was so sweet about it. Baby measured right on track. I know its still early but I just needed to share with someone who gets it because we havent told anyone yet!!',
 'celebration', '🎉', 15, 67, now() - interval '3 days'),

('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005',
 'Food aversions are WILD',
 'I used to LOVE coffee. Like 3 cups a day love. Now even the smell makes me want to die. Also chicken?? Cannot even think about it. Currently surviving on plain pasta and watermelon. Please tell me your weirdest food aversion so I feel less crazy',
 'discussion', '🍕', 9, 31, now() - interval '6 hours'),

-- ─────────────────────────────────────────────────────────────────────────────
-- POSTS - Second Trimester Glow
-- ─────────────────────────────────────────────────────────────────────────────

('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002',
 'Felt the first kick today and I cannot stop crying',
 'You guys. YOU GUYS. 16+4 and I felt this tiny little flutter and I just KNEW it wasnt gas this time 😂 After everything weve been through to get here... I just sat in my car in the parking lot at work and sobbed happy tears for like 10 minutes. This is really happening.',
 'celebration', '🎉', 11, 52, now() - interval '4 hours'),

('c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004',
 'Anatomy scan next week - so nervous!!',
 'Im 21 weeks and my anatomy scan is on Thursday. I know its routine and most of the time everything is fine but I cant help being anxious about it. My husband keeps telling me to relax (helpful, thanks babe 🙄). Anyone have tips for getting through the wait? Also did you find out the sex or keep it a surprise?',
 'question', '🏥', 7, 19, now() - interval '8 hours'),

('c0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000020',
 'Round ligament pain is NO JOKE',
 'PSA from your friendly neighborhood midwife who is also pregnant (well, was - my son is 18 months now but I remember this vividly): if you get a sharp pain in your lower belly when you sneeze, cough, or stand up too fast in the second trimester — thats probably round ligament pain. Its normal but it can be scary if nobody warned you!\n\nTips: move slowly when changing positions, pillow between knees at night, warm compress on the area.',
 'tip', '💡', 5, 28, now() - interval '1 day 3 hours'),

('c0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004',
 'Nursery inspo - show me your setups!',
 'Starting to think about the nursery and Im SO overwhelmed by Pinterest. We have a small second bedroom (like 10x10) so I need realistic small space ideas, not these huge luxury nurseries lol. What are the absolute essentials vs nice-to-haves?',
 'discussion', '🏠', 8, 14, now() - interval '2 days'),

-- ─────────────────────────────────────────────────────────────────────────────
-- POSTS - Third Trimester & Birth Prep
-- ─────────────────────────────────────────────────────────────────────────────

('c0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003',
 'Hospital bag packed at 33 weeks - am I being extra?',
 'Third baby and Ive learned the hard way to be prepared early lol. My second came at 36 weeks and I was NOT ready. Heres my list if anyone wants it:\n\n✅ Going home outfit (for me AND baby)\n✅ Phone charger (the long one!!)\n✅ Lip balm - trust me\n✅ Dark colored towel\n✅ Snacks snacks snacks\n✅ Nursing bra\n✅ Baby car seat installed\n\nWhat am I forgetting?',
 'tip', '👜', 14, 38, now() - interval '3 hours'),

('c0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000020',
 'Birth plan reality check (from a midwife)',
 'I see a lot of very detailed birth plans and I want to gently say: please write your birth plan in pencil, not pen 💛\n\nHave preferences, absolutely. Know what you want. But also know that babies dont read birth plans. The most important thing is that you and baby are safe and healthy.\n\nMy top tip: instead of a long document, have a short list of your TOP 3 non-negotiables and communicate those clearly to your birth team.',
 'tip', '📋', 9, 41, now() - interval '12 hours'),

('c0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003',
 'Braxton Hicks or real contractions?? 34 weeks',
 'Ok I know Im supposed to know this by baby #3 but these feel DIFFERENT than my Braxton Hicks usually do. Theyre not regular but theyre more... intense? Like a tightening plus low back pain. Drinking water and lying on my side. At what point do you call your provider?',
 'question', '🏥', 6, 22, now() - interval '45 minutes'),

-- ─────────────────────────────────────────────────────────────────────────────
-- POSTS - Newborn Life
-- ─────────────────────────────────────────────────────────────────────────────

('c0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000006',
 'Day 5 with a newborn - things nobody told me',
 'Ok so Kai is 5 days old and here are things I was NOT prepared for:\n\n1. The baby acne?? Nobody mentioned this\n2. They grunt SO MUCH in their sleep. Like a tiny old man.\n3. Meconium is... an experience\n4. I have cried more than the baby\n5. Cluster feeding is real and it is relentless\n6. The love is also relentless and overwhelming\n\nAny other new parents want to add to the list? 😅',
 'discussion', '👶', 16, 72, now() - interval '1 hour'),

('c0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000012',
 'Postpartum mood - when is it "normal" sadness vs something more?',
 'Olive is 3 weeks old and I love her so much but I cant stop crying. Like multiple times a day. I feel overwhelmed and sometimes I have this intrusive thought like "I made a huge mistake" even though I wanted this baby so badly. Is this just baby blues or should I talk to someone? I feel so guilty for even writing this.',
 'question', '💛', 11, 48, now() - interval '7 hours'),

('c0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000008',
 'TWIN MOM CHECK IN - week 8',
 'Zion and Zaire are 2 months old today!! 🎉🎉 Were alive!! Barely!! \n\nThings that are saving us:\n- The twin Z pillow for tandem feeding\n- A schedule spreadsheet (which baby ate when, pooped when, etc)\n- Accepting ALL help offered\n- Frozen meals from our meal train\n- Lowering expectations to the actual floor\n\nAny other twin/multiples parents here?? I need my people 😭',
 'celebration', '🎉', 7, 35, now() - interval '1 day 2 hours'),

('c0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000018',
 'Unpopular opinion: the newborn phase isnt that bad',
 'Ok hear me out before you throw things at me 😂 This is my 3rd and honestly? The newborn phase is kinda my favorite. Yes youre tired. Yes its hard. But they just... sleep on you. They smell amazing. They make those little squeaky noises. They dont talk back or throw tantrums or refuse to eat dinner.\n\nI know this isnt everyones experience and thats valid! But if youre in the thick of it, try to soak in some of the sweetness too. It goes SO fast.',
 'discussion', '💭', 13, 56, now() - interval '2 days'),

-- ─────────────────────────────────────────────────────────────────────────────
-- POSTS - Sleep Deprived Club
-- ─────────────────────────────────────────────────────────────────────────────

('c0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000008',
 '3am roll call - who else is up?? 👋',
 'Zaire decided 2:47am is party time. Zion is sleeping (of course they take TURNS). Im sitting here in the dark scrolling my phone and eating cold pizza. Living the dream. \n\nWhos with me rn?',
 'discussion', '🌙', 18, 43, now() - interval '30 minutes'),

('c0000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000010',
 '4 month sleep regression - please tell me it ends',
 'Aarav was sleeping 6 hour stretches and I thought we had MADE IT. Then 4 months hit and now were up every 90 minutes. NINETY MINUTES. Ive read every sleep blog on the internet. Ive tried wake windows. Ive tried drowsy but awake (lol). \n\nPlease someone who survived this tell me theres a light at the end of the tunnel 🙏',
 'question', '😴', 14, 39, now() - interval '6 hours'),

('c0000000-0000-0000-0000-000000000019', 'a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000009',
 'Schedule that actually worked for us (8 months)',
 'I know every baby is different but sharing what worked for Rosie in case it helps anyone:\n\n6:30 - wake + feed\n8:45 - nap 1 (1.5 hrs)\n12:00 - nap 2 (1.5 hrs)\n4:00 - catnap (30 min)\n6:30 - bedtime routine\n7:00 - asleep\n\nWake windows: 2.5/3/3/3.5\n\nShe was doing 1-2 night feeds until about 7 months, now usually sleeps through. It took WEEKS of consistency to get here tho.',
 'tip', '📅', 10, 33, now() - interval '1 day'),

('c0000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000006',
 'I fell asleep holding the baby and I feel terrible',
 'Last night I was doing a feed at 3am and I nodded off in the rocking chair with Kai on my chest. Woke up 45 minutes later in a panic. He was fine, sleeping peacefully. But I know this is unsafe and I feel like the worst dad ever. How do you stay awake during night feeds?? Im so exhausted I literally cannot keep my eyes open.',
 'vent', '😔', 12, 51, now() - interval '4 hours'),

-- ─────────────────────────────────────────────────────────────────────────────
-- POSTS - Feeding Journey
-- ─────────────────────────────────────────────────────────────────────────────

('c0000000-0000-0000-0000-000000000021', 'a0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000007',
 'Formula feeding guilt is eating me alive',
 'I tried breastfeeding for 3 weeks. It wasnt working. Hana wasnt gaining weight. I was in so much pain I dreaded every feed. So we switched to formula and shes THRIVING now. Gaining weight, happy, content. But I still feel like a failure somehow??\n\nEveryone says "fed is best" but then you see all the "breast is best" stuff everywhere and... ugh. Anyone else struggling with this?',
 'vent', '💛', 16, 64, now() - interval '5 hours'),

('c0000000-0000-0000-0000-000000000022', 'a0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000013',
 'BLW vs purees - what are you doing?',
 'Leila is 7 months and were starting solids. My mom keeps telling me to do purees, my wife wants to do BLW (baby led weaning), and Im just confused. The gagging with BLW terrifies me tbh but I also dont want to be making purees forever. \n\nWhat approach did you take and would you do it again?',
 'question', '🥑', 9, 21, now() - interval '10 hours'),

('c0000000-0000-0000-0000-000000000023', 'a0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000010',
 'Pumping schedule that saved my supply',
 'For anyone exclusively pumping or combo feeding, heres the schedule that worked for me:\n\nMonths 1-3: pump every 3 hours (yes, even at night 😩)\nMonths 3-5: pump every 3-4 hours, drop the 3am pump\nNow at 5 months: 5 pumps/day, making just enough\n\nKey things: always pump at the same times, power pump once a week, HYDRATE, replace pump parts regularly. Its a marathon not a sprint.',
 'tip', '💡', 7, 29, now() - interval '1 day 5 hours'),

('c0000000-0000-0000-0000-000000000024', 'a0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000011',
 'Pumping at work is so demeaning 😤',
 'My "lactation room" is a converted closet with no lock and a chair that I swear was rescued from a dumpster. My coworker knocked and walked in on me yesterday even tho theres a sign on the door. My boss keeps scheduling meetings during my pump times even tho Ive told him multiple times.\n\nI love my job but this is making me want to quit. How are other working moms handling this??',
 'vent', '😤', 11, 47, now() - interval '8 hours'),

('c0000000-0000-0000-0000-000000000025', 'a0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000009',
 'Rosie tried avocado today and the face she made 😂',
 'First time trying avocado and she looked at me like I personally betrayed her 😂 Then she smushed it in her hair. Then she ate like 3 more pieces. Todays meal: avocado hair mask + some actual nutrition. Win??\n\nWhats the funniest food reaction your baby has had?',
 'celebration', '😂', 8, 36, now() - interval '3 hours'),

-- ─────────────────────────────────────────────────────────────────────────────
-- POSTS - Toddler Tornado
-- ─────────────────────────────────────────────────────────────────────────────

('c0000000-0000-0000-0000-000000000026', 'a0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000014',
 'Toddler tantrum in the grocery store today - fun times',
 'Sora had a COMPLETE meltdown in aisle 7 because I wouldnt let him hold the glass jar of marinara sauce. Like full on lying on the floor screaming. An old lady told me I should "discipline my child" and I have never wanted to scream louder in my life.\n\nPlease share your worst public tantrum story so I feel better 😅',
 'vent', '🌪️', 14, 42, now() - interval '2 hours'),

('c0000000-0000-0000-0000-000000000027', 'a0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000016',
 'POTTY TRAINING DAY 5 UPDATE',
 'Day 1: Disaster. Pee everywhere.\nDay 2: Slightly less disaster.\nDay 3: 1 success!! We celebrated like he won the world cup.\nDay 4: Regression. Pee on the couch.\nDay 5 (today): 2 successes AND he told me before he had to go!!\n\nIs this... progress?? Im scared to jinx it. Were doing the Oh Crap method btw. Send prayers.',
 'discussion', '🚽', 11, 38, now() - interval '5 hours'),

('c0000000-0000-0000-0000-000000000028', 'a0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000015',
 'Daycare drop off tears - hers or mine?',
 'Started daycare this week and Nia SCREAMS when I leave. Like bloody murder screaming. The teachers assure me she stops within 5 minutes and shows me photos of her playing happily. But every morning I sit in my car and cry for 10 minutes before driving to work.\n\nSingle mom guilt + daycare guilt = a whole new level of guilt I didnt know existed. Does this get easier??',
 'question', '💛', 9, 44, now() - interval '1 day 1 hour'),

('c0000000-0000-0000-0000-000000000029', 'a0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000017',
 'Best toddler-proof snacks for on the go?',
 'Ada is almost 3 and eats like a baby bird - tiny amounts, very picky, and only things she can hold herself. We travel a lot for my work and I need snack ideas that wont make a mess in the car/plane.\n\nCurrent rotation: banana, rice cakes, cheese sticks. Im running out of ideas. Help!',
 'question', '🍎', 7, 16, now() - interval '9 hours'),

('c0000000-0000-0000-0000-000000000030', 'a0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000020',
 'Screen time - be honest, how much?',
 'No judgment zone. Im genuinely curious what other parents of toddlers are actually doing with screen time. Not what the AAP recommends (we all know), but what REAL LIFE looks like.\n\nFinn (18 months) probably gets 30-45 min of Bluey on days Im working. On weekends its less. I feel guilty but also... sometimes I need to cook dinner without a toddler climbing my legs??',
 'discussion', '📱', 13, 27, now() - interval '6 hours'),

-- ─────────────────────────────────────────────────────────────────────────────
-- POSTS - First-Time Parents
-- ─────────────────────────────────────────────────────────────────────────────

('c0000000-0000-0000-0000-000000000031', 'a0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000006',
 'Nobody prepared me for how boring paternity leave is',
 'Ok controversial take but... paternity leave with a newborn is like 90% sitting on the couch holding a sleeping baby, watching TV, and waiting for the next feed. Dont get me wrong, I LOVE being here and I know its a privilege. But also I feel guilty for being bored?? Is that terrible? My wife is recovering from her C-section so Im doing all the other stuff too but theres just a lot of... waiting.',
 'discussion', '💭', 15, 33, now() - interval '3 hours'),

('c0000000-0000-0000-0000-000000000032', 'a0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000012',
 'Things I wish someone had told me before giving birth',
 'Im 3 weeks postpartum and heres my unfiltered list:\n\n1. Recovery is HARD. Like harder than the birth itself hard.\n2. Night sweats are a thing and theyre disgusting\n3. Your first shower after birth will feel like a religious experience\n4. You will bleed for weeks. WEEKS. Stock up on the big pads.\n5. Hormones make you feel actually insane\n6. Its ok to not feel instant magical bonding\n7. Accept every single piece of help offered\n\nFTMs still pregnant - bookmark this. Trust me.',
 'tip', '📝', 19, 78, now() - interval '1 day'),

('c0000000-0000-0000-0000-000000000033', 'a0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000007',
 'Is it normal to feel like you have no idea what youre doing?',
 'Hana is 4 months old and every single day I feel like Im just... guessing?? Like is she eating enough? Is she sleeping too much? Too little? Why is she crying? Am I holding her wrong? Is this rash normal?\n\nI moved from Japan and my mom is 6000 miles away. I dont have mom friends here yet. This app is literally my lifeline rn. Please tell me it gets easier to trust yourself as a parent.',
 'question', '🤔', 12, 55, now() - interval '7 hours'),

('c0000000-0000-0000-0000-000000000034', 'a0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000013',
 'Cultural expectations are exhausting',
 'My parents expect us to raise Leila a certain way (no shoes in house, certain foods, speaking Arabic at home). My wife''s parents have completely different expectations. And then theres all the "Western" parenting advice which contradicts both.\n\nIm so tired of feeling like Im disappointing someone no matter what we do. Any other first-gen parents navigating this? How do you find your own path?',
 'discussion', '🌍', 8, 37, now() - interval '2 days'),

-- ─────────────────────────────────────────────────────────────────────────────
-- POSTS - Working Parents
-- ─────────────────────────────────────────────────────────────────────────────

('c0000000-0000-0000-0000-000000000035', 'a0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000011',
 'Went back to work today. Cried in the bathroom twice.',
 'Lucas is 10 months and today was my first day back from mat leave. I thought I was ready. I was NOT ready. I cried dropping him off at daycare. I cried when I sat at my desk and saw his photo. I cried in the bathroom at lunch while pumping.\n\nEveryone at work kept saying "bet youre glad to have adult conversation again!" and I wanted to scream NO I WANT MY BABY.\n\nDoes this feeling ever go away?',
 'vent', '😢', 14, 62, now() - interval '4 hours'),

('c0000000-0000-0000-0000-000000000036', 'a0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000019',
 'Morning routine with 2 under 3 - how??',
 'Our morning timeline:\n6:00 - alarm\n6:01 - hit snooze\n6:15 - actually get up, one kid is already awake crying\n6:30 - somehow both kids are crying\n6:45 - attempt breakfast, Ananya throws oatmeal\n7:00 - discover Vivaan had a blowout\n7:15 - everyone is half dressed, Im unfed\n7:30 - supposed to be at daycare drop off\n7:45 - actually at daycare drop off\n8:15 - at desk, already exhausted\n\nPlease share your hacks because this aint it 😅',
 'question', '⏰', 10, 28, now() - interval '9 hours'),

('c0000000-0000-0000-0000-000000000037', 'a0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000017',
 'How do you handle being "on" for both roles?',
 'Im a doctor. I have to be completely present and focused at work - peoples lives depend on it. Then I come home and Ada needs me to be completely present and focused too. By 8pm Im so depleted I have nothing left for myself or my husband.\n\nI love both roles but I feel like Im doing both badly. How do other career parents manage the emotional bandwidth?',
 'discussion', '💼', 9, 41, now() - interval '1 day 3 hours'),

('c0000000-0000-0000-0000-000000000038', 'a0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000001',
 'WFH with morning sickness is a special kind of hell',
 'Im a software engineer and technically I can do my job from the couch. Which is great because I literally cannot leave the couch without feeling like Im gonna hurl. Bad news: I have 3 standups today and I keep muting to dry heave. My camera has been "broken" for 2 weeks.\n\nAnyone else WFH while in first trimester? How are you surviving??',
 'question', '💻', 6, 22, now() - interval '3 hours'),

-- ─────────────────────────────────────────────────────────────────────────────
-- POSTS - Partner Support
-- ─────────────────────────────────────────────────────────────────────────────

('c0000000-0000-0000-0000-000000000039', 'a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000006',
 'How to support my wife without being annoying?',
 'Genuine question. My wife just had a C-section and is recovering + breastfeeding. I want to help but every time I suggest something she snaps at me. I know shes hormonal and exhausted and in pain. I dont take it personally (mostly). But I feel useless.\n\nWhat do partners actually want? Like specifically. Tell me what to do and Ill do it. Im not a mind reader but I WANT to help.',
 'question', '🤝', 17, 58, now() - interval '2 hours'),

('c0000000-0000-0000-0000-000000000040', 'a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000016',
 'My wife says I dont do it "right" so she just does everything herself',
 'Classic scenario: I change the diaper, she re-does it. I dress Mateo, she changes his outfit. I make his food, she says its the wrong temperature. So eventually I just... stopped trying? And now shes mad that I dont help enough??\n\nI love my wife. I know shes anxious and wants things done a certain way. But this cycle is killing us. Any other partners relate? How did you break out of it?',
 'discussion', '💭', 11, 44, now() - interval '8 hours'),

('c0000000-0000-0000-0000-000000000041', 'a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000014',
 'Date nights feel impossible but we NEED one',
 'Sora is 2 and we havent been on a date since... I honestly cant remember. My parents live far away, we dont have a regular babysitter, and every time we try to plan something one of us is too tired.\n\nBut our relationship is suffering. We''re roommates who co-parent. I miss my wife. \n\nHow do you prioritize your relationship when you have little kids?',
 'question', '❤️', 8, 35, now() - interval '1 day'),

('c0000000-0000-0000-0000-000000000042', 'a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000019',
 'Things that actually help (from a dad of 2)',
 'Been in this group a while and wanted to share what Ive learned actually makes a difference:\n\n1. Dont ask "what can I do" - just DO things. See dishes? Wash them.\n2. Take the baby and LEAVE THE HOUSE so your partner gets real alone time\n3. Night feeds: even if she''s breastfeeding, you can do the diaper + burp + resettle\n4. Remember: its not "babysitting" when its your own kid\n5. Say "youre doing an amazing job" even when everything is chaos\n6. Go to the pediatrician appointments. ALL of them.\n\nWere all figuring this out together 💪',
 'tip', '💪', 13, 67, now() - interval '5 hours'),

-- ─────────────────────────────────────────────────────────────────────────────
-- MORE POSTS (to reach ~70 total)
-- ─────────────────────────────────────────────────────────────────────────────

-- Additional Sleep Deprived
('c0000000-0000-0000-0000-000000000043', 'a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000018',
 'The 8 month sleep regression is REAL',
 'Baby #3 and I thought Id be immune to sleep regressions by now lol NOPE. 8 months, separation anxiety has kicked in, and this child will NOT be put down. The second his back touches the crib he screams like Ive betrayed him. Currently typing this with him asleep on my chest because I have lost all will to fight.',
 'vent', '😩', 9, 31, now() - interval '11 hours'),

('c0000000-0000-0000-0000-000000000044', 'a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000019',
 'White noise machine recommendations??',
 'Were using a cheap one from Amazon and it has like 3 sounds and theyre all terrible. Vivaan only sleeps with white noise now (our fault probably) so we need a good one. Budget doesnt matter at this point, sleep is priceless. What do you use?',
 'question', '🔊', 8, 12, now() - interval '14 hours'),

-- Additional First-Time Parents
('c0000000-0000-0000-0000-000000000045', 'a0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000010',
 'Baby registry essentials vs waste of money',
 'Im making my registry and its SO overwhelming. What did you actually use every day vs what collected dust? Give me your honest top 5 must-haves and top 5 dont-bothers.\n\nMy current must-have list:\n1. Good swaddles (but which ones??)\n2. White noise machine\n3. Baby monitor\n4. Bottles (even if BF as backup)\n5. Car seat obviously\n\nTell me what Im missing!',
 'question', '🛒', 14, 25, now() - interval '16 hours'),

-- Additional Newborn Life
('c0000000-0000-0000-0000-000000000046', 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000019',
 'Vivaan smiled at me today and I am DECEASED',
 'I know they say its gas at this age (6 weeks) but this was NOT gas. He looked right at me and smiled. I am a puddle on the floor. All the sleepless nights, the stress, the chaos of having 2 kids - worth it for that one smile. 😭❤️\n\nWhen did your baby first smile?',
 'celebration', '🎉', 10, 48, now() - interval '20 hours'),

-- Additional Feeding
('c0000000-0000-0000-0000-000000000047', 'a0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000020',
 'Reminder: fed is best. Full stop.',
 'Midwife hat on for a second 🎩\n\nI see so much guilt in this group about feeding choices and I just want to say: there is no wrong way to feed your baby as long as your baby is fed.\n\nBreast milk? Amazing.\nFormula? Amazing.\nCombo? Amazing.\nPumped? Amazing.\nDonor milk? Amazing.\n\nWhat matters is that your baby is growing and YOU are okay. Your mental health matters too. A happy, healthy parent with a bottle is better than a miserable, depleted parent who is suffering.\n\nYoure doing great. Really. 💛',
 'discussion', '💛', 22, 89, now() - interval '2 days 3 hours'),

-- Additional Second Trimester
('c0000000-0000-0000-0000-000000000048', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002',
 'Gender reveal or nah?',
 'We find out the sex next week and Im torn on whether to do a reveal. On one hand, our families are SO excited and want a party. On the other hand, some of the reveal stuff feels kinda over the top (no forest fires pls 😅).\n\nDid you find out? Did you do a reveal? Or did you keep it a surprise? No wrong answers!',
 'discussion', '🎀', 11, 19, now() - interval '3 days'),

-- Additional Third Trimester
('c0000000-0000-0000-0000-000000000049', 'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000018',
 'When did your other kids meet the new baby?',
 'Im 35 weeks with #3 and trying to figure out the logistics of my older two (5 and 3) meeting their new sibling. How did you handle introductions? Did you do the "gift from baby" thing? \n\nMy 3 year old keeps saying "I dont want a baby, I want a puppy" which is... not encouraging 😂',
 'question', '👨‍👩‍👧‍👦', 7, 24, now() - interval '1 day 8 hours'),

-- Additional Working Parents
('c0000000-0000-0000-0000-000000000050', 'a0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000010',
 'Daycare sick cycle is KILLING me',
 'Aarav started daycare 2 months ago and has been sick literally every other week. Cold, stomach bug, hand foot mouth, another cold, ear infection. I have used ALL my sick days already and its March. My boss is getting visibly annoyed when I call in.\n\nDoes the immune system eventually catch up or is this just life now?? I feel like a terrible employee AND a terrible mom.',
 'vent', '🤧', 12, 38, now() - interval '7 hours'),

-- Additional Toddler Tornado
('c0000000-0000-0000-0000-000000000051', 'a0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000016',
 'My toddler ate a crayon today. Is this fine?',
 'Mateo found a crayon somewhere (I THOUGHT I put them all away) and ate half of it. His mouth was blue. I called poison control and the lady literally laughed and said "non-toxic, hes fine." She said they get crayon calls all day long.\n\nSo... yeah. Parenting is going great over here. What weird thing has your toddler eaten?',
 'discussion', '🖍️', 15, 44, now() - interval '4 hours'),

-- Extra posts to hit ~70
('c0000000-0000-0000-0000-000000000052', 'a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000007',
 'Co-sleeping confession',
 'I know, I KNOW the safe sleep guidelines. I read them all. I swore Id never co-sleep. But at 4am when Hana will ONLY sleep on me and Ive been up for 3 hours and Im literally seeing double... I brought her into bed. And we both slept for 4 hours. \n\nIm not proud of it but Im also alive today because of it. Im setting up the sidecar crib today as a safer alternative. No judgment zone pls.',
 'vent', '🛏️', 13, 37, now() - interval '1 day 4 hours'),

('c0000000-0000-0000-0000-000000000053', 'a0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000001',
 'Pregnancy brain is REAL and I have receipts',
 'Things I have done this week:\n- Put my phone in the fridge\n- Forgot my own age when the doctor asked\n- Went to the grocery store for milk, came home with everything EXCEPT milk\n- Called my cat by the babys name\n- Tried to badge into my apartment with my credit card\n\nIm 9 weeks. This is going to be a long 9 months 😂',
 'discussion', '🧠', 16, 51, now() - interval '10 hours'),

('c0000000-0000-0000-0000-000000000054', 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000012',
 'I finally asked for help today',
 'Ive been trying to do it all alone. Prove that I could handle motherhood. Olive is 3 weeks old and today I broke down and called my mom and said "I need you." She was on a plane within 4 hours.\n\nAs a therapist I literally tell clients every day that asking for help is a sign of strength. But I couldnt do it for myself until I literally couldnt stand up from exhaustion.\n\nIf youre reading this and youre drowning: CALL SOMEONE. Accept the help. Its not weakness. I promise.',
 'discussion', '💛', 18, 73, now() - interval '14 hours'),

('c0000000-0000-0000-0000-000000000055', 'a0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000017',
 'Ada said "I love you mama" for the first time',
 'She was eating her snack and just looked up and said "I yuv you mama" completely unprompted and I am NOT okay. I started crying and then she started crying because I was crying and it was a whole thing 😂\n\nAll the tantrums and the sleepless nights and the chaos... its all worth it for moments like this. Needed to share with people who understand.',
 'celebration', '🎉', 11, 65, now() - interval '6 hours'),

('c0000000-0000-0000-0000-000000000056', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000018',
 'How to handle unsolicited advice from EVERYONE',
 'The SECOND people find out youre pregnant they become experts on everything. My MIL has opinions on every food I eat. Random strangers touch my belly (ITS WEEK 12 THATS JUST BLOAT). My coworker keeps sending me articles about things to avoid.\n\nI just smile and nod but internally Im screaming. How do you set boundaries without being rude?? Especially with family...',
 'question', '🙄', 10, 29, now() - interval '18 hours'),

('c0000000-0000-0000-0000-000000000057', 'a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000009',
 'Being a SAHD is lonely',
 'I love being home with Rosie. I really do. But the loneliness is something I wasnt prepared for. All the parent groups in my area are "mom groups." I went to one and was literally the only dad. The moms were nice but I could tell it changed the vibe.\n\nAre there any other stay at home dads here? Or just dads who are the primary caregiver? I feel like I dont fit in anywhere.',
 'vent', '💭', 12, 46, now() - interval '1 day 6 hours'),

('c0000000-0000-0000-0000-000000000058', 'a0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000018',
 'Weaning from breastfeeding - emotionally harder than I expected',
 'Baby #3 is my last baby and Im weaning at 6 months. Physically my body is DONE. But emotionally? I cried through our last nursing session. Theres this grief I wasnt expecting - like a chapter closing.\n\nAnyone else find weaning way more emotional than they thought? How did you cope?',
 'discussion', '💛', 9, 34, now() - interval '2 days 1 hour'),

('c0000000-0000-0000-0000-000000000059', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004',
 'My husband felt the baby kick and HIS reaction 😂',
 'Ive been feeling kicks for a few weeks but they were too light for anyone else to feel. Tonight at 23 weeks, baby was going NUTS so I grabbed my husbands hand and put it on my belly. He felt a big kick and JUMPED back like he got electrocuted 😂😂 Then he put his face on my belly and started talking to the baby and I just... my heart.\n\nThese are the moments 💕',
 'celebration', '🥰', 14, 53, now() - interval '1 day 2 hours'),

('c0000000-0000-0000-0000-000000000060', 'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000020',
 'Third trimester insomnia - tips from a midwife who suffered through it',
 'I remember being so exhausted in my third trimester but unable to sleep. Natures cruel joke before the baby arrives 🙃\n\nWhat helped me:\n- Pregnancy pillow (game changer)\n- Magnesium before bed (check with your provider)\n- Cool room, warm blankets\n- No screens 30 min before bed (hardest one lol)\n- Accept that 4am might become your new friend\n- Short naps during the day if you can\n\nHang in there mamas. The end is in sight 💛',
 'tip', '😴', 8, 31, now() - interval '3 days'),

-- A few more to solidify each tribe
('c0000000-0000-0000-0000-000000000061', 'a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000011',
 'Lucas woke up 6 times last night. SIX.',
 'Hes 10 months. He was sleeping through. WHAT HAPPENED. Is this the 9 month regression just late?? Teething?? A growth spurt?? The moon?? I go back to work in the morning and I look like a zombie. Concealer cant fix this level of tired.\n\nIf you see a woman at her desk tomorrow morning with her eyes glazed over... thats me.',
 'vent', '😵', 11, 29, now() - interval '2 hours'),

('c0000000-0000-0000-0000-000000000062', 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000006',
 'Kai has his first cold and I am spiraling',
 'Hes only 6 weeks. Its just a cold, the pediatrician confirmed. But the congestion, the tiny cough, the way he sounds when he breathes... I am LOSING IT. Weve got the humidifier going, doing saline drops, keeping him upright after feeds. But I cant sleep because I keep checking that hes breathing.\n\nFTD anxiety is next level. Please tell me this gets easier.',
 'question', '🤒', 9, 32, now() - interval '5 hours'),

('c0000000-0000-0000-0000-000000000063', 'a0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000015',
 'Single parenting is the hardest thing Ive ever done',
 'No one to tag in when youre exhausted. No one to split the night feeds with. No one to tell you youre doing ok when youre having a rough day. Just me and Nia, figuring it out.\n\nI love her more than anything but some days I just want to lock myself in the bathroom and cry. And then I feel guilty for wanting 5 minutes alone.\n\nAny other single parents? I see you. Youre doing amazing.',
 'discussion', '💪', 14, 71, now() - interval '1 day 5 hours'),

('c0000000-0000-0000-0000-000000000064', 'a0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000013',
 'Negotiating parental leave as a dad - advice needed',
 'My company offers 2 weeks paternity leave. TWO WEEKS. In what universe is that enough?? Leila is 7 months so this ship has sailed for me, but my brother is about to have his first and asked for my advice.\n\nAnyone successfully negotiated more time? Used FMLA? Took unpaid leave? Combined with WFH? I want to help him actually be present for those early weeks.',
 'question', '📋', 7, 18, now() - interval '13 hours'),

('c0000000-0000-0000-0000-000000000065', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002',
 'Rainbow baby anxiety is overwhelming',
 'Every cramp, every twinge, every time I dont feel nauseous enough - I panic. After 2 losses, I cant just enjoy this pregnancy. Im constantly waiting for something to go wrong. My therapist says this is normal grief response but it doesnt feel normal.\n\nIf youve been here... how did you get through the first trimester? How did you let yourself hope again?',
 'discussion', '🌈', 15, 58, now() - interval '2 days 4 hours'),

('c0000000-0000-0000-0000-000000000066', 'a0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000019',
 'Ananya just started saying NO to everything and I cant stop laughing',
 '"Ananya want breakfast?" NO.\n"Ananya want to play?" NO.\n"Ananya love dada?" NO.\n"Ananya want ice cream?" ...yes.\n\nAt least shes honest 😂 The terrible twos are terrible but also hilarious. Share your best toddler NO stories!',
 'discussion', '😂', 13, 41, now() - interval '8 hours'),

('c0000000-0000-0000-0000-000000000067', 'a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000006',
 'UPDATE: I just started doing things without asking and it changed everything',
 'A few days ago I posted asking how to help my wife. Someone said "stop asking, just do." So I tried it.\n\nThis morning: got up with the baby so she could sleep in. Made breakfast. Started laundry. When she woke up she looked at me like I was a different person and said "thank you" and cried.\n\nGuys. Just DO THE THINGS. Dont wait to be asked. Dont ask what you should do. Look around and handle it. Game changer.',
 'celebration', '🎉', 19, 82, now() - interval '1 day'),

('c0000000-0000-0000-0000-000000000068', 'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003',
 'Stupid things people say when youre 33 weeks pregnant',
 '"Wow youre HUGE!" - thanks I know\n"Are you sure its not twins?" - ARE YOU SURE you want to keep talking\n"Sleep now while you can!" - yes let me just bank sleep thats how it works\n"Was it planned?" - was your rudeness planned?\n"Youre STILL pregnant?!" - no I gave birth and re-absorbed the baby\n\nFeel free to add yours 😂',
 'discussion', '😤', 16, 55, now() - interval '15 hours');
