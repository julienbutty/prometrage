import { Loader2, ArrowDown } from "lucide-react";

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  shouldTriggerRefresh: boolean;
}

/**
 * Indicateur visuel pour le pull-to-refresh
 * Affiche une flèche ou un spinner selon l'état
 */
export function PullToRefreshIndicator({
  pullDistance,
  isRefreshing,
  shouldTriggerRefresh,
}: PullToRefreshIndicatorProps) {
  // Calculer l'opacité basée sur la distance
  const opacity = Math.min(pullDistance / 80, 1);

  // Calculer la rotation de la flèche (0° à 180°)
  const rotation = shouldTriggerRefresh ? 180 : (pullDistance / 80) * 180;

  if (pullDistance === 0 && !isRefreshing) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none"
      style={{
        height: `${pullDistance}px`,
        opacity: isRefreshing ? 1 : opacity,
        transition: isRefreshing ? "height 0.2s ease-out" : "none",
      }}
    >
      <div
        className="flex items-center justify-center bg-white rounded-full shadow-lg"
        style={{
          width: "40px",
          height: "40px",
          transform: `translateY(${Math.max(0, pullDistance - 50)}px)`,
          transition: isRefreshing ? "transform 0.2s ease-out" : "none",
        }}
      >
        {isRefreshing ? (
          <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
        ) : (
          <ArrowDown
            className="h-5 w-5 text-blue-600 transition-transform duration-200"
            style={{
              transform: `rotate(${rotation}deg)`,
            }}
          />
        )}
      </div>
    </div>
  );
}
