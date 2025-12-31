import { z } from "zod";

/**
 * Schema Zod pour la validation des données de Menuiserie
 * Basé sur le modèle Prisma et l'API_SPEC.md
 */

// Constantes de validation
const MIN_DIMENSION = 100; // 10cm minimum
const MAX_DIMENSION = 10000; // 10m maximum

/**
 * Schema pour les données d'une menuiserie (JSON flexible)
 * Utilisé pour donneesOriginales et donneesModifiees
 */
export const MenuiserieDataSchema = z.object({
  // Dimensions obligatoires (en mm)
  largeur: z
    .number()
    .min(MIN_DIMENSION, `La largeur doit être au moins ${MIN_DIMENSION}mm`)
    .max(MAX_DIMENSION, `La largeur ne peut pas dépasser ${MAX_DIMENSION}mm`),

  hauteur: z
    .number()
    .min(MIN_DIMENSION, `La hauteur doit être au moins ${MIN_DIMENSION}mm`)
    .max(MAX_DIMENSION, `La hauteur ne peut pas dépasser ${MAX_DIMENSION}mm`),

  // Gamme de produits: string libre pour supporter ALU + PVC et futures gammes
  // ALU: OPTIMAX, INNOVAX, PERFORMAX
  // PVC: SOFTLINE, KIETISLINE, WISIO
  gamme: z.string().optional(),

  // Type de pose
  pose: z
    .enum(["tunnel", "applique", "renovation"], {
      message: "Le type de pose doit être tunnel, applique ou renovation",
    })
    .optional(),

  // Autres caractéristiques optionnelles
  dormant: z.string().optional(),
  habillageInt: z.string().optional(),
  habillageExt: z.string().optional(),
  intercalaire: z.string().optional(),
  ouvrantPrincipal: z.string().optional(),
  rails: z.string().optional(),

  // Permet d'autres champs dynamiques
}).passthrough();

/**
 * Schema pour un écart entre données originales et modifiées
 */
export const EcartSchema = z.object({
  champ: z.string(),
  valeurOriginale: z.union([z.string(), z.number()]),
  valeurModifiee: z.union([z.string(), z.number()]),
  pourcentage: z.number().optional(),
  niveau: z.enum(["info", "warning", "error"]),
});

/**
 * Schema complet pour une Menuiserie
 */
export const MenuiserieSchema = z.object({
  id: z.string().cuid().optional(),

  // Relation au projet (requis)
  projetId: z.string().cuid("ID de projet invalide"),

  // Identifiants
  repere: z
    .string()
    .trim()
    .transform((val) => val.toUpperCase())
    .optional(),

  intitule: z
    .string()
    .min(1, "L'intitulé est requis")
    .trim(),

  // Données JSON flexibles
  donneesOriginales: MenuiserieDataSchema,
  donneesModifiees: MenuiserieDataSchema.optional(),

  // Écarts calculés
  ecarts: z.array(EcartSchema).optional(),

  // Validation
  validee: z.boolean().default(false),
  dateValidation: z.date().optional(),

  // Ordre d'affichage
  ordre: z.number().int().min(0).default(0),

  // Métadonnées (gérées par Prisma)
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

/**
 * Schema pour la création d'une menuiserie (sans ID, sans dates)
 */
export const CreateMenuiserieSchema = MenuiserieSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  validee: true,
  dateValidation: true,
});

/**
 * Schema pour la mise à jour d'une menuiserie
 */
export const UpdateMenuiserieSchema = MenuiserieSchema.omit({
  id: true,
  projetId: true,
  createdAt: true,
  updatedAt: true,
}).partial();

/**
 * Types TypeScript inférés des schemas
 */
export type MenuiserieData = z.infer<typeof MenuiserieDataSchema>;
export type Ecart = z.infer<typeof EcartSchema>;
export type Menuiserie = z.infer<typeof MenuiserieSchema>;
export type CreateMenuiserie = z.infer<typeof CreateMenuiserieSchema>;
export type UpdateMenuiserie = z.infer<typeof UpdateMenuiserieSchema>;
