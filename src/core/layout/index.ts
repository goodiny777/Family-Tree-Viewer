import type { GedcomData, TreeNode, Connection, NodeSize, LayoutResult, ViewMode, LevelBand, TreeBounds } from '../../types'
import { NODE_DIMENSIONS, calculateBounds } from '../../types/tree'
import { getBirthYear } from '../../types/individual'

/**
 * Layout configuration
 */
interface LayoutConfig {
  nodeSize: NodeSize
  horizontalSpacing: number
  verticalSpacing: number
  siblingSpacing: number  // Spacing between siblings from same parents
  coupleSpacing: number
  maxGenerations?: number
  viewMode?: ViewMode
  maxPeoplePerRow: number  // Maximum people per row before wrapping
  rowSpacing: number       // Vertical spacing between rows within same level
}

const DEFAULT_CONFIG: LayoutConfig = {
  nodeSize: 'standard',
  horizontalSpacing: 150,  // Spacing between generations/levels (horizontal)
  verticalSpacing: 150,    // Spacing between different family groups (vertical)
  siblingSpacing: 90,     // Spacing between siblings from same parents
  coupleSpacing: 5,      // Gap between spouses
  maxGenerations: undefined,
  viewMode: 'all',
  maxPeoplePerRow: 5,     // Wrap to new row after this many people
  rowSpacing: 80,          // Space between rows within same level
}

/**
 * Position data for a person
 */
interface PersonPosition {
  id: string
  x: number
  y: number
  generation: number
}

/**
 * Generate tree layout from GEDCOM data
 * Layout is horizontal: ancestors on LEFT, descendants on RIGHT
 */
export function generateLayout(
  data: GedcomData,
  focusedPersonId: string | null = null,
  config: Partial<LayoutConfig> = {}
): LayoutResult {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  const { width: nodeWidth, height: nodeHeight, radius: nodeRadius } = NODE_DIMENSIONS[cfg.nodeSize]

  if (data.individuals.size === 0) {
    return { nodes: [], connections: [], bounds: calculateBounds([]), generationCount: 0, levelBands: [] }
  }

  // Build relationships
  const { childToParents, personToFamilyAsSpouse, parentToChildren } = buildRelationships(data)

  // Filter individuals based on view mode
  const visibleIds = getVisibleIndividuals(
    data,
    focusedPersonId,
    cfg.viewMode || 'all',
    childToParents,
    parentToChildren,
    personToFamilyAsSpouse
  )

  // Create filtered data
  const filteredData = filterGedcomData(data, visibleIds)

  // Calculate generations relative to focused person (0 = focused, negative = ancestors, positive = descendants)
  const generations = calculateGenerationsFromFocus(filteredData, focusedPersonId, childToParents, parentToChildren)

  // Position all individuals vertically (ancestors above, descendants below)
  const positions = calculateVerticalPositions(
    filteredData,
    generations,
    personToFamilyAsSpouse,
    cfg,
    nodeWidth,
    nodeHeight,
    cfg.viewMode || 'all'
  )

  // Create tree nodes
  const nodes = createTreeNodes(filteredData, positions, nodeWidth, nodeHeight, nodeRadius, focusedPersonId)

  // Generate connections for vertical layout
  const connections = generateVerticalConnections(filteredData, nodes)

  // Calculate bounds
  const bounds = calculateBounds(nodes)

  // Count generations
  if (nodes.length === 0) {
    return { nodes: [], connections: [], bounds, generationCount: 0, levelBands: [] }
  }
  const minGen = Math.min(...nodes.map(n => n.generation))
  const maxGen = Math.max(...nodes.map(n => n.generation))
  const generationCount = maxGen - minGen + 1

  // Calculate level bands for background rendering
  const levelBands = calculateLevelBands(nodes, bounds)

  return { nodes, connections, bounds, generationCount, levelBands }
}

/**
 * Calculate level bands for background rendering
 * Each band covers the Y range of all nodes at that level
 */
