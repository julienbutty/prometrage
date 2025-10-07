/**
 * Calculate difference between original and modified values
 */
export interface Ecart {
  original: number;
  modifie: number;
  difference: number;
  pourcentage: number;
  niveau: "faible" | "moyen" | "eleve";
}

export interface Ecarts {
  largeur?: Ecart;
  hauteur?: Ecart;
  [key: string]: Ecart | undefined;
}

/**
 * Determine alert level based on percentage difference
 */
export function getNiveauEcart(pourcentage: number): "faible" | "moyen" | "eleve" {
  const abs = Math.abs(pourcentage);
  if (abs < 5) return "faible";
  if (abs < 10) return "moyen";
  return "eleve";
}

/**
 * Calculate live écart for a single field (client-side)
 */
export function calculateLiveEcart(
  original: number,
  modifie: number
): Ecart | null {
  if (
    typeof original !== "number" ||
    typeof modifie !== "number" ||
    original <= 0 ||
    modifie <= 0
  ) {
    return null;
  }

  const difference = modifie - original;
  const pourcentage = (difference / original) * 100;

  return {
    original,
    modifie,
    difference,
    pourcentage: Math.round(pourcentage * 100) / 100,
    niveau: getNiveauEcart(pourcentage),
  };
}

/**
 * Calculate écarts between original and modified data
 */
export function calculateEcarts(
  donneesOriginales: Record<string, any>,
  donneesModifiees: Record<string, any>
): Ecarts {
  const ecarts: Ecarts = {};

  // Numeric fields to compare
  const numericFields = ["largeur", "hauteur", "hauteurAllege"];

  for (const field of numericFields) {
    const original = donneesOriginales[field];
    const modifie = donneesModifiees[field];

    // Both values must exist and be numbers
    if (
      typeof original === "number" &&
      typeof modifie === "number" &&
      original > 0
    ) {
      const difference = modifie - original;
      const pourcentage = (difference / original) * 100;

      ecarts[field] = {
        original,
        modifie,
        difference,
        pourcentage: Math.round(pourcentage * 100) / 100, // 2 decimals
        niveau: getNiveauEcart(pourcentage),
      };
    }
  }

  return ecarts;
}
