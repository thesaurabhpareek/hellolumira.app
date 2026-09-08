# Lumira — "Letters" Product Requirements Document

**Nightly voice journaling in the parent's own voice**
Version 1.0 · September 2026 · Author: embedded product team (21 specialist agents + synthesis)
Status: Draft for founder review. Three decisions in §0.3 need Saurabh's sign-off before build.

---

## 0. Pre-PRD: sharpened framing, contradictions, risks

### 0.1 The idea, restated sharply

Not: "a journaling feature for Lumira."

**Lumira asks you one specific question every night — specific because it already knows your daughter is 41 weeks old and that you logged her first steps this afternoon — you answer out loud for ninety seconds, and it sets down what you said as a letter to her. In your words. The archive becomes a book she reads at eighteen.**

The differentiator is not the writing. It is **the question**. Every competitor sends the same prompt to every user. Lumira has check-ins, milestones, and chat history, so it can ask *"you logged her first steps this afternoon — tell me about the moment"* instead of *"how was your day?"* Structured data buys the right question, and the right question is what produces material worth keeping. The AI's job is interviewer first, writer second.

### 0.2 The biggest contradictions in the concept

| # | Contradiction | Resolution |
|---|---|---|
| 1 | **"Write in my own voice" vs. "AI writes it."** Few-shot style imitation is not authorship. Peer-reviewed evidence (§18.2) shows the penalty for AI-assisted relational writing survives disclosure, survives human editing, and survives personalization on the user's own writing. | Ship **two modes**, default to the honest one. See §0.3-A. |
| 2 | **"Remove all AI slop" vs. "let AI compose."** Slop is not only em dashes. The diagnostic tells are structural — the summarizing final paragraph, the sentimental register shift, uniform sentence length. Those are the model's core priors, not surface artifacts. | Deterministic post-processor for characters and counts (§16.4); prompt constraints for structure; accept a real ceiling (§17.5). |
| 3 | **"Ask what I could have done differently" vs. parent wellbeing.** This is an upward-counterfactual prompt aimed nightly at a population with ~13% postpartum depressive-symptom prevalence. Expressive-writing research documents a short-term *increase* in distress. | **Cut it.** See §0.3-B. Not reworded — cut. |
| 4 | **A keepsake for the child vs. a private diary for the parent.** The same entry may contain a partner conflict, a birth trauma, or an intrusive thought. | Three-layer model, child-facing layer **default off** (§18.3). |
| 5 | **"Audio never leaves your phone" vs. destroying the audio.** Deleting the recording is irreversible. Text is derivable from audio; audio is never derivable from text. The parent's actual voice may be the real keepsake. | Keep on-device transcription; add **opt-in local audio retention** (§0.3-C). |
| 6 | **Voice-first vs. the sleeping baby in the room.** The single most likely quit reason for this exact user is that speaking aloud wakes the baby or the partner. | Typed input is a **co-equal path**, not a fallback (§15.4). |

### 0.3 Three decisions that need the founder, before build

**A. Default composition mode.**

| Mode | What it does | Authenticity |
|---|---|---|
| **Keep my words** *(recommended default)* | Deterministic cleanup only. Removes filler, false starts, repetitions. Fixes STT errors. Adds paragraph breaks and a dateline. **Every sentence is one the parent actually said.** Near-zero AI. | Unambiguous. It is his. |
| **Shape it for me** *(opt-in, per entry)* | Full Claude composition per §17.4 — the transcript rewritten as prose in his style. | Style-matched. Not his sentences. |

The recommendation is that **Keep my words ships as the default**, with Shape it for me one tap away and toggleable per entry. Rationale: the artifact's entire value is evidentiary — it purports to be *who my father was at 33*. Rough, tired, fragmentary sentences are evidence of a real person; polished prose is evidence of a good model. The prediction is that Saurabh uses composition for two weeks, starts recognizing the model in his own letters, and switches permanently. Designing for that switch now is nearly free; discovering it after launch costs the premise.

**This contradicts the original framing and is the most important disagreement in this document.**

**B. Kill "what could you have done differently?"** The evidence against it is strong and specific (§6.3). Replace with *"What was hard today?"* — optional, second-tier, framed as naming rather than auditing, with no follow-up asking what they would change.

**C. Opt-in local audio retention.** Keep the privacy promise exactly as worded. Add a setting: *"Keep the recordings on this phone."* Audio stays on-device or in the user's own iCloud, never in Supabase. This costs a settings toggle and an export nudge, and it preserves the one artifact that cannot be reconstructed later.

### 0.4 Top product risks, ranked

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| 1 | **Nobody comes back on night two.** Median 30-day retention across 93 mental-health apps was 3.3%. That is the base rate this is fighting. | Existential | §23 leading indicators; recovery ladder §14.4; the 60-second floor |
| 2 | **The child's name is transcribed wrong.** "Meera" → "Mira / Meara / Mirror". Her name wrong in her own book destroys the artifact. | Existential | Known-name dictionary + `contextualStrings` + learned corrections (§17.3) |
| 3 | **It reads as AI.** Discovery is near-certain over an 18-year horizon. | Existential | §0.3-A; §16.4 |
| 4 | **One Tier-2 safety moment handled coldly**, screenshotted. | Existential, no legal fix | §18.4 escalation design, clinician-reviewed |
| 5 | **Guilt loop.** A product born from documentation guilt manufactures the debt it sells relief from. | High | No streaks anywhere (§14.6) |
| 6 | **STT session limits truncate a parent mid-story** on the one night they had something to say. | High | Engine choice, §21.2 |
| 7 | **SB 243 companion-chatbot exposure.** Private right of action, $1,000 statutory minimum. | Medium, cheap to fix | §18.6 |
| 8 | **Expo port is 2–3× the estimate** because PRODUCT.md §35's native-readiness claims are largely false. | High, schedule | §21.5, and the separate design-system spec |

---

## 1. Executive summary

Lumira ships **Letters**: a nightly, ninety-second, voice-first ritual that turns what a parent says out loud into a dated letter addressed to their child, and accumulates those letters into a book.

It is not a tracker and not a diary app. Its advantage over every competitor is that it already knows the child's age, this week's developmental context, and what was logged today — so it asks a *specific* question rather than a generic prompt. The interview is the product.

**Scope of this document.** Letters as a feature of Lumira, launching first on iOS via Expo, with the web app retaining a reduced text-only version. The companion iOS design-system specification is a separate document.

**Headline recommendations that differ from the original brief:**
1. Default to preserving the parent's literal words; make AI composition opt-in (§0.3-A).
2. Cut the "what could you have done differently" prompt (§0.3-B).
3. Add opt-in local audio retention (§0.3-C).
4. Use **whisper.cpp on-device (MIT)** rather than Apple's Speech framework as the primary engine (§21.2) — Apple's has a documented ~1-minute session cap.
5. No streaks, seeds, badges, or leaderboard anywhere in Letters (§14.6).
6. Tab name: **Letters**. Nav: Home · Chat · ⊕ Tonight · Letters · Profile (§14.1).

---

## 2. Product vision

Every parent of a young child is losing something they cannot get back and knows it. Not the milestone dates — those survive in a spreadsheet. What is lost is the texture: what she was obsessed with that month, what her hands looked like, what he was afraid of at 2am in week 34, the word she said wrong that he will miss when she stops.

Lumira's ambition is to be the thing that catches it, at a cost low enough that an exhausted person actually does it, and in a form honest enough that the child can trust it eighteen years later.

**The three-year shape.** Year one: the nightly letter. Year two: the printed volume, and the second child (where documentation collapses hardest). Year three: the child's own voice entering the archive.

---

## 3. Problem statement

**The behavior is documented and old.** Historian Janet Golden, reviewing a century of archival baby books, finds entries "trail off after the first few months," and books are near-absent for second and later children. This is a replicated pattern, not a founder quirk.

**The guilt is not quantified.** No survey — academic or commercial — measures parents feeling guilt about failing to document. Press coverage is anecdotal. The closest quantified analogue is YouGov (2022, n=6,090 US adults): **47% regret not recording conversations with loved ones who died**, and among those who did record, **77% regret not recording more.**

That 77% is a warning, not a tailwind. Documenting *raised* regret about under-documenting. **A nightly product built on non-documentation guilt can manufacture the debt it sells relief from.** This is the strongest argument against streaks and against guilt-framed marketing.

**Recommendation: stop selling guilt relief. Sell the artifact.** "Meera can read this at eighteen" is a positive-pull frame with no guilt liability.

**The deeper problem, which is sharper and truer than the founder's stated fear.** Saurabh's stated fear is forgetting the date of the first step. The evidence says something worse: he will *keep* a date, feel certain about it, and be wrong. Talarico & Rubin (2003) found that consistency of detail decays at the same rate for emotionally seismic events as for mundane ones, while confidence and vividness stay high — people stay certain long after they stop being accurate. Russell et al. (ALSPAC, n=5,390) found maternal recall of early speech concerns was systematically rewritten by what happened later (RRR 19.03 for mothers whose child later received therapy).

**A journal is not insurance against blankness. It is insurance against confident revision.** That is the honest pitch.

### 3.1 Why the existing baby book fails — mechanism, not platitude

| Mechanism | Does the plan fix it? |
|---|---|
| **Blank-page authorship.** The artifact demands you be a writer at the hour you have least left. | **Yes.** The interview replaces the blank page. This is the actual innovation — not the AI. |
| **No cue bound to an existing routine.** The book sits in a drawer with no trigger. | Only if the trigger fires at a real event, not a clock time. See §14.4. |
| **Compounding retrospective debt.** Miss a week and the next entry owes a week. Cost of re-entry rises with absence, so absence is self-reinforcing. *(Strongly held assumption; no direct study found.)* | **Not by default. A streak counter makes it worse by rendering the debt as a number.** Fixed by the recovery ladder, §14.4. |
| **Nothing to come back for.** No artifact until much later. | Partially. The "letters at eighteen" framing is the asset but is invisible in week one. Fixed by the month-4 print (§10.3). |

