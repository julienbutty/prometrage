/**
 * Tests du composant ApplyToAllButton
 * TDD - RED phase: Ces tests doivent échouer avant l'implémentation
 * @see specs/005-svg-habillages-redesign/spec.md (US5)
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApplyToAllButton } from '@/components/menuiseries/ApplyToAllButton';

describe('ApplyToAllButton', () => {
  const defaultProps = {
    type: 'interieur' as const,
    onApply: vi.fn(),
    disabled: false,
  };

  describe('rendering', () => {
    it('should render a button with "Appliquer à tous" text', () => {
      render(<ApplyToAllButton {...defaultProps} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText(/appliquer/i)).toBeInTheDocument();
    });

    it('should display type-specific label for interieur', () => {
      render(<ApplyToAllButton {...defaultProps} type="interieur" />);

      // Should mention Int or Intérieur
      expect(screen.getByText(/int/i)).toBeInTheDocument();
    });

    it('should display type-specific label for exterieur', () => {
      render(<ApplyToAllButton {...defaultProps} type="exterieur" />);

      // Should mention Ext or Extérieur
      expect(screen.getByText(/ext/i)).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should have blue styling for interieur type', () => {
      const { container } = render(
        <ApplyToAllButton {...defaultProps} type="interieur" />
      );

      const button = container.querySelector('button');
      expect(button?.className).toMatch(/blue/);
    });

    it('should have orange styling for exterieur type', () => {
      const { container } = render(
        <ApplyToAllButton {...defaultProps} type="exterieur" />
      );

      const button = container.querySelector('button');
      expect(button?.className).toMatch(/orange/);
    });

    it('should have touch-friendly min height', () => {
      const { container } = render(<ApplyToAllButton {...defaultProps} />);

      const button = container.querySelector('button');
      // Should have at least min-h-[40px] or similar
      expect(button?.className).toMatch(/min-h-\[40px\]|h-10/);
    });
  });

  describe('interaction', () => {
    it('should call onApply when clicked', async () => {
      const onApply = vi.fn();
      const user = userEvent.setup();

      render(<ApplyToAllButton {...defaultProps} onApply={onApply} />);

      await user.click(screen.getByRole('button'));

      expect(onApply).toHaveBeenCalledTimes(1);
    });

    it('should not call onApply when disabled', async () => {
      const onApply = vi.fn();
      const user = userEvent.setup();

      render(
        <ApplyToAllButton {...defaultProps} onApply={onApply} disabled={true} />
      );

      await user.click(screen.getByRole('button'));

      expect(onApply).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<ApplyToAllButton {...defaultProps} disabled={true} />);

      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should have reduced opacity when disabled', () => {
      const { container } = render(
        <ApplyToAllButton {...defaultProps} disabled={true} />
      );

      const button = container.querySelector('button');
      expect(button?.className).toMatch(/opacity|disabled/);
    });
  });
});
