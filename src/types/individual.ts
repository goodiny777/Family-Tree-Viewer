/**
 * GEDCOM Event structure
 */
export interface GedcomEvent {
  date?: string
  place?: string
  cause?: string
  note?: string
}

/**
 * Address structure for residence
 */
export interface Address {
  line1?: string
  line2?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
}

/**
 * Name structure
 */
export interface PersonName {
  full: string
  given?: string
  surname?: string
  marriedName?: string
  prefix?: string
  suffix?: string
}

/**
 * Media object (photo, document)
 */
export interface MediaObject {
  id: string
  file?: string
  format?: string
  title?: string
}

/**
 * Source citation
 */
export interface SourceCitation {
  id: string
  page?: string
  data?: string
}

/**
 * Custom event (hobbies, sports, languages, etc.)
 */
export interface CustomEvent {
  type: string
  value?: string
  date?: string
  place?: string
  note?: string
}

/**
 * Gender type
 */
export type Gender = 'M' | 'F' | 'U'

/**
 * Individual person record from GEDCOM
 */
export interface Individual {
  // Identity
  id: string
  name: PersonName
  gender: Gender

  // Life Events
  birth?: GedcomEvent
  death?: GedcomEvent
  burial?: GedcomEvent

  // Residence & Contact
  residence?: {
    address?: Address
    date?: string
  }
  email?: string
  phone?: string
  website?: string

  // Life Details
  occupation?: {
    value: string
    date?: string
    place?: string
    note?: string
  }[]
  education?: {
    value: string
    date?: string
    place?: string
    note?: string
  }[]
  religion?: string
  nationality?: string
  description?: string

  // Custom Events
  events?: CustomEvent[]

  // Relationships (references to Family IDs)
  familyAsSpouse: string[]
  familyAsChild?: string

  // Other
  notes?: string[]
  media?: MediaObject[]
  sources?: SourceCitation[]

  // Computed
  isDeceased: boolean
}

/**
 * Check if an individual is deceased
 */
export function isDeceased(individual: Individual): boolean {
  return !!individual.death?.date || individual.isDeceased
}

/**
 * Get full name display string
 */
export function getDisplayName(individual: Individual): string {
  return individual.name.full ||
    `${individual.name.given || ''} ${individual.name.surname || ''}`.trim() ||
    'Unknown'
}

/**
 * Get birth year from date string
 */
export function getBirthYear(individual: Individual): number | null {
  if (!individual.birth?.date) return null
  const match = individual.birth.date.match(/\d{4}/)
  return match ? parseInt(match[0], 10) : null
}

/**
 * Get death year from date string
 */
export function getDeathYear(individual: Individual): number | null {
  if (!individual.death?.date) return null
  const match = individual.death.date.match(/\d{4}/)
  return match ? parseInt(match[0], 10) : null
}

/**
 * Get life span string (e.g., "1950 - 2020" or "1950 - Living")
 */
export function getLifeSpan(individual: Individual): string {
  const birthYear = getBirthYear(individual)
  const deathYear = getDeathYear(individual)

  if (!birthYear) return ''

  if (individual.isDeceased || deathYear) {
    return `${birthYear} - ${deathYear || '?'}`
  }

  return `${birthYear} - Living`
}
