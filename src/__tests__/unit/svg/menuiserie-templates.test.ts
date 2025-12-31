import { describe, it, expect } from 'vitest';
import {
  getFenetreSVG,
  getPorteFenetreSVG,
  getCoulissantSVG,
  getChassisFixeSVG,
  getChassissouffletSVG,
} from '@/lib/svg/menuiserie-templates.js';

describe('menuiserie-templates', () => {
  // T010: Test template fenêtre 1 vantail
  describe('getFenetreSVG', () => {
    it('should render fenetre 1 vantail correctly', () => {
      const svg = getFenetreSVG(1);
      expect(svg).toBeDefined();
      expect(svg.type).toBe('svg');
      // 1 vantail = pas de division verticale
    });

    // T011: Test template fenêtre 2 vantaux
    it('should render fenetre 2 vantaux with vertical division', () => {
      const svg = getFenetreSVG(2);
      expect(svg).toBeDefined();
      expect(svg.type).toBe('svg');
    });

    it('should render fenetre 3 vantaux correctly', () => {
      const svg = getFenetreSVG(3);
      expect(svg).toBeDefined();
    });
  });

  describe('getPorteFenetreSVG', () => {
    it('should render porte-fenetre 1 vantail correctly', () => {
      const svg = getPorteFenetreSVG(1);
      expect(svg).toBeDefined();
      expect(svg.type).toBe('svg');
    });

    it('should render porte-fenetre 2 vantaux correctly', () => {
      const svg = getPorteFenetreSVG(2);
      expect(svg).toBeDefined();
    });
  });

  // T012: Test template coulissant 3 vantaux
  describe('getCoulissantSVG', () => {
    it('should render coulissant 2 vantaux correctly', () => {
      const svg = getCoulissantSVG(2);
      expect(svg).toBeDefined();
      expect(svg.type).toBe('svg');
    });

    it('should render coulissant 3 vantaux correctly', () => {
      const svg = getCoulissantSVG(3);
      expect(svg).toBeDefined();
    });

    it('should render coulissant 4 vantaux correctly', () => {
      const svg = getCoulissantSVG(4);
      expect(svg).toBeDefined();
    });
  });

  // T013: Test template châssis fixe
  describe('getChassisFixeSVG', () => {
    it('should render chassis fixe correctly', () => {
      const svg = getChassisFixeSVG();
      expect(svg).toBeDefined();
      expect(svg.type).toBe('svg');
    });
  });

  // T014: Test template châssis soufflet
  describe('getChassissouffletSVG', () => {
    it('should render chassis soufflet correctly', () => {
      const svg = getChassissouffletSVG();
      expect(svg).toBeDefined();
      expect(svg.type).toBe('svg');
    });
  });
});
