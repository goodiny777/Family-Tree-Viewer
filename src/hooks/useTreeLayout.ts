import { useEffect, useRef } from 'react'
import { useStore } from '../store'
import { generateLayout } from '../core/layout'
import type { ViewMode } from '../types'

/**
 * Hook that generates tree layout when GEDCOM data changes
 * Automatically updates the store with new layout
 */
export function useTreeLayout() {
  const gedcomData = useStore((state) => state.gedcom.data)
  const hasData = useStore((state) => state.gedcom.hasData)
  const nodeSize = useStore((state) => state.settings.settings.nodeSize)
  const generationDepth = useStore((state) => state.settings.settings.generationDepth)
  const generationFilterEnabled = useStore((state) => state.settings.settings.generationFilterEnabled)
  const viewMode = useStore((state) => state.settings.settings.viewMode)
  const focusedPersonId = useStore((state) => state.selection.selection.focusedPersonId)
  const { setLayout } = useStore((state) => state.tree)
  const { fitToScreen, centerOnNode } = useStore((state) => state.viewport)
  const { setLoading } = useStore((state) => state.gedcom)

  // Track previous state to detect changes
  const prevFocusedRef = useRef<string | null>(null)
  const prevViewModeRef = useRef<ViewMode>('all')

  useEffect(() => {
    if (!hasData || !gedcomData) {
      return
    }

    // Generate layout with optional generation filter and view mode
    const result = generateLayout(gedcomData, focusedPersonId, {
      nodeSize,
      maxGenerations: generationFilterEnabled ? generationDepth : undefined,
      viewMode,
    })

    // Update store
    setLayout(result.nodes, result.connections, result.bounds, result.generationCount, result.levelBands)
    setLoading(false)

    // Detect if view mode changed
    const viewModeChanged = prevViewModeRef.current !== viewMode

    // After layout updates, handle viewport adjustment
    const timer = setTimeout(() => {
      if (viewModeChanged) {
        // View mode changed - fit to screen to show the new filtered view
        fitToScreen()
      } else if (focusedPersonId) {
        // Center on focused person
        centerOnNode(focusedPersonId)
      } else if (prevFocusedRef.current !== null && focusedPersonId === null) {
        // Selection was cleared - fit to screen
        fitToScreen()
      }
      prevFocusedRef.current = focusedPersonId
      prevViewModeRef.current = viewMode
    }, 50)

    return () => clearTimeout(timer)
  }, [gedcomData, hasData, nodeSize, generationDepth, generationFilterEnabled, viewMode, focusedPersonId, setLayout, setLoading, fitToScreen, centerOnNode])

  // Fit to screen only when data first loads
  useEffect(() => {
    if (hasData) {
      const timer = setTimeout(() => {
        fitToScreen()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [hasData, fitToScreen])
}
