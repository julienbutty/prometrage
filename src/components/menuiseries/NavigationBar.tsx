import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationBarProps {
  hasNext: boolean;
  hasPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  currentPosition: number;
  total: number;
  disabled?: boolean;
}

export function NavigationBar({
  hasNext,
  hasPrevious,
  onNext,
  onPrevious,
  currentPosition,
  total,
  disabled = false,
}: NavigationBarProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="lg"
        onClick={onPrevious}
        disabled={!hasPrevious || disabled}
        className="flex-1 h-14"
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        Précédente
      </Button>

      <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 whitespace-nowrap">
        {currentPosition} / {total}
      </div>

      <Button
        variant="outline"
        size="lg"
        onClick={onNext}
        disabled={!hasNext || disabled}
        className="flex-1 h-14"
      >
        Suivante
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
}
