# Implementation Plan: Visualisation SVG Menuiserie avec Saisie Contextuelle

**Branch**: `002-svg-menuiserie-view` | **Date**: 2025-12-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-svg-menuiserie-view/spec.md`

## Summary

Créer un composant SVG dynamique qui génère un schéma visuel de la menuiserie basé sur son type et nombre de vantaux. Les champs de saisie (dimensions, habillages) sont positionnés autour du schéma pour une saisie contextuelle intuitive. Le composant s'intègre dans la page existante `/menuiserie/[id]` et utilise les données déjà extraites du PDF.

## Technical Context

**Language/Version**: TypeScript 5.x / Next.js 15.5.4 / React 19.1.0
**Primary Dependencies**: React (JSX SVG), Tailwind CSS v4, TanStack Query, React Hook Form, Zod
**Storage**: PostgreSQL 16 via Prisma (utilisation du champ JSON `donneesModifiees` existant)
**Testing**: Vitest + React Testing Library
**Target Platform**: Web (mobile-first, artisans sur chantier)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: SVG render < 100ms, responsive à 60fps
**Constraints**: Mobile-first (320px minimum), touch targets 44x44px, offline-capable via TanStack Query cache
**Scale/Scope**: 5 types de menuiseries × 4 variantes vantaux = ~20 templates SVG

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Implementation |
|-----------|--------|----------------|
| I. Mobile-First Design | **MUST** | Layout responsive, champs repositionnés verticalement sous le SVG sur mobile |
| II. Test-Driven Development | **MUST** | Tests unitaires pour SVG generator, tests composants pour inputs |
| III. Strict Type Safety | **MUST** | Types stricts pour props SVG, schémas Zod pour formulaire |
| IV. Server-Side Validation | **MUST** | Validation Zod côté API `/api/menuiseries/[id]` existante |
| V. AI-Powered PDF Parsing | N/A | Données déjà extraites, pas de modification du parsing |
| VI. Optimistic UI Updates | **MUST** | useMutation avec onMutate pour saisie instantanée |
| VII. Progressive Disclosure | **SHOULD** | Habillages en section collapsible si écran petit |

**Gate Status**: ✅ PASS - Tous les principes applicables sont respectés

## Project Structure

### Documentation (this feature)

```text
specs/002-svg-menuiserie-view/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A - pas de nouvelle API)
├── checklists/          # Quality checklists
│   └── requirements.md  # Spec quality checklist (complete)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── menuiserie/
│       └── [id]/
│           └── page.tsx          # ⚠️ À MODIFIER: intégrer MenuiserieSVGEditor
├── components/
│   ├── ui/                       # shadcn/ui (existant)
│   └── menuiseries/
│       ├── MenuiserieSVG.tsx     # 🆕 Composant SVG générateur
│       ├── MenuiserieSVGEditor.tsx # 🆕 SVG + champs autour
│       ├── DimensionInput.tsx    # 🆕 Input positionné (largeur/hauteur/allège)
│       └── HabillageInputs.tsx   # 🆕 Groupe 8 inputs habillages
├── lib/
│   ├── svg/
│   │   ├── menuiserie-templates.ts # 🆕 Templates SVG par type
│   │   └── svg-utils.ts          # 🆕 Helpers génération SVG
│   └── validations/
│       └── menuiserie.ts         # Existant, à enrichir si besoin
└── __tests__/
    └── unit/
        └── svg/
            ├── menuiserie-svg.test.ts      # 🆕 Tests génération SVG
            └── svg-editor.test.tsx         # 🆕 Tests composant éditeur
```

**Structure Decision**: Création d'un sous-dossier `lib/svg/` pour la logique de génération SVG et enrichissement du dossier `components/menuiseries/` existant.

## Complexity Tracking

> **Aucune violation de constitution détectée**

Cette feature est une amélioration UI pure qui respecte tous les principes existants.