---

## 4. Why now

| Driver | Status |
|---|---|
| On-device speech recognition is good enough and free | **Fact.** whisper.cpp runs on-device with Core ML acceleration on iOS 15+; Apple ships a system framework. Neither existed at usable quality five years ago. |
| Voice notes are culturally normal | **Medium confidence.** Journalism citing platform adoption (WaPo 2024, Axios 2023), not independent measurement. |
| LLM style-matching is tractable | **Fact, with a real ceiling.** §17.5. |
| The category is forming right now and is unproven | **Fact.** Sproutbook (AI baby journal, $6.99/mo) had ~13 ratings at time of research. Remento and Storyworth are adjacent but aimed at elders, weekly-to-annual cadence. |
| A cautionary datapoint | **Artifact (heyartifact.com)** — human-interviewer baby memory product, closest analogue to the vision — **shut down after ~3.5 years.** Worth understanding before assuming demand. |

---

## 5. Target users and personas

**Primary — "The one who noticed."** 28–40, first child under two, has a physical baby book that is blank after month three, is technically comfortable, feels time accelerating. This is Saurabh. Willingness to pay is high; frequency of *initiation* is the open question.

**Secondary — "The second-time parent."** Documented child one thoroughly, has documented child two barely, and feels it acutely. Historically the sharpest guilt and the least-served segment. Larger than primary and cheaper to reach.

**Tertiary — "The gifter."** Grandparent or friend buying at a baby shower. Does not use the product. **The cheapest CAC available, because the payer is not the user.** Ship a gift SKU at launch, not v2.

**Explicit non-persona for v1:** the parent who wants a tracker. Huckleberry and Nara have solved feed/sleep analytics. Do not compete there.

---

## 6. User needs: functional and emotional

### 6.1 Functional
Capture in under two minutes, hands-free where possible; never lose an entry; correct the child's name once and never again; find "when did she first say Mama" in seconds; get the words out as a file that outlives Lumira.

### 6.2 Emotional
1. **Discharge, not audit.** The day acknowledged as hard before anything is asked.
2. **Evidence of competence.** Sleep-deprived parents lose the felt sense that they are doing fine. The entry should return it.
3. **Arrest of time.** The founder's real insight — but handle with care. Batcho (2020) found anticipatory nostalgia correlates with sadness and difficulty enjoying the present. **Use the "time is slipping" frame once, in onboarding. Never nightly.**
4. **Low cost to exit.** Any night closeable in sixty seconds with no failure state.

### 6.3 The prompt that must not ship

The founder explicitly requested *"what could you have done differently?"* **Recommendation: do not ship it, in any wording, nightly.**

- Baikie & Wilhelm (2005), summarizing Smyth's meta-analysis: expressive writing d=0.47 in healthy populations, d=0.19 clinical — and *"the immediate impact of expressive writing is usually a short-term increase in distress, negative mood and physical symptoms."* Tolerable in a four-session lab protocol with an endpoint. Not tolerable nightly, indefinitely.
- It was **detrimental** for adult survivors of childhood abuse and for veterans with PTSD. You cannot screen for either at signup.
- It is an upward counterfactual — the exact cognitive move implicated in self-blame and rumination — aimed at a group with ~13% depressive-symptom prevalence (CDC PRAMS).
- The artifact is a letter read at eighteen. **A nightly regret log is the worst possible thing to hand a young adult.**

Positive-affect writing is as effective with no distress cost (PLOS ONE systematic review, 51 studies). Ship instead: *"What do you want Meera to know about today?"*, *"What surprised you about her today?"*, and — second tier, optional — *"What was hard today?"*

If a growth prompt is required, make it **weekly**, phrased as intention not audit: *"Anything you want more of this week?"* Never a rating of the day, never "better," never "should have."

---

## 7. Core use cases

| ID | Use case | Frequency |
|---|---|---|
| UC1 | Nightly ninety-second spoken entry | Daily, primary |
| UC2 | "Not much today" — one tap, still produces a real entry | Daily, ~15–30% of nights |
| UC3 | In-the-moment capture right after a milestone happens | Weekly. **Possibly a bigger win than the nightly ritual** — highest emotional charge, lowest recall burden |
| UC4 | Typed entry when speaking is impossible | Daily-equivalent for a meaningful share of users |
| UC5 | Re-reading past letters | Weekly. **The only signal that the artifact has value.** |
| UC6 | Searching for a specific memory | Monthly |
| UC7 | Catching up after a gap of 5+ nights | Monthly |
| UC8 | Exporting or printing the volume | Yearly, the monetization moment |

## 8. Jobs to be done

- When my daughter does something I want to keep, **help me get it down before I lose it**, without becoming a writer.
- When I have five minutes and no energy, **ask me something specific** so I do not have to decide what to say.
- When she is eighteen, **give her something true** that shows her who I was, not who a model thinks I was.
- When I miss a week, **let me back in without punishing me.**

## 9. Product principles

1. **The question is the product.** Generic prompts produce generic entries. Use the structured data.
2. **His words survive.** Every transformation is reversible and inspectable.
3. **Never punish absence.** Count what exists; never show what is missing.
4. **Sparse and true beats full and smooth.** A short honest entry is a success.
5. **Nothing is ever lost.** Transcript persists before any network call. P0.
6. **Speaking is one path, not the path.**
7. **The journal never diagnoses.** No developmental assessment, no reassurance about normalcy, no advice. That is Chat's job.
8. **Warmth from restraint.** No confetti on a letter to a child.

## 10. Value proposition

**To the parent:** "Five minutes a night, out loud. She gets a book."

**Defensible:** the accumulated voice corpus (after 90 nights, a stylistic fingerprint no competitor can clone, and the switching cost is the artifact rather than the app); developmental context as interviewer intelligence; and, credibly, "your voice never leaves your phone."

**Not defensible:** STT is commodity, prompts are copyable, Sproutbook already exists. **The moat is accumulated voice plus the printed book, not the technology.**

### 10.3 The deferred-artifact problem, addressed directly

"Letters she reads at eighteen" is an eighteen-year payoff funding a monthly charge. That is unfinanceable and it is the core business risk.

**Fix: do not defer the artifact.** Print a slim *First 100 Days* volume at month 3–4, included in the annual plan. A physical object in the parent's hands converts an abstract promise into proven value and re-anchors renewal every twelve months thereafter.

**And: free read-only export forever on cancellation.** Both Qeepsake (App Store reviews, verbatim) and Remento (third-party, unverified) are accused of locking users out of their own entries. Holding a parent's memories hostage would be a trust catastrophe for a product whose only asset is trust. Export-first is a cheap, credible differentiator.

---

## 11. Competitive landscape

| Product | Cadence | Voice | AI writes? | Book | Price (verified from primary source) | The lesson |
|---|---|---|---|---|---|---|
| **Remento** | Weekly SMS | Yes, core | **Yes** — "Speech-to-Story" | Yes, QR-linked to original audio | $99 first year | Closest mechanic. Criticized (unverified, competitor blog) for AI that "smooths over the quirks that make someone's voice distinctive." **The exact failure Lumira must avoid.** |
| **Storyworth** | Weekly email | Yes (phone calls) | **Deliberately not** — "Magic Editor" fixes spelling and grammar and explicitly does not "alter the storyteller's voice, rephrase their sentences, or make the writing sound more polished" | Yes | From $99/yr | **The market leader chose not to compose.** That is a strong signal for §0.3-A. |
| **Artifact** (heyartifact.com) | Monthly + annual | Yes only | No — human journalists | No, audio podcast | From $4/mo + tiers | **Shut down after ~3.5 years.** The single most important datapoint here. |
| **Qeepsake** | Daily SMS | No, text | No | Yes | $47.88 / $95.88 yr | Daily cadence works; complaints cluster on account lockout and speed |
| **Tinybeans** | Continuous | No | No | Photobooks | Tinybeans+ (price unverified) | FY25 standalone revenue US$4.82M, **down 11% YoY**; acquired Qeepsake Nov 2025 for **US$2.7M** (~50k paid subs ≈ US$54/sub). Memory-keeping money is real but thin. |
| **Day One** | Ad hoc | Yes (paid tier) | Gold: guided reflection | Yes | $49.99 / $74.99 yr | Highest willingness-to-pay in the set |
| **Rosebud** | Ad hoc | Yes | Yes | No | $107.99–$499.99/yr | App Store negatives cluster on **voice reliability** — recordings stuck loading, entries lost. A direct warning. |
| **AudioPen** | Ad hoc | Yes, core | Yes, with **custom writing styles** | No | $99/yr | Proves custom style profiles are technically tractable |
| **Huckleberry** | Continuous | No | Premium: AI chat | No | Free / $5.74 / $9.99 mo billed yearly | Where Lumira's other four tabs compete |

**Three genuinely unmet needs found:**
1. **Nobody runs a nightly, low-friction loop for the 0–24 month window.** Every prompt cadence found was weekly (Remento, Storyworth) or monthly/annual (Artifact). Qeepsake is daily but text-only and about the baby, not addressed to her.
2. **Voice-preserving AI is a stated, unsolved tension.** Remento's AI flattens voice; Storyworth refuses to rewrite at all. Neither ships "AI that composes in *your* voice." This is the sharpest wedge.
3. **Ownership when you stop paying.** See §10.3.

**Two things not to rebuild:** print fulfilment (Storyworth, Remento and Qeepsake all ship competent hardcovers; the complaints are operational pain Lumira should not own in v1 — use a print API) and baby tracking/sleep analytics (Huckleberry has solved and defended it).

---

## 12. MVP scope

