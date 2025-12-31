import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HabillageInputs } from '@/components/menuiseries/HabillageInputs';

describe('HabillageInputs', () => {
  const defaultProps = {
    type: 'interieur' as const,
    values: {
      haut: '',
      bas: '',
      gauche: '',
      droite: '',
    },
    onChange: vi.fn(),
  };

  // T039: Test affiche 4 champs (x2 pour int + ext = 8 total)
  it('should display 4 input fields for one type', () => {
    render(<HabillageInputs {...defaultProps} />);

    // Vérifier les 4 labels
    expect(screen.getByText('Haut')).toBeInTheDocument();
    expect(screen.getByText('Bas')).toBeInTheDocument();
    expect(screen.getByText('Gauche')).toBeInTheDocument();
    expect(screen.getByText('Droite')).toBeInTheDocument();
  });

  // T040: Test placeholders depuis données originales
  it('should display placeholders from original values', () => {
    const propsWithOriginal = {
      ...defaultProps,
      originalValues: {
        haut: 50,
        bas: 60,
        gauche: 70,
        droite: 80,
      },
    };

    render(<HabillageInputs {...propsWithOriginal} />);

    expect(screen.getByPlaceholderText('50')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('60')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('70')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('80')).toBeInTheDocument();
  });

  // T041: Test onChange pour chaque côté
  it('should call onChange with correct side when input changes', () => {
    const onChange = vi.fn();
    render(<HabillageInputs {...defaultProps} onChange={onChange} />);

    // Trouver l'input par son label parent
    const inputs = screen.getAllByRole('spinbutton');

    // Changer la valeur du premier input (haut)
    fireEvent.change(inputs[0], { target: { value: '55' } });
    expect(onChange).toHaveBeenCalledWith('haut', '55');

    // Changer la valeur du second input (bas)
    fireEvent.change(inputs[1], { target: { value: '65' } });
    expect(onChange).toHaveBeenCalledWith('bas', '65');
  });

  it('should display title with type interieur', () => {
    render(<HabillageInputs {...defaultProps} type="interieur" />);
    expect(screen.getByText('Habillages intérieurs')).toBeInTheDocument();
  });

  it('should display title with type exterieur', () => {
    render(<HabillageInputs {...defaultProps} type="exterieur" />);
    expect(screen.getByText('Habillages extérieurs')).toBeInTheDocument();
  });

  it('should display values when provided', () => {
    const propsWithValues = {
      ...defaultProps,
      values: {
        haut: '50',
        bas: '60',
        gauche: '70',
        droite: '80',
      },
    };

    render(<HabillageInputs {...propsWithValues} />);

    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs[0]).toHaveValue(50);
    expect(inputs[1]).toHaveValue(60);
    expect(inputs[2]).toHaveValue(70);
    expect(inputs[3]).toHaveValue(80);
  });
});
