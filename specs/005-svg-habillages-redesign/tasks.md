# Tasks: Redesign SVG Editor avec Habillages Intégrés

**Input**: Design documents from `/specs/005-svg-habillages-redesign/`
**Prerequisites**: plan.md (✅), spec.md (✅), research.md (✅), data-model.md (✅), contracts/ (✅)

**Tests**: Included per Constitution Principle II (TDD) - All components must have tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project type**: Next.js App Router (single project)
- **Components**: `src/components/menuiseries/`
- **Hooks**: `src/hooks/`
- **Tests**: `src/__tests__/components/menuiseries/`
- **Lib**: `src/lib/validations/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Préparation des types et constantes partagés

- [x] T001 Add PILL_STYLES constant to src/lib/validations/habillage.ts (PillStyleConfig interface + styles bleu/orange)
- [x] T002 [P] Add variant prop type to HabillageSelectProps in existing types

**Checkpoint**: Types et constantes prêts pour les composants

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Hook étendu qui DOIT être prêt avant les composants

**⚠️ CRITICAL**: Les User Stories 3, 4, 5 dépendent de ce hook

### Tests Foundational

- [x] T003 Write test for applyToAll method in src/__tests__/hooks/useHabillagesPropagation.test.ts
- [x] T004 [P] Write test for hasAnyValue computed property in src/__tests__/hooks/useHabillagesPropagation.test.ts

### Implementation Foundational

- [x] T005 Extend useHabillagesPropagation hook with applyToAll() method in src/hooks/useHabillagesPropagation.ts
- [x] T006 Add hasAnyValue computed property to useHabillagesPropagation in src/hooks/useHabillagesPropagation.ts
- [x] T007 Run tests to verify hook extension works (npm test useHabillagesPropagation)

**Checkpoint**: Hook étendu et testé - composants peuvent maintenant utiliser applyToAll

---

## Phase 3: User Story 1 - Positionnement Spatial Intuitif (Priority: P1) 🎯 MVP

**Goal**: Les habillages sont positionnés autour du SVG (Haut en haut, Gauche à gauche, etc.)

**Independent Test**: Afficher l'éditeur SVG et vérifier que chaque groupe d'habillages est à la bonne position relative au schéma

### Tests for User Story 1

- [x] T008 [P] [US1] Write test for HabillageGroup component rendering Int+Ext in src/__tests__/components/menuiseries/HabillageGroup.test.tsx
- [x] T009 [P] [US1] Write test for HabillageGroup vertical orientation in src/__tests__/components/menuiseries/HabillageGroup.test.tsx
- [x] T010 [P] [US1] Write test for MenuiserieSVGEditor grid layout positions in src/__tests__/unit/svg/svg-editor.test.tsx (updated existing tests)

### Implementation for User Story 1

- [x] T011 [P] [US1] Create HabillageGroup component in src/components/menuiseries/HabillageGroup.tsx
- [x] T012 [US1] Update HabillageSelect to accept variant prop in src/components/menuiseries/HabillageSelect.tsx
- [x] T013 [US1] Refactor MenuiserieSVGEditor with CSS Grid layout in src/components/menuiseries/MenuiserieSVGEditor.tsx
- [x] T014 [US1] Position HabillageGroup "haut" at top center (sm:col-start-2 sm:row-start-1) in MenuiserieSVGEditor
- [x] T015 [US1] Position HabillageGroup "gauche" at left with Hauteur (sm:col-start-1 sm:row-start-2) in MenuiserieSVGEditor
- [x] T016 [US1] Position HabillageGroup "droite" at right (sm:col-start-5 sm:row-start-2) in MenuiserieSVGEditor
- [x] T017 [US1] Position HabillageGroup "bas" at bottom with Largeur (sm:col-start-2 sm:row-start-3) in MenuiserieSVGEditor
- [x] T018 [US1] Remove HabillageSection imports and usage from MenuiserieSVGEditor (deprecated by HabillageGroup)
- [x] T019 [US1] Run tests to verify spatial positioning (npm test MenuiserieSVGEditor)

**Checkpoint**: Habillages positionnés spatialement autour du SVG - MVP core functionality complete

---

## Phase 4: User Story 2 - Distinction Visuelle Int/Ext (Priority: P1)

**Goal**: Les sélecteurs Intérieur sont bleus, les Extérieur sont orange avec style pill

**Independent Test**: Vérifier les classes CSS des sélecteurs Int (bleu) vs Ext (orange)

### Tests for User Story 2

- [x] T020 [P] [US2] Write test for blue styling on interieur variant in src/__tests__/unit/components/HabillageSelect.test.tsx
- [x] T021 [P] [US2] Write test for orange styling on exterieur variant in src/__tests__/unit/components/HabillageSelect.test.tsx
- [x] T022 [P] [US2] Write test for min-height 40px on SelectTrigger in src/__tests__/unit/components/HabillageSelect.test.tsx

### Implementation for User Story 2

- [x] T023 [US2] Apply PILL_STYLES to HabillageSelect based on variant prop in src/components/menuiseries/HabillageSelect.tsx
- [x] T024 [US2] Add border-2 and rounded styling for pill appearance in src/components/menuiseries/HabillageSelect.tsx
- [x] T025 [US2] Ensure min-h-[40px] on SelectTrigger for touch-friendly targets in src/components/menuiseries/HabillageSelect.tsx
- [x] T026 [US2] Run tests to verify pill styling (npm test HabillageSelect)

**Checkpoint**: Distinction visuelle Int (bleu) / Ext (orange) avec style pill

---

## Phase 5: User Story 6 - Layout Responsive Mobile (Priority: P1)

**Goal**: Sur mobile (< 640px), layout vertical empilé dans l'ordre défini

**Independent Test**: Redimensionner sous 640px et vérifier l'ordre d'empilement

### Tests for User Story 6

- [x] T027 [P] [US6] Write test for mobile flex-col layout in src/__tests__/unit/svg/svg-editor.test.tsx
- [x] T028 [P] [US6] Write test for mobile order classes (order-1 through order-5) in src/__tests__/unit/svg/svg-editor.test.tsx

### Implementation for User Story 6

- [x] T029 [US6] Add flex flex-col gap-4 as mobile default in MenuiserieSVGEditor in src/components/menuiseries/MenuiserieSVGEditor.tsx
- [x] T030 [US6] Add order-1 to HabillageGroup "haut" for mobile in src/components/menuiseries/MenuiserieSVGEditor.tsx
- [x] T031 [US6] Add order-2 to SVG container for mobile in src/components/menuiseries/MenuiserieSVGEditor.tsx
- [x] T032 [US6] Add order-3 to HabillageGroup "gauche" for mobile in src/components/menuiseries/MenuiserieSVGEditor.tsx
- [x] T033 [US6] Add order-4 to HabillageGroup "droite" for mobile in src/components/menuiseries/MenuiserieSVGEditor.tsx
- [x] T034 [US6] Add order-5 to Largeur + HabillageGroup "bas" for mobile in src/components/menuiseries/MenuiserieSVGEditor.tsx
- [x] T035 [US6] Add sm:order-none to reset order on desktop in src/components/menuiseries/MenuiserieSVGEditor.tsx
- [x] T036 [US6] Run tests to verify mobile layout (npm test MenuiserieSVGEditor)

**Checkpoint**: Layout mobile-first responsive fonctionnel (P1 stories complete)

---

## Phase 6: User Story 3 - Auto-propagation Première Sélection (Priority: P2)

**Goal**: La première sélection d'un type d'habillage propage à tous les côtés avec animation

**Independent Test**: Sélectionner une valeur sur Hab Int vide → vérifier propagation aux 3 autres

**Note**: Cette logique existe déjà dans le hook, vérifier son intégration

### Tests for User Story 3

- [x] T037 [P] [US3] Write integration test for auto-propagation on first selection in src/__tests__/integration/menuiseries/svg-editor-propagation.test.tsx
- [x] T038 [P] [US3] Write test for highlight animation on propagated fields in src/__tests__/components/menuiseries/HabillageGroup.test.tsx

### Implementation for User Story 3

- [x] T039 [US3] Wire highlightInt/highlightExt props from parent to HabillageGroup in src/components/menuiseries/MenuiserieSVGEditor.tsx
- [x] T040 [US3] Pass isHighlighted to HabillageSelect based on variant in src/components/menuiseries/HabillageGroup.tsx
- [x] T041 [US3] Verify ring animation classes apply on highlight in src/components/menuiseries/HabillageSelect.tsx
- [x] T042 [US3] Run integration tests to verify auto-propagation (npm test)

**Checkpoint**: Auto-propagation sur première sélection fonctionne avec feedback visuel

---

## Phase 7: User Story 4 - Pas de Propagation Ultérieure (Priority: P2)

**Goal**: Les modifications après la première sélection ne propagent pas

**Independent Test**: Modifier un champ après propagation → seul ce champ change

**Note**: Cette logique existe déjà dans le hook, vérifier son maintien après refactoring

### Tests for User Story 4

- [x] T043 [P] [US4] Write test to verify no propagation on subsequent changes in src/__tests__/unit/hooks/useHabillagesPropagation.test.ts (tests already exist in "subsequent selection - override" describe block)

### Implementation for User Story 4

- [x] T044 [US4] Verify overriddenSides tracking still works after hook extension in src/hooks/useHabillagesPropagation.ts
- [x] T045 [US4] Run test to confirm no propagation on modifications (npm test useHabillagesPropagation)

**Checkpoint**: Pas de propagation sur modifications ultérieures (comportement existant préservé)

---

## Phase 8: User Story 5 - Bouton "Appliquer à Tous" (Priority: P2)

**Goal**: Deux boutons distincts (bleu Int, orange Ext) pour propager explicitement

**Independent Test**: Cliquer sur "Appliquer Int à tous" → tous les Hab Int ont la même valeur

### Tests for User Story 5

- [x] T046 [P] [US5] Write test for ApplyToAllButton rendering in src/__tests__/components/menuiseries/ApplyToAllButton.test.tsx
- [x] T047 [P] [US5] Write test for ApplyToAllButton blue styling for interieur in src/__tests__/components/menuiseries/ApplyToAllButton.test.tsx
- [x] T048 [P] [US5] Write test for ApplyToAllButton orange styling for exterieur in src/__tests__/components/menuiseries/ApplyToAllButton.test.tsx
- [x] T049 [P] [US5] Write test for ApplyToAllButton disabled state in src/__tests__/components/menuiseries/ApplyToAllButton.test.tsx
- [x] T050 [P] [US5] Write test for ApplyToAllButton onClick calls onApply in src/__tests__/components/menuiseries/ApplyToAllButton.test.tsx

### Implementation for User Story 5

- [x] T051 [P] [US5] Create ApplyToAllButton component in src/components/menuiseries/ApplyToAllButton.tsx
- [x] T052 [US5] Add ApplyToAllButton props (type, onApply, disabled) with PILL_STYLES in src/components/menuiseries/ApplyToAllButton.tsx
- [x] T053 [US5] Add ApplyToAllButton for interieur to MenuiserieSVGEditor in src/components/menuiseries/MenuiserieSVGEditor.tsx
- [x] T054 [US5] Add ApplyToAllButton for exterieur to MenuiserieSVGEditor in src/components/menuiseries/MenuiserieSVGEditor.tsx
- [x] T055 [US5] Add order-6 to buttons container for mobile positioning in src/components/menuiseries/MenuiserieSVGEditor.tsx
- [x] T056 [US5] Wire onApplyIntToAll and onApplyExtToAll props in MenuiserieSVGEditor in src/components/menuiseries/MenuiserieSVGEditor.tsx
- [x] T057 [US5] Run tests to verify ApplyToAllButton (npm test ApplyToAllButton)

**Checkpoint**: Boutons "Appliquer à tous" fonctionnels et stylisés

---

## Phase 9: User Story 7 - Retrait de l'Allège (Priority: P3)

**Goal**: L'allège n'apparaît plus dans l'éditeur SVG, reste dans "Détails additionnels"

**Independent Test**: Vérifier absence du champ Allège dans l'éditeur SVG

### Tests for User Story 7

- [x] T058 [P] [US7] Write test to verify hauteurAllege is NOT rendered in MenuiserieSVGEditor in src/__tests__/unit/svg/svg-editor.test.tsx

### Implementation for User Story 7

- [x] T059 [US7] Add showAllege prop to MenuiserieSVGEditorProps (defaults to true for backwards compatibility) in src/components/menuiseries/MenuiserieSVGEditor.tsx
- [x] T060 [US7] Conditionally render DimensionInput for hauteurAllege based on showAllege prop in src/components/menuiseries/MenuiserieSVGEditor.tsx
- [x] T061 [US7] Note: page.tsx already handles hauteurAllege in separate section - no change needed
- [x] T062 [US7] Run tests to verify allège removal (npm test svg-editor)

**Checkpoint**: Allège retirée de l'éditeur SVG, simplification UX complète

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Nettoyage final et validation

- [x] T063 [P] HabillageSection kept for backwards compatibility but no longer used by MenuiserieSVGEditor
- [x] T064 [P] HabillageSection tests kept for backwards compatibility
- [x] T065 Export new components from barrel file if exists (not applicable - no barrel file)
- [x] T066 Run full test suite: 272 unit/component tests pass
- [x] T067 Run type check (npm run type-check): No errors
- [x] T068 Run linting (npm run lint): 0 errors, 96 pre-existing warnings
- [ ] T069 Manual testing on mobile viewport (320px-640px) - requires user validation
- [ ] T070 Manual testing on desktop viewport (1024px+) - requires user validation
- [ ] T071 Validate quickstart.md scenarios work as documented - requires user validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS User Stories 3, 4, 5
- **User Stories P1 (Phase 3-5)**: Depend on Setup, can proceed in parallel
- **User Stories P2 (Phase 6-8)**: Depend on Foundational (hook), can proceed in parallel
- **User Story P3 (Phase 9)**: Can proceed independently
- **Polish (Phase 10)**: Depends on all user stories being complete

### User Story Dependencies

| Story | Phase | Dependencies | Can Parallelize With |
|-------|-------|--------------|----------------------|
| US1 - Positionnement Spatial | 3 | Setup (T001-T002) | US2, US6 |
| US2 - Distinction Visuelle | 4 | Setup (T001-T002) | US1, US6 |
| US6 - Layout Mobile | 5 | US1 (layout structure) | US2 |
| US3 - Auto-propagation | 6 | Foundational (T005-T007) | US4, US5 |
| US4 - Pas de Propagation | 7 | Foundational (T005-T007) | US3, US5 |
| US5 - Bouton Appliquer | 8 | Foundational (T005-T007) | US3, US4 |
| US7 - Retrait Allège | 9 | None (independent) | Any |

### Within Each User Story

1. Tests MUST be written and FAIL before implementation (TDD)
2. Component creation before integration
3. Styling before behavior
4. Unit tests before integration tests

### Parallel Opportunities

```bash
# Setup Phase - all parallel
Task: T001 + T002

