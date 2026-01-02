# Tasks: SVG-Centric Menuiserie Page Redesign

**Input**: Design documents from `/specs/006-svg-centric-redesign/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Required by Constitution (Principle II: TDD)

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, etc.)
- File paths are relative to repository root

---

## Phase 1: Foundational Components

**Purpose**: Create reusable components needed by multiple user stories

### Tests (TDD - Write First)

- [x] T001 [P] Write test for HabillagesToggle component in src/__tests__/unit/svg/habillages-toggle.test.tsx
- [x] T002 [P] Write test for touch target compliance (44px min) in src/__tests__/unit/svg/touch-targets.test.tsx

### Implementation

- [x] T003 [P] Create HabillagesToggle component in src/components/menuiseries/HabillagesToggle.tsx
- [x] T004 [P] Update HabillageGroup touch targets from 40px to 44px in src/components/menuiseries/HabillageGroup.tsx

**Checkpoint**: ✅ Foundational components ready - user story implementation can begin

---

## Phase 2: User Story 1+2 - SVG Display & Dimensions (Priority: P1) 🎯 MVP

**Goal**: Display large SVG with spatially positioned dimension inputs

**Independent Test**: Open menuiserie page, see large SVG immediately with dimensions positioned around it (largeur bottom, hauteur right, allège below)

### Tests (TDD - Write First)

- [x] T005 [P] [US1] Write test for SVG prominent display (≥50% viewport) in src/__tests__/unit/svg/svg-zone.test.tsx
- [x] T006 [P] [US2] Write test for spatial dimension positioning in src/__tests__/unit/svg/svg-zone.test.tsx
- [x] T007 [P] [US2] Write test for mobile stacked layout in src/__tests__/unit/svg/svg-zone.test.tsx
- [x] T008 [P] [US2] Write test for tablet grid layout in src/__tests__/unit/svg/svg-zone.test.tsx

### Implementation

- [x] T009 [US1] Create SVGZone base component with large SVG display in src/components/menuiseries/SVGZone.tsx
- [x] T010 [US2] Add spatial dimension inputs to SVGZone (largeur bottom, hauteur right, allège below) in src/components/menuiseries/SVGZone.tsx
- [x] T011 [US2] Implement mobile layout (flex-col) for SVGZone in src/components/menuiseries/SVGZone.tsx
- [x] T012 [US2] Implement tablet layout (CSS Grid) for SVGZone in src/components/menuiseries/SVGZone.tsx

**Checkpoint**: ✅ SVGZone displays SVG + dimensions correctly on mobile and tablet - MVP functional

---

## Phase 3: User Story 4 - Progressive Disclosure Toggle (Priority: P2)

**Goal**: Hide habillages by default, reveal with toggle button

**Independent Test**: Page loads with habillages hidden, tap toggle shows them, tap again hides them

### Tests (TDD - Write First)

- [x] T013 [P] [US4] Write test for habillages hidden by default in src/__tests__/unit/svg/svg-zone.test.tsx
- [x] T014 [P] [US4] Write test for toggle button visibility in src/__tests__/unit/svg/svg-zone.test.tsx
- [x] T015 [P] [US4] Write test for toggle show/hide behavior in src/__tests__/unit/svg/svg-zone.test.tsx

### Implementation

- [x] T016 [US4] Add habillagesVisible state to SVGZone in src/components/menuiseries/SVGZone.tsx
- [x] T017 [US4] Integrate HabillagesToggle button in SVGZone in src/components/menuiseries/SVGZone.tsx
- [x] T018 [US4] Add fade/slide animation for habillages show/hide in src/components/menuiseries/SVGZone.tsx

**Checkpoint**: ✅ Toggle functionality works - habillages show/hide with animation

---

## Phase 4: User Story 3 - Spatial Habillages Layout (Priority: P2)

**Goal**: Position habillages spatially around SVG (Haut top, Bas bottom, Gauche left, Droite right)

**Independent Test**: Enable habillages toggle, see 4 HabillageGroups positioned at corresponding SVG edges

### Tests (TDD - Write First)

- [x] T019 [P] [US3] Write test for habillage spatial positioning (tablet) in src/__tests__/unit/svg/svg-zone.test.tsx
- [x] T020 [P] [US3] Write test for habillage stacked ordering (mobile) in src/__tests__/unit/svg/svg-zone.test.tsx
- [x] T021 [P] [US3] Write test for apply-to-all button visibility in src/__tests__/unit/svg/svg-zone.test.tsx

### Implementation

- [x] T022 [US3] Add HabillageGroup components to SVGZone grid areas in src/components/menuiseries/SVGZone.tsx
- [x] T023 [US3] Implement mobile stacked order for habillages (Haut→SVG→Bas→Gauche→Droite) in src/components/menuiseries/SVGZone.tsx
- [x] T024 [US3] Add ApplyToAll buttons to SVGZone when habillages visible in src/components/menuiseries/SVGZone.tsx

**Checkpoint**: ✅ Habillages display correctly at spatial positions on both layouts

---

## Phase 5: Integration & Page Update

**Goal**: Replace old MenuiserieSVGEditor with new SVGZone in page

**Independent Test**: Navigate to /menuiserie/[id], full new layout works with all existing functionality

### Tests (TDD - Write First)

- [x] T025 [P] Write integration test for full page with new SVGZone in src/__tests__/integration/menuiserie-page.test.tsx

### Implementation

- [x] T026 Replace MenuiserieSVGEditor usage with SVGZone in src/app/menuiserie/[id]/page.tsx
- [x] T027 Pass all habillage props from page state to SVGZone in src/app/menuiserie/[id]/page.tsx
- [x] T028 Verify existing save/validate functionality still works (US5 - already implemented)

**Checkpoint**: ✅ Full page integration complete - all user stories functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, optimization, and final validation

- [x] T029 [P] Remove or deprecate old MenuiserieSVGEditor component in src/components/menuiseries/MenuiserieSVGEditor.tsx
- [x] T030 [P] Update existing svg-editor.test.tsx tests for new structure in src/__tests__/unit/svg/svg-editor.test.tsx
- [x] T031 Run full test suite and fix any regressions
- [ ] T032 Visual testing on real devices (320px, 375px, 768px, 1024px viewports)
- [ ] T033 [P] Run quickstart.md validation scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Foundational) ──┬──> Phase 2 (US1+US2: SVG + Dimensions) 🎯 MVP
                         │
                         └──> Phase 3 (US4: Toggle) ──> Phase 4 (US3: Habillages)
                                                              │
                                                              v
                                                    Phase 5 (Integration)
                                                              │
                                                              v
                                                    Phase 6 (Polish)
```

