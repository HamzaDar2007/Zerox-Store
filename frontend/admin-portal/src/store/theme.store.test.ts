import { describe, it, expect } from 'vitest'
import { useThemeStore } from '@/store/theme.store'

describe('useThemeStore', () => {
  it('defaults to light theme', () => {
    const state = useThemeStore.getState()
    expect(state.theme).toBe('light')
  })

  it('toggles theme', () => {
    useThemeStore.getState().toggleTheme()
    expect(useThemeStore.getState().theme).toBe('dark')
    useThemeStore.getState().toggleTheme()
    expect(useThemeStore.getState().theme).toBe('light')
  })

  it('toggles sidebar collapsed state', () => {
    const initial = useThemeStore.getState().sidebarCollapsed
    useThemeStore.getState().toggleSidebar()
    expect(useThemeStore.getState().sidebarCollapsed).toBe(!initial)
  })
})
