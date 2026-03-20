'use client'
import { useEffect } from 'react'

export default function BadgeChecker() {
  useEffect(() => {
    fetch('/api/badges/check', { method: 'POST' }).catch(() => {})
  }, [])
  return null
}
