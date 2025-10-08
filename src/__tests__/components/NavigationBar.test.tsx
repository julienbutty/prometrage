import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NavigationBar } from "@/components/menuiseries/NavigationBar";

describe("NavigationBar", () => {
  const mockMenuiseriesStatus = [
    {
      id: "1",
      repere: "Salon",
      intitule: "Coulissant",
      isCompleted: false,
    },
    {
      id: "2",
      repere: "Chambre",
      intitule: "Fenêtre",
      isCompleted: true,
    },
    {
      id: "3",
      repere: "Cuisine",
      intitule: "Porte",
      isCompleted: false,
    },
  ];

  it("should render previous and next buttons", () => {
    const onNext = vi.fn();
    const onPrevious = vi.fn();

    render(
      <NavigationBar
        hasNext={true}
        hasPrevious={true}
        onNext={onNext}
        onPrevious={onPrevious}
        currentPosition={2}
        total={3}
      />
    );

    expect(screen.getByText("Précédente")).toBeInTheDocument();
    expect(screen.getByText("Suivante")).toBeInTheDocument();
  });

  it("should display current position and total", () => {
    const onNext = vi.fn();
    const onPrevious = vi.fn();

    render(
      <NavigationBar
        hasNext={true}
        hasPrevious={true}
        onNext={onNext}
        onPrevious={onPrevious}
        currentPosition={2}
        total={5}
      />
    );

    expect(screen.getByText("2 / 5")).toBeInTheDocument();
  });

  it("should disable previous button when hasPrevious is false", () => {
    const onNext = vi.fn();
    const onPrevious = vi.fn();

    render(
      <NavigationBar
        hasNext={true}
        hasPrevious={false}
        onNext={onNext}
        onPrevious={onPrevious}
        currentPosition={1}
        total={3}
      />
    );

    const previousButton = screen.getByText("Précédente").closest("button");
    expect(previousButton).toBeDisabled();
  });

  it("should disable next button when hasNext is false", () => {
    const onNext = vi.fn();
    const onPrevious = vi.fn();

    render(
      <NavigationBar
        hasNext={false}
        hasPrevious={true}
        onNext={onNext}
        onPrevious={onPrevious}
        currentPosition={3}
        total={3}
      />
    );

    const nextButton = screen.getByText("Suivante").closest("button");
    expect(nextButton).toBeDisabled();
  });

  it("should call onNext when next button is clicked", async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    const onPrevious = vi.fn();

    render(
      <NavigationBar
        hasNext={true}
        hasPrevious={true}
        onNext={onNext}
        onPrevious={onPrevious}
        currentPosition={2}
        total={3}
      />
    );

    const nextButton = screen.getByText("Suivante").closest("button");
    await user.click(nextButton!);

    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("should call onPrevious when previous button is clicked", async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    const onPrevious = vi.fn();

    render(
      <NavigationBar
        hasNext={true}
        hasPrevious={true}
        onNext={onNext}
        onPrevious={onPrevious}
        currentPosition={2}
        total={3}
      />
    );

    const previousButton = screen.getByText("Précédente").closest("button");
    await user.click(previousButton!);

    expect(onPrevious).toHaveBeenCalledTimes(1);
  });

  it("should disable all buttons when disabled prop is true", () => {
    const onNext = vi.fn();
    const onPrevious = vi.fn();

    render(
      <NavigationBar
        hasNext={true}
        hasPrevious={true}
        onNext={onNext}
        onPrevious={onPrevious}
        currentPosition={2}
        total={3}
        disabled={true}
      />
    );

    const previousButton = screen.getByText("Précédente").closest("button");
    const nextButton = screen.getByText("Suivante").closest("button");

    expect(previousButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });

  it("should display completion count when menuiseriesStatus is provided", () => {
    const onNext = vi.fn();
    const onPrevious = vi.fn();

    render(
      <NavigationBar
        hasNext={true}
        hasPrevious={true}
        onNext={onNext}
        onPrevious={onPrevious}
        currentPosition={2}
        total={3}
        menuiseriesStatus={mockMenuiseriesStatus}
      />
    );

    // 1 menuiserie complétée sur 3
    expect(screen.getByText("1 ✓")).toBeInTheDocument();
  });

  it("should render progress dots when menuiseriesStatus is provided", () => {
    const onNext = vi.fn();
    const onPrevious = vi.fn();

    const { container } = render(
      <NavigationBar
        hasNext={true}
        hasPrevious={false}
        onNext={onNext}
        onPrevious={onPrevious}
        currentPosition={1}
        total={3}
        menuiseriesStatus={mockMenuiseriesStatus}
      />
    );

    // Devrait afficher 3 cercles/icônes de progression
    const circles = container.querySelectorAll("svg");
    // 2 pour les boutons (ArrowLeft, ArrowRight) + 3 pour les dots (Circle ou CheckCircle2)
    expect(circles.length).toBeGreaterThanOrEqual(5);
  });

  it("should show completed menuiseries with green CheckCircle icon", () => {
    const onNext = vi.fn();
    const onPrevious = vi.fn();

    const { container } = render(
      <NavigationBar
        hasNext={true}
        hasPrevious={true}
        onNext={onNext}
        onPrevious={onPrevious}
        currentPosition={2}
        total={3}
        menuiseriesStatus={mockMenuiseriesStatus}
      />
    );

    // La deuxième menuiserie est complétée, devrait avoir la classe text-green
    const svgs = container.querySelectorAll("svg");
    const greenIcons = Array.from(svgs).filter((svg) =>
      svg.className.baseVal.includes("text-green")
    );

    // Au moins 1 icône verte pour la menuiserie complétée
    expect(greenIcons.length).toBeGreaterThanOrEqual(1);
  });

  it("should highlight current position in progress dots", () => {
    const onNext = vi.fn();
    const onPrevious = vi.fn();

    const { container } = render(
      <NavigationBar
        hasNext={true}
        hasPrevious={true}
        onNext={onNext}
        onPrevious={onPrevious}
        currentPosition={2}
        total={3}
        menuiseriesStatus={mockMenuiseriesStatus}
      />
    );

    // Position actuelle devrait avoir un indicateur bleu ou un point bleu
    const blueElements = container.querySelectorAll(".bg-blue-600");
    expect(blueElements.length).toBeGreaterThanOrEqual(1);
  });
});
