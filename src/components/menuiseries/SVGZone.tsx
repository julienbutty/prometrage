'use client';

/**
 * Zone SVG centrale avec dimensions positionnées spatialement
 * et habillages affichés via toggle
 *
 * Layout:
 * - Mobile: Flex column (Toggle → SVG → Dimensions → Habillages)
 * - Tablet: CSS Grid with spatial positioning
 *
 * @see specs/006-svg-centric-redesign/data-model.md
 */

import { useState } from 'react';
import { MenuiserieSVG } from './MenuiserieSVG';
import { DimensionInput } from './DimensionInput';
import { HabillageGroup } from './HabillageGroup';
import { HabillagesToggle } from './HabillagesToggle';
import { parseMenuiserieType } from '@/lib/svg/svg-utils';
import {
  type HabillageValue,
  type Side,
  type HabillageConfig,
  SIDES,
} from '@/lib/validations/habillage';
import { cn } from '@/lib/utils';

type DimensionField = 'largeur' | 'hauteur' | 'hauteurAllege';

export interface SVGZoneProps {
  /** Type de menuiserie (ex: "fenetre-2-vantaux") */
  typeMenuiserie: string;

  /** Valeurs actuelles des dimensions */
  dimensions: {
    largeur: string;
    hauteur: string;
    hauteurAllege: string;
  };

  /** Valeurs originales pour placeholder */
  originalDimensions?: {
    largeur?: number;
    hauteur?: number;
    hauteurAllege?: number;
  };

  /** Callback quand une dimension change */
  onDimensionChange?: (field: DimensionField, value: string) => void;

  /** Afficher le champ allège */
  showAllege?: boolean;

  // Habillages props
  /**
   * Afficher les habillages (mode contrôlé)
   * Si non fourni, le composant gère son propre état (mode non-contrôlé)
   */
  showHabillages?: boolean;

  /**
   * Callback pour toggle habillages (mode contrôlé)
   * Si non fourni avec showHabillages, le composant gère son propre toggle
   */
  onToggleHabillages?: () => void;

  /** Valeurs des habillages intérieurs par côté */
  habillagesInterieurs?: Record<Side, HabillageValue | null>;

  /** Valeurs des habillages extérieurs par côté */
  habillagesExterieurs?: Record<Side, HabillageValue | null>;

  /** Callback quand un habillage intérieur change */
  onHabillageIntChange?: (side: Side, value: HabillageValue) => void;

  /** Callback quand un habillage extérieur change */
  onHabillageExtChange?: (side: Side, value: HabillageValue) => void;

  /** Configuration des options habillages */
  habillageConfig?: HabillageConfig;

  /** Côtés intérieurs avec highlight */
  highlightedIntSides?: Set<Side>;

