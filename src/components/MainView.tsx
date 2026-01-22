import { TopBar } from './Navigation/TopBar'
import { FamilyTreeCanvas } from './Canvas/FamilyTreeCanvas'
import { ZoomControls } from './Navigation/ZoomControls'
import { GenerationSlider } from './Navigation/GenerationSlider'
import { ViewModeSelector } from './Navigation/ViewModeSelector'
import { Minimap } from './Navigation/Minimap'
import { SidePanel } from './SidePanel/SidePanel'
import { SearchOverlay } from './Search/SearchOverlay'
import { ExportDialog } from './Export/ExportDialog'
import { ShortcutsOverlay } from './Help/ShortcutsOverlay'
import { useStore } from '../store'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { useTreeLayout } from '../hooks/useTreeLayout'

export function MainView() {
  const isSearchOpen = useStore((state) => state.ui.isSearchOpen)
  const isExportDialogOpen = useStore((state) => state.ui.isExportDialogOpen)
  const isShortcutsOverlayOpen = useStore((state) => state.ui.isShortcutsOverlayOpen)

  // Enable keyboard shortcuts
  useKeyboardShortcuts()

  // Generate layout when data changes
  useTreeLayout()

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Top navigation bar */}
      <TopBar />

      {/* Main canvas */}
      <FamilyTreeCanvas />

      {/* Bottom-left controls */}
      <div className="absolute bottom-6 left-6 flex flex-col gap-4">
        <ZoomControls />
        <GenerationSlider />
        <ViewModeSelector />
        <Minimap />
      </div>

      {/* Side panel */}
      <SidePanel />

      {/* Overlays */}
      {isSearchOpen && <SearchOverlay />}
      {isExportDialogOpen && <ExportDialog />}
      {isShortcutsOverlayOpen && <ShortcutsOverlay />}
    </div>
  )
}
