# Tasks: Stabilisation Parsing PDF Multi-Produits (ALU + PVC)

**Input**: Design documents from `/specs/001-pdf-parsing-multi-product/`
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
- **Validations**: `src/lib/validations/`
- **PDF Logic**: `src/lib/pdf/`

---

## Phase 1: Setup (Préparation)

**Purpose**: Vérification de l'environnement et préparation

- [x] T001 Vérifier que la branche `001-pdf-parsing-multi-product` est checkout
- [x] T002 [P] Vérifier que tous les tests existants passent avec `npm test`
- [x] T003 [P] Vérifier que le type-check passe avec `npm run type-check`

---

## Phase 2: Foundational (Prérequis - N/A)

**Purpose**: Cette feature ne nécessite pas de phase foundational car elle modifie des fichiers existants sans nouvelle infrastructure.

**Checkpoint**: Setup validé - Les user stories peuvent commencer

---

## Phase 3: User Story 1 - Upload et parsing PDF produits PVC (Priority: P1) 🎯 MVP

**Goal**: Permettre l'upload et le parsing de PDFs contenant des menuiseries PVC (SOFTLINE, KIETISLINE, WISIO) sans erreur de validation.

**Independent Test**: Uploader un PDF PVC avec des menuiseries SOFTLINE ou WISIO. Vérifier que le projet est créé avec toutes les menuiseries extraites.

### Tests pour User Story 1 (TDD - OBLIGATOIRE)

> **NOTE: Écrire ces tests EN PREMIER, vérifier qu'ils ÉCHOUENT avant implémentation**

- [x] T004 [P] [US1] Test unitaire: schema AIMenuiserieSchema accepte gamme "SOFTLINE" dans `src/__tests__/unit/validations/ai-response-pvc.test.ts`
- [x] T005 [P] [US1] Test unitaire: schema AIMenuiserieSchema accepte gamme "WISIO" dans `src/__tests__/unit/validations/ai-response-pvc.test.ts`
- [x] T006 [P] [US1] Test unitaire: schema AIMenuiserieSchema accepte gamme "KIETISLINE" dans `src/__tests__/unit/validations/ai-response-pvc.test.ts`
- [x] T007 [P] [US1] Test unitaire: schema MenuiserieDataSchema accepte gamme "SOFTLINE" dans `src/__tests__/unit/validations/menuiserie-pvc.test.ts`
- [x] T008 [P] [US1] Test unitaire: schema MenuiserieDataSchema accepte gammes mixtes ALU+PVC dans `src/__tests__/unit/validations/menuiserie-pvc.test.ts`

### Implémentation User Story 1

- [x] T009 [US1] Modifier `gamme` de enum vers string dans `src/lib/validations/ai-response.ts` ligne ~24
- [x] T010 [US1] Modifier `gamme` de enum vers string dans `src/lib/validations/menuiserie.ts` lignes ~29-33
- [x] T011 [US1] Enrichir EXTRACTION_PROMPT avec gammes PVC dans `src/lib/pdf/prompts.ts` ligne ~33
- [x] T012 [US1] Ajouter commentaire explicatif gammes ALU/PVC dans le prompt `src/lib/pdf/prompts.ts`
- [x] T013 [US1] Mettre à jour la règle 4 du prompt pour mentionner toutes les gammes dans `src/lib/pdf/prompts.ts`

### Validation User Story 1

- [x] T014 [US1] Vérifier que tous les tests passent avec `npm test`
- [x] T015 [US1] Vérifier le type-check avec `npm run type-check`

**Checkpoint**: À ce stade, les PDFs PVC doivent être parsés sans erreur de validation Zod

---

## Phase 4: User Story 2 - Extraction robuste de tous les champs produits (Priority: P2)

**Goal**: L'extraction IA gère les variations de format entre ALU et PVC avec flexibilité pour les champs spécifiques.

**Independent Test**: Uploader un PDF PVC avec champs spécifiques. Vérifier que ces champs sont extraits et stockés.

