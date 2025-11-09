import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectCardSkeleton } from "@/components/skeletons/ProjectCardSkeleton";

describe("ProjectCardSkeleton", () => {
  it("should render skeleton structure", () => {
    const { container } = render(<ProjectCardSkeleton />);

    // Should have a Card-like structure
    expect(container.firstChild).toBeInTheDocument();
  });

  it("should have animate-pulse class for animation", () => {
    const { container } = render(<ProjectCardSkeleton />);

    // Should have pulse animation
    const animatedElement = container.querySelector(".animate-pulse");
    expect(animatedElement).toBeInTheDocument();
  });

  it("should render multiple skeletons when count is provided", () => {
    const { container } = render(
      <>
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
      </>
    );

    const animatedElements = container.querySelectorAll(".animate-pulse");
    expect(animatedElements.length).toBe(3);
  });

  it("should have appropriate height", () => {
    const { container } = render(<ProjectCardSkeleton />);

    // Should have a card-like height class (h-full, h-[120px], etc.)
    const card = container.firstChild as HTMLElement;
    expect(card.className).toMatch(/h-/);
    expect(card.className).toMatch(/min-h-\[120px\]/);
  });

  it("should have rounded corners", () => {
    const { container } = render(<ProjectCardSkeleton />);

    const card = container.firstChild as HTMLElement;
    expect(card.className).toMatch(/rounded/);
  });

  it("should have border", () => {
    const { container } = render(<ProjectCardSkeleton />);

    const card = container.firstChild as HTMLElement;
    expect(card.className).toMatch(/border/);
  });

  it("should have proper spacing", () => {
    const { container } = render(<ProjectCardSkeleton />);

    const card = container.firstChild as HTMLElement;
    expect(card.className).toMatch(/p-\d+/);
  });
});
