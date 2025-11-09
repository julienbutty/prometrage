import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const projetCreateSchema = z.object({
  reference: z.string().min(1, "La référence est obligatoire"),
  adresse: z.string().nullable().optional(),
  clientId: z.string().min(1, "Le client est obligatoire"),
});

/**
 * GET /api/projets
 * Liste tous les projets avec le nombre de menuiseries
 */
export async function GET() {
  try {
    const projets = await prisma.projet.findMany({
      include: {
        client: {
          select: {
            id: true,
            nom: true,
            email: true,
            tel: true,
          },
        },
        _count: {
          select: {
            menuiseries: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: projets,
    });
  } catch (error) {
    console.error("[API] List projets error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to fetch projets",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projets
 * Crée un nouveau projet manuellement (sans PDF)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validated = projetCreateSchema.parse(body);

    // Vérifier que le client existe
    const client = await prisma.client.findUnique({
      where: { id: validated.clientId },
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

    // Créer le projet
    const projet = await prisma.projet.create({
      data: {
        reference: validated.reference,
        adresse: validated.adresse,
        clientId: validated.clientId,
        pdfUrl: "", // Pas de PDF pour les projets manuels
        pdfOriginalNom: "", // Pas de PDF
      },
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

    return NextResponse.json(
      {
        success: true,
        data: projet,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Create projet error:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
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
          message: "Failed to create projet",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
