'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { HabillageInputsProps, HabillagesSide } from '@/lib/svg/types';
import { cn } from '@/lib/utils';

const SIDES: Array<{ key: keyof HabillagesSide; label: string }> = [
  { key: 'haut', label: 'Haut' },
  { key: 'bas', label: 'Bas' },
  { key: 'gauche', label: 'Gauche' },
  { key: 'droite', label: 'Droite' },
];

/**
 * Groupe de 4 inputs pour les habillages (intérieurs ou extérieurs)
 *
 * @example
 * <HabillageInputs
 *   type="interieur"
 *   originalValues={{ haut: 50, bas: 50, gauche: 60, droite: 60 }}
 *   values={{ haut: '50', bas: '', gauche: '', droite: '' }}
 *   onChange={(side, value) => handleChange(side, value)}
 * />
 */
export function HabillageInputs({
  type,
  originalValues,
  values,
  onChange,
}: HabillageInputsProps) {
  const title = type === 'interieur' ? 'Habillages intérieurs' : 'Habillages extérieurs';

  return (
    <div className="w-full">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">
        {title}
      </h4>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SIDES.map(({ key, label }) => {
          const originalValue = originalValues?.[key];
          const placeholder = originalValue !== null && originalValue !== undefined
            ? String(originalValue)
            : '';

          return (
            <div key={key} className="flex flex-col gap-1">
              <Label
                htmlFor={`${type}-${key}`}
                className="text-xs font-medium text-gray-600"
              >
                {label}
              </Label>
              <div className="relative flex items-center">
                <Input
                  id={`${type}-${key}`}
                  name={`${type}-${key}`}
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={values[key]}
                  onChange={(e) => onChange(key, e.target.value)}
                  placeholder={placeholder}
                  className={cn(
                    'h-11 text-center text-base',
                    'focus:ring-2 focus:ring-blue-500',
                    // Touch-friendly
                    'min-h-[44px]'
                  )}
                />
                <span className="ml-1 text-xs text-gray-400">mm</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default HabillageInputs;
