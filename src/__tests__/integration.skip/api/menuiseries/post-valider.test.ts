import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";

const API_BASE = "http://localhost:3000";

describe("POST /api/menuiseries/[id]/valider", () => {
  let testClientId: string;
  let testProjetId: string;
  let menuiserieImporteeId: string;
  let menuiserieEnCoursId: string;
  let menuiserieValideeId: string;

  beforeAll(async () => {
    // Create test client
    const client = await prisma.client.create({
      data: {
        nom: "Test Client Valider",
        email: "test-valider@example.com",
        tel: "0123456789",
      },
    });
    testClientId = client.id;

    // Create test projet
    const projet = await prisma.projet.create({
      data: {
        reference: "TEST-VALIDER-001",
        clientId: testClientId,
        adresse: "123 Test Street",
      },
    });
    testProjetId = projet.id;

    // Create menuiserie IMPORTEE (no modifications)
    const menuiserieImportee = await prisma.menuiserie.create({
      data: {
        projetId: testProjetId,
        repere: "TEST-IMPORTEE",
        intitule: "Menuiserie importée",
        donneesOriginales: { largeur: 1000, hauteur: 1200 },
        // donneesModifiees: undefined, // Omit pour laisser à null par défaut
        validee: false,
        ordre: 0,
      },
    });
    menuiserieImporteeId = menuiserieImportee.id;

    // Create menuiserie EN_COURS (with modifications but not validated)
    const menuiserieEnCours = await prisma.menuiserie.create({
      data: {
        projetId: testProjetId,
        repere: "TEST-EN-COURS",
        intitule: "Menuiserie en cours",
        donneesOriginales: { largeur: 1000, hauteur: 1200 },
        donneesModifiees: { largeur: 1050, hauteur: 1250 },
        validee: false,
        ordre: 1,
      },
    });
    menuiserieEnCoursId = menuiserieEnCours.id;

    // Create menuiserie VALIDEE (already validated)
    const menuiserieValidee = await prisma.menuiserie.create({
      data: {
        projetId: testProjetId,
        repere: "TEST-VALIDEE",
        intitule: "Menuiserie validée",
        donneesOriginales: { largeur: 1000, hauteur: 1200 },
        donneesModifiees: { largeur: 1050, hauteur: 1250 },
        validee: true,
        dateValidation: new Date(),
        ordre: 2,
      },
    });
    menuiserieValideeId = menuiserieValidee.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.menuiserie.deleteMany({
      where: { projetId: testProjetId },
    });
    await prisma.projet.delete({
      where: { id: testProjetId },
    });
    await prisma.client.delete({
      where: { id: testClientId },
    });
  });

  describe("Success cases", () => {
    it("should validate menuiserie EN_COURS successfully", async () => {
      const response = await fetch(
        `${API_BASE}/api/menuiseries/${menuiserieEnCoursId}/valider`,
        {
          method: "POST",
        }
      );

      expect(response.ok).toBe(true);
      const data = await response.json();

      expect(data).toMatchObject({
        success: true,
        data: {
          id: menuiserieEnCoursId,
          validee: true,
        },
      });
      expect(data.data.dateValidation).toBeTruthy();

      // Verify in database
      const menuiserie = await prisma.menuiserie.findUnique({
        where: { id: menuiserieEnCoursId },
      });
      expect(menuiserie?.validee).toBe(true);
      expect(menuiserie?.dateValidation).toBeTruthy();
    });

    it("should allow validating already VALIDEE menuiserie (idempotent)", async () => {
      const response = await fetch(
        `${API_BASE}/api/menuiseries/${menuiserieValideeId}/valider`,
        {
          method: "POST",
        }
      );

      expect(response.ok).toBe(true);
      const data = await response.json();

      expect(data).toMatchObject({
        success: true,
        data: {
          id: menuiserieValideeId,
          validee: true,
        },
      });
    });
  });

  describe("Error cases", () => {
    it("should return 404 for non-existent menuiserie", async () => {
      const response = await fetch(
        `${API_BASE}/api/menuiseries/invalid-id/valider`,
        {
          method: "POST",
        }
      );

      expect(response.status).toBe(404);
      const data = await response.json();

      expect(data).toMatchObject({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Menuiserie not found",
        },
      });
    });

    it("should return 400 when validating IMPORTEE menuiserie (no modifications)", async () => {
      const response = await fetch(
        `${API_BASE}/api/menuiseries/${menuiserieImporteeId}/valider`,
        {
          method: "POST",
        }
      );

      expect(response.status).toBe(400);
      const data = await response.json();

      expect(data).toMatchObject({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Cannot validate menuiserie without modifications",
        },
      });

      // Verify it was NOT validated in database
      const menuiserie = await prisma.menuiserie.findUnique({
        where: { id: menuiserieImporteeId },
      });
      expect(menuiserie?.validee).toBe(false);
    });
  });

  describe("Edge cases", () => {
    it("should handle concurrent validation requests", async () => {
      // Create a fresh menuiserie for this test
      const testMenuiserie = await prisma.menuiserie.create({
        data: {
          projetId: testProjetId,
          repere: "TEST-CONCURRENT",
          intitule: "Test concurrent",
          donneesOriginales: { largeur: 1000 },
          donneesModifiees: { largeur: 1050 },
          validee: false,
          ordre: 10,
        },
      });

      // Make 3 concurrent requests
      const requests = Array.from({ length: 3 }, () =>
        fetch(`${API_BASE}/api/menuiseries/${testMenuiserie.id}/valider`, {
          method: "POST",
        })
      );

      const responses = await Promise.all(requests);

      // All should succeed (idempotent)
      responses.forEach((response) => {
        expect(response.ok).toBe(true);
      });

      // Verify final state
      const menuiserie = await prisma.menuiserie.findUnique({
        where: { id: testMenuiserie.id },
      });
      expect(menuiserie?.validee).toBe(true);

      // Cleanup
      await prisma.menuiserie.delete({
        where: { id: testMenuiserie.id },
      });
    });
  });
});
