import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../../store'
import { Button } from '../ui/Button'
import { Tabs, TabsList, Tab } from '../ui/Tabs'
import { Slider } from '../ui/Slider'
import { Toggle } from '../ui/Toggle'
import { exportTree } from '../../core/export'

type ExportFormat = 'png' | 'pdf' | 'svg'
type ExportScope = 'visible' | 'full' | 'selection'

export function ExportDialog() {
  const { t } = useTranslation()
  const [format, setFormat] = useState<ExportFormat>('png')
  const [scope, setScope] = useState<ExportScope>('visible')
  const [generationDepth, setGenerationDepth] = useState(5)
  const [includePhotos, setIncludePhotos] = useState(true)
  const [includePopulation, setIncludePopulation] = useState(true)
  const [includeSelection, setIncludeSelection] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const { setExportDialogOpen } = useStore((state) => state.ui)
  const nodes = useStore((state) => state.tree.nodes)
  const connections = useStore((state) => state.tree.connections)
  const bounds = useStore((state) => state.tree.bounds)
  const viewport = useStore((state) => state.viewport.viewport)
  const settings = useStore((state) => state.settings.settings)
  const focusedPersonId = useStore((state) => state.selection.selection.focusedPersonId)

  // Estimate file size (rough calculation)
  const estimatedSize = useCallback(() => {
    const nodeCount = scope === 'visible' ? nodes.filter(n => n.isVisible).length : nodes.length
    const baseSize = format === 'png' ? 50 : format === 'pdf' ? 100 : 20 // KB per node
    const size = nodeCount * baseSize / 1000 // MB
    return size.toFixed(2)
  }, [format, scope, nodes])

  const handleExport = useCallback(async () => {
    setIsExporting(true)

    try {
      await exportTree({
        format,
        scope,
        nodes,
        connections,
        bounds,
        settings,
        viewport,
        focusedPersonId,
        fileName: 'family-tree',
      })
      setExportDialogOpen(false)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }, [format, scope, nodes, connections, bounds, settings, viewport, focusedPersonId, setExportDialogOpen])

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setExportDialogOpen(false)
      }
    },
    [setExportDialogOpen]
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md rounded-lg bg-white shadow-panel animate-zoom dark:bg-bg-canvas">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-bg-aged px-4 py-3">
          <h2 className="font-display text-h2 text-text-primary">{t('export.title')}</h2>
          <button
            onClick={() => setExportDialogOpen(false)}
            className="rounded-lg p-1 hover:bg-bg-panel transition-colors"
            aria-label={t('search.close')}
          >
            <svg className="h-5 w-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-4">
          {/* Format tabs */}
          <Tabs value={format} onChange={(v) => setFormat(v as ExportFormat)}>
            <TabsList>
              <Tab value="png">PNG</Tab>
              <Tab value="pdf">PDF</Tab>
              <Tab value="svg">SVG</Tab>
            </TabsList>
          </Tabs>

          {/* Scope */}
          <section>
            <h3 className="mb-3 font-body text-h3 text-text-primary">{t('export.scope')}</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="scope"
                  value="visible"
                  checked={scope === 'visible'}
                  onChange={() => setScope('visible')}
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
                <span className="font-body text-body text-text-primary">{t('export.visibleArea')}</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="scope"
                  value="full"
                  checked={scope === 'full'}
                  onChange={() => setScope('full')}
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
                <span className="font-body text-body text-text-primary">{t('export.fullTree')}</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="scope"
                  value="selection"
                  checked={scope === 'selection'}
                  onChange={() => setScope('selection')}
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
                <span className="font-body text-body text-text-primary">{t('export.currentSelection')}</span>
              </label>
            </div>
          </section>

          {/* Generation depth (only for selection scope) */}
          {scope === 'selection' && (
            <section>
              <Slider
                label={t('export.generationDepth')}
                value={generationDepth}
                min={1}
                max={10}
                step={1}
                onChange={(e) => setGenerationDepth(parseInt(e.target.value))}
                formatValue={(v) => `${v} ${t('export.generations')}`}
              />
            </section>
          )}

          {/* Options */}
          <section>
            <div className="space-y-3">
              <Toggle
                label={t('export.includePhotos')}
                checked={includePhotos}
                onChange={(e) => setIncludePhotos(e.target.checked)}
              />
              <Toggle
                label={t('export.includePopulation')}
                checked={includePopulation}
                onChange={(e) => setIncludePopulation(e.target.checked)}
              />
              <Toggle
                label={t('export.includeCurrentSelection')}
                checked={includeSelection}
                onChange={(e) => setIncludeSelection(e.target.checked)}
              />
            </div>
          </section>

          {/* File size estimate */}
          <div className="rounded-lg bg-bg-panel p-3">
            <p className="font-body text-small text-text-secondary">
              {t('export.fileSizeEstimate')}: <span className="font-medium">{estimatedSize()} MB</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-bg-aged px-4 py-3">
          <Button variant="secondary" onClick={() => setExportDialogOpen(false)}>
            {t('export.cancel')}
          </Button>
          <Button onClick={handleExport} isLoading={isExporting}>
            {t('export.export')}
          </Button>
        </div>
      </div>
    </div>
  )
}
