import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../store'
import { supportedLanguages } from '../i18n'

/**
 * Hook to initialize and synchronize app settings with the DOM
 * - Applies theme (light/dark/system)
 * - Applies language direction (ltr/rtl)
 * - Syncs language changes with i18n
 */
export function useInitialization() {
  const { i18n } = useTranslation()
  const settings = useStore((state) => state.settings.settings)

  // Apply theme
  useEffect(() => {
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    if (settings.theme === 'system') {
      // Use system preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      applyTheme(mediaQuery.matches)

      // Listen for system theme changes
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches)
      }
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      applyTheme(settings.theme === 'dark')
    }
  }, [settings.theme])

  // Apply language and direction
  useEffect(() => {
    // Change i18n language
    if (i18n.language !== settings.language) {
      i18n.changeLanguage(settings.language)
    }

    // Apply text direction
    const langConfig = supportedLanguages.find(l => l.code === settings.language)
    const dir = langConfig?.dir || 'ltr'
    document.documentElement.dir = dir
    document.documentElement.lang = settings.language
  }, [settings.language, i18n])
}
