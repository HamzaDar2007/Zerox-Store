/**
 * Session timeout hook.
 * Automatically logs the user out after 30 minutes of inactivity.
 * Resets on mouse, keyboard, scroll, and touch events.
 */
import { useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '@/store/auth.store'

const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes

export function useSessionTimeout() {
  const logout = useAuthStore((s) => s.logout)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      logout()
      window.location.href = '/login'
    }, SESSION_TIMEOUT)
  }, [logout])

  useEffect(() => {
    if (!isAuthenticated) return

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'] as const
    events.forEach((e) => window.addEventListener(e, resetTimer))
    resetTimer()

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isAuthenticated, resetTimer])
}
