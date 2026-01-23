import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../store'
import { supportedLanguages } from '../i18n'
import { loadGedcomFromStorage } from '../utils/gedcomStorage'
import { parseGedcomFile } from '../core/gedcom/parser'

/**
 * Hook to initialize and synchronize app settings with the DOM
 * - Restores cached GEDCOM data from localStorage
 * - Applies theme (light/dark/system)
 * - Applies language direction (ltr/rtl)
 * - Syncs language changes with i18n
 */
export function useInitialization() {
  const { i18n } = useTranslation()
  const settings = useStore((state) => state.settings.settings)
  const hasData = useStore((state) => state.gedcom.hasData)
  const { setGedcomData } = useStore((state) => state.gedcom)

  // Restore cached GEDCOM data on initial load
  useEffect(() => {
    // Only restore if we don't already have data
    if (hasData) return

    const cached = loadGedcomFromStorage()
    if (cached) {
      try {
        const data = parseGedcomFile(cached.text)
        setGedcomData(data)
        console.debug(`Restored GEDCOM from cache: ${cached.fileName}`)
      } catch (error) {
        console.warn('Failed to restore cached GEDCOM:', error)
      }
    }
  }, []) // Run only once on mount

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
