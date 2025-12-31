'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { DimensionInputProps } from '@/lib/svg/types';
import { cn } from '@/lib/utils';

/**
 * Input pour la saisie d'une dimension avec placeholder depuis valeur originale
 *
 * @example
 * <DimensionInput
 *   label="Largeur"
 *   name="largeur"
 *   originalValue={1200}
 *   value={formData.largeur}
 *   onChange={(v) => setFormData({ ...formData, largeur: v })}
 *   unit="mm"
 * />
 */
export function DimensionInput({
  label,
  name,
  originalValue,
  value,
  onChange,
  unit = 'mm',
  position,
}: DimensionInputProps) {
  const placeholder = originalValue !== null && originalValue !== undefined
    ? String(originalValue)
    : '';

  return (
    <div
      className={cn(
        'flex flex-col gap-1',
        // Positionnement selon la position
        position === 'top' && 'items-center',
        position === 'bottom' && 'items-center',
        position === 'left' && 'items-end',
        position === 'right' && 'items-start'
      )}
    >
      <Label
        htmlFor={name}
        className="text-sm font-medium text-gray-700"
      >
        {label}
      </Label>
      <div className="relative flex items-center">
        <Input
          id={name}
          name={name}
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'h-12 w-24 text-center text-lg font-medium',
            'focus:ring-2 focus:ring-blue-500',
            // Touch-friendly
            'min-h-[44px]'
          )}
        />
        {unit && (
          <span className="ml-1 text-sm text-gray-500">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

export default DimensionInput;
