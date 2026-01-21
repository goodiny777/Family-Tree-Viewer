import { parse } from 'parse-gedcom'
import type { GedcomData, Individual, Family, GedcomHeader, PersonName, GedcomEvent, Address } from '../../types'

/**
 * Unist node type from parse-gedcom
 */
interface UnistNode {
  type: string
  value?: string
  data?: {
    xref_id?: string
    pointer?: string
    formal_name?: string
    [key: string]: unknown
  }
  children?: UnistNode[]
}

/**
 * Parse a GEDCOM file string into structured data
 */
export function parseGedcomFile(gedcomString: string): GedcomData {
  const parsed = parse(gedcomString) as UnistNode

  const individuals = new Map<string, Individual>()
  const families = new Map<string, Family>()
  let header: GedcomHeader | undefined

  // The root node has children which are the actual GEDCOM records
  const records = parsed.children || []

  for (const record of records) {
    if (record.type === 'HEAD') {
      header = parseHeader(record)
    } else if (record.type === 'INDI') {
      const individual = parseIndividual(record)
      individuals.set(individual.id, individual)
    } else if (record.type === 'FAM') {
      const family = parseFamily(record)
      families.set(family.id, family)
    }
  }

  return { individuals, families, header }
}

/**
 * Parse GEDCOM header
 */
function parseHeader(record: UnistNode): GedcomHeader {
  const header: GedcomHeader = {}

  for (const child of record.children || []) {
    switch (child.type) {
      case 'GEDC':
        header.version = findValue(child, 'VERS')
        break
      case 'CHAR':
        header.charset = child.value
        break
      case 'LANG':
        header.language = child.value
        break
      case 'SOUR':
        header.source = child.value
        break
      case 'DATE':
        header.date = child.value
        break
    }
  }

  return header
}

/**
 * Parse individual record
 */
function parseIndividual(record: UnistNode): Individual {
  const id = stripAt(record.data?.xref_id)

  const individual: Individual = {
    id,
    name: { full: '' },
    gender: 'U',
    familyAsSpouse: [],
    isDeceased: false,
  }

  for (const child of record.children || []) {
    switch (child.type) {
      case 'NAME':
        individual.name = parseName(child)
        break
      case 'SEX':
        individual.gender = (child.value as 'M' | 'F' | 'U') || 'U'
        break
      case 'BIRT':
        individual.birth = parseEvent(child)
        break
      case 'DEAT':
        individual.death = parseEvent(child)
        individual.isDeceased = true
        break
      case 'BURI':
        individual.burial = parseEvent(child)
        break
      case 'RESI':
        individual.residence = {
          address: parseAddress(child),
          date: findValue(child, 'DATE'),
        }
        break
      case 'EMAIL':
        individual.email = child.value
        break
      case 'PHON':
        individual.phone = child.value
        break
      case 'WWW':
        individual.website = child.value
        break
      case 'OCCU':
        individual.occupation = individual.occupation || []
        individual.occupation.push({
          value: child.value || '',
          date: findValue(child, 'DATE'),
          place: findValue(child, 'PLAC'),
          note: findValue(child, 'NOTE'),
        })
        break
      case 'EDUC':
        individual.education = individual.education || []
        individual.education.push({
          value: child.value || '',
          date: findValue(child, 'DATE'),
          place: findValue(child, 'PLAC'),
          note: findValue(child, 'NOTE'),
        })
        break
      case 'RELI':
        individual.religion = child.value
        break
      case 'NATI':
        individual.nationality = child.value
        break
      case 'DSCR':
        individual.description = child.value
        break
      case 'EVEN':
        individual.events = individual.events || []
        individual.events.push({
          type: findValue(child, 'TYPE') || 'Event',
          value: child.value,
          date: findValue(child, 'DATE'),
          place: findValue(child, 'PLAC'),
          note: findValue(child, 'NOTE'),
        })
        break
      case 'FAMS':
        individual.familyAsSpouse.push(stripAt(child.data?.pointer))
        break
      case 'FAMC':
        individual.familyAsChild = stripAt(child.data?.pointer)
        break
      case 'NOTE':
        individual.notes = individual.notes || []
        individual.notes.push(child.value || '')
        break
    }
  }

  return individual
}

