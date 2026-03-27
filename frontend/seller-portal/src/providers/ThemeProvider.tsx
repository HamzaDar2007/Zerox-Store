import { useEffect } from 'react'
import { useThemeStore } from '@/store/theme.store'

/**
 * ThemeProvider — single point for theme class management on <html>.
 * Also detects system color-scheme preference on first load.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, color } = useThemeStore()

  // Apply theme classes whenever theme or color changes
  useEffect(() => {
    const root = document.documentElement

    // Enable smooth transitions for theme switch
    root.style.setProperty('transition', 'background-color 0.3s ease, color 0.3s ease')

    // Dark mode
    root.classList.toggle('dark', theme === 'dark')

    // Accent color
    root.className = root.className.replace(/\btheme-\w+/g, '').trim()
    if (color !== 'blue') root.classList.add(`theme-${color}`)

    // Set color-scheme meta for native form elements
    root.style.colorScheme = theme
  }, [theme, color])

  // Detect system preference on mount (only if user hasn't explicitly set one)
  useEffect(() => {
    const stored = localStorage.getItem('admin-theme')
    if (!stored) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        useThemeStore.getState().toggleTheme()
      }
    }
  }, [])

  return <>{children}</>
}