**In:**
- Bottom-nav change: Content folds into Home; Tribes deferred; `⊕ Tonight` and `Letters` added (§14.1)
- Nightly notification anchored to the child's bedtime, not a clock
- One-tap-to-armed listening surface, explicit second tap to record
- On-device transcription with live partial results
- Known-name correction, learned once per profile
- Rules-selected follow-up questions, max two, always skippable
- **Keep my words** deterministic cleanup mode (default)
- **Shape it for me** Claude composition mode (opt-in, per entry)
- Transcript review and edit before saving
- "Not much today" one-tap path that still writes a real entry
- Reading view (the artifact), timeline with month jump, full-text search
- Three-layer visibility model with child-facing layer default off
- Tiered safety escalation
- Export to JSON and PDF, free, forever
- Typed path as a co-equal affordance

**Deferred to v1.1+:** printed book fulfilment, partner sharing, semantic/vector search, multi-child, the child's own voice, web voice capture, audio-as-primary-artifact.

**Explicitly out:** any developmental assessment inside Letters; any streak, seed, badge, level, or leaderboard; social sharing of entries; AI-generated imagery.

## 13. Non-goals

Letters is not a tracker, not a photo album (v1), not a social feed, not a mental-health intervention, and not a place Lumira gives advice. It has exactly one job: get the parent's words down and keep them.

---

## 14. User flows and information architecture

### 14.1 Navigation decision

Current: `Home · Chat · Tribes · Content · Profile`, with **Chat already in an elevated center slot** (verified in `PremiumBottomNav.tsx`: `isCenter: true`, 44px circle, gradient, −6px raise).

**Recommended: `Home · Chat · ⊕ Tonight · Letters · Profile`**

| Change | Rationale |
|---|---|
| **Content → merged into Home** | A library has no daily return trigger. Articles already surface in the Home feed and in Chat answers. *Open question: pull Content tab DAU/WAU from existing analytics before executing — if it is unexpectedly sticky, demote Tribes instead.* |
| **Tribes → deferred post-launch** | Community is a cold-start problem needing thousands of concurrent parents Lumira does not have, and it is the largest moderation and trust-and-safety liability in the app. |
| **`⊕ Tonight` takes the elevated center slot from Chat** | The center slot belongs to the *daily ritual*. Journaling is nightly; Chat is episodic (you ask about sleep regression four times a year). Chat keeps a peer tab. |
| **`Letters` is a peer tab** | Action and destination are different jobs. `⊕ Tonight` is "do this now"; `Letters` is "go here." Mixing them in one peer row is the classic IA error. |

**Tab naming, scored.** Clear = a sleep-deprived parent knows instantly. TM = trademark-plausible.

| Name | Clear | Scales | Warm | TM | Verb | Σ |
|---|---|---|---|---|---|---|
| **Letters** | 4 | 4 | 5 | 3 | 4 | **20** |
| Journal | 5 | 4 | 3 | 2 | 5 | 19 |
| Meera (dynamic) | 5 | 1 | 5 | 5 | 0 | 16 |
| Diary | 5 | 3 | 2 | 2 | 3 | 15 |
| Notes | 5 | 3 | 1 | 1 | 4 | 14 |
| Tonight | 4 | 1 | 4 | 4 | 1 | 14 |
| Memories | 4 | 3 | 3 | 1 | 1 | 12 |
| Moments | 3 | 3 | 2 | 1 | 1 | 10 |
| ~~Keepsake~~ | — | — | — | **0** | — | **Disqualified** — Qeepsake is a direct competitor, phonetically identical |
| ~~Threads~~ | — | — | — | **0** | — | **Disqualified** — Meta |
| ~~Story~~ | — | — | — | — | — | **Disqualified** — the repo already ships a `stories` feature (composer, viewer, polls). Direct collision. |

**Decision: Letters.** It is the only candidate that encodes *who the entry is for*, which is the entire differentiator against every tracker on the App Store. "Journal" is marginally more legible but names a task; "Letters" names a gift, and gifts get finished. `Meera` as a dynamic tab name fails fatally on a second child, in documentation, in support, and in screenshots.

Copy: tab `Letters` · nightly CTA `Write tonight's letter` · archive header `Letters to Meera`.

### 14.2 The nightly flow

```
Notification (bedtime + 25 min)
  └─> deep link ──> Tonight (modal, presented over the tab bar)
                      │
                      ├─ ARMED    mic warm, gate closed, aura idle-breathing
                      │           (audio session + model loaded on screen entry,
                      │            NOT on tap — this is how the 400ms disappears)
                      │
                      ├─ [tap] ──> LISTENING
                      │             double-tap haptic, aura tracks amplitude
                      │             live partial transcript, dimmed
                      │             ── silence >20s ──> HOLDING (aura dims, keeps breathing)
                      │             ── silence >90s ──> NUDGE ("Still here.") one haptic tick
                      │             NEVER auto-stops on silence
                      │
                      ├─ [tap] ──> CLOSED   long haptic. Transcript persisted NOW,
                      │                     locally and to Supabase, before anything else.
                      │
                      ├─ FOLLOW_UP  max 2 questions, rules-selected (§14.3)
                      │             shown as TEXT, answered by VOICE
                      │             swipe-left or text link to skip
                      │
                      ├─ REVIEW     transcript editable. Names pre-corrected.
                      │
                      ├─ COMPOSE    Keep my words (deterministic) OR Shape it for me (Claude)
                      │             aura dims to idle breathing — visual continuity, not a spinner
                      │             8s target · 12s "Almost there." · 20s hard timeout
                      │
                      └─ SAVED      long haptic. Return to Letters.
```

**Escape hatches, always visible, never gated behind speaking:**
- **"Not much today"** — one tap, writes a real entry: *"Tuesday. An ordinary day, and she was here for it."* **This is the most important path in the feature.** It keeps the record unbroken without demanding performance, and it is what a 2am parent will press. Target 15–30% of nights; zero usage means it is not discoverable.
- **Type instead** — co-equal affordance, same size and visual weight, same follow-ups.

### 14.3 Follow-up question selection — rules, not free-form

**Claude phrases the chosen slot. Claude does not choose the slot.** This makes follow-ups auditable, testable, and incapable of asking a cheerful question about a sick baby.

| Archetype | Fires when | Purpose | Example |
|---|---|---|---|
| **Anchor** | Transcript has an event but no sensory noun | Force one concrete detail. Detail is what survives eighteen years; abstraction does not. | "What was she wearing?" |
| **Thread** | A prior entry has a matching open thread (deterministic lookup, **never invented**) | Continuity. Proves memory, which is the retention engine. | "Two weeks ago she was pulling up on the couch. Is she still?" |
| **You** | Entry is all events, no first-person affect | Converts a log into a letter. Nobody else on the market asks this. | "What did you feel watching that?" |

Hard cap two. If affect terms dominate the transcript, **suppress all three** and ask one containing question instead: *"Do you want this in her book, or just out of your head?"* — which routes to the private layer.

### 14.4 The recovery ladder — more important than any streak

| Absence | System behavior |
|---|---|
| 1 night | Nothing. Silence. No mention, ever, on return. |
| 2–4 nights | Same prompt, unchanged. No acknowledgement of the gap. |
| **5–7 nights** | Prompt widens: *"The last few days, as one."* One entry covers the span. **Debt is cancelled by redefining the unit, not by catching up.** Ship this in v1 — it is cheap and it is the whole ballgame. |
| ~14 nights | Lumira drafts an entry from what it already has (milestones, check-ins, chat) and asks the parent to **correct** it, not write it. Editing is cheap where authoring is not. |
| 30+ nights | One reactivation, leading with the artifact: show the twelve letters already written, then *"Want to add to it?"* Then stop. If ignored, drop to weekly. |

### 14.5 Notification design

**Anchor to the child's bedtime, not a clock.** Lumira already collects check-in and sleep data. Fire at `baby_bedtime + 25 min`, default 8:45pm local, adjustable in one tap on first use. A fixed 9pm ping arrives mid-bath for half the cohort and trains dismissal.

Second window at 10:15pm **only if the first was dismissed without opening** — never if opened and abandoned. Zero notifications after 10:30pm. Never during a logged night wake.

Copy rules: name the child, ask nothing of the parent's effort, state the duration honestly. Never counts, streaks, "don't lose", "you haven't", or exclamation marks.
- Nights 1–7: `Meera's day. Two minutes, out loud.`
- Steady state: `What should Meera know about today?`

### 14.6 Gamification: excluded entirely

**No seeds, streaks, badges, levels, or leaderboard in Letters. Not a soft link, not a muted variant. None.**

The counterargument, stated fairly: streaks demonstrably lift DAU, Duolingo is the proof, and the founder's own empty baby book shows intrinsic motivation already failed once.

Why it still loses:
1. The baby book failed on **cost and cue**, not motivation. Streaks treat a cost problem with a pressure treatment.
2. **The failure mode is asymmetric.** Breaking a 40-day Duolingo streak costs a cartoon owl. Breaking a 40-day streak on your daughter's journal tells a fragile parent, in a number, that they are failing to record her life. That is the founder's own guilt, productised and aimed at the user.
3. **A seeds economy implies an exchange rate between memories and points.** One screenshot of "+15 seeds for journaling about Meera" is a reputational event.
4. Streaks distort content. Parents post to preserve the number, and thin entries dilute the artifact.

**Instead: count accumulation, never consecutiveness.** `47 letters to Meera` only goes up. `Month 15: 9 letters` fills without emptying. Loss aversion attaches to the archive growing, not a chain breaking. Private to the Letters tab; never on Home; no target, no red state.

**Engineering open question for Saurabh:** does the existing gamification engine assume every surface emits events? If so, an explicit exclusion list is real work, not a config flag.

---

## 15. UX and design principles

Full component specifications are in the companion design-system document. The load-bearing decisions:

### 15.1 The listening surface: reject the waveform
Every voice app uses a waveform because it is cheap and borrowed from the voice-memo model. That is exactly the problem — a waveform says *"this device is recording you,"* which is surveillance grammar, not companionship. It also demands legible chrome that fights a dark bedroom.

