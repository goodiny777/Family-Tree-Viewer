import { createContext, useContext, type ReactNode } from 'react'

interface TabsContextValue {
  value: string
  onChange: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider')
  }
  return context
}

export interface TabsProps {
  value: string
  onChange: (value: string) => void
  children: ReactNode
  className?: string
}

export function Tabs({ value, onChange, children, className = '' }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export interface TabsListProps {
  children: ReactNode
  className?: string
}

export function TabsList({ children, className = '' }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={`flex gap-1 rounded-lg bg-bg-panel p-1 ${className}`}
    >
      {children}
    </div>
  )
}

export interface TabProps {
  value: string
  children: ReactNode
  className?: string
  disabled?: boolean
}

export function Tab({ value, children, className = '', disabled }: TabProps) {
  const { value: selectedValue, onChange } = useTabsContext()
  const isSelected = selectedValue === value

  return (
    <button
      role="tab"
      aria-selected={isSelected}
      disabled={disabled}
      onClick={() => onChange(value)}
      className={`
        flex-1 rounded-md px-3 py-1.5 font-body text-small font-medium transition-all
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1
        disabled:cursor-not-allowed disabled:opacity-50
        ${isSelected
          ? 'bg-white text-text-primary shadow-sm'
          : 'text-text-secondary hover:text-text-primary'
        }
        ${className}
      `}
    >
      {children}
    </button>
  )
}

export interface TabsPanelProps {
  value: string
  children: ReactNode
  className?: string
}

export function TabsPanel({ value, children, className = '' }: TabsPanelProps) {
  const { value: selectedValue } = useTabsContext()

  if (selectedValue !== value) {
    return null
  }

  return (
    <div role="tabpanel" className={className}>
      {children}
    </div>
  )
}
