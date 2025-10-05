"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, MapPin, Phone } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header Mobile */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="p-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{data.reference}</h1>
            <p className="text-sm text-gray-600 truncate">{data.clientNom}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Client Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informations client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Adresse</p>
                <p className="text-sm text-gray-600">
                  {data.clientAdresse || "Non renseignée"}
                </p>
              </div>
            </div>

            {data.clientTel && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Téléphone</p>
                  <p className="text-sm text-gray-600">{data.clientTel}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">PDF original</p>
                <p className="text-sm text-gray-600 truncate">
                  {data.pdfOriginalNom}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menuiseries List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">
              Menuiseries ({data.menuiseries.length})
            </h2>
          </div>

          <div className="space-y-3">
            {data.menuiseries.map((menuiserie) => (
              <Card
                key={menuiserie.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/menuiserie/${menuiserie.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
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
                      <CardTitle className="text-base truncate">
                        {menuiserie.intitule}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Dimensions</p>
                      <p className="font-medium">
                        {menuiserie.donneesOriginales.largeur} ×{" "}
                        {menuiserie.donneesOriginales.hauteur} mm
                      </p>
                    </div>
                    {menuiserie.donneesOriginales.pose && (
                      <div>
                        <p className="text-gray-600">Pose</p>
                        <p className="font-medium capitalize">
                          {menuiserie.donneesOriginales.pose}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
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
    </div>
  );
}
