"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

// Ordre des champs selon la logique métier du PDF
const FIELD_ORDER = [
  // Dimensions (section principale - déjà affichées)
  "largeur",
  "hauteur",
  "hauteurAllege",
  "largeurTableau",
  "hauteurTableau",

  // Informations produit (ordre PDF - noms réels de la BDD)
  "gamme",
  "couleurInt", // couleurInterieure dans le PDF
  "couleurExt", // couleurExterieure dans le PDF
  "pose",
  "dimensions",
  "dormant",
  "habillageInt", // habillageInterieur dans le PDF
  "fixation",
  "habillageExt", // habillageExterieur dans le PDF
  "dormantGorge",
  "traverseBasse",
  "vitrage",
  "doubleVitrage", // Ajout champ manquant
  "intercalaire",
  "ouvrant",
  "ouvrantPrincipal", // Ajout champ manquant
  "fermeture",
  "poignee", // poigneeVantailPrincipal dans le PDF
  "poigneeVantailPrincipal",
  "poigneeVantailSecondaire",
  "rails",
  "couleurJoints",
  "couleurQuincaillerie",
  "couleurPareTempete",
  "couleur", // fallback ancien champ
  "volet",
  "serrure",
  "intitule", // Ajout champ manquant
];

// Labels français pour les champs
const FIELD_LABELS: Record<string, string> = {
  largeur: "Largeur",
  hauteur: "Hauteur",
  hauteurAllege: "Hauteur d'allège",
  largeurTableau: "Largeur tableau",
  hauteurTableau: "Hauteur tableau",
  gamme: "Gamme",
  couleurInt: "Couleur intérieure",
  couleurExt: "Couleur extérieure",
  couleurInterieure: "Couleur intérieure", // Ancien nom (fallback)
  couleurExterieure: "Couleur extérieure", // Ancien nom (fallback)
  pose: "Type de pose",
  dimensions: "Dimensions",
  dormant: "Dormant",
  habillageInt: "Habillage intérieur",
  habillageExt: "Habillage extérieur",
  habillageInterieur: "Habillage intérieur", // Ancien nom (fallback)
  habillageExterieur: "Habillage extérieur", // Ancien nom (fallback)
  fixation: "Fixation",
  dormantGorge: "Dormant avec gorge",
  traverseBasse: "Traverse basse",
  vitrage: "Vitrage",
  doubleVitrage: "Double vitrage",
  intercalaire: "Intercalaire",
  ouvrant: "Ouvrant",
  ouvrantPrincipal: "Ouvrant principal",
  fermeture: "Fermeture",
  poignee: "Poignée",
  poigneeVantailPrincipal: "Poignée vantail principal",
  poigneeVantailSecondaire: "Poignée vantail secondaire",
  rails: "Rails",
  couleurJoints: "Couleur des joints",
  couleurQuincaillerie: "Couleur quincaillerie",
  couleurPareTempete: "Couleur pare-tempête",
  couleur: "Couleur",
  volet: "Volet",
  serrure: "Serrure",
  intitule: "Intitulé",
};

