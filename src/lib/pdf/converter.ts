/**
 * PDF to Base64 converter
 * Works in both browser (File) and Node.js (Buffer/ArrayBuffer) environments
 */

/**
 * Convert PDF File or ArrayBuffer to base64 string
 * @param file - PDF File object or ArrayBuffer
 * @returns Base64 encoded string (without data URI prefix)
 */
export async function pdfToBase64(file: File | ArrayBuffer): Promise<string> {
  // Handle ArrayBuffer (server-side or direct buffer)
  if (file instanceof ArrayBuffer) {
    return Buffer.from(file).toString("base64");
  }

  // Handle File object (browser)
  if (typeof FileReader !== "undefined") {
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

  // Fallback for server-side File object (Next.js API routes)
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}

/**
 * Convert Buffer to base64 string
 * @param buffer - PDF Buffer
 * @returns Base64 encoded string
 */
export function bufferToBase64(buffer: Buffer): string {
  return buffer.toString("base64");
}
