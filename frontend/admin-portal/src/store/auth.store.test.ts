import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '@/store/auth.store'
import type { User } from '@/types'

const mockUser: User = {
  id: '1',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'super-admin',
  isActive: true,
  isEmailVerified: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  it('starts with unauthenticated state', () => {
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
  })

  it('setAuth sets user and tokens', () => {
    useAuthStore.getState().setAuth(mockUser, 'access-token', 'refresh-token')
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user).toEqual(mockUser)
    expect(state.accessToken).toBe('access-token')
    expect(state.refreshToken).toBe('refresh-token')
  })

  it('setTokens updates tokens only', () => {
    useAuthStore.getState().setAuth(mockUser, 'old-access', 'old-refresh')
    useAuthStore.getState().setTokens('new-access', 'new-refresh')
    const state = useAuthStore.getState()
    expect(state.accessToken).toBe('new-access')
    expect(state.refreshToken).toBe('new-refresh')
    expect(state.user).toEqual(mockUser)
  })

  it('setUser updates user only', () => {
    useAuthStore.getState().setAuth(mockUser, 'access', 'refresh')
    const updatedUser = { ...mockUser, firstName: 'Updated' }
    useAuthStore.getState().setUser(updatedUser)
    const state = useAuthStore.getState()
    expect(state.user?.firstName).toBe('Updated')
    expect(state.accessToken).toBe('access')
  })

  it('logout clears all state', () => {
    useAuthStore.getState().setAuth(mockUser, 'access', 'refresh')
    expect(useAuthStore.getState().isAuthenticated).toBe(true)

    useAuthStore.getState().logout()
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
  })
})
