import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EcartsAlert } from "@/components/menuiseries/EcartsAlert";
import type { Ecarts } from "@/lib/utils/ecarts";

describe("EcartsAlert", () => {
  it("should not render when there are no écarts", () => {
    const { container } = render(<EcartsAlert ecarts={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it("should not render when all écarts are faible (<5%)", () => {
    const ecarts: Ecarts = {
      largeur: {
        original: 1000,
        modifie: 1020,
        difference: 20,
        pourcentage: 2.0,
        niveau: "faible",
      },
    };
    const { container } = render(<EcartsAlert ecarts={ecarts} />);
    expect(container.firstChild).toBeNull();
  });

  it("should not render when all écarts are moyen (5-10%)", () => {
    const ecarts: Ecarts = {
      largeur: {
        original: 1000,
        modifie: 1070,
        difference: 70,
        pourcentage: 7.0,
        niveau: "moyen",
      },
    };
    const { container } = render(<EcartsAlert ecarts={ecarts} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render alert when there is one critical écart (≥10%)", () => {
    const ecarts: Ecarts = {
      largeur: {
        original: 1000,
        modifie: 1150,
        difference: 150,
        pourcentage: 15.0,
        niveau: "eleve",
      },
    };
    render(<EcartsAlert ecarts={ecarts} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/Écarts critiques détectés/i)).toBeInTheDocument();
  });

  it("should display field name and percentage for critical écart", () => {
    const ecarts: Ecarts = {
      largeur: {
        original: 1000,
        modifie: 1150,
        difference: 150,
        pourcentage: 15.0,
        niveau: "eleve",
      },
    };
    render(<EcartsAlert ecarts={ecarts} />);

    expect(screen.getByText(/Largeur/i)).toBeInTheDocument();
    expect(screen.getByText(/15\.0%/)).toBeInTheDocument();
  });

  it("should display multiple critical écarts", () => {
    const ecarts: Ecarts = {
      largeur: {
        original: 1000,
        modifie: 1150,
        difference: 150,
        pourcentage: 15.0,
        niveau: "eleve",
      },
      hauteur: {
        original: 2000,
        modifie: 2300,
        difference: 300,
        pourcentage: 15.0,
        niveau: "eleve",
      },
      hauteurAllege: {
        original: 900,
        modifie: 1000,
        difference: 100,
        pourcentage: 11.11,
        niveau: "eleve",
      },
    };
    render(<EcartsAlert ecarts={ecarts} />);

    expect(screen.getByText("Largeur :")).toBeInTheDocument();
    expect(screen.getByText("Hauteur :")).toBeInTheDocument();
    expect(screen.getByText("Hauteur d'allège :")).toBeInTheDocument();
  });

  it("should only show critical écarts, not moyen or faible", () => {
    const ecarts: Ecarts = {
      largeur: {
        original: 1000,
        modifie: 1150,
        difference: 150,
        pourcentage: 15.0,
        niveau: "eleve",
      },
      hauteur: {
        original: 2000,
        modifie: 2100,
        difference: 100,
        pourcentage: 5.0,
        niveau: "moyen",
      },
    };
    render(<EcartsAlert ecarts={ecarts} />);

    // Should show largeur (critical)
    expect(screen.getByText("Largeur :")).toBeInTheDocument();
    expect(screen.getByText(/15\.0%/)).toBeInTheDocument();

    // Should NOT show hauteur (moyen)
    expect(screen.queryByText("Hauteur :")).not.toBeInTheDocument();
  });

  it("should display original and modified values", () => {
    const ecarts: Ecarts = {
      largeur: {
        original: 1000,
        modifie: 1150,
        difference: 150,
        pourcentage: 15.0,
        niveau: "eleve",
      },
    };
    render(<EcartsAlert ecarts={ecarts} />);

    expect(screen.getByText(/1000/)).toBeInTheDocument();
    expect(screen.getByText(/1150/)).toBeInTheDocument();
  });

  it("should use destructive variant for critical alert", () => {
    const ecarts: Ecarts = {
      largeur: {
        original: 1000,
        modifie: 1150,
        difference: 150,
        pourcentage: 15.0,
        niveau: "eleve",
      },
    };
    const { container } = render(<EcartsAlert ecarts={ecarts} />);

    // Alert should have destructive styling (text-destructive class)
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toHaveClass("text-destructive");
  });

  it("should format field names correctly", () => {
    const ecarts: Ecarts = {
      hauteurAllege: {
        original: 900,
        modifie: 1000,
        difference: 100,
        pourcentage: 11.11,
        niveau: "eleve",
      },
    };
    render(<EcartsAlert ecarts={ecarts} />);

    // hauteurAllege should be formatted as "Hauteur d'allège"
    expect(screen.getByText(/Hauteur d'allège/i)).toBeInTheDocument();
  });

  it("should handle negative écarts (reduction)", () => {
    const ecarts: Ecarts = {
      largeur: {
        original: 1000,
        modifie: 850,
        difference: -150,
        pourcentage: -15.0,
        niveau: "eleve",
      },
    };
    render(<EcartsAlert ecarts={ecarts} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/-15\.0%/)).toBeInTheDocument();
  });
});
