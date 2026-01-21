import { useState, useRef, useCallback, useEffect } from 'react'
import { useStore } from '../../store'

const MINIMAP_SIZE = 160
const MINIMAP_PADDING = 10

export function Minimap() {
  const [isVisible, setIsVisible] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const nodes = useStore((state) => state.tree.nodes)
  const bounds = useStore((state) => state.tree.bounds)
  const { viewport, setViewport } = useStore((state) => state.viewport)

  // Calculate scale to fit tree in minimap
  const scale = Math.min(
    (MINIMAP_SIZE - MINIMAP_PADDING * 2) / (bounds.width || 1),
    (MINIMAP_SIZE - MINIMAP_PADDING * 2) / (bounds.height || 1)
  )

  // Draw minimap
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !isVisible) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#E8DCC8'
    ctx.fillRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE)

    if (nodes.length === 0) return

    // Calculate offset to center tree in minimap
    const offsetX = MINIMAP_SIZE / 2 - ((bounds.minX + bounds.maxX) / 2) * scale
    const offsetY = MINIMAP_SIZE / 2 - ((bounds.minY + bounds.maxY) / 2) * scale

    // Draw nodes as small dots
    ctx.fillStyle = '#5D6B4D'
    for (const node of nodes) {
      const x = node.x * scale + offsetX
      const y = node.y * scale + offsetY
      ctx.beginPath()
      ctx.arc(x, y, 2, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw viewport rectangle
    if (viewport.canvasWidth > 0 && viewport.canvasHeight > 0) {
      const viewX = (-viewport.offsetX / viewport.zoom) * scale + offsetX
      const viewY = (-viewport.offsetY / viewport.zoom) * scale + offsetY
      const viewW = (viewport.canvasWidth / viewport.zoom) * scale
      const viewH = (viewport.canvasHeight / viewport.zoom) * scale

      ctx.strokeStyle = '#F4A825'
      ctx.lineWidth = 2
      ctx.strokeRect(viewX, viewY, viewW, viewH)
    }
  }, [nodes, bounds, viewport, scale, isVisible])

  // Handle minimap click to navigate
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Calculate offset to center tree in minimap
      const offsetX = MINIMAP_SIZE / 2 - ((bounds.minX + bounds.maxX) / 2) * scale
      const offsetY = MINIMAP_SIZE / 2 - ((bounds.minY + bounds.maxY) / 2) * scale

      // Convert click position to tree coordinates
      const treeX = (x - offsetX) / scale
      const treeY = (y - offsetY) / scale

      // Set viewport to center on this point
      setViewport({
        offsetX: viewport.canvasWidth / 2 - treeX * viewport.zoom,
        offsetY: viewport.canvasHeight / 2 - treeY * viewport.zoom,
      })
    },
    [bounds, scale, viewport, setViewport]
  )

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="panel flex items-center gap-2 px-3 py-2 font-body text-small text-text-secondary hover:text-text-primary"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        Show minimap
      </button>
    )
  }

  return (
    <div className="panel overflow-hidden">
      <canvas
        ref={canvasRef}
        width={MINIMAP_SIZE}
        height={MINIMAP_SIZE}
        onClick={handleClick}
        className="cursor-crosshair"
      />
      <button
        onClick={() => setIsVisible(false)}
        className="flex w-full items-center justify-center gap-2 border-t border-bg-aged px-3 py-1.5 font-body text-small text-text-muted hover:text-text-secondary transition-colors"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
          />
        </svg>
        Hide
      </button>
    </div>
  )
}
