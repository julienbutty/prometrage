"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FieldWithDiff } from "@/components/forms/FieldWithDiff";
import { NavigationBar } from "@/components/menuiseries/NavigationBar";

interface MenuiserieStatus {
  id: string;
  repere: string | null;
  intitule: string;
  isCompleted: boolean;
}

interface NavigationInfo {
  total: number;
  currentIndex: number;
  currentPosition: number;
  hasNext: boolean;
  hasPrevious: boolean;
  nextId: string | null;
  previousId: string | null;
  allMenuiseries: Array<{
    id: string;
    repere: string | null;
    intitule: string;
    ordre: number;
    donneesModifiees: any;
  }>;
  menuiseriesStatus: MenuiserieStatus[];
}

interface Menuiserie {
  id: string;
  repere: string | null;
  intitule: string;
  imageBase64?: string | null;
  donneesOriginales: Record<string, any>;
  donneesModifiees?: Record<string, any>;
  ecarts?: Record<string, any>;
  projet: {
    id: string;
    reference: string;
    clientNom: string;
  };
  navigation: NavigationInfo;
}

// Champs numériques critiques (toujours visibles)
const NUMERIC_CRITICAL_FIELDS = ["largeur", "hauteur", "hauteurAllege"];

// Autres champs numériques (dans collapsed)
const NUMERIC_OTHER_FIELDS = ["largeurTableau", "hauteurTableau"];

// Labels français pour les champs
const FIELD_LABELS: Record<string, string> = {
  largeur: "Largeur",
  hauteur: "Hauteur",
  hauteurAllege: "Hauteur d'allège",
  largeurTableau: "Largeur tableau",
  hauteurTableau: "Hauteur tableau",
  gamme: "Gamme",
  pose: "Type de pose",
  volet: "Volet",
  couleur: "Couleur",
  vitrage: "Vitrage",
  serrure: "Serrure",
};

