# Quickstart: Intégration des Habillages Int/Ext autour du SVG

**Date**: 2025-01-01
**Branch**: `003-habillages-svg-integration`

## Prerequisites

- Node.js 18+
- PostgreSQL 16 running (`docker compose up -d`)
- Dependencies installed (`npm install`)

## Quick Test

```bash
# 1. Run tests in watch mode
npm run test:watch

# 2. In another terminal, start dev server
npm run dev

# 3. Navigate to a menuiserie page
# http://localhost:3000/menuiserie/[id]
```

## Development Workflow (TDD)

### Step 1: Create validation schema

```bash
# Create file
touch src/lib/validations/habillage.ts

# Write failing test
touch src/__tests__/unit/validations/habillage.test.ts
```

### Step 2: Create propagation hook

```bash
# Create hook file
touch src/hooks/useHabillagesPropagation.ts

# Write failing test
touch src/__tests__/unit/hooks/useHabillagesPropagation.test.ts
```

### Step 3: Create UI components

```bash
# Create component files
touch src/components/menuiseries/HabillageSelect.tsx
touch src/components/menuiseries/HabillageSection.tsx

# Write failing test
touch src/__tests__/unit/components/HabillageSection.test.tsx
```

### Step 4: Integrate into MenuiserieSVGEditor

Modifier `src/components/menuiseries/MenuiserieSVGEditor.tsx` pour utiliser les nouveaux composants.

## File Checklist

| File | Status | Purpose |
|------|--------|---------|
| `src/lib/validations/habillage.ts` | NEW | Zod schemas & types |
| `src/lib/svg/types.ts` | MODIFY | Update HabillagesSide type |
| `src/hooks/useHabillagesPropagation.ts` | NEW | Propagation logic hook |
| `src/components/menuiseries/HabillageSelect.tsx` | NEW | Single select component |
| `src/components/menuiseries/HabillageSection.tsx` | NEW | Section with 4 selects + propagation |
| `src/components/menuiseries/HabillageInputs.tsx` | DELETE | Old numeric inputs |
| `src/components/menuiseries/MenuiserieSVGEditor.tsx` | MODIFY | Replace HabillageInputs with HabillageSection |

## Test Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test -- habillage

# Run with coverage
npm run test:coverage

# Type check
npm run type-check
```

## Key Implementation Notes

### 1. Propagation Logic

La propagation s'active uniquement sur le **premier changement** d'un groupe (int ou ext). Ensuite, chaque changement modifie uniquement les côtés non encore surchargés.

```typescript
// Premier changement : propage à tous
// Changements suivants : propage aux non-overridden seulement
```

### 2. Animation Highlight

Utiliser `setTimeout` avec 300ms pour l'animation :

```typescript
setHighlightedSides(new Set(propagatedSides));
setTimeout(() => setHighlightedSides(new Set()), 300);
```

### 3. Mobile Layout

Grid 2x2 pour les 4 côtés sur mobile :

```tsx
<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
  {/* 4 selects */}
</div>
```

### 4. Color Coding

- Intérieurs : `border-blue-500`, `text-blue-700`
- Extérieurs : `border-orange-500`, `text-orange-700`

## Troubleshooting

### Select ne s'affiche pas correctement

Vérifier que shadcn/ui Select est bien installé :
```bash
npx shadcn@latest add select
```

### Types incompatibles après modification

Relancer la génération TypeScript :
```bash
npm run type-check
```

### Tests échouent sur les animations

Mocker `setTimeout` dans les tests :
```typescript
vi.useFakeTimers();
// ... trigger change
vi.advanceTimersByTime(300);
vi.useRealTimers();
```
