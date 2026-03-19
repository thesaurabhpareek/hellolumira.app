/**
 * @module LumiraTyping
 * @description Animated typing indicator with 3 pulsing dots. Displayed while
 *   waiting for Lumira's response in chat and check-in threads.
 * @version 1.0.0
 * @since March 2026
 */

export default function LumiraTyping() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '8px',
        marginBottom: '8px',
      }}
    >
      {/* Lumira avatar dot */}
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span style={{ color: 'white', fontSize: '11px', fontWeight: 700 }}>L</span>
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
