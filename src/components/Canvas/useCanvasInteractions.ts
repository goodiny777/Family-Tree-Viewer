import { useRef, useCallback } from 'react'
import { useStore } from '../../store'

// Minimum distance to consider a drag (in pixels)
const DRAG_THRESHOLD = 5

// Helper to calculate distance between two touch points
const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
  const dx = touch1.clientX - touch2.clientX
  const dy = touch1.clientY - touch2.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

// Helper to get midpoint between two touch points
const getMidpoint = (touch1: React.Touch, touch2: React.Touch) => ({
  x: (touch1.clientX + touch2.clientX) / 2,
  y: (touch1.clientY + touch2.clientY) / 2,
})

export function useCanvasInteractions(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const isDraggingRef = useRef(false)
  const hasDraggedRef = useRef(false)
  const lastMousePosRef = useRef({ x: 0, y: 0 })
  const dragStartPosRef = useRef({ x: 0, y: 0 })

  // Touch-specific refs
  const isTouchingRef = useRef(false)
  const hasTouchMovedRef = useRef(false)
  const lastTouchPosRef = useRef({ x: 0, y: 0 })
  const touchStartPosRef = useRef({ x: 0, y: 0 })
  const initialPinchDistanceRef = useRef<number | null>(null)
  const lastPinchZoomRef = useRef<number>(1)

  const { pan, zoom, viewport } = useStore((state) => state.viewport)

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return // Only left click

    isDraggingRef.current = true
    hasDraggedRef.current = false
    lastMousePosRef.current = { x: e.clientX, y: e.clientY }
    dragStartPosRef.current = { x: e.clientX, y: e.clientY }

    // Prevent text selection while dragging
    e.preventDefault()
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDraggingRef.current) return

      const deltaX = e.clientX - lastMousePosRef.current.x
      const deltaY = e.clientY - lastMousePosRef.current.y

      // Check if we've moved beyond drag threshold
      const totalDeltaX = e.clientX - dragStartPosRef.current.x
      const totalDeltaY = e.clientY - dragStartPosRef.current.y
      const distance = Math.sqrt(totalDeltaX * totalDeltaX + totalDeltaY * totalDeltaY)
      if (distance > DRAG_THRESHOLD) {
        hasDraggedRef.current = true
      }

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

  // Check if a drag just occurred and reset the flag
  const consumeDragState = useCallback(() => {
    const wasDragging = hasDraggedRef.current || hasTouchMovedRef.current
    hasDraggedRef.current = false
    hasTouchMovedRef.current = false
    return wasDragging
  }, [])

  // Touch handlers for mobile support
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      // Single touch - start pan
      const touch = e.touches[0]
      isTouchingRef.current = true
      hasTouchMovedRef.current = false
      lastTouchPosRef.current = { x: touch.clientX, y: touch.clientY }
      touchStartPosRef.current = { x: touch.clientX, y: touch.clientY }
      initialPinchDistanceRef.current = null
    } else if (e.touches.length === 2) {
      // Two touches - start pinch zoom
      const distance = getDistance(e.touches[0], e.touches[1])
      initialPinchDistanceRef.current = distance
      lastPinchZoomRef.current = viewport.zoom
    }

    e.preventDefault()
  }, [viewport.zoom])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (e.touches.length === 1 && isTouchingRef.current && initialPinchDistanceRef.current === null) {
        // Single touch - pan
        const touch = e.touches[0]
        const deltaX = touch.clientX - lastTouchPosRef.current.x
        const deltaY = touch.clientY - lastTouchPosRef.current.y

        // Check if we've moved beyond drag threshold
        const totalDeltaX = touch.clientX - touchStartPosRef.current.x
        const totalDeltaY = touch.clientY - touchStartPosRef.current.y
        const distance = Math.sqrt(totalDeltaX * totalDeltaX + totalDeltaY * totalDeltaY)
        if (distance > DRAG_THRESHOLD) {
          hasTouchMovedRef.current = true
        }

        pan(deltaX, deltaY)
        lastTouchPosRef.current = { x: touch.clientX, y: touch.clientY }
      } else if (e.touches.length === 2 && initialPinchDistanceRef.current !== null) {
        // Two touches - pinch zoom
        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const currentDistance = getDistance(e.touches[0], e.touches[1])
        const midpoint = getMidpoint(e.touches[0], e.touches[1])

        // Calculate new zoom based on pinch distance ratio
        const scale = currentDistance / initialPinchDistanceRef.current
        const newZoom = Math.max(0.1, Math.min(4, lastPinchZoomRef.current * scale))

        // Zoom towards midpoint
        const focalX = midpoint.x - rect.left
        const focalY = midpoint.y - rect.top

        zoom(newZoom, focalX, focalY)
        hasTouchMovedRef.current = true
      }

      e.preventDefault()
    },
    [canvasRef, pan, zoom]
  )

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 0) {
      // All touches ended
      isTouchingRef.current = false
      initialPinchDistanceRef.current = null
    } else if (e.touches.length === 1) {
      // Went from 2 touches to 1 - reset to pan mode
      const touch = e.touches[0]
      lastTouchPosRef.current = { x: touch.clientX, y: touch.clientY }
      touchStartPosRef.current = { x: touch.clientX, y: touch.clientY }
      initialPinchDistanceRef.current = null
      lastPinchZoomRef.current = viewport.zoom
    }
  }, [viewport.zoom])

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isDragging: isDraggingRef.current,
    consumeDragState,
  }
}
