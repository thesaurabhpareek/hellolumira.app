// components/app/SeedsBalancePill.tsx — Small pill showing seeds balance
// Animates with bounce + glow + floating "+N" when seeds are awarded
// v1.2.0 — Added Supabase realtime subscription so balance updates without a page reload
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { triggerCoinBounce } from '@/lib/animations'

interface SeedsBalancePillProps {
  /** Server-rendered initial value. Realtime subscription will update it live. */
  balance: number
}

export default function SeedsBalancePill({ balance }: SeedsBalancePillProps) {
  const pillRef = useRef<HTMLAnchorElement>(null)
  const prevBalanceRef = useRef(balance)
  const [liveBalance, setLiveBalance] = useState(balance)
  const [displayBalance, setDisplayBalance] = useState(balance)

  // Keep liveBalance in sync when the server re-renders with a new prop
  useEffect(() => {
    setLiveBalance(balance)
  }, [balance])

  // Realtime: subscribe to the authenticated user's seeds_balance column
  useEffect(() => {
    const supabase = createClient()
    let userId: string | null = null

    const subscribe = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      userId = user.id

      const channel = supabase
        .channel('seeds-balance')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${userId}`,
          },
          (payload) => {
            const newBalance = (payload.new as { seeds_balance?: number }).seeds_balance
            if (typeof newBalance === 'number') {
              setLiveBalance(newBalance)
            }
          }
        )
        .subscribe()

      return channel
    }

    let channelRef: ReturnType<typeof supabase.channel> | null = null
    subscribe().then((ch) => {
      if (ch) channelRef = ch
    })

    return () => {
      if (channelRef) {
        supabase.removeChannel(channelRef)
      }
    }
  }, [])

  // Animate counter whenever liveBalance changes
  useEffect(() => {
    const prev = prevBalanceRef.current
    const diff = liveBalance - prev
    prevBalanceRef.current = liveBalance

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
      setDisplayBalance(liveBalance)
    }
  }, [liveBalance])

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
