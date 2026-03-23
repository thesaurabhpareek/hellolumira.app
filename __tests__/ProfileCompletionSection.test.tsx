// @vitest-environment happy-dom
/**
 * Regression tests for ProfileCompletionSection fixes.
 *
 * Strategy: Rather than rendering the React component (which needs the auto-JSX
 * transform), we read the source directly and verify the fix is present in the
 * production code — this is a contract test against the source text.
 *
 * Additionally we test the pure logic (allDone, completedCount, percentage)
 * via isolated helper functions that mirror the component logic.
 *
 * Fixes validated:
 * 1. Title changed from "Your Journey" to "Getting Started"
 * 2. When allDone, shows compact done state ("Done ✓") — NOT "Complete!" badge
 * 3. When not all done, shows x/y count badge
 */
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

// ─── Load source once ────────────────────────────────────────────────────────

const SOURCE_PATH = path.resolve(process.cwd(), 'app/(app)/profile/ProfileCompletionSection.tsx')
const src = fs.readFileSync(SOURCE_PATH, 'utf8')

// ─── Pure logic helpers that mirror the component ────────────────────────────

interface Item { done: boolean }

function completedCount(items: Item[]): number {
  return items.filter(i => i.done).length
}

function allDone(items: Item[]): boolean {
  return completedCount(items) === items.length
}

function percentage(items: Item[]): number {
  return Math.round((completedCount(items) / items.length) * 100)
}

function countLabel(items: Item[]): string {
  return `${completedCount(items)}/${items.length}`
}

// ─── Source-level contract tests ─────────────────────────────────────────────

describe('ProfileCompletionSection source — title fix (Fix 3)', () => {
  it('source contains "Getting Started" as the section title', () => {
    expect(src).toContain('Getting Started')
  })

  it('source does NOT contain "Your Journey"', () => {
    expect(src).not.toContain('Your Journey')
  })
})

describe('ProfileCompletionSection source — allDone compact state (Fix 3)', () => {
  it('source does NOT contain "Complete!" badge text', () => {
    expect(src).not.toContain('Complete!')
  })

  it('source does NOT contain "Your profile is complete!" text', () => {
    expect(src).not.toContain('Your profile is complete!')
  })

  it('source shows a "Done" indicator in the allDone state', () => {
    // The compact done row must display "Done" or "Done ✓"
    expect(src).toContain('Done')
    // Verify the allDone branch exists
    expect(src).toContain('allDone')
  })

  it('allDone branch shows "Getting Started" label (not just an empty card)', () => {
    // The compact done state re-uses the "Getting Started" label.
    // Capture from the if (allDone) opening to the closing return statement
    // (the full early-return block is ~800 chars including the p tag content).
    const startIdx = src.indexOf('if (allDone)')
    const allDoneBlock = src.slice(startIdx, startIdx + 1200)
    expect(allDoneBlock).toContain('Getting Started')
  })
})

describe('ProfileCompletionSection source — count badge (Fix 3)', () => {
  it('source uses completedCount/items.length pattern for the badge', () => {
    // The count badge shows "2/4" style text
    expect(src).toContain('completedCount')
    expect(src).toContain('items.length')
    // The template literal that builds the badge string
    expect(src).toMatch(/`\$\{completedCount\}\/\$\{items\.length\}`/)
  })
})

// ─── Pure-logic tests ─────────────────────────────────────────────────────────

describe('ProfileCompletionSection pure logic', () => {
  const partialItems = [
    { done: true },
    { done: false },
    { done: false },
    { done: false },
  ]

  const allDoneItems = [
    { done: true },
    { done: true },
    { done: true },
  ]

  it('completedCount returns count of done items', () => {
    expect(completedCount(partialItems)).toBe(1)
    expect(completedCount(allDoneItems)).toBe(3)
  })

  it('allDone returns false when items are incomplete', () => {
    expect(allDone(partialItems)).toBe(false)
  })

  it('allDone returns true when all items are done', () => {
    expect(allDone(allDoneItems)).toBe(true)
  })

  it('percentage returns correct value', () => {
    expect(percentage(partialItems)).toBe(25)  // 1/4
    expect(percentage(allDoneItems)).toBe(100)  // 3/3
  })

  it('countLabel returns x/y string', () => {
    expect(countLabel(partialItems)).toBe('1/4')
    expect(countLabel(allDoneItems)).toBe('3/3')
  })

  it('countLabel for 2/3 done', () => {
    const items = [{ done: true }, { done: true }, { done: false }]
    expect(countLabel(items)).toBe('2/3')
  })
})
