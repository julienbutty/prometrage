# Feature Specification: SVG Premium et Indicateur d'Ouverture

**Feature Branch**: `007-svg-premium-opening`
**Created**: 2026-01-10
**Status**: Draft
**Input**: User description: "Améliorer les images SVG pour un rendu premium. Ajouter un champ ouverture (gauche/droite) avec représentation visuelle sur le schéma. Gestion spéciale des oscillo-battants avec ouverture verticale et horizontale."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualisation Premium des Menuiseries (Priority: P1)

En tant qu'artisan menuisier, je veux voir des schémas SVG de qualité professionnelle pour mes menuiseries, afin d'avoir une représentation visuelle claire et premium qui inspire confiance lors de mes prises de côtes.

**Why this priority**: Le rendu visuel premium est la base de cette feature - il améliore immédiatement la perception de qualité de l'application et la satisfaction utilisateur. Sans un rendu de qualité, les indicateurs d'ouverture ajoutés ensuite n'auront pas l'impact souhaité.

**Independent Test**: Peut être testé en ouvrant n'importe quelle menuiserie existante et en comparant visuellement le nouveau rendu avec l'ancien. Le nouveau rendu doit paraître plus professionnel (effets visuels, couleurs, contrastes).

**Acceptance Scenarios**:

1. **Given** une menuiserie de type fenêtre existe, **When** j'ouvre sa page de détail, **Then** le schéma SVG affiche un rendu avec des effets visuels premium (dégradés, ombres légères, couleurs harmonieuses)
2. **Given** une menuiserie de type coulissant existe, **When** j'affiche le schéma, **Then** les flèches directionnelles sont clairement visibles avec un style professionnel
3. **Given** n'importe quelle menuiserie, **When** j'affiche le schéma sur mobile, **Then** le rendu reste lisible et les détails visuels s'adaptent à la taille de l'écran

---

### User Story 2 - Sélection et Affichage du Sens d'Ouverture (Priority: P1)

En tant qu'artisan, je veux pouvoir indiquer et visualiser le sens d'ouverture (gauche ou droite) de ma menuiserie, afin que le schéma SVG reflète exactement la configuration réelle de la fenêtre.

**Why this priority**: Le sens d'ouverture est une information critique pour l'artisan - une erreur de sens peut entraîner une fabrication incorrecte. C'est le coeur fonctionnel de cette feature.

**Independent Test**: Peut être testé en sélectionnant une menuiserie et en changeant le sens d'ouverture dans le formulaire. Le schéma SVG doit immédiatement refléter ce changement.

**Acceptance Scenarios**:

1. **Given** une menuiserie de type fenêtre, **When** j'ouvre le formulaire, **Then** je vois un champ "Sens d'ouverture" avec les options "Gauche" et "Droite" (valeur par défaut: selon données PDF ou "Gauche")
2. **Given** le champ ouverture est réglé sur "Gauche", **When** j'observe le schéma SVG, **Then** un indicateur visuel montre clairement que l'ouverture est à gauche (symbole, flèche, ou représentation de la poignée)
3. **Given** le champ ouverture est réglé sur "Droite", **When** je change vers "Gauche", **Then** le schéma SVG se met à jour instantanément pour refléter le nouveau sens
4. **Given** je modifie le sens d'ouverture, **When** je sauvegarde la menuiserie, **Then** la valeur est persistée dans `donneesModifiees` et restaurée à la prochaine ouverture

---

### User Story 3 - Gestion Oscillo-Battant (Priority: P2)

En tant qu'artisan, lorsque je travaille sur une fenêtre oscillo-battante, je veux pouvoir visualiser et configurer les deux modes d'ouverture (horizontale ET verticale), afin de représenter fidèlement ce type de menuiserie spécial.

**Why this priority**: Les oscillo-battants représentent une part significative du marché mais sont moins fréquents que les fenêtres classiques. Cette fonctionnalité enrichit l'outil mais n'est pas bloquante pour la majorité des cas d'usage.

**Independent Test**: Peut être testé avec une menuiserie dont l'intitulé contient "oscillo-battant". Le formulaire doit proposer les deux options d'ouverture et le SVG doit les représenter.

**Acceptance Scenarios**:

