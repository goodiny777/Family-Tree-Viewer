import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../../store'
import { Button } from '../ui/Button'
import { Toggle } from '../ui/Toggle'
import { Tabs, TabsList, Tab } from '../ui/Tabs'
import { supportedLanguages } from '../../i18n'
import type { NodeSize, ConnectionStyle } from '../../types/tree'

export function SettingsOverlay() {
  const { t } = useTranslation()
  const { setSettingsOverlayOpen } = useStore((state) => state.ui)
  const { settings, setSettings } = useStore((state) => state.settings)

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setSettingsOverlayOpen(false)
      }
    },
    [setSettingsOverlayOpen]
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md rounded-lg bg-white shadow-panel animate-zoom dark:bg-bg-canvas max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-bg-aged px-4 py-3">
          <h2 className="font-display text-h2 text-text-primary">{t('sidePanel.settings')}</h2>
          <button
            onClick={() => setSettingsOverlayOpen(false)}
            className="rounded-lg p-1 hover:bg-bg-panel transition-colors"
            aria-label={t('search.close')}
          >
            <svg className="h-5 w-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-4 overflow-y-auto flex-1">
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

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-bg-aged px-4 py-3">
          <Button onClick={() => setSettingsOverlayOpen(false)}>
            {t('export.cancel')}
          </Button>
        </div>
      </div>
    </div>
  )
}
