import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProjectList } from "@/components/ProjectList";

describe("ProjectList", () => {
  it("should render empty state when no projects", () => {
    render(<ProjectList projects={[]} />);
    expect(
      screen.getByText(/aucun projet pour le moment/i)
    ).toBeInTheDocument();
  });

  it("should render list of projects", () => {
    const projects = [
      {
        id: "1",
        nomClient: "Dupont",
        adresse: "12 rue de la Paix",
        createdAt: new Date("2025-01-15"),
      },
      {
        id: "2",
        nomClient: "Martin",
        adresse: "34 avenue Victor Hugo",
        createdAt: new Date("2025-01-20"),
      },
    ];

    render(<ProjectList projects={projects} />);

    expect(screen.getByText("Dupont")).toBeInTheDocument();
    expect(screen.getByText("Martin")).toBeInTheDocument();
    expect(screen.getByText("12 rue de la Paix")).toBeInTheDocument();
    expect(screen.getByText("34 avenue Victor Hugo")).toBeInTheDocument();
  });

  it("should display project cards in mobile-first layout", () => {
    const projects = [
      {
        id: "1",
        nomClient: "Dupont",
        adresse: "12 rue de la Paix",
        createdAt: new Date("2025-01-15"),
      },
    ];

    const { container } = render(<ProjectList projects={projects} />);

    // Vérifier que le conteneur a les classes mobile-first
    const list = container.querySelector('[data-testid="project-list"]');
    expect(list).toHaveClass("w-full");
  });

  it("should show formatted creation date", () => {
    const projects = [
      {
        id: "1",
        nomClient: "Dupont",
        adresse: "12 rue de la Paix",
        createdAt: new Date("2025-01-15"),
      },
    ];

    render(<ProjectList projects={projects} />);

    // Date formatée en français
    expect(screen.getByText(/15\/01\/2025/)).toBeInTheDocument();
  });

  it("should render clickable project cards", () => {
    const projects = [
      {
        id: "1",
        nomClient: "Dupont",
        adresse: "12 rue de la Paix",
        createdAt: new Date("2025-01-15"),
      },
    ];

    render(<ProjectList projects={projects} />);

    const card = screen.getByRole("link", { name: /dupont/i });
    expect(card).toHaveAttribute("href", "/projet/1");
  });
});
