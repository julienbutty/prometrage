import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pdfToBase64 } from "@/lib/pdf/converter";
import {
  parsePDFWithAI,
  AIParsingError,
  AILowConfidenceError,
} from "@/lib/pdf/ai-parser";
import { extractImagesFromPDF } from "@/lib/pdf/image-extractor";

/**
 * POST /api/upload/pdf
 * Upload PDF and parse using Anthropic Claude Sonnet 4.5
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Validate request
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_FILE",
            message: "No file provided",
          },
        },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_FILE_TYPE",
            message: "File must be a PDF",
          },
        },
        { status: 400 }
      );
    }

    console.log(`[Upload] Processing PDF: ${file.name} (${file.size} bytes)`);

    // 2. Convert PDF to base64
    const pdfBase64 = await pdfToBase64(file);
    console.log(`[Upload] PDF converted to base64`);

    // 3. Extract images from PDF
    let extractedImages: string[] = [];
    try {
      extractedImages = await extractImagesFromPDF(pdfBase64);
      console.log(`[Upload] Extracted ${extractedImages.length} images from PDF`);
    } catch (error) {
      console.error("[Upload] Image extraction failed:", error);
      // Continue without images if extraction fails
    }

    // 4. Parse with AI
    const parsed = await parsePDFWithAI(pdfBase64);
    console.log(`[Upload] AI parsing complete`);
    console.log(`[Upload] Found ${parsed.menuiseries.length} menuiseries`);

    // 5. Generate project reference
    const clientName = parsed.metadata.clientInfo?.nom || "UNKNOWN";
    const reference = generateReference(clientName);

    // 6. TODO: Upload PDF to storage (Uploadthing/Vercel Blob)
    // For now, we'll use a placeholder URL
    const pdfUrl = `placeholder://pdf/${file.name}`;

    // 7. Create project in database
    // Associate images with menuiseries based on order
    const projet = await prisma.projet.create({
      data: {
        reference,
        clientNom: parsed.metadata.clientInfo?.nom || "Client inconnu",
        clientAdresse: parsed.metadata.clientInfo?.adresse || "",
        clientTel: parsed.metadata.clientInfo?.tel || "",
        clientEmail: parsed.metadata.clientInfo?.email || "",
        pdfOriginalNom: file.name,
        pdfUrl,
        menuiseries: {
          create: parsed.menuiseries.map((m, index) => {
            // Extract repere from intitule if it contains ":"
            const { repere: extractedRepere, cleanedIntitule } = extractRepereFromIntitule(m.intitule);

            return {
              repere: m.repere || extractedRepere || `R${index + 1}`,
              intitule: extractedRepere ? cleanedIntitule : m.intitule,
              // Try to use AI-extracted image first, then fallback to extracted images by index
              imageBase64: m.imageBase64 || extractedImages[index] || null,
              donneesOriginales: m as any, // Prisma Json type
              ordre: index,
            };
          }),
        },
      },
      include: {
        menuiseries: {
          orderBy: {
            ordre: "asc",
          },
        },
      },
    });

    console.log(`[Upload] Created projet ${projet.id} with ${projet.menuiseries.length} menuiseries`);

    // 7. Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          projetId: projet.id,
          reference: projet.reference,
          pdfUrl: projet.pdfUrl,
          menuiseries: projet.menuiseries,
          parseStatus: {
            total: parsed.menuiseries.length,
            success: parsed.menuiseries.length,
            errors: [],
            aiMetadata: {
              model: parsed.metadata.model,
              confidence: parsed.metadata.confidence,
              tokensUsed: parsed.metadata.tokensUsed,
              warnings: parsed.metadata.warnings,
              retryCount: parsed.metadata.retryCount,
            },
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Upload] Error:", error);

    // Handle AI-specific errors
    if (error instanceof AILowConfidenceError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AI_LOW_CONFIDENCE",
            message: "L'IA n'est pas assez confiante dans l'extraction",
            details: {
              confidence: error.confidence,
              suggestion: "Vérification manuelle recommandée",
            },
          },
        },
        { status: 422 }
      );
    }

    if (error instanceof AIParsingError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AI_PARSE_ERROR",
            message: "Erreur lors du parsing du PDF",
            details:
              error.originalError instanceof Error
                ? error.originalError.message
                : "Unknown error",
          },
        },
        { status: 500 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to process PDF",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Extract repere from intitule if format "Repere : Intitule"
 * Example: "Salon : Coulissant 2 vantaux" -> repere: "Salon", intitule: "Coulissant 2 vantaux"
 */
function extractRepereFromIntitule(intitule: string): {
  repere: string | null;
  cleanedIntitule: string;
} {
  const colonIndex = intitule.indexOf(":");
  if (colonIndex === -1) {
    return { repere: null, cleanedIntitule: intitule };
  }

  const repere = intitule.substring(0, colonIndex).trim();
  const cleanedIntitule = intitule.substring(colonIndex + 1).trim();

  return { repere, cleanedIntitule };
}

/**
 * Generate project reference from client name
 */
function generateReference(clientName: string): string {
  const prefix = clientName
    .substring(0, 4)
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .padEnd(4, "X");

  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}-${timestamp}`;
}
