import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { calculateEcarts } from "@/lib/utils/ecarts";

const updateMenuiserieSchema = z.object({
  donneesModifiees: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean(), z.null()])
  ),
});

/**
 * GET /api/menuiseries/[id]
 * Récupère une menuiserie avec ses infos projet
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const menuiserie = await prisma.menuiserie.findUnique({
      where: { id },
      include: {
        projet: {
          select: {
            id: true,
            reference: true,
            clientNom: true,
            clientAdresse: true,
          },
        },
      },
    });

    if (!menuiserie) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Menuiserie not found",
          },
        },
        { status: 404 }
      );
    }

    // Get all menuiseries from the same project for navigation
    const allMenuiseries = await prisma.menuiserie.findMany({
      where: { projetId: menuiserie.projetId },
      select: {
        id: true,
        repere: true,
        intitule: true,
        ordre: true,
        donneesModifiees: true,
      },
      orderBy: { ordre: "asc" },
    });

    // Find current index
    const currentIndex = allMenuiseries.findIndex((m) => m.id === id);

    // Map menuiseries to status format with completion flag
    const menuiseriesStatus = allMenuiseries.map((m) => ({
      id: m.id,
      repere: m.repere,
      intitule: m.intitule,
      isCompleted: m.donneesModifiees !== null && Object.keys(m.donneesModifiees as Record<string, any>).length > 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        ...menuiserie,
        navigation: {
          total: allMenuiseries.length,
          currentIndex: currentIndex,
          currentPosition: currentIndex + 1,
          hasNext: currentIndex < allMenuiseries.length - 1,
          hasPrevious: currentIndex > 0,
          nextId: currentIndex < allMenuiseries.length - 1 ? allMenuiseries[currentIndex + 1].id : null,
          previousId: currentIndex > 0 ? allMenuiseries[currentIndex - 1].id : null,
          allMenuiseries: allMenuiseries,
          menuiseriesStatus: menuiseriesStatus,
        },
      },
    });
  } catch (error) {
    console.error("[API] Get menuiserie error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to fetch menuiserie",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/menuiseries/[id]
 * Met à jour les données modifiées et calcule les écarts
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validated = updateMenuiserieSchema.parse(body);

    // Get current menuiserie
    const menuiserie = await prisma.menuiserie.findUnique({
      where: { id },
    });

    if (!menuiserie) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Menuiserie not found",
          },
        },
        { status: 404 }
      );
    }

    // Calculate écarts
    const donneesOriginales = menuiserie.donneesOriginales as Record<
      string,
      any
    >;
    const ecarts = calculateEcarts(
      donneesOriginales,
      validated.donneesModifiees
    );

    // Update menuiserie
    const updated = await prisma.menuiserie.update({
      where: { id },
      data: {
        donneesModifiees: validated.donneesModifiees as any,
        ecarts: ecarts as any, // Prisma Json type
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("[API] Update menuiserie error:", error);

    // Validation error
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
          message: "Failed to update menuiserie",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
