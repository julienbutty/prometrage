# TESTING_GUIDE.md - Guide de tests TDD

## Application Métreur V2

### 📋 Configuration des tests

#### Setup Vitest

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D @vitejs/plugin-react jsdom
```

#### vitest.config.ts

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./tests/setup.ts",
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", ".next/"],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
```

### 🔴 Tests Parsing PDF (RED → GREEN → REFACTOR)

#### RED: Test qui échoue d'abord

```typescript
// __tests__/lib/pdf/parser.test.ts
import { describe, it, expect } from "vitest";
import {
  extractRepere,
  extractDimensions,
  extractGamme,
  parsePDFContent,
} from "@/lib/pdf/parser";

describe("PDF Parser - Extraction des données", () => {
  describe("extractRepere", () => {
    it('should extract repere from "Salon : Coulissant"', () => {
      const text = "Salon : Coulissant 2 vantaux";
      const result = extractRepere(text);
      expect(result.repere).toBe("Salon");
      expect(result.intitule).toBe("Coulissant 2 vantaux");
    });

    it("should return null repere when no colon", () => {
      const text = "Coulissant 2 vantaux";
      const result = extractRepere(text);
      expect(result.repere).toBeNull();
      expect(result.intitule).toBe("Coulissant 2 vantaux");
    });
  });

  describe("extractDimensions", () => {
    it("should extract largeur and hauteur from text", () => {
      const text = "Larg 3000 mm x Haut 2250 mm";
      const result = extractDimensions(text);
      expect(result).toEqual({
        largeur: 3000,
        hauteur: 2250,
      });
    });

    it("should return null for invalid format", () => {
      const text = "Dimensions invalides";
      const result = extractDimensions(text);
      expect(result).toBeNull();
    });
  });

  describe("extractGamme", () => {
    it("should extract PERFORMAX gamme", () => {
      const text = "Gamme Performax 65 CL";
      const result = extractGamme(text);
      expect(result).toBe("PERFORMAX");
    });

    it("should extract OPTIMAX gamme", () => {
      const text = "Gamme Optimax 65";
      const result = extractGamme(text);
      expect(result).toBe("OPTIMAX");
    });

    it("should return null for unknown gamme", () => {
      const text = "Gamme inconnue";
      const result = extractGamme(text);
      expect(result).toBeNull();
    });
  });
});
```

#### GREEN: Implémentation minimale

```typescript
// lib/pdf/parser.ts
export function extractRepere(text: string) {
  const match = text.match(/^([^:]+)\s*:\s*(.+)$/);
  if (match) {
    return {
      repere: match[1].trim(),
      intitule: match[2].trim(),
    };
  }
  return { repere: null, intitule: text };
}

export function extractDimensions(text: string) {
  const regex = /Larg\s*(\d+)\s*mm\s*x\s*Haut\s*(\d+)\s*mm/i;
  const match = text.match(regex);

  if (match) {
    return {
      largeur: parseInt(match[1]),
      hauteur: parseInt(match[2]),
    };
  }
  return null;
}

export function extractGamme(text: string) {
  const regex = /Gamme\s*(Optimax|Performax|Innovax)/i;
  const match = text.match(regex);

  if (match) {
    return match[1].toUpperCase();
  }
  return null;
}
```

#### REFACTOR: Amélioration avec types

```typescript
// lib/pdf/parser.ts (version améliorée)
import { z } from "zod";

// Types
export const GammeEnum = z.enum(["OPTIMAX", "PERFORMAX", "INNOVAX"]);
export type Gamme = z.infer<typeof GammeEnum>;

interface RepereResult {
  repere: string | null;
  intitule: string;
}

interface Dimensions {
  largeur: number;
  hauteur: number;
}

// Patterns centralisés
const PATTERNS = {
  repere: /^([^:]+)\s*:\s*(.+)$/,
  dimensions: /Larg\s*(\d+)\s*mm\s*x\s*Haut\s*(\d+)\s*mm/i,
  gamme: /Gamme\s*(Optimax|Performax|Innovax)/i,
  pose: /Pose\s+en\s+(tunnel|applique|rénovation)/i,
  dormant: /Dormant.*?(avec|sans)\s+aile/i,
  intercalaire: /Intercalaire\s*:\s*(blanc|noir)/i,
} as const;

export function extractRepere(text: string): RepereResult {
  const match = text.match(PATTERNS.repere);
  return match
    ? { repere: match[1].trim(), intitule: match[2].trim() }
    : { repere: null, intitule: text.trim() };
}

export function extractDimensions(text: string): Dimensions | null {
  const match = text.match(PATTERNS.dimensions);
  if (!match) return null;

  const largeur = parseInt(match[1], 10);
  const hauteur = parseInt(match[2], 10);

  // Validation des valeurs
  if (isNaN(largeur) || isNaN(hauteur)) return null;
  if (largeur < 100 || largeur > 10000) return null;
  if (hauteur < 100 || hauteur > 10000) return null;

  return { largeur, hauteur };
}

export function extractGamme(text: string): Gamme | null {
  const match = text.match(PATTERNS.gamme);
  if (!match) return null;

  const gamme = match[1].toUpperCase();
  try {
    return GammeEnum.parse(gamme);
  } catch {
    return null;
  }
}
```

