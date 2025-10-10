import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";

describe("PUT /api/menuiseries/[id]", () => {
  let menuiserieId: string;
  let projetId: string;

  beforeAll(async () => {
    // Créer un client de test
    const client = await prisma.client.create({
      data: {
        nom: "Test Client",
        email: "test-put@example.com",
        tel: "06 12 34 56 78",
      },
    });

    const projet = await prisma.projet.create({
      data: {
        reference: "TEST-PUT-001",
        clientId: client.id,
        adresse: "1 rue Test",
        pdfOriginalNom: "test.pdf",
        pdfUrl: "test://pdf",
        menuiseries: {
          create: {
            repere: "Cuisine",
            intitule: "Fenêtre fixe",
            donneesOriginales: {
              largeur: 1200,
              hauteur: 1400,
              gamme: "PERFORMAX",
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

  it("should update menuiserie with real measurements", async () => {
    const updateData = {
      donneesModifiees: {
        largeur: 1205,
        hauteur: 1398,
        gamme: "PERFORMAX",
        observations: "Légère différence sur largeur",
      },
    };

    const response = await fetch(
      `http://localhost:3001/api/menuiseries/${menuiserieId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      }
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toMatchObject({
      id: menuiserieId,
      donneesModifiees: {
        largeur: 1205,
        hauteur: 1398,
        gamme: "PERFORMAX",
        observations: "Légère différence sur largeur",
      },
    });

    // Vérifier que les écarts sont calculés
    expect(data.data.ecarts).toBeDefined();
    expect(data.data.ecarts.largeur).toMatchObject({
      original: 1200,
      modifie: 1205,
      difference: 5,
      pourcentage: expect.closeTo(0.42, 0.1),
    });
  });

  it("should return 404 for non-existent menuiserie", async () => {
    const response = await fetch(
      "http://localhost:3001/api/menuiseries/fake-id-123",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          donneesModifiees: { largeur: 1000 },
        }),
      }
    );

    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("NOT_FOUND");
  });

  it("should validate input data", async () => {
    const response = await fetch(
      `http://localhost:3001/api/menuiseries/${menuiserieId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          donneesModifiees: {
            largeur: { invalid: "object" }, // Should be primitive
          },
        }),
      }
    );

    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });
});
