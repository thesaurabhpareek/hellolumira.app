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
    <div className="bg-status-red-light border border-[#FEB2B2] rounded-lg" style={{ padding: '16px 20px' }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[18px]">⚠️</span>
        <p className="font-bold text-sm text-destructive">
          When to call your doctor
        </p>
      </div>
      <ul className="m-0 pl-4">
        {items.map((item, i) => (
          <li
            key={i}
            className="text-sm leading-[1.7] font-medium mb-[6px]"
            style={{ color: '#822727' }}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
