import { describe, it, expect } from "vitest";
import { ProjetSchema, CreateProjetSchema } from "@/lib/validations/projet";

describe("ProjetSchema - Validation Zod", () => {
  describe("Validation des champs requis", () => {
    it("devrait accepter un projet valide complet", () => {
      const validProjet = {
        reference: "KOMP-2024-001",
        clientNom: "KOMPANIETZ",
        clientAdresse: "37 Chemin du Cuvier",
        clientTel: "06 25 91 01 48",
        clientEmail: "paul.kompanietz@gmail.com",
        pdfUrl: "https://storage.example.com/file.pdf",
        pdfOriginalNom: "fiche-metreur.pdf",
      };

      const result = ProjetSchema.safeParse(validProjet);
      expect(result.success).toBe(true);
    });

    it("devrait rejeter un projet sans reference", () => {
      const invalidProjet = {
        clientNom: "KOMPANIETZ",
      };

      const result = ProjetSchema.safeParse(invalidProjet);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("reference");
      }
    });

    it("devrait rejeter un projet sans clientNom", () => {
      const invalidProjet = {
        reference: "KOMP-2024-001",
      };

      const result = ProjetSchema.safeParse(invalidProjet);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("clientNom");
      }
    });
  });

  describe("Validation du format de référence", () => {
    it("devrait accepter le format XXXX-YYYY-NNN", () => {
      const projet = {
        reference: "KOMP-2024-001",
        clientNom: "KOMPANIETZ",
      };

      const result = ProjetSchema.safeParse(projet);
      expect(result.success).toBe(true);
    });

    it("devrait rejeter une référence trop courte", () => {
      const projet = {
        reference: "AB",
        clientNom: "KOMPANIETZ",
      };

      const result = ProjetSchema.safeParse(projet);
      expect(result.success).toBe(false);
    });

    it("devrait trim les espaces dans la référence", () => {
      const projet = {
        reference: "  KOMP-2024-001  ",
        clientNom: "KOMPANIETZ",
      };

      const result = ProjetSchema.safeParse(projet);
      if (result.success) {
        expect(result.data.reference).toBe("KOMP-2024-001");
      }
    });
  });

  describe("Validation de l'email client", () => {
    it("devrait accepter un email valide", () => {
      const projet = {
        reference: "KOMP-2024-001",
        clientNom: "KOMPANIETZ",
        clientEmail: "paul.kompanietz@gmail.com",
      };

      const result = ProjetSchema.safeParse(projet);
      expect(result.success).toBe(true);
    });

    it("devrait rejeter un email invalide", () => {
      const projet = {
        reference: "KOMP-2024-001",
        clientNom: "KOMPANIETZ",
        clientEmail: "email-invalide",
      };

      const result = ProjetSchema.safeParse(projet);
      expect(result.success).toBe(false);
    });

    it("devrait accepter un email null ou undefined (optionnel)", () => {
      const projet = {
        reference: "KOMP-2024-001",
        clientNom: "KOMPANIETZ",
        clientEmail: undefined,
      };

      const result = ProjetSchema.safeParse(projet);
      expect(result.success).toBe(true);
    });
  });

  describe("Validation du téléphone client", () => {
    it("devrait accepter un numéro français standard", () => {
      const projet = {
        reference: "KOMP-2024-001",
        clientNom: "KOMPANIETZ",
        clientTel: "06 25 91 01 48",
      };

      const result = ProjetSchema.safeParse(projet);
      expect(result.success).toBe(true);
    });

    it("devrait accepter différents formats de téléphone", () => {
      const formats = [
        "0625910148",
        "06.25.91.01.48",
        "+33625910148",
        "+33 6 25 91 01 48",
      ];

      formats.forEach((tel) => {
        const projet = {
          reference: "KOMP-2024-001",
          clientNom: "KOMPANIETZ",
          clientTel: tel,
        };

        const result = ProjetSchema.safeParse(projet);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("Validation des URLs PDF", () => {
    it("devrait accepter une URL HTTPS valide", () => {
      const projet = {
        reference: "KOMP-2024-001",
        clientNom: "KOMPANIETZ",
        pdfUrl: "https://storage.example.com/file.pdf",
      };

      const result = ProjetSchema.safeParse(projet);
      expect(result.success).toBe(true);
    });

    it("devrait rejeter une URL invalide", () => {
      const projet = {
        reference: "KOMP-2024-001",
        clientNom: "KOMPANIETZ",
        pdfUrl: "not-a-valid-url",
      };

      const result = ProjetSchema.safeParse(projet);
      expect(result.success).toBe(false);
    });
  });
});

describe("CreateProjetSchema - Création de projet", () => {
  it("devrait accepter les données minimales pour créer un projet", () => {
    const newProjet = {
      clientNom: "KOMPANIETZ",
      clientAdresse: "37 Chemin du Cuvier",
      clientTel: "06 25 91 01 48",
      clientEmail: "paul.kompanietz@gmail.com",
    };

    const result = CreateProjetSchema.safeParse(newProjet);
    expect(result.success).toBe(true);
  });

  it("ne devrait pas accepter un ID lors de la création", () => {
    const newProjet = {
      id: "should-not-be-here",
      clientNom: "KOMPANIETZ",
    };

    const result = CreateProjetSchema.safeParse(newProjet);
    // Le schéma devrait omettre l'ID
    if (result.success) {
      expect(result.data).not.toHaveProperty("id");
    }
  });
});
