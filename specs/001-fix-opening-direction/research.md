# Research: Ouverture Intérieure - Correction sens d'ouverture

**Date**: 2025-01-11
**Feature**: 001-fix-opening-direction

## Résumé des Recherches

Toutes les clarifications techniques ont été résolues pendant l'exploration du code.

---

## 1. Champ "Ouverture intérieure" vs "Ouvrant principal"

### Decision
Créer un nouveau champ `ouvertureInterieure` distinct de `ouvrantPrincipal`.

### Rationale
- `ouvrantPrincipal` est utilisé pour les coulissants (quel panneau est principal)
- `ouvertureInterieure` représente le sens de tirage pour les battants/portes-fenêtres
- Sémantique différente = champs différents
- Rétro-compatibilité assurée via fallback

### Alternatives Considered
1. **Réutiliser `ouvrantPrincipal`**: Rejeté car confusion sémantique
2. **Renommer `ouvrantPrincipal`**: Rejeté car breaking change sur données existantes

---

## 2. Logique de Mapping Inversé

### Decision
"droite tirant" → triangle pointe vers la GAUCHE (et inversement).

### Rationale
- Convention fiche métreur: "tirant" = côté où on tire (côté paumelles)
- Triangle SVG indique le côté où la fenêtre S'OUVRE (opposé aux paumelles)
- Donc inversion nécessaire: `droite tirant` → `sensOuverture: 'gauche'`

### Alternatives Considered
1. **Modifier la convention SVG**: Rejeté car standard industrie
2. **Afficher les deux sens**: Rejeté car confusion utilisateur

---

## 3. Comportement Fenêtres 2 Vantaux

### Decision
Ignorer `ouvertureInterieure` et forcer ouverture centrale.

### Rationale
- Standard industrie: 2 vantaux s'ouvrent vers le centre
- Le code existant (`getFenetreSVG`) gère déjà l'alternance
- Pas de modification nécessaire pour ce cas

### Alternatives Considered
1. **Appliquer le sens au vantail principal**: Rejeté car non-standard
2. **Demander le sens pour chaque vantail**: Rejeté car complexité inutile

---

## 4. Comportement Oscillo-Battant

### Decision
Afficher les deux triangles: soufflet (haut) + battant (selon `ouvertureInterieure`).

### Rationale
- L'oscillo-battant a deux modes d'ouverture distincts
- Le triangle soufflet (vers le haut) est fixe
- Le triangle battant suit la règle standard

### Alternatives Considered
1. **Afficher un seul triangle**: Rejeté car perte d'information
2. **Basculer selon un toggle**: Rejeté car complexité UX

---

## 5. Valeur null / absente

### Decision
Ne pas afficher de triangle si `ouvertureInterieure` est null.

### Rationale
- Évite d'induire l'artisan en erreur avec une valeur par défaut
- Incite à saisir la bonne valeur dans le formulaire
- Clarification validée avec l'utilisateur (option B)

### Alternatives Considered
1. **Valeur par défaut "droite tirant"**: Rejeté car risque d'erreur
2. **Triangle gris/pointillé**: Rejeté car confusion visuelle

---

## 6. Format des Valeurs

### Decision
Accepter variations orthographiques, normaliser en lowercase.

### Rationale
- Les fiches métreur peuvent avoir différentes casses
- Preprocessing Zod avec `.toLowerCase()` déjà utilisé dans le projet
- Recherche par `includes('droite')` / `includes('gauche')` robuste

### Valeurs Acceptées
- "droite tirant", "Droite tirant", "DROITE TIRANT", "droite-tirant"
- "gauche tirant", "Gauche tirant", "GAUCHE TIRANT", "gauche-tirant"

---

## 7. Emplacement du Nouveau Fichier Utilitaire

### Decision
Créer `src/lib/svg/opening-direction.ts`.

### Rationale
- Logique liée au rendu SVG
- Cohérent avec l'organisation existante (`src/lib/svg/`)
- Fonction pure, facilement testable

### Alternatives Considered
1. **Dans `menuiserie-templates.tsx`**: Rejeté car fichier déjà long
2. **Dans `src/lib/utils/`**: Rejeté car trop générique

---

## 8. Tests Requis

### Decision
Créer 2 fichiers de tests dédiés.

### Tests Unitaires (`src/__tests__/lib/opening-direction.test.ts`)
- `mapOuvertureToSensOuverture()`: tous les cas de mapping
- `getEffectiveOpeningDirection()`: priorité nouveau champ vs legacy
- Edge cases: null, valeurs invalides, variations orthographiques

### Tests Composants (`src/__tests__/svg/ouverture-indicator.test.tsx`)
- Rendu triangle correct selon `sensOuverture`
- Pas de triangle si `sensOuverture` null
- 2 vantaux: ouverture centrale

---

## Conclusion

Toutes les questions techniques sont résolues. Aucun "NEEDS CLARIFICATION" restant.

Prêt pour Phase 1: data-model.md et quickstart.md.
