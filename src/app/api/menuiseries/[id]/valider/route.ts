import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/menuiseries/[id]/valider
 * Valide une menuiserie (marque comme terminée)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Validate: cannot validate if no modifications exist
    if (!menuiserie.donneesModifiees) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Cannot validate menuiserie without modifications",
            details: "Please save modifications before validating",
          },
        },
        { status: 400 }
      );
    }

    // Update menuiserie: set validee to true and dateValidation to now
    const updated = await prisma.menuiserie.update({
      where: { id },
      data: {
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
