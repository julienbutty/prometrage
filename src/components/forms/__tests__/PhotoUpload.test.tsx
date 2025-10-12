import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PhotoUpload from "../PhotoUpload";
import type { PhotoObservation } from "@/lib/validations/photo-observation";

// Mock browser-image-compression
vi.mock("browser-image-compression", () => ({
  default: vi.fn((file) => {
    // Return a smaller mock file
    return Promise.resolve(
      new File(["compressed"], file.name, { type: file.type })
    );
  }),
}));

describe("PhotoUpload", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("should render upload button", () => {
    render(<PhotoUpload photos={[]} onChange={mockOnChange} />);
    expect(screen.getByText(/ajouter photo/i)).toBeInTheDocument();
  });

  it("should show camera icon on button", () => {
    render(<PhotoUpload photos={[]} onChange={mockOnChange} />);
    const button = screen.getByRole("button", { name: /ajouter photo/i });
    expect(button).toBeInTheDocument();
  });

  it("should display photo count when photos exist", () => {
    const photos: PhotoObservation[] = [
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        base64: "data:image/jpeg;base64,test",
        nom: "photo1.jpg",
        taille: 1024,
        dateAjout: "2025-01-10T10:30:00.000Z",
        compressed: true,
      },
    ];
    render(<PhotoUpload photos={photos} onChange={mockOnChange} />);
    expect(screen.getByText(/1 photo/i)).toBeInTheDocument();
  });

  it("should display correct count for multiple photos", () => {
    const photos: PhotoObservation[] = [
      {
        id: "1",
        base64: "data:image/jpeg;base64,test1",
        nom: "photo1.jpg",
        taille: 1024,
        dateAjout: "2025-01-10T10:30:00.000Z",
        compressed: true,
      },
      {
        id: "2",
        base64: "data:image/jpeg;base64,test2",
        nom: "photo2.jpg",
        taille: 2048,
        dateAjout: "2025-01-10T10:31:00.000Z",
        compressed: true,
      },
    ];
    render(<PhotoUpload photos={photos} onChange={mockOnChange} />);
    expect(screen.getByText(/2 photos/i)).toBeInTheDocument();
  });

  it("should disable button when max photos reached", () => {
    const photos: PhotoObservation[] = [
      {
        id: "1",
        base64: "data:image/jpeg;base64,test1",
        nom: "photo1.jpg",
        taille: 1024,
        dateAjout: "2025-01-10T10:30:00.000Z",
        compressed: true,
      },
      {
        id: "2",
        base64: "data:image/jpeg;base64,test2",
        nom: "photo2.jpg",
        taille: 2048,
        dateAjout: "2025-01-10T10:31:00.000Z",
        compressed: true,
      },
      {
        id: "3",
        base64: "data:image/jpeg;base64,test3",
        nom: "photo3.jpg",
        taille: 3072,
        dateAjout: "2025-01-10T10:32:00.000Z",
        compressed: true,
      },
    ];
    render(<PhotoUpload photos={photos} onChange={mockOnChange} />);
    const button = screen.getByRole("button", { name: /ajouter photo/i });
    expect(button).toBeDisabled();
  });

  it("should show max reached message", () => {
    const photos: PhotoObservation[] = Array.from({ length: 3 }, (_, i) => ({
      id: `${i + 1}`,
      base64: `data:image/jpeg;base64,test${i}`,
      nom: `photo${i}.jpg`,
      taille: 1024,
      dateAjout: "2025-01-10T10:30:00.000Z",
      compressed: true,
    }));
    render(<PhotoUpload photos={photos} onChange={mockOnChange} />);
    expect(screen.getByText(/maximum.*atteint/i)).toBeInTheDocument();
  });

  it("should render photo thumbnails", () => {
    const photos: PhotoObservation[] = [
      {
        id: "1",
        base64: "data:image/jpeg;base64,test1",
        nom: "photo1.jpg",
        taille: 1024,
        dateAjout: "2025-01-10T10:30:00.000Z",
        compressed: true,
      },
    ];
    render(<PhotoUpload photos={photos} onChange={mockOnChange} />);
    const img = screen.getByRole("img", { name: "photo1.jpg" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "data:image/jpeg;base64,test1");
  });

  it("should show delete button on thumbnails", () => {
    const photos: PhotoObservation[] = [
      {
        id: "1",
        base64: "data:image/jpeg;base64,test1",
        nom: "photo1.jpg",
        taille: 1024,
        dateAjout: "2025-01-10T10:30:00.000Z",
        compressed: true,
      },
    ];
    render(<PhotoUpload photos={photos} onChange={mockOnChange} />);
    const deleteButton = screen.getByRole("button", { name: /supprimer.*photo1/i });
    expect(deleteButton).toBeInTheDocument();
  });

  it("should call onChange when deleting a photo", async () => {
    const user = userEvent.setup();
    const photos: PhotoObservation[] = [
      {
        id: "1",
        base64: "data:image/jpeg;base64,test1",
        nom: "photo1.jpg",
        taille: 1024,
        dateAjout: "2025-01-10T10:30:00.000Z",
        compressed: true,
      },
    ];
    render(<PhotoUpload photos={photos} onChange={mockOnChange} />);

    const deleteButton = screen.getByRole("button", { name: /supprimer.*photo1/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith([]);
    });
  });

  it("should display file size in human readable format", () => {
    const photos: PhotoObservation[] = [
      {
        id: "1",
        base64: "data:image/jpeg;base64,test1",
        nom: "photo1.jpg",
        taille: 245678, // ~240 KB
        dateAjout: "2025-01-10T10:30:00.000Z",
        compressed: true,
      },
    ];
    render(<PhotoUpload photos={photos} onChange={mockOnChange} />);
    expect(screen.getByText(/240.*kb/i)).toBeInTheDocument();
  });

  it("should have correct input attributes for mobile", () => {
    render(<PhotoUpload photos={[]} onChange={mockOnChange} />);
    const input = screen.getByLabelText(/ajouter photo/i);
    expect(input).toHaveAttribute("type", "file");
    expect(input).toHaveAttribute("accept", "image/*");
    // Should allow camera and gallery on mobile
    expect(input).not.toHaveAttribute("capture");
  });
});
