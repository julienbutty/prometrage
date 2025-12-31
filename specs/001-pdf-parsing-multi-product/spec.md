# Feature Specification: Stabilisation Parsing PDF Multi-Produits (ALU + PVC)

**Feature Branch**: `001-pdf-parsing-multi-product`
**Created**: 2025-12-13
**Status**: Draft
**Input**: User description: "L'upload, le parsing et l'enregistrement des données du pdf. Car nous l'avons déjà implémenté mais nous nous étions basé sur les produits de type 'Alu' et lorsqu'on a fait des tests avec un pdf contenant des produits 'PVC' nous avons eu des erreurs. Nous devons donc revoir les bases de cette fonctionnalité afin de la stabiliser."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Upload et parsing PDF produits PVC (Priority: P1)

Un artisan upload une fiche métreur contenant des menuiseries PVC (gammes SOFTLINE, KIETISLINE, WISIO). Le système extrait correctement toutes les données sans erreur de validation.

**Why this priority**: C'est le problème principal à résoudre. Les PDFs PVC échouent actuellement au parsing car le schéma de validation Zod n'accepte que les gammes ALU.

**Independent Test**: Uploader un PDF PVC avec des menuiseries SOFTLINE ou WISIO. Vérifier que le projet est créé et toutes les menuiseries sont extraites avec leurs données correctes.

**Acceptance Scenarios**:

1. **Given** un fichier PDF avec des menuiseries gamme SOFTLINE, **When** l'utilisateur upload le PDF, **Then** le système crée le projet avec toutes les menuiseries et leurs données extraites sans erreur
2. **Given** un fichier PDF avec des coulissants gamme WISIO, **When** l'utilisateur upload le PDF, **Then** la gamme "WISIO" est correctement enregistrée dans `donneesOriginales.gamme`
3. **Given** un fichier PDF avec un mélange ALU et PVC, **When** l'utilisateur upload le PDF, **Then** toutes les menuiseries sont extraites avec leurs gammes respectives (OPTIMAX, SOFTLINE, etc.)

---

### User Story 2 - Extraction robuste de tous les champs produits (Priority: P2)

L'extraction IA doit gérer les variations de format entre produits ALU et PVC, qui ont des champs spécifiques différents.

**Why this priority**: Les produits PVC ont des champs spécifiques (ex: joint de frappe, profilé de renfort) qui n'existent pas pour l'ALU, et inversement. Le système doit être flexible.

**Independent Test**: Uploader un PDF PVC avec des champs spécifiques PVC. Vérifier que ces champs sont extraits et stockés sans erreur de validation.

**Acceptance Scenarios**:

1. **Given** un PDF PVC avec des champs spécifiques PVC (joint de frappe, profilé renfort), **When** l'extraction IA est effectuée, **Then** ces champs sont correctement stockés dans `donneesOriginales`
2. **Given** un PDF avec des champs absents ou inconnus, **When** l'extraction IA est effectuée, **Then** le système utilise `null` et ajoute un warning dans les métadonnées sans bloquer le parsing

---

### User Story 3 - Gestion des erreurs explicites (Priority: P3)

En cas d'échec du parsing, l'utilisateur reçoit un message clair indiquant la nature du problème.

**Why this priority**: Une bonne gestion d'erreur améliore l'expérience utilisateur et facilite le diagnostic.

**Independent Test**: Uploader un PDF avec une gamme inconnue. Vérifier que le message d'erreur est explicite et actionnable.

**Acceptance Scenarios**:

1. **Given** un PDF avec une gamme non reconnue, **When** le parsing échoue, **Then** l'utilisateur voit un message indiquant quelle gamme n'est pas supportée
2. **Given** un PDF corrompu ou illisible, **When** le parsing échoue après les retries, **Then** l'utilisateur est informé que le document n'a pas pu être lu

---

### Edge Cases

- Que se passe-t-il si le PDF contient des menuiseries sans gamme spécifiée ?
  - Le champ gamme doit être `null` et un warning ajouté, sans bloquer le parsing
- Comment gérer une nouvelle gamme inconnue (ex: "PREMIUM") ?
  - Accepter la valeur telle quelle (string libre) et ajouter un warning pour signaler une gamme non standard
- Que se passe-t-il si les dimensions sont dans un format inattendu ?
  - L'IA doit normaliser en millimètres ou retourner `null` avec warning

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le système DOIT accepter les gammes ALU (OPTIMAX, INNOVAX, PERFORMAX) lors du parsing PDF
- **FR-002**: Le système DOIT accepter les gammes PVC (SOFTLINE, KIETISLINE, WISIO) lors du parsing PDF
- **FR-003**: Le système DOIT stocker le champ `gamme` comme string libre (pas d'enum restrictif) pour permettre l'ajout futur de nouvelles gammes
- **FR-004**: Le système DOIT mettre à jour le prompt IA pour mentionner toutes les gammes (ALU + PVC)
- **FR-005**: Le système DOIT gérer les champs optionnels absents avec `null` sans bloquer la validation
- **FR-006**: Le système DOIT retourner des messages d'erreur explicites en cas d'échec du parsing
- **FR-007**: Le système DOIT conserver un score de confiance reflétant la qualité de l'extraction
- **FR-008**: Le système DOIT enregistrer les warnings dans les métadonnées pour les champs non reconnus ou illisibles

### Key Entities *(include if feature involves data)*

- **Menuiserie**: Entité principale contenant `donneesOriginales` (JSON flexible) avec les données extraites du PDF
- **Gamme**: Attribut de Menuiserie, actuellement restreint par enum Zod - doit devenir string libre avec validation souple
- **ParsedMetadata**: Contient confidence, warnings, tokensUsed, model - enrichi avec détails d'erreur si échec

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% des PDFs contenant des produits PVC valides sont parsés sans erreur de validation Zod
- **SC-002**: 100% des gammes ALU et PVC connues (6 gammes) sont correctement extraites et stockées
- **SC-003**: Les PDFs mixtes (ALU + PVC) sont traités en un seul upload avec succès
- **SC-004**: Le temps de parsing reste inférieur à 30 secondes pour un PDF standard (5-10 menuiseries)
- **SC-005**: En cas d'erreur, 100% des messages affichés contiennent une indication de la cause (gamme non reconnue, document invalide, etc.)

## Assumptions

- Les gammes actuellement connues sont : ALU (OPTIMAX, INNOVAX, PERFORMAX) et PVC (SOFTLINE, KIETISLINE, WISIO)
- Le format des PDFs suit la même structure générale, seules les gammes et certains champs spécifiques diffèrent entre ALU et PVC
- L'IA Claude est capable d'extraire les données des deux types de produits avec le même prompt enrichi
- Les nouvelles gammes futures seront ajoutées progressivement et le système doit être flexible pour les accepter
