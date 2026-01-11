# Quickstart: Ouverture Intérieure

**Date**: 2025-01-11
**Feature**: 001-fix-opening-direction

## Objectif

Implémenter l'extraction et l'affichage correct du sens d'ouverture des menuiseries (champ "Ouverture intérieure") avec la logique inversée pour le triangle SVG.

---

## Prérequis

```bash
# Vérifier la branche
git checkout 001-fix-opening-direction

# Installer les dépendances
npm install

# Démarrer la base de données
docker compose up -d

# Lancer les tests (vérifier que tout passe avant de commencer)
npm test
```

---

## Ordre d'Implémentation (TDD)

### Étape 1: Fonction de Mapping (Core Logic)

**Fichier test**: `src/__tests__/lib/opening-direction.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import {
  mapOuvertureToSensOuverture,
  getEffectiveOpeningDirection,
} from '@/lib/svg/opening-direction';

describe('mapOuvertureToSensOuverture', () => {
  it('should return gauche for "droite tirant"', () => {
    expect(mapOuvertureToSensOuverture('droite tirant')).toBe('gauche');
  });

  it('should return droite for "gauche tirant"', () => {
    expect(mapOuvertureToSensOuverture('gauche tirant')).toBe('droite');
  });

  it('should handle case insensitivity', () => {
    expect(mapOuvertureToSensOuverture('DROITE TIRANT')).toBe('gauche');
    expect(mapOuvertureToSensOuverture('Gauche Tirant')).toBe('droite');
  });

  it('should return null for null/undefined', () => {
    expect(mapOuvertureToSensOuverture(null)).toBeNull();
    expect(mapOuvertureToSensOuverture(undefined)).toBeNull();
  });

  it('should return null for unrecognized values', () => {
    expect(mapOuvertureToSensOuverture('centre')).toBeNull();
    expect(mapOuvertureToSensOuverture('invalid')).toBeNull();
  });
});

describe('getEffectiveOpeningDirection', () => {
  it('should prioritize ouvertureInterieure over ouvrantPrincipal', () => {
    expect(getEffectiveOpeningDirection('droite tirant', 'gauche')).toBe('gauche');
  });

  it('should fallback to ouvrantPrincipal with implicit tirant', () => {
    expect(getEffectiveOpeningDirection(null, 'droite')).toBe('gauche');
  });

  it('should return null when both are null', () => {
    expect(getEffectiveOpeningDirection(null, null)).toBeNull();
  });
});
```

**Fichier source**: `src/lib/svg/opening-direction.ts`

```typescript
import type { OpeningDirection } from './types';

export function mapOuvertureToSensOuverture(
  ouvertureInterieure: string | null | undefined
): OpeningDirection | null {
  if (!ouvertureInterieure) return null;

  const normalized = ouvertureInterieure.toLowerCase().trim();

  if (normalized.includes('droite')) return 'gauche';
  if (normalized.includes('gauche')) return 'droite';

  return null;
}

export function getEffectiveOpeningDirection(
  ouvertureInterieure: string | null | undefined,
  ouvrantPrincipal: string | null | undefined
): OpeningDirection | null {
  if (ouvertureInterieure) {
    return mapOuvertureToSensOuverture(ouvertureInterieure);
  }

  if (ouvrantPrincipal) {
    return mapOuvertureToSensOuverture(`${ouvrantPrincipal} tirant`);
  }

  return null;
}
```

### Étape 2: Schéma Zod

**Modifier**: `src/lib/validations/ai-response.ts`

```typescript
// Ajouter dans AIMenuiserieSchema (après ouvrantPrincipal)
ouvertureInterieure: z.preprocess(
  (val) => (typeof val === "string" ? val.toLowerCase().trim() : val),
  z.string().optional().nullable()
),
```

### Étape 3: Prompt PDF

**Modifier**: `src/lib/pdf/prompts.ts`

```typescript
// Ajouter dans le JSON de la structure d'extraction (après ouvrantPrincipal)
"ouvertureInterieure": "droite tirant" | "gauche tirant" | null,  // Sens d'ouverture vue de l'intérieur
```

### Étape 4: InteractiveSVGZone

**Modifier**: `src/components/menuiseries/InteractiveSVGZone.tsx`

```typescript
// Ajouter prop
interface InteractiveSVGZoneProps {
  // ... props existantes ...
  sensOuverture?: OpeningDirection | null;
}

// Passer au MenuiserieSVG
<MenuiserieSVG
  type={selectedType}
  nbVantaux={effectiveVantaux}
  typeOuvrant={effectiveTypeOuvrant}
  sensOuverture={sensOuverture ?? 'droite'}
  // ...
/>
```

### Étape 5: Page Formulaire

**Modifier**: `src/app/menuiserie/[id]/page.tsx`

```typescript
// Import
import { getEffectiveOpeningDirection } from '@/lib/svg/opening-direction';

// Calculer le sens d'ouverture
const sensOuverture = getEffectiveOpeningDirection(
  formData.ouvertureInterieure,
  formData.ouvrantPrincipal
);

// Passer au composant SVG
<InteractiveSVGZone
  // ... props existantes ...
  sensOuverture={sensOuverture}
/>
```

---

## Vérification

```bash
# 1. Tests unitaires
npm test -- --run src/__tests__/lib/opening-direction.test.ts

# 2. Tous les tests
npm test

# 3. Type check
npm run type-check

# 4. Lint
npm run lint

# 5. Test manuel
npm run dev
# Ouvrir http://localhost:3000
# Uploader un PDF avec "Ouverture intérieure: droite tirant"
# Vérifier que le triangle pointe vers la gauche
```

---

## Critères de Succès

- [ ] Tests unitaires `opening-direction.test.ts` passent
- [ ] "droite tirant" affiche triangle vers la gauche
- [ ] "gauche tirant" affiche triangle vers la droite
- [ ] Valeur null = pas de triangle affiché
- [ ] Champ visible dans le formulaire
- [ ] Modification du champ met à jour le SVG instantanément
- [ ] Données legacy `ouvrantPrincipal` fonctionnent toujours
