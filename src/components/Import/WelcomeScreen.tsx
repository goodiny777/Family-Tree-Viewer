import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../../store'
import { parseGedcomFile } from '../../core/gedcom/parser'
import { Button } from '../ui/Button'

export function WelcomeScreen() {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const { setGedcomData, setLoading, setError } = useStore((state) => state.gedcom)
  const { addRecentFile } = useStore((state) => state.recentFiles)
  const recentFiles = useStore((state) => state.recentFiles.recentFiles)
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
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-3">
          <img src="/gen_to_tree.png" alt="FamilyTree View Logo" className="h-10 w-10" />
          <span className="font-display text-h2 text-text-primary">{t('app.name')}</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="font-body text-body text-text-secondary hover:text-text-primary">
            {t('nav.home')}
          </a>
          <a href="#" className="font-body text-body text-text-secondary hover:text-text-primary">
            {t('nav.features')}
          </a>
          <a href="#" className="font-body text-body text-text-secondary hover:text-text-primary">
            {t('nav.about')}
          </a>
          <a href="#" className="font-body text-body text-text-secondary hover:text-text-primary">
            {t('nav.contact')}
          </a>
        </div>
      </nav>

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

        {/* Recent files */}
        {recentFiles.length > 0 && (
          <div className="absolute bottom-8 end-8">
            <details className="group">
              <summary className="flex cursor-pointer items-center gap-2 rounded-lg bg-bg-panel px-4 py-2 font-body text-small text-text-secondary hover:bg-bg-aged">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
                {t('welcome.recentFiles')}
              </summary>
              <ul className="absolute bottom-full end-0 mb-2 w-64 rounded-lg bg-white shadow-panel">
                {recentFiles.map((file) => (
                  <li key={file.name}>
                    <button
                      className="w-full px-4 py-2 text-start font-body text-small text-text-primary hover:bg-bg-panel"
                      onClick={() => {
                        // Re-import would require storing file content, for now just show info
                        console.log('Re-open:', file.name)
                      }}
                    >
                      <span className="block truncate font-medium">{file.name}</span>
                      <span className="text-text-muted">
                        {file.individualCount} {t('welcome.people')}, {file.familyCount} {t('welcome.families')}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 start-0 end-0 flex items-center justify-center gap-8 py-4">
        <a href="#" className="font-body text-small text-text-muted hover:text-text-secondary">
          {t('footer.privacyPolicy')}
        </a>
        <a href="#" className="font-body text-small text-text-muted hover:text-text-secondary">
          {t('footer.termsOfService')}
        </a>
        <a href="#" className="font-body text-small text-text-muted hover:text-text-secondary">
          {t('footer.support')}
        </a>
      </footer>
    </div>
  )
}
