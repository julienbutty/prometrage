/**
 * Opening Direction Utilities
 *
 * Handles mapping between "Ouverture intérieure" PDF field values
 * and SVG opening direction for triangle indicators.
 *
 * Key logic: "droite tirant" → triangle points LEFT (inverse mapping)
 */

import type { OpeningDirection } from "./types";

/**
 * Type for "Ouverture intérieure" field values from PDF
 */
export type OuvertureInterieure = "droite tirant" | "gauche tirant";

/**
 * Maps "Ouverture intérieure" value to SVG opening direction.
 *
 * Business logic (inverse mapping):
 * - "droite tirant" = pull with right hand → hinges on RIGHT → opens LEFT → triangle points LEFT
 * - "gauche tirant" = pull with left hand → hinges on LEFT → opens RIGHT → triangle points RIGHT
 *
 * @param ouvertureInterieure - Value from PDF or form ("droite tirant", "gauche tirant")
 * @returns OpeningDirection for SVG, or null if value is missing/unrecognized
 */
export function mapOuvertureToSensOuverture(
  ouvertureInterieure: string | null | undefined
): OpeningDirection | null {
  if (!ouvertureInterieure) return null;

  const normalized = ouvertureInterieure.toLowerCase().trim();

  // "droite tirant" → triangle pointe GAUCHE (inverse)
  if (normalized.includes("droite")) {
    return "gauche";
  }

  // "gauche tirant" → triangle pointe DROITE (inverse)
  if (normalized.includes("gauche")) {
    return "droite";
  }

  return null;
}

/**
 * Determines effective opening direction with legacy fallback.
 *
 * Priority:
 * 1. ouvertureInterieure (new field) if present
 * 2. ouvrantPrincipal (legacy) with implicit "tirant" behavior
 * 3. null (no triangle displayed)
 *
 * @param ouvertureInterieure - New field from PDF extraction
 * @param ouvrantPrincipal - Legacy field for sliding windows (used as fallback)
 * @returns OpeningDirection for SVG, or null if not determinable
 */
export function getEffectiveOpeningDirection(
  ouvertureInterieure: string | null | undefined,
  ouvrantPrincipal: string | null | undefined
): OpeningDirection | null {
  // Priority to new field
  if (ouvertureInterieure) {
    return mapOuvertureToSensOuverture(ouvertureInterieure);
  }

  // Fallback legacy: "droite" → "droite tirant" implicit
  if (ouvrantPrincipal) {
    return mapOuvertureToSensOuverture(`${ouvrantPrincipal} tirant`);
  }

  return null;
}
