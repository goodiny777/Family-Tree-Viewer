# FamilyTree View - Designer Brief

## Project Overview

**App Name:** FamilyTree View  
**Platform:** Web (Desktop-first, responsive)  
**Target Users:** Genealogy enthusiasts, family historians  
**Core Concept:** Privacy-focused family tree visualization with infinite canvas

---

## Logo & Brand Identity

The logo features:
- **Oak tree** - Symbolizing deep family roots and generations
- **Intertwined branches** - Representing family connections
- **Ancient scroll** - Heritage and documentation
- **Compass rose** - Navigation through ancestry

**Brand Personality:** Trustworthy, elegant, professional, warm

---

## Color Palette

### Primary Colors (From Logo)

| Swatch | Name | Hex | Usage |
|--------|------|-----|-------|
| 🟢 | **Oak Leaf** | `#5D6B4D` | Primary buttons, headers, nav bar |
| 🟢 | **Forest Deep** | `#3A4A35` | Text, dark accents |
| 🟢 | **Sage Light** | `#7A8B6A` | Hover states, secondary |

### Accent Colors

| Swatch | Name | Hex | Usage |
|--------|------|-----|-------|
| 🟤 | **Branch Brown** | `#8B7355` | Links, connections, accents |
| 🟤 | **Bark Dark** | `#6B5344` | Secondary accents |
| 🟤 | **Warm Wood** | `#A08B70` | Tertiary, decorative |

### Background Colors

| Swatch | Name | Hex | Usage |
|--------|------|-----|-------|
| 🟡 | **Parchment** | `#F5EFE0` | Main canvas background |
| 🟡 | **Scroll** | `#E8DCC8` | Cards, panels |
| 🟡 | **Aged Paper** | `#D4C4A8` | Borders, dividers |

### Semantic Colors

| Swatch | Name | Hex | Usage |
|--------|------|-----|-------|
| ⬜ | **White** | `#FFFFFF` | Card backgrounds |
| 🔴 | **Error** | `#B54B4B` | Errors, deceased |
| 🔵 | **Focus** | `#4A7B9D` | Selection, focus ring |
| 🟠 | **Highlight** | `#F4A825` | Focused person border |

### Person Node Colors

| Gender | Background | Border |
|--------|------------|--------|
| Male (Living) | `#E3EBF6` | `#7A9BC7` |
| Female (Living) | `#F6E3EB` | `#C77A9B` |
| Male (Deceased) | `#D4DBE6` | `#6B8BB7` |
| Female (Deceased) | `#E6D4DB` | `#B76B8B` |
| Unknown | `#E8E8E8` | `#A0A0A0` |
| **Focused** | `#FFF8E1` | `#F4A825` |

---

## Typography

### Recommended Font Pairing

**Option A (Classic):**
- Headers: **Playfair Display** (serif)
- Body: **Source Sans 3** (sans-serif)

**Option B (Modern):**
- Headers: **Inter** (sans-serif, semi-bold)
- Body: **Inter** (sans-serif, regular)

**Option C (Warm):**
- Headers: **Merriweather** (serif)
- Body: **Open Sans** (sans-serif)

### Type Scale

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 (App title) | 24px | 600 | 1.2 |
| H2 (Panel title) | 18px | 600 | 1.3 |
| H3 (Section) | 14px | 600 | 1.4 |
| Body | 14px | 400 | 1.5 |
| Small | 12px | 400 | 1.4 |
| Node name | 13px | 500 | 1.2 |
| Node detail | 11px | 400 | 1.3 |

---

## Feature List (Complete)

### ✅ Must Have (MVP)

- [ ] **Import GEDCOM file** - Drag & drop or file picker
- [ ] **Infinite canvas** - Pan in all directions
- [ ] **Seamless zoom** - 10% to 400% smooth zoom
- [ ] **Person nodes** - Display name, dates, gender
- [ ] **Connection lines** - Show parent-child, spouse relationships
- [ ] **Click to select** - Focus on a person
- [ ] **Side panel - Info** - Show selected person details
- [ ] **Search** - Find person by name
- [ ] **Zoom controls** - +/- buttons, slider
- [ ] **Generation filter** - Show N generations from focus

### 🎯 Should Have (v1.1)

- [ ] **All Relatives view** - Show entire tree
- [ ] **Family view** - Show only nuclear family
- [ ] **Hourglass view** - Ancestors + descendants
- [ ] **Export PNG** - Download visible area
- [ ] **Export PDF** - Print-ready format
- [ ] **Minimap** - Overview navigation
- [ ] **Keyboard shortcuts** - Power user navigation
- [ ] **Side panel - Settings** - User preferences
- [ ] **Node size options** - Compact/Standard/Detailed

