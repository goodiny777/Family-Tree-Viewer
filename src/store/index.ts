import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type {
  GedcomData,
  AppSettings,
  ViewportState,
  SelectionState,
  TreeNode,
  Connection,
  TreeBounds,
  RecentFile,
  LevelBand,
} from '../types'

/**
 * GEDCOM data slice
 */
interface GedcomSlice {
  data: GedcomData | null
  hasData: boolean
  isLoading: boolean
  error: string | null

  // Actions
  setGedcomData: (data: GedcomData) => void
  clearGedcomData: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

/**
 * Tree layout slice
 */
interface TreeSlice {
  nodes: TreeNode[]
  connections: Connection[]
  bounds: TreeBounds
  generationCount: number
  levelBands: LevelBand[]

  // Actions
  setLayout: (nodes: TreeNode[], connections: Connection[], bounds: TreeBounds, generationCount: number, levelBands: LevelBand[]) => void
  clearLayout: () => void
}

/**
 * Viewport slice
 */
interface ViewportSlice {
  viewport: ViewportState

  // Actions
  setViewport: (viewport: Partial<ViewportState>) => void
  pan: (deltaX: number, deltaY: number) => void
  zoom: (newZoom: number, focalX?: number, focalY?: number) => void
  fitToScreen: () => void
  centerOnNode: (nodeId: string) => void
}

/**
 * Selection slice
 */
interface SelectionSlice {
  selection: SelectionState
  expandedFamilyIds: Set<string>

  // Actions
  setFocusedPerson: (personId: string | null) => void
  setHighlightedIds: (ids: Set<string>) => void
  addHighlightedId: (id: string) => void
  removeHighlightedId: (id: string) => void
  clearHighlights: () => void
  toggleFamilyExpansion: (personId: string) => void
  clearFamilyExpansions: () => void
}

/**
 * Settings slice
 */
interface SettingsSlice {
  settings: AppSettings

  // Actions
  setSettings: (settings: Partial<AppSettings>) => void
  resetSettings: () => void
}

/**
 * Recent files slice
 */
interface RecentFilesSlice {
  recentFiles: RecentFile[]

  // Actions
  addRecentFile: (file: RecentFile) => void
  removeRecentFile: (name: string) => void
  clearRecentFiles: () => void
}

/**
 * UI state slice
 */
interface UISlice {
  isSidePanelOpen: boolean
  sidePanelTab: 'info' | 'settings'
  isSearchOpen: boolean
  isExportDialogOpen: boolean
  isShortcutsOverlayOpen: boolean

