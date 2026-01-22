# FamilyTree View - Project Guidelines

## Project Overview

**FamilyTree View** is a privacy-focused, high-performance genealogy visualization app that renders family trees on an infinite canvas with seamless zoom. Processes GEDCOM files locally - user data never leaves their device.

### Core Philosophy
- **Privacy First**: All data processing client-side
- **Performance**: Handle 10,000+ nodes smoothly
- **Simplicity**: Clean, intuitive interface like modern map apps

## Tree Layout

**Direction**: Vertical, bottom-to-top
- People born closer to today appear at the **bottom** of the tree
- Ancestors grow **upward** (older generations at top)
- Each node can have **any number of children** (unlimited)
- Each node can have **only two parents** (biological mother/father)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| State | Zustand |
| Styling | Tailwind CSS |
| Canvas | Custom HTML5 Canvas 2D engine |
| Layout | d3-hierarchy + d3-shape |
| GEDCOM | parse-gedcom |
| Export | html2canvas + jspdf |
| i18n | i18next + react-i18next |
| Testing | Vitest |

## Architecture Decisions

1. **Custom Canvas Rendering** - Not SVG/DOM. Canvas performs better for 10K+ nodes
2. **Hybrid D3 Approach** - Use `d3-hierarchy` for layout math only, custom Canvas for rendering
3. **Viewport Culling** - Only render visible nodes
4. **Level of Detail (LOD)** - Less detail when zoomed out
5. **Spatial Indexing** - Grid/R-tree for fast spatial queries

## Color System (CSS Variables)

```css
:root {
  --color-primary: #5D6B4D;
  --color-primary-dark: #3A4A35;
  --color-accent: #8B7355;
  --color-bg-canvas: #F5EFE0;
  --color-bg-panel: #E8DCC8;
  --color-text-primary: #2D3B2A;
  --color-node-male: #E3EBF6;
  --color-node-female: #F6E3EB;
  --color-node-focused: #FFF8E1;
  --color-error: #B54B4B;
  --color-focus: #4A7B9D;
}
```

## Node Colors

| Type | Background | Border |
|------|------------|--------|
| Male (Living) | `#E3EBF6` | `#7A9BC7` |
| Female (Living) | `#F6E3EB` | `#C77A9B` |
| Male (Deceased) | `#D4DBE6` | `#6B8BB7` |
| Female (Deceased) | `#E6D4DB` | `#B76B8B` |
| Focused | `#FFF8E1` | `#F4A825` |

## Key Features

- Infinite canvas with pan/zoom (10%-400%)
- GEDCOM file import (drag & drop)
- Multiple view modes: All Relatives, Family, Hourglass, Pedigree
- Person cards with 3 sizes: Compact, Standard, Detailed
- Search with focus navigation
- Side panel with person info
- Export: PNG, PDF, SVG
- Minimap for navigation
- Generation depth control

## View Mode Behavior

| Mode | Ancestors | Descendants | Spouses | Generation Limit |
|------|-----------|-------------|---------|------------------|
| All Relatives | All | All | All | Applied symmetrically |
| Family | Parents only | Children only | Direct spouses | N/A |
| Hourglass | All | All | With visible children | Applied symmetrically |
| Pedigree | All | None | With visible children | **Not applied** (shows all ancestors) |

**Spouse Visibility Rule (Hourglass/Pedigree):**
- Spouses are only shown if they share at least one visible child with a person in the tree
- This prevents disconnected spouse nodes that have no connection lines

**Layout Algorithm:**
1. **Initial positioning** - Nodes placed by generation level with siblings grouped
2. **Parent centering** - Parents positioned above center of their children
3. **Collision resolution** - Overlapping nodes at same level pushed apart, then re-centered

## File Structure

```
src/
├── components/
│   ├── Canvas/          # Main canvas + rendering
│   ├── SidePanel/       # Person info + settings
│   ├── Navigation/      # TopBar, ZoomControls, Minimap
│   ├── Search/          # Search overlay
│   ├── Import/          # Welcome screen, file drop
│   └── Export/          # Export dialog
├── core/
│   ├── gedcom/          # GEDCOM parsing
│   ├── layout/          # Tree layout algorithms
│   ├── renderer/        # Canvas rendering engine
│   └── export/          # PNG/PDF/SVG export
├── store/               # Zustand state management
├── hooks/               # Custom React hooks
├── i18n/                # Internationalization
│   ├── index.ts         # i18next configuration
│   └── locales/         # Translation JSON files (en, ru, he, es)
├── utils/               # Helpers (dates, geometry, colors)
└── types/               # TypeScript definitions
```

## Internationalization (i18n)

**Supported Languages:**
| Code | Language | Direction |
|------|----------|-----------|
| `en` | English | LTR |
| `ru` | Russian (Русский) | LTR |
| `he` | Hebrew (עברית) | RTL |
| `es` | Spanish (Español) | LTR |

**Implementation:**
- Uses `i18next` and `react-i18next`
- Translation files in `src/i18n/locales/*.json`
- Language setting persisted to localStorage
- RTL support via Tailwind's logical properties (`start`/`end`)
- Document direction (`dir` attribute) set automatically

**Adding New Translations:**
1. Create `src/i18n/locales/{code}.json` based on `en.json`
2. Add language to `supportedLanguages` array in `src/i18n/index.ts`
3. Import and register in i18n resources

## Settings & Persistence

**Storage:** `localStorage` key `familytree-storage` (via Zustand persist middleware)

