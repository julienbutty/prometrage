# Legacy PDF Parsing Code

⚠️ **DEPRECATED - For reference only**

This directory contains the old manual PDF parsing implementation using regex and unpdf.

## Why deprecated?

We migrated to **AI-based parsing** using Anthropic Claude Sonnet 4.5 for:
- ✅ Better robustness against PDF format variations
- ✅ Contextual understanding of complex layouts
- ✅ Easier maintenance (no fragile regex patterns)
- ✅ Natural adaptability to new formats

## Files

- `extractor.legacy.ts` - Old text extraction using unpdf
- `parser.legacy.ts` - Old manual parsing with regex patterns

## Migration date

January 2025

## New implementation

See:
- `/src/lib/pdf/ai-parser.ts` - New AI-based parser
- `/docs/AI_PARSING_GUIDE.md` - Complete implementation guide
