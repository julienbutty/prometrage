import { describe, it, expect } from "vitest";
import { MenuiserieDataSchema } from "@/lib/validations/menuiserie";

/**
 * Tests for PVC gamme support in MenuiserieDataSchema
 * TDD: These tests should FAIL initially (RED phase)
 *
 * User Story 1: Upload et parsing PDF produits PVC
 * - Le schema MenuiserieDataSchema doit accepter les gammes PVC
 */

describe("MenuiserieDataSchema - PVC Gammes Support", () => {
  // Base valid menuiserie data for testing
  const baseMenuiserieData = {
    largeur: 1200,
    hauteur: 1400,
  };

  describe("T007: Schema accepts SOFTLINE gamme", () => {
    it("should accept gamme SOFTLINE", () => {
      const data = { ...baseMenuiserieData, gamme: "SOFTLINE" };
      const result = MenuiserieDataSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.gamme).toBe("SOFTLINE");
      }
    });

    it("should accept gamme WISIO", () => {
      const data = { ...baseMenuiserieData, gamme: "WISIO" };
      const result = MenuiserieDataSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.gamme).toBe("WISIO");
      }
    });

    it("should accept gamme KIETISLINE", () => {
      const data = { ...baseMenuiserieData, gamme: "KIETISLINE" };
      const result = MenuiserieDataSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.gamme).toBe("KIETISLINE");
      }
    });
  });

  describe("T008: Schema accepts mixed ALU+PVC gammes", () => {
    it("should still accept ALU gamme OPTIMAX", () => {
      const data = { ...baseMenuiserieData, gamme: "OPTIMAX" };
      const result = MenuiserieDataSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.gamme).toBe("OPTIMAX");
      }
    });

    it("should still accept ALU gamme INNOVAX", () => {
      const data = { ...baseMenuiserieData, gamme: "INNOVAX" };
      const result = MenuiserieDataSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.gamme).toBe("INNOVAX");
      }
    });

    it("should still accept ALU gamme PERFORMAX", () => {
      const data = { ...baseMenuiserieData, gamme: "PERFORMAX" };
      const result = MenuiserieDataSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.gamme).toBe("PERFORMAX");
      }
    });

    it("should accept multiple menuiseries with different gammes in same parse context", () => {
      // Simulate parsing multiple menuiseries from same PDF (ALU + PVC)
      const menuiseries = [
        { ...baseMenuiserieData, gamme: "OPTIMAX" }, // ALU
        { ...baseMenuiserieData, gamme: "SOFTLINE" }, // PVC
        { ...baseMenuiserieData, gamme: "PERFORMAX" }, // ALU
        { ...baseMenuiserieData, gamme: "WISIO" }, // PVC
      ];

      const results = menuiseries.map((m) => MenuiserieDataSchema.safeParse(m));

      // All should succeed
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.gamme).toBe(menuiseries[index].gamme);
        }
      });
    });
  });

  describe("Edge cases for gamme field", () => {
    it("should accept undefined gamme (optional field)", () => {
      const data = { ...baseMenuiserieData };
      const result = MenuiserieDataSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it("should accept unknown gamme for future extensibility", () => {
      const data = { ...baseMenuiserieData, gamme: "FUTURE_GAMME" };
      const result = MenuiserieDataSchema.safeParse(data);

      // Should accept any string for flexibility
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.gamme).toBe("FUTURE_GAMME");
      }
    });
  });
});
