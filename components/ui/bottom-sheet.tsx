'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/* ── Bottom Sheet ────────────────────────────────────────────────
 *  Touch-draggable bottom sheet with snap points, backdrop blur,
 *  spring physics via CSS, and keyboard-aware positioning.
 * ─────────────────────────────────────────────────────────────── */

type SnapPoint = 0.25 | 0.5 | 0.75 | 1

export interface BottomSheetProps {
  /** Whether the sheet is visible */
  open: boolean
  /** Called when the sheet should close */
  onClose: () => void
  /** Snap points as fractions of viewport height. Default: [0.5, 1] */
  snapPoints?: SnapPoint[]
  /** Initial snap point index. Default: 0 (first snap point) */
  initialSnap?: number
  /** Size preset — overrides snapPoints with sensible defaults */
  size?: 'compact' | 'half' | 'full'
  /** Additional class for the sheet container */
  className?: string
  children?: React.ReactNode
}

const SIZE_SNAP_MAP: Record<string, SnapPoint[]> = {
  compact: [0.25],
  half: [0.5],
  full: [0.75, 1],
}

export function BottomSheet({
  open,
  onClose,
  snapPoints: snapPointsProp,
  initialSnap = 0,
  size,
  className,
  children,
}: BottomSheetProps) {
  const sheetRef = React.useRef<HTMLDivElement>(null)
  const dragRef = React.useRef({
    startY: 0,
    startHeight: 0,
    isDragging: false,
  })

  const snaps = size ? SIZE_SNAP_MAP[size] : snapPointsProp ?? [0.5, 1]
  const [currentSnapIndex, setCurrentSnapIndex] = React.useState(initialSnap)
  const [sheetHeight, setSheetHeight] = React.useState(0)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isClosing, setIsClosing] = React.useState(false)
  const [isVisible, setIsVisible] = React.useState(false)

  // Compute the target height from snap points
  const targetFraction = snaps[currentSnapIndex] ?? snaps[0]

  // Open/close lifecycle
  React.useEffect(() => {
    if (open) {
      setIsClosing(false)
      setIsVisible(true)
      setCurrentSnapIndex(initialSnap)
      // Slight delay so the mount animation plays
      requestAnimationFrame(() => {
        setSheetHeight(window.innerHeight * (snaps[initialSnap] ?? snaps[0]))
      })
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
    } else {
      // Trigger close animation
      setIsClosing(true)
      setSheetHeight(0)
      const timeout = setTimeout(() => {
        setIsVisible(false)
        setIsClosing(false)
      }, 300)
      document.body.style.overflow = ''
      return () => clearTimeout(timeout)
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Update height when snap changes (not during drag)
  React.useEffect(() => {
    if (!isDragging && open && isVisible) {
      setSheetHeight(window.innerHeight * targetFraction)
    }
  }, [currentSnapIndex, targetFraction, isDragging, open, isVisible])

  /* ── Drag handling ── */
  const onDragStart = (clientY: number) => {
    dragRef.current = {
      startY: clientY,
      startHeight: sheetHeight,
      isDragging: true,
    }
    setIsDragging(true)
  }

  const onDragMove = (clientY: number) => {
    if (!dragRef.current.isDragging) return
    const delta = dragRef.current.startY - clientY
    const newHeight = Math.max(0, dragRef.current.startHeight + delta)
    setSheetHeight(Math.min(newHeight, window.innerHeight * 0.95))
  }

  const onDragEnd = () => {
    if (!dragRef.current.isDragging) return
    dragRef.current.isDragging = false
    setIsDragging(false)

    const fraction = sheetHeight / window.innerHeight

    // If dragged below 15% of viewport, close
    if (fraction < 0.15) {
      onClose()
      return
    }

    // Find nearest snap point
    let nearestIndex = 0
    let nearestDist = Infinity
    for (let i = 0; i < snaps.length; i++) {
      const dist = Math.abs(fraction - snaps[i])
      if (dist < nearestDist) {
        nearestDist = dist
        nearestIndex = i
      }
    }
    setCurrentSnapIndex(nearestIndex)
  }

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    onDragStart(e.touches[0].clientY)
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    onDragMove(e.touches[0].clientY)
  }
  const handleTouchEnd = () => onDragEnd()

  // Mouse events (desktop testing)
  const handleMouseDown = (e: React.MouseEvent) => {
    onDragStart(e.clientY)
    const onMouseMove = (ev: MouseEvent) => onDragMove(ev.clientY)
    const onMouseUp = () => {
      onDragEnd()
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  // Escape key
  React.useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!isVisible) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50',
          'bg-black/30 backdrop-blur-[2px]',
          'transition-opacity duration-300 motion-reduce:transition-none',
          open && !isClosing ? 'opacity-100' : 'opacity-0'
        )}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        className={cn(
          'fixed inset-x-0 bottom-0 z-50',
          'bg-[var(--color-white)] dark:bg-[rgb(var(--card))]',
          'rounded-t-2xl',
          'shadow-[0_-4px_24px_rgba(0,0,0,0.12)]',
          isDragging ? '' : 'transition-[height] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
          'motion-reduce:transition-none',
          'flex flex-col',
          'safe-bottom',
          className
        )}
        style={{
          height: sheetHeight,
          maxHeight: '95vh',
        }}
      >
        {/* Drag handle */}
        <div
          className="flex items-center justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing shrink-0"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          role="separator"
          aria-orientation="horizontal"
          aria-label="Drag to resize"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp' && currentSnapIndex < snaps.length - 1) {
              setCurrentSnapIndex(currentSnapIndex + 1)
            }
            if (e.key === 'ArrowDown') {
              if (currentSnapIndex > 0) {
                setCurrentSnapIndex(currentSnapIndex - 1)
              } else {
                onClose()
              }
            }
          }}
        >
          <div className="w-9 h-[5px] rounded-full bg-[var(--color-border)]" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
          {children}
        </div>
      </div>
    </>
  )
}
