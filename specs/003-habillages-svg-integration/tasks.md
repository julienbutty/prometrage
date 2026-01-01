# Tasks: Intégration des Habillages Int/Ext autour du SVG

**Input**: Design documents from `/specs/003-habillages-svg-integration/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests inclus car la Constitution du projet exige TDD (Principle II).

**Organization**: Tasks groupées par user story pour permettre implémentation et test indépendants.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Peut s'exécuter en parallèle (fichiers différents, pas de dépendances)
- **[Story]**: User story concernée (US1, US2, US3, US4)
- Chemins de fichiers exacts inclus dans les descriptions

## Path Conventions

- **Structure**: Next.js App Router avec `src/` à la racine
- Tests dans `src/__tests__/unit/`

---

## Phase 1: Setup (Infrastructure partagée)

**Purpose**: Création des types et schémas de validation fondamentaux

- [x] T001 [P] Créer le fichier de validation Zod avec types HabillageValue dans `src/lib/validations/habillage.ts`
- [x] T002 [P] Mettre à jour les types HabillagesSide dans `src/lib/svg/types.ts` (number → HabillageValue)

---

## Phase 2: Foundational (Prérequis bloquants)

**Purpose**: Hook de propagation - utilisé par toutes les user stories

**⚠️ CRITICAL**: US1 et US4 dépendent de ce hook

### Tests Foundational (TDD - RED first)

- [x] T003 [P] Écrire les tests du hook useHabillagesPropagation dans `src/__tests__/unit/hooks/useHabillagesPropagation.test.ts`

### Implementation Foundational

- [x] T004 Implémenter le hook useHabillagesPropagation dans `src/hooks/useHabillagesPropagation.ts` (dépend de T003)

**Checkpoint**: Hook testé et fonctionnel - les user stories peuvent commencer

---

## Phase 3: User Story 1 - Sélection habillages intérieurs (Priority: P1) 🎯 MVP

**Goal**: L'artisan peut sélectionner les habillages intérieurs via des sélecteurs dropdown

**Independent Test**: Naviguer vers une menuiserie, sélectionner "Sans" pour l'habillage intérieur haut, vérifier l'enregistrement

### Tests for User Story 1 (TDD - RED first)

- [x] T005 [P] [US1] Écrire les tests du composant HabillageSelect dans `src/__tests__/unit/components/HabillageSelect.test.tsx`
- [x] T006 [P] [US1] Écrire les tests du composant HabillageSection (intérieurs) dans `src/__tests__/unit/components/HabillageSection.test.tsx`

### Implementation for User Story 1

- [x] T007 [P] [US1] Créer le composant HabillageSelect (sélecteur individuel) dans `src/components/menuiseries/HabillageSelect.tsx`
- [x] T008 [US1] Créer le composant HabillageSection (section intérieurs) dans `src/components/menuiseries/HabillageSection.tsx` (dépend de T007)
- [x] T009 [US1] Intégrer HabillageSection dans MenuiserieSVGEditor pour les intérieurs dans `src/components/menuiseries/MenuiserieSVGEditor.tsx` (dépend de T008)
- [x] T010 [US1] Mettre à jour le schema de validation API pour habillageInt dans `src/app/api/menuiseries/[id]/route.ts`

**Checkpoint**: Habillages intérieurs fonctionnels avec sélecteurs dropdown

---

## Phase 4: User Story 4 - Propagation automatique (Priority: P1)

**Goal**: Quand l'artisan sélectionne une valeur sur un côté, elle se propage aux 3 autres côtés

**Independent Test**: Sélectionner "Standard" sur haut, vérifier que bas/gauche/droite passent aussi à "Standard"

### Tests for User Story 4 (TDD - RED first)

- [x] T011 [P] [US4] Compléter les tests de propagation dans `src/__tests__/unit/hooks/useHabillagesPropagation.test.ts` (scénarios de propagation)
- [x] T012 [P] [US4] Écrire les tests d'animation highlight dans `src/__tests__/unit/components/HabillageSection.test.tsx`

### Implementation for User Story 4

- [x] T013 [US4] Ajouter la logique de highlight au hook dans `src/hooks/useHabillagesPropagation.ts`
- [x] T014 [US4] Implémenter l'animation highlight CSS dans HabillageSelect `src/components/menuiseries/HabillageSelect.tsx`
- [x] T015 [US4] Connecter la propagation à HabillageSection dans `src/components/menuiseries/HabillageSection.tsx`

**Checkpoint**: Propagation automatique avec animation de feedback fonctionnelle

---

## Phase 5: User Story 2 - Sélection habillages extérieurs (Priority: P2)

**Goal**: L'artisan peut sélectionner les habillages extérieurs, visuellement distincts des intérieurs

**Independent Test**: Sélectionner des habillages extérieurs différents sur les 4 côtés, vérifier la sauvegarde

### Tests for User Story 2 (TDD - RED first)

- [x] T016 [P] [US2] Écrire les tests de distinction visuelle int/ext dans `src/__tests__/unit/components/HabillageSection.test.tsx`

### Implementation for User Story 2

- [x] T017 [US2] Ajouter le support du type "exterieur" à HabillageSection avec couleur distincte dans `src/components/menuiseries/HabillageSection.tsx`
- [x] T018 [US2] Intégrer la section extérieurs dans MenuiserieSVGEditor dans `src/components/menuiseries/MenuiserieSVGEditor.tsx`
- [x] T019 [US2] Mettre à jour le schema de validation API pour habillageExt dans `src/app/api/menuiseries/[id]/route.ts`

**Checkpoint**: Habillages intérieurs ET extérieurs fonctionnels avec distinction visuelle

---

## Phase 6: User Story 3 - Affichage mobile ergonomique (Priority: P3)

**Goal**: Sur mobile 375px, tous les sélecteurs sont accessibles avec touch targets 44px

**Independent Test**: Afficher sur viewport 375px, vérifier aucun scroll horizontal, touch targets 44px

### Tests for User Story 3 (TDD - RED first)

- [x] T020 [P] [US3] Écrire les tests de responsive mobile dans `src/__tests__/unit/components/HabillageSection.test.tsx`

### Implementation for User Story 3

- [x] T021 [US3] Ajuster le layout grid mobile (2x2) dans HabillageSection `src/components/menuiseries/HabillageSection.tsx`
- [x] T022 [US3] Vérifier/ajuster les touch targets min-h-[44px] dans HabillageSelect `src/components/menuiseries/HabillageSelect.tsx`
- [x] T023 [US3] Optimiser le layout global dans MenuiserieSVGEditor pour mobile `src/components/menuiseries/MenuiserieSVGEditor.tsx`

**Checkpoint**: Interface mobile ergonomique et accessible

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Nettoyage et documentation

- [x] T024 Supprimer l'ancien composant HabillageInputs `src/components/menuiseries/HabillageInputs.tsx`
- [x] T025 [P] Mettre à jour les exports dans l'index si existant `src/components/menuiseries/index.ts` (N/A - pas de fichier index)
- [x] T026 Vérifier la couverture de tests et ajouter les cas manquants (197 tests passent)
- [x] T027 [P] Exécuter npm run type-check et corriger les erreurs
- [x] T028 [P] Exécuter npm run lint et corriger les warnings
- [x] T029 Validation finale avec quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Aucune dépendance - peut commencer immédiatement
- **Foundational (Phase 2)**: Dépend de Setup - BLOQUE toutes les user stories
- **User Stories (Phase 3-6)**: Toutes dépendent de Foundational
  - US1 peut commencer dès Foundational terminée
  - US4 peut commencer en parallèle de US1 (hook déjà prêt)
  - US2 peut commencer après US1 (réutilise les composants)
  - US3 peut commencer après US2 (ajustements responsive)
- **Polish (Phase 7)**: Dépend de toutes les user stories terminées

### User Story Dependencies

```
Setup (T001-T002)
    │
    ▼
