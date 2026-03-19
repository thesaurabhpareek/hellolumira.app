/**
 * @module WellbeingPrompt
 * @description Proactive wellbeing prompt card shown when Lumira detects the
 *   parent may benefit from emotional support. Offers a gentle entry point
 *   to the chat or support resources.
 * @version 1.0.0
 * @since March 2026
 */
'use client'

interface Props {
  onDismiss: () => void
}

export default function WellbeingPrompt({ onDismiss }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(45, 55, 72, 0.7)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '16px',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
      }}
    >
      <div
        className="content-width w-full animate-fade-in"
        style={{
          background: 'var(--color-white)',
          borderRadius: '20px 20px 20px 20px',
          padding: '28px 24px',
        }}
      >
        {/* Lumira avatar */}
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}
        >
          <span style={{ color: 'white', fontSize: '18px', fontWeight: 700 }}>L</span>
        </div>

        <h2
          className="text-h2 mb-3"
          style={{ color: 'var(--color-slate)' }}
        >
          I hear you
        </h2>

        <p
          style={{
            fontSize: '15px',
            lineHeight: 1.7,
            color: 'var(--color-slate)',
            marginBottom: '20px',
          }}
        >
          What you&apos;re going through sounds really hard. You don&apos;t have to navigate this alone — reaching out is one of the bravest things you can do.
        </p>

        <div
          style={{
            background: 'var(--color-primary-light)',
            border: '1px solid var(--color-primary-mid)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            marginBottom: '20px',
          }}
        >
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '4px' }}>
            💙 If you need support right now
          </p>
          <p style={{ fontSize: '14px', color: 'var(--color-slate)', lineHeight: 1.6 }}>
            Postpartum Support International: <strong>1-800-944-4773</strong><br />
            Text HOME to <strong>741741</strong> to reach Crisis Text Line
          </p>
        </div>

        <button
          onClick={onDismiss}
          className="btn-primary"
          style={{ marginBottom: '8px' }}
        >
          I&apos;m okay, thanks
        </button>

        <button
          onClick={onDismiss}
          style={{
            width: '100%',
            padding: '12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-muted)',
            fontSize: '14px',
            minHeight: '44px',
          }}
        >
          Continue talking with Lumira
        </button>
      </div>
    </div>
  )
}
