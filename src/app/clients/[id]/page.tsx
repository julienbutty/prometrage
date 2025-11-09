"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { toast } from "sonner";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Projet {
  id: string;
  reference: string;
  adresse: string | null;
  pdfUrl: string;
  createdAt: string;
  menuiseriesCount: number;
}

interface Client {
  id: string;
  nom: string;
  email: string | null;
  tel: string | null;
  projets: Projet[];
  stats: {
    totalProjets: number;
  };
}

interface ClientDetailResponse {
  success: boolean;
  data: Client;
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const queryClient = useQueryClient();
  const haptic = useHapticFeedback();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data, isLoading, error } = useQuery<ClientDetailResponse>({
    queryKey: ["client", clientId],
    queryFn: async () => {
      const response = await fetch(`/api/clients/${clientId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch client");
      }
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to delete client");
      }
      return response.json();
    },
    onSuccess: (data) => {
      haptic.success();
      toast.success("Client supprimé", {
        description: `${data.data.deletedProjets} projet(s) supprimé(s)`,
      });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      router.push("/clients");
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
    setShowDeleteDialog(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto p-4 animate-pulse">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-4 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !data || !data.success) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
            <CardDescription>Impossible de charger le client</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/clients")} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux clients
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const client = data.data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Responsive */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto p-4 lg:px-8 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/clients")}
            className="h-11 w-11"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg lg:text-2xl font-bold truncate">
              {client.nom}
            </h1>
            <p className="text-sm text-gray-600">
              {client.stats.totalProjets} projet
              {client.stats.totalProjets > 1 ? "s" : ""}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDeleteDialog(true)}
            className="h-11 w-11 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar - Infos Client */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="lg:sticky lg:top-24">
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
                    <p className="text-sm font-medium">{client.nom}</p>
                  </div>

                  {client.email && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        Email
                      </p>
                      <a
                        href={`mailto:${client.email}`}
                        className="text-sm text-blue-600 hover:underline break-all"
                      >
                        {client.email}
                      </a>
                    </div>
                  )}

                  {client.tel && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        Téléphone
                      </p>
                      <a
                        href={`tel:${client.tel}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {client.tel}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main - Liste Projets */}
          <div className="lg:col-span-8 xl:col-span-9">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl lg:text-2xl font-bold">Projets</h2>
              <Badge variant="outline" className="text-sm">
                {client.projets.length} projet
                {client.projets.length > 1 ? "s" : ""}
              </Badge>
            </div>

            {client.projets.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun projet</h3>
                <p className="text-gray-600 mb-4">
                  Ce client n&apos;a pas encore de projet
                </p>
                <Button onClick={() => router.push("/")}>
                  Uploader un PDF
                </Button>
              </Card>
            ) : (
              <div className="space-y-3 lg:space-y-4">
                {client.projets.map((projet) => (
                  <Card
                    key={projet.id}
                    className="
                      p-4 lg:p-6
                      cursor-pointer
                      transition-all
                      hover:shadow-md hover:border-blue-300
                      active:scale-[0.99]
                    "
                    onClick={() => router.push(`/projet/${projet.id}`)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Référence projet */}
                        <h3 className="text-lg lg:text-xl font-semibold text-gray-900">
                          {projet.reference}
                        </h3>

                        {/* Adresse */}
                        {projet.adresse && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{projet.adresse}</span>
                          </div>
                        )}

                        {/* Date création */}
                        <p className="text-xs text-gray-500">
                          Créé le{" "}
                          {new Date(projet.createdAt).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>

                      {/* Badge nombre menuiseries */}
                      <Badge
                        variant="secondary"
                        className="text-sm px-3 py-1 flex-shrink-0"
                      >
                        {projet.menuiseriesCount} menuiserie
                        {projet.menuiseriesCount > 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog de confirmation de suppression */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
        title="Supprimer ce client ?"
        description={`Êtes-vous sûr de vouloir supprimer "${client.nom}" ? Cette action supprimera également tous les projets et menuiseries associés. Cette action est irréversible.`}
      />
    </div>
  );
}
