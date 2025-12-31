import { describe, it, expect } from "vitest";
import { AIMenuiserieSchema } from "@/lib/validations/ai-response";

/**
 * Tests for PVC gamme support in AIMenuiserieSchema
 * TDD: These tests should FAIL initially (RED phase)
 *
 * User Story 1: Upload et parsing PDF produits PVC
 * - Le schema doit accepter les gammes PVC (SOFTLINE, KIETISLINE, WISIO)
 */

describe("AIMenuiserieSchema - PVC Gammes Support", () => {
  // Base valid menuiserie data for testing
  const baseMenuiserie = {
    repere: "Salon",
    intitule: "Fenêtre PVC 2 vantaux",
    largeur: 1200,
    hauteur: 1400,
  };

  describe("T004: Schema accepts SOFTLINE gamme", () => {
    it("should accept gamme SOFTLINE", () => {
      const data = { ...baseMenuiserie, gamme: "SOFTLINE" };
      const result = AIMenuiserieSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.gamme).toBe("SOFTLINE");
      }
    });
  });

  describe("T005: Schema accepts WISIO gamme", () => {
    it("should accept gamme WISIO", () => {
      const data = { ...baseMenuiserie, gamme: "WISIO" };
      const result = AIMenuiserieSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.gamme).toBe("WISIO");
      }
    });
  });

  describe("T006: Schema accepts KIETISLINE gamme", () => {
    it("should accept gamme KIETISLINE", () => {
      const data = { ...baseMenuiserie, gamme: "KIETISLINE" };
      const result = AIMenuiserieSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.gamme).toBe("KIETISLINE");
      }
    });
  });

  describe("ALU gammes still work", () => {
    it("should still accept gamme OPTIMAX", () => {
      const data = { ...baseMenuiserie, gamme: "OPTIMAX" };
      const result = AIMenuiserieSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.gamme).toBe("OPTIMAX");
      }
    });

    it("should still accept gamme INNOVAX", () => {
      const data = { ...baseMenuiserie, gamme: "INNOVAX" };
      const result = AIMenuiserieSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.gamme).toBe("INNOVAX");
      }
    });

    it("should still accept gamme PERFORMAX", () => {
      const data = { ...baseMenuiserie, gamme: "PERFORMAX" };
      const result = AIMenuiserieSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.gamme).toBe("PERFORMAX");
      }
    });
  });

  describe("Edge cases", () => {
    it("should accept null gamme", () => {
      const data = { ...baseMenuiserie, gamme: null };
      const result = AIMenuiserieSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.gamme).toBeNull();
      }
    });

    it("should accept undefined gamme (optional field)", () => {
      const data = { ...baseMenuiserie };
      const result = AIMenuiserieSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it("should accept unknown gamme for future extensibility", () => {
      const data = { ...baseMenuiserie, gamme: "PREMIUM_FUTURE" };
      const result = AIMenuiserieSchema.safeParse(data);

      // Should accept any string for flexibility
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.gamme).toBe("PREMIUM_FUTURE");
      }
    });
  });
});
