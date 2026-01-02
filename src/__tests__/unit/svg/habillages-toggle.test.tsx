import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HabillagesToggle } from "@/components/menuiseries/HabillagesToggle";

describe("HabillagesToggle", () => {
  describe("Visual States", () => {
    it("displays 'Afficher habillages' with ChevronDown when closed", () => {
      render(<HabillagesToggle isOpen={false} onToggle={() => {}} />);

      expect(screen.getByText("Afficher habillages")).toBeInTheDocument();
      expect(screen.getByTestId("chevron-down")).toBeInTheDocument();
    });

    it("displays 'Masquer habillages' with ChevronUp when open", () => {
      render(<HabillagesToggle isOpen={true} onToggle={() => {}} />);

      expect(screen.getByText("Masquer habillages")).toBeInTheDocument();
      expect(screen.getByTestId("chevron-up")).toBeInTheDocument();
    });

    it("renders in disabled state when disabled prop is true", () => {
      render(<HabillagesToggle isOpen={false} onToggle={() => {}} disabled />);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });
  });

  describe("Accessibility", () => {
    it("has aria-expanded attribute matching isOpen state", () => {
      const { rerender } = render(
        <HabillagesToggle isOpen={false} onToggle={() => {}} />
      );

      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-expanded",
        "false"
      );

      rerender(<HabillagesToggle isOpen={true} onToggle={() => {}} />);

      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-expanded",
        "true"
      );
    });

    it("meets touch target requirement (44px minimum height)", () => {
      render(<HabillagesToggle isOpen={false} onToggle={() => {}} />);

      const button = screen.getByRole("button");
      // Check for min-h-[44px] or h-11 class
      expect(button.className).toMatch(/min-h-\[44px\]|h-11/);
    });
  });

  describe("Interaction", () => {
    it("calls onToggle when clicked", () => {
      const onToggle = vi.fn();
      render(<HabillagesToggle isOpen={false} onToggle={onToggle} />);

      fireEvent.click(screen.getByRole("button"));

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it("does not call onToggle when disabled and clicked", () => {
      const onToggle = vi.fn();
      render(
        <HabillagesToggle isOpen={false} onToggle={onToggle} disabled />
      );

      fireEvent.click(screen.getByRole("button"));

      expect(onToggle).not.toHaveBeenCalled();
    });
  });

  describe("Styling", () => {
    it("applies custom className when provided", () => {
      render(
        <HabillagesToggle
          isOpen={false}
          onToggle={() => {}}
          className="custom-class"
        />
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });
  });
});
