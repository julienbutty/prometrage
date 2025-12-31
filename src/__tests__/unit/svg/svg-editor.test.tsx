import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MenuiserieSVGEditor } from '@/components/menuiseries/MenuiserieSVGEditor';

describe('MenuiserieSVGEditor', () => {
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
  };

  // T027: Test layout desktop (grid)
  it('should render with grid layout on desktop', () => {
    render(<MenuiserieSVGEditor {...defaultProps} />);

    // Vérifier que le SVG est présent
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();

    // Vérifier que les inputs dimensions sont présents
    expect(screen.getByText('Largeur')).toBeInTheDocument();
    expect(screen.getByText('Hauteur')).toBeInTheDocument();
    expect(screen.getByText("Hauteur d'allège")).toBeInTheDocument();
  });

  // T028: Test layout mobile (flex-col)
  it('should have responsive classes for mobile layout', () => {
    const { container } = render(<MenuiserieSVGEditor {...defaultProps} />);

    // Vérifier la présence de classes responsive
    const gridContainer = container.querySelector('.flex.flex-col');
    expect(gridContainer).toBeInTheDocument();
  });

  it('should display SVG with correct type parsed from typeMenuiserie', () => {
    render(<MenuiserieSVGEditor {...defaultProps} />);

    // Le SVG devrait être présent avec le bon aria-label
    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('aria-label', expect.stringContaining('fenetre'));
  });

  it('should display original values as placeholders', () => {
    render(<MenuiserieSVGEditor {...defaultProps} />);

    // Vérifier que les placeholders contiennent les valeurs originales
    expect(screen.getByPlaceholderText('1200')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('1100')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('900')).toBeInTheDocument();
  });

  it('should display dimension values when provided', () => {
    const propsWithValues = {
      ...defaultProps,
      dimensions: {
        largeur: '1250',
        hauteur: '1150',
        hauteurAllege: '950',
      },
    };

    render(<MenuiserieSVGEditor {...propsWithValues} />);

    // Les valeurs devraient être affichées
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs[0]).toHaveValue(1250);
    expect(inputs[1]).toHaveValue(1150);
    expect(inputs[2]).toHaveValue(950);
  });

  it('should call onDimensionChange when dimension input changes', () => {
    const onDimensionChange = vi.fn();
    render(
      <MenuiserieSVGEditor
        {...defaultProps}
        onDimensionChange={onDimensionChange}
      />
    );

    const largeurInput = screen.getByPlaceholderText('1200');
    fireEvent.change(largeurInput, { target: { value: '1300' } });

    expect(onDimensionChange).toHaveBeenCalledWith('largeur', '1300');
  });

  it('should render habillages when showHabillages is true', () => {
    render(<MenuiserieSVGEditor {...defaultProps} showHabillages={true} />);

    expect(screen.getByText('Habillages intérieurs')).toBeInTheDocument();
    expect(screen.getByText('Habillages extérieurs')).toBeInTheDocument();
  });

  it('should not render habillages when showHabillages is false', () => {
    render(<MenuiserieSVGEditor {...defaultProps} showHabillages={false} />);

    expect(screen.queryByText('Habillages intérieurs')).not.toBeInTheDocument();
    expect(screen.queryByText('Habillages extérieurs')).not.toBeInTheDocument();
  });

  it('should display type menuiserie label', () => {
    render(<MenuiserieSVGEditor {...defaultProps} />);

    expect(screen.getByText('Fenêtre 2 vantaux')).toBeInTheDocument();
  });
});
