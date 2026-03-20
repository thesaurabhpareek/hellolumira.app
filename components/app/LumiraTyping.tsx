/**
 * @module LumiraTyping
 * @description Animated typing indicator with 3 pulsing dots. Displayed while
 *   waiting for Lumira's response in chat and check-in threads.
 * @version 1.0.0
 * @since March 2026
 */

import { LumiraAvatar } from './LumiraAvatar'

export default function LumiraTyping() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Lumira is typing"
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '8px',
        marginBottom: '8px',
      }}
    >
      {/* Lumira avatar */}
      <div style={{ flexShrink: 0 }}>
        <LumiraAvatar size={28} />
      </div>

      {/* Typing bubble */}
      <div
        className="bubble-lumira"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '12px 16px',
          minHeight: '44px',
        }}
      >
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  )
}
