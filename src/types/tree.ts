import type { Individual } from './individual'

/**
 * Node size options
 */
export type NodeSize = 'compact' | 'standard' | 'detailed'

/**
 * Node dimensions by size - circular nodes with diameter
 * Width = circle diameter, Height includes name label below
 */
export const NODE_DIMENSIONS: Record<NodeSize, { width: number; height: number; radius: number }> = {
  compact: { width: 50, height: 70, radius: 25 },
  standard: { width: 60, height: 85, radius: 30 },
  detailed: { width: 80, height: 110, radius: 40 },
}

/**
 * Connection line style
 */
export type ConnectionStyle = 'curved' | 'straight' | 'orthogonal'

/**
 * View mode for tree display
 */
export type ViewMode = 'all' | 'family' | 'hourglass' | 'pedigree'

/**
 * Tree node representing a person in the layout
 */
export interface TreeNode {
  id: string
  person: Individual

  // Layout position (center of node)
  x: number
  y: number

  // Tree structure
  generation: number
  depth: number

  // Visual state
  isFocused: boolean
  isHighlighted: boolean
  isVisible: boolean

  // Dimensions (based on current node size setting)
  width: number
  height: number
  radius: number // Circle radius for the photo area
}

/**
 * Connection between nodes
 */
export interface Connection {
  id: string
  type: 'parent-child' | 'spouse'
  sourceId: string
  targetId: string

  // Path points for rendering
  path: ConnectionPath
}

/**
 * Path points for connection rendering
 */
export interface ConnectionPath {
  startX: number
  startY: number
  endX: number
  endY: number

  // Control points for Bezier curves
  controlPoint1?: { x: number; y: number }
  controlPoint2?: { x: number; y: number }
}

/**
 * Bounds of the entire tree
 */
export interface TreeBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
  width: number
  height: number
}

/**
 * Level band for background rendering
 */
export interface LevelBand {
  level: number
  minY: number
  maxY: number
  centerY: number
}

/**
 * Layout result from layout engine
 */
export interface LayoutResult {
  nodes: TreeNode[]
  connections: Connection[]
  bounds: TreeBounds
  generationCount: number
  levelBands: LevelBand[]
}

/**
 * Calculate tree bounds from nodes
 */
export function calculateBounds(nodes: TreeNode[]): TreeBounds {
  if (nodes.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 }
  }

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  for (const node of nodes) {
    minX = Math.min(minX, node.x - node.width / 2)
    maxX = Math.max(maxX, node.x + node.width / 2)
    minY = Math.min(minY, node.y - node.height / 2)
    maxY = Math.max(maxY, node.y + node.height / 2)
  }

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  }
}
