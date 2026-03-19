// components/app/ShareCard.tsx — Share Lumira prompt card
'use client'

import Link from 'next/link'

export default function ShareCard() {
  return (
    <div
      style={{
        background: '#EDF5F4',
        border: '1px solid #B8D8D3',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        marginBottom: '16px',
      }}
    >
      <p
        style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#1A1A1A',
          marginBottom: '6px',
        }}
      >
        Know someone expecting or with a baby?
      </p>
      <p
        style={{
          fontSize: '14px',
          color: '#6B7280',
          lineHeight: 1.5,
          marginBottom: '16px',
        }}
      >
        Pass it on — it&apos;s free to start
      </p>
      <Link
        href="/share"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '48px',
          padding: '0 24px',
          borderRadius: 'var(--radius-md)',
          background: '#3D8178',
          color: '#FFFFFF',
          fontSize: '15px',
          fontWeight: 600,
          textDecoration: 'none',
          transition: 'opacity 0.15s ease',
        }}
      >
        Share Lumira 💛
      </Link>
    </div>
  )
}
