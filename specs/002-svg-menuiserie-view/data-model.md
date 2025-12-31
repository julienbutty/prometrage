# Data Model: Visualisation SVG Menuiserie

**Feature**: 002-svg-menuiserie-view
**Date**: 2025-12-31

## Overview

Cette feature ne crée pas de nouvelles entités en base de données. Elle utilise les données existantes dans `donneesOriginales` et `donneesModifiees` du modèle `Menuiserie`. Seuls les types TypeScript pour les composants React sont définis ici.

## Entities (TypeScript Types)

### MenuiserieType

Enum des types de menuiseries supportés pour la génération SVG.

```typescript
type MenuiserieType =
  | 'fenetre'
  | 'porte-fenetre'
  | 'coulissant'
  | 'chassis-fixe'
  | 'chassis-soufflet';
```

### MenuiserieSVGProps

Props du composant de rendu SVG.

```typescript
interface MenuiserieSVGProps {
  /** Type de menuiserie pour sélectionner le template */
  type: MenuiserieType;
  /** Nombre de vantaux (0 pour fixe, 1-4 pour autres) */
  nbVantaux: number;
  /** Largeur du viewBox SVG (défaut: 200) */
  width?: number;
  /** Hauteur du viewBox SVG (défaut: 150) */
  height?: number;
  /** Classes CSS additionnelles */
  className?: string;
}
```

### HabillagesSide

Structure pour un côté d'habillage.

```typescript
interface HabillagesSide {
  haut: number | null;
  bas: number | null;
  gauche: number | null;
  droite: number | null;
}
```

### DimensionsData

Données des dimensions pour le formulaire.

```typescript
interface DimensionsData {
  largeur: number | null;
  hauteur: number | null;
  hauteurAllege: number | null;
}
```

### MenuiserieSVGEditorProps

Props du composant éditeur complet (SVG + inputs).

```typescript
interface MenuiserieSVGEditorProps {
  /** ID de la menuiserie (pour les mutations) */
  menuiserieId: string;
  /** Données originales du PDF */
  donneesOriginales: {
    typeMenuiserie: string;
    largeur?: number;
    hauteur?: number;
    hauteurAllege?: number;
    habillagesInterieurs?: Partial<HabillagesSide>;
    habillagesExterieurs?: Partial<HabillagesSide>;
  };
  /** Données modifiées (état actuel) */
  donneesModifiees?: {
    largeur?: number;
    hauteur?: number;
    hauteurAllege?: number;
    habillagesInterieurs?: Partial<HabillagesSide>;
    habillagesExterieurs?: Partial<HabillagesSide>;
  };
  /** Callback après sauvegarde réussie */
  onSave?: () => void;
}
```

## Utility Functions

### parseMenuiserieType

Extrait le type et le nombre de vantaux depuis le string du PDF.

```typescript
function parseMenuiserieType(typeString: string): {
  type: MenuiserieType;
  nbVantaux: number;
}

// Exemples:
// "Fenêtre 2 vantaux" → { type: 'fenetre', nbVantaux: 2 }
// "Coulissant 3 vantaux 3 rails" → { type: 'coulissant', nbVantaux: 3 }
// "Châssis fixe en dormant" → { type: 'chassis-fixe', nbVantaux: 0 }
// "Porte-fenêtre 1 vantail" → { type: 'porte-fenetre', nbVantaux: 1 }
```

### Mapping Patterns

| Pattern dans PDF | MenuiserieType | Extraction nbVantaux |
|------------------|----------------|---------------------|
| /fen[êe]tre/i | `fenetre` | Regex `(\d+)\s*vanta` |
| /porte[- ]fen[êe]tre/i | `porte-fenetre` | Regex `(\d+)\s*vanta` |
| /coulissant/i | `coulissant` | Regex `(\d+)\s*vanta` |
| /ch[âa]ssis\s*fixe/i | `chassis-fixe` | 0 (toujours) |
| /ch[âa]ssis.*soufflet/i | `chassis-soufflet` | 1 (toujours) |
| (default) | `fenetre` | 1 |

## Database Impact

**Migration Prisma**: Non requise

Les champs `donneesOriginales` et `donneesModifiees` sont déjà de type `Json` dans le schéma Prisma. Les nouvelles propriétés (habillages) sont stockées dans ces champs JSON flexibles.

## Validation Rules

### Dimensions

| Champ | Type | Min | Max | Required |
|-------|------|-----|-----|----------|
| largeur | number | 100 | 10000 | Non |
| hauteur | number | 100 | 10000 | Non |
| hauteurAllege | number | 0 | 3000 | Non |

### Habillages

| Champ | Type | Min | Max | Required |
|-------|------|-----|-----|----------|
| haut/bas/gauche/droite | number | 0 | 500 | Non |

## State Management

### Form State (React Hook Form)

```typescript
interface MenuiserieSVGFormData {
  largeur: string; // Input text, converti en number
  hauteur: string;
  hauteurAllege: string;
  habillagesInterieurs: {
    haut: string;
    bas: string;
    gauche: string;
    droite: string;
  };
  habillagesExterieurs: {
    haut: string;
    bas: string;
    gauche: string;
    droite: string;
  };
}
```

### Mutation Payload

```typescript
interface UpdateMenuiseriePayload {
  donneesModifiees: {
    largeur?: number;
    hauteur?: number;
    hauteurAllege?: number;
    habillagesInterieurs?: Partial<HabillagesSide>;
    habillagesExterieurs?: Partial<HabillagesSide>;
    // ... autres champs existants préservés
  };
}
```

## Backward Compatibility

✅ **Compatible** - Cette feature ajoute uniquement des composants UI. Les données existantes restent valides. Les nouveaux champs (habillages) sont optionnels.
