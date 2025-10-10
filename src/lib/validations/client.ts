import { z } from "zod";

/**
 * Schema de validation pour mise à jour client
 */
export const clientUpdateSchema = z.object({
  nom: z.string().min(1, "Le nom est obligatoire"),
  email: z
    .string()
    .email("Email invalide")
    .nullable()
    .optional()
    .transform((val) => val || null),
  tel: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || null),
});

export type ClientUpdateInput = z.infer<typeof clientUpdateSchema>;
