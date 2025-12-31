import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MenuiserieSVG } from '@/components/menuiseries/MenuiserieSVG';

// T015: Test composant MenuiserieSVG render avec props
describe('MenuiserieSVG', () => {
  it('should render with fenetre type and 2 vantaux', () => {
    render(<MenuiserieSVG type="fenetre" nbVantaux={2} />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should render with porte-fenetre type and 1 vantail', () => {
    render(<MenuiserieSVG type="porte-fenetre" nbVantaux={1} />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should render with coulissant type and 3 vantaux', () => {
    render(<MenuiserieSVG type="coulissant" nbVantaux={3} />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should render with chassis-fixe type', () => {
    render(<MenuiserieSVG type="chassis-fixe" nbVantaux={0} />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should render with chassis-soufflet type', () => {
    render(<MenuiserieSVG type="chassis-soufflet" nbVantaux={1} />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <MenuiserieSVG type="fenetre" nbVantaux={1} className="custom-class" />
    );
    const svg = document.querySelector('svg');
    expect(svg).toHaveClass('custom-class');
  });

  it('should apply custom width and height', () => {
    render(
      <MenuiserieSVG type="fenetre" nbVantaux={1} width={300} height={200} />
    );
    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 300 200');
  });

  it('should use default width and height when not provided', () => {
    render(<MenuiserieSVG type="fenetre" nbVantaux={1} />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 200 150');
  });
});
