/**
 * @module animations
 * @description Shared animation utilities for micro-interactions, celebrations,
 *   haptic feedback, and gamification motion. CSS-only + tiny JS helpers.
 *   No external animation libraries needed.
 * @version 1.0.0
 * @since March 2026
 */

/* ── Haptic Feedback ──────────────────────────────────────────────────────── */

/**
 * Trigger haptic feedback via navigator.vibrate().
 * Gracefully degrades on desktop / unsupported browsers.
 */
export function triggerHaptic(type: 'light' | 'medium' | 'success' = 'light') {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return

  const patterns: Record<string, number | number[]> = {
    light: 10,
    medium: 25,
    success: [15, 50, 30],
  }

  try {
    navigator.vibrate(patterns[type])
  } catch {
    // Silently ignore — some browsers throw on vibrate()
  }
}

/* ── Confetti ─────────────────────────────────────────────────────────────── */

const CONFETTI_COLORS = [
  '#3D8178', // Sage 500
  '#C4844E', // Terra 400
  '#F59E0B', // Gold
  '#FFFFFF', // White
  '#22C55E', // Green
  '#A8CECA', // Sage 200
  '#D97706', // Amber
]

/**
 * Creates CSS confetti particles inside a container element.
 * Particles self-remove after the animation completes.
 */
export function triggerConfetti(container: HTMLElement, count = 30) {
  // Inject keyframes if not already present
  injectKeyframes('lumira-confetti-fall', `
    @keyframes lumira-confetti-fall {
      0% { opacity: 1; transform: translateY(0) rotate(0deg); }
      100% { opacity: 0; transform: translateY(100vh) rotate(720deg); }
    }
  `)

  const fragment = document.createDocumentFragment()

  for (let i = 0; i < count; i++) {
    const el = document.createElement('span')
    const left = Math.random() * 100
    const delay = Math.random() * 0.5
    const duration = 1.5 + Math.random() * 1.5
    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length]
    const size = 6 + Math.random() * 8
    const isCircle = Math.random() > 0.5

    Object.assign(el.style, {
      position: 'absolute',
      left: `${left}%`,
      top: '-10px',
      width: `${size}px`,
      height: `${size}px`,
      background: color,
      borderRadius: isCircle ? '50%' : '2px',
      pointerEvents: 'none',
      opacity: '0',
      animation: `lumira-confetti-fall ${duration}s ${delay}s ease-in forwards`,
      zIndex: '10000',
    })

    fragment.appendChild(el)
  }

  container.style.position = container.style.position || 'relative'
  container.style.overflow = 'hidden'
  container.appendChild(fragment)

  // Cleanup after animation
  setTimeout(() => {
    const spans = container.querySelectorAll('span[style*="lumira-confetti-fall"]')
    spans.forEach((s) => s.remove())
  }, 3500)
}

/* ── Sparkle Effect ───────────────────────────────────────────────────────── */

/**
 * Brief sparkle/shimmer effect on an element.
 * Creates small star particles that burst outward and fade.
 */
export function triggerSparkle(element: HTMLElement) {
  injectKeyframes('lumira-sparkle-burst', `
    @keyframes lumira-sparkle-burst {
      0% { opacity: 1; transform: translate(0, 0) scale(1); }
      100% { opacity: 0; transform: translate(var(--sparkle-tx), var(--sparkle-ty)) scale(0); }
    }
  `)

  const rect = element.getBoundingClientRect()
  const centerX = rect.width / 2
  const centerY = rect.height / 2

  for (let i = 0; i < 8; i++) {
    const spark = document.createElement('span')
    const angle = (i / 8) * Math.PI * 2
    const distance = 20 + Math.random() * 20
    const tx = Math.cos(angle) * distance
    const ty = Math.sin(angle) * distance

    spark.textContent = '\u2728'
    Object.assign(spark.style, {
      position: 'absolute',
      left: `${centerX}px`,
      top: `${centerY}px`,
      fontSize: `${8 + Math.random() * 6}px`,
      pointerEvents: 'none',
      zIndex: '100',
      animation: `lumira-sparkle-burst 0.4s ${i * 0.03}s ease-out forwards`,
    })
    spark.style.setProperty('--sparkle-tx', `${tx}px`)
    spark.style.setProperty('--sparkle-ty', `${ty}px`)

    const parent = element.style.position === 'relative' || element.style.position === 'absolute'
      ? element
      : element.parentElement || element

    if (parent.style.position !== 'relative' && parent.style.position !== 'absolute') {
      parent.style.position = 'relative'
    }
    parent.style.overflow = 'visible'
    parent.appendChild(spark)

    setTimeout(() => spark.remove(), 600)
  }
}

