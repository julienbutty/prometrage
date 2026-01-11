# Implementation Plan: SVG Premium et Indicateur d'Ouverture

**Branch**: `007-svg-premium-opening` | **Date**: 2026-01-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-svg-premium-opening/spec.md`

## Summary

Amélioration visuelle des schémas SVG de menuiseries avec un rendu premium (dégradés, ombres, palette professionnelle) et ajout d'un indicateur de sens d'ouverture (gauche/droite) interactif. Gestion spéciale des oscillo-battants avec double indicateur d'ouverture (horizontale + verticale).

## Technical Context

**Language/Version**: TypeScript 5.x / Next.js 15.5.4 / React 19.1.0
**Primary Dependencies**: React (JSX SVG), Tailwind CSS v4, shadcn/ui, TanStack Query, React Hook Form, Zod
**Storage**: PostgreSQL 16 via Prisma (champ JSON `donneesModifiees` existant - pas de migration)
**Testing**: Vitest + React Testing Library
**Target Platform**: Web responsive (mobile-first 320px à desktop)
**Project Type**: Web application Next.js App Router
**Performance Goals**: Rendu SVG < 100ms, taille SVG < 15KB
**Constraints**: Mobile-first, touch targets 44x44px, offline-capable (optimistic updates)
**Scale/Scope**: ~5 templates SVG à modifier, 1 nouveau composant de formulaire

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Implementation |
|-----------|--------|----------------|
| I. Mobile-First Design | PASS | SVG responsive avec viewBox, touch targets 44px min pour sélecteur ouverture |
| II. Test-Driven Development | PASS | Tests unitaires pour templates SVG, tests composants pour sélecteur |
| III. Strict Type Safety | PASS | Types TypeScript pour SensOuverture, pas de `any` |
| IV. Server-Side Validation | PASS | Zod schema pour sensOuverture dans donneesModifiees |
| V. AI-Powered PDF Parsing | N/A | Pas de modification de l'extraction PDF |
| VI. Optimistic UI Updates | PASS | TanStack Query mutation avec onMutate pour ouverture |
| VII. Progressive Disclosure | PASS | Champ ouverture visible uniquement pour types applicables |

## Project Structure

### Documentation (this feature)

```text
specs/007-svg-premium-opening/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (minimal - pas de nouvelle API)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── svg/
│   │   ├── menuiserie-templates.tsx  # MODIFY: Ajouter dégradés, ombres, ouverture
│   │   ├── svg-utils.ts              # MODIFY: Détecter oscillo-battant
│   │   ├── types.ts                  # MODIFY: Ajouter types ouverture
│   │   └── premium-styles.ts         # NEW: Constantes styles premium (dégradés, ombres)
│   └── validations/
│       └── menuiserie.ts             # MODIFY: Ajouter sensOuverture au schema
├── components/
│   └── menuiseries/
│       ├── MenuiserieSVG.tsx         # MODIFY: Passer props ouverture aux templates
│       ├── OuvertureSelector.tsx     # NEW: Sélecteur gauche/droite
│       └── SVGZone.tsx               # MODIFY: Intégrer OuvertureSelector
├── app/
│   └── menuiserie/
│       └── [id]/
│           └── page.tsx              # MODIFY: Gérer état ouverture
└── __tests__/
    ├── svg/
    │   ├── premium-templates.test.tsx  # NEW: Tests rendu premium
    │   └── ouverture-indicator.test.tsx # NEW: Tests indicateur ouverture
    └── components/
        └── ouverture-selector.test.tsx  # NEW: Tests sélecteur

**Structure Decision**: Extension de la structure existante sans nouvelle architecture. Les modifications portent principalement sur `src/lib/svg/` pour le rendu et `src/components/menuiseries/` pour l'UI.
```

## Complexity Tracking

> Aucune violation de la Constitution détectée. Pas de justification nécessaire.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| - | - | - |
