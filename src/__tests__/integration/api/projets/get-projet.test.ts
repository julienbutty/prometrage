import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

describe("GET /api/projets/[id]", () => {
  let testProjetId: string;

  beforeEach(async () => {
    // Clean database
    await prisma.menuiserie.deleteMany();
    await prisma.projet.deleteMany();

    // Create test project with menuiseries
    const projet = await prisma.projet.create({
      data: {
        reference: "TEST-001",
        clientNom: "Test Client",
        clientAdresse: "123 Test Street",
        clientTel: "0123456789",
        pdfOriginalNom: "test.pdf",
        pdfUrl: "test://pdf/test.pdf",
        menuiseries: {
          create: [
            {
              repere: "M1",
              intitule: "Coulissant 2 vantaux",
              donneesOriginales: {
                largeur: 3000,
                hauteur: 2250,
                gamme: "PERFORMAX",
                pose: "tunnel",
              },
              ordre: 0,
            },
            {
              repere: "M2",
              intitule: "Fenêtre fixe",
              donneesOriginales: {
                largeur: 1200,
                hauteur: 1500,
                gamme: "OPTIMAX",
                pose: "renovation",
              },
              ordre: 1,
            },
          ],
        },
      },
    });

    testProjetId = projet.id;
  });

  it("should return projet with menuiseries", async () => {
    const response = await fetch(`http://localhost:3000/api/projets/${testProjetId}`);
    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe(testProjetId);
    expect(data.data.reference).toBe("TEST-001");
    expect(data.data.menuiseries).toHaveLength(2);
    expect(data.data.menuiseries[0].repere).toBe("M1");
    expect(data.data.menuiseries[1].repere).toBe("M2");
  });

  it("should return 404 for non-existent projet", async () => {
    const response = await fetch("http://localhost:3000/api/projets/non-existent-id");
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("NOT_FOUND");
  });

  it("should order menuiseries by ordre field", async () => {
    const response = await fetch(`http://localhost:3000/api/projets/${testProjetId}`);
    const data = await response.json();

    expect(data.data.menuiseries[0].ordre).toBe(0);
    expect(data.data.menuiseries[1].ordre).toBe(1);
  });
});
