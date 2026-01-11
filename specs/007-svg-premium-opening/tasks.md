# Tasks: SVG Premium et Indicateur d'Ouverture

**Input**: Design documents from `/specs/007-svg-premium-opening/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: TDD est requis par la Constitution du projet. Les tests sont inclus pour chaque user story.

**Organization**: Tasks groupées par user story pour permettre une implémentation et des tests indépendants.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Peut s'exécuter en parallèle (fichiers différents, pas de dépendances)
- **[Story]**: User story concernée (US1, US2, US3, US4)
- Chemins exacts inclus dans les descriptions

---

## Phase 1: Setup (Infrastructure Partagée)

**Purpose**: Types et styles premium partagés par toutes les user stories

- [x] T001 [P] Créer le fichier de types étendu avec SensOuverture et ParsedMenuiserieType dans src/lib/svg/types.ts
- [x] T002 [P] Créer le fichier de styles premium avec PREMIUM_COLORS et gradients dans src/lib/svg/premium-styles.tsx
- [x] T003 [P] Étendre le schema Zod avec sensOuverture et ouvertureVerticale dans src/lib/validations/menuiserie.ts

---

## Phase 2: Foundational (Prérequis Bloquants)

**Purpose**: Définitions SVG partagées (defs) requises par tous les templates

**⚠️ CRITIQUE**: Les templates premium ne peuvent pas être implémentés sans ces définitions

- [x] T004 Créer la fonction getSVGDefs() pour gradients et filtres partagés dans src/lib/svg/premium-styles.tsx
- [x] T005 [P] Créer les tests unitaires pour premium-styles dans src/__tests__/svg/premium-styles.test.ts

**Checkpoint**: Définitions SVG prêtes - les user stories peuvent commencer

---

## Phase 3: User Story 1 - Visualisation Premium des Menuiseries (Priority: P1) 🎯 MVP

**Goal**: Afficher des schémas SVG de qualité professionnelle avec dégradés, ombres et palette harmonieuse

**Independent Test**: Ouvrir n'importe quelle menuiserie et vérifier visuellement le rendu premium (dégradés visibles, ombres légères, couleurs cohérentes)

### Tests pour User Story 1 (TDD)

> **NOTE: Écrire ces tests EN PREMIER, vérifier qu'ils ÉCHOUENT avant l'implémentation**

- [x] T006 [P] [US1] Test unitaire pour getFenetreSVG avec rendu premium dans src/__tests__/svg/premium-templates.test.tsx
- [x] T007 [P] [US1] Test unitaire pour getPorteFenetreSVG avec rendu premium dans src/__tests__/svg/premium-templates.test.tsx
- [x] T008 [P] [US1] Test unitaire pour getCoulissantSVG avec flèches améliorées dans src/__tests__/svg/premium-templates.test.tsx
- [x] T009 [P] [US1] Test unitaire pour getChassisFixeSVG avec rendu premium dans src/__tests__/svg/premium-templates.test.tsx
- [x] T010 [P] [US1] Test unitaire pour getChassissouffletSVG avec rendu premium dans src/__tests__/svg/premium-templates.test.tsx

### Implémentation pour User Story 1

- [x] T011 [US1] Modifier getFenetreSVG() pour utiliser dégradés et ombres dans src/lib/svg/menuiserie-templates.tsx
- [x] T012 [US1] Modifier getPorteFenetreSVG() pour utiliser dégradés et ombres dans src/lib/svg/menuiserie-templates.tsx
- [x] T013 [US1] Modifier getCoulissantSVG() pour utiliser palette premium et flèches améliorées dans src/lib/svg/menuiserie-templates.tsx
- [x] T014 [US1] Modifier getChassisFixeSVG() pour utiliser dégradés et ombres dans src/lib/svg/menuiserie-templates.tsx
- [x] T015 [US1] Modifier getChassissouffletSVG() pour utiliser dégradés et ombres dans src/lib/svg/menuiserie-templates.tsx
- [x] T016 [US1] Ajouter le support du paramètre materiau (ALU/PVC) aux templates dans src/lib/svg/menuiserie-templates.tsx
- [x] T017 [US1] Mettre à jour MenuiserieSVG.tsx pour passer les <defs> aux templates dans src/components/menuiseries/MenuiserieSVG.tsx
- [x] T018 [US1] Ajouter aria-label et title pour accessibilité dans src/lib/svg/menuiserie-templates.tsx

**Checkpoint**: Tous les SVG affichent un rendu premium. US1 est fonctionnelle et testable indépendamment.

---

## Phase 4: User Story 2 - Sélection et Affichage du Sens d'Ouverture (Priority: P1)

**Goal**: Permettre à l'utilisateur de sélectionner gauche/droite et voir l'indicateur sur le SVG en temps réel

**Independent Test**: Ouvrir une fenêtre, changer le sens d'ouverture, vérifier que le SVG se met à jour instantanément et que la valeur persiste après sauvegarde

### Tests pour User Story 2 (TDD)

- [x] T019 [P] [US2] Test unitaire pour l'indicateur d'ouverture (arc + triangle) gauche dans src/__tests__/svg/ouverture-indicator.test.tsx
- [x] T020 [P] [US2] Test unitaire pour l'indicateur d'ouverture droite dans src/__tests__/svg/ouverture-indicator.test.tsx
- [x] T021 [P] [US2] Test composant pour OuvertureSelector rendu et interaction dans src/__tests__/components/ouverture-selector.test.tsx
- [x] T022 [P] [US2] Test de snapshot pour position de poignée selon sens d'ouverture dans src/__tests__/svg/ouverture-indicator.test.tsx

### Implémentation pour User Story 2

- [x] T023 [US2] Créer la fonction getOpeningIndicator() pour arc + triangle dans src/lib/svg/menuiserie-templates.tsx
- [x] T024 [US2] Modifier getFenetreSVG() pour accepter sensOuverture et afficher l'indicateur dans src/lib/svg/menuiserie-templates.tsx
- [x] T025 [US2] Modifier getPorteFenetreSVG() pour accepter sensOuverture et afficher l'indicateur dans src/lib/svg/menuiserie-templates.tsx
- [x] T026 [US2] Modifier la position des poignées selon sensOuverture dans src/lib/svg/menuiserie-templates.tsx
- [x] T027 [US2] Créer le composant OuvertureSelector avec boutons Gauche/Droite dans src/components/menuiseries/OuvertureSelector.tsx
- [x] T028 [US2] Intégrer OuvertureSelector dans SVGZone.tsx avec callback onChange dans src/components/menuiseries/SVGZone.tsx
- [x] T029 [US2] Passer sensOuverture depuis SVGZone vers MenuiserieSVG dans src/components/menuiseries/SVGZone.tsx
- [x] T030 [US2] Gérer l'état sensOuverture dans la page menuiserie/[id] dans src/app/menuiserie/[id]/page.tsx
- [x] T031 [US2] Ajouter sensOuverture à la mutation de sauvegarde dans src/app/menuiserie/[id]/page.tsx
- [x] T032 [US2] Masquer OuvertureSelector pour châssis-fixe, châssis-soufflet et coulissant dans src/components/menuiseries/SVGZone.tsx

**Checkpoint**: L'utilisateur peut changer le sens d'ouverture et le voir sur le SVG. US2 est fonctionnelle et testable indépendamment.

---

## Phase 5: User Story 3 - Gestion Oscillo-Battant (Priority: P2)

**Goal**: Afficher deux indicateurs d'ouverture pour les oscillo-battants (horizontal + vertical)

**Independent Test**: Ouvrir une menuiserie "oscillo-battant", vérifier que le formulaire affiche les deux options et que le SVG montre les deux indicateurs

### Tests pour User Story 3 (TDD)

- [x] T033 [P] [US3] Test unitaire pour indicateur combiné oscillo-battant dans src/__tests__/svg/ouverture-indicator.test.tsx
- [x] T034 [P] [US3] Test composant pour OuvertureSelector en mode oscillo-battant dans src/__tests__/components/ouverture-selector.test.tsx

### Implémentation pour User Story 3

- [x] T035 [US3] Créer getOscilloBattantIndicator() pour indicateur combiné dans src/lib/svg/menuiserie-templates.tsx
- [x] T036 [US3] Modifier getFenetreSVG() pour utiliser indicateur combiné si isOscilloBattant dans src/lib/svg/menuiserie-templates.tsx
- [x] T037 [US3] Ajouter mode oscillo-battant à OuvertureSelector (afficher badge basculement) dans src/components/menuiseries/OuvertureSelector.tsx
- [x] T038 [US3] Gérer ouvertureVerticale dans l'état de la page dans src/app/menuiserie/[id]/page.tsx
- [x] T039 [US3] Ajouter ouvertureVerticale à la mutation de sauvegarde dans src/app/menuiserie/[id]/page.tsx

**Checkpoint**: Les oscillo-battants affichent les deux modes d'ouverture. US3 est fonctionnelle et testable indépendamment.

---

## Phase 6: User Story 4 - Détection Automatique du Type (Priority: P3)

**Goal**: Détecter automatiquement si une menuiserie est un oscillo-battant depuis l'intitulé PDF

**Independent Test**: Vérifier qu'une menuiserie avec "oscillo-battant" dans l'intitulé active automatiquement le mode oscillo-battant

### Tests pour User Story 4 (TDD)

- [x] T040 [P] [US4] Test unitaire pour détection "oscillo-battant" dans parseMenuiserieType dans src/__tests__/svg/svg-utils.test.ts
- [x] T041 [P] [US4] Test unitaire pour détection "oscillo battant" (avec espace) dans src/__tests__/svg/svg-utils.test.ts
- [x] T042 [P] [US4] Test unitaire pour détection "OB" abréviation dans src/__tests__/svg/svg-utils.test.ts
- [x] T043 [P] [US4] Test unitaire pour non-détection sur intitulé normal dans src/__tests__/svg/svg-utils.test.ts

### Implémentation pour User Story 4

- [x] T044 [US4] Ajouter les patterns OSCILLO_BATTANT_PATTERNS dans src/lib/svg/svg-utils.ts
- [x] T045 [US4] Modifier parseMenuiserieType() pour retourner isOscilloBattant dans src/lib/svg/svg-utils.ts
- [x] T046 [US4] Utiliser isOscilloBattant pour initialiser ouvertureVerticale dans src/app/menuiserie/[id]/page.tsx
- [x] T047 [US4] Passer isOscilloBattant à OuvertureSelector depuis la page dans src/app/menuiserie/[id]/page.tsx

**Checkpoint**: Les oscillo-battants sont détectés automatiquement. US4 est fonctionnelle et testable indépendamment.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Améliorations affectant plusieurs user stories

- [x] T048 [P] Vérifier la taille des SVG générés (< 15KB) et optimiser si nécessaire
- [x] T049 [P] Tester le rendu sur Chrome, Safari, Firefox (mobile et desktop)
- [x] T050 [P] Vérifier la réactivité mobile (viewBox responsive, touch targets 44px)
- [x] T051 Exécuter la validation quickstart.md
- [x] T052 Mettre à jour la documentation si nécessaire

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Pas de dépendances - peut commencer immédiatement
- **Foundational (Phase 2)**: Dépend de Setup - BLOQUE toutes les user stories
- **User Stories (Phase 3-6)**: Dépendent toutes de Foundational
  - US1 et US2 sont P1 et peuvent être faites en séquence
  - US3 dépend de US2 (utilise OuvertureSelector)
  - US4 dépend de US3 (détection pour mode oscillo-battant)
- **Polish (Phase 7)**: Dépend de toutes les user stories

### User Story Dependencies

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundational)
    │
    ├──────────────────────────────────────┐
    ▼                                      ▼
Phase 3 (US1 - Premium)              (parallèle si équipe)
    │
    ▼
Phase 4 (US2 - Ouverture)
    │
    ▼
Phase 5 (US3 - Oscillo-Battant)
    │
    ▼
Phase 6 (US4 - Détection Auto)
    │
    ▼
Phase 7 (Polish)
```

