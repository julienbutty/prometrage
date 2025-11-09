import { useCallback, useEffect, useRef, useState } from "react";

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  pullThreshold?: number;
  maxPullDistance?: number;
  isEnabled?: boolean;
}

/**
 * Hook pour implémenter le pull-to-refresh sur mobile
 * Détecte le geste de tirage vers le bas et déclenche un refresh
 */
export function usePullToRefresh({
  onRefresh,
  pullThreshold = 80,
  maxPullDistance = 120,
  isEnabled = true,
}: UsePullToRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const startY = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!isEnabled || isRefreshing) return;

      // Ne déclencher que si on est en haut de la page
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      if (scrollTop === 0) {
        startY.current = e.touches[0].clientY;
        setIsPulling(true);
      }
    },
    [isEnabled, isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isPulling || !isEnabled || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;

      // Ne permettre que le pull vers le bas
      if (distance > 0) {
        // Appliquer une résistance (effet élastique)
        const adjustedDistance = Math.min(
          distance * 0.5,
          maxPullDistance
        );
        setPullDistance(adjustedDistance);

        // Empêcher le scroll natif pendant le pull
        if (adjustedDistance > 10) {
          e.preventDefault();
        }
      }
    },
    [isPulling, isEnabled, isRefreshing, maxPullDistance]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || !isEnabled) return;

    setIsPulling(false);

    // Si on a dépassé le seuil, déclencher le refresh
    if (pullDistance >= pullThreshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      // Sinon, réinitialiser
      setPullDistance(0);
    }
  }, [isPulling, isEnabled, pullDistance, pullThreshold, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isEnabled) return;

    // Options pour les événements tactiles passifs
    const options = { passive: false };

    container.addEventListener("touchstart", handleTouchStart, options);
    container.addEventListener("touchmove", handleTouchMove, options);
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isEnabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  const shouldTriggerRefresh = pullDistance >= pullThreshold;

  return {
    containerRef,
    isPulling,
    isRefreshing,
    pullDistance,
    shouldTriggerRefresh,
  };
}
