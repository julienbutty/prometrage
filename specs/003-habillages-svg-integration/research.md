# Research: Intégration des Habillages Int/Ext autour du SVG

**Date**: 2025-01-01
**Branch**: `003-habillages-svg-integration`

## Unknowns Resolved

### 1. Migration des types numériques vers enum string

**Question**: Comment migrer de `HabillagesSide` avec `number | null` vers `string | null` sans casser le code existant ?

**Decision**: Créer un nouveau type `HabillageValue` pour les valeurs enum et modifier `HabillagesSide` pour utiliser `HabillageValue | null` au lieu de `number | null`.

**Rationale**:
- Les données sont stockées en JSON dans Prisma (`donneesModifiees`), donc pas de migration DB nécessaire
- Le type `number` n'était pas utilisé correctement (les habillages métier sont des catégories, pas des mesures)
- TypeScript union type offre une validation compile-time

**Alternatives Rejected**:
- Garder les deux types en parallèle : complexité inutile, confusion
- Utiliser un type générique : perte de type safety

---

### 2. Pattern de propagation avec override

**Question**: Comment implémenter la propagation automatique avec possibilité de surcharge individuelle ?

**Decision**: Utiliser un hook `useHabillagesPropagation` avec un state `Set<Side>` pour tracker les côtés modifiés individuellement.

**Rationale**:
- Le Set permet O(1) lookup pour savoir si un côté est "overridden"
- L'état est UI-only (non persisté), conforme à la clarification spec
- Pattern React standard avec `useReducer` ou `useState`

**Alternatives Rejected**:
- Stocker l'état override dans `donneesModifiees` : over-engineering, spec dit UI-only
- Utiliser un ref : perte de re-render automatique

**Implementation Pattern**:
```typescript
type Side = 'haut' | 'bas' | 'gauche' | 'droite';

interface PropagationState {
  values: Record<Side, HabillageValue | null>;
  overriddenSides: Set<Side>;
}

function useHabillagesPropagation(initialValues: Record<Side, HabillageValue | null>) {
  const [state, setState] = useState<PropagationState>({
    values: initialValues,
    overriddenSides: new Set(),
  });

  const handleChange = (side: Side, value: HabillageValue) => {
    setState(prev => {
      const isFirstChange = prev.overriddenSides.size === 0 &&
                           Object.values(prev.values).every(v => v === null);

      if (isFirstChange) {
        // Propagate to all sides
        return {
          values: { haut: value, bas: value, gauche: value, droite: value },
          overriddenSides: new Set([side]),
        };
      } else {
        // Only change this side, mark as overridden
        return {
          values: { ...prev.values, [side]: value },
          overriddenSides: new Set([...prev.overriddenSides, side]),
        };
      }
    });
  };

  return { values: state.values, handleChange };
}
```

---

### 3. Animation highlight pour feedback propagation

**Question**: Quelle est la meilleure approche pour l'animation de highlight sur les champs propagés ?

**Decision**: Utiliser Tailwind CSS avec classes conditionnelles et `transition-colors` + `setTimeout` pour reset.

**Rationale**:
- Pas besoin de bibliothèque d'animation (Framer Motion serait overkill)
- Tailwind CSS v4 offre des transitions fluides
- Pattern simple : ajouter classe `bg-blue-100` puis la retirer après 300ms

**Implementation Pattern**:
```tsx
const [highlightedSides, setHighlightedSides] = useState<Set<Side>>(new Set());

const triggerHighlight = (sides: Side[]) => {
  setHighlightedSides(new Set(sides));
  setTimeout(() => setHighlightedSides(new Set()), 300);
};

// In component
<Select className={cn(
  'transition-colors duration-300',
  highlightedSides.has(side) && 'bg-blue-100 ring-2 ring-blue-400'
)} />
```

---

### 4. Composant Select shadcn/ui vs native select

**Question**: Utiliser shadcn/ui Select ou un select natif HTML ?

**Decision**: Utiliser shadcn/ui Select (déjà installé dans le projet).

**Rationale**:
- Cohérence visuelle avec le reste de l'application
- Meilleure accessibilité (Radix primitives)
- Touch-friendly avec options plus grandes (h-12)
- Déjà utilisé ailleurs dans le projet

**Alternatives Rejected**:
- Select natif : styling incohérent, options trop petites sur mobile
- Combo/autocomplete : overkill pour 5 options fixes

---

### 5. Distinction visuelle Int/Ext

**Question**: Comment différencier visuellement les habillages intérieurs et extérieurs ?

**Decision**: Utiliser des couleurs de bordure et des labels distinctifs.

**Rationale**:
- Intérieurs : bordure/badge bleu (associé à l'intérieur, plus "froid")
- Extérieurs : bordure/badge orange (associé à l'extérieur, "exposition soleil")
- Labels explicites : "Intérieur" / "Extérieur" en en-tête de section

**Implementation**:
```tsx
// Section Intérieurs
<div className="border-l-4 border-blue-500 pl-4">
  <h4 className="text-blue-700 font-semibold">Habillages intérieurs</h4>
  ...
</div>

// Section Extérieurs
<div className="border-l-4 border-orange-500 pl-4">
  <h4 className="text-orange-700 font-semibold">Habillages extérieurs</h4>
  ...
</div>
```

## Best Practices Applied

### React State Management
- Hook personnalisé pour encapsuler la logique de propagation
- État local (pas besoin de Zustand pour cette feature isolée)
- Séparation claire entre état UI (highlight, override tracking) et données (values)

### TypeScript
- Union type strict pour `HabillageValue`
- Types génériques pour réutilisabilité
- Zod schema aligné avec le type TS

### Testing
- Tests unitaires du hook de propagation (logique pure)
- Tests de composant avec React Testing Library
- Tests des edge cases (premier changement, override, reset)

### Mobile-First
- Layout grid 2x2 sur mobile pour les 4 côtés
- Grid 1x4 sur desktop (inline)
- Touch targets 44px minimum

## Dependencies Check

| Dependency | Status | Notes |
|------------|--------|-------|
| shadcn/ui Select | INSTALLED | Via `@radix-ui/react-select` |
| Tailwind CSS v4 | INSTALLED | Transitions natives |
| Zod | INSTALLED | Pour validation |
| React 19 | INSTALLED | useState, useEffect standards |

**No new dependencies required.**
