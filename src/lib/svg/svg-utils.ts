import type { MenuiserieType, ParsedMenuiserieType } from './types';

/**
 * Patterns de reconnaissance pour chaque type de menuiserie
 * @see specs/002-svg-menuiserie-view/data-model.md - Mapping Patterns
 */
const TYPE_PATTERNS: Array<{
  pattern: RegExp;
  type: MenuiserieType;
  fixedVantaux?: number;
}> = [
  // Porte-fenêtre DOIT être avant fenêtre (plus spécifique)
  { pattern: /porte[- ]?fen[êe]tre/i, type: 'porte-fenetre' },
  // Châssis soufflet DOIT être avant châssis fixe (plus spécifique)
  { pattern: /ch[âa]ssis.*soufflet/i, type: 'chassis-soufflet', fixedVantaux: 1 },
  // Châssis fixe
  { pattern: /ch[âa]ssis\s*fixe/i, type: 'chassis-fixe', fixedVantaux: 0 },
  // Coulissant
  { pattern: /coulissant/i, type: 'coulissant' },
  // Fenêtre (pattern le plus général, en dernier)
  { pattern: /fen[êe]tre/i, type: 'fenetre' },
];

/**
 * Pattern pour extraire le nombre de vantaux
 */
const VANTAUX_PATTERN = /(\d+)\s*vanta/i;

/**
 * Parse le type de menuiserie et extrait le nombre de vantaux depuis le string du PDF
 *
 * @param typeString - La chaîne du type de menuiserie (ex: "Fenêtre 2 vantaux")
 * @returns L'objet avec le type et le nombre de vantaux
 *
 * @example
 * parseMenuiserieType("Fenêtre 2 vantaux")
 * // => { type: 'fenetre', nbVantaux: 2 }
 *
 * parseMenuiserieType("Châssis fixe en dormant")
 * // => { type: 'chassis-fixe', nbVantaux: 0 }
 */
export function parseMenuiserieType(typeString: string): ParsedMenuiserieType {
  // Valeur par défaut
  const defaultResult: ParsedMenuiserieType = {
    type: 'fenetre',
    nbVantaux: 1,
  };

  if (!typeString || typeString.trim() === '') {
    return defaultResult;
  }

  // Chercher le type correspondant
  let matchedType: MenuiserieType = 'fenetre';
  let fixedVantaux: number | undefined;

  for (const { pattern, type, fixedVantaux: fv } of TYPE_PATTERNS) {
    if (pattern.test(typeString)) {
      matchedType = type;
      fixedVantaux = fv;
      break;
    }
  }

  // Extraire le nombre de vantaux
  let nbVantaux: number;

  if (fixedVantaux !== undefined) {
    // Pour les types avec nombre fixe (châssis fixe = 0, châssis soufflet = 1)
    nbVantaux = fixedVantaux;
  } else {
    // Extraire depuis la chaîne
    const vantauxMatch = typeString.match(VANTAUX_PATTERN);
    nbVantaux = vantauxMatch ? parseInt(vantauxMatch[1], 10) : 1;
  }

  return {
    type: matchedType,
    nbVantaux,
  };
}
