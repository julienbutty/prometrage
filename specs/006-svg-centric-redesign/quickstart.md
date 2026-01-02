# Quickstart: SVG-Centric Menuiserie Page Redesign

**Date**: 2026-01-01
**Feature**: 006-svg-centric-redesign

## Overview

This guide helps developers quickly understand and implement the SVG-centric redesign of the menuiserie page.

## Key Concept

**Before**: 11 form elements crammed around a tiny 200px SVG
**After**: Large central SVG with dimensions spatially positioned, habillages hidden by default

```
┌─────────────────────────────────────────┐
│            [Toggle: Habillages]         │
├─────────────────────────────────────────┤
│                [Hab Haut]*              │
├─────────┬───────────────────┬───────────┤
│         │                   │ [Hauteur] │
│ [Hab G]*│      [SVG]        │           │
│         │   (50% viewport)  │ [Hab D]*  │
├─────────┴───────────────────┴───────────┤
│   [Largeur]   [Hab Bas]*    [Allège]    │
└─────────────────────────────────────────┘
* = visible when toggle is ON
```

## Quick Implementation Steps

### 1. Create HabillagesToggle Component

```tsx
// src/components/menuiseries/HabillagesToggle.tsx
'use client';

import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HabillagesToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}

export function HabillagesToggle({
  isOpen,
  onToggle,
  disabled = false,
  className,
}: HabillagesToggleProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onToggle}
      disabled={disabled}
      aria-expanded={isOpen}
      className={cn('min-h-[44px] gap-2', className)}
    >
      {isOpen ? (
        <>
          <ChevronUp className="h-4 w-4" />
          Masquer habillages
        </>
      ) : (
        <>
          <ChevronDown className="h-4 w-4" />
          Afficher habillages
        </>
      )}
    </Button>
  );
}
```

### 2. Create SVGZone Component

```tsx
// src/components/menuiseries/SVGZone.tsx
'use client';

import { useState } from 'react';
import { MenuiserieSVG } from './MenuiserieSVG';
import { DimensionInput } from './DimensionInput';
import { HabillageGroup } from './HabillageGroup';
import { HabillagesToggle } from './HabillagesToggle';
import { cn } from '@/lib/utils';

export function SVGZone({ /* props */ }) {
  const [habillagesVisible, setHabillagesVisible] = useState(false);

  return (
    <div className="w-full">
      {/* Toggle button */}
      <div className="mb-4 flex justify-center">
        <HabillagesToggle
          isOpen={habillagesVisible}
          onToggle={() => setHabillagesVisible(!habillagesVisible)}
        />
      </div>

      {/* Mobile layout (default) */}
      <div className="flex flex-col gap-4 md:hidden">
        {/* Vertical stack with order classes */}
      </div>

      {/* Tablet layout (md:) */}
      <div className="hidden md:grid md:grid-cols-[auto_1fr_auto] md:gap-4">
        {/* Grid layout */}
      </div>
    </div>
  );
}
```

### 3. Key Tailwind Classes

```css
/* Touch-friendly (44px min) */
.min-h-[44px]
.h-11

/* Mobile-first responsive */
.flex .flex-col        /* Mobile: stack */
.md:grid .md:grid-cols-[...] /* Tablet: grid */

/* Conditional visibility with animation */
.transition-all .duration-200
.opacity-0 .opacity-100
.pointer-events-none
```

### 4. Update Page to Use SVGZone

```tsx
// src/app/menuiserie/[id]/page.tsx

// Replace MenuiserieSVGEditor card with SVGZone
<Card>
  <CardHeader>
    <CardTitle>Schéma & Dimensions</CardTitle>
  </CardHeader>
  <CardContent>
    <SVGZone
      typeMenuiserie={menuiserie.donneesOriginales.typeMenuiserie}
      dimensions={...}
      onDimensionChange={...}
      habillagesInterieurs={habillagesInt.values}
      habillagesExterieurs={habillagesExt.values}
      onHabillageIntChange={handleHabillageIntChange}
      onHabillageExtChange={handleHabillageExtChange}
      // ... other props
    />
  </CardContent>
</Card>
```

## Testing Checklist

```bash
# Run tests
npm test -- --grep "SVGZone"

# Visual check on different viewports
# 320px - Mobile small
# 375px - Mobile standard
# 768px - Tablet (breakpoint)
# 1024px - Tablet landscape
```

## Files to Modify

| File | Action | Complexity |
|------|--------|------------|
| `src/components/menuiseries/HabillagesToggle.tsx` | CREATE | Low |
| `src/components/menuiseries/SVGZone.tsx` | CREATE | Medium |
| `src/components/menuiseries/HabillageGroup.tsx` | MODIFY (44px) | Low |
| `src/app/menuiserie/[id]/page.tsx` | MODIFY | Low |
| `src/__tests__/unit/svg/svg-zone.test.tsx` | CREATE | Medium |
| `src/__tests__/unit/svg/habillages-toggle.test.tsx` | CREATE | Low |

## Common Pitfalls

1. **Forgetting mobile-first**: Always write mobile styles first, then `md:` for tablet
2. **Touch target too small**: Verify all buttons/inputs have `min-h-[44px]`
3. **Animation on hidden**: Use `pointer-events-none` when hidden to prevent accidental interaction
4. **Grid overflow**: Use `minmax()` in grid columns to prevent overflow
