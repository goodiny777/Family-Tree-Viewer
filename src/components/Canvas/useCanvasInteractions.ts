import { useRef, useCallback } from 'react'
import { useStore } from '../../store'

export function useCanvasInteractions(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const isDraggingRef = useRef(false)
  const lastMousePosRef = useRef({ x: 0, y: 0 })

  const { pan, zoom, viewport } = useStore((state) => state.viewport)

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return // Only left click

    isDraggingRef.current = true
    lastMousePosRef.current = { x: e.clientX, y: e.clientY }

    // Prevent text selection while dragging
    e.preventDefault()
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDraggingRef.current) return

      const deltaX = e.clientX - lastMousePosRef.current.x
      const deltaY = e.clientY - lastMousePosRef.current.y

      pan(deltaX, deltaY)

      lastMousePosRef.current = { x: e.clientX, y: e.clientY }
    },
    [pan]
  )

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false
  }, [])

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault()

      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // Calculate zoom factor
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
      const newZoom = Math.max(0.1, Math.min(4, viewport.zoom * zoomFactor))

      // Zoom towards mouse position
      zoom(newZoom, mouseX, mouseY)
    },
    [canvasRef, zoom, viewport.zoom]
  )

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    isDragging: isDraggingRef.current,
  }
}
