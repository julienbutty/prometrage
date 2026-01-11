# API Contracts: SVG Premium et Indicateur d'Ouverture

**Feature**: 007-svg-premium-opening
**Date**: 2026-01-10

## Overview

Cette feature **ne crée pas de nouvelle API**. Elle étend l'API existante `PUT /api/menuiseries/{id}` avec de nouveaux champs dans le body.

## Extended Endpoint

### PUT /api/menuiseries/{id}

Mise à jour d'une menuiserie avec les données modifiées.

**Request Body (extended)**:

```typescript
interface UpdateMenuiserieRequest {
  donneesModifiees: {
    // Existing fields...
    largeur?: number;
    hauteur?: number;
    // ... autres champs existants

    // NEW: Champs ouverture
    sensOuverture?: 'gauche' | 'droite' | null;
    ouvertureVerticale?: boolean;
  };
  repere?: string;
}
```

**Example Request**:

```json
{
  "donneesModifiees": {
    "largeur": 1200,
    "hauteur": 1400,
    "sensOuverture": "droite",
    "ouvertureVerticale": true
  }
}
```

**Response**: Unchanged (existing response structure)

```typescript
interface UpdateMenuiserieResponse {
  data: {
    id: string;
    repere: string | null;
    intitule: string;
    donneesOriginales: Record<string, unknown>;
    donneesModifiees: Record<string, unknown>;
    ecarts: Record<string, unknown> | null;
    projetId: string;
    createdAt: string;
    updatedAt: string;
  };
}
```

## Validation

Le schéma Zod existant est étendu:

```typescript
// src/lib/validations/menuiserie.ts

export const SensOuvertureSchema = z.enum(['gauche', 'droite']);

export const MenuiserieDataSchema = z.object({
  // ... existing fields

  // NEW
  sensOuverture: SensOuvertureSchema.nullable().optional(),
  ouvertureVerticale: z.boolean().optional(),
}).passthrough();
```

## No New Endpoints

Les modifications sont **frontend-only** pour:
- Composants SVG
- Sélecteur d'ouverture
- Templates visuels

L'API existante accepte déjà les nouveaux champs grâce à `.passthrough()`.
