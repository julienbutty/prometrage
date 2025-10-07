import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";

describe("GET /api/menuiseries/[id]", () => {
  let menuiserieId: string;
  let projetId: string;

  beforeAll(async () => {
    // Créer un projet de test
    const projet = await prisma.projet.create({
      data: {
        reference: "TEST-GET-001",
        clientNom: "Test Client",
        clientAdresse: "1 rue Test",
        pdfOriginalNom: "test.pdf",
        pdfUrl: "test://pdf",
        menuiseries: {
          create: {
            repere: "Salon",
            intitule: "Coulissant 2 vantaux",
            donneesOriginales: {
              largeur: 2400,
              hauteur: 2150,
              gamme: "OPTIMAX",
              pose: "applique",
            },
            ordre: 0,
          },
        },
      },
      include: {
        menuiseries: true,
      },
    });

    projetId = projet.id;
    menuiserieId = projet.menuiseries[0].id;
  });

  afterAll(async () => {
    await prisma.menuiserie.deleteMany({
      where: { projetId },
    });
    await prisma.projet.delete({
      where: { id: projetId },
    });
  });

  it("should return menuiserie with projet info", async () => {
    const response = await fetch(
      `http://localhost:3000/api/menuiseries/${menuiserieId}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toMatchObject({
      id: menuiserieId,
      repere: "Salon",
      intitule: "Coulissant 2 vantaux",
      donneesOriginales: {
        largeur: 2400,
        hauteur: 2150,
        gamme: "OPTIMAX",
        pose: "applique",
      },
      projet: {
        id: projetId,
        reference: "TEST-GET-001",
        clientNom: "Test Client",
      },
    });
  });

  it("should return 404 for non-existent menuiserie", async () => {
    const response = await fetch(
      "http://localhost:3000/api/menuiseries/fake-id-123"
    );

    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("NOT_FOUND");
  });
});
