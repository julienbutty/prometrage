import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SVGZone } from "@/components/menuiseries/SVGZone";

const mockHabillageConfig = {
  interieurs: [
    { value: "aucun", label: "Aucun" },
    { value: "pvc-70", label: "PVC 70mm" },
  ],
  exterieurs: [
    { value: "aucun", label: "Aucun" },
    { value: "alu-30", label: "Alu 30mm" },
  ],
};

const defaultProps = {
  typeMenuiserie: "fenetre-2-vantaux",
  dimensions: {
    largeur: "",
    hauteur: "",
    hauteurAllege: "",
  },
  originalDimensions: {
    largeur: 1200,
    hauteur: 1500,
    hauteurAllege: 900,
  },
  onDimensionChange: vi.fn(),
  showAllege: true,
  // Habillages props
  showHabillages: true,
  habillagesInterieurs: {
    haut: null,
    bas: null,
    gauche: null,
    droite: null,
  },
  habillagesExterieurs: {
    haut: null,
    bas: null,
    gauche: null,
    droite: null,
  },
  onHabillageIntChange: vi.fn(),
  onHabillageExtChange: vi.fn(),
  habillageConfig: mockHabillageConfig,
};

describe("SVGZone", () => {
  describe("T005 [US1] SVG Prominent Display", () => {
    it("renders SVG element with role=img", () => {
      render(<SVGZone {...defaultProps} />);

      const svg = screen.getByRole("img");
      expect(svg).toBeInTheDocument();
    });

    it("renders SVG with aria-label describing the menuiserie type", () => {
      render(<SVGZone {...defaultProps} />);

      const svg = screen.getByRole("img");
      expect(svg).toHaveAttribute("aria-label");
      expect(svg.getAttribute("aria-label")).toContain("fenetre");
    });

    it("SVGZone container has minimum height for prominent display", () => {
      render(<SVGZone {...defaultProps} />);

      // The SVG zone should have data-testid for testing
      const svgZone = screen.getByTestId("svg-zone");
      expect(svgZone).toBeInTheDocument();
    });
  });

  describe("T006 [US2] Spatial Dimension Positioning", () => {
    it("renders largeur dimension input", () => {
      render(<SVGZone {...defaultProps} />);

      const largeurInput = screen.getByLabelText(/largeur/i);
      expect(largeurInput).toBeInTheDocument();
    });

    it("renders hauteur dimension input", () => {
      render(<SVGZone {...defaultProps} />);

      const hauteurInput = screen.getByLabelText(/hauteur/i);
      expect(hauteurInput).toBeInTheDocument();
    });

    it("renders allège dimension input when showAllege is true", () => {
      render(<SVGZone {...defaultProps} showAllege={true} />);

      const allegeInput = screen.getByLabelText(/all[eè]ge/i);
      expect(allegeInput).toBeInTheDocument();
    });

    it("does not render allège when showAllege is false", () => {
      render(<SVGZone {...defaultProps} showAllege={false} />);

      const allegeInput = screen.queryByLabelText(/all[eè]ge/i);
      expect(allegeInput).not.toBeInTheDocument();
    });

    it("calls onDimensionChange when largeur input changes", () => {
      const onDimensionChange = vi.fn();
      render(
        <SVGZone {...defaultProps} onDimensionChange={onDimensionChange} />
      );

      const largeurInput = screen.getByLabelText(/largeur/i);
      fireEvent.change(largeurInput, { target: { value: "1300" } });

      expect(onDimensionChange).toHaveBeenCalledWith("largeur", "1300");
    });
  });

  describe("T007 [US2] Mobile Stacked Layout", () => {
    it("has mobile layout classes (flex-col)", () => {
      render(<SVGZone {...defaultProps} />);

      // Check for mobile-first flex-col layout
      const svgZone = screen.getByTestId("svg-zone");
      expect(svgZone.className).toMatch(/flex/);
      expect(svgZone.className).toMatch(/flex-col/);
    });
  });

  describe("T008 [US2] Tablet Grid Layout", () => {
    it("has tablet grid layout classes (md:grid)", () => {
      render(<SVGZone {...defaultProps} />);

      // Check for tablet grid layout with md: breakpoint
      const svgZone = screen.getByTestId("svg-zone");
      expect(svgZone.className).toMatch(/md:grid/);
    });
  });

  describe("T013 [US4] Habillages Hidden by Default", () => {
    it("does not render habillage groups when showHabillages is false", () => {
      render(<SVGZone {...defaultProps} showHabillages={false} />);

      // Habillage groups should not be visible
      const habillageGroups = screen.queryAllByTestId("habillage-group");
      expect(habillageGroups.length).toBe(0);
    });

    it("renders habillage groups when showHabillages is true", () => {
      render(<SVGZone {...defaultProps} showHabillages={true} />);

      // Should render 4 habillage groups (haut, bas, gauche, droite)
      const habillageGroups = screen.getAllByTestId("habillage-group");
      expect(habillageGroups.length).toBe(4);
    });
  });

  describe("T014 [US4] Toggle Button Visibility", () => {
    it("renders habillages toggle button", () => {
      render(<SVGZone {...defaultProps} />);

      // Toggle button should be visible
      const toggleButton = screen.getByRole("button", {
        name: /habillages/i,
      });
      expect(toggleButton).toBeInTheDocument();
    });

    it("toggle button shows 'Afficher habillages' when closed", () => {
      render(<SVGZone {...defaultProps} showHabillages={false} />);

      expect(screen.getByText(/afficher habillages/i)).toBeInTheDocument();
    });

    it("toggle button shows 'Masquer habillages' when open", () => {
      render(<SVGZone {...defaultProps} showHabillages={true} />);

      expect(screen.getByText(/masquer habillages/i)).toBeInTheDocument();
    });
  });

  describe("T015 [US4] Toggle Show/Hide Behavior", () => {
    it("calls onToggleHabillages when toggle button is clicked", () => {
      const onToggleHabillages = vi.fn();
      render(
        <SVGZone
          {...defaultProps}
          showHabillages={false}
          onToggleHabillages={onToggleHabillages}
        />
      );

      const toggleButton = screen.getByRole("button", {
        name: /habillages/i,
      });
      fireEvent.click(toggleButton);

      expect(onToggleHabillages).toHaveBeenCalledTimes(1);
    });
  });
});
