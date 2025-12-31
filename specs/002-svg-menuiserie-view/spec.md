# Feature Specification: Visualisation SVG Menuiserie avec Saisie Contextuelle

**Feature Branch**: `002-svg-menuiserie-view`
**Created**: 2025-12-31
**Status**: Draft
**Input**: User description: "Ajouter un composant de visualisation SVG dynamique pour chaque menuiserie, permettant à l'artisan de voir un schéma simplifié de la menuiserie avec les champs de saisie positionnés autour du dessin."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Affichage du schéma SVG de la menuiserie (Priority: P1)

L'artisan accède à la page de détail d'une menuiserie et voit un schéma SVG représentant visuellement le type de menuiserie (fenêtre, porte-fenêtre, coulissant, etc.) avec le bon nombre de vantaux. Ce schéma lui permet de confirmer visuellement qu'il travaille sur la bonne menuiserie.

**Why this priority**: C'est le fondement de la feature. Sans le rendu SVG, aucune autre fonctionnalité n'est possible. L'artisan a besoin de cette validation visuelle pour éviter les erreurs de saisie sur le mauvais produit.

**Independent Test**: Naviguer vers une menuiserie existante et vérifier que le schéma SVG s'affiche correctement selon le type et le nombre de vantaux extraits du PDF.

**Acceptance Scenarios**:

1. **Given** une menuiserie de type "Fenêtre 2 vantaux" en base, **When** l'artisan accède à la page de cette menuiserie, **Then** un schéma SVG affichant un rectangle avec 2 vantaux distincts est visible
2. **Given** une menuiserie de type "Coulissant 3 vantaux", **When** l'artisan accède à la page, **Then** le schéma SVG affiche un rectangle avec 3 panneaux coulissants représentés
3. **Given** une menuiserie de type "Châssis fixe", **When** l'artisan accède à la page, **Then** le schéma SVG affiche un rectangle simple sans divisions de vantaux

---

### User Story 2 - Saisie contextuelle des dimensions autour du schéma (Priority: P2)

L'artisan peut saisir les dimensions principales (largeur, hauteur, allège) directement dans des champs positionnés autour du schéma SVG. La largeur est en haut, la hauteur à droite, l'allège en bas. Cette disposition spatiale correspond à l'emplacement physique de ces mesures sur la menuiserie réelle.

**Why this priority**: La saisie contextuelle améliore significativement l'UX en réduisant la charge cognitive. L'artisan associe visuellement le champ à la dimension qu'il mesure sur le chantier.

**Independent Test**: Sur la page d'une menuiserie, saisir des valeurs dans les champs dimensions autour du schéma et vérifier qu'elles sont enregistrées correctement.

**Acceptance Scenarios**:

1. **Given** un schéma SVG affiché pour une menuiserie, **When** l'artisan saisit "1200" dans le champ largeur en haut du schéma, **Then** la valeur est enregistrée dans les données modifiées de la menuiserie
2. **Given** un schéma SVG affiché, **When** l'artisan saisit "1100" dans le champ hauteur à droite et "900" dans le champ allège en bas, **Then** les deux valeurs sont enregistrées correctement
3. **Given** un champ dimension vide, **When** l'artisan clique dedans, **Then** le champ affiche la valeur originale du PDF en placeholder pour référence

---

### User Story 3 - Saisie des habillages intérieurs et extérieurs (Priority: P3)

L'artisan peut saisir les habillages intérieurs et extérieurs pour chaque côté de la menuiserie (haut, bas, gauche, droite). Les champs sont positionnés autour du schéma SVG de manière à correspondre au côté concerné.

**Why this priority**: Les habillages sont des données métier importantes pour la pose. Leur saisie contextuelle complète l'expérience de prise de côtes visuelle.

**Independent Test**: Sur la page d'une menuiserie, saisir des valeurs d'habillage pour les 4 côtés (int et ext) et vérifier la sauvegarde.

**Acceptance Scenarios**:

