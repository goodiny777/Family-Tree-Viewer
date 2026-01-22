import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import ru from './locales/ru.json'
import he from './locales/he.json'
import es from './locales/es.json'

// Get saved language from localStorage or default to 'en'
const getSavedLanguage = (): string => {
  try {
    const stored = localStorage.getItem('familytree-storage')
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed?.state?.settings?.settings?.language || 'en'
    }
  } catch {
    // Ignore parsing errors
  }
  return 'en'
}

export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', dir: 'ltr' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', dir: 'rtl' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
] as const

export type SupportedLanguage = typeof supportedLanguages[number]['code']

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      he: { translation: he },
      es: { translation: es },
    },
    lng: getSavedLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