1. **Given** une menuiserie identifiée comme oscillo-battante (via l'intitulé), **When** j'ouvre le formulaire, **Then** je vois deux indicateurs d'ouverture: un pour l'ouverture horizontale (gauche/droite) et un pour l'ouverture verticale (par le haut)
2. **Given** une fenêtre oscillo-battante, **When** j'observe le schéma SVG, **Then** les deux modes d'ouverture sont représentés visuellement (ex: symbole combiné montrant ouverture latérale + basculement)
3. **Given** je modifie l'ouverture horizontale d'un oscillo-battant, **When** je sauvegarde, **Then** seule l'ouverture horizontale change, l'ouverture verticale reste inchangée

---

### User Story 4 - Détection Automatique du Type de Menuiserie (Priority: P3)

En tant qu'utilisateur, je veux que le système détecte automatiquement si une menuiserie est un oscillo-battant à partir de l'intitulé PDF, afin de ne pas avoir à le configurer manuellement.

**Why this priority**: Amélioration de confort qui automatise une tâche manuelle. Moins critique que les fonctionnalités de base.

**Independent Test**: Peut être testé en uploadant un PDF avec une menuiserie contenant "oscillo-battant" dans l'intitulé et vérifiant que le type est correctement détecté.

**Acceptance Scenarios**:

1. **Given** un PDF contenant une menuiserie avec intitulé "Fenêtre 2 vantaux oscillo-battant", **When** le PDF est parsé, **Then** la menuiserie est identifiée comme oscillo-battante et les champs appropriés sont affichés
2. **Given** une menuiserie sans mention "oscillo-battant" dans l'intitulé, **When** j'affiche le formulaire, **Then** seul le champ d'ouverture horizontale standard est affiché

---

### Edge Cases

- Que se passe-t-il si l'ouverture n'est pas spécifiée dans le PDF ? → Valeur par défaut "Gauche" avec indicateur que c'est une valeur par défaut
- Que se passe-t-il pour un châssis fixe (pas d'ouverture) ? → Le champ ouverture n'est pas affiché, le SVG n'affiche aucun indicateur d'ouverture
- Que se passe-t-il pour un coulissant ? → Ouverture représentée par la direction de coulissement (déjà géré avec les flèches, à améliorer visuellement)
- Comment gérer les fenêtres à plus de 2 vantaux ? → Pour les fenêtres multi-vantaux, l'ouverture indique le sens du vantail principal (celui avec poignée)

## Requirements *(mandatory)*

### Functional Requirements

#### Rendu SVG Premium

- **FR-001**: Le système DOIT afficher les menuiseries avec un rendu SVG de qualité premium incluant des dégradés subtils sur les cadres
- **FR-002**: Le système DOIT appliquer des ombres légères pour donner un effet de profondeur aux schémas
- **FR-003**: Le système DOIT utiliser une palette de couleurs professionnelle et cohérente (cadre, vitrage, poignées)
- **FR-004**: Le système DOIT maintenir la lisibilité du rendu sur tous les écrans (mobile 320px à desktop)

#### Champ Ouverture

- **FR-005**: Le formulaire DOIT afficher un champ "Sens d'ouverture" pour les fenêtres et portes-fenêtres
- **FR-006**: Le champ ouverture DOIT proposer les options "Gauche" et "Droite"
- **FR-007**: La valeur par défaut du champ ouverture DOIT être extraite du PDF si disponible, sinon "Gauche"
- **FR-008**: Le système DOIT persister le sens d'ouverture dans le champ `donneesModifiees.sensOuverture`

#### Représentation Visuelle de l'Ouverture

- **FR-009**: Le schéma SVG DOIT afficher un indicateur visuel du sens d'ouverture (symbole standardisé menuiserie)
- **FR-010**: L'indicateur d'ouverture DOIT se mettre à jour en temps réel lorsque l'utilisateur modifie le champ
- **FR-011**: La position de la poignée sur le SVG DOIT correspondre au sens d'ouverture sélectionné

#### Oscillo-Battant

- **FR-012**: Le système DOIT détecter les menuiseries oscillo-battantes à partir de l'intitulé (mots-clés: "oscillo-battant", "oscillo battant", "OB")
- **FR-013**: Pour les oscillo-battants, le formulaire DOIT afficher deux champs: ouverture horizontale (gauche/droite) et ouverture verticale (par le haut - toujours activé)
- **FR-014**: Le schéma SVG d'un oscillo-battant DOIT représenter les deux modes d'ouverture avec un symbole combiné standard
- **FR-015**: Le système DOIT persister les deux types d'ouverture dans `donneesModifiees.sensOuverture` et `donneesModifiees.ouvertureVerticale`

#### Exclusions

- **FR-016**: Le champ ouverture NE DOIT PAS être affiché pour les châssis fixes
- **FR-017**: Le champ ouverture NE DOIT PAS être affiché pour les châssis soufflets (ouverture toujours par le haut)
- **FR-018**: Pour les coulissants, l'ouverture est représentée par les flèches de direction existantes (pas de nouveau champ)

### Key Entities

- **MenuiserieType**: Type de menuiserie (fenêtre, porte-fenêtre, coulissant, châssis-fixe, châssis-soufflet, oscillo-battant)
- **SensOuverture**: Sens d'ouverture horizontale ("gauche" | "droite")
- **OuvertureVerticale**: Indicateur d'ouverture verticale (boolean, true pour oscillo-battants)
- **DonneesModifiees**: Structure JSON existante étendue avec `sensOuverture` et `ouvertureVerticale`

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% des types de menuiseries supportés (fenêtre, porte-fenêtre, coulissant, châssis-fixe, châssis-soufflet) affichent un rendu SVG premium
- **SC-002**: Le changement de sens d'ouverture se reflète sur le SVG en moins de 100ms (perception instantanée)
- **SC-003**: Les utilisateurs peuvent identifier le sens d'ouverture sur le schéma sans lire le formulaire (test visuel)
- **SC-004**: Les oscillo-battants sont correctement détectés dans 95% des cas à partir de l'intitulé PDF
- **SC-005**: La taille du SVG rendu reste inférieure à 15KB par menuiserie (performance mobile)
- **SC-006**: Le rendu SVG est identique sur Chrome, Safari, Firefox (mobile et desktop)

## Assumptions

- Les SVG actuels utilisent déjà une structure React JSX qui permet d'ajouter des effets visuels
- Le champ `donneesModifiees` (JSON flexible) peut accueillir de nouveaux champs sans migration de base de données
- L'intitulé du PDF contient toujours l'information "oscillo-battant" pour les fenêtres de ce type
- Les symboles d'ouverture standardisés (arc + flèche) sont universellement compris par les artisans menuisiers