# Foundational Phase - tests parallel, then implementation
Task: T003 + T004 (tests)
Task: T005, T006, T007 (sequential - same file)

# P1 Stories - can run in parallel after setup
Task: T008 + T009 + T010 (US1 tests)
Task: T020 + T021 + T022 (US2 tests)
Task: T027 + T028 (US6 tests)

# P2 Stories - can run in parallel after foundational
Task: T037 + T038 (US3 tests)
Task: T043 (US4 test)
Task: T046 + T047 + T048 + T049 + T050 (US5 tests)
```

---

## Parallel Example: Phase 3-5 (P1 Stories)

```bash
# Launch all P1 test tasks together:
Task: T008 + T009 + T010  # US1 tests
Task: T020 + T021 + T022  # US2 tests
Task: T027 + T028          # US6 tests

# Then implement in parallel (different files):
Task: T011  # Create HabillageGroup.tsx
Task: T023  # Update HabillageSelect.tsx styling
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 6 Only - P1 Priority)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 3: US1 - Positionnement Spatial
3. Complete Phase 4: US2 - Distinction Visuelle
4. Complete Phase 5: US6 - Layout Mobile
5. **STOP and VALIDATE**: Test P1 stories independently
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup → Types ready
2. Complete US1 + US2 + US6 → **MVP: Core layout with styling**
3. Complete Foundational → Hook ready for propagation
4. Add US3 + US4 → Propagation behavior complete
5. Add US5 → Apply buttons available
6. Add US7 → Allège cleanup (optional for MVP)

