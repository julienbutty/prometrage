"use client";

import { useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";

interface UploadButtonProps {
  onUpload: (file: File) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function UploadButton({
  onUpload,
  isLoading = false,
  disabled = false,
}: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={handleChange}
        disabled={disabled || isLoading}
      />
      <Button
        onClick={handleClick}
        disabled={disabled || isLoading}
        className="
          w-full min-h-[44px]
          sm:w-auto sm:min-w-[200px]
        "
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Téléchargement...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-5 w-5" />
            Uploader un PDF
          </>
        )}
      </Button>
    </>
  );
}
