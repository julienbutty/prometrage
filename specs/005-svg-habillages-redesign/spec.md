# Feature Specification: Redesign SVG Editor avec Habillages Intégrés

**Feature Branch**: `005-svg-habillages-redesign`
**Created**: 2026-01-01
**Status**: Draft
**Input**: User description: "Redesign de l'éditeur SVG pour repositionner les champs d'habillages (Int/Ext) directement autour du schéma de la fenêtre, avec comportement de propagation hybride et design mobile-first responsive."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Positionnement Spatial Intuitif des Habillages (Priority: P1)

Un artisan menuisier accède à l'éditeur SVG d'une menuiserie et voit immédiatement les champs d'habillages positionnés autour du schéma de la fenêtre. Chaque côté de la fenêtre (Haut, Bas, Gauche, Droite) a ses propres sélecteurs d'habillage Intérieur et Extérieur placés visuellement à proximité du côté correspondant. Cette disposition permet une compréhension spatiale immédiate sans ambiguïté.

**Why this priority**: C'est le cœur de la feature - sans le repositionnement spatial, l'amélioration UX n'existe pas. Cette story délivre la valeur principale de correspondance visuelle entre le schéma et les champs de saisie.

**Independent Test**: Peut être testée en affichant l'éditeur SVG et en vérifiant que chaque groupe d'habillages est positionné du bon côté du schéma (Haut en haut, Gauche à gauche, etc.).

**Acceptance Scenarios**:

1. **Given** un utilisateur sur l'écran d'édition d'une menuiserie, **When** il affiche l'éditeur SVG, **Then** il voit les habillages Haut (Int/Ext) au-dessus du schéma
2. **Given** un utilisateur sur l'écran d'édition d'une menuiserie, **When** il affiche l'éditeur SVG, **Then** il voit les habillages Gauche (Int/Ext) à gauche du schéma avec le champ Hauteur
3. **Given** un utilisateur sur l'écran d'édition d'une menuiserie, **When** il affiche l'éditeur SVG, **Then** il voit les habillages Droite (Int/Ext) à droite du schéma
4. **Given** un utilisateur sur l'écran d'édition d'une menuiserie, **When** il affiche l'éditeur SVG, **Then** il voit les habillages Bas (Int/Ext) en bas du schéma avec le champ Largeur

---

### User Story 2 - Distinction Visuelle Intérieur/Extérieur (Priority: P1)

L'artisan distingue immédiatement les champs Habillage Intérieur (bleu) des champs Habillage Extérieur (orange) grâce à un code couleur cohérent. Chaque sélecteur est stylisé en "pill/chip" avec une bordure et un fond coloré selon son type.

**Why this priority**: La distinction visuelle est essentielle pour éviter les erreurs de saisie. Un artisan confondant Int/Ext pourrait commander les mauvais matériaux.

**Independent Test**: Peut être testée en vérifiant les classes CSS des sélecteurs - bleu pour Intérieur, orange pour Extérieur.

**Acceptance Scenarios**:

1. **Given** un sélecteur d'Habillage Intérieur, **When** il est affiché, **Then** il a une bordure bleue et un fond bleu clair
2. **Given** un sélecteur d'Habillage Extérieur, **When** il est affiché, **Then** il a une bordure orange et un fond orange clair
3. **Given** un utilisateur sur mobile, **When** il voit les sélecteurs, **Then** chaque sélecteur a une hauteur minimale de 40px pour être facilement utilisable au doigt

---

### User Story 3 - Auto-propagation sur Première Sélection (Priority: P2)

Lorsqu'un artisan sélectionne pour la première fois une valeur d'habillage (par exemple "Standard" sur Hab Int Haut) et que tous les autres champs du même type sont vides, cette valeur se propage automatiquement aux 3 autres côtés. Une animation visuelle confirme la propagation.

**Why this priority**: Cette fonctionnalité accélère significativement la saisie dans le cas courant où tous les habillages sont identiques, tout en permettant la personnalisation ultérieure.

**Independent Test**: Peut être testée en sélectionnant une valeur sur un champ Hab Int vide et en vérifiant que les 3 autres Hab Int sont automatiquement remplis.

**Acceptance Scenarios**:

