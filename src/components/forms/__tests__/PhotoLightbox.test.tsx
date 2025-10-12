import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PhotoUpload from "../PhotoUpload";
import type { PhotoObservation } from "@/lib/validations/photo-observation";

// Mock browser-image-compression
vi.mock("browser-image-compression", () => ({
  default: vi.fn((file) => {
    return Promise.resolve(
      new File(["compressed"], file.name, { type: file.type })
    );
  }),
}));

describe("PhotoUpload - Lightbox functionality", () => {
  const mockOnChange = vi.fn();

  const samplePhotos: PhotoObservation[] = [
    {
      id: "1",
      base64: "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
      nom: "photo_test.jpg",
      taille: 1024,
      dateAjout: "2025-01-10T10:30:00.000Z",
      compressed: true,
    },
  ];

  it("should open lightbox when clicking on photo thumbnail", async () => {
    const user = userEvent.setup();
    render(<PhotoUpload photos={samplePhotos} onChange={mockOnChange} />);

    const thumbnail = screen.getByRole("img", { name: "photo_test.jpg" });
    await user.click(thumbnail);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("should display full-size photo in lightbox", async () => {
    const user = userEvent.setup();
    render(<PhotoUpload photos={samplePhotos} onChange={mockOnChange} />);

    const thumbnail = screen.getByRole("img", { name: "photo_test.jpg" });
    await user.click(thumbnail);

    await waitFor(() => {
      const lightboxImage = screen.getByRole("img", { name: /agrandir.*photo_test/i });
      expect(lightboxImage).toHaveAttribute("src", "data:image/jpeg;base64,/9j/4AAQSkZJRg==");
    });
  });

  it("should show photo name in lightbox", async () => {
    const user = userEvent.setup();
    render(<PhotoUpload photos={samplePhotos} onChange={mockOnChange} />);

    const thumbnail = screen.getByRole("img", { name: "photo_test.jpg" });
    await user.click(thumbnail);

    await waitFor(() => {
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      // Le nom apparaît dans le DialogTitle
      expect(screen.getByRole("heading", { name: "photo_test.jpg" })).toBeInTheDocument();
    });
  });

  it("should close lightbox when clicking close button", async () => {
    const user = userEvent.setup();
    render(<PhotoUpload photos={samplePhotos} onChange={mockOnChange} />);

    const thumbnail = screen.getByRole("img", { name: "photo_test.jpg" });
    await user.click(thumbnail);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Le Dialog shadcn/ui a un bouton de fermeture par défaut (X en haut à droite)
    // Il peut être trouvé via son icône ou on peut tester Escape
    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("should navigate to next photo in lightbox", async () => {
    const user = userEvent.setup();
    const multiplePhotos: PhotoObservation[] = [
      {
        id: "1",
        base64: "data:image/jpeg;base64,photo1",
        nom: "photo1.jpg",
        taille: 1024,
        dateAjout: "2025-01-10T10:30:00.000Z",
        compressed: true,
      },
      {
        id: "2",
        base64: "data:image/jpeg;base64,photo2",
        nom: "photo2.jpg",
        taille: 2048,
        dateAjout: "2025-01-10T10:31:00.000Z",
        compressed: true,
      },
    ];

    render(<PhotoUpload photos={multiplePhotos} onChange={mockOnChange} />);

    // Open lightbox on first photo
    const thumbnail = screen.getByRole("img", { name: "photo1.jpg" });
    await user.click(thumbnail);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "photo1.jpg" })).toBeInTheDocument();
    });

    // Click next button
    const nextButton = screen.getByRole("button", { name: /suivant/i });
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "photo2.jpg" })).toBeInTheDocument();
    });
  });

  it("should navigate to previous photo in lightbox", async () => {
    const user = userEvent.setup();
    const multiplePhotos: PhotoObservation[] = [
      {
        id: "1",
        base64: "data:image/jpeg;base64,photo1",
        nom: "photo1.jpg",
        taille: 1024,
        dateAjout: "2025-01-10T10:30:00.000Z",
        compressed: true,
      },
      {
        id: "2",
        base64: "data:image/jpeg;base64,photo2",
        nom: "photo2.jpg",
        taille: 2048,
        dateAjout: "2025-01-10T10:31:00.000Z",
        compressed: true,
      },
    ];

    render(<PhotoUpload photos={multiplePhotos} onChange={mockOnChange} />);

    // Open lightbox on second photo
    const thumbnail = screen.getByRole("img", { name: "photo2.jpg" });
    await user.click(thumbnail);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "photo2.jpg" })).toBeInTheDocument();
    });

    // Click previous button
    const prevButton = screen.getByRole("button", { name: /précédent/i });
    await user.click(prevButton);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "photo1.jpg" })).toBeInTheDocument();
    });
  });

  it("should show photo counter in lightbox", async () => {
    const user = userEvent.setup();
    const multiplePhotos: PhotoObservation[] = [
      {
        id: "1",
        base64: "data:image/jpeg;base64,photo1",
        nom: "photo1.jpg",
        taille: 1024,
        dateAjout: "2025-01-10T10:30:00.000Z",
        compressed: true,
      },
      {
        id: "2",
        base64: "data:image/jpeg;base64,photo2",
        nom: "photo2.jpg",
        taille: 2048,
        dateAjout: "2025-01-10T10:31:00.000Z",
        compressed: true,
      },
    ];

    render(<PhotoUpload photos={multiplePhotos} onChange={mockOnChange} />);

    const thumbnail = screen.getByRole("img", { name: "photo1.jpg" });
    await user.click(thumbnail);

    await waitFor(() => {
      expect(screen.getByText(/1.*\/.*2/)).toBeInTheDocument();
    });
  });

  it("should disable previous button on first photo", async () => {
    const user = userEvent.setup();
    const multiplePhotos: PhotoObservation[] = [
      {
        id: "1",
        base64: "data:image/jpeg;base64,photo1",
        nom: "photo1.jpg",
        taille: 1024,
        dateAjout: "2025-01-10T10:30:00.000Z",
        compressed: true,
      },
      {
        id: "2",
        base64: "data:image/jpeg;base64,photo2",
        nom: "photo2.jpg",
        taille: 2048,
        dateAjout: "2025-01-10T10:31:00.000Z",
        compressed: true,
      },
    ];

    render(<PhotoUpload photos={multiplePhotos} onChange={mockOnChange} />);

    const thumbnail = screen.getByRole("img", { name: "photo1.jpg" });
    await user.click(thumbnail);

    await waitFor(() => {
      const prevButton = screen.getByRole("button", { name: /précédent/i });
      expect(prevButton).toBeDisabled();
    });
  });

  it("should disable next button on last photo", async () => {
    const user = userEvent.setup();
    const multiplePhotos: PhotoObservation[] = [
      {
        id: "1",
        base64: "data:image/jpeg;base64,photo1",
        nom: "photo1.jpg",
        taille: 1024,
        dateAjout: "2025-01-10T10:30:00.000Z",
        compressed: true,
      },
      {
        id: "2",
        base64: "data:image/jpeg;base64,photo2",
        nom: "photo2.jpg",
        taille: 2048,
        dateAjout: "2025-01-10T10:31:00.000Z",
        compressed: true,
      },
    ];

    render(<PhotoUpload photos={multiplePhotos} onChange={mockOnChange} />);

    const thumbnail = screen.getByRole("img", { name: "photo2.jpg" });
    await user.click(thumbnail);

    await waitFor(() => {
      const nextButton = screen.getByRole("button", { name: /suivant/i });
      expect(nextButton).toBeDisabled();
    });
  });
});
