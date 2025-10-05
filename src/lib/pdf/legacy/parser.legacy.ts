import type { MenuiserieData } from "@/lib/validations/menuiserie";

/**
 * Types pour le parsing PDF
 */
export interface ClientInfo {
  nomClient: string;
  adresse: string;
  telephone?: string;
}

export interface MenuiserieExtracted {
  intitule: string;
  donneesOriginales: Record<string, any>;
  ordre: number;
}

/**
 * Nettoie le texte extrait du PDF (enlève les AAAA... et autres caractères parasites)
 */
function cleanText(text: string): string {
  return text
    .replace(/A{10,}/g, "") // Enlève les longues séquences de A
    .replace(/\n\s*\n/g, "\n") // Enlève les lignes vides multiples
    .trim();
}

/**
 * Extrait les informations client du PDF
 */
export function extractClientInfo(text: string): ClientInfo {
  const cleanedText = cleanText(text);
  const result: ClientInfo = {
    nomClient: "",
    adresse: "",
  };

  // Extract client name
  const nameMatch = cleanedText.match(
    /(?:Madame et Monsieur|Monsieur|Madame)\s+([A-ZÀ-Ü][A-ZÀ-Ü\s]+)/i
  );
  if (nameMatch) {
    result.nomClient = nameMatch[1].trim();
  }

  // Extract address
  const lines = cleanedText.split("\n");
  const addressIndex = lines.findIndex((line) =>
    line.match(/\d+.*(?:rue|avenue|chemin|boulevard|allée|impasse)/i)
  );

  if (addressIndex !== -1) {
    const addressLine = lines[addressIndex].trim();
    const postalLine = lines[addressIndex + 1]?.trim() || "";
    result.adresse = postalLine ? `${addressLine}, ${postalLine}` : addressLine;
  }

  // Extract phone
  const phoneMatch = cleanedText.match(/(?:Contact client\s*:\s*)?(\d{2}\s\d{2}\s\d{2}\s\d{2}\s\d{2})/);
  if (phoneMatch) {
    result.telephone = phoneMatch[1];
  }

  return result;
}

/**
 * Extrait la valeur après un pattern avec nettoyage
 */
function extractField(text: string, pattern: RegExp | string): string | null {
  const regex = typeof pattern === "string" ? new RegExp(pattern, "i") : pattern;
  const match = text.match(regex);
  return match ? match[1]?.trim() || null : null;
}

/**
 * Extrait une menuiserie complète d'un bloc de texte
 */
