/**
 * Tests du composant HabillageGroup
 * TDD - RED phase: Ces tests doivent échouer avant l'implémentation
 * @see specs/005-svg-habillages-redesign/spec.md (US1, US2)
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HabillageGroup } from '@/components/menuiseries/HabillageGroup';
import { HABILLAGES_PVC } from '@/lib/validations/habillage';

const mockOptions = HABILLAGES_PVC;

describe('HabillageGroup', () => {
  const defaultProps = {
    side: 'haut' as const,
    values: {
      interieur: null,
      exterieur: null,
    },
    onIntChange: vi.fn(),
    onExtChange: vi.fn(),
    options: mockOptions,
  };

  describe('rendering', () => {
    it('should render Int and Ext selectors for a side', () => {
      render(<HabillageGroup {...defaultProps} />);

      // Should have labels for both selectors
      expect(screen.getByText(/intérieur/i)).toBeInTheDocument();
      expect(screen.getByText(/extérieur/i)).toBeInTheDocument();
    });

    it('should display the side label', () => {
      render(<HabillageGroup {...defaultProps} side="gauche" />);

      // The side label "Gauche" should appear
      expect(screen.getByText(/gauche/i)).toBeInTheDocument();
    });

    it('should render with vertical orientation by default', () => {
      const { container } = render(<HabillageGroup {...defaultProps} />);

      // Should have flex-col class for vertical stacking
      const group = container.querySelector('[data-testid="habillage-group"]');
      expect(group).toHaveClass('flex-col');
    });

    it('should render with horizontal orientation when specified', () => {
      const { container } = render(
        <HabillageGroup {...defaultProps} orientation="horizontal" />
      );

      // Should NOT have flex-col class
      const group = container.querySelector('[data-testid="habillage-group"]');
      expect(group).not.toHaveClass('flex-col');
    });
  });

  describe('value display', () => {
    it('should display current values', () => {
      render(
        <HabillageGroup
          {...defaultProps}
          values={{
            interieur: 'Standard',
            exterieur: 'Sans',
          }}
        />
      );

      expect(screen.getByText('Standard')).toBeInTheDocument();
      expect(screen.getByText('Sans habillage')).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('should call onIntChange when interieur value changes', async () => {
      const onIntChange = vi.fn();
      const user = userEvent.setup();

      render(
        <HabillageGroup
          {...defaultProps}
          onIntChange={onIntChange}
        />
      );

      // Find and click the intérieur select trigger
      const intSelect = screen.getAllByRole('combobox')[0];
      await user.click(intSelect);

      // Click on an option
      const option = screen.getByText('Standard');
      await user.click(option);

      expect(onIntChange).toHaveBeenCalledWith('Standard');
    });

    it('should call onExtChange when exterieur value changes', async () => {
      const onExtChange = vi.fn();
      const user = userEvent.setup();

      render(
        <HabillageGroup
          {...defaultProps}
          onExtChange={onExtChange}
        />
      );

      // Find and click the extérieur select trigger (second combobox)
      const extSelect = screen.getAllByRole('combobox')[1];
      await user.click(extSelect);

      // Click on an option
      const option = screen.getByText('Sans habillage');
      await user.click(option);

      expect(onExtChange).toHaveBeenCalledWith('Sans');
    });
  });

  describe('highlight animation', () => {
    it('should pass highlightInt to interieur selector', () => {
      const { container } = render(
        <HabillageGroup
          {...defaultProps}
          highlightInt={true}
        />
      );

      // The intérieur select should have ring classes
      const intSelect = container.querySelectorAll('[role="combobox"]')[0];
      expect(intSelect).toHaveClass('ring-2');
    });

    it('should pass highlightExt to exterieur selector', () => {
      const { container } = render(
        <HabillageGroup
          {...defaultProps}
          highlightExt={true}
        />
      );

      // The extérieur select should have ring classes
      const extSelect = container.querySelectorAll('[role="combobox"]')[1];
      expect(extSelect).toHaveClass('ring-2');
    });
  });
});
