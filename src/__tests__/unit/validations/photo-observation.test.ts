import { describe, it, expect } from "vitest";
import {
  PhotoObservationSchema,
  PhotosObservationsSchema,
  PHOTO_CONSTRAINTS,
  calculateBase64Size,
  isAllowedImageType,
} from "@/lib/validations/photo-observation";

describe("PhotoObservationSchema", () => {
  const validPhoto = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    base64: "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
    nom: "photo_test.jpg",
    taille: 1024,
    dateAjout: "2025-01-10T10:30:00.000Z",
    compressed: true,
  };

  it("should validate a correct photo", () => {
    const result = PhotoObservationSchema.safeParse(validPhoto);
    expect(result.success).toBe(true);
  });

  it("should reject invalid UUID", () => {
    const result = PhotoObservationSchema.safeParse({
      ...validPhoto,
      id: "invalid-uuid",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("ID invalide");
    }
  });

  it("should reject invalid base64 format", () => {
    const result = PhotoObservationSchema.safeParse({
      ...validPhoto,
      base64: "not-a-base64-string",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Format base64 invalide");
    }
  });

  it("should reject unsupported image format", () => {
    const result = PhotoObservationSchema.safeParse({
      ...validPhoto,
      base64: "data:image/gif;base64,R0lGODlh",
    });
    expect(result.success).toBe(false);
  });

  it("should reject photo exceeding max size", () => {
    // Créer une très longue string base64 (> 1MB)
    const largeBase64 = "data:image/jpeg;base64," + "A".repeat(2000000);
    const result = PhotoObservationSchema.safeParse({
      ...validPhoto,
      base64: largeBase64,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("dépasser 1MB");
    }
  });

  it("should reject empty filename", () => {
    const result = PhotoObservationSchema.safeParse({
      ...validPhoto,
      nom: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("nom est requis");
    }
  });

  it("should reject filename too long", () => {
    const result = PhotoObservationSchema.safeParse({
      ...validPhoto,
      nom: "a".repeat(256),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("255 caractères");
    }
  });

  it("should reject negative file size", () => {
    const result = PhotoObservationSchema.safeParse({
      ...validPhoto,
      taille: -100,
    });
    expect(result.success).toBe(false);
  });

  it("should reject size exceeding max", () => {
    const result = PhotoObservationSchema.safeParse({
      ...validPhoto,
      taille: PHOTO_CONSTRAINTS.MAX_SIZE_BYTES + 1,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Taille max");
    }
  });

  it("should reject invalid date format", () => {
    const result = PhotoObservationSchema.safeParse({
      ...validPhoto,
      dateAjout: "not-a-date",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Date invalide");
    }
  });

  it("should default compressed to true", () => {
    const photoWithoutCompressed = { ...validPhoto };
    delete (photoWithoutCompressed as any).compressed;
    const result = PhotoObservationSchema.safeParse(photoWithoutCompressed);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.compressed).toBe(true);
    }
  });
});

describe("PhotosObservationsSchema", () => {
  const validPhoto1 = {
    id: "550e8400-e29b-41d4-a716-446655440001",
    base64: "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
    nom: "photo1.jpg",
    taille: 1024,
    dateAjout: "2025-01-10T10:30:00.000Z",
    compressed: true,
  };

  const validPhoto2 = {
    id: "550e8400-e29b-41d4-a716-446655440002",
    base64: "data:image/png;base64,iVBORw0KGgo=",
    nom: "photo2.png",
    taille: 2048,
    dateAjout: "2025-01-10T10:31:00.000Z",
    compressed: true,
  };

  const validPhoto3 = {
    id: "550e8400-e29b-41d4-a716-446655440003",
    base64: "data:image/webp;base64,UklGRiQAAABXRUI=",
    nom: "photo3.webp",
    taille: 512,
    dateAjout: "2025-01-10T10:32:00.000Z",
    compressed: true,
  };

  it("should validate array with 1 photo", () => {
    const result = PhotosObservationsSchema.safeParse([validPhoto1]);
    expect(result.success).toBe(true);
  });

  it("should validate array with 2 photos", () => {
    const result = PhotosObservationsSchema.safeParse([validPhoto1, validPhoto2]);
    expect(result.success).toBe(true);
  });

  it("should validate array with 3 photos (max)", () => {
    const result = PhotosObservationsSchema.safeParse([
      validPhoto1,
      validPhoto2,
      validPhoto3,
    ]);
    expect(result.success).toBe(true);
  });

  it("should reject array with more than 3 photos", () => {
    const photo4 = { ...validPhoto1, id: "550e8400-e29b-41d4-a716-446655440004" };
    const result = PhotosObservationsSchema.safeParse([
      validPhoto1,
      validPhoto2,
      validPhoto3,
      photo4,
    ]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Maximum 3 photos");
    }
  });

  it("should validate empty array", () => {
    const result = PhotosObservationsSchema.safeParse([]);
    expect(result.success).toBe(true);
  });
});

describe("calculateBase64Size", () => {
  it("should calculate size correctly for simple base64", () => {
    // "Hello" en base64 = "SGVsbG8=" (8 caractères)
    // Taille réelle : (8 * 3/4) - 1 (padding) = 5 bytes
    const base64 = "data:image/jpeg;base64,SGVsbG8=";
    const size = calculateBase64Size(base64);
    expect(size).toBe(5);
  });

  it("should handle base64 without padding", () => {
    const base64 = "data:image/jpeg;base64,AAAA";
    const size = calculateBase64Size(base64);
    expect(size).toBe(3); // 4 * 3/4 = 3
  });

  it("should return 0 for invalid format", () => {
    const size = calculateBase64Size("not-a-data-url");
    expect(size).toBe(0);
  });
});

describe("isAllowedImageType", () => {
  it("should allow jpeg", () => {
    expect(isAllowedImageType("image/jpeg")).toBe(true);
  });

  it("should allow jpg", () => {
    expect(isAllowedImageType("image/jpg")).toBe(true);
  });

  it("should allow png", () => {
    expect(isAllowedImageType("image/png")).toBe(true);
  });

  it("should allow webp", () => {
    expect(isAllowedImageType("image/webp")).toBe(true);
  });

  it("should reject gif", () => {
    expect(isAllowedImageType("image/gif")).toBe(false);
  });

  it("should reject svg", () => {
    expect(isAllowedImageType("image/svg+xml")).toBe(false);
  });

  it("should reject non-image types", () => {
    expect(isAllowedImageType("application/pdf")).toBe(false);
  });
});
