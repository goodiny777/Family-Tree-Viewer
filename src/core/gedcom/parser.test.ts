import { describe, it, expect } from 'vitest'
import { parseGedcomFile } from './parser'

describe('GEDCOM Parser', () => {
  it('should parse a minimal GEDCOM file', () => {
    const gedcom = `
0 HEAD
1 GEDC
2 VERS 5.5.1
1 CHAR UTF-8
0 @I1@ INDI
1 NAME John /Smith/
1 SEX M
1 BIRT
2 DATE 15 JAN 1950
2 PLAC Boston, Massachusetts
0 @F1@ FAM
1 HUSB @I1@
0 TRLR
    `.trim()

    const result = parseGedcomFile(gedcom)

    expect(result.individuals.size).toBe(1)
    expect(result.families.size).toBe(1)

    const individual = result.individuals.get('I1')
    expect(individual).toBeDefined()
    expect(individual?.name.full).toBe('John Smith')
    expect(individual?.name.given).toBe('John')
    expect(individual?.name.surname).toBe('Smith')
    expect(individual?.gender).toBe('M')
    expect(individual?.birth?.date).toBe('15 JAN 1950')
    expect(individual?.birth?.place).toBe('Boston, Massachusetts')
  })

  it('should parse multiple individuals', () => {
    const gedcom = `
0 HEAD
1 GEDC
2 VERS 5.5.1
0 @I1@ INDI
1 NAME John /Smith/
1 SEX M
0 @I2@ INDI
1 NAME Jane /Doe/
1 SEX F
0 TRLR
    `.trim()

    const result = parseGedcomFile(gedcom)

    expect(result.individuals.size).toBe(2)
    expect(result.individuals.get('I1')?.name.given).toBe('John')
    expect(result.individuals.get('I2')?.name.given).toBe('Jane')
  })

  it('should parse family relationships', () => {
    const gedcom = `
0 HEAD
1 GEDC
2 VERS 5.5.1
0 @I1@ INDI
1 NAME John /Smith/
1 SEX M
1 FAMS @F1@
0 @I2@ INDI
1 NAME Jane /Doe/
1 SEX F
1 FAMS @F1@
0 @I3@ INDI
1 NAME Baby /Smith/
1 SEX M
1 FAMC @F1@
0 @F1@ FAM
1 HUSB @I1@
1 WIFE @I2@
1 CHIL @I3@
1 MARR
2 DATE 1 JUN 1975
0 TRLR
    `.trim()

    const result = parseGedcomFile(gedcom)

    const family = result.families.get('F1')
    expect(family).toBeDefined()
    expect(family?.husband).toBe('I1')
    expect(family?.wife).toBe('I2')
    expect(family?.children).toContain('I3')
    expect(family?.marriage?.date).toBe('1 JUN 1975')

    const child = result.individuals.get('I3')
    expect(child?.familyAsChild).toBe('F1')
  })

  it('should mark deceased individuals', () => {
    const gedcom = `
0 HEAD
0 @I1@ INDI
1 NAME John /Smith/
1 SEX M
1 DEAT
2 DATE 20 DEC 2020
0 TRLR
    `.trim()

    const result = parseGedcomFile(gedcom)

    const individual = result.individuals.get('I1')
    expect(individual?.isDeceased).toBe(true)
    expect(individual?.death?.date).toBe('20 DEC 2020')
  })

  it('should parse occupation and education', () => {
    const gedcom = `
0 HEAD
0 @I1@ INDI
1 NAME John /Smith/
1 SEX M
1 OCCU Software Engineer
2 DATE 2010-2020
1 EDUC MIT
2 DATE 2005
0 TRLR
    `.trim()

    const result = parseGedcomFile(gedcom)

    const individual = result.individuals.get('I1')
    expect(individual?.occupation).toHaveLength(1)
    expect(individual?.occupation?.[0].value).toBe('Software Engineer')
    expect(individual?.education).toHaveLength(1)
    expect(individual?.education?.[0].value).toBe('MIT')
  })

  it('should handle empty GEDCOM', () => {
    const gedcom = `
0 HEAD
0 TRLR
    `.trim()

    const result = parseGedcomFile(gedcom)

    expect(result.individuals.size).toBe(0)
    expect(result.families.size).toBe(0)
  })
})
