/**
 * Extract images from PDF document
 * TODO: Implement proper image extraction using pdf.js or similar
 *
 * For now, returns empty array. Images will be added later.
 * The schema is ready to receive them.
 */
export async function extractImagesFromPDF(
  pdfBase64: string
): Promise<string[]> {
  console.log("[Image Extractor] Image extraction not yet implemented");
  console.log("[Image Extractor] Schema is ready, will be implemented in next iteration");

  // TODO: Implement one of these approaches:
  // 1. Use pdf.js to render each page as PNG (screenshot approach)
  // 2. Use pdf-lib to extract embedded images
  // 3. Use external service/API for image extraction

  return [];
}
