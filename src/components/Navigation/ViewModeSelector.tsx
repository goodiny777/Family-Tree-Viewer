import { useStore } from '../../store'
import type { ViewMode } from '../../types'

const VIEW_MODES: Array<{ value: ViewMode; label: string; icon: string; description: string }> = [
  {
    value: 'all',
    label: 'All',
    // Grid/all icon
    icon: 'M4 5h4v4H4V5zm6 0h4v4h-4V5zm6 0h4v4h-4V5zM4 11h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z',
    description: 'Show everyone',
  },
  {
    value: 'family',
    label: 'Family',
    // Family/people icon
    icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
    description: 'Immediate family',
  },
  {
    value: 'hourglass',
    label: 'Hourglass',
    // Hourglass icon
    icon: 'M5 4h14v2a7 7 0 01-7 7v0a7 7 0 01-7-7V4zm0 16h14v-2a7 7 0 00-7-7v0a7 7 0 00-7 7v2zm7-9v2',
    description: 'Ancestors & descendants',
  },
  {
    value: 'pedigree',
    label: 'Pedigree',
    // Tree/pedigree icon (upward pointing)
    icon: 'M12 3v10m0 0l-4-4m4 4l4-4M8 17h8M12 17v4',
    description: 'Ancestors only',
  },
]

export function ViewModeSelector() {
  const settings = useStore((state) => state.settings.settings)
  const setSettings = useStore((state) => state.settings.setSettings)
  const focusedPersonId = useStore((state) => state.selection.selection.focusedPersonId)

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
              title={`${mode.label}: ${mode.description}${isDisabled ? ' (select a person first)' : ''}`}
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
              <span className="text-xs mt-0.5 font-body">{mode.label}</span>
            </button>
          )
        })}
      </div>

      {!focusedPersonId && (
        <p className="mt-2 px-1 font-body text-xs text-accent">
          Click a person to enable filtered views
        </p>
      )}
    </div>
  )
}
