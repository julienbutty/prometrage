"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HelpIconProps {
  pdfUrl: string;
  className?: string;
}

export default function HelpIcon({ pdfUrl, className }: HelpIconProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        aria-label="Aide"
        className={cn(
          "h-8 w-8 rounded-full p-0 hover:bg-blue-50",
          className
        )}
      >
        <HelpCircle className="h-5 w-5 text-blue-600" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-full h-[95vh] max-w-full sm:max-w-4xl sm:h-[90vh] flex flex-col p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Document d&apos;aide</DialogTitle>
            <DialogClose asChild>
              <Button
                variant="ghost"
                aria-label="Fermer"
                className="h-10 w-10 sm:h-auto sm:w-auto"
              >
                ×
              </Button>
            </DialogClose>
          </DialogHeader>
          <div className="flex-1 overflow-hidden mt-4">
            <iframe
              src={pdfUrl}
              title="Document d'aide"
              className="w-full h-full border-0 rounded-md"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
