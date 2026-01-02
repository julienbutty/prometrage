'use client';

/**
 * Composant de sélection d'habillage individuel
 * Affiche un dropdown avec les valeurs d'habillage possibles
 * Les options sont dynamiques selon le matériau et type de pose
 *
 * @see specs/003-habillages-svg-integration/spec.md
 * @see docs/FEATURES/MENUISERIES/MENUISERIES_GAMME_*.md
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
  type HabillageOption,
  type HabillageVariant,
} from '@/lib/validations/habillage';
import { cn } from '@/lib/utils';

export interface HabillageSelectProps {
  /** Côté de la menuiserie (haut, bas, gauche, droite) */
  side: Side;
  /** Valeur actuelle (null si non sélectionnée) */
  value: HabillageValue | null;
  /** Callback quand la valeur change */
  onChange: (value: HabillageValue) => void;
  /** Options d'habillage disponibles (dépend du matériau/pose) */
  options: HabillageOption[];
  /** Variant pour le style (interieur = bleu, exterieur = orange) */
  variant?: HabillageVariant;
  /** Affiche l'animation de highlight */
  isHighlighted?: boolean;
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Sélecteur d'habillage pour un côté de la menuiserie
 *
 * Features:
 * - Touch-friendly (min 44px height)
 * - Animation highlight pour feedback de propagation
 * - Labels accessibles
 */
export function HabillageSelect({
  side,
  value,
  onChange,
  options,
  variant,
  isHighlighted = false,
  className,
}: HabillageSelectProps) {
  const sideLabel = SIDE_LABELS[side];
  const styles = variant ? PILL_STYLES[variant] : null;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <Label
        htmlFor={`habillage-${side}`}
        className="text-xs font-medium text-gray-600"
      >
        {sideLabel}
      </Label>
      <Select
        value={value ?? undefined}
        onValueChange={(val) => onChange(val as HabillageValue)}
      >
        <SelectTrigger
          id={`habillage-${side}`}
          aria-label={`Habillage ${sideLabel}`}
          className={cn(
            // Base styles
            'w-full min-h-[40px] text-sm',
            // Touch-friendly
            'h-11',
            // Transition pour highlight
            'transition-all duration-300',
            // Highlight animation
            isHighlighted && [
              'ring-2 ring-blue-400 bg-blue-50',
            ]
          )}
        >
          <SelectValue placeholder="Sélectionner" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
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
  );
}

export default HabillageSelect;
