# Feature Specification: SVG Design Migration

**Feature Branch**: `008-svg-design-migration`
**Created**: 2026-01-10
**Status**: Draft
**Input**: User description: "Modifier les SVG afin qu'ils s'inspirent de ceux dans le projet prometrage-rw. Garder notre implémentation de habillages et dimensions, utiliser uniquement les dessins de produit. Ne pas récupérer les pointillés autour."

## Summary

Migrate the visual design of menuiserie SVG product drawings from the current implementation (`prometrage`) to match the improved designs in the parallel project (`prometrage-rw`), while preserving the existing habillage system and dimension handling.

### Key Design Differences (Current vs Target)

| Element | Current (`prometrage`) | Target (`prometrage-rw`) |
|---------|------------------------|--------------------------|
| Frame stroke | 2px, gray-800 | 4px, gray-700 with rounded corners (rx=2) |
| Dormant width | 8px | 12px |
| Glass fill | Solid blue (#DBEAFE) | Semi-transparent rgba(200, 220, 240, 0.3) |
| Panel stroke | 3px for dividers | 2px consistent |
| Handle design | Small rectangles (5x16) | Larger bars (6x30) with position logic |
| Opening indicators | Arrow/path for soufflet | Triangle convention (fiche metreur) |
| Door features | Simple horizontal line | Full panel decoration, hinges, arc swing |
| Coulissant rails | Dashed lines | Solid tracks with proper rail section |

### What to Migrate (Product Drawings Only)

1. **Frame (dormant) rendering**: Thicker stroke (4px), rounded corners
2. **Glass area styling**: Semi-transparent fill
3. **Panel structure**: Better visual hierarchy
4. **Handle visualization**: Improved design and positioning
5. **Opening indicators**: Triangle convention (battant, soufflet, oscillo-battant)
6. **Door-specific elements**: Decorative panels, hinges, swing arc
7. **Coulissant-specific elements**: Rails/tracks, sliding arrows with markers

### What to Keep from Current Implementation

1. **Habillage system**: HabillageZone, HabillageSelector, HabillageGroup components
2. **Dimension inputs**: DimensionInput, InteractiveDimension components
3. **SVGZone wrapper**: Toggle mechanism, form integration
4. **MenuiserieSVG component**: The wrapper that selects templates
5. **API integration**: Data flow from donneesOriginales/donneesModifiees

### What NOT to Migrate

1. **Pointillés autour**: Dashed border decorations around the product frame
2. **BaseSvgWrapper**: We keep our own component architecture
3. **ProductSvgRouter**: Not needed, we have our own template selection
4. **InteractiveDimension from prometrage-rw**: Keep our DimensionInput system

## User Scenarios & Testing

### User Story 1 - View Improved Fenetre Design (Priority: P1)

When viewing a fenetre (window) menuiserie, the user sees a visually improved SVG drawing with clearer frame, semi-transparent glass, and proper opening indicators matching professional "fiche metreur" conventions.

**Why this priority**: Fenetres are the most common menuiserie type. Improving their visualization has the highest visual impact.

**Independent Test**: Open any existing project with fenetre menuiseries and verify the new visual design renders correctly without breaking dimension editing or habillage selection.

**Acceptance Scenarios**:

1. **Given** a fenetre with 2 vantaux, **When** the SVG renders, **Then** the frame has 4px stroke with rounded corners, glass is semi-transparent, and opening triangles show the correct direction.
2. **Given** a fenetre with oscillo-battant opening, **When** the SVG renders, **Then** both battant and soufflet triangles are visible (soufflet with dashed stroke).

---

### User Story 2 - View Improved Coulissant Design (Priority: P1)

When viewing a coulissant (sliding door/window), the user sees proper rail/track visualization and sliding direction arrows with arrow markers.

**Why this priority**: Coulissants are the second most common type and have the most visual difference from the current implementation.

**Independent Test**: Open any project with coulissant menuiseries and verify rails, sliding arrows, and panel overlap render correctly.

**Acceptance Scenarios**:

1. **Given** a 2-vantaux coulissant, **When** the SVG renders, **Then** rails are visible at the bottom with proper track lines, and arrows indicate sliding direction.
2. **Given** a coulissant, **When** the SVG renders, **Then** panels show slight visual overlap to suggest sliding mechanism.

---

### User Story 3 - View Improved Porte-Fenetre Design (Priority: P2)

When viewing a porte-fenetre, the user sees the improved design with full-height appearance, proper handle placement, and opening indicators.

**Why this priority**: Porte-fenetres share code with fenetres and will benefit from the same improvements.

**Independent Test**: Open a project with porte-fenetre menuiseries and verify the design matches fenetre improvements.

**Acceptance Scenarios**:

1. **Given** a porte-fenetre, **When** the SVG renders, **Then** it has the same visual improvements as fenetre with appropriate height proportions.

---

### User Story 4 - View Improved Chassis Fixe Design (Priority: P2)

When viewing a chassis fixe (fixed window), the user sees a clean fixed frame without opening indicators, with improved frame and glass styling.

**Why this priority**: Chassis fixe is simpler but should match the overall design language.

**Independent Test**: Open a project with chassis-fixe and verify the X-cross indicator or clean frame renders with new styling.

**Acceptance Scenarios**:

1. **Given** a chassis-fixe, **When** the SVG renders, **Then** the frame and glass have the new styling, with no opening indicators.

---

### User Story 5 - View Improved Chassis Soufflet Design (Priority: P2)

When viewing a chassis soufflet (tilt window), the user sees proper tilt opening indicator following fiche metreur convention.

**Why this priority**: Soufflet uses the same triangle convention as other opening types.

**Independent Test**: Open a project with chassis-soufflet and verify the triangle indicator points upward with base at bottom.

**Acceptance Scenarios**:

1. **Given** a chassis-soufflet, **When** the SVG renders, **Then** a triangle indicator shows with base at bottom and point at top.

---

### Edge Cases

- What happens when nbVantaux is 0 or exceeds 4? System should fallback to 1 vantail or cap at 4.
- How does system handle unknown menuiserie types? System should render a default frame.
- What happens when dimensions are 0 or negative? SVG should still render with minimum visible size.

## Requirements

### Functional Requirements

- **FR-001**: System MUST render fenetre SVG with 4px frame stroke, rounded corners (rx=2), and 12px dormant width
- **FR-002**: System MUST render glass areas with semi-transparent fill rgba(200, 220, 240, 0.3)
- **FR-003**: System MUST render opening indicators using triangle convention (base on hinge side, point toward opening)
- **FR-004**: System MUST render oscillo-battant with both battant (solid) and soufflet (dashed) triangles
- **FR-005**: System MUST render coulissant with proper rails/tracks at bottom and arrow markers for sliding direction
- **FR-006**: System MUST render handle bars (6x30 or similar) instead of small rectangles
- **FR-007**: System MUST preserve existing habillage rendering and interaction
- **FR-008**: System MUST preserve existing dimension input positioning and functionality
- **FR-009**: System MUST NOT add dashed border decorations around the product frame
- **FR-010**: System MUST maintain current viewBox and aspect ratio compatibility

### Key Entities

- **MenuiserieTemplate**: The SVG template functions that generate product drawings
- **OpeningIndicator**: Component for rendering opening direction triangles (to be created or enhanced)
- **COLORS/DESIGN_CONSTANTS**: New design constants matching prometrage-rw visual style

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 5 menuiserie types (fenetre, porte-fenetre, coulissant, chassis-fixe, chassis-soufflet) render with new visual design
- **SC-002**: Existing habillage selection and editing continues to work without modification
- **SC-003**: Existing dimension editing continues to work without modification
- **SC-004**: All existing unit tests pass after migration (adjust snapshots if needed)
- **SC-005**: Visual comparison with prometrage-rw shows matching product drawing style (excluding habillage zones and dimensions which differ by design)

## Assumptions

1. The prometrage-rw project is available at `/Users/julienbutty/perso/prometrage-rw` for design reference
2. The current MenuiserieSVG component wrapper will continue to select templates by type
3. No database migration is required as this is purely a visual change
4. Existing tests will need snapshot updates but logic tests should remain valid
