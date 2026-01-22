import { jsPDF } from 'jspdf'
import type { TreeNode, Connection, TreeBounds, AppSettings } from '../../types'

interface ExportOptions {
  format: 'png' | 'pdf' | 'svg'
  scope: 'visible' | 'full' | 'selection'
  nodes: TreeNode[]
  connections: Connection[]
  bounds: TreeBounds
  settings: AppSettings
  viewport: { offsetX: number; offsetY: number; zoom: number; canvasWidth: number; canvasHeight: number }
  focusedPersonId: string | null
  fileName?: string
}

/**
 * Export the family tree in the specified format
 */
export async function exportTree(options: ExportOptions): Promise<void> {
  const { format, fileName = 'family-tree' } = options

  switch (format) {
    case 'png':
      await exportPNG(options, fileName)
      break
    case 'pdf':
      await exportPDF(options, fileName)
      break
    case 'svg':
      exportSVG(options, fileName)
      break
  }
}

/**
 * Export as PNG using html2canvas
 */
async function exportPNG(options: ExportOptions, fileName: string): Promise<void> {
  const canvas = createOffscreenCanvas(options)

  // Convert to blob and download
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png', 1.0)
  })

  downloadBlob(blob, `${fileName}.png`)
}

/**
 * Export as PDF using jsPDF
 */
async function exportPDF(options: ExportOptions, fileName: string): Promise<void> {
  const canvas = createOffscreenCanvas(options)

  const imgData = canvas.toDataURL('image/png', 1.0)

  // Calculate PDF dimensions (A4 or custom based on tree size)
  const { bounds } = options
  const padding = 40
  const width = bounds.width + padding * 2
  const height = bounds.height + padding * 2

  // Use landscape or portrait based on aspect ratio
  const orientation = width > height ? 'landscape' : 'portrait'
  const pdf = new jsPDF({
    orientation,
    unit: 'px',
    format: [width, height],
  })

  pdf.addImage(imgData, 'PNG', 0, 0, width, height)
  pdf.save(`${fileName}.pdf`)
}

/**
 * Export as SVG
 */
function exportSVG(options: ExportOptions, fileName: string): void {
  const svg = createSVG(options)
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  downloadBlob(blob, `${fileName}.svg`)
}

/**
 * Create an offscreen canvas with the tree rendered
 */
function createOffscreenCanvas(options: ExportOptions): HTMLCanvasElement {
  const { nodes, connections, bounds, settings, scope, viewport } = options
  const padding = 40

  let width: number
  let height: number
  let offsetX: number
  let offsetY: number

  if (scope === 'visible') {
    // Export visible area only
    width = viewport.canvasWidth
    height = viewport.canvasHeight
    offsetX = viewport.offsetX
    offsetY = viewport.offsetY
  } else {
    // Export full tree
    width = bounds.width + padding * 2
    height = bounds.height + padding * 2
    offsetX = -bounds.minX + padding
    offsetY = -bounds.minY + padding
  }

  const canvas = document.createElement('canvas')
  const dpr = 2 // High resolution export
  canvas.width = width * dpr
  canvas.height = height * dpr

  const ctx = canvas.getContext('2d')!

  // White background
  ctx.fillStyle = '#F5EFE0'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Apply scaling
  ctx.setTransform(dpr, 0, 0, dpr, offsetX * dpr, offsetY * dpr)

  // Render connections
  for (const connection of connections) {
    renderConnection(ctx, connection, settings)
  }

  // Render nodes
  for (const node of nodes) {
    if (!node.isVisible && scope === 'visible') continue
    renderNode(ctx, node, settings)
  }

  return canvas
}

/**
 * Create SVG string
 */
