# Component Model: SVG-Centric Menuiserie Page Redesign

**Date**: 2026-01-01
**Feature**: 006-svg-centric-redesign

## Overview

This feature is a **pure UI/UX redesign** with no data model changes. The existing Prisma schema and API remain unchanged. This document describes the **component architecture** instead.

## Component Hierarchy

```
MenuiseriePage (page.tsx)
└── SVGZone (NEW)
    ├── HabillagesToggle (NEW)
    ├── MenuiserieSVG (existing)
    ├── DimensionInput × 3 (existing, repositioned)
    │   ├── Largeur (bottom)
    │   ├── Hauteur (right)
    │   └── HauteurAllege (below largeur)
    └── HabillageGroup × 4 (existing, conditional)
        ├── Haut (top)
        ├── Bas (bottom)
        ├── Gauche (left)
        └── Droite (right)
```

## New Components

### 1. SVGZone

**Purpose**: Container component managing the spatial layout of SVG, dimensions, and habillages.

**Props Interface**:
```typescript
interface SVGZoneProps {
  // SVG display
  typeMenuiserie: string;

  // Dimensions
  dimensions: {
    largeur: string;
    hauteur: string;
    hauteurAllege: string;
  };
  originalDimensions?: {
    largeur?: number;
    hauteur?: number;
    hauteurAllege?: number;
  };
  onDimensionChange?: (field: DimensionField, value: string) => void;
  showAllege?: boolean;

  // Habillages
  showHabillages?: boolean;       // Controls visibility of habillage section
  habillagesInterieurs?: Record<Side, HabillageValue | null>;
  habillagesExterieurs?: Record<Side, HabillageValue | null>;
  onHabillageIntChange?: (side: Side, value: HabillageValue) => void;
  onHabillageExtChange?: (side: Side, value: HabillageValue) => void;
  highlightedIntSides?: Set<Side>;
  highlightedExtSides?: Set<Side>;
  habillageConfig?: HabillageConfig;
  onApplyIntToAll?: () => void;
  onApplyExtToAll?: () => void;
  disableApplyIntToAll?: boolean;
  disableApplyExtToAll?: boolean;

  // Styling
  className?: string;
}
```

**State**:
```typescript
// Internal state
const [habillagesVisible, setHabillagesVisible] = useState(false);
```

**Layout Structure** (Tablet - Grid):
```
┌─────────────────────────────────────────────────────┐
│                    [Toggle Button]                   │
├─────────────────────────────────────────────────────┤
│                   [Hab Haut]*                        │
├──────────┬─────────────────────────────┬────────────┤
│          │                             │            │
│ [Hab G]* │          [SVG]              │ [Hauteur]  │
│          │                             │ [Hab D]*   │
│          │                             │            │
├──────────┴─────────────────────────────┴────────────┤
│        [Largeur]    [Hab Bas]*    [Allège]          │
└─────────────────────────────────────────────────────┘
* = visible only when habillagesVisible === true
```

**Layout Structure** (Mobile - Flex Column):
```
┌─────────────────────┐
│   [Toggle Button]   │
├─────────────────────┤
│    [Hab Haut]*      │
├─────────────────────┤
│                     │
│       [SVG]         │
│                     │
├─────────────────────┤
│     [Hauteur]       │
├─────────────────────┤
│    [Hab Gauche]*    │
├─────────────────────┤
│    [Hab Droite]*    │
├─────────────────────┤
│     [Largeur]       │
├─────────────────────┤
│    [Hab Bas]*       │
├─────────────────────┤
│     [Allège]        │
└─────────────────────┘
```

---

### 2. HabillagesToggle

**Purpose**: Button to show/hide habillage controls.

**Props Interface**:
```typescript
interface HabillagesToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}
```

**Visual States**:
- **Closed**: "Afficher habillages" + ChevronDown icon
- **Open**: "Masquer habillages" + ChevronUp icon
- **Disabled**: Grayed out (when habillages not applicable)

**Styling Requirements**:
- Touch target: 44px minimum height
- Clear visual affordance (outlined button style)
- Icon animation on toggle

---

## Modified Components

### DimensionInput

**Changes**: None - already supports `position` prop for spatial placement.

**Existing Positions**: `top`, `bottom`, `left`, `right`

---

### HabillageGroup

**Changes**:
1. Update `min-h-[40px]` to `min-h-[44px]` for Apple HIG compliance
2. Add `data-testid` for testing

**Existing Features Preserved**:
- `orientation` prop (vertical/horizontal)
- `highlightInt`/`highlightExt` props for animation
- Int/Ext color coding (blue/orange)

---

### MenuiserieSVGEditor

**Status**: DEPRECATED - replaced by SVGZone

**Migration Path**:
1. SVGZone takes all props currently passed to MenuiserieSVGEditor
2. MenuiserieSVGEditor becomes a thin wrapper for backward compatibility (if needed)
3. Or: directly replace usage in page.tsx

---

## CSS Grid Template (Tablet)

```css
.svg-zone-tablet {
  display: grid;
  grid-template-columns: minmax(100px, auto) 1fr minmax(100px, auto);
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "toggle    toggle     toggle"
    "hab-haut  hab-haut   hab-haut"
    "hab-left  svg-center hab-right"
    "bottom    bottom     bottom";
  gap: 1rem;
}

.toggle-area { grid-area: toggle; }
.hab-haut { grid-area: hab-haut; justify-self: center; }
.hab-left { grid-area: hab-left; align-self: center; }
.svg-center { grid-area: svg-center; }
.hab-right { grid-area: hab-right; }
.bottom-row { grid-area: bottom; }
```

---

## Type Definitions

No new types needed. Existing types from `@/lib/validations/habillage`:
- `Side`: 'haut' | 'bas' | 'gauche' | 'droite'
- `HabillageValue`: string (actual values like 'aucun', 'pvc-70', etc.)
- `HabillageConfig`: { interieurs: Option[], exterieurs: Option[] }

Existing types from `@/lib/svg/types`:
- `DimensionInputProps`
- `MenuiserieType`

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     MenuiseriePage                           │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ State:                                                   ││
│  │  - formData (dimensions, habillages)                    ││
│  │  - habillagesInt.values (from useHabillagesPropagation) ││
│  │  - habillagesExt.values (from useHabillagesPropagation) ││
│  └────────────────────────┬────────────────────────────────┘│
│                           │ props                            │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                      SVGZone                             ││
│  │  ┌─────────────────────────────────────────────────────┐││
│  │  │ Local State:                                         │││
│  │  │  - habillagesVisible (boolean)                       │││
│  │  └─────────────────────────────────────────────────────┘││
│  │                                                          ││
│  │  Renders conditionally:                                  ││
│  │  - SVG (always)                                          ││
│  │  - DimensionInputs (always)                              ││
│  │  - HabillageGroups (when habillagesVisible)              ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## Accessibility Considerations

| Element | Requirement | Implementation |
|---------|-------------|----------------|
| Toggle button | Announce state | `aria-expanded={isOpen}` |
| Habillages container | Announce visibility | `aria-hidden={!visible}` |
| All inputs | Keyboard navigable | Native form elements |
| Touch targets | 44px minimum | `min-h-[44px]` class |
| Color contrast | WCAG AA | Existing Tailwind colors comply |
