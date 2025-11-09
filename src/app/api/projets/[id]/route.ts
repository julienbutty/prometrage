import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const projetUpdateSchema = z.object({
  reference: z.string().min(1).optional(),
  adresse: z.string().nullable().optional(),
});

/**
 * GET /api/projets/[id]
 * Récupère un projet avec ses menuiseries
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const projet = await prisma.projet.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            nom: true,
            email: true,
            tel: true,
          },
        },
        menuiseries: {
          orderBy: {
            ordre: "asc",
          },
        },
      },
    });

    if (!projet) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Projet not found",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: projet,
    });
  } catch (error) {
    console.error("[API] Get projet error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to fetch projet",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projets/[id]
 * Met à jour les informations d'un projet
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validated = projetUpdateSchema.parse(body);

    // Update projet
    const updatedProjet = await prisma.projet.update({
      where: { id },
      data: validated,
      include: {
        client: {
          select: {
            id: true,
            nom: true,
            email: true,
            tel: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedProjet,
    });
  } catch (error) {
    console.error("[API] Update projet error:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
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

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to update projet",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projets/[id]
 * Supprime un projet et toutes ses menuiseries associées (cascade)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Vérifier que le projet existe
    const projet = await prisma.projet.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            menuiseries: true,
          },
        },
      },
    });

    if (!projet) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Projet not found",
          },
        },
        { status: 404 }
      );
    }

    // Supprimer le projet (cascade supprime aussi les menuiseries)
    await prisma.projet.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: projet.id,
        deletedMenuiseries: projet._count.menuiseries,
      },
    });
  } catch (error) {
    console.error("[API] Delete projet error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to delete projet",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
