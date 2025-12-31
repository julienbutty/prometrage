<!--
SYNC IMPACT REPORT
==================
Version change: 0.0.0 → 1.0.0 (MAJOR: Initial constitution creation)
Modified principles: N/A (initial creation)
Added sections:
  - Core Principles (7 principles)
  - Development Workflow
  - Technical Standards
  - Governance
Removed sections: N/A
Templates requiring updates:
  - ✅ spec-template.md - Compatible (user scenarios align with TDD)
  - ✅ plan-template.md - Constitution Check section ready for integration
  - ✅ tasks-template.md - Test-first approach aligned with TDD principle
  - ✅ checklist-template.md - Compatible
  - ✅ agent-file-template.md - Compatible
Follow-up TODOs: None
-->

# ProMétrage Constitution

## Core Principles

### I. Mobile-First Design

All UI components and pages MUST be designed for mobile devices first (320px-640px), then progressively enhanced for tablet (640px-1024px) and desktop (>1024px).

**Rationale**: The primary users are artisans on construction sites using phones, often with gloves. Touch targets MUST be at least 44x44px (Apple HIG) and inputs MUST have minimum height of 56px.

**Enforcement**:
- Tailwind classes MUST follow mobile-first pattern: `w-full p-4 sm:max-w-lg lg:max-w-4xl`
- Every component MUST be tested on mobile viewport before larger screens
- Forms MUST use `inputMode="numeric"` and `pattern="[0-9]*"` for numeric fields

### II. Test-Driven Development (TDD)

All feature development MUST follow the Red-Green-Refactor cycle without exception.

**Rationale**: TDD ensures code correctness, provides living documentation, and prevents regression. The project has achieved 271+ passing tests through strict TDD adherence.

**Enforcement**:
- MUST write failing test before implementation code (RED)
- MUST write minimal code to pass the test (GREEN)
- MAY refactor while keeping tests green (REFACTOR)
- Tests MUST be co-located in `src/__tests__/` directory
- Vitest is the test runner; React Testing Library for component tests

### III. Strict Type Safety

TypeScript strict mode MUST be enabled. The `any` type is FORBIDDEN.

**Rationale**: Type safety catches errors at compile time, improves IDE support, and serves as documentation. The project uses Zod for runtime validation alignment with TypeScript types.

**Enforcement**:
- `tsconfig.json` MUST have `strict: true`
- Every function MUST have explicit return types
- All API inputs MUST be validated with Zod before processing
- Prisma-generated types MUST be used for database operations

### IV. Server-Side Validation

All user inputs and API payloads MUST be validated server-side with Zod schemas.

**Rationale**: Client-side validation improves UX but MUST NOT be trusted for security. Server-side validation prevents injection attacks and data corruption.

**Enforcement**:
- Every API route MUST parse request body with Zod before processing
- Validation schemas MUST be defined in `src/lib/validations/`
- Error messages MUST be user-friendly (French language for this project)
- Invalid requests MUST return 400 status with structured error response

### V. AI-Powered PDF Parsing

PDF data extraction MUST use Anthropic Claude API with structured prompts and confidence scoring.

**Rationale**: AI-based parsing handles format variations better than regex patterns. Confidence scores enable fallback to manual review when extraction is uncertain.

**Enforcement**:
- Claude Sonnet 4 (claude-sonnet-4-20250514) MUST be used for PDF parsing
- Extraction MUST return confidence score (0-1); if <0.7, MUST flag for manual review
- Retry logic MUST use exponential backoff (max 3 attempts)
- All AI responses MUST be validated with Zod schemas

### VI. Optimistic UI Updates

User interactions MUST feel instant through optimistic updates with rollback on failure.

**Rationale**: Construction site conditions often have poor connectivity. Optimistic updates provide responsive UX while TanStack Query handles synchronization and error recovery.

**Enforcement**:
- TanStack Query MUST be used for all API calls
- Mutations MUST implement `onMutate` for optimistic updates
- `onError` MUST rollback to previous state
- Toast notifications MUST inform user of sync status (Sonner)

### VII. Progressive Disclosure

Complex forms MUST use collapsible sections to reduce cognitive load and scroll distance.

**Rationale**: Mobile screens are small; showing all fields overwhelms users. Phase 3 achieved 56% scroll reduction through collapsible sections.

**Enforcement**:
- Primary fields (dimensions, key characteristics) MUST be visible by default
- Secondary fields MUST be in collapsible sections (Radix Collapsible)
- Section state SHOULD persist during session
- Critical alerts MUST NOT be hidden in collapsed sections

## Development Workflow

### Git Practices

- Commits MUST NOT be created automatically by AI assistants
- User MUST explicitly request commits
- Commit messages SHOULD follow conventional commits format
- Feature branches SHOULD use format: `[###-feature-name]`

### Code Quality Gates

- `npm run type-check` MUST pass before commit
- `npm run lint` MUST pass before commit
- `npm test` MUST pass before merge
- All new code MUST have corresponding tests

### Database Changes

- Prisma migrations MUST be created for schema changes
- `npm run db:generate` MUST be run after schema changes
- Seed data MUST be updated for new models

## Technical Standards

### Stack Requirements

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Next.js (App Router) | 15.5.4+ |
| UI Library | React | 19.1.0+ |
| Styling | Tailwind CSS | v4 |
| Components | shadcn/ui | Latest |
| State | TanStack Query + Zustand | Latest |
| Forms | React Hook Form + Zod | Latest |
| Database | PostgreSQL + Prisma | 16 / 6.16+ |
| Testing | Vitest + Testing Library | Latest |

### File Organization

```text
src/
├── app/           # Next.js App Router pages
├── components/
│   ├── ui/        # shadcn/ui components
│   ├── forms/     # Form components
│   └── layout/    # Header, Footer, Navigation
├── lib/
│   ├── prisma.ts  # Database client singleton
│   ├── pdf/       # AI parsing logic
│   ├── validations/ # Zod schemas
│   └── utils/     # Helper functions
├── hooks/         # Custom React hooks
├── __tests__/     # Test files
└── generated/     # Prisma client (gitignored)
```

### API Response Format

All API routes MUST return consistent response structure:

```typescript
// Success response
{ data: T, navigation?: NavigationMeta }

// Error response
{ error: string, details?: ValidationError[] }
```

## Governance

### Constitution Authority

This constitution supersedes all other development practices. Any deviation MUST be documented with justification in the relevant plan.md file.

### Amendment Process

1. Propose change with rationale
2. Document impact on existing code
3. Update constitution version per semantic versioning:
   - MAJOR: Principle removal or incompatible change
   - MINOR: New principle or significant expansion
   - PATCH: Clarification or wording fix
4. Update dependent templates if affected
5. Commit with message: `docs: amend constitution to vX.Y.Z`

### Compliance Review

- All PRs SHOULD reference constitution principles followed
- Code reviews SHOULD verify TDD compliance
- Quarterly review of constitution relevance

**Version**: 1.0.0 | **Ratified**: 2025-12-13 | **Last Amended**: 2025-12-13
