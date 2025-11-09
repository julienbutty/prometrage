import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComboboxField } from "@/components/forms/ComboboxField";

describe("ComboboxField", () => {
  const defaultProps = {
    id: "couleur",
    label: "Couleur",
    value: "",
    options: ["Blanc", "Noir", "Gris"],
    onChange: vi.fn(),
  };

  it("affiche le label correctement", () => {
    render(<ComboboxField {...defaultProps} />);
    expect(screen.getByText("Couleur")).toBeInTheDocument();
  });

  it("affiche le placeholder quand aucune valeur", () => {
    render(<ComboboxField {...defaultProps} placeholder="Sélectionner une couleur" />);
    expect(screen.getByText("Sélectionner une couleur")).toBeInTheDocument();
  });

  it("affiche le placeholder par défaut si non fourni", () => {
    render(<ComboboxField {...defaultProps} />);
    expect(screen.getByText("Sélectionner...")).toBeInTheDocument();
  });

  it("affiche la valeur sélectionnée", () => {
    render(<ComboboxField {...defaultProps} value="Blanc" />);
    expect(screen.getByText("Blanc")).toBeInTheDocument();
  });

  it("ouvre le popover au clic sur le bouton", async () => {
    render(<ComboboxField {...defaultProps} />);

    const button = screen.getByRole("button");
    await userEvent.click(button);

    // Le popover devrait être visible avec les options
    await waitFor(() => {
      expect(screen.getByText("Blanc")).toBeVisible();
      expect(screen.getByText("Noir")).toBeVisible();
      expect(screen.getByText("Gris")).toBeVisible();
    });
  });

  it("filtre les options lors de la recherche", async () => {
    render(<ComboboxField {...defaultProps} />);

    const button = screen.getByRole("button");
    await userEvent.click(button);

    // Tape dans l'input de recherche
    const searchInput = screen.getByPlaceholderText("Rechercher...");
    await userEvent.type(searchInput, "Bl");

    await waitFor(() => {
      expect(screen.getByText("Blanc")).toBeVisible();
      expect(screen.queryByText("Noir")).not.toBeInTheDocument();
      expect(screen.queryByText("Gris")).not.toBeInTheDocument();
    });
  });

  it("appelle onChange lors de la sélection d'une option", async () => {
    const onChange = vi.fn();
    render(<ComboboxField {...defaultProps} onChange={onChange} />);

    const button = screen.getByRole("button");
    await userEvent.click(button);

    const optionBlanc = screen.getByText("Blanc");
    await userEvent.click(optionBlanc);

    expect(onChange).toHaveBeenCalledWith("Blanc");
  });

  it("ferme le popover après sélection", async () => {
    render(<ComboboxField {...defaultProps} />);

    const button = screen.getByRole("button");
    await userEvent.click(button);

    const optionBlanc = screen.getByText("Blanc");
    await userEvent.click(optionBlanc);

    await waitFor(() => {
      expect(screen.queryByPlaceholderText("Rechercher...")).not.toBeInTheDocument();
    });
  });

  describe("Saisie libre (allowCustom)", () => {
    it("affiche l'option de saisie libre quand allowCustom=true", async () => {
      const onChange = vi.fn();
      render(<ComboboxField {...defaultProps} allowCustom onChange={onChange} />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      const searchInput = screen.getByPlaceholderText("Rechercher...");
      await userEvent.type(searchInput, "RAL 7016");

      await waitFor(() => {
        expect(screen.getByText('Utiliser "RAL 7016"')).toBeVisible();
      });
    });

    it("appelle onChange avec la valeur custom lors de la sélection", async () => {
      const onChange = vi.fn();
      render(<ComboboxField {...defaultProps} allowCustom onChange={onChange} />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      const searchInput = screen.getByPlaceholderText("Rechercher...");
      await userEvent.type(searchInput, "RAL 7016");

      const customOption = await screen.findByText('Utiliser "RAL 7016"');
      await userEvent.click(customOption);

      expect(onChange).toHaveBeenCalledWith("RAL 7016");
    });

    it("ne montre pas l'option custom si allowCustom=false", async () => {
      render(<ComboboxField {...defaultProps} allowCustom={false} />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      const searchInput = screen.getByPlaceholderText("Rechercher...");
      await userEvent.type(searchInput, "RAL 7016");

      await waitFor(() => {
        expect(screen.queryByText('Utiliser "RAL 7016"')).not.toBeInTheDocument();
      });
    });

    it("ne montre pas l'option custom si la recherche correspond à une option existante", async () => {
      render(<ComboboxField {...defaultProps} allowCustom />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      const searchInput = screen.getByPlaceholderText("Rechercher...");
      await userEvent.type(searchInput, "Blanc");

      await waitFor(() => {
        expect(screen.queryByText('Utiliser "Blanc"')).not.toBeInTheDocument();
      });
    });
  });

  describe("Affichage des différences (diff)", () => {
    it("affiche le badge 'Modifié' si valeur différente de originalValue", () => {
      render(<ComboboxField {...defaultProps} value="Noir" originalValue="Blanc" />);

      expect(screen.getByText("Modifié")).toBeInTheDocument();
    });

    it("n'affiche pas le badge si valeur identique à originalValue", () => {
      render(<ComboboxField {...defaultProps} value="Blanc" originalValue="Blanc" />);

      expect(screen.queryByText("Modifié")).not.toBeInTheDocument();
    });

    it("n'affiche pas le badge si valeur vide", () => {
      render(<ComboboxField {...defaultProps} value="" originalValue="Blanc" />);

      expect(screen.queryByText("Modifié")).not.toBeInTheDocument();
    });

    it("affiche la valeur PDF originale", () => {
      render(<ComboboxField {...defaultProps} value="Noir" originalValue="Blanc" />);

      expect(screen.getByText(/PDF:/)).toBeInTheDocument();
      expect(screen.getByText(/Blanc/)).toBeInTheDocument();
    });

    it("n'affiche pas la valeur PDF si originalValue absent", () => {
      render(<ComboboxField {...defaultProps} value="Noir" />);

      expect(screen.queryByText(/PDF:/)).not.toBeInTheDocument();
    });
  });

  describe("Accessibilité", () => {
    it("associe le label au champ via htmlFor/id", () => {
      render(<ComboboxField {...defaultProps} id="test-couleur" />);

      const label = screen.getByText("Couleur");
      expect(label).toHaveAttribute("for", "test-couleur");
    });

    it("a un role button sur le trigger", () => {
      render(<ComboboxField {...defaultProps} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });
  });

  describe("Recherche insensible à la casse", () => {
    it("filtre les options en ignorant la casse", async () => {
      render(<ComboboxField {...defaultProps} />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      const searchInput = screen.getByPlaceholderText("Rechercher...");
      await userEvent.type(searchInput, "BLANC");

      await waitFor(() => {
        expect(screen.getByText("Blanc")).toBeVisible();
      });
    });

    it("filtre avec des mots partiels", async () => {
      const props = {
        ...defaultProps,
        options: ["Gris clair", "Gris foncé", "Blanc"],
      };
      render(<ComboboxField {...props} />);

      const button = screen.getByRole("button");
      await userEvent.click(button);

      const searchInput = screen.getByPlaceholderText("Rechercher...");
      await userEvent.type(searchInput, "clair");

      await waitFor(() => {
        expect(screen.getByText("Gris clair")).toBeVisible();
        expect(screen.queryByText("Gris foncé")).not.toBeInTheDocument();
        expect(screen.queryByText("Blanc")).not.toBeInTheDocument();
      });
    });
  });
});
