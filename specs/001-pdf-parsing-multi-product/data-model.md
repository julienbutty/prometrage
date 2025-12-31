# Data Model: Stabilisation Parsing PDF Multi-Produits

**Feature**: 001-pdf-parsing-multi-product
**Date**: 2025-12-13

## Overview

Cette feature ne crée pas de nouvelles entités. Elle modifie la validation des données existantes pour supporter les gammes ALU et PVC.

## Entities Modified

### AIMenuiserie (Schema Zod - ai-response.ts)

Schéma de validation pour les données extraites par l'IA Claude.

**Current State** (problématique):
```typescript
gamme: z.enum(["OPTIMAX", "PERFORMAX", "INNOVAX"]).optional().nullable()
```

**Target State** (solution):
```typescript
gamme: z.string().optional().nullable()
```

**Validation Rules**:
- Champ optionnel (nullable)
- String libre pour flexibilité
- Toutes les gammes acceptées (ALU: OPTIMAX, INNOVAX, PERFORMAX / PVC: SOFTLINE, KIETISLINE, WISIO)
- Nouvelles gammes futures acceptées sans modification code

### MenuiserieData (Schema Zod - menuiserie.ts)

Schéma de validation pour les données stockées en base (donneesOriginales, donneesModifiees).

**Current State** (problématique):
```typescript
gamme: z.enum(["OPTIMAX", "PERFORMAX", "INNOVAX"], {
  message: "La gamme doit être OPTIMAX, PERFORMAX ou INNOVAX",
}).optional()
```

**Target State** (solution):
```typescript
gamme: z.string().optional()
```

**Validation Rules**:
- Champ optionnel
- String libre pour flexibilité
- Message d'erreur générique si format invalide

## Constants (Reference Only)

### Known Gammes

Maintenue dans `src/lib/utils/menuiserie-type.ts` et `src/lib/forms/config-loader.ts`:

| Matériau | Gamme | Type Produit |
|----------|-------|--------------|
| ALU | OPTIMAX | Fenêtre/Porte |
| ALU | INNOVAX | Fenêtre/Porte |
| ALU | PERFORMAX | Coulissant |
| PVC | SOFTLINE | Fenêtre/Porte |
| PVC | KIETISLINE | Fenêtre/Porte |
| PVC | WISIO | Coulissant |

## State Transitions

Aucun changement - les états de menuiserie (IMPORTEE, EN_COURS, VALIDEE) restent inchangés.

## Relationships

Aucun changement - les relations Client → Projet → Menuiserie restent inchangées.

## Database Impact

**Migration Prisma**: Non requise

Le champ `gamme` est stocké dans le JSON `donneesOriginales` et `donneesModifiees`. Prisma stocke déjà ces champs comme `Json` flexible. Seule la validation Zod côté application est modifiée.

## Backward Compatibility

✅ **Compatible** - Les données existantes (gammes ALU) restent valides avec le nouveau schema string libre.
