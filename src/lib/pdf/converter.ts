/**
 * PDF to Base64 converter
 * Converts PDF File to base64 string for Anthropic API
 */

/**
 * Convert PDF File to base64 string
 * @param file - PDF File object
 * @returns Base64 encoded string (without data URI prefix)
 */
export async function pdfToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove the "data:application/pdf;base64," prefix
      const base64Data = base64.split(",")[1];
      resolve(base64Data);
    };

    reader.onerror = () => {
      reject(new Error("Failed to read PDF file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Convert Buffer to base64 string
 * @param buffer - PDF Buffer
 * @returns Base64 encoded string
 */
export function bufferToBase64(buffer: Buffer): string {
  return buffer.toString("base64");
}
