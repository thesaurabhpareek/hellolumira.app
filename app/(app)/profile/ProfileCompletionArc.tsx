// app/(app)/profile/ProfileCompletionArc.tsx — Circular progress indicator
'use client'

interface ProfileCompletionArcProps {
  percentage: number
}

export default function ProfileCompletionArc({ percentage }: ProfileCompletionArcProps) {
  const size = 120
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F3F4F6"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <p
        style={{
          marginTop: '-76px',
          fontSize: '28px',
          fontWeight: 700,
          color: 'var(--color-primary)',
          position: 'relative',
        }}
      >
        {percentage}%
      </p>
      <p
        style={{
          fontSize: '12px',
          color: 'var(--color-muted)',
          marginTop: '4px',
          position: 'relative',
        }}
      >
        complete
      </p>
      {/* Spacer to push content below the overlapping text */}
      <div style={{ height: '20px' }} />
    </div>
  )
}