/* ── Floating Number Animation ("+N seeds") ───────────────────────────────── */

/**
 * Shows a "+N" floating up from an element and fading out.
 */
export function triggerFloatingNumber(
  element: HTMLElement,
  value: number,
  options: { prefix?: string; color?: string; emoji?: string } = {}
) {
  const { prefix = '+', color = '#3D8178', emoji = '' } = options

  injectKeyframes('lumira-float-up', `
    @keyframes lumira-float-up {
      0% { opacity: 1; transform: translateY(0) scale(1); }
      60% { opacity: 1; transform: translateY(-24px) scale(1.1); }
      100% { opacity: 0; transform: translateY(-40px) scale(0.9); }
    }
  `)

  const el = document.createElement('span')
  el.textContent = `${emoji}${prefix}${value}`
  Object.assign(el.style, {
    position: 'absolute',
    top: '-8px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '14px',
    fontWeight: '700',
    color,
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    zIndex: '100',
    animation: 'lumira-float-up 0.8s ease-out forwards',
    textShadow: '0 1px 3px rgba(0,0,0,0.1)',
  })

  const parent = element.parentElement || element
  if (parent.style.position !== 'relative' && parent.style.position !== 'absolute') {
    parent.style.position = 'relative'
  }
  parent.style.overflow = 'visible'
  parent.appendChild(el)

  setTimeout(() => el.remove(), 900)
}

/* ── Coin/Seed Bounce ─────────────────────────────────────────────────────── */

/**
 * Triggers the seed pill bounce + glow animation.
 * Apply this to the SeedsBalancePill element.
 */
export function triggerCoinBounce(element: HTMLElement, amount?: number) {
  injectKeyframes('lumira-coin-bounce', `
    @keyframes lumira-coin-bounce {
      0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(61, 129, 120, 0); }
      30% { transform: scale(1.2); box-shadow: 0 0 12px 4px rgba(61, 129, 120, 0.3); }
      60% { transform: scale(0.95); box-shadow: 0 0 4px 1px rgba(61, 129, 120, 0.1); }
      100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(61, 129, 120, 0); }
    }
  `)

  element.style.animation = 'lumira-coin-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'

  if (amount && amount > 0) {
    triggerFloatingNumber(element, amount, {
      prefix: '+',
      color: '#3D8178',
      emoji: '\uD83C\uDF31 ',
    })
  }

  setTimeout(() => {
    element.style.animation = ''
  }, 600)
}

/* ── Shake Animation ──────────────────────────────────────────────────────── */

/**
 * Gentle shake animation for wrong answers. Not aggressive.
 */
export function triggerShake(element: HTMLElement) {
  injectKeyframes('lumira-gentle-shake', `
    @keyframes lumira-gentle-shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-4px); }
      40% { transform: translateX(4px); }
      60% { transform: translateX(-3px); }
      80% { transform: translateX(2px); }
    }
  `)

  element.style.animation = 'lumira-gentle-shake 0.4s ease-in-out'
  setTimeout(() => { element.style.animation = '' }, 450)
}

/* ── Green Flash ──────────────────────────────────────────────────────────── */

/**
 * Brief green flash overlay on an element for correct answers.
 */
export function triggerGreenFlash(element: HTMLElement) {
  injectKeyframes('lumira-green-flash', `
    @keyframes lumira-green-flash {
      0% { opacity: 0; }
      30% { opacity: 1; }
      100% { opacity: 0; }
    }
  `)

  const flash = document.createElement('div')
  Object.assign(flash.style, {
    position: 'absolute',
    inset: '0',
    background: 'rgba(34, 197, 94, 0.12)',
    borderRadius: 'inherit',
    pointerEvents: 'none',
    zIndex: '10',
    animation: 'lumira-green-flash 0.5s ease-out forwards',
  })

  if (element.style.position !== 'relative' && element.style.position !== 'absolute') {
    element.style.position = 'relative'
  }
  element.appendChild(flash)
  setTimeout(() => flash.remove(), 600)
}

/* ── Floating Emoji ───────────────────────────────────────────────────────── */

/**
 * Float an emoji upward from an element (e.g., party popper on correct answer).
 */
export function triggerFloatingEmoji(element: HTMLElement, emoji = '\uD83C\uDF89') {
  injectKeyframes('lumira-emoji-float', `
    @keyframes lumira-emoji-float {
      0% { opacity: 1; transform: translateY(0) scale(0.5); }
      40% { opacity: 1; transform: translateY(-30px) scale(1.2); }
      100% { opacity: 0; transform: translateY(-60px) scale(0.8); }
    }
  `)

  const el = document.createElement('span')
  el.textContent = emoji
  Object.assign(el.style, {
    position: 'absolute',
    top: '0',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '28px',
    pointerEvents: 'none',
    zIndex: '100',
    animation: 'lumira-emoji-float 0.9s ease-out forwards',
  })

  if (element.style.position !== 'relative' && element.style.position !== 'absolute') {
    element.style.position = 'relative'
  }
  element.style.overflow = 'visible'
  element.appendChild(el)

  setTimeout(() => el.remove(), 1000)
}

