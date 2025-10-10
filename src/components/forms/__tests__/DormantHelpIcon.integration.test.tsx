import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TextFieldWithDiff } from "../TextFieldWithDiff";
import HelpIcon from "../HelpIcon";

describe("DormantHelpIcon Integration", () => {
  it("should show tunnel PDF when pose type is tunnel", async () => {
    const user = userEvent.setup();
    const typePose = "En tunnel";
    const dormantHelpPdf = typePose?.toLowerCase().includes("tunnel")
      ? "/docs/dormant-tunnel.pdf"
      : "/docs/dormant-applique.pdf";

    render(
      <TextFieldWithDiff
        id="dormant"
        label="Dormant"
        value="100"
        originalValue="100"
        onChange={() => {}}
        helpIcon={<HelpIcon pdfUrl={dormantHelpPdf} />}
      />
    );

    const helpButton = screen.getByRole("button", { name: /aide/i });
    await user.click(helpButton);

    const iframe = screen.getByTitle(/document d'aide/i);
    expect(iframe).toHaveAttribute("src", "/docs/dormant-tunnel.pdf");
  });

  it("should show applique PDF when pose type is applique", async () => {
    const user = userEvent.setup();
    const typePose = "En applique";
    const dormantHelpPdf = typePose?.toLowerCase().includes("tunnel")
      ? "/docs/dormant-tunnel.pdf"
      : "/docs/dormant-applique.pdf";

    render(
      <TextFieldWithDiff
        id="dormant"
        label="Dormant"
        value="100"
        originalValue="100"
        onChange={() => {}}
        helpIcon={<HelpIcon pdfUrl={dormantHelpPdf} />}
      />
    );

    const helpButton = screen.getByRole("button", { name: /aide/i });
    await user.click(helpButton);

    const iframe = screen.getByTitle(/document d'aide/i);
    expect(iframe).toHaveAttribute("src", "/docs/dormant-applique.pdf");
  });

  it("should default to applique PDF when pose type is undefined", async () => {
    const user = userEvent.setup();
    const typePose = undefined;
    const dormantHelpPdf = typePose?.toLowerCase().includes("tunnel")
      ? "/docs/dormant-tunnel.pdf"
      : "/docs/dormant-applique.pdf";

    render(
      <TextFieldWithDiff
        id="dormant"
        label="Dormant"
        value="100"
        originalValue="100"
        onChange={() => {}}
        helpIcon={<HelpIcon pdfUrl={dormantHelpPdf} />}
      />
    );

    const helpButton = screen.getByRole("button", { name: /aide/i });
    await user.click(helpButton);

    const iframe = screen.getByTitle(/document d'aide/i);
    expect(iframe).toHaveAttribute("src", "/docs/dormant-applique.pdf");
  });
});
