/**
 * @module HistoryCard
 * @description Timeline card showing a day's check-in data and concern sessions.
 * @version 1.1.0 — Migrated inline styles → Tailwind classes
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

// Emotional signal colours — data-driven, kept as inline style map
const EMOTIONAL_COLORS: Record<string, { bg: string; text: string }> = {
  ok:         { bg: '#F0FFF4', text: '#276749' },
  tired:      { bg: '#FFFFF0', text: '#744210' },
  struggling: { bg: '#FFF5F5', text: '#822727' },
  distressed: { bg: '#FFF5F5', text: '#C53030' },
}

export default function HistoryCard({ date, stage, checkin, concerns }: Props) {
  const dateObj    = new Date(date + 'T12:00:00')
  const isToday    = date === new Date().toISOString().split('T')[0]
  const isYesterday = date === new Date(Date.now() - 86400000).toISOString().split('T')[0]

  const dateLabel = isToday
    ? 'Today'
    : isYesterday
    ? 'Yesterday'
    : dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  const emotionStyle =
    checkin?.emotional_signal && EMOTIONAL_COLORS[checkin.emotional_signal]
      ? EMOTIONAL_COLORS[checkin.emotional_signal]
      : null

  return (
    <div className="lumira-card !p-4">
      {/* Date row */}
      <div className="flex items-center justify-between mb-3">
        <p className="font-bold text-[15px] text-foreground">{dateLabel}</p>
        {isToday && (
          <span className="text-[11px] font-semibold text-primary bg-secondary px-2 py-[2px] rounded-full">
            Today
          </span>
        )}
      </div>

      {/* Check-in chips */}
      {checkin && (
        <div className={`flex flex-wrap gap-1.5 ${concerns?.length ? 'mb-2.5' : ''}`}>
          {stage === 'pregnancy' ? (
            <>
              {checkin.nausea_level  && <Chip label={`Nausea: ${checkin.nausea_level}`} />}
              {checkin.energy_level  && <Chip label={`Energy: ${checkin.energy_level}`} />}
              {checkin.kept_food_down !== null && (
                <Chip label={checkin.kept_food_down ? 'Food kept down' : "Couldn't keep food down"} />
              )}
            </>
          ) : (
            <>
              {checkin.sleep_quality && <Chip label={`Sleep: ${checkin.sleep_quality}`} />}
              {checkin.feeding       && <Chip label={`Feeding: ${checkin.feeding}`} />}
              {checkin.mood          && <Chip label={`Mood: ${checkin.mood}`} />}
              {checkin.night_wakings !== null && checkin.night_wakings !== undefined && (
                <Chip label={`${checkin.night_wakings} wakings`} />
              )}
            </>
          )}

          {/* Emotional signal — data-driven colour */}
          {emotionStyle && checkin.emotional_signal && (
            <span
              className="px-2.5 py-[3px] rounded-full text-xs font-semibold"
              style={{ background: emotionStyle.bg, color: emotionStyle.text }}
            >
              {checkin.emotional_signal}
            </span>
          )}
        </div>
      )}

      {/* No check-in */}
      {!checkin && (
        <p className={`text-[13px] text-muted-foreground ${concerns?.length ? 'mb-2.5' : ''}`}>
          No check-in on this day
        </p>
      )}

      {/* Concern badges */}
      {concerns && concerns.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {concerns.map((c) => (
            <Link
              key={c.id}
              href={`/concern/${c.concern_type}/summary?session=${c.id}`}
              className="inline-flex items-center px-2.5 py-[3px] rounded-full text-xs font-semibold bg-terra-50 text-accent border border-[#E8C4A0] no-underline"
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
    <span className="px-2.5 py-[3px] rounded-full text-xs font-medium bg-background text-muted-foreground border border-border">
      {label}
    </span>
  )
}
