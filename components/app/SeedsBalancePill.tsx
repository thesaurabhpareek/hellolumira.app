// components/app/SeedsBalancePill.tsx — Small pill showing seeds balance
// Animates with bounce + glow + floating "+N" when seeds are awarded
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { triggerCoinBounce } from '@/lib/animations'

interface SeedsBalancePillProps {
  balance: number
}

export default function SeedsBalancePill({ balance }: SeedsBalancePillProps) {
  const pillRef = useRef<HTMLAnchorElement>(null)
  const prevBalanceRef = useRef(balance)
  const [displayBalance, setDisplayBalance] = useState(balance)

  useEffect(() => {
    const prev = prevBalanceRef.current
    const diff = balance - prev
    prevBalanceRef.current = balance

    // Only animate if balance increased (seeds awarded)
    if (diff > 0 && pillRef.current) {
      triggerCoinBounce(pillRef.current, diff)

      // Brief counting effect
      const start = performance.now()
      const duration = 300
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplayBalance(Math.round(prev + diff * eased))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    } else {
      setDisplayBalance(balance)
    }
  }, [balance])

  return (
    <Link
      ref={pillRef}
      href="/profile"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '6px 12px',
        borderRadius: '100px',
        background: 'var(--color-accent-light)',
        textDecoration: 'none',
        flexShrink: 0,
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, opacity 0.15s ease',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      <span style={{ fontSize: '14px' }}>{'\uD83C\uDF31'}</span>
      <span
        style={{
          fontSize: '13px',
          fontWeight: 700,
          color: 'var(--color-accent)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {displayBalance}
      </span>
    </Link>
  )
}
