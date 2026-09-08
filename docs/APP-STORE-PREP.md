# App Store preparation — Lumira iOS

**Owner:** DO1 (DevOps) · **Status:** preparation only — no Expo project exists yet
**Files this lane owns:** `eas.json`, `app.config.ts`, this document
**Verified against:** Apple developer.apple.com and docs.expo.dev, 8 September 2026.
Every claim below is either linked to a source or explicitly marked **UNVERIFIED**.

---

## 0. Read this before you spend any money

This repo is the Next.js web app. **There is no Expo project, no Xcode project,
and no Apple Developer account.** `eas.json` and `app.config.ts` in the repo root
are *staged* configuration — nothing reads them today. They exist so that the
settings that are painful or impossible to change later are already right.

Two of those are effectively one-way doors:

| Decision | Why it is one-way |
|---|---|
| **Bundle ID `app.hellolumira`** | Cannot be changed once an App Store Connect record exists. Changing it means a new app record, a new App Store listing, and losing any TestFlight history. |
| **Apple Developer enrollment as *individual* vs *organization*** | The individual account lists **your personal legal name** as the seller on the App Store. Moving to an organization later is a support-ticket transfer, not a settings toggle. |

`docs/Lumira-Design-System-iOS.md` §10.1 says the Expo app should be a **second,
separate repo**, not a monorepo. When you create that repo, **move `eas.json` and
`app.config.ts` into it.** Do not run `expo prebuild` inside this Next.js repo.

**Realistic sequencing.** Design System §10.2 puts TestFlight at Phase 2, after an
Expo shell with the Letters screen exists. Steps 1–3 below (enrollment, Expo
account) are worth doing *now* because enrollment involves waiting on Apple.
Steps 4 onward need a real Expo app first.

---

## 1. Sequential runbook

### Step 1 — Apple Developer Program enrollment

