"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Client {
  id: string;
  nom: string;
  email: string | null;
  tel: string | null;
  projetsCount: number;
  lastProjet: string | null;
}

interface ClientsResponse {
  success: boolean;
  data: Client[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ClientsPage() {
  const router = useRouter();

  const { data, isLoading, error } = useQuery<ClientsResponse>({
    queryKey: ["clients"],
    queryFn: async () => {
      const response = await fetch("/api/clients");
      if (!response.ok) {
        throw new Error("Failed to fetch clients");
      }
      return response.json();
    },
  });

  if (error) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
            <CardDescription>
              Impossible de charger les clients
            </CardDescription>
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
            <h1 className="text-lg lg:text-2xl font-bold">Mes Clients</h1>
            {data && (
              <p className="text-sm text-gray-600">
                {data.meta.total} client{data.meta.total > 1 ? "s" : ""}
              </p>
            )}
          </div>
          <Users className="h-6 w-6 text-gray-400" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="p-4">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </Card>
            ))}
          </div>
        ) : data && data.data.length === 0 ? (
          <Card className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun client</h3>
            <p className="text-gray-600 mb-4">
              Commencez par uploader un PDF pour créer votre premier projet
            </p>
            <Button onClick={() => router.push("/")}>
              Aller à l&apos;accueil
            </Button>
          </Card>
        ) : (
          <div className="space-y-3 lg:space-y-4">
            {data?.data.map((client) => (
              <Card
                key={client.id}
                className="
                  p-4 lg:p-6
                  cursor-pointer
                  transition-all
                  hover:shadow-md hover:border-blue-300
                  active:scale-[0.99]
                "
                onClick={() => router.push(`/clients/${client.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Nom client */}
                    <h3 className="text-lg lg:text-xl font-semibold text-gray-900 truncate">
                      {client.nom}
                    </h3>

                    {/* Email */}
                    {client.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}

                    {/* Téléphone */}
                    {client.tel && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>{client.tel}</span>
                      </div>
                    )}
                  </div>

                  {/* Badge nombre projets */}
                  <Badge
                    variant={client.projetsCount > 0 ? "default" : "secondary"}
                    className="text-sm lg:text-base px-3 py-1 flex-shrink-0"
                  >
                    {client.projetsCount} projet
                    {client.projetsCount > 1 ? "s" : ""}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
