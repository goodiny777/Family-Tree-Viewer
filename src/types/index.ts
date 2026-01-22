// Re-export all types
export * from './individual'
export * from './family'
export * from './tree'

/**
 * Complete GEDCOM data structure
 */
import type { Individual } from './individual'
import type { Family } from './family'

export interface GedcomData {
  individuals: Map<string, Individual>
  families: Map<string, Family>
  header?: GedcomHeader
}

export interface GedcomHeader {
  version?: string
  charset?: string
  language?: string
  source?: string
  date?: string
}

/**
 * Recent file metadata for localStorage
 */
export interface RecentFile {
  name: string
  size: number
  lastOpened: number
  individualCount: number
  familyCount: number
}

/**
 * Application settings
 */
export interface AppSettings {
  // Display
  nodeSize: import('./tree').NodeSize
  connectionStyle: import('./tree').ConnectionStyle
  showDates: boolean
  showPlaces: boolean
  showPhotos: boolean
  showIds: boolean

  // Theme
  theme: 'light' | 'dark' | 'system'

  // View
  viewMode: import('./tree').ViewMode
  generationDepth: number
  generationFilterEnabled: boolean

  // Performance
  enableAnimations: boolean

  // Language
  language: string
}

/**
 * Viewport state
 */
export interface ViewportState {
  // Pan offset (in canvas pixels)
  offsetX: number
  offsetY: number

  // Zoom level (0.1 to 4.0, where 1.0 = 100%)
  zoom: number

  // Canvas dimensions
  canvasWidth: number
  canvasHeight: number
}

/**
 * Selection state
 */
export interface SelectionState {
  // Currently focused person (selected, shown in side panel)
  focusedPersonId: string | null

  // Highlighted persons (e.g., during hover, search results)
  highlightedIds: Set<string>

  // Path to root (highlighted ancestors/descendants of focused person)
  focusPathIds: Set<string>
}
