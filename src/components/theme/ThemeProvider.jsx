import { useEffect, useMemo, useRef, useState } from 'react'
import { ThemeContext } from './useTheme'

const THEME_STORAGE_KEY = 'costlyTheme'
const THEME_OPTIONS = ['light', 'dark', 'system']

function isThemePreference(value) {
  return THEME_OPTIONS.includes(value)
}

function readStoredTheme() {
  if (typeof window === 'undefined') return 'system'

  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    return isThemePreference(storedTheme) ? storedTheme : 'system'
  } catch {
    return 'system'
  }
}

function getSystemTheme() {
  return typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStoredTheme)
  const [systemTheme, setSystemTheme] = useState(getSystemTheme)
  const hasAppliedTheme = useRef(false)

  useEffect(() => {
    if (
      theme !== 'system' ||
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return undefined
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (event) => setSystemTheme(event.matches ? 'dark' : 'light')

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }

    if (typeof mediaQuery.addListener !== 'function') return undefined

    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [theme])

  const resolvedTheme = theme === 'system' ? systemTheme : theme

  useEffect(() => {
    const root = document.documentElement
    const transitionTimeout = hasAppliedTheme.current
      ? window.setTimeout(() => root.classList.remove('theme-transition'), 220)
      : undefined

    if (hasAppliedTheme.current) root.classList.add('theme-transition')
    root.classList.toggle('dark', resolvedTheme === 'dark')
    root.style.colorScheme = resolvedTheme
    hasAppliedTheme.current = true

    return () => {
      if (transitionTimeout) window.clearTimeout(transitionTimeout)
      root.classList.remove('theme-transition')
    }
  }, [resolvedTheme])

  function setTheme(nextTheme) {
    if (!isThemePreference(nextTheme)) return

    setThemeState(nextTheme)
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    } catch {
      // Private browsing and blocked storage should not prevent theme changes.
    }
  }

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
