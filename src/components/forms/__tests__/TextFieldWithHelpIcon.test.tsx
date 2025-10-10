import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TextFieldWithDiff } from "../TextFieldWithDiff";

describe("TextFieldWithDiff with HelpIcon", () => {
  it("should render help icon when helpIcon prop is provided", () => {
    render(
      <TextFieldWithDiff
        id="dormant"
        label="Dormant"
        value="100"
        originalValue="100"
        onChange={() => {}}
        helpIcon={<button aria-label="Aide">?</button>}
      />
    );

    expect(screen.getByLabelText(/aide/i)).toBeInTheDocument();
  });

  it("should not render help icon when helpIcon prop is not provided", () => {
    render(
      <TextFieldWithDiff
        id="dormant"
        label="Dormant"
        value="100"
        originalValue="100"
        onChange={() => {}}
      />
    );

    expect(screen.queryByLabelText(/aide/i)).not.toBeInTheDocument();
  });

  it("should trigger help icon action when clicked", async () => {
    const user = userEvent.setup();
    let clicked = false;

    render(
      <TextFieldWithDiff
        id="dormant"
        label="Dormant"
        value="100"
        originalValue="100"
        onChange={() => {}}
        helpIcon={
          <button aria-label="Aide" onClick={() => (clicked = true)}>
            ?
          </button>
        }
      />
    );

    const helpButton = screen.getByLabelText(/aide/i);
    await user.click(helpButton);

    await waitFor(() => {
      expect(clicked).toBe(true);
    });
  });
});
