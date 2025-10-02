"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { ProjectList } from "@/components/ProjectList";
import { UploadButton } from "@/components/UploadButton";

export default function Home() {
  const [projects] = useState([
    // Données mockées pour commencer
    {
      id: "1",
      nomClient: "M. Dupont",
      adresse: "12 rue de la Paix, 75001 Paris",
      createdAt: new Date("2025-01-15"),
    },
    {
      id: "2",
      nomClient: "Mme Martin",
      adresse: "34 avenue Victor Hugo, 69002 Lyon",
      createdAt: new Date("2025-01-20"),
    },
  ]);

  const handleUpload = async (file: File) => {
    console.log("Uploading file:", file.name);
    // TODO: Implémenter l'upload et le parsing du PDF
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto">
        {/* Section Upload - Mobile First */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                Mes Projets
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Gérez vos prises de côtes de menuiseries
              </p>
            </div>
            <UploadButton onUpload={handleUpload} />
          </div>
        </div>

        {/* Liste des projets */}
        <ProjectList projects={projects} />
      </main>
    </div>
  );
}