**Available Settings:**

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `nodeSize` | `compact` \| `standard` \| `detailed` | `standard` | Person card detail level |
| `connectionStyle` | `curved` \| `straight` \| `orthogonal` | `curved` | Line style between nodes |
| `showDates` | boolean | `true` | Display birth/death dates |
| `showPlaces` | boolean | `true` | Display locations |
| `showPhotos` | boolean | `true` | Display person photos |
| `showIds` | boolean | `false` | Display GEDCOM IDs |
| `theme` | `light` \| `dark` \| `system` | `light` | Color theme |
| `viewMode` | `all` \| `family` \| `hourglass` \| `pedigree` | `all` | Tree filtering mode |
| `generationDepth` | number | `10` | Max generations to display |
| `generationFilterEnabled` | boolean | `false` | Enable generation limit |
| `enableAnimations` | boolean | `true` | Smooth transitions |
| `language` | string | `en` | UI language code |

**Initialization Hook (`useInitialization`):**
- Applied on app start in `App.tsx`
- Syncs theme to DOM (`.dark` class on `<html>`)
- Listens for system theme changes when `theme: 'system'`
- Sets document `dir` and `lang` attributes for i18n

## Performance Targets

| Metric | Target |
|--------|--------|
| Initial load | < 1s |
| Load 1K GEDCOM | < 2s |
| Load 10K GEDCOM | < 5s |
| Render frame | < 16ms (60fps) |
| Memory (10K tree) | < 200MB |

## Data Model (Key Types)

```typescript
interface Individual {
  id: string;
  name: { given: string; surname: string; };
  gender: 'M' | 'F' | 'U';
  birth?: Event;
  death?: Event;
  familyAsSpouse: string[];
  familyAsChild: string;
}

interface Family {
  id: string;
  husband?: string;
  wife?: string;
  children: string[];
  marriage?: Event;
}

interface TreeNode {
  id: string;
  person: Individual;
  x: number;
  y: number;
  generation: number;
  isFocused: boolean;
}
```

## Development Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run test     # Run tests
```

## GEDCOM Format Support

GEDCOM 5.5.1 standard fields supported:

### Header (HEAD)
- `GEDC` - GEDCOM version
- `CHAR` - Character encoding (UTF-8)
- `LANG` - Language
- `SOUR` - Source application
- `DATE` - Export date

### Individual Records (INDI)
**Identity:**
- `NAME` - Full name with `GIVN` (given), `SURN` (surname), `_MARNM` (married name)
- `SEX` - Gender (M/F/U)

**Life Events:**
- `BIRT` - Birth (DATE, PLAC)
- `DEAT` - Death (DATE, PLAC, CAUS)
- `BURI` - Burial (PLAC)

**Residence & Contact:**
- `RESI` - Residence with ADDRESS structure (ADR1, ADR2, CITY, STAE, CTRY, POST)
- `EMAIL`, `PHON`, `WWW`

**Life Details:**
- `OCCU` - Occupation (DATE, PLAC, NOTE)
- `EDUC` - Education (DATE, PLAC, NOTE)
- `RELI` - Religion
- `NATI` - Nationality
- `DSCR` - Physical description

**Custom Events:**
- `EVEN` - Generic events with TYPE (Hobbies, Sports, Languages, Politics, etc.)

**Relationships:**
- `FAMS` - Family as spouse (reference to FAM)
- `FAMC` - Family as child (reference to FAM)

**Other:**
- `NOTE` - Notes (supports HTML)
- `OBJE` - Media objects (photos, documents)
- `SOUR` - Source citations

### Family Records (FAM)
- `HUSB` - Husband reference (INDI)
- `WIFE` - Wife reference (INDI)
- `CHIL` - Children references (multiple INDI)
- `MARR` - Marriage event (DATE, PLAC)
- `DIV` - Divorce event

### Source Records (SOUR)
- `AUTH` - Author
- `TITL` - Title
- `PUBL` - Publisher
- `TEXT` - Text content

### Date Formats
- Exact: `15 JAN 1950`
- Approximate: `ABT 1950`, `EST 1950`
- Range: `FROM 1950 TO 1960`, `BET 1950 AND 1960`
- Partial: `1950`, `JAN 1950`
- Modifiers: `AFT` (after), `BEF` (before)

---

## Feature Ideas (Not Approved)

### Geographic Map View

**Status**: Proposed (not approved)

Display family members on an interactive map based on their location data (birth place, residence, death place, etc.).

**Core Functionality:**
- Show all people with location data on a geographic map
- Extract coordinates from GEDCOM place fields (PLAC) via geocoding
- Support multiple location types: birth, residence, death, burial, marriage

**Marker Behavior:**
- **Single person at location**: Display marker with person's initials (e.g., "JD" for John Doe)
- **Multiple people at same location**: Display marker with count (e.g., "5" for 5 people)
- Click marker to see list of people at that location
- Click person in list to focus them in the tree view

**Potential Libraries (free/open-source):**
- Leaflet.js - lightweight, mobile-friendly
- OpenStreetMap tiles - free map data
- Nominatim - free geocoding service (with rate limits)

**Privacy Considerations:**
- All geocoding should be cached locally after first lookup
- Option to use offline/pre-cached coordinates
- No location data sent to external services without user consent

**UI Integration:**
- Toggle button in toolbar to switch between Tree View and Map View
- Filter by location type (birth/residence/death)
- Filter by time period
- Sync selection between map and tree views