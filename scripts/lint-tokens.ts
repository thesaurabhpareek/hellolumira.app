/**
 * scripts/lint-tokens.ts — DS3 (Design build pipeline)
 *
 * Governance check from docs/Lumira-Design-System-iOS.md §2.1. Hand-rolled
 * regex scan, no dependencies — this is exactly the check that would have
 * caught premium-card.tsx hardcoding its own `rgba(0, 0, 0, 0.06)` shadow.
 *
 * Fails (non-zero exit) when:
 *   1. A file in components/ or app/ contains a raw hex color or an rgba()/
 *      rgb()/hsla()/hsl() literal outside the tokens/ directory.
 *   2. tokens/components.ts (component tier) imports from tokens/primitives
 *      directly — the three-tier rule (§2.1) says component may only
 *      reference semantic, semantic may only reference primitive.
 *
 * Usage:
 *   npx tsx scripts/lint-tokens.ts
 *
 * Allowlisting a genuinely unavoidable case:
 *   - Inline: add `// lint-tokens-allow: <reason>` as a trailing comment on
 *     the offending line.
 *   - File-wide / narrow: add an entry to ALLOWLIST below with a reason.
 *     Keep this list short — it is reviewed, not a way to silence the tool.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(SCRIPT_DIR, '..');
const SCAN_DIRS = ['components', 'app'];
const SCAN_EXTENSIONS = new Set(['.ts', '.tsx']);
const EXCLUDE_DIR_SEGMENTS = new Set(['node_modules', '.next', 'tokens']);

/**
 * Narrow, documented allowlist for hex/rgba literals that cannot reasonably
 * go through a token. Match on repo-relative file path + a substring of the
 * offending line, so an allowlist entry cannot silently cover unrelated
 * lines added later in the same file.
 */
const ALLOWLIST: { file: string; lineIncludes: string; reason: string }[] = [
  // Example shape — remove once a real case exists:
  // { file: 'components/app/Confetti.tsx', lineIncludes: '#FFD700', reason: 'per-particle random gold glitter — not a design-system color' },
];

type Violation = { file: string; line: number; text: string; kind: string };

const HEX_RE = /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
// rgb(var(--x)) / rgba(var(--x)/<alpha>) is the *intended* pattern (semantic token consumption)
// — only flag when the function is called with a literal numeric channel, not `var(`.
// No `\b` before the function name: Tailwind arbitrary-value syntax glues it to the previous
// token with an underscore (e.g. `shadow-[0_2px_rgba(0,0,0,.06)]`), which is not a `\b`
// boundary — use a negative lookbehind for a preceding letter instead, so `myRgba(` (an
// identifier) still doesn't match but `_rgba(` / `-rgba(` / `(rgba(` do.
const COLOR_FN_RE = /(?<![A-Za-z])(rgba?|hsla?)\(\s*\d/g;

/** Blanks out comment content but preserves every newline, so the line count — and
 *  therefore line numbers — of the stripped text stays identical to the original. A
 *  version that collapsed a multi-line /* *\/ comment's internal newlines to spaces
 *  would silently shift every later line index out of alignment, which would drop
 *  real violations rather than just mis-number them. */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/\/\/.*$/gm, (m) => ' '.repeat(m.length));
}

function isAllowlisted(fileRel: string, lineText: string): boolean {
  return ALLOWLIST.some((e) => e.file === fileRel && lineText.includes(e.lineIncludes));
}