### 🧪 Tests Composants Mobile

#### Test formulaire mobile

```typescript
// __tests__/components/forms/MenuiserieForm.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MenuiserieForm } from "@/components/forms/MenuiserieForm";

describe("MenuiserieForm - Mobile First", () => {
  const mockMenuiserie = {
    id: "test-id",
    donneesOriginales: {
      largeur: 3000,
      hauteur: 2250,
      gamme: "PERFORMAX",
      pose: "tunnel",
    },
  };

  it("should display mobile-optimized inputs", () => {
    render(<MenuiserieForm menuiserie={mockMenuiserie} />);

    const largeurInput = screen.getByLabelText(/largeur/i);
    expect(largeurInput).toHaveAttribute("inputMode", "numeric");
    expect(largeurInput).toHaveClass("h-14"); // Grande taille mobile
  });

  it("should show warning alert when largeur differs by 5-10%", async () => {
    const user = userEvent.setup();
    render(<MenuiserieForm menuiserie={mockMenuiserie} />);

    const largeurInput = screen.getByLabelText(/largeur/i);
    await user.clear(largeurInput);
    await user.type(largeurInput, "3200"); // +6.7% difference

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("bg-orange-50"); // Warning color
      expect(alert).toHaveTextContent(/écart de 200mm/i);
    });
  });

  it("should show error alert when largeur differs by >10%", async () => {
    const user = userEvent.setup();
    render(<MenuiserieForm menuiserie={mockMenuiserie} />);

    const largeurInput = screen.getByLabelText(/largeur/i);
    await user.clear(largeurInput);
    await user.type(largeurInput, "3400"); // +13.3% difference

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("bg-red-50"); // Error color
    });
  });
});
```

### 🔧 Tests Hooks personnalisés

```typescript
// __tests__/hooks/useAutoSave.test.ts
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAutoSave } from "@/hooks/useAutoSave";
import { vi } from "vitest";

describe("useAutoSave", () => {
  it("should save after delay", async () => {
    const mockSave = vi.fn();
    const { result, rerender } = renderHook(
      ({ data }) => useAutoSave(data, mockSave, 1000),
      { initialProps: { data: { test: 1 } } }
    );

    expect(mockSave).not.toHaveBeenCalled();

    // Change data
    rerender({ data: { test: 2 } });

    // Wait for debounce
    await waitFor(
      () => {
        expect(mockSave).toHaveBeenCalledWith({ test: 2 });
      },
      { timeout: 1500 }
    );
  });

  it("should show saving state", async () => {
    const mockSave = vi.fn(() => new Promise((r) => setTimeout(r, 100)));
    const { result } = renderHook(() =>
      useAutoSave({ test: 1 }, mockSave, 100)
    );

    expect(result.current.isSaving).toBe(false);

    await waitFor(() => {
      expect(result.current.isSaving).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.isSaving).toBe(false);
    });
  });
});
```

### 📊 Tests API Routes

```typescript
// __tests__/api/upload.test.ts
import { POST } from "@/app/api/upload/pdf/route";
import { prismaMock } from "@/tests/mocks/prisma";

describe("POST /api/upload/pdf", () => {
  it("should parse PDF and create project", async () => {
    const formData = new FormData();
    const pdfFile = new File(["pdf content"], "test.pdf", {
      type: "application/pdf",
    });
    formData.append("file", pdfFile);

    const request = new Request("http://localhost/api/upload/pdf", {
      method: "POST",
      body: formData,
    });

    prismaMock.projet.create.mockResolvedValue({
      id: "new-project-id",
      reference: "TEST-2024-001",
      menuiseries: [
        {
          id: "menu-1",
          repere: "Salon",
          intitule: "Coulissant",
          donneesOriginales: {
            largeur: 3000,
            hauteur: 2250,
          },
        },
      ],
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.menuiseries).toHaveLength(1);
  });

  it("should reject non-PDF files", async () => {
    const formData = new FormData();
    const txtFile = new File(["text"], "test.txt", {
      type: "text/plain",
    });
    formData.append("file", txtFile);

    const request = new Request("http://localhost/api/upload/pdf", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("INVALID_PDF");
  });
});
```

