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
    <div
      style={{
        background: 'var(--color-primary-light)',
        border: '1px solid var(--color-primary-mid)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '16px',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Baby icon */}
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ color: 'white', fontSize: '14px' }}>
              {baby.stage === 'pregnancy' ? '\u2728' : '\uD83D\uDC76'}
            </span>
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-slate)' }}>
              {baby.stage === 'pregnancy'
                ? `Week ${ageInfo.pregnancy_week || '?'}`
                : (baby.name || 'Baby')}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
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
          style={{
            padding: '0 16px 14px',
            borderTop: '1px solid var(--color-primary-mid)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              paddingTop: '12px',
            }}
          >
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
      <p style={{ fontSize: '11px', color: 'var(--color-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
        {label}
      </p>
      <p style={{ fontSize: '14px', color: 'var(--color-slate)', fontWeight: 500, marginTop: '2px' }}>
        {value}
      </p>
    </div>
  )
}
