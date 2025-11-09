import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/menuiseries/[id]/valider
 * Valide une menuiserie (enregistre les modifications + marque comme terminée)
 *
 * Body optionnel :
 * - donneesModifiees: les données à enregistrer avant validation
 * - repere: le repère mis à jour
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    // Check if menuiserie exists
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

    // Préparer les données à enregistrer
    let donneesModifiees = menuiserie.donneesModifiees;

    // Si des modifications sont fournies dans le body, les utiliser
    if (body.donneesModifiees) {
      donneesModifiees = body.donneesModifiees;
    }
    // Sinon, si aucune modification n'existe en BDD, copier les données originales
    else if (!donneesModifiees) {
      donneesModifiees = menuiserie.donneesOriginales;
    }

    // Update menuiserie: enregistrer les modifications + valider
    const updated = await prisma.menuiserie.update({
      where: { id },
      data: {
        donneesModifiees: donneesModifiees as any, // Force type car on garantit que ce n'est pas null
        repere: body.repere ?? menuiserie.repere,
        validee: true,
        dateValidation: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("[API] Validate menuiserie error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to validate menuiserie",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
