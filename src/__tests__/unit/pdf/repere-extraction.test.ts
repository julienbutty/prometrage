import { describe, it, expect } from "vitest";

/**
 * Extract repere from intitule if format "Repere : Intitule"
 * (Copie de la fonction de route.ts pour tester)
 */
function extractRepereFromIntitule(intitule: string): {
  repere: string | null;
  cleanedIntitule: string;
} {
  const colonIndex = intitule.indexOf(":");
  if (colonIndex === -1) {
    return { repere: null, cleanedIntitule: intitule };
  }

  const repere = intitule.substring(0, colonIndex).trim();
  const cleanedIntitule = intitule.substring(colonIndex + 1).trim();

  return { repere, cleanedIntitule };
}

describe("extractRepereFromIntitule", () => {
  it("should extract repere from intitule with colon", () => {
    const result = extractRepereFromIntitule("Salon : Coulissant 2 vantaux");

    expect(result.repere).toBe("Salon");
    expect(result.cleanedIntitule).toBe("Coulissant 2 vantaux");
  });

  it("should extract repere from fm.pdf example", () => {
    const result = extractRepereFromIntitule("Variante coulissant : Coulissant 2 vantaux 2 rails");

    expect(result.repere).toBe("Variante coulissant");
    expect(result.cleanedIntitule).toBe("Coulissant 2 vantaux 2 rails");
  });

  it("should return null repere if no colon", () => {
    const result = extractRepereFromIntitule("Coulissant 2 vantaux");

    expect(result.repere).toBeNull();
    expect(result.cleanedIntitule).toBe("Coulissant 2 vantaux");
  });

  it("should handle multiple colons (only split on first)", () => {
    const result = extractRepereFromIntitule("Bureau : Porte : Vitrage");

    expect(result.repere).toBe("Bureau");
    expect(result.cleanedIntitule).toBe("Porte : Vitrage");
  });

  it("should trim whitespace", () => {
    const result = extractRepereFromIntitule("  Cuisine  :  Fenêtre standard  ");

    expect(result.repere).toBe("Cuisine");
    expect(result.cleanedIntitule).toBe("Fenêtre standard");
  });

  it("should handle edge case with colon at start", () => {
    const result = extractRepereFromIntitule(": Coulissant");

    expect(result.repere).toBe("");
    expect(result.cleanedIntitule).toBe("Coulissant");
  });

  it("should handle edge case with colon at end", () => {
    const result = extractRepereFromIntitule("Salon :");

    expect(result.repere).toBe("Salon");
    expect(result.cleanedIntitule).toBe("");
  });
});
