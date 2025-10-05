import { extractText } from "unpdf";

/**
 * Extract text from PDF file using unpdf
 * Modern library compatible with Next.js App Router and Edge Runtime
 */
export async function extractTextFromPDF(file: File | Buffer): Promise<string> {
  try {
    // Convert File/Buffer to Uint8Array for unpdf
    const arrayBuffer =
      file instanceof File ? await file.arrayBuffer() : file.buffer;
    const uint8Array = new Uint8Array(arrayBuffer);

    // Extract text using unpdf
    const { text } = await extractText(uint8Array, {
      mergePages: true, // Merge all pages into single text
    });

    if (!text || text.trim().length === 0) {
      throw new Error("No text could be extracted from PDF");
    }

    return text;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error(
      `Failed to extract text from PDF: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
