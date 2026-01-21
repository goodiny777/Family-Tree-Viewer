import { forwardRef, type InputHTMLAttributes } from 'react'

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  showValue?: boolean
  formatValue?: (value: number) => string
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      label,
      showValue = true,
      formatValue = (v) => String(v),
      className = '',
      id,
      value,
      min = 0,
      max = 100,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    const currentValue = typeof value === 'number' ? value : Number(value) || 0

    return (
      <div className={`w-full ${className}`}>
        {(label || showValue) && (
          <div className="mb-2 flex items-center justify-between">
            {label && (
              <label
                htmlFor={inputId}
                className="font-body text-small font-medium text-text-primary"
              >
                {label}
              </label>
            )}
            {showValue && (
              <span className="font-body text-small text-text-secondary">
                {formatValue(currentValue)}
              </span>
            )}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type="range"
          value={value}
          min={min}
          max={max}
          className="
            h-2 w-full cursor-pointer appearance-none rounded-full bg-bg-aged
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-primary
            [&::-webkit-slider-thumb]:transition-all
            [&::-webkit-slider-thumb]:hover:bg-primary-dark
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:bg-primary
            [&::-moz-range-thumb]:transition-all
            [&::-moz-range-thumb]:hover:bg-primary-dark
          "
          {...props}
        />
      </div>
    )
  }
)

Slider.displayName = 'Slider'
