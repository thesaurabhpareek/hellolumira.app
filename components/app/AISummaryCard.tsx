/**
 * @module AISummaryCard
 * @description Renders the AI-generated concern summary with sections for
 *   likely causes, suggested actions, monitoring points, and escalation triggers.
 * @version 1.0.0
 * @since March 2026
 */
import type { AISummary } from '@/types/app'

interface Props {
  summary: AISummary
  concernType: string
  babyName?: string
}

export default function AISummaryCard({ summary, concernType, babyName }: Props) {
  void concernType
  void babyName

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Likely causes */}
      {summary.likely_causes && summary.likely_causes.length > 0 && (
        <div
          style={{
            background: 'var(--color-primary-light)',
            border: '1px solid var(--color-primary-mid)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
          }}
        >
          <p
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--color-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '10px',
            }}
          >
            💭 What&apos;s likely going on
          </p>
          <ul style={{ margin: 0, paddingLeft: '16px' }}>
            {summary.likely_causes.map((item, i) => (
              <li
                key={i}
                style={{
                  fontSize: '14px',
                  lineHeight: 1.7,
                  color: 'var(--color-slate)',
                  marginBottom: '4px',
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Try first */}
      {summary.try_first && summary.try_first.length > 0 && (
        <div
          style={{
            background: 'var(--color-green-light)',
            border: '1px solid #9AE6B4',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
          }}
        >
          <p
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--color-green)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '10px',
            }}
          >
            ✅ What to try first
          </p>
          <ol style={{ margin: 0, paddingLeft: '20px' }}>
            {summary.try_first.map((item, i) => (
              <li
                key={i}
                style={{
                  fontSize: '14px',
                  lineHeight: 1.7,
                  color: 'var(--color-slate)',
                  marginBottom: '6px',
                }}
              >
                {item}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Monitor */}
      {summary.monitor && summary.monitor.length > 0 && (
        <div
          style={{
            background: 'var(--color-amber-light)',
            border: '1px solid #F6E05E',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
          }}
        >
          <p
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--color-amber)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '10px',
            }}
          >
            👀 Keep an eye on
          </p>
          <ul style={{ margin: 0, paddingLeft: '16px' }}>
            {summary.monitor.map((item, i) => (
              <li
                key={i}
                style={{
                  fontSize: '14px',
                  lineHeight: 1.7,
                  color: '#744210',
                  marginBottom: '4px',
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Escalate when */}
      {summary.escalate_when && summary.escalate_when.length > 0 && (
        <div
          style={{
            background: 'var(--color-red-light)',
            border: '1px solid #FEB2B2',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
          }}
        >
          <p
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--color-red)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '10px',
            }}
          >
            🚨 When to call your doctor
          </p>
          <ul style={{ margin: 0, paddingLeft: '16px' }}>
            {summary.escalate_when.map((item, i) => (
              <li
                key={i}
                style={{
                  fontSize: '14px',
                  lineHeight: 1.7,
                  color: '#822727',
                  marginBottom: '4px',
                  fontWeight: 500,
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Medical disclaimer */}
      <p
        style={{
          fontSize: '13px',
          color: 'var(--color-muted)',
          marginTop: '16px',
          lineHeight: 1.5,
        }}
      >
        AI-generated guidance · Not a substitute for medical advice
      </p>
    </div>
  )
}
