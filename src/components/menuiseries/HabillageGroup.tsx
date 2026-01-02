'use client';

/**
 * Composant de groupe d'habillages (Int + Ext) pour un côté
 * Regroupe les sélecteurs intérieur et extérieur avec labels distincts
 *
 * @see specs/005-svg-habillages-redesign/spec.md (US1, US2)
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  SIDE_LABELS,
  PILL_STYLES,
  type HabillageValue,
  type Side,
  type HabillageConfig,
} from '@/lib/validations/habillage';
import { cn } from '@/lib/utils';

export interface HabillageGroupValues {
  interieur: HabillageValue | null;
  exterieur: HabillageValue | null;
}

export interface HabillageGroupProps {
  /** Côté de la menuiserie (haut, bas, gauche, droite) */
  side: Side;
  /** Valeurs actuelles (intérieur et extérieur) */
  values: HabillageGroupValues;
  /** Callback quand la valeur intérieur change */
  onIntChange: (value: HabillageValue) => void;
  /** Callback quand la valeur extérieur change */
  onExtChange: (value: HabillageValue) => void;
  /** Configuration des options (interieurs et exterieurs) */
  options: HabillageConfig;
  /** Orientation du groupe (vertical = stacked, horizontal = side by side) */
  orientation?: 'vertical' | 'horizontal';
  /** Highlight sur le sélecteur intérieur */
  highlightInt?: boolean;
  /** Highlight sur le sélecteur extérieur */
  highlightExt?: boolean;
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Groupe d'habillages pour un côté de la menuiserie
 *
 * Features:
 * - Affiche Int + Ext pour un côté
 * - Labels distincts avec couleurs (bleu/orange)
 * - Support orientation verticale/horizontale
 * - Touch-friendly (min 44px height - Apple HIG)
 * - Animation highlight individuelle
 */
export function HabillageGroup({
  side,
  values,
  onIntChange,
  onExtChange,
  options,
  orientation = 'vertical',
  highlightInt = false,
  highlightExt = false,
  className,
}: HabillageGroupProps) {
  const sideLabel = SIDE_LABELS[side];
  const intStyles = PILL_STYLES.interieur;
  const extStyles = PILL_STYLES.exterieur;

  // Find label for current value
  const getLabel = (value: HabillageValue | null, optionsList: { value: string; label: string }[]) => {
    if (!value) return null;
    const option = optionsList.find(o => o.value === value);
    return option?.label ?? value;
  };

  return (
    <div
      data-testid="habillage-group"
      className={cn(
        'flex gap-2',
        orientation === 'vertical' ? 'flex-col' : 'flex-row',
        className
      )}
    >
      {/* Side label */}
      <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
        {sideLabel}
      </div>

      {/* Intérieur selector */}
      <div className="flex flex-col gap-1">
        <Label
          htmlFor={`habillage-${side}-int`}
          className={cn('text-xs font-medium', intStyles.text)}
        >
          Intérieur
        </Label>
        <Select
          value={values.interieur ?? undefined}
          onValueChange={(val) => onIntChange(val as HabillageValue)}
        >
          <SelectTrigger
            id={`habillage-${side}-int`}
            aria-label={`Habillage ${sideLabel} intérieur`}
            className={cn(
              // Base styles
              'w-full min-h-[44px] text-sm',
              // Touch-friendly (Apple HIG 44px)
              'h-11',
              // Border color for Int
              intStyles.border,
              // Transition pour highlight
              'transition-all duration-300',
              // Highlight animation
              highlightInt && 'ring-2 ring-blue-400 bg-blue-50'
            )}
          >
            <SelectValue placeholder="Sélectionner">
              {getLabel(values.interieur, options.interieurs)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {options.interieurs.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="min-h-[44px] text-sm"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Extérieur selector */}
      <div className="flex flex-col gap-1">
        <Label
          htmlFor={`habillage-${side}-ext`}
          className={cn('text-xs font-medium', extStyles.text)}
        >
          Extérieur
        </Label>
        <Select
          value={values.exterieur ?? undefined}
          onValueChange={(val) => onExtChange(val as HabillageValue)}
        >
          <SelectTrigger
            id={`habillage-${side}-ext`}
            aria-label={`Habillage ${sideLabel} extérieur`}
            className={cn(
              // Base styles
              'w-full min-h-[44px] text-sm',
              // Touch-friendly (Apple HIG 44px)
              'h-11',
              // Border color for Ext
              extStyles.border,
              // Transition pour highlight
              'transition-all duration-300',
              // Highlight animation
              highlightExt && 'ring-2 ring-orange-400 bg-orange-50'
            )}
          >
            <SelectValue placeholder="Sélectionner">
              {getLabel(values.exterieur, options.exterieurs)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {options.exterieurs.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="min-h-[44px] text-sm"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default HabillageGroup;