export default function MenuiseriePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const menuiserieId = params.id as string;

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [observations, setObservations] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [observationsOpen, setObservationsOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { data: menuiserie, isLoading } = useQuery({
    queryKey: ["menuiserie", menuiserieId],
    queryFn: async (): Promise<Menuiserie> => {
      const response = await fetch(`/api/menuiseries/${menuiserieId}`);
      if (!response.ok) throw new Error("Failed to fetch menuiserie");
      const result = await response.json();
      return result.data;
    },
  });

  // Initialize form when data loads
  useEffect(() => {
    if (menuiserie && Object.keys(formData).length === 0) {
      const modified = menuiserie.donneesModifiees;
      const initial: Record<string, any> = {};

      Object.keys(menuiserie.donneesOriginales).forEach((key) => {
        initial[key] = modified?.[key] ?? menuiserie.donneesOriginales[key];
      });

      setFormData(initial);
      if (!observations && modified?.observations) {
        setObservations(String(modified.observations));
      }
    }
  }, [menuiserie, formData, observations]);

  const updateMutation = useMutation({
    mutationFn: async (data: { donneesModifiees: Record<string, any> }) => {
      const response = await fetch(`/api/menuiseries/${menuiserieId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Mesures enregistrées");
      queryClient.invalidateQueries({ queryKey: ["menuiserie", menuiserieId] });
    },
    onError: () => {
      toast.error("Erreur lors de l'enregistrement");
    },
  });

  const handleFieldChange = (key: string, value: string) => {
    setHasUnsavedChanges(true);
    setFormData((prev) => {
      const newData = { ...prev, [key]: value };
      // Convert to number if it's a numeric field
      if ([...NUMERIC_CRITICAL_FIELDS, ...NUMERIC_OTHER_FIELDS].includes(key)) {
        newData[key] = parseInt(value) || 0;
      }
      return newData;
    });
  };

  const handleSave = () => {
    if (!menuiserie) return;

    const donneesModifiees = {
      ...formData,
      observations,
    };

    updateMutation.mutate({ donneesModifiees });
    setHasUnsavedChanges(false);
  };

  const handleNavigate = (targetId: string) => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm(
        "Vous avez des modifications non sauvegardées. Voulez-vous continuer sans sauvegarder ?"
      );
      if (!confirm) return;
    }

    router.push(`/menuiserie/${targetId}`);
    setHasUnsavedChanges(false);
  };

  const handleNext = () => {
    if (menuiserie?.navigation.nextId) {
      handleNavigate(menuiserie.navigation.nextId);
    }
  };

  const handlePrevious = () => {
    if (menuiserie?.navigation.previousId) {
      handleNavigate(menuiserie.navigation.previousId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-32 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!menuiserie) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Menuiserie introuvable</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter fields
  const criticalNumericFields = NUMERIC_CRITICAL_FIELDS.filter(
    (key) => menuiserie.donneesOriginales[key] !== undefined
  );

  const otherNumericFields = NUMERIC_OTHER_FIELDS.filter(
    (key) => menuiserie.donneesOriginales[key] !== undefined
  );

  const textFields = Object.keys(menuiserie.donneesOriginales).filter(
    (key) =>
      ![...NUMERIC_CRITICAL_FIELDS, ...NUMERIC_OTHER_FIELDS].includes(key) &&
      menuiserie.donneesOriginales[key] !== null &&
      menuiserie.donneesOriginales[key] !== undefined
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header Mobile */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="p-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (hasUnsavedChanges) {
                const confirm = window.confirm(
                  "Vous avez des modifications non sauvegardées. Voulez-vous continuer sans sauvegarder ?"
                );
                if (!confirm) return;
              }
              router.push(`/projet/${menuiserie.projet.id}`);
            }}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold truncate">
                {menuiserie.repere || "Menuiserie"}
              </h1>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded whitespace-nowrap">
                {menuiserie.navigation.currentPosition}/{menuiserie.navigation.total}
              </span>
            </div>
            <p className="text-sm text-gray-600 truncate">
              {menuiserie.intitule}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Image de la menuiserie */}
        {menuiserie.imageBase64 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                🖼️ Schéma technique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative w-full aspect-[4/3] bg-gray-50 rounded-lg overflow-hidden">
                <img
                  src={menuiserie.imageBase64}
                  alt={`Schéma ${menuiserie.repere || menuiserie.intitule}`}
                  className="w-full h-full object-contain"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dimensions principales (toujours visibles) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              📏 Dimensions principales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {criticalNumericFields.map((key) => (
              <FieldWithDiff
                key={key}
                id={key}
                label={FIELD_LABELS[key] || key}
                value={formData[key] ?? ""}
                originalValue={menuiserie.donneesOriginales[key]}
                onChange={(value) => handleFieldChange(key, value)}
                type="number"
                unit="mm"
              />
            ))}
          </CardContent>
        </Card>

        {/* Détails additionnels (collapsed) */}
        {(otherNumericFields.length > 0 || textFields.length > 0) && (
          <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      📋 Détails additionnels
                      <span className="text-xs text-gray-500 font-normal">
                        ({otherNumericFields.length + textFields.length} champs)
                      </span>
                    </CardTitle>
                    {detailsOpen ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4 pt-0">
                  {/* Other numeric fields */}
                  {otherNumericFields.map((key) => (
                    <FieldWithDiff
                      key={key}
                      id={key}
                      label={FIELD_LABELS[key] || key}
                      value={formData[key] ?? ""}
                      originalValue={menuiserie.donneesOriginales[key]}
                      onChange={(value) => handleFieldChange(key, value)}
                      type="number"
                      unit="mm"
                    />
                  ))}

                  {/* Text fields */}
                  {textFields.map((key) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key} className="text-base font-medium">
                        {FIELD_LABELS[key] || key}
                      </Label>
                      <div className="text-xs text-gray-600 mb-1">
                        PDF: {String(menuiserie.donneesOriginales[key])}
                      </div>
                      <Input
                        id={key}
                        value={formData[key] ?? ""}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        className="h-14"
                        placeholder={String(menuiserie.donneesOriginales[key])}
                      />
                    </div>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Observations (collapsed) */}
        <Collapsible
          open={observationsOpen}
          onOpenChange={setObservationsOpen}
        >
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    💬 Observations
                    <span className="text-xs text-gray-500 font-normal">
                      (optionnel)
                    </span>
                  </CardTitle>
                  {observationsOpen ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <Input
                  id="observations"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="h-14"
                  placeholder="Remarques particulières, problèmes constatés..."
                />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      {/* Fixed Bottom Navigation + Save */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="p-4 space-y-3">
          {/* Navigation Bar */}
          <NavigationBar
            hasNext={menuiserie.navigation.hasNext}
            hasPrevious={menuiserie.navigation.hasPrevious}
            onNext={handleNext}
            onPrevious={handlePrevious}
            currentPosition={menuiserie.navigation.currentPosition}
            total={menuiserie.navigation.total}
            disabled={updateMutation.isPending}
            menuiseriesStatus={menuiserie.navigation.menuiseriesStatus}
          />

          {/* Save Button */}
          <Button
            className="w-full h-14 text-lg"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            <Save className="mr-2 h-5 w-5" />
            {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </div>
    </div>
  );
}
