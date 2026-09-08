/**
 * Lumira — Expo app config (STAGED, NOT YET ACTIVE)
 * Lane DO1. Owner of this file per docs/LETTERS-ENGINEERING-CONTRACT.md §5.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * READ THIS FIRST
 *
 * There is no Expo project in this repository. This repo is the Next.js web app.
 * Nothing reads this file today — it is prepared configuration so that the day
 * the Expo app is created, the settings that are expensive to get wrong
 * (bundle id, purpose strings, encryption declaration, secret handling) are
 * already correct.
 *
 * docs/Lumira-Design-System-iOS.md §10.1 says the Expo app should be a SECOND,
 * SEPARATE repo, not a monorepo. When that repo is created, MOVE this file and
 * eas.json into it. Do not `expo prebuild` from here.
 *
 * Step-by-step instructions: docs/APP-STORE-PREP.md
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * NOTE ON TYPES: this file currently lives in the Next.js repo, where the `expo`
 * package is not installed, so it declares the two shapes it needs locally in
 * order to keep `npx tsc --noEmit` green (engineering contract §3).
 *
 * When this file moves into the Expo repo, delete the two local types below and
 * replace them with the real ones — a one-line change:
 *
 *   import type { ExpoConfig, ConfigContext } from 'expo/config'
 */
type ExpoConfig = Record<string, unknown>
type ConfigContext = { config: Partial<ExpoConfig> }

/**
 * Purpose strings. Apple rejects vague ones ("Allow $(PRODUCT_NAME) to use the
 * microphone."). These are deliberately specific about WHEN the microphone is
 * live, WHAT is done with the audio, and WHERE the processing happens.
 *
 * Defined once as constants because two things write them into Info.plist:
 * `ios.infoPlist` below, and the expo-speech-recognition config plugin. If the
 * plugin runs last it overwrites the infoPlist value — passing the same string
 * to both makes the outcome identical either way.
 *
 * ⚠️ TRUTHFULNESS PRECONDITION (Letters PRD §18.5, §21.2)
 * The sentence "transcribed on your iPhone" is only true if the capture layer:
 *   1. transcribes with whisper.rn (whisper.cpp, fully offline), AND
 *   2. where Apple's Speech framework is used at all for live partials, checks
 *      `supportsOnDeviceRecognition` AND forces `requiresOnDeviceRecognition = true`, AND
 *   3. HARD-FAILS to typing when on-device recognition is unavailable — never
 *      silently falls back to a server.
 * If any of those three is not true, these strings become an FTC Section 5
 * deception problem, not just a wording problem. See the REQUEST in the DO1 report.
 */
const MICROPHONE_USAGE =
  'Lumira turns on the microphone only while you are recording a journal entry ' +
  'about your baby, so you can speak instead of type at the end of a long day. ' +
  'Recording starts when you tap record and stops when you tap done. The audio ' +
  'is turned into text on this iPhone and is not uploaded or saved anywhere.'

const SPEECH_RECOGNITION_USAGE =
  'Lumira uses speech recognition on this iPhone to turn what you say during a ' +
  'journal entry into text you can read, edit and delete before it is saved. ' +
  'Speech recognition runs on the device; your recording is not sent to Apple ' +
  'or to Lumira.'

