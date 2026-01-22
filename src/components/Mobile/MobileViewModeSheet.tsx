import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../../store'
import { BottomSheet } from './BottomSheet'
import { Slider } from '../ui/Slider'
import { Toggle } from '../ui/Toggle'
import type { ViewMode } from '../../types'

const VIEW_MODES: Array<{ value: ViewMode; labelKey: string; icon: string; descriptionKey: string }> = [
  {
    value: 'all',
    labelKey: 'viewModes.all',
    icon: 'M4 5h4v4H4V5zm6 0h4v4h-4V5zm6 0h4v4h-4V5zM4 11h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z',
    descriptionKey: 'viewModes.showEveryone',
  },
  {
    value: 'family',
    labelKey: 'viewModes.family',
    icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
    descriptionKey: 'viewModes.immediateFamily',
  },
  {
    value: 'hourglass',
    labelKey: 'viewModes.hourglass',
    icon: 'M5 4h14v2a7 7 0 01-7 7v0a7 7 0 01-7-7V4zm0 16h14v-2a7 7 0 00-7-7v0a7 7 0 00-7 7v2zm7-9v2',
    descriptionKey: 'viewModes.ancestorsDescendants',
  },
  {
    value: 'pedigree',
    labelKey: 'viewModes.pedigree',
    icon: 'M12 3v10m0 0l-4-4m4 4l4-4M8 17h8M12 17v4',
    descriptionKey: 'viewModes.ancestorsOnly',
  },
]

export function MobileViewModeSheet() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const settings = useStore((state) => state.settings.settings)
  const setSettings = useStore((state) => state.settings.setSettings)
  const focusedPersonId = useStore((state) => state.selection.selection.focusedPersonId)
  const generationCount = useStore((state) => state.tree.generationCount)

  // Listen for custom event from MobileNavBar
  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener('openMobileViewMode', handleOpen)
    return () => window.removeEventListener('openMobileViewMode', handleOpen)
  }, [])

  const handleModeChange = (mode: ViewMode) => {
    setSettings({ viewMode: mode })
  }

  const handleGenerationToggle = () => {
    setSettings({ generationFilterEnabled: !settings.generationFilterEnabled })
  }

  const handleGenerationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ generationDepth: parseInt(e.target.value, 10) })
  }

  const maxGenerations = Math.max(generationCount, settings.generationDepth, 5)

  return (
    <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)} title={t('viewMode.title')}>
      <div className="p-4 space-y-6">
        {/* View Mode Selection */}
        <div>
          <h3 className="font-body text-sm font-medium text-text-primary mb-3">
            {t('viewMode.title')}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {VIEW_MODES.map((mode) => {
              const isActive = settings.viewMode === mode.value
              const isDisabled = mode.value !== 'all' && !focusedPersonId

              return (
                <button
                  key={mode.value}
                  onClick={() => handleModeChange(mode.value)}
                  disabled={isDisabled}
                  className={`
                    flex flex-col items-center justify-center p-4 rounded-lg transition-colors
                    ${isActive ? 'bg-primary text-white' : 'bg-bg-aged hover:bg-accent/20 text-text-primary'}
                    ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <svg
                    className="w-6 h-6 mb-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={mode.icon} />
                  </svg>
                  <span className="text-sm font-body">{t(mode.labelKey)}</span>
                  <span className="text-xs text-current/70 mt-1 text-center">{t(mode.descriptionKey)}</span>
                </button>
              )
            })}
          </div>

          {!focusedPersonId && (
            <p className="mt-3 font-body text-xs text-accent text-center">
              {t('viewModes.clickToEnableFiltered')}
            </p>
          )}
        </div>

        {/* Generation Filter */}
        <div className="border-t border-accent/20 pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-body text-sm font-medium text-text-primary">
              {t('generationSlider.title', 'Generations')}
            </span>
            <Toggle
              checked={settings.generationFilterEnabled}
              onChange={handleGenerationToggle}
              aria-label="Enable generation filter"
            />
          </div>

          {settings.generationFilterEnabled && (
            <>
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setSettings({ generationDepth: Math.max(1, settings.generationDepth - 1) })
                  }
                  className="h-10 w-10 flex items-center justify-center rounded-lg bg-bg-aged hover:bg-accent/20 text-lg font-medium"
                  aria-label="Decrease generations"
                >
                  -
                </button>

                <Slider
                  value={settings.generationDepth}
                  min={1}
                  max={maxGenerations}
                  step={1}
                  onChange={handleGenerationChange}
                  showValue={false}
                  className="flex-1"
                  aria-label="Generation depth"
                />

                <button
                  onClick={() =>
                    setSettings({ generationDepth: Math.min(maxGenerations, settings.generationDepth + 1) })
                  }
                  className="h-10 w-10 flex items-center justify-center rounded-lg bg-bg-aged hover:bg-accent/20 text-lg font-medium"
                  aria-label="Increase generations"
                >
                  +
                </button>
              </div>

              <p className="mt-3 font-body text-sm text-text-muted text-center">
                {t('generationSlider.showing', `Showing ${settings.generationDepth} of ${generationCount} generations`, {
                  current: settings.generationDepth,
                  total: generationCount,
                })}
              </p>
            </>
          )}
        </div>
      </div>
    </BottomSheet>
  )
}
