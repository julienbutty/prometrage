# Research: Visualisation SVG Menuiserie

**Feature**: 002-svg-menuiserie-view
**Date**: 2025-12-31

## Executive Summary

Cette feature ne nécessite pas de recherche externe majeure. Les technologies utilisées (React SVG, Tailwind CSS) sont déjà maîtrisées dans le projet. Les décisions techniques sont basées sur les patterns existants et les meilleures pratiques React.

## Findings

### 1. Approche de génération SVG

**Decision**: Utiliser React JSX natif pour le SVG (pas de librairie externe)

**Rationale**:
- React supporte nativement le SVG dans JSX
- Pas de dépendance supplémentaire à maintenir
- Contrôle total sur le rendu et les animations
- Meilleure intégration avec le système de types TypeScript
- Performances optimales (pas de couche d'abstraction)

**Alternatives considered**:
- **react-svg** : Rejeté - ajoute une dépendance inutile pour des SVG simples
- **D3.js** : Rejeté - surdimensionné pour des schémas statiques
- **Framer Motion SVG** : Possible pour animations futures, mais non requis MVP

### 2. Structure des templates SVG

**Decision**: Un composant React par type de menuiserie avec props pour les vantaux

**Rationale**:
- Séparation claire des responsabilités
- Facilite les tests unitaires
- Permet l'évolution indépendante de chaque type
- TypeScript peut valider les props spécifiques à chaque type

**Structure retenue**:
```typescript
// Types de base
type MenuiserieType = 'fenetre' | 'porte-fenetre' | 'coulissant' | 'chassis-fixe' | 'chassis-soufflet';

interface MenuiserieSVGProps {
  type: MenuiserieType;
  nbVantaux: number;
  width?: number;  // Taille du SVG (pas de la menuiserie)
  height?: number;
}
```

### 3. Positionnement des inputs autour du SVG

**Decision**: CSS Grid avec zones nommées pour le positionnement

**Rationale**:
- Grid permet un placement précis autour d'un élément central
- Les zones nommées rendent le code lisible et maintenable
- Responsive natif avec media queries
- Support navigateurs > 95%

**Layout Grid**:
```
             [largeur]
[hab-int-g] [   SVG   ] [hauteur]
[hab-ext-g] [         ] [hab-int-d]
            [ allège  ] [hab-ext-d]
```

### 4. Gestion du responsive mobile-first

**Decision**: Changement de layout à 640px (breakpoint `sm`)

**Rationale**:
- Sous 640px : layout vertical (SVG en haut, champs en liste dessous)
- Au-dessus 640px : layout grid avec champs autour du SVG
- Conforme à la Constitution (Principe I: Mobile-First)

**Implementation**:
```tsx
// Mobile: flex column
// Desktop: grid avec zones
<div className="flex flex-col sm:grid sm:grid-cols-[auto_1fr_auto] sm:grid-rows-[auto_1fr_auto]">
```

### 5. Validation et sauvegarde des données

**Decision**: Réutiliser le hook `useMenuiserieMutation` existant

**Rationale**:
- Infrastructure TanStack Query déjà en place
- Optimistic updates déjà implémentés
- Validation Zod existante dans `donneesModifiees`
- Pas de nouvelle API requise

**Champs à ajouter au schéma** (si non existants):
- `habillagesInterieurs: { haut, bas, gauche, droite }`
- `habillagesExterieurs: { haut, bas, gauche, droite }`

### 6. Données existantes dans le modèle

**Decision**: Vérifier et utiliser les champs existants dans `donneesOriginales`

**Analyse du PDF fm_mixte.pdf**:
- `largeur` : ✅ Déjà extrait (ex: 1200)
- `hauteur` : ✅ Déjà extrait (ex: 1100)
- `hauteurAllege` : ✅ Déjà extrait
- `habillagesInterieurs` : À vérifier dans le schéma actuel
- `habillagesExterieurs` : À vérifier dans le schéma actuel
- `typeMenuiserie` : ✅ Déjà extrait (ex: "Fenêtre 2 vantaux")
- `nbVantaux` : À extraire du champ `typeMenuiserie` ou ajouter

## Open Questions

Aucune question ouverte - toutes les décisions techniques sont prises.

## Dependencies

| Dépendance | Version | Usage | Déjà installée |
|------------|---------|-------|----------------|
| React | 19.1.0 | SVG JSX | ✅ Oui |
| Tailwind CSS | v4 | Grid layout | ✅ Oui |
| TanStack Query | Latest | Mutations | ✅ Oui |
| React Hook Form | Latest | Form state | ✅ Oui |
| Zod | Latest | Validation | ✅ Oui |

**Nouvelles dépendances requises**: Aucune

## Risks & Mitigations

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Parsing du type/nbVantaux échoue | Faible | Moyen | Fallback sur schéma générique |
| Layout grid non supporté | Très faible | Élevé | Flexbox fallback (rare) |
| Performance SVG complexe | Faible | Faible | SVG simple, pas d'animations MVP |

## Recommendations

1. **Commencer par le composant SVG de base** (User Story 1) avant d'ajouter les inputs
2. **Créer une fonction utilitaire** pour parser le type de menuiserie et extraire le nombre de vantaux depuis le string `typeMenuiserie`
3. **Utiliser des constantes** pour les couleurs et dimensions du SVG (facilite le theming futur)
4. **Tester sur device réel** pour valider les touch targets (44x44px)
