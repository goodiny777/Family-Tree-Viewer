import { useTranslation } from 'react-i18next'
import { useStore } from '../../store'
import type { ViewMode } from '../../types'

export function ViewModeSelector() {
  const { t } = useTranslation()
  const settings = useStore((state) => state.settings.settings)
  const setSettings = useStore((state) => state.settings.setSettings)
  const focusedPersonId = useStore((state) => state.selection.selection.focusedPersonId)

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

  const handleModeChange = (mode: ViewMode) => {
    setSettings({ viewMode: mode })
  }

  return (
    <div className="panel p-2">
      <div className="flex items-center gap-1">
        {VIEW_MODES.map((mode) => {
          const isActive = settings.viewMode === mode.value
          const isDisabled = mode.value !== 'all' && !focusedPersonId

          return (
            <button
              key={mode.value}
              onClick={() => handleModeChange(mode.value)}
              disabled={isDisabled}
              className={`
                relative flex flex-col items-center justify-center px-3 py-1.5 rounded transition-colors
                ${isActive ? 'bg-primary text-white' : 'hover:bg-bg-aged text-text-secondary hover:text-text-primary'}
                ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
              `}
              title={`${t(mode.labelKey)}: ${t(mode.descriptionKey)}${isDisabled ? ` (${t('viewModes.selectPersonFirst')})` : ''}`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={mode.icon} />
              </svg>
              <span className="text-xs mt-0.5 font-body">{t(mode.labelKey)}</span>
            </button>
          )
        })}
      </div>

      {!focusedPersonId && (
        <p className="mt-2 px-1 font-body text-xs text-accent">
          {t('viewModes.clickToEnableFiltered')}
        </p>
      )}
    </div>
  )
}
