import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { UploadButton } from "@/components/UploadButton";

describe("UploadButton", () => {
  it("should render upload button with correct text", () => {
    render(<UploadButton onUpload={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: /uploader un pdf/i })
    ).toBeInTheDocument();
  });

  it("should have large touch target for mobile (min 44px)", () => {
    const { container } = render(<UploadButton onUpload={vi.fn()} />);
    const button = container.querySelector("button");

    expect(button).toHaveClass("min-h-[44px]");
  });

  it("should accept only PDF files", () => {
    const { container } = render(<UploadButton onUpload={vi.fn()} />);
    const input = container.querySelector('input[type="file"]');

    expect(input).toHaveAttribute("accept", "application/pdf,.pdf");
  });

  it("should call onUpload when file is selected", async () => {
    const onUpload = vi.fn();
    const { container } = render(<UploadButton onUpload={onUpload} />);

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["dummy content"], "test.pdf", {
      type: "application/pdf",
    });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(onUpload).toHaveBeenCalledWith(file);
    });
  });

  it("should show loading state when uploading", () => {
    render(<UploadButton onUpload={vi.fn()} isLoading={true} />);

    expect(screen.getByText(/téléchargement/i)).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("should be disabled when disabled prop is true", () => {
    render(<UploadButton onUpload={vi.fn()} disabled={true} />);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("should render with upload icon", () => {
    const { container } = render(<UploadButton onUpload={vi.fn()} />);

    // Vérifier qu'il y a une icône (svg)
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should have mobile-first responsive classes", () => {
    const { container } = render(<UploadButton onUpload={vi.fn()} />);
    const button = screen.getByRole("button");

    // Classes mobile-first
    expect(button).toHaveClass("w-full");
  });
});