### User Story Dependencies

| Story | Depends On | Can Parallel With |
|-------|------------|-------------------|
| US1+US2 (SVG + Dimensions) | Phase 1 | - |
| US4 (Toggle) | Phase 1 | US1+US2 |
| US3 (Habillages) | US4 (needs toggle) | - |
| US5 (Save/Validate) | None (already done) | All |

### Within Each Phase

- Tests MUST be written and FAIL before implementation (TDD)
- Component tests before integration
- Mobile layout before tablet layout (mobile-first)

### Parallel Opportunities

**Phase 1:**
```bash
# All foundational tasks can run in parallel:
T001, T002 (tests in parallel)
T003, T004 (implementation in parallel)
```

**Phase 2:**
```bash
# All US1+US2 tests can run in parallel:
T005, T006, T007, T008
```

**Phase 3+4:**
```bash
# US4 tests can run in parallel:
T013, T014, T015
# US3 tests can run in parallel:
T019, T020, T021
```

---

## Implementation Strategy

### MVP First (Phase 1 + Phase 2)

1. Complete Phase 1: Foundational components
2. Complete Phase 2: US1+US2 (SVG + Dimensions)
3. **STOP and VALIDATE**: Large SVG with spatial dimensions works
4. This is a usable MVP - dimensions are the core workflow

### Incremental Delivery

1. MVP (Phase 1+2) → Test → Can use for dimensions-only workflow
2. Add Phase 3 (Toggle) → Test → Progressive disclosure works
3. Add Phase 4 (Habillages) → Test → Full habillage functionality
4. Phase 5 (Integration) → Full page works
5. Phase 6 (Polish) → Production ready

### Estimated Task Count by Story

| Phase | Story | Task Count |
|-------|-------|------------|
| 1 | Foundational | 4 |
| 2 | US1+US2 | 8 |
| 3 | US4 | 6 |
| 4 | US3 | 6 |
| 5 | Integration | 4 |
| 6 | Polish | 5 |
| **Total** | | **33** |

---

## Notes

- Constitution mandates TDD: all tests written before implementation
- Mobile-first: base styles are mobile, `md:` breakpoint adds tablet
- Touch targets: 44px minimum on ALL interactive elements
- US5 (Save/Validate) is already implemented - just verify it works
- MenuiserieSVGEditor will be deprecated, not deleted (backward compat option)
