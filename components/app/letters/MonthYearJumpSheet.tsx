/**
 * @module MonthYearJumpSheet
 * @description Compact month/year jump picker for the entry timeline (the
 *   iOS Photos "tap the sticky header" pattern). Wraps the existing
 *   `HalfSheet` — no calendar grid, that would be overbuilt for this.
 *   Presentational only: `months` is computed by the caller from whatever
 *   entries it knows about; this component never fetches or infers data.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import * as React from 'react'
import { HalfSheet } from '@/components/ui/half-sheet'

/** One selectable month. `count` is optional — omit or pass null when unknown. */
export interface MonthYearOption {
  year: number
  /** 1-12 */
  month: number
  count: number | null
}

export interface MonthYearJumpSheetProps {
  isOpen: boolean
  onClose: () => void
  /** Months that have at least one entry, in any order — this component sorts them. */
  months: MonthYearOption[]
  /** The month/year currently in view, for highlighting. */
  activeYear?: number | null
  activeMonth?: number | null
  onSelect: (year: number, month: number) => void
}

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function groupByYear(months: MonthYearOption[]): Array<[number, MonthYearOption[]]> {
  const byYear = new Map<number, MonthYearOption[]>()
  for (const option of months) {
    const existing = byYear.get(option.year)
    if (existing) existing.push(option)
    else byYear.set(option.year, [option])
  }
  const years = Array.from(byYear.entries())
  years.sort((a, b) => b[0] - a[0])
  for (const [, monthsInYear] of years) {
    monthsInYear.sort((a, b) => b.month - a.month)
  }
  return years
}

export function MonthYearJumpSheet({
  isOpen,
  onClose,
  months,
  activeYear = null,
  activeMonth = null,
  onSelect,
}: MonthYearJumpSheetProps) {
  const years = React.useMemo(() => groupByYear(months), [months])

  const handleSelect = React.useCallback(
    (year: number, month: number) => {
      onSelect(year, month)
      onClose()
    },
    [onSelect, onClose],
  )

  return (
    <HalfSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Jump to"
      snapPoints={[0.55, 0.85]}
      dismissible
    >
      {years.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nothing to jump to yet.
        </p>
      ) : (
        <div className="flex flex-col gap-5 pt-1 pb-2">
          {years.map(([year, monthsInYear]) => (
            <section key={year} aria-label={String(year)}>
              <p className="text-[13px] font-bold text-muted-foreground mb-2">{year}</p>
              <div className="flex flex-wrap gap-2">
                {monthsInYear.map((option) => {
                  const isActive = activeYear === option.year && activeMonth === option.month
                  const countLabel =
                    option.count != null
                      ? `, ${option.count} ${option.count === 1 ? 'entry' : 'entries'}`
                      : ''
                  return (
                    <button
                      key={`${option.year}-${option.month}`}
                      type="button"
                      onClick={() => handleSelect(option.year, option.month)}
                      aria-current={isActive ? 'true' : undefined}
                      aria-label={`${MONTH_FULL[option.month - 1]} ${option.year}${countLabel}`}
                      className="min-h-[44px] px-3.5 rounded-[10px] text-sm transition-colors"
                      style={{
                        border: isActive ? '1.5px solid var(--terra-400)' : '1px solid var(--color-border)',
                        background: isActive ? 'var(--terra-50)' : 'var(--color-white)',
                        color: isActive ? 'var(--terra-600)' : 'var(--color-slate)',
                        fontWeight: isActive ? 600 : 500,
                      }}
                    >
                      {MONTH_ABBR[option.month - 1]}
                      {option.count != null && (
                        <span
                          className="ml-1.5 text-xs"
                          style={{ color: isActive ? 'var(--terra-500)' : 'var(--color-muted)' }}
                        >
                          {option.count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </HalfSheet>
  )
}

export default MonthYearJumpSheet
