/**
 * scripts/build-tokens.ts — DS3 (Design build pipeline)
 *
 * Reads the token source files owned by DS1 (`tokens/primitives.ts`,
 * `tokens/semantic.ts`) and DS2 (`tokens/motion.ts`, `tokens/shadows.ts`)
 * and emits:
 *
 *   1. app/tokens.generated.css — a CSS custom-property block, meant to be
 *      spliced into app/globals.css by DS4 between marker comments. This
 *      script never writes globals.css itself.
 *   2. packages/tokens/theme.native.ts — a plain JS theme object for React
 *      Native (light/dark, resolved shadow props, Reanimated springs).
 *
 * Also prints a diff report comparing the generated CSS against the color
 * tokens that already live in app/globals.css today, because the first run
 * of this script is required to be a zero-visual-diff migration (design
 * spec §2.2). See docs/Lumira-Design-System-iOS.md §1.1 for the citation
 * table used to distinguish a documented, intentional change from a bug.
 *
 * Usage:
 *   npx tsx scripts/build-tokens.ts            # generate + print diff report
 *   npx tsx scripts/build-tokens.ts --check     # exit 1 if generated files are stale
 *
 * No dependencies beyond Node/TS itself (design spec §2.2 explicitly rejects
 * Style Dictionary and Tamagui here so a non-engineer can read this file
 * top to bottom).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * PRODUCER CONTRACT (what tokens/*.ts export — confirmed against DS1's actual
 * tokens/primitives.ts and tokens/semantic.ts, not just the design-spec sketch)
 * ─────────────────────────────────────────────────────────────────────────
 * tokens/primitives.ts
 *   export const primitives: Record<string, unknown>, where each entry is one of:
 *     - a color ramp:  Record<StepKey, string>          e.g. sage['500'] = '#3D8178'
 *     - a singleton:   string                            e.g. white = '#FFFFFF'
 *     - a numeric scale: Record<string, number>          e.g. spacing['0.5'] = 2
 *   This script classifies each entry generically by inspecting its shape (see
 *   classifyPrimitiveGroup below) — it does not hardcode DS1's family names, so
 *   DS1 can add or rename groups without breaking this script, only the shape
 *   contract matters. The one hardcoded exception is unit-handling for a group
 *   literally named "zIndex" (case-insensitive) — z-index has no CSS unit,
 *   which is a fact about CSS, not a DS1 naming convention.
 *
 * tokens/semantic.ts
 *   export const light: <arbitrarily nested object>
 *   export const dark: <arbitrarily nested object>
 *   (also acceptable: export const semantic = { light, dark })
 *   Every leaf is either a string (resolved color), a number, or a
 *   `{ color: string; opacity: number }` node (a translucent layer — resolved
 *   here via withOpacity(), never pre-baked into an rgba() string by DS1, so
 *   this script can emit the CSS `rgba(...)` form and the RN form from one
 *   source — design spec §2.3's "shared withOpacity(hex, alpha) helper").
 *   This script flattens the tree generically (flattenTheme below) rather
 *   than hardcoding role names like "surface"/"accent"/"status", so DS1 can
 *   restructure the tree without breaking this script.
 *
 * tokens/shadows.ts
 *   export const shadows: Record<StepName, ShadowDefinition>       // light
 *   export const shadowsDark: Record<StepName, ShadowDefinition>   // dark
 *   type ShadowDefinition = {
 *     css: string
 *     ios: { shadowColor: string; shadowOpacity: number; shadowRadius: number;
 *            shadowOffset: { width: number; height: number } }
 *     androidElevation: number
 *   }
 *
 * tokens/motion.ts
 *   export const springs: Record<SpringName, {
 *     reanimated: { duration: number; dampingRatio: number }
 *     // apple / framer sub-objects may also be present; unused here.
 *   }>
 *
 * If a file is missing or a shape check fails, this script exits non-zero
 * with a message naming the file, the owning lane, and what was expected —
 * it does not print a raw stack trace.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(SCRIPT_DIR, '..');
const GLOBALS_CSS_PATH = join(REPO_ROOT, 'app/globals.css');
const GENERATED_CSS_PATH = join(REPO_ROOT, 'app/tokens.generated.css');
const NATIVE_THEME_PATH = join(REPO_ROOT, 'packages/tokens/theme.native.ts');

const MARKER_START = '/* LUMIRA-TOKENS:GENERATED:START — do not hand-edit between these markers, run `npx tsx scripts/build-tokens.ts` */';
const MARKER_END = '/* LUMIRA-TOKENS:GENERATED:END */';

