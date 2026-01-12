"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, ChevronDown, ChevronUp, CheckCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { useHabillagesPropagation } from "@/hooks/useHabillagesPropagation";
import type { HabillageValue, Side } from "@/lib/validations/habillage";
import { getHabillageConfig } from "@/lib/validations/habillage";
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
import { TextFieldWithDiff } from "@/components/forms/TextFieldWithDiff";
import { DynamicField } from "@/components/forms/DynamicField";
import { NavigationBar } from "@/components/menuiseries/NavigationBar";
import { EcartsAlert } from "@/components/menuiseries/EcartsAlert";
import HelpIcon from "@/components/forms/HelpIcon";
import PhotoUpload from "@/components/forms/PhotoUpload";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { InteractiveSVGZone } from "@/components/menuiseries/InteractiveSVGZone";
import { HabillageSelect } from "@/components/menuiseries/HabillageSelect";
import { parseMenuiserieType } from "@/lib/svg/svg-utils";
import { getEffectiveOpeningDirection } from "@/lib/svg/opening-direction";
import { SIDES } from "@/lib/validations/habillage";
import type { PhotoObservation } from "@/lib/validations/photo-observation";
import { getFormConfigKey, detectMateriau, detectPose, detectTypeProduit } from "@/lib/utils/menuiserie-type";
import { loadFormConfig } from "@/lib/forms/config-loader";
import { useMemo } from "react";

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

// Champs numériques (pour conversion)
const NUMERIC_FIELDS = ["largeur", "hauteur", "hauteurAllege", "largeurTableau", "hauteurTableau", "nombreVantaux", "soubassementHauteur"];

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
  "soubassement",
  "soubassementHauteur",
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
  "petitsBoisType",
  "petitsBoisConfiguration",
  "petitsBoisCouleur",
  "ventilation",
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
  ouvertureInterieure: "Ouverture intérieure", // Sens d'ouverture vue de l'intérieur
  fermeture: "Fermeture",
  poignee: "Poignée",
  poigneeVantailPrincipal: "Poignée vantail principal",
  poigneeVantailSecondaire: "Poignée vantail secondaire",
  rails: "Rails",
  couleurJoints: "Couleur des joints",
  couleurQuincaillerie: "Couleur quincaillerie",
  couleurPareTempete: "Couleur pare-tempête",
  couleur: "Couleur",
  petitsBoisType: "Type de petits-bois",
  petitsBoisConfiguration: "Configuration petits-bois",
  petitsBoisCouleur: "Couleur petits-bois",
  ventilation: "Ventilation",
  volet: "Volet",
  serrure: "Serrure",
  intitule: "Intitulé",
  soubassement: "Soubassement",
  soubassementHauteur: "Hauteur soubassement",
};