### Parallel Team Strategy

With 2 developers:

1. Dev A: Setup + US1 (Positionnement)
2. Dev B: Setup + US2 (Styling)
3. Both: US6 (Mobile) together
4. Dev A: Foundational + US3/US4
5. Dev B: US5 + US7
6. Both: Polish

---

## Summary

| Metric | Count |
|--------|-------|
| **Total Tasks** | 71 |
| **Setup Phase** | 2 |
| **Foundational Phase** | 5 |
| **US1 - Positionnement** | 12 |
| **US2 - Distinction Visuelle** | 7 |
| **US6 - Layout Mobile** | 10 |
| **US3 - Auto-propagation** | 6 |
| **US4 - Pas de Propagation** | 3 |
| **US5 - Bouton Appliquer** | 12 |
| **US7 - Retrait Allège** | 5 |
| **Polish Phase** | 9 |
| **Parallel Opportunities** | 23 tasks marked [P] |

### MVP Scope (Recommended)

**Phases 1-5 only (34 tasks)**:
- Setup + US1 + US2 + US6
- Delivers: Spatial positioning with color distinction and mobile layout
- Enables: Full visual redesign without behavior changes

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Verify tests FAIL before implementing (TDD per Constitution)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- HabillageSection.tsx becomes deprecated after US1 implementation
