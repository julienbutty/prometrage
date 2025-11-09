import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Ecarts } from "@/lib/utils/ecarts";

interface EcartsAlertProps {
  ecarts: Ecarts;
}

/**
 * Map field names to French labels
 */
const FIELD_LABELS: Record<string, string> = {
  largeur: "Largeur",
  hauteur: "Hauteur",
  hauteurAllege: "Hauteur d'allège",
};

/**
 * Alert component that displays critical écarts (≥10%)
 * Only shows when there are écarts with niveau "eleve"
 */
export function EcartsAlert({ ecarts }: EcartsAlertProps) {
  // Filter for critical écarts (niveau "eleve")
  const criticalEcarts = Object.entries(ecarts).filter(
    ([_, ecart]) => ecart?.niveau === "eleve"
  );

  // Don't render if no critical écarts
  if (criticalEcarts.length === 0) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle>Écarts critiques détectés</AlertTitle>
      <AlertDescription>
        <p className="mb-3">
          Les champs suivants présentent des écarts importants (&ge;10%) par
          rapport aux valeurs du PDF :
        </p>
        <ul className="space-y-2">
          {criticalEcarts.map(([fieldName, ecart]) => {
            if (!ecart) return null;

            const label = FIELD_LABELS[fieldName] || fieldName;
            const sign = ecart.pourcentage >= 0 ? "+" : "-";
            const absValue = Math.abs(ecart.pourcentage).toFixed(1);

            return (
              <li
                key={fieldName}
                className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm"
              >
                <span className="font-semibold">{label} :</span>
                <span className="text-xs sm:text-sm">
                  {ecart.original} mm → {ecart.modifie} mm
                  <span className="ml-2 font-bold">
                    ({sign}{absValue}%)
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
