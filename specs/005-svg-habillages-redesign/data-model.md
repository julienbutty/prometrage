# Data Model: Redesign SVG Editor avec Habillages Intégrés

**Feature**: 005-svg-habillages-redesign
**Date**: 2026-01-01

## Overview

Cette feature est principalement frontend (UI). Le modèle de données se concentre sur les interfaces TypeScript des composants et l'état local React. Aucune modification de schéma Prisma n'est requise - les habillages sont déjà stockés dans le champ JSON `donneesModifiees`.

---

## 1. Existing Types (Unchanged)

Ces types existent déjà dans `src/lib/validations/habillage.ts` et restent inchangés :

```typescript
// Côtés de la menuiserie
export type Side = 'haut' | 'bas' | 'gauche' | 'droite';
export const SIDES: readonly Side[] = ['haut', 'bas', 'gauche', 'droite'];

// Valeur d'habillage (string dynamique selon matériau/pose)
export type HabillageValue = string;

// Option pour le Select
export interface HabillageOption {
  value: HabillageValue;
  label: string;
}

// Configuration des options selon matériau/pose
export interface HabillageConfig {
  interieurs: HabillageOption[];
  exterieurs: HabillageOption[];
}

// Labels des côtés pour l'UI
export const SIDE_LABELS: Record<Side, string> = {
  haut: 'Haut',
  bas: 'Bas',
  gauche: 'Gauche',
  droite: 'Droite',
};

// Valeurs initiales vides
export const EMPTY_HABILLAGES: Record<Side, HabillageValue | null> = {
  haut: null,
  bas: null,
  gauche: null,
  droite: null,
};
```

---

## 2. Component State Types

### 2.1 HabillageGroupProps (New)

Interface pour le nouveau composant `HabillageGroup` qui regroupe Int + Ext pour un côté.

```typescript
/**
 * Props pour HabillageGroup
 * Représente un groupe de 2 sélecteurs (Int + Ext) pour un côté donné
 */
export interface HabillageGroupProps {
  /** Côté de la menuiserie (haut, bas, gauche, droite) */
  side: Side;

  /** Valeurs actuelles pour ce côté */
  values: {
    interieur: HabillageValue | null;
    exterieur: HabillageValue | null;
  };

  /** Callback quand l'habillage intérieur change */
  onIntChange: (value: HabillageValue) => void;

  /** Callback quand l'habillage extérieur change */
  onExtChange: (value: HabillageValue) => void;

  /** Configuration des options (dépend du matériau/pose) */
  options: HabillageConfig;

  /** Animation highlight pour l'habillage intérieur */
  highlightInt?: boolean;

  /** Animation highlight pour l'habillage extérieur */
  highlightExt?: boolean;

  /** Orientation du groupe (défaut: 'vertical') */
  orientation?: 'vertical' | 'horizontal';

  /** Classes CSS additionnelles */
  className?: string;
}
```

### 2.2 ApplyToAllButtonProps (New)

Interface pour le composant bouton "Appliquer à tous".

```typescript
/**
 * Props pour ApplyToAllButton
 * Bouton pour propager une valeur d'habillage à tous les côtés
 */
export interface ApplyToAllButtonProps {
  /** Type d'habillage (détermine la couleur) */
  type: 'interieur' | 'exterieur';

  /** Callback appelé lors du clic */
  onApply: () => void;

  /** Désactiver le bouton (aucune valeur à propager) */
  disabled?: boolean;

  /** Classes CSS additionnelles */
  className?: string;
}
```

### 2.3 HabillageSelectProps (Updated)

Mise à jour pour supporter le styling pill coloré.

```typescript
/**
 * Props pour HabillageSelect (mise à jour)
 */
export interface HabillageSelectProps {
  /** Côté de la menuiserie */
  side: Side;

  /** Valeur actuelle (null si non sélectionnée) */
  value: HabillageValue | null;

  /** Callback quand la valeur change */
  onChange: (value: HabillageValue) => void;

  /** Options d'habillage disponibles */
  options: HabillageOption[];

  /** Animation highlight actif */
  isHighlighted?: boolean;

  /** Type pour le styling pill (NEW) */
  variant?: 'interieur' | 'exterieur';

  /** Classes CSS additionnelles */
  className?: string;
}
```

