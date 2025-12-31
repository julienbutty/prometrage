import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DimensionInput } from '@/components/menuiseries/DimensionInput';

describe('DimensionInput', () => {
  // T025: Test placeholder depuis données originales
  it('should display placeholder from original value', () => {
    const onChange = vi.fn();
    render(
      <DimensionInput
        label="Largeur"
        name="largeur"
        originalValue={1200}
        value=""
        onChange={onChange}
      />
    );

    const input = screen.getByPlaceholderText('1200');
    expect(input).toBeInTheDocument();
  });

  // T026: Test onChange avec valeur numérique
  it('should call onChange with numeric value', () => {
    const onChange = vi.fn();
    render(
      <DimensionInput
        label="Largeur"
        name="largeur"
        originalValue={1200}
        value=""
        onChange={onChange}
      />
    );

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '1250' } });

    expect(onChange).toHaveBeenCalledWith('1250');
  });

  it('should display label correctly', () => {
    const onChange = vi.fn();
    render(
      <DimensionInput
        label="Hauteur"
        name="hauteur"
        value="1100"
        onChange={onChange}
      />
    );

    expect(screen.getByText('Hauteur')).toBeInTheDocument();
  });

  it('should display unit when provided', () => {
    const onChange = vi.fn();
    render(
      <DimensionInput
        label="Largeur"
        name="largeur"
        value="1200"
        onChange={onChange}
        unit="mm"
      />
    );

    expect(screen.getByText('mm')).toBeInTheDocument();
  });

  it('should display value when provided', () => {
    const onChange = vi.fn();
    render(
      <DimensionInput
        label="Largeur"
        name="largeur"
        value="1250"
        onChange={onChange}
      />
    );

    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue(1250);
  });

  it('should handle null originalValue gracefully', () => {
    const onChange = vi.fn();
    render(
      <DimensionInput
        label="Allège"
        name="allege"
        originalValue={null}
        value=""
        onChange={onChange}
      />
    );

    const input = screen.getByRole('spinbutton');
    expect(input).toBeInTheDocument();
  });
});