function calculateLevelBands(nodes: TreeNode[], bounds: TreeBounds): LevelBand[] {
  const levelMap = new Map<number, { minY: number; maxY: number }>()

  // Find min/max Y for each level
  for (const node of nodes) {
    const level = node.generation
    const nodeTop = node.y - node.radius - 20  // Add some padding
    const nodeBottom = node.y + node.radius + 30  // Extra for label

    const existing = levelMap.get(level)
    if (existing) {
      existing.minY = Math.min(existing.minY, nodeTop)
      existing.maxY = Math.max(existing.maxY, nodeBottom)
    } else {
      levelMap.set(level, { minY: nodeTop, maxY: nodeBottom })
    }
  }

  // Convert to sorted array and extend bands to fill gaps
  const levels = [...levelMap.keys()].sort((a, b) => a - b)
  const bands: LevelBand[] = []

  for (let i = 0; i < levels.length; i++) {
    const level = levels[i]
    const { minY, maxY } = levelMap.get(level)!

    // Extend to meet adjacent bands (fill gaps)
    let bandMinY = minY
    let bandMaxY = maxY

    if (i > 0) {
      const prevLevel = levels[i - 1]
      const prevBand = levelMap.get(prevLevel)!
      // Meet at midpoint between bands
      bandMinY = (prevBand.maxY + minY) / 2
    } else {
      // Extend to bounds for first band
      bandMinY = bounds.minY - 50
    }

    if (i < levels.length - 1) {
      const nextLevel = levels[i + 1]
      const nextBand = levelMap.get(nextLevel)!
      // Meet at midpoint between bands
      bandMaxY = (maxY + nextBand.minY) / 2
    } else {
      // Extend to bounds for last band
      bandMaxY = bounds.maxY + 50
    }

    bands.push({
      level,
      minY: bandMinY,
      maxY: bandMaxY,
      centerY: (minY + maxY) / 2,
    })
  }

  return bands
}

/**
 * Get visible individuals based on view mode
 */
function getVisibleIndividuals(
  data: GedcomData,
  focusedPersonId: string | null,
  viewMode: ViewMode,
  childToParents: Map<string, string[]>,
  parentToChildren: Map<string, string[]>,
  personToFamilyAsSpouse: Map<string, string[]>
): Set<string> {
  // 'all' mode or no focused person - show everyone
  if (viewMode === 'all' || !focusedPersonId || !data.individuals.has(focusedPersonId)) {
    return new Set(data.individuals.keys())
  }

  const visible = new Set<string>()

  switch (viewMode) {
    case 'pedigree':
      visible.add(focusedPersonId)
      collectAncestors(focusedPersonId, childToParents, visible)
      // Only add spouses who have visible children (direct ancestors in the pedigree)
      addSpousesWithConnections(visible, data, personToFamilyAsSpouse)
      break

    case 'hourglass':
      visible.add(focusedPersonId)
      collectAncestors(focusedPersonId, childToParents, visible)
      collectDescendants(focusedPersonId, parentToChildren, visible)
      // Only add spouses who have visible children (in the hourglass lineage)
      addSpousesWithConnections(visible, data, personToFamilyAsSpouse)
      break

    case 'family':
      visible.add(focusedPersonId)
      const parents = childToParents.get(focusedPersonId) || []
      for (const parentId of parents) {
        visible.add(parentId)
      }
      for (const parentId of parents) {
        const siblings = parentToChildren.get(parentId) || []
        for (const siblingId of siblings) {
          visible.add(siblingId)
        }
      }
      const families = personToFamilyAsSpouse.get(focusedPersonId) || []
      for (const familyId of families) {
        const family = data.families.get(familyId)
        if (family) {
          if (family.husband) visible.add(family.husband)
          if (family.wife) visible.add(family.wife)
          for (const childId of family.children) {
            visible.add(childId)
          }
        }
      }
      break

    default:
      return new Set(data.individuals.keys())
  }

  return visible
}

function collectAncestors(personId: string, childToParents: Map<string, string[]>, result: Set<string>): void {
  const parents = childToParents.get(personId) || []
  for (const parentId of parents) {
    if (!result.has(parentId)) {
      result.add(parentId)
      collectAncestors(parentId, childToParents, result)
    }
  }
}

function collectDescendants(personId: string, parentToChildren: Map<string, string[]>, result: Set<string>): void {
  const children = parentToChildren.get(personId) || []
  for (const childId of children) {
    if (!result.has(childId)) {
      result.add(childId)
      collectDescendants(childId, parentToChildren, result)
    }
  }
}

/**
 * Add spouses to visible set, but ONLY if they have at least one visible child.
 * This ensures spouses don't appear as disconnected nodes in pedigree/hourglass views.
 */
function addSpousesWithConnections(visible: Set<string>, data: GedcomData, personToFamilyAsSpouse: Map<string, string[]>): void {
  const toAdd: string[] = []
  for (const personId of visible) {
    const families = personToFamilyAsSpouse.get(personId) || []
    for (const familyId of families) {
      const family = data.families.get(familyId)
      if (family) {
        // Check if this family has at least one visible child
        const hasVisibleChild = family.children.some(childId => visible.has(childId))

        if (hasVisibleChild) {
          // Only add the spouse if the family has visible children (connection lines)
          if (family.husband && !visible.has(family.husband)) toAdd.push(family.husband)
          if (family.wife && !visible.has(family.wife)) toAdd.push(family.wife)
        }
      }
    }
  }
  for (const id of toAdd) {
    visible.add(id)
  }
}

