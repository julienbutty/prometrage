import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { calculateEcarts } from "@/lib/utils/ecarts";
import { PhotosObservationsSchema } from "@/lib/validations/photo-observation";
import { getMenuiserieStatut, StatutMenuiserie } from "@/lib/types/menuiserie-status";

/**
 * Schéma de validation pour les données modifiées
 * Supporte:
 * - Valeurs simples (string, number, boolean, null)
 * - Photos d'observation (array)
 * - Habillages (objet avec 4 côtés)
 */
const updateMenuiserieSchema = z.object({
  donneesModifiees: z.record(
    z.string(),
    z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.null(),
      z.array(z.any()), // Pour photosObservations
      z.object({
        haut: z.string().nullable().optional(),
        bas: z.string().nullable().optional(),
        gauche: z.string().nullable().optional(),
        droite: z.string().nullable().optional(),
      }), // Pour habillageInt/habillageExt (schema flexible)
    ])
  ),
  repere: z.string().optional(),
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
            adresse: true,
            client: {
              select: {
                id: true,
                nom: true,
                email: true,
                tel: true,
              },
            },
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
        validee: true, // Ajout pour calcul du statut
      },
      orderBy: { ordre: "asc" },
    });

    // Find current index
    const currentIndex = allMenuiseries.findIndex((m) => m.id === id);

    // Map menuiseries to status format with statut calculation
    const menuiseriesStatus = allMenuiseries.map((m) => {
      const statut = getMenuiserieStatut(m.donneesModifiees, m.validee);
      return {
        id: m.id,
        repere: m.repere,
        intitule: m.intitule,
        statut,
        // Compatibilité avec l'ancien code (isCompleted = VALIDEE)
        isCompleted: statut === StatutMenuiserie.VALIDEE,
      };
    });

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

    // Validate photos if present
    if (validated.donneesModifiees.photosObservations) {
      try {
        PhotosObservationsSchema.parse(validated.donneesModifiees.photosObservations);
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid photos format",
              details: error instanceof z.ZodError ? error.issues : "Invalid photos",
            },
          },
          { status: 400 }
        );
      }
    }

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
    const updateData: any = {
      donneesModifiees: validated.donneesModifiees as any,
      ecarts: ecarts as any, // Prisma Json type
    };

    // Update repere if provided
    if (validated.repere !== undefined) {
      updateData.repere = validated.repere;
    }

    const updated = await prisma.menuiserie.update({
      where: { id },
      data: updateData,
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

/**
 * DELETE /api/menuiseries/[id]
 * Supprime une menuiserie
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Vérifier que la menuiserie existe
    const menuiserie = await prisma.menuiserie.findUnique({
      where: { id },
      select: {
        id: true,
        projetId: true,
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

    // Supprimer la menuiserie
    await prisma.menuiserie.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: menuiserie.id,
        projetId: menuiserie.projetId,
      },
    });
  } catch (error) {
    console.error("[API] Delete menuiserie error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to delete menuiserie",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
