import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientUpdateSchema } from "@/lib/validations/client";
import { ZodError } from "zod";

/**
 * GET /api/clients
 * Liste tous les clients avec pagination et recherche
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { nom: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    // Fetch clients with counts and last project date
    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          nom: "asc",
        },
        include: {
          _count: {
            select: {
              projets: true,
            },
          },
          projets: {
            select: {
              createdAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      }),
      prisma.client.count({ where }),
    ]);

    // Transform data to match API spec
    const data = clients.map((client) => ({
      id: client.id,
      nom: client.nom,
      email: client.email,
      tel: client.tel,
      projetsCount: client._count.projets,
      lastProjet: client.projets[0]?.createdAt.toISOString() || null,
    }));

    // Return paginated response
    return NextResponse.json({
      success: true,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[API] List clients error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to fetch clients",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/clients
 * Crée un nouveau client
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validated = clientUpdateSchema.parse(body);

    // Check if client with same email already exists
    if (validated.email) {
      const existingClient = await prisma.client.findUnique({
        where: { email: validated.email },
      });

      if (existingClient) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "CONFLICT",
              message: "Un client avec cet email existe déjà",
              details: { field: "email" },
            },
          },
          { status: 409 }
        );
      }
    }

    // Create client
    const client = await prisma.client.create({
      data: {
        nom: validated.nom,
        email: validated.email,
        tel: validated.tel,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: client.id,
          nom: client.nom,
          email: client.email,
          tel: client.tel,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Create client error:", error);

    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Données invalides",
            details: error.issues,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to create client",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
