"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export interface SelectFieldProps {
  /** ID unique du champ */
  id: string;
  /** Label affiché au-dessus du champ */
  label: string;
  /** Valeur actuelle (modifiée) */
  value: string;
  /** Valeur originale du PDF (optionnel) */
  originalValue?: string;
  /** Liste des options disponibles */
  options: string[];
  /** Callback appelé lors du changement de valeur */
  onChange: (value: string) => void;
  /** Mode compact - masque le sous-label PDF pour alignement */
  compact?: boolean;
}

/**
 * Composant Select simple pour champs à choix limités
 *
 * Utilisé pour les champs avec peu d'options (pack, gamme, etc.)
 * Plus simple que ComboboxField (pas de recherche)
 *
 * @example
 * ```tsx
 * <SelectField
 *   id="pack"
 *   label="Pack"
 *   value={formData.pack}
 *   originalValue={donneesOriginales.pack}
 *   options={["Tradition", "Confort", "Initial"]}
 *   onChange={(value) => handleChange("pack", value)}
 * />
 * ```
 */
export function SelectField({
  id,
  label,
  value,
  originalValue,
  options,
  onChange,
  compact = false,
}: SelectFieldProps) {
  // Détecte si la valeur a été modifiée par rapport au PDF
  const isModified = value !== originalValue && value !== "";

  return (
    <div className="min-w-0 space-y-2">
      {/* Label et badge "Modifié" */}
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        {isModified && (
          <Badge variant="default" className="text-xs">
            Modifié
          </Badge>
        )}
      </div>

      {/* Valeur PDF originale - masquée en mode compact */}
      {originalValue && !compact && (
        <div className="text-xs text-muted-foreground">
          PDF: <span className="font-medium">{originalValue}</span>
        </div>
      )}

      {/* Select */}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full h-11">
          <SelectValue placeholder="Sélectionner..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option} className="h-11">
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
