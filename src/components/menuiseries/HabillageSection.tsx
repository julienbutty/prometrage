'use client';

/**
 * Composant de section pour les habillages (intérieurs ou extérieurs)
 * Affiche les 4 sélecteurs et gère la propagation
 * Les options sont dynamiques selon le matériau et type de pose
 *
 * @see specs/003-habillages-svg-integration/spec.md
 * @see docs/FEATURES/MENUISERIES/MENUISERIES_GAMME_*.md
 */

import { HabillageSelect } from './HabillageSelect';
import { SIDES, type HabillageValue, type Side, type HabillageOption } from '@/lib/validations/habillage';
import { cn } from '@/lib/utils';

export interface HabillageSectionProps {
  /** Type de section: intérieur (bleu) ou extérieur (orange) */
  type: 'interieur' | 'exterieur';
  /** Valeurs actuelles pour les 4 côtés */
  values: Record<Side, HabillageValue | null>;
  /** Callback quand une valeur change */
  onChange: (side: Side, value: HabillageValue) => void;
  /** Options d'habillage disponibles (dépend du matériau/pose) */
  options: HabillageOption[];
  /** Côtés actuellement en animation highlight */
  highlightedSides?: Set<Side>;
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Section de sélection des habillages pour 4 côtés
 *
 * Features:
 * - Distinction visuelle int/ext (bleu/orange)
 * - Grid 2x2 sur mobile, 1x4 sur desktop
 * - Support de l'animation highlight
 */
export function HabillageSection({
  type,
  values,
  onChange,
  options,
  highlightedSides = new Set(),
  className,
}: HabillageSectionProps) {
  const isInterieur = type === 'interieur';
  const title = isInterieur ? 'Habillages intérieurs' : 'Habillages extérieurs';

  // Couleurs selon le type
  const borderColor = isInterieur ? 'border-blue-500' : 'border-orange-500';
  const titleColor = isInterieur ? 'text-blue-700' : 'text-orange-700';

  return (
    <div
      data-testid="habillage-section"
      className={cn(
        'border-l-4 pl-4 py-2',
        borderColor,
        className
      )}
    >
      <h4 className={cn('text-sm font-semibold mb-3', titleColor)}>
        {title}
      </h4>

      {/* Grid: 2x2 sur mobile, 4 colonnes sur desktop */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SIDES.map((side) => (
          <HabillageSelect
            key={side}
            side={side}
            value={values[side]}
            onChange={(value) => onChange(side, value)}
            options={options}
            isHighlighted={highlightedSides.has(side)}
          />
        ))}
      </div>
    </div>
  );
}

export default HabillageSection;
