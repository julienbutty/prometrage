/**
 * Tests du composant HabillageSelect
 * TDD - RED phase: Ces tests doivent échouer avant l'implémentation
 * @see specs/003-habillages-svg-integration/spec.md
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HabillageSelect } from '@/components/menuiseries/HabillageSelect';
import { HABILLAGES_PVC, type HabillageOption } from '@/lib/validations/habillage';

// Options de test basées sur la config PVC (par défaut)
const defaultOptions: HabillageOption[] = HABILLAGES_PVC.interieurs;

describe('HabillageSelect', () => {
  const defaultProps = {
    side: 'haut' as const,
    value: null,
    onChange: vi.fn(),
    options: defaultOptions,
  };

  describe('rendering', () => {
    it('should render a select trigger', () => {
      render(<HabillageSelect {...defaultProps} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should display label for the side', () => {
      render(<HabillageSelect {...defaultProps} />);

      expect(screen.getByText('Haut')).toBeInTheDocument();
    });

    it('should display placeholder when no value', () => {
      render(<HabillageSelect {...defaultProps} value={null} />);

      expect(screen.getByRole('combobox')).toHaveTextContent('Sélectionner');
    });

    it('should display current value when set', () => {
      render(<HabillageSelect {...defaultProps} value="Standard" />);

      expect(screen.getByRole('combobox')).toHaveTextContent('Standard');
    });
  });

  describe('options', () => {
    it('should show habillage options when opened', async () => {
      const user = userEvent.setup();
      render(<HabillageSelect {...defaultProps} />);

      await user.click(screen.getByRole('combobox'));

      // Check that options are rendered (first 3 visible in test environment)
      expect(screen.getByRole('option', { name: /Standard/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /Sans habillage/i })).toBeInTheDocument();
    });
  });

  describe('selection', () => {
    it('should call onChange when option selected', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      render(<HabillageSelect {...defaultProps} onChange={onChange} />);

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: /Standard/i }));

      expect(onChange).toHaveBeenCalledWith('Standard');
    });
  });

  describe('highlight animation', () => {
    it('should apply highlight class when isHighlighted is true', () => {
      render(<HabillageSelect {...defaultProps} isHighlighted />);

      const trigger = screen.getByRole('combobox');
      expect(trigger.className).toMatch(/ring/);
    });

    it('should not apply highlight class when isHighlighted is false', () => {
      render(<HabillageSelect {...defaultProps} isHighlighted={false} />);

      const trigger = screen.getByRole('combobox');
      expect(trigger.className).not.toMatch(/ring-blue/);
    });
  });

  describe('accessibility', () => {
    it('should have accessible label', () => {
      render(<HabillageSelect {...defaultProps} />);

      expect(screen.getByRole('combobox')).toHaveAccessibleName(/haut/i);
    });

    it('should have minimum touch target of 40px', () => {
      render(<HabillageSelect {...defaultProps} />);

      const trigger = screen.getByRole('combobox');
      expect(trigger.className).toMatch(/min-h-\[40px\]/);
    });
  });

  describe('variant styling (US2)', () => {
    it('should apply blue border for interieur variant', () => {
      render(<HabillageSelect {...defaultProps} variant="interieur" />);

      const trigger = screen.getByRole('combobox');
      expect(trigger.className).toMatch(/border-blue-500/);
    });

    it('should apply orange border for exterieur variant', () => {
      render(<HabillageSelect {...defaultProps} variant="exterieur" />);

      const trigger = screen.getByRole('combobox');
      expect(trigger.className).toMatch(/border-orange-500/);
    });

    it('should apply border-2 for pill styling when variant is set', () => {
      render(<HabillageSelect {...defaultProps} variant="interieur" />);

      const trigger = screen.getByRole('combobox');
      expect(trigger.className).toMatch(/border-2/);
    });

    it('should not apply variant styling when variant is undefined', () => {
      render(<HabillageSelect {...defaultProps} />);

      const trigger = screen.getByRole('combobox');
      expect(trigger.className).not.toMatch(/border-blue-500/);
      expect(trigger.className).not.toMatch(/border-orange-500/);
    });

    it('should apply variant-specific ring on highlight for interieur', () => {
      render(<HabillageSelect {...defaultProps} variant="interieur" isHighlighted />);

      const trigger = screen.getByRole('combobox');
      expect(trigger.className).toMatch(/ring-blue-400/);
      expect(trigger.className).toMatch(/bg-blue-50/);
    });

    it('should apply variant-specific ring on highlight for exterieur', () => {
      render(<HabillageSelect {...defaultProps} variant="exterieur" isHighlighted />);

      const trigger = screen.getByRole('combobox');
      expect(trigger.className).toMatch(/ring-orange-400/);
      expect(trigger.className).toMatch(/bg-orange-50/);
    });
  });
});
