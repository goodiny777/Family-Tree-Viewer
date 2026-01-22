import { useStore } from '../../store'
import { Tabs, TabsList, Tab, TabsPanel } from '../ui/Tabs'
import { PersonInfo } from './PersonInfo'
import { Settings } from './Settings'

export function SidePanel() {
  const { isSidePanelOpen, sidePanelTab, setSidePanelTab, setSidePanelOpen } = useStore(
    (state) => state.ui
  )

  const handleClose = () => {
    setSidePanelOpen(false)
  }

  return (
    <aside
        className={`
          absolute top-12 right-0 bottom-0 w-80 bg-bg-panel shadow-panel transition-transform duration-250 ease-out z-20
          ${isSidePanelOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex h-full flex-col">
          {/* Close button in top-left corner */}
          <button
            onClick={handleClose}
            className="absolute top-3 left-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-bg-aged/50 hover:bg-bg-aged transition-colors"
            aria-label="Close side panel"
          >
            <svg
              className="h-5 w-5 text-text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Tabs */}
          <Tabs
            value={sidePanelTab}
            onChange={(value) => setSidePanelTab(value as 'info' | 'settings')}
            className="p-3 pt-12 flex-1 flex flex-col min-h-0"
          >
            <TabsList>
              <Tab value="info">Person Info</Tab>
              <Tab value="settings">Settings</Tab>
            </TabsList>

            <TabsPanel value="info" className="mt-4 flex-1 overflow-y-auto min-h-0 scrollbar-thin">
              <PersonInfo />
            </TabsPanel>

            <TabsPanel value="settings" className="mt-4 flex-1 overflow-y-auto min-h-0 scrollbar-thin">
              <Settings />
            </TabsPanel>
          </Tabs>
        </div>
    </aside>
  )
}
