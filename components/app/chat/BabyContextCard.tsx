/**
 * @module BabyContextCard
 * @description Collapsible card showing baby context (name, age, stage) at
 *   the top of chat threads. Helps the parent confirm Lumira has the right context.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { useState } from 'react'
import type { BabyProfile, BabyAgeInfo } from '@/types/app'

interface Props {
  baby: BabyProfile
  ageInfo: BabyAgeInfo
}

export default function BabyContextCard({ baby, ageInfo }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-secondary border border-sage-200 rounded-lg mb-4 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-transparent border-none cursor-pointer text-left"
      >
        <div className="flex items-center gap-[10px]">
          {/* Baby icon */}
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="text-white text-sm">
              {baby.stage === 'pregnancy' ? '✨' : '👶'}
            </span>
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">
              {baby.stage === 'pregnancy'
                ? `Week ${ageInfo.pregnancy_week || '?'}`
                : (baby.name || 'Baby')}
            </p>
            <p className="text-[12px] text-muted-foreground">
              {ageInfo.age_display_string}
            </p>
          </div>
        </div>

        {/* Chevron */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-muted)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div
          className="px-4 pb-[14px]"
          style={{ borderTop: '1px solid var(--color-primary-mid)' }}
        >
          <div className="grid grid-cols-2 gap-2 pt-3">
            {baby.stage === 'pregnancy' && (
              <>
                <DetailItem label="Due date" value={baby.due_date || 'Not set'} />
                <DetailItem
                  label="Trimester"
                  value={ageInfo.trimester ? `Trimester ${ageInfo.trimester}` : '-'}
                />
                <DetailItem
                  label="Days until due"
                  value={ageInfo.days_until_due !== undefined ? `${ageInfo.days_until_due} days` : '-'}
                />
              </>
            )}

            {baby.stage !== 'pregnancy' && (
              <>
                <DetailItem label="Name" value={baby.name || 'Baby'} />
                <DetailItem
                  label="Age"
                  value={
                    ageInfo.age_in_months !== undefined && ageInfo.age_in_months < 3
                      ? `${ageInfo.age_in_weeks ?? 0} weeks`
                      : ageInfo.age_in_months !== undefined
                        ? `${ageInfo.age_in_months} months`
                        : '-'
                  }
                />
                <DetailItem label="Date of birth" value={baby.date_of_birth || 'Not set'} />
                <DetailItem label="Stage" value={baby.stage} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-[0.3px]">
        {label}
      </p>
      <p className="text-sm text-foreground font-medium mt-0.5">
        {value}
      </p>
    </div>
  )
}