### Opportunités Parallèles

**Dans Phase 1 (Setup)**:
- T001, T002, T003 peuvent s'exécuter en parallèle

**Dans Phase 3 (US1)**:
- T006, T007, T008, T009, T010 (tests) peuvent s'exécuter en parallèle
- T011-T015 (templates) peuvent s'exécuter en parallèle après les tests

**Dans Phase 4 (US2)**:
- T019, T020, T021, T022 (tests) peuvent s'exécuter en parallèle

**Dans Phase 5 (US3)**:
- T033, T034 (tests) peuvent s'exécuter en parallèle

**Dans Phase 6 (US4)**:
- T040, T041, T042, T043 (tests) peuvent s'exécuter en parallèle

---

## Parallel Example: User Story 1

```bash
# Lancer tous les tests US1 en parallèle:
Task: "Test unitaire pour getFenetreSVG premium dans src/__tests__/svg/premium-templates.test.tsx"
Task: "Test unitaire pour getPorteFenetreSVG premium dans src/__tests__/svg/premium-templates.test.tsx"
Task: "Test unitaire pour getCoulissantSVG premium dans src/__tests__/svg/premium-templates.test.tsx"
Task: "Test unitaire pour getChassisFixeSVG premium dans src/__tests__/svg/premium-templates.test.tsx"
Task: "Test unitaire pour getChassissouffletSVG premium dans src/__tests__/svg/premium-templates.test.tsx"

# Puis lancer les modifications de templates en parallèle:
Task: "Modifier getFenetreSVG() pour dégradés et ombres dans src/lib/svg/menuiserie-templates.tsx"
Task: "Modifier getPorteFenetreSVG() pour dégradés et ombres dans src/lib/svg/menuiserie-templates.tsx"
# Note: ces tâches modifient le même fichier, donc attention aux conflits
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T005)
3. Complete Phase 3: User Story 1 - SVG Premium (T006-T018)
4. **STOP and VALIDATE**: Tester le rendu premium sur toutes les menuiseries
5. Complete Phase 4: User Story 2 - Sens d'Ouverture (T019-T032)
6. **STOP and VALIDATE**: Tester la sélection et persistance du sens d'ouverture
7. Deploy/demo si prêt - **MVP COMPLET**

### Incremental Delivery

1. Setup + Foundational → Infrastructure prête
2. User Story 1 → Tester → Demo (SVG Premium visible!)
3. User Story 2 → Tester → Demo (Ouverture interactive!)
4. User Story 3 → Tester → Demo (Oscillo-battant!)
5. User Story 4 → Tester → Demo (Détection automatique!)
6. Polish → Validation finale

---

## Notes

- [P] tasks = fichiers différents, pas de dépendances
- [Story] label = traçabilité vers la user story
- Chaque user story est indépendamment testable
- Vérifier que les tests échouent AVANT l'implémentation (TDD)
- Committer après chaque tâche ou groupe logique
- S'arrêter à chaque checkpoint pour valider la story
