# Data Model: Ouverture Intérieure

**Date**: 2025-01-11
**Feature**: 001-fix-opening-direction

## Entités Modifiées

### Menuiserie (champ JSON `donneesOriginales` / `donneesModifiees`)

Le modèle Prisma n'est pas modifié. Les données sont stockées dans les champs JSON existants.

#### Nouveau Champ

| Champ | Type | Nullable | Description |
|-------|------|----------|-------------|
| `ouvertureInterieure` | string | Oui | Sens d'ouverture vue de l'intérieur |

#### Valeurs Acceptées

```typescript
type OuvertureInterieure =
  | "droite tirant"   // Tirage main droite → triangle pointe gauche
  | "gauche tirant"   // Tirage main gauche → triangle pointe droite
  | null;             // Non spécifié → pas de triangle
```

#### Relation avec Champs Existants

```typescript
interface MenuiserieData {
  // ... champs existants ...

  // NOUVEAU: Sens d'ouverture pour battants/portes-fenêtres
  ouvertureInterieure?: string | null;

  // EXISTANT (legacy): Ouvrant principal pour coulissants
  ouvrantPrincipal?: "droite" | "gauche" | null;
}
```

---

## Schéma Zod

### AIMenuiserieSchema (mise à jour)

```typescript
// src/lib/validations/ai-response.ts

export const AIMenuiserieSchema = z.object({
  // ... champs existants ...

  // NOUVEAU: Sens d'ouverture intérieure
  ouvertureInterieure: z.preprocess(
    (val) => (typeof val === "string" ? val.toLowerCase().trim() : val),
    z.string().optional().nullable()
  ),

  // EXISTANT: Ouvrant principal (coulissants)
  ouvrantPrincipal: z.preprocess(
    (val) => (typeof val === "string" ? val.toLowerCase() : val),
    z.enum(["droite", "gauche"]).optional().nullable()
  ),
});
```

---

## Logique de Transformation

### Types

```typescript
// src/lib/svg/types.ts (déjà existant)
export type OpeningDirection = 'gauche' | 'droite';

// src/lib/svg/opening-direction.ts (nouveau)
export type OuvertureInterieure = 'droite tirant' | 'gauche tirant';
```

### Fonctions de Mapping

```typescript
// src/lib/svg/opening-direction.ts

import type { OpeningDirection } from './types';

/**
 * Convertit la valeur "Ouverture intérieure" du PDF en direction SVG.
 *
 * Logique inversée:
 * - "droite tirant" → paumelles à droite → triangle pointe GAUCHE
 * - "gauche tirant" → paumelles à gauche → triangle pointe DROITE
 *
 * @param ouvertureInterieure - Valeur extraite du PDF ou saisie utilisateur
 * @returns Direction pour le rendu SVG, ou null si non déterminable
 */
export function mapOuvertureToSensOuverture(
  ouvertureInterieure: string | null | undefined
): OpeningDirection | null {
  if (!ouvertureInterieure) return null;

  const normalized = ouvertureInterieure.toLowerCase().trim();

  // "droite tirant" → triangle pointe gauche (ouverture côté gauche)
  if (normalized.includes('droite')) {
    return 'gauche';
  }

  // "gauche tirant" → triangle pointe droite (ouverture côté droit)
  if (normalized.includes('gauche')) {
    return 'droite';
  }

  return null;
}

/**
 * Détermine le sens d'ouverture effectif avec fallback legacy.
 *
 * Priorité:
 * 1. ouvertureInterieure (nouveau champ)
 * 2. ouvrantPrincipal + "tirant" implicite (rétro-compatibilité)
 * 3. null (pas de triangle affiché)
 */
export function getEffectiveOpeningDirection(
  ouvertureInterieure: string | null | undefined,
  ouvrantPrincipal: string | null | undefined
): OpeningDirection | null {
  // Priorité au nouveau champ
  if (ouvertureInterieure) {
    return mapOuvertureToSensOuverture(ouvertureInterieure);
  }

  // Fallback legacy: "droite" → "droite tirant" implicite
  if (ouvrantPrincipal) {
    return mapOuvertureToSensOuverture(`${ouvrantPrincipal} tirant`);
  }

  return null;
}
```

---

## Règles de Validation

### Extraction PDF

| Règle | Description |
|-------|-------------|
| Normalisation | Lowercase + trim avant validation |
| Valeurs valides | Contient "droite" ou "gauche" |
| Valeur invalide | null + warning dans metadata |
| Champ absent | null (pas d'erreur) |

### Formulaire

| Règle | Description |
|-------|-------------|
| Type champ | Select avec options fixes |
| Options | "Droite tirant", "Gauche tirant", "Non défini" |
| Valeur initiale | Depuis `donneesModifiees` ou `donneesOriginales` |
| Sauvegarde | Dans `donneesModifiees.ouvertureInterieure` |

---

## Cas Particuliers

### Fenêtres 2+ Vantaux

```typescript
// Le sens d'ouverture est ignoré pour les multi-vantaux
// Comportement: ouverture centrale (les deux triangles pointent vers le centre)

function getVantailDirection(
  vantailIndex: number,
  nbVantaux: number,
  sensOuverture: OpeningDirection | null
): OpeningDirection {
  if (nbVantaux >= 2) {
    // Ouverture centrale: gauche→droite, droite→gauche
    return vantailIndex === 0 ? 'droite' : 'gauche';
  }

  // 1 vantail: utilise le sens spécifié ou par défaut
  return sensOuverture ?? 'droite';
}
```

### Oscillo-Battant

```typescript
// Deux triangles affichés:
// 1. Triangle soufflet (vers le haut) - toujours présent
// 2. Triangle battant (gauche/droite) - selon ouvertureInterieure

interface OscilloBattantIndicators {
  soufflet: true;              // Toujours affiché (haut)
  battant: OpeningDirection | null; // Selon ouvertureInterieure
}
```

---

## Migration des Données

Aucune migration requise:
- Le nouveau champ est optionnel (nullable)
- Les données legacy (`ouvrantPrincipal`) restent fonctionnelles
- Le fallback est géré au niveau applicatif
