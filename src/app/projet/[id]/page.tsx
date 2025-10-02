"use client";

import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function ProjetPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // TODO: Fetch project data from API
  const projet = {
    id,
    nomClient: "M. Dupont",
    adresse: "12 rue de la Paix, 75001 Paris",
    createdAt: new Date("2025-01-15"),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Navigation */}
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux projets
        </Button>

        {/* Project Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
            {projet.nomClient}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {projet.adresse}
          </p>
        </div>

        {/* Menuiseries Section */}
        <Card>
          <CardHeader>
            <CardTitle>Menuiseries</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Aucune menuiserie pour ce projet.
              <br />
              Uploadez un PDF pour commencer.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
