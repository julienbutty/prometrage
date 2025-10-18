/**
 * Statuts possibles pour une menuiserie
 *
 * IMPORTEE : Menuiserie importée du PDF, jamais modifiée
 * EN_COURS : Menuiserie modifiée et enregistrée, mais pas validée
 * VALIDEE : Menuiserie validée et terminée par l'opérateur
 */
export enum StatutMenuiserie {
  IMPORTEE = "IMPORTEE",
  EN_COURS = "EN_COURS",
  VALIDEE = "VALIDEE",
}

/**
 * Calcule le statut d'une menuiserie en fonction de ses données
 *
 * @param donneesModifiees - Données modifiées (null si jamais modifiée)
 * @param validee - Flag de validation (true si validée)
 * @returns Le statut de la menuiserie
 */
export function getMenuiserieStatut(
  donneesModifiees: unknown,
  validee: boolean
): StatutMenuiserie {
  // Si validée, retourner VALIDEE
  if (validee) {
    return StatutMenuiserie.VALIDEE;
  }

  // Si des modifications existent, retourner EN_COURS
  if (
    donneesModifiees !== null &&
    donneesModifiees !== undefined &&
    typeof donneesModifiees === "object" &&
    Object.keys(donneesModifiees as Record<string, any>).length > 0
  ) {
    return StatutMenuiserie.EN_COURS;
  }

  // Sinon, retourner IMPORTEE (état initial)
  return StatutMenuiserie.IMPORTEE;
}

/**
 * Vérifie si une menuiserie est complétée (validée)
 * Utile pour le comptage et les indicateurs visuels
 */
export function isMenuiserieComplete(
  donneesModifiees: unknown,
  validee: boolean
): boolean {
  return getMenuiserieStatut(donneesModifiees, validee) === StatutMenuiserie.VALIDEE;
}
