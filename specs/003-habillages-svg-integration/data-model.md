# Data Model: Intégration des Habillages Int/Ext autour du SVG

**Date**: 2025-01-01
**Branch**: `003-habillages-svg-integration`

## Entities

### HabillageValue (Enum)

Valeurs possibles pour un habillage (intérieur ou extérieur) sur un côté.

| Value | Description |
|-------|-------------|
| `"Standard"` | Habillage par défaut selon spécifications fabricant |
| `"Sans"` | Aucun habillage sur ce côté |
| `"Haut"` | Habillage uniquement en haut |
| `"Bas"` | Habillage uniquement en bas |
| `"Montants"` | Habillages sur les montants (gauche/droite) |

**TypeScript Definition**:
```typescript
export type HabillageValue = 'Standard' | 'Sans' | 'Haut' | 'Bas' | 'Montants';

export const HABILLAGE_VALUES: HabillageValue[] = [
  'Standard',
  'Sans',
  'Haut',
  'Bas',
  'Montants',
];

export const HABILLAGE_LABELS: Record<HabillageValue, string> = {
  'Standard': 'Standard',
  'Sans': 'Sans habillage',
  'Haut': 'Haut uniquement',
  'Bas': 'Bas uniquement',
  'Montants': 'Montants (G+D)',
};
```

---

### HabillagesSide (Modified)

Structure pour les 4 côtés d'habillage. **BREAKING CHANGE**: `number | null` → `HabillageValue | null`.

| Field | Type | Description |
|-------|------|-------------|
| `haut` | `HabillageValue \| null` | Habillage côté haut |
| `bas` | `HabillageValue \| null` | Habillage côté bas |
| `gauche` | `HabillageValue \| null` | Habillage côté gauche |
| `droite` | `HabillageValue \| null` | Habillage côté droite |

**TypeScript Definition** (mise à jour de `src/lib/svg/types.ts`):
```typescript
import type { HabillageValue } from '@/lib/validations/habillage';

/**
 * Structure pour un côté d'habillage
 * @breaking v003 - Changed from number | null to HabillageValue | null
 */
export interface HabillagesSide {
  haut: HabillageValue | null;
  bas: HabillageValue | null;
  gauche: HabillageValue | null;
  droite: HabillageValue | null;
}

export type Side = keyof HabillagesSide;
export const SIDES: Side[] = ['haut', 'bas', 'gauche', 'droite'];
```

---

### PropagationState (New - UI State)

État interne du hook `useHabillagesPropagation`. Non persisté en base.

| Field | Type | Description |
|-------|------|-------------|
| `values` | `Record<Side, HabillageValue \| null>` | Valeurs actuelles des 4 côtés |
| `overriddenSides` | `Set<Side>` | Côtés modifiés individuellement |
| `highlightedSides` | `Set<Side>` | Côtés en animation highlight |

**TypeScript Definition** (dans le hook):
```typescript
interface PropagationState {
  values: Record<Side, HabillageValue | null>;
  overriddenSides: Set<Side>;
}

interface HighlightState {
  highlightedSides: Set<Side>;
}
```

---

## Validation Rules

### Zod Schema

**File**: `src/lib/validations/habillage.ts`

```typescript
import { z } from 'zod';

export const habillageValueSchema = z.enum([
  'Standard',
  'Sans',
  'Haut',
  'Bas',
  'Montants',
]);

export type HabillageValue = z.infer<typeof habillageValueSchema>;

export const habillagesSideSchema = z.object({
  haut: habillageValueSchema.nullable(),
  bas: habillageValueSchema.nullable(),
  gauche: habillageValueSchema.nullable(),
  droite: habillageValueSchema.nullable(),
});

export type HabillagesSideData = z.infer<typeof habillagesSideSchema>;

/**
 * Schema pour la validation des données modifiées (API PUT)
 * Intégré dans le schema existant de donneesModifiees
 */
export const donneesModifieesHabillagesSchema = z.object({
  habillageInt: habillagesSideSchema.optional(),
  habillageExt: habillagesSideSchema.optional(),
});
```

---

## State Transitions

### Propagation Logic

```
┌─────────────────────────────────────────────────────────────┐
│                    INITIAL STATE                            │
│  values: { haut: null, bas: null, gauche: null, droite: null}│
│  overriddenSides: Set()                                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ User selects "Standard" on "haut"
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  PROPAGATED STATE                           │
│  values: { haut: "Standard", bas: "Standard",               │
│            gauche: "Standard", droite: "Standard" }         │
│  overriddenSides: Set("haut")                               │
│  → Trigger highlight on bas, gauche, droite                 │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ User selects "Sans" on "gauche"
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  OVERRIDDEN STATE                           │
│  values: { haut: "Standard", bas: "Standard",               │
│            gauche: "Sans", droite: "Standard" }             │
│  overriddenSides: Set("haut", "gauche")                     │
│  → No propagation (gauche already in overriddenSides)       │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ User selects "Montants" on "bas"
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  MIXED STATE                                │
│  values: { haut: "Standard", bas: "Montants",               │
│            gauche: "Sans", droite: "Standard" }             │
│  overriddenSides: Set("haut", "gauche", "bas")              │
│  → Propagate "Montants" only to "droite" (not overridden)   │
│  → Trigger highlight on droite only                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Storage

### Prisma JSON Structure

Les habillages sont stockés dans le champ JSON `donneesModifiees` de la table `Menuiserie` :

```json
{
  "largeur": 1200,
  "hauteur": 1100,
  "habillageInt": {
    "haut": "Standard",
    "bas": "Standard",
    "gauche": "Sans",
    "droite": "Standard"
  },
  "habillageExt": {
    "haut": "Montants",
    "bas": "Montants",
    "gauche": "Montants",
    "droite": "Montants"
  }
}
```

**Note**: Pas de migration Prisma nécessaire car le champ est déjà de type `Json`.

---

## Relationships

```
┌─────────────────┐
│   Menuiserie    │
├─────────────────┤
│ donneesModifiees│──┐
│   (Json)        │  │
└─────────────────┘  │
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│  habillageInt   │    │  habillageExt   │
├─────────────────┤    ├─────────────────┤
│ haut: HabValue  │    │ haut: HabValue  │
│ bas: HabValue   │    │ bas: HabValue   │
│ gauche: HabValue│    │ gauche: HabValue│
│ droite: HabValue│    │ droite: HabValue│
└─────────────────┘    └─────────────────┘
```

---

## Migration Notes

### Breaking Changes

1. **Type `HabillagesSide`**: Passe de `number | null` à `HabillageValue | null`
   - Impact: `HabillageInputs.tsx` (sera remplacé)
   - Impact: `MenuiserieSVGEditor.tsx` (adapter les props)

2. **Props `HabillageInputsProps`**: Obsolète, remplacé par `HabillageSectionProps`

### Backward Compatibility

- Les données existantes en base (si numériques) seront ignorées et l'utilisateur devra re-sélectionner
- Alternative: Mapper les anciennes valeurs numériques vers "Standard" au chargement
