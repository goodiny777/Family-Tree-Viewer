import { useTranslation } from 'react-i18next'
import { useStore } from '../../store'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  action: () => void
  isActive?: boolean
}

export function MobileNavBar() {
  const { t } = useTranslation()
  const { setSearchOpen, setSidePanelTab, setSidePanelOpen, isSidePanelOpen, sidePanelTab } = useStore(
    (state) => state.ui
  )
  const focusedPersonId = useStore((state) => state.selection.selection.focusedPersonId)

  const navItems: NavItem[] = [
    {
      id: 'search',
      label: t('topBar.search'),
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
      action: () => setSearchOpen(true),
    },
    {
      id: 'person',
      label: t('sidePanel.personInfo'),
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      action: () => {
        setSidePanelTab('info')
        setSidePanelOpen(true)
      },
      isActive: isSidePanelOpen && sidePanelTab === 'info',
    },
    {
      id: 'view',
      label: t('viewModes.title'),
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
      action: () => {
        // Will be handled by MobileViewModeSheet
        const event = new CustomEvent('openMobileViewMode')
        window.dispatchEvent(event)
      },
    },
    {
      id: 'settings',
      label: t('topBar.settings'),
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      action: () => {
        setSidePanelTab('settings')
        setSidePanelOpen(true)
      },
      isActive: isSidePanelOpen && sidePanelTab === 'settings',
    },
  ]

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 bg-bg-panel border-t border-accent/20"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={item.action}
            className={`
              flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors
              ${item.isActive ? 'text-primary bg-primary/10' : 'text-text-secondary hover:text-text-primary'}
              ${item.id === 'person' && !focusedPersonId ? 'opacity-50' : ''}
            `}
            disabled={item.id === 'person' && !focusedPersonId}
          >
            {item.icon}
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
