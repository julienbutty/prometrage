# Guide d'implémentation - Parsing PDF via IA

## 📋 Vue d'ensemble

Ce document détaille l'approche **parsing PDF via IA** en remplacement de l'approche traditionnelle par regex et pdf.js.

### Pourquoi l'IA ?

❌ **Problèmes avec parsing traditionnel (regex + pdf.js)** :
- Fragilité face aux variations de format PDF
- Maintenance lourde des patterns regex
- Difficultés avec mises en page complexes
- Gestion manuelle de chaque cas edge

✅ **Avantages du parsing via IA (Claude Vision)** :
- **Robustesse** : Comprend le contexte et s'adapte aux variations
- **Maintenance réduite** : Moins de code fragile à maintenir
- **Évolutivité** : Adaptation naturelle aux nouveaux formats
- **Confiance** : Score de confiance pour chaque extraction
- **Warnings** : Détection automatique des zones ambiguës

---

## 🛠️ Stack technique

### Package NPM
```bash
npm install @anthropic-ai/sdk
```

### Modèle IA utilisé
- **Modèle** : `claude-sonnet-4-5-20250514` (latest, Mai 2025)
- **API** : Anthropic Messages API avec support PDF
- **Coût estimé** : ~$0.03 par PDF de 3-5 pages (input: 1000 tokens, output: 1500 tokens)

> 💡 **Pourquoi Claude Sonnet 4.5 et pas 3.5 ?**
> Version la plus récente avec meilleure extraction structurée, précision accrue, et prix identique.
> Voir [CLAUDE_VERSION_CHOICE.md](./CLAUDE_VERSION_CHOICE.md) pour le comparatif complet.

---

## 🔑 Configuration

### Variables d'environnement

Ajouter dans `.env.local` :

```bash
# Anthropic API
ANTHROPIC_API_KEY=sk-ant-api03-xxx...

# Optionnel : Configuration parsing
AI_PARSING_MAX_RETRIES=3
AI_PARSING_MIN_CONFIDENCE=0.7
AI_PARSING_TIMEOUT=30000
```

### Obtenir une clé API

