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
  const bounds = useStore((state) => state.tree.bounds)
  const levelBands = useStore((state) => state.tree.levelBands)
  const viewport = useStore((state) => state.viewport.viewport)
  const setViewport = useStore((state) => state.viewport.setViewport)
  const centerOnNode = useStore((state) => state.viewport.centerOnNode)
  const selection = useStore((state) => state.selection.selection)
  const setFocusedPerson = useStore((state) => state.selection.setFocusedPerson)
  const settings = useStore((state) => state.settings.settings)

  // Initialize canvas interactions
  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    consumeDragState,
  } = useCanvasInteractions(canvasRef)

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
      levelBands,
      bounds,
    })
  }, [nodes, connections, viewport, selection, settings, levelBands, bounds])

  // Handle node click - using circular hit testing
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      // Skip click handling if this was a drag operation
      if (consumeDragState()) {
        return
      }

      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const x = (e.clientX - rect.left) * dpr
      const y = (e.clientY - rect.top) * dpr

      // Convert to world coordinates
      const worldX = (x / dpr - viewport.offsetX) / viewport.zoom
      const worldY = (y / dpr - viewport.offsetY) / viewport.zoom

      // Find clicked node using circular hit testing
      const clickedNode = nodes.find((node) => {
        const dx = worldX - node.x
        const dy = worldY - node.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        return distance <= node.radius
      })

      if (clickedNode) {
        setFocusedPerson(clickedNode.id)
      }
    },
    [nodes, viewport, setFocusedPerson, consumeDragState]
  )

  // Handle double-click to center on node - using circular hit testing
  const handleDoubleClick = useCallback(
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

      // Find double-clicked node using circular hit testing
      const clickedNode = nodes.find((node) => {
        const dx = worldX - node.x
        const dy = worldY - node.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        return distance <= node.radius
      })

      if (clickedNode) {
        setFocusedPerson(clickedNode.id)
        centerOnNode(clickedNode.id)
      }
    },
    [nodes, viewport, setFocusedPerson, centerOnNode]
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
        className="cursor-grab active:cursor-grabbing touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleCanvasClick}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      />
    </div>
  )
}
