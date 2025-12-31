import { describe, it, expect } from "vitest";
import { AIMenuiserieSchema } from "@/lib/validations/ai-response";

/**
 * Tests for flexible schema support in AIMenuiserieSchema
 * User Story 2: Extraction robuste de tous les champs produits
 */

describe("AIMenuiserieSchema - Flexible Fields Support", () => {
  // Base valid menuiserie data for testing
  const baseMenuiserie = {
    repere: "Salon",
    intitule: "Fenêtre PVC 2 vantaux",
    largeur: 1200,
    hauteur: 1400,
  };

  describe("T016: Schema accepts optional fields as null", () => {
    it("should accept all optional fields as null", () => {
      const data = {
        ...baseMenuiserie,
        gamme: null,
        couleurInt: null,
        couleurExt: null,
        pose: null,
        dimensions: null,
        dormant: null,
        habillageInt: null,
        habillageExt: null,
        doubleVitrage: null,
        intercalaire: null,
        ouvrantPrincipal: null,
        fermeture: null,
        poignee: null,
        rails: null,
      };
      const result = AIMenuiserieSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it("should accept mixed null and defined values", () => {
      const data = {
        ...baseMenuiserie,
        gamme: "SOFTLINE",
        couleurInt: null,
        couleurExt: "RAL 7016",
        pose: null,
      };
      const result = AIMenuiserieSchema.safeParse(data);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.gamme).toBe("SOFTLINE");
        expect(result.data.couleurInt).toBeNull();
        expect(result.data.couleurExt).toBe("RAL 7016");
        expect(result.data.pose).toBeNull();
      }
    });
  });

  describe("T017: Schema handles additional PVC-specific fields", () => {
    it("should not fail on unknown fields (PVC-specific)", () => {
      const data = {
        ...baseMenuiserie,
        gamme: "SOFTLINE",
        // These fields might come from PVC extraction
        jointFrappe: "Standard",
        profileRenfort: "Acier",
        typeJoint: "EPDM",
      };
      const result = AIMenuiserieSchema.safeParse(data);

      // Schema should accept but may strip unknown fields
      // The important thing is it doesn't fail
      expect(result.success).toBe(true);
    });

    it("should handle optional fields with empty strings", () => {
      const data = {
        ...baseMenuiserie,
        gamme: "KIETISLINE",
        couleurInt: "",
        couleurExt: "",
      };
      const result = AIMenuiserieSchema.safeParse(data);

      expect(result.success).toBe(true);
    });
  });
});
