import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateAllBonsCommande,
  type MenuiserieData,
  type ProjetMetadata,
} from "@/lib/pdf/bon-commande-generator";
import archiver from "archiver";

/**
 * GET /api/projets/[id]/bons-commande
 * Génère les bons de commande pour toutes les menuiseries validées d'un projet
 *
 * Query params:
 * - format: "pdf" (1 seul PDF si 1-3 menuiseries) ou "zip" (toujours ZIP)
 * - menuiserieIds: IDs spécifiques (optionnel, sinon toutes les validées)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projetId } = await params;
    const searchParams = request.nextUrl.searchParams;

    // Paramètres optionnels
    const format = searchParams.get("format") || "auto"; // auto | pdf | zip
    const menuiserieIdsParam = searchParams.get("menuiserieIds");
    const menuiserieIds = menuiserieIdsParam?.split(",");

    // Récupérer le projet avec ses menuiseries
    const projet = await prisma.projet.findUnique({
      where: { id: projetId },
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
          where: menuiserieIds
            ? { id: { in: menuiserieIds } }
            : { validee: true }, // Par défaut: uniquement les validées
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

    if (projet.menuiseries.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NO_MENUISERIES",
            message: "Aucune menuiserie validée à inclure dans les bons de commande",
          },
        },
        { status: 400 }
      );
    }

    // Préparer les données
    const menuiseriesData: MenuiserieData[] = projet.menuiseries.map((m) => ({
      id: m.id,
      repere: m.repere,
      intitule: m.intitule,
      donneesOriginales: m.donneesOriginales as Record<string, unknown>,
      donneesModifiees: m.donneesModifiees as Record<string, unknown> | null,
      validee: m.validee ?? false,
    }));

    const projetMetadata: ProjetMetadata = {
      reference: projet.reference,
      adresse: projet.adresse,
      clientNom: projet.client.nom,
      date: new Date().toLocaleDateString("fr-FR"),
    };

    // Générer les bons de commande
    const bonsCommande = await generateAllBonsCommande(
      menuiseriesData,
      projetMetadata
    );

    // Si un seul PDF et format auto ou pdf
    if (bonsCommande.length === 1 && (format === "auto" || format === "pdf")) {
      const { pdf, type } = bonsCommande[0];
      const filename = `bon-commande-${projet.reference.replace(/[^a-zA-Z0-9-]/g, "_")}-${type}.pdf`;

      return new NextResponse(new Uint8Array(pdf), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Length": String(pdf.length),
        },
      });
    }

    // Sinon, générer un ZIP
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Compression maximale
    });

    const chunks: Buffer[] = [];

    // Collecter les chunks du ZIP
    archive.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    // Ajouter chaque PDF au ZIP
    for (let i = 0; i < bonsCommande.length; i++) {
      const { pdf, type } = bonsCommande[i];
      const filename = `bon-commande-${i + 1}-${type}.pdf`;
      archive.append(pdf, { name: filename });
    }

    // Finaliser le ZIP
    await archive.finalize();

    // Attendre que tous les chunks soient collectés
    await new Promise((resolve) => {
      archive.on("end", resolve);
    });

    const zipBuffer = Buffer.concat(chunks);
    const zipFilename = `bons-commande-${projet.reference.replace(/[^a-zA-Z0-9-]/g, "_")}.zip`;

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipFilename}"`,
        "Content-Length": String(zipBuffer.length),
      },
    });
  } catch (error) {
    console.error("[Bons Commande] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to generate bons de commande",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
