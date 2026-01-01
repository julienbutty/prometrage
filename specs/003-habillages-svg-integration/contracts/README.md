# API Contracts: Habillages Int/Ext

**Date**: 2025-01-01
**Branch**: `003-habillages-svg-integration`

## No New Endpoints

Cette feature n'ajoute pas de nouvelle route API. Elle réutilise l'API existante :

### PUT /api/menuiseries/[id]

**Existing Endpoint** - Mise à jour des données modifiées

#### Request Body (extended)

```json
{
  "donneesModifiees": {
    "largeur": 1200,
    "hauteur": 1100,
    "habillageInt": {
      "haut": "Standard",
      "bas": "Standard",
      "gauche": "Sans",
      "droite": "Standard"
    },
    "habillageExt": {
      "haut": "Montants",
      "bas": "Montants",
      "gauche": "Montants",
      "droite": "Montants"
    }
  }
}
```

#### Validation Schema Addition

Le schema Zod existant pour `donneesModifiees` doit être étendu avec :

```typescript
import { donneesModifieesHabillagesSchema } from '@/lib/validations/habillage';

const donneesModifieesSchema = z.object({
  // ... existing fields ...
  ...donneesModifieesHabillagesSchema.shape,
});
```

#### Response (unchanged)

```json
{
  "data": {
    "id": "...",
    "donneesModifiees": { ... }
  }
}
```

## Validation

Les nouvelles valeurs d'habillage (`habillageInt`, `habillageExt`) sont validées par le schema Zod défini dans `src/lib/validations/habillage.ts`.

Valeurs acceptées pour chaque côté :
- `"Standard"`
- `"Sans"`
- `"Haut"`
- `"Bas"`
- `"Montants"`
- `null` (non renseigné)
