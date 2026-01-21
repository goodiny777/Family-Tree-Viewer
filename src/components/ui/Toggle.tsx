import { forwardRef, type InputHTMLAttributes } from 'react'

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, description, className = '', id, checked, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <label
        htmlFor={inputId}
        className={`flex cursor-pointer items-start gap-3 ${className}`}
      >
        <div className="relative mt-0.5 flex-shrink-0">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <div
            className="
              h-5 w-9 rounded-full bg-bg-aged transition-colors
              peer-checked:bg-primary
              peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-2
              peer-disabled:cursor-not-allowed peer-disabled:opacity-50
            "
          />
          <div
            className="
              absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform
              peer-checked:translate-x-4
            "
          />
        </div>
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <span className="block font-body text-body font-medium text-text-primary">
                {label}
              </span>
            )}
            {description && (
              <span className="block font-body text-small text-text-muted">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    )
  }
)

Toggle.displayName = 'Toggle'