**Use "the aura":** one soft radial glow, Sage core fading to transparent over a 40–60px blur. Base 120px, max amplitude scale 1.35. RMS sampled ~12Hz, EMA-smoothed (α=0.3). During silence >1.5s it does not shrink to nothing — it falls into an idle breathing loop, 4000ms cycle, matching resting breath rate. That reads as *"still here, take your time,"* not *"broken."* At 6s silence, one low-contrast line: `Take your time.` Tap anywhere to stop; no precision target needed in the dark.

### 15.2 Eyes-free contract
Haptics primary, visuals secondary, **audio never** (default off, user-enablable). Screen near-black. Double-tap haptic on listening start, long haptic on stop and on save. The parent must know the state without looking.

### 15.3 The reading view is the artifact
It should feel like a page, not a feed item. Content column **560px** — deliberately wider than the app's 480px shell, so it steps outside the app. Body 18px, line-height 1.75, ~60–66 characters per line, 90% opacity (never pure black). **Serif face** (Literata, SIL OFL) for entry body only; Plus Jakarta Sans for chrome. The dateline is a heading, not a UI label: *"March 14, 2027 — Meera was 11 months, 2 weeks old."*

### 15.4 Voice and typing are co-equal
This is a correctness requirement, not a nicety. A voice-first ritual is a hard exclusion for Deaf and hard-of-hearing users, users with a stammer or speech difference, and — most commonly — any parent whose baby or partner is asleep in the room. **The mic button and the text field get the same size and the same visual weight.** The founder's "it talks to you every night" should be understood as *Lumira initiating a text conversation that can optionally be spoken*, not an audio-first product. This does not weaken the vision; it is the only version of it that is not discriminatory by construction.

### 15.5 Entry-loss prevention — P0
Every completed recording and every keystroke writes to local persistent storage **before any network call**. Save is optimistic-local-first; a failed Supabase write retries in background with the draft still on screen. A mistap, a killed app, or a dead connection must never destroy a night's entry. Compose failure must never touch the transcript. Rosebud's App Store reviews — entries lost on voice capture — are the cautionary case.

### 15.6 Empty state, night one
Reject the current repo pattern (`📓 Your journal is waiting`) — placeholder copy, feature-oriented. Address the *reader*: **"Some day, Meera might ask what tonight was like. Tell her."** in reading-view typography. The tap target *is* the idle-breathing aura — the empty state previews the interaction rather than describing it.

---

## 16. Content and intelligence strategy

### 16.1 Structured data buys the right question
This is the entire product advantage and it must be built first. Letters never starts from a blank prompt. It reads today's milestone rows and check-in rows and turns them into a specific opening:
- Not *"How was your day?"* → **"You logged her first steps this afternoon. Tell me about the moment."**
- Not *"How are you?"* → **"Third night under five hours. What's it actually like right now?"**

A generic journaling app cannot ask these. That is the moat.

### 16.2 Non-duplication boundary

| Feature | Owns | Must not do |
|---|---|---|
| Milestones | The **fact and the date**. Structured, editable, CDC-aligned. | Ask "how did it feel?" |
| Check-ins | The **daily numbers** — sleep, feeds, mood scale. | Ask for prose. |
| **Letters** | **Prose, in the parent's voice, addressed to the child.** | Re-ask anything the other two already hold. |

### 16.3 Milestones vs. texture — take a position

**The milestone log is the hook. The texture is the artifact.**

Twelve dated firsts is a spreadsheet. A child at eighteen reading *"first step: 14 Mar 2026"* learns nothing about herself and nothing about her parents. The intergenerational-narrative literature (Duke & Fivush, Emory Family Narratives Lab, the "Do You Know?" scale) finds that knowing *family story* predicts adolescent self-worth, identity coherence, and lower anxiety. Twenty dated facts predict nothing. *(The DYK–wellbeing association is well documented; effect sizes are correlational, and applying a 20-item family-history scale to infant milestones is one extrapolation step. Flagged as such.)*

Also: the milestone date is the one thing structured data already captures and the one thing that stays accurate. What decays is exactly what nothing captures.

**So: milestones are the invitation, never the payload.** The payload is the next question — *"what did you do when it happened?"*

### 16.4 Age-banded prompt inventory

**Critical correctness note.** The CDC and AAP revised the milestone checklists in **February 2022** (Zubler et al., *Pediatrics* 149(3)). The criterion moved from the 50th to the **75th percentile**; checklists were **added at 15 and 30 months**; **crawling was removed**; walking alone and first word moved **12mo → 15mo**; rolling moved 4mo → 6mo. Anything built against pre-2022 ages is wrong. Meera at 15 months sits on a checklist that did not exist before 2022.

Treat CDC ages as **prompt timing, never a scorecard.**

| Band | Milestone anchor (trigger) | Texture prompt (the actual ask) |
|---|---|---|
| 0–3mo | first smile; head control | What does the 3am version of you sound like? Who did she look like today? |
| 4–6mo | rolling (6mo); solids | What noise is she making constantly right now? |
| 7–9mo | sitting; babbling; stranger wariness | What is she afraid of? What makes her laugh so hard it stops? Describe her hands. |
| 10–12mo | pulls to stand; waves; "mama"; pincer grasp | What is her opinion — a food she refuses, a person she prefers? What are you scared of for her? |
| **13–15mo** | **first steps; first word (CDC 15mo)** | What did the room feel like when she walked? Who did you call first? What does she do that no one else's baby does? |
| 16–24mo | two words together (24mo); running | What does she call things wrong, and will you miss it? What do you hope she never inherits from you? |

Two evergreens in every band: *"What did she do today that you want to remember?"* and *"What were you feeling today?"* — the second is the one nobody else asks.

### 16.5 The AI slop inventory

**Critical distinction: only structural tells are diagnostic.** Lexical tells (em dash, "delve") are *correlated* markers that also appear constantly in good human prose. Kobak et al. (2024, 14.2M PubMed abstracts) found "delves" at 25× excess frequency — but that is population-level drift, not per-sentence guilt. **Rule: ban tokens hard, ban structures by quota, never by absolute.** Stripping every rhetorical move takes the life out of real prose.

| Tell | Removal rule | Diagnostic? |
|---|---|---|
| Em dash U+2014; en dash U+2013; curly quotes; ellipsis U+2026 | Hard ASCII substitution. Em dash → `, ` if clause-continuing, `. ` if the tail is a full clause. Never `--`. | **No** — house style, per founder mandate |
| **"Not X, but Y"** | Max 1 per entry, only if X was actually stated | **Yes, at density** |
| **"It's not just X — it's Y"** | Ban outright, zero allowed | **Yes** |
| **Rule of three / tricolon** | Max 1 per entry. Force list lengths of 2 or 4 elsewhere | **Yes, at density** |
| **Tricolon closer** | Ban in final sentence. Last sentence ≤12 words or a fragment | **Yes** |
| **Summarizing final paragraph** | Ban any final paragraph with >40% content-word overlap with earlier paragraphs | **Yes — the strongest single tell** |
| **Sentimental register shift at the end** | Final sentence must contain a noun appearing nowhere else and be sensory or factual. No abstract nouns (love, joy, journey, moment, grateful, blessed) in the final 15 words | **Yes** |
| **Unearned profundity** | Max 1 meaning-sentence, attributed ("I keep thinking"), never asserted | **Yes** |
| **Uniform sentence length** | Enforce: stdev of sentence word-count ≥6.0, at least one sentence ≤5 words and one ≥25 | **Yes — measurable, hardest to fake** |
| Hedging stacks | Max 1 hedge per sentence, 3 per entry | Moderate |
| Lexicon: delve, tapestry, testament, navigate, resonate, beacon, realm, myriad, embark, unwavering, whirlwind, "in that moment", "little did I know" | Hard regex ban, regenerate | Weak alone, **strong in combination** |
| "Firstly / Moreover / Ultimately / In conclusion" | Hard ban | **Yes** |

**Above all, tell #1 that cannot be linted: absence of specific detail.** No proper nouns, no odd mundane particulars, no unresolved feeling. Only real capture supplies this — which is why the interview matters more than the writer.

### 16.6 The deterministic post-processor

**This cannot be left to the model.** Three reasons: (1) asking a distribution to police its own priors is asking it to sample outside itself, and it regresses silently over long contexts; (2) the founder's requirement is absolute — one em dash falsifies the premise, and probabilistic compliance is not compliance; (3) character substitution and variance measurement are trivially computable, so spending tokens and non-determinism on them is malpractice. **Prompt for structure, code for characters and counts.**

```ts
// lib/journal/deslop.ts
const CHAR_MAP: Record<string, string> = {
  "—": ", ",  // em dash
  "–": "-",   // en dash
  "‘": "'", "’": "'",
  "“": '"', "”": '"',
  "…": "...", " ": " ",
  "′": "'", "″": '"', "­": "",
};

const BANNED = [
  /\bdelv(e|es|ed|ing)\b/gi, /\btapestry\b/gi, /\btestament to\b/gi,
  /\bnavigat(e|ing) (the|this)\b/gi, /\bresonat(e|es|ed|ing)\b/gi,
  /\bbeacon\b/gi, /\brealm\b/gi, /\bmyriad\b/gi, /\bembark\b/gi,
  /\bunwavering\b/gi, /\bin that moment\b/gi, /\blittle did I know\b/gi,
  /\bit'?s not just .{1,60}?[,.-] it'?s\b/gi,
  /\b(firstly|moreover|furthermore|ultimately|in conclusion)\b/gi,
];

export type SlopReport = { clean: string; violations: string[]; stdev: number; passed: boolean };

export function deslop(input: string): SlopReport {
  let s = input;
  for (const [k, v] of Object.entries(CHAR_MAP)) s = s.split(k).join(v);
  s = s.replace(/ {2,}/g, " ").replace(/ ,/g, ",").replace(/,\s*\./g, ".");

  const violations: string[] = [];
  for (const re of BANNED) {
    const hits = s.match(re);
    if (hits) violations.push(...hits.map(h => `banned:${h.toLowerCase()}`));
  }

  const sents = s.split(/(?<=[.!?])\s+/).filter(x => x.trim().length);
  const lens = sents.map(x => x.trim().split(/\s+/).length);
  const mean = lens.reduce((a, b) => a + b, 0) / (lens.length || 1);
  const stdev = Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / (lens.length || 1));
  if (stdev < 6.0) violations.push("uniform_sentence_length");
  if (!lens.some(l => l <= 5)) violations.push("no_short_sentence");
  if (!lens.some(l => l >= 25)) violations.push("no_long_sentence");

  const anti = (s.match(/\b(isn'?t|wasn'?t|not) [^.]{2,50}?[,.]? (but|it'?s)\b/gi) || []).length;
  if (anti > 1) violations.push(`antithesis_x${anti}`);

  const last = sents.at(-1)?.toLowerCase() ?? "";
  if (/\b(love|joy|journey|moment|grateful|blessed|always know)\b/.test(last))
    violations.push("sentimental_closer");

  return { clean: s, violations, stdev, passed: violations.length === 0 };
}
```

