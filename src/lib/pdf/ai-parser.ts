import Anthropic from "@anthropic-ai/sdk";
import { EXTRACTION_PROMPT } from "./prompts";
import {
  AIResponseSchema,
  ParsedMenuiseries,
  type ParsedMetadata,
} from "../validations/ai-response";

/**
 * AI PDF Parser using Anthropic Claude Sonnet 4.5
 */

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Configuration
const CONFIG = {
  model: "claude-sonnet-4-5-20250514" as const,
  maxTokens: 4096,
  maxRetries: parseInt(process.env.AI_PARSING_MAX_RETRIES || "3", 10),
  minConfidence: parseFloat(process.env.AI_PARSING_MIN_CONFIDENCE || "0.7"),
  timeout: parseInt(process.env.AI_PARSING_TIMEOUT || "30000", 10),
};

/**
 * Custom error classes
 */
export class AIParsingError extends Error {
  constructor(
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "AIParsingError";
  }
}

export class AILowConfidenceError extends Error {
  constructor(
    message: string,
    public confidence: number
  ) {
    super(message);
    this.name = "AILowConfidenceError";
  }
}

/**
 * Extract JSON from AI response text
 * Handles cases where AI wraps JSON in markdown code blocks
 */
export function extractJSON(text: string): string {
  // Try to find JSON in code block first
  const codeBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // Try to find raw JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0].trim();
  }

  throw new Error("No JSON found in AI response");
}

/**
 * Wait utility for retry backoff
 */
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parse PDF using AI with automatic retry
 *
 * @param pdfBase64 - Base64 encoded PDF content
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns Parsed menuiseries with metadata
 * @throws {AIParsingError} If parsing fails after all retries
 * @throws {AILowConfidenceError} If AI confidence is below threshold
 */
export async function parsePDFWithAI(
  pdfBase64: string,
  maxRetries: number = CONFIG.maxRetries
): Promise<ParsedMenuiseries> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`[AI Parser] Attempt ${attempt + 1}/${maxRetries}`);

      // Call Anthropic API
      const response = await anthropic.messages.create({
        model: CONFIG.model,
        max_tokens: CONFIG.maxTokens,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: pdfBase64,
                },
              },
              {
                type: "text",
                text: EXTRACTION_PROMPT,
              },
            ],
          },
        ],
      });

      // Extract text content from response
      const textContent = response.content.find((c) => c.type === "text");
      if (!textContent || textContent.type !== "text") {
        throw new Error("No text content in AI response");
      }

      // Extract and parse JSON
      const jsonText = extractJSON(textContent.text);
      const rawData = JSON.parse(jsonText);

      // Validate with Zod
      const validated = AIResponseSchema.parse(rawData);

      // Check confidence threshold
      if (validated.metadata.confidence < CONFIG.minConfidence) {
        throw new AILowConfidenceError(
          `AI confidence ${validated.metadata.confidence.toFixed(2)} below threshold ${CONFIG.minConfidence}`,
          validated.metadata.confidence
        );
      }

      // Calculate token usage
      const tokensUsed =
        response.usage.input_tokens + response.usage.output_tokens;

      console.log(`[AI Parser] Success on attempt ${attempt + 1}`);
      console.log(`[AI Parser] Tokens used: ${tokensUsed}`);
      console.log(`[AI Parser] Confidence: ${validated.metadata.confidence.toFixed(2)}`);
      console.log(`[AI Parser] Menuiseries found: ${validated.menuiseries.length}`);

      // Return parsed data with extended metadata
      return {
        menuiseries: validated.menuiseries,
        metadata: {
          ...validated.metadata,
          tokensUsed,
          model: CONFIG.model,
          retryCount: attempt,
        },
      };
    } catch (error) {
      console.error(`[AI Parser] Attempt ${attempt + 1} failed:`, error);

      // If it's the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        if (error instanceof AILowConfidenceError) {
          throw error;
        }
        throw new AIParsingError(
          `Failed to parse PDF after ${maxRetries} attempts`,
          error
        );
      }

      // Exponential backoff before retry
      const backoffMs = 1000 * Math.pow(2, attempt);
      console.log(`[AI Parser] Retrying in ${backoffMs}ms...`);
      await wait(backoffMs);
    }
  }

  throw new Error("Unreachable code");
}

/**
 * Parse PDF with timeout
 */
export async function parsePDFWithTimeout(
  pdfBase64: string,
  timeoutMs: number = CONFIG.timeout
): Promise<ParsedMenuiseries> {
  return Promise.race([
    parsePDFWithAI(pdfBase64),
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Parsing timeout after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}