### 🎯 Tests de validation Zod

```typescript
// __tests__/lib/validations/menuiserie.test.ts
import { menuiserieSchema, ecartSchema } from "@/lib/validations";

describe("Menuiserie Validation Schema", () => {
  it("should validate correct menuiserie data", () => {
    const valid = {
      largeur: 3000,
      hauteur: 2250,
      gamme: "PERFORMAX",
      pose: "tunnel",
      intercalaire: "noir",
    };

    expect(() => menuiserieSchema.parse(valid)).not.toThrow();
  });

  it("should reject invalid dimensions", () => {
    const invalid = {
      largeur: 50, // Too small
      hauteur: 2250,
      gamme: "PERFORMAX",
      pose: "tunnel",
    };

    expect(() => menuiserieSchema.parse(invalid)).toThrow();
  });

  it("should reject unknown gamme", () => {
    const invalid = {
      largeur: 3000,
      hauteur: 2250,
      gamme: "UNKNOWN",
      pose: "tunnel",
    };

    expect(() => menuiserieSchema.parse(invalid)).toThrow();
  });
});

describe("Ecart Calculation", () => {
  it("should calculate percentage correctly", () => {
    const result = ecartSchema.parse({
      champ: "largeur",
      valeurOriginale: 3000,
      valeurModifiee: 3150,
      pourcentage: 5,
      niveau: "warning",
    });

    expect(result.niveau).toBe("warning");
  });
});
```

### 📱 Tests d'intégration Mobile

```typescript
// __tests__/integration/mobile-workflow.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileApp } from "@/app/(mobile)/layout";

describe("Mobile Workflow Integration", () => {
  it("should complete full menuiserie update flow", async () => {
    const user = userEvent.setup();

    // Render mobile app
    render(<MobileApp />);

    // 1. Upload PDF
    const uploadButton = screen.getByText(/nouveau projet/i);
    await user.click(uploadButton);

    // 2. Select file
    const fileInput = screen.getByLabelText(/fichier pdf/i);
    const file = new File(["pdf"], "test.pdf", { type: "application/pdf" });
    await user.upload(fileInput, file);

    // 3. Wait for parsing
    await waitFor(() => {
      expect(screen.getByText(/3 menuiseries trouvées/i)).toBeInTheDocument();
    });

    // 4. Select first menuiserie
    const firstMenuiserie = screen.getByText(/salon/i);
    await user.click(firstMenuiserie);

    // 5. Modify dimension
    const largeurInput = screen.getByLabelText(/largeur/i);
    await user.clear(largeurInput);
    await user.type(largeurInput, "3050");

    // 6. Check alert appears
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    // 7. Save
    const saveButton = screen.getByText(/enregistrer/i);
    await user.click(saveButton);

    // 8. Verify success
    await waitFor(() => {
      expect(screen.getByText(/sauvegardé/i)).toBeInTheDocument();
    });
  });
});
```

### 📈 Commandes NPM pour tests

```json
// package.json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest watch",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:mobile": "vitest run --grep mobile",
    "test:pdf": "vitest run --grep pdf",
    "test:api": "vitest run --grep api"
  }
}
```

### ✅ Checklist TDD pour chaque feature

```markdown
## Feature: [Nom de la fonctionnalité]

### 🔴 RED Phase

- [ ] Écrire test unitaire qui échoue
- [ ] Vérifier l'erreur : "function not defined"
- [ ] Commiter le test

### 🟢 GREEN Phase

- [ ] Écrire code minimal pour passer le test
- [ ] Vérifier que le test passe
- [ ] Commiter l'implémentation

### 🔵 REFACTOR Phase

- [ ] Améliorer le code si nécessaire
- [ ] Ajouter types TypeScript
- [ ] Vérifier que les tests passent toujours
- [ ] Commiter le refactoring

### 📱 MOBILE Check

- [ ] Tester sur viewport mobile (360px)
- [ ] Vérifier touch targets (44px min)
- [ ] Tester avec throttling 3G
- [ ] Valider sur vrai téléphone
```
