import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { GET } from "@/app/api/clients/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    client: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe("GET /api/clients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return list of clients with project counts", async () => {
    // Arrange
    const mockClients = [
      {
        id: "client1",
        nom: "DUPONT",
        email: "dupont@test.com",
        tel: "0612345678",
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
        _count: {
          projets: 3,
        },
        projets: [
          { createdAt: new Date("2024-01-20") },
          { createdAt: new Date("2024-01-15") },
          { createdAt: new Date("2024-01-10") },
        ],
      },
      {
        id: "client2",
        nom: "MARTIN",
        email: "martin@test.com",
        tel: null,
        createdAt: new Date("2024-01-10"),
        updatedAt: new Date("2024-01-10"),
        _count: {
          projets: 1,
        },
        projets: [{ createdAt: new Date("2024-01-11") }],
      },
    ];

    vi.mocked(prisma.client.findMany).mockResolvedValue(mockClients as any);
    vi.mocked(prisma.client.count).mockResolvedValue(2);

    const request = new NextRequest("http://localhost:3000/api/clients");

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);

    // Verify client 1 structure
    expect(data.data[0]).toEqual({
      id: "client1",
      nom: "DUPONT",
      email: "dupont@test.com",
      tel: "0612345678",
      projetsCount: 3,
      lastProjet: "2024-01-20T00:00:00.000Z",
    });

    // Verify client 2 structure
    expect(data.data[1]).toEqual({
      id: "client2",
      nom: "MARTIN",
      email: "martin@test.com",
      tel: null,
      projetsCount: 1,
      lastProjet: "2024-01-11T00:00:00.000Z",
    });

    // Verify meta
    expect(data.meta).toEqual({
      page: 1,
      limit: 20,
      total: 2,
      totalPages: 1,
    });
  });

  it("should support pagination with page and limit params", async () => {
    // Arrange
    const mockClients = [
      {
        id: "client3",
        nom: "BERNARD",
        email: "bernard@test.com",
        tel: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { projets: 0 },
        projets: [],
      },
    ];

    vi.mocked(prisma.client.findMany).mockResolvedValue(mockClients as any);
    vi.mocked(prisma.client.count).mockResolvedValue(25);

    const request = new NextRequest(
      "http://localhost:3000/api/clients?page=2&limit=10"
    );

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(prisma.client.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10, // (page 2 - 1) * 10
        take: 10,
      })
    );

    expect(data.meta).toEqual({
      page: 2,
      limit: 10,
      total: 25,
      totalPages: 3, // Math.ceil(25 / 10)
    });
  });

  it("should support search by name or email", async () => {
    // Arrange
    const mockClients = [
      {
        id: "client1",
        nom: "DUPONT Jean",
        email: "jean.dupont@test.com",
        tel: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { projets: 2 },
        projets: [{ createdAt: new Date() }],
      },
    ];

    vi.mocked(prisma.client.findMany).mockResolvedValue(mockClients as any);
    vi.mocked(prisma.client.count).mockResolvedValue(1);

    const request = new NextRequest(
      "http://localhost:3000/api/clients?search=dupont"
    );

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(prisma.client.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { nom: { contains: "dupont", mode: "insensitive" } },
            { email: { contains: "dupont", mode: "insensitive" } },
          ],
        },
      })
    );

    expect(data.data).toHaveLength(1);
    expect(data.data[0].nom).toBe("DUPONT Jean");
  });

  it("should handle empty results", async () => {
    // Arrange
    vi.mocked(prisma.client.findMany).mockResolvedValue([]);
    vi.mocked(prisma.client.count).mockResolvedValue(0);

    const request = new NextRequest("http://localhost:3000/api/clients");

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
    expect(data.meta.total).toBe(0);
  });

  it("should handle database errors", async () => {
    // Arrange
    vi.mocked(prisma.client.findMany).mockRejectedValue(
      new Error("Database connection failed")
    );

    const request = new NextRequest("http://localhost:3000/api/clients");

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("SERVER_ERROR");
    expect(data.error.message).toBe("Failed to fetch clients");
  });

  it("should default to page 1 and limit 20 if not provided", async () => {
    // Arrange
    vi.mocked(prisma.client.findMany).mockResolvedValue([]);
    vi.mocked(prisma.client.count).mockResolvedValue(0);

    const request = new NextRequest("http://localhost:3000/api/clients");

    // Act
    await GET(request);

    // Assert
    expect(prisma.client.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 20,
      })
    );
  });

  it("should order clients by name ascending", async () => {
    // Arrange
    vi.mocked(prisma.client.findMany).mockResolvedValue([]);
    vi.mocked(prisma.client.count).mockResolvedValue(0);

    const request = new NextRequest("http://localhost:3000/api/clients");

    // Act
    await GET(request);

    // Assert
    expect(prisma.client.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { nom: "asc" },
      })
    );
  });
});
