import { useTranslation } from 'react-i18next'
import { useStore } from '../../store'
import { Toggle } from '../ui/Toggle'
import { Tabs, TabsList, Tab } from '../ui/Tabs'
import { supportedLanguages } from '../../i18n'
import type { NodeSize, ConnectionStyle } from '../../types/tree'

export function Settings() {
  const { t } = useTranslation()
  const { settings, setSettings } = useStore((state) => state.settings)

  return (
    <div className="space-y-6 px-1 pb-4">
      {/* Node Size */}
      <section>
        <h3 className="mb-3 font-body text-h3 text-text-primary">{t('settings.nodeSize')}</h3>
        <Tabs
          value={settings.nodeSize}
          onChange={(value) => setSettings({ nodeSize: value as NodeSize })}
        >
          <TabsList>
            <Tab value="compact">{t('settings.compact')}</Tab>
            <Tab value="standard">{t('settings.standard')}</Tab>
            <Tab value="detailed">{t('settings.detailed')}</Tab>
          </TabsList>
        </Tabs>
      </section>

      {/* Display Options */}
      <section>
        <h3 className="mb-3 font-body text-h3 text-text-primary">{t('settings.display')}</h3>
        <div className="space-y-3">
          <Toggle
            label={t('settings.showDates')}
            checked={settings.showDates}
            onChange={(e) => setSettings({ showDates: e.target.checked })}
          />
          <Toggle
            label={t('settings.showPlaces')}
            checked={settings.showPlaces}
            onChange={(e) => setSettings({ showPlaces: e.target.checked })}
          />
          <Toggle
            label={t('settings.showPhotos')}
            checked={settings.showPhotos}
            onChange={(e) => setSettings({ showPhotos: e.target.checked })}
          />
          <Toggle
            label={t('settings.showIds')}
            checked={settings.showIds}
            onChange={(e) => setSettings({ showIds: e.target.checked })}
          />
        </div>
      </section>

      {/* Theme */}
      <section>
        <h3 className="mb-3 font-body text-h3 text-text-primary">{t('settings.theme')}</h3>
        <Tabs
          value={settings.theme}
          onChange={(value) => setSettings({ theme: value as 'light' | 'dark' | 'system' })}
        >
          <TabsList>
            <Tab value="light">{t('settings.light')}</Tab>
            <Tab value="dark">{t('settings.dark')}</Tab>
            <Tab value="system">{t('settings.system')}</Tab>
          </TabsList>
        </Tabs>
      </section>

      {/* Connection Style */}
      <section>
        <h3 className="mb-3 font-body text-h3 text-text-primary">{t('settings.connectionLines')}</h3>
        <Tabs
          value={settings.connectionStyle}
          onChange={(value) => setSettings({ connectionStyle: value as ConnectionStyle })}
        >
          <TabsList>
            <Tab value="curved">{t('settings.curved')}</Tab>
            <Tab value="straight">{t('settings.straight')}</Tab>
            <Tab value="orthogonal">{t('settings.angular')}</Tab>
          </TabsList>
        </Tabs>
      </section>

      {/* Performance */}
      <section>
        <h3 className="mb-3 font-body text-h3 text-text-primary">{t('settings.performance')}</h3>
        <div className="space-y-3">
          <Toggle
            label={t('settings.enableAnimations')}
            description={t('settings.animationsDescription')}
            checked={settings.enableAnimations}
            onChange={(e) => setSettings({ enableAnimations: e.target.checked })}
          />
        </div>
      </section>

      {/* Language */}
      <section>
        <h3 className="mb-3 font-body text-h3 text-text-primary">{t('settings.language')}</h3>
        <select
          value={settings.language}
          onChange={(e) => setSettings({ language: e.target.value })}
          className="w-full rounded-lg border border-accent bg-white px-3 py-2 font-body text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-primary dark:bg-bg-canvas dark:border-text-muted"
        >
          {supportedLanguages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeName}
            </option>
          ))}
        </select>
      </section>
    </div>
  )
}
