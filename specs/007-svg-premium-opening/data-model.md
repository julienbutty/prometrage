# Data Model: SVG Premium et Indicateur d'Ouverture

**Feature**: 007-svg-premium-opening
**Date**: 2026-01-10

## Overview

Cette feature n'ajoute pas de nouvelles tables en base de données. Elle étend le champ JSON `donneesModifiees` existant avec de nouveaux attributs pour le sens d'ouverture.

## Entities

### 1. SensOuverture (Type Enum)

Sens d'ouverture horizontale d'une menuiserie ouvrable.

| Value | Description |
|-------|-------------|
| `gauche` | Ouverture vers la gauche (poignée à droite) |
| `droite` | Ouverture vers la droite (poignée à gauche) |

**TypeScript Definition**:
```typescript
export type SensOuverture = 'gauche' | 'droite';
```

**Zod Schema**:
```typescript
export const SensOuvertureSchema = z.enum(['gauche', 'droite']);
```

---

### 2. ParsedMenuiserieType (Extended)

Extension du type existant pour inclure la détection oscillo-battant.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `MenuiserieType` | Type de menuiserie (existant) |
| `nbVantaux` | `number` | Nombre de vantaux (existant) |
| `isOscilloBattant` | `boolean` | **NEW** - True si détecté comme oscillo-battant |

**TypeScript Definition**:
```typescript
export interface ParsedMenuiserieType {
  type: MenuiserieType;
  nbVantaux: number;
  isOscilloBattant: boolean;  // NEW
}
```

---

### 3. DonneesModifiees (Extended JSON)

Extension du champ JSON flexible existant.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sensOuverture` | `SensOuverture \| null` | No | Sens d'ouverture horizontal |
| `ouvertureVerticale` | `boolean` | No | True pour oscillo-battant (basculement) |
| `...existing` | `any` | - | Tous les autres champs existants |

**Zod Schema Extension**:
```typescript
export const DonneesModifieesExtendedSchema = MenuiserieDataSchema.extend({
  sensOuverture: SensOuvertureSchema.nullable().optional(),
  ouvertureVerticale: z.boolean().optional(),
});
```

**Storage**: Champ JSON `donneesModifiees` de la table `Menuiserie` (pas de migration).

---

### 4. PremiumColors (Configuration)

Palette de couleurs pour le rendu premium SVG.

| Field | Type | Description |
|-------|------|-------------|
| `frameAlu` | `ColorSet` | Couleurs cadre aluminium |
| `framePvc` | `ColorSet` | Couleurs cadre PVC |
| `glass` | `GlassColors` | Couleurs vitrage |
| `handle` | `ColorSet` | Couleurs poignée |
| `openingIndicator` | `IndicatorColors` | Couleurs indicateur ouverture |

**Sub-types**:
```typescript
interface ColorSet {
  base: string;
  highlight: string;
  shadow: string;
}

interface GlassColors {
  base: string;
  reflection: string;
}

interface IndicatorColors {
  stroke: string;
  fill: string;
}
```

---

### 5. SVGTemplateProps (Extended)

Props passées aux templates SVG.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `nbVantaux` | `number` | Yes | Nombre de vantaux |
| `width` | `number` | No | Largeur viewBox (défaut: 200) |
| `height` | `number` | No | Hauteur viewBox (défaut: 150) |
| `sensOuverture` | `SensOuverture` | No | Sens d'ouverture (défaut: 'gauche') |
| `isOscilloBattant` | `boolean` | No | Mode oscillo-battant (défaut: false) |
| `materiau` | `'ALU' \| 'PVC'` | No | Matériau pour palette (défaut: 'ALU') |

---

## Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                        Menuiserie                                │
├─────────────────────────────────────────────────────────────────┤
│  donneesOriginales: JSON (lecture seule - données PDF)          │
│  donneesModifiees: JSON ─┐                                       │
│                          │                                       │
│  ┌───────────────────────▼───────────────────────────────────┐  │
│  │  {                                                          │  │
│  │    largeur: number,                                         │  │
│  │    hauteur: number,                                         │  │
│  │    ...existingFields,                                       │  │
│  │    sensOuverture: 'gauche' | 'droite' | null,  // NEW      │  │
│  │    ouvertureVerticale: boolean                  // NEW      │  │
│  │  }                                                          │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ parseMenuiserieType(intitule)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ParsedMenuiserieType                          │
├─────────────────────────────────────────────────────────────────┤
│  type: MenuiserieType                                            │
│  nbVantaux: number                                               │
│  isOscilloBattant: boolean  // NEW                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Rendering
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SVG Template                                │
├─────────────────────────────────────────────────────────────────┤
│  Props: SVGTemplateProps                                         │
│  Colors: PremiumColors (basé sur materiau)                       │
│  Output: ReactElement avec:                                      │
│    - Dégradés (linearGradient)                                   │
│    - Ombres (filter feDropShadow)                                │
│    - Indicateur ouverture (arc + triangle)                       │
└─────────────────────────────────────────────────────────────────┘
```

## Validation Rules

### sensOuverture
- Valeurs acceptées: `'gauche'`, `'droite'`, `null`
- Null signifie: non spécifié (valeur par défaut 'gauche' à l'affichage)
- Applicable uniquement pour: fenêtre, porte-fenêtre
- Non applicable pour: châssis-fixe, châssis-soufflet, coulissant

### ouvertureVerticale
- Type: boolean
- True: le vantail peut basculer par le haut (oscillo-battant)
- False ou absent: ouverture latérale uniquement
- Automatiquement détecté via l'intitulé

### Détection oscillo-battant
- Patterns reconnus: `/oscillo[\s-]?battant/i`, `/\bOB\b/`
- Si détecté: `isOscilloBattant = true`, `ouvertureVerticale` proposé dans le formulaire

## State Transitions

```
                    ┌──────────────────┐
                    │  Initial State   │
                    │  sensOuverture:  │
                    │  null            │
                    └────────┬─────────┘
                             │
                             │ User opens form
                             ▼
                    ┌──────────────────┐
                    │  Display State   │
                    │  Show selector   │
                    │  Default: gauche │
                    └────────┬─────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            ▼                ▼                ▼
   ┌────────────┐   ┌────────────┐   ┌────────────┐
   │  Gauche    │   │  Droite    │   │  No Change │
   └─────┬──────┘   └─────┬──────┘   └─────┬──────┘
         │                │                │
         └────────────────┼────────────────┘
                          │
                          │ Save (mutation)
                          ▼
                 ┌──────────────────┐
                 │  Persisted State │
                 │  donneesModifiees│
                 │  .sensOuverture  │
                 └──────────────────┘
```

## Migration

**Aucune migration de base de données requise.**

Le champ `donneesModifiees` est déjà de type JSON avec `.passthrough()` dans le schema Zod, ce qui permet d'ajouter de nouveaux champs sans modification du schema Prisma.

Les menuiseries existantes sans `sensOuverture`:
- Valeur par défaut à l'affichage: `'gauche'`
- Pas de modification automatique des données existantes
- La valeur est écrite seulement quand l'utilisateur sauvegarde
