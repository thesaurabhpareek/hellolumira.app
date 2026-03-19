'use client'

interface LumiraAvatarProps {
  size?: number
  className?: string
}

export function LumiraAvatar({ size = 40, className = '' }: LumiraAvatarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Lumira"
      role="img"
    >
      {/* Warm circle background */}
      <circle cx="20" cy="20" r="20" fill="#3D8178" />
      {/* Crescent moon shape */}
      <path
        d="M26 10C22.5 10 19.5 12.5 19.5 16C19.5 19.5 22.5 22 26 22C24 24 21 26 17 26C12 26 8 22 8 17C8 12 12 8 17 8C20.5 8 23.5 9 26 10Z"
        fill="#FAFAF8"
        opacity="0.95"
      />
      {/* Amber eye dot */}
      <circle cx="24" cy="16" r="2.5" fill="#C4844E" />
      {/* Subtle glow around eye */}
      <circle cx="24" cy="16" r="3.5" fill="#C4844E" opacity="0.15" />
    </svg>
  )
}