1. **Given** un schéma SVG affiché, **When** l'artisan saisit "50" dans le champ habillage intérieur gauche, **Then** la valeur est enregistrée dans `donneesModifiees.habillagesInterieurs.gauche`
2. **Given** un schéma SVG affiché, **When** l'artisan saisit des habillages extérieurs pour les 4 côtés, **Then** toutes les valeurs sont enregistrées dans `donneesModifiees.habillagesExterieurs`
3. **Given** une menuiserie avec habillages originaux du PDF, **When** l'artisan affiche la page, **Then** les champs d'habillage affichent les valeurs originales comme placeholder

---

### Edge Cases

- Que se passe-t-il si le type de menuiserie n'est pas reconnu (nouveau type non prévu) ?
  - Le système affiche un rectangle générique sans vantaux avec un message indiquant le type non supporté
- Que se passe-t-il si le nombre de vantaux est 0 ou null ?
  - Le système affiche un châssis fixe (rectangle simple)
- Comment gérer les dimensions extrêmes (très petit ou très grand) ?
  - Le SVG utilise des proportions fixes, les dimensions réelles sont affichées uniquement dans les labels
- Que se passe-t-il sur mobile si l'écran est trop petit pour afficher tous les champs ?
  - Les champs sont repositionnés en mode vertical sous le schéma (responsive mobile-first)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le système DOIT générer un schéma SVG basé sur le type de menuiserie (fenêtre, porte-fenêtre, coulissant, châssis fixe, châssis à soufflet)
- **FR-002**: Le système DOIT adapter le schéma SVG selon le nombre de vantaux (1 à 4 vantaux)
- **FR-003**: Le système DOIT afficher un champ de saisie pour la largeur positionné en haut du schéma
- **FR-004**: Le système DOIT afficher un champ de saisie pour la hauteur positionné à droite du schéma
- **FR-005**: Le système DOIT afficher un champ de saisie pour l'allège positionné en bas du schéma
- **FR-006**: Le système DOIT afficher des champs de saisie pour les habillages intérieurs (haut, bas, gauche, droite) positionnés autour du schéma
- **FR-007**: Le système DOIT afficher des champs de saisie pour les habillages extérieurs (haut, bas, gauche, droite) positionnés autour du schéma
- **FR-008**: Les champs de saisie DOIVENT afficher la valeur originale du PDF comme placeholder
- **FR-009**: Les modifications DOIVENT être enregistrées dans `donneesModifiees` de la menuiserie
- **FR-010**: Le composant DOIT être responsive et s'adapter aux écrans mobiles (mobile-first)
- **FR-011**: Le système DOIT afficher un schéma générique si le type de menuiserie n'est pas reconnu

### Key Entities *(include if feature involves data)*

- **MenuiserieSVG**: Composant de rendu visuel généré à partir du type de menuiserie et du nombre de vantaux
- **ChampsDimensions**: Ensemble des champs éditables (largeur, hauteur, allège) positionnés autour du schéma
- **ChampsHabillages**: Ensemble des champs éditables pour les habillages intérieurs et extérieurs (8 champs au total : 4 int + 4 ext)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: L'artisan peut identifier visuellement le type de menuiserie en moins de 2 secondes grâce au schéma SVG
- **SC-002**: 100% des types de menuiseries connus (fenêtre, porte-fenêtre, coulissant, châssis fixe, châssis à soufflet) ont un rendu SVG distinct
- **SC-003**: L'artisan peut saisir les 3 dimensions principales (largeur, hauteur, allège) sans faire défiler la page sur mobile
- **SC-004**: L'artisan peut saisir les 8 valeurs d'habillage (4 int + 4 ext) en moins de 60 secondes
- **SC-005**: Le composant s'affiche correctement sur écrans de 320px à 1920px de large

## Assumptions

- Les données du type de menuiserie et du nombre de vantaux sont déjà extraites et disponibles dans `donneesOriginales`
- Les types de menuiseries sont limités à : Fenêtre, Porte-fenêtre, Coulissant, Châssis fixe, Châssis à soufflet
- Le nombre de vantaux varie de 0 (fixe) à 4 (grand coulissant)
- Les proportions du SVG sont fixes et ne reflètent pas les dimensions réelles de la menuiserie (MVP)
- L'intégration se fait dans la page existante `/menuiserie/[id]`
