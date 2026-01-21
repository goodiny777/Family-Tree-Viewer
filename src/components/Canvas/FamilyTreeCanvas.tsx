import { useRef, useEffect, useCallback } from 'react'
import { useStore } from '../../store'
import { useCanvasInteractions } from './useCanvasInteractions'
import { CanvasRenderer } from '../../core/renderer/CanvasRenderer'

export function FamilyTreeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<CanvasRenderer | null>(null)

  const nodes = useStore((state) => state.tree.nodes)
  const connections = useStore((state) => state.tree.connections)
  const { viewport, setViewport } = useStore((state) => state.viewport)
  const { selection, setFocusedPerson } = useStore((state) => state.selection)
  const settings = useStore((state) => state.settings.settings)

  // Initialize canvas interactions
  const { handleMouseDown, handleMouseMove, handleMouseUp, handleWheel } =
    useCanvasInteractions(canvasRef)

  // Handle canvas resize
  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      const dpr = window.devicePixelRatio || 1

      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      setViewport({ canvasWidth: width, canvasHeight: height })
    })

    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [setViewport])

  // Initialize renderer
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    rendererRef.current = new CanvasRenderer(canvas)

    return () => {
      rendererRef.current = null
    }
  }, [])

  // Render loop
  useEffect(() => {
    const renderer = rendererRef.current
    if (!renderer) return

    renderer.render({
      nodes,
      connections,
      viewport,
      selection,
      settings,
    })
  }, [nodes, connections, viewport, selection, settings])

  // Handle node click
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const x = (e.clientX - rect.left) * dpr
      const y = (e.clientY - rect.top) * dpr

      // Convert to world coordinates
      const worldX = (x / dpr - viewport.offsetX) / viewport.zoom
      const worldY = (y / dpr - viewport.offsetY) / viewport.zoom

      // Find clicked node
      const clickedNode = nodes.find((node) => {
        const halfWidth = node.width / 2
        const halfHeight = node.height / 2
        return (
          worldX >= node.x - halfWidth &&
          worldX <= node.x + halfWidth &&
          worldY >= node.y - halfHeight &&
          worldY <= node.y + halfHeight
        )
      })

      if (clickedNode) {
        setFocusedPerson(clickedNode.id)
      } else {
        setFocusedPerson(null)
      }
    },
    [nodes, viewport, setFocusedPerson]
  )

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 top-12 overflow-hidden bg-bg-canvas"
      style={{
        backgroundImage: `url('/background.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <canvas
        ref={canvasRef}
        className="cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleCanvasClick}
      />
    </div>
  )
}
