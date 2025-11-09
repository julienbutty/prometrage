"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { CreateClientDialog } from "./CreateClientDialog";

interface CreateProjetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (projetId: string) => void;
  preselectedClientId?: string;
}

interface Client {
  id: string;
  nom: string;
  email: string | null;
  tel: string | null;
}

/**
 * Modal de création manuelle d'un projet
 * Permet de sélectionner un client existant ou d'en créer un nouveau
 */
export function CreateProjetDialog({
  open,
  onOpenChange,
  onSuccess,
  preselectedClientId,
}: CreateProjetDialogProps) {
  const queryClient = useQueryClient();
  const haptic = useHapticFeedback();

  const [reference, setReference] = useState("");
  const [adresse, setAdresse] = useState("");
  const [clientId, setClientId] = useState(preselectedClientId || "");
  const [showCreateClient, setShowCreateClient] = useState(false);

  // Charger la liste des clients
  const { data: clientsData, isLoading: isLoadingClients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const response = await fetch("/api/clients");
      if (!response.ok) throw new Error("Failed to fetch clients");
      const result = await response.json();
      return result.data as Client[];
    },
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      reference: string;
      adresse: string | null;
      clientId: string;
    }) => {
      const response = await fetch("/api/projets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to create projet");
      }

      return response.json();
    },
    onSuccess: (result) => {
      haptic.success();
      toast.success("Projet créé avec succès");
      queryClient.invalidateQueries({ queryKey: ["projets"] });
      if (clientId) {
        queryClient.invalidateQueries({ queryKey: ["client", clientId] });
      }

      // Reset form
      setReference("");
      setAdresse("");
      setClientId("");

      onOpenChange(false);

      if (onSuccess) {
        onSuccess(result.data.id);
      }
    },
    onError: (error) => {
      haptic.error();
      toast.error("Erreur lors de la création", {
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reference.trim()) {
      toast.error("La référence est obligatoire");
      return;
    }

    if (!clientId) {
      toast.error("Veuillez sélectionner un client");
      return;
    }

    createMutation.mutate({
      reference: reference.trim(),
      adresse: adresse.trim() || null,
      clientId,
    });
  };

  const handleClientCreated = (newClientId: string) => {
    setClientId(newClientId);
    setShowCreateClient(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] mx-4">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-xl">Nouveau projet</DialogTitle>
              <DialogDescription>
                Créer un nouveau projet manuellement
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reference" className="text-base">
                  Référence <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Ex: PROJET-2025-001"
                  className="h-12 text-base"
                  disabled={createMutation.isPending}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adresse" className="text-base">
                  Adresse
                </Label>
                <Input
                  id="adresse"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  placeholder="Ex: 123 rue de la Paix, Paris"
                  className="h-12 text-base"
                  disabled={createMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="client" className="text-base">
                    Client <span className="text-red-600">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateClient(true)}
                    disabled={createMutation.isPending}
                    className="h-8 text-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Nouveau client
                  </Button>
                </div>
                {isLoadingClients ? (
                  <div className="h-12 flex items-center justify-center border rounded-md">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <Select
                    value={clientId}
                    onValueChange={setClientId}
                    disabled={createMutation.isPending}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientsData?.map((client) => (
                        <SelectItem
                          key={client.id}
                          value={client.id}
                          className="h-12 text-base"
                        >
                          {client.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createMutation.isPending}
                className="h-12 text-base"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || !reference.trim() || !clientId}
                className="h-12 text-base"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  "Créer le projet"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de création de client */}
      <CreateClientDialog
        open={showCreateClient}
        onOpenChange={setShowCreateClient}
        onSuccess={handleClientCreated}
      />
    </>
  );
}
