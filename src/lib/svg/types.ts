/**
 * Types pour la génération SVG de menuiseries
 * @see specs/002-svg-menuiserie-view/data-model.md
 * @see specs/003-habillages-svg-integration/data-model.md
 */

import type { HabillageValue, Side } from '@/lib/validations/habillage';

// Re-export pour compatibilité
export type { HabillageValue, Side };
export { HABILLAGE_VALUES, HABILLAGE_LABELS, SIDES, SIDE_LABELS } from '@/lib/validations/habillage';

/**
 * Types de menuiseries supportés pour la génération SVG
 */
export type MenuiserieType =
  | 'fenetre'
  | 'porte-fenetre'
  | 'coulissant'
  | 'chassis-fixe'
  | 'chassis-soufflet';

/**
 * Structure pour un côté d'habillage
 * @breaking v003 - Changed from number | null to HabillageValue | null
 */
export interface HabillagesSide {
  haut: HabillageValue | null;
  bas: HabillageValue | null;
  gauche: HabillageValue | null;
  droite: HabillageValue | null;
}

/**
 * Données des dimensions pour le formulaire
 */
export interface DimensionsData {
  largeur: number | null;
  hauteur: number | null;
  hauteurAllege: number | null;
}

/**
 * Props du composant de rendu SVG
 */
export interface MenuiserieSVGProps {
  /** Type de menuiserie pour sélectionner le template */
  type: MenuiserieType;
  /** Nombre de vantaux (0 pour fixe, 1-4 pour autres) */
  nbVantaux: number;
  /** Largeur du viewBox SVG (défaut: 200) */
  width?: number;
  /** Hauteur du viewBox SVG (défaut: 150) */
  height?: number;
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Résultat du parsing du type de menuiserie
 */
export interface ParsedMenuiserieType {
  type: MenuiserieType;
  nbVantaux: number;
}

/**
 * Props du composant éditeur complet (SVG + inputs)
 */
export interface MenuiserieSVGEditorProps {
  /** ID de la menuiserie (pour les mutations) */
  menuiserieId: string;
  /** Données originales du PDF */
  donneesOriginales: {
    typeMenuiserie: string;
    largeur?: number;
    hauteur?: number;
    hauteurAllege?: number;
    habillagesInterieurs?: Partial<HabillagesSide>;
    habillagesExterieurs?: Partial<HabillagesSide>;
  };
  /** Données modifiées (état actuel) */
  donneesModifiees?: {
    largeur?: number;
    hauteur?: number;
    hauteurAllege?: number;
    habillagesInterieurs?: Partial<HabillagesSide>;
    habillagesExterieurs?: Partial<HabillagesSide>;
  };
  /** Callback après sauvegarde réussie */
  onSave?: () => void;
}

/**
 * Props du composant DimensionInput
 */
export interface DimensionInputProps {
  /** Label du champ */
  label: string;
  /** Nom du champ pour le formulaire */
  name: string;
  /** Valeur originale (placeholder) */
  originalValue?: number | null;
  /** Valeur actuelle */
  value: string;
  /** Callback de changement */
  onChange: (value: string) => void;
  /** Unité (mm par défaut) */
  unit?: string;
  /** Position relative au SVG */
  position?: 'top' | 'right' | 'bottom' | 'left';
}

/**
 * Données du formulaire pour React Hook Form
 * @updated v003 - habillages utilisent maintenant HabillageValue | null
 */
export interface MenuiserieSVGFormData {
  largeur: string;
  hauteur: string;
  hauteurAllege: string;
  habillagesInterieurs: HabillagesSide;
  habillagesExterieurs: HabillagesSide;
}
