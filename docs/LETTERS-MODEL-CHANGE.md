# Model change — journaling is the habit, letters are an output

**This supersedes the Letters PRD wherever they conflict. Read this before building.**

## What changed

The PRD made the *letter* the nightly unit. That was wrong, and it reintroduced the exact
failure the physical baby book had: a letter to your daughter is a **performance**, and
performance is what an exhausted parent skips. The founder corrected it.

## The correct model

```
        CAPTURE  (voice or typed, once)
             |
             v
        LOG  (entry_kind='log')          <-- THE HABIT. Always created. Low ceremony.
             |                                Short, factual, unpolished is fine.
             |  optional, on demand
             v
        LETTER  (entry_kind='letter')    <-- THE ARTIFACT. Opt-in.
                                             Composed from ONE log or MANY.
                                             source_entry_ids cites its sources.
                                             letter_span: single|week|month|milestone|custom
```

**Capture happens once. The output kind is a choice made after.**

## Why this is better, in engineering terms

1. **Lower activation energy.** "Log tonight" is a smaller ask than "write something
   worthy of her." PRD S3.1 found the baby book failed on *cost*, not motivation.
2. **It fixes a defect in the PRD.** S17.5 identified that thin transcripts make the model
   pad, and padding is where slop enters. A letter composed from seven logs has real
   material. **Letters get better by being less frequent.**
3. **It decouples the metrics.** Logs measure the habit. Letters measure the artifact.
   The PRD fused them; they are different things.
4. **Letters become an event, not a chore.** A nightly letter is homework. A letter that
   appears at a week boundary, or when a milestone lands, is worth opening.

## Consequences you must honour

- The nightly flow ends at a **saved log**. Composition is never required to finish a night.
  A night is complete the moment the transcript is persisted.
- Offering to make a letter is a **suggestion, never a gate and never a nag**. Good moments
  to offer: a milestone was logged, a week or month boundary, or the parent asks.
- `compose_mode` ('keep_words' | 'shaped' | 'raw') still governs HOW text is produced.
  It is orthogonal to `entry_kind`. A log can be lightly cleaned; a letter can be either
  mode. Both defaults stay as the contract states.
- A letter must cite >=1 source log (`source_entry_ids`, DB-enforced). Never fabricate one.
- One log per baby per day (DB unique index). Letters have no such limit.
- The timeline shows logs and letters together, visually distinct. Letters read as the
  artifact (serif, wider measure); logs read as entries.

## IA consequence

The tab names the **habit**, not the artifact: the tab is **Journal**. Letters live inside
it as a second view (segmented control: Entries | Letters). The elevated centre action
stays **Tonight**. This replaces PRD S14.1's "Letters" tab decision; the rest of S14.1
(Content folds into Home, Tribes deferred, Tonight takes the centre slot) still stands.
