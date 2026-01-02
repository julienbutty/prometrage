# Quickstart: Redesign SVG Editor avec Habillages Intégrés

**Feature**: 005-svg-habillages-redesign
**Date**: 2026-01-01

## Overview

Ce guide permet de démarrer rapidement le développement de la feature de redesign de l'éditeur SVG avec habillages intégrés.

## Prerequisites

```bash
# Vérifier les versions
node --version   # >= 18.x
npm --version    # >= 9.x

# Le projet doit être fonctionnel
npm run dev      # Démarrer le serveur de dev
npm test         # Vérifier que les tests passent
```

## Project Setup

```bash
# Se positionner sur la branche feature
git checkout 005-svg-habillages-redesign

# Installer les dépendances (si nécessaire)
npm install

# Vérifier que le serveur fonctionne
npm run dev
```

## Key Files to Modify

### 1. Composant Principal (Refonte)

```bash
# Le composant à refondre complètement
src/components/menuiseries/MenuiserieSVGEditor.tsx
```

**Changements requis**:
- Nouveau layout CSS Grid pour desktop
- Repositionnement des habillages autour du SVG
- Retrait du champ `hauteurAllege`
- Intégration des boutons "Appliquer à tous"

### 2. Nouveau Composant: HabillageGroup

```bash
# À créer
src/components/menuiseries/HabillageGroup.tsx
src/__tests__/components/menuiseries/HabillageGroup.test.tsx
```

**Responsabilité**: Groupe Int + Ext pour un côté de la fenêtre.

### 3. Nouveau Composant: ApplyToAllButton

```bash
# À créer
src/components/menuiseries/ApplyToAllButton.tsx
src/__tests__/components/menuiseries/ApplyToAllButton.test.tsx
```

**Responsabilité**: Bouton pour propager une valeur à tous les côtés.

### 4. Hook à Étendre

```bash
# À modifier
src/hooks/useHabillagesPropagation.ts
```

**Changements requis**:
- Ajouter méthode `applyToAll()`
- Ajouter propriété `hasAnyValue`

### 5. Composant à Adapter

```bash
# À modifier
src/components/menuiseries/HabillageSelect.tsx
```

**Changements requis**:
- Ajouter prop `variant` pour styling pill
- Appliquer styles bleu/orange selon variant

## Development Workflow (TDD)

### Étape 1: Tests pour HabillageGroup

```typescript
// src/__tests__/components/menuiseries/HabillageGroup.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HabillageGroup } from '@/components/menuiseries/HabillageGroup';

describe('HabillageGroup', () => {
  it('should render Int and Ext selectors for a side', () => {
    render(
      <HabillageGroup
        side="haut"
        values={{ interieur: null, exterieur: null }}
        onIntChange={vi.fn()}
        onExtChange={vi.fn()}
        options={{ interieurs: [], exterieurs: [] }}
      />
    );

    expect(screen.getByLabelText(/intérieur/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/extérieur/i)).toBeInTheDocument();
  });

  it('should apply blue styling for interior', () => {
    // Test styling classes
  });

  it('should apply orange styling for exterior', () => {
    // Test styling classes
  });
});
```

### Étape 2: Implémenter HabillageGroup

```typescript
// src/components/menuiseries/HabillageGroup.tsx
'use client';

import { HabillageSelect } from './HabillageSelect';
import type { HabillageGroupProps } from '@/specs/005-svg-habillages-redesign/contracts/component-interfaces';
import { cn } from '@/lib/utils';

export function HabillageGroup({
  side,
  values,
  onIntChange,
  onExtChange,
  options,
  highlightInt = false,
  highlightExt = false,
  orientation = 'vertical',
  className,
}: HabillageGroupProps) {
  return (
    <div className={cn(
      orientation === 'vertical' ? 'flex flex-col gap-2' : 'flex gap-2',
      className
    )}>
      <HabillageSelect
        side={side}
        value={values.interieur}
        onChange={onIntChange}
        options={options.interieurs}
        variant="interieur"
        isHighlighted={highlightInt}
      />
      <HabillageSelect
        side={side}
        value={values.exterieur}
        onChange={onExtChange}
        options={options.exterieurs}
        variant="exterieur"
        isHighlighted={highlightExt}
      />
    </div>
  );
}
```

### Étape 3: Tests pour ApplyToAllButton