function filterGedcomData(data: GedcomData, visibleIds: Set<string>): GedcomData {
  const individuals = new Map<string, typeof data.individuals extends Map<string, infer T> ? T : never>()
  const families = new Map<string, typeof data.families extends Map<string, infer T> ? T : never>()

  for (const [id, person] of data.individuals) {
    if (visibleIds.has(id)) {
      individuals.set(id, person)
    }
  }

  for (const [id, family] of data.families) {
    const husbandVisible = family.husband && visibleIds.has(family.husband)
    const wifeVisible = family.wife && visibleIds.has(family.wife)

    if (husbandVisible || wifeVisible) {
      const visibleChildren = family.children.filter(childId => visibleIds.has(childId))
      families.set(id, { ...family, children: visibleChildren })
    }
  }

  return { individuals, families, header: data.header }
}

/**
 * Build relationship maps
 */
function buildRelationships(data: GedcomData) {
  const childToParents = new Map<string, string[]>()
  const parentToChildren = new Map<string, string[]>()
  const personToFamilyAsSpouse = new Map<string, string[]>()

  for (const [familyId, family] of data.families) {
    if (family.husband) {
      const families = personToFamilyAsSpouse.get(family.husband) || []
      families.push(familyId)
      personToFamilyAsSpouse.set(family.husband, families)
    }
    if (family.wife) {
      const families = personToFamilyAsSpouse.get(family.wife) || []
      families.push(familyId)
      personToFamilyAsSpouse.set(family.wife, families)
    }

    for (const childId of family.children) {
      const parents: string[] = []
      if (family.husband) {
        parents.push(family.husband)
        const husbandChildren = parentToChildren.get(family.husband) || []
        if (!husbandChildren.includes(childId)) {
          husbandChildren.push(childId)
          parentToChildren.set(family.husband, husbandChildren)
        }
      }
      if (family.wife) {
        parents.push(family.wife)
        const wifeChildren = parentToChildren.get(family.wife) || []
        if (!wifeChildren.includes(childId)) {
          wifeChildren.push(childId)
          parentToChildren.set(family.wife, wifeChildren)
        }
      }
      childToParents.set(childId, parents)
    }
  }

  return { childToParents, personToFamilyAsSpouse, parentToChildren }
}

/**
 * Calculate generations relative to focused person
 * 0 = focused person, negative = ancestors, positive = descendants
 */
function calculateGenerationsFromFocus(
  data: GedcomData,
  focusedPersonId: string | null,
  childToParents: Map<string, string[]>,
  parentToChildren: Map<string, string[]>
): Map<string, number> {
  const generations = new Map<string, number>()

  // If no focused person, use traditional root-based generation calculation
  if (!focusedPersonId || !data.individuals.has(focusedPersonId)) {
    return calculateGenerationsFromRoots(data, childToParents, parentToChildren)
  }

  // Start from focused person at generation 0
  generations.set(focusedPersonId, 0)
  const visited = new Set<string>()

  // BFS to assign generations
  const queue: Array<{ id: string; gen: number }> = [{ id: focusedPersonId, gen: 0 }]

  while (queue.length > 0) {
    const { id, gen } = queue.shift()!
    if (visited.has(id)) continue
    visited.add(id)

    generations.set(id, gen)

    // Assign spouses to same generation
    for (const [, family] of data.families) {
      if (family.husband === id && family.wife && !generations.has(family.wife)) {
        generations.set(family.wife, gen)
        queue.push({ id: family.wife, gen })
      }
      if (family.wife === id && family.husband && !generations.has(family.husband)) {
        generations.set(family.husband, gen)
        queue.push({ id: family.husband, gen })
      }
    }

    // Parents are one generation back (negative = LEFT = ancestors)
    const parents = childToParents.get(id) || []
    for (const parentId of parents) {
      if (!generations.has(parentId)) {
        generations.set(parentId, gen - 1)
        queue.push({ id: parentId, gen: gen - 1 })
      }
    }

    // Children are one generation forward (positive = RIGHT = descendants)
    const children = parentToChildren.get(id) || []
    for (const childId of children) {
      if (!generations.has(childId)) {
        generations.set(childId, gen + 1)
        queue.push({ id: childId, gen: gen + 1 })
      }
    }
  }

  // Handle any disconnected individuals
  for (const id of data.individuals.keys()) {
    if (!generations.has(id)) {
      generations.set(id, 0)
    }
  }

  return generations
}

