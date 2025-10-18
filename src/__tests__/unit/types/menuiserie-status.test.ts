import { describe, it, expect } from "vitest";
import {
  StatutMenuiserie,
  getMenuiserieStatut,
  isMenuiserieComplete,
} from "@/lib/types/menuiserie-status";

describe("getMenuiserieStatut", () => {
  describe("IMPORTEE (état initial)", () => {
    it("should return IMPORTEE when donneesModifiees is null", () => {
      const result = getMenuiserieStatut(null, false);
      expect(result).toBe(StatutMenuiserie.IMPORTEE);
    });

    it("should return IMPORTEE when donneesModifiees is undefined", () => {
      const result = getMenuiserieStatut(undefined, false);
      expect(result).toBe(StatutMenuiserie.IMPORTEE);
    });

    it("should return IMPORTEE when donneesModifiees is empty object", () => {
      const result = getMenuiserieStatut({}, false);
      expect(result).toBe(StatutMenuiserie.IMPORTEE);
    });

    it("should return IMPORTEE when validee is false and no modifications", () => {
      const result = getMenuiserieStatut(null, false);
      expect(result).toBe(StatutMenuiserie.IMPORTEE);
    });
  });

  describe("EN_COURS (état intermédiaire)", () => {
    it("should return EN_COURS when donneesModifiees exists and validee is false", () => {
      const donneesModifiees = { largeur: 1200, hauteur: 1500 };
      const result = getMenuiserieStatut(donneesModifiees, false);
      expect(result).toBe(StatutMenuiserie.EN_COURS);
    });

    it("should return EN_COURS when donneesModifiees has observations", () => {
      const donneesModifiees = { observations: "Attention aux mesures" };
      const result = getMenuiserieStatut(donneesModifiees, false);
      expect(result).toBe(StatutMenuiserie.EN_COURS);
    });

    it("should return EN_COURS with complex donneesModifiees object", () => {
      const donneesModifiees = {
        largeur: 1200,
        hauteur: 1500,
        observations: "Test",
        photosObservations: [{ id: "1", url: "/test.jpg" }],
      };
      const result = getMenuiserieStatut(donneesModifiees, false);
      expect(result).toBe(StatutMenuiserie.EN_COURS);
    });
  });

  describe("VALIDEE (état final)", () => {
    it("should return VALIDEE when validee is true", () => {
      const donneesModifiees = { largeur: 1200, hauteur: 1500 };
      const result = getMenuiserieStatut(donneesModifiees, true);
      expect(result).toBe(StatutMenuiserie.VALIDEE);
    });

    it("should return VALIDEE even if donneesModifiees is null", () => {
      // Cas edge : validée sans modifications (ne devrait pas arriver mais géré)
      const result = getMenuiserieStatut(null, true);
      expect(result).toBe(StatutMenuiserie.VALIDEE);
    });

    it("should return VALIDEE even if donneesModifiees is empty", () => {
      const result = getMenuiserieStatut({}, true);
      expect(result).toBe(StatutMenuiserie.VALIDEE);
    });
  });

  describe("Edge cases", () => {
    it("should handle non-object donneesModifiees gracefully", () => {
      const result = getMenuiserieStatut("invalid", false);
      expect(result).toBe(StatutMenuiserie.IMPORTEE);
    });

    it("should handle number as donneesModifiees", () => {
      const result = getMenuiserieStatut(123, false);
      expect(result).toBe(StatutMenuiserie.IMPORTEE);
    });

    it("should handle array as donneesModifiees", () => {
      const result = getMenuiserieStatut([], false);
      expect(result).toBe(StatutMenuiserie.IMPORTEE);
    });
  });
});

describe("isMenuiserieComplete", () => {
  it("should return true when menuiserie is VALIDEE", () => {
    const result = isMenuiserieComplete({ largeur: 1200 }, true);
    expect(result).toBe(true);
  });

  it("should return false when menuiserie is EN_COURS", () => {
    const result = isMenuiserieComplete({ largeur: 1200 }, false);
    expect(result).toBe(false);
  });

  it("should return false when menuiserie is IMPORTEE", () => {
    const result = isMenuiserieComplete(null, false);
    expect(result).toBe(false);
  });
});
