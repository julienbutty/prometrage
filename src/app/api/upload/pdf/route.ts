import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * API Route: Upload PDF and parse using AI
 *
 * TODO: Implement AI-based parsing with Anthropic Claude Sonnet 4.5
 * See: /docs/AI_PARSING_GUIDE.md
 *
 * Current status: Placeholder - old manual parsing removed
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }

    // TODO: Implement AI parsing
    // 1. Convert PDF to base64: const pdfBase64 = await pdfToBase64(file);
    // 2. Parse with AI: const parsed = await parsePDFWithAI(pdfBase64);
    // 3. Upload file to storage: const pdfUrl = await uploadFile(file);
    // 4. Create projet with menuiseries in DB

    return NextResponse.json(
      {
        error: "AI parsing not yet implemented",
        message: "See /docs/AI_PARSING_GUIDE.md for implementation",
      },
      { status: 501 } // Not Implemented
    );
  } catch (error) {
    console.error("Upload error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process PDF" },
      { status: 500 }
    );
  }
}
