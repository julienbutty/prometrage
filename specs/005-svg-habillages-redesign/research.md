# Research: Redesign SVG Editor avec Habillages Intégrés

**Feature**: 005-svg-habillages-redesign
**Date**: 2026-01-01

## 1. Layout Strategy: CSS Grid vs Flexbox

### Decision

**CSS Grid** pour le layout principal desktop/tablet, **Flexbox** pour le layout mobile empilé.

### Rationale

- CSS Grid permet un positionnement précis des éléments autour du SVG central (haut, bas, gauche, droite)
- Le layout cible ressemble à un tableau de bord avec le SVG au centre et les contrôles positionnés autour
- Grid template areas offre une lisibilité du code et facilite la maintenance
- Tailwind CSS v4 supporte nativement les grid template avec `grid-cols-[template]` et `grid-rows-[template]`

### Alternatives Considered

| Option | Avantages | Inconvénients | Décision |
|--------|-----------|---------------|----------|
| Flexbox seul | Simplicité, large support | Difficile de positionner éléments autour d'un centre | ❌ Rejeté |
| CSS Grid + Areas | Lisibilité maximale avec named areas | Verbeux pour un layout simple | ✅ Choisi |
| Absolute positioning | Contrôle pixel-perfect | Maintenance difficile, pas responsive | ❌ Rejeté |
| Table layout | Support ancien navigateurs | Sémantique incorrecte, rigide | ❌ Rejeté |

### Implementation Pattern

```tsx
// Desktop layout (>= 640px)
<div className="sm:grid sm:grid-cols-[auto_1fr_auto] sm:grid-rows-[auto_1fr_auto] sm:gap-4">
  {/* Hab Haut - Position: top center */}
  <div className="sm:col-start-2 sm:row-start-1">...</div>

  {/* Hauteur + Hab Gauche - Position: left */}
  <div className="sm:col-start-1 sm:row-start-2">...</div>

  {/* SVG - Position: center */}
  <div className="sm:col-start-2 sm:row-start-2">...</div>

  {/* Hab Droite - Position: right */}
  <div className="sm:col-start-3 sm:row-start-2">...</div>

  {/* Largeur + Hab Bas + Apply buttons - Position: bottom */}
  <div className="sm:col-start-2 sm:row-start-3">...</div>
</div>
```

---

## 2. Component Architecture: HabillageGroup

### Decision

Créer un nouveau composant **HabillageGroup** qui empile verticalement le sélecteur Intérieur et Extérieur pour un même côté.

### Rationale

- Un seul côté de fenêtre = un seul groupe visuel avec les 2 types d'habillage
- Réduit la duplication de code (actuellement 2 sections séparées avec 4 selects chacune)
- Facilite le styling distinctif bleu/orange côte à côte
- Permet une animation highlight cohérente sur le groupe

### Alternatives Considered

| Option | Avantages | Inconvénients | Décision |
|--------|-----------|---------------|----------|
| Garder HabillageSection avec layout modifié | Moins de refactoring | Layout grid complexe à maintenir | ❌ Rejeté |
| HabillageGroup (Int+Ext empilé) | Cohérence visuelle, composant simple | Nouveau composant à créer | ✅ Choisi |
| Inline dans MenuiserieSVGEditor | Pas de nouveau fichier | Code non réutilisable, fichier trop long | ❌ Rejeté |

### Props Interface

```typescript
interface HabillageGroupProps {
  /** Côté de la menuiserie */
  side: Side;
  /** Valeurs actuelles Int/Ext */
  values: {
    interieur: HabillageValue | null;
    exterieur: HabillageValue | null;
  };
  /** Callbacks de changement */
  onIntChange: (value: HabillageValue) => void;
  onExtChange: (value: HabillageValue) => void;
  /** Options disponibles (dépend matériau/pose) */
  options: HabillageConfig;
  /** Animation highlight pour Int/Ext */
  highlightInt?: boolean;
  highlightExt?: boolean;
  /** Orientation du groupe (vertical par défaut) */
  orientation?: 'vertical' | 'horizontal';
}
```

---

## 3. Pills/Chips Styling Pattern

### Decision

Adapter le **HabillageSelect** existant pour utiliser un style "pill" avec bordure et fond coloré selon le type (Int/Ext).

### Rationale