  /** Côtés extérieurs avec highlight */
  highlightedExtSides?: Set<Side>;

  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Zone SVG centrale avec dimensions positionnées spatialement
 *
 * Features:
 * - SVG central prominent (≥50% viewport visuel)
 * - Dimensions positionnées spatialement (largeur bottom, hauteur right, allège below)
 * - Habillages cachés par défaut, révélés via toggle
 * - Mobile-first: Flex column par défaut
 * - Tablet: CSS Grid avec positionnement spatial
 * - Touch-friendly: 44px minimum sur tous les inputs
 */
export function SVGZone({
  typeMenuiserie,
  dimensions,
  originalDimensions,
  onDimensionChange,
  showAllege = true,
  showHabillages: showHabillagesProp,
  onToggleHabillages,
  habillagesInterieurs,
  habillagesExterieurs,
  onHabillageIntChange,
  onHabillageExtChange,
  habillageConfig,
  highlightedIntSides,
  highlightedExtSides,
  className,
}: SVGZoneProps) {
  const { type, nbVantaux, typeOuvrant } = parseMenuiserieType(typeMenuiserie);

  // Mode non-contrôlé: gestion interne de l'état du toggle
  const [internalShowHabillages, setInternalShowHabillages] = useState(false);

  // Détermine si on est en mode contrôlé ou non-contrôlé
  const isControlled = showHabillagesProp !== undefined;
  const showHabillages = isControlled ? showHabillagesProp : internalShowHabillages;

  const handleDimensionChange = (field: DimensionField) => (value: string) => {
    onDimensionChange?.(field, value);
  };

  const handleToggle = () => {
    if (isControlled) {
      onToggleHabillages?.();
    } else {
      setInternalShowHabillages(!internalShowHabillages);
    }
  };

  // Default habillage config if not provided
  const defaultConfig: HabillageConfig = habillageConfig ?? {
    interieurs: [],
    exterieurs: [],
  };

  return (
    <div
      data-testid="svg-zone"
      className={cn(
        // Mobile: Flex column
        'flex flex-col gap-4 w-full',
        // Tablet: CSS Grid with spatial positioning
        'md:grid md:grid-cols-[1fr_auto] md:grid-rows-[auto_1fr_auto_auto] md:gap-4',
        className
      )}
    >
      {/* Toggle button - always at top */}
      <div className="flex justify-center md:col-span-2 md:row-start-1">
        <HabillagesToggle
          isOpen={showHabillages}
          onToggle={handleToggle}
          disabled={!habillageConfig}
        />
      </div>

      {/* SVG Central - Mobile: after toggle, Tablet: spans the main area */}
      <div
        className={cn(
          'flex items-center justify-center',
          // Mobile: min height for prominence
          'min-h-[200px]',
          // Tablet: place in grid
          'md:col-start-1 md:row-start-2 md:row-span-1'
        )}
      >
        <MenuiserieSVG
          type={type}
          nbVantaux={nbVantaux}
          typeOuvrant={typeOuvrant}
          width={300}
          height={250}
          className="max-w-full h-auto"
        />
      </div>

      {/* Hauteur - Mobile: after SVG, Tablet: right side */}
      <div
        className={cn(
          'flex justify-center',
          // Tablet: place on the right of SVG
          'md:col-start-2 md:row-start-2 md:flex md:items-center'
        )}
      >
        <DimensionInput
          label="Hauteur"
          name="hauteur"
          originalValue={originalDimensions?.hauteur}
          value={dimensions.hauteur}
          onChange={handleDimensionChange('hauteur')}
          unit="mm"
          position="right"
        />
      </div>

      {/* Largeur - Mobile: after Hauteur, Tablet: bottom center */}
      <div
        className={cn(
          'flex justify-center',
          // Tablet: bottom row, centered
          'md:col-start-1 md:row-start-3'
        )}
      >
        <DimensionInput
          label="Largeur"
          name="largeur"
          originalValue={originalDimensions?.largeur}
          value={dimensions.largeur}
          onChange={handleDimensionChange('largeur')}
          unit="mm"
          position="bottom"
        />
      </div>

      {/* Allège - Mobile: after Largeur, Tablet: below largeur */}
      {showAllege && (
        <div
          className={cn(
            'flex justify-center',
            // Tablet: bottom right
            'md:col-start-1 md:row-start-4'
          )}
        >
          <DimensionInput
            label="Allège"
            name="hauteurAllege"
            originalValue={originalDimensions?.hauteurAllege}
            value={dimensions.hauteurAllege}
            onChange={handleDimensionChange('hauteurAllege')}
            unit="mm"
            position="bottom"
          />
        </div>
      )}

      {/* Habillages - conditionally visible with animation */}
      {showHabillages && habillagesInterieurs && habillagesExterieurs && (
        <div
          className={cn(
            'flex flex-col gap-4',
            // Animation
            'transition-all duration-200 ease-in-out',
            // Mobile: full width
            'w-full',
            // Tablet: span both columns, below dimensions
            'md:col-span-2 md:row-start-5'
          )}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {SIDES.map((side) => (
              <HabillageGroup
                key={side}
                side={side}
                values={{
                  interieur: habillagesInterieurs[side],
                  exterieur: habillagesExterieurs[side],
                }}
                onIntChange={(value) => onHabillageIntChange?.(side, value)}
                onExtChange={(value) => onHabillageExtChange?.(side, value)}
                options={defaultConfig}
                orientation="vertical"
                highlightInt={highlightedIntSides?.has(side)}
                highlightExt={highlightedExtSides?.has(side)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SVGZone;
