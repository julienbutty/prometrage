# Feature Specification: Intégration des Habillages Int/Ext autour du SVG

**Feature Branch**: `003-habillages-svg-integration`
**Created**: 2025-01-01
**Status**: Draft
**Input**: User description: "Intégrer les champs Habillages Intérieur et Habillages Extérieur pour chaque côté du produit autour du SVG. Les habillages sont des valeurs d'enum (Standard, Sans, Haut, Bas, Montants), pas des valeurs numériques."

## Contexte métier

Les habillages sont des finitions qui masquent le cadre de la menuiserie côté intérieur et extérieur. Chaque côté de la menuiserie (haut, bas, gauche, droite) peut avoir un habillage différent :

**Valeurs possibles** (commun PVC Neuf, PVC Réno, Alu Réno) :
- **Standard** : Habillage fourni par défaut selon les spécifications du fabricant
- **Sans** : Aucun habillage sur ce côté
- **Haut** : Habillage uniquement sur le côté haut
- **Bas** : Habillage uniquement sur le côté bas
- **Montants** : Habillages sur les montants (gauche et droite)

**Pour l'Aluminium** : Des références spécifiques de couvre-joints existent (25mm, 45mm, 65mm, etc.) mais le mode de sélection reste similaire.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sélection des habillages intérieurs autour du schéma (Priority: P1)

L'artisan accède à la page d'une menuiserie et peut sélectionner les habillages intérieurs pour chaque côté (haut, bas, gauche, droite) via des sélecteurs positionnés visuellement autour du schéma SVG. La disposition spatiale des sélecteurs correspond à l'emplacement physique sur la menuiserie.

**Why this priority**: Les habillages intérieurs sont visibles depuis l'habitat, ils sont prioritaires pour l'artisan qui fait le métré côté intérieur.

**Independent Test**: Naviguer vers une menuiserie, sélectionner "Sans" pour l'habillage intérieur haut et "Standard" pour l'habillage intérieur bas, puis vérifier que les valeurs sont enregistrées correctement.

**Acceptance Scenarios**:

1. **Given** une menuiserie affichée avec le schéma SVG, **When** l'artisan clique sur le sélecteur d'habillage intérieur haut, **Then** une liste déroulante affiche les options : Standard, Sans, Haut, Bas, Montants
2. **Given** l'artisan a sélectionné "Sans" pour l'habillage intérieur gauche, **When** il sauvegarde, **Then** la valeur est enregistrée dans `donneesModifiees.habillageInt.gauche = "Sans"`
3. **Given** une menuiserie avec des habillages intérieurs déjà définis dans le PDF, **When** l'artisan affiche la page, **Then** les sélecteurs affichent les valeurs originales pré-sélectionnées

---

### User Story 2 - Sélection des habillages extérieurs autour du schéma (Priority: P2)

L'artisan peut sélectionner les habillages extérieurs pour chaque côté de la menuiserie. Ces sélecteurs sont visuellement distincts des habillages intérieurs (couleur ou icône différente) pour éviter toute confusion.

**Why this priority**: Les habillages extérieurs sont visibles depuis l'extérieur. Ils sont souvent déterminés après les habillages intérieurs.

**Independent Test**: Sélectionner des habillages extérieurs différents pour les 4 côtés et vérifier la sauvegarde.

**Acceptance Scenarios**:

1. **Given** une menuiserie affichée, **When** l'artisan sélectionne les habillages extérieurs, **Then** les sélecteurs sont clairement identifiables comme "extérieurs" (icône ou couleur distincte)
2. **Given** l'artisan a sélectionné "Montants" pour les habillages extérieurs, **When** il sauvegarde, **Then** les valeurs sont enregistrées dans `donneesModifiees.habillageExt`
3. **Given** les habillages intérieurs et extérieurs affichés, **When** l'artisan regarde l'interface, **Then** il peut distinguer immédiatement quels sélecteurs correspondent à l'intérieur vs l'extérieur