1. **Given** tous les champs Hab Intérieur sont vides, **When** l'utilisateur sélectionne "Standard" sur Hab Int Haut, **Then** les 3 autres champs Hab Int (Bas, Gauche, Droite) passent automatiquement à "Standard"
2. **Given** tous les champs Hab Extérieur sont vides, **When** l'utilisateur sélectionne "Alu" sur Hab Ext Gauche, **Then** les 3 autres champs Hab Ext passent automatiquement à "Alu"
3. **Given** une propagation automatique, **When** les valeurs sont propagées, **Then** une animation de highlight (ring coloré) apparaît sur les champs modifiés pendant environ 300ms

---

### User Story 4 - Pas de Propagation sur Modifications Ultérieures (Priority: P2)

Une fois que les habillages ont été définis (même partiellement), les modifications ultérieures sur un champ individuel ne se propagent pas aux autres côtés. Cela permet à l'artisan de personnaliser chaque côté indépendamment.

**Why this priority**: Complète le comportement de propagation hybride - sans cette règle, l'artisan ne pourrait pas avoir des habillages différents par côté.

**Independent Test**: Peut être testée en modifiant un champ Hab Int après une première sélection et en vérifiant que les autres restent inchangés.

**Acceptance Scenarios**:

1. **Given** tous les Hab Int sont à "Standard", **When** l'utilisateur change Hab Int Gauche en "Sans", **Then** seul Hab Int Gauche change, les autres restent à "Standard"
2. **Given** Hab Int Haut = "Standard" et les autres vides, **When** l'utilisateur sélectionne "Alu" sur Hab Int Bas, **Then** seul Hab Int Bas change à "Alu", pas de propagation car Haut était déjà défini

---

### User Story 5 - Bouton "Appliquer à Tous" Explicite (Priority: P2)

L'artisan peut utiliser un bouton explicite pour propager une valeur d'habillage à tous les côtés. Deux boutons distincts permettent d'appliquer séparément les habillages Intérieur et Extérieur.

**Why this priority**: Offre un contrôle explicite pour réinitialiser ou uniformiser les habillages après des modifications individuelles.

**Independent Test**: Peut être testée en cliquant sur le bouton "Appliquer Int à tous" et en vérifiant que les 4 champs Hab Int ont la même valeur.

**Acceptance Scenarios**:

1. **Given** des valeurs mixtes sur les Hab Int, **When** l'utilisateur clique sur "Appliquer Int à tous", **Then** tous les Hab Int prennent la valeur du premier côté non-null
2. **Given** des valeurs mixtes sur les Hab Ext, **When** l'utilisateur clique sur "Appliquer Ext à tous", **Then** tous les Hab Ext prennent la valeur du premier côté non-null
3. **Given** le bouton "Appliquer à tous" visible, **When** l'utilisateur le voit, **Then** il distingue clairement le bouton Int (bleu) du bouton Ext (orange)

---

### User Story 6 - Layout Responsive Mobile (Priority: P1)

Sur un écran mobile (< 640px), l'artisan voit un layout vertical empilé optimisé pour le tactile : Habillages Haut, puis SVG centré, puis Hauteur + Hab Gauche, puis Hab Droite, puis Largeur + Hab Bas, et enfin le bouton "Appliquer à tous".

**Why this priority**: L'application est mobile-first - la majorité des artisans l'utilisent sur le chantier avec leur téléphone.

**Independent Test**: Peut être testée en redimensionnant la fenêtre sous 640px et en vérifiant l'ordre d'empilement des éléments.

**Acceptance Scenarios**:

1. **Given** un écran < 640px de large, **When** l'éditeur SVG est affiché, **Then** les éléments sont empilés verticalement dans l'ordre défini
2. **Given** un écran mobile, **When** l'utilisateur interagit avec les sélecteurs, **Then** chaque élément interactif a une zone tactile minimale de 40px de hauteur
3. **Given** un écran >= 640px de large, **When** l'éditeur SVG est affiché, **Then** le layout desktop/tablet avec habillages autour du SVG est utilisé

---

### User Story 7 - Retrait de l'Allège de l'Éditeur SVG (Priority: P3)

L'allège n'apparaît plus dans l'éditeur SVG pour réduire la complexité visuelle. Elle reste accessible dans le formulaire classique (section "Détails additionnels").

**Why this priority**: Simplification de l'interface - l'allège est moins fréquemment modifiée que les habillages.

