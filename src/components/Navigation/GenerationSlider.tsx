import { useStore } from '../../store'
import { Slider } from '../ui/Slider'
import { Toggle } from '../ui/Toggle'
import { useState } from 'react'

export function GenerationSlider() {
  const { settings, setSettings } = useStore((state) => state.settings)
  const [isEnabled, setIsEnabled] = useState(false)

  const handleToggle = () => {
    setIsEnabled(!isEnabled)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ generationDepth: parseInt(e.target.value, 10) })
  }

  return (
    <div className="panel p-3 w-44">
      <div className="flex items-center justify-between mb-2">
        <span className="font-body text-small font-medium text-text-primary">
          Generations
        </span>
        <Toggle
          checked={isEnabled}
          onChange={handleToggle}
          aria-label="Enable generation filter"
        />
      </div>

      {isEnabled && (
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setSettings({ generationDepth: Math.max(1, settings.generationDepth - 1) })
            }
            className="btn-icon h-6 w-6 flex items-center justify-center rounded bg-bg-aged hover:bg-accent/20 text-xs"
            aria-label="Decrease generations"
          >
            -
          </button>

          <Slider
            value={settings.generationDepth}
            min={1}
            max={20}
            step={1}
            onChange={handleChange}
            showValue={false}
            className="flex-1"
            aria-label="Generation depth"
          />

          <button
            onClick={() =>
              setSettings({ generationDepth: Math.min(20, settings.generationDepth + 1) })
            }
            className="btn-icon h-6 w-6 flex items-center justify-center rounded bg-bg-aged hover:bg-accent/20 text-xs"
            aria-label="Increase generations"
          >
            +
          </button>

          <span className="w-6 text-center font-body text-small text-text-secondary">
            {settings.generationDepth}
          </span>
        </div>
      )}
    </div>
  )
}
