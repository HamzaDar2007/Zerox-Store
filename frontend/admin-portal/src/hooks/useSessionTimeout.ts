import { useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '@/store/auth.store'

const IDLE_TIMEOUT = 30 * 60 * 1000 // 30 minutes
const EVENTS: (keyof DocumentEventMap)[] = ['mousedown', 'keydown', 'scroll', 'touchstart']

export function useSessionTimeout() {
  const logout = useAuthStore((s) => s.logout)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      logout()
    }, IDLE_TIMEOUT)
  }, [logout])

  useEffect(() => {
    if (!isAuthenticated) return

    resetTimer()
    for (const event of EVENTS) {
      document.addEventListener(event, resetTimer, { passive: true })
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      for (const event of EVENTS) {
        document.removeEventListener(event, resetTimer)
      }
    }
  }, [isAuthenticated, resetTimer])
}