/* ── Toast Notification ───────────────────────────────────────────────────── */

/**
 * Shows a brief toast that slides in and fades out.
 */
export function showToast(message: string, duration = 2000) {
  injectKeyframes('lumira-toast-in', `
    @keyframes lumira-toast-in {
      0% { opacity: 0; transform: translate(-50%, -20px); }
      100% { opacity: 1; transform: translate(-50%, 0); }
    }
    @keyframes lumira-toast-out {
      0% { opacity: 1; transform: translate(-50%, 0); }
      100% { opacity: 0; transform: translate(-50%, -20px); }
    }
  `)

  const toast = document.createElement('div')
  toast.textContent = message
  Object.assign(toast.style, {
    position: 'fixed',
    top: 'max(60px, env(safe-area-inset-top, 20px))',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#3D8178',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: '100px',
    fontSize: '14px',
    fontWeight: '600',
    zIndex: '10000',
    pointerEvents: 'none',
    boxShadow: '0 4px 16px rgba(61, 129, 120, 0.3)',
    animation: 'lumira-toast-in 0.3s ease-out forwards',
    whiteSpace: 'nowrap',
  })

  document.body.appendChild(toast)

  setTimeout(() => {
    toast.style.animation = 'lumira-toast-out 0.3s ease-in forwards'
    setTimeout(() => toast.remove(), 350)
  }, duration)
}

/* ── Slide-in from top ────────────────────────────────────────────────────── */

/**
 * Slides an element in from the top with a subtle green flash border.
 */
export function triggerSlideInFromTop(element: HTMLElement) {
  injectKeyframes('lumira-slide-in-top', `
    @keyframes lumira-slide-in-top {
      0% { opacity: 0; transform: translateY(-20px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes lumira-border-flash {
      0% { box-shadow: 0 0 0 2px rgba(61, 129, 120, 0.4); }
      100% { box-shadow: 0 0 0 0 rgba(61, 129, 120, 0); }
    }
  `)

  element.style.animation = 'lumira-slide-in-top 0.4s ease-out, lumira-border-flash 1s 0.4s ease-out'
  setTimeout(() => { element.style.animation = '' }, 1500)
}

/* ── Counting Effect ──────────────────────────────────────────────────────── */

/**
 * Animates a number counting up from `from` to `to`.
 * Calls `onUpdate` with the current value each frame.
 */
export function animateCount(
  from: number,
  to: number,
  duration: number,
  onUpdate: (value: number) => void
) {
  const start = performance.now()
  const diff = to - from

  function tick(now: number) {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3)
    const current = Math.round(from + diff * eased)
    onUpdate(current)

    if (progress < 1) {
      requestAnimationFrame(tick)
    }
  }

  requestAnimationFrame(tick)
}

/* ── CSS Class strings for inline injection ───────────────────────────────── */

/** Skeleton pulse animation CSS for loading states */
export const SKELETON_STYLES = `
  @keyframes lumira-skeleton-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  .lumira-skeleton {
    background: linear-gradient(90deg, #F2F0EC 25%, #E8E6E1 50%, #F2F0EC 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite, lumira-skeleton-pulse 2s ease-in-out infinite;
    border-radius: 8px;
  }
  .lumira-skeleton-text {
    height: 14px;
    margin-bottom: 8px;
    border-radius: 4px;
  }
  .lumira-skeleton-title {
    height: 20px;
    width: 60%;
    margin-bottom: 12px;
    border-radius: 4px;
  }
`

/** Button press feedback CSS — adds scale-down on press for tactile feel */
export const BUTTON_PRESS_STYLES = `
  .lumira-btn-press {
    transition: transform 0.1s ease, opacity 0.15s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .lumira-btn-press:active:not(:disabled) {
    transform: scale(0.97);
  }
`

/* ── Keyframe injection utility ───────────────────────────────────────────── */

const injectedKeyframes = new Set<string>()

function injectKeyframes(id: string, css: string) {
  if (typeof document === 'undefined') return
  if (injectedKeyframes.has(id)) return
  injectedKeyframes.add(id)

  const style = document.createElement('style')
  style.setAttribute('data-lumira-anim', id)
  style.textContent = css
  document.head.appendChild(style)
}
