'use client';

/**
 * Bouton "Appliquer à tous" pour habillages
 * Applique la première valeur non-null à tous les côtés
 *
 * @see specs/005-svg-habillages-redesign/spec.md (US5)
 */

import { Button } from '@/components/ui/button';
import { PILL_STYLES, type HabillageVariant } from '@/lib/validations/habillage';
import { cn } from '@/lib/utils';

export interface ApplyToAllButtonProps {
  /** Type d'habillage (interieur = bleu, exterieur = orange) */
  type: HabillageVariant;
  /** Callback quand le bouton est cliqué */
  onApply: () => void;
  /** Désactive le bouton si true */
  disabled?: boolean;
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Bouton pour appliquer la première valeur à tous les côtés
 *
 * Features:
 * - Style coloré selon le type (bleu/orange)
 * - Touch-friendly (min 40px height)
 * - État disabled avec opacité réduite
 */
export function ApplyToAllButton({
  type,
  onApply,
  disabled = false,
  className,
}: ApplyToAllButtonProps) {
  const styles = PILL_STYLES[type];
  const label = type === 'interieur' ? 'Appliquer Int à tous' : 'Appliquer Ext à tous';

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onApply}
      disabled={disabled}
      className={cn(
        // Base styles
        'min-h-[40px] h-10 px-4 text-sm font-medium',
        // Variant colors
        styles.border,
        styles.text,
        // Hover effect
        'hover:' + styles.background,
        // Transition
        'transition-colors duration-200',
        // Disabled state handled by Button component
        className
      )}
    >
      {label}
    </Button>
  );
}

export default ApplyToAllButton;
