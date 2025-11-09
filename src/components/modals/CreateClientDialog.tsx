"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";

interface CreateClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (clientId: string) => void;
}

/**
 * Modal de création manuelle d'un client
 * Mobile-first avec validation
 */
export function CreateClientDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateClientDialogProps) {
  const queryClient = useQueryClient();
  const haptic = useHapticFeedback();

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");

  const createMutation = useMutation({
    mutationFn: async (data: { nom: string; email: string | null; tel: string | null }) => {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to create client");
      }

      return response.json();
    },
    onSuccess: (result) => {
      haptic.success();
      toast.success("Client créé avec succès");
      queryClient.invalidateQueries({ queryKey: ["clients"] });

      // Reset form
      setNom("");
      setEmail("");
      setTel("");

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

    if (!nom.trim()) {
      toast.error("Le nom est obligatoire");
      return;
    }

    createMutation.mutate({
      nom: nom.trim(),
      email: email.trim() || null,
      tel: tel.trim() || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] mx-4">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl">Nouveau client</DialogTitle>
            <DialogDescription>
              Créer un nouveau client manuellement
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nom" className="text-base">
                Nom <span className="text-red-600">*</span>
              </Label>
              <Input
                id="nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex: Jean Dupont"
                className="h-12 text-base"
                disabled={createMutation.isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: jean.dupont@email.com"
                className="h-12 text-base"
                disabled={createMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tel" className="text-base">
                Téléphone
              </Label>
              <Input
                id="tel"
                type="tel"
                value={tel}
                onChange={(e) => setTel(e.target.value)}
                placeholder="Ex: 06 12 34 56 78"
                className="h-12 text-base"
                disabled={createMutation.isPending}
              />
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
              disabled={createMutation.isPending || !nom.trim()}
              className="h-12 text-base"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer le client"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
