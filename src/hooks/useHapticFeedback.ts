import { useCallback } from "react";

/**
 * Hook pour le retour haptique (vibration) sur mobile
 * Supporte l'API Vibration Web (disponible sur la plupart des mobiles)
 */
export function useHapticFeedback() {
  /**
   * Vérifie si l'API Vibration est disponible
   */
  const isSupported = typeof window !== "undefined" && "vibrate" in navigator;

  /**
   * Feedback léger (10ms) - Pour les clics, sélections
   */
  const light = useCallback(() => {
    if (isSupported) {
      navigator.vibrate(10);
    }
  }, [isSupported]);

  /**
   * Feedback moyen (20ms) - Pour les enregistrements, modifications
   */
  const medium = useCallback(() => {
    if (isSupported) {
      navigator.vibrate(20);
    }
  }, [isSupported]);

  /**
   * Feedback fort (30ms) - Pour les validations, succès importants
   */
  const heavy = useCallback(() => {
    if (isSupported) {
      navigator.vibrate(30);
    }
  }, [isSupported]);

  /**
   * Pattern de succès (courte-pause-courte)
   */
  const success = useCallback(() => {
    if (isSupported) {
      navigator.vibrate([15, 50, 15]);
    }
  }, [isSupported]);

  /**
   * Pattern d'erreur (3 vibrations rapides)
   */
  const error = useCallback(() => {
    if (isSupported) {
      navigator.vibrate([10, 30, 10, 30, 10]);
    }
  }, [isSupported]);

  return {
    isSupported,
    light,
    medium,
    heavy,
    success,
    error,
  };
}