**Pipeline:** generate → `deslop` → if `!passed`, one regeneration pass with `violations` injected as a correction turn → `deslop` again → store `clean` regardless, plus `violations` in a `slop_audit` jsonb column for tuning. **Never block the user's entry on a failed check.** Degrade silently and log.

---

## 17. AI vs. structured logic boundaries

| Job | Owner | Why |
|---|---|---|
| Opening question selection | **Rules** (age band + today's logged data) | Auditable, testable, cannot ask a cheerful question about a sick baby |
| Follow-up archetype selection | **Rules** (slot-fill on transcript features) | Same. Claude phrases; Claude does not choose |
| Follow-up phrasing | Claude (Haiku) | Cheap, low-stakes |
| Transcription | **On-device model** | Privacy, cost, latency |
| Name correction | **Deterministic dictionary + learned rules** | Must work identically on web where there is no on-device STT |
| "Keep my words" cleanup | **Deterministic** | This is the default mode; near-zero AI by design |
| "Shape it for me" composition | Claude (Sonnet) | Opt-in only |
| Slop removal — characters, counts | **Deterministic** (§16.6) | Absolute requirement, probabilistic compliance is not compliance |
| Slop removal — structure | Prompt constraints + regeneration | Not codifiable |
| Safety tiering | **Deterministic classifier, server-side, pre-composition** | Must never be improvised |
| Tier 2 crisis copy | **Fixed non-AI template** | Never generate crisis wording |
| Milestone inference from an entry | Claude, **suggests only, never asserts** | Parent confirms |
| What appears in the child-facing layer | Claude **suggests**, parent **confirms every passage** | Never let a model decide what a child reads |

### 17.1 Voice profile capture — the onboarding interview

Do not ask "describe your writing style." People cannot. Elicit samples, then extract. Eight questions, voice-first, ~4 minutes.

1. *"Tell me about the day Meera was born, like you'd tell a friend."* → narrative baseline: sentence length, tense, pacing
2. *"What do you actually call her?"* → **endearments. The single highest-value field.**
3. *"What do you call her mother when you're talking to Meera?"* → Mumma / Mama / Ishita
4. *"Say something you'd never want her to forget."*
5. *"What words from home show up when you talk to her?"* → code-switching (beta, chalo, arre)
6. *"If she reads this at 18, do you want her to hear you swearing?"* → profanity ceiling 0–2
7. *"Tell me about a hard night."* → register under stress: terse or verbose
8. *"What's a joke only your family would get?"* → humor mode

**Extract mechanically:** mean/stdev sentence length, type-token ratio, contraction rate, profanity count, question rate, exclamation rate, non-English token list.
**Extract by classification:** formality (1–5), humor mode, sentiment directness, whether he naturally addresses the child in second person.

### 17.2 Schema

Extend `journal_entries` rather than supersede it — this preserves existing RLS and the list UI, and `entry_kind` cleanly separates Lumira-about-parent from parent-to-child.

```sql
alter table public.journal_entries
  add column entry_kind text not null default 'ai_summary'
    check (entry_kind in ('ai_summary','nightly_letter')),
  add column child_id uuid references public.babies(id),
  add column raw_transcript text,
  add column composed_body text,
  add column edited_body text,
  add column compose_mode text check (compose_mode in ('keep_words','shaped')),
  add column visibility text not null default 'private'
    check (visibility in ('private','partner','child_safe')),
  add column child_safe boolean not null default false,
  add column capture_mode text check (capture_mode in ('spoken','typed','mixed')),
  add column voice_profile_version int,
  add column slop_audit jsonb,
  add column composed_at timestamptz;

create table public.voice_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  child_id uuid references public.babies(id),
  endearments text[] not null default '{}',          -- ['Meeru','beta']
  partner_name_for_child text,                       -- 'Mumma'
  self_name_for_child text,                          -- 'Papa'
  mean_sentence_len numeric,
  sentence_len_stdev numeric,
  contraction_rate numeric,
  question_rate numeric,
  formality smallint check (formality between 1 and 5),
  humor_mode text check (humor_mode in ('dry','absurd','self_deprecating','warm','none')),
  profanity_ceiling smallint not null default 0,
  code_switch_terms jsonb not null default '[]',
  register_notes text,
  banned_words text[] not null default '{}',          -- learned from edits
  preferred_words text[] not null default '{}',
  version int not null default 1,
  updated_at timestamptz not null default now()
);
alter table public.voice_profiles enable row level security;
create policy voice_profiles_own on public.voice_profiles
  using ((select auth.uid()) = profile_id) with check ((select auth.uid()) = profile_id);

-- Learned STT name corrections, applied before Claude ever sees the text
create table public.name_corrections (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  heard text not null,      -- 'Mira'
  correct text not null,    -- 'Meera'
  hit_count int not null default 1,
  created_at timestamptz not null default now(),
  unique (profile_id, heard)
);
alter table public.name_corrections enable row level security;
create policy name_corrections_own on public.name_corrections
  using ((select auth.uid()) = profile_id) with check ((select auth.uid()) = profile_id);

-- Safety events: counts and tiers only. NEVER the triggering text.
create table public.safety_flags (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  entry_id uuid references public.journal_entries(id) on delete set null,
  tier smallint not null check (tier between 0 and 2),
  category text not null,
  model_version text,
  created_at timestamptz not null default now()
);
alter table public.safety_flags enable row level security;
```

### 17.3 Few-shot exemplar selection and edit-as-signal

Store every **final** (post-edit) entry as a candidate exemplar with `authenticity_score = 1 − normalized_levenshtein(composed_body, edited_body)`. Entries the parent barely touched score high.

At compose time select **three**: the highest-scoring entry overall, the most recent high-scorer, and the highest-scorer whose emotional valence matches tonight's transcript (classified cheaply at ingest as tender / funny / exhausted / worried). **Inject as full assistant-turn examples, not summarized style notes** — the model imitates concrete text far better than described style. Cold start uses the onboarding transcripts themselves.

**Edit-as-signal, deterministic — do not run an LLM over every edit.** On save, diff `composed_body` vs `edited_body`. A deleted span matching a banned-lexicon pattern increments its weight. A deleted final sentence increments `closer_overreach` and tightens the closer rule. A word consistently swapped A→B across ≥2 entries appends A to `banned_words` and B to `preferred_words`. Bump `version`. **Surface nothing to the user** — silent adaptation is the trust-preserving choice.

### 17.4 The composition system prompt ("Shape it for me" mode)

Use the Messages API top-level `system` as an array of blocks, with `cache_control: {type:"ephemeral"}` on the static preamble; put the volatile voice profile and exemplars *after* the cached block. `temperature: 1.0` for prose variance. Prefill the assistant turn with the entry's first character to suppress preamble.

```
You are helping a father write tonight's entry in a journal his daughter will read when
she is eighteen. You are not the author. He is. You are taking what he said out loud and
setting it down the way he would have written it if he had the patience to type.

INPUT
- A raw transcript of him speaking tonight. It is unstructured, repetitive, and contains
  false starts. That is normal.
- His voice profile.
- Two or three entries he has written or approved before. Imitate these above all else.
- Basic facts about the child tonight.

WHAT YOU PRODUCE
One entry, 120 to 300 words, addressed directly to the child in second person. Plain
text. No title, no headings, no sign-off unless his examples have one.

HARD RULES
1. Use only what is in the transcript. Never invent a detail, a quote, a gesture, or a
   feeling he did not express. If the transcript is thin, the entry is short. A short
   true entry is the goal; a padded one is a failure.
2. Every proper noun and endearment comes from the voice profile or the transcript.
   Never substitute a generic pet name.
3. Preserve his non-English words exactly as spoken. Do not translate, italicize, gloss.
4. Punctuation: only . , ? ! : ; ' " ( ) and the hyphen. Never an em dash, en dash,
   curly quote, or ellipsis character. Write "..." as three periods.
5. Sentence lengths must vary hard. At least one under six words. At least one over
   twenty-five. Never three sentences of similar length in a row.
6. At most one "not X, but Y" in the whole entry, and only if he said both halves.
   Never "it's not just X, it's Y."
7. At most one three-item list. The final sentence must not be a three-beat rhythm.
8. Do not summarize at the end. Do not restate the entry in more abstract language. End
   on something concrete he actually said, or on a direct address to her. The final
   fifteen words must not contain: love, joy, journey, moment, grateful, blessed.
9. At most one sentence assigning meaning to the day, attributed to him ("I keep
   thinking", "I don't know why"), never asserted as truth.
10. Never: delve, tapestry, testament, navigate, resonate, beacon, realm, myriad,
    embark, unwavering, chapter, whirlwind, firstly, moreover, ultimately.
11. Match his profanity ceiling exactly.
12. Do not be more articulate than he is. If he trails off, let the sentence be plain.
    Fragments are allowed and welcome.

WHAT NEVER APPEARS IN AN ENTRY
Medical interpretation, developmental assessment, reassurance about whether something is
normal, comparison to milestones, or advice. This is a journal, not a consultation. If
the transcript contains a medical worry, record only what he said he felt and observed,
in his words, and stop there.

SAFETY ESCALATION
If the transcript contains any of the following, still write the entry, but omit the
material entirely and return the flag on its own final line, exactly:
[[LUMIRA_FLAG: <infant_safety | self_harm | harm_to_child | domestic_violence |
severe_maternal_distress>]]
Triggers: statements suggesting the child was or may be harmed; the parent describing
wanting to hurt himself, the child, or another person; violence in the home;
hopelessness, not wanting to be here, or being unable to keep the child safe.
Never quote this material back. Never counsel, diagnose, or reassure in the entry.
Ambiguity resolves toward flagging. A flag is cheap; a miss is not.
```

The application strips the flag line before storage, writes it to `safety_flags`, and routes to the escalation UI. **It never renders in the journal.**

### 17.5 The honest ceiling — read this before believing the pitch

**"Trained to write in your own voice" is marketing language for few-shot style imitation. There is no training.** Say "learns your voice" and be ready to explain it means examples, not fine-tuning. Claiming "trained" is thin and should not go in the App Store description.

**Realistic ceiling: a stranger cannot tell. It does not reach: Meera at eighteen cannot tell.** The gap is idiolect at the sub-sentence level — the specific way a person misuses a word, the joke they always make, the rhythm of their hesitations. Few-shot captures register and vocabulary reliably; it captures idiosyncrasy weakly and degrades toward the model's mean as entries lengthen. **Expect 200-word entries to hold voice and 500-word entries to drift badly.** This is why the 300-word cap matters more than any other line in the prompt.

**Specific failure points:** (1) sparse transcripts — the model pads, and padding is where slop enters, so detect transcripts under ~60 words and ask for one more detail rather than compose; (2) emotionally heavy nights — the model reaches for consolation, exactly the wrong register in a letter to a child; (3) **humor** — model-generated versions of a specific person's jokes are the most detectable failure in the system. Consider forbidding generated humor entirely and only preserving jokes verbatim.

---

## 18. Trust, safety, legal and compliance

> Not legal advice. These are product-counsel flags. **A licensed privacy attorney and a perinatal clinician must review the escalation copy and the privacy policy before launch.** Budget for both.

### 18.1 Why this is the highest-risk feature Lumira has shipped
It collects a parent's unguarded nightly speech about their child. That is among the most sensitive data a consumer app can hold, and the product actively asks them to open up.

### 18.2 The authenticity risk is measured, not anecdotal

**Everett, Claessens & Veitch, *Computers in Human Behavior* 177:108894 (2026)** — six studies, ~4,000 UK participants. People who used AI for social and relational writing were judged **less warm, less moral, less trustworthy**. The finding that matters most here: **the penalty persisted when AI was only a drafting tool with human finishing, when the use was disclosed, when the AI was personalized on the user's own writing, and when the stated motive was care.** Representative reaction: *"If they cared this much, they'd have done it themselves."* *(High confidence this is the authors' own summary; effect sizes not independently verified — check the paper before quoting numbers.)*

Corroborating: the 2wai "HoloAvatar" backlash (Nov 2025); documented reactions to AI-written wedding vows and eulogies, where **the failure mode is discovery, not use.**

**Assumption, high confidence:** over an eighteen-year horizon, discovery is near-certain. The child will ask, or paste it into a detector, or the parent will tell her. **Design for the post-discovery state.**

**Position on disclosure.** Option (c) — compose and stay silent about authorship — is the one genuinely unacceptable choice, because the deceived party is a future adult who never consented and cannot re-interrogate the parent. Every entry stores provenance: capture date, capture mode (spoken/typed), compose mode (keep_words/shaped), and a **"see what Dad actually said"** view showing the raw transcript beside the entry. Retrievable but not intrusive. If the raw is missing, say so.

### 18.3 Three-layer visibility model

One entry, three layers — not three documents.

| Layer | Contents | Access |
|---|---|---|
| **L0 raw transcript** | Verbatim speech | Parent only. Never rendered elsewhere. |
| **L1 private journal** | The full entry, including partner conflict, birth trauma, loss, custody, mental health | Parent only by default |
| **L2 child-facing book** | The gift artifact | **`child_safe` defaults to false.** Claude may *suggest* passages; the parent confirms every one. |

**Partner access is per-entry opt-in and revocable, never household-wide by default.** A shared-by-default journal becomes discoverable evidence in a custody dispute. That single default is the difference between a diary and a liability.

### 18.4 Escalation design

Deterministic tiering, server-side, **before** composition. The classifier can escalate the UI only. **It must never refuse, edit, or soften what the parent said** — refusing to record a parent's words is itself a harm.

| Tier | Signal | Response | Never |
|---|---|---|---|
| **0 Distress** | Exhaustion, crying, resentment of the day, "I hate this" | Reflect it in the interview. Nothing else. | Resource cards. Tone shift. |
| **1 Common and benign** | Unwanted intrusive thoughts ("what if I dropped her"), rage feeling, no bonding, "I'm a bad mother" | One normalizing sentence with a fact, then **continue the interview**. Soft dismissible line at the end offering someone to talk to. | Modal. Red. Clinical voice. Interrupting the entry. |
| **2 Active risk** | Stated intent or plan of self-harm; intent to harm the baby; psychosis markers (command voices, belief the baby is not hers) | Stop composition. **Fixed non-AI template.** Warm inline card, one tap to 988 and Postpartum Support International (**verify both numbers before ship**). Entry saved to L1 only. | AI-generated wording. Auto-notifying a partner. Blocking the parent from saving. |

**Tier 1 is the whole game.** Intrusive thoughts are near-universal postpartum and clinically benign when ego-dystonic. Treating them as an emergency is the failure mode that ends the relationship and stops them ever speaking again. **Tier 1 copy must be reviewed by a perinatal mental health clinician.**

Log tier, timestamp, model version. **Do not log the triggering text.**

### 18.5 Data handling

| Data | Classification | Location | Retention |
|---|---|---|---|
| Audio | Biometric-adjacent | Device only. Discarded post-transcription unless the parent opts into local retention (§0.3-C) | Never in Supabase |
| Transcript / entry | **SPI (mental health) under CPRA; Art. 9 under GDPR** | Supabase, RLS | Until deleted |
| Model calls | Same | Anthropic API — **zero-retention, no-training term required in writing**, and stated in the policy | Per contract |
| Escalation events | Counts and tiers only | Supabase | 2 years (SB 243 reporting) |
| Export | All layers | JSON + PDF, free, on demand | **Must outlive Lumira** |
| Deletion | Cascading, including backups | ≤30 days | Legacy contact on account death; no automatic transfer |

**On-device STT, honestly.** It buys: no audio at rest, no voiceprint, a smaller breach surface, and no BIPA / CUBI / Washington My Health My Data biometric exposure. **It does not buy** any reduction in transcript sensitivity, nor subpoena or discovery protection, nor CCPA or HBNR scope.

**Two traps.** `SFSpeechRecognizer` falls back to Apple's servers unless `supportsOnDeviceRecognition` is checked *and* `requiresOnDeviceRecognition = true` is forced. Chrome's Web Speech API sends audio to Google. So **"your voice never leaves your phone" is true on iOS with the flag forced and false on web.** Scope the claim per platform or it becomes an FTC Section 5 deception problem. **Recommendation: hard-fail to typing when on-device is unavailable; never silently fall back to a server.**

**COPPA most likely does not apply.** It covers services directed to under-13s or with actual knowledge of collecting personal information *from* a child. The user is an adult; information *about* a baby, supplied by the parent, is not collected from the child. **This flips the moment retained audio or photos capture the child.** The amended Rule's compliance date is April 22, 2026 if it ever does apply.

**GDPR: geofence the EU out of v1.** Explicit Art. 9(2)(a) consent for mental-health content is workable but not worth the v1 cost.

**FTC Health Breach Notification Rule: assume it applies** post-2024 amendments.

**Two-party consent:** roughly 11 all-party states (e.g. CA Penal Code 632). Mitigate cheaply — no always-on listening, mic active only while engaged, visible indicator, audio never persisted server-side, and one onboarding line asking the parent to tell others in the room.

### 18.6 California SB 243 — companion chatbot law

Lumira plausibly **is** a "companion chatbot": adaptive, human-like, sustains a relationship, meets social needs. Private right of action, **$1,000 statutory minimum**. Compliance is cheap: publish the crisis protocol, build the referral, count referrals, report from **July 1, 2027**. Do it.

### 18.7 Ranked exposure

1. One Tier 2 moment handled coldly, screenshotted. **Existential, and no legal fix.**
2. SB 243 non-compliance. Cheap to fix, so inexcusable not to.
3. Breach of journal text. HBNR + state AGs + total trust loss.
4. Overclaiming the privacy line on web. **The likeliest actual enforcement hook.**
5. Shared-by-default partner access in a relationship breakdown.
6. Model vendor training on entries without a zero-retention term.
7. COPPA — only if audio or child media is ever retained.

---

## 19. Data, privacy and analytics

**Instrument these; nothing else matters in the first three weeks.**

| Event | Properties | Why |
|---|---|---|
| `letters_prompt_shown` | trigger_type, local_hour | Notification timing calibration |
| `letters_session_started` | capture_mode, entry_point | Modality split |
| `letters_session_completed` | duration_s, word_count, followups_answered, capture_mode | The core funnel |
| `letters_not_much_tapped` | — | Should be 15–30% |
| `letters_compose_mode` | keep_words \| shaped | **Settles §0.3-A empirically** |
| `letters_transcript_edited` | chars_changed, name_correction_count | **Primary transcription quality metric** |
| `letters_entry_reread` | days_since_written | **The only signal the artifact has value** |
| `letters_compose_failed` | reason, transcript_preserved (must always be true) | P0 monitoring |
| `letters_safety_flag` | tier, category. **Never the text.** | SB 243 reporting |
| `letters_export` | format | Trust signal |

Do **not** measure entries-per-week in week one. It rewards the wrong thing this early.

---

## 20. Customer support and operations

| Burden | Volume | Response |
|---|---|---|
| "It got her name wrong" | **Highest expected volume** | Self-serve learned correction (§17.2). If this generates tickets, the mitigation failed. |
| "This doesn't sound like me" | High in weeks 1–2 | One-tap switch to Keep my words + the edit-as-signal loop |
| "I lost an entry" | Should be **zero**. Treat any instance as a P0 incident. | §15.5 guarantees |
| Tier 2 escalation follow-up | Rare, highest stakes | **A named human owner and a written runbook before launch.** Not a queue. |
| Export and deletion requests | Steady | Fully self-serve; no support path should exist |
| Print orders | Only after §10.3 | Partner-fulfilled; do not own logistics in v1 |

**Recommendation: do not launch Letters without a written crisis runbook and one named person accountable for it.**

---

## 21. Technical architecture

### 21.1 Stack position
Existing: Next.js 14.2 · TypeScript · Tailwind 3.4 · @base-ui/react · Supabase · @anthropic-ai/sdk 0.79 · Vercel. Native: Expo + React Native. Full design-system detail is in the companion document.

**Principle, per the founder's directive: use strongly vetted open source and platform APIs. Build nothing that exists.**

### 21.2 Speech-to-text — recommendation changed

**The original plan (Apple `SFSpeechRecognizer`) has a documented blocker.** Apple's own documentation states the framework *"stops speech recognition tasks that last longer than one minute,"* and documents per-device daily limits and per-app request throttling. A three-minute nightly monologue does not fit. Chunking produces audible seams and dropped words at boundaries — on the one night the parent had something to say.

| Option | License | Long-form | Accents | Custom vocab | Verdict |
|---|---|---|---|---|---|
| Apple `SFSpeechRecognizer` (via `jamsch/expo-speech-recognition`, iOS 17+) | Platform API / MIT wrapper | **~1 min cap** | Weaker on Indian English | **`contextualStrings`** — seed the child's name | **Live partial results only** |
| Apple `SpeechAnalyzer` / `SpeechTranscriber` | Platform API, **iOS 26+** | Yes | Unverified | **Not documented on the class page** | Too new, too narrow a floor, loses `contextualStrings` |
| **`whisper.rn` (whisper.cpp)** | **MIT** | **Yes** — `RealtimeTranscriber` with VAD, auto-slicing, memory management | Whisper handles accented English materially better | Prompt conditioning | **Recommended primary** |

**Recommendation: `whisper.rn` (MIT, mybigday/whisper.rn) as the primary on-device engine**, with Core ML acceleration (iOS 15+) and `expo-speech-recognition` optionally layered for instant live partials. This is exactly the "don't build what exists" call: whisper.cpp is the most battle-tested open-source on-device ASR available, it is MIT, it runs fully offline so the privacy claim holds without caveats, and it has no session cap.

**Costs, stated honestly:** requires Expo prebuild (not Expo Go); ships a model file with the app (size depends on the model chosen — verify the specific Whisper GGML variant's footprint and on-device latency on a real iPhone before committing); first-run model handling must never happen on night one.

**Web: typing only.** MDN lists `SpeechRecognition` as *limited availability, not Baseline*; Chrome's implementation is server-based, which contradicts the privacy line. **Do not offer voice you cannot honor the promise for.**

**Regardless of engine, the deterministic name-correction layer (§17.2) is mandatory** — it is the only mitigation that works on every platform.

### 21.3 Model routing and unit economics

Verified from platform.claude.com (Sept 2026): Sonnet $2/$10 per MTok; Haiku 4.5 $1/$5; cache read 0.1×; batch −50%.

Assumptions, stated: ~6 turns per session; ~600 spoken words ≈ 800 tok; system prompt + 3 exemplars ≈ 4,000 tok, cached.

| Component | Model | Cost/night |
|---|---|---|
| Interview + follow-up phrasing | Haiku 4.5, cached preamble | ~$0.015 |
| Composition ("shaped" mode only) | Sonnet | ~$0.019 |
| **Total, optimized** | | **~$0.034** |
| Naive (all Sonnet, no caching) | | ~$0.082 |

| Scenario | Nights/mo | Cost/user/mo |
|---|---|---|
| Optimized, heavy | 30 | **$1.02** |
| Optimized, realistic | 14 | **$0.48** |

Note that **Keep my words mode costs nearly nothing** — deterministic cleanup, no composition call. If it becomes the default as recommended, unit economics improve substantially.

**Price implication:** hold AI at ≤20% of net revenue; Apple takes 15% (Small Business Program). At $1.02 worst case, the floor is ~$6/mo net → **$8.99/mo or $69/yr**. Comparables: Qeepsake $47.88/$95.88 yr; Huckleberry Plus $68.99/yr, Premium ~$119.99/yr. **$69–79/year sits correctly.** Sell annual as default; monthly at $9.99 as the penalty tier. Ship a **gift SKU at launch**.

### 21.4 Print
Lulu Direct for API-driven fulfilment; Blurb as a premium upsell SKU. Artifact Uprising is beautiful and margin-hostile — wrong partner for a text book. Third-party estimates put a 100-page full-colour premium hardcover near $32.50 + $1.75 fulfilment + shipping; a cream-stock B&W text volume should land materially lower. **Use Lulu's live calculator before committing to a retail price.** Target $89 for the Year One volume.

### 21.5 The native-readiness correction — read this

PRODUCT.md §35.2 lists five architecture decisions claimed to keep the native door open. **Audited against the real code, four of five are false.**

| Claim | Verdict | Evidence |
|---|---|---|
| API-first, no server components in feature code | **FALSE** | `home`, `checkin`, `chat`, `concern`, `history`, `journal`, `profile`, `settings` pages are all async server components calling `createClient()` from `lib/supabase/server` directly |
| Business logic in hooks, not components | **FALSE** | Only 10 hook files; 47 components hold their own state; 17 call fetch/Supabase directly. `hooks/useCheckinThread.ts` — PRODUCT.md's own worked example — is **dead code**, imported only by its test, while `CheckinThread.tsx` (509 lines) reimplements it inline |
| No localStorage for critical state | **FALSE** | Chat's initial-message handoff (sessionStorage), the passkey-enrolled flag gating login UI, milestone-celebration dedup, and guide read-state all live in browser storage. This is product logic, not analytics |
| Design tokens, not framework styles | **PARTIALLY TRUE** | `lib/design-tokens.ts` is real and portable, but components use 402 raw Tailwind class strings instead. Token *values* port; token *consumption* does not |
| Routing maps to React Navigation | **FALSE** | `next/navigation` is called inside reusable components, not just pages |

**Consequence for Saurabh:** the Expo port is a **rewrite of most feature components**, not a renderer swap. Likely **2–3× the effort §35.2 implies.** This is the strongest argument for launching the native app with **Letters only** (§12) — it is new code with no legacy baggage, it directly serves the emotional thesis, and it de-risks the whole approach on one screen before committing to porting four more tabs.

*(Incidental finding: `framer-motion` is a declared dependency with zero production usage — only a Playwright spec. Not a porting concern.)*

---

## 22. Risks, dependencies and open questions

**Dependencies:** Expo + EAS (no App Store binary without it); Apple Developer Program ($99/yr, not yet enrolled — no `eas.json` in the repo); `NSMicrophoneUsageDescription` and `NSSpeechRecognitionUsageDescription` (missing these is an instant rejection); Anthropic zero-retention terms in writing; a perinatal clinician for Tier 1 copy; a privacy attorney; a print partner (post-v1).

**Open questions for Saurabh:**
1. **§0.3-A, B and C** — the three decisions above the line.
2. Does the gamification engine assume every surface emits events? (Determines the cost of the exclusion list.)
3. What is Content tab DAU/WAU? (Determines whether Content or Tribes gets cut.)
4. Should the in-the-moment capture (UC3) ship in v1? Research suggests it may be a bigger win than the nightly ritual.
5. Does Lumira ever *speak* aloud? **Recommendation: no in v1.** If it must, opt-in, TTS for the greeting only, never for follow-ups.
6. Does the audio become the primary keepsake and the text the index? Worth testing — it may be the stronger product.

---

## 23. Success metrics

**Three-week validation gates. Recruit 25–40 real parents.**

| Signal | Read | Threshold |
|---|---|---|
| **Night-2 return rate** | Best single predictor. If they do not come back the second night, nothing later saves it | **>60% good · <40% kill or rebuild** |
| Median session seconds | Drift past 180s means the interview is too greedy | 60–120s |
| `Not much today` share | Healthy, not failure. Zero means undiscoverable | 15–30% |
| Re-entry after first miss | Tests the recovery ladder directly | >50% return within 3 nights |
| **Unprompted re-reads of past entries** | **The only signal the artifact has value.** Retention without this is a habit with no payoff | >30% of parents by week 3 |
| Name-correction rate per entry | Primary transcription quality metric | <10% of entries need a manual name fix |
| Week-3 D1 active | Sanity check against the 3.3% industry base rate | >25% |

**Business gates:** <15% buying a print artifact at $60–99 means this is a $69/yr subscription competing with Tinybeans at their scale — and losing.

---

## 24. Validation plan

**Before writing any composition code**, run these three, in order:

1. **The voice test (one week, 10 parents).** Record five real nightly transcripts each. Generate entries in both modes. Show them without labels and ask which they would put in their child's book. **If parents pick Keep my words, §0.3-A is settled and the composition path shrinks to an opt-in.** This is the cheapest, highest-value experiment available.
2. **The speaking test (one week, 20 parents, no app).** Ask them to send a nightly voice note to a number. Measure completion. **If fewer than 30% complete four of seven nights, the voice-first premise is wrong** and the product is text-first with voice as an option.
3. **The name test (one day).** Ten Indian-English speakers say "Meera" ten times each into both candidate engines. Measure accuracy. This single test decides §21.2.

**Also validate, do not assert:** that non-founder parents feel documentation guilt. Five interviews settle it. **Do not put "parents feel guilty about not documenting" in a deck as fact** — no survey supports it.

---

## 25. Future roadmap themes

Printed volumes and the gift SKU · partner co-authoring with per-entry consent · the second child (where documentation collapses hardest, and the sharpest wedge) · in-the-moment capture as a first-class flow · audio as the primary artifact with text as the index · the child's own voice entering the archive · handover at eighteen.

---

## 26. Final recommendation

**Build it. Change three things first.**

Letters is the strongest idea in Lumira's roadmap and is plausibly a better product than the companion it sits inside. It has a daily trigger where guidance has an episodic one; its value compounds where guidance decays; it produces a sellable artifact where guidance produces text you cannot sell twice; and it carries almost none of the medical-adjacent liability.

The three changes are §0.3-A (default to the parent's literal words), §0.3-B (cut the regret prompt), and §0.3-C (opt-in local audio retention). Each contradicts something in the original framing. Each is better supported by evidence than the original.

**Sequence:** validation experiments 1–3 (two weeks, no code) → Letters as the sole screen of an Expo app → TestFlight with the 25–40 parent cohort → the night-2 gate → then, and only then, decide whether to port the other tabs.

**The single sentence to hold onto:** the product is not a better writer, it is a better interviewer. Ship the question, and the slop problem largely dissolves because there is real material to arrange.

---

# Critical challenges and recommendations

1. **The composition premise is the weakest part of the plan, and the market leader agrees.** Storyworth — the most successful product in this exact mechanic — *deliberately refuses* to rewrite the storyteller's words, and says so in marketing. Remento does compose, and is criticized for flattening voice. Peer-reviewed evidence shows the AI-authorship penalty survives disclosure, human editing, and personalization. **Default to Keep my words.**
2. **The founder's own guilt is the product's biggest design trap.** A product born from documentation guilt can manufacture the debt it sells relief from. YouGov's 77% finding is the warning. No streaks. No guilt marketing. Count what exists.
3. **"What could you have done differently" must not ship.** The evidence is specific and the population is vulnerable. This is the clearest single recommendation in the document.
4. **The child's name will be transcribed wrong, and that alone can destroy the artifact.** Test it before building anything else.
5. **The Expo estimate is wrong by 2–3×** because PRODUCT.md §35's readiness claims are mostly false. Launch native with Letters only.
6. **Apple's STT has a one-minute cap.** Use whisper.cpp. This is also the correct call under "don't build what exists."
7. **A closest-analogue product already died.** Artifact (heyartifact.com) ran the human-interviewer version of this for 3.5 years and shut down. Understand why before assuming demand.
8. **Tier 1 safety copy is the difference between a trusted product and a harmful one.** Pay a perinatal clinician. This is not a place for good instincts.

# What we still need to validate

- Will non-founder parents speak to an app nightly? **No credible longitudinal adherence data for consumer voice journaling exists.** This is a genuine evidence gap, not a gap in the research.
- Do parents accept AI-composed prose as their own voice? (Experiment 1)
- Is documentation guilt real beyond the founder? (Five interviews)
- Whisper vs. Apple accuracy on Indian-English proper nouns. (Experiment 3)
- Will 15%+ buy a printed volume?
- Content tab DAU/WAU, before cutting it.
- Real compose latency and real on-device model footprint on an actual iPhone.
- Whether the "compounding retrospective debt" mechanism is real. Strongly held, no direct study found.

# Cross-functional implications

| Function | Implication |
|---|---|
| **Engineering** | Expo greenfield for one screen; whisper.rn integration + prebuild; deterministic deslop; local-first persistence; token unification (companion doc) |
| **Design** | An entire new interaction language — the aura, the reading view, a serif face; and reconciling three competing button patterns |
| **Content** | Age-banded prompt inventory against **post-2022 CDC ages**; Tier 1 copy; notification copy |
| **Legal** | Privacy policy rewrite for SPI; SB 243 compliance; Anthropic zero-retention terms; EU geofence; per-platform scoping of the privacy claim |
| **Clinical** | Perinatal clinician review of Tier 0/1/2. Non-negotiable |
| **Support** | Crisis runbook with a named owner before launch; name-correction self-serve |
| **Growth** | Gift SKU at launch; annual-default pricing; month-4 print to solve deferred value |
| **Data** | Re-read rate as the north star; safety flags without text |

# MVP recommendation

**One screen, one habit, one artifact.**

Ship Letters as the only screen of an Expo iOS app: nightly notification → armed listening surface → whisper.cpp on-device transcription → name correction → max two rules-selected follow-ups → **Keep my words** cleanup → reading view → timeline → export. Plus the "Not much today" tap and the co-equal typed path. Web keeps a text-only version.

Everything else — composition mode, print, partner sharing, the other four tabs — waits for the night-2 gate.

# What to explicitly avoid in v1

- Any streak, seed, badge, level, or leaderboard in Letters
- "What could you have done differently?"
- Auto-stopping on silence
- A waveform visualization
- A spinner during composition
- Presenting AI-composed prose without provenance
- Server-side audio storage
- Voice capture on web
- Any developmental assessment, reassurance, or advice inside an entry
- Shared-by-default partner access
- Porting Home, Chat, Tribes or Content to native
- Semantic/vector search
- Owning print logistics
- Launching in the EU
- The word "trained" to describe voice matching

---

## Sources

[Everett/Claessens/Veitch — AI in interpersonal communication (SPSP)](https://spsp.org/news/character-and-context-blog/everett-claessens-veitch-ai-interpersonal-communication) · [Baikie & Wilhelm — expressive writing](https://www.cambridge.org/core/journals/advances-in-psychiatric-treatment/article/emotional-and-physical-health-benefits-of-expressive-writing/ED2976A61F5DE56B46F07A1CE9EA9F9F) · [Positive expressive writing review, PLOS ONE](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0308928) · [Talarico & Rubin 2003](https://homepage.villanova.edu/diego.fernandezduque/Teaching/CognitivePsychology/Lectures_and_Labs/s6LongTermMemory/FlashbulbMemory/Talarico%20&%20Rubin%202003.pdf) · [Russell et al. 2014, ALSPAC](https://link.springer.com/article/10.1007/s10802-013-9819-8) · [Zubler et al., Pediatrics 2022 — revised milestones](https://publications.aap.org/pediatrics/article/149/3/e2021052138/184748/Evidence-Informed-Milestones-for-Developmental) · [CDC 15-month milestones](https://www.cdc.gov/act-early/milestones/15-months.html) · [CDC maternal depression](https://archive.cdc.gov/www_cdc_gov/reproductivehealth/vital-signs/identifying-maternal-depression/index.html) · [Duke & Fivush — family history and adolescent identity](https://ncph.org/wp-content/uploads/2013/12/The-power-of-family-history-in-adolescent-identity.pdf) · [JMIR — mental health app engagement](https://www.jmir.org/2019/9/e14567/) · [Lally 2010 — habit formation](https://onlinelibrary.wiley.com/doi/abs/10.1002/ejsp.674) · [YouGov — memory preservation regret](https://today.yougov.com/society/articles/42718-regret-not-preserving-memories-death-loved-ones) · [Golden on baby books](https://www.ldsliving.com/baby-books-have-stressed-out-parents-for-a-century-heres-how-to-cut-the-anxiety-and-guilt/s/10171) · [Ruan et al. — speech vs typing](https://arxiv.org/html/1608.07323v1) · [Schroeder/Kardas/Epley — humanizing voice](https://faculty.haas.berkeley.edu/jschroeder/Publications/SchroederKardasEpley%20Humanizing%20Voice%20Psych%20Science.pdf) · [Apple SFSpeechRecognizer](https://developer.apple.com/documentation/speech/sfspeechrecognizer) · [Apple SpeechTranscriber](https://developer.apple.com/documentation/speech/speechtranscriber) · [whisper.rn](https://github.com/mybigday/whisper.rn) · [expo-speech-recognition](https://github.com/jamsch/expo-speech-recognition) · [MDN SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) · [Kobak et al. — excess LLM vocabulary](https://arxiv.org/html/2406.07016v1) · [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing) · [Anthropic prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) · [Remento pricing](https://help.remento.co/en/articles/8365892-remento-s-pricing-guide) · [Storyworth pricing](https://welcome.storyworth.com/storyworth-pricing) · [Artifact (heyartifact.com)](https://www.heyartifact.com/kids) · [Qeepsake pricing](https://www.qeepsake.com/pages/pricing) · [Tinybeans acquires Qeepsake](https://www.prnewswire.com/news-releases/tinybeans-acquires-qeepsake-creating-the-leading-privacy-first-family-memory-platform-302603273.html) · [Tinybeans FY25](https://announcements.asx.com.au/asxpdf/20250821/pdf/06n4m9jjp1zr87.pdf) · [Day One pricing](https://dayoneapp.com/pricing/) · [Rosebud App Store](https://apps.apple.com/us/app/rosebud-ai-journal-diary/id6451135127) · [Huckleberry pricing](https://huckleberrycare.com/pricing) · [FTC COPPA FAQ](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions) · [FPF on SB 243](https://fpf.org/blog/understanding-the-new-wave-of-chatbot-legislation-california-sb-243-and-beyond/) · [FTC Health Breach Notification Rule](https://www.ftc.gov/legal-library/browse/rules/health-breach-notification-rule) · [RCFP recording consent guide](https://www.rcfp.org/introduction-to-reporters-recording-guide/)
