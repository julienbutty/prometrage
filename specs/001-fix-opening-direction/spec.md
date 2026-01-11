# Feature Specification: Ouverture Intérieure - Correction sens d'ouverture PDF/SVG

**Feature Branch**: `001-fix-opening-direction`
**Created**: 2025-01-11
**Status**: Draft
**Input**: Vérifier et corriger l'extraction du champ "Ouverture intérieure" dans le parsing PDF et son utilisation pour le tracé du triangle d'ouverture SVG

## Clarifications

### Session 2025-01-11

- Q: Comment gérer les fenêtres 2 vantaux avec "Droite tirant" ? → A: Le vantail gauche pointe vers la droite (centre), le vantail droit pointe vers la gauche (centre) - ouverture centrale
- Q: Comment afficher l'oscillo-battant ? → A: Triangle soufflet (vers le haut) + triangle latéral selon "droite/gauche tirant"
- Q: Le champ doit-il être visible dans le formulaire ? → A: Oui, afficher et permettre l'édition
- Q: Le SVG doit-il se mettre à jour en temps réel ? → A: Oui, la modification du champ change instantanément l'orientation du triangle
- Q: Comportement par défaut quand "Ouverture intérieure" est absent/null ? → A: Ne pas afficher de triangle (attendre saisie utilisateur)

## Contexte et Problème

### Analyse de l'existant

Après exploration du code, voici l'état actuel :

1. **Champ actuel** : `ouvrantPrincipal` avec valeurs `"droite"` | `"gauche"`
2. **Extraction PDF** : Ce champ est demandé dans le prompt AI mais semble conçu uniquement pour les coulissants
3. **SVG** : Le paramètre `sensOuverture` existe et contrôle correctement le triangle, MAIS :
   - `direction === 'droite'` → triangle pointe vers la droite (paumelles à gauche)
   - `direction === 'gauche'` → triangle pointe vers la gauche (paumelles à droite)

### Logique métier "Ouverture intérieure"

Le champ "Ouverture intérieure" sur les fiches métreur utilise la convention **vue de l'intérieur** :

| Valeur fiche métreur | Signification                    | Côté paumelles | Triangle pointe vers |
| -------------------- | -------------------------------- | -------------- | -------------------- |
| **Droite tirant**    | Main droite tire vers la droite  | DROITE         | GAUCHE               |
| **Gauche tirant**    | Main gauche tire vers la gauche  | GAUCHE         | DROITE               |

**Règle clé** : Le triangle pointe vers le côté OPPOSÉ à la valeur "tirant" car il indique où s'ouvre la porte, pas où on tire.

### Cas particuliers clarifiés

#### Fenêtres 2 vantaux
Pour une fenêtre 2 vantaux marquée "Droite tirant" :
- **Vantail gauche** : triangle pointe vers la DROITE (vers le centre)
- **Vantail droit** : triangle pointe vers la GAUCHE (vers le centre)
- **Logique** : Les deux vantaux s'ouvrent vers le centre (comportement standard)

#### Oscillo-battant
L'oscillo-battant combine deux modes d'ouverture :
- **Mode soufflet** : Triangle pointe vers le HAUT (fixe, pas de variation gauche/droite)
- **Mode battant** : Suit la règle "droite tirant" / "gauche tirant" standard

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Extraction correcte du sens d'ouverture (Priority: P1)

Lors de l'upload d'un PDF de fiche métreur, le système extrait correctement le champ "Ouverture intérieure" avec les valeurs "droite tirant" ou "gauche tirant" pour toutes les menuiseries ouvrant (battant, oscillo-battant, porte-fenêtre).

**Why this priority**: C'est le fondement de la fonctionnalité - sans extraction correcte, le reste ne peut pas fonctionner.

**Independent Test**: Uploader un PDF contenant une menuiserie avec "Ouverture intérieure: droite tirant" et vérifier que la donnée est bien stockée.

**Acceptance Scenarios**:

