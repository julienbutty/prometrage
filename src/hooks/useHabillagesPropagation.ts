/**
 * Hook de gestion de la propagation des habillages
 *
 * Comportement:
 * - Premier changement: propage la valeur à tous les côtés
 * - Changements suivants: modifie uniquement le côté sélectionné
 * - Animation highlight sur les côtés propagés (300ms)
 *
 * @see specs/003-habillages-svg-integration/data-model.md
 */
'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { HabillageValue, Side } from '@/lib/validations/habillage';
import { SIDES, EMPTY_HABILLAGES } from '@/lib/validations/habillage';

export type HabillagesValues = Record<Side, HabillageValue | null>;

interface UseHabillagesPropagationReturn {
  /** Valeurs actuelles des 4 côtés */
  values: HabillagesValues;
  /** Côtés actuellement en animation highlight */
  highlightedSides: Set<Side>;
  /** Handler de changement avec propagation automatique */
  handleChange: (side: Side, value: HabillageValue) => void;
  /** Réinitialise les valeurs et l'état de propagation */
  reset: () => void;
  /** Applique la première valeur non-null à tous les côtés */
  applyToAll: () => void;
  /** Indique si au moins une valeur est définie */
  hasAnyValue: boolean;
}

/**
 * Hook de propagation des habillages
 * @param initialValues - Valeurs initiales (optionnel)
 */
export function useHabillagesPropagation(
  initialValues?: Partial<HabillagesValues>
): UseHabillagesPropagationReturn {
  // Merge initial values with empty defaults (memoized to prevent re-render dependency issues)
  const defaultValues = useMemo<HabillagesValues>(() => ({
    ...EMPTY_HABILLAGES,
    ...initialValues,
  }), [initialValues]);

  // État des valeurs
  const [values, setValues] = useState<HabillagesValues>(defaultValues);

  // État des côtés surchargés (Set pour lookup O(1))
  const [overriddenSides, setOverriddenSides] = useState<Set<Side>>(() => {
    // Si des valeurs initiales sont fournies, tous les côtés non-null sont considérés comme overridden
    const overridden = new Set<Side>();
    if (initialValues) {
      SIDES.forEach((side) => {
        if (initialValues[side] !== undefined && initialValues[side] !== null) {
          overridden.add(side);
        }
      });
    }
    return overridden;
  });

  // État des côtés en highlight
  const [highlightedSides, setHighlightedSides] = useState<Set<Side>>(new Set());

  // Timer ref pour le cleanup
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup du timer au unmount
  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
      }
    };
  }, []);

  /**
   * Déclenche l'animation highlight sur les côtés propagés
   */
  const triggerHighlight = useCallback((sides: Side[]) => {
    // Clear previous timer
    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current);
    }

    setHighlightedSides(new Set(sides));

    // Clear highlight after 300ms
    highlightTimerRef.current = setTimeout(() => {
      setHighlightedSides(new Set());
    }, 300);
  }, []);

  /**
   * Handler de changement avec logique de propagation
   *
   * Comportement selon la spec FR-010/011/012:
   * - Premier changement (tous les côtés null): propager à tous
   * - Changements suivants: modifier uniquement le côté sélectionné (override)
   */
  const handleChange = useCallback(
    (side: Side, value: HabillageValue) => {
      setValues((prevValues) => {
        // Déterminer si c'est le premier changement (tous null ET aucun override)
        const allNull = SIDES.every((s) => prevValues[s] === null);
        const noOverrides = overriddenSides.size === 0;
        const isFirstChange = allNull && noOverrides;

        if (isFirstChange) {
          // Premier changement: propager à tous les côtés
          const newValues: HabillagesValues = {
            haut: value,
            bas: value,
            gauche: value,
            droite: value,
          };

          // Highlight les côtés propagés (pas le côté sélectionné)
          const propagatedSides = SIDES.filter((s) => s !== side);
          triggerHighlight(propagatedSides);

          // Marquer le côté sélectionné comme overridden (premier à être modifié)
          setOverriddenSides(new Set([side]));

          return newValues;
        } else {
          // Changement suivant: modifier UNIQUEMENT le côté sélectionné (pas de propagation)
          const newValues = { ...prevValues, [side]: value };

          // Ajouter le côté sélectionné aux overridden
          setOverriddenSides((prev) => new Set([...prev, side]));

          return newValues;
        }
      });
    },
    [overriddenSides, triggerHighlight]
  );

  /**
   * Réinitialise les valeurs et l'état
   */
  const reset = useCallback(() => {
    setValues(defaultValues);
    setOverriddenSides(new Set());
    setHighlightedSides(new Set());
    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current);
    }
  }, [defaultValues]);

  /**
   * Applique la première valeur non-null à tous les côtés
   * @see specs/005-svg-habillages-redesign/research.md
   */
  const applyToAll = useCallback(() => {
    setValues((prevValues) => {
      // Trouver la première valeur non-null (ordre: haut, bas, gauche, droite)
      const sourceSide = SIDES.find((side) => prevValues[side] !== null);
      if (!sourceSide) return prevValues; // Rien à propager si tout est null

      const valueToApply = prevValues[sourceSide];
      const newValues: HabillagesValues = {
        haut: valueToApply,
        bas: valueToApply,
        gauche: valueToApply,
        droite: valueToApply,
      };

      // Highlight tous les côtés sauf le premier (source)
      const propagatedSides = SIDES.filter((s) => s !== sourceSide);
      triggerHighlight(propagatedSides);

      // Tous les côtés deviennent "overridden"
      setOverriddenSides(new Set(SIDES));

      return newValues;
    });
  }, [triggerHighlight]);

  /**
   * Indique si au moins une valeur est définie
   */
  const hasAnyValue = useMemo(() => {
    return SIDES.some((side) => values[side] !== null);
  }, [values]);

  return {
    values,
    highlightedSides,
    handleChange,
    reset,
    applyToAll,
    hasAnyValue,
  };
}

export default useHabillagesPropagation;
