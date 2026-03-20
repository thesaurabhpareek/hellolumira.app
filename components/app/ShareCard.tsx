// components/app/ShareCard.tsx — Share Lumira prompt card
'use client'

import Link from 'next/link'
import { ShareIcon } from '@/components/icons'

export default function ShareCard() {
  return (
    <div className="bg-secondary border border-sage-200 rounded-lg p-5 mb-4">
      <p className="text-[16px] font-bold text-foreground mb-[6px]">
        Know someone expecting or with a baby?
      </p>
      <p className="text-sm text-muted-foreground leading-[1.5] mb-4">
        Pass it on — it&apos;s free to start
      </p>
      <Link
        href="/share"
        className="inline-flex items-center justify-center h-12 px-6 rounded-md bg-primary text-white text-[15px] font-semibold no-underline transition-opacity duration-150 ease-out"
      >
        <span className="inline-flex items-center gap-[6px]"><ShareIcon size={16} color="#FFFFFF" /> Share Lumira</span>
      </Link>
    </div>
  )
}
