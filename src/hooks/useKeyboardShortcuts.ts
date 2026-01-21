import { useEffect, useCallback } from 'react'
import { useStore } from '../store'

export function useKeyboardShortcuts() {
  const { pan, zoom, fitToScreen, viewport } = useStore((state) => state.viewport)
  const { setFocusedPerson } = useStore((state) => state.selection)
  const { setSearchOpen, setShortcutsOverlayOpen, isSearchOpen, isExportDialogOpen, isShortcutsOverlayOpen } = useStore((state) => state.ui)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't handle shortcuts when typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      // Check for overlays that capture Escape
      if (e.key === 'Escape') {
        if (isSearchOpen) {
          setSearchOpen(false)
          return
        }
        if (isExportDialogOpen || isShortcutsOverlayOpen) {
          return // These overlays handle their own escape
        }
        setFocusedPerson(null)
        return
      }

      // Don't handle other shortcuts when overlays are open
      if (isSearchOpen || isExportDialogOpen || isShortcutsOverlayOpen) {
        return
      }

      const PAN_AMOUNT = 50

      switch (e.key) {
        // Pan with arrow keys
        case 'ArrowUp':
          e.preventDefault()
          pan(0, PAN_AMOUNT)
          break
        case 'ArrowDown':
          e.preventDefault()
          pan(0, -PAN_AMOUNT)
          break
        case 'ArrowLeft':
          e.preventDefault()
          pan(PAN_AMOUNT, 0)
          break
        case 'ArrowRight':
          e.preventDefault()
          pan(-PAN_AMOUNT, 0)
          break

        // Zoom with +/-
        case '+':
        case '=':
          e.preventDefault()
          zoom(Math.min(4, viewport.zoom * 1.2))
          break
        case '-':
        case '_':
          e.preventDefault()
          zoom(Math.max(0.1, viewport.zoom * 0.8))
          break

        // Fit to screen with 0
        case '0':
          e.preventDefault()
          fitToScreen()
          break

        // Search with Cmd/Ctrl+F
        case 'f':
        case 'F':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault()
            setSearchOpen(true)
          }
          break

        // Show shortcuts with ?
        case '?':
          e.preventDefault()
          setShortcutsOverlayOpen(true)
          break
      }
    },
    [
      pan,
      zoom,
      fitToScreen,
      viewport.zoom,
      setFocusedPerson,
      setSearchOpen,
      setShortcutsOverlayOpen,
      isSearchOpen,
      isExportDialogOpen,
      isShortcutsOverlayOpen,
    ]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
