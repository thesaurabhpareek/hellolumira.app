// components/app/SeedsBalancePill.tsx — Small pill showing seeds balance
// Animates with bounce + glow + floating "+N" when seeds are awarded
// v1.1.0 — Migrated inline styles → Tailwind classes
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

    if (diff > 0 && pillRef.current) {
      triggerCoinBounce(pillRef.current, diff)

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
      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-terra-50 no-underline shrink-0 overflow-visible relative"
      style={{
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, opacity 0.15s ease',
      }}
    >
      <span className="text-sm">🌱</span>
      <span className="text-[13px] font-bold text-accent tabular-nums">
        {displayBalance}
      </span>
    </Link>
  )
}
