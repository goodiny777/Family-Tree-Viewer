import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../../store'
import { Button } from '../ui/Button'

export function PrivacyPolicyOverlay() {
  const { t } = useTranslation()
  const { setPrivacyPolicyOpen } = useStore((state) => state.ui)

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setPrivacyPolicyOpen(false)
      }
    },
    [setPrivacyPolicyOpen]
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-panel animate-zoom dark:bg-bg-canvas max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-bg-aged px-6 py-4">
          <h2 className="font-display text-h2 text-text-primary">{t('footer.privacyPolicy')}</h2>
          <button
            onClick={() => setPrivacyPolicyOpen(false)}
            className="rounded-lg p-1 hover:bg-bg-panel transition-colors"
            aria-label={t('search.close')}
          >
            <svg className="h-5 w-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <p className="font-body text-body text-text-secondary">
            {t('privacy.lastUpdated')}: January 2025
          </p>

          <section className="space-y-3">
            <h3 className="font-display text-h3 text-text-primary">{t('privacy.introduction')}</h3>
            <p className="font-body text-body text-text-secondary">
              {t('privacy.introText')}
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-h3 text-text-primary">{t('privacy.dataCollection')}</h3>
            <p className="font-body text-body text-text-secondary">
              {t('privacy.dataCollectionText')}
            </p>
            <ul className="list-disc list-inside space-y-1 font-body text-body text-text-secondary">
              <li>{t('privacy.dataItem1')}</li>
              <li>{t('privacy.dataItem2')}</li>
              <li>{t('privacy.dataItem3')}</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-h3 text-text-primary">{t('privacy.analytics')}</h3>
            <p className="font-body text-body text-text-secondary">
              {t('privacy.analyticsText')}
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-h3 text-text-primary">{t('privacy.localStorage')}</h3>
            <p className="font-body text-body text-text-secondary">
              {t('privacy.localStorageText')}
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-h3 text-text-primary">{t('privacy.noServerStorage')}</h3>
            <p className="font-body text-body text-text-secondary">
              {t('privacy.noServerStorageText')}
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-h3 text-text-primary">{t('privacy.contact')}</h3>
            <p className="font-body text-body text-text-secondary">
              {t('privacy.contactText')}{' '}
              <a href="mailto:goodiny777@gmail.com" className="text-primary hover:underline">
                goodiny777@gmail.com
              </a>
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-bg-aged px-6 py-4">
          <Button onClick={() => setPrivacyPolicyOpen(false)}>
            {t('common.close')}
          </Button>
        </div>
      </div>
    </div>
  )
}
