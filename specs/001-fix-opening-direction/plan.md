# Implementation Plan: Ouverture Intérieure - Correction sens d'ouverture PDF/SVG

**Branch**: `001-fix-opening-direction` | **Date**: 2025-01-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-fix-opening-direction/spec.md`

## Summary

Cette feature corrige l'extraction et l'affichage du sens d'ouverture des menuiseries. Le champ "Ouverture intérieure" doit être extrait du PDF avec les valeurs "droite tirant" / "gauche tirant", affiché dans le formulaire, et piloter le triangle d'ouverture SVG avec la logique inversée (droite tirant → triangle pointe à gauche).

## Technical Context

**Language/Version**: TypeScript 5.x / Next.js 15.5.4 / React 19.1.0
**Primary Dependencies**: Anthropic SDK (Claude), Zod, TanStack Query, React Hook Form, shadcn/ui
**Storage**: PostgreSQL 16 via Prisma (champ JSON `donneesModifiees` existant)
**Testing**: Vitest + React Testing Library
**Target Platform**: Web mobile-first (artisans sur chantier)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Mise à jour SVG < 100ms après modification du champ
**Constraints**: Rétro-compatibilité avec données legacy `ouvrantPrincipal`
**Scale/Scope**: ~5 fichiers à modifier, 1 nouveau champ à ajouter

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Mobile-First Design | ✅ PASS | Champ Select avec touch targets 44px+ |
| II. Test-Driven Development | ✅ PASS | Tests unitaires prévus pour mapping et SVG |
| III. Strict Type Safety | ✅ PASS | Nouveau type union pour ouvertureInterieure |
| IV. Server-Side Validation | ✅ PASS | Validation Zod du nouveau champ |
| V. AI-Powered PDF Parsing | ✅ PASS | Ajout du champ au prompt Claude |
| VI. Optimistic UI Updates | ✅ PASS | Mutation TanStack Query existante |
| VII. Progressive Disclosure | ✅ PASS | Champ visible (pas dans section collapsed) |

**Result**: Tous les gates passent. Aucune violation.

## Project Structure

### Documentation (this feature)

```text
specs/001-fix-opening-direction/
├── spec.md              # Spécification fonctionnelle
├── plan.md              # This file
├── research.md          # Analyse technique (Phase 0)
├── data-model.md        # Modèle de données (Phase 1)
├── quickstart.md        # Guide démarrage rapide
├── contracts/           # N/A - pas de nouvelle API
└── tasks.md             # Tâches (Phase 2 - /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── pdf/
│   │   └── prompts.ts              # ⚠️ MODIFIER: Ajouter ouvertureInterieure
│   ├── validations/
│   │   ├── ai-response.ts          # ⚠️ MODIFIER: Nouveau champ + enum étendu
│   │   └── menuiserie.ts           # ⚠️ MODIFIER: Ajouter type ouvertureInterieure
│   ├── svg/
│   │   ├── menuiserie-templates.tsx # ⚠️ MODIFIER: Logique mapping inversé
│   │   └── types.ts                # (inchangé - OpeningDirection existe)
│   └── forms/
│       └── configs/*.json          # ⚠️ MODIFIER: Ajouter champ select
├── components/
│   └── menuiseries/
│       ├── MenuiserieSVG.tsx       # (inchangé - props existent)
│       └── InteractiveSVGZone.tsx  # ⚠️ MODIFIER: Recevoir sensOuverture
├── app/
│   └── menuiserie/
│       └── [id]/
│           └── page.tsx            # ⚠️ MODIFIER: Passer sensOuverture au SVG
└── __tests__/
    ├── svg/
    │   └── ouverture-mapping.test.tsx  # ✨ CRÉER: Tests mapping
    └── lib/
        └── opening-direction.test.ts   # ✨ CRÉER: Tests transformation
```

**Structure Decision**: Application web Next.js existante. Modifications ciblées sur 5-7 fichiers, 2 nouveaux fichiers de tests.

## Complexity Tracking

> Aucune violation de la constitution. Section non applicable.

---

## Analyse Technique Détaillée

### État Actuel du Code

#### 1. Extraction PDF (`src/lib/pdf/prompts.ts`)
- Champ `ouvrantPrincipal` existe déjà avec valeurs `"droite" | "gauche"`
- Conçu pour coulissants, pas pour le sens d'ouverture battant
- **Action**: Ajouter `ouvertureInterieure` avec valeurs "droite tirant" | "gauche tirant"

#### 2. Validation Zod (`src/lib/validations/ai-response.ts`)
- `ouvrantPrincipal` validé en enum simple
- **Action**: Ajouter `ouvertureInterieure` avec preprocessing lowercase

#### 3. Templates SVG (`src/lib/svg/menuiserie-templates.tsx`)
- `sensOuverture` paramètre existe et fonctionne
- Logique actuelle: `droite` → triangle pointe droite
- **Action**: Créer fonction de mapping inversé `ouvertureInterieure` → `sensOuverture`

#### 4. Composant InteractiveSVGZone
- Ne reçoit PAS `sensOuverture` en prop
- Utilise valeur par défaut `'droite'`
- **Action**: Ajouter prop et la passer à MenuiserieSVG

#### 5. Page Formulaire (`src/app/menuiserie/[id]/page.tsx`)
- `ouvrantPrincipal` dans FIELD_ORDER mais pas dans configs
- N'est pas passé au SVG
- **Action**: Ajouter au formulaire + passer au SVG

### Logique de Mapping Clé

```typescript
// Transformation ouvertureInterieure → sensOuverture (pour SVG)
function mapOuvertureToSensOuverture(
  ouvertureInterieure: string | null | undefined
): OpeningDirection | null {
  if (!ouvertureInterieure) return null;

  const normalized = ouvertureInterieure.toLowerCase().trim();

  if (normalized.includes('droite')) {
    return 'gauche';  // droite tirant → triangle pointe gauche
  }
  if (normalized.includes('gauche')) {
    return 'droite';  // gauche tirant → triangle pointe droite
  }

  return null;  // Valeur non reconnue
}
```

### Règle 2 Vantaux

Pour les fenêtres 2 vantaux, le comportement est différent:
- Le sens d'ouverture ne s'applique pas directement
- Les deux vantaux pointent vers le centre (ouverture centrale standard)
- La logique existante dans `getFenetreSVG` gère déjà l'alternance

```typescript
// Code existant (ligne 175)
const isLeftOpening = i === 0 ? sensOuverture === 'gauche' : i % 2 === 0;
```

Pour 2 vantaux avec ouverture centrale, on forcera:
- Vantail 0 (gauche): `direction = 'droite'` (pointe vers le centre)
- Vantail 1 (droite): `direction = 'gauche'` (pointe vers le centre)

### Rétro-Compatibilité

Ordre de priorité pour déterminer le sens d'ouverture:
1. `ouvertureInterieure` (nouveau champ) si présent
2. `ouvrantPrincipal` (legacy) + comportement "tirant" implicite
3. `null` → pas de triangle affiché

```typescript
function getEffectiveOpeningDirection(data: MenuiserieData): OpeningDirection | null {
  // Priorité au nouveau champ
  if (data.ouvertureInterieure) {
    return mapOuvertureToSensOuverture(data.ouvertureInterieure);
  }

  // Fallback legacy: ouvrantPrincipal = "droite" → "droite tirant" implicite
  if (data.ouvrantPrincipal) {
    return mapOuvertureToSensOuverture(`${data.ouvrantPrincipal} tirant`);
  }

  return null;  // Pas de triangle
}
```

---

## Fichiers Impactés

### Modifications

| Fichier | Type de modification | Priorité |
|---------|---------------------|----------|
| `src/lib/pdf/prompts.ts` | Ajouter champ extraction | P1 |
| `src/lib/validations/ai-response.ts` | Ajouter schéma Zod | P1 |
| `src/lib/svg/menuiserie-templates.tsx` | Ajouter fonction mapping | P1 |
| `src/components/menuiseries/InteractiveSVGZone.tsx` | Recevoir prop sensOuverture | P1 |
| `src/app/menuiserie/[id]/page.tsx` | Afficher champ + passer au SVG | P1 |
| `src/lib/forms/configs/*.json` (12 fichiers) | Ajouter config select | P2 |

### Créations

| Fichier | Description | Priorité |
|---------|-------------|----------|
| `src/__tests__/lib/opening-direction.test.ts` | Tests fonction mapping | P1 |
| `src/__tests__/svg/ouverture-indicator.test.tsx` | Tests rendu triangle | P1 |
| `src/lib/svg/opening-direction.ts` | Utilitaire mapping | P1 |

---

## Risques et Mitigations

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Données legacy mal interprétées | Moyen | Tests exhaustifs + fallback explicite |
| Triangle 2 vantaux incorrect | Élevé | Override spécifique pour nbVantaux >= 2 |
| Performance rendu SVG | Faible | Mapping simple O(1), pas d'impact |
| Champ absent dans certains PDFs | Moyen | null → pas de triangle (clarification validée) |

---

## Prochaines Étapes

1. **Phase 0**: ~~Research~~ - Complété dans ce plan
2. **Phase 1**: Créer `data-model.md` et `quickstart.md`
3. **Phase 2**: Générer `tasks.md` avec `/speckit.tasks`
4. **Implémentation**: Suivre TDD (Red-Green-Refactor)
