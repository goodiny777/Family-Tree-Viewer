import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../../store'
import { parseGedcomFile } from '../../core/gedcom/parser'
import { saveGedcomToStorage } from '../../utils/gedcomStorage'
import { Button } from '../ui/Button'

export function WelcomeScreen() {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const { setGedcomData, setLoading, setError } = useStore((state) => state.gedcom)
  const { addRecentFile } = useStore((state) => state.recentFiles)
  const { setSettingsOverlayOpen, setPrivacyPolicyOpen, setTermsOfServiceOpen } = useStore((state) => state.ui)
  const isLoading = useStore((state) => state.gedcom.isLoading)
  const error = useStore((state) => state.gedcom.error)

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith('.ged')) {
        setError(t('welcome.invalidFile'))
        return
      }

      setLoading(true)
      setError(null)

      try {
        const text = await file.text()
        const data = parseGedcomFile(text)

        // Save to localStorage for persistence across page reloads
        saveGedcomToStorage(text, file.name)

        setGedcomData(data)
        addRecentFile({
          name: file.name,
          size: file.size,
          lastOpened: Date.now(),
          individualCount: data.individuals.size,
          familyCount: data.families.size,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : t('welcome.failedToParse'))
      }
    },
    [setGedcomData, setLoading, setError, addRecentFile, t]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handleOpenFile = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleLoadSample = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/example.ged')
      if (!response.ok) {
        throw new Error(t('welcome.failedToLoad'))
      }
      const text = await response.text()
      const data = parseGedcomFile(text)

      // Note: Sample file is not saved to localStorage - only user files are persisted

      setGedcomData(data)
      addRecentFile({
        name: 'example.ged',
        size: text.length,
        lastOpened: Date.now(),
        individualCount: data.individuals.size,
        familyCount: data.families.size,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : t('welcome.failedToLoad'))
    }
  }, [setGedcomData, setLoading, setError, addRecentFile, t])

  return (
    <div
      className="relative min-h-screen bg-bg-canvas"
      style={{
        backgroundImage: `url('/background.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Top Bar - same style as tree view */}
      <header className="flex items-center justify-between bg-primary/95 px-4 py-2 backdrop-blur-sm">
        {/* Logo and title */}
        <div className="flex items-center gap-3">
          <img src="/gen_to_tree.png" alt="Logo" className="h-8 w-8" />
          <span className="font-display text-lg font-semibold text-white">
            {t('app.name')}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Settings */}
          <button
            onClick={() => setSettingsOverlayOpen(true)}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-white/90 hover:bg-white/10 transition-colors"
            aria-label={t('topBar.settings')}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <span className="text-sm">{t('topBar.settings')}</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-col items-center justify-center px-8 py-12">
        {/* Logo */}
        <img
          src="/gen_to_tree.png"
          alt="FamilyTree View"
          className="mb-8 h-40 w-40 object-contain"
        />

        {/* Title */}
        <h1 className="mb-12 font-display text-4xl font-semibold text-text-primary">
          {t('welcome.title')}
        </h1>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            mb-6 flex w-full max-w-md flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors
            ${isDragging
              ? 'border-primary bg-primary/10'
              : 'border-accent bg-white/50 hover:border-primary hover:bg-white/70'
            }
          `}
        >
          <svg
            className="mb-4 h-12 w-12 text-accent"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
          <p className="mb-1 font-body text-body text-text-primary">
            {t('welcome.dragDrop')}
          </p>
          <p className="font-body text-small text-text-muted">{t('welcome.or')}</p>
          <p className="font-body text-body text-text-secondary">{t('welcome.clickToBrowse')}</p>
        </div>

        {/* Error message */}
        {error && (
          <p className="mb-4 font-body text-body text-semantic-error">{error}</p>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-4">
          <Button onClick={handleOpenFile} disabled={isLoading}>
            {isLoading ? t('welcome.loading') : t('welcome.openFile')}
          </Button>
          <button
            onClick={handleLoadSample}
            disabled={isLoading}
            className="font-body text-body text-accent underline hover:text-accent-dark disabled:opacity-50"
          >
            {t('welcome.loadSample')}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".ged"
          onChange={handleFileSelect}
          className="hidden"
        />

      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 start-0 end-0 flex items-center justify-center gap-8 py-4">
        <button
          onClick={() => setPrivacyPolicyOpen(true)}
          className="font-body text-small text-text-muted hover:text-text-secondary transition-colors"
        >
          {t('footer.privacyPolicy')}
        </button>
        <button
          onClick={() => setTermsOfServiceOpen(true)}
          className="font-body text-small text-text-muted hover:text-text-secondary transition-colors"
        >
          {t('footer.termsOfService')}
        </button>
        <a
          href={`mailto:goodiny777@gmail.com?subject=${encodeURIComponent(t('support.emailSubject'))}&body=${encodeURIComponent(t('support.emailBody'))}`}
          className="font-body text-small text-text-muted hover:text-text-secondary transition-colors"
        >
          {t('footer.support')}
        </a>
      </footer>
    </div>
  )
}