/**
 * Parse family record
 */
function parseFamily(record: UnistNode): Family {
  const id = stripAt(record.data?.xref_id)

  const family: Family = {
    id,
    children: [],
  }

  for (const child of record.children || []) {
    switch (child.type) {
      case 'HUSB':
        family.husband = stripAt(child.data?.pointer)
        break
      case 'WIFE':
        family.wife = stripAt(child.data?.pointer)
        break
      case 'CHIL':
        family.children.push(stripAt(child.data?.pointer))
        break
      case 'MARR':
        family.marriage = parseEvent(child)
        break
      case 'DIV':
        family.divorce = parseEvent(child)
        break
      case 'NOTE':
        family.notes = family.notes || []
        family.notes.push(child.value || '')
        break
    }
  }

  return family
}

/**
 * Parse name structure
 */
function parseName(record: UnistNode): PersonName {
  const fullName = record.value || ''

  // Extract surname from GEDCOM format: "Given /Surname/"
  const surnameMatch = fullName.match(/\/([^/]*)\//)
  const surname = surnameMatch ? surnameMatch[1] : ''
  const given = fullName.replace(/\/[^/]*\//g, '').trim()

  const name: PersonName = {
    full: fullName.replace(/\//g, '').trim() || `${given} ${surname}`.trim(),
    given,
    surname,
  }

  for (const child of record.children || []) {
    switch (child.type) {
      case 'GIVN':
        name.given = child.value || name.given
        break
      case 'SURN':
        name.surname = child.value || name.surname
        break
      case '_MARNM':
        name.marriedName = child.value
        break
      case 'NPFX':
        name.prefix = child.value
        break
      case 'NSFX':
        name.suffix = child.value
        break
    }
  }

  // Reconstruct full name if we have parts
  if (name.given || name.surname) {
    name.full = `${name.given || ''} ${name.surname || ''}`.trim()
  }

  return name
}

/**
 * Parse event structure (birth, death, marriage, etc.)
 */
function parseEvent(record: UnistNode): GedcomEvent {
  const event: GedcomEvent = {}

  for (const child of record.children || []) {
    switch (child.type) {
      case 'DATE':
        event.date = child.value
        break
      case 'PLAC':
        event.place = child.value
        break
      case 'CAUS':
        event.cause = child.value
        break
      case 'NOTE':
        event.note = child.value
        break
    }
  }

  return event
}

/**
 * Parse address structure
 */
function parseAddress(record: UnistNode): Address {
  const address: Address = {}

  for (const child of record.children || []) {
    switch (child.type) {
      case 'ADDR':
        // Main address can have sub-components or just be a single line
        if (child.children && child.children.length > 0) {
          for (const addrChild of child.children) {
            switch (addrChild.type) {
              case 'ADR1':
                address.line1 = addrChild.value
                break
              case 'ADR2':
                address.line2 = addrChild.value
                break
              case 'CITY':
                address.city = addrChild.value
                break
              case 'STAE':
                address.state = addrChild.value
                break
              case 'CTRY':
                address.country = addrChild.value
                break
              case 'POST':
                address.postalCode = addrChild.value
                break
            }
          }
        } else {
          address.line1 = child.value
        }
        break
      case 'ADR1':
        address.line1 = child.value
        break
      case 'ADR2':
        address.line2 = child.value
        break
      case 'CITY':
        address.city = child.value
        break
      case 'STAE':
        address.state = child.value
        break
      case 'CTRY':
        address.country = child.value
        break
      case 'POST':
        address.postalCode = child.value
        break
    }
  }

  return address
}

/**
 * Find a value in child nodes by type
 */
function findValue(record: UnistNode, nodeType: string): string | undefined {
  const child = record.children?.find((c) => c.type === nodeType)
  return child?.value
}

/**
 * Strip @ symbols from GEDCOM IDs/pointers
 */
function stripAt(id: string | undefined): string {
  if (!id) return ''
  return id.replace(/@/g, '')
}
