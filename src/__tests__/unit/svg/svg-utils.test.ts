import { describe, it, expect } from 'vitest';
import { parseMenuiserieType } from '@/lib/svg/svg-utils';

describe('parseMenuiserieType', () => {
  // T004: Test pour "Fenêtre 2 vantaux"
  it('should parse "Fenêtre 2 vantaux" correctly', () => {
    const result = parseMenuiserieType('Fenêtre 2 vantaux');
    expect(result.type).toBe('fenetre');
    expect(result.nbVantaux).toBe(2);
    expect(result.typeOuvrant).toBe('battant');
    expect(result.isOscilloBattant).toBe(false);
  });

  // T005: Test pour "Coulissant 3 vantaux"
  it('should parse "Coulissant 3 vantaux 3 rails" correctly', () => {
    const result = parseMenuiserieType('Coulissant 3 vantaux 3 rails');
    expect(result.type).toBe('coulissant');
    expect(result.nbVantaux).toBe(3);
    expect(result.typeOuvrant).toBe('coulissant');
  });

  // T006: Test pour "Châssis fixe"
  it('should parse "Châssis fixe en dormant" correctly', () => {
    const result = parseMenuiserieType('Châssis fixe en dormant');
    expect(result.type).toBe('chassis-fixe');
    expect(result.nbVantaux).toBe(0);
    expect(result.typeOuvrant).toBe('fixe');
  });

  // T007: Test pour type inconnu (fallback)
  it('should fallback to fenetre 1 vantail for unknown types', () => {
    const result = parseMenuiserieType('Unknown type');
    expect(result.type).toBe('fenetre');
    expect(result.nbVantaux).toBe(1);
    expect(result.typeOuvrant).toBe('battant');
  });

  // Tests additionnels pour couverture complète
  it('should parse "Fenêtre 1 vantail" correctly', () => {
    const result = parseMenuiserieType('Fenêtre 1 vantail');
    expect(result.type).toBe('fenetre');
    expect(result.nbVantaux).toBe(1);
  });

  it('should parse "Porte-fenêtre 2 vantaux" correctly', () => {
    const result = parseMenuiserieType('Porte-fenêtre 2 vantaux');
    expect(result.type).toBe('porte-fenetre');
    expect(result.nbVantaux).toBe(2);
  });

  it('should parse "Porte fenêtre 1 vantail" (sans tiret) correctly', () => {
    const result = parseMenuiserieType('Porte fenêtre 1 vantail');
    expect(result.type).toBe('porte-fenetre');
    expect(result.nbVantaux).toBe(1);
  });

  it('should parse "Châssis soufflet" correctly', () => {
    const result = parseMenuiserieType('Châssis à soufflet');
    expect(result.type).toBe('chassis-soufflet');
    expect(result.nbVantaux).toBe(1);
    expect(result.typeOuvrant).toBe('soufflet');
  });

  it('should parse "Chassis fixe" (sans accent) correctly', () => {
    const result = parseMenuiserieType('Chassis fixe');
    expect(result.type).toBe('chassis-fixe');
    expect(result.nbVantaux).toBe(0);
  });

  it('should parse "Coulissant 4 vantaux 2 rails" correctly', () => {
    const result = parseMenuiserieType('Coulissant 4 vantaux 2 rails');
    expect(result.type).toBe('coulissant');
    expect(result.nbVantaux).toBe(4);
  });

  it('should handle case insensitivity', () => {
    const result = parseMenuiserieType('FENÊTRE 2 VANTAUX');
    expect(result.type).toBe('fenetre');
    expect(result.nbVantaux).toBe(2);
  });

  it('should handle empty string', () => {
    const result = parseMenuiserieType('');
    expect(result.type).toBe('fenetre');
    expect(result.nbVantaux).toBe(1);
  });
});

describe('parseMenuiserieType - Oscillo-Battant Detection', () => {
  it('should detect "Fenêtre 1 vantail oscillo-battant"', () => {
    const result = parseMenuiserieType('Fenêtre 1 vantail oscillo-battant');
    expect(result.type).toBe('fenetre');
    expect(result.nbVantaux).toBe(1);
    expect(result.typeOuvrant).toBe('oscillo-battant');
    expect(result.isOscilloBattant).toBe(true);
  });

  it('should detect "Fenêtre 2 vantaux oscillo battant" (sans tiret)', () => {
    const result = parseMenuiserieType('Fenêtre 2 vantaux oscillo battant');
    expect(result.type).toBe('fenetre');
    expect(result.nbVantaux).toBe(2);
    expect(result.typeOuvrant).toBe('oscillo-battant');
    expect(result.isOscilloBattant).toBe(true);
  });

  it('should detect "Porte-fenêtre oscillo-battant"', () => {
    const result = parseMenuiserieType('Porte-fenêtre 1 vantail oscillo-battant');
    expect(result.type).toBe('porte-fenetre');
    expect(result.nbVantaux).toBe(1);
    expect(result.typeOuvrant).toBe('oscillo-battant');
    expect(result.isOscilloBattant).toBe(true);
  });

  it('should detect case insensitive "OSCILLO-BATTANT"', () => {
    const result = parseMenuiserieType('Fenêtre 1 vantail OSCILLO-BATTANT');
    expect(result.typeOuvrant).toBe('oscillo-battant');
    expect(result.isOscilloBattant).toBe(true);
  });
});

describe('parseMenuiserieType - Soufflet Detection', () => {
  it('should detect soufflet in fenêtre type', () => {
    const result = parseMenuiserieType('Fenêtre soufflet');
    expect(result.type).toBe('fenetre');
    expect(result.typeOuvrant).toBe('soufflet');
    expect(result.isOscilloBattant).toBe(false);
  });

  it('should set typeOuvrant to soufflet for chassis-soufflet', () => {
    const result = parseMenuiserieType('Châssis soufflet');
    expect(result.type).toBe('chassis-soufflet');
    expect(result.typeOuvrant).toBe('soufflet');
  });
});
