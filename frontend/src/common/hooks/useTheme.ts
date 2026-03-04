import { useCallback, useEffect } from 'react';
import { useAppSelector, useAppDispatch, setTheme } from '@/store';

type Theme = 'light' | 'dark' | 'system';

function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
}

/**
 * Hook to manage dark / light / system theme.
 * Applies the `.dark` class on `<html>` and persists the choice.
 */
export function useTheme() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);

  // Apply on mount and when theme changes
  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  // Listen for system preference changes when in "system" mode
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyThemeClass('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const changeTheme = useCallback(
    (newTheme: Theme) => dispatch(setTheme(newTheme)),
    [dispatch],
  );

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    dispatch(setTheme(next));
  }, [dispatch, theme]);

  const isDark =
    theme === 'dark' ||
    (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return { theme, isDark, setTheme: changeTheme, toggleTheme };
}
