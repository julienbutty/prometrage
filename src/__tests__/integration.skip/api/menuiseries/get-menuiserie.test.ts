import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";

describe("GET /api/menuiseries/[id]", () => {
  let menuiserieIds: string[] = [];
  let projetId: string;

  beforeAll(async () => {
    // Créer un client de test
    const client = await prisma.client.create({
      data: {
        nom: "Test Client",
        email: "test@example.com",
        tel: "06 12 34 56 78",
      },
    });

    // Créer un projet de test avec 3 menuiseries
    const projet = await prisma.projet.create({
      data: {
        reference: "TEST-GET-001",
        clientId: client.id,
        adresse: "1 rue Test",
        pdfOriginalNom: "test.pdf",
        pdfUrl: "test://pdf",
        menuiseries: {
          create: [
            {
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
            {
              repere: "Chambre",
              intitule: "Fenêtre oscillo-battante",
              donneesOriginales: {
                largeur: 1200,
                hauteur: 1350,
                gamme: "CLASSIC",
                pose: "applique",
              },
              donneesModifiees: {
                largeur: 1250,
                hauteur: 1350,
              },
              ordre: 1,
            },
            {
              repere: "Cuisine",
              intitule: "Porte fenêtre",
              donneesOriginales: {
                largeur: 900,
                hauteur: 2150,
                gamme: "OPTIMAX",
                pose: "tunnel",
              },
              ordre: 2,
            },
          ],
        },
      },
      include: {
        menuiseries: {
          orderBy: { ordre: "asc" },
        },
      },
    });

    projetId = projet.id;
    menuiserieIds = projet.menuiseries.map((m) => m.id);
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
      `http://localhost:3001/api/menuiseries/${menuiserieIds[0]}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toMatchObject({
      id: menuiserieIds[0],
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

  it("should return navigation metadata with all menuiseries", async () => {
    const response = await fetch(
      `http://localhost:3001/api/menuiseries/${menuiserieIds[1]}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);

    // Vérifier la structure de navigation
    expect(data.data.navigation).toBeDefined();
    expect(data.data.navigation).toMatchObject({
      total: 3,
      currentIndex: 1,
      currentPosition: 2,
      hasNext: true,
      hasPrevious: true,
      nextId: menuiserieIds[2],
      previousId: menuiserieIds[0],
    });

    // Vérifier que allMenuiseries est présent
    expect(data.data.navigation.allMenuiseries).toHaveLength(3);
    expect(data.data.navigation.allMenuiseries[0]).toMatchObject({
      id: menuiserieIds[0],
      repere: "Salon",
      intitule: "Coulissant 2 vantaux",
      ordre: 0,
    });
  });

  it("should return correct navigation for first menuiserie", async () => {
    const response = await fetch(
      `http://localhost:3001/api/menuiseries/${menuiserieIds[0]}`
    );

    const data = await response.json();
    expect(data.data.navigation).toMatchObject({
      total: 3,
      currentIndex: 0,
      currentPosition: 1,
      hasNext: true,
      hasPrevious: false,
      nextId: menuiserieIds[1],
      previousId: null,
    });
  });

  it("should return correct navigation for last menuiserie", async () => {
    const response = await fetch(
      `http://localhost:3001/api/menuiseries/${menuiserieIds[2]}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.navigation).toMatchObject({
      total: 3,
      currentIndex: 2,
      currentPosition: 3,
      hasNext: false,
      hasPrevious: true,
      nextId: null,
      previousId: menuiserieIds[1],
    });
  });

  it("should return menuiseriesStatus with completion flags", async () => {
    const response = await fetch(
      `http://localhost:3001/api/menuiseries/${menuiserieIds[0]}`
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.navigation.menuiseriesStatus).toBeDefined();
    expect(data.data.navigation.menuiseriesStatus).toHaveLength(3);

    // Première menuiserie : non complétée
    expect(data.data.navigation.menuiseriesStatus[0]).toMatchObject({
      id: menuiserieIds[0],
      repere: "Salon",
      intitule: "Coulissant 2 vantaux",
      isCompleted: false,
    });

    // Deuxième menuiserie : complétée (a donneesModifiees)
    expect(data.data.navigation.menuiseriesStatus[1]).toMatchObject({
      id: menuiserieIds[1],
      repere: "Chambre",
      intitule: "Fenêtre oscillo-battante",
      isCompleted: true,
    });

    // Troisième menuiserie : non complétée
    expect(data.data.navigation.menuiseriesStatus[2]).toMatchObject({
      id: menuiserieIds[2],
      repere: "Cuisine",
      intitule: "Porte fenêtre",
      isCompleted: false,
    });
  });

  it("should return 404 for non-existent menuiserie", async () => {
    const response = await fetch(
      "http://localhost:3001/api/menuiseries/fake-id-123"
    );

    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("NOT_FOUND");
  });
});
