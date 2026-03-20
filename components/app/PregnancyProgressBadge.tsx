/**
 * @module PregnancyProgressBadge
 * @description Visual pregnancy progress indicator showing current week,
 *   trimester, and a gradient progress bar.
 * @version 1.1.0 — Migrated inline styles → Tailwind classes
 * @since March 2026
 */
interface Props {
  week: number
  trimester: 1 | 2 | 3
  dueDate: string
}

const TRIMESTER_LABELS = {
  1: 'First trimester',
  2: 'Second trimester',
  3: 'Third trimester',
}

export default function PregnancyProgressBadge({ week, trimester, dueDate }: Props) {
  const progressPercent = Math.min(100, (week / 40) * 100)

  const dueDateFormatted = dueDate
    ? new Date(dueDate + 'T12:00:00').toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  const weeksRemaining = Math.max(0, 40 - week)

  return (
    <div className="bg-white border border-border rounded-lg px-5 py-4 mb-4">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-bold text-xl text-primary leading-none mb-1">Week {week}</p>
          <p className="text-[13px] text-muted-foreground">{TRIMESTER_LABELS[trimester]}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-accent leading-none mb-1">{weeksRemaining}</p>
          <p className="text-[13px] text-muted-foreground">weeks to go</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-border rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{
            width: `${progressPercent}%`,
            background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
          }}
        />
      </div>

      {/* Due date */}
      {dueDateFormatted && (
        <p className="text-[13px] text-muted-foreground">
          Due <strong className="text-foreground font-semibold">{dueDateFormatted}</strong>
        </p>
      )}
    </div>
  )
}