### 💫 Nice to Have (Future)

- [ ] **Export SVG** - Vector format
- [ ] **Dark mode** - Alternative theme
- [ ] **Photo support** - Display embedded photos
- [ ] **Animation** - Smooth transitions
- [ ] **Pedigree view** - Traditional ancestor chart
- [ ] **Print view** - Optimized for printing
- [ ] **PWA** - Offline support
- [ ] **Recent files** - Quick access to previous trees
- [ ] **Localization** - Multi-language support

---

## Screens to Design

### 1. Welcome Screen
**Purpose:** First-time user landing, file import  
**Key Elements:**
- Logo (centered, prominent)
- Welcome message
- Drop zone for GEDCOM file
- "Open file" button
- "Load sample" link
- "Recent files" dropdown (if applicable)

### 2. Main Canvas View
**Purpose:** Primary workspace  
**Key Elements:**
- Top navigation bar
- Infinite canvas with person nodes
- Connection lines between nodes
- Zoom controls (bottom-left)
- Generation slider (bottom-left)
- Minimap (bottom-left, collapsible)
- Side panel (right, collapsible)

### 3. Side Panel - Person Info
**Purpose:** Display selected person details  
**Key Elements:**
- Photo placeholder
- Full name
- Birth date & place
- Death date & place (or "living")
- Residence history
- Occupation
- Education
- Family section (spouse, children links)
- "Center on person" button

### 4. Side Panel - Settings
**Purpose:** User preferences  
**Key Elements:**
- Node size toggle (Compact/Standard/Detailed)
- Display checkboxes (dates, places, photos, IDs)
- Theme selector (Light/Dark)
- Connection style (Straight/Curved/Orthogonal)
- Performance options
- Animation toggle

### 5. Search Overlay
**Purpose:** Find and navigate to person  
**Key Elements:**
- Search input with icon
- Results list (name, dates, ID, relative count)
- Keyboard navigation hints
- Close button

### 6. Export Dialog
**Purpose:** Export current view  
**Key Elements:**
- Format tabs (PNG/PDF/SVG)
- Scope options (Visible/Full/Selection)
- Generation depth slider (for selection scope)
- Options checkboxes
- File size estimate
- Export button

---

## Component Specifications

### Person Node

**Compact (80×50px)**
```
┌──────────────────┐
│ John Smith       │
│ *1950        ♂   │
└──────────────────┘
```

**Standard (150×70px)**
```
┌─────────────────────────┐
│ ┌───┐ John Smith        │
│ │ 👤│ *Jan 15, 1950     │
│ └───┘ Boston, MA        │
│       ID: I001      ♂   │
└─────────────────────────┘
```

**Detailed (200×120px)**
```
┌────────────────────────────────┐
│  ┌─────────┐                   │
│  │  Photo  │ John Michael      │
│  │         │ Smith             │
│  └─────────┘ ♂ ID: I001        │
├────────────────────────────────┤
│ Birth: Jan 15, 1950            │
│        Boston, Massachusetts   │
│ Death: —                       │
│ Occupation: Engineer           │
└────────────────────────────────┘
```

**States:**
- Default
- Hover (slight lift/shadow)
- Selected/Focused (golden border, glow)
- Highlighted (light overlay)
- Deceased (desaturated colors)

### Connection Lines

**Styles:**
- Curved (Bezier) - Default, organic feel
- Straight - Direct lines
- Orthogonal - Right angles only

**Types:**
- Parent-child: Solid line (2px)
- Spouse: Double line or different color (Branch Brown)
- Current focus path: Highlighted/thicker (3px, primary color)

### Zoom Controls

```
┌───────────────────────────┐
│  [+]                      │
│   │                       │
│   ○══════════             │  ← Slider
│   │                       │
│  [-]                      │
│                           │
│  [⟲] Fit to screen        │
└───────────────────────────┘
```

### Generation Slider

```
┌───────────────────────────┐
│ Generations               │
│ [-] ══○══════════ [+]     │
│      3                    │
└───────────────────────────┘
```

### Minimap

```
┌─────────────┐
│ ░░░▓▓░░░░░░ │  ← Full tree (simplified)
│ ░░░▓▓░░░░░░ │  ← Viewport rectangle (dark)
│ ░░░░░░░░░░░ │
│ ░░░░░░░░░░░ │
└─────────────┘
  [👁 Hide]
```

---

## Interaction Patterns

### Canvas Interactions

