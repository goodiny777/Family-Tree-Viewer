/**
 * Date parsing and formatting utilities for GEDCOM dates
 */

/**
 * Parse a GEDCOM date string and extract the year
 * Handles various formats: "15 JAN 1950", "ABT 1950", "BET 1950 AND 1960", etc.
 */
export function extractYear(dateString: string | undefined): number | null {
  if (!dateString) return null
  const match = dateString.match(/\d{4}/)
  return match ? parseInt(match[0], 10) : null
}

/**
 * Parse a GEDCOM date string into a Date object (approximate)
 */
export function parseGedcomDate(dateString: string | undefined): Date | null {
  if (!dateString) return null

  // Remove modifiers
  const cleaned = dateString
    .replace(/^(ABT|EST|CAL|BEF|AFT|FROM|TO|BET|AND)\s*/gi, '')
    .trim()

  // Try to parse "DD MMM YYYY" format
  const fullMatch = cleaned.match(/(\d{1,2})\s+(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+(\d{4})/i)
  if (fullMatch) {
    const months: Record<string, number> = {
      JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
      JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11
    }
    const day = parseInt(fullMatch[1], 10)
    const month = months[fullMatch[2].toUpperCase()]
    const year = parseInt(fullMatch[3], 10)
    return new Date(year, month, day)
  }

  // Try "MMM YYYY" format
  const monthYearMatch = cleaned.match(/(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+(\d{4})/i)
  if (monthYearMatch) {
    const months: Record<string, number> = {
      JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
      JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11
    }
    const month = months[monthYearMatch[1].toUpperCase()]
    const year = parseInt(monthYearMatch[2], 10)
    return new Date(year, month, 1)
  }

  // Try just year
  const yearMatch = cleaned.match(/(\d{4})/)
  if (yearMatch) {
    return new Date(parseInt(yearMatch[1], 10), 0, 1)
  }

  return null
}

/**
 * Format a date for display
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return ''

  // Keep the original string if it has modifiers
  if (/^(ABT|EST|CAL|BEF|AFT)/i.test(dateString)) {
    return dateString
  }

  const date = parseGedcomDate(dateString)
  if (!date) return dateString

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Calculate age from birth date to optional death date or today
 */
export function calculateAge(birthDate: string | undefined, deathDate?: string | undefined): number | null {
  const birth = parseGedcomDate(birthDate)
  if (!birth) return null

  const end = deathDate ? parseGedcomDate(deathDate) : new Date()
  if (!end) return null

  let age = end.getFullYear() - birth.getFullYear()
  const monthDiff = end.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
    age--
  }

  return age
}

/**
 * Format life span string
 */
export function formatLifeSpan(birthDate: string | undefined, deathDate: string | undefined, isDeceased: boolean): string {
  const birthYear = extractYear(birthDate)
  const deathYear = extractYear(deathDate)

  if (!birthYear) return ''

  if (isDeceased || deathYear) {
    return `${birthYear} – ${deathYear || '?'}`
  }

  return `${birthYear} – Present`
}