1. Créer un compte sur [console.anthropic.com](https://console.anthropic.com)
2. Générer une API key dans Settings > API Keys
3. Ajouter des crédits (minimum $5 pour commencer)

---

## 📝 Workflow d'implémentation

### 1. Conversion PDF → Base64

```typescript
// src/lib/pdf/converter.ts
export async function pdfToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // Retirer le préfixe "data:application/pdf;base64,"
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

### 2. Prompt structuré pour extraction

```typescript
// src/lib/pdf/prompts.ts
export const EXTRACTION_PROMPT = `
Tu es un expert en extraction de données de fiches métreur pour menuiseries.

Analyse ce PDF et extrais TOUTES les menuiseries présentes.
Pour chaque menuiserie, extrais les données suivantes au format JSON strict :

{
  "menuiseries": [
    {
      "repere": "Salon" | null,  // Texte avant ":" si présent
      "intitule": "Coulissant 2 vantaux",  // Titre de la menuiserie
      "largeur": 3000,  // En millimètres (nombre)
      "hauteur": 2250,  // En millimètres (nombre)
      "hauteurAllege": 1000,  // Optionnel
      "gamme": "OPTIMAX" | "PERFORMAX" | "INNOVAX",
      "couleurInt": "RAL 9016",
      "couleurExt": "RAL 7016",
      "pose": "tunnel" | "applique" | "renovation",
      "dimensions": "clair de bois" | "execution",
      "dormant": "avec aile" | "sans aile",
      "habillageInt": "Plat 30x2" | "Sans habillage",
      "habillageExt": "Cornière 20x20" | "Sans habillage",
      "doubleVitrage": "44.2.16w Argon.4 PTR+",
      "intercalaire": "blanc" | "noir",
      "ouvrantPrincipal": "droite" | "gauche",  // Pour coulissants
      "fermeture": "Description",
      "poignee": "Description",
      "rails": "inox" | "alu",
      "couleurJoints": "RAL...",
      "couleurQuincaillerie": "Description",
      "couleurPareTempete": "RAL...",
      "couleurPetitsBois": "Description"
    }
  ],
  "metadata": {
    "confidence": 0.95,  // Score de confiance global (0-1)
    "warnings": ["Dimension hauteur peu lisible pour menuiserie #2"],
    "clientInfo": {
      "nom": "DUPONT",
      "adresse": "15 Rue des Lilas",
      "tel": "06 12 34 56 78",
      "email": "jean.dupont@example.com"
    }
  }
}

RÈGLES STRICTES:
1. Toutes les dimensions DOIVENT être des nombres en millimètres
2. Si une valeur est illisible, utilise null et ajoute un warning
3. Normalise les gammes en MAJUSCULES (OPTIMAX, PERFORMAX, INNOVAX)
4. Normalise les poses en minuscules (tunnel, applique, renovation)
5. Extrais TOUTES les menuiseries, même partiellement remplies
6. Conserve les descriptions exactes pour couleurs et options
7. Le score de confiance doit refléter la qualité de l'extraction

Réponds UNIQUEMENT avec le JSON, sans texte additionnel.
`;
```

### 3. Fonction de parsing avec retry

```typescript
// src/lib/pdf/parser.ts
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { EXTRACTION_PROMPT } from "./prompts";
import { menuiseriesResponseSchema } from "../validations/menuiserie";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function parsePDFWithAI(
  pdfBase64: string,
  maxRetries = 3
): Promise<ParsedMenuiseries> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Appel API Anthropic
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250514",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: pdfBase64,
                },
              },
              {
                type: "text",
                text: EXTRACTION_PROMPT,
              },
            ],
          },
        ],
      });

      // Extraction du JSON depuis la réponse
      const textContent = response.content.find((c) => c.type === "text");
      if (!textContent || textContent.type !== "text") {
        throw new Error("No text content in AI response");
      }

      const jsonText = extractJSON(textContent.text);
      const rawData = JSON.parse(jsonText);

      // Validation Zod stricte
      const validated = menuiseriesResponseSchema.parse(rawData);

      // Vérification du score de confiance
      const minConfidence = parseFloat(
        process.env.AI_PARSING_MIN_CONFIDENCE || "0.7"
      );
      if (validated.metadata.confidence < minConfidence) {
        throw new AILowConfidenceError(
          `AI confidence ${validated.metadata.confidence} below threshold ${minConfidence}`,
          validated.metadata.confidence
        );
      }

      return {
        menuiseries: validated.menuiseries,
        metadata: {
          ...validated.metadata,
          tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
          model: "claude-sonnet-4-5-20250514",
          retryCount: attempt,
        },
      };
    } catch (error) {
      console.error(`Parsing attempt ${attempt + 1} failed:`, error);

      // Si c'est la dernière tentative, on throw l'erreur
      if (attempt === maxRetries - 1) {
        throw new AIParsingError(
          `Failed to parse PDF after ${maxRetries} attempts`,
          error
        );
      }

      // Backoff exponentiel avant retry
      await wait(1000 * Math.pow(2, attempt));
    }
  }

  throw new Error("Unreachable code");
}

// Fonction helper pour extraire le JSON
function extractJSON(text: string): string {
  // Recherche du JSON entre ```json et ``` ou directement le JSON
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ||
                    text.match(/(\{[\s\S]*\})/);

  if (!jsonMatch) {
    throw new Error("No JSON found in AI response");
  }

  return jsonMatch[1].trim();
}

// Fonction helper pour attendre
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Erreurs custom
export class AIParsingError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = "AIParsingError";
  }
}

export class AILowConfidenceError extends Error {
  constructor(message: string, public confidence: number) {
    super(message);
    this.name = "AILowConfidenceError";
  }
}
```

### 4. Schémas de validation Zod

```typescript
// src/lib/validations/menuiserie.ts
import { z } from "zod";

