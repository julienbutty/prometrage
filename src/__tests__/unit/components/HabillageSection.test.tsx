/**
 * Tests du composant HabillageSection
 * TDD - RED phase: Ces tests doivent échouer avant l'implémentation
 * @see specs/003-habillages-svg-integration/spec.md
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HabillageSection } from '@/components/menuiseries/HabillageSection';
import type { HabillageValue } from '@/lib/validations/habillage';
import { HABILLAGES_PVC } from '@/lib/validations/habillage';

// Options de test basées sur la config PVC (par défaut)
const defaultOptions = HABILLAGES_PVC.interieurs;

describe('HabillageSection', () => {
  const defaultProps = {
    type: 'interieur' as const,
    values: {
      haut: null as HabillageValue | null,
      bas: null as HabillageValue | null,
      gauche: null as HabillageValue | null,
      droite: null as HabillageValue | null,
    },
    onChange: vi.fn(),
    options: defaultOptions,
  };

  describe('rendering', () => {
    it('should render title for interieur type', () => {
      render(<HabillageSection {...defaultProps} type="interieur" />);

      expect(screen.getByText(/habillages intérieurs/i)).toBeInTheDocument();
    });

    it('should render title for exterieur type', () => {
      render(<HabillageSection {...defaultProps} type="exterieur" />);

      expect(screen.getByText(/habillages extérieurs/i)).toBeInTheDocument();
    });

    it('should render 4 selects for all sides', () => {
      render(<HabillageSection {...defaultProps} />);

      expect(screen.getAllByRole('combobox')).toHaveLength(4);
    });

    it('should display labels for all sides', () => {
      render(<HabillageSection {...defaultProps} />);

      expect(screen.getByText('Haut')).toBeInTheDocument();
      expect(screen.getByText('Bas')).toBeInTheDocument();
      expect(screen.getByText('Gauche')).toBeInTheDocument();
      expect(screen.getByText('Droite')).toBeInTheDocument();
    });
  });

  describe('visual distinction', () => {
    it('should have blue border for interieur type', () => {
      render(<HabillageSection {...defaultProps} type="interieur" />);

      const section = screen.getByTestId('habillage-section');
      expect(section.className).toMatch(/border-blue/);
    });

    it('should have orange border for exterieur type', () => {
      render(<HabillageSection {...defaultProps} type="exterieur" />);

      const section = screen.getByTestId('habillage-section');
      expect(section.className).toMatch(/border-orange/);
    });
  });

  describe('value display', () => {
    it('should display current values in selects', () => {
      const values = {
        haut: 'Standard' as HabillageValue,
        bas: 'Sans' as HabillageValue,
        gauche: null,
        droite: 'Montants' as HabillageValue,
      };

      render(<HabillageSection {...defaultProps} values={values} />);

      const comboboxes = screen.getAllByRole('combobox');
      expect(comboboxes[0]).toHaveTextContent('Standard');
      expect(comboboxes[1]).toHaveTextContent('Sans habillage'); // Label shown for value 'Sans'
      expect(comboboxes[2]).toHaveTextContent('Sélectionner');
      expect(comboboxes[3]).toHaveTextContent('Montants (G+D)'); // Label shown for value 'Montants'
    });
  });

  describe('onChange callback', () => {
    it('should call onChange with side and value when select changes', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(<HabillageSection {...defaultProps} onChange={onChange} />);

      // Click first select (haut)
      const comboboxes = screen.getAllByRole('combobox');
      await user.click(comboboxes[0]);

      // Select "Standard"
      await user.click(screen.getByRole('option', { name: /Standard/i }));

      expect(onChange).toHaveBeenCalledWith('haut', 'Standard');
    });
  });

  describe('highlighted sides', () => {
    it('should highlight specified sides', () => {
      const highlightedSides = new Set(['bas', 'gauche', 'droite'] as const);

      render(
        <HabillageSection
          {...defaultProps}
          highlightedSides={highlightedSides}
        />
      );

      const comboboxes = screen.getAllByRole('combobox');

      // haut should not be highlighted
      expect(comboboxes[0].className).not.toMatch(/ring-blue/);

      // bas, gauche, droite should be highlighted
      expect(comboboxes[1].className).toMatch(/ring/);
      expect(comboboxes[2].className).toMatch(/ring/);
      expect(comboboxes[3].className).toMatch(/ring/);
    });
  });
});
