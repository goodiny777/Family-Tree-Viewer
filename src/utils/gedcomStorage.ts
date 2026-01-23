/**
 * GEDCOM localStorage persistence
 * Stores raw GEDCOM text for restoration on page reload
 */

const STORAGE_KEY = 'familytree-gedcom-cache'

interface CachedGedcom {
  text: string
  fileName: string
  timestamp: number
}

/**
 * Save GEDCOM text to localStorage
 */
export function saveGedcomToStorage(text: string, fileName: string): void {
  try {
    const cache: CachedGedcom = {
      text,
      fileName,
      timestamp: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
  } catch (error) {
    // localStorage might be full or disabled
    console.warn('Failed to cache GEDCOM data:', error)
  }
}

/**
 * Load GEDCOM text from localStorage
 */
export function loadGedcomFromStorage(): CachedGedcom | null {
  try {
    const cached = localStorage.getItem(STORAGE_KEY)
    if (!cached) return null

    const data = JSON.parse(cached) as CachedGedcom

    // Validate structure
    if (!data.text || typeof data.text !== 'string') {
      return null
    }

    return data
  } catch (error) {
    console.warn('Failed to load cached GEDCOM data:', error)
    return null
  }
}

/**
 * Clear cached GEDCOM data from localStorage
 */
export function clearGedcomStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear GEDCOM cache:', error)
  }
}

/**
 * Check if there's cached GEDCOM data
 */
export function hasGedcomInStorage(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null
  } catch {
    return false
  }
}