export default function MenuiseriePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const menuiserieId = params.id as string;

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [observations, setObservations] = useState("");
  const [photosObservations, setPhotosObservations] = useState<PhotoObservation[]>([]);
  const [repere, setRepere] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [observationsOpen, setObservationsOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // États pour les modales de confirmation
  const [confirmValidate, setConfirmValidate] = useState(false);
  const [confirmNavigation, setConfirmNavigation] = useState(false);
  const [confirmBackToProject, setConfirmBackToProject] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pendingNavigationId, setPendingNavigationId] = useState<string | null>(null);

  // Haptic feedback hook
  const haptic = useHapticFeedback();

  // Hooks de propagation pour les habillages
  const habillagesInt = useHabillagesPropagation();
  const habillagesExt = useHabillagesPropagation();

  const { data: menuiserie, isLoading } = useQuery({
    queryKey: ["menuiserie", menuiserieId],
    queryFn: async (): Promise<Menuiserie> => {
      const response = await fetch(`/api/menuiseries/${menuiserieId}`);
      if (!response.ok) throw new Error("Failed to fetch menuiserie");
      const result = await response.json();
      return result.data;
    },
  });

  // Détection automatique du type de menuiserie et chargement de la config
  const detectedInfo = useMemo(() => {
    if (!menuiserie) return null;

    const data = menuiserie.donneesOriginales;
    const materiau = detectMateriau(data);
    const pose = detectPose(data);
    const typeProduit = detectTypeProduit(data);
    const configKey = getFormConfigKey(data);
    const formConfig = loadFormConfig(configKey);
    // Configuration des habillages selon le matériau et le type de pose
    const habillageConfig = getHabillageConfig(materiau, pose);

    return { materiau, pose, typeProduit, configKey, formConfig, habillageConfig };
  }, [menuiserie]);

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
      if (photosObservations.length === 0 && modified?.photosObservations) {
        setPhotosObservations(modified.photosObservations as PhotoObservation[]);
      }
      if (!repere) {
        setRepere(menuiserie.repere || "");
      }
    }
  }, [menuiserie, formData, observations, photosObservations, repere]);

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
    onMutate: async (newData) => {
      // Annuler les requêtes en cours pour éviter les conflits
      await queryClient.cancelQueries({ queryKey: ["menuiserie", menuiserieId] });

      // Snapshot de l'état actuel pour rollback
      const previousMenuiserie = queryClient.getQueryData(["menuiserie", menuiserieId]);

      // Optimistic update - mettre à jour immédiatement le cache
      queryClient.setQueryData(["menuiserie", menuiserieId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            donneesModifiees: newData.donneesModifiees,
            repere: newData.repere ?? old.data.repere,
          },
        };
      });

      // Retourner le contexte pour rollback si erreur
      return { previousMenuiserie };
    },
    onSuccess: () => {
      haptic.medium(); // Vibration feedback pour l'enregistrement
      toast.success("Mesures enregistrées");
      setHasUnsavedChanges(false);
    },
    onError: (err, newData, context) => {
      haptic.error(); // Vibration d'erreur
      toast.error("Erreur lors de l'enregistrement");

      // Rollback à l'état précédent
      if (context?.previousMenuiserie) {
        queryClient.setQueryData(["menuiserie", menuiserieId], context.previousMenuiserie);
      }
    },
    onSettled: () => {
      // Refetch pour s'assurer d'avoir les données à jour
      queryClient.invalidateQueries({ queryKey: ["menuiserie", menuiserieId] });
      if (menuiserie?.projet.id) {
        queryClient.invalidateQueries({ queryKey: ["projet", menuiserie.projet.id] });
      }
    },
  });

  const validerMutation = useMutation({
    mutationFn: async (data?: { donneesModifiees: Record<string, any>; repere?: string }) => {
      const response = await fetch(`/api/menuiseries/${menuiserieId}/valider`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data || {}),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to validate");
      }
      return response.json();
    },
    onMutate: async () => {
      // Annuler les requêtes en cours
      await queryClient.cancelQueries({ queryKey: ["menuiserie", menuiserieId] });
      if (menuiserie?.projet.id) {
        await queryClient.cancelQueries({ queryKey: ["projet", menuiserie.projet.id] });
      }

      // Snapshot pour rollback
      const previousMenuiserie = queryClient.getQueryData(["menuiserie", menuiserieId]);
      const previousProjet = menuiserie?.projet.id
        ? queryClient.getQueryData(["projet", menuiserie.projet.id])
        : null;

      // Optimistic update - marquer comme validée
      queryClient.setQueryData(["menuiserie", menuiserieId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            validee: true,
          },
        };
      });

      // Optimistic update - mettre à jour le statut dans le projet
      if (menuiserie?.projet.id) {
        queryClient.setQueryData(["projet", menuiserie.projet.id], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            menuiseries: old.menuiseries.map((m: any) =>
              m.id === menuiserieId ? { ...m, validee: true } : m
            ),
          };
        });
      }

      return { previousMenuiserie, previousProjet };
    },
    onSuccess: () => {
      haptic.success(); // Pattern de succès pour la validation
      toast.success("Menuiserie validée !");
      setHasUnsavedChanges(false);

      // Navigation automatique vers la menuiserie suivante (ou retour projet)
      if (menuiserie?.navigation.hasNext && menuiserie.navigation.nextId) {
        router.push(`/menuiserie/${menuiserie.navigation.nextId}`);
      } else {
        // Dernière menuiserie : retour au projet
        router.push(`/projet/${menuiserie?.projet.id}`);
      }
    },
    onError: (error, variables, context) => {
      haptic.error(); // Vibration d'erreur
      toast.error(error instanceof Error ? error.message : "Erreur lors de la validation");

      // Rollback
      if (context?.previousMenuiserie) {
        queryClient.setQueryData(["menuiserie", menuiserieId], context.previousMenuiserie);
      }
      if (context?.previousProjet && menuiserie?.projet.id) {
        queryClient.setQueryData(["projet", menuiserie.projet.id], context.previousProjet);
      }
    },
    onSettled: () => {
      // Refetch pour s'assurer d'avoir les données à jour
      queryClient.invalidateQueries({ queryKey: ["menuiserie", menuiserieId] });
      if (menuiserie?.projet.id) {
        queryClient.invalidateQueries({ queryKey: ["projet", menuiserie.projet.id] });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/menuiseries/${menuiserieId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to delete menuiserie");
      }
      return response.json();
    },
    onSuccess: (result) => {
      haptic.success();
      toast.success("Menuiserie supprimée");

      // Invalider les caches
      if (result.data.projetId) {
        queryClient.invalidateQueries({ queryKey: ["projet", result.data.projetId] });
      }

      // Rediriger vers le projet
      if (menuiserie?.projet.id) {
        router.push(`/projet/${menuiserie.projet.id}`);
      } else {
        router.push("/");
      }
    },
    onError: (error) => {
      haptic.error();
      toast.error("Erreur lors de la suppression", {
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    },
  });

  const handleDelete = async () => {
    await deleteMutation.mutateAsync();
    setConfirmDelete(false);
  };

  const handleFieldChange = (key: string, value: any) => {
    setHasUnsavedChanges(true);
    setFormData((prev) => {
      const newData = { ...prev, [key]: value };
      // Convert to number if it's a numeric field (but preserve empty strings)
      if (NUMERIC_FIELDS.includes(key)) {
        if (value === "" || value === null || value === undefined) {
          newData[key] = ""; // Préserver la chaîne vide pour l'input
        } else {
          newData[key] = typeof value === 'string' ? parseInt(value) : value;
        }
      }
      // Clear soubassementHauteur if soubassement is set to "sans"
      if (key === "soubassement" && value === "sans") {
        newData.soubassementHauteur = null;
      }
      return newData;
    });
  };

  // Handlers pour les habillages avec propagation
  const handleHabillageIntChange = (side: Side, value: HabillageValue) => {
    setHasUnsavedChanges(true);
    habillagesInt.handleChange(side, value);
  };

  const handleHabillageExtChange = (side: Side, value: HabillageValue) => {
    setHasUnsavedChanges(true);
    habillagesExt.handleChange(side, value);
  };

  const handleSave = () => {
    if (!menuiserie) return;

    const donneesModifiees = {
      ...formData,
      observations,
      photosObservations: photosObservations.length > 0 ? photosObservations : undefined,
      // Habillages avec la nouvelle structure
      habillageInt: habillagesInt.values,
      habillageExt: habillagesExt.values,
    };

    updateMutation.mutate({
      donneesModifiees,
      repere: repere || undefined,
    });
    setHasUnsavedChanges(false);
  };

  const handleValider = () => {
    if (!menuiserie) return;

    // Toujours demander confirmation avant de valider
    setConfirmValidate(true);
  };

  const handleConfirmValidate = () => {
    if (!menuiserie) return;

    // Préparer les données à enregistrer avec la validation
    const donneesModifiees = {
      ...formData,
      observations,
      photosObservations: photosObservations.length > 0 ? photosObservations : undefined,
      // Habillages avec la nouvelle structure
      habillageInt: habillagesInt.values,
      habillageExt: habillagesExt.values,
    };

    // Valider avec les données actuelles (auto-enregistrement)
    validerMutation.mutate({
      donneesModifiees,
      repere: repere || undefined,
    });
  };

  const handleNavigate = (targetId: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigationId(targetId);
      setConfirmNavigation(true);
      return;
    }

    router.push(`/menuiserie/${targetId}`);
    setHasUnsavedChanges(false);
  };

  const handleConfirmNavigation = () => {
    if (pendingNavigationId) {
      router.push(`/menuiserie/${pendingNavigationId}`);
      setHasUnsavedChanges(false);
      setPendingNavigationId(null);
    }
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

  // Champs déjà affichés dans la section principale (ne pas afficher dans détails additionnels)
  const MAIN_SECTION_FIELDS = [
    "largeur", "hauteur", "hauteurAllege",
    "ouvertureInterieure", "soubassement", "soubassementHauteur",
    "ventilation", "pose", "gamme", "couleurInt", "couleurExt"
  ];

  const additionalFields = Object.keys(menuiserie.donneesOriginales).filter(
    (key) =>
      !MAIN_SECTION_FIELDS.includes(key) &&
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

  // Trier les champs additionnels selon l'ordre du PDF
  const sortedAdditionalFields = sortByFieldOrder(additionalFields);

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50 pb-64 lg:pb-40">
      {/* Header Responsive */}
      <div className="sticky top-0 z-10 border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-4 p-4 lg:px-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (hasUnsavedChanges) {
                  setConfirmBackToProject(true);
                  return;
                }
                router.push(`/projet/${menuiserie.projet.id}`);
              }}
              className="h-11 w-11 lg:h-12 lg:w-12"
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setConfirmDelete(true)}
              className="h-11 w-11 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-4 lg:px-8 lg:py-6 space-y-4">
        {/* Alerte écarts critiques */}
        {menuiserie.ecarts && <EcartsAlert ecarts={menuiserie.ecarts} />}

        {/* Layout single-column */}
        <div className="space-y-4">
          {/* Dimensions & Schéma */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                📏 Dimensions & Schéma
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* SVG Zone Interactive */}
              {(() => {
                const typeMenuiserie = menuiserie.donneesOriginales.typeMenuiserie || menuiserie.donneesOriginales.intitule || '';
                const { type, nbVantaux, typeOuvrant } = parseMenuiserieType(typeMenuiserie);
                // Calculate opening direction from form data or original data
                // Note: "droite tirant" → sensOuverture: 'gauche' (triangle points left)
                const ouvertureValue = formData.ouvertureInterieure ?? menuiserie.donneesOriginales.ouvertureInterieure;
                const ouvrantValue = formData.ouvrantPrincipal ?? menuiserie.donneesOriginales.ouvrantPrincipal;
                const sensOuverture = getEffectiveOpeningDirection(ouvertureValue, ouvrantValue);

                // Key based on opening direction to force re-render when it changes
                const svgKey = `svg-${sensOuverture ?? 'default'}-${ouvertureValue ?? 'none'}`;

                return (
                  <div className="flex flex-col items-center">
                    <div className="w-full bg-gray-50 rounded-lg pt-8 pb-20">
                      {/* Conteneur à hauteur fixe pour éviter le saut de layout lors de la saisie */}
                      <div className="flex items-center justify-center" style={{ minHeight: '320px' }}>
                        <InteractiveSVGZone
                          key={svgKey}
                          type={type}
                          nbVantaux={nbVantaux}
                          typeOuvrant={typeOuvrant}
                          sensOuverture={sensOuverture}
                          largeur={formData.largeur ?? menuiserie.donneesOriginales.largeur ?? ''}
                          hauteur={formData.hauteur ?? menuiserie.donneesOriginales.hauteur ?? ''}
                          habillagesInt={habillagesInt.values}
                          habillagesExt={habillagesExt.values}
                          showHabillageLabels={!!detectedInfo?.habillageConfig}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 text-center mt-2">
                      {typeMenuiserie || 'Type non spécifié'}
                    </p>
                  </div>
                );
              })()}

              {/* ═══════════════════════════════════════════════════════════
                  SECTION 1 : DIMENSIONS PRINCIPALES
                  ═══════════════════════════════════════════════════════════ */}
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-1 rounded-full bg-slate-400" />
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Dimensions
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <FieldWithDiff
                    id="largeur"
                    label="Largeur"
                    value={formData.largeur ?? ""}
                    originalValue={menuiserie.donneesOriginales.largeur}
                    onChange={(value) => handleFieldChange("largeur", value)}
                    type="number"
                    unit="mm"
                  />
                  <FieldWithDiff
                    id="hauteur"
                    label="Hauteur"
                    value={formData.hauteur ?? ""}
                    originalValue={menuiserie.donneesOriginales.hauteur}
                    onChange={(value) => handleFieldChange("hauteur", value)}
                    type="number"
                    unit="mm"
                  />
                  <FieldWithDiff
                    id="hauteurAllege"
                    label="H. allège"
                    value={formData.hauteurAllege ?? ""}
                    originalValue={menuiserie.donneesOriginales.hauteurAllege}
                    onChange={(value) => handleFieldChange("hauteurAllege", value)}
                    type="number"
                    unit="mm"
                  />
                </div>
              </div>

              {/* ═══════════════════════════════════════════════════════════
                  SECTION 2 : CONFIGURATION (Ouverture, Soubassement, Ventilation, Pose)
                  ═══════════════════════════════════════════════════════════ */}
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-1 rounded-full bg-slate-400" />
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Configuration
                  </span>
                </div>

                {/* Ligne 1 : Ouverture, Pose, Ventilation (toujours 3 colonnes) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                  {/* Ouverture intérieure */}
                  {menuiserie.donneesOriginales.ouvertureInterieure &&
                    detectedInfo?.formConfig?.ouvertureInterieure && (
                      <DynamicField
                        fieldKey="ouvertureInterieure"
                        config={detectedInfo.formConfig.ouvertureInterieure}
                        value={formData.ouvertureInterieure ?? ""}
                        originalValue={menuiserie.donneesOriginales.ouvertureInterieure}
                        onChange={(value) => handleFieldChange("ouvertureInterieure", value)}
                      />
                    )}

                  {/* Type de pose */}
                  {detectedInfo?.formConfig?.pose && (
                    <DynamicField
                      fieldKey="pose"
                      config={detectedInfo.formConfig.pose}
                      value={formData.pose ?? ""}
                      originalValue={menuiserie.donneesOriginales.pose}
                      onChange={(value) => handleFieldChange("pose", value)}
                    />
                  )}

                  {/* Ventilation */}
                  {detectedInfo?.formConfig?.ventilation && (
                    <DynamicField
                      fieldKey="ventilation"
                      config={detectedInfo.formConfig.ventilation}
                      value={formData.ventilation ?? ""}
                      originalValue={menuiserie.donneesOriginales.ventilation}
                      onChange={(value) => handleFieldChange("ventilation", value)}
                    />
                  )}
                </div>

                {/* Ligne 2 : Soubassement (type + hauteur groupés) */}
                {detectedInfo?.formConfig?.soubassement && (
                  <div className="pt-3 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-4 items-end">
                      <DynamicField
                        fieldKey="soubassement"
                        config={detectedInfo.formConfig.soubassement}
                        value={formData.soubassement ?? "sans"}
                        originalValue={menuiserie.donneesOriginales.soubassement ?? "sans"}
                        onChange={(value) => handleFieldChange("soubassement", value)}
                      />

                      {/* Hauteur soubassement - conditionnel */}
                      {formData.soubassement && formData.soubassement !== "sans" &&
                       detectedInfo?.formConfig?.soubassementHauteur && (
                        <FieldWithDiff
                          id="soubassementHauteur"
                          label="Hauteur soubassement"
                          value={formData.soubassementHauteur ?? ""}
                          originalValue={menuiserie.donneesOriginales.soubassementHauteur}
                          onChange={(value) => handleFieldChange("soubassementHauteur", value)}
                          type="number"
                          unit="mm"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ═══════════════════════════════════════════════════════════
                  SECTION 3 : HABILLAGES (Intérieurs & Extérieurs côte à côte)
                  ═══════════════════════════════════════════════════════════ */}
              {detectedInfo?.habillageConfig && (
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-1 w-1 rounded-full bg-slate-400" />
                    <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Habillages
                    </span>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Habillages Intérieurs */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-400" />
                        <span className="text-sm font-medium text-slate-700">Intérieurs</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {SIDES.map((side) => (
                          <HabillageSelect
                            key={`int-${side}`}
                            side={side}
                            value={habillagesInt.values[side]}
                            onChange={(value) => handleHabillageIntChange(side, value)}
                            options={detectedInfo.habillageConfig.interieurs}
                            variant="interieur"
                            isHighlighted={habillagesInt.highlightedSides.has(side)}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Habillages Extérieurs */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-amber-400" />
                        <span className="text-sm font-medium text-slate-700">Extérieurs</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {SIDES.map((side) => (
                          <HabillageSelect
                            key={`ext-${side}`}
                            side={side}
                            value={habillagesExt.values[side]}
                            onChange={(value) => handleHabillageExtChange(side, value)}
                            options={detectedInfo.habillageConfig.exterieurs}
                            variant="exterieur"
                            isHighlighted={habillagesExt.highlightedSides.has(side)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════
                  SECTION 4 : FINITIONS (Gamme, Couleurs)
                  ═══════════════════════════════════════════════════════════ */}
              {(detectedInfo?.formConfig?.gamme ||
                detectedInfo?.formConfig?.couleurInt ||
                detectedInfo?.formConfig?.couleurExt) && (
                <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-1 w-1 rounded-full bg-slate-400" />
                    <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Finitions
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Gamme */}
                    {detectedInfo?.formConfig?.gamme && (
                      <DynamicField
                        fieldKey="gamme"
                        config={detectedInfo.formConfig.gamme}
                        value={formData.gamme ?? ""}
                        originalValue={menuiserie.donneesOriginales.gamme}
                        onChange={(value) => handleFieldChange("gamme", value)}
                      />
                    )}

                    {/* Couleur intérieure */}
                    {detectedInfo?.formConfig?.couleurInt && (
                      <DynamicField
                        fieldKey="couleurInt"
                        config={detectedInfo.formConfig.couleurInt}
                        value={formData.couleurInt ?? ""}
                        originalValue={menuiserie.donneesOriginales.couleurInt}
                        onChange={(value) => handleFieldChange("couleurInt", value)}
                      />
                    )}

                    {/* Couleur extérieure */}
                    {detectedInfo?.formConfig?.couleurExt && (
                      <DynamicField
                        fieldKey="couleurExt"
                        config={detectedInfo.formConfig.couleurExt}
                        value={formData.couleurExt ?? ""}
                        originalValue={menuiserie.donneesOriginales.couleurExt}
                        onChange={(value) => handleFieldChange("couleurExt", value)}
                      />
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

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
                  className="h-11"
                  placeholder="Ex: Salon, R1, Fenêtre cuisine..."
                />
                <p className="text-xs text-gray-500">
                  Ce repère sera utilisé pour identifier la menuiserie dans la navigation
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Détection automatique du type */}
          {detectedInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                  🔍 Type détecté
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-sm">
                    {detectedInfo.materiau}
                  </Badge>
                  <Badge variant="secondary" className="text-sm">
                    {detectedInfo.pose}
                  </Badge>
                  <Badge variant="secondary" className="text-sm">
                    {detectedInfo.typeProduit}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Config: {detectedInfo.configKey}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Type de formulaire chargé automatiquement selon les données du PDF
                </p>
              </CardContent>
            </Card>
          )}

          {/* Détails additionnels (collapsed) */}
          {sortedAdditionalFields.length > 0 && (
            <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer transition-colors hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                        📋 Détails additionnels
                        <span className="text-xs font-normal text-gray-500 lg:text-sm">
                          ({sortedAdditionalFields.length} champs)
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
                    <div className="grid gap-4 lg:grid-cols-2 lg:gap-6 items-end">
                      {sortedAdditionalFields.map((key) => {
                        // Si le champ a une config dynamique, utiliser DynamicField
                        if (detectedInfo?.formConfig[key]) {
                          return (
                            <div key={key} className="min-w-0 lg:col-span-1">
                              <DynamicField
                                fieldKey={key}
                                config={detectedInfo.formConfig[key]}
                                value={formData[key] ?? ""}
                                originalValue={menuiserie.donneesOriginales[key]}
                                onChange={(value) => handleFieldChange(key, value)}
                              />
                            </div>
                          );
                        }

                        // Champs numériques avec calcul d'écart
                        if (NUMERIC_FIELDS.includes(key)) {
                          return (
                            <div key={key} className="min-w-0 lg:col-span-1">
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

                        // Champs texte avec indicateur de modification
                        // Déterminer si on doit afficher l'icône d'aide pour le champ "dormant"
                        const isDormantField = key === "dormant";
                        const typePose = formData.pose || menuiserie.donneesOriginales.pose;
                        const dormantHelpPdf =
                          typePose?.toLowerCase().includes("tunnel")
                            ? "/docs/dormant-tunnel.pdf"
                            : "/docs/dormant-applique.pdf";

                        return (
                          <div key={key} className="min-w-0 lg:col-span-1">
                            <TextFieldWithDiff
                              id={key}
                              label={FIELD_LABELS[key] || key}
                              value={formData[key] ?? ""}
                              originalValue={String(menuiserie.donneesOriginales[key])}
                              onChange={(value) => handleFieldChange(key, value)}
                              helpIcon={
                                isDormantField ? (
                                  <HelpIcon pdfUrl={dormantHelpPdf} />
                                ) : undefined
                              }
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
                <CardContent className="space-y-4 pt-0">
                  {/* Texte des observations */}
                  <div>
                    <Label htmlFor="observations" className="text-sm font-medium mb-2 block">
                      Remarques écrites
                    </Label>
                    <Input
                      id="observations"
                      value={observations}
                      onChange={(e) => {
                        setObservations(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      className="h-11"
                      placeholder="Remarques particulières, problèmes constatés..."
                    />
                  </div>

                  {/* Photos d'observations */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Photos d'observation
                    </Label>
                    <PhotoUpload
                      photos={photosObservations}
                      onChange={(photos) => {
                        setPhotosObservations(photos);
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>
      </div>

      {/* Fixed Bottom Navigation + Save */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 border-t bg-white shadow-lg"
        style={{ transform: 'translateZ(0)' }}
      >
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
              disabled={updateMutation.isPending || validerMutation.isPending}
              menuiseriesStatus={menuiserie.navigation.menuiseriesStatus}
            />
            <div className="flex gap-2">
              <Button
                className="h-14 flex-1 text-lg"
                onClick={handleSave}
                disabled={updateMutation.isPending || validerMutation.isPending}
                variant="outline"
              >
                <Save className="mr-2 h-5 w-5" />
                {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
              <Button
                className="h-14 flex-1 bg-green-600 text-lg hover:bg-green-700"
                onClick={handleValider}
                disabled={updateMutation.isPending || validerMutation.isPending}
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                {validerMutation.isPending ? "Validation..." : "Valider"}
              </Button>
            </div>
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
                disabled={updateMutation.isPending || validerMutation.isPending}
                menuiseriesStatus={menuiserie.navigation.menuiseriesStatus}
              />
            </div>
            <Button
              className="h-14 whitespace-nowrap px-8 text-lg"
              onClick={handleSave}
              disabled={updateMutation.isPending || validerMutation.isPending}
              variant="outline"
            >
              <Save className="mr-2 h-5 w-5" />
              {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
            <Button
              className="h-14 whitespace-nowrap bg-green-600 px-8 text-lg hover:bg-green-700"
              onClick={handleValider}
              disabled={updateMutation.isPending || validerMutation.isPending}
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              {validerMutation.isPending ? "Validation..." : "Valider"}
            </Button>
          </div>
        </div>
      </div>

      {/* Modales de confirmation */}
      <ConfirmDialog
        open={confirmValidate}
        onOpenChange={setConfirmValidate}
        onConfirm={handleConfirmValidate}
        title="Valider cette menuiserie ?"
        description={
          <>
            <span className="block">Êtes-vous sûr de vouloir valider cette menuiserie ?</span>
            <span className="mt-2 block font-medium text-gray-700">
              Les données actuelles seront enregistrées et la menuiserie sera marquée comme terminée.
            </span>
            {menuiserie?.navigation.hasNext && (
              <span className="mt-1 block text-sm text-gray-600">
                Vous passerez automatiquement à la menuiserie suivante.
              </span>
            )}
          </>
        }
        confirmText="Oui, valider"
        cancelText="Annuler"
        variant="default"
      />

      <ConfirmDialog
        open={confirmNavigation}
        onOpenChange={setConfirmNavigation}
        onConfirm={handleConfirmNavigation}
        title="Modifications non sauvegardées"
        description="Vous avez des modifications non sauvegardées. Voulez-vous vraiment changer de menuiserie sans les enregistrer ?"
        confirmText="Oui, continuer sans sauvegarder"
        cancelText="Annuler"
        variant="destructive"
      />

      <ConfirmDialog
        open={confirmBackToProject}
        onOpenChange={setConfirmBackToProject}
        onConfirm={() => {
          router.push(`/projet/${menuiserie?.projet.id}`);
          setHasUnsavedChanges(false);
        }}
        title="Retour au projet"
        description="Vous avez des modifications non sauvegardées. Voulez-vous vraiment revenir au projet sans les enregistrer ?"
        confirmText="Oui, retourner au projet"
        cancelText="Annuler"
        variant="destructive"
      />

      {/* Dialog de confirmation de suppression */}
      <DeleteConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
        title="Supprimer cette menuiserie ?"
        description={`Êtes-vous sûr de vouloir supprimer "${menuiserie?.repere || menuiserie?.intitule}" ? Cette action est irréversible.`}
      />
    </div>
  );
}
