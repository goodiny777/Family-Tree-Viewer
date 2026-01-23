# Changelog

All notable changes to FamilyTree View will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### Mobile View Support

**Responsive Layout**
- Added mobile breakpoint detection via `useIsMobile` hook (768px threshold)
- Implemented touch gesture support: single finger pan, two finger pinch-to-zoom
- Added safe area support for notched devices (iPhone X+)

**Mobile-Specific Components**
- `BottomSheet` - Full-screen drawer from bottom with swipe-to-close gesture
- `MobileNavBar` - Bottom navigation bar (Search, Person, View, Settings)
- `MobileFloatingControls` - Floating zoom buttons positioned on right side
- `MobileViewModeSheet` - View mode selector and generation slider in bottom sheet

**Layout Differences**
- Side panel replaced with full-screen bottom sheet on mobile
- TopBar buttons show icons only (no text labels)
- Minimap hidden on mobile
- Keyboard shortcut hints hidden on mobile

#### GEDCOM Data Persistence

**Auto-Save & Restore**
- User-uploaded GEDCOM files are cached to localStorage when loaded
- On page refresh or revisit, cached data is automatically restored
- Tree view displays immediately without requiring file re-upload
- Cache is cleared when user explicitly closes the tree (via Import button)
- Sample file (`example.ged`) is NOT cached - it's for demo purposes only

**Implementation**
- Added `gedcomStorage.ts` utility for localStorage operations
- Modified `useInitialization` hook to restore cached data on app start
- Updated store's `clearGedcomData` to also clear the localStorage cache

### Fixed

#### Google Analytics

**Data Collection Not Working**
- Fixed gtag function implementation that prevented analytics data from being sent
- Changed from spread operator `(...args)` to `arguments` object as required by Google Tag Manager
- Analytics events and page views now correctly sent to Google Analytics

#### Mobile View Fixes

**Missing View Mode Title**
- Added missing `viewModes.title` translation key to all locale files (en, ru, he, es)
- Fixed translation key reference from `viewMode.title` to `viewModes.title` in MobileViewModeSheet and MobileNavBar

**Generation Slider Range**
- Fixed generation slider to show full range from 1 to actual tree generation count
- Removed hardcoded minimum of 5 generations that was limiting the slider range
- Fixed generation count calculation to use ALL individuals, not just filtered ones
- Slider now correctly shows total generations even when filter is enabled

#### Pedigree & Hourglass View Improvements

**Disconnected Spouse Nodes**
- Fixed issue where spouses of ancestors appeared as disconnected nodes without connection lines
- Spouses are now only shown if they have at least one visible child in the tree
- Implemented `addSpousesWithConnections()` function to filter spouses based on visible connections

**Pedigree View Ancestor Display**
- Pedigree view now shows all connected ancestors without generation depth limits
- Generation depth filter no longer cuts off distant ancestors in pedigree view
- Hourglass view still applies symmetric generation limits as before

**Node Overlap Prevention**
- Added collision detection pass to prevent overlapping nodes at the same generation level
- After parent-centering, nodes are pushed apart if they overlap (minimum spacing enforced)
- Level is re-centered after collision resolution to minimize drift from parent-child alignment
- Particularly improves display of upper generations in pedigree view where ancestor tree converges

**Null Safety**
- Added safety checks for `getBirthYear()` calls to handle cases where individuals might not exist in filtered data
- Prevents runtime errors when sorting nodes by birth year

## [0.1.0] - 2026-01-21

### Added

#### Phase 1: Project Setup & Foundation

**Project Initialization**
- Initialized Vite 6 + React 18 + TypeScript project
- Configured Tailwind CSS 3.4 with custom design tokens matching the designer brief
- Added Google Fonts: Playfair Display (headers) + Source Sans 3 (body)
- Set up Zustand 4.5 for state management with persisted settings
- Configured ESLint 9 + Prettier for code quality
- Set up Vitest for unit testing with React Testing Library