// ───────────────────────────── generic helpers ─────────────────────────────

/** Numeric-aware sort so '50' < '100' < '950', not lexicographic. */
function naturalSort(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

/** camelCase / trailing-digit key -> kebab-case CSS var suffix.
 *  surfaceBackground -> surface-background
 *  success500        -> success-500
 */
function toKebab(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([a-zA-Z])(\d)/g, '$1-$2')
    .toLowerCase();
}

const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;
const CSS_COLOR_FN_RE = /^(rgba?|hsla?)\(/i;

function isPlausibleColorValue(v: unknown): v is string {
  return typeof v === 'string' && (HEX_RE.test(v) || CSS_COLOR_FN_RE.test(v));
}

class TokenSourceError extends Error {}

async function loadModule(relPath: string, owner: string): Promise<Record<string, unknown>> {
  const abs = join(REPO_ROOT, relPath);
  if (!existsSync(abs)) {
    throw new TokenSourceError(
      `Missing ${relPath} (owned by ${owner}). This script has nothing to build ` +
      `until that file exists — see the "EXPECTED PRODUCER CONTRACT" comment at ` +
      `the top of scripts/build-tokens.ts for the exports it must provide.`,
    );
  }
  try {
    return (await import(pathToFileURL(abs).href)) as Record<string, unknown>;
  } catch (err) {
    throw new TokenSourceError(`Failed to import ${relPath}: ${(err as Error).message}`);
  }
}

function requireExport<T>(mod: Record<string, unknown>, name: string, file: string, owner: string): T {
  if (!(name in mod)) {
    throw new TokenSourceError(`${file} (owned by ${owner}) does not export \`${name}\`. See the contract comment at the top of this script.`);
  }
  return mod[name] as T;
}

/** hex -> "rgba(r, g, b, alpha)" — design spec §2.3's shared opacity helper. Used to
 *  resolve semantic.ts's `{ color, opacity }` overlay nodes for both CSS and native. */
function withOpacity(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ───────────────────────────── loading + validating ────────────────────────

/** A primitives.ts entry, generically classified by shape — see classifyPrimitiveGroup. */
type PrimitiveGroup =
  | { kind: 'colorRamp'; steps: Record<string, string> }
  | { kind: 'singleton'; value: string }
  | { kind: 'numericScale'; steps: Record<string, number>; unitless: boolean };

type Primitives = Record<string, unknown>;
type SemanticMap = Record<string, string>; // flattened: kebab-free camelCase role -> resolved CSS value
type ShadowDef = {
  css: string;
  ios: { shadowColor: string; shadowOpacity: number; shadowRadius: number; shadowOffset: { width: number; height: number } };
  androidElevation: number;
};
type ShadowMap = Record<string, ShadowDef>;
type SpringMap = Record<string, { reanimated: { duration: number; dampingRatio: number } }>;

/** Classifies one top-level `primitives.<key>` entry by shape (see PrimitiveGroup). */
function classifyPrimitiveGroup(name: string, value: unknown, file: string): PrimitiveGroup {
  if (typeof value === 'string') {
    if (!isPlausibleColorValue(value)) {
      throw new TokenSourceError(`${file}: primitives.${name} = ${JSON.stringify(value)} is a string but not a hex/rgba color.`);
    }
    return { kind: 'singleton', value };
  }
  if (typeof value !== 'object' || value === null) {
    throw new TokenSourceError(`${file}: primitives.${name} must be a color, a color ramp, or a numeric scale — got ${typeof value}.`);
  }
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) throw new TokenSourceError(`${file}: primitives.${name} is an empty object.`);

  const allStrings = entries.every(([, v]) => typeof v === 'string');
  const allNumbers = entries.every(([, v]) => typeof v === 'number');

  if (allStrings) {
    for (const [step, v] of entries) {
      if (!isPlausibleColorValue(v)) throw new TokenSourceError(`${file}: primitives.${name}.${step} = ${JSON.stringify(v)} is not a hex/rgba color.`);
    }
    return { kind: 'colorRamp', steps: value as Record<string, string> };
  }
  if (allNumbers) {
    return { kind: 'numericScale', steps: value as Record<string, number>, unitless: /^z-?index$/i.test(name) };
  }
  throw new TokenSourceError(`${file}: primitives.${name} mixes string and number values — every entry in one group must be the same type.`);
}

function validatePrimitives(raw: unknown, file: string): { primitives: Primitives; groups: Record<string, PrimitiveGroup> } {
  if (typeof raw !== 'object' || raw === null) throw new TokenSourceError(`${file}: \`primitives\` must be an object.`);
  const groups: Record<string, PrimitiveGroup> = {};
  for (const [name, value] of Object.entries(raw as Record<string, unknown>)) {
    groups[name] = classifyPrimitiveGroup(name, value, file);
  }
  return { primitives: raw as Primitives, groups };
}

/** Recursively flattens an arbitrarily-nested semantic.ts theme tree into a flat
 *  camelCase role -> resolved-CSS-value map. A `{ color, opacity }` node (a translucent
 *  layer) is resolved via withOpacity() and treated as one leaf, not recursed into. */
function flattenTheme(node: unknown, path: string[], file: string, out: SemanticMap): void {
  if (typeof node === 'string') {
    out[camelJoin(path)] = node;
    return;
  }
  if (typeof node === 'number') {
    out[camelJoin(path)] = String(node);
    return;
  }
  if (node && typeof node === 'object') {
    const obj = node as Record<string, unknown>;
    if (typeof obj.color === 'string' && typeof obj.opacity === 'number' && Object.keys(obj).length === 2) {
      out[camelJoin(path)] = withOpacity(obj.color, obj.opacity);
      return;
    }
    for (const [k, v] of Object.entries(obj)) flattenTheme(v, [...path, k], file, out);
    return;
  }
  throw new TokenSourceError(`${file}: ${path.join('.')} is ${JSON.stringify(node)} — expected a string, number, or { color, opacity } node.`);
}

function camelJoin(parts: string[]): string {
  return parts.map((p, i) => (i === 0 ? p : p[0].toUpperCase() + p.slice(1))).join('');
}

function validateSemantic(raw: unknown, exportName: string, file: string): SemanticMap {
  if (typeof raw !== 'object' || raw === null) throw new TokenSourceError(`${file}: \`${exportName}\` must be an object.`);
  const out: SemanticMap = {};
  flattenTheme(raw, [], file, out);
  return out;
}

function validateShadows(raw: unknown, exportName: string, file: string): ShadowMap {
  if (typeof raw !== 'object' || raw === null) throw new TokenSourceError(`${file}: \`${exportName}\` must be an object.`);
  for (const [step, def] of Object.entries(raw as Record<string, unknown>)) {
    const d = def as Partial<ShadowDef> | null;
    if (!d || typeof d.css !== 'string' || !d.ios || typeof d.androidElevation !== 'number') {
      throw new TokenSourceError(`${file}: ${exportName}.${step} must be { css, ios: {...}, androidElevation }.`);
    }
  }
  return raw as ShadowMap;
}

function validateSprings(raw: unknown, file: string): SpringMap {
  if (typeof raw !== 'object' || raw === null) throw new TokenSourceError(`${file}: \`springs\` must be an object.`);
  for (const [name, def] of Object.entries(raw as Record<string, unknown>)) {
    const d = def as { reanimated?: { duration?: unknown; dampingRatio?: unknown } } | null;
    if (!d?.reanimated || typeof d.reanimated.duration !== 'number' || typeof d.reanimated.dampingRatio !== 'number') {
      throw new TokenSourceError(`${file}: springs.${name}.reanimated must be { duration: number, dampingRatio: number }.`);
    }
  }
  return raw as SpringMap;
}

/** semantic.ts may export `light`/`dark` directly, or a combined `semantic = {light,dark}`
 *  (DS1's file exports both forms) — accept either so a future rename of one doesn't
 *  break this script as long as the other survives. */
function pickThemeExport(mod: Record<string, unknown>, name: 'light' | 'dark', file: string): unknown {
  if (name in mod) return mod[name];
  const combined = mod['semantic'] as Record<string, unknown> | undefined;
  if (combined && typeof combined === 'object' && name in combined) return combined[name];
  throw new TokenSourceError(`${file} (owned by DS1) exports neither \`${name}\` nor \`semantic.${name}\`. See the contract comment at the top of this script.`);
}

async function loadTokens() {
  const primitivesMod = await loadModule('tokens/primitives.ts', 'DS1');
  const { primitives, groups } = validatePrimitives(requireExport(primitivesMod, 'primitives', 'tokens/primitives.ts', 'DS1'), 'tokens/primitives.ts');

  const semanticMod = await loadModule('tokens/semantic.ts', 'DS1');
  const semanticLight = validateSemantic(pickThemeExport(semanticMod, 'light', 'tokens/semantic.ts'), 'light', 'tokens/semantic.ts');
  const semanticDark = validateSemantic(pickThemeExport(semanticMod, 'dark', 'tokens/semantic.ts'), 'dark', 'tokens/semantic.ts');

  const shadowsMod = await loadModule('tokens/shadows.ts', 'DS2');
  const shadows = validateShadows(requireExport(shadowsMod, 'shadows', 'tokens/shadows.ts', 'DS2'), 'shadows', 'tokens/shadows.ts');
  const shadowsDark = validateShadows(requireExport(shadowsMod, 'shadowsDark', 'tokens/shadows.ts', 'DS2'), 'shadowsDark', 'tokens/shadows.ts');

  const motionMod = await loadModule('tokens/motion.ts', 'DS2');
  const springs = validateSprings(requireExport(motionMod, 'springs', 'tokens/motion.ts', 'DS2'), 'tokens/motion.ts');

  return { primitives, groups, semanticLight, semanticDark, shadows, shadowsDark, springs };
}

// ───────────────────────────── CSS generation ───────────────────────────────

type CssVar = { name: string; value: string };

/** '0.5' -> '0-5', 'px' -> 'px' — matches the existing --space-0-5 style naming already
 *  shipping in app/globals.css, so a numeric-scale key round-trips through the same var name. */
function cssKeySuffix(key: string): string {
  return key.replace(/\./g, '-');
}

function primitiveCssVars(groups: Record<string, PrimitiveGroup>): CssVar[] {
  const out: CssVar[] = [];
  for (const name of Object.keys(groups).sort(naturalSort)) {
    const group = groups[name];
    if (group.kind === 'singleton') {
      out.push({ name: `--${toKebab(name)}`, value: group.value });
    } else if (group.kind === 'colorRamp') {
      for (const step of Object.keys(group.steps).sort(naturalSort)) {
        out.push({ name: `--${toKebab(name)}-${step}`, value: group.steps[step] });
      }
    } else {
      const unit = group.unitless ? '' : 'px';
      for (const step of Object.keys(group.steps).sort(naturalSort)) {
        out.push({ name: `--${toKebab(name)}-${cssKeySuffix(step)}`, value: `${group.steps[step]}${unit}` });
      }
    }
  }
  return out;
}

function semanticCssVars(semantic: SemanticMap): CssVar[] {
  return Object.keys(semantic)
    .sort(naturalSort)
    .map((role) => ({ name: `--${toKebab(role)}`, value: semantic[role] }));
}

function shadowCssVars(shadows: ShadowMap): CssVar[] {
  return Object.keys(shadows)
    .sort(naturalSort)
    .map((step) => ({ name: `--shadow-${step}`, value: shadows[step].css }));
}

function renderCssVarBlock(vars: CssVar[]): string {
  return vars.map((v) => `    ${v.name}: ${v.value};`).join('\n');
}

function generateCss(tokens: Awaited<ReturnType<typeof loadTokens>>): string {
  const primVars = primitiveCssVars(tokens.groups);
  const lightVars = [...primVars, ...semanticCssVars(tokens.semanticLight), ...shadowCssVars(tokens.shadows)];
  const darkVars = [...semanticCssVars(tokens.semanticDark), ...shadowCssVars(tokens.shadowsDark)];

  return [
    MARKER_START,
    '/* Generated by scripts/build-tokens.ts (DS3) from every group in tokens/primitives.ts,',
    '   every leaf of tokens/semantic.ts, and the five shadow steps in tokens/shadows.ts',
    '   (owners: DS1, DS2). Do not hand-edit. Splice this whole block into app/globals.css',
    '   between matching markers — see the console output of build-tokens.ts for exact',
    '   instructions. Typography, legacy --color-*, the shadcn RGB-triplet vars, and',
    '   --shadow-inner/sage/terra/coral are out of scope for this generator and stay',
    '   hand-authored by DS4. */',
    ':root {',
    renderCssVarBlock(lightVars),
    '}',
    '',
    '.dark {',
    renderCssVarBlock(darkVars),
    '}',
    MARKER_END,
    '',
  ].join('\n');
}

// ───────────────────────────── native theme generation ─────────────────────

/** Deterministic TS-literal serializer: sorts every object's keys, no timestamps. */
function serialize(value: unknown, indent = 0): string {
  const pad = '  '.repeat(indent);
  const padIn = '  '.repeat(indent + 1);
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value.map((v) => `${padIn}${serialize(v, indent + 1)}`).join(',\n');
    return `[\n${items},\n${pad}]`;
  }
  const keys = Object.keys(value as Record<string, unknown>).sort(naturalSort);
  if (keys.length === 0) return '{}';
  const entries = keys
    .map((k) => `${padIn}${JSON.stringify(k)}: ${serialize((value as Record<string, unknown>)[k], indent + 1)}`)
    .join(',\n');
  return `{\n${entries},\n${pad}}`;
}

