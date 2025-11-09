"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { Header } from "@/components/layout/Header";
import { ProjectList } from "@/components/ProjectList";
import { UploadButton } from "@/components/UploadButton";
import { UploadProgress } from "@/components/UploadProgress";
import { ProjectCardSkeleton } from "@/components/skeletons/ProjectCardSkeleton";
import { PullToRefreshIndicator } from "@/components/PullToRefreshIndicator";

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
  const haptic = useHapticFeedback();

  const { data: projets = [], isLoading, refetch } = useQuery({
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

  // Pull-to-refresh avec feedback haptique
  const {
    containerRef,
    isPulling,
    isRefreshing,
    pullDistance,
    shouldTriggerRefresh,
  } = usePullToRefresh({
    onRefresh: async () => {
      haptic.light();
      await refetch();
    },
    isEnabled: !isLoading,
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
        const errorMessage = error.error?.message || "Upload failed";
        const errorDetails = error.error?.details?.reason || error.error?.details?.suggestion;
        throw new Error(errorDetails ? `${errorMessage}\n${errorDetails}` : errorMessage);
      }

      return response.json();
    },
    onSuccess: (data) => {
      haptic.success();
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
      haptic.error();
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
        <main className="flex-1 container mx-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              {/* Title skeleton */}
              <div className="space-y-2">
                <div className="h-8 sm:h-10 lg:h-12 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 sm:h-5 w-64 bg-gray-200 rounded animate-pulse" />
              </div>
              {/* Upload button skeleton */}
              <div className="h-12 w-full sm:w-48 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Project cards skeleton grid */}
            <div className="w-full grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" ref={containerRef}>
      <PullToRefreshIndicator
        pullDistance={pullDistance}
        isRefreshing={isRefreshing}
        shouldTriggerRefresh={shouldTriggerRefresh}
      />

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
