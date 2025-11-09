import { z } from "zod";

/**
 * Validation schemas for AI parsing responses
 * Used to validate Claude API responses
 */

// Client info schema
export const ClientInfoSchema = z.object({
  nom: z.string().min(1),
  adresse: z.string().optional(),
  tel: z.string().optional(),
  email: z.string().email().optional(),
});

// Single menuiserie from AI
export const AIMenuiserieSchema = z.object({
  repere: z.string().nullable(),
  intitule: z.string().min(1),
  imageBase64: z.string().optional().nullable(), // Image en base64 extraite du PDF
  largeur: z.number().min(100).max(10000),
  hauteur: z.number().min(100).max(10000),
  hauteurAllege: z.number().optional().nullable(),
  gamme: z.enum(["OPTIMAX", "PERFORMAX", "INNOVAX"]).optional().nullable(),
  couleurInt: z.string().optional().nullable(),
  couleurExt: z.string().optional().nullable(),
  pose: z.enum(["tunnel", "applique", "renovation"]).optional().nullable(),
  dimensions: z.string().optional().nullable(),
  dormant: z.string().optional().nullable(),
  habillageInt: z.string().optional().nullable(),
  habillageExt: z.string().optional().nullable(),
  doubleVitrage: z.string().optional().nullable(),
  intercalaire: z.preprocess(
    (val) => (typeof val === "string" ? val.toLowerCase() : val),
    z.enum(["blanc", "noir"]).optional().nullable()
  ),
  ouvrantPrincipal: z.preprocess(
    (val) => (typeof val === "string" ? val.toLowerCase() : val),
    z.enum(["droite", "gauche"]).optional().nullable()
  ),
  fermeture: z.string().optional().nullable(),
  poignee: z.string().optional().nullable(),
  rails: z.preprocess(
    (val) => (typeof val === "string" ? val.toLowerCase() : val),
    z.enum(["inox", "alu"]).optional().nullable()
  ),
  couleurJoints: z.string().optional().nullable(),
  couleurQuincaillerie: z.string().optional().nullable(),
  couleurPareTempete: z.string().optional().nullable(),
  petitsBoisType: z.string().optional().nullable(),
  petitsBoisConfiguration: z.string().optional().nullable(),
  petitsBoisCouleur: z.string().optional().nullable(),
  ventilation: z.string().optional().nullable(),
});

// Metadata from AI response
export const AIMetadataSchema = z.object({
  isValidDocument: z.boolean().default(true), // True si fiche métreur valide
  invalidReason: z.string().nullable().optional(), // Raison si document invalide
  confidence: z.number().min(0).max(1),
  warnings: z.array(z.string()),
  clientInfo: ClientInfoSchema.optional().nullable(),
});

// Complete AI response schema
export const AIResponseSchema = z.object({
  menuiseries: z.array(AIMenuiserieSchema),
  metadata: AIMetadataSchema,
});

// Extended metadata with usage info
export const ParsedMetadataSchema = AIMetadataSchema.extend({
  tokensUsed: z.number(),
  model: z.string(),
  retryCount: z.number(),
});

// Final parsed result
export const ParsedMenuiseriesSchema = z.object({
  menuiseries: z.array(AIMenuiserieSchema),
  metadata: ParsedMetadataSchema,
});

/**
 * TypeScript types
 */
export type ClientInfo = z.infer<typeof ClientInfoSchema>;
export type AIMenuiserie = z.infer<typeof AIMenuiserieSchema>;
export type AIMetadata = z.infer<typeof AIMetadataSchema>;
export type AIResponse = z.infer<typeof AIResponseSchema>;
export type ParsedMetadata = z.infer<typeof ParsedMetadataSchema>;
export type ParsedMenuiseries = z.infer<typeof ParsedMenuiseriesSchema>;
