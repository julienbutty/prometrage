import { describe, it, expect } from "vitest";
import { ProjetSchema, CreateProjetSchema } from "@/lib/validations/projet";

describe("ProjetSchema - Validation Zod", () => {
  describe("Validation des champs requis", () => {
    it("devrait accepter un projet valide complet", () => {
      const validProjet = {
        reference: "DUPO-2024-001",
        clientNom: "DUPONT",
        clientAdresse: "15 Rue des Lilas",
        clientTel: "06 12 34 56 78",
        clientEmail: "jean.dupont@example.com",
        pdfUrl: "https://storage.example.com/file.pdf",
        pdfOriginalNom: "fiche-metreur.pdf",
      };

      const result = ProjetSchema.safeParse(validProjet);
      expect(result.success).toBe(true);
    });

    it("devrait rejeter un projet sans reference", () => {
      const invalidProjet = {
        clientNom: "DUPONT",
      };

      const result = ProjetSchema.safeParse(invalidProjet);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("reference");
      }
    });

    it("devrait rejeter un projet sans clientNom", () => {
      const invalidProjet = {
        reference: "DUPO-2024-001",
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
        reference: "DUPO-2024-001",
        clientNom: "DUPONT",
      };

      const result = ProjetSchema.safeParse(projet);
      expect(result.success).toBe(true);
    });

    it("devrait rejeter une référence trop courte", () => {
      const projet = {
        reference: "AB",
        clientNom: "DUPONT",
      };

      const result = ProjetSchema.safeParse(projet);
      expect(result.success).toBe(false);
    });

    it("devrait trim les espaces dans la référence", () => {
      const projet = {
        reference: "  DUPO-2024-001  ",
        clientNom: "DUPONT",
      };

      const result = ProjetSchema.safeParse(projet);
      if (result.success) {
        expect(result.data.reference).toBe("DUPO-2024-001");
      }
    });
  });

  describe("Validation de l'email client", () => {
    it("devrait accepter un email valide", () => {
      const projet = {
        reference: "DUPO-2024-001",
        clientNom: "DUPONT",
        clientEmail: "jean.dupont@example.com",
      };

      const result = ProjetSchema.safeParse(projet);
      expect(result.success).toBe(true);
    });

    it("devrait rejeter un email invalide", () => {
      const projet = {
        reference: "DUPO-2024-001",
        clientNom: "DUPONT",
        clientEmail: "email-invalide",
      };

      const result = ProjetSchema.safeParse(projet);
      expect(result.success).toBe(false);
    });

    it("devrait accepter un email null ou undefined (optionnel)", () => {
      const projet = {
        reference: "DUPO-2024-001",
        clientNom: "DUPONT",
        clientEmail: undefined,
      };

      const result = ProjetSchema.safeParse(projet);
      expect(result.success).toBe(true);
    });
  });

  describe("Validation du téléphone client", () => {
    it("devrait accepter un numéro français standard", () => {
      const projet = {
        reference: "DUPO-2024-001",
        clientNom: "DUPONT",
        clientTel: "06 12 34 56 78",
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
          reference: "DUPO-2024-001",
          clientNom: "DUPONT",
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
        reference: "DUPO-2024-001",
        clientNom: "DUPONT",
        pdfUrl: "https://storage.example.com/file.pdf",
      };

      const result = ProjetSchema.safeParse(projet);
      expect(result.success).toBe(true);
    });

    it("devrait rejeter une URL invalide", () => {
      const projet = {
        reference: "DUPO-2024-001",
        clientNom: "DUPONT",
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
      clientNom: "DUPONT",
      clientAdresse: "15 Rue des Lilas",
      clientTel: "06 12 34 56 78",
      clientEmail: "jean.dupont@example.com",
    };

    const result = CreateProjetSchema.safeParse(newProjet);
    expect(result.success).toBe(true);
  });

  it("ne devrait pas accepter un ID lors de la création", () => {
    const newProjet = {
      id: "should-not-be-here",
      clientNom: "DUPONT",
    };

    const result = CreateProjetSchema.safeParse(newProjet);
    // Le schéma devrait omettre l'ID
    if (result.success) {
      expect(result.data).not.toHaveProperty("id");
    }
  });
});
