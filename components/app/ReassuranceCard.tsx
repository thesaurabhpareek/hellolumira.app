/**
 * @module ReassuranceCard
 * @description Soft reassurance card displaying a normalising message to
 *   help parents feel confident about common concerns.
 * @version 1.1.0 — Migrated inline styles → Tailwind classes
 * @since March 2026
 */
interface Props {
  message: string
}

export default function ReassuranceCard({ message }: Props) {
  return (
    <div className="bg-status-green-light border border-[#9AE6B4] rounded-lg px-5 py-4 flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-status-green flex items-center justify-center shrink-0">
        <span className="text-white text-sm font-bold">✓</span>
      </div>
      <p className="text-sm leading-[1.7] text-foreground">{message}</p>
    </div>
  )
}