  // Actions
  toggleSidePanel: () => void
  setSidePanelOpen: (open: boolean) => void
  setSidePanelTab: (tab: 'info' | 'settings') => void
  setSearchOpen: (open: boolean) => void
  setExportDialogOpen: (open: boolean) => void
  setShortcutsOverlayOpen: (open: boolean) => void
}

/**
 * Combined store type
 */
type StoreState = {
  gedcom: GedcomSlice
  tree: TreeSlice
  viewport: ViewportSlice
  selection: SelectionSlice
  settings: SettingsSlice
  recentFiles: RecentFilesSlice
  ui: UISlice
}

/**
 * Default settings
 */
const DEFAULT_SETTINGS: AppSettings = {
  nodeSize: 'standard',
  connectionStyle: 'curved',
  showDates: true,
  showPlaces: true,
  showPhotos: true,
  showIds: false,
  theme: 'light',
  viewMode: 'all',
  generationDepth: 10,
  generationFilterEnabled: false,
  enableAnimations: true,
  language: 'en',
}

/**
 * Default viewport
 */
const DEFAULT_VIEWPORT: ViewportState = {
  offsetX: 0,
  offsetY: 0,
  zoom: 1,
  canvasWidth: 0,
  canvasHeight: 0,
}

/**
 * Default selection
 */
const DEFAULT_SELECTION: SelectionState = {
  focusedPersonId: null,
  highlightedIds: new Set(),
  focusPathIds: new Set(),
}

/**
 * Default tree bounds
 */
const DEFAULT_BOUNDS: TreeBounds = {
  minX: 0,
  maxX: 0,
  minY: 0,
  maxY: 0,
  width: 0,
  height: 0,
}

/**
 * Main application store
 */
export const useStore = create<StoreState>()(
  devtools(
    persist(
      (set, get) => ({
        // GEDCOM slice
        gedcom: {
          data: null,
          hasData: false,
          isLoading: false,
          error: null,

          setGedcomData: (data) =>
            set((state) => ({
              gedcom: { ...state.gedcom, data, hasData: true, error: null },
            })),

          clearGedcomData: () =>
            set((state) => ({
              gedcom: { ...state.gedcom, data: null, hasData: false },
              tree: { ...state.tree, nodes: [], connections: [], bounds: DEFAULT_BOUNDS, generationCount: 0 },
              selection: { ...state.selection, selection: DEFAULT_SELECTION },
            })),

          setLoading: (loading) =>
            set((state) => ({
              gedcom: { ...state.gedcom, isLoading: loading },
            })),

          setError: (error) =>
            set((state) => ({
              gedcom: { ...state.gedcom, error, isLoading: false },
            })),
        },

        // Tree slice
        tree: {
          nodes: [],
          connections: [],
          bounds: DEFAULT_BOUNDS,
          generationCount: 0,
          levelBands: [],

          setLayout: (nodes, connections, bounds, generationCount, levelBands) =>
            set((state) => ({
              tree: { ...state.tree, nodes, connections, bounds, generationCount, levelBands },
            })),

          clearLayout: () =>
            set((state) => ({
              tree: { ...state.tree, nodes: [], connections: [], bounds: DEFAULT_BOUNDS, generationCount: 0, levelBands: [] },
            })),
        },

        // Viewport slice
        viewport: {
          viewport: DEFAULT_VIEWPORT,

          setViewport: (viewport) =>
            set((state) => ({
              viewport: { ...state.viewport, viewport: { ...state.viewport.viewport, ...viewport } },
            })),

          pan: (deltaX, deltaY) =>
            set((state) => ({
              viewport: {
                ...state.viewport,
                viewport: {
                  ...state.viewport.viewport,
                  offsetX: state.viewport.viewport.offsetX + deltaX,
                  offsetY: state.viewport.viewport.offsetY + deltaY,
                },
              },
            })),

          zoom: (newZoom, focalX, focalY) => {
            const { viewport } = get().viewport
            const clampedZoom = Math.max(0.1, Math.min(4, newZoom))

            if (focalX !== undefined && focalY !== undefined) {
              // Zoom towards focal point
              const zoomRatio = clampedZoom / viewport.zoom
              const newOffsetX = focalX - (focalX - viewport.offsetX) * zoomRatio
              const newOffsetY = focalY - (focalY - viewport.offsetY) * zoomRatio

              set((state) => ({
                viewport: {
                  ...state.viewport,
                  viewport: {
                    ...state.viewport.viewport,
                    zoom: clampedZoom,
                    offsetX: newOffsetX,
                    offsetY: newOffsetY,
                  },
                },
              }))
            } else {
              set((state) => ({
                viewport: {
                  ...state.viewport,
                  viewport: { ...state.viewport.viewport, zoom: clampedZoom },
                },
              }))
            }
          },

          fitToScreen: () => {
            const { bounds } = get().tree
            const { viewport } = get().viewport

            if (bounds.width === 0 || bounds.height === 0) return

            const padding = 50
            const availableWidth = viewport.canvasWidth - padding * 2
            const availableHeight = viewport.canvasHeight - padding * 2

            const scaleX = availableWidth / bounds.width
            const scaleY = availableHeight / bounds.height
            const newZoom = Math.max(0.1, Math.min(4, Math.min(scaleX, scaleY)))

            const centerX = (bounds.minX + bounds.maxX) / 2
            const centerY = (bounds.minY + bounds.maxY) / 2

            const newOffsetX = viewport.canvasWidth / 2 - centerX * newZoom
            const newOffsetY = viewport.canvasHeight / 2 - centerY * newZoom

            set((state) => ({
              viewport: {
                ...state.viewport,
                viewport: {
                  ...state.viewport.viewport,
                  zoom: newZoom,
                  offsetX: newOffsetX,
                  offsetY: newOffsetY,
                },
              },
            }))
          },

          centerOnNode: (nodeId) => {
            const { nodes } = get().tree
            const { viewport } = get().viewport
            const node = nodes.find((n) => n.id === nodeId)

            if (!node) return

            const newOffsetX = viewport.canvasWidth / 2 - node.x * viewport.zoom
            const newOffsetY = viewport.canvasHeight / 2 - node.y * viewport.zoom

            set((state) => ({
              viewport: {
                ...state.viewport,
                viewport: {
                  ...state.viewport.viewport,
                  offsetX: newOffsetX,
                  offsetY: newOffsetY,
                },
              },
            }))
          },
        },

        // Selection slice
        selection: {
          selection: DEFAULT_SELECTION,
          expandedFamilyIds: new Set<string>(),

          setFocusedPerson: (personId) =>
            set((state) => ({
              selection: {
                ...state.selection,
                selection: { ...state.selection.selection, focusedPersonId: personId },
              },
              ui: personId
                ? { ...state.ui, isSidePanelOpen: true, sidePanelTab: 'info' }
                : state.ui,
            })),

          setHighlightedIds: (ids) =>
            set((state) => ({
              selection: {
                ...state.selection,
                selection: { ...state.selection.selection, highlightedIds: ids },
              },
            })),

          addHighlightedId: (id) =>
            set((state) => {
              const newIds = new Set(state.selection.selection.highlightedIds)
              newIds.add(id)
              return {
                selection: {
                  ...state.selection,
                  selection: { ...state.selection.selection, highlightedIds: newIds },
                },
              }
            }),

          removeHighlightedId: (id) =>
            set((state) => {
              const newIds = new Set(state.selection.selection.highlightedIds)
              newIds.delete(id)
              return {
                selection: {
                  ...state.selection,
                  selection: { ...state.selection.selection, highlightedIds: newIds },
                },
              }
            }),

          clearHighlights: () =>
            set((state) => ({
              selection: {
                ...state.selection,
                selection: { ...state.selection.selection, highlightedIds: new Set() },
              },
            })),

          toggleFamilyExpansion: (personId) =>
            set((state) => {
              const newIds = new Set(state.selection.expandedFamilyIds)
              if (newIds.has(personId)) {
                newIds.delete(personId)
              } else {
                // Clear previous expansions and add new one (only one expanded at a time)
                newIds.clear()
                newIds.add(personId)
              }
              return {
                selection: {
                  ...state.selection,
                  expandedFamilyIds: newIds,
                },
              }
            }),

          clearFamilyExpansions: () =>
            set((state) => ({
              selection: {
                ...state.selection,
                expandedFamilyIds: new Set<string>(),
              },
            })),
        },

        // Settings slice
        settings: {
          settings: DEFAULT_SETTINGS,

          setSettings: (newSettings) =>
            set((state) => ({
              settings: {
                ...state.settings,
                settings: { ...state.settings.settings, ...newSettings },
              },
            })),

          resetSettings: () =>
            set((state) => ({
              settings: { ...state.settings, settings: DEFAULT_SETTINGS },
            })),
        },

        // Recent files slice
        recentFiles: {
          recentFiles: [],

          addRecentFile: (file) =>
            set((state) => {
              const filtered = state.recentFiles.recentFiles.filter(
                (f) => f.name !== file.name
              )
              return {
                recentFiles: {
                  ...state.recentFiles,
                  recentFiles: [file, ...filtered].slice(0, 10),
                },
              }
            }),

          removeRecentFile: (name) =>
            set((state) => ({
              recentFiles: {
                ...state.recentFiles,
                recentFiles: state.recentFiles.recentFiles.filter((f) => f.name !== name),
              },
            })),

          clearRecentFiles: () =>
            set((state) => ({
              recentFiles: { ...state.recentFiles, recentFiles: [] },
            })),
        },

        // UI slice
        ui: {
          isSidePanelOpen: false,
          sidePanelTab: 'info',
          isSearchOpen: false,
          isExportDialogOpen: false,
          isShortcutsOverlayOpen: false,

          toggleSidePanel: () =>
            set((state) => {
              const willClose = state.ui.isSidePanelOpen
              return {
                ui: { ...state.ui, isSidePanelOpen: !state.ui.isSidePanelOpen },
                // Clear focused person when closing the sidebar
                selection: willClose
                  ? {
                      ...state.selection,
                      selection: { ...state.selection.selection, focusedPersonId: null },
                    }
                  : state.selection,
              }
            }),

          setSidePanelOpen: (open) =>
            set((state) => ({
              ui: { ...state.ui, isSidePanelOpen: open },
              // Clear focused person when closing the sidebar
              selection: !open
                ? {
                    ...state.selection,
                    selection: { ...state.selection.selection, focusedPersonId: null },
                  }
                : state.selection,
            })),

          setSidePanelTab: (tab) =>
            set((state) => ({
              ui: { ...state.ui, sidePanelTab: tab, isSidePanelOpen: true },
            })),

          setSearchOpen: (open) =>
            set((state) => ({
              ui: { ...state.ui, isSearchOpen: open },
            })),

          setExportDialogOpen: (open) =>
            set((state) => ({
              ui: { ...state.ui, isExportDialogOpen: open },
            })),

          setShortcutsOverlayOpen: (open) =>
            set((state) => ({
              ui: { ...state.ui, isShortcutsOverlayOpen: open },
            })),
        },
      }),
      {
        name: 'familytree-storage',
        partialize: (state) => ({
          // Only persist data, not functions (functions can't be serialized)
          settings: { settings: state.settings.settings },
          recentFiles: { recentFiles: state.recentFiles.recentFiles },
        }),
        merge: (persistedState, currentState) => {
          const persisted = persistedState as Partial<StoreState> | undefined
          return {
            ...currentState,
            settings: {
              ...currentState.settings,
              settings: persisted?.settings?.settings ?? currentState.settings.settings,
            },
            recentFiles: {
              ...currentState.recentFiles,
              recentFiles: persisted?.recentFiles?.recentFiles ?? currentState.recentFiles.recentFiles,
            },
          }
        },
      }
    )
  )
)

// Selectors for common operations
export const selectIndividual = (id: string) => (state: StoreState) =>
  state.gedcom.data?.individuals.get(id)

export const selectFamily = (id: string) => (state: StoreState) =>
  state.gedcom.data?.families.get(id)

export const selectFocusedPerson = (state: StoreState) => {
  const id = state.selection.selection.focusedPersonId
  return id ? state.gedcom.data?.individuals.get(id) : null
}

export const selectVisibleNodes = (state: StoreState) =>
  state.tree.nodes.filter((node) => node.isVisible)

export const selectNodeById = (id: string) => (state: StoreState) =>
  state.tree.nodes.find((node) => node.id === id)
