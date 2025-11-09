"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  MapPin,
  Phone,
  CheckCircle2,
  Circle,
  Clock,
  DoorOpen,
  Maximize2,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { detectMateriau, detectPose, detectTypeProduit } from "@/lib/utils/menuiserie-type";
import { MenuiserieCardSkeleton } from "@/components/skeletons/MenuiserieCardSkeleton";

interface Menuiserie {
  id: string;
  repere: string | null;
  intitule: string;
  donneesOriginales: {
    largeur: number;
    hauteur: number;
    gamme?: string;
    pose?: string;
    [key: string]: any;
  };
  donneesModifiees?: Record<string, any> | null;
  validee?: boolean;
  ordre: number;
}

interface Projet {
  id: string;
  reference: string;
  adresse: string | null;
  pdfOriginalNom: string;
  pdfUrl: string;
  client: {
    id: string;
    nom: string;
    email: string | null;
    tel: string | null;
  };
  menuiseries: Menuiserie[];
  createdAt: string;
}

export default function ProjetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projetId = params.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ["projet", projetId],
    queryFn: async () => {
      const response = await fetch(`/api/projets/${projetId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch projet");
      }
      const result = await response.json();
      return result.data as Projet;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header skeleton */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto p-4 lg:px-8 flex items-center gap-4">
            <div className="h-10 w-10 bg-gray-200 rounded animate-pulse" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-6 lg:h-8 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Main content skeleton */}
        <div className="max-w-7xl mx-auto p-4 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar skeleton */}
            <div className="lg:col-span-4 xl:col-span-3">
              <Card>
                <CardHeader>
                  <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Menuiseries grid skeleton */}
            <div className="lg:col-span-8 xl:col-span-9">
              <div className="mb-4 space-y-2">
                <div className="h-6 lg:h-7 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <MenuiserieCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
            <CardDescription>Impossible de charger le projet</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/")} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l&apos;accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedCount = data.menuiseries.filter(
    (m) => m.validee === true
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Responsive */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto p-4 lg:px-8 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg lg:text-2xl font-bold truncate">
              {data.reference}
            </h1>
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/clients/${data.client.id}`);
              }}
              className="text-sm lg:text-base text-blue-600 hover:underline truncate text-left"
            >
              {data.client.nom}
            </button>
          </div>
          <Badge
            variant={
              completedCount === data.menuiseries.length
                ? "default"
                : "secondary"
            }
            className="text-sm lg:text-base px-3 py-1"
          >
            {completedCount} / {data.menuiseries.length} ✓
          </Badge>
        </div>
      </div>

      {/* Main Content - Responsive Layout */}
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar Client Info - Desktop: sticky, Mobile: normal */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="lg:sticky lg:top-24 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base lg:text-lg">
                    Informations client
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Nom
                    </p>
                    <button
                      onClick={() => router.push(`/clients/${data.client.id}`)}
                      className="text-sm font-medium text-blue-600 hover:underline text-left"
                    >
                      {data.client.nom}
                    </button>
                  </div>

                  {data.adresse && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Adresse chantier
                      </p>
                      <p className="text-sm">{data.adresse}</p>
                    </div>
                  )}

                  {data.client.tel && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        Téléphone
                      </p>
                      <a
                        href={`tel:${data.client.tel}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {data.client.tel}
                      </a>
                    </div>
                  )}

                  <div className="space-y-1 pt-2 border-t">
                    <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      PDF original
                    </p>
                    <p className="text-sm truncate" title={data.pdfOriginalNom}>
                      {data.pdfOriginalNom}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* CTA Desktop */}
              <Button
                className="w-full h-12 text-base hidden lg:flex"
                onClick={() => {
                  if (data.menuiseries.length > 0) {
                    router.push(`/menuiserie/${data.menuiseries[0].id}`);
                  }
                }}
                disabled={data.menuiseries.length === 0}
              >
                Commencer la prise de côtes
              </Button>
            </div>
          </div>

          {/* Menuiseries Grid - Responsive */}
          <div className="lg:col-span-8 xl:col-span-9">
            <div className="mb-4">
              <h2 className="text-lg lg:text-xl font-semibold">
                Menuiseries ({data.menuiseries.length})
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Cliquez sur une menuiserie pour démarrer la prise de côtes
              </p>
            </div>

            {/* Grid responsive: 1 col mobile, 2 cols tablet, 3 cols desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {data.menuiseries.map((menuiserie) => {
                // Détection automatique du type
                const materiau = detectMateriau(menuiserie.donneesOriginales);
                const pose = detectPose(menuiserie.donneesOriginales);
                const typeProduit = detectTypeProduit(menuiserie.donneesOriginales);

                // Icône selon le type de produit
                const ProductIcon =
                  typeProduit === "PORTE"
                    ? DoorOpen
                    : typeProduit === "COULISSANT"
                    ? Maximize2
                    : Home;

                // Statut visuel basé sur le champ validee
                const statut = menuiserie.validee
                  ? "VALIDEE"
                  : menuiserie.donneesModifiees
                  ? "EN_COURS"
                  : "IMPORTEE";
                const statutConfig = {
                  VALIDEE: {
                    icon: CheckCircle2,
                    label: "Validée",
                    bgColor: "bg-green-600",
                    borderColor: "border-green-500",
                    textColor: "text-green-600",
                  },
                  EN_COURS: {
                    icon: Clock,
                    label: "En cours",
                    bgColor: "bg-orange-500",
                    borderColor: "border-orange-400",
                    textColor: "text-orange-600",
                  },
                  IMPORTEE: {
                    icon: Circle,
                    label: "À faire",
                    bgColor: "bg-gray-400",
                    borderColor: "border-gray-300",
                    textColor: "text-gray-600",
                  },
                };

                const StatusIcon = statutConfig[statut].icon;

                return (
                  <Card
                    key={menuiserie.id}
                    className={`cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-2 ${statutConfig[statut].borderColor}`}
                    onClick={() => router.push(`/menuiserie/${menuiserie.id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="space-y-3">
                        {/* Ligne 1 : Repère uniquement */}
                        {menuiserie.repere && (
                          <Badge className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 px-3 py-1 truncate max-w-full" title={menuiserie.repere}>
                            {menuiserie.repere}
                          </Badge>
                        )}

                        {/* Ligne 2 : Intitulé */}
                        <CardTitle className="text-base line-clamp-2">
                          {menuiserie.intitule}
                        </CardTitle>

                        {/* Ligne 3 : Badges techniques */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Badge ALU/PVC */}
                          <Badge
                            className={`text-xs ${
                              materiau === "ALU"
                                ? "bg-slate-700 hover:bg-slate-800"
                                : "bg-white text-gray-800 border-2 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {materiau}
                          </Badge>

                          {/* Badge NEUF/RENO */}
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              pose === "NEUF" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {pose}
                          </Badge>

                          {/* Badge Gamme si disponible */}
                          {menuiserie.donneesOriginales.gamme && (
                            <Badge variant="outline" className="text-xs">
                              {menuiserie.donneesOriginales.gamme}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Dimensions
                        </p>
                        <p className="text-sm font-medium">
                          {menuiserie.donneesOriginales.largeur} ×{" "}
                          {menuiserie.donneesOriginales.hauteur} mm
                        </p>
                      </div>
                      {menuiserie.donneesOriginales.pose && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Pose
                          </p>
                          <p className="text-sm font-medium capitalize">
                            {menuiserie.donneesOriginales.pose}
                          </p>
                        </div>
                      )}

                      {/* Affichage couleurs si disponibles */}
                      {(menuiserie.donneesOriginales.couleurInt || menuiserie.donneesOriginales.couleurExt) && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Couleurs
                          </p>
                          <div className="flex items-center gap-2 text-xs">
                            {menuiserie.donneesOriginales.couleurInt && (
                              <span className="px-2 py-1 rounded bg-gray-100 border">
                                Int: {menuiserie.donneesOriginales.couleurInt}
                              </span>
                            )}
                            {menuiserie.donneesOriginales.couleurExt && (
                              <span className="px-2 py-1 rounded bg-gray-100 border">
                                Ext: {menuiserie.donneesOriginales.couleurExt}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button - Mobile Only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <Button
          className="w-full h-14 text-lg"
          onClick={() => {
            if (data.menuiseries.length > 0) {
              router.push(`/menuiserie/${data.menuiseries[0].id}`);
            }
          }}
          disabled={data.menuiseries.length === 0}
        >
          Commencer la prise de côtes
        </Button>
      </div>

      {/* Bottom padding for mobile fixed button */}
      <div className="lg:hidden h-24" />
    </div>
  );
}
