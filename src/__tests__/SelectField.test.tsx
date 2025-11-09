import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SelectField } from "@/components/forms/SelectField";

describe("SelectField", () => {
  const defaultProps = {
    id: "pack",
    label: "Pack",
    value: "",
    options: ["Tradition", "Confort", "Initial"],
    onChange: vi.fn(),
  };

  it("affiche le label correctement", () => {
    render(<SelectField {...defaultProps} />);
    expect(screen.getByText("Pack")).toBeInTheDocument();
  });

  it("affiche le placeholder par défaut quand aucune valeur", () => {
    render(<SelectField {...defaultProps} />);
    expect(screen.getByText("Sélectionner...")).toBeInTheDocument();
  });

  it("affiche la valeur sélectionnée", () => {
    render(<SelectField {...defaultProps} value="Tradition" />);
    expect(screen.getByText("Tradition")).toBeInTheDocument();
  });

  it("affiche toutes les options lors de l'ouverture", async () => {
    render(<SelectField {...defaultProps} />);

    const trigger = screen.getByRole("combobox");
    await userEvent.click(trigger);

    expect(screen.getByText("Tradition")).toBeInTheDocument();
    expect(screen.getByText("Confort")).toBeInTheDocument();
    expect(screen.getByText("Initial")).toBeInTheDocument();
  });

  it("appelle onChange lors de la sélection d'une option", async () => {
    const onChange = vi.fn();
    render(<SelectField {...defaultProps} onChange={onChange} />);

    const trigger = screen.getByRole("combobox");
    await userEvent.click(trigger);

    const optionConfort = screen.getByText("Confort");
    await userEvent.click(optionConfort);

    expect(onChange).toHaveBeenCalledWith("Confort");
  });

  describe("Affichage des différences (diff)", () => {
    it("affiche le badge 'Modifié' si valeur différente de originalValue", () => {
      render(<SelectField {...defaultProps} value="Confort" originalValue="Tradition" />);

      expect(screen.getByText("Modifié")).toBeInTheDocument();
    });

    it("n'affiche pas le badge si valeur identique à originalValue", () => {
      render(<SelectField {...defaultProps} value="Tradition" originalValue="Tradition" />);

      expect(screen.queryByText("Modifié")).not.toBeInTheDocument();
    });

    it("n'affiche pas le badge si valeur vide", () => {
      render(<SelectField {...defaultProps} value="" originalValue="Tradition" />);

      expect(screen.queryByText("Modifié")).not.toBeInTheDocument();
    });

    it("affiche la valeur PDF originale", () => {
      render(<SelectField {...defaultProps} value="Confort" originalValue="Tradition" />);

      expect(screen.getByText(/PDF:/)).toBeInTheDocument();
      expect(screen.getByText(/Tradition/)).toBeInTheDocument();
    });

    it("n'affiche pas la valeur PDF si originalValue absent", () => {
      render(<SelectField {...defaultProps} value="Confort" />);

      expect(screen.queryByText(/PDF:/)).not.toBeInTheDocument();
    });
  });

  describe("Accessibilité", () => {
    it("associe le label au champ via htmlFor/id", () => {
      render(<SelectField {...defaultProps} id="test-pack" />);

      const label = screen.getByText("Pack");
      expect(label).toHaveAttribute("for", "test-pack");
    });

    it("a un role combobox sur le trigger", () => {
      render(<SelectField {...defaultProps} />);

      const trigger = screen.getByRole("combobox");
      expect(trigger).toBeInTheDocument();
    });
  });

  describe("Mobile-first", () => {
    it("utilise une hauteur de 56px (h-14) pour faciliter le touch", () => {
      render(<SelectField {...defaultProps} />);

      const trigger = screen.getByRole("combobox");
      expect(trigger.className).toContain("h-14");
    });
  });
});