Foundational (T003-T004) ──────────────────────────┐
    │                                               │
    ▼                                               ▼
US1: Intérieurs (T005-T010)                    US4: Propagation (T011-T015)
    │                                               │
    ▼ ◄─────────────────────────────────────────────┘
US2: Extérieurs (T016-T019)
    │
    ▼
US3: Mobile (T020-T023)
    │
    ▼
Polish (T024-T029)
```

### Parallel Opportunities

**Phase 1 (Setup)**:
- T001 et T002 peuvent s'exécuter en parallèle

**Phase 2 (Foundational)**:
- T003 seul, puis T004

**Phase 3 (US1)**:
- T005 et T006 peuvent s'exécuter en parallèle
- T007 peut commencer pendant T005/T006

**Phase 4 (US4)**:
- T011 et T012 peuvent s'exécuter en parallèle

**Phase 5-6 (US2, US3)**:
- Tests peuvent être écrits en parallèle

**Phase 7 (Polish)**:
- T025, T027, T028 peuvent s'exécuter en parallèle

---

## Parallel Example: Phase 1

```bash
# Lancer les deux tâches de setup en parallèle :
Task: "Créer src/lib/validations/habillage.ts"
Task: "Mettre à jour src/lib/svg/types.ts"
```

---

## Parallel Example: User Story 1

```bash
# Lancer les tests en parallèle (TDD - RED) :
Task: "Tests HabillageSelect dans src/__tests__/unit/components/HabillageSelect.test.tsx"
Task: "Tests HabillageSection dans src/__tests__/unit/components/HabillageSection.test.tsx"

# Puis implémenter :
Task: "Créer HabillageSelect dans src/components/menuiseries/HabillageSelect.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 4)

1. Complete Phase 1: Setup (types + validation)
2. Complete Phase 2: Foundational (hook propagation)
3. Complete Phase 3: User Story 1 (sélecteurs intérieurs)
4. Complete Phase 4: User Story 4 (propagation)
5. **STOP and VALIDATE**: Tester la sélection intérieurs avec propagation
6. Demo si prêt

### Incremental Delivery

1. Setup + Foundational → Infrastructure prête
2. Add US1 → Test indépendant → Sélecteurs fonctionnels (MVP!)
3. Add US4 → Test indépendant → Propagation ajoutée
4. Add US2 → Test indépendant → Extérieurs ajoutés
5. Add US3 → Test indépendant → Mobile optimisé
6. Polish → Version finale

---

## Notes

- Tous les tests suivent TDD (Constitution Principle II)
- [P] tasks = fichiers différents, pas de dépendances
- [Story] label relie la tâche à la user story pour traçabilité
- Chaque user story est indépendamment testable
- Vérifier que les tests échouent avant d'implémenter
- Commit après chaque tâche ou groupe logique
- S'arrêter à n'importe quel checkpoint pour valider la story indépendamment
