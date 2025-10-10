import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { GET, PUT } from "@/app/api/clients/[id]/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    client: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("GET /api/clients/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return client detail with all projects and stats", async () => {
    // Arrange
    const mockClient = {
      id: "client1",
      nom: "DUPONT",
      email: "dupont@test.com",
      tel: "0612345678",
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15"),
      projets: [
        {
          id: "projet1",
          reference: "DUPO-001",
          adresse: "15 Rue des Lilas",
          pdfUrl: "http://example.com/pdf1.pdf",
          createdAt: new Date("2024-01-20"),
          _count: {
            menuiseries: 5,
          },
        },
        {
          id: "projet2",
          reference: "DUPO-002",
          adresse: "42 Avenue des Fleurs",
          pdfUrl: "http://example.com/pdf2.pdf",
          createdAt: new Date("2024-01-10"),
          _count: {
            menuiseries: 3,
          },
        },
      ],
    };

    vi.mocked(prisma.client.findUnique).mockResolvedValue(mockClient as any);

    const request = new NextRequest("http://localhost:3000/api/clients/client1");

    // Act
    const response = await GET(request, { params: Promise.resolve({ id: "client1" }) });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    // Verify client info
    expect(data.data.id).toBe("client1");
    expect(data.data.nom).toBe("DUPONT");
    expect(data.data.email).toBe("dupont@test.com");
    expect(data.data.tel).toBe("0612345678");

    // Verify projects
    expect(data.data.projets).toHaveLength(2);
    expect(data.data.projets[0].reference).toBe("DUPO-001");
    expect(data.data.projets[0].menuiseriesCount).toBe(5);

    // Verify stats
    expect(data.data.stats).toEqual({
      totalProjets: 2,
    });

    // Verify Prisma call
    expect(prisma.client.findUnique).toHaveBeenCalledWith({
      where: { id: "client1" },
      include: {
        projets: {
          include: {
            _count: {
              select: { menuiseries: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  });

  it("should return 404 if client not found", async () => {
    // Arrange
    vi.mocked(prisma.client.findUnique).mockResolvedValue(null);

    const request = new NextRequest("http://localhost:3000/api/clients/invalid");

    // Act
    const response = await GET(request, { params: Promise.resolve({ id: "invalid" }) });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("NOT_FOUND");
    expect(data.error.message).toBe("Client not found");
  });

  it("should handle database errors", async () => {
    // Arrange
    vi.mocked(prisma.client.findUnique).mockRejectedValue(
      new Error("Database error")
    );

    const request = new NextRequest("http://localhost:3000/api/clients/client1");

    // Act
    const response = await GET(request, { params: Promise.resolve({ id: "client1" }) });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("SERVER_ERROR");
  });
});

describe("PUT /api/clients/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should update client information", async () => {
    // Arrange
    const mockUpdatedClient = {
      id: "client1",
      nom: "DUPONT Jean",
      email: "jean.dupont@test.com",
      tel: "0687654321",
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-20"),
    };

    vi.mocked(prisma.client.update).mockResolvedValue(mockUpdatedClient as any);

    const request = new NextRequest("http://localhost:3000/api/clients/client1", {
      method: "PUT",
      body: JSON.stringify({
        nom: "DUPONT Jean",
        email: "jean.dupont@test.com",
        tel: "0687654321",
      }),
    });

    // Act
    const response = await PUT(request, { params: Promise.resolve({ id: "client1" }) });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.nom).toBe("DUPONT Jean");
    expect(data.data.email).toBe("jean.dupont@test.com");
    expect(data.data.tel).toBe("0687654321");

    expect(prisma.client.update).toHaveBeenCalledWith({
      where: { id: "client1" },
      data: {
        nom: "DUPONT Jean",
        email: "jean.dupont@test.com",
        tel: "0687654321",
      },
    });
  });

  it("should validate required fields", async () => {
    // Arrange
    const request = new NextRequest("http://localhost:3000/api/clients/client1", {
      method: "PUT",
      body: JSON.stringify({
        nom: "", // Empty name should fail
        email: "invalid-email", // Invalid email
      }),
    });

    // Act
    const response = await PUT(request, { params: Promise.resolve({ id: "client1" }) });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });

  it("should allow optional fields to be null", async () => {
    // Arrange
    const mockUpdatedClient = {
      id: "client1",
      nom: "MARTIN",
      email: null,
      tel: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.client.update).mockResolvedValue(mockUpdatedClient as any);

    const request = new NextRequest("http://localhost:3000/api/clients/client1", {
      method: "PUT",
      body: JSON.stringify({
        nom: "MARTIN",
        email: null,
        tel: null,
      }),
    });

    // Act
    const response = await PUT(request, { params: Promise.resolve({ id: "client1" }) });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.data.email).toBeNull();
    expect(data.data.tel).toBeNull();
  });

  it("should handle unique constraint errors for email", async () => {
    // Arrange
    const error = new Error("Unique constraint failed");
    (error as any).code = "P2002";
    (error as any).meta = { target: ["email"] };

    vi.mocked(prisma.client.update).mockRejectedValue(error);

    const request = new NextRequest("http://localhost:3000/api/clients/client1", {
      method: "PUT",
      body: JSON.stringify({
        nom: "DUPONT",
        email: "existing@test.com",
      }),
    });

    // Act
    const response = await PUT(request, { params: Promise.resolve({ id: "client1" }) });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(409);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("CONFLICT");
    expect(data.error.message).toContain("email");
  });

  it("should handle database errors", async () => {
    // Arrange
    vi.mocked(prisma.client.update).mockRejectedValue(
      new Error("Database error")
    );

    const request = new NextRequest("http://localhost:3000/api/clients/client1", {
      method: "PUT",
      body: JSON.stringify({
        nom: "DUPONT",
      }),
    });

    // Act
    const response = await PUT(request, { params: Promise.resolve({ id: "client1" }) });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("SERVER_ERROR");
  });
});
