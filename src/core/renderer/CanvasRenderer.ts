import type { TreeNode, Connection, ViewportState, SelectionState, AppSettings } from '../../types'

interface RenderOptions {
  nodes: TreeNode[]
  connections: Connection[]
  viewport: ViewportState
  selection: SelectionState
  settings: AppSettings
}

/**
 * High-performance canvas renderer for family tree visualization
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
    const { nodes, connections, viewport, selection, settings } = options

    // Clear canvas
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // Apply DPR scaling and viewport transformation
    this.ctx.setTransform(
      this.dpr * viewport.zoom,
      0,
      0,
      this.dpr * viewport.zoom,
      this.dpr * viewport.offsetX,
      this.dpr * viewport.offsetY
    )

    // Render connections first (below nodes)
    this.renderConnections(connections, selection, settings)

    // Render nodes
    this.renderNodes(nodes, selection, settings)
  }

  /**
   * Render connection lines
   */
  private renderConnections(
    connections: Connection[],
    selection: SelectionState,
    settings: AppSettings
  ) {
    for (const connection of connections) {
      const isHighlighted =
        selection.focusPathIds.has(connection.sourceId) &&
        selection.focusPathIds.has(connection.targetId)

      this.ctx.beginPath()

      if (settings.connectionStyle === 'curved' && connection.path.controlPoint1) {
        // Bezier curve
        this.ctx.moveTo(connection.path.startX, connection.path.startY)
        if (connection.path.controlPoint2) {
          this.ctx.bezierCurveTo(
            connection.path.controlPoint1.x,
            connection.path.controlPoint1.y,
            connection.path.controlPoint2.x,
            connection.path.controlPoint2.y,
            connection.path.endX,
            connection.path.endY
          )
        } else {
          this.ctx.quadraticCurveTo(
            connection.path.controlPoint1.x,
            connection.path.controlPoint1.y,
            connection.path.endX,
            connection.path.endY
          )
        }
      } else {
        // Straight line
        this.ctx.moveTo(connection.path.startX, connection.path.startY)
        this.ctx.lineTo(connection.path.endX, connection.path.endY)
      }

      // Style based on connection type and highlight state
      if (isHighlighted) {
        this.ctx.strokeStyle = '#5D6B4D'
        this.ctx.lineWidth = 3
      } else if (connection.type === 'spouse') {
        this.ctx.strokeStyle = '#8B7355'
        this.ctx.lineWidth = 2
      } else {
        this.ctx.strokeStyle = '#A08B70'
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
    settings: AppSettings
  ) {
    for (const node of nodes) {
      if (!node.isVisible) continue

      const isFocused = selection.focusedPersonId === node.id
      const isHighlighted = selection.highlightedIds.has(node.id)

      this.renderNode(node, isFocused, isHighlighted, settings)
    }
  }

  /**
   * Render a single node
   */
  private renderNode(
    node: TreeNode,
    isFocused: boolean,
    isHighlighted: boolean,
    settings: AppSettings
  ) {
    const { x, y, width, height, person } = node
    const halfWidth = width / 2
    const halfHeight = height / 2

    // Determine colors based on gender and deceased status
    const colors = this.getNodeColors(person.gender, person.isDeceased, isFocused)

    // Draw shadow
    if (isHighlighted) {
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
      this.ctx.shadowBlur = 8
      this.ctx.shadowOffsetY = 4
    }

    // Draw node background
    this.ctx.fillStyle = colors.background
    this.roundedRect(x - halfWidth, y - halfHeight, width, height, 8)
    this.ctx.fill()

    // Reset shadow
    this.ctx.shadowColor = 'transparent'
    this.ctx.shadowBlur = 0
    this.ctx.shadowOffsetY = 0

    // Draw border
    this.ctx.strokeStyle = colors.border
    this.ctx.lineWidth = isFocused ? 3 : 1.5
    this.roundedRect(x - halfWidth, y - halfHeight, width, height, 8)
    this.ctx.stroke()

    // Draw focused glow
    if (isFocused) {
      this.ctx.strokeStyle = 'rgba(244, 168, 37, 0.4)'
      this.ctx.lineWidth = 6
      this.roundedRect(x - halfWidth - 2, y - halfHeight - 2, width + 4, height + 4, 10)
      this.ctx.stroke()
    }

    // Draw text based on node size
    this.ctx.fillStyle = '#2D3B2A'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'

    const name = person.name.full || 'Unknown'

    if (settings.nodeSize === 'compact') {
      // Compact: just name and birth year
      this.ctx.font = '13px "Source Sans 3", sans-serif'
      this.ctx.fillText(this.truncateText(name, width - 10), x, y - 8)

      if (settings.showDates && person.birth?.date) {
        this.ctx.font = '11px "Source Sans 3", sans-serif'
        this.ctx.fillStyle = '#5D6B4D'
        const year = person.birth.date.match(/\d{4}/)?.[0] || ''
        this.ctx.fillText(`*${year}`, x - 15, y + 10)
      }

      // Gender symbol
      this.ctx.fillText(
        person.gender === 'M' ? '♂' : person.gender === 'F' ? '♀' : '?',
        x + halfWidth - 15,
        y + 10
      )
    } else if (settings.nodeSize === 'standard') {
      // Standard: name, dates, place
      this.ctx.font = '500 13px "Source Sans 3", sans-serif'
      this.ctx.fillText(this.truncateText(name, width - 60), x + 10, y - 15)

      if (settings.showDates && person.birth?.date) {
        this.ctx.font = '11px "Source Sans 3", sans-serif'
        this.ctx.fillStyle = '#5D6B4D'
        this.ctx.fillText(this.truncateText(`*${person.birth.date}`, width - 60), x + 10, y)
      }

      if (settings.showPlaces && person.birth?.place) {
        this.ctx.fillText(this.truncateText(person.birth.place, width - 60), x + 10, y + 15)
      }

      // Gender symbol
      this.ctx.fillStyle = '#5D6B4D'
      this.ctx.font = '14px sans-serif'
      this.ctx.fillText(
        person.gender === 'M' ? '♂' : person.gender === 'F' ? '♀' : '?',
        x + halfWidth - 15,
        y + 20
      )
    } else {
      // Detailed: full info
      this.ctx.font = '600 14px "Source Sans 3", sans-serif'
      this.ctx.fillText(this.truncateText(name, width - 20), x, y - 35)

      this.ctx.font = '11px "Source Sans 3", sans-serif'
      this.ctx.fillStyle = '#5D6B4D'

      if (settings.showDates && person.birth?.date) {
        this.ctx.fillText(`Birth: ${person.birth.date}`, x, y - 15)
      }
      if (settings.showPlaces && person.birth?.place) {
        this.ctx.fillText(this.truncateText(person.birth.place, width - 20), x, y)
      }
      if (person.isDeceased && person.death?.date) {
        this.ctx.fillText(`Death: ${person.death.date}`, x, y + 15)
      } else if (!person.isDeceased) {
        this.ctx.fillText('Living', x, y + 15)
      }

      // ID
      if (settings.showIds) {
        this.ctx.fillText(`ID: ${person.id}`, x, y + 35)
      }
    }
  }

  /**
   * Get node colors based on gender and deceased status
   */
  private getNodeColors(
    gender: 'M' | 'F' | 'U',
    isDeceased: boolean,
    isFocused: boolean
  ): { background: string; border: string } {
    if (isFocused) {
      return { background: '#FFF8E1', border: '#F4A825' }
    }

    if (gender === 'M') {
      return isDeceased
        ? { background: '#D4DBE6', border: '#6B8BB7' }
        : { background: '#E3EBF6', border: '#7A9BC7' }
    } else if (gender === 'F') {
      return isDeceased
        ? { background: '#E6D4DB', border: '#B76B8B' }
        : { background: '#F6E3EB', border: '#C77A9B' }
    } else {
      return { background: '#E8E8E8', border: '#A0A0A0' }
    }
  }

  /**
   * Draw a rounded rectangle path
   */
  private roundedRect(x: number, y: number, width: number, height: number, radius: number) {
    this.ctx.beginPath()
    this.ctx.moveTo(x + radius, y)
    this.ctx.lineTo(x + width - radius, y)
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    this.ctx.lineTo(x + width, y + height - radius)
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    this.ctx.lineTo(x + radius, y + height)
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    this.ctx.lineTo(x, y + radius)
    this.ctx.quadraticCurveTo(x, y, x + radius, y)
    this.ctx.closePath()
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