/**
 * Fallback: Calculate generations when no focused person
 * Picks a person in the middle generation as virtual focus to maintain consistent layout
 */
function calculateGenerationsFromRoots(
  data: GedcomData,
  childToParents: Map<string, string[]>,
  parentToChildren: Map<string, string[]>
): Map<string, number> {
  // First, do a quick pass to find generation depths from roots
  const tempGenerations = new Map<string, number>()
  const visited = new Set<string>()

  // Find roots (no parents)
  const roots: string[] = []
  for (const id of data.individuals.keys()) {
    if (!childToParents.has(id)) {
      roots.push(id)
      tempGenerations.set(id, 0)
    }
  }

  // BFS to assign temporary generations
  const queue = [...roots]
  while (queue.length > 0) {
    const personId = queue.shift()!
    if (visited.has(personId)) continue
    visited.add(personId)

    const currentGen = tempGenerations.get(personId) ?? 0

    // Ensure spouses are on same generation
    for (const [, family] of data.families) {
      if (family.husband === personId && family.wife && !tempGenerations.has(family.wife)) {
        tempGenerations.set(family.wife, currentGen)
        queue.push(family.wife)
      }
      if (family.wife === personId && family.husband && !tempGenerations.has(family.husband)) {
        tempGenerations.set(family.husband, currentGen)
        queue.push(family.husband)
      }
    }

    // Assign children to next generation
    for (const [, family] of data.families) {
      const isParent = family.husband === personId || family.wife === personId
      if (isParent) {
        for (const childId of family.children) {
          if (!tempGenerations.has(childId)) {
            tempGenerations.set(childId, currentGen + 1)
            queue.push(childId)
          }
        }
      }
    }
  }

  // Handle disconnected individuals
  for (const id of data.individuals.keys()) {
    if (!tempGenerations.has(id)) {
      const person = data.individuals.get(id)
      const birthYear = person ? getBirthYear(person) : null
      if (birthYear) {
        const estimatedGen = Math.floor((birthYear - 1900) / 30)
        tempGenerations.set(id, Math.max(0, estimatedGen))
      } else {
        tempGenerations.set(id, 0)
      }
    }
  }

  // Find the middle generation and pick a person from it as virtual focus
  const genValues = [...tempGenerations.values()]
  const minGen = Math.min(...genValues)
  const maxGen = Math.max(...genValues)
  const midGen = Math.floor((minGen + maxGen) / 2)

  // Find a person in the middle generation to use as virtual focus
  let virtualFocusId: string | null = null
  for (const [id, gen] of tempGenerations) {
    if (gen === midGen) {
      virtualFocusId = id
      break
    }
  }

  // If no person in middle gen, just use first person
  if (!virtualFocusId) {
    virtualFocusId = data.individuals.keys().next().value || null
  }

  // Now use the same algorithm as calculateGenerationsFromFocus with virtual focus
  if (!virtualFocusId) {
    return tempGenerations
  }

  const generations = new Map<string, number>()
  generations.set(virtualFocusId, 0)
  const visited2 = new Set<string>()
  const queue2: Array<{ id: string; gen: number }> = [{ id: virtualFocusId, gen: 0 }]

  while (queue2.length > 0) {
    const { id, gen } = queue2.shift()!
    if (visited2.has(id)) continue
    visited2.add(id)

    generations.set(id, gen)

    // Assign spouses to same generation
    for (const [, family] of data.families) {
      if (family.husband === id && family.wife && !generations.has(family.wife)) {
        generations.set(family.wife, gen)
        queue2.push({ id: family.wife, gen })
      }
      if (family.wife === id && family.husband && !generations.has(family.husband)) {
        generations.set(family.husband, gen)
        queue2.push({ id: family.husband, gen })
      }
    }

    // Parents are one generation back (negative = above)
    const parents = childToParents.get(id) || []
    for (const parentId of parents) {
      if (!generations.has(parentId)) {
        generations.set(parentId, gen - 1)
        queue2.push({ id: parentId, gen: gen - 1 })
      }
    }

    // Children are one generation forward (positive = below)
    const children = parentToChildren.get(id) || []
    for (const childId of children) {
      if (!generations.has(childId)) {
        generations.set(childId, gen + 1)
        queue2.push({ id: childId, gen: gen + 1 })
      }
    }
  }

  // Handle any disconnected individuals
  for (const id of data.individuals.keys()) {
    if (!generations.has(id)) {
      generations.set(id, 0)
    }
  }

  return generations
}

