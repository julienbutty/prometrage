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

    // Le SVG devrait être présent (fenêtre type)
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
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
    // Nouveau layout: Hauteur (row 2) → Largeur (row 3) → Allège (row 3)
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs[0]).toHaveValue(1150); // Hauteur
    expect(inputs[1]).toHaveValue(1250); // Largeur
    expect(inputs[2]).toHaveValue(950);  // Hauteur d'allège
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

    // New design: HabillageGroups with side labels and Int/Ext labels
    expect(screen.getByText('Haut')).toBeInTheDocument();
    expect(screen.getByText('Bas')).toBeInTheDocument();
    expect(screen.getByText('Gauche')).toBeInTheDocument();
    expect(screen.getByText('Droite')).toBeInTheDocument();
    // Int/Ext labels appear multiple times (4 sides × 2)
    expect(screen.getAllByText(/intérieur/i).length).toBeGreaterThanOrEqual(4);
    expect(screen.getAllByText(/extérieur/i).length).toBeGreaterThanOrEqual(4);
  });

  it('should not render habillages when showHabillages is false', () => {
    render(<MenuiserieSVGEditor {...defaultProps} showHabillages={false} />);

    // No habillage groups should be rendered
    expect(screen.queryByTestId('habillage-group')).not.toBeInTheDocument();
  });

  it('should display type menuiserie label', () => {
    render(<MenuiserieSVGEditor {...defaultProps} />);

    expect(screen.getByText('Fenêtre 2 vantaux')).toBeInTheDocument();
  });

  describe('allège removal (US7)', () => {
    it('should NOT render hauteurAllege input in the SVG editor when showAllege is false', () => {
      render(
        <MenuiserieSVGEditor
          {...defaultProps}
          showAllege={false}
        />
      );

      // Hauteur d'allège should NOT be present
      expect(screen.queryByText("Hauteur d'allège")).not.toBeInTheDocument();
    });

    it('should render hauteurAllege input by default (backwards compatibility)', () => {
      render(<MenuiserieSVGEditor {...defaultProps} />);

      // Hauteur d'allège should be present by default
      expect(screen.getByText("Hauteur d'allège")).toBeInTheDocument();
    });
  });

  describe('mobile layout (US6)', () => {
    it('should have flex-col gap-3 as mobile default', () => {
      const { container } = render(<MenuiserieSVGEditor {...defaultProps} />);

      const layoutContainer = container.querySelector('.flex.flex-col.gap-3');
      expect(layoutContainer).toBeInTheDocument();
    });

    it('should have order classes for mobile ordering', () => {
      const { container } = render(
        <MenuiserieSVGEditor {...defaultProps} showHabillages={true} />
      );

      // Check that order classes exist on elements
      expect(container.querySelector('.order-1')).toBeInTheDocument(); // Hab Haut
      expect(container.querySelector('.order-2')).toBeInTheDocument(); // Row with SVG
      expect(container.querySelector('.order-5')).toBeInTheDocument(); // Largeur + Hab Bas
    });

    it('should have sm:flex-row for desktop layout', () => {
      const { container } = render(
        <MenuiserieSVGEditor {...defaultProps} showHabillages={true} />
      );

      // Desktop layout uses sm:flex-row
      const rowElements = container.querySelectorAll('[class*="sm:flex-row"]');
      expect(rowElements.length).toBeGreaterThan(0);
    });

    it('should have flex layout for responsive design', () => {
      const { container } = render(<MenuiserieSVGEditor {...defaultProps} />);

      const layoutContainer = container.querySelector('.flex.flex-col');
      expect(layoutContainer).toBeInTheDocument();
    });
  });
});
