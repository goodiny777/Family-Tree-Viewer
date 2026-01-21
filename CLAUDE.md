# FamilyTree View - Project Guidelines

## Project Overview

**FamilyTree View** is a privacy-focused, high-performance genealogy visualization app that renders family trees on an infinite canvas with seamless zoom. Processes GEDCOM files locally - user data never leaves their device.

### Core Philosophy
- **Privacy First**: All data processing client-side
- **Performance**: Handle 10,000+ nodes smoothly
- **Simplicity**: Clean, intuitive interface like modern map apps

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
├── utils/               # Helpers (dates, geometry, colors)
└── types/               # TypeScript definitions
```

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