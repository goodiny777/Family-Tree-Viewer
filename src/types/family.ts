import type { GedcomEvent } from './individual'

/**
 * Family record from GEDCOM
 * Represents a family unit (couple + children)
 */
export interface Family {
  id: string

  // Spouses (references to Individual IDs)
  husband?: string
  wife?: string

  // Children (references to Individual IDs)
  children: string[]

  // Marriage event
  marriage?: GedcomEvent

  // Divorce event
  divorce?: GedcomEvent

  // Notes
  notes?: string[]
}

/**
 * Get spouse ID given one partner
 */
export function getSpouseId(family: Family, individualId: string): string | undefined {
  if (family.husband === individualId) return family.wife
  if (family.wife === individualId) return family.husband
  return undefined
}

/**
 * Check if individual is a spouse in family
 */
export function isSpouseInFamily(family: Family, individualId: string): boolean {
  return family.husband === individualId || family.wife === individualId
}

/**
 * Check if individual is a child in family
 */
export function isChildInFamily(family: Family, individualId: string): boolean {
  return family.children.includes(individualId)
}
