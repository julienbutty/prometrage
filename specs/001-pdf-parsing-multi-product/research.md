# Research: Stabilisation Parsing PDF Multi-Produits

**Feature**: 001-pdf-parsing-multi-product
**Date**: 2025-12-13

## Executive Summary

L'analyse du code révèle que l'échec du parsing PDF pour les produits PVC est causé par **deux fichiers** contenant des validations Zod avec enums restrictifs pour le champ `gamme`. De plus, le prompt IA ne mentionne que les gammes ALU.

## Findings

### 1. Cause racine des erreurs PVC

**Fichiers impactés**:

| Fichier | Champ | Valeurs actuelles | Valeurs manquantes |
|---------|-------|-------------------|-------------------|
| `src/lib/validations/ai-response.ts` | `AIMenuiserieSchema.gamme` | OPTIMAX, PERFORMAX, INNOVAX | SOFTLINE, KIETISLINE, WISIO |
| `src/lib/validations/menuiserie.ts` | `MenuiserieDataSchema.gamme` | OPTIMAX, PERFORMAX, INNOVAX | SOFTLINE, KIETISLINE, WISIO |
| `src/lib/pdf/prompts.ts` | `EXTRACTION_PROMPT` | Mentionne ALU seulement | Doit mentionner PVC |

**Decision**: Transformer le champ `gamme` en `z.string()` au lieu d'un enum restrictif.

**Rationale**:
- Flexibilité pour futures nouvelles gammes
- Pas besoin de migration/redéploiement pour ajouter une gamme
- La liste des gammes connues est déjà maintenue dans `src/lib/utils/menuiserie-type.ts` et `src/lib/forms/config-loader.ts`

**Alternatives considered**:
- Ajouter les gammes PVC à l'enum → Rejeté car nécessite redéploiement pour chaque nouvelle gamme
- Union de tous les enums → Rejeté car même problème de rigidité

### 2. Détection matériau déjà fonctionnelle

Le fichier `src/lib/utils/menuiserie-type.ts` gère déjà correctement la détection ALU vs PVC :

```typescript
const GAMMES_ALU = ["OPTIMAX", "INNOVAX", "PERFORMAX"];

export function detectMateriau(data: any): Materiau {
  const gamme = data.gamme?.toUpperCase();
  return GAMMES_ALU.includes(gamme) ? "ALU" : "PVC";
}
```

**Decision**: Aucune modification nécessaire dans ce fichier.

### 3. Configurations de formulaires déjà complètes

Le dossier `src/lib/forms/configs/` contient déjà les 12 configurations pour tous les types :
- ALU: 6 fichiers (NEUF/RENO × FENETRE/PORTE/COULISSANT)
- PVC: 6 fichiers (NEUF/RENO × FENETRE/PORTE/COULISSANT)

**Decision**: Aucune modification nécessaire dans les configs.

### 4. Prompt IA à enrichir

Le prompt actuel dans `src/lib/pdf/prompts.ts` spécifie :
```
"gamme": "OPTIMAX" | "PERFORMAX" | "INNOVAX",
```

**Decision**: Mettre à jour pour inclure toutes les gammes avec description du matériau.

**Nouveau prompt proposé**:
```
"gamme": "OPTIMAX" | "INNOVAX" | "PERFORMAX" | "SOFTLINE" | "KIETISLINE" | "WISIO",
// ALU: OPTIMAX, INNOVAX, PERFORMAX
// PVC: SOFTLINE, KIETISLINE, WISIO
```

### 5. Tests existants à enrichir

Les tests actuels dans `src/__tests__/` couvrent les gammes ALU.

**Decision**: Ajouter des tests pour les gammes PVC dans les fichiers suivants :
- `src/__tests__/unit/validations/menuiserie.test.ts`
- Tests de parsing avec mock responses PVC

## Impact Assessment

| Composant | Impact | Risque |
|-----------|--------|--------|
| `ai-response.ts` | Modification schema Zod | Faible - compatible |
| `menuiserie.ts` | Modification schema Zod | Faible - compatible |
| `prompts.ts` | Ajout gammes PVC | Faible |
| Tests unitaires | Ajout nouveaux tests | Aucun |
| API routes | Aucune modification | Aucun |
| Frontend | Aucune modification | Aucun |

## Recommendations

1. **Modifier `gamme` en string libre** avec pattern suggéré (optionnel)
2. **Conserver la liste des gammes connues** dans `KNOWN_GAMMES` pour validation souple + warnings
3. **Enrichir le prompt IA** pour mentionner toutes les gammes
4. **Ajouter tests TDD** avant modification (constitution II)
5. **Documenter les gammes** dans `MENUISERIES_GAMMES.md` (déjà fait)

## Open Questions

Aucune question ouverte - la solution est claire et alignée avec l'architecture existante.
