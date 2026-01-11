# Tasks: Ouverture Intérieure - Correction sens d'ouverture PDF/SVG

**Input**: Design documents from `/specs/001-fix-opening-direction/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Inclus - TDD requis par la constitution du projet (Principe II)

**Organization**: Tâches groupées par User Story pour implémentation et test indépendants

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Peut s'exécuter en parallèle (fichiers différents, pas de dépendances)
- **[Story]**: User Story concernée (US1, US2, US3, US4)
- Chemins exacts dans les descriptions

---

## Phase 1: Setup

**Purpose**: Création de l'utilitaire de mapping et des tests fondamentaux

- [x] T001 [P] Créer le fichier utilitaire `src/lib/svg/opening-direction.ts` avec les types et exports vides
- [x] T002 [P] Créer le fichier de tests `src/__tests__/lib/opening-direction.test.ts` avec structure describe vide

---

## Phase 2: Foundational (Core Mapping Logic)

**Purpose**: Implémenter la logique de mapping qui sera utilisée par TOUTES les User Stories

**⚠️ CRITICAL**: Les User Stories 1-4 dépendent de cette phase

### Tests Foundational (TDD - RED)

- [x] T003 [P] Test `mapOuvertureToSensOuverture` retourne 'gauche' pour "droite tirant" dans `src/__tests__/lib/opening-direction.test.ts`
- [x] T004 [P] Test `mapOuvertureToSensOuverture` retourne 'droite' pour "gauche tirant" dans `src/__tests__/lib/opening-direction.test.ts`
- [x] T005 [P] Test `mapOuvertureToSensOuverture` gère les variations de casse dans `src/__tests__/lib/opening-direction.test.ts`
- [x] T006 [P] Test `mapOuvertureToSensOuverture` retourne null pour valeurs nulles/undefined dans `src/__tests__/lib/opening-direction.test.ts`
- [x] T007 [P] Test `mapOuvertureToSensOuverture` retourne null pour valeurs non reconnues dans `src/__tests__/lib/opening-direction.test.ts`
- [x] T008 [P] Test `getEffectiveOpeningDirection` priorise `ouvertureInterieure` sur `ouvrantPrincipal` dans `src/__tests__/lib/opening-direction.test.ts`
- [x] T009 [P] Test `getEffectiveOpeningDirection` fallback sur `ouvrantPrincipal` legacy dans `src/__tests__/lib/opening-direction.test.ts`
- [x] T010 [P] Test `getEffectiveOpeningDirection` retourne null si les deux champs sont null dans `src/__tests__/lib/opening-direction.test.ts`

### Implementation Foundational (TDD - GREEN)

- [x] T011 Implémenter `mapOuvertureToSensOuverture()` dans `src/lib/svg/opening-direction.ts` (passer T003-T007)
- [x] T012 Implémenter `getEffectiveOpeningDirection()` dans `src/lib/svg/opening-direction.ts` (passer T008-T010)
- [x] T013 Exporter les types `OuvertureInterieure` depuis `src/lib/svg/opening-direction.ts`

**Checkpoint**: Exécuter `npm test -- src/__tests__/lib/opening-direction.test.ts` - tous les tests doivent passer

---

## Phase 3: User Story 1 - Extraction PDF (Priority: P1) 🎯 MVP

**Goal**: Le système extrait correctement le champ "Ouverture intérieure" des PDFs

**Independent Test**: Uploader un PDF avec "Ouverture intérieure: droite tirant" et vérifier le stockage

### Implementation User Story 1

- [x] T014 [US1] Ajouter le champ `ouvertureInterieure` au prompt d'extraction dans `src/lib/pdf/prompts.ts` (après ligne 43, près de `ouvrantPrincipal`)
- [x] T015 [US1] Ajouter le schéma Zod `ouvertureInterieure` avec preprocessing lowercase dans `src/lib/validations/ai-response.ts` (après `ouvrantPrincipal` ligne 42)
- [x] T016 [US1] Ajouter le type `ouvertureInterieure` optionnel au schéma `MenuiserieDataSchema` dans `src/lib/validations/menuiserie.ts`

**Checkpoint**: US1 complète - tester avec upload PDF manuel

---

## Phase 4: User Story 2 - Affichage SVG (Priority: P1)

**Goal**: Le triangle SVG pointe dans la bonne direction basée sur "Ouverture intérieure"

**Independent Test**: Visualiser le SVG avec "droite tirant" et vérifier que le triangle pointe vers la gauche

### Tests User Story 2 (TDD - RED)

- [x] T017 [P] [US2] Créer `src/__tests__/svg/ouverture-mapping.test.tsx` avec structure de test vide
- [x] T018 [P] [US2] Test SVG avec `sensOuverture: 'gauche'` affiche triangle pointant gauche dans `src/__tests__/svg/ouverture-mapping.test.tsx`
- [x] T019 [P] [US2] Test SVG avec `sensOuverture: null` n'affiche pas de triangle dans `src/__tests__/svg/ouverture-mapping.test.tsx`
- [x] T020 [P] [US2] Test fenêtre 2 vantaux affiche triangles vers le centre dans `src/__tests__/svg/ouverture-mapping.test.tsx`

### Implementation User Story 2

- [x] T021 [US2] Ajouter prop `sensOuverture?: OpeningDirection | null` à l'interface `InteractiveSVGZoneProps` dans `src/components/menuiseries/InteractiveSVGZone.tsx`
- [x] T022 [US2] Passer `sensOuverture` au composant `MenuiserieSVG` dans `src/components/menuiseries/InteractiveSVGZone.tsx` (remplacer valeur hardcodée)
- [x] T023 [US2] Modifier la logique d'affichage du triangle pour gérer `sensOuverture: null` (pas de triangle) dans `src/lib/svg/menuiserie-templates.tsx`
- [x] T024 [US2] Importer et utiliser `getEffectiveOpeningDirection()` dans `src/app/menuiserie/[id]/page.tsx` pour calculer `sensOuverture`
- [x] T025 [US2] Passer `sensOuverture` calculé au composant `InteractiveSVGZone` dans `src/app/menuiserie/[id]/page.tsx`

**Checkpoint**: US2 complète - exécuter `npm test -- src/__tests__/svg/` - tous les tests doivent passer

---

## Phase 5: User Story 3 - Édition Formulaire (Priority: P1)

**Goal**: L'utilisateur peut voir et modifier le champ "Ouverture intérieure" avec mise à jour SVG temps réel

**Independent Test**: Modifier le champ de "droite tirant" à "gauche tirant" et observer le changement SVG instantané

### Implementation User Story 3

- [x] T026 [P] [US3] Ajouter `ouvertureInterieure` à `CRITICAL_FIELDS` dans `src/app/menuiserie/[id]/page.tsx` (affichage garanti)
- [x] T027 [P] [US3] Ajouter le label "Ouverture intérieure" dans `FIELD_LABELS` dans `src/app/menuiserie/[id]/page.tsx`
- [x] T028 [US3] Créer configuration select pour `ouvertureInterieure` avec options ["Droite tirant", "Gauche tirant", "Non défini"] - ajouter dans les fichiers JSON de `src/lib/forms/configs/`
- [x] T029 [US3] Connecter le changement du champ `ouvertureInterieure` au recalcul de `sensOuverture` pour mise à jour SVG dans `src/app/menuiserie/[id]/page.tsx`

**Checkpoint**: US3 complète - tester édition manuelle et vérifier mise à jour SVG < 100ms

---

## Phase 6: User Story 4 - Rétro-compatibilité Legacy (Priority: P2)

**Goal**: Les données existantes avec `ouvrantPrincipal` fonctionnent correctement

**Independent Test**: Charger une menuiserie avec `ouvrantPrincipal: "droite"` et vérifier l'affichage correct

### Tests User Story 4 (TDD - RED)

- [x] T030 [P] [US4] Test `getEffectiveOpeningDirection` avec legacy `ouvrantPrincipal: "droite"` retourne 'gauche' dans `src/__tests__/lib/opening-direction.test.ts`
- [x] T031 [P] [US4] Test `getEffectiveOpeningDirection` avec legacy `ouvrantPrincipal: "gauche"` retourne 'droite' dans `src/__tests__/lib/opening-direction.test.ts`

### Implementation User Story 4

- [x] T032 [US4] Vérifier que le fallback legacy fonctionne dans `src/app/menuiserie/[id]/page.tsx` (utiliser `ouvrantPrincipal` si `ouvertureInterieure` absent)
- [x] T033 [US4] Ajouter tests d'intégration pour données legacy existantes (optionnel - test manuel acceptable)

**Checkpoint**: US4 complète - tester avec données legacy en base

---

## Phase 7: Polish & Validation

**Purpose**: Vérifications finales et nettoyage

- [x] T034 Exécuter tous les tests `npm test` - vérifier 0 échec (515 passed, 41 integration tests skipped - need server)
- [x] T035 Exécuter `npm run type-check` - vérifier 0 erreur TypeScript
- [x] T036 Exécuter `npm run lint` - vérifier 0 erreur ESLint (96 warnings préexistants)
- [ ] T037 Tester manuellement avec PDF de référence `/docs/fm.pdf`
- [ ] T038 Valider les scénarios de `quickstart.md` manuellement
- [ ] T039 Mettre à jour `/docs/TODO_LIST.md` avec la feature complétée

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ─────────────────────┐
                                     ▼
Phase 2 (Foundational) ──────────────┤ BLOQUE TOUT
                                     ▼
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
    Phase 3 (US1)               Phase 4 (US2)               Phase 5 (US3)
    Extraction PDF              Affichage SVG               Édition Form
         │                           │                           │
         └───────────────────────────┼───────────────────────────┘
                                     ▼
                              Phase 6 (US4)
                              Rétro-compat
                                     │
                                     ▼
                              Phase 7 (Polish)
```

