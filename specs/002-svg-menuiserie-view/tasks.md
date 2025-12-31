# Tasks: Visualisation SVG Menuiserie avec Saisie Contextuelle

**Input**: Design documents from `/specs/002-svg-menuiserie-view/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: TDD est **obligatoire** selon la Constitution (Principe II). Tests écrits AVANT implémentation.

**Organization**: Tâches groupées par user story pour permettre l'implémentation et les tests indépendants.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Peut s'exécuter en parallèle (fichiers différents, pas de dépendances)
- **[Story]**: User story concernée (US1, US2, US3)
- Chemins de fichiers exacts inclus dans les descriptions

## Path Conventions

- **Project**: Next.js App Router - `src/` à la racine du repository
- **Tests**: `src/__tests__/` (Vitest)
- **Components**: `src/components/menuiseries/`
- **Lib**: `src/lib/svg/`

---

## Phase 1: Setup (Préparation) ✅ COMPLETED

**Purpose**: Création de la structure de fichiers et types de base

- [x] T001 Créer le dossier `src/lib/svg/`
- [x] T002 [P] Créer le fichier de types `src/lib/svg/types.ts` avec les interfaces MenuiserieType, MenuiserieSVGProps, HabillagesSide
- [x] T003 [P] Créer le dossier de tests `src/__tests__/unit/svg/`

---

## Phase 2: Foundational (Prérequis Bloquants) ✅ COMPLETED

**Purpose**: Fonction utilitaire de parsing utilisée par toutes les user stories

**Checkpoint**: ✅ COMPLETE

### Tests Foundational (TDD - OBLIGATOIRE)

- [x] T004 [P] Test unitaire: `parseMenuiserieType` pour "Fenêtre 2 vantaux" dans `src/__tests__/unit/svg/svg-utils.test.ts`
- [x] T005 [P] Test unitaire: `parseMenuiserieType` pour "Coulissant 3 vantaux" dans `src/__tests__/unit/svg/svg-utils.test.ts`
- [x] T006 [P] Test unitaire: `parseMenuiserieType` pour "Châssis fixe" dans `src/__tests__/unit/svg/svg-utils.test.ts`
- [x] T007 [P] Test unitaire: `parseMenuiserieType` pour type inconnu (fallback) dans `src/__tests__/unit/svg/svg-utils.test.ts`

### Implémentation Foundational

- [x] T008 Implémenter `parseMenuiserieType` dans `src/lib/svg/svg-utils.ts`
- [x] T009 Vérifier que tous les tests T004-T007 passent avec `npm test svg-utils` (12 tests)

**Checkpoint**: ✅ Foundation prête - les user stories peuvent commencer

---

## Phase 3: User Story 1 - Affichage du schéma SVG (Priority: P1) 🎯 MVP ✅ COMPLETED

**Goal**: L'artisan voit un schéma SVG représentant le type de menuiserie avec le bon nombre de vantaux.

**Independent Test**: Naviguer vers `/menuiserie/[id]` et vérifier que le schéma SVG s'affiche correctement selon le type.

### Tests pour User Story 1 (TDD - OBLIGATOIRE) ✅

> **NOTE: Tests écrits EN PREMIER, vérifiés qu'ils ÉCHOUENT avant implémentation**

- [x] T010 [P] [US1] Test unitaire: template SVG fenêtre 1 vantail dans `src/__tests__/unit/svg/menuiserie-templates.test.ts`
- [x] T011 [P] [US1] Test unitaire: template SVG fenêtre 2 vantaux dans `src/__tests__/unit/svg/menuiserie-templates.test.ts`
- [x] T012 [P] [US1] Test unitaire: template SVG coulissant 3 vantaux dans `src/__tests__/unit/svg/menuiserie-templates.test.ts`
- [x] T013 [P] [US1] Test unitaire: template SVG châssis fixe dans `src/__tests__/unit/svg/menuiserie-templates.test.ts`
- [x] T014 [P] [US1] Test unitaire: template SVG châssis soufflet dans `src/__tests__/unit/svg/menuiserie-templates.test.ts`
- [x] T015 [P] [US1] Test composant: MenuiserieSVG render avec props dans `src/__tests__/unit/svg/menuiserie-svg.test.tsx`

### Implémentation User Story 1 ✅

- [x] T016 [P] [US1] Créer template SVG fenêtre dans `src/lib/svg/menuiserie-templates.tsx`
- [x] T017 [P] [US1] Créer template SVG porte-fenêtre dans `src/lib/svg/menuiserie-templates.tsx`
- [x] T018 [P] [US1] Créer template SVG coulissant dans `src/lib/svg/menuiserie-templates.tsx`
- [x] T019 [P] [US1] Créer template SVG châssis fixe dans `src/lib/svg/menuiserie-templates.tsx`
- [x] T020 [P] [US1] Créer template SVG châssis soufflet dans `src/lib/svg/menuiserie-templates.tsx`
- [x] T021 [US1] Créer composant `MenuiserieSVG` dans `src/components/menuiseries/MenuiserieSVG.tsx`
- [x] T022 [US1] Vérifier que tous les tests US1 passent avec `npm test` (30 tests SVG)

### Intégration User Story 1 ✅

- [x] T023 [US1] Intégrer `MenuiserieSVG` dans la page `src/app/menuiserie/[id]/page.tsx`
- [ ] T024 [US1] Test manuel: vérifier affichage SVG sur différents types de menuiseries

**Checkpoint**: ✅ Le schéma SVG s'affiche pour tous les types de menuiseries

---

## Phase 4: User Story 2 - Saisie des dimensions (Priority: P2) ✅ COMPLETED

**Goal**: L'artisan peut saisir largeur, hauteur, allège dans des champs positionnés autour du schéma.

**Independent Test**: Saisir des dimensions et vérifier qu'elles sont enregistrées dans `donneesModifiees`.

### Tests pour User Story 2 (TDD - OBLIGATOIRE) ✅

- [x] T025 [P] [US2] Test composant: DimensionInput affiche placeholder depuis données originales dans `src/__tests__/unit/svg/dimension-input.test.tsx`
- [x] T026 [P] [US2] Test composant: DimensionInput appelle onChange avec valeur numérique dans `src/__tests__/unit/svg/dimension-input.test.tsx`
- [x] T027 [P] [US2] Test composant: MenuiserieSVGEditor layout desktop (grid) dans `src/__tests__/unit/svg/svg-editor.test.tsx`
- [x] T028 [P] [US2] Test composant: MenuiserieSVGEditor layout mobile (flex-col) dans `src/__tests__/unit/svg/svg-editor.test.tsx`

### Implémentation User Story 2 ✅

- [x] T029 [US2] Créer composant `DimensionInput` dans `src/components/menuiseries/DimensionInput.tsx`
- [x] T030 [US2] Créer composant `MenuiserieSVGEditor` (squelette) dans `src/components/menuiseries/MenuiserieSVGEditor.tsx`
- [x] T031 [US2] Ajouter inputs dimensions (largeur, hauteur, allège) au `MenuiserieSVGEditor`
- [x] T032 [US2] Implémenter le layout CSS Grid pour positionnement autour du SVG
- [x] T033 [US2] Implémenter le layout responsive mobile (flex-col sous 640px)
- [x] T034 [US2] Connecter les inputs au formulaire parent via props onChange (controlled component)
- [x] T035 [US2] Connecter la mutation TanStack Query (via handleFieldChange de la page parent)
- [x] T036 [US2] Vérifier que tous les tests US2 passent avec `npm test` (42 tests)

### Intégration User Story 2 ✅

- [x] T037 [US2] Intégrer `MenuiserieSVGEditor` dans `src/app/menuiserie/[id]/page.tsx`
- [ ] T038 [US2] Test manuel: saisir dimensions et vérifier sauvegarde

**Checkpoint**: ✅ Les composants dimensions sont créés et testés

---

## Phase 5: User Story 3 - Saisie des habillages (Priority: P3) ✅ COMPLETED

**Goal**: L'artisan peut saisir les 8 habillages (4 int + 4 ext) positionnés autour du schéma.

**Independent Test**: Saisir des habillages et vérifier qu'ils sont enregistrés dans `donneesModifiees`.

### Tests pour User Story 3 (TDD - OBLIGATOIRE) ✅

- [x] T039 [P] [US3] Test composant: HabillageInputs affiche 4 champs (x2) dans `src/__tests__/unit/svg/habillage-inputs.test.tsx`
- [x] T040 [P] [US3] Test composant: HabillageInputs placeholders depuis données originales dans `src/__tests__/unit/svg/habillage-inputs.test.tsx`
- [x] T041 [P] [US3] Test composant: HabillageInputs onChange pour chaque côté dans `src/__tests__/unit/svg/habillage-inputs.test.tsx`

### Implémentation User Story 3 ✅

- [x] T042 [US3] Créer composant `HabillageInputs` dans `src/components/menuiseries/HabillageInputs.tsx`
- [x] T043 [US3] Intégrer `HabillageInputs` dans `MenuiserieSVGEditor` layout
- [x] T044 [US3] Ajouter les champs habillages au state local (React Hook Form à intégrer plus tard)
- [x] T045 [US3] Vérifier que tous les tests US3 passent avec `npm test` (48 tests)

### Intégration User Story 3

- [ ] T046 [US3] Test manuel: saisir habillages et vérifier sauvegarde
- [ ] T047 [US3] Test manuel: vérifier placeholders avec valeurs originales PDF

**Checkpoint**: ✅ Tous les composants (dimensions + habillages) sont créés et testés

---

## Phase 6: Polish & Validation Finale ✅ IN PROGRESS

**Purpose**: Qualité, documentation et validation globale

- [x] T048 [P] Exécuter `npm run type-check` et corriger erreurs éventuelles ✅
- [x] T049 [P] Exécuter `npm run lint` et corriger erreurs éventuelles ✅ (0 erreurs sur fichiers SVG)
- [x] T050 Exécuter `npm test` - tous les tests unitaires passent (172 tests, 51 SVG)
- [ ] T051 [P] Test manuel: vérifier layout sur mobile 320px
- [ ] T052 [P] Test manuel: vérifier touch targets >= 44x44px
- [ ] T053 [P] Test manuel: vérifier tous les types de menuiseries (5 types)
- [x] T054 Mettre à jour `docs/TODO_LIST.md` avec statut de la feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Pas de dépendances - peut commencer immédiatement
- **Foundational (Phase 2)**: Dépend de Setup - BLOQUE les user stories
- **User Story 1 (Phase 3)**: Dépend de Foundational
- **User Story 2 (Phase 4)**: Dépend de User Story 1 (utilise le composant SVG)
- **User Story 3 (Phase 5)**: Dépend de User Story 2 (étend le SVGEditor)
- **Polish (Phase 6)**: Dépend de toutes les user stories

### User Story Dependencies

```
Setup (Phase 1)
    │
    ▼