| Action | Mouse | Touch | Keyboard |
|--------|-------|-------|----------|
| Pan | Click + drag | Two-finger drag | Arrow keys |
| Zoom | Scroll wheel | Pinch | +/- keys |
| Select person | Click node | Tap node | Enter (when highlighted) |
| Deselect | Click canvas | Tap canvas | Escape |
| Open search | Click search icon | Tap search icon | Cmd/Ctrl + F |
| Fit to screen | Double-click canvas | Double-tap | 0 (zero) |

### Node Interactions

| Action | Trigger | Result |
|--------|---------|--------|
| Hover | Mouse over | Show tooltip, slight elevation |
| Click | Click node | Select, open side panel |
| Double-click | Double-click | Center on person, zoom in |
| Right-click | Right-click | Context menu (future) |

### Side Panel

| Action | Trigger | Result |
|--------|---------|--------|
| Toggle | Arrow button | Slide in/out |
| Switch tab | Tab click | Content changes |
| Navigate to person | Click family member | Canvas centers, person selected |

---

## Responsive Behavior

### Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Desktop | >1024px | Full layout, side panel visible |
| Tablet | 768-1024px | Side panel overlay, smaller controls |
| Mobile | <768px | Full-screen canvas, bottom sheet for info |

### Mobile Adaptations

- Side panel becomes bottom sheet
- Zoom controls larger for touch
- Search becomes full-screen modal
- Minimap hidden by default
- Simplified node rendering

---

## Animation Guidelines

### Timing

| Animation | Duration | Easing |
|-----------|----------|--------|
| Zoom | 200ms | ease-out |
| Pan to person | 400ms | ease-in-out |
| Side panel slide | 250ms | ease-out |
| Node hover | 150ms | ease |
| Search overlay | 200ms | ease |

### Micro-interactions

- Node hover: Subtle lift (2px) + shadow
- Selection: Golden ring expands from center
- Navigation: Canvas smoothly glides to target
- Zoom: Scale from cursor/touch point
- Loading: Logo leaves gently rustle

---

## Accessibility Requirements

### Color Contrast

All text must meet WCAG AA:
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: Clear focus indicators

### Keyboard Navigation

- All interactive elements focusable
- Logical tab order
- Arrow keys for canvas navigation
- Enter to select, Escape to deselect

### Screen Readers

- Meaningful alt text for icons
- ARIA labels for controls
- Live regions for dynamic content
- Skip links for main content

---

## Assets Needed

### Icons (24×24px)

| Icon | Usage |
|------|-------|
| 📁 Folder/Open | Open file |
| 💾 Download | Export |
| 🔍 Magnifier | Search |
| ⚙️ Gear | Settings |
| ❓ Question | Help |
| ✕ Close | Close dialogs |
| → Arrow right | Collapse panel |
| ← Arrow left | Expand panel |
| + Plus | Zoom in, add |
| − Minus | Zoom out, remove |
| ♂ Male | Gender indicator |
| ♀ Female | Gender indicator |
| 🎯 Target | Center/focus |
| 📋 Document | PDF export |
| 🖼️ Image | PNG export |
| ⮔ Reset | Fit to screen |

### Illustrations

- Empty state (no file loaded)
- Error state (invalid file)
- Loading state (processing large file)

---

## Deliverables Checklist

### Figma/Design Tool

- [ ] Color styles defined
- [ ] Typography styles defined
- [ ] Component library
  - [ ] Person node (3 sizes × 6 states)
  - [ ] Buttons (primary, secondary, icon)
  - [ ] Input fields
  - [ ] Dropdowns
  - [ ] Toggles/checkboxes
  - [ ] Sliders
  - [ ] Tabs
- [ ] Screen designs
  - [ ] Welcome screen
  - [ ] Main canvas (empty)
  - [ ] Main canvas (with tree)
  - [ ] Side panel - Info
  - [ ] Side panel - Settings
  - [ ] Search overlay
  - [ ] Export dialog
- [ ] Mobile variants
- [ ] Interactive prototype (optional)

### Exports

- [ ] Icon set (SVG)
- [ ] Logo variations (SVG, PNG @1x, @2x)
- [ ] Design tokens (JSON)
- [ ] Component specs (measurements)

---

## Notes for Designer

1. **Canvas Background:** Subtle grid pattern helps user orient while panning. Dots or light lines work well.

2. **Node Density:** In zoomed-out view, nodes may overlap. Use Level of Detail (LOD) to show dots instead of full cards.

3. **Connection Lines:** Curved Bezier paths feel more organic for family trees than straight lines.

4. **Focus State:** When a person is focused, their direct ancestors and descendants could have a subtle highlight trail.

5. **Performance:** Keep decorative elements simple - heavy shadows or gradients on nodes will impact performance at scale.

6. **Inspiration:** Google Maps (infinite canvas), Figma (zoom behavior), Notion (side panel), Ancestry.com (tree styling)
