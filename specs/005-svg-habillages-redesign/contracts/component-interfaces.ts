/**
 * Component Interface Contracts
 * Feature: 005-svg-habillages-redesign
 *
 * These interfaces define the contracts between components.
 * They serve as the "API" for this frontend-only feature.
 */

import type { Side, HabillageValue, HabillageConfig, HabillageOption } from '@/lib/validations/habillage';

// =============================================================================
// HabillageGroup Component Contract
// =============================================================================

/**
 * Props for HabillageGroup component
 * Groups Int + Ext selectors for a single side of the window
 *
 * @example
 * ```tsx
 * <HabillageGroup
 *   side="haut"
 *   values={{ interieur: 'Standard', exterieur: null }}
 *   onIntChange={(v) => handleIntChange('haut', v)}
 *   onExtChange={(v) => handleExtChange('haut', v)}
 *   options={habillageConfig}
 *   highlightInt={highlightedIntSides.has('haut')}
 *   highlightExt={highlightedExtSides.has('haut')}
 * />
 * ```
 */
export interface HabillageGroupProps {
  /** Window side (haut, bas, gauche, droite) */
  side: Side;

  /** Current values for this side */
  values: {
    interieur: HabillageValue | null;
    exterieur: HabillageValue | null;
  };

  /** Callback when interior habillage changes */
  onIntChange: (value: HabillageValue) => void;

  /** Callback when exterior habillage changes */
  onExtChange: (value: HabillageValue) => void;

  /** Available options (depends on material/pose) */
  options: HabillageConfig;

  /** Highlight animation for interior selector */
  highlightInt?: boolean;

  /** Highlight animation for exterior selector */
  highlightExt?: boolean;

  /** Stack orientation (default: 'vertical') */
  orientation?: 'vertical' | 'horizontal';

  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// ApplyToAllButton Component Contract
// =============================================================================

/**
 * Props for ApplyToAllButton component
 * Button to propagate one habillage value to all sides
 *
 * @example
 * ```tsx
 * <ApplyToAllButton
 *   type="interieur"
 *   onApply={() => habillagesInt.applyToAll()}
 *   disabled={!habillagesInt.hasAnyValue}
 * />
 * ```
 */
export interface ApplyToAllButtonProps {
  /** Habillage type (determines color: blue/orange) */
  type: 'interieur' | 'exterieur';

  /** Callback when button is clicked */
  onApply: () => void;

  /** Disable button (no value to propagate) */
  disabled?: boolean;

  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// HabillageSelect Component Contract (Updated)
// =============================================================================

/**
 * Props for HabillageSelect component
 * Individual dropdown for one habillage value
 *
 * @example
 * ```tsx
 * <HabillageSelect
 *   side="haut"
 *   value={values.interieur}
 *   onChange={(v) => onIntChange(v)}
 *   options={options.interieurs}
 *   variant="interieur"
 *   isHighlighted={highlightInt}
 * />
 * ```
 */
export interface HabillageSelectProps {
  /** Window side (for labeling) */
  side: Side;

  /** Current value (null if not selected) */
  value: HabillageValue | null;

  /** Callback when value changes */
  onChange: (value: HabillageValue) => void;

  /** Available options */
  options: HabillageOption[];

  /** Highlight animation active */
  isHighlighted?: boolean;

  /** Visual variant for pill styling (NEW) */
  variant?: 'interieur' | 'exterieur';

  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// MenuiserieSVGEditor Component Contract (Updated)
// =============================================================================

/**
 * Props for MenuiserieSVGEditor component
 * Main editor with SVG and habillages positioned around it
 *
 * @example
 * ```tsx
 * <MenuiserieSVGEditor
 *   typeMenuiserie="Fenêtre 2 vantaux"
 *   dimensions={{ largeur: '1400', hauteur: '1200' }}
 *   originalDimensions={{ largeur: 1400, hauteur: 1200 }}
 *   onDimensionChange={(field, value) => handleDimension(field, value)}
 *   habillagesInterieurs={habillagesInt.values}
 *   onHabillageIntChange={habillagesInt.handleChange}
 *   highlightedIntSides={habillagesInt.highlightedSides}
 *   onApplyIntToAll={habillagesInt.applyToAll}
 *   habillagesExterieurs={habillagesExt.values}
 *   onHabillageExtChange={habillagesExt.handleChange}
 *   highlightedExtSides={habillagesExt.highlightedSides}
 *   onApplyExtToAll={habillagesExt.applyToAll}
 *   habillageConfig={getHabillageConfig(materiau, pose)}
 * />
 * ```
 */
export interface MenuiserieSVGEditorProps {
  /** Window type from PDF (e.g., "Fenêtre 2 vantaux") */
  typeMenuiserie: string;

