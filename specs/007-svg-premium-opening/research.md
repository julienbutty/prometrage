# Research: SVG Premium et Indicateur d'Ouverture

**Feature**: 007-svg-premium-opening
**Date**: 2026-01-10

## Research Tasks

### 1. SVG Premium Styling - Best Practices

**Context**: Les SVG actuels utilisent des couleurs plates (`fill`, `stroke`) sans effets visuels.

**Decision**: Utiliser des `<linearGradient>` et `<filter>` SVG natifs pour le rendu premium.

**Rationale**:
- Les gradients SVG sont supportés par tous les navigateurs modernes
- Les filtres SVG (`feDropShadow`, `feGaussianBlur`) permettent des ombres légères
- Pas de dépendance externe (CSS filters moins performants sur mobile)
- Compatible avec le rendu React JSX existant

**Alternatives considered**:
- CSS filters (`filter: drop-shadow()`) - Rejeté: moins performant sur mobile, problèmes de clipping
- Canvas 2D - Rejeté: perte de l'accessibilité SVG, plus complexe à maintenir
- Bibliothèque SVG (GSAP, Snap.svg) - Rejeté: over-engineering, dépendance inutile

**Implementation Notes**:
```xml
<!-- Dégradé pour cadre aluminium -->
<linearGradient id="frameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
  <stop offset="0%" style="stop-color:#6B7280"/>
  <stop offset="50%" style="stop-color:#4B5563"/>
  <stop offset="100%" style="stop-color:#374151"/>
</linearGradient>

<!-- Ombre légère -->
<filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
  <feDropShadow dx="1" dy="1" stdDeviation="1" flood-opacity="0.3"/>
</filter>
```

---

### 2. Indicateur d'Ouverture - Standards Menuiserie

**Context**: Les artisans utilisent des symboles standardisés pour indiquer le sens d'ouverture.

**Decision**: Utiliser le symbole "arc + triangle" standard de l'industrie menuiserie.

**Rationale**:
- Symbole universellement reconnu par les professionnels
- Représente visuellement le mouvement de l'ouvrant
- Peut être orienté (gauche/droite) et combiné (oscillo-battant)

**Alternatives considered**:
- Flèche simple - Rejeté: moins explicite, peut être confondu avec direction de coulissement
- Texte "G/D" - Rejeté: prend de la place, moins visuel
- Position de la poignée seule - Rejeté: insuffisant pour comprendre le sens d'ouverture

**Implementation Notes**:
```
Ouverture GAUCHE:        Ouverture DROITE:
    ┌────────┐              ┌────────┐
    │        │              │        │
    │   ╱    │              │    ╲   │
    │  ╱     │              │     ╲  │
    │ ╱      │              │      ╲ │
    └────────┘              └────────┘
    Arc depuis le côté gauche    Arc depuis le côté droit
```

Pour l'oscillo-battant, combiner:
- Arc horizontal (gauche/droite) pour ouverture latérale
- Arc vertical (en haut) pour basculement

---

### 3. Détection Oscillo-Battant - Patterns

**Context**: L'intitulé PDF contient parfois "oscillo-battant" ou des variantes.

**Decision**: Étendre `parseMenuiserieType` avec un nouveau pattern pour détecter le mode oscillo-battant.

**Rationale**:
- La logique de parsing existe déjà dans `svg-utils.ts`
- Ajouter une propriété `isOscilloBattant: boolean` au résultat
- Pas de nouveau type SVG, juste un modificateur sur fenêtre/porte-fenêtre

**Patterns à détecter**:
```typescript
const OSCILLO_BATTANT_PATTERNS = [
  /oscillo[\s-]?battant/i,
  /\bOB\b/,  // Abréviation courante
  /tilt[\s-]?turn/i,  // Version anglaise (rare mais possible)
];
```

**Alternatives considered**:
- Nouveau type `MenuiserieType = 'oscillo-battant'` - Rejeté: c'est un modificateur, pas un type distinct
- Champ séparé dans les données PDF - Rejeté: l'info est dans l'intitulé

---

### 4. Palette de Couleurs Premium

**Context**: La palette actuelle utilise des gris Tailwind basiques.

**Decision**: Créer une palette premium avec nuances métalliques.

**Rationale**:
- Différencier visuellement ALU (gris métallique) et PVC (blanc cassé)
- Ajouter des reflets subtils pour un aspect premium
- Conserver la lisibilité sur tous les écrans

**Nouvelle Palette**:
```typescript
const PREMIUM_COLORS = {
  // Cadre ALU
  frameAlu: {
    base: '#4B5563',
    highlight: '#6B7280',
    shadow: '#374151',
  },
  // Cadre PVC
  framePvc: {
    base: '#F3F4F6',
    highlight: '#FFFFFF',
    shadow: '#D1D5DB',
  },
  // Vitrage
  glass: {
    base: '#DBEAFE',
    reflection: 'rgba(255,255,255,0.3)',
  },
  // Poignée
  handle: {
    base: '#6B7280',
    highlight: '#9CA3AF',
  },
  // Indicateur ouverture
  openingIndicator: {
    stroke: '#1E40AF',  // Bleu foncé pour visibilité
    fill: 'rgba(59, 130, 246, 0.2)',  // Bleu transparent
  },
};
```

---

### 5. Performance SVG Mobile

**Context**: Contrainte de taille < 15KB et rendu < 100ms.

**Decision**: Optimiser en réutilisant les définitions (`<defs>`) et en limitant les filtres.

**Rationale**:
- Les `<defs>` permettent de définir gradients/filtres une seule fois
- Limiter `feGaussianBlur` à `stdDeviation="1"` max (performance)
- Utiliser `will-change: transform` pour les animations

**Optimizations**:
1. Définir tous les gradients dans un `<defs>` partagé
2. Pas d'animation SVG complexe (SMIL) - utiliser CSS si nécessaire
3. Limiter le nombre de paths (< 20 par SVG)
4. viewBox fixe pour éviter les recalculs

**Alternatives considered**:
- SVG sprites - Rejeté: complexifie le code React
- Lazy loading SVG - Rejeté: SVG déjà inline, pas de gain

---

### 6. Accessibilité SVG

**Context**: Les SVG doivent être accessibles aux lecteurs d'écran.

**Decision**: Ajouter `role="img"` et `aria-label` descriptif.

**Rationale**:
- Conformité WCAG 2.1
- Les artisans peuvent utiliser des outils d'accessibilité
- Pas de surcoût de développement

**Implementation**:
```tsx
<svg
  role="img"
  aria-label={`Fenêtre ${nbVantaux} vantaux, ouverture à ${sensOuverture}`}
  viewBox="0 0 200 150"
>
  <title>Fenêtre {nbVantaux} vantaux</title>
  <desc>Ouverture à {sensOuverture}</desc>
  {/* ... */}
</svg>
```

---

## Summary of Decisions

| Topic | Decision | Key Reason |
|-------|----------|------------|
| Styling | SVG natif (gradients, filters) | Performance mobile, compatibilité |
| Indicateur | Arc + triangle standard | Reconnu par les professionnels |
| Oscillo-battant | Pattern regex sur intitulé | Cohérent avec parsing existant |
| Palette | Couleurs métalliques différenciées | Distinction ALU/PVC, aspect premium |
| Performance | Réutilisation `<defs>`, limiter filtres | < 15KB, < 100ms |
| Accessibilité | `aria-label`, `<title>`, `<desc>` | Conformité WCAG |

## Open Questions Resolved

Aucune question ouverte - toutes les clarifications ont été résolues lors de la recherche.
