# Implementation Plan: Redesign SVG Editor avec Habillages Intégrés

**Branch**: `005-svg-habillages-redesign` | **Date**: 2026-01-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-svg-habillages-redesign/spec.md`

## Summary

Refactorer l'éditeur SVG de menuiserie pour repositionner les 8 champs d'habillages (4 côtés × Int/Ext) directement autour du schéma SVG au lieu de les afficher dans des sections séparées en dessous. Le nouveau layout positionne chaque groupe d'habillages (Haut, Bas, Gauche, Droite) à proximité visuelle du côté correspondant de la fenêtre, avec un comportement de propagation hybride (auto-propagation sur première sélection, pas de propagation ensuite) et des boutons "Appliquer à tous" explicites.

## Technical Context

**Language/Version**: TypeScript 5.x / Next.js 15.5.4 / React 19.1.0
**Primary Dependencies**: React, Tailwind CSS v4, TanStack Query, React Hook Form, Zod, shadcn/ui
**Storage**: PostgreSQL 16 via Prisma (champ JSON `donneesModifiees` existant pour les habillages)
**Testing**: Vitest + React Testing Library
**Target Platform**: Web responsive (mobile 320px → desktop 1920px)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Interactions < 100ms, layout responsive fluide
**Constraints**: Mobile-first (majorité des utilisateurs sur chantier avec téléphone), touch-friendly (zones tactiles ≥ 40px)
**Scale/Scope**: 10 champs interactifs dans l'éditeur SVG, 1 composant principal à refondre

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Mobile-First Design | ✅ PASS | Layout mobile empilé verticalement défini explicitement (< 640px). Touch targets 44px min requis. |
| II. Test-Driven Development | ✅ PASS | Tests Vitest + RTL existants pour composants habillage. Nouveaux tests requis pour le nouveau layout. |
| III. Strict Type Safety | ✅ PASS | Types existants (`Side`, `HabillageValue`, `HabillageConfig`). Pas de `any`. |
| IV. Server-Side Validation | ✅ PASS | Validation Zod existante pour habillages. Pas de changement d'API. |
| V. AI-Powered PDF Parsing | N/A | Feature UI pure, pas de parsing PDF. |
| VI. Optimistic UI Updates | ✅ PASS | TanStack Query déjà utilisé pour mutations. Propagation locale. |
| VII. Progressive Disclosure | ✅ PASS | L'allège est déplacée vers section "Détails additionnels" (collapsible). |

**Gate Result**: ✅ PASS - Aucune violation.

## Project Structure

### Documentation (this feature)

```text
specs/005-svg-habillages-redesign/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (minimal - feature frontend-only)
├── checklists/          # Quality checklists
│   └── requirements.md  # Spec validation checklist
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── menuiserie/
│       └── [id]/
│           └── page.tsx         # Page formulaire (integration point)
├── components/
│   ├── ui/                       # shadcn/ui (Button, Select existants)
│   └── menuiseries/
│       ├── MenuiserieSVGEditor.tsx   # REFONTE: nouveau layout avec habillages autour
│       ├── MenuiserieSVG.tsx         # Inchangé
│       ├── DimensionInput.tsx        # Inchangé
│       ├── HabillageSelect.tsx       # ADAPTER: styling Pills bleu/orange
│       ├── HabillageSection.tsx      # DEPRECATE: remplacé par HabillageGroup
│       ├── HabillageGroup.tsx        # NOUVEAU: groupe Int+Ext empilé pour un côté
│       └── ApplyToAllButton.tsx      # NOUVEAU: boutons propagation explicite
├── hooks/
│   └── useHabillagesPropagation.ts   # ADAPTER: ajouter applyToAll method
├── lib/
│   └── validations/
│       └── habillage.ts              # Inchangé
└── __tests__/
    └── components/
        └── menuiseries/
            ├── MenuiserieSVGEditor.test.tsx   # NOUVEAUX tests layout
            ├── HabillageGroup.test.tsx        # NOUVEAU
            └── ApplyToAllButton.test.tsx      # NOUVEAU
```

**Structure Decision**: Web application monolithique Next.js (App Router). Tous les composants UI dans `src/components/menuiseries/`. Pas de séparation backend/frontend car feature frontend-only.

## Complexity Tracking

> Aucune violation de constitution à justifier.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
