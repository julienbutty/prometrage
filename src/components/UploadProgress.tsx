"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Search,
  Frame,
  Ruler,
  Palette,
  Sparkles,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface ProcessingMessage {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Messages variés affichés aléatoirement pendant le traitement
const PROCESSING_MESSAGES: ProcessingMessage[] = [
  {
    label: "Lecture du PDF",
    description: "Chargement du fichier...",
    icon: FileText,
  },
  {
    label: "Analyse du document",
    description: "Détection de la structure du PDF...",
    icon: Search,
  },
  {
    label: "Extraction des menuiseries",
    description: "Identification des fenêtres et portes...",
    icon: Frame,
  },
  {
    label: "Détection des dimensions",
    description: "Lecture des côtes et mesures...",
    icon: Ruler,
  },
  {
    label: "Analyse des finitions",
    description: "Identification des couleurs RAL...",
    icon: Palette,
  },
  {
    label: "Lecture des caractéristiques",
    description: "Extraction des gammes PERFORMAX...",
    icon: Search,
  },
  {
    label: "Analyse des vitrages",
    description: "Détection du double vitrage...",
    icon: Frame,
  },
  {
    label: "Extraction des habillages",
    description: "Lecture des plats et cornières...",
    icon: Ruler,
  },
  {
    label: "Détection des couleurs",
    description: "Analyse des teintes intérieures et extérieures...",
    icon: Palette,
  },
  {
    label: "Analyse des poses",
    description: "Identification du type de pose...",
    icon: Frame,
  },
  {
    label: "Lecture des côtes",
    description: "Extraction largeur et hauteur...",
    icon: Ruler,
  },
  {
    label: "Finalisation",
    description: "Validation des données extraites...",
    icon: Sparkles,
  },
];

interface UploadProgressProps {
  open: boolean;
  fileName?: string;
  isComplete?: boolean; // Contrôlé de l'extérieur par le parent
}

export function UploadProgress({
  open,
  fileName,
  isComplete = false,
}: UploadProgressProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!open) {
      // Reset when dialog closes
      setCurrentMessageIndex(0);
      setProgress(0);
      return;
    }

    if (isComplete) {
      // Progression complète quand terminé
      setProgress(100);
      return;
    }

    // Change de message aléatoirement toutes les 2-3 secondes
    const messageInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * PROCESSING_MESSAGES.length);
      setCurrentMessageIndex(randomIndex);
    }, 2500);

    // Progression indéterminée (0-90%) tant que pas terminé
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        // Augmente lentement jusqu'à 90% max (pour ne pas donner l'impression que c'est fini)
        if (prev >= 90) return 90;
        return prev + Math.random() * 3; // Augmente de 0-3% aléatoirement
      });
    }, 500);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [open, isComplete]);

  const currentMessage = PROCESSING_MESSAGES[currentMessageIndex];
  const Icon = currentMessage.icon;

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-center">
            {isComplete ? "✅ Upload terminé !" : "Traitement du PDF"}
          </DialogTitle>
          {fileName && (
            <DialogDescription className="text-center truncate">
              {fileName}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              {isComplete
                ? "100%"
                : `${Math.round(progress)}% - Traitement en cours...`}
            </p>
          </div>

          {/* Current Message Display */}
          <div className="flex flex-col items-center justify-center space-y-4 min-h-[160px]">
            {isComplete ? (
              <>
                <div className="rounded-full bg-green-100 p-4">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-green-600">
                    Traitement réussi
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Redirection en cours...
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-full bg-blue-100 p-4 relative">
                  <Icon className="h-12 w-12 text-blue-600" />
                  <div className="absolute -bottom-1 -right-1">
                    <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-lg font-semibold">{currentMessage.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {currentMessage.description}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Info message */}
          {!isComplete && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <p className="text-xs text-blue-900">
                ⏳ Le traitement peut prendre quelques secondes...
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
