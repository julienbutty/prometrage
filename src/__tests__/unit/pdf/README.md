# PDF Parsing Tests

## Current Status

⚠️ **Tests temporarily disabled during migration to AI-based parsing**

## Files

- `parser.legacy.test.ts` - Old tests for manual regex parsing (archived)

## Next Steps

Create new tests for AI-based parsing:

```typescript
// Example: ai-parser.test.ts
import { describe, it, expect, vi } from "vitest";
import { parsePDFWithAI } from "@/lib/pdf/ai-parser";

vi.mock("@anthropic-ai/sdk", () => ({
  default: class Anthropic {
    messages = {
      create: vi.fn().mockResolvedValue({
        content: [{ type: "text", text: JSON.stringify({ ... }) }],
        usage: { input_tokens: 1000, output_tokens: 500 }
      })
    }
  }
}));

describe("AI PDF Parser", () => {
  it("should extract menuiseries from PDF", async () => {
    // Test implementation
  });
});
```

See: `/docs/AI_PARSING_GUIDE.md` section "Tests"
