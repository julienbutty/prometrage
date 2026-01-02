# Feature Specification: SVG-Centric Menuiserie Page Redesign

**Feature Branch**: `006-svg-centric-redesign`
**Created**: 2026-01-01
**Status**: Draft
**Input**: Redesign de la page menuiserie centré sur le SVG. Actuellement la page essaie d'intégrer trop d'éléments (dimensions + habillages) autour d'un petit SVG dans une section "Schéma". L'objectif est de repenser l'architecture UX de la page /menuiserie/[id] pour que le SVG soit l'élément central et que les champs soient organisés de manière plus ergonomique, notamment sur mobile.

## Clarifications

### Session 2026-01-01

- Q: Quel pattern d'interaction pour les dimensions autour du SVG ? → A: Inputs positionnés spatialement autour du SVG (largeur en bas, hauteur à droite, allège sous largeur) - relation visuelle directe
- Q: Position des habillages par rapport au SVG ? → A: Spatial autour du SVG - chaque côté (Haut/Bas/Gauche/Droite) positionné à l'emplacement correspondant, Int/Ext groupés
- Q: Visibilité dimensions vs habillages ? → A: Dimensions toujours visibles, Habillages masqués par défaut avec toggle pour afficher/masquer
- Q: Layout tablette vs mobile ? → A: Tablette = layout spatial complet autour du SVG / Mobile = vertical empilé en gardant l'ordre logique (Haut→SVG→Bas)
- Q: Taille minimale des touch targets ? → A: 44px (standard Apple HIG)

## Context & Problem Statement

### Current State
The `/menuiserie/[id]` page currently displays:
- A small SVG diagram (~200px max-width) in a "Dimensions & Schéma" card
- 3 dimension inputs (largeur, hauteur, hauteurAllege) around the SVG
- 8 habillage selects (4 sides × 2 types: intérieur/extérieur) around the SVG
- Additional cards: Repère, Type détecté, Caractéristiques produit, Détails additionnels, Observations

**Total: 11 form elements crammed around a tiny SVG = broken layout**

### Problems Identified
1. **Visual overload**: Too many elements around a small SVG creates visual noise
2. **Mobile unusable**: Elements overflow and ordering is inconsistent on small screens
3. **Cognitive load**: User cannot focus on one task at a time
4. **SVG too small**: The diagram, which should help visualize the window, is dwarfed by form elements

### Target Users
- **Artisans menuisiers** on job sites using smartphones
- They need to: see the window type → measure dimensions → select habillages → move to next window
- Environment: Standing, often poor lighting, thick gloves possible

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View SVG Clearly (Priority: P1)

As an artisan, I want to see a large, clear SVG diagram of the window type so I can visually confirm I'm working on the correct product before taking measurements.

**Why this priority**: The SVG is the visual anchor that confirms the product type. Without a clear view, the artisan may measure the wrong type of window.

**Independent Test**: User can identify window type (fenêtre 2 vantaux, porte-fenêtre, etc.) at a glance without scrolling or expanding anything.

**Acceptance Scenarios**:

1. **Given** I open a menuiserie page, **When** the page loads, **Then** the SVG is immediately visible and takes up at least 50% of the viewport width on mobile
2. **Given** I'm viewing the page on a 375px wide phone, **When** I look at the SVG, **Then** I can clearly see all window details (hinges, handles, vantaux) without zooming
3. **Given** the SVG is displayed, **When** I look at the label below it, **Then** I see the type name (e.g., "Fenêtre 2 vantaux")

---

### User Story 2 - Enter Dimensions Efficiently (Priority: P1)