Foundational (Phase 2) - parseMenuiserieType
    │
    ▼
User Story 1 (Phase 3) - SVG templates + MenuiserieSVG
    │
    ▼
User Story 2 (Phase 4) - DimensionInput + MenuiserieSVGEditor
    │
    ▼
User Story 3 (Phase 5) - HabillageInputs (extension de US2)
    │
    ▼
Polish (Phase 6)
```

### Within Each User Story

1. Tests DOIVENT être écrits et ÉCHOUER avant implémentation (TDD)
2. Implémentation pour faire passer les tests
3. Intégration dans la page
4. Validation que tous les tests passent
5. Checkpoint avant de passer à la suite

### Parallel Opportunities

**Dans Phase 1 (Setup)**:
- T002 et T003 peuvent s'exécuter en parallèle

**Dans Phase 2 (Foundational)**:
- T004, T005, T006, T007 (tests) peuvent s'exécuter en parallèle

**Dans Phase 3 (US1)**:
- T010-T015 (tests) peuvent s'exécuter en parallèle
- T016-T020 (templates) peuvent s'exécuter en parallèle

**Dans Phase 4 (US2)**:
- T025-T028 (tests) peuvent s'exécuter en parallèle

**Dans Phase 5 (US3)**:
- T039-T041 (tests) peuvent s'exécuter en parallèle

**Dans Phase 6 (Polish)**:
- T048, T049, T051, T052, T053 peuvent s'exécuter en parallèle

---

## Parallel Example: User Story 1

```bash
# Lancer tous les tests US1 en parallèle (TDD - RED):
Task: "Test unitaire: template SVG fenêtre 1 vantail"
Task: "Test unitaire: template SVG fenêtre 2 vantaux"
Task: "Test unitaire: template SVG coulissant 3 vantaux"
Task: "Test unitaire: template SVG châssis fixe"
Task: "Test unitaire: template SVG châssis soufflet"
Task: "Test composant: MenuiserieSVG render avec props"