/**
 * Calculate vertical positions for all individuals
 * Y = generation/level (vertical): Level 0 = focused person, negative = ancestors (above), positive = descendants (below)
 * X = horizontal position within the same level
 *
 * Siblings from the same parents are grouped closer together than unrelated people.
 * Couples are placed side by side horizontally.
 */
function calculateVerticalPositions(
  data: GedcomData,
  generations: Map<string, number>,
  personToFamilyAsSpouse: Map<string, string[]>,
  config: LayoutConfig,
  nodeWidth: number,
  _nodeHeight: number,
  viewMode: ViewMode
): Map<string, PersonPosition> {
  const positions = new Map<string, PersonPosition>()
  const { horizontalSpacing, verticalSpacing, siblingSpacing, coupleSpacing, maxGenerations } = config

  // Use circle diameter for positioning
  const circleDiameter = nodeWidth

  // Base spacing calculations
  const baseLevelSpacing = circleDiameter + verticalSpacing   // Distance between levels (Y axis)
  const baseFamilyGroupSpacing = circleDiameter + horizontalSpacing // Distance between different family groups (X axis)
  const baseSiblingGap = siblingSpacing                        // Distance between siblings from same parents
  const baseSpouseGap = coupleSpacing                          // Gap between spouses (horizontal)

  // Build child-to-parents mapping for sibling grouping
  const childToParentFamily = new Map<string, string>()
  for (const [familyId, family] of data.families) {
    for (const childId of family.children) {
      childToParentFamily.set(childId, familyId)
    }
  }

  // Group people by generation/level
  const byLevel = new Map<number, string[]>()
  for (const [id, level] of generations) {
    const list = byLevel.get(level) || []
    list.push(id)
    byLevel.set(level, list)
  }

  // Get sorted level keys
  let sortedLevels = [...byLevel.keys()].sort((a, b) => a - b)

  // Apply maxGenerations filter if set
  // For pedigree view: show ALL ancestors (no upper limit), don't apply maxGenerations
  // For hourglass view: apply symmetric filtering (both ancestors and descendants limited)
  if (maxGenerations !== undefined && maxGenerations > 0 && viewMode !== 'pedigree') {
    const halfMax = Math.floor(maxGenerations / 2)
    sortedLevels = sortedLevels.filter(level => level >= -halfMax && level <= halfMax)
  }

  // Calculate people count per level for density-based spacing
  const levelCounts = new Map<number, number>()
  for (const level of sortedLevels) {
    levelCounts.set(level, (byLevel.get(level) || []).length)
  }

  // Find min and max counts to normalize multipliers
  const counts = [...levelCounts.values()]
  const minCount = Math.min(...counts)
  const maxCount = Math.max(...counts)
  const countRange = maxCount - minCount || 1

  // Helper to get spacing multiplier based on people count at a level
  // More people = more spacing (up to 2x), fewer people = less spacing (down to 0.5x)
  const getCountMultiplier = (level: number): number => {
    const count = levelCounts.get(level) || 1
    // Normalize to 0-1 range, then scale to 0.5-2.0 range
    const normalized = (count - minCount) / countRange
    return 0.5 + normalized * 1.5
  }

  // Helper to calculate Y position with density-based spacing
  const getLevelY = (level: number): number => {
    if (level === 0) return 0

    let y = 0
    const direction = level > 0 ? 1 : -1
    const absLevel = Math.abs(level)

    for (let i = 0; i < absLevel; i++) {
      // Get the level we're spacing FROM
      const fromLevel = direction > 0 ? i : -i
      const toLevel = direction > 0 ? i + 1 : -(i + 1)

      // Use the larger of the two adjacent level multipliers for the gap
      const fromMultiplier = getCountMultiplier(fromLevel)
      const toMultiplier = getCountMultiplier(toLevel)
      const gapMultiplier = Math.max(fromMultiplier, toMultiplier)

      y += baseLevelSpacing * gapMultiplier
    }

    return y * direction
  }

  // Track positioned people
  const positioned = new Set<string>()

  // Process each level
  for (const level of sortedLevels) {
    const peopleInLevel = byLevel.get(level) || []

    // Y position based on density (more people at adjacent levels = more vertical spacing)
    const y = getLevelY(level)

    // Get spacing for this level based on people count (more people = more spacing)
    const multiplier = getCountMultiplier(level)
    const familyGroupSpacing = baseFamilyGroupSpacing * multiplier
    const siblingGap = baseSiblingGap * multiplier
    const spouseGap = baseSpouseGap  // Couples stay at base spacing

    // Separate people into "children" (have parent family) and "spouses only" (no parent family)
    const childrenIds: string[] = []
    const spouseOnlyIds: string[] = []

    for (const personId of peopleInLevel) {
      if (childToParentFamily.has(personId)) {
        childrenIds.push(personId)
      } else {
        spouseOnlyIds.push(personId)
      }
    }

    // Group children by their parent family (siblings)
    const siblingGroups = new Map<string, string[]>()
    for (const childId of childrenIds) {
      const parentFamily = childToParentFamily.get(childId)!
      const group = siblingGroups.get(parentFamily) || []
      group.push(childId)
      siblingGroups.set(parentFamily, group)
    }

    // Sort siblings within each group by birth year
    for (const [, siblings] of siblingGroups) {
      siblings.sort((a, b) => {
        const aPerson = data.individuals.get(a)
        const bPerson = data.individuals.get(b)
        const aYear = aPerson ? (getBirthYear(aPerson) ?? 0) : 0
        const bYear = bPerson ? (getBirthYear(bPerson) ?? 0) : 0
        return aYear - bYear
      })
    }

    // Sort sibling groups by birth year of first sibling
    const sortedSiblingGroups = [...siblingGroups.entries()].sort((a, b) => {
      const aFirst = a[1][0]
      const bFirst = b[1][0]
      const aFirstPerson = aFirst ? data.individuals.get(aFirst) : undefined
      const bFirstPerson = bFirst ? data.individuals.get(bFirst) : undefined
      const aYear = aFirstPerson ? (getBirthYear(aFirstPerson) ?? 0) : 0
      const bYear = bFirstPerson ? (getBirthYear(bFirstPerson) ?? 0) : 0
      return aYear - bYear
    })

    // Build layout units: each sibling with their spouses to the right
    // Layout: [sibling1] [spouse1a] [spouse1b] [sibling2] [spouse2] ...
    interface LayoutUnit {
      person: string
      spouses: string[]
      parentFamily: string | null
    }

    const layoutUnits: LayoutUnit[] = []

    // Process each sibling group
    for (const [parentFamilyId, siblings] of sortedSiblingGroups) {
      for (const siblingId of siblings) {
        // Find all spouses for this sibling
        const spouseFamilies = personToFamilyAsSpouse.get(siblingId) || []
        const spouses: string[] = []

        for (const familyId of spouseFamilies) {
          const family = data.families.get(familyId)
          if (!family) continue

          const spouseId = family.husband === siblingId ? family.wife : family.husband
          // Only add spouse if they exist in filtered data and are at this level
          if (spouseId && data.individuals.has(spouseId) && generations.get(spouseId) === level) {
            spouses.push(spouseId)
          }
        }

        // Sort spouses by birth year
        spouses.sort((a, b) => {
          const aPerson = data.individuals.get(a)
          const bPerson = data.individuals.get(b)
          const aYear = aPerson ? (getBirthYear(aPerson) ?? 0) : 0
          const bYear = bPerson ? (getBirthYear(bPerson) ?? 0) : 0
          return aYear - bYear
        })

        layoutUnits.push({ person: siblingId, spouses, parentFamily: parentFamilyId })
      }
    }

    // Handle spouse-only people (those who married into the family with no parents in tree)
    for (const spouseOnlyId of spouseOnlyIds) {
      // Check if already included as a spouse
      const alreadyIncluded = layoutUnits.some(unit =>
        unit.person === spouseOnlyId || unit.spouses.includes(spouseOnlyId)
      )

      if (!alreadyIncluded) {
        // Find their spouse who might be a sibling
        const spouseFamilies = personToFamilyAsSpouse.get(spouseOnlyId) || []
        let foundSpouse = false

        for (const familyId of spouseFamilies) {
          const family = data.families.get(familyId)
          if (!family) continue

          const partnerId = family.husband === spouseOnlyId ? family.wife : family.husband
          if (partnerId && generations.get(partnerId) === level) {
            // Add this person as spouse to their partner's unit
            const partnerUnit = layoutUnits.find(unit => unit.person === partnerId)
            if (partnerUnit && !partnerUnit.spouses.includes(spouseOnlyId)) {
              partnerUnit.spouses.push(spouseOnlyId)
              foundSpouse = true
              break
            }
          }
        }

        // If still not included, create a standalone unit
        if (!foundSpouse) {
          layoutUnits.push({ person: spouseOnlyId, spouses: [], parentFamily: null })
        }
      }
    }

    // Split layout units into rows if exceeding maxPeoplePerRow
    const { maxPeoplePerRow, rowSpacing } = config
    const rows: Array<typeof layoutUnits> = []
    let currentRow: typeof layoutUnits = []
    let currentRowPeopleCount = 0

    for (const unit of layoutUnits) {
      const unitPeopleCount = 1 + unit.spouses.length

      // Check if adding this unit would exceed the row limit
      // Try to keep sibling groups together
      if (currentRowPeopleCount > 0 && currentRowPeopleCount + unitPeopleCount > maxPeoplePerRow) {
        // Start a new row
        rows.push(currentRow)
        currentRow = []
        currentRowPeopleCount = 0
      }

      currentRow.push(unit)
      currentRowPeopleCount += unitPeopleCount
    }

    // Don't forget the last row
    if (currentRow.length > 0) {
      rows.push(currentRow)
    }

    // Calculate total height for all rows in this level
    const totalRowsHeight = rows.length > 1 ? (rows.length - 1) * rowSpacing : 0

    // Position each row
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex]

      // Calculate row Y offset (center rows around the level Y)
      const rowYOffset = rowIndex * rowSpacing - totalRowsHeight / 2
      const rowY = y + rowYOffset

      // Calculate total width for this row
      let rowWidth = 0
      for (let ui = 0; ui < row.length; ui++) {
        const unit = row[ui]
        const unitWidth = circleDiameter + unit.spouses.length * (spouseGap + circleDiameter)
        rowWidth += unitWidth

        // Add spacing based on relationship
        if (ui < row.length - 1) {
          const nextUnit = row[ui + 1]
          if (unit.parentFamily === nextUnit.parentFamily && unit.parentFamily !== null) {
            rowWidth += siblingGap
          } else {
            rowWidth += familyGroupSpacing
          }
        }
      }

      // Position all units in this row, centered on X=0
      let currentX = -rowWidth / 2

      for (let ui = 0; ui < row.length; ui++) {
        const unit = row[ui]

        // Position the main person (sibling)
        const personX = currentX + circleDiameter / 2
        positions.set(unit.person, { id: unit.person, x: personX, y: rowY, generation: level })
        positioned.add(unit.person)
        currentX += circleDiameter

        // Position spouses to the right
        for (const spouseId of unit.spouses) {
          currentX += spouseGap
          const spouseX = currentX + circleDiameter / 2
          positions.set(spouseId, { id: spouseId, x: spouseX, y: rowY, generation: level })
          positioned.add(spouseId)
          currentX += circleDiameter
        }

        // Add spacing to next unit
        if (ui < row.length - 1) {
          const nextUnit = row[ui + 1]
          if (unit.parentFamily === nextUnit.parentFamily && unit.parentFamily !== null) {
            currentX += siblingGap
          } else {
            currentX += familyGroupSpacing
          }
        }
      }
    }
  }

  // Second pass: adjust positions to center parents above their children
  for (const level of [...sortedLevels].reverse()) {
    const people = byLevel.get(level) || []

    for (const personId of people) {
      const pos = positions.get(personId)
      if (!pos) continue

      // Find children (which are in gen + 1, i.e., below this level)
      const childPositions: number[] = []
      for (const [, family] of data.families) {
        if (family.husband === personId || family.wife === personId) {
          for (const childId of family.children) {
            const childPos = positions.get(childId)
            if (childPos) {
              childPositions.push(childPos.x)
            }
          }
        }
      }

      if (childPositions.length > 0) {
        const childCenterX = (Math.min(...childPositions) + Math.max(...childPositions)) / 2

        // Check if this person has a spouse in the same generation
        const families = personToFamilyAsSpouse.get(personId) || []
        let spouseId: string | undefined

        for (const familyId of families) {
          const family = data.families.get(familyId)
          if (family) {
            const sid = family.husband === personId ? family.wife : family.husband
            if (sid && positions.has(sid) && positions.get(sid)!.generation === level) {
              spouseId = sid
              break
            }
          }
        }

        if (spouseId) {
          // Move both spouses to center above children
          const spousePos = positions.get(spouseId)!
          const coupleCenter = (pos.x + spousePos.x) / 2
          const offset = childCenterX - coupleCenter

          pos.x += offset
          spousePos.x += offset
        } else {
          // Move single person to center above children
          pos.x = childCenterX
        }
      }
    }
  }

  // Third pass: resolve collisions by pushing overlapping nodes apart
  const minNodeSpacing = circleDiameter + baseSiblingGap // Minimum distance between node centers

  for (const level of sortedLevels) {
    const peopleAtLevel = byLevel.get(level) || []
    if (peopleAtLevel.length < 2) continue

    // Get positions for this level and sort by X
    const levelPositions = peopleAtLevel
      .map(id => positions.get(id))
      .filter((pos): pos is PersonPosition => pos !== undefined)
      .sort((a, b) => a.x - b.x)

    if (levelPositions.length < 2) continue

    // Calculate original center for re-centering after adjustment
    const originalCenter = (levelPositions[0].x + levelPositions[levelPositions.length - 1].x) / 2

    // Push apart overlapping nodes (left to right)
    for (let i = 1; i < levelPositions.length; i++) {
      const prev = levelPositions[i - 1]
      const curr = levelPositions[i]
      const gap = curr.x - prev.x

      if (gap < minNodeSpacing) {
        // Push current node (and all nodes to its right) to the right
        const shift = minNodeSpacing - gap
        for (let j = i; j < levelPositions.length; j++) {
          levelPositions[j].x += shift
        }
      }
    }

    // Re-center the level around the original center to minimize overall drift
    const newCenter = (levelPositions[0].x + levelPositions[levelPositions.length - 1].x) / 2
    const centerOffset = originalCenter - newCenter
    for (const pos of levelPositions) {
      pos.x += centerOffset
    }
  }

  return positions
}