export const menuiserieSchema = z.object({
  repere: z.string().nullable(),
  intitule: z.string().min(1),
  largeur: z.number().min(100).max(10000),
  hauteur: z.number().min(100).max(10000),
  hauteurAllege: z.number().optional().nullable(),
  gamme: z.enum(["OPTIMAX", "PERFORMAX", "INNOVAX"]),
  couleurInt: z.string(),
  couleurExt: z.string(),
  pose: z.enum(["tunnel", "applique", "renovation"]),
  dimensions: z.enum(["clair de bois", "execution"]),
  dormant: z.string(),
  habillageInt: z.string().optional().nullable(),
  habillageExt: z.string().optional().nullable(),
  doubleVitrage: z.string(),
  intercalaire: z.enum(["blanc", "noir"]),
  ouvrantPrincipal: z.enum(["droite", "gauche"]).optional().nullable(),
  fermeture: z.string().optional().nullable(),
  poignee: z.string().optional().nullable(),
  rails: z.enum(["inox", "alu"]).optional().nullable(),
  couleurJoints: z.string().optional().nullable(),
  couleurQuincaillerie: z.string().optional().nullable(),
  couleurPareTempete: z.string().optional().nullable(),
  couleurPetitsBois: z.string().optional().nullable(),
});

export const clientInfoSchema = z.object({
  nom: z.string().min(1),
  adresse: z.string().optional(),
  tel: z.string().optional(),
  email: z.string().email().optional(),
});

export const menuiseriesResponseSchema = z.object({
  menuiseries: z.array(menuiserieSchema),
  metadata: z.object({
    confidence: z.number().min(0).max(1),
    warnings: z.array(z.string()),
    clientInfo: clientInfoSchema.optional(),
  }),
});

export type Menuiserie = z.infer<typeof menuiserieSchema>;
export type MenuiseriesResponse = z.infer<typeof menuiseriesResponseSchema>;
```

### 5. API Route

```typescript
// src/app/api/upload/pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { parsePDFWithAI, AILowConfidenceError } from "@/lib/pdf/parser";
import { pdfToBase64 } from "@/lib/pdf/converter";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, error: "Invalid PDF file" },
        { status: 400 }
      );
    }

    // Conversion PDF → Base64
    const pdfBase64 = await pdfToBase64(file);

    // Parsing via IA
    const parsed = await parsePDFWithAI(pdfBase64);

    // Upload fichier (Uploadthing/Vercel Blob)
    const pdfUrl = await uploadFile(file);

    // Création du projet en DB
    const projet = await prisma.projet.create({
      data: {
        reference: generateReference(parsed.metadata.clientInfo?.nom),
        client: parsed.metadata.clientInfo || {},
        pdfUrl,
        statut: "EN_COURS",
        menuiseries: {
          create: parsed.menuiseries.map((m) => ({
            repere: m.repere,
            intitule: m.intitule,
            donneesOriginales: m,
          })),
        },
      },
      include: {
        menuiseries: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          projetId: projet.id,
          reference: projet.reference,
          pdfUrl: projet.pdfUrl,
          menuiseries: projet.menuiseries,
          parseStatus: {
            total: parsed.menuiseries.length,
            success: parsed.menuiseries.length,
            errors: [],
            aiMetadata: {
              model: parsed.metadata.model,
              confidence: parsed.metadata.confidence,
              tokensUsed: parsed.metadata.tokensUsed,
              warnings: parsed.metadata.warnings,
              retryCount: parsed.metadata.retryCount,
            },
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload PDF error:", error);

    // Gestion erreurs spécifiques IA
    if (error instanceof AILowConfidenceError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AI_LOW_CONFIDENCE",
            message: "L'IA n'est pas assez confiante dans l'extraction",
            details: {
              confidence: error.confidence,
              suggestion: "Vérification manuelle recommandée",
            },
          },
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "AI_PARSE_ERROR",
          message: "Erreur lors du parsing du PDF",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
```

---

## 🧪 Tests

### Test avec mock IA

```typescript
// src/__tests__/unit/pdf/parser.test.ts
import { describe, it, expect, vi } from "vitest";
import { parsePDFWithAI } from "@/lib/pdf/parser";

// Mock du SDK Anthropic
vi.mock("@anthropic-ai/sdk", () => ({
  default: class Anthropic {
    messages = {
      create: vi.fn().mockResolvedValue({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              menuiseries: [
                {
                  repere: "Salon",
                  intitule: "Coulissant 2 vantaux",
                  largeur: 3000,
                  hauteur: 2250,
                  gamme: "PERFORMAX",
                  pose: "tunnel",
                  // ... autres champs
                },
              ],
              metadata: {
                confidence: 0.95,
                warnings: [],
              },
            }),
          },
        ],
        usage: {
          input_tokens: 1000,
          output_tokens: 500,
        },
      }),
    };
  },
}));

