/**
 * @module ReassuranceCard
 * @description Soft reassurance card displaying a normalising message to
 *   help parents feel confident about common concerns.
 * @version 1.0.0
 * @since March 2026
 */
interface Props {
  message: string
}

export default function ReassuranceCard({ message }: Props) {
  return (
    <div
      style={{
        background: 'var(--color-green-light)',
        border: '1px solid #9AE6B4',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
      }}
    >
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: 'var(--color-green)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span style={{ color: 'white', fontSize: '14px', fontWeight: 700 }}>✓</span>
      </div>
      <p
        style={{
          fontSize: '14px',
          lineHeight: 1.7,
          color: 'var(--color-slate)',
        }}
      >
        {message}
      </p>
    </div>
  )
}