- Design défini dans la spec : bleu pour Intérieur, orange pour Extérieur
- Améliore la distinction visuelle sans refonte complète du composant Select
- Le composant shadcn/ui Select reste la base, seules les classes CSS changent

### Implementation

```typescript
// Dans HabillageSelect ou HabillageGroup
const pillStyles = {
  interieur: {
    border: 'border-blue-500',
    background: 'bg-blue-50',
    text: 'text-blue-700',
    ring: 'ring-blue-400',
  },
  exterieur: {
    border: 'border-orange-500',
    background: 'bg-orange-50',
    text: 'text-orange-700',
    ring: 'ring-orange-400',
  },
};

// SelectTrigger avec styles pill
<SelectTrigger
  className={cn(
    'min-h-[40px] border-2 rounded-full',
    styles.border,
    styles.background,
    isHighlighted && `ring-2 ${styles.ring}`
  )}
>
```

---

## 4. Propagation Logic Enhancement

### Decision

Étendre le hook **useHabillagesPropagation** avec une méthode `applyToAll` pour les boutons explicites.

### Rationale

- La logique de propagation automatique existe déjà (première sélection)
- Le bouton "Appliquer à tous" nécessite une action explicite différente
- Garder la séparation des responsabilités : hook gère la logique, UI appelle les méthodes

### Alternatives Considered

| Option | Avantages | Inconvénients | Décision |
|--------|-----------|---------------|----------|
| Nouveau hook useApplyToAll | Séparation claire | Duplication d'état, synchronisation complexe | ❌ Rejeté |
| Étendre useHabillagesPropagation | Logique centralisée, pas de duplication | Hook légèrement plus gros | ✅ Choisi |
| Logique inline dans composant | Simple | Pas réutilisable, mélange UI/logique | ❌ Rejeté |

### API Extension

```typescript
interface UseHabillagesPropagationReturn {
  // Existant
  values: HabillagesValues;
  highlightedSides: Set<Side>;
  handleChange: (side: Side, value: HabillageValue) => void;
  reset: () => void;

  // Nouveau
  applyToAll: () => void;  // Applique la première valeur non-null à tous les côtés
}
```

### Implementation Logic

```typescript
const applyToAll = useCallback(() => {
  setValues((prev) => {
    // Trouver la première valeur non-null (ordre: haut, bas, gauche, droite)
    const firstValue = SIDES.find((side) => prev[side] !== null);
    if (!firstValue) return prev; // Rien à propager si tout est null

    const valueToApply = prev[firstValue];
    const newValues: HabillagesValues = {
      haut: valueToApply,
      bas: valueToApply,
      gauche: valueToApply,
      droite: valueToApply,
    };

    // Highlight tous les côtés sauf le premier (source)
    triggerHighlight(SIDES.filter((s) => s !== firstValue));

    // Tous les côtés deviennent "overridden"
    setOverriddenSides(new Set(SIDES));

    return newValues;
  });
}, [triggerHighlight]);
```

---

## 5. ApplyToAllButton Component

### Decision

Créer un composant **ApplyToAllButton** qui affiche deux boutons distincts pour Int et Ext.

### Rationale

- Distinction visuelle claire (bleu pour Int, orange pour Ext)
- Composant réutilisable et testable indépendamment
- Évite la duplication de logique dans le parent

### Props Interface

```typescript
interface ApplyToAllButtonProps {
  /** Type d'habillage */
  type: 'interieur' | 'exterieur';
  /** Callback pour appliquer à tous */
  onApply: () => void;
  /** Désactivé si aucune valeur à propager */
  disabled?: boolean;
  /** Classes additionnelles */
  className?: string;
}
```

### Layout dans MenuiserieSVGEditor

```tsx
// Zone bas - après Largeur + Hab Bas
<div className="flex gap-2 justify-center mt-4">
  <ApplyToAllButton
    type="interieur"
    onApply={habillagesInt.applyToAll}
    disabled={!hasAnyIntValue}
  />
  <ApplyToAllButton
    type="exterieur"
    onApply={habillagesExt.applyToAll}
    disabled={!hasAnyExtValue}
  />
</div>
```

---

## 6. Mobile Layout Order

### Decision

Sur mobile (< 640px), les éléments sont empilés verticalement dans l'ordre suivant :

1. Habillages Haut (Int + Ext)
2. SVG centré
3. Hauteur + Habillages Gauche
4. Habillages Droite
5. Largeur + Habillages Bas
6. Boutons "Appliquer à tous"

