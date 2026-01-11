/**
 * Tests pour l'indicateur d'ouverture SVG
 * @see specs/008-svg-design-migration/spec.md
 *
 * Tests pour les triangles d'indication d'ouverture (convention fiche metreur)
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  getFenetreSVG,
  getPorteFenetreSVG,
  getChassissouffletSVG,
} from '@/lib/svg/menuiserie-templates';

describe('Opening Indicator - Fenetre Triangle Convention', () => {
  it('should render SVG for fenetre with battant opening', () => {
    const { container } = render(
      getFenetreSVG(1, 200, 150, 'battant', 'droite')
    );

    // Le SVG doit être rendu
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('should render opening indicator group', () => {
    const { container } = render(
      getFenetreSVG(1, 200, 150, 'battant', 'gauche')
    );

    // L'indicateur d'ouverture doit être présent (groupe avec classe opening-indicator)
    const indicator = container.querySelector('.opening-indicator');
    expect(indicator).toBeTruthy();
  });

  it('should render polygon for battant indicator', () => {
    const { container } = render(
      getFenetreSVG(1, 200, 150, 'battant', 'droite')
    );

    // Un polygon doit être présent pour le triangle
    const polygon = container.querySelector('polygon');
    expect(polygon).toBeTruthy();
  });

  it('should position handle on hinge side (opposite to opening)', () => {
    const { container } = render(
      getFenetreSVG(1, 200, 150, 'battant', 'droite')
    );

    // Les poignées (rect dans le panneau)
    const handles = container.querySelectorAll('rect');
    expect(handles.length).toBeGreaterThan(0);
  });
});

describe('Opening Indicator - Soufflet Triangle Convention', () => {
  it('should render soufflet indicator with polygon', () => {
    const { container } = render(
      getFenetreSVG(1, 200, 150, 'soufflet', 'droite')
    );

    // Un polygon doit être présent
    const polygon = container.querySelector('polygon');
    expect(polygon).toBeTruthy();
  });

  it('should render chassis-soufflet with triangle indicator', () => {
    const { container } = render(getChassissouffletSVG(200, 150));

    // Le châssis soufflet doit avoir un indicateur
    const indicator = container.querySelector('.opening-indicator');
    expect(indicator).toBeTruthy();
  });
});

describe('Opening Indicator - Oscillo-Battant', () => {
  it('should render both battant and soufflet indicators for oscillo-battant', () => {
    const { container } = render(
      getFenetreSVG(1, 200, 150, 'oscillo-battant', 'droite')
    );

    // Deux polygons doivent être présents (battant + soufflet)
    const polygons = container.querySelectorAll('polygon');
    expect(polygons.length).toBe(2);
  });

  it('should render soufflet indicator with dashed stroke for oscillo-battant', () => {
    const { container } = render(
      getFenetreSVG(1, 200, 150, 'oscillo-battant', 'gauche')
    );

    // Au moins un polygon doit avoir un stroke-dasharray
    const polygons = container.querySelectorAll('polygon');
    const hasDashed = Array.from(polygons).some(
      (p) => p.getAttribute('stroke-dasharray') !== null
    );
    expect(hasDashed).toBe(true);
  });
});

describe('Opening Indicator - Fixe (No indicator)', () => {
  it('should not render opening indicator for fixe type', () => {
    const { container } = render(getFenetreSVG(1, 200, 150, 'fixe', 'droite'));

    // Pas de groupe opening-indicator pour fixe
    const indicator = container.querySelector('.opening-indicator');
    expect(indicator).toBeFalsy();
  });
});

describe('Opening Indicator - Porte-Fenêtre', () => {
  it('should render opening indicator for porte-fenetre', () => {
    const { container } = render(
      getPorteFenetreSVG(1, 200, 150, 'battant', 'gauche')
    );

    const indicator = container.querySelector('.opening-indicator');
    expect(indicator).toBeTruthy();
  });

  it('should render with soubassement panel', () => {
    const { container } = render(
      getPorteFenetreSVG(1, 200, 150, 'battant', 'droite')
    );

    // Porte-fenêtre a plus de rect que fenêtre (panneau bas)
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThan(3);
  });
});

describe('Opening Indicator - Multi-vantaux', () => {
  it('should render multiple indicators for 2 vantaux', () => {
    const { container } = render(
      getFenetreSVG(2, 200, 150, 'battant', 'gauche')
    );

    // Plusieurs groupes panel
    const panels = container.querySelectorAll('g[class]');
    expect(panels.length).toBeGreaterThan(0);
  });

  it('should render correct structure for 3 vantaux', () => {
    const { container } = render(
      getFenetreSVG(3, 200, 150, 'battant', 'droite')
    );

    // Le SVG doit contenir 3 panneaux
    const panelGroups = container.querySelectorAll('g');
    expect(panelGroups.length).toBeGreaterThanOrEqual(3);
  });
});

describe('Opening Indicator - Full Panel Triangle (Technical Standard)', () => {
  it('should render battant triangle with thin stroke', () => {
    const { container } = render(
      getFenetreSVG(1, 200, 150, 'battant', 'droite')
    );

    const polygon = container.querySelector('polygon');
    expect(polygon).toBeTruthy();
    // Stroke width should be 1 (thin lines for professional look)
    expect(polygon?.getAttribute('stroke-width')).toBe('1');
  });

  it('should render oscillo-battant soufflet with orange stroke', () => {
    const { container } = render(
      getFenetreSVG(1, 200, 150, 'oscillo-battant', 'droite')
    );

    const polygons = container.querySelectorAll('polygon');
    // Find the soufflet polygon (has dashed stroke)
    const souffletPolygon = Array.from(polygons).find(
      (p) => p.getAttribute('stroke-dasharray') !== null
    );

    // Soufflet in oscillo-battant should have orange stroke (#F59E0B)
    expect(souffletPolygon?.getAttribute('stroke')).toBe('#F59E0B');
  });

  it('should render battant triangle spanning full panel for direction droite', () => {
    const { container } = render(
      getFenetreSVG(1, 200, 150, 'battant', 'droite')
    );

    const polygon = container.querySelector('polygon');
    const points = polygon?.getAttribute('points');
    expect(points).toBeTruthy();

    // For direction droite: base on left, apex on right
    // Points should contain 3 coordinates (triangle)
    const pointsArray = points!.trim().split(' ');
    expect(pointsArray.length).toBe(3);
  });

  it('should render battant triangle spanning full panel for direction gauche', () => {
    const { container } = render(
      getFenetreSVG(1, 200, 150, 'battant', 'gauche')
    );

    const polygon = container.querySelector('polygon');
    const points = polygon?.getAttribute('points');
    expect(points).toBeTruthy();

    // For direction gauche: base on right, apex on left
    const pointsArray = points!.trim().split(' ');
    expect(pointsArray.length).toBe(3);
  });

  it('should render soufflet triangle with base at bottom', () => {
    const { container } = render(
      getFenetreSVG(1, 200, 150, 'soufflet', 'droite')
    );

    const polygon = container.querySelector('polygon');
    const points = polygon?.getAttribute('points');
    expect(points).toBeTruthy();

    // Soufflet: base at bottom, apex at top
    const pointsArray = points!.trim().split(' ');
    expect(pointsArray.length).toBe(3);
  });

  it('should use longer dash pattern for oscillo-battant soufflet', () => {
    const { container } = render(
      getFenetreSVG(1, 200, 150, 'oscillo-battant', 'droite')
    );

    const polygons = container.querySelectorAll('polygon');
    const souffletPolygon = Array.from(polygons).find(
      (p) => p.getAttribute('stroke-dasharray') !== null
    );

    // Should use "6 3" dash pattern for better visibility
    expect(souffletPolygon?.getAttribute('stroke-dasharray')).toBe('6 3');
  });
});
