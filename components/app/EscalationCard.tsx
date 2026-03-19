/**
 * @module EscalationCard
 * @description Renders a list of escalation threshold items (e.g. "when to
 *   call your doctor") in a visually distinct warning card.
 * @version 1.0.0
 * @since March 2026
 */
interface Props {
  items: string[]
}

export default function EscalationCard({ items }: Props) {
  return (
    <div
      style={{
        background: 'var(--color-red-light)',
        border: '1px solid #FEB2B2',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span style={{ fontSize: '18px' }}>⚠️</span>
        <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-red)' }}>
          When to call your doctor
        </p>
      </div>
      <ul style={{ margin: 0, paddingLeft: '16px' }}>
        {items.map((item, i) => (
          <li
            key={i}
            style={{
              fontSize: '14px',
              lineHeight: 1.7,
              color: '#822727',
              marginBottom: '6px',
              fontWeight: 500,
            }}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
