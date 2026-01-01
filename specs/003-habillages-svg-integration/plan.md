# Implementation Plan: Intégration des Habillages Int/Ext autour du SVG

**Branch**: `003-habillages-svg-integration` | **Date**: 2025-01-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-habillages-svg-integration/spec.md`

## Summary

Remplacer le composant `HabillageInputs` existant (inputs numériques) par un nouveau composant utilisant des sélecteurs (Select) avec les valeurs métier d'enum (Standard, Sans, Haut, Bas, Montants). Implémenter la propagation automatique des valeurs entre les 4 côtés avec animation de feedback, et permettre la surcharge individuelle.

## Technical Context

**Language/Version**: TypeScript 5.x / Next.js 15.5.4 / React 19.1.0
**Primary Dependencies**: React Hook Form, Zod, TanStack Query, shadcn/ui (Select), Tailwind CSS v4
**Storage**: PostgreSQL 16 via Prisma (champ JSON `donneesModifiees` existant)
**Testing**: Vitest + React Testing Library
**Target Platform**: Web (Mobile-first, 320px-1920px)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Animation highlight <300ms, réponse tactile <100ms
**Constraints**: Touch targets 44x44px minimum, mobile-first responsive
**Scale/Scope**: ~150 lignes de code nouveau, 1 composant principal + 1 sous-composant

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Mobile-First Design | PASS | FR-008, FR-009 spécifient layout mobile et touch targets 44x44px |
| II. TDD | WILL COMPLY | Tests à écrire avant implémentation (tasks.md) |
| III. Strict Type Safety | WILL COMPLY | Nouveau type `HabillageValue` enum + mise à jour `HabillagesSide` |
| IV. Server-Side Validation | WILL COMPLY | Zod schema pour valider les valeurs d'habillage |
| V. AI-Powered PDF Parsing | N/A | Cette feature est UI-only, pas de parsing PDF |
| VI. Optimistic UI Updates | WILL COMPLY | TanStack Query déjà en place sur la page |
| VII. Progressive Disclosure | PASS | Habillages dans section dédiée sous le SVG |

**Constitution Check Result**: PASS - Aucune violation, prêt pour Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/003-habillages-svg-integration/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A - pas de nouvelle API)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── menuiseries/
│       ├── HabillageInputs.tsx      # À REMPLACER
│       ├── HabillageSelect.tsx      # NOUVEAU - Sélecteur individuel
│       ├── HabillageSection.tsx     # NOUVEAU - Section avec propagation
│       └── MenuiserieSVGEditor.tsx  # À MODIFIER - Intégration
├── lib/
│   ├── svg/
│   │   └── types.ts                 # À MODIFIER - Nouveaux types
│   └── validations/
│       └── habillage.ts             # NOUVEAU - Zod schema
├── hooks/
│   └── useHabillagesPropagation.ts  # NOUVEAU - Logique propagation
└── __tests__/
    └── unit/
        ├── components/
        │   └── HabillageSection.test.tsx    # NOUVEAU
        └── hooks/
            └── useHabillagesPropagation.test.ts  # NOUVEAU
```

**Structure Decision**: Extension de la structure Next.js App Router existante. Pas de nouvelle route API (utilisation de l'API PUT /api/menuiseries/[id] existante).

## Complexity Tracking

> Aucune violation de constitution - tableau non applicable
