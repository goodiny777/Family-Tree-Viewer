import { useState, useCallback } from 'react'
import { useStore } from '../../store'
import { Button } from '../ui/Button'
import { Tabs, TabsList, Tab } from '../ui/Tabs'
import { Slider } from '../ui/Slider'
import { Toggle } from '../ui/Toggle'

type ExportFormat = 'png' | 'pdf' | 'svg'
type ExportScope = 'visible' | 'full' | 'selection'

export function ExportDialog() {
  const [format, setFormat] = useState<ExportFormat>('png')
  const [scope, setScope] = useState<ExportScope>('visible')
  const [generationDepth, setGenerationDepth] = useState(5)
  const [includePhotos, setIncludePhotos] = useState(true)
  const [includePopulation, setIncludePopulation] = useState(true)
  const [includeSelection, setIncludeSelection] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const { setExportDialogOpen } = useStore((state) => state.ui)
  const nodes = useStore((state) => state.tree.nodes)

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
      // TODO: Implement actual export logic
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Export with settings:', {
        format,
        scope,
        generationDepth,
        includePhotos,
        includePopulation,
        includeSelection,
      })
      setExportDialogOpen(false)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }, [format, scope, generationDepth, includePhotos, includePopulation, includeSelection, setExportDialogOpen])

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
      <div className="w-full max-w-md rounded-lg bg-white shadow-panel animate-zoom">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-bg-aged px-4 py-3">
          <h2 className="font-display text-h2 text-text-primary">Export Dialog</h2>
          <button
            onClick={() => setExportDialogOpen(false)}
            className="rounded-lg p-1 hover:bg-bg-panel transition-colors"
            aria-label="Close"
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
            <h3 className="mb-3 font-body text-h3 text-text-primary">Scope</h3>
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
                <span className="font-body text-body text-text-primary">Visible area</span>
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
                <span className="font-body text-body text-text-primary">Full tree</span>
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
                <span className="font-body text-body text-text-primary">Current selection</span>
              </label>
            </div>
          </section>

          {/* Generation depth (only for selection scope) */}
          {scope === 'selection' && (
            <section>
              <Slider
                label="Generation depth"
                value={generationDepth}
                min={1}
                max={10}
                step={1}
                onChange={(e) => setGenerationDepth(parseInt(e.target.value))}
                formatValue={(v) => `${v} generations`}
              />
            </section>
          )}

          {/* Options */}
          <section>
            <div className="space-y-3">
              <Toggle
                label="Include photos"
                checked={includePhotos}
                onChange={(e) => setIncludePhotos(e.target.checked)}
              />
              <Toggle
                label="Include population"
                checked={includePopulation}
                onChange={(e) => setIncludePopulation(e.target.checked)}
              />
              <Toggle
                label="Include current selection"
                checked={includeSelection}
                onChange={(e) => setIncludeSelection(e.target.checked)}
              />
            </div>
          </section>

          {/* File size estimate */}
          <div className="rounded-lg bg-bg-panel p-3">
            <p className="font-body text-small text-text-secondary">
              File size estimate: <span className="font-medium">{estimatedSize()} MB</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-bg-aged px-4 py-3">
          <Button variant="secondary" onClick={() => setExportDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} isLoading={isExporting}>
            Export
          </Button>
        </div>
      </div>
    </div>
  )
}