function createSVG(options: ExportOptions): string {
  const { nodes, connections, bounds, settings, scope } = options
  const padding = 40

  const width = scope === 'visible' ? options.viewport.canvasWidth : bounds.width + padding * 2
  const height = scope === 'visible' ? options.viewport.canvasHeight : bounds.height + padding * 2
  const offsetX = scope === 'visible' ? options.viewport.offsetX : -bounds.minX + padding
  const offsetY = scope === 'visible' ? options.viewport.offsetY : -bounds.minY + padding

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>
    .node-text { font-family: 'Source Sans 3', sans-serif; }
    .node-name { font-size: 13px; font-weight: 500; fill: #2D3B2A; }
    .node-date { font-size: 11px; fill: #5D6B4D; }
  </style>
  <rect width="100%" height="100%" fill="#F5EFE0"/>
  <g transform="translate(${offsetX}, ${offsetY})">\n`

  // Render connections
  for (const connection of connections) {
    svg += renderConnectionSVG(connection, settings)
  }

  // Render nodes
  for (const node of nodes) {
    if (!node.isVisible && scope === 'visible') continue
    svg += renderNodeSVG(node, settings)
  }

  svg += `  </g>\n</svg>`
  return svg
}

/**
 * Render a connection on canvas
 */
function renderConnection(ctx: CanvasRenderingContext2D, connection: Connection, settings: AppSettings): void {
  ctx.beginPath()

  if (settings.connectionStyle === 'curved' && connection.path.controlPoint1) {
    ctx.moveTo(connection.path.startX, connection.path.startY)
    if (connection.path.controlPoint2) {
      ctx.bezierCurveTo(
        connection.path.controlPoint1.x,
        connection.path.controlPoint1.y,
        connection.path.controlPoint2.x,
        connection.path.controlPoint2.y,
        connection.path.endX,
        connection.path.endY
      )
    } else {
      ctx.quadraticCurveTo(
        connection.path.controlPoint1.x,
        connection.path.controlPoint1.y,
        connection.path.endX,
        connection.path.endY
      )
    }
  } else {
    ctx.moveTo(connection.path.startX, connection.path.startY)
    ctx.lineTo(connection.path.endX, connection.path.endY)
  }

  ctx.strokeStyle = connection.type === 'spouse' ? '#8B7355' : '#A08B70'
  ctx.lineWidth = 2
  ctx.stroke()
}

/**
 * Render a node on canvas
 */
function renderNode(ctx: CanvasRenderingContext2D, node: TreeNode, settings: AppSettings): void {
  const { x, y, width, height, person } = node
  const halfWidth = width / 2
  const halfHeight = height / 2

  // Get colors
  const colors = getNodeColors(person.gender, person.isDeceased)

  // Draw background
  ctx.fillStyle = colors.background
  roundedRect(ctx, x - halfWidth, y - halfHeight, width, height, 8)
  ctx.fill()

  // Draw border
  ctx.strokeStyle = colors.border
  ctx.lineWidth = 1.5
  roundedRect(ctx, x - halfWidth, y - halfHeight, width, height, 8)
  ctx.stroke()

  // Draw text
  ctx.fillStyle = '#2D3B2A'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '500 13px "Source Sans 3", sans-serif'

  const name = person.name.full || 'Unknown'
  ctx.fillText(truncateText(ctx, name, width - 20), x, y - 10)

  if (settings.showDates && person.birth?.date) {
    ctx.font = '11px "Source Sans 3", sans-serif'
    ctx.fillStyle = '#5D6B4D'
    ctx.fillText(`*${person.birth.date}`, x, y + 10)
  }
}

/**
 * Render connection as SVG
 */
function renderConnectionSVG(connection: Connection, settings: AppSettings): string {
  const { startX, startY, endX, endY, controlPoint1, controlPoint2 } = connection.path
  const color = connection.type === 'spouse' ? '#8B7355' : '#A08B70'

  let path: string
  if (settings.connectionStyle === 'curved' && controlPoint1) {
    if (controlPoint2) {
      path = `M${startX},${startY} C${controlPoint1.x},${controlPoint1.y} ${controlPoint2.x},${controlPoint2.y} ${endX},${endY}`
    } else {
      path = `M${startX},${startY} Q${controlPoint1.x},${controlPoint1.y} ${endX},${endY}`
    }
  } else {
    path = `M${startX},${startY} L${endX},${endY}`
  }

  return `    <path d="${path}" stroke="${color}" stroke-width="2" fill="none"/>\n`
}

/**
 * Render node as SVG
 */
function renderNodeSVG(node: TreeNode, settings: AppSettings): string {
  const { x, y, width, height, person } = node
  const halfWidth = width / 2
  const halfHeight = height / 2
  const colors = getNodeColors(person.gender, person.isDeceased)
  const name = person.name.full || 'Unknown'

  let svg = `    <g transform="translate(${x - halfWidth}, ${y - halfHeight})">
      <rect width="${width}" height="${height}" rx="8" fill="${colors.background}" stroke="${colors.border}" stroke-width="1.5"/>
      <text x="${halfWidth}" y="${halfHeight - 5}" class="node-text node-name" text-anchor="middle">${escapeXml(name)}</text>`

  if (settings.showDates && person.birth?.date) {
    svg += `
      <text x="${halfWidth}" y="${halfHeight + 15}" class="node-text node-date" text-anchor="middle">*${escapeXml(person.birth.date)}</text>`
  }

  svg += `
    </g>\n`
  return svg
}

/**
 * Get node colors based on gender and deceased status
 */
function getNodeColors(gender: 'M' | 'F' | 'U', isDeceased: boolean): { background: string; border: string } {
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
 * Draw rounded rectangle path
 */
function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

/**
 * Truncate text to fit within width
 */
function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  const metrics = ctx.measureText(text)
  if (metrics.width <= maxWidth) return text

  let truncated = text
  while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
    truncated = truncated.slice(0, -1)
  }
  return truncated + '...'
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Download a blob as a file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