function buildNativeThemeObject(tokens: Awaited<ReturnType<typeof loadTokens>>) {
  const shadowsForScheme = (m: ShadowMap) =>
    Object.fromEntries(Object.entries(m).map(([step, d]) => [step, { ios: d.ios, androidElevation: d.androidElevation }]));

  const springsOut = Object.fromEntries(Object.entries(tokens.springs).map(([name, s]) => [name, s.reanimated]));

  // Primitives never fork by scheme (design spec §2.3) — one copy, passed through as-is
  // (colors, and the spacing/radius/zIndex numeric scales, all as plain JS values; no
  // CSS var() indirection exists in RN). Only semantic + shadows fork into light/dark.
  return {
    primitives: tokens.primitives,
    light: { semantic: tokens.semanticLight, shadows: shadowsForScheme(tokens.shadows) },
    dark: { semantic: tokens.semanticDark, shadows: shadowsForScheme(tokens.shadowsDark) },
    springs: springsOut,
  };
}

function generateNativeTheme(tokens: Awaited<ReturnType<typeof loadTokens>>): string {
  const theme = buildNativeThemeObject(tokens);
  return [
    '/**',
    ' * packages/tokens/theme.native.ts',
    ' * Generated by scripts/build-tokens.ts (DS3) — do not hand-edit.',
    ' * Plain JS theme object for React Native. No CSS custom properties exist in RN, so the',
    ' * semantic tier is forked into light/dark here explicitly (design spec §2.3). Primitive',
    ' * colors do not fork. Shadows resolve to iOS/Android props (source: tokens/shadows.ts,',
    ' * owner DS2). Springs are in react-native-reanimated v4 form: withSpring(value,',
    ' * { duration, dampingRatio }) (source: tokens/motion.ts, owner DS2).',
    ' */',
    '',
    `export const theme = ${serialize(theme)} as const;`,
    '',
    'export type LumiraNativeTheme = typeof theme;',
    '',
  ].join('\n');
}

