# Implementation Plan: SVG-Centric Menuiserie Page Redesign

**Branch**: `006-svg-centric-redesign` | **Date**: 2026-01-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-svg-centric-redesign/spec.md`

## Summary

Redesign the `/menuiserie/[id]` page to make the SVG diagram the central visual element with dimension inputs positioned spatially around it. Habillages are hidden by default and revealed via a toggle button, also positioned spatially around the SVG when visible. The layout adapts between tablet (spatial grid) and mobile (vertical stack).

**Key UX Decisions** (from clarification session):
1. Dimensions positioned spatially: largeur (bottom), hauteur (right), allège (below largeur)
2. Habillages positioned spatially: each side at its corresponding SVG edge
3. Habillages hidden by default, toggle to reveal
4. Tablet: full spatial layout / Mobile: vertical stacked
5. Touch targets: 44px minimum (Apple HIG)

## Technical Context

**Language/Version**: TypeScript 5.x / Next.js 15.5.4 / React 19.1.0
**Primary Dependencies**: React, Tailwind CSS v4, shadcn/ui, TanStack Query
**Storage**: N/A (no data model changes - uses existing `donneesModifiees` JSON field)
**Testing**: Vitest + React Testing Library
**Target Platform**: Web (tablet-optimized ≥768px, mobile support ≥320px)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Page load <2s, SVG visible above fold, no layout shifts
**Constraints**: Touch targets ≥44px, no horizontal scroll on ≥320px screens
**Scale/Scope**: Single page redesign (`/menuiserie/[id]`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Mobile-First Design | ✅ PASS | Mobile layout designed first, tablet enhancement with `md:` breakpoint |
| II. Test-Driven Development | ✅ WILL COMPLY | All components will have tests before implementation |
| III. Strict Type Safety | ✅ PASS | Existing types sufficient, no new types needed |
| IV. Server-Side Validation | ✅ N/A | No API changes in this feature |
| V. AI-Powered PDF Parsing | ✅ N/A | No PDF parsing changes |
| VI. Optimistic UI Updates | ✅ PRESERVED | Existing TanStack Query patterns preserved |
| VII. Progressive Disclosure | ✅ PASS | Habillages toggle implements this principle |

**Gate Result**: ✅ PASSED - No violations

## Project Structure

### Documentation (this feature)

```text
specs/006-svg-centric-redesign/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (component model)
├── quickstart.md        # Phase 1 output
├── contracts/           # N/A (no API changes)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (files to modify/create)

```text
src/
├── components/
│   └── menuiseries/
│       ├── MenuiserieSVGEditor.tsx    # MAJOR REWRITE - new spatial layout
│       ├── SVGZone.tsx                # NEW - central SVG with spatial positioning
│       ├── DimensionInput.tsx         # MINOR - already has position prop
│       ├── HabillageGroup.tsx         # MINOR - already supports orientation
│       ├── HabillagesToggle.tsx       # NEW - toggle button component
│       └── [other existing files]     # UNCHANGED
├── app/
│   └── menuiserie/
│       └── [id]/
│           └── page.tsx               # MINOR - use new SVGZone component
└── __tests__/
    └── unit/
        └── svg/
            ├── svg-zone.test.tsx      # NEW
            ├── svg-editor.test.tsx    # UPDATE
            └── habillages-toggle.test.tsx  # NEW
```

**Structure Decision**: Minimal file changes - primarily rewriting `MenuiserieSVGEditor.tsx` with new `SVGZone.tsx` extraction for the spatial layout logic.

## Complexity Tracking

> No constitution violations to justify.

| Aspect | Complexity | Justification |
|--------|------------|---------------|
| New components | LOW | Only 2 new: SVGZone, HabillagesToggle |
| Layout system | MEDIUM | CSS Grid for tablet, Flexbox for mobile |
| State management | LOW | Single boolean for toggle (local state) |
| Testing | MEDIUM | Need layout tests for both breakpoints |
