import { z } from "zod";

/**
 * Schema Zod pour la validation des photos d'observation
 * Les photos sont stockées en base64 dans le JSON donneesModifiees
 */

// Constantes de validation
export const PHOTO_CONSTRAINTS = {
  MAX_SIZE_MB: 1, // 1MB max après compression
  MAX_SIZE_BYTES: 1 * 1024 * 1024, // 1MB en bytes
  MAX_PHOTOS: 3, // Maximum 3 photos par menuiserie
  ALLOWED_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp"] as const,
  MAX_DIMENSION: 1200, // 1200px max (largeur)
  COMPRESSION_QUALITY: 0.8, // 80% qualité
} as const;

/**
 * Schema pour une photo d'observation individuelle
 */
export const PhotoObservationSchema = z.object({
  id: z.string().uuid("ID invalide"),

  // Base64 data URL (ex: data:image/jpeg;base64,/9j/4AAQ...)
  base64: z
    .string()
    .regex(/^data:image\/(jpeg|jpg|png|webp);base64,/, "Format base64 invalide")
    .refine(
      (val) => {
        // Calculer la taille en bytes depuis base64
        const base64Data = val.split(",")[1];
        if (!base64Data) return false;
        const sizeInBytes = (base64Data.length * 3) / 4;
        return sizeInBytes <= PHOTO_CONSTRAINTS.MAX_SIZE_BYTES;
      },
      {
        message: `La photo ne doit pas dépasser ${PHOTO_CONSTRAINTS.MAX_SIZE_MB}MB`,
      }
    ),

  nom: z
    .string()
    .min(1, "Le nom est requis")
    .max(255, "Le nom ne doit pas dépasser 255 caractères"),

  taille: z
    .number()
    .int()
    .positive()
    .max(PHOTO_CONSTRAINTS.MAX_SIZE_BYTES, `Taille max ${PHOTO_CONSTRAINTS.MAX_SIZE_MB}MB`),

  dateAjout: z.string().datetime("Date invalide"),

  compressed: z.boolean().default(true),
});

/**
 * Schema pour un tableau de photos d'observation
 */
export const PhotosObservationsSchema = z
  .array(PhotoObservationSchema)
  .max(PHOTO_CONSTRAINTS.MAX_PHOTOS, `Maximum ${PHOTO_CONSTRAINTS.MAX_PHOTOS} photos`);

/**
 * Schema étendu pour donneesModifiees incluant les photos
 */
export const DonneesModifieesWithPhotosSchema = z.object({
  observations: z.string().optional(),
  photosObservations: PhotosObservationsSchema.optional(),
});

/**
 * Types TypeScript inférés
 */
export type PhotoObservation = z.infer<typeof PhotoObservationSchema>;
export type PhotosObservations = z.infer<typeof PhotosObservationsSchema>;
export type DonneesModifieesWithPhotos = z.infer<typeof DonneesModifieesWithPhotosSchema>;

/**
 * Fonction helper pour calculer la taille d'une image base64 en bytes
 */
export function calculateBase64Size(base64String: string): number {
  const base64Data = base64String.split(",")[1];
  if (!base64Data) return 0;

  // Formule : (longueur * 3/4) - padding
  const padding = base64Data.endsWith("==") ? 2 : base64Data.endsWith("=") ? 1 : 0;
  return (base64Data.length * 3) / 4 - padding;
}

/**
 * Fonction helper pour valider le type MIME
 */
export function isAllowedImageType(mimeType: string): boolean {
  return PHOTO_CONSTRAINTS.ALLOWED_TYPES.includes(mimeType as any);
}