// ───────────────────────────── globals.css diff report ─────────────────────

/** Extracts the first balanced-brace `{...}` body following `selector {` in `css`, starting the search at or after `from`. Returns [body, endIndex] or null. */
function extractBlock(css: string, selector: string, from = 0): [string, number] | null {
  const openIdx = css.indexOf(`${selector} {`, from);
  if (openIdx === -1) return null;
  const braceStart = css.indexOf('{', openIdx);
  let depth = 0;
  for (let i = braceStart; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') {
      depth--;
      if (depth === 0) return [css.slice(braceStart + 1, i), i + 1];
    }
  }
  return null;
}

function parseDeclarations(block: string): Map<string, string> {
  const noComments = block.replace(/\/\*[\s\S]*?\*\//g, '');
  const out = new Map<string, string>();
  for (const stmt of noComments.split(';')) {
    const m = stmt.match(/^\s*(--[\w-]+)\s*:\s*(.+?)\s*$/s);
    if (m) out.set(m[1], m[2].trim());
  }
  return out;
}

/** Parses the *first* :root{} block and the .dark{} block immediately after it — the main
 *  design-token region at the top of globals.css — not any later, unrelated .dark{} block
 *  further down the file (e.g. the skeleton-loader dark overrides). */
function parseCurrentGlobalsTokens(css: string): { light: Map<string, string>; dark: Map<string, string> } {
  const rootBlock = extractBlock(css, ':root');
  if (!rootBlock) throw new TokenSourceError('Could not find `:root {` in app/globals.css — has its structure changed?');
  const [rootBody, rootEnd] = rootBlock;
  const darkBlock = extractBlock(css, '.dark', rootEnd);
  const darkBody = darkBlock ? darkBlock[0] : '';
  return { light: parseDeclarations(rootBody), dark: parseDeclarations(darkBody) };
}

/** design spec §1.1 — the only source of truth for "this difference is intentional". */
const KNOWN_CITATIONS: { test: (varName: string) => boolean; citation: string }[] = [
  { test: (n) => /^--(coral)-/.test(n), citation: '§1.1 "Coral scale — absent / absent / full 10-shade → Delete — see §3.3. Undocumented drift is the real bug."' },
  { test: (n) => /^--sand-950$/.test(n), citation: '§1.1 "Sand 900 — cited / cited / does not exist → Retire the name; build a real sand 0–950 ramp."' },
  { test: (n) => n === '--terra-50', citation: '§1.1 Terra 50 three-way disagreement — code (#FDF0E6) wins; both docs need correcting, not the code.' },
];

function citeFor(varName: string): string | null {
  return KNOWN_CITATIONS.find((c) => c.test(varName))?.citation ?? null;
}

type DiffRow = { name: string; before: string | undefined; after: string | undefined; status: 'added' | 'removed' | 'changed' };

/** In-scope prefixes: only the var families this generator actually owns. Everything else in
 *  globals.css (spacing, radius, typography, legacy --color-*, shadcn RGB triplets, story-*,
 *  skeleton, --shadow-inner/sage/terra/coral) is untouched and not part of this diff. */
const IN_SCOPE_PREFIXES = [
  // primitive-tier color ramps (current + former family names, so a deletion like
  // coral's is still detected even though the generator no longer produces it)
  'sage-', 'terra-', 'coral-', 'rose-', 'amber-', 'sand-',
  // primitive-tier numeric scales
  'space-', 'radius-', 'z-index-',
  // semantic-tier roles (current legacy flat names + DS1's actual nested-role names)
  'surface-', 'text-', 'success-', 'warning-', 'error-', 'info-',
  'accent-', 'status-', 'border-',
  // shadow steps this generator owns (not --shadow-inner/sage/terra/coral)
  'shadow-xs', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl',
];
const IN_SCOPE_EXACT_NAMES = new Set(['--white', '--black']);

function isInScope(varName: string, generatedNames: Set<string>): boolean {
  if (generatedNames.has(varName) || IN_SCOPE_EXACT_NAMES.has(varName)) return true;
  const bare = varName.replace(/^--/, '');
  return IN_SCOPE_PREFIXES.some((p) => bare.startsWith(p));
}

function diffScope(current: Map<string, string>, generated: CssVar[]): DiffRow[] {
  const genMap = new Map(generated.map((v) => [v.name, v.value]));
  const names = new Set([...current.keys(), ...genMap.keys()].filter((n) => isInScope(n, new Set(genMap.keys()))));
  const rows: DiffRow[] = [];
  for (const name of [...names].sort(naturalSort)) {
    const before = current.get(name);
    const after = genMap.get(name);
    if (before === after) continue;
    if (before === undefined) rows.push({ name, before, after, status: 'added' });
    else if (after === undefined) rows.push({ name, before, after, status: 'removed' });
    else rows.push({ name, before, after, status: 'changed' });
  }
  return rows;
}

function printDiffReport(light: DiffRow[], dark: DiffRow[]): boolean {
  let undocumented = 0;
  const printRows = (label: string, rows: DiffRow[]) => {
    console.log(`\n  ${label} (${rows.length} difference${rows.length === 1 ? '' : 's'})`);
    if (rows.length === 0) {
      console.log('    (none — byte-identical to current app/globals.css for this scope)');
      return;
    }
    for (const r of rows) {
      const citation = citeFor(r.name);
      const tag = r.status.toUpperCase().padEnd(7);
      if (r.status === 'added') console.log(`    [${tag}] ${r.name}: (new) -> ${r.after}`);
      else if (r.status === 'removed') console.log(`    [${tag}] ${r.name}: ${r.before} -> (removed)`);
      else console.log(`    [${tag}] ${r.name}: ${r.before} -> ${r.after}`);
      if (citation) {
        console.log(`             cited: ${citation}`);
      } else if (r.status === 'added') {
        // A brand-new var can't have silently changed anything nothing references yet —
        // the byte-identical guarantee is about existing pixels, so this is informational,
        // not a violation. Still printed above so a human sees every new token.
        console.log('             (new token — no existing usage to regress; no citation required)');
      } else {
        console.log('             ⚠ UNDOCUMENTED — no §1.1 citation found. Add one to docs/Lumira-Design-System-iOS.md §1.1 or fix the generator to match current CSS.');
        undocumented++;
      }
    }
  };
  console.log('── globals.css token diff (generated vs. current, in-scope vars only) ──');
  printRows('Light (:root)', light);
  printRows('Dark (.dark)', dark);
  return undocumented === 0;
}

// ───────────────────────────── main ─────────────────────────────────────────

function printSpliceInstructions(): void {
  console.log('\n── splice instructions for DS4 (app/globals.css owner) ──');
  console.log('  1. Open app/globals.css.');
  console.log('  2. In the :root { ... } block, wrap the primitive, semantic, and --shadow-xs/sm/md/lg/xl');
  console.log('     declarations with:');
  console.log(`       ${MARKER_START}`);
  console.log('       ... (existing declarations for those vars) ...');
  console.log(`       ${MARKER_END}`);
  console.log('     Do the same for the equivalent declarations inside .dark { ... }.');
  console.log('  3. Replace everything between each pair of markers with the matching :root/.dark');
  console.log('     content from app/tokens.generated.css (this script writes that file for you).');
  console.log('  4. Leave --shadow-inner/sage/terra/coral, typography, legacy --color-*, the legacy');
  console.log('     bare --radius, and the shadcn RGB-triplet vars OUTSIDE the markers — this');
  console.log('     generator does not own them.');
  console.log('  5. Re-run `npx tsx scripts/build-tokens.ts --check` after every future token change;');
  console.log('     wire it into CI so a stale splice fails the build.');
}

async function main(): Promise<void> {
  const checkMode = process.argv.includes('--check');

  let tokens: Awaited<ReturnType<typeof loadTokens>>;
  try {
    tokens = await loadTokens();
  } catch (err) {
    if (err instanceof TokenSourceError) {
      console.error(`\n✗ build-tokens.ts cannot run yet:\n\n  ${err.message}\n`);
      process.exitCode = 1;
      return;
    }
    throw err;
  }

  const css = generateCss(tokens);
  const nativeTheme = generateNativeTheme(tokens);

  if (checkMode) {
    const cssStale = !existsSync(GENERATED_CSS_PATH) || readFileSync(GENERATED_CSS_PATH, 'utf8') !== css;
    const nativeStale = !existsSync(NATIVE_THEME_PATH) || readFileSync(NATIVE_THEME_PATH, 'utf8') !== nativeTheme;
    if (cssStale || nativeStale) {
      console.error('✗ Generated token files are stale:');
      if (cssStale) console.error(`  - ${GENERATED_CSS_PATH}`);
      if (nativeStale) console.error(`  - ${NATIVE_THEME_PATH}`);
      console.error('  Run `npx tsx scripts/build-tokens.ts` (without --check) to regenerate.');
      process.exitCode = 1;
      return;
    }
    console.log('✓ Generated token files are up to date.');
    return;
  }

  mkdirSync(dirname(GENERATED_CSS_PATH), { recursive: true });
  mkdirSync(dirname(NATIVE_THEME_PATH), { recursive: true });
  writeFileSync(GENERATED_CSS_PATH, css);
  writeFileSync(NATIVE_THEME_PATH, nativeTheme);
  console.log(`✓ Wrote ${GENERATED_CSS_PATH}`);
  console.log(`✓ Wrote ${NATIVE_THEME_PATH}`);

  let allDocumented = true;
  if (existsSync(GLOBALS_CSS_PATH)) {
    const current = parseCurrentGlobalsTokens(readFileSync(GLOBALS_CSS_PATH, 'utf8'));
    const primVars = primitiveCssVars(tokens.groups);
    const lightVars = [...primVars, ...semanticCssVars(tokens.semanticLight), ...shadowCssVars(tokens.shadows)];
    const darkVars = [...semanticCssVars(tokens.semanticDark), ...shadowCssVars(tokens.shadowsDark)];
    allDocumented = printDiffReport(diffScope(current.light, lightVars), diffScope(current.dark, darkVars));
  } else {
    console.warn(`\n⚠ ${GLOBALS_CSS_PATH} not found — skipping the byte-identical safety check.`);
  }

  printSpliceInstructions();

  if (!allDocumented) {
    console.error('\n✗ One or more undocumented differences found — see ⚠ lines above. Not failing the process, but do not merge until each is either cited in §1.1 or fixed.');
  }
}

main();
