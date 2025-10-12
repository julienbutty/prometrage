"use client";

import { useState, useRef } from "react";
import { Camera, X, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import imageCompression from "browser-image-compression";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  type PhotoObservation,
  PHOTO_CONSTRAINTS,
  calculateBase64Size,
} from "@/lib/validations/photo-observation";
import { toast } from "sonner";

interface PhotoUploadProps {
  photos: PhotoObservation[];
  onChange: (photos: PhotoObservation[]) => void;
  maxPhotos?: number;
}

export default function PhotoUpload({
  photos,
  onChange,
  maxPhotos = PHOTO_CONSTRAINTS.MAX_PHOTOS,
}: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isMaxReached = photos.length >= maxPhotos;
  const currentPhoto = photos[currentPhotoIndex];

  /**
   * Convert File to base64 data URL
   */
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  /**
   * Format bytes to human readable size
   */
  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  /**
   * Handle file selection and compression
   */
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const file = files[0];

      // Validate file type
      if (!PHOTO_CONSTRAINTS.ALLOWED_TYPES.includes(file.type as any)) {
        toast.error("Format non supporté", {
          description: "Seuls les formats JPEG, PNG et WebP sont acceptés.",
        });
        return;
      }

      // Compress image
      const options = {
        maxSizeMB: PHOTO_CONSTRAINTS.MAX_SIZE_MB,
        maxWidthOrHeight: PHOTO_CONSTRAINTS.MAX_DIMENSION,
        useWebWorker: true,
        fileType: file.type,
        initialQuality: PHOTO_CONSTRAINTS.COMPRESSION_QUALITY,
      };

      const compressedFile = await imageCompression(file, options);

      // Convert to base64
      const base64 = await fileToBase64(compressedFile);

      // Calculate final size
      const finalSize = calculateBase64Size(base64);

      // Validate size
      if (finalSize > PHOTO_CONSTRAINTS.MAX_SIZE_BYTES) {
        toast.error("Photo trop volumineuse", {
          description: `La photo fait ${formatBytes(finalSize)}, max ${formatBytes(PHOTO_CONSTRAINTS.MAX_SIZE_BYTES)}`,
        });
        return;
      }

      // Create photo object
      const newPhoto: PhotoObservation = {
        id: crypto.randomUUID(),
        base64,
        nom: file.name,
        taille: finalSize,
        dateAjout: new Date().toISOString(),
        compressed: true,
      };

      // Add to photos array
      onChange([...photos, newPhoto]);

      toast.success("Photo ajoutée", {
        description: `${file.name} (${formatBytes(finalSize)})`,
      });
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Erreur lors de l'ajout de la photo");
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  /**
   * Handle photo deletion
   */
  const handleDelete = (photoId: string) => {
    onChange(photos.filter((p) => p.id !== photoId));
    toast.success("Photo supprimée");
  };

  /**
   * Open lightbox on photo click
   */
  const handlePhotoClick = (index: number) => {
    setCurrentPhotoIndex(index);
    setLightboxOpen(true);
  };

  /**
   * Navigate to next photo in lightbox
   */
  const handleNext = () => {
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  /**
   * Navigate to previous photo in lightbox
   */
  const handlePrevious = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isMaxReached || isUploading}
          className="h-14 flex-1 sm:flex-initial"
        >
          <Camera className="mr-2 h-5 w-5" />
          {isUploading ? "Compression..." : "Ajouter photo"}
        </Button>

        {photos.length > 0 && (
          <span className="text-sm text-gray-600">
            {photos.length} photo{photos.length > 1 ? "s" : ""}
          </span>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Ajouter photo"
        />
      </div>

      {/* Max reached alert */}
      {isMaxReached && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Maximum de {maxPhotos} photos atteint. Supprimez une photo pour en ajouter une nouvelle.
          </AlertDescription>
        </Alert>
      )}

      {/* Photos grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="group relative aspect-square overflow-hidden rounded-lg border bg-gray-100"
            >
              {/* Photo thumbnail - clickable */}
              <img
                src={photo.base64}
                alt={photo.nom}
                className="h-full w-full object-cover cursor-pointer"
                onClick={() => handlePhotoClick(index)}
              />

              {/* Delete button in top-right corner */}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation(); // Empêcher l'ouverture de la lightbox
                  handleDelete(photo.id);
                }}
                className="absolute top-2 right-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 shadow-lg z-10"
                aria-label={`Supprimer ${photo.nom}`}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Photo info */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-xs text-white pointer-events-none">
                <p className="truncate font-medium">{photo.nom}</p>
                <p className="text-gray-300">{formatBytes(photo.taille)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Dialog */}
      {currentPhoto && (
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className="max-w-[95vw] h-[95vh] sm:max-w-5xl p-0 flex flex-col">
            {/* Header simple avec juste le titre, X à droite (auto par shadcn) */}
            <div className="p-4 sm:p-6 border-b">
              <DialogTitle className="text-lg font-semibold">
                {currentPhoto.nom}
              </DialogTitle>
            </div>

            {/* Photo container */}
            <div className="flex-1 relative bg-black/5 flex items-center justify-center overflow-hidden">
              <img
                src={currentPhoto.base64}
                alt={`Agrandir ${currentPhoto.nom}`}
                className="max-w-full max-h-full object-contain"
              />

              {/* Navigation buttons */}
              {photos.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handlePrevious}
                    disabled={currentPhotoIndex === 0}
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/90 hover:bg-white"
                    aria-label="Précédent"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>

                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleNext}
                    disabled={currentPhotoIndex === photos.length - 1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/90 hover:bg-white"
                    aria-label="Suivant"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>

            {/* Photo info footer */}
            <div className="p-4 sm:p-6 border-t bg-gray-50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Taille : {formatBytes(currentPhoto.taille)}
                </span>
                {photos.length > 1 && (
                  <span className="text-gray-600 font-medium">
                    {currentPhotoIndex + 1} / {photos.length}
                  </span>
                )}
                <span className="text-gray-500">
                  {new Date(currentPhoto.dateAjout).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
