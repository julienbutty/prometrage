import { describe, it, expect } from "vitest";
import {
  extractClientInfo,
  extractMenuiserie,
  parseMenuiserieTitle,
  parseDimensions,
  parseGamme,
  parsePose,
} from "@/lib/pdf/parser";

describe("PDF Parser - Client Info", () => {
  it("should extract client name from PDF text", () => {
    const text = "Madame et Monsieur Paul KOMPANIETZ";
    const result = extractClientInfo(text);

    expect(result.nomClient).toBe("Paul KOMPANIETZ");
  });

  it("should extract client address", () => {
    const text = `37, Chemin du Cuvier
69380 CIVRIEUX D AZERGUES`;

    const result = extractClientInfo(text);

    expect(result.adresse).toContain("37, Chemin du Cuvier");
    expect(result.adresse).toContain("69380");
  });

  it("should extract client phone", () => {
    const text = "Contact client : 06 25 91 01 48";
    const result = extractClientInfo(text);

    expect(result.telephone).toBe("06 25 91 01 48");
  });
});

describe("PDF Parser - Menuiserie Title", () => {
  it("should parse coulissant title", () => {
    const title = "Coulissant 2 vantaux 2 rails";
    const result = parseMenuiserieTitle(title);

    expect(result.intitule).toBe("Coulissant 2 vantaux 2 rails");
    expect(result.type).toBe("coulissant");
  });

  it("should parse chassis fixe title", () => {
    const title = "Châssis fixe en dormant";
    const result = parseMenuiserieTitle(title);

    expect(result.intitule).toBe("Châssis fixe en dormant");
    expect(result.type).toBe("chassis_fixe");
  });

  it("should handle variant prefix", () => {
    const title = "Variante coulissant : Coulissant 2 vantaux 2 rails";
    const result = parseMenuiserieTitle(title);

    expect(result.intitule).toBe("Coulissant 2 vantaux 2 rails");
    expect(result.isVariante).toBe(true);
  });
});

describe("PDF Parser - Dimensions", () => {
  it("should extract dimensions from Larg X mm x Haut Y mm", () => {
    const text = "Larg 3000 mm x Haut 2250 mm";
    const result = parseDimensions(text);

    expect(result).not.toBeNull();
    expect(result!.largeur).toBe(3000);
    expect(result!.hauteur).toBe(2250);
  });

  it("should handle dimensions without spaces", () => {
    const text = "Larg 2000mm x Haut 1000mm";
    const result = parseDimensions(text);

    expect(result).not.toBeNull();
    expect(result!.largeur).toBe(2000);
    expect(result!.hauteur).toBe(1000);
  });

  it("should return null for invalid dimensions", () => {
    const text = "Invalid dimensions text";
    const result = parseDimensions(text);

    expect(result).toBeNull();
  });
});

describe("PDF Parser - Gamme", () => {
  it("should extract Performax gamme", () => {
    const text = ". Gamme Performax 65 CL";
    const result = parseGamme(text);

    expect(result).toBe("PERFORMAX");
  });

  it("should extract Optimax gamme", () => {
    const text = ". Gamme Optimax 65";
    const result = parseGamme(text);

    expect(result).toBe("OPTIMAX");
  });

  it("should be case insensitive", () => {
    const text = "gamme INNOVAX 70";
    const result = parseGamme(text);

    expect(result).toBe("INNOVAX");
  });

  it("should return null if no gamme found", () => {
    const text = "No gamme information here";
    const result = parseGamme(text);

    expect(result).toBeNull();
  });
});

describe("PDF Parser - Type de Pose", () => {
  it("should extract tunnel pose", () => {
    const text = ". Pose en tunnel";
    const result = parsePose(text);

    expect(result).toBe("tunnel");
  });

  it("should extract applique pose", () => {
    const text = "Pose en applique";
    const result = parsePose(text);

    expect(result).toBe("applique");
  });

  it("should extract renovation pose", () => {
    const text = "Pose en rénovation";
    const result = parsePose(text);

    expect(result).toBe("renovation");
  });

  it("should be case insensitive", () => {
    const text = "POSE EN TUNNEL";
    const result = parsePose(text);

    expect(result).toBe("tunnel");
  });
});

describe("PDF Parser - Extract Menuiserie", () => {
  it("should extract complete menuiserie from text block", () => {
    const text = `Coulissant 2 vantaux 2 rails
Larg 3000 mm x Haut 2250 mm
. Gamme Performax 65 CL
. Pose en tunnel
. Dormant de 65mm sans aile
. Habillage intérieur 3 côtés : Plat 30x2 (Réf : XF302)
. Habillage extérieur 3 côtés : Cornière 20x20 (Réf : XL202015)`;

    const result = extractMenuiserie(text, 0);

    expect(result.intitule).toBe("Coulissant 2 vantaux 2 rails");
    expect(result.donneesOriginales.largeur).toBe(3000);
    expect(result.donneesOriginales.hauteur).toBe(2250);
    expect(result.donneesOriginales.gamme).toBe("PERFORMAX");
    expect(result.donneesOriginales.pose).toBe("tunnel");
    expect(result.donneesOriginales.dormant).toContain("65mm");
    expect(result.donneesOriginales.habillageInt).toContain("Plat 30x2");
    expect(result.donneesOriginales.habillageExt).toContain("Cornière 20x20");
    expect(result.ordre).toBe(0);
  });

  it("should handle missing optional fields", () => {
    const text = `Châssis fixe en dormant
Larg 2000 mm x Haut 1000 mm`;

    const result = extractMenuiserie(text, 1);

    expect(result.intitule).toBe("Châssis fixe en dormant");
    expect(result.donneesOriginales.largeur).toBe(2000);
    expect(result.donneesOriginales.hauteur).toBe(1000);
    expect(result.ordre).toBe(1);
  });
});
