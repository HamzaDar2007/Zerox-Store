import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSessionTimeout } from './useSessionTimeout'
import { useAuthStore } from '@/store/auth.store'

describe('useSessionTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useAuthStore.setState({ isAuthenticated: true, user: null, accessToken: 'tok', refreshToken: 'ref' })
  })

  afterEach(() => {
    vi.useRealTimers()
    useAuthStore.getState().logout()
  })

  it('does nothing when not authenticated', () => {
    useAuthStore.setState({ isAuthenticated: false })
    renderHook(() => useSessionTimeout())
    vi.advanceTimersByTime(31 * 60 * 1000)
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('logs out after 30 minutes of inactivity', () => {
    renderHook(() => useSessionTimeout())
    expect(useAuthStore.getState().isAuthenticated).toBe(true)

    vi.advanceTimersByTime(30 * 60 * 1000)
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('resets timer on user activity', () => {
    renderHook(() => useSessionTimeout())

    // Advance 20 minutes
    vi.advanceTimersByTime(20 * 60 * 1000)
    expect(useAuthStore.getState().isAuthenticated).toBe(true)

    // Simulate user activity
    act(() => {
      document.dispatchEvent(new MouseEvent('mousedown'))
    })

    // Advance another 20 minutes — should NOT logout because timer was reset
    vi.advanceTimersByTime(20 * 60 * 1000)
    expect(useAuthStore.getState().isAuthenticated).toBe(true)

    // Advance remaining 10 minutes to hit the 30-min mark from the reset
    vi.advanceTimersByTime(10 * 60 * 1000)
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('cleans up event listeners on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener')
    const { unmount } = renderHook(() => useSessionTimeout())
    unmount()
    expect(removeSpy).toHaveBeenCalledWith('mousedown', expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    removeSpy.mockRestore()
  })
})
