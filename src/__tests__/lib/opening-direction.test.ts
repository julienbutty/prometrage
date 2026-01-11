/**
 * Tests for Opening Direction mapping utilities
 *
 * Key business logic:
 * - "droite tirant" → triangle points LEFT (gauche)
 * - "gauche tirant" → triangle points RIGHT (droite)
 */

import { describe, it, expect } from "vitest";
import {
  mapOuvertureToSensOuverture,
  getEffectiveOpeningDirection,
} from "@/lib/svg/opening-direction";

describe("mapOuvertureToSensOuverture", () => {
  // T003: returns 'gauche' for "droite tirant"
  it('should return "gauche" for "droite tirant"', () => {
    expect(mapOuvertureToSensOuverture("droite tirant")).toBe("gauche");
  });

  // T004: returns 'droite' for "gauche tirant"
  it('should return "droite" for "gauche tirant"', () => {
    expect(mapOuvertureToSensOuverture("gauche tirant")).toBe("droite");
  });

  // T005: handles case variations
  describe("case insensitivity", () => {
    it('should handle "DROITE TIRANT" uppercase', () => {
      expect(mapOuvertureToSensOuverture("DROITE TIRANT")).toBe("gauche");
    });

    it('should handle "Gauche Tirant" mixed case', () => {
      expect(mapOuvertureToSensOuverture("Gauche Tirant")).toBe("droite");
    });

    it('should handle "GAUCHE tirant" partial uppercase', () => {
      expect(mapOuvertureToSensOuverture("GAUCHE tirant")).toBe("droite");
    });

    it('should handle "droite" without "tirant"', () => {
      expect(mapOuvertureToSensOuverture("droite")).toBe("gauche");
    });
  });

  // T006: returns null for null/undefined
  describe("null/undefined handling", () => {
    it("should return null for null input", () => {
      expect(mapOuvertureToSensOuverture(null)).toBeNull();
    });

    it("should return null for undefined input", () => {
      expect(mapOuvertureToSensOuverture(undefined)).toBeNull();
    });

    it("should return null for empty string", () => {
      expect(mapOuvertureToSensOuverture("")).toBeNull();
    });

    it("should return null for whitespace only", () => {
      expect(mapOuvertureToSensOuverture("   ")).toBeNull();
    });
  });

  // T007: returns null for unrecognized values
  describe("unrecognized values", () => {
    it('should return null for "centre"', () => {
      expect(mapOuvertureToSensOuverture("centre")).toBeNull();
    });

    it('should return null for "invalid"', () => {
      expect(mapOuvertureToSensOuverture("invalid")).toBeNull();
    });

    it('should return null for "haut"', () => {
      expect(mapOuvertureToSensOuverture("haut")).toBeNull();
    });

    it("should return null for random string", () => {
      expect(mapOuvertureToSensOuverture("abc123")).toBeNull();
    });
  });
});

describe("getEffectiveOpeningDirection", () => {
  // T008: prioritizes ouvertureInterieure over ouvrantPrincipal
  it("should prioritize ouvertureInterieure over ouvrantPrincipal", () => {
    // Both fields present - new field wins
    expect(getEffectiveOpeningDirection("droite tirant", "gauche")).toBe(
      "gauche"
    );
    expect(getEffectiveOpeningDirection("gauche tirant", "droite")).toBe(
      "droite"
    );
  });

  // T009: fallback to ouvrantPrincipal legacy
  describe("legacy fallback", () => {
    it('should fallback to ouvrantPrincipal "droite" with implicit tirant', () => {
      expect(getEffectiveOpeningDirection(null, "droite")).toBe("gauche");
    });

    it('should fallback to ouvrantPrincipal "gauche" with implicit tirant', () => {
      expect(getEffectiveOpeningDirection(null, "gauche")).toBe("droite");
    });

    it("should fallback when ouvertureInterieure is undefined", () => {
      expect(getEffectiveOpeningDirection(undefined, "droite")).toBe("gauche");
    });

    it("should fallback when ouvertureInterieure is empty string", () => {
      expect(getEffectiveOpeningDirection("", "droite")).toBe("gauche");
    });
  });

  // T010: returns null when both fields are null
  describe("both fields null", () => {
    it("should return null when both are null", () => {
      expect(getEffectiveOpeningDirection(null, null)).toBeNull();
    });

    it("should return null when both are undefined", () => {
      expect(getEffectiveOpeningDirection(undefined, undefined)).toBeNull();
    });

    it("should return null when ouvertureInterieure is empty and ouvrantPrincipal is null", () => {
      expect(getEffectiveOpeningDirection("", null)).toBeNull();
    });
  });

  // T030: legacy "droite" returns 'gauche' (US4 test)
  it('should return "gauche" for legacy ouvrantPrincipal "droite"', () => {
    expect(getEffectiveOpeningDirection(null, "droite")).toBe("gauche");
  });

  // T031: legacy "gauche" returns 'droite' (US4 test)
  it('should return "droite" for legacy ouvrantPrincipal "gauche"', () => {
    expect(getEffectiveOpeningDirection(null, "gauche")).toBe("droite");
  });
});