# Puis implémenter les templates en parallèle (GREEN):
Task: "Créer template SVG fenêtre"
Task: "Créer template SVG porte-fenêtre"
Task: "Créer template SVG coulissant"
Task: "Créer template SVG châssis fixe"
Task: "Créer template SVG châssis soufflet"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup ✓
2. Complete Phase 2: Foundational (parseMenuiserieType)
3. Complete Phase 3: User Story 1 (SVG display)
4. **STOP and VALIDATE**: Voir le SVG s'afficher correctement
5. Le schéma SVG est maintenant visible - MVP visuel atteint

### Incremental Delivery

1. Setup → Structure de fichiers prête
2. Foundational → Parsing du type fonctionnel
3. User Story 1 → SVG visible (MVP visuel!)
4. User Story 2 → Saisie dimensions fonctionnelle
5. User Story 3 → Saisie habillages fonctionnelle
6. Chaque story ajoute de la valeur sans casser les précédentes

---

## Notes

- [P] tasks = fichiers différents, pas de dépendances
- [Story] label = traçabilité vers la user story
- TDD obligatoire (Constitution Principe II)
- Commit après chaque tâche ou groupe logique
- S'arrêter à chaque checkpoint pour valider
- Les user stories ont des dépendances séquentielles (US1 → US2 → US3)

---

## Summary

| Metric | Value |
|--------|-------|
| **Total tasks** | 54 |
| **Setup tasks** | 3 |
| **Foundational tasks** | 6 |
| **US1 tasks** | 15 |
| **US2 tasks** | 14 |
| **US3 tasks** | 9 |
| **Polish tasks** | 7 |
| **Parallel opportunities** | 26 tasks avec [P] |
| **MVP scope** | User Story 1 (Phase 3) |
| **Files to create** | 8 nouveaux fichiers |
| **Files to modify** | 1 (page.tsx) |
