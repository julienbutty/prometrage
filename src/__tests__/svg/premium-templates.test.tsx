/**
 * Tests pour les templates SVG avec le nouveau design
 * @see specs/008-svg-design-migration/spec.md
 *
 * Tests de structure et de rendu pour les templates SVG migrés
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  getFenetreSVG,
  getPorteFenetreSVG,
  getCoulissantSVG,
  getChassisFixeSVG,
  getChassissouffletSVG,
} from '@/lib/svg/menuiserie-templates';

describe('getFenetreSVG - New Design', () => {
  it('should render SVG with correct viewBox', () => {
    const { container } = render(getFenetreSVG(2, 200, 150));
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 200 150');
  });

  it('should render frame with rounded corners', () => {
    const { container } = render(getFenetreSVG(1, 200, 150));
    const frame = container.querySelector('rect[rx="2"]');
    expect(frame).toBeTruthy();
  });

  it('should render glass with semi-transparent fill', () => {
    const { container } = render(getFenetreSVG(1, 200, 150));
    const rects = container.querySelectorAll('rect');
    const hasTransparentGlass = Array.from(rects).some(
      (rect) =>
        rect.getAttribute('fill')?.includes('rgba') ||
        rect.getAttribute('fill')?.includes('0.3')
    );
    expect(hasTransparentGlass).toBe(true);
  });

  it('should render panels for multiple vantaux', () => {
    const { container } = render(getFenetreSVG(2, 200, 150));
    const panelGroups = container.querySelectorAll('g');
    expect(panelGroups.length).toBeGreaterThan(0);
  });

  it('should render opening indicator for battant', () => {
    const { container } = render(
      getFenetreSVG(1, 200, 150, 'battant', 'droite')
    );
    const indicator = container.querySelector('.opening-indicator');
    expect(indicator).toBeTruthy();
  });

  it('should render handle rectangles', () => {
    const { container } = render(
      getFenetreSVG(1, 200, 150, 'battant', 'droite')
    );
    const handles = container.querySelectorAll('rect');
    // Frame + panel frame + glass + handle = at least 4 rects
    expect(handles.length).toBeGreaterThanOrEqual(4);
  });
});

describe('getPorteFenetreSVG - New Design', () => {
  it('should render SVG with correct viewBox', () => {
    const { container } = render(getPorteFenetreSVG(2, 200, 150));
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 200 150');
  });

  it('should render with soubassement panel', () => {
    const { container } = render(getPorteFenetreSVG(1, 200, 150));
    // Porte-fenêtre has extra rect for bottom panel
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThan(3);
  });

  it('should render frame with rounded corners', () => {
    const { container } = render(getPorteFenetreSVG(1, 200, 150));
    const frame = container.querySelector('rect[rx="2"]');
    expect(frame).toBeTruthy();
  });
});

describe('getCoulissantSVG - New Design', () => {
  it('should render SVG with correct viewBox', () => {
    const { container } = render(getCoulissantSVG(2, 200, 150));
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 200 150');
  });

  it('should render with arrow marker definition', () => {
    const { container } = render(getCoulissantSVG(2, 200, 150));
    const defs = container.querySelector('defs');
    expect(defs).toBeTruthy();

    const marker = defs?.querySelector('marker');
    expect(marker).toBeTruthy();
  });

  it('should render sliding arrows', () => {
    const { container } = render(getCoulissantSVG(2, 200, 150));
    const lines = container.querySelectorAll('line');
    expect(lines.length).toBeGreaterThan(0);
  });

  it('should render rails at bottom', () => {
    const { container } = render(getCoulissantSVG(2, 200, 150));
    const rails = container.querySelector('.rails');
    expect(rails).toBeTruthy();
  });

  it('should render frame with rounded corners', () => {
    const { container } = render(getCoulissantSVG(2, 200, 150));
    const frame = container.querySelector('rect[rx="2"]');
    expect(frame).toBeTruthy();
  });
});

describe('getChassisFixeSVG - New Design', () => {
  it('should render SVG with correct viewBox', () => {
    const { container } = render(getChassisFixeSVG(200, 150));
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 200 150');
  });

  it('should render cross lines for fixed frame indication', () => {
    const { container } = render(getChassisFixeSVG(200, 150));
    const lines = container.querySelectorAll('line');
    expect(lines.length).toBeGreaterThanOrEqual(2);
  });

  it('should render frame with rounded corners', () => {
    const { container } = render(getChassisFixeSVG(200, 150));
    const frame = container.querySelector('rect[rx="2"]');
    expect(frame).toBeTruthy();
  });

  it('should render glass with semi-transparent fill', () => {
    const { container } = render(getChassisFixeSVG(200, 150));
    const rects = container.querySelectorAll('rect');
    const hasTransparentGlass = Array.from(rects).some(
      (rect) =>
        rect.getAttribute('fill')?.includes('rgba') ||
        rect.getAttribute('fill')?.includes('0.3')
    );
    expect(hasTransparentGlass).toBe(true);
  });
});

describe('getChassissouffletSVG - New Design', () => {
  it('should render SVG with correct viewBox', () => {
    const { container } = render(getChassissouffletSVG(200, 150));
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 200 150');
  });

  it('should render soufflet triangle indicator', () => {
    const { container } = render(getChassissouffletSVG(200, 150));
    const indicator = container.querySelector('.opening-indicator');
    expect(indicator).toBeTruthy();
  });

  it('should render polygon for soufflet indicator', () => {
    const { container } = render(getChassissouffletSVG(200, 150));
    const polygon = container.querySelector('polygon');
    expect(polygon).toBeTruthy();
  });

  it('should render frame with rounded corners', () => {
    const { container } = render(getChassissouffletSVG(200, 150));
    const frame = container.querySelector('rect[rx="2"]');
    expect(frame).toBeTruthy();
  });

  it('should render handle at bottom', () => {
    const { container } = render(getChassissouffletSVG(200, 150));
    // Handle is a rect with rounded corners
    const handles = container.querySelectorAll('rect[rx="2"]');
    expect(handles.length).toBeGreaterThan(1);
  });
});
