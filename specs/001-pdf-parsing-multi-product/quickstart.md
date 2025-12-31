# Quickstart: Stabilisation Parsing PDF Multi-Produits

**Feature**: 001-pdf-parsing-multi-product
**Date**: 2025-12-13

## Prerequisites

- Node.js 18+
- PostgreSQL 16 running (`docker compose up -d`)
- Variables d'environnement configurées (`ANTHROPIC_API_KEY`)

## Development Setup

```bash
# 1. Checkout feature branch
git checkout 001-pdf-parsing-multi-product

# 2. Install dependencies (if needed)
npm install

# 3. Start database
docker compose up -d

# 4. Run tests in watch mode (TDD)
npm run test:watch

# 5. Start dev server (separate terminal)
npm run dev
```

## Files to Modify

### 1. Schema Zod - AI Response
**File**: `src/lib/validations/ai-response.ts`

**Change**: Ligne ~24
```typescript
// BEFORE
gamme: z.enum(["OPTIMAX", "PERFORMAX", "INNOVAX"]).optional().nullable(),

// AFTER
gamme: z.string().optional().nullable(),
```

### 2. Schema Zod - Menuiserie Data
**File**: `src/lib/validations/menuiserie.ts`

**Change**: Lignes ~29-33
```typescript
// BEFORE
gamme: z.enum(["OPTIMAX", "PERFORMAX", "INNOVAX"], {
  message: "La gamme doit être OPTIMAX, PERFORMAX ou INNOVAX",
}).optional(),

// AFTER
gamme: z.string().optional(),
```

### 3. Prompt IA
**File**: `src/lib/pdf/prompts.ts`

**Change**: Ligne ~33
```typescript
// BEFORE
"gamme": "OPTIMAX" | "PERFORMAX" | "INNOVAX",

// AFTER
"gamme": "OPTIMAX" | "INNOVAX" | "PERFORMAX" | "SOFTLINE" | "KIETISLINE" | "WISIO",
```

**Add**: Après les règles strictes
```typescript
// AFTER règle 4 (normalisation gammes)
4. Normalise les gammes en MAJUSCULES :
   - ALU : OPTIMAX, INNOVAX, PERFORMAX
   - PVC : SOFTLINE, KIETISLINE, WISIO
```

## Testing

### TDD Workflow

```bash
# 1. Write failing test first (RED)
# Add test in src/__tests__/unit/validations/ai-response.test.ts

# 2. Run test to confirm it fails
npm test ai-response

# 3. Make changes to pass test (GREEN)
# Modify src/lib/validations/ai-response.ts

# 4. Run all tests
npm test
```

### Manual Testing

1. Upload a PVC PDF with SOFTLINE menuiseries
2. Verify project is created successfully
3. Check `donneesOriginales.gamme` contains "SOFTLINE"

## Verification Checklist

- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] `npm test` passes (all existing + new tests)
- [ ] Upload PDF ALU → Success
- [ ] Upload PDF PVC → Success
- [ ] Upload PDF mixte → Success

## Troubleshooting

### Error: "gamme must be OPTIMAX, PERFORMAX or INNOVAX"
**Cause**: Schema Zod avec enum restrictif non modifié
**Solution**: Vérifier que les deux fichiers de validation sont modifiés

### Error: AI returns low confidence for PVC
**Cause**: Prompt IA ne mentionne pas les gammes PVC
**Solution**: Vérifier que `prompts.ts` inclut toutes les gammes
