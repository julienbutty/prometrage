import { describe, it, expect } from "vitest";
import {
  detectMateriau,
  detectPose,
  detectTypeProduit,
  getFormConfigKey,
  type Materiau,
  type TypePose,
  type TypeProduit,
} from "@/lib/utils/menuiserie-type";

describe("detectMateriau", () => {
  it("détecte ALU via gamme OPTIMAX", () => {
    const result = detectMateriau({ gamme: "OPTIMAX" });
    expect(result).toBe("ALU");
  });

  it("détecte ALU via gamme INNOVAX", () => {
    const result = detectMateriau({ gamme: "INNOVAX" });
    expect(result).toBe("ALU");
  });

  it("détecte ALU via gamme PERFORMAX", () => {
    const result = detectMateriau({ gamme: "PERFORMAX" });
    expect(result).toBe("ALU");
  });

  it("détecte ALU même si gamme en minuscules", () => {
    const result = detectMateriau({ gamme: "optimax" });
    expect(result).toBe("ALU");
  });

  it("détecte PVC via gamme SOFTLINE", () => {
    const result = detectMateriau({ gamme: "SOFTLINE" });
    expect(result).toBe("PVC");
  });

  it("détecte PVC via gamme SWINGLINE", () => {
    const result = detectMateriau({ gamme: "SWINGLINE" });
    expect(result).toBe("PVC");
  });

  it("détecte PVC via gamme KIETISLINE", () => {
    const result = detectMateriau({ gamme: "KIETISLINE" });
    expect(result).toBe("PVC");
  });

  it("détecte PVC via gamme WISIO", () => {
    const result = detectMateriau({ gamme: "WISIO" });
    expect(result).toBe("PVC");
  });

  it("détecte PVC par défaut si gamme absente", () => {
    const result = detectMateriau({});
    expect(result).toBe("PVC");
  });

  it("détecte PVC par défaut si gamme inconnue", () => {
    const result = detectMateriau({ gamme: "UNKNOWN_GAMME" });
    expect(result).toBe("PVC");
  });
});

describe("detectPose", () => {
  it("détecte NEUF via pose 'applique'", () => {
    const result = detectPose({ pose: "applique" });
    expect(result).toBe("NEUF");
  });

  it("détecte NEUF via pose contenant 'applique'", () => {
    const result = detectPose({ pose: "Pose en applique" });
    expect(result).toBe("NEUF");
  });

  it("détecte NEUF via pose 'neuf'", () => {
    const result = detectPose({ pose: "neuf" });
    expect(result).toBe("NEUF");
  });

  it("détecte RENO via pose 'tunnel'", () => {
    const result = detectPose({ pose: "tunnel" });
    expect(result).toBe("RENO");
  });

  it("détecte RENO via pose 'renovation'", () => {
    const result = detectPose({ pose: "renovation" });
    expect(result).toBe("RENO");
  });

  it("détecte RENO via pose 'rénovation' (avec accent)", () => {
    const result = detectPose({ pose: "rénovation" });
    expect(result).toBe("RENO");
  });

  it("détecte RENO via pose 'réno'", () => {
    const result = detectPose({ pose: "réno" });
    expect(result).toBe("RENO");
  });

  it("détecte NEUF par défaut si pose absente", () => {
    const result = detectPose({});
    expect(result).toBe("NEUF");
  });

  it("détecte NEUF par défaut si pose inconnue", () => {
    const result = detectPose({ pose: "pose inconnue" });
    expect(result).toBe("NEUF");
  });
});

describe("detectTypeProduit", () => {
  it("détecte COULISSANT via intitulé 'Coulissant'", () => {
    const result = detectTypeProduit({ intitule: "Coulissant 2 vantaux" });
    expect(result).toBe("COULISSANT");
  });

  it("détecte COULISSANT via intitulé 'coulissant' (minuscule)", () => {
    const result = detectTypeProduit({ intitule: "coulissant" });
    expect(result).toBe("COULISSANT");
  });

  it("détecte COULISSANT via intitulé contenant 'galando'", () => {
    const result = detectTypeProduit({ intitule: "Galando 3 vantaux" });
    expect(result).toBe("COULISSANT");
  });

  it("détecte PORTE via intitulé 'Porte'", () => {
    const result = detectTypeProduit({ intitule: "Porte d'entrée" });
    expect(result).toBe("PORTE");
  });

  it("détecte PORTE via intitulé 'entrée'", () => {
    const result = detectTypeProduit({ intitule: "Porte entrée monobloc" });
    expect(result).toBe("PORTE");
  });

  it("détecte PORTE via intitulé 'service'", () => {
    const result = detectTypeProduit({ intitule: "Porte de service" });
    expect(result).toBe("PORTE");
  });

  it("détecte FENETRE par défaut", () => {
    const result = detectTypeProduit({ intitule: "Fenêtre 2 vantaux" });
    expect(result).toBe("FENETRE");
  });

  it("détecte FENETRE si intitulé absent", () => {
    const result = detectTypeProduit({});
    expect(result).toBe("FENETRE");
  });

  it("détecte FENETRE si intitulé inconnu", () => {
    const result = detectTypeProduit({ intitule: "Produit inconnu" });
    expect(result).toBe("FENETRE");
  });
});

describe("getFormConfigKey", () => {
  it("génère la clé ALU_NEUF_FENETRE", () => {
    const data = {
      gamme: "OPTIMAX",
      pose: "applique",
      intitule: "Fenêtre 2 vantaux",
    };
    const result = getFormConfigKey(data);
    expect(result).toBe("ALU_NEUF_FENETRE");
  });

  it("génère la clé PVC_RENO_COULISSANT", () => {
    const data = {
      gamme: "WISIO",
      pose: "tunnel",
      intitule: "Coulissant 3 vantaux",
    };
    const result = getFormConfigKey(data);
    expect(result).toBe("PVC_RENO_COULISSANT");
  });

  it("génère la clé ALU_RENO_PORTE", () => {
    const data = {
      gamme: "INNOVAX",
      pose: "renovation",
      intitule: "Porte d'entrée",
    };
    const result = getFormConfigKey(data);
    expect(result).toBe("ALU_RENO_PORTE");
  });

  it("génère la clé PVC_NEUF_FENETRE par défaut", () => {
    const data = {};
    const result = getFormConfigKey(data);
    expect(result).toBe("PVC_NEUF_FENETRE");
  });

  it("gère les données mixtes", () => {
    const data = {
      gamme: "PERFORMAX", // ALU
      pose: "Pose en applique", // NEUF
      intitule: "Porte de service", // PORTE
    };
    const result = getFormConfigKey(data);
    expect(result).toBe("ALU_NEUF_PORTE");
  });
});
