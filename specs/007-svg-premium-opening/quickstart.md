# Quickstart: SVG Premium et Indicateur d'Ouverture

**Feature**: 007-svg-premium-opening
**Date**: 2026-01-10

## Prerequisites

- Node.js 18+
- Docker (pour PostgreSQL)
- Base de données initialisée avec `npm run db:migrate`

## Setup

```bash
# 1. Checkout la branche feature
git checkout 007-svg-premium-opening

# 2. Installer les dépendances (si nouvelles)
npm install

# 3. Démarrer la base de données
docker compose up -d

# 4. Démarrer le serveur de développement
npm run dev
```

## Development Workflow

### TDD - Ordre d'implémentation

1. **Tests d'abord** (RED)
2. **Implémentation minimale** (GREEN)
3. **Refactoring** (REFACTOR)

### Fichiers à modifier/créer

```bash
# Phase 1: Types et Styles Premium
src/lib/svg/types.ts                    # Étendre ParsedMenuiserieType
src/lib/svg/premium-styles.ts           # Créer palette premium
src/__tests__/svg/premium-styles.test.ts

# Phase 2: Templates SVG Premium
src/lib/svg/menuiserie-templates.tsx    # Ajouter gradients, ombres
src/__tests__/svg/premium-templates.test.tsx

# Phase 3: Détection Oscillo-Battant
src/lib/svg/svg-utils.ts                # Étendre parseMenuiserieType
src/__tests__/svg/svg-utils.test.ts     # Ajouter tests oscillo-battant

# Phase 4: Indicateur Ouverture SVG
src/lib/svg/menuiserie-templates.tsx    # Ajouter indicateur arc+triangle
src/__tests__/svg/ouverture-indicator.test.tsx

# Phase 5: Composant Sélecteur
src/components/menuiseries/OuvertureSelector.tsx
src/__tests__/components/ouverture-selector.test.tsx

# Phase 6: Intégration Page
src/components/menuiseries/SVGZone.tsx  # Intégrer sélecteur
src/app/menuiserie/[id]/page.tsx        # Gérer état ouverture
```

## Testing

```bash
# Exécuter tous les tests
npm test

# Exécuter en mode watch
npm run test:watch

# Tests spécifiques à cette feature
npm test -- --grep "premium\|ouverture\|oscillo"

# Vérification des types
npm run type-check

# Linting
npm run lint
```

## Key Patterns

### 1. Palette Premium

```typescript
// src/lib/svg/premium-styles.ts
export const PREMIUM_COLORS = {
  frameAlu: {
    base: '#4B5563',
    highlight: '#6B7280',
    shadow: '#374151',
  },
  // ...
};

export function getFrameGradientId(materiau: 'ALU' | 'PVC'): string {
  return `frame-gradient-${materiau.toLowerCase()}`;
}
```

### 2. Indicateur Ouverture

```typescript
// Dans menuiserie-templates.tsx
function getOpeningIndicator(
  sensOuverture: SensOuverture,
  isOscilloBattant: boolean,
  bounds: { x: number; y: number; width: number; height: number }
): ReactElement {
  // Arc depuis le côté de l'ouverture
  const arcPath = sensOuverture === 'gauche'
    ? `M${bounds.x},${bounds.y} Q${bounds.x + bounds.width/2},${bounds.y + bounds.height/3} ${bounds.x},${bounds.y + bounds.height}`
    : `M${bounds.x + bounds.width},${bounds.y} Q${bounds.x + bounds.width/2},${bounds.y + bounds.height/3} ${bounds.x + bounds.width},${bounds.y + bounds.height}`;

  return (
    <path
      d={arcPath}
      stroke={PREMIUM_COLORS.openingIndicator.stroke}
      strokeWidth={2}
      fill="none"
      strokeDasharray="4 2"
    />
  );
}
```

### 3. Sélecteur Ouverture

```typescript
// src/components/menuiseries/OuvertureSelector.tsx
interface OuvertureSelectorProps {
  value: SensOuverture | null;
  onChange: (value: SensOuverture) => void;
  isOscilloBattant?: boolean;
  disabled?: boolean;
}

export function OuvertureSelector({
  value,
  onChange,
  isOscilloBattant = false,
  disabled = false,
}: OuvertureSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label>Sens d'ouverture</Label>
      <div className="flex gap-2">
        <Button
          variant={value === 'gauche' ? 'default' : 'outline'}
          onClick={() => onChange('gauche')}
          disabled={disabled}
          className="min-h-[44px] flex-1"
        >
          ← Gauche
        </Button>
        <Button
          variant={value === 'droite' ? 'default' : 'outline'}
          onClick={() => onChange('droite')}
          disabled={disabled}
          className="min-h-[44px] flex-1"
        >
          Droite →
        </Button>
      </div>
      {isOscilloBattant && (
        <Badge variant="secondary">
          + Basculement (oscillo-battant)
        </Badge>
      )}
    </div>
  );
}
```

## Validation Checklist

Avant de merger:

- [ ] Tous les tests passent (`npm test`)
- [ ] Pas d'erreurs TypeScript (`npm run type-check`)
- [ ] Pas d'erreurs ESLint (`npm run lint`)
- [ ] Testé sur mobile (320px viewport)
- [ ] SVG < 15KB vérifiés
- [ ] Rendu identique Chrome/Safari/Firefox

## Troubleshooting

### SVG ne s'affiche pas
- Vérifier que les IDs de gradients sont uniques
- Vérifier le viewBox

### Gradients non visibles
- Vérifier que `<defs>` est en premier dans le SVG
- Vérifier les `stop-color` vs `stopColor` (JSX)

### Tests échouent
- Vérifier les snapshots: `npm test -- -u`
- Vérifier les mocks de composants UI
