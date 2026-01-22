import type { TreeNode, Connection, ViewportState, SelectionState, AppSettings, LevelBand, TreeBounds } from '../../types'

interface RenderOptions {
  nodes: TreeNode[]
  connections: Connection[]
  viewport: ViewportState
  selection: SelectionState
  settings: AppSettings
  levelBands?: LevelBand[]
  bounds?: TreeBounds
}

/**
 * Viewport bounds in world coordinates
 */
interface ViewportBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

/**
 * High-performance canvas renderer for family tree visualization
 * Renders circular nodes with photo placeholders and organic branch connections
 */
export class CanvasRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private dpr: number

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Failed to get canvas 2D context')
    this.ctx = ctx
    this.dpr = window.devicePixelRatio || 1
  }

  /**
   * Main render method
   */
  render(options: RenderOptions) {
    const { nodes, connections, viewport, selection, settings, levelBands, bounds } = options

    // Clear canvas
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // Calculate viewport bounds for culling
    const viewBounds = this.getViewportBounds(viewport)

    // Apply DPR scaling and viewport transformation
    this.ctx.setTransform(
      this.dpr * viewport.zoom,
      0,
      0,
      this.dpr * viewport.zoom,
      this.dpr * viewport.offsetX,
      this.dpr * viewport.offsetY
    )

    // Render level bands (background)
    if (levelBands && levelBands.length > 0 && bounds) {
      this.renderLevelBands(levelBands, bounds, viewBounds, selection.focusedPersonId)
    }

    // Determine Level of Detail based on zoom
    const lod = this.getLOD(viewport.zoom)

    // Filter visible connections and render
    const visibleConnections = connections.filter(conn => this.isConnectionVisible(conn, viewBounds))
    this.renderConnections(visibleConnections, selection, settings)

    // Filter visible nodes and render
    const visibleNodes = nodes.filter(node => this.isNodeVisible(node, viewBounds))
    this.renderNodes(visibleNodes, selection, settings, lod)
  }

  /**
   * Render semi-transparent level bands as background
   * Colors change based on distance from level 0 (focused person's level)
   */
  private renderLevelBands(
    levelBands: LevelBand[],
    bounds: TreeBounds,
    viewBounds: ViewportBounds,
    _focusedPersonId: string | null
  ) {
    // Extend X bounds to cover full viewport width
    const padding = 5000  // Large padding to cover panning
    const bandMinX = bounds.minX - padding
    const bandMaxX = bounds.maxX + padding

    for (const band of levelBands) {
      // Skip bands not visible in viewport
      if (band.maxY < viewBounds.minY || band.minY > viewBounds.maxY) {
        continue
      }

      // Calculate color based on level distance from 0
      // Level 0 is the focused person's level - use warm golden tint
      // Negative levels (ancestors) get cooler blue tints
      // Positive levels (descendants) get warmer orange tints
      const absLevel = Math.abs(band.level)
      let color: string

      if (band.level === 0) {
        // Focused level - light golden/amber tint
        color = 'rgba(244, 168, 37, 0.06)'
      } else if (band.level < 0) {
        // Ancestors (above) - blue tints, getting darker further up
        const intensity = Math.min(absLevel * 0.03, 0.15)
        color = `rgba(100, 140, 180, ${intensity})`
      } else {
        // Descendants (below) - warm orange tints, getting darker further down
        const intensity = Math.min(absLevel * 0.03, 0.15)
        color = `rgba(180, 140, 100, ${intensity})`
      }

      // Draw the band
      this.ctx.fillStyle = color
      this.ctx.fillRect(bandMinX, band.minY, bandMaxX - bandMinX, band.maxY - band.minY)

      // Draw subtle separator line at bottom of band
      this.ctx.strokeStyle = 'rgba(139, 115, 85, 0.15)'
      this.ctx.lineWidth = 1
      this.ctx.beginPath()
      this.ctx.moveTo(bandMinX, band.maxY)
      this.ctx.lineTo(bandMaxX, band.maxY)
      this.ctx.stroke()
    }
  }

  /**
   * Calculate viewport bounds in world coordinates
   */
  private getViewportBounds(viewport: ViewportState): ViewportBounds {
    const padding = 150 // Extra padding to avoid popping
    return {
      minX: (-viewport.offsetX - padding) / viewport.zoom,
      maxX: (-viewport.offsetX + viewport.canvasWidth + padding) / viewport.zoom,
      minY: (-viewport.offsetY - padding) / viewport.zoom,
      maxY: (-viewport.offsetY + viewport.canvasHeight + padding) / viewport.zoom,
    }
  }

  /**
   * Check if a node is within the viewport
   */
  private isNodeVisible(node: TreeNode, bounds: ViewportBounds): boolean {
    const radius = node.radius
    return (
      node.x + radius >= bounds.minX &&
      node.x - radius <= bounds.maxX &&
      node.y + node.height / 2 >= bounds.minY &&
      node.y - node.height / 2 <= bounds.maxY
    )
  }

  /**
   * Check if a connection is within the viewport
   */
  private isConnectionVisible(conn: Connection, bounds: ViewportBounds): boolean {
    const { startX, startY, endX, endY } = conn.path
    const minX = Math.min(startX, endX)
    const maxX = Math.max(startX, endX)
    const minY = Math.min(startY, endY)
    const maxY = Math.max(startY, endY)

    return (
      maxX >= bounds.minX &&
      minX <= bounds.maxX &&
      maxY >= bounds.minY &&
      minY <= bounds.maxY
    )
  }

  /**
   * Determine Level of Detail based on zoom
   */
  private getLOD(zoom: number): 'full' | 'standard' | 'minimal' {
    if (zoom >= 0.6) return 'full'
    if (zoom >= 0.35) return 'standard'
    return 'minimal'
  }

  /**
   * Render connection lines with organic branch-like curves
   */
  private renderConnections(
    connections: Connection[],
    selection: SelectionState,
    _settings: AppSettings
  ) {
    const focusedId = selection.focusedPersonId

    for (const connection of connections) {
      // Check if this connection is connected to the focused person
      const isFocusedConnection = focusedId && (
        connection.sourceId === focusedId ||
        connection.targetId === focusedId
      )

      const isHighlighted =
        selection.focusPathIds.has(connection.sourceId) &&
        selection.focusPathIds.has(connection.targetId)

      this.ctx.beginPath()

      // Draw bezier curve for smooth organic lines
      if (connection.path.controlPoint1 && connection.path.controlPoint2) {
        this.ctx.moveTo(connection.path.startX, connection.path.startY)
        this.ctx.bezierCurveTo(
          connection.path.controlPoint1.x,
          connection.path.controlPoint1.y,
          connection.path.controlPoint2.x,
          connection.path.controlPoint2.y,
          connection.path.endX,
          connection.path.endY
        )
      } else {
        // Straight line for spouse connections
        this.ctx.moveTo(connection.path.startX, connection.path.startY)
        this.ctx.lineTo(connection.path.endX, connection.path.endY)
      }

      // Style based on connection type and highlight state
      if (isFocusedConnection) {
        // Golden/amber highlight for focused person's connections (same as node border)
        this.ctx.strokeStyle = '#F4A825'
        this.ctx.lineWidth = 3
      } else if (isHighlighted) {
        this.ctx.strokeStyle = '#5D6B4D'
        this.ctx.lineWidth = 3
      } else if (connection.type === 'spouse') {
        this.ctx.strokeStyle = '#8B7355'
        this.ctx.lineWidth = 2
      } else {
        // Parent-child - branch brown color
        this.ctx.strokeStyle = '#8B7355'
        this.ctx.lineWidth = 2
      }

      this.ctx.stroke()
    }
  }

  /**
   * Render person nodes
   */
  private renderNodes(
    nodes: TreeNode[],
    selection: SelectionState,
    settings: AppSettings,
    lod: 'full' | 'standard' | 'minimal'
  ) {
    for (const node of nodes) {
      if (!node.isVisible) continue

      const isFocused = selection.focusedPersonId === node.id
      const isHighlighted = selection.highlightedIds.has(node.id)

      this.renderCircularNode(node, isFocused, isHighlighted, settings, lod)
    }
  }

  /**
   * Render a circular node with photo placeholder and name label
   */
  private renderCircularNode(
    node: TreeNode,
    isFocused: boolean,
    isHighlighted: boolean,
    settings: AppSettings,
    lod: 'full' | 'standard' | 'minimal'
  ) {
    const { x, y, radius, person } = node

    // Get node colors
    const colors = this.getNodeColors(person.gender, person.isDeceased, isFocused)

    // Draw shadow for highlighted nodes
    if (isHighlighted || isFocused) {
      this.ctx.shadowColor = isFocused ? 'rgba(244, 168, 37, 0.4)' : 'rgba(0, 0, 0, 0.2)'
      this.ctx.shadowBlur = isFocused ? 12 : 8
      this.ctx.shadowOffsetY = 2
    }

    // Draw circle background
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, Math.PI * 2)
    this.ctx.fillStyle = colors.background
    this.ctx.fill()

    // Reset shadow
    this.ctx.shadowColor = 'transparent'
    this.ctx.shadowBlur = 0
    this.ctx.shadowOffsetY = 0

    // Draw border
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, Math.PI * 2)
    this.ctx.strokeStyle = colors.border
    this.ctx.lineWidth = isFocused ? 3 : 2
    this.ctx.stroke()

    // Draw focused glow ring
    if (isFocused) {
      this.ctx.beginPath()
      this.ctx.arc(x, y, radius + 4, 0, Math.PI * 2)
      this.ctx.strokeStyle = 'rgba(244, 168, 37, 0.5)'
      this.ctx.lineWidth = 3
      this.ctx.stroke()
    }

    // Minimal LOD: just show colored circle
    if (lod === 'minimal') {
      return
    }

    // Draw person silhouette icon inside circle
    this.drawPersonIcon(x, y, radius * 0.6, colors.border)

    // Standard and Full LOD: show name label below
    if (lod === 'standard' || lod === 'full') {
      const name = this.getDisplayName(person, settings)
      const labelY = y + radius + 12

      this.ctx.font = '500 11px "Source Sans 3", sans-serif'
      this.ctx.fillStyle = '#2D3B2A'
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'top'
      this.ctx.fillText(this.truncateText(name, radius * 3), x, labelY)

      // Full LOD: show birth year
      if (lod === 'full' && settings.showDates && person.birth?.date) {
        const year = person.birth.date.match(/\d{4}/)?.[0]
        if (year) {
          this.ctx.font = '10px "Source Sans 3", sans-serif'
          this.ctx.fillStyle = '#6B5344'
          this.ctx.fillText(year, x, labelY + 14)
        }
      }
    }
  }

  /**
   * Draw person silhouette icon (similar to the design reference)
   */
  private drawPersonIcon(x: number, y: number, size: number, color: string) {
    this.ctx.save()
    this.ctx.translate(x, y)

    // Scale to fit size
    const scale = size / 14

    this.ctx.fillStyle = color
    this.ctx.globalAlpha = 0.35

    // Head (circle) - positioned higher
    this.ctx.beginPath()
    this.ctx.arc(0, -5 * scale, 4.5 * scale, 0, Math.PI * 2)
    this.ctx.fill()

    // Body/shoulders (wider, flatter ellipse)
    this.ctx.beginPath()
    this.ctx.moveTo(-8 * scale, 8 * scale)
    this.ctx.quadraticCurveTo(-8 * scale, 2 * scale, 0, 2 * scale)
    this.ctx.quadraticCurveTo(8 * scale, 2 * scale, 8 * scale, 8 * scale)
    this.ctx.lineTo(-8 * scale, 8 * scale)
    this.ctx.fill()

    this.ctx.globalAlpha = 1
    this.ctx.restore()
  }

  /**
   * Get display name for person
   */
  private getDisplayName(person: TreeNode['person'], _settings: AppSettings): string {
    if (person.name.given && person.name.surname) {
      return `${person.name.given} ${person.name.surname}`
    }
    return person.name.full || person.name.given || person.name.surname || 'Unknown'
  }

  /**
   * Get node colors based on gender and deceased status
   * Uses muted beige/brown tones matching the design
   */
  private getNodeColors(
    gender: 'M' | 'F' | 'U',
    isDeceased: boolean,
    isFocused: boolean
  ): { background: string; border: string } {
    // Focused node always gets golden highlight
    if (isFocused) {
      return { background: '#FFF8E1', border: '#F4A825' }
    }

    // Muted colors for the parchment aesthetic
    if (gender === 'M') {
      return isDeceased
        ? { background: '#D4DBE6', border: '#6B8BB7' }
        : { background: '#E3EBF6', border: '#7A9BC7' }
    } else if (gender === 'F') {
      return isDeceased
        ? { background: '#E6D4DB', border: '#B76B8B' }
        : { background: '#F6E3EB', border: '#C77A9B' }
    } else {
      // Unknown gender - neutral beige
      return isDeceased
        ? { background: '#D4C4A8', border: '#8B7355' }
        : { background: '#E8DCC8', border: '#8B7355' }
    }
  }

  /**
   * Truncate text to fit within width
   */
  private truncateText(text: string, maxWidth: number): string {
    const metrics = this.ctx.measureText(text)
    if (metrics.width <= maxWidth) return text

    let truncated = text
    while (this.ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
      truncated = truncated.slice(0, -1)
    }
    return truncated + '...'
  }
}