```typescript
// src/__tests__/components/menuiseries/ApplyToAllButton.test.tsx
describe('ApplyToAllButton', () => {
  it('should call onApply when clicked', async () => {
    const onApply = vi.fn();
    render(<ApplyToAllButton type="interieur" onApply={onApply} />);

    await userEvent.click(screen.getByRole('button'));
    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<ApplyToAllButton type="interieur" onApply={vi.fn()} disabled />);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should show blue styling for interieur type', () => {
    // Test button has blue classes
  });

  it('should show orange styling for exterieur type', () => {
    // Test button has orange classes
  });
});
```

### Étape 4: Tests pour hook applyToAll

```typescript
// Dans les tests existants du hook
describe('useHabillagesPropagation - applyToAll', () => {
  it('should apply first non-null value to all sides', () => {
    const { result } = renderHook(() => useHabillagesPropagation());

    // Set one value
    act(() => {
      result.current.handleChange('haut', 'Standard');
    });

    // Now change another to different value
    act(() => {
      result.current.handleChange('gauche', 'Sans');
    });

    // Apply to all should use first non-null (haut = Standard)
    act(() => {
      result.current.applyToAll();
    });

    expect(result.current.values).toEqual({
      haut: 'Standard',
      bas: 'Standard',
      gauche: 'Standard',
      droite: 'Standard',
    });
  });

  it('should expose hasAnyValue computed property', () => {
    const { result } = renderHook(() => useHabillagesPropagation());

    expect(result.current.hasAnyValue).toBe(false);

    act(() => {
      result.current.handleChange('haut', 'Standard');
    });

    expect(result.current.hasAnyValue).toBe(true);
  });
});
```

## CSS Classes Reference

### Grid Layout (Desktop)

```css
/* Container principal */
.container {
  @apply sm:grid sm:grid-cols-[auto_1fr_auto] sm:grid-rows-[auto_1fr_auto] sm:gap-4;
}

/* Positions */
.top-center { @apply sm:col-start-2 sm:row-start-1; }
.left        { @apply sm:col-start-1 sm:row-start-2; }
.center      { @apply sm:col-start-2 sm:row-start-2; }
.right       { @apply sm:col-start-3 sm:row-start-2; }
.bottom-center { @apply sm:col-start-2 sm:row-start-3; }
```

### Pill Styling

```css
/* Intérieur (bleu) */
.pill-interieur {
  @apply border-2 border-blue-500 bg-blue-50 text-blue-700;
}
.pill-interieur.highlighted {
  @apply ring-2 ring-blue-400;
}

/* Extérieur (orange) */
.pill-exterieur {
  @apply border-2 border-orange-500 bg-orange-50 text-orange-700;
}
.pill-exterieur.highlighted {
  @apply ring-2 ring-orange-400;
}
```

### Mobile Layout

```css
/* Mobile: flex column avec order */
.mobile-layout {
  @apply flex flex-col gap-4;
}

/* Order des éléments sur mobile */
.order-1 { order: 1; } /* Hab Haut */
.order-2 { order: 2; } /* SVG */
.order-3 { order: 3; } /* Hauteur + Hab Gauche */
.order-4 { order: 4; } /* Hab Droite */
.order-5 { order: 5; } /* Largeur + Hab Bas */
.order-6 { order: 6; } /* Boutons Apply */
```

## Testing Commands

```bash
# Run all tests
npm test

# Watch mode (TDD)
npm run test:watch

# Run specific test file
npm test -- HabillageGroup

# Coverage
npm run test:coverage
```

## Useful Links

- [Spec](./spec.md) - Feature specification
- [Research](./research.md) - Design decisions
- [Data Model](./data-model.md) - TypeScript interfaces
- [Contracts](./contracts/component-interfaces.ts) - Component contracts
- [Constitution](../../.specify/memory/constitution.md) - Project principles

## Common Issues

### 1. Layout ne s'affiche pas correctement sur mobile

Vérifier que les classes `order-*` sont bien appliquées et que `flex flex-col` est le défaut.

### 2. Animation highlight ne fonctionne pas

Vérifier que `highlightedSides` est bien passé comme `Set<Side>` et non comme array.

### 3. Options habillage vides

Vérifier que `habillageConfig` est bien passé et que le matériau/pose est correctement détecté.

## Next Steps

Après le développement, lancer `/speckit.tasks` pour générer les tâches détaillées.
