import { useTranslation } from 'react-i18next'
import { useStore } from '../../store'
import { Slider } from '../ui/Slider'

export function ZoomControls() {
  const { t } = useTranslation()
  const { viewport, zoom, fitToScreen } = useStore((state) => state.viewport)

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    zoom(parseFloat(e.target.value))
  }

  const handleZoomIn = () => {
    zoom(Math.min(4, viewport.zoom + 0.1))
  }

  const handleZoomOut = () => {
    zoom(Math.max(0.1, viewport.zoom - 0.1))
  }

  const zoomPercentage = Math.round(viewport.zoom * 100)

  return (
    <div className="panel flex flex-col gap-2 p-3 w-44">
      {/* Zoom slider with +/- buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleZoomOut}
          className="btn-icon h-8 w-8 flex items-center justify-center rounded bg-bg-aged hover:bg-accent/20"
          aria-label={t('zoom.zoomOut')}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>

        <Slider
          value={viewport.zoom}
          min={0.1}
          max={4}
          step={0.1}
          onChange={handleZoomChange}
          showValue={false}
          className="flex-1"
          aria-label={t('zoom.zoomIn')}
        />

        <button
          onClick={handleZoomIn}
          className="btn-icon h-8 w-8 flex items-center justify-center rounded bg-bg-aged hover:bg-accent/20"
          aria-label={t('zoom.zoomIn')}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Zoom percentage */}
      <div className="text-center font-body text-small text-text-secondary">
        {zoomPercentage}%
      </div>

      {/* Fit to screen button */}
      <button
        onClick={fitToScreen}
        className="flex items-center justify-center gap-2 rounded-lg bg-bg-aged px-3 py-1.5 font-body text-small text-text-primary hover:bg-accent/20 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
          />
        </svg>
        {t('zoom.fitToScreen')}
      </button>
    </div>
  )
}
