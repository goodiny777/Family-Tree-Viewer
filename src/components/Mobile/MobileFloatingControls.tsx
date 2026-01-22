import { useTranslation } from 'react-i18next'
import { useStore } from '../../store'

export function MobileFloatingControls() {
  const { t } = useTranslation()
  const { viewport, zoom, fitToScreen } = useStore((state) => state.viewport)

  const handleZoomIn = () => {
    zoom(Math.min(4, viewport.zoom * 1.2))
  }

  const handleZoomOut = () => {
    zoom(Math.max(0.1, viewport.zoom / 1.2))
  }

  return (
    <div
      className="fixed right-4 z-20 flex flex-col gap-2"
      style={{ bottom: 'calc(80px + env(safe-area-inset-bottom))' }}
    >
      {/* Zoom In */}
      <button
        onClick={handleZoomIn}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-panel shadow-panel hover:bg-bg-aged transition-colors"
        aria-label={t('zoom.zoomIn')}
      >
        <svg className="h-6 w-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Zoom Out */}
      <button
        onClick={handleZoomOut}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-panel shadow-panel hover:bg-bg-aged transition-colors"
        aria-label={t('zoom.zoomOut')}
      >
        <svg className="h-6 w-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>

      {/* Fit to Screen */}
      <button
        onClick={fitToScreen}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-panel shadow-panel hover:bg-bg-aged transition-colors"
        aria-label={t('zoom.fitToScreen')}
      >
        <svg className="h-6 w-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
          />
        </svg>
      </button>
    </div>
  )
}