export default function MenuiseriePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const menuiserieId = params.id as string;

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [observations, setObservations] = useState("");
  const [repere, setRepere] = useState("");
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
      if (!repere) {
        setRepere(menuiserie.repere || "");
      }
    }
  }, [menuiserie, formData, observations, repere]);

  const updateMutation = useMutation({
    mutationFn: async (data: { donneesModifiees: Record<string, any>; repere?: string }) => {
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

    updateMutation.mutate({
      donneesModifiees,
      repere: repere || undefined,
    });
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
          <div className="h-10 w-32 rounded bg-gray-200" />
          <div className="h-64 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!menuiserie) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
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

  // Fonction pour trier selon FIELD_ORDER
  const sortByFieldOrder = (fields: string[]) => {
    return fields.sort((a, b) => {
      const indexA = FIELD_ORDER.indexOf(a);
      const indexB = FIELD_ORDER.indexOf(b);

      // Si un champ n'est pas dans FIELD_ORDER, le mettre à la fin
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;

      return indexA - indexB;
    });
  };

  // Combiner tous les champs additionnels et trier selon l'ordre du PDF
  const allAdditionalFields = sortByFieldOrder([
    ...otherNumericFields,
    ...textFields,
  ]);

  return (
    <div className="min-h-screen bg-gray-50 pb-64 lg:pb-40">
      {/* Header Responsive */}
      <div className="sticky top-0 z-10 border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-4 p-4 lg:px-8">
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
              className="h-10 w-10 lg:h-12 lg:w-12"
            >
              <ArrowLeft className="h-5 w-5 lg:h-6 lg:w-6" />
            </Button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 lg:gap-3">
                <h1 className="truncate text-lg font-bold lg:text-2xl">
                  {menuiserie.repere || "Menuiserie"}
                </h1>
                <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium whitespace-nowrap text-gray-500 lg:px-3 lg:py-1.5 lg:text-sm">
                  {menuiserie.navigation.currentPosition}/
                  {menuiserie.navigation.total}
                </span>
              </div>
              <p className="truncate text-sm text-gray-600 lg:text-base lg:mt-1">
                {menuiserie.intitule}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-4 p-4 lg:p-8">
        {/* Layout Desktop : 2 colonnes (Image | Formulaires) */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Colonne gauche : Image (sticky sur desktop) */}
          {menuiserie.imageBase64 && (
            <div className="lg:col-span-5">
              <Card className="lg:sticky lg:top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                    🖼️ Schéma technique
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-50">
                    {/* <img
                      src={menuiserie.imageBase64}
                      alt={`Schéma ${menuiserie.repere || menuiserie.intitule}`}
                      className="w-full h-full object-contain"
                    /> */}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Colonne droite : Formulaires */}
          <div className={`space-y-4 ${menuiserie.imageBase64 ? 'lg:col-span-7' : 'lg:col-span-12'} mt-4 lg:mt-0`}>
            {/* Repère éditable */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                  🏷️ Repère
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="repere" className="text-base font-medium">
                    Identifiant de la menuiserie
                  </Label>
                  <Input
                    id="repere"
                    value={repere}
                    onChange={(e) => {
                      setRepere(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    className="h-14 text-lg font-semibold"
                    placeholder="Ex: Salon, R1, Fenêtre cuisine..."
                  />
                  <p className="text-xs text-gray-500">
                    Ce repère sera utilisé pour identifier la menuiserie dans la navigation
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Dimensions principales (toujours visibles) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                  📏 Dimensions principales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 lg:space-y-6">
                {/* Grille responsive pour les champs */}
                <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
                  {criticalNumericFields.map((key) => (
                    <div key={key} className="lg:col-span-1">
                      <FieldWithDiff
                        id={key}
                        label={FIELD_LABELS[key] || key}
                        value={formData[key] ?? ""}
                        originalValue={menuiserie.donneesOriginales[key]}
                        onChange={(value) => handleFieldChange(key, value)}
                        type="number"
                        unit="mm"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Détails additionnels (collapsed) */}
            {allAdditionalFields.length > 0 && (
              <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer transition-colors hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                          📋 Détails additionnels
                          <span className="text-xs font-normal text-gray-500 lg:text-sm">
                            ({allAdditionalFields.length} champs)
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
                    <CardContent className="space-y-4 pt-0 lg:space-y-6">
                      {/* Grille responsive - tous les champs triés selon l'ordre PDF */}
                      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
                        {allAdditionalFields.map((key) => {
                          const isNumeric = otherNumericFields.includes(key);

                          // Champs numériques avec calcul d'écart
                          if (isNumeric) {
                            return (
                              <div key={key} className="lg:col-span-1">
                                <FieldWithDiff
                                  id={key}
                                  label={FIELD_LABELS[key] || key}
                                  value={formData[key] ?? ""}
                                  originalValue={menuiserie.donneesOriginales[key]}
                                  onChange={(value) => handleFieldChange(key, value)}
                                  type="number"
                                  unit="mm"
                                />
                              </div>
                            );
                          }

                          // Champs texte
                          return (
                            <div key={key} className="space-y-2 lg:col-span-1">
                              <Label htmlFor={key} className="text-base font-medium">
                                {FIELD_LABELS[key] || key}
                              </Label>
                              <div className="mb-1 text-xs text-gray-600">
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
                          );
                        })}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )}

            {/* Observations (collapsed) */}
            <Collapsible open={observationsOpen} onOpenChange={setObservationsOpen}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer transition-colors hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                        💬 Observations
                        <span className="text-xs font-normal text-gray-500 lg:text-sm">
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
        </div>
      </div>

      {/* Fixed Bottom Navigation + Save */}
      <div className="fixed right-0 bottom-0 left-0 border-t bg-white shadow-lg">
        <div className="mx-auto max-w-7xl px-4 py-4 lg:px-8 lg:py-6">
          {/* Mobile : Stack vertical */}
          <div className="flex flex-col gap-3 lg:hidden">
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
            <Button
              className="h-14 w-full text-lg"
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              <Save className="mr-2 h-5 w-5" />
              {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>

          {/* Desktop : Layout horizontal aligné */}
          <div className="hidden lg:flex lg:items-end lg:gap-6">
            <div className="flex-1">
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
            </div>
            <Button
              className="h-14 whitespace-nowrap px-8 text-lg"
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              <Save className="mr-2 h-5 w-5" />
              {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
