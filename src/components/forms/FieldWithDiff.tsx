import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

interface FieldWithDiffProps {
  id: string;
  label: string;
  value: string | number;
  originalValue: number;
  onChange: (value: string) => void;
  type?: "number" | "text";
  placeholder?: string;
  unit?: string;
}

export function FieldWithDiff({
  id,
  label,
  value,
  originalValue,
  onChange,
  type = "number",
  placeholder,
  unit = "mm",
}: FieldWithDiffProps) {
  // Calculate live ecart
  const stringValue = String(value).trim();
  const numericValue = type === "number" && stringValue !== "" ? parseFloat(stringValue) : null;
  const hasValue = numericValue !== null && !isNaN(numericValue);
  const isZeroValue = hasValue && numericValue === 0;
  const difference = hasValue ? numericValue - (originalValue ?? 0) : 0;
  const pourcentage = hasValue && originalValue && originalValue > 0
    ? (difference / originalValue) * 100
    : 0;

  // Determine niveau
  const absPourcentage = Math.abs(pourcentage);
  const niveau: "identique" | "faible" | "moyen" | "eleve" =
    difference === 0 ? "identique"
    : absPourcentage < 5 ? "faible"
    : absPourcentage < 10 ? "moyen"
    : "eleve";

  // Badge variants
  const badgeVariants = {
    identique: "default" as const,
    faible: "secondary" as const,
    moyen: "secondary" as const,
    eleve: "destructive" as const,
  };

  // Badge colors (for custom styling)
  const badgeColors = {
    identique: "bg-green-100 text-green-800 border-green-300",
    faible: "bg-blue-100 text-blue-800 border-blue-300",
    moyen: "bg-orange-100 text-orange-800 border-orange-300",
    eleve: "bg-red-100 text-red-800 border-red-300",
  };

  const renderEcartBadge = () => {
    // Cas 1: originalValue est null/undefined (absent du PDF)
    const isMissingFromPdf = originalValue === null || originalValue === undefined;

    if (isMissingFromPdf) {
      if (!hasValue) {
        // Pas de valeur PDF ET pas de valeur saisie -> Badge rouge "À renseigner"
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300 gap-1">
            <AlertTriangle className="h-3 w-3" />
            À renseigner
          </Badge>
        );
      } else if (isZeroValue) {
        // Valeur 0 saisie -> Badge orange (valeur inhabituelle mais valide)
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-300 gap-1">
            <AlertTriangle className="h-3 w-3" />
            Valeur: 0
          </Badge>
        );
      } else {
        // Pas de valeur PDF MAIS valeur > 0 saisie -> Badge vert "Renseigné"
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-300 gap-1">
            <Check className="h-3 w-3" />
            Renseigné
          </Badge>
        );
      }
    }

    // Cas 2: originalValue existe mais pas de valeur saisie
    if (!hasValue) {
      return (
        <div className="text-xs text-gray-500">
          PDF: {originalValue} {unit}
        </div>
      );
    }

    if (niveau === "identique") {
      return (
        <Badge variant={badgeVariants[niveau]} className={`${badgeColors[niveau]} gap-1`}>
          <Check className="h-3 w-3" />
          Identique
        </Badge>
      );
    }

    const Icon = difference > 0 ? TrendingUp : TrendingDown;
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="text-xs text-gray-600">
          PDF: {originalValue} {unit}
        </div>
        <Badge variant={badgeVariants[niveau]} className={`${badgeColors[niveau]} gap-1`}>
          <Icon className="h-3 w-3" />
          {difference > 0 ? "+" : ""}{difference} {unit}
          <span className="text-xs opacity-75">
            ({pourcentage.toFixed(1)}%)
          </span>
        </Badge>
      </div>
    );
  };

  return (
    <div className="min-w-0 space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-base font-medium">
          {label}
        </Label>
        {type === "number" && renderEcartBadge()}
      </div>
      <Input
        id={id}
        type={type}
        inputMode={type === "number" ? "numeric" : "text"}
        pattern={type === "number" ? "[0-9]*" : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11"
        placeholder={placeholder || (type === "number" ? `Ex: ${originalValue}` : "")}
      />
    </div>
  );
}