describe("parsePDFWithAI", () => {
  it("should extract menuiseries from PDF", async () => {
    const mockPdfBase64 = "base64encodedpdf...";

    const result = await parsePDFWithAI(mockPdfBase64);

    expect(result.menuiseries).toHaveLength(1);
    expect(result.menuiseries[0].repere).toBe("Salon");
    expect(result.menuiseries[0].largeur).toBe(3000);
    expect(result.metadata.confidence).toBe(0.95);
  });

  it("should retry on failure", async () => {
    // Test du retry automatique
    // ...
  });

  it("should throw on low confidence", async () => {
    // Test du seuil de confiance
    // ...
  });
});
```

---

## 💰 Gestion des coûts

### Estimation coûts

**Tarification Claude Sonnet 4.5** (au 2024) :
- Input : $3 / 1M tokens
- Output : $15 / 1M tokens

**Exemple PDF fiche métreur (3-5 pages)** :
- Input tokens : ~1000 (PDF + prompt)
- Output tokens : ~1500 (JSON structuré)
- Coût par extraction : ~$0.03

**Volume estimé** :
- 100 PDFs/mois = $3/mois
- 500 PDFs/mois = $15/mois
- 1000 PDFs/mois = $30/mois

### Optimisations

1. **Caching du prompt** : Réduire les tokens input répétitifs
2. **Batch processing** : Grouper plusieurs menuiseries si possible
3. **Monitoring** : Tracker les tokens utilisés par projet

---

## 🚨 Gestion des erreurs

### Types d'erreurs

| Erreur | Code HTTP | Action |
|--------|-----------|--------|
| `AI_PARSE_ERROR` | 500 | Retry automatique (max 3) |
| `AI_LOW_CONFIDENCE` | 422 | Notification utilisateur pour vérification |
| `AI_RATE_LIMIT` | 429 | Backoff exponentiel + retry |
| `INVALID_PDF` | 400 | Retour utilisateur |
| `VALIDATION_ERROR` | 400 | Logs + retry avec prompt amélioré |

### Retry automatique

```typescript
// Backoff exponentiel
const delays = [1000, 2000, 4000]; // ms
for (let i = 0; i < 3; i++) {
  try {
    return await parsePDFWithAI(pdf);
  } catch (error) {
    if (i < 2) await wait(delays[i]);
  }
}
```

---

## 📊 Monitoring

### Métriques à tracker

1. **Succès rate** : % de PDFs parsés avec succès
2. **Confidence moyenne** : Score de confiance moyen
3. **Tokens utilisés** : Suivi des coûts
4. **Temps de traitement** : Performance
5. **Retry count** : Nombre de tentatives nécessaires

### Implémentation

```typescript
// src/lib/monitoring/ai-metrics.ts
export async function trackAIMetrics(metrics: {
  success: boolean;
  confidence?: number;
  tokensUsed: number;
  retryCount: number;
  duration: number;
}) {
  // Logger vers service (Vercel Analytics, Sentry, etc.)
  console.log("AI Parsing Metrics:", metrics);

  // Optionnel: Envoyer vers analytics
  await analytics.track("ai_parsing", metrics);
}
```

---

## ✅ Checklist d'implémentation

- [ ] Installer `@anthropic-ai/sdk`
- [ ] Configurer `ANTHROPIC_API_KEY` dans `.env.local`
- [ ] Créer fonction `pdfToBase64`
- [ ] Créer prompt structuré `EXTRACTION_PROMPT`
- [ ] Implémenter `parsePDFWithAI` avec retry
- [ ] Créer schémas Zod de validation
- [ ] Implémenter API Route `/api/upload/pdf`
- [ ] Ajouter gestion erreurs spécifiques IA
- [ ] Écrire tests unitaires avec mocks
- [ ] Configurer monitoring/métriques
- [ ] Tester sur vrais PDFs du client
- [ ] Documenter coûts et optimisations

---

## 📚 Ressources

- [Anthropic API Documentation](https://docs.anthropic.com)
- [Claude Sonnet 4.5 Pricing](https://www.anthropic.com/pricing)
- [PDF Support in Claude](https://docs.anthropic.com/en/docs/vision)
- [Zod Documentation](https://zod.dev)
