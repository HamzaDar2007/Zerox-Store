import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark'
export type ThemeColor = 'blue' | 'emerald' | 'rose' | 'orange' | 'violet'

interface ThemeState {
  theme: ThemeMode
  color: ThemeColor
  sidebarCollapsed: boolean
  toggleTheme: () => void
  setColor: (color: ThemeColor) => void
  toggleSidebar: () => void
}

function applyTheme(mode: ThemeMode, color: ThemeColor) {
  const root = document.documentElement
  root.classList.toggle('dark', mode === 'dark')
  root.className = root.className.replace(/\btheme-\w+/g, '').trim()
  if (color !== 'blue') root.classList.add(`theme-${color}`)
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      color: 'blue',
      sidebarCollapsed: false,
      toggleTheme: () =>
        set((state) => {
          const next = state.theme === 'light' ? 'dark' : 'light'
          applyTheme(next, state.color)
          return { theme: next }
        }),
      setColor: (color) =>
        set((state) => {
          applyTheme(state.theme, color)
          return { color }
        }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'seller-theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme, state.color)
      },
    },
  ),
)
