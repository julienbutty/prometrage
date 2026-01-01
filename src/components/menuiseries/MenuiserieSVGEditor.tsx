'use client';

import { MenuiserieSVG } from './MenuiserieSVG';
import { DimensionInput } from './DimensionInput';
import { HabillageSection } from './HabillageSection';
import { parseMenuiserieType } from '@/lib/svg/svg-utils';
import type { HabillageValue, Side, HabillageConfig } from '@/lib/validations/habillage';
import { HABILLAGES_PVC } from '@/lib/validations/habillage';
import { cn } from '@/lib/utils';

/**
 * Props pour le composant MenuiserieSVGEditor
 * Supporte deux modes:
 * 1. Controlled: onChange est fourni, le parent gère l'état
 * 2. Display-only: pas d'onChange, affiche juste le SVG et les valeurs
 */
interface MenuiserieSVGEditorProps {
  /** Type de menuiserie (string du PDF, ex: "Fenêtre 2 vantaux") */
  typeMenuiserie: string;
  /** Valeurs actuelles des dimensions */
  dimensions: {
    largeur: string;
    hauteur: string;
    hauteurAllege: string;
  };
  /** Valeurs originales (pour placeholders) */
  originalDimensions?: {
    largeur?: number;
    hauteur?: number;
    hauteurAllege?: number;
  };
  /** Callback quand une dimension change */
  onDimensionChange?: (field: 'largeur' | 'hauteur' | 'hauteurAllege', value: string) => void;
  /** Valeurs actuelles des habillages intérieurs */
  habillagesInterieurs?: Record<Side, HabillageValue | null>;
  /** Callback quand un habillage intérieur change */
  onHabillageIntChange?: (side: Side, value: HabillageValue) => void;
  /** Côtés intérieurs en animation highlight */
  highlightedIntSides?: Set<Side>;
  /** Valeurs actuelles des habillages extérieurs */
  habillagesExterieurs?: Record<Side, HabillageValue | null>;
  /** Callback quand un habillage extérieur change */
  onHabillageExtChange?: (side: Side, value: HabillageValue) => void;
  /** Côtés extérieurs en animation highlight */
  highlightedExtSides?: Set<Side>;
  /** Configuration des options d'habillage selon matériau/pose */
  habillageConfig?: HabillageConfig;
  /** Afficher les habillages (défaut: true) */
  showHabillages?: boolean;
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Éditeur SVG avec champs de saisie positionnés autour du schéma
 *
 * Layout Desktop (Grid):
 * ```
 *              [largeur]
 *             [  SVG  ] [hauteur]
 *              [allège ]
 * [habillages intérieurs]
 * [habillages extérieurs]
 * ```
 *
 * Layout Mobile (Flex-col):
 * - SVG en haut
 * - Champs dimensions
 * - Habillages intérieurs
 * - Habillages extérieurs
 */
export function MenuiserieSVGEditor({
  typeMenuiserie,
  dimensions,
  originalDimensions,
  onDimensionChange,
  habillagesInterieurs,
  onHabillageIntChange,
  highlightedIntSides = new Set(),
  habillagesExterieurs,
  onHabillageExtChange,
  highlightedExtSides = new Set(),
  habillageConfig = HABILLAGES_PVC,
  showHabillages = true,
  className,
}: MenuiserieSVGEditorProps) {
  // Parser le type de menuiserie
  const parsed = parseMenuiserieType(typeMenuiserie || '');

  // Handler avec guard pour mode display-only
  const handleDimensionChange = (field: 'largeur' | 'hauteur' | 'hauteurAllege', value: string) => {
    onDimensionChange?.(field, value);
  };

  // Valeurs par défaut pour les habillages (null pour non sélectionné)
  const defaultHabillages: Record<Side, HabillageValue | null> = {
    haut: null,
    bas: null,
    gauche: null,
    droite: null,
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Layout mobile: flex-col, desktop: grid */}
      <div
        className={cn(
          // Mobile: colonne verticale
          'flex flex-col gap-4',
          // Desktop: grille avec SVG au centre
          'sm:grid sm:grid-cols-[auto_1fr_auto] sm:grid-rows-[auto_1fr_auto]',
          'sm:gap-4 sm:items-center sm:justify-items-center'
        )}
      >
        {/* Largeur - Position: haut centre */}
        <div className="sm:col-start-2 sm:row-start-1 sm:justify-self-center">
          <DimensionInput
            label="Largeur"
            name="largeur"
            originalValue={originalDimensions?.largeur}
            value={dimensions.largeur}
            onChange={(v) => handleDimensionChange('largeur', v)}
            unit="mm"
            position="top"
          />
        </div>

        {/* SVG - Position: centre */}
        <div className="sm:col-start-2 sm:row-start-2 w-full max-w-md mx-auto sm:mx-0">
          <div className="aspect-[4/3] w-full bg-gray-50 rounded-lg p-4 flex items-center justify-center">
            <MenuiserieSVG
              type={parsed.type}
              nbVantaux={parsed.nbVantaux}
              className="max-w-full max-h-full"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {typeMenuiserie || 'Type non spécifié'}
          </p>
        </div>

        {/* Hauteur - Position: droite centre */}
        <div className="sm:col-start-3 sm:row-start-2 sm:justify-self-start">
          <DimensionInput
            label="Hauteur"
            name="hauteur"
            originalValue={originalDimensions?.hauteur}
            value={dimensions.hauteur}
            onChange={(v) => handleDimensionChange('hauteur', v)}
            unit="mm"
            position="right"
          />
        </div>

        {/* Allège - Position: bas centre */}
        <div className="sm:col-start-2 sm:row-start-3 sm:justify-self-center">
          <DimensionInput
            label="Hauteur d'allège"
            name="hauteurAllege"
            originalValue={originalDimensions?.hauteurAllege}
            value={dimensions.hauteurAllege}
            onChange={(v) => handleDimensionChange('hauteurAllege', v)}
            unit="mm"
            position="bottom"
          />
        </div>
      </div>

      {/* Habillages - Section séparée sous le SVG */}
      {showHabillages && (
        <div className="mt-6 space-y-4">
          <HabillageSection
            type="interieur"
            values={habillagesInterieurs || defaultHabillages}
            onChange={(side, value) => onHabillageIntChange?.(side, value)}
            options={habillageConfig.interieurs}
            highlightedSides={highlightedIntSides}
          />
          <HabillageSection
            type="exterieur"
            values={habillagesExterieurs || defaultHabillages}
            onChange={(side, value) => onHabillageExtChange?.(side, value)}
            options={habillageConfig.exterieurs}
            highlightedSides={highlightedExtSides}
          />
        </div>
      )}
    </div>
  );
}

export default MenuiserieSVGEditor;
