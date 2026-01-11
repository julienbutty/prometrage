import type { MenuiserieType, ParsedMenuiserieType, TypeOuvrant } from './types';

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
 * Pattern pour détecter oscillo-battant
 */
const OSCILLO_BATTANT_PATTERN = /oscillo[- ]?battant/i;

/**
 * Pattern pour détecter soufflet (ouverture vers l'intérieur par le haut)
 */
const SOUFFLET_PATTERN = /soufflet/i;

/**
 * Parse le type de menuiserie et extrait le nombre de vantaux depuis le string du PDF
 *
 * @param typeString - La chaîne du type de menuiserie (ex: "Fenêtre 2 vantaux")
 * @returns L'objet avec le type, le nombre de vantaux, et le type d'ouverture
 *
 * @example
 * parseMenuiserieType("Fenêtre 2 vantaux")
 * // => { type: 'fenetre', nbVantaux: 2, typeOuvrant: 'battant', isOscilloBattant: false }
 *
 * parseMenuiserieType("Fenêtre 1 vantail oscillo-battant")
 * // => { type: 'fenetre', nbVantaux: 1, typeOuvrant: 'oscillo-battant', isOscilloBattant: true }
 *
 * parseMenuiserieType("Châssis fixe en dormant")
 * // => { type: 'chassis-fixe', nbVantaux: 0, typeOuvrant: 'fixe', isOscilloBattant: false }
 */
export function parseMenuiserieType(typeString: string): ParsedMenuiserieType {
  // Valeur par défaut
  const defaultResult: ParsedMenuiserieType = {
    type: 'fenetre',
    nbVantaux: 1,
    typeOuvrant: 'battant',
    isOscilloBattant: false,
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

  // Détecter le type d'ouverture
  let typeOuvrant: TypeOuvrant = 'battant';
  let isOscilloBattant = false;

  if (matchedType === 'chassis-fixe') {
    typeOuvrant = 'fixe';
  } else if (matchedType === 'coulissant') {
    typeOuvrant = 'coulissant';
  } else if (matchedType === 'chassis-soufflet') {
    typeOuvrant = 'soufflet';
  } else if (OSCILLO_BATTANT_PATTERN.test(typeString)) {
    typeOuvrant = 'oscillo-battant';
    isOscilloBattant = true;
  } else if (SOUFFLET_PATTERN.test(typeString)) {
    typeOuvrant = 'soufflet';
  }

  return {
    type: matchedType,
    nbVantaux,
    typeOuvrant,
    isOscilloBattant,
  };
}