### Rationale

- Ordre logique de lecture haut → bas
- Le SVG reste visible rapidement après le scroll initial
- Les dimensions (Hauteur/Largeur) sont groupées avec leurs habillages adjacents
- Les boutons d'action sont en fin de parcours (call-to-action)

### Tailwind Classes Pattern

```tsx
// Container principal
<div className="flex flex-col gap-4 sm:grid sm:grid-cols-[auto_1fr_auto] sm:grid-rows-[auto_1fr_auto]">

  {/* 1. Hab Haut - toujours visible en premier sur mobile */}
  <div className="order-1 sm:order-none sm:col-start-2 sm:row-start-1">
    <HabillageGroup side="haut" ... />
  </div>

  {/* 2. SVG - deuxième sur mobile */}
  <div className="order-2 sm:order-none sm:col-start-2 sm:row-start-2">
    <MenuiserieSVG ... />
  </div>

  {/* 3. Hauteur + Hab Gauche */}
  <div className="order-3 sm:order-none sm:col-start-1 sm:row-start-2">
    <DimensionInput label="Hauteur" ... />
    <HabillageGroup side="gauche" ... />
  </div>

  {/* 4. Hab Droite */}
  <div className="order-4 sm:order-none sm:col-start-3 sm:row-start-2">
    <HabillageGroup side="droite" ... />
  </div>

  {/* 5. Largeur + Hab Bas */}
  <div className="order-5 sm:order-none sm:col-start-2 sm:row-start-3">
    <DimensionInput label="Largeur" ... />
    <HabillageGroup side="bas" ... />
  </div>

  {/* 6. Boutons Apply */}
  <div className="order-6 sm:order-none sm:col-span-3 sm:row-start-4">
    <ApplyToAllButton type="interieur" ... />
    <ApplyToAllButton type="exterieur" ... />
  </div>
</div>
```

---

## 7. Allège Removal from SVG Editor

### Decision

Retirer le champ `hauteurAllege` du composant `MenuiserieSVGEditor`. Il restera dans la section "Détails additionnels" du formulaire parent.

### Rationale

- Simplifie l'interface de l'éditeur SVG (10 champs au lieu de 11)
- L'allège est moins fréquemment modifiée que les dimensions principales et habillages
- Cohérent avec le principe de Progressive Disclosure (Constitution VII)

### Implementation

```typescript
// AVANT dans MenuiserieSVGEditor
<DimensionInput
  label="Hauteur d'allège"
  name="hauteurAllege"
  ...
/>

// APRÈS: supprimé du composant
// L'allège reste gérée par le formulaire parent (page.tsx)
```

### Props Cleanup

```typescript
// Retirer de MenuiserieSVGEditorProps:
// - dimensions.hauteurAllege
// - originalDimensions?.hauteurAllege
// - onDimensionChange pour 'hauteurAllege'

interface MenuiserieSVGEditorProps {
  dimensions: {
    largeur: string;
    hauteur: string;
    // hauteurAllege: string; // RETIRÉ
  };
  // ...
}
```

---

## 8. Animation Timing

### Decision

Garder la durée d'animation highlight à **300ms** comme actuellement implémenté.

### Rationale

- 300ms est un standard UX pour les micro-interactions (perceptible mais pas gênant)
- Déjà testé et validé dans l'implémentation actuelle
- Cohérent avec les guidelines Material Design (200-300ms pour feedback)

### Implementation

Aucun changement requis - le hook `useHabillagesPropagation` utilise déjà 300ms.

---

## Summary

| Topic | Decision | Confidence |
|-------|----------|------------|
| Layout Strategy | CSS Grid + Flexbox mobile | High |
| Component Architecture | HabillageGroup (Int+Ext empilé) | High |
| Styling | Pills avec bordure/fond coloré | High |
| Propagation Logic | Étendre useHabillagesPropagation | High |
| Apply Button | Composant séparé, 2 boutons | High |
| Mobile Order | Hab Haut → SVG → Gauche → Droite → Bas → Boutons | High |
| Allège | Retirée de l'éditeur SVG | High |
| Animation | 300ms (inchangé) | High |

**Toutes les décisions sont confirmées avec haute confiance. Pas de NEEDS CLARIFICATION restant.**