export function extractMenuiserie(rawText: string, ordre: number): MenuiserieExtracted {
  const text = cleanText(rawText);

  // Extraire le titre - chercher le pattern exact avec dimensions
  // Format: "Coulissant 2 vantaux 2 rails\nLarg 3000 mm x Haut 2250 mm"
  const titleWithDimMatch = text.match(
    /((?:Coulissant|Châssis|Porte|Fenêtre|Variante)[^\n]+)\s*(?:Larg|L)/i
  );

  let intitule = "Menuiserie";
  if (titleWithDimMatch) {
    // Nettoyer le titre en enlevant "Variante coulissant :" si présent
    intitule = titleWithDimMatch[1]
      .replace(/^Variante\s+coulissant\s*:\s*/i, "")
      .trim();
  }

  // Extraire les dimensions
  const dimMatch = text.match(/Larg\s*(\d+)\s*mm\s*x\s*Haut\s*(\d+)\s*mm/i);
  const largeur = dimMatch ? parseInt(dimMatch[1], 10) : 0;
  const hauteur = dimMatch ? parseInt(dimMatch[2], 10) : 0;

  // Construire les données originales
  const donneesOriginales: Record<string, any> = {
    largeur,
    hauteur,
  };

  // Gamme - normaliser pour correspondre au schema (OPTIMAX, PERFORMAX, INNOVAX)
  const gammeMatch = extractField(text, /gamme\s*([^\n]+)/i);
  if (gammeMatch) {
    const gammeNormalized = gammeMatch.toUpperCase();
    if (gammeNormalized.includes("OPTIMAX")) {
      donneesOriginales.gamme = "OPTIMAX";
    } else if (gammeNormalized.includes("PERFORMAX")) {
      donneesOriginales.gamme = "PERFORMAX";
    } else if (gammeNormalized.includes("INNOVAX")) {
      donneesOriginales.gamme = "INNOVAX";
    } else {
      donneesOriginales.gamme = gammeMatch; // Conserver la valeur originale dans les données
    }
  }

  // Couleurs
  const couleurIntMatch = extractField(
    text,
    /couleur\s+int[ée]rieure[^:]*:\s*([^\n]+)/i
  );
  if (couleurIntMatch) donneesOriginales.couleurInterieur = couleurIntMatch;

  const couleurExtMatch = extractField(
    text,
    /couleur\s+ext[ée]rieure[^:]*:\s*([^\n]+)/i
  );
  if (couleurExtMatch) donneesOriginales.couleurExterieur = couleurExtMatch;

  // Pose - normaliser pour correspondre au schema (tunnel, applique, renovation)
  const poseMatch = extractField(text, /pose\s+en\s+(\w+)/i);
  if (poseMatch) {
    const poseNormalized = poseMatch.toLowerCase();
    if (poseNormalized.includes("tunnel")) {
      donneesOriginales.pose = "tunnel";
    } else if (poseNormalized.includes("applique")) {
      donneesOriginales.pose = "applique";
    } else if (poseNormalized.includes("renov") || poseNormalized.includes("rénovation")) {
      donneesOriginales.pose = "renovation";
    } else {
      donneesOriginales.pose = poseMatch;
    }
  }

  // Dimensions type
  const dimensionsTypeMatch = extractField(text, /dimensions\s+([^\n]+)/i);
  if (dimensionsTypeMatch) donneesOriginales.dimensionsType = dimensionsTypeMatch;

  // Dormant
  const dormantMatch = extractField(text, /dormant\s+(?:de\s+)?([^\n]+?)(?:\s+sans|\n|$)/i);
  if (dormantMatch) donneesOriginales.dormant = dormantMatch;

  // Dormant aile
  donneesOriginales.dormantAvecAile = !text.match(/sans\s+aile/i);

  // Habillages
  const habillageIntMatch = extractField(
    text,
    /habillage\s+int[ée]rieur[^:]*:\s*([^\n]+)/i
  );
  if (habillageIntMatch) donneesOriginales.habillageInterieur = habillageIntMatch;

  const habillageExtMatch = extractField(
    text,
    /habillage\s+ext[ée]rieur[^:]*:\s*([^\n]+)/i
  );
  if (habillageExtMatch) donneesOriginales.habillageExterieur = habillageExtMatch;

  // Fixation
  const fixationMatch = extractField(text, /fixation\s+([^\n]+)/i);
  if (fixationMatch) donneesOriginales.fixation = fixationMatch;

  // Dormant avec double gorge
  donneesOriginales.dormantDoubleGorge = !!text.match(/dormant\s+avec\s+double\s+gorge/i);

  // Traverse basse
  const traverseMatch = extractField(text, /traverse\s+basse[^:]*:\s*([^\n]+)/i);
  if (traverseMatch) donneesOriginales.traverseBasse = traverseMatch;

  // Double vitrage
  const vitrageMatch = extractField(text, /double\s+vitrage[^:]*:\s*([^\n]+)/i);
  if (vitrageMatch) donneesOriginales.doubleVitrage = vitrageMatch;

  // Intercalaire
  const intercalaireMatch = extractField(text, /intercalaire[^:]*:\s*([^\n]+)/i);
  if (intercalaireMatch) donneesOriginales.intercalaire = intercalaireMatch;

  // Ouvrant principal
  const ouvrantMatch = extractField(text, /ouvrant\s+principal\s+([^\n]+)/i);
  if (ouvrantMatch) donneesOriginales.ouvrantPrincipal = ouvrantMatch;

  // Fermeture
  const fermetureMatch = text.match(/fermeture[^\.]+vantail[^\n]+/i);
  donneesOriginales.fermetureVantaux = !!fermetureMatch;
  if (fermetureMatch) donneesOriginales.fermetureDetails = fermetureMatch[0].trim();

  // Poignées
  const poigneeMainMatch = extractField(
    text,
    /poign[ée]e\s+sur\s+vantail\s+principal[^:]*:\s*([^\n]+)/i
  );
  if (poigneeMainMatch) donneesOriginales.poigneePrincipale = poigneeMainMatch;

  const poigneeSecMatch = extractField(
    text,
    /poign[ée]e\s+sur\s+vantail\s+secondaire[^:]*:\s*([^\n]+)/i
  );
  if (poigneeSecMatch) donneesOriginales.poigneeSecondaire = poigneeSecMatch;

  // Rails
  const railsMatch = extractField(text, /(rails[^\n]+)/i);
  if (railsMatch) {
    donneesOriginales.rails = railsMatch;
    donneesOriginales.railsInox = railsMatch.toLowerCase().includes("inox");
  }

  // Couleur des joints
  const jointsMatch = extractField(text, /couleur\s+(?:des\s+)?joints[^:]*:\s*([^\n]+)/i);
  if (jointsMatch) donneesOriginales.couleurJoints = jointsMatch;

  // Couleur quincaillerie
  const quincaillerieMatch = extractField(
    text,
    /couleur\s+quincaillerie[^:]*:\s*([^\n]+)/i
  );
  if (quincaillerieMatch) donneesOriginales.couleurQuincaillerie = quincaillerieMatch;

  // Couleur pare-tempête
  const pareTempeteMatch = extractField(
    text,
    /couleur\s+pare[- ]temp[êe]te[^:]*:\s*([^\n]+)/i
  );
  if (pareTempeteMatch) donneesOriginales.couleurPareTempete = pareTempeteMatch;

  return {
    intitule,
    donneesOriginales,
    ordre,
  };
}