1. **Given** un PDF avec une fenêtre battant ayant "Ouverture intérieure: droite tirant", **When** le PDF est parsé, **Then** le champ `ouvertureInterieure` contient "droite tirant"
2. **Given** un PDF avec une porte-fenêtre ayant "Ouverture intérieure: gauche tirant", **When** le PDF est parsé, **Then** le champ `ouvertureInterieure` contient "gauche tirant"
3. **Given** un PDF avec un coulissant (pas d'ouverture intérieure applicable), **When** le PDF est parsé, **Then** le champ `ouvertureInterieure` est null

---

### User Story 2 - Affichage correct du triangle d'ouverture (Priority: P1)

Le schéma SVG de la menuiserie affiche le triangle d'ouverture dans la bonne direction basée sur la valeur "Ouverture intérieure".

**Why this priority**: C'est l'objectif final visible par l'utilisateur - le schéma doit être correct.

**Independent Test**: Visualiser le SVG d'une menuiserie avec "droite tirant" et vérifier que le triangle pointe vers la gauche.

**Acceptance Scenarios**:

1. **Given** une menuiserie 1 vantail avec `ouvertureInterieure: "droite tirant"`, **When** le SVG est rendu, **Then** le triangle d'ouverture pointe vers la GAUCHE (paumelles à droite)
2. **Given** une menuiserie 1 vantail avec `ouvertureInterieure: "gauche tirant"`, **When** le SVG est rendu, **Then** le triangle d'ouverture pointe vers la DROITE (paumelles à gauche)
3. **Given** une menuiserie 2 vantaux avec `ouvertureInterieure: "droite tirant"`, **When** le SVG est rendu, **Then** le vantail gauche pointe vers la droite ET le vantail droit pointe vers la gauche (ouverture centrale)
4. **Given** une menuiserie oscillo-battant, **When** le SVG est rendu, **Then** le triangle soufflet pointe vers le haut ET le triangle battant suit la règle "tirant"
5. **Given** une menuiserie fixe ou coulissant, **When** le SVG est rendu, **Then** aucun triangle d'ouverture n'est affiché
6. **Given** une menuiserie battant avec `ouvertureInterieure: null`, **When** le SVG est rendu, **Then** aucun triangle d'ouverture n'est affiché (attente saisie utilisateur)

---

### User Story 3 - Édition du sens d'ouverture dans le formulaire (Priority: P1)

L'utilisateur peut voir et modifier le champ "Ouverture intérieure" dans le formulaire de prise de côtes, et le SVG se met à jour en temps réel.

**Why this priority**: Permet à l'artisan de corriger une erreur d'extraction ou d'adapter à la réalité terrain.

**Independent Test**: Modifier le champ "Ouverture intérieure" de "droite tirant" à "gauche tirant" et observer le changement immédiat du triangle SVG.

**Acceptance Scenarios**:

1. **Given** le formulaire d'une menuiserie battant, **When** l'utilisateur affiche le formulaire, **Then** le champ "Ouverture intérieure" est visible avec la valeur extraite du PDF
2. **Given** le champ "Ouverture intérieure" affiché, **When** l'utilisateur sélectionne une nouvelle valeur, **Then** le triangle SVG change d'orientation instantanément (sans rechargement)
3. **Given** le champ modifié, **When** l'utilisateur sauvegarde, **Then** la nouvelle valeur est persistée dans `donneesModifiees`

---

### User Story 4 - Transformation des valeurs legacy (Priority: P2)

Les données existantes avec l'ancien format `ouvrantPrincipal` sont correctement interprétées.

**Why this priority**: Assure la rétro-compatibilité avec les données déjà en base.

**Independent Test**: Charger une menuiserie existante avec `ouvrantPrincipal: "droite"` et vérifier l'affichage correct.

**Acceptance Scenarios**:

1. **Given** une menuiserie legacy avec `ouvrantPrincipal: "droite"` (sans "tirant"), **When** le SVG est rendu, **Then** le système traite cela comme "droite tirant" (comportement par défaut "tirant")
2. **Given** une menuiserie avec le nouveau champ `ouvertureInterieure`, **When** les deux champs existent, **Then** `ouvertureInterieure` a priorité sur `ouvrantPrincipal`

---

### Edge Cases

- **Champ absent du PDF** : Utiliser null, aucun triangle d'ouverture n'est affiché (l'utilisateur doit saisir la valeur dans le formulaire)
- **Fenêtres 2 vantaux** : Les deux triangles pointent vers le centre (ouverture centrale standard)
- **Valeur non reconnue** (ex: "centre", format invalide) : Ajouter un warning dans les metadata, traiter comme null
- **Variations orthographiques** : "droite tirant", "Droite Tirant", "DROITE TIRANT" doivent tous être reconnus
- **Oscillo-battant sans valeur "tirant"** : Le triangle soufflet (vers le haut) est toujours affiché, aucun triangle battant latéral n'est affiché

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le système DOIT extraire le champ "Ouverture intérieure" du PDF pour toutes les menuiseries de type battant, oscillo-battant, soufflet et porte-fenêtre
- **FR-002**: Le système DOIT reconnaître les valeurs "droite tirant" et "gauche tirant" (insensible à la casse)
- **FR-003**: Le système DOIT stocker la valeur extraite dans un nouveau champ `ouvertureInterieure` du schéma de données
- **FR-004**: Le système DOIT mapper "droite tirant" vers un triangle pointant à GAUCHE dans le SVG (1 vantail)
- **FR-005**: Le système DOIT mapper "gauche tirant" vers un triangle pointant à DROITE dans le SVG (1 vantail)
- **FR-006**: Le système DOIT afficher les triangles des fenêtres 2 vantaux pointant vers le centre (gauche→droite, droit→gauche)
- **FR-007**: Le système DOIT afficher le triangle soufflet (vers le haut) pour les oscillo-battants en plus du triangle latéral
- **FR-008**: Le système DOIT ignorer ce champ pour les menuiseries de type coulissant et fixe (pas de triangle basé sur ce champ)
- **FR-012**: Le système NE DOIT PAS afficher de triangle d'ouverture lorsque le champ `ouvertureInterieure` est null ou absent
- **FR-009**: Le système DOIT supporter les données legacy `ouvrantPrincipal` avec comportement "tirant" implicite pour rétro-compatibilité
- **FR-010**: Le système DOIT afficher le champ "Ouverture intérieure" dans le formulaire de prise de côtes
- **FR-011**: Le système DOIT mettre à jour le SVG en temps réel lorsque l'utilisateur modifie le champ "Ouverture intérieure"

### Key Entities

- **ouvertureInterieure**: Nouveau champ string nullable dans le schéma Menuiserie. Valeurs attendues : "droite tirant" | "gauche tirant" | null
- **Mapping direction SVG**: Logique de transformation inversée entre valeur PDF ("droite tirant" → gauche) et paramètre `sensOuverture` du composant SVG

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% des menuiseries ouvrant dans les PDFs de test ont leur sens d'ouverture correctement extrait et stocké
- **SC-002**: Le triangle SVG pointe dans la direction correcte pour toutes les menuiseries testées (validation visuelle contre fiche métreur source)
- **SC-003**: Aucune régression sur les menuiseries existantes en base de données (les données legacy continuent de s'afficher correctement)
- **SC-004**: Les tests unitaires couvrent les deux sens d'ouverture, les cas limites (valeur absente, format non standard) et la rétro-compatibilité
- **SC-005**: Le champ "Ouverture intérieure" est visible et éditable dans le formulaire pour toutes les menuiseries concernées
- **SC-006**: Le délai de mise à jour du SVG après modification du champ est inférieur à 100ms (perception instantanée)

## Assumptions

- Les fiches métreur utilisent systématiquement la convention "X tirant" pour le champ "Ouverture intérieure"
- Le comportement "tirant" (on tire vers soi depuis l'intérieur) est le comportement par défaut quand non spécifié explicitement
- Les coulissants utilisent un mécanisme différent (flèches de direction) et ne sont pas concernés par le champ "Ouverture intérieure"
- La poignée se trouve du côté opposé aux paumelles (côté où on tire)
- Les fenêtres 2 vantaux s'ouvrent toujours vers le centre (standard industrie)