**Cost: 99 USD per year** for both Individual/Sole Proprietor and Organization.
(The 299 USD figure is the separate Apple Developer *Enterprise* Program, which
is for in-house distribution and is **not** what Lumira needs.)
Source: [developer.apple.com/support/enrollment](https://developer.apple.com/support/enrollment/)

Requirements Apple states:

- An Apple Account with **two-factor authentication turned on**.
- You must be of the legal age of majority in your region.
- **Individual:** your *personal legal name* is listed as the seller. No alias,
  nickname, or company name in the first/last name fields.
- **Organization:** a legal entity (no DBAs, fictitious business names, trade
  names or branches), a **D-U-N-S Number**, legal binding authority, a **work
  email on the organization's domain**, and a **functional public website on
  that domain** — social media links alone are not accepted.

**Recommendation.** If a legal entity for Lumira exists or is imminent, enrol as
an **organization**. "Lumira" as the App Store seller name reads as a product;
"Saurabh Pareek" as the seller of a parenting app that holds journal transcripts
reads as a side project, and trust is the product here. A D-U-N-S number is free
but takes time to obtain, so start that first if you go this route.

**UNVERIFIED:** how long Apple's enrollment verification takes. Apple's page only
says to contact them if no confirmation arrives within 24 hours of purchase; it
does not publish a verification SLA. Treat the timeline as unknown and start early.

### Step 2 — Expo account and EAS CLI

```
npm install --global eas-cli
eas login
eas whoami
```
Source: [docs.expo.dev/build/setup](https://docs.expo.dev/build/setup/)

Put the account name from `eas whoami` into `app.config.ts` → `owner`
(currently `REPLACE_WITH_EXPO_ACCOUNT_NAME`).

**EAS Build and EAS Submit are required.** Expo's classic build service is retired
and there is no other supported path from an Expo project to an App Store binary.
EAS Submit runs on macOS, Linux and Windows — you do not need a Mac to ship, though
you will want one to run a development build on a physical iPhone.
Source: [docs.expo.dev/submit/ios](https://docs.expo.dev/submit/ios/)

### Step 3 — Create the Expo app (separate repo) and move the config in

Out of scope for this lane. When it exists, copy `eas.json` and `app.config.ts`
into it, delete the two local type aliases at the top of `app.config.ts` and
restore `import type { ExpoConfig, ConfigContext } from 'expo/config'`.

whisper.rn is a native module: it **requires `expo prebuild` and a development
build, and cannot run in Expo Go**. Plan for that from day one — the
`development` profile in `eas.json` sets `developmentClient: true` for exactly
this reason.
Source: [whisper.rn Expo guide](https://mintlify.wiki/mybigday/whisper.rn/platform-guides/expo)

### Step 4 — Register the bundle ID

developer.apple.com → **Certificates, Identifiers & Profiles** → **Identifiers**
→ **+** → App IDs → App → Bundle ID: **`app.hellolumira`** (explicit, not wildcard).

Do this **before** the first build. Note your **Team ID** (10 characters, shown
in Membership details) — it goes into `eas.json` → `submit.*.ios.appleTeamId`.

Capabilities to leave OFF for now: HealthKit, Push Notifications, Sign in with
Apple, Background Modes. Enable them only when a feature actually needs them —
unused entitlements invite Guideline 5.1.1(iii) data-minimization questions.

### Step 5 — Link the project to EAS

```
eas init          # creates the EAS project, writes extra.eas.projectId
eas build:configure
```

`eas init` writes the project id into the app config. Do not type one in by hand.

### Step 6 — Set environment variables (nothing secret in git)

```
eas env:set --name EXPO_PUBLIC_SUPABASE_URL      --value https://<ref>.supabase.co --environment development --visibility plaintext
eas env:set --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value <anon key>                --environment development --visibility plaintext
eas env:set --name EXPO_PUBLIC_API_URL           --value https://hellolumira.app   --environment production  --visibility plaintext
```
Repeat per environment. EAS has three: **development**, **preview**, **production**.
Each build profile in `eas.json` selects one via its `environment` field.
Source: [docs.expo.dev/eas/environment-variables](https://docs.expo.dev/eas/environment-variables/)

**Visibility levels**, in Expo's words:
- *Plain text* — "Visible on the website, in EAS CLI, and in logs."
- *Sensitive* — "Obfuscated in EAS Build and Workflows job logs."
- *Secret* — "Not readable outside of the EAS servers, including on the website and in EAS CLI."

**The trap:** marking a value "secret" does **not** make it secret in your app.
Expo is explicit that "anything that is included in your client-side code should
be considered public." Secret visibility protects values used by the *build job*,
not values read by app code.

**What goes where:**

| Value | In the native app? | Where it lives |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Yes | EAS env var, plain text |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Yes | EAS env var, plain text. Public by design — RLS is what protects the data, not secrecy of this key. |
| `EXPO_PUBLIC_API_URL` | Yes | EAS env var, plain text |
| `EXPO_PUBLIC_LETTERS_ENABLED` / `_ROLLOUT_PCT` | Yes | EAS env var, plain text |
| `ANTHROPIC_API_KEY` | **Never** | Vercel only. The native app calls Lumira's own API routes; those call Anthropic. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Never** | Vercel only. Bypasses RLS. |
| `CONTENT_REFRESH_SECRET`, `LUMIRA_SYSTEM_PROFILE_ID` | **Never** | Vercel only. |
| Apple App Store Connect **API key (.p8)** | n/a | Created and stored by `eas credentials`. **Never commit a .p8 file.** If you ever set `ascApiKeyPath` in `eas.json`, that path must point outside the repo and be gitignored. |

Note the prefix change: web uses `NEXT_PUBLIC_*`, Expo uses `EXPO_PUBLIC_*`. The
Supabase URL and anon key need to exist under **both** names.

### Step 7 — Credentials

```
eas credentials --platform ios
```
Let EAS manage the distribution certificate and provisioning profiles (the
default, `credentialsSource: "remote"`). Use the same command to create the
**App Store Connect API Key**, which is what EAS Submit uses for automated
uploads. The alternative — an app-specific password via
`EXPO_APPLE_APP_SPECIFIC_PASSWORD` — is the fallback, not the recommendation.
Source: [docs.expo.dev/submit/ios](https://docs.expo.dev/submit/ios/)

For the `development` profile (ad-hoc internal distribution) you must register
the **UDID of every physical iPhone** you install on: `eas device:create`.

### Step 8 — First development build

```
eas build --platform ios --profile development
```
Install on your own iPhone. This is where you find out whether whisper.rn's model
file, first-run download behaviour and on-device latency are acceptable — Design
System §11 lists real on-device latency and model footprint as an open question,
and PRD §21.2 warns that **first-run model handling must never happen on night one**.
Answer that before you invite a single parent.

### Step 9 — Create the App Store Connect record

appstoreconnect.apple.com → **Apps** → **+** → New App.

- Platform iOS · Name (must be globally unique on the App Store) · Primary
  language · **Bundle ID: `app.hellolumira`** (appears once Step 4 is done) · SKU.
- **Primary category:** Lifestyle. **Do not choose Medical.** Medical is a
  category that invites the strictest review and implies clinical function.
  Health & Fitness is defensible but Lifestyle is the honest fit for a journal.
- Note the **Apple ID** number shown under App Information → General Information.
  That is `ascAppId` in `eas.json` (replace both `REPLACE_WITH_...` placeholders).
- **Age rating:** answer honestly. Lumira contains no objectionable content, but
  user-generated journal text is private to its author and not shared, which is
  materially different from social UGC. Say so if the questionnaire allows.
- **Privacy policy URL is mandatory** and must also be reachable *inside* the app
  (Guideline 5.1.1(i)).

### Step 10 — TestFlight build and internal testers

```
eas build --platform ios --profile preview
eas submit --platform ios --profile preview
```

The `preview` profile uses `distribution: "store"` on purpose — TestFlight builds
are App Store Connect builds. `distribution: "internal"` is ad-hoc install-by-URL
and never reaches TestFlight.

Apple's limits: **up to 100 internal testers** (App Store Connect users with
access to your content), **up to 10,000 external testers**, and a build is
testable for **90 days**. When you add the first build to a group it goes to Beta
App Review; Apple states review is required only for the first build in a group.
Source: [TestFlight overview](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview)

**Important for the Phase-2 parent cohort.** Design System §10.2 plans a 25–40
parent cohort. Do **not** make them internal testers — internal testers are App
Store Connect users, which means giving 30 strangers access to your developer
account. Use an **external** TestFlight group with a public link. That group's
first build goes through Beta App Review, so budget review time before the cohort
date. Internal testers should be you and at most one or two collaborators.

---

## 2. App Privacy nutrition label

You complete this in App Store Connect → App Privacy. It is mandatory, it is
public on your product page, and for Lumira it is also a trust artifact: parents
who are deciding whether to speak freely into a microphone will read it.

**Apple's definition of "collect"** is the hinge:

> "Collect" refers to transmitting data off the device in a way that allows you
> and/or your third-party partners to access it for a period longer than what is
> necessary to service the transmitted request in real time.

And, critically for Lumira:

> Data processed only on-device is NOT "collected" ... However, if you derive
> anything from that data and send it off-device, the resulting data must be disclosed.

Source: [Apple — App privacy details](https://developer.apple.com/app-store/app-privacy-details/)

**That is exactly Lumira's shape.** Audio is on-device only and is therefore not
"Audio Data" collection. The *transcript derived from it* leaves the device and
**must** be declared. Declaring "we collect nothing because it's on-device" would
be false, and it is the single most likely place for this label to go wrong.

### Recommended declaration

| Category → Type | Collected? | Linked to user? | Purpose | Reasoning |
|---|---|---|---|---|
| **User Content → Other User Content** | **Yes** | **Linked** | App Functionality | Journal logs and letters. Stored in Supabase against the user's row, retrievable by them. This is the core declaration. |
| **User Content → Audio Data** | **No** | — | — | Audio is transcribed on device and discarded. **Becomes Yes if PRD §0.3-C opt-in local audio retention ever syncs audio to a server.** Today the flag `audio_retention` defaults OFF and audio is local-only, so No is correct. |
| **Contact Info → Email Address** | **Yes** | **Linked** | App Functionality | Supabase auth identity. |
| **Contact Info → Name** | **Yes**, if collected | **Linked** | App Functionality | Parent name and baby name from onboarding. If onboarding does not ask, drop this row. |
| **Health & Fitness → Health** | **Yes — recommended** | **Linked** | App Functionality | See the judgement call below. |
| **Sensitive Info → Sensitive Info** | **Judgement call** | **Linked** if declared | App Functionality | Apple's definition includes pregnancy/childbirth information. If onboarding or prompts ask about birth or delivery, declare it. |
| **Identifiers → User ID** | **Yes** | **Linked** | App Functionality, Analytics | Supabase profile id. |
| **Identifiers → Device ID** | Only if an SDK sets one | Linked | Analytics | Declare only if a real SDK does this. |
| **Usage Data → Product Interaction** | **Yes** | **Linked**, unless stripped | Analytics | PRD §19 events. If those events carry the profile id — and they do — this is **Linked**, not Not Linked. Do not claim Not Linked for convenience. |
| **Diagnostics → Crash Data / Performance Data** | Yes if a crash SDK ships | Depends on SDK | App Functionality | Declare when Sentry or equivalent is added, not before. |
| **Purchases → Purchase History** | Not yet | Linked when it ships | App Functionality | Declare when the paid tier launches (PRD §21.3). |
| Location, Contacts, Financial Info, Browsing History, Search History | **No** | — | — | Lumira collects none of these. Keep it that way. |
| **Data Used to Track You** | **None** | — | — | No ad SDKs, no data brokers, no third-party ad measurement. This means **no App Tracking Transparency prompt is needed** — do not add one. |

### The Health & Fitness judgement call — read this properly

Design System §10.4 says "no special health category applies." That is true about
the App Store *category*. It is not automatically true about the *privacy label*.

The case for declaring Health:
- PRD §18.5 classifies transcripts as **SPI (mental health) under CPRA and
  Article 9 under GDPR**. It is hard to hold that position in a privacy policy and
  simultaneously tell Apple no health data is collected.
- PRD §18.4 has a server-side classifier that derives a distress/risk tier from
  the parent's words *before* composition, and stores that tier for two years.
  That is a health-adjacent inference stored server-side, not just free text.
- The transcripts routinely contain infant feeding, sleep and illness, and
  parental mental health.

The case against: Lumira does not use HealthKit and never asks for a structured
health field. A defensible narrower reading is that Health means data collected
*as health data*, not free text that happens to contain it.

**Recommendation: declare Health & Fitness → Health, Linked to You, App
Functionality.** Over-declaring costs a line on the product page. Under-declaring
on a parenting app that holds mental-health-adjacent journal text is a rejection
risk and, far worse, a betrayal-of-trust story if a journalist ever compares the
label against the privacy policy. **Route this through the privacy attorney PRD
§18 already says to budget for** — this is precisely the call they exist to make.

### Third-party AI sharing — a separate, mandatory disclosure

Guideline 5.1.2(i), current text:

> "You must clearly disclose where personal data will be shared with third
> parties, **including with third-party AI**, and obtain explicit permission
> before doing so."

Lumira sends journal transcripts to the Anthropic API. That is personal data
shared with a third-party AI provider. This obligation is **not** satisfied by the
nutrition label. It requires:
1. Explicit disclosure in the privacy policy naming Anthropic and what is sent.
2. **Explicit permission** from the parent before the first transcript is sent —
   an in-product consent moment, not a buried ToS line.
3. The zero-retention, no-training term PRD §18.5 already requires in writing.

This is the most commonly missed requirement for AI-backed apps and it applies to
Lumira on night one.

---

## 3. Guideline 1.4.1 — physical harm

Current text, quoted in full:

> **1.4.1** Medical apps that could provide inaccurate data or information, or
> that could be used for diagnosing or treating patients may be reviewed with
> greater scrutiny.
> - Apps must clearly disclose data and methodology to support accuracy claims
>   relating to health measurements, and if the level of accuracy or methodology
>   cannot be validated, we will reject your app. For example, apps that claim to
>   take x-rays, measure blood pressure, body temperature, blood glucose levels,
>   or blood oxygen levels using only the sensors on the device are not permitted.
> - **Apps should remind users to check with a doctor in addition to using the app
>   and before making medical decisions.**
>
> If your medical app has received regulatory clearance, please submit a link to
> that documentation with your app.

Source: [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

### What could trigger it in Lumira

| Trigger | Where it lives |
|---|---|
| Copy that answers "is this normal?" as a determination rather than an orientation | The weekly guide and concern flows |
| Milestone framing that reads as a developmental screen ("your baby should be doing X by week Y") | Content, age-band prompts |
| The Tier 1 mental-health response reading as a clinical assessment of the parent | PRD §18.4 |
| Any wording near the AI that resembles "assess", "screen", "diagnose", "evaluate", "your baby has" | Everywhere |
| App Store description or screenshots implying medical guidance | Marketing metadata — reviewers read this too |

Parenting-adjacent apps holding infant health content should expect **closer
manual review**, and the reviewer will read your description before opening the app.

### How the existing design already answers it

- **The disclaimer.** A visible, non-buried statement that Lumira is not medical
  advice, present at onboarding, in settings, and inside every concern flow —
  not only in a ToS. Apple's second bullet is close to a literal requirement:
  Lumira should **remind parents to check with their doctor**, in product, at the
  points where a health question is actually being discussed.
- **The escalation design (PRD §18.4)** is the strongest argument you have.
  Deterministic server-side tiering, a **fixed non-AI template** at Tier 2 with a
  one-tap route to 988 and Postpartum Support International, and a classifier that
  can escalate the UI but **never refuses, edits or softens what the parent said**.
  That is a designed safety boundary, not a hope that the model behaves.
- **No sensor measurement claims.** Lumira measures nothing with the device
  sensors, which sidesteps the entire "cannot validate accuracy" rejection path.
  Never add one.
- **Tier 1 restraint.** Treating near-universal intrusive thoughts as an emergency
  is both the clinical failure mode and the thing that makes an app look like it
  is practising medicine badly. PRD §18.4 already requires perinatal-clinician
  review of Tier 1 copy. Do it before submission, not after.

### Practical submission actions

1. **Verify the 988 and Postpartum Support International numbers immediately
   before shipping** — PRD §18.4 flags them as unverified and a dead crisis number
   is the worst possible defect in this product.
2. **Write App Review notes** (App Store Connect → Version → Notes for Reviewer)
   explaining in three short paragraphs: Lumira is a private journal, not a
   diagnostic tool; here is the disclaimer and where it appears; here is the
   safety escalation design and the crisis resources. Reviewers do read these,
   and this pre-empts the question that would otherwise become a rejection.
3. **Provide a demo account with seeded data.** A reviewer who cannot get past
   onboarding rejects on Guideline 2.1. Seed it with benign content.
4. **Audit the App Store description and screenshots** for any implied medical
   claim. This is the cheapest rejection to avoid and the easiest to cause.

---

## 4. Guideline 5.1.1 — data collection and storage

Verbatim requirements that bind Lumira:

- **5.1.1(i) Privacy Policies** — a link in App Store Connect metadata **and**
  inside the app, easily accessible. It must identify what data is collected, how,
  and all uses; confirm third parties provide equal protection; and "explain its
  data retention/deletion policies and describe how a user can revoke consent
  and/or request deletion."
- **5.1.1(ii) Permission** — consent for collection, and "an easily accessible and
  understandable way to withdraw consent." Also: "Ensure your purpose strings
  clearly and completely describe your use of the data."
- **5.1.1(iii) Data Minimization** — "Apps should only request access to data
  relevant to the core functionality of the app and should only collect and use
  data that is required to accomplish the relevant task."
- **5.1.1(v) Account Sign-In** — "If your app supports account creation, you must
  also offer account deletion within the app."

### Lumira's checklist against these

| Requirement | Status / action |
|---|---|
| Privacy policy reachable in-app | **Must build.** Settings link at minimum. |
| Policy states retention and deletion | PRD §18.5 promises cascading deletion including backups within 30 days. Say that in the policy, then make it true. |
| Policy names third parties | Supabase, Vercel, Anthropic. Anthropic is required by 5.1.2(i). |
| **In-app account deletion** | **Mandatory, and a common rejection cause.** Must delete the account, not just sign out, and must be reachable without contacting support. |
| Withdraw consent | The Letters per-user setting (`letters_settings.nightly_enabled`) plus a clear "stop using voice" path. |
| Microphone permission timing | **Request at the moment of the first recording, not at launch.** Requesting mic access on a splash screen is the classic 5.1.1(iii)/(iv) flag. |
| No unnecessary permissions | No Contacts, no Photos, no Location, no Camera, no HealthKit, no push until a feature needs it. |
| Purpose strings specific | Done in `app.config.ts` — they name the moment, the processing location and the retention. Vague strings are rejected. |
| Partner sharing | PRD §18.3: per-entry opt-in, revocable, never household-wide by default. Aligns with 5.1.2(ii) — data collected for one purpose may not be repurposed without further consent. |
| Data minimization on analytics | PL4's event schema should carry ids, counts, tiers and durations — **never transcript text**. Engineering contract §1.5 makes this a hard boundary already. |

---

## 5. Export compliance / encryption

App Store Connect asks about encryption on **every** submission unless you answer
it in the Info.plist. `app.config.ts` sets
`ios.config.usesNonExemptEncryption: false`, which writes
`ITSAppUsesNonExemptEncryption = NO`.

Apple's wording:

> Set the value to `NO` if your app—including any third-party libraries it links
> against—doesn't use encryption, or if it only uses forms of encryption that are
> exempt from export compliance documentation requirements. Otherwise, set it to `YES`.
>
> Typically, the use of encryption that's built into the operating system—for
> example, when your app makes HTTPS connections using URLSession—is exempt from
> export documentation upload requirements, whereas the use of proprietary
> encryption is not.

Source: [Complying with Encryption Export Regulations](https://developer.apple.com/documentation/security/complying-with-encryption-export-regulations)

**`NO` is correct for Lumira today**, because the app's encryption is limited to
HTTPS to hellolumira.app and Supabase, plus the Keychain via expo-secure-store —
all OS-provided. **Re-evaluate if** PRD §0.3-C local audio retention ships with
any custom encryption of local audio files, or if any at-rest encryption is
hand-rolled rather than delegated to the OS.

**One thing people miss.** Apple notes that even *exempt* apps may owe a filing:

> If your app uses exempt forms of encryption, you might alternatively be required
> to submit a year-end self-classification report to the U.S. government.

**UNVERIFIED for Lumira specifically:** whether this annual BIS self-classification
report obligation applies to a US-distributed app in Lumira's position. It is a
US export-control question, not an Apple question. Put it to the attorney PRD §18
already budgets for; do not assume either way from this document.

---

## 6. Privacy manifest (`PrivacyInfo.xcprivacy`)

Separate from the nutrition label and separately enforced:

> App Store Connect rejects app submissions that include invalid privacy manifest
> files. ... Starting February 12, 2025, apps you submit for review in App Store
> Connect must contain a valid privacy manifest file for a certain number of
> commonly used third-party SDKs.

Source: [Adding a privacy manifest](https://developer.apple.com/documentation/bundleresources/adding-a-privacy-manifest-to-your-app-or-third-party-sdk)

Expo exposes this through `ios.privacyManifests` in the app config. It is left
commented out in `app.config.ts` on purpose: the required-reason API declarations
depend on which modules are actually installed, and most Expo and React Native
modules ship their own manifest. Fill it in once the dependency list is real, and
only for APIs Lumira's own code calls.

**UNVERIFIED:** whether whisper.rn ships a privacy manifest. Check its bundle
before the first submission; a missing or invalid one from a dependency is a
hard rejection and the fix has to come from the SDK author.

---

## 7. Pre-submission checklist

- [ ] Bundle ID `app.hellolumira` registered; Team ID and `ascAppId` filled into `eas.json`
- [ ] Privacy policy live, linked in App Store Connect **and** in-app
- [ ] In-app account deletion works and actually deletes
- [ ] Nutrition label completed, including User Content → Other User Content as **Linked**
- [ ] Anthropic disclosed in the policy **and** explicit in-product consent before the first transcript is sent
- [ ] Zero-retention / no-training term with Anthropic in writing
- [ ] Disclaimer visible at onboarding, in settings, and in every concern flow
- [ ] "Check with your doctor" reminder present where health topics are discussed
- [ ] 988 and Postpartum Support International numbers re-verified this week
- [ ] Tier 1 copy reviewed by a perinatal mental health clinician
- [ ] Tier 2 path uses the fixed non-AI template, tested end to end
- [ ] On-device STT verified: `requiresOnDeviceRecognition` forced, hard-fail to typing, no silent server fallback
- [ ] Microphone permission requested at first recording, not at launch
- [ ] App Review notes written; demo account seeded and tested
- [ ] Description and screenshots contain no medical claim
- [ ] EU geofenced out of v1 (PRD §18.5) — reflected in App Store territory selection
- [ ] No `.p8` key, `.mobileprovision`, or certificate committed to git

---

## 8. Everything in this document I could not verify

| Item | Status |
|---|---|
| Apple enrollment verification duration | **Unverified.** Apple publishes no SLA. |
| Whether Lumira owes a BIS annual self-classification report | **Unverified.** US export-control question for counsel. |
| Correct `ios.deploymentTarget` for whisper.rn + Core ML | **Unverified.** Set at `expo install` time against the actual Expo SDK floor; do not hardcode. Design System §11 Q7 makes the same point for reanimated/gesture-handler. |
| Whether whisper.rn ships a valid `PrivacyInfo.xcprivacy` | **Unverified.** Inspect before first submission. |
| Whether Health & Fitness → Health must be declared | **Judgement call, not a verified rule.** Recommendation above is to declare; the decision belongs to the privacy attorney. |
| Whether "Sensitive Info" applies via pregnancy/childbirth content | **Judgement call.** Depends on what onboarding asks. |
| Beta App Review for internal-only groups | **Partially verified.** Apple states review is required when the first build is added to a group; the internal-only exemption is widely relied on but is not stated in the wording quoted here. Assume review may occur and do not schedule the cohort tightly. |
| Whisper model file size and on-device latency | **Unverified.** PRD §21.2 and Design System §11 Q3 both flag it. Measure on a real iPhone at Step 8. |
| `resourceClass` / `requireCommit` in `eas.json` | **Deliberately omitted.** Not confirmed in the schema documentation fetched, so not written from memory. Add `cli.requireCommit: true` later if you want builds blocked on a dirty working tree. |
| Current App Store Connect UI wording | Screens change. Field *names* here match Apple's documentation; the exact click path may differ. |

**Schema targeted:** `eas.json` is written against the EAS CLI schema documented
at docs.expo.dev on 8 September 2026, with `cli.version: ">= 23.2.0"` (23.2.0 is
the current published `eas-cli`). `appVersionSource: "remote"` is Expo's
recommended behaviour from EAS CLI 12.0.0 onward, and EAS therefore owns
`ios.buildNumber` — which is why `app.config.ts` deliberately does not set one.
