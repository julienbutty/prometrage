"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, MapPin, Phone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  ordre: number;
}

interface Projet {
  id: string;
  reference: string;
  clientNom: string;
  clientAdresse?: string;
  clientTel?: string;
  clientEmail?: string;
  pdfOriginalNom: string;
  pdfUrl: string;
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
      <div className="min-h-screen p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-32 bg-gray-200 rounded" />
          <div className="h-32 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded" />
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
    (m) => m.donneesModifiees !== null && m.donneesModifiees !== undefined
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
            <p className="text-sm lg:text-base text-gray-600 truncate">
              {data.clientNom}
            </p>
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
                    <p className="text-sm font-medium">{data.clientNom}</p>
                  </div>

                  {data.clientAdresse && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Adresse
                      </p>
                      <p className="text-sm">{data.clientAdresse}</p>
                    </div>
                  )}

                  {data.clientTel && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        Téléphone
                      </p>
                      <p className="text-sm">{data.clientTel}</p>
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
                const isCompleted =
                  menuiserie.donneesModifiees !== null &&
                  menuiserie.donneesModifiees !== undefined;

                return (
                  <Card
                    key={menuiserie.id}
                    className={`cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 ${
                      isCompleted ? "border-green-500 border-2" : ""
                    }`}
                    onClick={() => router.push(`/menuiserie/${menuiserie.id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {menuiserie.repere && (
                            <Badge variant="outline" className="text-xs">
                              {menuiserie.repere}
                            </Badge>
                          )}
                          {menuiserie.donneesOriginales.gamme && (
                            <Badge className="text-xs">
                              {menuiserie.donneesOriginales.gamme}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-base line-clamp-2">
                          {menuiserie.intitule}
                        </CardTitle>
                        {isCompleted && (
                          <Badge
                            variant="default"
                            className="text-xs bg-green-600 hover:bg-green-700 w-fit"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Complété
                          </Badge>
                        )}
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
