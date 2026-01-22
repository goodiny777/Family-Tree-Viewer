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
import { MobileNavBar, MobileFloatingControls, MobileViewModeSheet } from './Mobile'
import { useStore } from '../store'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { useTreeLayout } from '../hooks/useTreeLayout'
import { useIsMobile } from '../hooks/useIsMobile'

export function MainView() {
  const isSearchOpen = useStore((state) => state.ui.isSearchOpen)
  const isExportDialogOpen = useStore((state) => state.ui.isExportDialogOpen)
  const isShortcutsOverlayOpen = useStore((state) => state.ui.isShortcutsOverlayOpen)
  const { isMobile } = useIsMobile()

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

      {/* Desktop controls - hidden on mobile */}
      {!isMobile && (
        <div className="absolute bottom-6 left-6 flex flex-col gap-4">
          <ZoomControls />
          <GenerationSlider />
          <ViewModeSelector />
          <Minimap />
        </div>
      )}

      {/* Mobile navigation */}
      {isMobile && (
        <>
          <MobileFloatingControls />
          <MobileNavBar />
          <MobileViewModeSheet />
        </>
      )}

      {/* Side panel */}
      <SidePanel />

      {/* Overlays */}
      {isSearchOpen && <SearchOverlay />}
      {isExportDialogOpen && <ExportDialog />}
      {isShortcutsOverlayOpen && <ShortcutsOverlay />}
    </div>
  )
}
