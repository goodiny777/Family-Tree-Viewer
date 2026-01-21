import { useStore } from '../../store'
import { Tabs, TabsList, Tab, TabsPanel } from '../ui/Tabs'
import { PersonInfo } from './PersonInfo'
import { Settings } from './Settings'

export function SidePanel() {
  const { isSidePanelOpen, sidePanelTab, setSidePanelTab, toggleSidePanel } = useStore(
    (state) => state.ui
  )

  return (
    <>
      {/* Toggle button (always visible) */}
      <button
        onClick={toggleSidePanel}
        className="absolute top-16 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-lg bg-bg-panel shadow-panel hover:bg-bg-aged transition-colors"
        aria-label={isSidePanelOpen ? 'Close side panel' : 'Open side panel'}
      >
        <svg
          className={`h-5 w-5 text-text-primary transition-transform ${isSidePanelOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Side panel */}
      <aside
        className={`
          absolute top-12 right-0 bottom-0 w-80 bg-bg-panel shadow-panel transition-transform duration-250 ease-out z-20
          ${isSidePanelOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex h-full flex-col">
          {/* Tabs */}
          <Tabs
            value={sidePanelTab}
            onChange={(value) => setSidePanelTab(value as 'info' | 'settings')}
            className="p-3"
          >
            <TabsList>
              <Tab value="info">Person Info</Tab>
              <Tab value="settings">Settings</Tab>
            </TabsList>

            <TabsPanel value="info" className="mt-4">
              <PersonInfo />
            </TabsPanel>

            <TabsPanel value="settings" className="mt-4">
              <Settings />
            </TabsPanel>
          </Tabs>
        </div>
      </aside>
    </>
  )
}