const lumiraAppConfig = ({ config }: ConfigContext): ExpoConfig => ({
  ...config,

  name: 'Lumira',
  slug: 'lumira',
  scheme: 'lumira',

  // ⚠️ Expo account that owns the EAS project. Fill in after `eas login`.
  // Leaving this wrong makes `eas build` push to the wrong account.
  owner: process.env.EXPO_OWNER ?? 'REPLACE_WITH_EXPO_ACCOUNT_NAME',

  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  primaryColor: '#FFFFFF', // TODO(DS1): replace with the Sage semantic token
  assetBundlePatterns: ['**/*'],

  // eas.json sets `cli.appVersionSource: "remote"`, so EAS owns ios.buildNumber.
  // Do NOT add `ios.buildNumber` here — it will fight `autoIncrement`.
  runtimeVersion: { policy: 'appVersion' },

  ios: {
    /**
     * ⚠️ NOT YET REGISTERED with Apple. Design System §10.4 flags this as an
     * open prerequisite. Register it at
     * developer.apple.com → Certificates, Identifiers & Profiles → Identifiers
     * BEFORE the first build (APP-STORE-PREP.md Step 4). A bundle identifier
     * cannot be changed after an app record exists — the app must be recreated.
     */
    bundleIdentifier: 'app.hellolumira',

    supportsTablet: false,

    /**
     * Export compliance. `false` sets ITSAppUsesNonExemptEncryption=NO in
     * Info.plist and stops App Store Connect asking on every single upload.
     *
     * `false` is correct ONLY while the app's encryption is limited to what the
     * OS provides: HTTPS/URLSession to hellolumira.app and Supabase, and Keychain
     * via expo-secure-store. Revisit if audio retention (PRD §0.3-C) ships with
     * any proprietary encryption of local audio files.
     * See APP-STORE-PREP.md §"Export compliance".
     */
    config: {
      usesNonExemptEncryption: false,
    },

    infoPlist: {
      NSMicrophoneUsageDescription: MICROPHONE_USAGE,
      NSSpeechRecognitionUsageDescription: SPEECH_RECOGNITION_USAGE,
      // Lumira does not do background audio capture. No UIBackgroundModes.
      // Never add "audio" here to keep a recording alive — always-on listening
      // is a two-party-consent problem (PRD §18.5).
    },

    /**
     * PrivacyInfo.xcprivacy. Apple rejects submissions containing INVALID
     * privacy manifests, and since 12 February 2025 requires a valid manifest
     * for a set of commonly used third-party SDKs.
     *
     * Left empty on purpose: the required-reason API declarations depend on
     * which Expo modules are actually installed, and most Expo/RN modules ship
     * their own manifest. Fill this in only for APIs Lumira's own code calls.
     * See APP-STORE-PREP.md §"Privacy manifest".
     */
    // privacyManifests: { NSPrivacyAccessedAPITypes: [] },
  },

  plugins: [
    'expo-dev-client',

    /**
     * whisper.rn (MIT, mybigday/whisper.rn) — the primary on-device STT engine
     * per PRD §21.2. It ships NO Expo config plugin: it is a native module that
     * requires `expo prebuild` and a development build. It CANNOT run in Expo Go.
     * Its microphone permission is set through ios.infoPlist above, not a plugin.
     * There is therefore intentionally no 'whisper.rn' entry in this array.
     */

    /**
     * Optional, per PRD §21.2: Apple's SFSpeechRecognizer via
     * jamsch/expo-speech-recognition, used ONLY for instant live partial results
     * while whisper.rn produces the real transcript. Its ~1-minute session cap
     * makes it unusable as the primary engine.
     * Remove this entry entirely if live partials are cut from v1 — an unused
     * NSSpeechRecognitionUsageDescription is a 5.1.1(iii) data-minimization smell.
     */
    [
      'expo-speech-recognition',
      {
        microphonePermission: MICROPHONE_USAGE,
        speechRecognitionPermission: SPEECH_RECOGNITION_USAGE,
      },
    ],

    /**
     * Supabase auth tokens go in the Keychain, never AsyncStorage.
     */
    'expo-secure-store',

    /**
     * Native build knobs for whisper.cpp.
     * ⚠️ UNVERIFIED: the correct `ios.deploymentTarget` depends on the Expo SDK
     * floor at install time AND on whisper.rn's Core ML requirement (PRD §21.2
     * says Core ML acceleration is iOS 15+). Do not hardcode a value from memory
     * — set it at `expo install` time and never set it BELOW the Expo SDK's own
     * minimum. Design System §11 open question 7 makes the same point about
     * reanimated/gesture-handler peer floors.
     */
    [
      'expo-build-properties',
      {
        ios: {
          // deploymentTarget: 'SET_AT_INSTALL_TIME',
        },
      },
    ],
  ],

  /**
   * ───────────────────────────── SECRETS ─────────────────────────────
   * Nothing secret is in this file and nothing secret may be added to it.
   * This file is committed to git and everything it produces ships inside the
   * .ipa, which any user can unpack. Apple's own words (5.1.2) and Expo's own
   * words both apply: anything in client code is public.
   *
   * NEVER in the native app, in any form:
   *   ANTHROPIC_API_KEY          — model calls go through the Next.js API routes
   *                                on Vercel; the native app calls hellolumira.app.
   *   SUPABASE_SERVICE_ROLE_KEY  — bypasses RLS. Server only. Ever.
   *   CONTENT_REFRESH_SECRET, LUMIRA_SYSTEM_PROFILE_ID — server only.
   *
   * Safe to embed (public by design, protected by Supabase RLS, not by secrecy):
   *   EXPO_PUBLIC_SUPABASE_URL
   *   EXPO_PUBLIC_SUPABASE_ANON_KEY
   *   EXPO_PUBLIC_API_URL
   *
   * Note the prefix change: web uses NEXT_PUBLIC_*, Expo uses EXPO_PUBLIC_*.
   * The same Supabase values need to exist under BOTH names.
   *
   * Where the values live: EAS environment variables (`eas env:set`), scoped to
   * the development / preview / production environments that eas.json's
   * `environment` field selects. Visibility "plain text" for these three (they
   * end up in the bundle anyway, and pretending otherwise hides them from you,
   * not from an attacker). Use "sensitive" or "secret" visibility only for
   * values consumed by the BUILD JOB, never for values read by app code.
   *
   * No `??` fallbacks below on purpose: a missing variable should break the
   * build loudly rather than ship an app silently pointed at localhost.
   */
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    apiUrl: process.env.EXPO_PUBLIC_API_URL,

    // Letters feature flags. Mirrors lib/letters/flags.ts §4 of the engineering
    // contract. Kill switch stays false until the native shell is real.
    lettersEnabled: process.env.EXPO_PUBLIC_LETTERS_ENABLED === 'true',
    lettersRolloutPct: process.env.EXPO_PUBLIC_LETTERS_ROLLOUT_PCT,

    eas: {
      // ⚠️ Written by `eas init`. Do not type one in by hand.
      projectId: process.env.EAS_PROJECT_ID ?? 'REPLACE_VIA_EAS_INIT',
    },
  },
})

export default lumiraAppConfig
