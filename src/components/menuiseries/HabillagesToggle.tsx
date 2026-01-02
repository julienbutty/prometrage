"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface HabillagesToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}

export function HabillagesToggle({
  isOpen,
  onToggle,
  disabled = false,
  className,
}: HabillagesToggleProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onToggle}
      disabled={disabled}
      aria-expanded={isOpen}
      className={cn("min-h-[44px] gap-2", className)}
    >
      {isOpen ? (
        <>
          <ChevronUp className="h-4 w-4" data-testid="chevron-up" />
          Masquer habillages
        </>
      ) : (
        <>
          <ChevronDown className="h-4 w-4" data-testid="chevron-down" />
          Afficher habillages
        </>
      )}
    </Button>
  );
}