---

### User Story 3 - Affichage compact et ergonomique sur mobile (Priority: P3)

Sur mobile, les 8 sélecteurs d'habillage (4 int + 4 ext) sont affichés de manière compacte sous le schéma SVG, organisés en sections claires "Intérieur" et "Extérieur".

**Why this priority**: L'ergonomie mobile est essentielle car l'artisan utilise son téléphone sur le chantier. Un affichage trop dense ou peu lisible ralentit son travail.

**Independent Test**: Afficher la page sur un écran de 375px de large et vérifier que tous les sélecteurs sont accessibles sans scroll horizontal.

**Acceptance Scenarios**:

1. **Given** un écran mobile de 375px, **When** l'artisan affiche la page menuiserie, **Then** les sélecteurs d'habillage sont empilés verticalement sous le schéma
2. **Given** l'affichage mobile, **When** l'artisan touche un sélecteur, **Then** la zone de touch est d'au moins 44x44px (Apple HIG)
3. **Given** l'affichage mobile, **When** l'artisan scrolle, **Then** les sections "Habillages intérieurs" et "Habillages extérieurs" ont des titres visibles qui aident à l'orientation

---

### User Story 4 - Propagation automatique des habillages (Priority: P1)

Lorsque l'artisan sélectionne une valeur d'habillage (intérieur ou extérieur) sur un côté, cette valeur est automatiquement appliquée aux 3 autres côtés du même type (int ou ext). L'artisan peut ensuite surcharger individuellement un côté spécifique si nécessaire.

**Why this priority**: Cette fonctionnalité réduit considérablement le nombre de clics nécessaires (de 4 à 1 dans le cas courant), ce qui accélère le métré sur chantier.

**Independent Test**: Sélectionner "Standard" pour l'habillage intérieur haut, vérifier que les 3 autres côtés intérieurs passent aussi à "Standard", puis modifier uniquement le côté "bas" en "Sans" sans affecter les autres.

**Acceptance Scenarios**:

1. **Given** tous les habillages intérieurs sont vides, **When** l'artisan sélectionne "Standard" sur le côté haut, **Then** les côtés bas, gauche et droite passent automatiquement à "Standard"
2. **Given** les habillages intérieurs sont tous à "Standard", **When** l'artisan modifie le côté gauche en "Sans", **Then** seul le côté gauche change, les autres restent à "Standard"
3. **Given** les habillages extérieurs sont vides, **When** l'artisan sélectionne "Montants" sur le côté droit, **Then** les 4 côtés extérieurs passent à "Montants"
4. **Given** un côté a été surchargé manuellement, **When** l'artisan modifie un autre côté, **Then** le côté surchargé ne change pas (il conserve sa valeur manuelle)

---

### Edge Cases

- Que se passe-t-il si le type de menuiserie n'a pas d'habillages (ex: châssis fixe simple) ?
  - Les sélecteurs d'habillage restent visibles mais peuvent être laissés sur "Sans" par défaut
- Que se passe-t-il si l'artisan ne sélectionne rien ?
  - La valeur reste vide, ce qui est acceptable. À la validation, aucune erreur n'est levée car les habillages sont optionnels
- Que se passe-t-il si les données du PDF contiennent une valeur d'habillage inconnue ?
  - Le sélecteur affiche la valeur comme texte et permet à l'artisan de la corriger via le dropdown
- Que se passe-t-il si les habillages du PDF ont des valeurs différentes par côté ?
  - Les valeurs originales sont conservées individuellement, pas de propagation automatique au chargement
- Que se passe-t-il au rechargement de la page après avoir surchargé un côté ?
  - Les valeurs sauvegardées sont affichées telles quelles, l'état de surcharge n'est pas persisté (logique UI session uniquement)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le système DOIT afficher 4 sélecteurs pour les habillages intérieurs (haut, bas, gauche, droite) autour ou sous le schéma SVG
