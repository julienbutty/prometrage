"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { FileDown, Loader2, FileArchive, File } from "lucide-react";
import { toast } from "sonner";
import { getBonCommandeType } from "@/lib/pdf/bon-commande-types";

interface Menuiserie {
  id: string;
  repere: string | null;
  intitule: string;
  donneesOriginales: Record<string, any>;
  donneesModifiees?: Record<string, any> | null;
  validee?: boolean;
  ordre: number;
}

interface BonsCommandeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projetId: string;
  projetReference: string;
  menuiseries: Menuiserie[];
}

export function BonsCommandeDialog({
  open,
  onOpenChange,
  projetId,
  projetReference,
  menuiseries,
}: BonsCommandeDialogProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);

  // Menuiseries validées uniquement
  const validatedMenuiseries = useMemo(
    () => menuiseries.filter((m) => m.validee === true),
    [menuiseries]
  );

  // Groupement par type de bon de commande
  const groupedByType = useMemo(() => {
    const selected = validatedMenuiseries.filter((m) => selectedIds.has(m.id));
    const groups = new Map<string, Menuiserie[]>();

    for (const menuiserie of selected) {
      const type = getBonCommandeType({
        id: menuiserie.id,
        repere: menuiserie.repere,
        intitule: menuiserie.intitule,
        donneesOriginales: menuiserie.donneesOriginales,
        donneesModifiees: menuiserie.donneesModifiees ?? null,
        validee: menuiserie.validee ?? false,
      });

      if (!groups.has(type)) {
        groups.set(type, []);
      }
      groups.get(type)!.push(menuiserie);
    }

    return groups;
  }, [selectedIds, validatedMenuiseries]);

  // Calcul du nombre de PDFs qui seront générés
  const pdfCount = useMemo(() => {
    let count = 0;
    for (const [, items] of groupedByType) {
      count += Math.ceil(items.length / 3); // 3 menuiseries par PDF max
    }
    return count;
  }, [groupedByType]);

  const handleToggleAll = () => {
    if (selectedIds.size === validatedMenuiseries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(validatedMenuiseries.map((m) => m.id)));
    }
  };

  const handleToggle = (menuiserieId: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(menuiserieId)) {
      newSet.delete(menuiserieId);
    } else {
      newSet.add(menuiserieId);
    }
    setSelectedIds(newSet);
  };

  const handleGenerate = async () => {
    if (selectedIds.size === 0) {
      toast.error("Aucune menuiserie sélectionnée");
      return;
    }

    setIsGenerating(true);

    try {
      const menuiserieIds = Array.from(selectedIds).join(",");
      const response = await fetch(
        `/api/projets/${projetId}/bons-commande?menuiserieIds=${menuiserieIds}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Échec de la génération");
      }

      // Télécharger le fichier
      const blob = await response.blob();
      const contentType = response.headers.get("content-type");
      const contentDisposition = response.headers.get("content-disposition");

      // Extraire le nom du fichier
      let filename = `bons-commande-${projetReference}.pdf`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) {
          filename = match[1];
        }
      }

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Bons de commande générés", {
        description: `${pdfCount} PDF téléchargé${pdfCount > 1 ? "s" : ""}`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error generating bons de commande:", error);
      toast.error("Erreur lors de la génération", {
        description:
          error instanceof Error ? error.message : "Une erreur est survenue",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Initialiser avec toutes les menuiseries validées sélectionnées
  useState(() => {
    setSelectedIds(new Set(validatedMenuiseries.map((m) => m.id)));
  });

  if (validatedMenuiseries.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Générer les bons de commande</DialogTitle>
            <DialogDescription>
              Aucune menuiserie validée dans ce projet.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Générer les bons de commande</DialogTitle>
          <DialogDescription>
            Sélectionnez les menuiseries à inclure dans les bons de commande
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Bouton tout sélectionner */}
          <div className="flex items-center justify-between px-1 pb-2 border-b">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleAll}
              className="h-8"
            >
              {selectedIds.size === validatedMenuiseries.length
                ? "Tout désélectionner"
                : "Tout sélectionner"}
            </Button>
            <span className="text-sm text-gray-600">
              {selectedIds.size} / {validatedMenuiseries.length} sélectionnée
              {validatedMenuiseries.length > 1 ? "s" : ""}
            </span>
          </div>

          {/* Liste des menuiseries */}
          <div className="space-y-2">
            {validatedMenuiseries.map((menuiserie) => {
              const isSelected = selectedIds.has(menuiserie.id);

              return (
                <div
                  key={menuiserie.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer hover:bg-gray-50 ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => handleToggle(menuiserie.id)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(menuiserie.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {menuiserie.repere && (
                        <Badge className="text-xs bg-blue-600">
                          {menuiserie.repere}
                        </Badge>
                      )}
                      <span className="text-sm font-medium truncate">
                        {menuiserie.intitule}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {menuiserie.donneesOriginales.largeur} ×{" "}
                      {menuiserie.donneesOriginales.hauteur} mm
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Aperçu du groupement */}
          {selectedIds.size > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <h4 className="text-sm font-semibold mb-2">Aperçu</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  {pdfCount === 1 ? (
                    <>
                      <File className="h-4 w-4 text-blue-600" />
                      <span>1 PDF sera généré</span>
                    </>
                  ) : (
                    <>
                      <FileArchive className="h-4 w-4 text-blue-600" />
                      <span>
                        {pdfCount} PDFs seront générés (archive ZIP)
                      </span>
                    </>
                  )}
                </div>

                {/* Détail par type */}
                {groupedByType.size > 1 && (
                  <div className="pl-6 space-y-1 text-xs">
                    {Array.from(groupedByType.entries()).map(
                      ([type, items]) => (
                        <div key={type} className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                          <span>
                            {type}: {items.length} menuiserie
                            {items.length > 1 ? "s" : ""} →{" "}
                            {Math.ceil(items.length / 3)} PDF
                            {Math.ceil(items.length / 3) > 1 ? "s" : ""}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isGenerating}
          >
            Annuler
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={selectedIds.size === 0 || isGenerating}
            className="min-w-[140px]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Télécharger ({pdfCount})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
