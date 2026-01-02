/**
 * Tests du hook useHabillagesPropagation
 * TDD - RED phase: Ces tests doivent échouer avant l'implémentation
 * @see specs/003-habillages-svg-integration/data-model.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHabillagesPropagation } from '@/hooks/useHabillagesPropagation';
import type { HabillageValue } from '@/lib/validations/habillage';

describe('useHabillagesPropagation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should initialize with empty values', () => {
      const { result } = renderHook(() => useHabillagesPropagation());

      expect(result.current.values).toEqual({
        haut: null,
        bas: null,
        gauche: null,
        droite: null,
      });
    });

    it('should initialize with provided values', () => {
      const initialValues = {
        haut: 'Standard' as HabillageValue,
        bas: 'Sans' as HabillageValue,
        gauche: null,
        droite: null,
      };

      const { result } = renderHook(() => useHabillagesPropagation(initialValues));

      expect(result.current.values).toEqual(initialValues);
    });

    it('should have no highlighted sides initially', () => {
      const { result } = renderHook(() => useHabillagesPropagation());

      expect(result.current.highlightedSides.size).toBe(0);
    });
  });

  describe('first selection - propagation', () => {
    it('should propagate value to all sides when all are null', () => {
      const { result } = renderHook(() => useHabillagesPropagation());

      act(() => {
        result.current.handleChange('haut', 'Standard');
      });

      expect(result.current.values).toEqual({
        haut: 'Standard',
        bas: 'Standard',
        gauche: 'Standard',
        droite: 'Standard',
      });
    });

    it('should highlight propagated sides (not the selected one)', () => {
      const { result } = renderHook(() => useHabillagesPropagation());

      act(() => {
        result.current.handleChange('haut', 'Standard');
      });

      // Le côté sélectionné ne doit pas être highlighté
      expect(result.current.highlightedSides.has('haut')).toBe(false);
      // Les côtés propagés doivent être highlightés
      expect(result.current.highlightedSides.has('bas')).toBe(true);
      expect(result.current.highlightedSides.has('gauche')).toBe(true);
      expect(result.current.highlightedSides.has('droite')).toBe(true);
    });

    it('should clear highlight after 300ms', () => {
      const { result } = renderHook(() => useHabillagesPropagation());

      act(() => {
        result.current.handleChange('haut', 'Standard');
      });

      expect(result.current.highlightedSides.size).toBe(3);

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.highlightedSides.size).toBe(0);
    });
  });

  describe('subsequent selection - override', () => {
    it('should only change the selected side after first propagation', () => {
      const { result } = renderHook(() => useHabillagesPropagation());

      // First selection - propagates
      act(() => {
        result.current.handleChange('haut', 'Standard');
      });

      // Clear highlight timer
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Second selection - only changes that side
      act(() => {
        result.current.handleChange('gauche', 'Sans');
      });

      expect(result.current.values).toEqual({
        haut: 'Standard',
        bas: 'Standard',
        gauche: 'Sans',
        droite: 'Standard',
      });
    });

    it('should not propagate after first selection (override only)', () => {
      const { result } = renderHook(() => useHabillagesPropagation());

      // First selection - propagates to all
      act(() => {
        result.current.handleChange('haut', 'Standard');
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Override gauche - no propagation
      act(() => {
        result.current.handleChange('gauche', 'Sans');
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Third selection on bas - no propagation, only changes bas
      act(() => {
        result.current.handleChange('bas', 'Montants');
      });

      expect(result.current.values).toEqual({
        haut: 'Standard', // unchanged
        bas: 'Montants', // just changed
        gauche: 'Sans', // unchanged
        droite: 'Standard', // unchanged (no propagation)
      });
    });

    it('should not highlight on subsequent changes (no propagation)', () => {
      const { result } = renderHook(() => useHabillagesPropagation());

      // First selection - highlights propagated sides
      act(() => {
        result.current.handleChange('haut', 'Standard');
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Second selection - no highlight (no propagation)
      act(() => {
        result.current.handleChange('gauche', 'Sans');
      });

      expect(result.current.highlightedSides.size).toBe(0);
    });
  });

  describe('with initial values', () => {
    it('should not propagate when values already exist', () => {
      const initialValues = {
        haut: 'Standard' as HabillageValue,
        bas: 'Sans' as HabillageValue,
        gauche: 'Haut' as HabillageValue,
        droite: 'Bas' as HabillageValue,
      };

      const { result } = renderHook(() => useHabillagesPropagation(initialValues));

      // Changing haut should not propagate (values already set)
      act(() => {
        result.current.handleChange('haut', 'Montants');
      });

      expect(result.current.values).toEqual({
        haut: 'Montants',
        bas: 'Sans',
        gauche: 'Haut',
        droite: 'Bas',
      });
    });
  });

  describe('applyToAll functionality', () => {
    it('should apply first non-null value to all sides', () => {
      const { result } = renderHook(() => useHabillagesPropagation());

      // Set one value (will propagate due to first selection)
      act(() => {
        result.current.handleChange('haut', 'Standard');
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Now change another to different value
      act(() => {
        result.current.handleChange('gauche', 'Sans');
      });

      // Apply to all should use first non-null (haut = Standard)
      act(() => {
        result.current.applyToAll();
      });

      expect(result.current.values).toEqual({
        haut: 'Standard',
        bas: 'Standard',
        gauche: 'Standard',
        droite: 'Standard',
      });
    });

    it('should highlight all sides except source when applying to all', () => {
      const { result } = renderHook(() => useHabillagesPropagation());

      // Set up mixed values
      act(() => {
        result.current.handleChange('haut', 'Standard');
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      act(() => {
        result.current.handleChange('gauche', 'Sans');
      });

      // Apply to all
      act(() => {
        result.current.applyToAll();
      });

      // Should highlight all except haut (the source)
      expect(result.current.highlightedSides.has('haut')).toBe(false);
      expect(result.current.highlightedSides.has('bas')).toBe(true);
      expect(result.current.highlightedSides.has('gauche')).toBe(true);
      expect(result.current.highlightedSides.has('droite')).toBe(true);
    });

    it('should do nothing if all values are null', () => {
      const { result } = renderHook(() => useHabillagesPropagation());

      const initialValues = result.current.values;

      act(() => {
        result.current.applyToAll();
      });

      expect(result.current.values).toEqual(initialValues);
      expect(result.current.highlightedSides.size).toBe(0);
    });
  });

  describe('hasAnyValue computed property', () => {
    it('should be false when all values are null', () => {
      const { result } = renderHook(() => useHabillagesPropagation());

      expect(result.current.hasAnyValue).toBe(false);
    });

    it('should be true when at least one value is set', () => {
      const { result } = renderHook(() => useHabillagesPropagation());

      act(() => {
        result.current.handleChange('haut', 'Standard');
      });

      expect(result.current.hasAnyValue).toBe(true);
    });

    it('should be true with initial values', () => {
      const initialValues = {
        haut: 'Standard' as HabillageValue,
        bas: null,
        gauche: null,
        droite: null,
      };

      const { result } = renderHook(() => useHabillagesPropagation(initialValues));

      expect(result.current.hasAnyValue).toBe(true);
    });

    it('should be false after reset', () => {
      const { result } = renderHook(() => useHabillagesPropagation());

      act(() => {
        result.current.handleChange('haut', 'Standard');
      });

      expect(result.current.hasAnyValue).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.hasAnyValue).toBe(false);
    });
  });

  describe('reset functionality', () => {
    it('should reset to initial values', () => {
      const { result } = renderHook(() => useHabillagesPropagation());

      act(() => {
        result.current.handleChange('haut', 'Standard');
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.values).toEqual({
        haut: null,
        bas: null,
        gauche: null,
        droite: null,
      });
    });

    it('should clear overridden sides on reset', () => {
      const { result } = renderHook(() => useHabillagesPropagation());

      // Make some changes
      act(() => {
        result.current.handleChange('haut', 'Standard');
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      act(() => {
        result.current.handleChange('gauche', 'Sans');
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      // After reset, first selection should propagate again
      act(() => {
        result.current.handleChange('bas', 'Montants');
      });

      expect(result.current.values).toEqual({
        haut: 'Montants',
        bas: 'Montants',
        gauche: 'Montants',
        droite: 'Montants',
      });
    });
  });
});