### Tests pour User Story 2 (TDD - OBLIGATOIRE)

- [x] T016 [P] [US2] Test unitaire: schema accepte champs optionnels à null dans `src/__tests__/unit/validations/ai-response-flexible.test.ts`
- [x] T017 [P] [US2] Test unitaire: schema accepte champs additionnels via passthrough dans `src/__tests__/unit/validations/ai-response-flexible.test.ts`

### Implémentation User Story 2

- [x] T018 [US2] Vérifier que AIMenuiserieSchema utilise `.passthrough()` ou équivalent dans `src/lib/validations/ai-response.ts`
- [x] T019 [US2] Vérifier que MenuiserieDataSchema utilise `.passthrough()` pour champs dynamiques dans `src/lib/validations/menuiserie.ts`
- [x] T020 [US2] Ajouter règle dans prompt pour champs absents → null + warning dans `src/lib/pdf/prompts.ts`

### Validation User Story 2

- [x] T021 [US2] Vérifier que tous les tests passent avec `npm test`

**Checkpoint**: À ce stade, les champs spécifiques PVC sont extraits et stockés

---

## Phase 5: User Story 3 - Gestion des erreurs explicites (Priority: P3)

**Goal**: En cas d'échec du parsing, l'utilisateur reçoit un message clair indiquant la nature du problème.

**Independent Test**: Uploader un PDF invalide. Vérifier que le message d'erreur est explicite.

### Tests pour User Story 3 (TDD - OBLIGATOIRE)

- [x] T022 [P] [US3] Test unitaire: error message contient gamme problématique dans `src/__tests__/unit/pdf/ai-parser-errors.test.ts`
- [x] T023 [P] [US3] Test unitaire: error message pour document invalide est explicite dans `src/__tests__/unit/pdf/ai-parser-errors.test.ts`

### Implémentation User Story 3

- [x] T024 [US3] Vérifier que AIParsingError inclut détails de l'erreur dans `src/lib/pdf/ai-parser.ts`
- [x] T025 [US3] Vérifier que AIInvalidDocumentError inclut la raison dans `src/lib/pdf/ai-parser.ts`
- [x] T026 [US3] Vérifier que les warnings sont correctement propagés dans la réponse API `src/app/api/upload/pdf/route.ts`

### Validation User Story 3

- [x] T027 [US3] Vérifier que tous les tests passent avec `npm test`

**Checkpoint**: À ce stade, les erreurs sont explicites et actionnables

---

## Phase 6: Polish & Validation Finale

**Purpose**: Validation globale et documentation

- [x] T028 [P] Exécuter `npm run lint` et corriger erreurs éventuelles
- [x] T029 [P] Exécuter `npm run type-check` final
- [x] T030 Exécuter `npm test` - tous les tests doivent passer
- [ ] T031 [P] Test manuel: upload PDF ALU (existant) → doit toujours fonctionner
- [ ] T032 [P] Test manuel: upload PDF PVC → doit maintenant fonctionner
- [ ] T033 [P] Test manuel: upload PDF mixte ALU+PVC → doit fonctionner
- [x] T034 Mettre à jour `docs/TODO_LIST.md` avec statut de la feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Pas de dépendances - peut commencer immédiatement
- **Foundational (Phase 2)**: N/A pour cette feature
- **User Story 1 (Phase 3)**: Dépend de Setup
- **User Story 2 (Phase 4)**: Peut commencer après US1 ou en parallèle (fichiers différents)
- **User Story 3 (Phase 5)**: Peut commencer après US1 ou en parallèle (fichiers différents)
- **Polish (Phase 6)**: Dépend de toutes les user stories

### User Story Dependencies