/**
 * Create TreeNode array from positions
 */
function createTreeNodes(
  data: GedcomData,
  positions: Map<string, PersonPosition>,
  nodeWidth: number,
  nodeHeight: number,
  nodeRadius: number,
  focusedPersonId: string | null
): TreeNode[] {
  const nodes: TreeNode[] = []

  for (const [id, pos] of positions) {
    const person = data.individuals.get(id)
    if (!person) continue

    nodes.push({
      id,
      person,
      x: pos.x,
      y: pos.y,
      generation: pos.generation,
      depth: pos.generation,
      isFocused: id === focusedPersonId,
      isHighlighted: false,
      isVisible: true,
      width: nodeWidth,
      height: nodeHeight,
      radius: nodeRadius,
    })
  }

  return nodes
}

/**
 * Generate connections for vertical layout
 * Each parent (father/mother) has a direct connection to each child
 * No spouse-to-spouse connections
 */
function generateVerticalConnections(data: GedcomData, nodes: TreeNode[]): Connection[] {
  const connections: Connection[] = []
  const nodeMap = new Map(nodes.map(n => [n.id, n]))
  const connectionSet = new Set<string>()

  for (const [, family] of data.families) {
    const husbandNode = family.husband ? nodeMap.get(family.husband) : undefined
    const wifeNode = family.wife ? nodeMap.get(family.wife) : undefined

    // Parent-child connections: each parent connects directly to each child
    for (const childId of family.children) {
      const childNode = nodeMap.get(childId)
      if (!childNode) continue

      const childX = childNode.x
      const childY = childNode.y // Connect to top of child node

      // Father to child connection
      if (husbandNode) {
        const connId = `father-${family.husband}-${childId}`
        if (!connectionSet.has(connId)) {
          connectionSet.add(connId)

          const parentX = husbandNode.x
          const parentY = husbandNode.y // Bottom of parent node
          const midY = (parentY + childY) / 2

          connections.push({
            id: connId,
            type: 'parent-child',
            sourceId: family.husband!,
            targetId: childId,
            path: {
              startX: parentX,
              startY: parentY,
              endX: childX,
              endY: childY,
              controlPoint1: { x: parentX, y: midY },
              controlPoint2: { x: childX, y: midY },
            },
          })
        }
      }

      // Mother to child connection
      if (wifeNode) {
        const connId = `mother-${family.wife}-${childId}`
        if (!connectionSet.has(connId)) {
          connectionSet.add(connId)

          const parentX = wifeNode.x
          const parentY = wifeNode.y + wifeNode.radius // Bottom of parent node
          const midY = (parentY + childY) / 2

          connections.push({
            id: connId,
            type: 'parent-child',
            sourceId: family.wife!,
            targetId: childId,
            path: {
              startX: parentX,
              startY: parentY,
              endX: childX,
              endY: childY,
              controlPoint1: { x: parentX, y: midY },
              controlPoint2: { x: childX, y: midY },
            },
          })
        }
      }
    }
  }

  return connections
}

export type { LayoutConfig }
