import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DynamicField } from "@/components/forms/DynamicField";
import type { FieldConfig } from "@/lib/forms/config-loader";

describe("DynamicField", () => {
  const defaultOnChange = vi.fn();

  describe("Routing vers le bon composant", () => {
    it("affiche FieldWithDiff pour type=number", () => {
      const config: FieldConfig = {
        label: "Largeur",
        type: "number",
        unit: "mm",
      };

      render(
        <DynamicField
          fieldKey="largeur"
          config={config}
          value={1200}
          originalValue={1000}
          onChange={defaultOnChange}
        />
      );

      expect(screen.getByLabelText("Largeur")).toHaveAttribute("type", "number");
    });

    it("affiche SelectField pour type=select", () => {
      const config: FieldConfig = {
        label: "Pack",
        type: "select",
        options: ["Tradition", "Confort"],
      };

      render(
        <DynamicField
          fieldKey="pack"
          config={config}
          value=""
          originalValue=""
          onChange={defaultOnChange}
        />
      );

      // SelectField a un role combobox
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("affiche ComboboxField pour type=combobox", () => {
      const config: FieldConfig = {
        label: "Couleur",
        type: "combobox",
        options: ["Blanc", "Noir"],
        allowCustom: true,
      };

      render(
        <DynamicField
          fieldKey="couleur"
          config={config}
          value=""
          originalValue=""
          onChange={defaultOnChange}
        />
      );

      // ComboboxField a un bouton avec chevrons
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("affiche Input texte pour type=text", () => {
      const config: FieldConfig = {
        label: "Commentaires",
        type: "text",
      };

      render(
        <DynamicField
          fieldKey="commentaires"
          config={config}
          value=""
          originalValue=""
          onChange={defaultOnChange}
        />
      );

      expect(screen.getByLabelText("Commentaires")).toHaveAttribute("type", "text");
    });
  });

  describe("Fallback automatique vers Input texte", () => {
    it("fallback si valeur select hors enum ET originalValue présente", () => {
      const config: FieldConfig = {
        label: "Pack",
        type: "select",
        options: ["Tradition", "Confort"],
      };

      // Valeur du PDF hors enum
      render(
        <DynamicField
          fieldKey="pack"
          config={config}
          value="PackCustom"
          originalValue="PackCustom"
          onChange={defaultOnChange}
        />
      );

      // Doit afficher un input texte
      const input = screen.getByDisplayValue("PackCustom");
      expect(input).toHaveAttribute("type", "text");
    });

    it("fallback si valeur combobox hors enum ET originalValue présente", () => {
      const config: FieldConfig = {
        label: "Couleur",
        type: "combobox",
        options: ["Blanc", "Noir"],
      };

      // Valeur du PDF hors enum
      render(
        <DynamicField
          fieldKey="couleur"
          config={config}
          value="RAL 9999"
          originalValue="RAL 9999"
          onChange={defaultOnChange}
        />
      );

      // Doit afficher un input texte
      const input = screen.getByDisplayValue("RAL 9999");
      expect(input).toHaveAttribute("type", "text");
    });

    it("PAS de fallback si valeur vide (même si hors enum)", () => {
      const config: FieldConfig = {
        label: "Pack",
        type: "select",
        options: ["Tradition", "Confort"],
      };

      render(
        <DynamicField
          fieldKey="pack"
          config={config}
          value=""
          originalValue=""
          onChange={defaultOnChange}
        />
      );

      // Doit afficher le Select normal (pas de fallback)
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("PAS de fallback si valeur dans l'enum", () => {
      const config: FieldConfig = {
        label: "Pack",
        type: "select",
        options: ["Tradition", "Confort"],
      };

      render(
        <DynamicField
          fieldKey="pack"
          config={config}
          value="Tradition"
          originalValue="Tradition"
          onChange={defaultOnChange}
        />
      );

      // Doit afficher le Select normal
      expect(screen.getByRole("combobox")).toBeInTheDocument();
      // Vérifie que "Tradition" apparaît (au moins 1 fois)
      expect(screen.getAllByText("Tradition").length).toBeGreaterThan(0);
    });

    it("PAS de fallback si pas d'originalValue (utilisateur tape valeur custom)", () => {
      const config: FieldConfig = {
        label: "Pack",
        type: "select",
        options: ["Tradition", "Confort"],
      };

      // Utilisateur sélectionne une valeur custom mais originalValue absent
      render(
        <DynamicField
          fieldKey="pack"
          config={config}
          value="CustomValue"
          originalValue={undefined}
          onChange={defaultOnChange}
        />
      );

      // Doit afficher le Select normal (pas de fallback car pas de originalValue)
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });

  describe("Transmission des props", () => {
    it("transmet correctement les props à FieldWithDiff", () => {
      const config: FieldConfig = {
        label: "Hauteur",
        type: "number",
        unit: "mm",
      };

      render(
        <DynamicField
          fieldKey="hauteur"
          config={config}
          value={2000}
          originalValue={1800}
          onChange={defaultOnChange}
        />
      );

      expect(screen.getByLabelText("Hauteur")).toHaveValue(2000);
    });

    it("transmet allowCustom à ComboboxField", () => {
      const config: FieldConfig = {
        label: "Couleur",
        type: "combobox",
        options: ["Blanc"],
        allowCustom: true,
        placeholder: "Ex: RAL 7016",
      };

      render(
        <DynamicField
          fieldKey="couleur"
          config={config}
          value=""
          originalValue=""
          onChange={defaultOnChange}
        />
      );

      // ComboboxField affiche le placeholder
      expect(screen.getByText("Ex: RAL 7016")).toBeInTheDocument();
    });
  });

  describe("Gestion des valeurs undefined/null", () => {
    it("gère value undefined", () => {
      const config: FieldConfig = {
        label: "Pack",
        type: "select",
        options: ["Tradition"],
      };

      render(
        <DynamicField
          fieldKey="pack"
          config={config}
          value={undefined as any}
          originalValue=""
          onChange={defaultOnChange}
        />
      );

      expect(screen.getByText("Sélectionner...")).toBeInTheDocument();
    });

    it("gère originalValue undefined", () => {
      const config: FieldConfig = {
        label: "Pack",
        type: "select",
        options: ["Tradition"],
      };

      render(
        <DynamicField
          fieldKey="pack"
          config={config}
          value="Tradition"
          originalValue={undefined}
          onChange={defaultOnChange}
        />
      );

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });
});