### 2.4 MenuiserieSVGEditorProps (Updated)

Mise à jour des props du composant principal.

```typescript
/**
 * Props pour MenuiserieSVGEditor (mise à jour)
 * Suppression de hauteurAllege, ajout de applyToAll handlers
 */
export interface MenuiserieSVGEditorProps {
  /** Type de menuiserie (string du PDF) */
  typeMenuiserie: string;

  /** Valeurs des dimensions (SANS hauteurAllege) */
  dimensions: {
    largeur: string;
    hauteur: string;
    // hauteurAllege retiré - géré par le formulaire parent
  };

  /** Valeurs originales pour placeholders */
  originalDimensions?: {
    largeur?: number;
    hauteur?: number;
    // hauteurAllege retiré
  };

  /** Callback changement dimension */
  onDimensionChange?: (field: 'largeur' | 'hauteur', value: string) => void;

  /** Valeurs des habillages intérieurs (4 côtés) */
  habillagesInterieurs?: Record<Side, HabillageValue | null>;

  /** Callback changement habillage intérieur */
  onHabillageIntChange?: (side: Side, value: HabillageValue) => void;

  /** Côtés intérieurs en animation highlight */
  highlightedIntSides?: Set<Side>;

  /** Callback "Appliquer à tous" pour intérieurs (NEW) */
  onApplyIntToAll?: () => void;

  /** Valeurs des habillages extérieurs (4 côtés) */
  habillagesExterieurs?: Record<Side, HabillageValue | null>;

  /** Callback changement habillage extérieur */
  onHabillageExtChange?: (side: Side, value: HabillageValue) => void;

  /** Côtés extérieurs en animation highlight */
  highlightedExtSides?: Set<Side>;

  /** Callback "Appliquer à tous" pour extérieurs (NEW) */
  onApplyExtToAll?: () => void;

  /** Configuration des options d'habillage */
  habillageConfig?: HabillageConfig;

  /** Afficher les habillages (défaut: true) */
  showHabillages?: boolean;

  /** Classes CSS additionnelles */
  className?: string;
}
```

---

## 3. Hook State Types

### 3.1 UseHabillagesPropagationReturn (Updated)

Extension du type de retour du hook pour inclure `applyToAll`.

```typescript
/**
 * Type de retour du hook useHabillagesPropagation (mise à jour)
 */
export interface UseHabillagesPropagationReturn {
  /** Valeurs actuelles des 4 côtés */
  values: Record<Side, HabillageValue | null>;

  /** Côtés actuellement en animation highlight */
  highlightedSides: Set<Side>;

  /** Handler de changement avec propagation automatique */
  handleChange: (side: Side, value: HabillageValue) => void;

  /** Réinitialise les valeurs et l'état de propagation */
  reset: () => void;

  /** Applique la première valeur non-null à tous les côtés (NEW) */
  applyToAll: () => void;

  /** Indique si au moins une valeur est définie (NEW) */
  hasAnyValue: boolean;
}
```

---

## 4. Styling Types

### 4.1 PillStyleConfig

Configuration des styles pill pour les sélecteurs.

```typescript
/**
 * Configuration des styles pill pour Int/Ext
 */
export interface PillStyleConfig {
  border: string;       // e.g., 'border-blue-500'
  background: string;   // e.g., 'bg-blue-50'
  text: string;         // e.g., 'text-blue-700'
  ring: string;         // e.g., 'ring-blue-400'
  icon: string;         // e.g., '🔵' ou '🏠'
}

export const PILL_STYLES: Record<'interieur' | 'exterieur', PillStyleConfig> = {
  interieur: {
    border: 'border-blue-500',
    background: 'bg-blue-50',
    text: 'text-blue-700',
    ring: 'ring-blue-400',
    icon: '🔵',
  },
  exterieur: {
    border: 'border-orange-500',
    background: 'bg-orange-50',
    text: 'text-orange-700',
    ring: 'ring-orange-400',
    icon: '🟠',
  },
};
```

