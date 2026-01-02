import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HabillageGroup } from "@/components/menuiseries/HabillageGroup";
import { HabillagesToggle } from "@/components/menuiseries/HabillagesToggle";

const mockOptions = {
  interieurs: [
    { value: "aucun", label: "Aucun" },
    { value: "pvc-70", label: "PVC 70mm" },
  ],
  exterieurs: [
    { value: "aucun", label: "Aucun" },
    { value: "alu-30", label: "Alu 30mm" },
  ],
};

describe("Touch Targets Compliance (44px minimum - Apple HIG)", () => {
  describe("HabillageGroup", () => {
    it("has 44px minimum touch targets on select triggers", () => {
      render(
        <HabillageGroup
          side="haut"
          values={{ interieur: null, exterieur: null }}
          onIntChange={() => {}}
          onExtChange={() => {}}
          options={mockOptions}
        />
      );

      // Get all select triggers (Int + Ext)
      const intTrigger = screen.getByRole("combobox", {
        name: /intérieur/i,
      });
      const extTrigger = screen.getByRole("combobox", {
        name: /extérieur/i,
      });

      // Check for min-h-[44px] class (Apple HIG touch target)
      expect(intTrigger.className).toMatch(/min-h-\[44px\]/);
      expect(extTrigger.className).toMatch(/min-h-\[44px\]/);
    });
  });

  describe("HabillagesToggle", () => {
    it("has 44px minimum touch target", () => {
      render(<HabillagesToggle isOpen={false} onToggle={() => {}} />);

      const button = screen.getByRole("button");
      expect(button.className).toMatch(/min-h-\[44px\]/);
    });
  });
});
