import { describe, it, expect } from "vitest";
import {
  MenuiserieDataSchema,
  MenuiserieSchema,
  CreateMenuiserieSchema,
  EcartSchema,
} from "@/lib/validations/menuiserie";

describe("MenuiserieDataSchema - Données de menuiserie", () => {
  describe("Validation des dimensions", () => {
    it("devrait accepter des dimensions valides", () => {
      const data = {
        largeur: 3000,
        hauteur: 2250,
      };

      const result = MenuiserieDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("devrait rejeter une largeur négative", () => {
      const data = {
        largeur: -100,
        hauteur: 2250,
      };

      const result = MenuiserieDataSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("devrait rejeter une largeur trop grande (>10m)", () => {
      const data = {
        largeur: 11000, // 11 mètres
        hauteur: 2250,
      };

      const result = MenuiserieDataSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("devrait rejeter une hauteur trop petite (<10cm)", () => {
      const data = {
        largeur: 3000,
        hauteur: 50, // 5cm
      };

      const result = MenuiserieDataSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("Validation de la gamme", () => {
    it("devrait accepter les gammes OPTIMAX, PERFORMAX, INNOVAX", () => {
      const gammes = ["OPTIMAX", "PERFORMAX", "INNOVAX"];

      gammes.forEach((gamme) => {
        const data = {
          largeur: 3000,
          hauteur: 2250,
          gamme,
        };

        const result = MenuiserieDataSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("devrait accepter toute gamme string (flexibilité pour futures gammes)", () => {
      // Depuis la feature 001-pdf-parsing-multi-product, gamme est un string libre
      // pour supporter ALU (OPTIMAX, INNOVAX, PERFORMAX) et PVC (SOFTLINE, KIETISLINE, WISIO)
      // ainsi que d'éventuelles futures gammes sans modification code
      const data = {
        largeur: 3000,
        hauteur: 2250,
        gamme: "FUTURE_GAMME",
      };

      const result = MenuiserieDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("Validation du type de pose", () => {
    it("devrait accepter les types de pose valides", () => {
      const poses = ["tunnel", "applique", "renovation"];

      poses.forEach((pose) => {
        const data = {
          largeur: 3000,
          hauteur: 2250,
          pose,
        };

        const result = MenuiserieDataSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("devrait rejeter un type de pose invalide", () => {
      const data = {
        largeur: 3000,
        hauteur: 2250,
        pose: "pose-invalide",
      };

      const result = MenuiserieDataSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("Validation des données complètes", () => {
    it("devrait accepter toutes les données d'une menuiserie", () => {
      const data = {
        largeur: 3000,
        hauteur: 2250,
        gamme: "PERFORMAX",
        pose: "tunnel",
        dormant: "sans aile",
        habillageInt: "Plat 30x2",
        habillageExt: "Cornière 20x20",
        intercalaire: "noir",
        ouvrantPrincipal: "droite",
        rails: "inox",
      };

      const result = MenuiserieDataSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});

describe("EcartSchema - Calcul des écarts", () => {
  it("devrait accepter un écart valide", () => {
    const ecart = {
      champ: "largeur",
      valeurOriginale: 3000,
      valeurModifiee: 3050,
      pourcentage: 1.67,
      niveau: "info",
    };

    const result = EcartSchema.safeParse(ecart);
    expect(result.success).toBe(true);
  });

  it("devrait accepter les niveaux info, warning, error", () => {
    const niveaux = ["info", "warning", "error"];

    niveaux.forEach((niveau) => {
      const ecart = {
        champ: "largeur",
        valeurOriginale: 3000,
        valeurModifiee: 3050,
        pourcentage: 1.67,
        niveau,
      };

      const result = EcartSchema.safeParse(ecart);
      expect(result.success).toBe(true);
    });
  });

  it("devrait rejeter un niveau invalide", () => {
    const ecart = {
      champ: "largeur",
      valeurOriginale: 3000,
      valeurModifiee: 3050,
      pourcentage: 1.67,
      niveau: "invalid",
    };

    const result = EcartSchema.safeParse(ecart);
    expect(result.success).toBe(false);
  });
});

describe("MenuiserieSchema - Validation complète", () => {
  describe("Validation des champs requis", () => {
    it("devrait accepter une menuiserie valide complète", () => {
      const menuiserie = {
        projetId: "clxyz123abc",
        intitule: "Coulissant 2 vantaux",
        repere: "Salon",
        donneesOriginales: {
          largeur: 3000,
          hauteur: 2250,
          gamme: "PERFORMAX",
          pose: "tunnel",
        },
        ordre: 1,
        validee: false,
      };

      const result = MenuiserieSchema.safeParse(menuiserie);
      expect(result.success).toBe(true);
    });

    it("devrait rejeter une menuiserie sans projetId", () => {
      const menuiserie = {
        intitule: "Coulissant 2 vantaux",
        donneesOriginales: {
          largeur: 3000,
          hauteur: 2250,
        },
      };

      const result = MenuiserieSchema.safeParse(menuiserie);
      expect(result.success).toBe(false);
    });

    it("devrait rejeter une menuiserie sans intitule", () => {
      const menuiserie = {
        projetId: "clxyz123abc",
        donneesOriginales: {
          largeur: 3000,
          hauteur: 2250,
        },
      };

      const result = MenuiserieSchema.safeParse(menuiserie);
      expect(result.success).toBe(false);
    });

    it("devrait rejeter une menuiserie sans donneesOriginales", () => {
      const menuiserie = {
        projetId: "clxyz123abc",
        intitule: "Coulissant 2 vantaux",
      };

      const result = MenuiserieSchema.safeParse(menuiserie);
      expect(result.success).toBe(false);
    });
  });

  describe("Validation des données modifiées", () => {
    it("devrait accepter donneesModifiees comme optionnel", () => {
      const menuiserie = {
        projetId: "clxyz123abc",
        intitule: "Coulissant 2 vantaux",
        donneesOriginales: {
          largeur: 3000,
          hauteur: 2250,
        },
      };

      const result = MenuiserieSchema.safeParse(menuiserie);
      expect(result.success).toBe(true);
    });

    it("devrait accepter donneesModifiees si présentes", () => {
      const menuiserie = {
        projetId: "clxyz123abc",
        intitule: "Coulissant 2 vantaux",
        donneesOriginales: {
          largeur: 3000,
          hauteur: 2250,
        },
        donneesModifiees: {
          largeur: 3050,
          hauteur: 2250,
        },
      };

      const result = MenuiserieSchema.safeParse(menuiserie);
      expect(result.success).toBe(true);
    });
  });

  describe("Validation des écarts", () => {
    it("devrait accepter un tableau d'écarts", () => {
      const menuiserie = {
        projetId: "clxyz123abc",
        intitule: "Coulissant 2 vantaux",
        donneesOriginales: {
          largeur: 3000,
          hauteur: 2250,
        },
        ecarts: [
          {
            champ: "largeur",
            valeurOriginale: 3000,
            valeurModifiee: 3050,
            pourcentage: 1.67,
            niveau: "info",
          },
        ],
      };

      const result = MenuiserieSchema.safeParse(menuiserie);
      expect(result.success).toBe(true);
    });
  });

  describe("Validation du repère", () => {
    it("devrait accepter un repère optionnel", () => {
      const menuiserie = {
        projetId: "clxyz123abc",
        intitule: "Coulissant 2 vantaux",
        donneesOriginales: {
          largeur: 3000,
          hauteur: 2250,
        },
      };

      const result = MenuiserieSchema.safeParse(menuiserie);
      expect(result.success).toBe(true);
    });

    it("devrait trim et transformer le repère en majuscules", () => {
      const menuiserie = {
        projetId: "clxyz123abc",
        intitule: "Coulissant 2 vantaux",
        repere: "  salon  ",
        donneesOriginales: {
          largeur: 3000,
          hauteur: 2250,
        },
      };

      const result = MenuiserieSchema.safeParse(menuiserie);
      if (result.success) {
        expect(result.data.repere).toBe("SALON");
      }
    });
  });
});

describe("CreateMenuiserieSchema - Création de menuiserie", () => {
  it("devrait accepter les données minimales pour créer une menuiserie", () => {
    const newMenuiserie = {
      projetId: "clxyz123abc",
      intitule: "Coulissant 2 vantaux",
      donneesOriginales: {
        largeur: 3000,
        hauteur: 2250,
        gamme: "PERFORMAX",
      },
    };

    const result = CreateMenuiserieSchema.safeParse(newMenuiserie);
    expect(result.success).toBe(true);
  });

  it("ne devrait pas accepter un ID lors de la création", () => {
    const newMenuiserie = {
      id: "should-not-be-here",
      projetId: "clxyz123abc",
      intitule: "Coulissant 2 vantaux",
      donneesOriginales: {
        largeur: 3000,
        hauteur: 2250,
      },
    };

    const result = CreateMenuiserieSchema.safeParse(newMenuiserie);
    if (result.success) {
      expect(result.data).not.toHaveProperty("id");
    }
  });
});
