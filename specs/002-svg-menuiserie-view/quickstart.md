# Quickstart: Visualisation SVG Menuiserie

**Feature**: 002-svg-menuiserie-view
**Date**: 2025-12-31

## Prerequisites

- Node.js 18+
- PostgreSQL 16 running (`docker compose up -d`)
- Dépendances installées (`npm install`)

## Development Setup

```bash
# 1. Checkout feature branch
git checkout 002-svg-menuiserie-view

# 2. Start database
docker compose up -d

# 3. Run tests in watch mode (TDD)
npm run test:watch

# 4. Start dev server (separate terminal)
npm run dev
```

## Files to Create

### 1. SVG Templates
**File**: `src/lib/svg/menuiserie-templates.ts`

```typescript
// Types de menuiseries supportés
export type MenuiserieType =
  | 'fenetre'
  | 'porte-fenetre'
  | 'coulissant'
  | 'chassis-fixe'
  | 'chassis-soufflet';

// Template de base pour une fenêtre
export function getFenetreSVG(nbVantaux: number): JSX.Element {
  // Rectangle principal + divisions verticales pour les vantaux
}

// Template pour un coulissant (flèches de direction)
export function getCoulissantSVG(nbVantaux: number): JSX.Element {
  // Rectangle principal + panneaux avec flèches
}
```

### 2. Composant SVG Principal
**File**: `src/components/menuiseries/MenuiserieSVG.tsx`

```typescript
import { MenuiserieType } from '@/lib/svg/menuiserie-templates';

interface MenuiserieSVGProps {
  type: MenuiserieType;
  nbVantaux: number;
  className?: string;
}

export function MenuiserieSVG({ type, nbVantaux, className }: MenuiserieSVGProps) {
  // Switch sur le type pour retourner le bon template
}
```

### 3. Composant Éditeur
**File**: `src/components/menuiseries/MenuiserieSVGEditor.tsx`

```typescript
// Combine le SVG avec les inputs positionnés autour
// Layout: Grid avec zones nommées
// Mobile: flex-col (SVG puis inputs en liste)
```

### 4. Parser de Type
**File**: `src/lib/svg/svg-utils.ts`

```typescript
export function parseMenuiserieType(typeString: string): {
  type: MenuiserieType;
  nbVantaux: number;
} {
  // Regex pour extraire le type et nombre de vantaux
  // Ex: "Fenêtre 2 vantaux" → { type: 'fenetre', nbVantaux: 2 }
}
```

## Files to Modify

### 1. Page Menuiserie
**File**: `src/app/menuiserie/[id]/page.tsx`

**Change**: Ajouter le composant `MenuiserieSVGEditor` au-dessus ou à la place du formulaire actuel.

```tsx
import { MenuiserieSVGEditor } from '@/components/menuiseries/MenuiserieSVGEditor';

// Dans le composant page:
<MenuiserieSVGEditor
  menuiserieId={id}
  donneesOriginales={menuiserie.donneesOriginales}
  donneesModifiees={menuiserie.donneesModifiees}
/>
```

## Testing

### TDD Workflow

```bash
# 1. Write failing test first (RED)
# Add test in src/__tests__/unit/svg/menuiserie-svg.test.ts

# 2. Run test to confirm it fails
npm test menuiserie-svg

# 3. Make changes to pass test (GREEN)
# Implement in src/lib/svg/menuiserie-templates.ts

# 4. Run all tests
npm test
```

### Test Examples

```typescript
// src/__tests__/unit/svg/menuiserie-svg.test.ts
describe('parseMenuiserieType', () => {
  it('should parse "Fenêtre 2 vantaux" correctly', () => {
    const result = parseMenuiserieType('Fenêtre 2 vantaux');
    expect(result.type).toBe('fenetre');
    expect(result.nbVantaux).toBe(2);
  });

  it('should parse "Coulissant 3 vantaux 3 rails" correctly', () => {
    const result = parseMenuiserieType('Coulissant 3 vantaux 3 rails');
    expect(result.type).toBe('coulissant');
    expect(result.nbVantaux).toBe(3);
  });

  it('should default to fenetre 1 vantail for unknown types', () => {
    const result = parseMenuiserieType('Unknown type');
    expect(result.type).toBe('fenetre');
    expect(result.nbVantaux).toBe(1);
  });
});
```

### Manual Testing

1. Accéder à une menuiserie existante `/menuiserie/[id]`
2. Vérifier que le SVG s'affiche correctement selon le type
3. Saisir des dimensions et vérifier la sauvegarde
4. Tester sur mobile (320px) - vérifier le layout vertical

## Verification Checklist

- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] `npm test` passes (all existing + new tests)
- [ ] SVG Fenêtre 1-2 vantaux → OK
- [ ] SVG Porte-fenêtre 1-2 vantaux → OK
- [ ] SVG Coulissant 2-4 vantaux → OK
- [ ] SVG Châssis fixe → OK
- [ ] SVG Châssis soufflet → OK
- [ ] Inputs dimensions fonctionnels → OK
- [ ] Inputs habillages fonctionnels → OK
- [ ] Responsive mobile (320px) → OK
- [ ] Touch targets >= 44x44px → OK

## Troubleshooting

### SVG ne s'affiche pas
**Cause**: Type de menuiserie non reconnu
**Solution**: Vérifier les logs console, le parser retourne `fenetre` par défaut

### Inputs non réactifs sur mobile
**Cause**: Touch targets trop petits
**Solution**: Vérifier `min-h-[44px]` sur les inputs

### Données non sauvegardées
**Cause**: Mutation TanStack Query échoue
**Solution**: Vérifier la console Network, valider le payload avec le schéma Zod
