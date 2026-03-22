'use client'

import { useState, useCallback } from 'react'

/**
 * Simple state management hook for controlling a HalfSheet.
 *
 * @example
 * const { isOpen, open, close, toggle } = useHalfSheet()
 * return (
 *   <>
 *     <button onClick={open}>Show sheet</button>
 *     <HalfSheet isOpen={isOpen} onClose={close}>…</HalfSheet>
 *   </>
 * )
 */
export function useHalfSheet(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

  return { isOpen, open, close, toggle } as const
}