  /** Dimension values (WITHOUT hauteurAllege) */
  dimensions: {
    largeur: string;
    hauteur: string;
  };

  /** Original values for placeholders */
  originalDimensions?: {
    largeur?: number;
    hauteur?: number;
  };

  /** Callback when dimension changes */
  onDimensionChange?: (field: 'largeur' | 'hauteur', value: string) => void;

  /** Interior habillage values (4 sides) */
  habillagesInterieurs?: Record<Side, HabillageValue | null>;

  /** Callback when interior habillage changes */
  onHabillageIntChange?: (side: Side, value: HabillageValue) => void;

  /** Highlighted interior sides (for animation) */
  highlightedIntSides?: Set<Side>;

  /** Callback for "Apply to all" interior (NEW) */
  onApplyIntToAll?: () => void;

  /** Exterior habillage values (4 sides) */
  habillagesExterieurs?: Record<Side, HabillageValue | null>;

  /** Callback when exterior habillage changes */
  onHabillageExtChange?: (side: Side, value: HabillageValue) => void;

  /** Highlighted exterior sides (for animation) */
  highlightedExtSides?: Set<Side>;

  /** Callback for "Apply to all" exterior (NEW) */
  onApplyExtToAll?: () => void;

  /** Habillage options config (depends on material/pose) */
  habillageConfig?: HabillageConfig;

  /** Show habillages (default: true) */
  showHabillages?: boolean;

  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// useHabillagesPropagation Hook Contract (Updated)
// =============================================================================

/**
 * Return type for useHabillagesPropagation hook
 *
 * @example
 * ```tsx
 * const habillagesInt = useHabillagesPropagation(initialValues);
 *
 * // Use in component
 * <MenuiserieSVGEditor
 *   habillagesInterieurs={habillagesInt.values}
 *   onHabillageIntChange={habillagesInt.handleChange}
 *   highlightedIntSides={habillagesInt.highlightedSides}
 *   onApplyIntToAll={habillagesInt.applyToAll}
 * />
 *
 * // Check if apply button should be enabled
 * <ApplyToAllButton disabled={!habillagesInt.hasAnyValue} />
 * ```
 */
export interface UseHabillagesPropagationReturn {
  /** Current values for all 4 sides */
  values: Record<Side, HabillageValue | null>;

  /** Currently highlighted sides (for animation) */
  highlightedSides: Set<Side>;

  /** Handler for value change with auto-propagation */
  handleChange: (side: Side, value: HabillageValue) => void;

  /** Reset all values and propagation state */
  reset: () => void;

  /** Apply first non-null value to all sides (NEW) */
  applyToAll: () => void;

  /** True if at least one value is defined (NEW) */
  hasAnyValue: boolean;
}

// =============================================================================
// Styling Constants Contract
// =============================================================================

/**
 * Pill style configuration for Int/Ext distinction
 */
export interface PillStyleConfig {
  border: string;
  background: string;
  text: string;
  ring: string;
  icon: string;
}

/**
 * Mapping of habillage type to pill styles
 */
export const PILL_STYLES: Record<'interieur' | 'exterieur', PillStyleConfig> = {
  interieur: {
    border: 'border-blue-500',
    background: 'bg-blue-50',
    text: 'text-blue-700',
    ring: 'ring-blue-400',
    icon: '🔵',
  },
  exterieur: {
    border: 'border-orange-500',
    background: 'bg-orange-50',
    text: 'text-orange-700',
    ring: 'ring-orange-400',
    icon: '🟠',
  },
};
