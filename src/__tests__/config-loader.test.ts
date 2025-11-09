import { describe, it, expect } from "vitest";
import {
  loadFormConfig,
  type FieldType,
  type FieldConfig,
  type FormConfig,
} from "@/lib/forms/config-loader";

describe("loadFormConfig", () => {
  it("charge la config ALU_NEUF_FENETRE", () => {
    const config = loadFormConfig("ALU_NEUF_FENETRE");
    expect(config).toBeDefined();
    expect(config.pack).toBeDefined();
    expect(config.pack.options).toContain("Tradition");
    expect(config.gamme).toBeDefined();
    expect(config.gamme.options).toContain("OPTIMAX");
  });

  it("charge la config PVC_NEUF_FENETRE", () => {
    const config = loadFormConfig("PVC_NEUF_FENETRE");
    expect(config).toBeDefined();
    expect(config.gamme).toBeDefined();
    expect(config.gamme.options).toContain("SOFTLINE");
  });

  it("charge la config ALU_RENO_FENETRE", () => {
    const config = loadFormConfig("ALU_RENO_FENETRE");
    expect(config).toBeDefined();
    expect(config.gamme.options).toContain("OPTIMAX");
  });

  it("charge la config PVC_RENO_FENETRE", () => {
    const config = loadFormConfig("PVC_RENO_FENETRE");
    expect(config).toBeDefined();
    expect(config.gamme.options).toContain("SOFTLINE");
  });

  it("charge la config ALU_NEUF_PORTE", () => {
    const config = loadFormConfig("ALU_NEUF_PORTE");
    expect(config).toBeDefined();
    expect(config.gamme.options).toContain("OPTIMAX");
    expect(config.typePorte).toBeDefined();
  });

  it("charge la config ALU_RENO_PORTE (même que NEUF)", () => {
    const config = loadFormConfig("ALU_RENO_PORTE");
    expect(config).toBeDefined();
    expect(config.typePorte).toBeDefined();
  });

  it("charge la config PVC_NEUF_COULISSANT", () => {
    const config = loadFormConfig("PVC_NEUF_COULISSANT");
    expect(config).toBeDefined();
    expect(config.gamme.options).toContain("WISIO");
  });

  it("charge la config PVC_RENO_COULISSANT (même que NEUF)", () => {
    const config = loadFormConfig("PVC_RENO_COULISSANT");
    expect(config).toBeDefined();
    expect(config.gamme.options).toContain("WISIO");
  });

  it("charge la config PVC_NEUF_PORTE", () => {
    const config = loadFormConfig("PVC_NEUF_PORTE");
    expect(config).toBeDefined();
    expect(config.typeMenuiserie).toBeDefined();
    expect(config.typeMenuiserie.options).toContain("Entrée");
  });

  it("charge la config PVC_RENO_PORTE (même que NEUF)", () => {
    const config = loadFormConfig("PVC_RENO_PORTE");
    expect(config).toBeDefined();
    expect(config.typeMenuiserie.options).toContain("Entrée");
  });

  it("retourne config par défaut si clé inconnue", () => {
    const config = loadFormConfig("UNKNOWN_KEY");
    expect(config).toBeDefined();
    // Config par défaut doit avoir au moins les champs de base
    expect(config).toHaveProperty("gamme");
    expect(config).toHaveProperty("couleurInt");
    expect(config).toHaveProperty("couleurExt");
  });

  it("retourne config par défaut si clé vide", () => {
    const config = loadFormConfig("");
    expect(config).toBeDefined();
  });

  it("gère les types de champs correctement", () => {
    const config = loadFormConfig("ALU_NEUF_FENETRE");

    // Vérifie qu'un champ select a bien le type select
    expect(config.pack.type).toBe("select");

    // Vérifie qu'un champ combobox a bien le type combobox
    expect(config.couleurInt.type).toBe("combobox");
    expect(config.couleurInt.allowCustom).toBe(true);

    // Vérifie qu'un champ number a bien le type number
    expect(config.hauteurAllege.type).toBe("number");
    expect(config.hauteurAllege.unit).toBe("mm");

    // Vérifie qu'un champ text a bien le type text
    expect(config.commentaires.type).toBe("text");
  });

  it("charge les options correctement pour un combobox", () => {
    const config = loadFormConfig("ALU_NEUF_FENETRE");

    expect(config.couleurInt.options).toBeDefined();
    expect(config.couleurInt.options).toContain("Blanc");
    expect(config.couleurInt.options).toContain("Noir");
    expect(config.couleurInt.options).toContain("F9");
  });

  it("charge les labels correctement", () => {
    const config = loadFormConfig("PVC_NEUF_FENETRE");

    expect(config.gamme.label).toBe("Gamme");
    expect(config.couleurInt.label).toBe("Couleur intérieure");
    expect(config.hauteurAllege.label).toBe("Hauteur d'allège");
  });

  it("gère le placeholder pour les champs avec allowCustom", () => {
    const config = loadFormConfig("ALU_NEUF_FENETRE");

    expect(config.couleurInt.placeholder).toBe("Ex: RAL 7016");
    expect(config.couleurExt.placeholder).toBe("Ex: RAL 7016");
  });
});

describe("FieldConfig type guards", () => {
  it("valide la structure d'un FieldConfig select", () => {
    const config = loadFormConfig("ALU_NEUF_FENETRE");
    const packConfig = config.pack;

    expect(packConfig).toHaveProperty("label");
    expect(packConfig).toHaveProperty("type");
    expect(packConfig).toHaveProperty("options");
    expect(Array.isArray(packConfig.options)).toBe(true);
  });

  it("valide la structure d'un FieldConfig combobox avec allowCustom", () => {
    const config = loadFormConfig("ALU_NEUF_FENETRE");
    const couleurConfig = config.couleurInt;

    expect(couleurConfig).toHaveProperty("label");
    expect(couleurConfig).toHaveProperty("type");
    expect(couleurConfig).toHaveProperty("options");
    expect(couleurConfig).toHaveProperty("allowCustom");
    expect(couleurConfig).toHaveProperty("placeholder");
  });

  it("valide la structure d'un FieldConfig number avec unit", () => {
    const config = loadFormConfig("ALU_NEUF_FENETRE");
    const hauteurConfig = config.hauteurAllege;

    expect(hauteurConfig).toHaveProperty("label");
    expect(hauteurConfig).toHaveProperty("type");
    expect(hauteurConfig).toHaveProperty("unit");
    expect(hauteurConfig.type).toBe("number");
  });
});
