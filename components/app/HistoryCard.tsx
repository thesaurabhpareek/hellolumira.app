/**
 * @module HistoryCard
 * @description Timeline card showing a day's check-in data and concern sessions.
 *   Renders stage-specific metrics (pregnancy vs infant/toddler) with
 *   emotional signal indicators and concern links.
 * @version 1.0.0
 * @since March 2026
 */
import Link from 'next/link'
import type { Stage, DailyCheckin, ConcernSession } from '@/types/app'

interface Props {
  date: string
  stage: Stage
  checkin?: DailyCheckin
  concerns?: ConcernSession[]
}

const CONCERN_LABELS: Record<string, string> = {
  morning_sickness: 'Morning sickness',
  prenatal_symptoms: 'Symptoms',
  reduced_fetal_movement: 'Fetal movement',
  prenatal_anxiety: 'Anxiety',
  birth_preparation: 'Birth prep',
  feeding_drop: 'Feeding drop',
  crying_increase: 'Crying',
  sleep_regression: 'Sleep',
  constipation: 'Constipation',
  fever: 'Fever',
  teething: 'Teething',
  other: 'Concern',
}

const EMOTIONAL_COLORS: Record<string, { bg: string; text: string }> = {
  ok: { bg: '#F0FFF4', text: '#276749' },
  tired: { bg: '#FFFFF0', text: '#744210' },
  struggling: { bg: '#FFF5F5', text: '#822727' },
  distressed: { bg: '#FFF5F5', text: '#C53030' },
}

export default function HistoryCard({ date, stage, checkin, concerns }: Props) {
  const dateObj = new Date(date + 'T12:00:00')
  const isToday = date === new Date().toISOString().split('T')[0]
  const isYesterday =
    date ===
    new Date(Date.now() - 86400000).toISOString().split('T')[0]

  const dateLabel = isToday
    ? 'Today'
    : isYesterday
    ? 'Yesterday'
    : dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })

  const emotionStyle =
    checkin?.emotional_signal && EMOTIONAL_COLORS[checkin.emotional_signal]
      ? EMOTIONAL_COLORS[checkin.emotional_signal]
      : null

  return (
    <div
      className="lumira-card"
      style={{ padding: '16px 20px' }}
    >
      {/* Date */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <p
          style={{
            fontWeight: 700,
            fontSize: '15px',
            color: 'var(--color-slate)',
          }}
        >
          {dateLabel}
        </p>
        {isToday && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-primary)',
              background: 'var(--color-primary-light)',
              padding: '2px 8px',
              borderRadius: '100px',
            }}
          >
            Today
          </span>
        )}
      </div>

      {/* Checkin chips */}
      {checkin && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: concerns?.length ? '10px' : '0' }}>
          {/* Stage-specific chips */}
          {stage === 'pregnancy' ? (
            <>
              {checkin.nausea_level && (
                <Chip label={`Nausea: ${checkin.nausea_level}`} />
              )}
              {checkin.energy_level && (
                <Chip label={`Energy: ${checkin.energy_level}`} />
              )}
              {checkin.kept_food_down !== null && (
                <Chip label={checkin.kept_food_down ? 'Food kept down' : 'Couldn\'t keep food down'} />
              )}
            </>
          ) : (
            <>
              {checkin.sleep_quality && (
                <Chip label={`Sleep: ${checkin.sleep_quality}`} />
              )}
              {checkin.feeding && (
                <Chip label={`Feeding: ${checkin.feeding}`} />
              )}
              {checkin.mood && (
                <Chip label={`Mood: ${checkin.mood}`} />
              )}
              {checkin.night_wakings !== null && checkin.night_wakings !== undefined && (
                <Chip label={`${checkin.night_wakings} wakings`} />
              )}
            </>
          )}

          {/* Emotional signal */}
          {emotionStyle && checkin.emotional_signal && (
            <span
              style={{
                padding: '3px 10px',
                borderRadius: '100px',
                fontSize: '12px',
                fontWeight: 600,
                background: emotionStyle.bg,
                color: emotionStyle.text,
              }}
            >
              {checkin.emotional_signal}
            </span>
          )}
        </div>
      )}

      {/* No checkin */}
      {!checkin && (
        <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: concerns?.length ? '10px' : '0' }}>
          No check-in logged
        </p>
      )}

      {/* Concern badges */}
      {concerns && concerns.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {concerns.map((c) => (
            <Link
              key={c.id}
              href={`/concern/${c.concern_type}/summary?session=${c.id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '3px 10px',
                borderRadius: '100px',
                fontSize: '12px',
                fontWeight: 600,
                background: 'var(--color-accent-light)',
                color: 'var(--color-accent)',
                textDecoration: 'none',
                border: '1px solid #E8C4A0',
              }}
            >
              {CONCERN_LABELS[c.concern_type] || c.concern_type} →
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function Chip({ label }: { label: string }) {
  return (
    <span
      style={{
        padding: '3px 10px',
        borderRadius: '100px',
        fontSize: '12px',
        fontWeight: 500,
        background: 'var(--color-surface)',
        color: 'var(--color-muted)',
        border: '1px solid var(--color-border)',
      }}
    >
      {label}
    </span>
  )
}
