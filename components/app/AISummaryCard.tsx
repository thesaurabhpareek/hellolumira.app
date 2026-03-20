/**
 * @module AISummaryCard
 * @description Renders the AI-generated concern summary with sections for
 *   likely causes, suggested actions, monitoring points, and escalation triggers.
 * @version 1.1.0 — Migrated inline styles → Tailwind classes
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
    <div className="flex flex-col gap-3">

      {/* Likely causes */}
      {summary.likely_causes && summary.likely_causes.length > 0 && (
        <div className="bg-secondary border border-sage-200 rounded-lg px-5 py-4">
          <p className="text-[13px] font-bold text-primary uppercase tracking-[0.5px] mb-2.5">
            💭 What&apos;s likely going on
          </p>
          <ul className="m-0 pl-4">
            {summary.likely_causes.map((item, i) => (
              <li key={i} className="text-sm leading-[1.7] text-foreground mb-1">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Try first */}
      {summary.try_first && summary.try_first.length > 0 && (
        <div className="bg-status-green-light border border-[#9AE6B4] rounded-lg px-5 py-4">
          <p className="text-[13px] font-bold text-status-green uppercase tracking-[0.5px] mb-2.5">
            ✅ What to try first
          </p>
          <ol className="m-0 pl-5">
            {summary.try_first.map((item, i) => (
              <li key={i} className="text-sm leading-[1.7] text-foreground mb-1.5">{item}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Monitor */}
      {summary.monitor && summary.monitor.length > 0 && (
        <div className="bg-status-amber-light border border-[#F6E05E] rounded-lg px-5 py-4">
          <p className="text-[13px] font-bold text-status-amber uppercase tracking-[0.5px] mb-2.5">
            👀 Keep an eye on
          </p>
          <ul className="m-0 pl-4">
            {summary.monitor.map((item, i) => (
              <li key={i} className="text-sm leading-[1.7] text-status-amber-dark mb-1">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Escalate when */}
      {summary.escalate_when && summary.escalate_when.length > 0 && (
        <div className="bg-status-red-light border border-[#FEB2B2] rounded-lg px-5 py-4">
          <p className="text-[13px] font-bold text-destructive uppercase tracking-[0.5px] mb-2.5">
            🚨 When to call your doctor
          </p>
          <ul className="m-0 pl-4">
            {summary.escalate_when.map((item, i) => (
              <li key={i} className="text-sm leading-[1.7] text-status-red-dark font-medium mb-1">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Medical disclaimer */}
      <p className="text-[13px] text-muted-foreground mt-4 leading-[1.5]">
        Lumira is an AI companion, not a doctor. If something feels urgent, please contact your care team.
      </p>
    </div>
  )
}
