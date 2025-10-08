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
      {/* Progress Dots */}
      {menuiseriesStatus.length > 0 && (
        <div className="flex items-center justify-center gap-2">
          {menuiseriesStatus.map((menuiserie, index) => {
            const isCurrent = index + 1 === currentPosition;
            const isCompleted = menuiserie.isCompleted;

            return (
              <div key={menuiserie.id} className="flex flex-col items-center">
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
                {isCurrent && (
                  <div className="mt-1 h-1 w-1 rounded-full bg-blue-600" />
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
          className="flex-1 h-14"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Précédente
        </Button>

        <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 whitespace-nowrap">
          <div className="text-center">{currentPosition} / {total}</div>
          {menuiseriesStatus.length > 0 && (
            <div className="text-xs text-green-600 font-semibold">
              {completedCount} ✓
            </div>
          )}
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
    </div>
  );
}
