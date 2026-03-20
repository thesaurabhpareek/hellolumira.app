/**
 * @module WellbeingPrompt
 * @description Proactive wellbeing prompt card shown when Lumira detects the
 *   parent may benefit from emotional support. Offers a gentle entry point
 *   to the chat or support resources.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

import { LumiraAvatar } from './LumiraAvatar'

interface Props {
  onDismiss: () => void
}

export default function WellbeingPrompt({ onDismiss }: Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Wellbeing check-in"
      className="fixed inset-0 z-[200] flex items-end justify-center p-4"
      style={{
        background: 'rgba(45, 55, 72, 0.7)',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
      }}
    >
      <div
        className="content-width w-full animate-fade-in bg-white rounded-[20px] px-6"
        style={{ padding: '28px 24px' }}
      >
        {/* Lumira avatar */}
        <div className="mb-4">
          <LumiraAvatar size={48} />
        </div>

        <h2 className="text-h2 mb-3 text-foreground">
          I hear you
        </h2>

        <p className="text-[15px] leading-[1.7] text-foreground mb-5">
          What you&apos;re going through sounds really hard. You don&apos;t have to navigate this alone — reaching out is one of the bravest things you can do.
        </p>

        <div className="bg-secondary border border-sage-200 rounded-md p-[14px_16px] mb-5">
          <p className="text-[13px] font-bold text-primary mb-1">
            💙 If you need support right now
          </p>
          <p className="text-sm text-foreground leading-[1.6]">
            Postpartum Support International: <strong>1-800-944-4773</strong><br />
            Text HOME to <strong>741741</strong> to reach Crisis Text Line
          </p>
        </div>

        <button
          onClick={onDismiss}
          className="btn-primary mb-2"
        >
          Keep talking with Lumira
        </button>

        <button
          onClick={onDismiss}
          className="w-full p-3 bg-transparent border-none cursor-pointer text-muted-foreground text-sm min-h-[48px]"
        >
          I&apos;m okay, thanks
        </button>
      </div>
    </div>
  )
}
