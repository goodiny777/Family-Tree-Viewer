import { useStore } from '../../store'
import { Toggle } from '../ui/Toggle'
import { Tabs, TabsList, Tab } from '../ui/Tabs'
import type { NodeSize, ConnectionStyle } from '../../types/tree'

export function Settings() {
  const { settings, setSettings } = useStore((state) => state.settings)

  return (
    <div className="space-y-6 px-1 pb-4">
      {/* Node Size */}
      <section>
        <h3 className="mb-3 font-body text-h3 text-text-primary">Node Size</h3>
        <Tabs
          value={settings.nodeSize}
          onChange={(value) => setSettings({ nodeSize: value as NodeSize })}
        >
          <TabsList>
            <Tab value="compact">Compact</Tab>
            <Tab value="standard">Standard</Tab>
            <Tab value="detailed">Detailed</Tab>
          </TabsList>
        </Tabs>
      </section>

      {/* Display Options */}
      <section>
        <h3 className="mb-3 font-body text-h3 text-text-primary">Display</h3>
        <div className="space-y-3">
          <Toggle
            label="Show dates"
            checked={settings.showDates}
            onChange={(e) => setSettings({ showDates: e.target.checked })}
          />
          <Toggle
            label="Show places"
            checked={settings.showPlaces}
            onChange={(e) => setSettings({ showPlaces: e.target.checked })}
          />
          <Toggle
            label="Show photos"
            checked={settings.showPhotos}
            onChange={(e) => setSettings({ showPhotos: e.target.checked })}
          />
          <Toggle
            label="Show IDs"
            checked={settings.showIds}
            onChange={(e) => setSettings({ showIds: e.target.checked })}
          />
        </div>
      </section>

      {/* Theme */}
      <section>
        <h3 className="mb-3 font-body text-h3 text-text-primary">Theme</h3>
        <Tabs
          value={settings.theme}
          onChange={(value) => setSettings({ theme: value as 'light' | 'dark' | 'system' })}
        >
          <TabsList>
            <Tab value="light">Light</Tab>
            <Tab value="dark">Dark</Tab>
            <Tab value="system">System</Tab>
          </TabsList>
        </Tabs>
      </section>

      {/* Connection Style */}
      <section>
        <h3 className="mb-3 font-body text-h3 text-text-primary">Connection Lines</h3>
        <Tabs
          value={settings.connectionStyle}
          onChange={(value) => setSettings({ connectionStyle: value as ConnectionStyle })}
        >
          <TabsList>
            <Tab value="curved">Curved</Tab>
            <Tab value="straight">Straight</Tab>
            <Tab value="orthogonal">Angular</Tab>
          </TabsList>
        </Tabs>
      </section>

      {/* Performance */}
      <section>
        <h3 className="mb-3 font-body text-h3 text-text-primary">Performance</h3>
        <div className="space-y-3">
          <Toggle
            label="Enable animations"
            description="Smooth transitions and micro-interactions"
            checked={settings.enableAnimations}
            onChange={(e) => setSettings({ enableAnimations: e.target.checked })}
          />
        </div>
      </section>

      {/* Language */}
      <section>
        <h3 className="mb-3 font-body text-h3 text-text-primary">Language</h3>
        <select
          value={settings.language}
          onChange={(e) => setSettings({ language: e.target.value })}
          className="w-full rounded-lg border border-accent bg-white px-3 py-2 font-body text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="en">English</option>
          <option value="ru">Русский</option>
        </select>
      </section>
    </div>
  )
}
