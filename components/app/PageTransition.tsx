/**
 * @module PageTransition
 * @description Lightweight CSS-based page transition wrapper.
 *   Applies a subtle fade+slide-up on every route change without
 *   requiring the AnimatePresence overhead. Works with Next.js 14
 *   App Router where each page is server-rendered.
 *
 * Uses the `page-enter` CSS class defined in globals.css.
 *
 * @version 1.0.0
 * @since March 2026
 */

export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-enter">
      {children}
    </div>
  )
}
