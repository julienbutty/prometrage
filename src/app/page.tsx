"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { ProjectList } from "@/components/ProjectList";
import { UploadButton } from "@/components/UploadButton";
import { UploadProgress } from "@/components/UploadProgress";

interface Projet {
  id: string;
  reference: string;
  adresse: string | null;
  createdAt: string;
  client: {
    id: string;
    nom: string;
    email: string | null;
    tel: string | null;
  };
  _count: {
    menuiseries: number;
  };
}

export default function Home() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);

  const { data: projets = [], isLoading } = useQuery({
    queryKey: ["projets"],
    queryFn: async () => {
      const response = await fetch("/api/projets");
      if (!response.ok) {
        throw new Error("Failed to fetch projets");
      }
      const result = await response.json();
      return result.data as Projet[];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploadingFile(file.name); // Show progress modal

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Upload failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success("PDF uploadé avec succès", {
        description: `${data.data.parseStatus.total} menuiserie(s) détectée(s)`,
      });
      queryClient.invalidateQueries({ queryKey: ["projets"] });
      // Don't close progress modal yet - it will auto-close and redirect
      setTimeout(() => {
        setUploadingFile(null);
        router.push(`/projet/${data.data.projetId}`);
      }, 1500);
    },
    onError: (error: Error) => {
      setUploadingFile(null); // Close progress modal
      toast.error("Erreur d'upload", {
        description: error.message,
      });
    },
  });

  const projects = projets.map((p) => ({
    id: p.id,
    nomClient: p.client.nom,
    adresse: p.adresse || "",
    createdAt: new Date(p.createdAt),
  }));

  const handleUpload = async (file: File) => {
    uploadMutation.mutate(file);
  };

  const handleProgressComplete = () => {
    // Progress modal completed - will redirect via onSuccess
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-10 w-48 bg-gray-200 rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

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
            <UploadButton
              onUpload={handleUpload}
              isLoading={uploadMutation.isPending}
            />
          </div>
        </div>

        {/* Liste des projets */}
        <ProjectList projects={projects} />
      </main>

      {/* Upload Progress Modal */}
      <UploadProgress
        open={!!uploadingFile}
        fileName={uploadingFile || undefined}
        isComplete={uploadMutation.isSuccess}
      />
    </div>
  );
}