---

## 5. Layout Types

### 5.1 LayoutPosition

Positions dans le grid layout.

```typescript
/**
 * Positions des éléments dans le grid desktop
 */
export type LayoutPosition = 'top' | 'bottom' | 'left' | 'right' | 'center';

/**
 * Mapping côté → position grid
 */
export const SIDE_TO_POSITION: Record<Side, LayoutPosition> = {
  haut: 'top',
  bas: 'bottom',
  gauche: 'left',
  droite: 'right',
};
```

---

## 6. Database Storage (Unchanged)

Les habillages sont stockés dans le champ JSON `donneesModifiees` de la table `Menuiserie` :

```typescript
// Structure dans donneesModifiees (déjà existante)
interface DonneesModifiees {
  // ... autres champs
  habillageInt?: {
    haut?: string;
    bas?: string;
    gauche?: string;
    droite?: string;
  };
  habillageExt?: {
    haut?: string;
    bas?: string;
    gauche?: string;
    droite?: string;
  };
}
```

**Aucune migration Prisma requise.**

---

## 7. Validation Rules

### 7.1 Business Rules

| Rule | Description | Validation |
|------|-------------|------------|
| R1 | Une valeur d'habillage doit être une option valide pour le matériau/pose | Vérifier que `value ∈ options` |
| R2 | Les 4 côtés sont optionnels (peuvent être null) | `value: HabillageValue \| null` |
| R3 | La propagation auto ne s'applique que si tous les côtés sont null | `SIDES.every(s => values[s] === null)` |
| R4 | "Appliquer à tous" nécessite au moins une valeur définie | `SIDES.some(s => values[s] !== null)` |

### 7.2 UI Rules

| Rule | Description | Implementation |
|------|-------------|----------------|
| U1 | Touch target minimum 40px | `min-h-[40px]` sur SelectTrigger |
| U2 | Animation highlight 300ms | `setTimeout(clear, 300)` dans hook |
| U3 | Distinction Int/Ext par couleur | Classes Tailwind bleu/orange |
| U4 | Mobile layout vertical | `flex flex-col` puis `sm:grid` |

---

## 8. Entity Relationships

```
┌──────────────────────────────────────────────────────────┐
│                     MenuiserieSVGEditor                  │
│  - dimensions: { largeur, hauteur }                      │
│  - habillagesInt/Ext: Record<Side, HabillageValue>       │
└──────────────────────────┬───────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
┌─────────────────┐ ┌─────────────┐ ┌──────────────────┐
│  HabillageGroup │ │ DimensionIn │ │ ApplyToAllButton │
│  (4 instances)  │ │ (2 inst.)   │ │ (2 instances)    │
│  - side: Side   │ │ - field     │ │ - type: Int/Ext  │
│  - values Int/  │ │ - value     │ │ - onApply()      │
│    Ext          │ │             │ │                  │
└────────┬────────┘ └─────────────┘ └──────────────────┘
         │
         ▼
┌─────────────────┐
│ HabillageSelect │
│ (8 instances)   │
│ - variant       │
│ - value         │
│ - options       │
└─────────────────┘
```

---

## Summary

| Entity | Type | New/Updated | Description |
|--------|------|-------------|-------------|
| HabillageGroupProps | Interface | NEW | Props pour composant groupe Int+Ext |
| ApplyToAllButtonProps | Interface | NEW | Props pour bouton propagation |
| HabillageSelectProps | Interface | UPDATED | Ajout variant pour styling |
| MenuiserieSVGEditorProps | Interface | UPDATED | Retrait allège, ajout applyToAll |
| UseHabillagesPropagationReturn | Interface | UPDATED | Ajout applyToAll, hasAnyValue |
| PillStyleConfig | Interface | NEW | Config styles pill bleu/orange |
| PILL_STYLES | Const | NEW | Mapping type → styles |

**Aucune modification de schéma Prisma requise.**
