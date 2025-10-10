import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HelpIcon from "../HelpIcon";

describe("HelpIcon", () => {
  it("should render help icon button", () => {
    render(<HelpIcon pdfUrl="/test.pdf" />);
    const button = screen.getByRole("button", { name: /aide/i });
    expect(button).toBeInTheDocument();
  });

  it("should open dialog when clicked", async () => {
    const user = userEvent.setup();
    render(<HelpIcon pdfUrl="/test.pdf" />);

    const button = screen.getByRole("button", { name: /aide/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("should display PDF in iframe when dialog opens", async () => {
    const user = userEvent.setup();
    render(<HelpIcon pdfUrl="/docs/test.pdf" />);

    const button = screen.getByRole("button", { name: /aide/i });
    await user.click(button);

    await waitFor(() => {
      const iframe = screen.getByTitle(/document d'aide/i);
      expect(iframe).toHaveAttribute("src", "/docs/test.pdf");
    });
  });

  it("should close dialog when close button clicked", async () => {
    const user = userEvent.setup();
    render(<HelpIcon pdfUrl="/test.pdf" />);

    const openButton = screen.getByRole("button", { name: /aide/i });
    await user.click(openButton);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const closeButton = screen.getByRole("button", { name: /fermer/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("should render with custom className", () => {
    render(<HelpIcon pdfUrl="/test.pdf" className="custom-class" />);
    const button = screen.getByRole("button", { name: /aide/i });
    expect(button).toHaveClass("custom-class");
  });
});
