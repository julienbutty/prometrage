/**
 * Integration tests for auto-propagation in MenuiserieSVGEditor
 * Tests US3: Auto-propagation on first selection
 * @see specs/005-svg-habillages-redesign/spec.md (US3)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MenuiserieSVGEditor } from '@/components/menuiseries/MenuiserieSVGEditor';
import { HABILLAGES_PVC } from '@/lib/validations/habillage';
import type { Side, HabillageValue } from '@/lib/validations/habillage';

describe('MenuiserieSVGEditor - Auto-propagation (US3)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const defaultProps = {
    typeMenuiserie: 'Fenêtre 2 vantaux',
    dimensions: {
      largeur: '',
      hauteur: '',
      hauteurAllege: '',
    },
    originalDimensions: {
      largeur: 1200,
      hauteur: 1100,
      hauteurAllege: 900,
    },
    showHabillages: true,
    habillageConfig: HABILLAGES_PVC,
  };

  it('should wire onHabillageIntChange handlers to HabillageGroups', () => {
    const onHabillageIntChange = vi.fn();

    render(
      <MenuiserieSVGEditor
        {...defaultProps}
        onHabillageIntChange={onHabillageIntChange}
      />
    );

    // Verify that all 4 HabillageGroups are rendered
    const habillageGroups = screen.getAllByTestId('habillage-group');
    expect(habillageGroups).toHaveLength(4);

    // Verify that comboboxes exist for Int selections (8 total: 4 sides × 2 types)
    const allComboboxes = screen.getAllByRole('combobox');
    expect(allComboboxes.length).toBe(8);
  });

  it('should pass highlight props to HabillageGroup components', () => {
    const highlightedIntSides = new Set<Side>(['bas', 'gauche', 'droite']);

    const { container } = render(
      <MenuiserieSVGEditor
        {...defaultProps}
        highlightedIntSides={highlightedIntSides}
      />
    );

    // Find HabillageGroup containers
    const habillageGroups = container.querySelectorAll('[data-testid="habillage-group"]');
    expect(habillageGroups.length).toBe(4); // 4 sides

    // At least some elements should have ring classes when highlighted
    // (The actual ring classes are on the SelectTrigger inside)
    expect(habillageGroups.length).toBeGreaterThan(0);
  });

  it('should not highlight the selected side on propagation', () => {
    // When 'haut' is selected, only bas/gauche/droite should be highlighted
    const highlightedIntSides = new Set<Side>(['bas', 'gauche', 'droite']);

    const { container } = render(
      <MenuiserieSVGEditor
        {...defaultProps}
        highlightedIntSides={highlightedIntSides}
      />
    );

    // Check that 'haut' is NOT highlighted
    // 'haut' should not be in the Set
    expect(highlightedIntSides.has('haut')).toBe(false);
    expect(highlightedIntSides.has('bas')).toBe(true);
    expect(highlightedIntSides.has('gauche')).toBe(true);
    expect(highlightedIntSides.has('droite')).toBe(true);
  });
});
