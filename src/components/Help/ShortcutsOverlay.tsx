import { useCallback } from 'react'
import { useStore } from '../../store'

const shortcuts = [
  { category: 'Navigation', items: [
    { keys: ['Arrow Keys'], description: 'Pan canvas' },
    { keys: ['+', '-'], description: 'Zoom in/out' },
    { keys: ['0'], description: 'Fit to screen' },
    { keys: ['Scroll'], description: 'Zoom' },
    { keys: ['Drag'], description: 'Pan' },
  ]},
  { category: 'Selection', items: [
    { keys: ['Click'], description: 'Select person' },
    { keys: ['Double-click'], description: 'Center on person' },
    { keys: ['Esc'], description: 'Deselect / Close' },
  ]},
  { category: 'Actions', items: [
    { keys: ['Cmd/Ctrl', 'F'], description: 'Search' },
    { keys: ['?'], description: 'Show shortcuts' },
  ]},
]

export function ShortcutsOverlay() {
  const { setShortcutsOverlayOpen } = useStore((state) => state.ui)

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setShortcutsOverlayOpen(false)
      }
    },
    [setShortcutsOverlayOpen]
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-lg rounded-lg bg-white shadow-panel animate-zoom">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-bg-aged px-4 py-3">
          <h2 className="font-display text-h2 text-text-primary">Keyboard Shortcuts</h2>
          <button
            onClick={() => setShortcutsOverlayOpen(false)}
            className="rounded-lg p-1 hover:bg-bg-panel transition-colors"
            aria-label="Close"
          >
            <svg className="h-5 w-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto p-4 scrollbar-thin">
          {shortcuts.map((category) => (
            <div key={category.category} className="mb-6 last:mb-0">
              <h3 className="mb-3 font-body text-h3 text-text-primary">{category.category}</h3>
              <div className="space-y-2">
                {category.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-1">
                    <span className="font-body text-body text-text-secondary">
                      {item.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, keyIndex) => (
                        <span key={keyIndex}>
                          <kbd className="rounded bg-bg-aged px-2 py-1 font-body text-small text-text-primary">
                            {key}
                          </kbd>
                          {keyIndex < item.keys.length - 1 && (
                            <span className="mx-1 text-text-muted">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-bg-aged px-4 py-3 text-center">
          <p className="font-body text-small text-text-muted">
            Press <kbd className="rounded bg-bg-aged px-1.5 py-0.5">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  )
}