**Design System**
- Created comprehensive CSS variables for all color tokens:
  - Primary colors (Oak Leaf palette: #5D6B4D, #3A4A35, #7A8B6A)
  - Accent colors (Branch Brown palette: #8B7355, #6B5344, #A08B70)
  - Background colors (Parchment palette: #F5EFE0, #E8DCC8, #D4C4A8)
  - Node colors (Male: blue tones, Female: pink tones, with deceased variants)
  - Semantic colors (error, focus, highlight)
- Created typography scale matching the brief specifications
- Added dark theme CSS variables

**Core Infrastructure**
- Defined TypeScript types for:
  - `Individual` - Person records with full GEDCOM field support
  - `Family` - Family relationships (spouses, children)
  - `TreeNode` - Layout nodes for canvas rendering
  - `Connection` - Relationship lines between nodes
  - `AppSettings` - User preferences
  - `ViewportState` - Pan/zoom state
  - `SelectionState` - Focus and highlight tracking

**State Management (Zustand)**
- `gedcomSlice` - GEDCOM data and loading state
- `treeSlice` - Layout nodes and connections
- `viewportSlice` - Pan, zoom, fit-to-screen, center-on-node
- `selectionSlice` - Focus and highlight management
- `settingsSlice` - User preferences with localStorage persistence
- `recentFilesSlice` - Recent file history
- `uiSlice` - Panel visibility, overlays, dialogs

**UI Components**
- `Button` - Primary, secondary, ghost variants with loading state
- `Input` - Text input with label, error, and icons
- `Slider` - Range input with value display
- `Toggle` - Switch component with label and description
- `Tabs` - Tab navigation with TabsList, Tab, TabsPanel

**GEDCOM Parser**
- Full GEDCOM 5.5.1 parser using `parse-gedcom` library
- Supports all individual tags: NAME, SEX, BIRT, DEAT, BURI, RESI, OCCU, EDUC, etc.
- Supports family tags: HUSB, WIFE, CHIL, MARR, DIV
- Date parsing for various GEDCOM date formats
- Address structure parsing
- Unit tests for parser validation

**Canvas Rendering**
- `CanvasRenderer` class with 60fps render loop
- Viewport transformation (pan + zoom)
- Node rendering with 3 sizes (compact, standard, detailed)
- Gender-based coloring (male blue, female pink)
- Deceased styling (desaturated colors)
- Focused node highlight (golden border with glow)
- Connection line rendering (curved Bezier paths)
- Text truncation for node labels

**Components**
- `WelcomeScreen` - Landing page with:
  - Logo and branding
  - Drag & drop zone for GEDCOM files
  - "Open file" button
  - "Load sample" link for example.ged
  - Recent files dropdown
  - Parchment background styling

- `MainView` - Main application shell
- `TopBar` - Navigation with Search, Import, Export, Settings
- `ZoomControls` - Zoom slider, +/- buttons, fit-to-screen
- `GenerationSlider` - Filter by generation depth
- `Minimap` - Tree overview with viewport indicator
- `SidePanel` - Collapsible panel with tabs:
  - Person Info tab (details, family links)
  - Settings tab (display options, theme, connection style)
- `SearchOverlay` - Fuzzy search with keyboard navigation
- `ExportDialog` - Export options (PNG, PDF, SVG)
- `ShortcutsOverlay` - Keyboard shortcut reference

**Keyboard Shortcuts**
- Arrow keys: Pan canvas
- +/-: Zoom in/out
- 0: Fit to screen
- Cmd/Ctrl+F: Open search
- Escape: Close overlays, deselect
- ?: Show shortcuts overlay

**Assets**
- Copied example.ged to public folder
- Copied background.jpg (parchment texture)
- Copied gen_to_tree.png (logo)
- Created favicon.svg

### Technical Notes

- All data processing is client-side (privacy-first architecture)
- Canvas rendering uses device pixel ratio for crisp rendering
- State persistence via Zustand middleware (settings, recent files)
- Responsive design foundations with Tailwind breakpoints
- Dark mode CSS variables prepared (not yet activated)

### Dependencies

**Runtime:**
- react 18.3.1
- react-dom 18.3.1
- zustand 4.5.5
- d3-hierarchy 3.1.2
- d3-shape 3.2.0
- parse-gedcom 2.0.1
- html2canvas 1.4.1
- jspdf 2.5.2
- react-i18next 14.1.3
- i18next 23.16.8

**Development:**
- vite 6.0.6
- typescript 5.6.2
- tailwindcss 3.4.17
- vitest 2.1.8
- eslint 9.17.0
- prettier 3.4.2

---

## Roadmap

### Phase 2: Layout Engine (Next)
- d3-hierarchy integration for tree layout
- View modes (All Relatives, Family, Hourglass, Pedigree)
- Connection path calculations

### Phase 3-18: See development plan
- Canvas rendering optimizations
- Export functionality
- Dark mode activation
- PWA support
- Internationalization
- Accessibility improvements
