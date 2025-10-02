import { z } from "zod";

/**
 * Schema Zod pour la validation des données Projet
 * Basé sur le modèle Prisma et l'API_SPEC.md
 */

// Regex pour validation du téléphone (format français flexible)
const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;

export const ProjetSchema = z.object({
  id: z.string().cuid().optional(),
  reference: z
    .string()
    .min(3, "La référence doit contenir au moins 3 caractères")
    .trim()
    .transform((val) => val.toUpperCase()),

  // Informations client
  clientNom: z
    .string()
    .min(1, "Le nom du client est requis")
    .trim()
    .transform((val) => val.toUpperCase()),

  clientAdresse: z.string().trim().optional(),

  clientTel: z
    .string()
    .regex(phoneRegex, "Format de téléphone invalide")
    .optional()
    .or(z.literal("")),

  clientEmail: z
    .string()
    .email("Email invalide")
    .toLowerCase()
    .optional()
    .or(z.literal("")),

  // Fichier PDF
  pdfUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  pdfOriginalNom: z.string().optional(),

  // Métadonnées (gérées automatiquement par Prisma)
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

/**
 * Schema pour la création d'un projet (sans ID, sans dates, sans référence)
 * La référence sera générée automatiquement côté serveur
 */
export const CreateProjetSchema = ProjetSchema.omit({
  id: true,
  reference: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Schema pour la mise à jour d'un projet (tous les champs optionnels sauf ID)
 */
export const UpdateProjetSchema = ProjetSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

/**
 * Types TypeScript inférés des schemas
 */
export type Projet = z.infer<typeof ProjetSchema>;
export type CreateProjet = z.infer<typeof CreateProjetSchema>;
export type UpdateProjet = z.infer<typeof UpdateProjetSchema>;
