/**
 * @module letters/flags
 * @description Feature gating for Letters. NOTHING in this feature renders or runs
 *   without passing through here. Three independent layers, all must be true:
 *     1. Build-time env kill switch  (NEXT_PUBLIC_LETTERS_ENABLED)
 *     2. Per-cohort rollout          (allowlist / percentage)
 *     3. Per-user setting            (letters_settings.nightly_enabled)
 *   Layer 1 is the emergency stop: flip the env var, redeploy, feature is gone.
 *   No other module may read process.env for Letters flags.
 */

export type LettersFlagContext = {
  profileId: string | null
  /** From letters_settings; null when the row does not exist yet. */
  userEnabled: boolean | null
}

/** Sub-features can be dark-launched independently. Default OFF is deliberate. */
export type LettersSubFlag =
  | 'voice_capture'      // on-device STT path
  | 'shaped_compose'     // AI composition mode (PRD 0.3-A)
  | 'followup_questions'
  | 'audio_retention'    // PRD 0.3-C, opt-in local audio
  | 'print_export'
  | 'partner_sharing'

const DEFAULT_SUBFLAGS: Record<LettersSubFlag, boolean> = {
  voice_capture: true,
  shaped_compose: false,     // OFF until PRD 0.3-A is decided
  followup_questions: true,
  audio_retention: false,    // OFF until PRD 0.3-C is decided
  print_export: false,       // deferred to v1.1
  partner_sharing: false,    // deferred to v1.1
}

function envEnabled(): boolean {
  return process.env.NEXT_PUBLIC_LETTERS_ENABLED === 'true'
}

function envSubFlag(flag: LettersSubFlag): boolean | undefined {
  const raw = process.env[`NEXT_PUBLIC_LETTERS_${flag.toUpperCase()}`]
  if (raw === undefined) return undefined
  return raw === 'true'
}

/** Deterministic 0-99 bucket from a profile id. Stable across sessions. */
export function rolloutBucket(profileId: string): number {
  let h = 0
  for (let i = 0; i < profileId.length; i++) {
    h = (h * 31 + profileId.charCodeAt(i)) | 0
  }
  return Math.abs(h) % 100
}

function rolloutPercent(): number {
  const raw = process.env.NEXT_PUBLIC_LETTERS_ROLLOUT_PCT
  const n = raw ? Number(raw) : 0
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0
}

/** The single entry point. Every Letters surface calls this first. */
export function isLettersEnabled(ctx: LettersFlagContext): boolean {
  if (!envEnabled()) return false
  if (!ctx.profileId) return false
  if (ctx.userEnabled === false) return false
  return rolloutBucket(ctx.profileId) < rolloutPercent()
}

export function isSubFlagEnabled(
  flag: LettersSubFlag,
  ctx: LettersFlagContext
): boolean {
  if (!isLettersEnabled(ctx)) return false
  const override = envSubFlag(flag)
  return override !== undefined ? override : DEFAULT_SUBFLAGS[flag]
}
