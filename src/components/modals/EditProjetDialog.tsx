"use client";

import { useState, useEffect } from "react";
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

interface EditProjetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projetId: string;
  initialReference: string;
  initialAdresse: string | null;
  clientId: string;
}

/**
 * Modal d'édition d'un projet
 * Permet de modifier la référence et l'adresse
 */
export function EditProjetDialog({
  open,
  onOpenChange,
  projetId,
  initialReference,
  initialAdresse,
  clientId,
}: EditProjetDialogProps) {
  const queryClient = useQueryClient();
  const haptic = useHapticFeedback();

  const [reference, setReference] = useState(initialReference);
  const [adresse, setAdresse] = useState(initialAdresse || "");

  // Reset form when dialog opens with new data
  useEffect(() => {
    if (open) {
      setReference(initialReference);
      setAdresse(initialAdresse || "");
    }
  }, [open, initialReference, initialAdresse]);

  const updateMutation = useMutation({
    mutationFn: async (data: { reference: string; adresse: string | null }) => {
      const response = await fetch(`/api/projets/${projetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to update projet");
      }

      return response.json();
    },
    onSuccess: () => {
      haptic.medium();
      toast.success("Projet modifié avec succès");
      queryClient.invalidateQueries({ queryKey: ["projet", projetId] });
      queryClient.invalidateQueries({ queryKey: ["projets"] });
      queryClient.invalidateQueries({ queryKey: ["client", clientId] });
      onOpenChange(false);
    },
    onError: (error) => {
      haptic.error();
      toast.error("Erreur lors de la modification", {
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

    updateMutation.mutate({
      reference: reference.trim(),
      adresse: adresse.trim() || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] mx-4">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl">Modifier le projet</DialogTitle>
            <DialogDescription>
              Modifier la référence et l'adresse du projet
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
                disabled={updateMutation.isPending}
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
                disabled={updateMutation.isPending}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
              className="h-12 text-base"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending || !reference.trim()}
              className="h-12 text-base"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Modification...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
