import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/projets
 * Liste tous les projets avec le nombre de menuiseries
 */
export async function GET() {
  try {
    const projets = await prisma.projet.findMany({
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