- **FR-002**: Le système DOIT afficher 4 sélecteurs pour les habillages extérieurs (haut, bas, gauche, droite) autour ou sous le schéma SVG
- **FR-003**: Chaque sélecteur DOIT proposer les options : Standard, Sans, Haut, Bas, Montants
- **FR-004**: Les sélecteurs d'habillages intérieurs DOIVENT être visuellement distincts des sélecteurs d'habillages extérieurs
- **FR-005**: Les sélecteurs DOIVENT afficher la valeur originale du PDF comme valeur par défaut pré-sélectionnée
- **FR-006**: Les modifications DOIVENT être enregistrées dans `donneesModifiees.habillageInt` et `donneesModifiees.habillageExt`
- **FR-007**: Sur desktop, les sélecteurs PEUVENT être positionnés visuellement autour du schéma SVG
- **FR-008**: Sur mobile, les sélecteurs DOIVENT être empilés verticalement sous le schéma SVG en sections claires
- **FR-009**: Les zones de touch des sélecteurs DOIVENT être d'au moins 44x44px sur mobile
- **FR-010**: Lorsqu'un habillage intérieur est sélectionné sur un côté, le système DOIT propager immédiatement cette valeur aux 3 autres côtés intérieurs (si non encore modifiés individuellement)
- **FR-011**: Lorsqu'un habillage extérieur est sélectionné sur un côté, le système DOIT propager immédiatement cette valeur aux 3 autres côtés extérieurs (si non encore modifiés individuellement)
- **FR-012**: L'utilisateur DOIT pouvoir surcharger individuellement un côté après la propagation, sans affecter les autres côtés
- **FR-013**: Lors de la propagation, les champs mis à jour DOIVENT afficher une animation de highlight flash (~300ms) pour informer l'utilisateur

### Key Entities *(include if feature involves data)*

- **HabillagesSide**: Objet contenant les valeurs d'habillage pour les 4 côtés (haut, bas, gauche, droite)
- **HabillageValue**: Enum des valeurs possibles : "Standard", "Sans", "Haut", "Bas", "Montants"
- **donneesModifiees.habillageInt**: Stockage des habillages intérieurs sélectionnés
- **donneesModifiees.habillageExt**: Stockage des habillages extérieurs sélectionnés

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: L'artisan peut sélectionner les 8 habillages (4 int + 4 ext) en moins de 30 secondes
- **SC-002**: 100% des options d'habillage métier sont disponibles dans les sélecteurs
- **SC-003**: Sur mobile (375px), tous les sélecteurs sont accessibles sans scroll horizontal
- **SC-004**: L'artisan peut distinguer les habillages intérieurs des extérieurs en moins de 2 secondes grâce à la différenciation visuelle
- **SC-005**: Les valeurs sélectionnées sont correctement sauvegardées et récupérées au rechargement de la page

## Clarifications

### Session 2025-01-01

- Q: Comment gérer la saisie des habillages quand ils sont souvent identiques sur les 4 côtés ? → A: Propagation automatique avec surcharge possible
- Q: Quand la propagation doit-elle se déclencher ? → A: Immédiatement dès la sélection d'une valeur
- Q: Comment informer l'utilisateur de la propagation ? → A: Animation légère (highlight flash ~300ms) sur les champs mis à jour
- Q: Comment gérer l'état "surchargé" d'un côté ? → A: État UI uniquement, pas de persistance (au rechargement, valeurs affichées telles quelles)

## Assumptions

- Le composant `HabillageInputs` existant sera remplacé par un nouveau composant utilisant des sélecteurs au lieu d'inputs numériques
- Les valeurs d'habillage sont identiques pour PVC et Alu (Standard, Sans, Haut, Bas, Montants)
- La structure de données existante (`habillageInt`, `habillageExt`) est conservée mais les valeurs passent de numériques à textuelles
- L'intégration se fait dans le composant `MenuiserieSVGEditor` existant
