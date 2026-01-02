# Research: SVG-Centric Menuiserie Page Redesign

**Date**: 2026-01-01
**Feature**: 006-svg-centric-redesign

## Research Tasks

### 1. CSS Layout Strategy for Spatial Positioning

**Question**: What CSS approach best handles spatial positioning around a central element with responsive breakpoints?

**Decision**: CSS Grid for tablet layout, Flexbox column for mobile

**Rationale**:
- CSS Grid allows precise placement of elements around a central cell
- Named grid areas make the spatial relationship explicit and maintainable
- Tailwind's responsive prefixes (`md:grid md:grid-cols-[...]`) enable clean breakpoint switching
- Flexbox column with `order` classes handles mobile stacking

**Alternatives Considered**:
- **Absolute positioning**: Rejected - brittle, doesn't adapt to content size
- **CSS Subgrid**: Rejected - limited browser support for this use case
- **Flexbox only**: Rejected - harder to achieve true spatial positioning on tablet

**Implementation Pattern**:
```css
/* Mobile (default): Flexbox column */
.svg-zone { display: flex; flex-direction: column; }

/* Tablet (md:): CSS Grid with named areas */
@media (min-width: 768px) {
  .svg-zone {
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto 1fr auto;
    grid-template-areas:
      ".        hab-haut   ."
      "hab-gauche  svg    hab-droite"
      ".        bottom     .";
  }
}
```

---

### 2. Toggle State Management

**Question**: Where should the habillages toggle state live?

**Decision**: Local component state (`useState`) in MenuiserieSVGEditor

**Rationale**:
- Toggle state is ephemeral (resets on page navigation is acceptable)
- No need to persist across sessions (FR-012 says "during session", not across)
- Simple boolean, no complex logic needed
- Keeping state local avoids unnecessary complexity

**Alternatives Considered**:
- **Zustand store**: Rejected - overkill for single boolean
- **URL query param**: Rejected - doesn't need to be shareable/bookmarkable
- **Local storage**: Rejected - persistence not required by spec

---

### 3. Touch Target Compliance

**Question**: How to ensure all interactive elements meet 44px minimum?

**Decision**: Use Tailwind classes `min-h-[44px]` and `min-w-[44px]` explicitly on all buttons, inputs, selects

**Rationale**:
- Explicit is better than implicit for accessibility compliance
- Existing `DimensionInput` already uses `min-h-[44px]`
- Existing `HabillageGroup` uses `min-h-[40px]` → needs update to 44px

**Implementation**:
```tsx
// All interactive elements
className="min-h-[44px] ..." // Touch target height
className="h-11 ..."         // Tailwind shorthand for 44px
```

---

### 4. Responsive Breakpoint Strategy

**Question**: What breakpoint should trigger tablet vs mobile layout?

**Decision**: 768px (Tailwind `md:` breakpoint)

**Rationale**:
- 768px is standard tablet portrait width (iPad mini)
- Aligns with Tailwind's default breakpoints (no custom config needed)
- Matches FR-013/FR-014 specs (≥768px for tablet)
- Constitution mandates mobile-first: base styles are mobile, `md:` adds tablet

**Breakpoints Used**:
| Breakpoint | Width | Layout |
|------------|-------|--------|
| Default | <768px | Mobile: vertical stack |
| `md:` | ≥768px | Tablet: spatial grid |

---

### 5. Animation for Toggle Transition

**Question**: Should habillages appear/disappear with animation?

**Decision**: Simple fade + slide animation using Tailwind transitions

**Rationale**:
- Instant show/hide feels jarring
- Animation provides visual continuity
- Tailwind's `transition-all duration-200` is performant
- Keep it subtle (200ms) to not slow down the workflow

**Implementation**:
```tsx
// Wrapper with conditional classes
<div className={cn(
  "transition-all duration-200 ease-in-out",
  showHabillages
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-2 pointer-events-none h-0 overflow-hidden"
)} />
```

---

## Summary

| Research Item | Decision | Impact |
|--------------|----------|--------|
| CSS Layout | Grid (tablet) + Flex (mobile) | High - core architecture |
| Toggle State | Local useState | Low - simple implementation |
| Touch Targets | Explicit 44px min-height | Medium - accessibility compliance |
| Breakpoint | 768px (md:) | Low - uses Tailwind default |
| Animation | Fade + slide (200ms) | Low - UX polish |

**All unknowns resolved** - Ready for Phase 1 Design.
