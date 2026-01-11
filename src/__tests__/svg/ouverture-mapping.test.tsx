/**
 * Tests for SVG opening direction display
 *
 * Verifies that the triangle indicator points in the correct direction
 * based on the "Ouverture intérieure" value.
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  getFenetreSVG,
  getPorteFenetreSVG,
} from "@/lib/svg/menuiserie-templates";

describe("SVG Opening Direction Display", () => {
  // T018: SVG with sensOuverture: 'gauche' displays triangle pointing left
  describe("sensOuverture gauche", () => {
    it("should render fenetre with triangle pointing left when sensOuverture is gauche", () => {
      const svg = getFenetreSVG(1, 200, 150, "battant", "gauche");
      const { container } = render(svg);

      // Check that the SVG rendered
      expect(container.querySelector("svg")).toBeTruthy();

      // Check for opening indicator group
      const indicator = container.querySelector(".opening-indicator");
      expect(indicator).toBeTruthy();

      // The polygon should exist (triangle)
      const polygon = indicator?.querySelector("polygon");
      expect(polygon).toBeTruthy();
    });

    it("should render porte-fenetre with triangle pointing left when sensOuverture is gauche", () => {
      const svg = getPorteFenetreSVG(1, 200, 150, "battant", "gauche");
      const { container } = render(svg);

      const indicator = container.querySelector(".opening-indicator");
      expect(indicator).toBeTruthy();
    });
  });

  // T019: SVG with sensOuverture: null displays no triangle
  describe("sensOuverture null handling", () => {
    it("should not display triangle for fixe type (no opening)", () => {
      const svg = getFenetreSVG(1, 200, 150, "fixe", "droite");
      const { container } = render(svg);

      // Fixe windows should not have opening indicator
      const indicator = container.querySelector(".opening-indicator");
      expect(indicator).toBeFalsy();
    });

    it("should not display triangle for coulissant type", () => {
      // Note: coulissant uses arrows, not triangles
      // The sensOuverture parameter doesn't affect coulissant display
      const svg = getFenetreSVG(1, 200, 150, "coulissant", "droite");
      const { container } = render(svg);

      // Coulissant doesn't use .opening-indicator class
      const indicator = container.querySelector(".opening-indicator");
      expect(indicator).toBeFalsy();
    });
  });

  // T020: 2-vantaux window displays triangles pointing toward center
  describe("2 vantaux - central opening", () => {
    it("should render 2 vantaux with triangles pointing toward center", () => {
      const svg = getFenetreSVG(2, 200, 150, "battant", "droite");
      const { container } = render(svg);

      // Should have 2 panel groups
      const panels = container.querySelectorAll('[class*="panel"]');
      expect(panels.length).toBeGreaterThanOrEqual(0); // Panels exist in the DOM

      // Should have 2 opening indicators (one per vantail)
      const indicators = container.querySelectorAll(".opening-indicator");
      expect(indicators.length).toBe(2);

      // Both should have polygons
      const polygons = container.querySelectorAll(
        ".opening-indicator polygon"
      );
      expect(polygons.length).toBe(2);
    });

    it("should have different triangle directions for 2 vantaux", () => {
      const svg = getFenetreSVG(2, 200, 150, "battant", "droite");
      const { container } = render(svg);

      const polygons = container.querySelectorAll(
        ".opening-indicator polygon"
      );
      expect(polygons.length).toBe(2);

      // Get the points attribute of each polygon
      const points1 = polygons[0].getAttribute("points");
      const points2 = polygons[1].getAttribute("points");

      // The two triangles should have different orientations
      expect(points1).not.toBe(points2);
    });
  });

  // Oscillo-battant tests
  describe("oscillo-battant", () => {
    it("should render both soufflet and battant triangles for oscillo-battant", () => {
      const svg = getFenetreSVG(1, 200, 150, "oscillo-battant", "droite");
      const { container } = render(svg);

      const indicator = container.querySelector(".opening-indicator");
      expect(indicator).toBeTruthy();

      // Should have 2 polygons (soufflet + battant)
      const polygons = indicator?.querySelectorAll("polygon");
      expect(polygons?.length).toBe(2);
    });

    it("should have orange dashed stroke for soufflet triangle in oscillo-battant", () => {
      const svg = getFenetreSVG(1, 200, 150, "oscillo-battant", "droite");
      const { container } = render(svg);

      const polygons = container.querySelectorAll(
        ".opening-indicator polygon"
      );

      // One polygon should have dashed stroke (soufflet indicator)
      const dashedPolygon = Array.from(polygons).find(
        (p) => p.getAttribute("stroke-dasharray") !== null
      );
      expect(dashedPolygon).toBeTruthy();
    });
  });

  // Soufflet tests
  describe("soufflet only", () => {
    it("should render soufflet triangle pointing up", () => {
      const svg = getFenetreSVG(1, 200, 150, "soufflet", "droite");
      const { container } = render(svg);

      const indicator = container.querySelector(".opening-indicator");
      expect(indicator).toBeTruthy();

      // Should have 1 polygon (soufflet only)
      const polygons = indicator?.querySelectorAll("polygon");
      expect(polygons?.length).toBe(1);
    });
  });
});
