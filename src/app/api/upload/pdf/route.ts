import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pdfToBase64 } from "@/lib/pdf/converter";
import {
  parsePDFWithAI,
  AIParsingError,
  AILowConfidenceError,
  AIInvalidDocumentError,
} from "@/lib/pdf/ai-parser";
import { extractImagesFromPDF } from "@/lib/pdf/image-extractor";
import { findOrCreateClient } from "@/lib/clients";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit";
import { requirePassword } from "@/lib/auth-simple";

/**
 * POST /api/upload/pdf
 * Upload PDF and parse using Anthropic Claude Sonnet 4.5
 *
 * Protection:
 * - Rate limiting: 5 uploads/heure par IP
 * - Password optionnel via APP_PASSWORD env var
 */
export async function POST(request: NextRequest) {
  try {
    // 0. Rate limiting (protection anti-spam)
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(clientIP, RATE_LIMITS.PDF_UPLOAD);

    if (!rateLimitResult.success) {
      console.warn(`[Upload] Rate limit exceeded for IP: ${clientIP}`);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Trop de requêtes. Veuillez réessayer plus tard.",
            details: {
              limit: rateLimitResult.limit,
              remaining: rateLimitResult.remaining,
              resetAt: rateLimitResult.reset,
            },
          },
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(rateLimitResult.limit),
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
            "X-RateLimit-Reset": String(rateLimitResult.reset),
            "Retry-After": String(Math.ceil((rateLimitResult.reset * 1000 - Date.now()) / 1000)),
          },
        }
      );
    }

    // 0.1. Vérification mot de passe (si configuré)
    const passwordError = await requirePassword(request);
    if (passwordError) {
      console.warn(`[Upload] Unauthorized access attempt from IP: ${clientIP}`);
      return passwordError;
    }

    console.log(`[Upload] Rate limit OK for ${clientIP} - Remaining: ${rateLimitResult.remaining}/${rateLimitResult.limit}`);

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

    // 5. Find or create client
    const { client, isNew } = await findOrCreateClient({
      nom: parsed.metadata.clientInfo?.nom || "Client inconnu",
      email: parsed.metadata.clientInfo?.email || null,
      tel: parsed.metadata.clientInfo?.tel || null,
    });

    console.log(`[Upload] ${isNew ? "Created new" : "Found existing"} client: ${client.nom} (${client.email || "no email"})`);

    // 6. Generate project reference
    const reference = generateReference(client.nom);

    // 7. TODO: Upload PDF to storage (Uploadthing/Vercel Blob)
    // For now, we'll use a placeholder URL
    const pdfUrl = `placeholder://pdf/${file.name}`;

    // 8. Create project in database
    // Associate images with menuiseries based on order
    const projet = await prisma.projet.create({
      data: {
        reference,
        clientId: client.id,
        adresse: parsed.metadata.clientInfo?.adresse || null,
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
        client: true,
        menuiseries: {
          orderBy: {
            ordre: "asc",
          },
        },
      },
    });

    console.log(`[Upload] Created projet ${projet.id} with ${projet.menuiseries.length} menuiseries`);

    // 9. Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          projetId: projet.id,
          reference: projet.reference,
          pdfUrl: projet.pdfUrl,
          client: {
            id: projet.client.id,
            nom: projet.client.nom,
            email: projet.client.email,
            tel: projet.client.tel,
            isNew,
          },
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
    if (error instanceof AIInvalidDocumentError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_DOCUMENT_TYPE",
            message: "Le PDF fourni n'est pas une fiche métreur de menuiseries",
            details: {
              reason: error.reason,
              suggestion: "Veuillez uploader un bon de commande de menuiseries valide",
            },
          },
        },
        { status: 400 }
      );
    }

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
 * Prend les 4 premières lettres du dernier mot (nom de famille)
 * Ex: "Jean DUPONT" → "DUPO-123456", "MARTIN" → "MART-123456"
 */
function generateReference(clientName: string): string {
  // Extraire le dernier mot (généralement le nom de famille)
  const words = clientName.trim().split(/\s+/);
  const lastName = words[words.length - 1];

  const prefix = lastName
    .substring(0, 4)
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .padEnd(4, "X");

  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}-${timestamp}`;
}