```
Setup (Phase 1)
    │
    ▼
┌───────────────────────────────────────────┐
│ User Stories peuvent s'exécuter en        │
│ parallèle après Setup (fichiers différents)│
├───────────────────────────────────────────┤
│ US1 (P1): ai-response.ts, menuiserie.ts,  │
│           prompts.ts                      │
│                                           │
│ US2 (P2): Focus sur passthrough et        │
│           flexibilité (mêmes fichiers)    │
│           → Séquentiel après US1          │
│                                           │
│ US3 (P3): ai-parser.ts, route.ts          │
│           → Peut être parallèle à US1/US2 │
└───────────────────────────────────────────┘
    │
    ▼
Polish (Phase 6)
```

### Within Each User Story

1. Tests DOIVENT être écrits et ÉCHOUER avant implémentation (TDD)
2. Implémentation pour faire passer les tests
3. Validation que tous les tests passent
4. Checkpoint avant de passer à la suite

### Parallel Opportunities

**Dans Setup (Phase 1)**:
- T002 et T003 peuvent s'exécuter en parallèle

**Dans US1 (Phase 3)**:
- T004, T005, T006, T007, T008 (tests) peuvent s'exécuter en parallèle
- T009 et T010 peuvent s'exécuter en parallèle (fichiers différents)

**Dans US2 (Phase 4)**:
- T016 et T017 (tests) peuvent s'exécuter en parallèle

**Dans US3 (Phase 5)**:
- T022 et T023 (tests) peuvent s'exécuter en parallèle

**Dans Polish (Phase 6)**:
- T028, T029, T031, T032, T033 peuvent s'exécuter en parallèle

---

## Parallel Example: User Story 1

```bash
# Lancer tous les tests US1 en parallèle (TDD - RED):
Task: "Test unitaire: schema AIMenuiserieSchema accepte gamme SOFTLINE"
Task: "Test unitaire: schema AIMenuiserieSchema accepte gamme WISIO"
Task: "Test unitaire: schema AIMenuiserieSchema accepte gamme KIETISLINE"
Task: "Test unitaire: schema MenuiserieDataSchema accepte gamme SOFTLINE"
Task: "Test unitaire: schema MenuiserieDataSchema accepte gammes mixtes"

# Puis implémentation pour passer les tests (GREEN):
Task: "Modifier gamme de enum vers string dans ai-response.ts"
Task: "Modifier gamme de enum vers string dans menuiserie.ts"  # Parallèle - fichier différent
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup ✓
2. Complete Phase 3: User Story 1 (Tests → Implémentation → Validation)
3. **STOP and VALIDATE**: Upload PDF PVC → doit fonctionner
4. Les PDFs PVC sont maintenant supportés - MVP atteint

### Incremental Delivery

1. Setup → Environnement prêt
2. User Story 1 → PDFs PVC supportés (MVP!)
3. User Story 2 → Extraction flexible de tous les champs
4. User Story 3 → Erreurs explicites
5. Chaque story ajoute de la valeur sans casser les précédentes

### Approche recommandée (Solo)

1. Compléter Setup (Phase 1)
2. Compléter User Story 1 en TDD (Phase 3) - **Priorité maximale**
3. Valider avec upload PDF PVC réel
4. Continuer avec US2 puis US3 si temps disponible
5. Polish final (Phase 6)

---

## Notes

- [P] tasks = fichiers différents, pas de dépendances
- [Story] label = traçabilité vers la user story
- TDD obligatoire (Constitution Principe II)
- Commit après chaque tâche ou groupe logique
- S'arrêter à chaque checkpoint pour valider

---

## Summary

| Metric | Value |
|--------|-------|
| **Total tasks** | 34 |
| **Setup tasks** | 3 |
| **US1 tasks** | 12 |
| **US2 tasks** | 6 |
| **US3 tasks** | 6 |
| **Polish tasks** | 7 |
| **Parallel opportunities** | 15 tasks avec [P] |
| **MVP scope** | User Story 1 (Phase 3) |
| **Files to modify** | 4 (ai-response.ts, menuiserie.ts, prompts.ts, ai-parser.ts) |
