import { TopBar } from './Navigation/TopBar'
import { FamilyTreeCanvas } from './Canvas/FamilyTreeCanvas'
import { ZoomControls } from './Navigation/ZoomControls'
import { GenerationSlider } from './Navigation/GenerationSlider'
import { Minimap } from './Navigation/Minimap'
import { SidePanel } from './SidePanel/SidePanel'
import { SearchOverlay } from './Search/SearchOverlay'
import { ExportDialog } from './Export/ExportDialog'
import { ShortcutsOverlay } from './Help/ShortcutsOverlay'
import { useStore } from '../store'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'

export function MainView() {
  const isSearchOpen = useStore((state) => state.ui.isSearchOpen)
  const isExportDialogOpen = useStore((state) => state.ui.isExportDialogOpen)
  const isShortcutsOverlayOpen = useStore((state) => state.ui.isShortcutsOverlayOpen)

  // Enable keyboard shortcuts
  useKeyboardShortcuts()

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
