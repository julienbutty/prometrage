/**
 * Types de menuiserie pour détection automatique
 */
export type Materiau = "ALU" | "PVC";
export type TypePose = "NEUF" | "RENO";
export type TypeProduit = "FENETRE" | "PORTE" | "COULISSANT";

/**
 * Gammes ALUMINIUM
 */
const GAMMES_ALU = ["OPTIMAX", "INNOVAX", "PERFORMAX"];

/**
 * Détecte le matériau (ALU ou PVC) en fonction de la gamme
 * @param data Données de la menuiserie (doit contenir 'gamme')
 * @returns "ALU" si gamme OPTIMAX/INNOVAX/PERFORMAX, sinon "PVC"
 */
export function detectMateriau(data: any): Materiau {
  const gamme = data.gamme?.toUpperCase();
  return GAMMES_ALU.includes(gamme) ? "ALU" : "PVC";
}

/**
 * Détecte le type de pose (NEUF ou RENO) en fonction du champ 'pose'
 * Règles :
 * - Applique OU neuf explicite → NEUF
 * - Tunnel OU rénovation explicite → RENO
 * - Par défaut → NEUF
 *
 * @param data Données de la menuiserie (doit contenir 'pose')
 * @returns "NEUF" ou "RENO"
 */
export function detectPose(data: any): TypePose {
  const poseText = data.pose?.toLowerCase() || "";

  // Applique = toujours NEUF
  if (/applique|neuf/i.test(poseText)) {
    return "NEUF";
  }

  // Tunnel ou rénovation explicite = RENO
  if (/tunnel|r[ée]novation|r[ée]no/i.test(poseText)) {
    return "RENO";
  }

  // Défaut : NEUF
  return "NEUF";
}

/**
 * Détecte le type de produit en fonction de l'intitulé
 * Règles :
 * - Coulissant OU Galando → COULISSANT
 * - Porte OU Entrée OU Service → PORTE
 * - Par défaut → FENETRE
 *
 * @param data Données de la menuiserie (doit contenir 'intitule')
 * @returns "COULISSANT", "PORTE" ou "FENETRE"
 */
export function detectTypeProduit(data: any): TypeProduit {
  const intitule = data.intitule?.toLowerCase() || "";

  // Détection COULISSANT
  if (/coulissant|galando/i.test(intitule)) {
    return "COULISSANT";
  }

  // Détection PORTE
  if (/porte|entrée|entree|service/i.test(intitule)) {
    return "PORTE";
  }

  // Défaut : FENETRE
  return "FENETRE";
}

/**
 * Génère la clé de configuration de formulaire dynamique
 * Format : "{MATERIAU}_{POSE}_{PRODUIT}"
 * Exemples : "ALU_NEUF_FENETRE", "PVC_RENO_COULISSANT"
 *
 * @param data Données de la menuiserie
 * @returns Clé de configuration (ex: "ALU_NEUF_FENETRE")
 */
export function getFormConfigKey(data: any): string {
  const materiau = detectMateriau(data);
  const pose = detectPose(data);
  const produit = detectTypeProduit(data);

  return `${materiau}_${pose}_${produit}`;
}
