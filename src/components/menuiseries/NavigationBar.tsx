import { ArrowLeft, ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MenuiserieStatus {
  id: string;
  isCompleted: boolean;
}

interface NavigationBarProps {
  hasNext: boolean;
  hasPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  currentPosition: number;
  total: number;
  disabled?: boolean;
  menuiseriesStatus?: MenuiserieStatus[];
}

export function NavigationBar({
  hasNext,
  hasPrevious,
  onNext,
  onPrevious,
  currentPosition,
  total,
  disabled = false,
  menuiseriesStatus = [],
}: NavigationBarProps) {
  const completedCount = menuiseriesStatus.filter((m) => m.isCompleted).length;

  return (
    <div className="space-y-3">
      {/* Progress Dots - hauteur fixe pour éviter le décalage */}
      {menuiseriesStatus.length > 0 && (
        <div className="flex h-8 items-center justify-center gap-2">
          {menuiseriesStatus.map((menuiserie, index) => {
            const isCurrent = index + 1 === currentPosition;
            const isCompleted = menuiserie.isCompleted;

            return (
              <div key={menuiserie.id} className="relative flex h-8 items-center">
                {isCompleted ? (
                  <CheckCircle2
                    className={`h-6 w-6 ${
                      isCurrent
                        ? "text-green-600 fill-green-100"
                        : "text-green-500"
                    }`}
                  />
                ) : (
                  <Circle
                    className={`h-6 w-6 ${
                      isCurrent
                        ? "text-blue-600 fill-blue-100"
                        : "text-gray-300"
                    }`}
                  />
                )}
                {/* Point indicateur positionné en absolu pour ne pas décaler */}
                {isCurrent && (
                  <div className="absolute left-1/2 bottom-0 h-1 w-1 -translate-x-1/2 rounded-full bg-blue-600" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="lg"
          onClick={onPrevious}
          disabled={!hasPrevious || disabled}
          className="h-14 flex-1"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Précédente
        </Button>

        <div className="flex flex-col items-center whitespace-nowrap rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
          <div className="text-center">{currentPosition} / {total}</div>
          {menuiseriesStatus.length > 0 && (
            <div className="text-xs font-semibold text-green-600">
              {completedCount} ✓
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="lg"
          onClick={onNext}
          disabled={!hasNext || disabled}
          className="h-14 flex-1"
        >
          Suivante
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
