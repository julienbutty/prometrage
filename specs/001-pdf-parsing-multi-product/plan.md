# Implementation Plan: Stabilisation Parsing PDF Multi-Produits (ALU + PVC)

**Branch**: `001-pdf-parsing-multi-product` | **Date**: 2025-12-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-pdf-parsing-multi-product/spec.md`

## Summary

Stabiliser le parsing PDF pour supporter les produits ALU et PVC. Le problème actuel est que le schéma de validation Zod (`AIMenuiserieSchema`) n'accepte que les gammes ALU (OPTIMAX, INNOVAX, PERFORMAX) via un enum restrictif. Les produits PVC (SOFTLINE, KIETISLINE, WISIO) échouent à la validation. La solution consiste à transformer le champ `gamme` en string libre avec validation souple, et à mettre à jour le prompt IA pour mentionner toutes les gammes.

## Technical Context

**Language/Version**: TypeScript 5.x / Next.js 15.5.4
**Primary Dependencies**: Anthropic SDK, Zod, Prisma 6.16+, TanStack Query
**Storage**: PostgreSQL 16 (champ `donneesOriginales` en JSON flexible)
**Testing**: Vitest + React Testing Library
**Target Platform**: Web (mobile-first, artisans sur chantier)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Parsing PDF < 30 secondes pour 5-10 menuiseries
**Constraints**: Score confiance IA >= 0.7, retry avec backoff exponentiel (max 3 tentatives)
**Scale/Scope**: ~6 gammes connues (3 ALU + 3 PVC), extensible pour futures gammes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Implementation |
|-----------|--------|----------------|
| I. Mobile-First Design | N/A | Pas de changement UI dans cette feature |
| II. Test-Driven Development | **MUST** | Tests avant modification du schema Zod et du prompt |
| III. Strict Type Safety | **MUST** | Pas de `any`, schéma Zod robuste avec string libre |
| IV. Server-Side Validation | **MUST** | Validation Zod côté API `/api/upload/pdf` |
| V. AI-Powered PDF Parsing | **MUST** | Prompt enrichi avec gammes PVC, confiance >= 0.7 |
| VI. Optimistic UI Updates | N/A | Pas de changement mutation/UI |
| VII. Progressive Disclosure | N/A | Pas de changement formulaire |

**Gate Status**: ✅ PASS - Tous les principes applicables sont respectés

## Project Structure

### Documentation (this feature)

```text
specs/001-pdf-parsing-multi-product/
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
├── lib/
│   ├── validations/
│   │   └── ai-response.ts     # ⚠️ À MODIFIER: AIMenuiserieSchema.gamme
│   └── pdf/
│       └── prompts.ts         # ⚠️ À MODIFIER: EXTRACTION_PROMPT
└── __tests__/
    └── ai-parser.test.ts      # ⚠️ À ENRICHIR: tests PVC
```

**Structure Decision**: Modification de fichiers existants uniquement - pas de nouvelle structure

## Complexity Tracking

> **Aucune violation de constitution détectée**

La feature est une correction/stabilisation, pas une nouvelle fonctionnalité complexe.