### User Story Dependencies

| Story | Dépend de | Peut démarrer après |
|-------|-----------|---------------------|
| US1 (Extraction) | Phase 2 | Phase 2 complète |
| US2 (SVG) | Phase 2 + T011-T012 | Phase 2 complète |
| US3 (Formulaire) | US2 (T021-T025) | US2 complète |
| US4 (Legacy) | Phase 2 | Phase 2 complète |

### Parallel Opportunities

**Phase 2 - Tests en parallèle** (8 tâches [P]):
```
T003, T004, T005, T006, T007, T008, T009, T010
```

**Phase 4 - Tests US2 en parallèle** (4 tâches [P]):
```
T017, T018, T019, T020
```

**Phase 5 - Config formulaire** (2 tâches [P]):
```
T026, T027
```

---

## Parallel Example: Phase 2 Foundational

```bash
# Lancer tous les tests en parallèle (ils doivent tous FAIL en RED):
npm test -- src/__tests__/lib/opening-direction.test.ts

# Puis implémenter séquentiellement:
# T011 → passe T003-T007
# T012 → passe T008-T010
# T013 → exports complets
```

---

## Implementation Strategy

### MVP First (US1 + US2 seulement)

1. ✅ Phase 1: Setup (5 min)
2. ✅ Phase 2: Foundational - logique mapping (30 min)
3. ✅ Phase 3: US1 - Extraction PDF (20 min)
4. ✅ Phase 4: US2 - Affichage SVG (30 min)
5. **STOP et VALIDER**: Le triangle s'affiche correctement
6. Démo possible à ce stade

### Incremental Delivery

1. MVP (US1 + US2) → Triangle correct sur extraction
2. +US3 → Édition formulaire temps réel
3. +US4 → Données legacy supportées
4. Polish → Prêt pour production

---

## Summary

| Métrique | Valeur |
|----------|--------|
| **Total tâches** | 39 |
| **Phase 1 (Setup)** | 2 |
| **Phase 2 (Foundational)** | 11 |
| **US1 (Extraction)** | 3 |
| **US2 (Affichage SVG)** | 9 |
| **US3 (Édition Form)** | 4 |
| **US4 (Legacy)** | 4 |
| **Phase 7 (Polish)** | 6 |
| **Tâches parallélisables** | 18 (46%) |
| **MVP scope** | Phase 1-4 (US1 + US2) |

---

## Notes

- TDD obligatoire (Constitution Principe II): écrire tests RED avant implementation
- Chaque User Story testable indépendamment
- Commit après chaque checkpoint
- Arrêt possible à chaque checkpoint pour validation
