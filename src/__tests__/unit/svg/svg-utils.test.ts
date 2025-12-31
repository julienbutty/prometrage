import { describe, it, expect } from 'vitest';
import { parseMenuiserieType } from '@/lib/svg/svg-utils';

describe('parseMenuiserieType', () => {
  // T004: Test pour "Fenêtre 2 vantaux"
  it('should parse "Fenêtre 2 vantaux" correctly', () => {
    const result = parseMenuiserieType('Fenêtre 2 vantaux');
    expect(result.type).toBe('fenetre');
    expect(result.nbVantaux).toBe(2);
  });

  // T005: Test pour "Coulissant 3 vantaux"
  it('should parse "Coulissant 3 vantaux 3 rails" correctly', () => {
    const result = parseMenuiserieType('Coulissant 3 vantaux 3 rails');
    expect(result.type).toBe('coulissant');
    expect(result.nbVantaux).toBe(3);
  });

  // T006: Test pour "Châssis fixe"
  it('should parse "Châssis fixe en dormant" correctly', () => {
    const result = parseMenuiserieType('Châssis fixe en dormant');
    expect(result.type).toBe('chassis-fixe');
    expect(result.nbVantaux).toBe(0);
  });

  // T007: Test pour type inconnu (fallback)
  it('should fallback to fenetre 1 vantail for unknown types', () => {
    const result = parseMenuiserieType('Unknown type');
    expect(result.type).toBe('fenetre');
    expect(result.nbVantaux).toBe(1);
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