**Independent Test**: Peut être testée en vérifiant l'absence du champ Allège dans l'éditeur SVG et sa présence dans la section Détails additionnels.

**Acceptance Scenarios**:

1. **Given** l'éditeur SVG affiché, **When** l'utilisateur cherche le champ Allège, **Then** il ne le trouve pas dans l'éditeur SVG
2. **Given** le formulaire complet de menuiserie, **When** l'utilisateur accède à "Détails additionnels", **Then** le champ Allège est disponible

---

### Edge Cases

- Que se passe-t-il si toutes les valeurs Hab Int sont à "Sans" et l'utilisateur clique sur "Appliquer à tous" ? → La valeur "Sans" est appliquée (comportement normal)
- Comment le système gère-t-il les options d'habillage dynamiques selon le matériau (PVC/ALU) et le type de pose (NEUF/RENO) ? → Les options affichées dans les sélecteurs sont filtrées selon la configuration du matériau et du type de pose de la menuiserie courante
- Que se passe-t-il si l'utilisateur change le matériau après avoir sélectionné des habillages ? → Les valeurs incompatibles sont réinitialisées à la valeur par défaut du nouveau matériau
- Comment le système gère-t-il un écran très petit (< 320px) ? → Le layout mobile reste en pile verticale avec des éléments qui prennent 100% de la largeur

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le système DOIT afficher les sélecteurs d'habillage autour du schéma SVG de la fenêtre, positionnés selon le côté correspondant (Haut en haut, Gauche à gauche, etc.)
- **FR-002**: Le système DOIT distinguer visuellement les habillages Intérieur (bordure et fond bleu) des habillages Extérieur (bordure et fond orange)
- **FR-003**: Le système DOIT propager automatiquement la première valeur sélectionnée d'un type d'habillage (Int ou Ext) aux 3 autres côtés si tous sont vides
- **FR-004**: Le système NE DOIT PAS propager les modifications ultérieures d'un champ d'habillage aux autres côtés
- **FR-005**: Le système DOIT fournir deux boutons distincts "Appliquer Int à tous" et "Appliquer Ext à tous"
- **FR-006**: Le système DOIT afficher une animation de highlight lors de la propagation automatique des valeurs
- **FR-007**: Le système DOIT positionner le champ Hauteur à gauche du SVG, au-dessus des habillages Gauche
- **FR-008**: Le système DOIT positionner le champ Largeur en bas, à gauche des habillages Bas
- **FR-009**: Le système DOIT retirer le champ Allège de l'éditeur SVG
- **FR-010**: Le système DOIT adapter le layout en mode mobile (< 640px) avec un empilement vertical
- **FR-011**: Le système DOIT garantir une zone tactile minimale de 40px de hauteur pour tous les éléments interactifs
- **FR-012**: Le système DOIT charger les options d'habillage dynamiquement selon le matériau et le type de pose via `getHabillageConfig(materiau, pose)`

### Key Entities

- **HabillageGroup**: Représente un groupe de 2 sélecteurs (Intérieur + Extérieur) pour un côté donné. Attributs : côté (Haut/Bas/Gauche/Droite), valeurInt, valeurExt
- **PropagationState**: État de suivi pour la logique de propagation hybride. Attributs : firstSelectionDone (boolean par type Int/Ext)
- **HabillageConfig**: Configuration dynamique des options disponibles. Attributs : matériau, typePose, optionsIntérieur[], optionsExtérieur[]

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Les utilisateurs identifient correctement quel habillage correspond à quel côté de la fenêtre dans 95% des cas (test utilisateur)
- **SC-002**: Le temps de saisie des 8 valeurs d'habillage est réduit de 50% grâce à la propagation automatique (cas où tous les habillages sont identiques)
- **SC-003**: Le taux d'erreur de saisie (confusion Int/Ext ou mauvais côté) est réduit de 80% par rapport à l'interface précédente
- **SC-004**: 100% des éléments interactifs sont utilisables au doigt sur mobile (zone tactile >= 40px)
- **SC-005**: Le formulaire reste lisible et utilisable sur des écrans de 320px à 1920px de large
- **SC-006**: Les utilisateurs peuvent compléter la saisie des habillages en moins de 30 secondes (cas standard avec propagation)
