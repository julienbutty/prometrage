import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

describe("ConfirmDialog", () => {
  it("should render when open is true", () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ConfirmDialog
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        title="Confirmation"
        description="Êtes-vous sûr ?"
      />
    );

    expect(screen.getByText("Confirmation")).toBeInTheDocument();
    expect(screen.getByText("Êtes-vous sûr ?")).toBeInTheDocument();
  });

  it("should not render when open is false", () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ConfirmDialog
        open={false}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        title="Confirmation"
        description="Êtes-vous sûr ?"
      />
    );

    expect(screen.queryByText("Confirmation")).not.toBeInTheDocument();
  });

  it("should display custom confirm and cancel text", () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ConfirmDialog
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        title="Supprimer"
        description="Voulez-vous supprimer ?"
        confirmText="Oui, supprimer"
        cancelText="Non, garder"
      />
    );

    expect(screen.getByText("Oui, supprimer")).toBeInTheDocument();
    expect(screen.getByText("Non, garder")).toBeInTheDocument();
  });

  it("should call onConfirm when confirm button is clicked", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ConfirmDialog
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        title="Confirmation"
        description="Êtes-vous sûr ?"
      />
    );

    const confirmButton = screen.getByText("Confirmer");
    await user.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("should call onOpenChange(false) when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ConfirmDialog
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        title="Confirmation"
        description="Êtes-vous sûr ?"
      />
    );

    const cancelButton = screen.getByText("Annuler");
    await user.click(cancelButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("should support ReactNode as description", () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();

    const description = (
      <>
        <span className="block">Ligne 1</span>
        <span className="block">Ligne 2</span>
      </>
    );

    render(
      <ConfirmDialog
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        title="Confirmation"
        description={description}
      />
    );

    expect(screen.getByText("Ligne 1")).toBeInTheDocument();
    expect(screen.getByText("Ligne 2")).toBeInTheDocument();
  });

  it("should apply destructive variant styles", () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();

    const { container } = render(
      <ConfirmDialog
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        title="Supprimer"
        description="Action irréversible"
        variant="destructive"
      />
    );

    const confirmButton = screen.getByText("Confirmer");
    expect(confirmButton.className).toContain("bg-red-600");
  });

  it("should apply default variant styles", () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();

    const { container } = render(
      <ConfirmDialog
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        title="Valider"
        description="Êtes-vous prêt ?"
        variant="default"
      />
    );

    const confirmButton = screen.getByText("Confirmer");
    expect(confirmButton.className).toContain("bg-green-600");
  });
});
