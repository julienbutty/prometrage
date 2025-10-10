import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientUpdateSchema } from "@/lib/validations/client";
import { ZodError } from "zod";

/**
 * GET /api/clients/[id]
 * Récupère un client avec tous ses projets et statistiques
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        projets: {
          include: {
            _count: {
              select: {
                menuiseries: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Client not found",
          },
        },
        { status: 404 }
      );
    }

    // Transform projets to match API spec
    const projets = client.projets.map((projet) => ({
      id: projet.id,
      reference: projet.reference,
      adresse: projet.adresse,
      pdfUrl: projet.pdfUrl,
      createdAt: projet.createdAt.toISOString(),
      menuiseriesCount: projet._count.menuiseries,
    }));

    return NextResponse.json({
      success: true,
      data: {
        id: client.id,
        nom: client.nom,
        email: client.email,
        tel: client.tel,
        projets,
        stats: {
          totalProjets: client.projets.length,
        },
      },
    });
  } catch (error) {
    console.error("[API] Get client error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to fetch client",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/clients/[id]
 * Met à jour les informations d'un client
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validated = clientUpdateSchema.parse(body);

    // Update client
    const updatedClient = await prisma.client.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedClient.id,
        nom: updatedClient.nom,
        email: updatedClient.email,
        tel: updatedClient.tel,
      },
    });
  } catch (error) {
    console.error("[API] Update client error:", error);

    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input data",
            details: error.issues,
          },
        },
        { status: 400 }
      );
    }

    // Handle Prisma unique constraint errors
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2002") {
        const meta = error as any;
        const field = meta.meta?.target?.[0] || "field";
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "CONFLICT",
              message: `A client with this ${field} already exists`,
              details: { field },
            },
          },
          { status: 409 }
        );
      }
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to update client",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