As an artisan, I want to enter the 3 dimension values (largeur, hauteur, hauteur d'allège) with inputs positioned spatially around the SVG, so I can instantly see which measurement corresponds to which part of the window.

**Why this priority**: Dimensions are the primary data the artisan needs to enter. This is the core workflow.

**Independent Test**: User can enter all 3 dimensions in under 30 seconds using the numeric keyboard.

**Spatial Layout**:
- **Largeur** input: positioned below the SVG (horizontal dimension)
- **Hauteur** input: positioned to the right of the SVG (vertical dimension)
- **Hauteur d'allège** input: positioned below the largeur input

**Acceptance Scenarios**:

1. **Given** I want to enter dimensions, **When** I look at the SVG zone, **Then** I see the 3 inputs positioned spatially around the SVG with visual relationship to the dimension they represent
2. **Given** I tap on a dimension input, **When** the keyboard opens, **Then** it's a numeric keypad (inputMode="numeric")
3. **Given** I've entered a dimension value, **When** I look at the input, **Then** I see the deviation indicator if different from PDF value

---

### User Story 3 - Configure Habillages by Side (Priority: P2)

As an artisan, I want to configure habillages (intérieur/extérieur) for each side of the window with controls positioned spatially around the SVG, so I instantly know which side I'm configuring.

**Why this priority**: Habillages are important but secondary to dimensions. They can be configured in a second pass.

**Independent Test**: User can select habillages for all 4 sides without confusion about which side is which.

**Spatial Layout**:
- **Haut** (Int + Ext): positioned above the SVG
- **Bas** (Int + Ext): positioned below the SVG (under dimensions)
- **Gauche** (Int + Ext): positioned to the left of the SVG
- **Droite** (Int + Ext): positioned to the right of the SVG (near hauteur)

**Acceptance Scenarios**:

1. **Given** I want to configure habillages, **When** I look at the SVG zone, **Then** I see habillage controls positioned at each corresponding edge of the SVG
2. **Given** I select a habillage for "Haut", **When** I look at its position, **Then** it's visually at the top of the SVG, confirming which side I'm configuring
3. **Given** I've set one habillage value, **When** I use "Appliquer à tous", **Then** all same-type (int or ext) habillages are updated and I see visual feedback

---

### User Story 4 - Navigate Form Sections Progressively (Priority: P2)

As an artisan, I want to progress through the form in logical steps so I don't feel overwhelmed by all fields at once.

**Why this priority**: Progressive disclosure reduces cognitive load, especially on mobile.

**Independent Test**: User can complete the form by progressing through sections without seeing all fields simultaneously.

**Default View**: SVG + Dimensions only (clean, focused)
**Toggle Behavior**: A clearly visible "Habillages" button reveals/hides the 8 habillage controls positioned around the SVG

**Acceptance Scenarios**:

1. **Given** I open the menuiserie page, **When** I look at the interface, **Then** I see SVG + Dimensions only, habillages are hidden
2. **Given** I want to configure habillages, **When** I tap the "Habillages" toggle button, **Then** the 8 habillage controls appear at their spatial positions around the SVG
3. **Given** habillages are visible, **When** I tap the toggle again, **Then** they hide and I return to the clean dimensions-only view
4. **Given** I'm on mobile, **When** I scroll, **Then** sections appear in a logical order matching my workflow

---

### User Story 5 - Quick Save and Validate (Priority: P1)

As an artisan, I want to save my work and validate the menuiserie to move to the next one quickly.

**Why this priority**: The artisan may be interrupted (call, other task) and needs to save progress. Validation moves to next item.

**Independent Test**: User can save/validate from any point in the form within 2 taps.

**Acceptance Scenarios**:

1. **Given** I've made changes, **When** I look at the bottom of the screen, **Then** I see Save and Validate buttons always visible
2. **Given** I tap Validate, **When** the validation succeeds, **Then** I'm automatically navigated to the next menuiserie
3. **Given** I have unsaved changes, **When** I try to navigate away, **Then** I'm warned before losing changes

---

### Edge Cases

- What happens when the SVG type is unknown? → Display a generic placeholder SVG with "Type non reconnu" label
- What happens on very small screens (320px)? → SVG scales proportionally, minimum 200px width
- What happens when habillages are not needed (certain materials)? → Hide the habillages section entirely
- What happens if the user rotates their phone mid-form? → Form state is preserved, layout adapts

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display the SVG diagram prominently, taking at least 50% viewport width on mobile
- **FR-002**: System MUST separate dimension inputs from habillage inputs into distinct visual sections
- **FR-003**: System MUST allow users to enter dimensions without seeing habillage controls cluttering the view
- **FR-004**: System MUST provide clear navigation between form sections (dimensions → habillages → details)
- **FR-005**: System MUST keep Save/Validate buttons always visible at bottom of screen
- **FR-006**: System MUST preserve all existing functionality (dimension editing, habillage selection, propagation, observations, photos)
- **FR-007**: System MUST show the original PDF value and deviation indicator for each dimension
- **FR-008**: System MUST work on screens as small as 320px width
- **FR-009**: System MUST support the numeric keyboard for dimension inputs (inputMode="numeric")
- **FR-010**: System MUST visually indicate which side of the window a habillage control affects
- **FR-011**: System MUST provide a toggle button to show/hide habillage controls, hidden by default
- **FR-012**: System MUST preserve habillage toggle state during the session (if user opens habillages, they stay visible until toggled off)
- **FR-013**: System MUST use spatial layout around SVG on tablet (≥768px) with elements positioned at their corresponding edges
- **FR-014**: System MUST use vertical stacked layout on mobile (<768px) preserving logical order: Hab Haut → SVG + Dimensions → Hab Bas → Hab Gauche/Droite
- **FR-015**: All interactive elements (inputs, buttons, selects) MUST have minimum touch target size of 44px (Apple HIG standard)

### Key Entities

- **MenuiserieView**: The page displaying a single menuiserie with SVG, dimensions, habillages
- **DimensionSection**: Group of 3 dimension inputs (largeur, hauteur, hauteurAllege)
- **HabillagesSection**: Group of 8 habillage selects (4 sides × 2 types) with apply-to-all buttons
- **SVGDisplay**: Large, prominent SVG diagram with type label

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify the window type from the SVG within 2 seconds of page load
- **SC-002**: Users can enter all 3 dimensions in under 30 seconds on mobile
- **SC-003**: The SVG is visible without scrolling on page load (above the fold on 667px height screens)
- **SC-004**: No horizontal scrolling is needed on any screen size 320px or wider
- **SC-005**: Form completion time is reduced by at least 20% compared to current implementation
- **SC-006**: Zero layout overflow issues reported (elements staying within their containers)

## Assumptions

- The artisan workflow is: identify window type (SVG) → measure dimensions → select habillages → save/validate
- Habillages are less frequently modified than dimensions
- The existing component library (shadcn/ui) will be used
- Tab-based or accordion-based progressive disclosure is appropriate for mobile
- The bottom navigation bar (Save/Validate/Navigation) design is already optimal and should be preserved

## Out of Scope

- Redesigning the project list page
- Changing the data model or API
- Adding new features (offline mode, voice input, etc.)
- Redesigning other pages than `/menuiserie/[id]`