function scanFileForRawColors(absPath: string, fileRel: string): Violation[] {
  const original = readFileSync(absPath, 'utf8');
  const lines = original.split('\n');
  const strippedLines = stripComments(original).split('\n'); // same length as `lines`
  const violations: Violation[] = [];

  for (let i = 0; i < lines.length; i++) {
    const clean = strippedLines[i];
    const kinds: string[] = [];
    HEX_RE.lastIndex = 0;
    if (HEX_RE.test(clean)) kinds.push('raw hex color');
    COLOR_FN_RE.lastIndex = 0;
    if (COLOR_FN_RE.test(clean)) kinds.push('raw rgba()/rgb()/hsla()/hsl() literal');
    if (kinds.length === 0) continue;

    const rawLine = lines[i];
    if (rawLine.includes('lint-tokens-allow:')) continue;
    if (isAllowlisted(fileRel, rawLine)) continue;
    for (const kind of kinds) violations.push({ file: fileRel, line: i + 1, text: rawLine.trim(), kind });
  }
  return violations;
}

function walk(dir: string, files: string[] = []): string[] {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir)) {
    if (EXCLUDE_DIR_SEGMENTS.has(entry)) continue;
    const abs = join(dir, entry);
    const st = statSync(abs);
    if (st.isDirectory()) walk(abs, files);
    else if (SCAN_EXTENSIONS.has(extname(entry))) files.push(abs);
  }
  return files;
}

function checkRawColors(): Violation[] {
  const violations: Violation[] = [];
  for (const dir of SCAN_DIRS) {
    for (const abs of walk(join(REPO_ROOT, dir))) {
      const rel = relative(REPO_ROOT, abs);
      violations.push(...scanFileForRawColors(abs, rel));
    }
  }
  return violations;
}

/** Component tier (tokens/components.ts) may only reference the semantic tier. */
function checkComponentTierReferencesSemantic(): { violations: Violation[]; skipped: boolean } {
  const path = join(REPO_ROOT, 'tokens/components.ts');
  if (!existsSync(path)) return { violations: [], skipped: true };

  const rel = relative(REPO_ROOT, path);
  const original = readFileSync(path, 'utf8');
  const lines = original.split('\n');
  const violations: Violation[] = [];

  // A component-tier file legitimately importing anything from '.../primitives' at all is
  // the violation — the tier rule (§2.1) is "component may only reference semantic", full stop.
  const importRe = /import\s+(?:\*\s+as\s+\w+|\{[^}]+\})\s+from\s+['"][^'"]*primitives['"]/;
  lines.forEach((line, i) => {
    if (!importRe.test(line)) return;
    if (line.includes('lint-tokens-allow:') || isAllowlisted(rel, line)) return;
    violations.push({ file: rel, line: i + 1, text: line.trim(), kind: 'component tier imports tokens/primitives directly (must go through tokens/semantic)' });
  });

  return { violations, skipped: false };
}

function printViolations(violations: Violation[]): void {
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  [${v.kind}]`);
    console.error(`    ${v.text}`);
  }
}

function main(): void {
  console.log('── lint-tokens: scanning components/ and app/ for raw color literals ──');
  const rawColorViolations = checkRawColors();
  if (rawColorViolations.length === 0) {
    console.log('  ✓ no raw hex/rgba literals found outside tokens/');
  } else {
    console.error(`  ✗ ${rawColorViolations.length} violation(s):\n`);
    printViolations(rawColorViolations);
  }

  console.log('\n── lint-tokens: checking tokens/components.ts references semantic, not primitive ──');
  const { violations: tierViolations, skipped } = checkComponentTierReferencesSemantic();
  if (skipped) {
    console.log('  (tokens/components.ts does not exist yet — nothing to check)');
  } else if (tierViolations.length === 0) {
    console.log('  ✓ tokens/components.ts does not import tokens/primitives directly');
  } else {
    console.error(`  ✗ ${tierViolations.length} violation(s):\n`);
    printViolations(tierViolations);
  }

  const total = rawColorViolations.length + tierViolations.length;
  if (total > 0) {
    console.error(`\n✗ lint-tokens failed: ${total} violation(s). Fix them, or add a narrow, reasoned entry to ALLOWLIST in scripts/lint-tokens.ts / a trailing "// lint-tokens-allow: <reason>" comment.`);
    process.exitCode = 1;
  } else {
    console.log('\n✓ lint-tokens passed.');
  }
}

main();
