/**
 * @module PregnancyProgressBadge
 * @description Visual pregnancy progress indicator showing current week,
 *   trimester, and a progress bar with trimester color coding.
 * @version 1.0.0
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
    <div
      style={{
        background: 'var(--color-white)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        marginBottom: '16px',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
          <p
            style={{
              fontWeight: 700,
              fontSize: '20px',
              color: 'var(--color-primary)',
              lineHeight: 1,
              marginBottom: '4px',
            }}
          >
            Week {week}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
            {TRIMESTER_LABELS[trimester]}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-accent)', lineHeight: 1, marginBottom: '4px' }}>
            {weeksRemaining}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--color-muted)' }}>weeks to go</p>
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: '6px',
          background: 'var(--color-border)',
          borderRadius: '3px',
          overflow: 'hidden',
          marginBottom: '8px',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: `linear-gradient(90deg, var(--color-primary), var(--color-accent))`,
            borderRadius: '3px',
            transition: 'width 0.5s ease',
          }}
        />
      </div>

      {/* Due date */}
      {dueDateFormatted && (
        <p style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
          Due <strong style={{ color: 'var(--color-slate)' }}>{dueDateFormatted}</strong>
        </p>
      )}
    </div>
  )
}
