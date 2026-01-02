'use client';

import { MenuiserieSVG } from './MenuiserieSVG';
import { DimensionInput } from './DimensionInput';
import { HabillageGroup } from './HabillageGroup';
import { ApplyToAllButton } from './ApplyToAllButton';
import { parseMenuiserieType } from '@/lib/svg/svg-utils';
import type { HabillageValue, Side, HabillageConfig } from '@/lib/validations/habillage';
import { HABILLAGES_PVC } from '@/lib/validations/habillage';
import { cn } from '@/lib/utils';

/**
 * @deprecated Utilisez SVGZone à la place. Ce composant sera supprimé dans une future version.
 * @see SVGZone pour le nouveau composant avec toggle habillages et layout amélioré
 *
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
  /** Callback pour "Appliquer Int à tous" */
  onApplyIntToAll?: () => void;
  /** Callback pour "Appliquer Ext à tous" */
  onApplyExtToAll?: () => void;
  /** Désactiver le bouton "Appliquer Int à tous" */
  disableApplyIntToAll?: boolean;
  /** Désactiver le bouton "Appliquer Ext à tous" */
  disableApplyExtToAll?: boolean;
  /** Afficher le champ Allège (défaut: true pour rétrocompatibilité) */
  showAllege?: boolean;
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * @deprecated Utilisez SVGZone à la place
 *
 * Éditeur SVG avec habillages positionnés spatialement autour du schéma
 *
 * Layout Desktop (Grid 3 colonnes):
 * ```
 *                    [Hab Haut]
 *  [Hauteur+HabG]     [SVG]      [HabD]
 *              [Largeur + Hab Bas]
 * ```
 *
 * Layout Mobile (Flex-col):
 * 1. Hab Haut
 * 2. SVG
 * 3. Hauteur + Hab Gauche
 * 4. Hab Droite
 * 5. Largeur + Hab Bas
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
  onApplyIntToAll,
  onApplyExtToAll,
  disableApplyIntToAll = true,
  disableApplyExtToAll = true,
  showAllege = true,
  className,
}: MenuiserieSVGEditorProps) {
  // Parser le type de menuiserie
  const parsed = parseMenuiserieType(typeMenuiserie || '');

  // Handler avec guard pour mode display-only
  const handleDimensionChange = (field: 'largeur' | 'hauteur' | 'hauteurAllege', value: string) => {
    onDimensionChange?.(field, value);
  };

  // Valeurs par défaut pour les habillages (null pour non sélectionné)
  const defaultHabillagesInt: Record<Side, HabillageValue | null> = {
    haut: null,
    bas: null,
    gauche: null,
    droite: null,
  };
  const defaultHabillagesExt: Record<Side, HabillageValue | null> = {
    haut: null,
    bas: null,
    gauche: null,
    droite: null,
  };

  const habInt = habillagesInterieurs || defaultHabillagesInt;
  const habExt = habillagesExterieurs || defaultHabillagesExt;

  // Helper to create HabillageGroup values for a side
  const getGroupValues = (side: Side) => ({
    interieur: habInt[side],
    exterieur: habExt[side],
  });

  // Helper to check if a side is highlighted
  const isIntHighlighted = (side: Side) => highlightedIntSides.has(side);
  const isExtHighlighted = (side: Side) => highlightedExtSides.has(side);

  return (
    <div className={cn('w-full', className)}>
      {/* Layout mobile: flex-col, desktop: grid 3 colonnes */}
      <div className="flex flex-col gap-3">

        {/* ROW 1: Habillages HAUT (centré) */}
        {showHabillages && (
          <div className="order-1 flex justify-center">
            <HabillageGroup
              side="haut"
              values={getGroupValues('haut')}
              onIntChange={(value) => onHabillageIntChange?.('haut', value)}
              onExtChange={(value) => onHabillageExtChange?.('haut', value)}
              options={habillageConfig}
              orientation="horizontal"
              highlightInt={isIntHighlighted('haut')}
              highlightExt={isExtHighlighted('haut')}
            />
          </div>
        )}

        {/* ROW 2: [Hauteur + Hab Gauche] | SVG | [Hab Droite] */}
        <div className="order-2 flex flex-col sm:flex-row gap-3 items-stretch">

          {/* Colonne gauche: Hauteur + Hab Gauche */}
          <div className="order-3 sm:order-1 flex flex-col gap-2 sm:w-auto">
            <DimensionInput
              label="Hauteur"
              name="hauteur"
              originalValue={originalDimensions?.hauteur}
              value={dimensions.hauteur}
              onChange={(v) => handleDimensionChange('hauteur', v)}
              unit="mm"
              position="right"
            />
            {showHabillages && (
              <HabillageGroup
                side="gauche"
                values={getGroupValues('gauche')}
                onIntChange={(value) => onHabillageIntChange?.('gauche', value)}
                onExtChange={(value) => onHabillageExtChange?.('gauche', value)}
                options={habillageConfig}
                orientation="vertical"
                highlightInt={isIntHighlighted('gauche')}
                highlightExt={isExtHighlighted('gauche')}
              />
            )}
          </div>

          {/* Centre: SVG */}
          <div className="order-2 flex-1 min-w-0">
            <div className="aspect-[4/3] w-full max-w-[200px] mx-auto bg-gray-50 rounded-lg p-3 flex items-center justify-center">
              <MenuiserieSVG
                type={parsed.type}
                nbVantaux={parsed.nbVantaux}
                className="max-w-full max-h-full"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">
              {typeMenuiserie || 'Type non spécifié'}
            </p>
          </div>

          {/* Colonne droite: Hab Droite */}
          {showHabillages && (
            <div className="order-4 sm:order-3 flex flex-col gap-2 sm:w-auto">
              <HabillageGroup
                side="droite"
                values={getGroupValues('droite')}
                onIntChange={(value) => onHabillageIntChange?.('droite', value)}
                onExtChange={(value) => onHabillageExtChange?.('droite', value)}
                options={habillageConfig}
                orientation="vertical"
                highlightInt={isIntHighlighted('droite')}
                highlightExt={isExtHighlighted('droite')}
              />
            </div>
          )}
        </div>

        {/* ROW 3: Largeur + Hab Bas + Allège */}
        <div className="order-5 flex flex-col sm:flex-row gap-3 items-start justify-center">
          <DimensionInput
            label="Largeur"
            name="largeur"
            originalValue={originalDimensions?.largeur}
            value={dimensions.largeur}
            onChange={(v) => handleDimensionChange('largeur', v)}
            unit="mm"
            position="top"
          />

          {showHabillages && (
            <HabillageGroup
              side="bas"
              values={getGroupValues('bas')}
              onIntChange={(value) => onHabillageIntChange?.('bas', value)}
              onExtChange={(value) => onHabillageExtChange?.('bas', value)}
              options={habillageConfig}
              orientation="horizontal"
              highlightInt={isIntHighlighted('bas')}
              highlightExt={isExtHighlighted('bas')}
            />
          )}

          {showAllege && (
            <DimensionInput
              label="Hauteur d'allège"
              name="hauteurAllege"
              originalValue={originalDimensions?.hauteurAllege}
              value={dimensions.hauteurAllege}
              onChange={(v) => handleDimensionChange('hauteurAllege', v)}
              unit="mm"
              position="bottom"
            />
          )}
        </div>

        {/* ROW 4: Boutons "Appliquer à tous" */}
        {showHabillages && (onApplyIntToAll || onApplyExtToAll) && (
          <div className="order-6 flex flex-col sm:flex-row gap-2 justify-center mt-2">
            {onApplyIntToAll && (
              <ApplyToAllButton
                type="interieur"
                onApply={onApplyIntToAll}
                disabled={disableApplyIntToAll}
              />
            )}
            {onApplyExtToAll && (
              <ApplyToAllButton
                type="exterieur"
                onApply={onApplyExtToAll}
                disabled={disableApplyExtToAll}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MenuiserieSVGEditor;
