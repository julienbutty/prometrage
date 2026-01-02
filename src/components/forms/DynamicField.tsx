"use client";

import { FieldWithDiff } from "@/components/forms/FieldWithDiff";
import { ComboboxField } from "@/components/forms/ComboboxField";
import { SelectField } from "@/components/forms/SelectField";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FieldConfig } from "@/lib/forms/config-loader";

export interface DynamicFieldProps {
  /** Clé du champ (ex: "pack", "couleurInt") */
  fieldKey: string;
  /** Configuration du champ (type, options, etc.) */
  config: FieldConfig;
  /** Valeur actuelle (modifiée) */
  value: any;
  /** Valeur originale du PDF */
  originalValue: any;
  /** Callback de changement */
  onChange: (value: any) => void;
}

/**
 * Composant router intelligent qui affiche le bon type de champ
 *
 * Logique de routing :
 * 1. type="number" → FieldWithDiff (avec calcul d'écart)
 * 2. type="combobox" → ComboboxField (recherche + saisie libre)
 * 3. type="select" → SelectField (select simple)
 * 4. type="text" → Input texte
 *
 * Fallback automatique :
 * - Si type="select" ou "combobox" MAIS valeur hors enum ET originalValue présente
 *   → Fallback vers Input texte (valeur extraite du PDF hors enum)
 *
 * @example
 * ```tsx
 * const config = loadFormConfig("ALU_NEUF_FENETRE");
 *
 * <DynamicField
 *   fieldKey="pack"
 *   config={config.pack}
 *   value={formData.pack}
 *   originalValue={donneesOriginales.pack}
 *   onChange={(value) => setFormData({ ...formData, pack: value })}
 * />
 * ```
 */
export function DynamicField({
  fieldKey,
  config,
  value,
  originalValue,
  onChange,
}: DynamicFieldProps) {
  // Normalise les valeurs undefined/null en chaîne vide
  const normalizedValue = value ?? "";
  const normalizedOriginalValue = originalValue ?? "";

  // Vérifie si la valeur est dans l'enum (pour select/combobox)
  const isValueInEnum =
    config.options && config.options.includes(String(normalizedValue));

  /**
   * Condition de fallback vers Input texte readonly :
   * - Type select OU combobox SANS allowCustom
   * - Valeur présente ET hors enum
   * - originalValue présent (= donnée du PDF, pas saisie utilisateur)
   *
   * NOTE: Les Combobox avec allowCustom=true ne font PAS de fallback
   * car ils gèrent nativement les valeurs custom via saisie libre
   */
  const shouldFallbackToText =
    normalizedValue !== "" &&
    !isValueInEnum &&
    normalizedOriginalValue !== "" &&
    (config.type === "select" || (config.type === "combobox" && !config.allowCustom));

  // FALLBACK : Input texte si valeur hors enum
  if (shouldFallbackToText) {
    return (
      <div className="space-y-2">
        <Label htmlFor={fieldKey} className="text-sm font-medium">
          {config.label}
        </Label>
        <div className="text-xs text-muted-foreground">
          Valeur PDF hors enum (affichage texte)
        </div>
        <Input
          id={fieldKey}
          type="text"
          value={normalizedValue}
          onChange={(e) => onChange(e.target.value)}
          className="h-11"
          readOnly
        />
      </div>
    );
  }

  // ROUTING selon le type
  switch (config.type) {
    case "number":
      return (
        <FieldWithDiff
          id={fieldKey}
          label={config.label}
          value={normalizedValue}
          originalValue={parseFloat(String(normalizedOriginalValue)) || 0}
          onChange={onChange}
          type="number"
          unit={config.unit}
        />
      );

    case "combobox":
      return (
        <ComboboxField
          id={fieldKey}
          label={config.label}
          value={String(normalizedValue)}
          originalValue={String(normalizedOriginalValue)}
          options={config.options || []}
          onChange={onChange}
          allowCustom={config.allowCustom}
          placeholder={config.placeholder}
        />
      );

    case "select":
      return (
        <SelectField
          id={fieldKey}
          label={config.label}
          value={String(normalizedValue)}
          originalValue={String(normalizedOriginalValue)}
          options={config.options || []}
          onChange={onChange}
        />
      );

    case "text":
    default:
      return (
        <div className="space-y-2">
          <Label htmlFor={fieldKey} className="text-sm font-medium">
            {config.label}
          </Label>
          <Input
            id={fieldKey}
            type="text"
            value={String(normalizedValue)}
            onChange={(e) => onChange(e.target.value)}
            placeholder={config.placeholder}
            className="h-11"
          />
        </div>
      );
  }
}
